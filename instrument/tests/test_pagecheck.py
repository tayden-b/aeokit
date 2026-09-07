"""Cited URLs come from model output — untrusted — so the fetcher is a security boundary."""

import pytest

from aeokit_mcp.pagecheck import UnsafeURL, _assert_safe, names_in_html


@pytest.mark.parametrize("url", [
    "http://169.254.169.254/latest/meta-data/",   # cloud metadata
    "http://127.0.0.1/",
    "http://localhost:8080/admin",
    "http://192.168.1.1/",
    "http://10.0.0.5/",
    "file:///etc/passwd",
    "ftp://example.com/x",
])
def test_non_public_or_non_http_targets_are_refused(url):
    with pytest.raises(UnsafeURL):
        _assert_safe(url)


def test_names_are_found_in_visible_text_only():
    html = """<html><head><title>  Best   tools  2026 </title>
    <script>var competitors = ["Ghostly"];</script>
    <style>.x{content:"Phantom"}</style></head>
    <body><h1>Top picks</h1><p>We like Asana and trello a lot.</p></body></html>"""
    title, found = names_in_html(html, ["Asana", "Trello", "Ghostly", "Phantom", "Linear"])
    assert title == "Best tools 2026"
    assert found == ["Asana", "Trello"]           # case-insensitive, script/style excluded


def test_blank_names_are_ignored():
    _, found = names_in_html("<p>Asana</p>", ["", "  ", "Asana"])
    assert found == ["Asana"]
