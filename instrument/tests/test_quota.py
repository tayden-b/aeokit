"""Quota is what stands between a stranger and the operator's credit card."""

import importlib

import pytest


@pytest.fixture
def quota(tmp_path, monkeypatch):
    monkeypatch.setenv("AEOKIT_QUOTA_DB", str(tmp_path / "quota.db"))
    monkeypatch.setenv("AEOKIT_DAILY_USD_CAP", "1.00")
    monkeypatch.setenv("AEOKIT_FREE_PROBES_PER_CLIENT", "2")
    from aeokit_mcp import quota as q

    return importlib.reload(q)


def test_client_id_never_stores_raw_identity(quota):
    cid = quota.client_id("203.0.113.7")
    assert "203.0.113.7" not in cid
    assert cid == quota.client_id("203.0.113.7")  # stable
    assert cid != quota.client_id("203.0.113.8")


def test_per_client_limit_refuses_after_free_probes(quota):
    c = quota.client_id("a")
    ok1, _, rid1 = quota.reserve(c, 0.10)
    ok2, _, rid2 = quota.reserve(c, 0.10)
    ok3, msg, rid3 = quota.reserve(c, 0.10)
    assert (ok1, ok2, ok3) == (True, True, False)
    assert rid3 is None
    assert "2 free probes" in msg


def test_refusal_message_pluralizes_correctly(quota, monkeypatch):
    monkeypatch.setenv("AEOKIT_FREE_PROBES_PER_CLIENT", "1")
    q = importlib.reload(quota)
    c = q.client_id("b")
    q.reserve(c, 0.10)
    _, msg, _ = q.reserve(c, 0.10)
    assert "1 free probe for today" in msg


def test_other_clients_are_unaffected_by_one_clients_limit(quota):
    a, b = quota.client_id("a"), quota.client_id("b")
    quota.reserve(a, 0.10)
    quota.reserve(a, 0.10)
    ok, _, _ = quota.reserve(b, 0.10)
    assert ok is True


def test_global_cap_refuses_everyone(quota):
    # cap is $1.00; each reservation is 0.60 * 1.35 safety = 0.81
    ok1, _, _ = quota.reserve(quota.client_id("x"), 0.60)
    ok2, msg, _ = quota.reserve(quota.client_id("y"), 0.60)
    assert ok1 is True and ok2 is False
    assert "shared daily" in msg


def test_settle_replaces_reservation_with_actual_cost(quota):
    c = quota.client_id("s")
    _, _, rid = quota.reserve(c, 0.60)
    assert quota.spent_today() == pytest.approx(0.81, abs=1e-3)
    quota.settle(rid, 0.05)
    assert quota.spent_today() == pytest.approx(0.05, abs=1e-3)


def test_release_refunds_the_free_probe(quota):
    """A failed probe must not consume the caller's free probe — the failure
    message promises exactly that, so the code has to make it true."""
    c = quota.client_id("r")
    _, _, rid = quota.reserve(c, 0.10)
    assert quota.probes_used_by(c) == 1
    quota.release(rid)
    assert quota.probes_used_by(c) == 0
    assert quota.spent_today() == 0


def test_status_reports_remaining(quota):
    c = quota.client_id("z")
    assert quota.status(c)["free_probes_remaining_today"] == 2
    quota.reserve(c, 0.10)
    assert quota.status(c)["free_probes_remaining_today"] == 1
