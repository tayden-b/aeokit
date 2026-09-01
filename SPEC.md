# aeokit Measurement Specification

**Version 0.1-draft · 2026-08-26 · status: DRAFT — numbers published under a draft spec are provisional**

aeokit measures which products AI answer engines route users to, per capability. This document is the complete method. Anyone should be able to reproduce our numbers from this spec and the published code; anywhere they can't is a bug in the spec.

## 1. Unit of analysis: the capability

The measured unit is a **capability** (a job-to-be-done: "rotate database credentials automatically"), not a brand. A product **owns** a capability on an engine to the degree the engine routes users to it when asked. Routing share is reported as a distribution, never a single winner.

## 2. Sampling protocol

- **Engines:** OpenAI (ChatGPT API), Anthropic (Claude API), Google (Gemini API), Perplexity — each queried with **search grounding enabled** where the platform provides it. Grounding mode per engine is recorded per sample. *(§2.1: exact model IDs + grounding config, frozen per spec version — TODO)*
- **Samples:** n per capability × engine × prompt-variant per collection date. Minimum n and its statistical basis: §5.
- **Scope of claims:** this corpus measures **search-grounded API surfaces**. It is *not* the consumer chat interface. The measured divergence between the two is a first-class result (§7, "the surface gap"), not a footnote.

## 3. Prompt sets

Prompt variants are derived from public demand evidence (forum questions, People-Also-Ask, autocomplete), not invented. Derivation procedure + full prompt sets: Appendix A *(TODO)*. Prompt sets are versioned; a changed prompt set is a new minor spec version — trend lines never silently span prompt-set changes.

## 4. Extraction (LLM-as-judge) — and its validation

Answers are parsed to structured routing records by an LLM judge. The judge is itself a measurement instrument and is validated, not trusted: **a ~100-answer human-labeled golden set** with judge–human agreement (Cohen's κ) published per spec version; judge model + prompt frozen per spec version. *(Golden set + κ: TODO before v0.1 final)*

## 5. Statistics

- Routing share = share of samples routing to a product, per engine, with a Wilson 95% interval.
- Sample-size policy accounts for between-prompt and within-prompt variance (prior art: Discovered Labs' LLM eval sample-size calculator — cited, built upon).
- **Disagreement score:** cross-engine divergence per capability *(definition TODO — candidate: Jensen-Shannon over engine routing distributions)*.
- **Drift:** no trend is claimed without a significance test across ≥3 collection dates.

## 6. What this instrument cannot do (LIMITATIONS)

- It does not measure the consumer chat surfaces at scale (see §7 for the calibration bridge).
- It has no access to real user query volumes; prompt sets are demand-derived, not demand-measured.
- Sentiment/positioning extraction is secondary signal with judge validation pending.
- A capability absent from the corpus is unmeasured, not unimportant.

## 7. The surface gap (calibration)

A small hand-collected consumer-surface sample (~5 capabilities × 3 engines × 10 runs, collected manually) is compared against the API corpus on identical prompts, quantifying the API↔surface divergence per engine. Published as a standing calibration table; protocol in Appendix B *(TODO)*.

## 8. Reproduction

A `make reproduce` target that regenerates every published number from raw sampled data is planned; until it exists, numbers from this corpus are provisional. Raw data ships with the corpus. Gaps in the time series are marked, never backfilled.

## Prior art

Discovered Labs sample-size calculator · metehan.ai's API-vs-UI collection taxonomy · open-source AEO audit CLIs (aeo-platform, geo-optimizer-skill, getcito) · Profound/Peec/AthenaHQ (commercial, methodology unpublished). This spec exists because none of the above publishes a versioned, reproducible measurement standard with a public corpus.

## Changelog

- **0.1-draft (2026-08-26)** — initial skeleton: unit of analysis, grounded-API sampling scope, judge validation requirement, surface-gap calibration as first-class, statistics policy. Open TODOs marked inline; v0.1 final requires §2.1 model freeze, Appendix A prompt derivation, golden set + κ, disagreement-score definition, Appendix B protocol.
