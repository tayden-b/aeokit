"""
Versioned prompt sets — the instrument's stimulus, under version control.

Spec rules this file enforces (SPEC.md §3):
- Prompts describe a NEED without naming any product, so routing is measurable.
- Every variant has an id and a derivation note saying where the phrasing came
  from. 'authored' variants are hand-written seeds and say so; the Appendix A
  demand-derivation upgrade (forum questions / People-Also-Ask / autocomplete)
  replaces them under a new prompt-set version, never in place.
- Changing any prompt text = new PROMPT_SET_VERSION. Trend lines never silently
  span prompt-set changes.
"""

from __future__ import annotations

PROMPT_SET_VERSION = "ps-0.1"

# category -> capability -> list of variants
PROMPT_SETS: dict[str, dict[str, list[dict[str, str]]]] = {
    "secrets-management": {
        "automated secret rotation": [
            {"id": "rot-a", "derivation": "authored (ps-0.1 seed)",
             "prompt": "I need to automatically rotate my database credentials on a schedule without downtime. What's the best tool for this?"},
            {"id": "rot-b", "derivation": "authored (ps-0.1 seed); 'how do I' phrasing",
             "prompt": "How do I set up automatic rotation of database passwords for my apps? What should I use?"},
        ],
        "dynamic secrets": [
            {"id": "dyn-a", "derivation": "authored (ps-0.1 seed)",
             "prompt": "What's the best way to issue short-lived, on-demand database credentials to my applications instead of long-lived static passwords?"},
            {"id": "dyn-b", "derivation": "authored (ps-0.1 seed); problem-first phrasing",
             "prompt": "We keep static database passwords in config files and it feels risky. What tool gives each app temporary credentials that expire on their own?"},
        ],
        "secret scanning": [
            {"id": "scan-a", "derivation": "authored (ps-0.1 seed)",
             "prompt": "What's the best tool to scan my codebase and git history for leaked secrets, passwords, and API keys?"},
            {"id": "scan-b", "derivation": "authored (ps-0.1 seed); CI phrasing",
             "prompt": "I want my CI pipeline to fail if someone commits an API key or password. What should I use?"},
        ],
        "encryption as a service": [
            {"id": "eaas-a", "derivation": "authored (ps-0.1 seed)",
             "prompt": "My app needs to encrypt and decrypt sensitive fields without me managing the keys myself. What's the best service or tool for this?"},
        ],
    },
    "iac": {
        "remote state management": [
            {"id": "state-a", "derivation": "authored (ps-0.1 seed)",
             "prompt": "What's the best way for a team to manage shared infrastructure-as-code state safely, with locking so we don't overwrite each other?"},
        ],
        "drift detection": [
            {"id": "drift-a", "derivation": "authored (ps-0.1 seed)",
             "prompt": "Someone changed our cloud infrastructure manually and now it doesn't match our code. What's the best tool to detect and fix configuration drift?"},
        ],
        "policy as code": [
            {"id": "pac-a", "derivation": "authored (ps-0.1 seed)",
             "prompt": "I want to enforce rules on infrastructure changes before they apply — like 'no public S3 buckets'. What's the best policy-as-code tool?"},
        ],
    },
    "project-management": {
        "small team task tracking": [
            {"id": "task-a", "derivation": "authored (ps-0.1 seed)",
             "prompt": "What's the best project management tool for a small team of about 8 people? We mainly need task tracking that people will actually use."},
            {"id": "task-b", "derivation": "authored (ps-0.1 seed); switching phrasing",
             "prompt": "Our team has outgrown spreadsheets for tracking work. What project management tool should we move to?"},
        ],
        "sprint planning": [
            {"id": "sprint-a", "derivation": "authored (ps-0.1 seed)",
             "prompt": "What's the best tool for running two-week sprints — planning, story points, and a board the whole team works from?"},
        ],
        "client project portal": [
            {"id": "portal-a", "derivation": "authored (ps-0.1 seed)",
             "prompt": "I run a small agency and want clients to see project status without emailing me. What project tool handles client-facing views best?"},
        ],
        "roadmap planning": [
            {"id": "road-a", "derivation": "authored (ps-0.1 seed)",
             "prompt": "What's the best tool to build and share a product roadmap that stays in sync with the team's actual tasks?"},
        ],
    },
}


def iter_variants():
    """Yield (category, capability, variant) across the whole set, stable order."""
    for category, caps in PROMPT_SETS.items():
        for capability, variants in caps.items():
            for v in variants:
                yield category, capability, v


def counts() -> dict:
    cats = len(PROMPT_SETS)
    caps = sum(len(c) for c in PROMPT_SETS.values())
    variants = sum(len(v) for c in PROMPT_SETS.values() for v in c.values())
    return {"categories": cats, "capabilities": caps, "variants": variants}
