# Security

## Reporting

If you find a vulnerability, email **taydenpbarretto@gmail.com** with "aeokit security" in the subject rather than opening a public issue. You'll get an acknowledgement within a few days. This is a one-person project; there is no bounty program, but credit in the changelog is yours if you want it.

## What the design defends against

**Key exposure.** Engine API keys are read only from the server process environment (`OPENAI_API_KEY`, `GEMINI_API_KEY`, and the `AEOKIT_USER_*` variants for bring-your-own-key). They are never accepted as tool arguments, never echoed in tool output, and never written to the corpus or the quota ledger. The rationale: MCP tool arguments are recorded in client transcripts the server has no control over.

**Server-side request forgery.** The source-verification step fetches URLs that came out of model output — untrusted by construction. Every fetch goes through `pagecheck._assert_safe`, which enforces an `http`/`https` scheme allowlist, resolves DNS *before* connecting and refuses private, loopback, link-local, reserved, and multicast addresses (including the cloud metadata range), and re-validates every redirect target instead of following blindly. Responses are size-capped and must be text.

**Spend abuse on the hosted tier.** The hosted server runs on the operator's keys. Two independent guards bound the damage: a per-client daily free-probe count and a hard global daily dollar cap enforced *before* any engine call, with cost reserved up front and settled after. A failed probe releases its reservation. The worst case is a number chosen in advance, not discovered on a bill.

**Probe isolation.** Each hosted measurement runs in a subprocess with a hard kill timeout, so a hung DNS lookup, a wedged thread, or a native crash cannot take the server down or hold a connection open indefinitely.

## What it does not defend against

- **Client identity is best-effort.** Per-client limits key on forwarded IP and are trivially evaded by anyone determined. The global cap is the real limit; the per-client one just stops casual overuse.
- **No authentication on the hosted free tier.** By design — it's a demo. Anything needing accountability belongs on the BYOK path where the user's own keys are the accountability.
- **Prompt injection via fetched pages.** Page text is only substring-matched for product names and never fed to a model, which closes the obvious path, but extracted product names from engine answers do flow into reports. Treat report contents as data.

## Supported versions

Only the latest release on PyPI receives fixes.
