"""
Question derivation — turning a product into the questions its buyers ask.

The cold-start solve: a user says "Flowlane, project management for small teams"
and we need the questions their buyers would actually put to an AI.

THE CRITICAL RULE: a derived question must NEVER name the product being measured.
Asking "is Flowlane good for small teams?" measures whether the model knows
Flowlane. Asking "what's the best project management tool for a small team?"
measures whether it *recommends* Flowlane unprompted — which is the only thing a
buyer's real question looks like, and the only thing worth measuring.

Honesty about what this is: derived questions are a plausible model of demand,
not measured demand. Tools with consumer panel data (e.g. Profound's Prompt
Volumes) know what people actually ask; we infer it. Every probe result says so.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from . import keys
from .llm_util import call_with_retries

DERIVE_MODEL = "gpt-4o-mini"
GEMINI_DERIVE_MODEL = "gemini-2.5-flash-lite"
DERIVATION_VERSION = "derive-0.1"

INTENTS = {
    "problem": "Buyer describes a pain and asks how to solve it, naming no product category term.",
    "category": "Buyer asks for the best tool in the category, the classic 'best X for Y'.",
    "comparison": "Buyer weighs the field — 'what should I use instead of spreadsheets', 'top options for Z'.",
    "constraint": "Buyer adds a qualifier that matters: team size, budget, industry, compliance, integration.",
}


class DerivedQuestion(BaseModel):
    id: str = Field(description="short kebab-case id, e.g. 'cat-small-team'")
    intent: Literal["problem", "category", "comparison", "constraint"]
    question: str = Field(
        description="The question a buyer would type to an AI assistant. Natural, first-person, "
        "and it MUST NOT name the product being measured or any specific vendor."
    )
    rationale: str = Field(description="One line: why a real buyer would ask this.")


class DerivedSet(BaseModel):
    category: str = Field(description="Short category label, kebab-case, e.g. 'project-management'.")
    competitors_expected: list[str] = Field(
        description="Products you'd expect an AI to name for this category. Used only for reporting "
        "context, never inserted into questions."
    )
    questions: list[DerivedQuestion]


PROMPT = """You are designing a measurement instrument, not marketing copy.

A product owner wants to know whether AI assistants recommend their product when \
buyers ask for tools. Your job: write the questions their buyers would actually ask.

PRODUCT: {product}
WHAT IT IS: {description}

Write {n} questions spanning these intents (roughly balanced):
{intents}

HARD RULES:
- NEVER name "{product}" or any specific vendor in a question. We measure unprompted \
recommendation; naming the product destroys the measurement.
- Write how a real person types to an AI assistant — first person, specific situation, \
not keyword-stuffed search queries.
- Vary the phrasing genuinely. Two questions that differ only in word order measure nothing new.
- Each question must be answerable with a product recommendation. Skip anything conceptual.
- Also return a short kebab-case category label and the competitors you'd expect to appear."""


def _derive_openai(prompt: str) -> DerivedSet:
    from openai import OpenAI

    client = OpenAI(api_key=keys.resolve("openai").key)
    completion = call_with_retries(lambda: client.chat.completions.parse(
        model=DERIVE_MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format=DerivedSet,
    ))
    return completion.choices[0].message.parsed


def _derive_gemini(prompt: str) -> DerivedSet:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=keys.resolve("gemini").key)
    resp = call_with_retries(lambda: client.models.generate_content(
        model=GEMINI_DERIVE_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=DerivedSet,
        ),
    ))
    return resp.parsed


def derive_questions(product: str, description: str, n: int = 8) -> DerivedSet:
    """Derive a buyer-question set for an arbitrary product. One cheap LLM call,
    on whichever key the user has — never a hard dependency on one provider."""
    intents_text = "\n".join(f"- {k}: {v}" for k, v in INTENTS.items())
    prompt = PROMPT.format(product=product, description=description, n=n, intents=intents_text)

    if keys.resolve("openai"):
        result = _derive_openai(prompt)
    elif keys.resolve("gemini"):
        result = _derive_gemini(prompt)
    else:
        raise RuntimeError(
            "Question derivation needs an OpenAI or Gemini key. Add one to your MCP "
            "server config as AEOKIT_USER_OPENAI_API_KEY or AEOKIT_USER_GEMINI_API_KEY."
        )
    # enforce the hard rule mechanically — the model is not trusted to obey it
    needle = product.strip().lower()
    result.questions = [q for q in result.questions if needle not in q.question.lower()]
    return result


DERIVATION_CAVEAT = (
    "These questions are inferred from your product description, not measured from real "
    "buyer traffic. They model how buyers plausibly ask — tools with consumer panel data "
    "know what people actually ask. Treat the question set as a hypothesis you can edit."
)
