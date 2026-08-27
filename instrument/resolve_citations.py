"""One-time/maintenance: resolve redirect-wrapped citation URLs in place."""

from __future__ import annotations

import db
from engines import _resolve_redirect


def main() -> None:
    conn = db.connect()
    rows = conn.execute("SELECT id, url FROM citations WHERE url LIKE '%grounding-api-redirect%'").fetchall()
    print(f"resolving {len(rows)} wrapped citations…")
    done = 0
    for r in rows:
        real = _resolve_redirect(r["url"])
        if real != r["url"]:
            conn.execute("UPDATE citations SET url = ? WHERE id = ?", (real, r["id"]))
            done += 1
        if done and done % 25 == 0:
            conn.commit()
            print(f"  {done} resolved")
    conn.commit()
    conn.close()
    print(f"done: {done}/{len(rows)} resolved")


if __name__ == "__main__":
    main()
