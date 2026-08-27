"""Console entry point: `aeokit-mcp` (stdio) or `aeokit-mcp --http`."""

from __future__ import annotations

import sys


def main() -> None:
    from . import mcp_server

    if "--http" in sys.argv:
        mcp_server.server.run(transport="streamable-http")
    else:
        mcp_server.server.run()
