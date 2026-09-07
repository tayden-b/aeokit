"""Retry only what can succeed later. A retried 404 once cost a probe minutes."""

import time

import pytest

from aeokit_mcp.llm_util import PermanentAPIError, call_with_retries


def test_permanent_errors_fail_immediately():
    calls = []

    def bad_model():
        calls.append(1)
        raise RuntimeError("Error code: 404 - model `gone` does not exist")

    t0 = time.monotonic()
    with pytest.raises(PermanentAPIError):
        call_with_retries(bad_model)
    assert len(calls) == 1
    assert time.monotonic() - t0 < 0.5


def test_transient_errors_are_retried_then_raised():
    calls = []

    def flaky():
        calls.append(1)
        raise RuntimeError("503 service unavailable")

    with pytest.raises(RuntimeError):
        call_with_retries(flaky, tries=3, base=0.01)
    assert len(calls) == 3


def test_success_after_transient_failure_returns_value():
    state = {"n": 0}

    def eventually():
        state["n"] += 1
        if state["n"] < 2:
            raise RuntimeError("temporarily overloaded")
        return "ok"

    assert call_with_retries(eventually, tries=3, base=0.01) == "ok"
