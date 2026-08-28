"""
Live probe — measure any product's standing in AI answers, right now.

DESIGN PRINCIPLE, learned the hard way: at the sample sizes a live probe can
afford, rate estimates carry ±30-50pp intervals. So the probe leads with what is
deterministic and actionable — the pages engines cite and whether you are named
on them — and reports rates as raw counts with denominators, never as scores.

Specifically NOT done here, because the market is full of it and buyers say so:
  - no composite score, letter grade, or "AEO score"
  - no normalized index without its denominator
  - no cross-engine "they disagree" claim unless the difference interval excludes
    zero (at n=10, two IDENTICAL engines differ on the top pick ~50% of the time)
  - no sentiment reporting: the judge has emitted 0 negatives in 978 extractions,
    so the field is a constant and would be decoration
  - no generic advice. Every action names a URL, an engine, or a page.
"""

from __future__ import annotations

import datetime as dt
import json
import uuid
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed

from . import budget
from . import db
from . import derive
from . import keys
from . import pagecheck
from .engines import ask
from .extract import JUDGE_MODEL, JUDGE_VERSION, extract
from .metrics import normalize
from .stats import confidence_note, difference_is_real, diff_interval, min_n_for_width, wilson_interval

PROBE_VERSION = "probe-0.1"


def run_probe(product: str, description: str, samples_per_question: int = 3,
              engine_list: list[str] | None = None, max_questions: int = 6,
              check_sources: bool = True) -> dict:
    """Run a live probe. Returns a GTM-facing report; persists runs as class 'probe'."""
    available = keys.available()
    engines_used = [e for e in (engine_list or available) if e in available]
    if not engines_used:
        return {"ok": False, "error": "No API key available for any engine.",
                "how_to_fix": keys.BYOK_INSTRUCTIONS}

    # 1. Derive the buyer questions (never naming the product — see derive.py)
    derived = derive.derive_questions(product, description, n=max_questions + 2)
    questions = derived.questions[:max_questions]
    if not questions:
        return {"ok": False, "error": "Could not derive buyer questions for this product."}

    # 2. Budget: estimate, then gate house-key spend
    planned_calls = len(questions) * len(engines_used) * samples_per_question
    if planned_calls > budget.PER_PROBE_CALL_CAP:
        samples_per_question = max(1, budget.PER_PROBE_CALL_CAP // (len(questions) * len(engines_used)))
        planned_calls = len(questions) * len(engines_used) * samples_per_question
    planned_usd = sum(budget.estimate(e, planned_calls // len(engines_used),
                                      planned_calls // len(engines_used)) for e in engines_used)
    key_sources = {e: keys.resolve(e).source for e in engines_used}
    if "house" in key_sources.values():
        ok, msg = budget.check_house_budget(planned_usd)
        if not ok:
            return {"ok": False, "error": msg, "how_to_fix": keys.BYOK_INSTRUCTIONS,
                    "budget": budget.summary()}

    # 3. Sample
    session_id = uuid.uuid4().hex[:12]
    now = dt.datetime.now(dt.timezone.utc)
    conn = db.connect()
    db.init_db(conn)

    per_engine: dict[str, list] = defaultdict(list)   # engine -> [set(products) per answer]
    per_engine_sole: dict[str, int] = defaultdict(int)
    citations: list[str] = []
    attributes: Counter = Counter()
    calls_made = 0
    grounding_modes: Counter = Counter()

    target = normalize(product)

    def _one_sample(engine: str, q):
        """Ask one engine one question once, and judge the answer. Network-bound,
        so these run concurrently — serially this took minutes, which is the
        difference between a demo someone waits for and one they abandon."""
        try:
            answer = ask(engine, q.question)
        except Exception:
            return None
        try:
            ext = extract(answer.text)
        except Exception:
            ext = None
        return engine, q, answer, ext

    jobs = [(engine, q) for q in questions for engine in engines_used
            for _ in range(samples_per_question)]
    # cap concurrency so we don't trip provider rate limits (429s would be slower
    # than running fewer at once)
    with ThreadPoolExecutor(max_workers=min(8, len(jobs) or 1)) as pool:
        futures = [pool.submit(_one_sample, e, q) for e, q in jobs]
        for fut in as_completed(futures):
            got = fut.result()
            if not got:
                continue
            engine, q, answer, ext = got
            calls_made += 1
            grounding_modes[answer.grounding_mode] += 1
            run_id = db.insert_run(
                conn, ts=now.isoformat(), run_date=now.strftime("%Y-%m-%d"),
                engine=engine, model=answer.model, grounding_mode=answer.grounding_mode,
                temperature=0.7, category=derived.category, capability=q.question[:80],
                prompt_set=f"derived:{derive.DERIVATION_VERSION}", variant=q.id,
                prompt=q.question, spec_version=PROBE_VERSION, raw_answer=answer.text,
                run_class="probe", session_id=session_id,
            )
            for url in answer.citations:
                db.insert_citation(conn, run_id=run_id, url=url)
                citations.append(url)
            if ext is None:
                continue
            names = [normalize(p.name) for p in ext.products]
            per_engine[engine].append(set(names))
            primaries = [normalize(p.name) for p in ext.products if p.role == "primary"]
            if len(primaries) == 1 and primaries[0] == target:
                per_engine_sole[engine] += 1
            for p in ext.products:
                if normalize(p.name) == target:
                    attributes.update(a.strip().lower() for a in p.attributes if a.strip())
                db.insert_routing(
                    conn, run_id=run_id, product=p.name, role=p.role, position=p.position,
                    sentiment=p.sentiment, attributes=json.dumps(p.attributes),
                    judge_model=JUDGE_MODEL, judge_version=JUDGE_VERSION,
                )
    conn.commit()

    # 4. Aggregate — counts with denominators, never scores
    total_answers = sum(len(v) for v in per_engine.values())
    if total_answers == 0:
        conn.close()
        return {"ok": False, "error": "Every engine call failed; nothing was measured."}

    named_total = sum(1 for answers in per_engine.values() for s in answers if target in s)
    rival_counts: Counter = Counter()
    for answers in per_engine.values():
        for s in answers:
            rival_counts.update(n for n in s if n != target)

    by_engine = []
    for engine, answers in per_engine.items():
        n = len(answers)
        k = sum(1 for s in answers if target in s)
        lo, hi = wilson_interval(k, n)
        top_rivals = Counter(x for s in answers for x in s if x != target).most_common(3)
        by_engine.append({
            "engine": engine,
            "you_named_in": f"{k} of {n} answers",
            "rate_range_95ci": f"{round(lo*100)}%–{round(hi*100)}%",
            "sole_recommendation": f"{per_engine_sole.get(engine, 0)} of {n} answers",
            "named_most_often_instead": [{"product": p, "in": f"{c} of {n}"} for p, c in top_rivals],
            "you_appear": k > 0,
        })

    # cross-engine differences ONLY when the 95% interval excludes zero
    differences = []
    eng_names = list(per_engine)
    for i in range(len(eng_names)):
        for j in range(i + 1, len(eng_names)):
            a, b = eng_names[i], eng_names[j]
            ka = sum(1 for s in per_engine[a] if target in s); na = len(per_engine[a])
            kb = sum(1 for s in per_engine[b] if target in s); nb = len(per_engine[b])
            if difference_is_real(ka, na, kb, nb):
                lo, hi = diff_interval(ka, na, kb, nb)
                differences.append({
                    "between": [a, b],
                    "finding": f"You are named in {ka} of {na} {a} answers but {kb} of {nb} on {b}",
                    "difference_95ci_pp": [lo, hi],
                    "statistically_real": True,
                })

    # 5. The deterministic layer: which cited pages name you
    source_rows, checked = [], []
    if check_sources and citations:
        top_urls = [u for u, _ in Counter(citations).most_common(10)]
        rival_names = [p for p, _ in rival_counts.most_common(6)]
        checked = pagecheck.check_pages(top_urls, [product] + rival_names, limit=8)
        cite_counts = Counter(citations)
        for c in checked:
            if not c.ok:
                continue
            you_there = any(n.lower() == product.lower() for n in c.names_found)
            source_rows.append({
                "domain": c.domain,
                "url": c.url,
                "title": c.title,
                "cited_times": cite_counts.get(c.url, 1),
                "you_are_named_on_this_page": you_there,
                "competitors_named_on_this_page": [n for n in c.names_found
                                                   if n.lower() != product.lower()],
            })

    # 6. Actions — each anchored to a specific engine or URL, never generic
    actions = []
    missing_pages = [s for s in source_rows if not s["you_are_named_on_this_page"]
                     and s["competitors_named_on_this_page"]]
    for s in missing_pages[:3]:
        actions.append({
            "do": f"Get {product} onto {s['domain']}",
            "why": f"Engines cited this page {s['cited_times']}× while answering your buyers' "
                   f"questions, and it names {', '.join(s['competitors_named_on_this_page'][:3])} "
                   f"but not you.",
            "evidence": s["url"],
        })
    for e in by_engine:
        if not e["you_appear"]:
            rivals = ", ".join(r["product"] for r in e["named_most_often_instead"][:2])
            actions.append({
                "do": f"Investigate why {e['engine']} never names you",
                "why": f"Across {e['you_named_in'].split(' of ')[1]}, {e['engine']} did not mention "
                       f"{product} once. It named {rivals} instead.",
                "evidence": f"engine:{e['engine']}",
            })
    if not actions and source_rows:
        actions.append({
            "do": "Hold position and re-measure in 30 days",
            "why": f"You are named on {sum(1 for s in source_rows if s['you_are_named_on_this_page'])} "
                   f"of {len(source_rows)} cited pages — no gap stands out in this run.",
            "evidence": "re-run this probe",
        })

    # 7. Honesty
    n_per_engine = min((len(v) for v in per_engine.values()), default=0)
    caveats = [derive.DERIVATION_CAVEAT]
    note = confidence_note(n_per_engine)
    if note:
        caveats.append(
            f"{note}. A {min_n_for_width(20)}-answer sample per engine would be needed to pin "
            "any rate to ±10 points — this probe is sized to find gaps, not to certify rates.")
    if not differences and len(per_engine) > 1:
        caveats.append("No cross-engine difference here is large enough to be distinguishable "
                       "from chance at this sample size, so none is claimed.")
    caveats.append("Measured on search-grounded engine APIs, not the consumer chat apps; "
                   "answers there can differ.")

    # 8. Persist + settle
    est = round(sum(budget.estimate(e, calls_made // max(1, len(engines_used)),
                                    calls_made // max(1, len(engines_used)))
                    for e in engines_used), 4)
    for engine in engines_used:
        src = key_sources[engine]
        budget.record(src, engine, calls_made // len(engines_used),
                      est / len(engines_used), label=f"probe:{session_id}")
    db.insert_probe_session(conn, {
        "id": session_id, "ts": now.isoformat(), "product": product, "description": description,
        "category": derived.category, "questions": json.dumps([q.question for q in questions]),
        "derivation": "derived", "engines": ",".join(engines_used),
        "samples_each": samples_per_question, "calls": calls_made, "est_usd": est,
        "key_source": "mixed" if len(set(key_sources.values())) > 1 else list(key_sources.values())[0],
    })
    conn.commit()
    conn.close()

    pct = round(named_total / total_answers * 100)
    headline = (f"{product} was named in {named_total} of {total_answers} AI answers ({pct}%) "
                f"to your buyers' questions.")
    if named_total == 0:
        top = rival_counts.most_common(1)
        headline = (f"{product} was not named once across {total_answers} AI answers to your "
                    f"buyers' questions." + (f" {top[0][0]} was named most often." if top else ""))

    return {
        "ok": True,
        "headline": headline,
        "product": product,
        "category": derived.category,
        "questions_asked": [{"intent": q.intent, "question": q.question} for q in questions],
        "answers_analyzed": total_answers,
        "you_were_named_in": f"{named_total} of {total_answers} answers",
        "by_engine": by_engine,
        "named_most_often_overall": [{"product": p, "in": f"{c} of {total_answers} answers"}
                                     for p, c in rival_counts.most_common(6)],
        "cross_engine_differences": differences or "none large enough to claim at this sample size",
        "how_engines_describe_you": [a for a, _ in attributes.most_common(8)] or
                                    "not described — you were not named often enough",
        "cited_sources": source_rows,
        "do_next": actions,
        "confidence_and_limits": caveats,
        "cost": {
            "engine_calls": calls_made,
            "estimated_usd": est,
            "paid_by": key_sources,
            "note": "estimated from published provider rates, not a billed amount",
        },
        "method": {
            "probe_version": PROBE_VERSION,
            "derivation": derive.DERIVATION_VERSION,
            "judge": f"{JUDGE_MODEL} ({JUDGE_VERSION}, agreement not yet validated)",
            "samples_per_question_per_engine": samples_per_question,
            "grounding_modes": dict(grounding_modes),
            "session_id": session_id,
        },
    }
