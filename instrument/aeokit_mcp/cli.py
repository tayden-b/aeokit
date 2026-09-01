"""Console entry point for `aeokit-mcp`.

Default: the local bring-your-own-key measurement server (see local.py).
`--corpus` serves the research-corpus server instead (mcp_server.py), and
`--http` runs whichever was chosen over streamable HTTP instead of stdio.
"""

from __future__ import annotations

import sys


def main() -> None:
    if "--corpus" in sys.argv:
        from . import mcp_server as chosen
    else:
        from . import local as chosen

    if "--http" in sys.argv:
        chosen.server.run(transport="streamable-http")
    else:
        chosen.server.run()
