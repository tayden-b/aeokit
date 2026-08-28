"""Run one probe in an isolated subprocess and write the result as JSON.

Exists because an in-process probe (threads doing TLS on a tiny shared-CPU VM)
once wedged the entire web server — event loop and all — with no recoverable
trace. A subprocess can hang or die without taking the server with it, gets a
hard kill from the parent, and leaves its stderr in the logs.

Usage: python -m aeokit_mcp.probe_cli <out.json> <product> <description> <samples> <engines_csv>
"""

from __future__ import annotations

import json
import sys


def main() -> None:
    out_path, product, description, samples, engines_csv = sys.argv[1:6]
    from . import probe

    try:
        result = probe.run_probe(
            product=product, description=description,
            samples_per_question=int(samples),
            engine_list=engines_csv.split(","),
            max_questions=4, check_sources=True,
        )
    except Exception as e:  # noqa: BLE001 — the parent needs a result either way
        result = {"ok": False, "error": f"{type(e).__name__}: {e}"}
    with open(out_path, "w") as f:
        json.dump(result, f)


if __name__ == "__main__":
    main()
