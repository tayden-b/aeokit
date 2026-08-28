"""Retry helper — retry what can succeed later, fail fast on what cannot.

Retrying a permanent error is not merely useless, it is expensive: a wrong model
name (404) once cost a full probe several minutes of exponential backoff on every
single judge call before failing anyway. Rate limits and server errors are worth
waiting out; bad requests, bad auth, and missing models are not.
"""

from __future__ import annotations

import time
from typing import Callable, TypeVar

T = TypeVar("T")

# Transient: worth waiting for.
_RETRYABLE = (
    "429", "rate", "quota", "resource_exhausted", "exhausted", "overload",
    "500", "502", "503", "504", "unavailable", "high demand", "timeout",
    "timed out", "connection", "temporarily",
)
# Permanent: the same request will fail identically in ten seconds.
_PERMANENT = (
    "400", "401", "403", "404", "does not exist", "not found", "decommission",
    "deprecated", "invalid_api_key", "invalid api key", "unsupported",
    "model_not_found", "permission",
)


class PermanentAPIError(RuntimeError):
    """Raised immediately for errors that retrying cannot fix."""


def call_with_retries(fn: Callable[[], T], *, tries: int = 6, base: float = 2.0) -> T:
    last: Exception | None = None
    for i in range(tries):
        try:
            return fn()
        except Exception as e:  # noqa: BLE001 — classified below, then re-raised
            msg = str(e).lower()
            if any(k in msg for k in _PERMANENT) and not any(k in msg for k in _RETRYABLE):
                raise PermanentAPIError(str(e)) from e
            last = e
            if i == tries - 1:
                break
            wait = base * (2**i)
            if any(k in msg for k in ("429", "rate", "quota", "resource_exhausted", "exhausted")):
                wait = max(wait, 12)
            time.sleep(min(wait, 60))
    assert last is not None
    raise last
