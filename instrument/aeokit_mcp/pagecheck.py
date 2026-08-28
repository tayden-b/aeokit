"""
Cited-page inspection — the deterministic, defensible layer.

Why this exists: at the sample sizes a live probe can afford, rate estimates
carry ±30-50pp intervals and can support very few claims. But "these are the
pages the engine cited, and your product is not named on four of them" needs no
statistics at all — it is a fetch and a substring match. Research on this market
is blunt about it: ~57% of citations go to reviews, listicles and forums, and
presence on those pages correlates with being recommended. So this is both the
cheapest and the most actionable thing a probe produces.

SECURITY: URLs here come from ENGINE OUTPUT — untrusted model text. A naive
fetcher is an SSRF hole straight into cloud metadata (169.254.169.254) whose
body would then be summarized into the model's context. Every request is
therefore scheme-checked, DNS-resolved, and IP-range-checked BEFORE connecting,
and redirects are re-validated the same way rather than followed blindly.
"""

from __future__ import annotations

import ipaddress
import re
import socket
import ssl
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field

import certifi

MAX_BYTES = 400_000
TIMEOUT = 6.0
MAX_REDIRECTS = 3
USER_AGENT = "aeokit-probe/0.1 (+https://aeokit.ai/bot)"


class UnsafeURL(Exception):
    pass


def _assert_safe(url: str) -> str:
    """Reject anything that isn't a public-internet https/http URL. Raises UnsafeURL."""
    parts = urllib.parse.urlparse(url)
    if parts.scheme not in ("http", "https"):
        raise UnsafeURL(f"scheme not allowed: {parts.scheme or 'none'}")
    host = parts.hostname
    if not host:
        raise UnsafeURL("no host")
    try:
        infos = socket.getaddrinfo(host, None)
    except OSError as e:
        raise UnsafeURL(f"dns failed: {e}") from e
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if (ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved
                or ip.is_multicast or ip.is_unspecified):
            raise UnsafeURL(f"resolves to non-public address {ip}")
    return url


class _ValidatingRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Re-run the safety check on every redirect target — the common SSRF bypass
    is a public hostname that 302s to 169.254.169.254."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        _assert_safe(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


@dataclass
class PageCheck:
    url: str
    domain: str
    ok: bool
    names_found: list[str] = field(default_factory=list)
    title: str = ""
    error: str = ""


def _fetch(url: str) -> str:
    _assert_safe(url)
    ctx = ssl.create_default_context(cafile=certifi.where())
    opener = urllib.request.build_opener(
        urllib.request.HTTPSHandler(context=ctx), _ValidatingRedirectHandler())
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with opener.open(req, timeout=TIMEOUT) as resp:
        ctype = resp.headers.get("Content-Type", "")
        if "html" not in ctype and "text" not in ctype:
            raise UnsafeURL(f"not a text document ({ctype or 'unknown'})")
        raw = resp.read(MAX_BYTES)
    return raw.decode("utf-8", errors="replace")


_TAG = re.compile(r"<(script|style)[^>]*>.*?</\1>", re.S | re.I)
_TITLE = re.compile(r"<title[^>]*>(.*?)</title>", re.S | re.I)


def check_page(url: str, names: list[str]) -> PageCheck:
    """Fetch one cited page and report which of `names` appear in its text."""
    domain = urllib.parse.urlparse(url).netloc.replace("www.", "")
    try:
        html = _fetch(url)
    except UnsafeURL as e:
        return PageCheck(url, domain, False, error=f"skipped: {e}")
    except (urllib.error.URLError, urllib.error.HTTPError, OSError, ValueError) as e:
        return PageCheck(url, domain, False, error=f"fetch failed: {type(e).__name__}")
    title_m = _TITLE.search(html)
    title = re.sub(r"\s+", " ", title_m.group(1)).strip()[:120] if title_m else ""
    text = _TAG.sub(" ", html)
    text = re.sub(r"<[^>]+>", " ", text).lower()
    found = [n for n in names if n.strip() and n.strip().lower() in text]
    return PageCheck(url, domain, True, names_found=found, title=title)


def check_pages(urls: list[str], names: list[str], limit: int = 8,
                overall_timeout: float = 15.0) -> list[PageCheck]:
    """Check the most-cited pages concurrently, under a hard wall-clock deadline.

    getaddrinfo has no timeout, and a hanging DNS lookup once held a probe open for
    minutes. Pages that don't finish inside the deadline are reported as skipped —
    a partial source map delivered beats a complete one that never arrives."""
    from concurrent.futures import FIRST_COMPLETED, ThreadPoolExecutor, wait

    seen, targets = set(), []
    for url in urls:
        if url in seen:
            continue
        seen.add(url)
        targets.append(url)
        if len(targets) >= limit:
            break
    if not targets:
        return []
    import time as _t

    deadline = _t.monotonic() + overall_timeout
    pool = ThreadPoolExecutor(max_workers=min(6, len(targets)))
    futures = {pool.submit(check_page, u, names): u for u in targets}
    out: list[PageCheck] = []
    pending = set(futures)
    while pending and _t.monotonic() < deadline:
        done, pending = wait(pending, timeout=max(0.1, deadline - _t.monotonic()),
                             return_when=FIRST_COMPLETED)
        for f in done:
            out.append(f.result())
    for f in pending:
        u = futures[f]
        from urllib.parse import urlparse
        out.append(PageCheck(u, urlparse(u).netloc.replace("www.", ""), False,
                             error="skipped: did not finish within the time budget"))
    pool.shutdown(wait=False, cancel_futures=True)
    return out
