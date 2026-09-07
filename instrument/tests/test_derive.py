"""The one rule that makes the measurement valid: questions never name the product."""

from aeokit_mcp.derive import DerivedQuestion, strip_self_references


def q(text: str) -> DerivedQuestion:
    return DerivedQuestion(id="x", intent="category", question=text, rationale="")


def test_questions_naming_the_product_are_dropped():
    kept = strip_self_references(
        [q("What's the best invoicing tool for freelancers?"),
         q("Is Acme good for invoicing?"),
         q("How does acme compare to alternatives?")],
        product="Acme",
    )
    assert [x.question for x in kept] == ["What's the best invoicing tool for freelancers?"]


def test_match_is_case_insensitive_and_whitespace_tolerant():
    kept = strip_self_references([q("should I use ACME?")], product="  acme ")
    assert kept == []


def test_empty_product_name_drops_nothing():
    qs = [q("anything at all")]
    assert strip_self_references(qs, product="   ") == qs
