"""The statistics are the product's honesty guarantee, so they get the most tests."""

from aeokit_mcp.stats import (
    confidence_note,
    diff_interval,
    difference_is_real,
    min_n_for_width,
    wilson_interval,
)


def test_wilson_interval_is_bounded_and_contains_point_estimate():
    for k, n in [(0, 10), (5, 10), (10, 10), (3, 16), (40, 93)]:
        lo, hi = wilson_interval(k, n)
        assert 0.0 <= lo <= k / n <= hi <= 1.0


def test_wilson_interval_narrows_with_more_samples():
    _, hi_small = wilson_interval(5, 10)
    lo_small, _ = wilson_interval(5, 10)
    lo_big, hi_big = wilson_interval(50, 100)
    assert (hi_big - lo_big) < (hi_small - lo_small)


def test_wilson_interval_with_zero_samples_is_uninformative():
    assert wilson_interval(0, 0) == (0.0, 1.0)


def test_wilson_never_reports_a_zero_width_at_the_extremes():
    # 0/10 must not claim exactly 0% — that's the classic overclaim
    lo, hi = wilson_interval(0, 10)
    assert lo == 0.0 and hi > 0.2


def test_difference_is_real_rejects_the_noise_case():
    # 6/10 vs 2/10 looks dramatic but the 95% difference interval spans zero
    assert difference_is_real(6, 10, 2, 10) is False


def test_difference_is_real_accepts_a_genuinely_large_effect():
    # the corpus finding this product was built on: 10/10 vs 2/10
    assert difference_is_real(10, 10, 2, 10) is True


def test_diff_interval_is_antisymmetric():
    lo, hi = diff_interval(8, 10, 3, 10)
    lo2, hi2 = diff_interval(3, 10, 8, 10)
    assert lo == -hi2 and hi == -lo2


def test_diff_interval_with_empty_arm_is_uninformative():
    assert diff_interval(0, 0, 5, 10) == (-100.0, 100.0)


def test_min_n_for_width_is_monotone_in_precision():
    assert min_n_for_width(30) < min_n_for_width(20) < min_n_for_width(10)


def test_confidence_note_scales_with_n():
    assert "directional" in confidence_note(6)
    assert "early" in confidence_note(20)
    assert confidence_note(40) is None
