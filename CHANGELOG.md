# Changelog

All notable changes to aeokit. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions track the `aeokit-mcp` package on PyPI.

## [Unreleased]

## [0.1.2] — 2026-08-29

### Added
- Local bring-your-own-key server (`aeokit_mcp.local`) with `check_keys`, `measure_product`, and `how_it_measures`. This is now what `uvx aeokit-mcp` runs; the research-corpus server moved behind `--corpus`.
- Test suite (statistics, quota accounting, budget estimation, product-name filtering, URL safety, retry classification) and a CI workflow running lint, tests, and package/site builds.
- `CONTRIBUTING.md`, `SECURITY.md`, and this changelog.

### Changed
- Hosted server is two-phase: `measure_product` returns a job id immediately and `get_measurement` polls, so no HTTP response ever waits on a measurement.
- Hosted probes run in an isolated subprocess with a 240s hard kill.
- Question derivation and judging fall back across OpenAI, Gemini, and Groq instead of hard-requiring OpenAI.
- Retry helper fails fast on permanent errors (4xx, deprecated models) instead of backing off.
- Engine SDK clients are cached per process.

### Fixed
- Gemini-only installs crashed at question derivation.
- Failed probes consumed the caller's free probe while claiming they hadn't.
- Cited-page checks could hang indefinitely on slow DNS; now bounded by a wall-clock deadline.
- Gemini citation URLs are resolved from grounding-redirect wrappers to real domains.

## [0.1.1] — 2026-08-28 (unpublished)

### Fixed
- Question derivation no longer hard-requires an OpenAI key.
- `check_setup` preflight tool for the corpus server.

## [0.1.0] — 2026-08-28

### Added
- First release: the measurement pipeline (question derivation, grounded multi-engine sampling, judge extraction, cited-source verification, Wilson intervals, significance-gated cross-engine comparison) and the corpus MCP server.

[Unreleased]: https://github.com/tayden-b/aeokit/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/tayden-b/aeokit/releases/tag/v0.1.2
[0.1.1]: https://github.com/tayden-b/aeokit/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/tayden-b/aeokit/releases/tag/v0.1.0
