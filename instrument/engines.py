"""
Grounded answer collection, one adapter per engine.

Design rules:
- An engine is used only if its API key is present (env-gated, like v1).
- Every answer records HOW it was produced: grounding_mode is 'web_search' /
  'grounded' / 'native' only when the search-augmented call actually succeeded;
  a fallback to the plain model records 'none'. The mode is data, never a guess —
  the spec's scope-of-claims (§2) depends on this field being honest.
- Citations returned by the engine itself are captured when the response carries
  them (grounded OpenAI/Gemini, Perplexity always).
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

import keys
from llm_util import call_with_retries


def _resolve_redirect(url: str, timeout: float = 3.0) -> str:
    """Follow grounding-API redirect wrappers to the real source URL; keep the
    wrapper on any failure (an opaque true source beats a dropped one)."""
    if "grounding-api-redirect" not in url:
        return url
    import urllib.error
    import urllib.request

    class _NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args, **kwargs):
            return None

    try:
        import ssl

        import certifi

        ctx = ssl.create_default_context(cafile=certifi.where())
        opener = urllib.request.build_opener(
            urllib.request.HTTPSHandler(context=ctx), _NoRedirect)
        opener.open(url, timeout=timeout)
        return url
    except urllib.error.HTTPError as e:
        # the 302's Location header IS the real source — no need to fetch it
        return e.headers.get("Location") or url
    except Exception:
        return url

load_dotenv()

TEMPERATURE = 0.7

ENGINES: dict[str, dict[str, str]] = {
    "openai":     {"env": "OPENAI_API_KEY",     "model": os.getenv("AEOKIT_MODEL_OPENAI", "gpt-4o-mini")},
    "anthropic":  {"env": "ANTHROPIC_API_KEY",  "model": os.getenv("AEOKIT_MODEL_ANTHROPIC", "claude-haiku-4-5-20251001")},
    "gemini":     {"env": "GEMINI_API_KEY",     "model": os.getenv("AEOKIT_MODEL_GEMINI", "gemini-2.5-flash-lite")},
    "perplexity": {"env": "PERPLEXITY_API_KEY", "model": os.getenv("AEOKIT_MODEL_PERPLEXITY", "sonar")},
}


@dataclass
class EngineAnswer:
    text: str
    model: str
    grounding_mode: str            # 'web_search' | 'grounded' | 'native' | 'none'
    citations: list[str] = field(default_factory=list)
    key_source: str = "house"      # 'user' | 'house' — whose credits paid for this call


def available_engines() -> list[str]:
    """Single source of truth: an engine is available iff keys.resolve() finds a key."""
    return keys.available()


def ask(engine: str, prompt: str) -> EngineAnswer:
    """Ask one engine. Key comes from keys.resolve() so BYOK actually applies here —
    reading os.environ directly (the old path) silently ignored user keys."""
    cfg = ENGINES[engine]
    ks = keys.resolve(engine)
    if not ks:
        raise RuntimeError(f"No API key for engine '{engine}' (user or house).")
    answer = _ASK[engine](ks.key, cfg["model"], prompt)
    answer.key_source = ks.source
    return answer


def _ask_openai(key: str, model: str, prompt: str) -> EngineAnswer:
    from openai import OpenAI

    client = OpenAI(api_key=key)
    try:
        resp = call_with_retries(lambda: client.responses.create(
            model=model,
            input=prompt,
            tools=[{"type": "web_search"}],
            temperature=TEMPERATURE,
        ), tries=3)
        citations = []
        for item in getattr(resp, "output", []) or []:
            for block in getattr(item, "content", []) or []:
                for ann in getattr(block, "annotations", []) or []:
                    url = getattr(ann, "url", None)
                    if url:
                        citations.append(url)
        return EngineAnswer(resp.output_text, model, "web_search", citations)
    except Exception:
        resp = call_with_retries(lambda: client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=TEMPERATURE,
        ))
        return EngineAnswer(resp.choices[0].message.content, model, "none")


def _ask_anthropic(key: str, model: str, prompt: str) -> EngineAnswer:
    from anthropic import Anthropic

    client = Anthropic(api_key=key)

    def _text_and_citations(resp) -> tuple[str, list[str]]:
        texts, urls = [], []
        for block in resp.content:
            if getattr(block, "type", "") == "text":
                texts.append(block.text)
                for cit in getattr(block, "citations", None) or []:
                    url = getattr(cit, "url", None)
                    if url:
                        urls.append(url)
        return "\n".join(texts), urls

    try:
        resp = call_with_retries(lambda: client.messages.create(
            model=model,
            max_tokens=1500,
            temperature=TEMPERATURE,
            messages=[{"role": "user", "content": prompt}],
            tools=[{"type": "web_search_20250305", "name": "web_search", "max_uses": 3}],
        ), tries=3)
        text, citations = _text_and_citations(resp)
        return EngineAnswer(text, model, "web_search", citations)
    except Exception:
        resp = call_with_retries(lambda: client.messages.create(
            model=model, max_tokens=1500, temperature=TEMPERATURE,
            messages=[{"role": "user", "content": prompt}],
        ))
        text, _ = _text_and_citations(resp)
        return EngineAnswer(text, model, "none")


def _ask_gemini(key: str, model: str, prompt: str) -> EngineAnswer:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=key)
    try:
        resp = call_with_retries(lambda: client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                temperature=TEMPERATURE,
            ),
        ), tries=3)
        citations = []
        try:
            meta = resp.candidates[0].grounding_metadata
            for chunk in getattr(meta, "grounding_chunks", None) or []:
                uri = getattr(getattr(chunk, "web", None), "uri", None)
                if uri:
                    citations.append(_resolve_redirect(uri))
        except (AttributeError, IndexError):
            pass
        return EngineAnswer(resp.text, model, "grounded", citations)
    except Exception:
        resp = call_with_retries(lambda: client.models.generate_content(
            model=model, contents=prompt,
            config=types.GenerateContentConfig(temperature=TEMPERATURE),
        ))
        return EngineAnswer(resp.text, model, "none")


def _ask_perplexity(key: str, model: str, prompt: str) -> EngineAnswer:
    from openai import OpenAI

    client = OpenAI(api_key=key, base_url="https://api.perplexity.ai")
    resp = call_with_retries(lambda: client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=TEMPERATURE,
    ))
    citations = list(getattr(resp, "citations", None) or [])
    if not citations:
        for sr in getattr(resp, "search_results", None) or []:
            url = sr.get("url") if isinstance(sr, dict) else getattr(sr, "url", None)
            if url:
                citations.append(url)
    # Perplexity searches by construction — 'native', and no ungrounded fallback exists.
    return EngineAnswer(resp.choices[0].message.content, model, "native", citations)


_ASK = {
    "openai": _ask_openai,
    "anthropic": _ask_anthropic,
    "gemini": _ask_gemini,
    "perplexity": _ask_perplexity,
}
