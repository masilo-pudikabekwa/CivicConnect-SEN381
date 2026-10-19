# Finalisation Checklist

## Current evidence position

The combined finalisation branch is currently at `61ddfe1` after Dristen's two M4 branches were merged. Local verification passed 35/35 Vitest tests and the API/web production builds, but this is not a final CI run or release baseline. Do **not** create the final tag yet: staging, load, volume and usability must be recorded against the final candidate.

## PED v4.0 reconciliation placeholders

PED v4.0 identifies the frozen assessed baseline as `4e7e4cb31d1d8a1c97a7e8e50b18fa90f13a3d6a` (`v4.0.0`, 18 October 2026) and records a passing CI quality-gate Run #27: `https://github.com/masilo-pudikabekwa/CivicConnect-SEN381/actions/runs/39166111212/job/117789326261` (35/35 Vitest executions). Retain the following as incomplete until controlled final-SHA evidence is attached:

- `[INTG-01 to INTG-12 staging smoke screenshots/network traces]`
- `[rollback rehearsal record]`
- `[two NFR-01 50-concurrent-user, 15-second load-run outputs]`
- `[NFR-06 empty-versus-100-user/500-report comparison]`
- `[NFR-02 five-participant usability record]`
- `[NFR-04 declared uptime-window log]`
- `[two reviewer approvals and verified v4.0.0 tag URL]`

The PED records an interim `NO-GO / HOLD pending evidence` decision; it does not establish that the outstanding NFRs failed.

## Do these repository tasks before editing PED v4.0

1. **Freeze a candidate after the merged fixes are reviewed.** TD-04, TD-05 and CR-011 are now merged locally; record the resulting full SHA in `docs/final/release-baseline-record.md` after no further code changes are needed.
2. **Rerun the CI workflow on that SHA.** Replace every `quality-gate` / run placeholder in `docs/requirements/rtm.md` with the real Actions URL and observed job result. Add the ruleset screenshot path/URL to the PED evidence index.
3. **Complete the scope table.** Use `docs/final/scope-completion.md`. Do not award a score without a final-SHA evidence link. Recalculate after the NFR and FR-09 outcomes are known.
4. **Conduct the usability evaluation.** Use `docs/final/usability-test-record.md` with at least five first-time users. Use participant codes only; do not fabricate participants, completion, steps or quotes.
5. **Close the controlled registers.** Update existing `docs/quality/defect-register.md`, `docs/risk/risk-register.md` and `docs/ai-usage/AI-Usage-Register.md`; add final status, evidence and retained consequence. Dristen's `docs/technical-debt/technical-debt-register.md`, `docs/change/change-log.md` and `docs/decisions/decision-log.md` are now merged; cross-link TD-04/TD-05/CR-011/CR-013 and retain TD-13 as future work.
6. **Update the existing RTM, not a duplicate.** Make each row point to the frozen SHA, final test/evidence, final status and linked open defect/limitation. Correct unsupported NFR claims before declaring them verified.
7. **Make the release decision.** Complete the record with production, simulated production or justified staging no-go. For a no-go, name the blocker, affected NFR/risk, likely consequence and remediation condition.
8. **Create the annotated tag only after the gate is approved.** Example: `git tag -a v4.0.0 <SHA> -m "CivicConnect final assessed baseline"`; then push the tag and paste the tag URL/SHA into every final artefact.
9. **Assemble PED v4.0.** Copy PED v3.0, retain its history, append the headings in `PED-v4.0-template.md`, replace every bracketed field, update the Word TOC and export PDF. Verify the Word/PDF against the tagged repository.

## Masilo defence trace

Prepare this live route: `N02 -> FR-04 -> owner-scoped 404 (CR-006) -> E2E-01b -> final RTM row -> scope score`. Be able to state what the test proves, what it does not prove, and the final SHA containing it.

## Required hand-offs before finalisation

| Owner | You need from them | Evidence to request |
|---|---|---|
| Dristen | TD-04, TD-05, CR-011 and tests; decision/debt closure | Merged locally: PR #37 references, UT-07, INT-04/05/06/08/09, CR-009..013 and controlled debt register. Still obtain the final CI URL and two review approvals. |
| Phenyo | staging, load, volume, uptime and INTG smoke | final-SHA runbook, raw JSON/logs, screenshots/traces and go/no-go recommendation |
| Masilo | CI, scope, usability, register/PED assembly and tag | final workflow URL, scope calculation, anonymised usability record, final document/PDF |
