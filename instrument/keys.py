"""
Key resolution — whose API credits pay for a probe.

SECURITY RULE (non-negotiable): API keys are NEVER accepted as MCP tool
parameters. Anything passed as a tool argument lands in the conversation
transcript and the model's context, gets logged by clients, and may be
persisted in chat history the user doesn't control. Keys arrive ONLY through
the server process environment — which for a local stdio server means the
user's own MCP client config, and for a hosted server means server-side
storage keyed by an opaque token.

Resolution order per engine:
  1. AEOKIT_USER_<ENGINE>_API_KEY   — the user's own key (BYOK). Their spend.
  2. <ENGINE>_API_KEY           — house key. Trial only, hard budget-capped.

Nothing in this module returns key material to callers that serialize into
tool output: `resolve()` hands the key to the engine layer, while
`describe_source()` is the only thing safe to show a user.
"""

from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()

ENGINE_ENV = {
    "openai": "OPENAI_API_KEY",
    "anthropic": "ANTHROPIC_API_KEY",
    "gemini": "GEMINI_API_KEY",
    "perplexity": "PERPLEXITY_API_KEY",
}


@dataclass
class KeySource:
    engine: str
    key: str
    source: str  # 'user' | 'house'

    @property
    def is_house(self) -> bool:
        return self.source == "house"


def resolve(engine: str) -> KeySource | None:
    """Return the key to use for an engine, or None if we have neither."""
    env = ENGINE_ENV.get(engine)
    if not env:
        return None
    user = os.getenv(f"AEOKIT_USER_{engine.upper()}_API_KEY")
    if user:
        return KeySource(engine, user, "user")
    house = os.getenv(env)
    if house:
        return KeySource(engine, house, "house")
    return None


def available(prefer_user: bool = False) -> list[str]:
    """Engines we can call at all (optionally: only those with a user key)."""
    out = []
    for engine in ENGINE_ENV:
        ks = resolve(engine)
        if ks and (not prefer_user or ks.source == "user"):
            out.append(engine)
    return out


def describe_source() -> dict:
    """Safe-to-display summary of whose credits are in play. Never key material."""
    per_engine = {}
    for engine in ENGINE_ENV:
        ks = resolve(engine)
        per_engine[engine] = ks.source if ks else "none"
    modes = set(v for v in per_engine.values() if v != "none")
    if not modes:
        mode = "none"
    elif modes == {"user"}:
        mode = "user"
    elif modes == {"house"}:
        mode = "house"
    else:
        mode = "mixed"
    return {"mode": mode, "by_engine": per_engine}


BYOK_INSTRUCTIONS = (
    "To run probes on your own API credits, add your keys to this MCP server's "
    "environment in your client config — never paste a key into the chat. Example "
    "(Claude Code): claude mcp add aeokit "
    "--env AEOKIT_USER_OPENAI_API_KEY=sk-... --env AEOKIT_USER_GEMINI_API_KEY=... "
    "-- <python> mcp_server.py. Keys stay in your local config; they are never "
    "sent to aeokit's operator, never stored in the corpus, and never appear "
    "in tool output."
)
