import importlib

import pytest


@pytest.fixture
def budget(tmp_path, monkeypatch):
    monkeypatch.setenv("AEOKIT_SPEND_DB", str(tmp_path / "spend.db"))
    from aeokit_mcp import budget as b

    return importlib.reload(b)


def test_estimate_scales_with_calls(budget):
    assert budget.estimate("openai", 20) == pytest.approx(2 * budget.estimate("openai", 10))


def test_gemini_is_free_inside_its_daily_grounding_quota(budget):
    # nothing recorded today -> the first calls are inside the free allowance
    assert budget.estimate("gemini", 10) == 0.0


def test_gemini_bills_only_the_overflow_past_free_quota(budget):
    budget.record("house", "gemini", budget.GEMINI_FREE_GROUNDED_PER_DAY - 5, 0.0)
    est = budget.estimate("gemini", 10)
    assert est == pytest.approx(5 * budget.COST_PER_CALL["gemini"], rel=1e-6)


def test_unknown_engine_uses_a_conservative_default(budget):
    assert budget.estimate("mystery", 10) == pytest.approx(10 * budget.DEFAULT_COST)


def test_house_budget_gate(budget):
    ok, msg = budget.check_house_budget(budget.DAILY_HOUSE_USD_CAP - 0.01)
    assert ok and msg is None
    ok, msg = budget.check_house_budget(budget.DAILY_HOUSE_USD_CAP + 0.01)
    assert not ok and "used up" in msg


def test_spend_ledger_accumulates_house_spend_only(budget):
    budget.record("house", "openai", 10, 0.20)
    budget.record("user", "openai", 10, 5.00)  # user spend never counts against the house cap
    assert budget.house_spent_today() == pytest.approx(0.20)
