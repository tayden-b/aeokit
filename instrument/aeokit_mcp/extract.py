"""
Structured extraction (LLM-as-judge).

Takes a raw answer (free prose) and turns it into structured, countable data:
which products the answer routed to, their ranking, sentiment, and the attributes
used to describe each. Forced-schema output, so the result is always parseable.

Extraction runs on OpenAI's cheap structured-output model (gpt-4o-mini) by
default — fast and reliable, and a few cents for a full backfill. Falls back to
Gemini if no OpenAI key. (Gemini's free tier rate-limits too hard to handle the
bulk extraction volume.) Same Pydantic schema for both backends.
"""

from __future__ import annotations

import os
from typing import Literal

from dotenv import load_dotenv
from pydantic import BaseModel, Field

from . import keys
from .llm_util import call_with_retries

load_dotenv()

JUDGE_VERSION = "judge-0.1"   # frozen per spec version; golden-set kappa pending (SPEC.md §4)
JUDGE_MODEL = "gpt-4o-mini"
GROQ_JUDGE_MODEL = os.getenv("AEOKIT_GROQ_MODEL", "openai/gpt-oss-20b")

OPENAI_EXTRACT_MODEL = JUDGE_MODEL
GEMINI_EXTRACT_MODEL = "gemini-2.5-flash-lite"  # cheap/fast, free tier, structured output


# --- schema: the model is FORCED to return JSON matching these classes ---

class ProductRouting(BaseModel):
    """One product the answer routed the user to, for this feature."""

    name: str = Field(description="Canonical product/tool name, e.g. 'HashiCorp Vault'.")
    role: Literal["primary", "alternative"] = Field(
        description="'primary' if recommended as the main/best answer; "
        "'alternative' if mentioned as a secondary option."
    )
    position: int = Field(description="1-based order the product appears in the answer.")
    sentiment: Literal["positive", "neutral", "negative"] = Field(
        description="Overall tone toward this product in the answer."
    )
    attributes: list[str] = Field(
        description="Short descriptive words/phrases the answer uses for this product "
        "(e.g. 'dynamic secrets', 'complex', 'AWS-native'). Keep each to 1-3 words."
    )


class Extraction(BaseModel):
    """Structured view of one raw answer to one feature-intent prompt."""

    products: list[ProductRouting]
    citations: list[str] = Field(
        description="Any source URLs cited in the answer. Empty list if none."
    )


EXTRACTION_SYSTEM = (
    "You are a precise information extractor for an AEO (Answer Engine Optimization) "
    "tool. You are given the raw text of an AI assistant's answer to a developer's "
    "feature-intent question (the user described a capability they need, without naming "
    "a product). Extract EVERY product/tool the answer presents as a way to solve the "
    "need. For each: whether it's the primary recommendation or an alternative, its "
    "1-based position in the answer, the sentiment toward it, and the descriptive "
    "attributes used about it (1-3 words each). Capture any cited source URLs. Do NOT "
    "invent products or attributes not present in the text. Use each product's canonical "
    "name (e.g. 'Vault' -> 'HashiCorp Vault'). Only include named products/tools/services "
    "offered as a SOLUTION to the need (e.g. secret managers, IaC tools, scanners). Do "
    "NOT list generic databases, programming languages, or cloud primitives that are "
    "merely mentioned in passing (e.g. PostgreSQL, MySQL, a raw cron job)."
)


def _extract_gemini(answer_text: str) -> Extraction:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=keys.resolve("gemini").key)
    resp = call_with_retries(lambda: client.models.generate_content(
        model=GEMINI_EXTRACT_MODEL,
        contents=f"{EXTRACTION_SYSTEM}\n\nANSWER TO ANALYZE:\n{answer_text}",
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=Extraction,
        ),
    ))
    return resp.parsed


def _extract_openai(answer_text: str) -> Extraction:
    from openai import OpenAI

    client = OpenAI(api_key=_openai_key())
    completion = call_with_retries(lambda: client.chat.completions.parse(
        model=OPENAI_EXTRACT_MODEL,
        messages=[
            {"role": "system", "content": EXTRACTION_SYSTEM},
            {"role": "user", "content": answer_text},
        ],
        response_format=Extraction,
    ))
    return completion.choices[0].message.parsed


def _openai_key() -> str:
    ks = keys.resolve("openai")
    if not ks:
        raise RuntimeError("Judge extraction needs an OpenAI key (user or house).")
    return ks.key


def _extract_groq(answer_text: str, api_key: str) -> Extraction:
    """Judge on Groq's free tier — same forced schema, zero cost."""
    from openai import OpenAI

    client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
    completion = call_with_retries(lambda: client.chat.completions.parse(
        model=GROQ_JUDGE_MODEL,
        messages=[
            {"role": "system", "content": EXTRACTION_SYSTEM},
            {"role": "user", "content": answer_text},
        ],
        response_format=Extraction,
    ))
    return completion.choices[0].message.parsed


def extract(answer_text: str) -> Extraction:
    """Judge an answer. Prefers a free utility provider (Groq) so the paid budget
    goes to measurement; falls back to OpenAI, then Gemini."""
    util = keys.utility_provider()
    if util and util[0] == "groq":
        try:
            return _extract_groq(answer_text, util[1])
        except Exception:
            pass  # fall through to a paid provider rather than failing the probe
    if keys.resolve("openai"):
        return _extract_openai(answer_text)
    if keys.resolve("gemini"):
        return _extract_gemini(answer_text)
    raise RuntimeError("Judge extraction needs an OpenAI or Gemini key.")


if __name__ == "__main__":
    import sys

    result = extract(sys.stdin.read())
    print(result.model_dump_json(indent=2))
