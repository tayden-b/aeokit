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
