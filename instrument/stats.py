"""Statistical helpers — the difference between a count and a claim (SPEC.md §5)."""

from __future__ import annotations

import math


def wilson_interval(successes: int, n: int, z: float = 1.96) -> tuple[float, float]:
    """Wilson score interval for a binomial proportion. Returns (low, high) in [0,1]."""
    if n == 0:
        return (0.0, 1.0)
    p = successes / n
    denom = 1 + z * z / n
    center = (p + z * z / (2 * n)) / denom
    half = (z / denom) * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return (max(0.0, center - half), min(1.0, center + half))


def confidence_note(n: int) -> str | None:
    """Honest caveat scaled to sample size. None when n is respectable."""
    if n < 10:
        return f"directional only — n={n} is too small to lean on; treat as a first look"
    if n < 30:
        return f"early signal — n={n}; intervals are wide"
    return None


def diff_interval(k1: int, n1: int, k2: int, n2: int, z: float = 1.96) -> tuple[float, float]:
    """Newcombe hybrid-score interval for the difference of two proportions.
    Returns (low, high) in percentage points."""
    if n1 == 0 or n2 == 0:
        return (-100.0, 100.0)
    l1, u1 = wilson_interval(k1, n1, z)
    l2, u2 = wilson_interval(k2, n2, z)
    d = k1 / n1 - k2 / n2
    lo = d - math.sqrt((k1 / n1 - l1) ** 2 + (u2 - k2 / n2) ** 2)
    hi = d + math.sqrt((u1 - k1 / n1) ** 2 + (k2 / n2 - l2) ** 2)
    return (round(lo * 100, 1), round(hi * 100, 1))


def difference_is_real(k1: int, n1: int, k2: int, n2: int) -> bool:
    """True only when the 95% difference interval excludes zero. Guards every
    cross-engine claim: at n=10 two IDENTICAL engines disagree on the top pick
    ~50% of the time, so an unguarded 'they disagree' flag reports noise."""
    lo, hi = diff_interval(k1, n1, k2, n2)
    return lo > 0 or hi < 0


def min_n_for_width(target_width_pp: float = 20.0) -> int:
    """Smallest n whose Wilson width is <= target at the worst case (p=0.5)."""
    for n in range(4, 400):
        lo, hi = wilson_interval(n // 2, n)
        if (hi - lo) * 100 <= target_width_pp:
            return n
    return 400
