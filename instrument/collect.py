"""
Collection run — sample every prompt variant across every available engine,
persist raw answers + extractions with full method metadata, then rebuild
today's rollups.

Sampling is the whole point: one answer is noise (routing flips run to run), so
we repeat and report distributions. See SPEC.md §2.

Usage:
    python collect.py --n 5                    # full set, 5 samples per (variant, engine)
    python collect.py --n 2 --category iac     # one category, cheap
    python collect.py --n 1 --max-calls 8      # smoke test, hard budget cap
"""

from __future__ import annotations

import argparse
import datetime as dt
import json

import db
from engines import TEMPERATURE, ask, available_engines
from extract import JUDGE_MODEL, JUDGE_VERSION, extract
from prompts import PROMPT_SET_VERSION, counts, iter_variants
from rollup import build_rollups

SPEC_VERSION = "0.1-draft"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--n", type=int, default=5, help="samples per (variant, engine)")
    parser.add_argument("--category", default=None, help="only this category")
    parser.add_argument("--engines", default=None, help="comma list, e.g. openai,gemini")
    parser.add_argument("--max-calls", type=int, default=None, help="hard cap on engine calls (budget guard)")
    parser.add_argument("--no-rollup", action="store_true")
    args = parser.parse_args()

    engines = available_engines()
    if args.engines:
        engines = [e for e in engines if e in args.engines.split(",")]
    if not engines:
        raise SystemExit("No engine API keys found (see engines.ENGINES).")

    conn = db.connect()
    db.init_db(conn)

    now = dt.datetime.now(dt.timezone.utc)
    run_date = now.strftime("%Y-%m-%d")
    c = counts()
    print(f"spec {SPEC_VERSION} · prompts {PROMPT_SET_VERSION} "
          f"({c['categories']} categories, {c['capabilities']} capabilities, {c['variants']} variants)")
    print(f"engines: {', '.join(engines)} · n={args.n} per (variant, engine)\n")

    calls = 0
    for category, capability, variant in iter_variants():
        if args.category and category != args.category:
            continue
        print(f"[{category}] {capability} · {variant['id']}")
        for engine in engines:
            for i in range(args.n):
                if args.max_calls is not None and calls >= args.max_calls:
                    print(f"\n-- max-calls cap ({args.max_calls}) reached, stopping collection --")
                    conn.commit()
                    _finish(conn, run_date, args.no_rollup)
                    return
                answer = ask(engine, variant["prompt"])
                calls += 1
                run_id = db.insert_run(
                    conn, ts=now.isoformat(), run_date=run_date, engine=engine,
                    model=answer.model, grounding_mode=answer.grounding_mode,
                    temperature=TEMPERATURE, category=category, capability=capability,
                    prompt_set=PROMPT_SET_VERSION, variant=variant["id"],
                    prompt=variant["prompt"], spec_version=SPEC_VERSION,
                    raw_answer=answer.text,
                )
                for url in answer.citations:
                    db.insert_citation(conn, run_id=run_id, url=url)
                extraction = extract(answer.text)
                for p in extraction.products:
                    db.insert_routing(
                        conn, run_id=run_id, product=p.name, role=p.role,
                        position=p.position, sentiment=p.sentiment,
                        attributes=json.dumps(p.attributes),
                        judge_model=JUDGE_MODEL, judge_version=JUDGE_VERSION,
                    )
                print(f"    · {engine} {i + 1}/{args.n} — {answer.grounding_mode}, "
                      f"{len(answer.citations)} citations, {len(extraction.products)} products")
        conn.commit()

    _finish(conn, run_date, args.no_rollup)


def _finish(conn, run_date: str, no_rollup: bool) -> None:
    if not no_rollup:
        n = build_rollups(conn, run_date)
        print(f"\nrollups rebuilt for {run_date}: {n} rows")
    conn.commit()
    conn.close()


if __name__ == "__main__":
    main()
