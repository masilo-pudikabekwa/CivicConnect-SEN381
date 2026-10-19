# Final Release Baseline and Go No Go Record

## Baseline identity

| Item | Verified value |
|---|---|
| Candidate SHA | `[full 40-character SHA]` |
| Annotated tag | `[v4.0.0 after approval only]` |
| Tag URL | `[URL]` |
| Candidate freeze date | `[YYYY-MM-DD]` |
| Approvers | `[names and PR/review links]` |

## Latest pre-freeze local verification

| Item | Observed result | Limitation |
|---|---|---|
| Combined branch | `61ddfe1` | Documentation updates after this record require a new candidate SHA. |
| Automated tests | 35/35 Vitest tests passed locally | Replace with a final GitHub Actions URL after the freeze. |
| Production build | API TypeScript and web Vite builds passed locally | Does not prove staging, load, volume, usability or availability. |
| M4 integrity closure | TD-04 and TD-05 repaid; CR-011 implemented; volume seed available | Confirm PR #37 approvals and CI URL before release sign-off. |

## Evidence gates

| Gate | Requirement / concern | Evidence location at candidate SHA | Observed result | Gate decision |
|---|---|---|---|---|
| CI and build | final code quality | `[Actions URL]` | `[pass/fail]` | `[pass/hold]` |
| Critical automated tests | FR-01 to FR-09 impacted tests | `[test output / Actions URL]` | `[count and result]` | `[pass/hold]` |
| Staging / simulated production | configuration and smoke acceptance | `[runbook / screenshots]` | `[result]` | `[pass/hold]` |
| NFR-01 | load performance | `[two result files]` | `[p95, errors]` | `[pass/hold]` |
| NFR-06 | volume performance | `[comparison files]` | `[increase]` | `[pass/hold]` |
| NFR-02 | usability | `[usability test record]` | `[completion / steps]` | `[pass/hold]` |
| Registers and RTM | final evidence integrity | `[links]` | `[complete/incomplete]` | `[pass/hold]` |

## Final deployment decision

- Declared state: `[Production / Simulated production / Remained in staging]`
- Decision date and owner: `[date / name]`
- Decision: `[GO / NO-GO / CONDITIONAL GO only if conditions are explicitly accepted]`
- Evidence basis: `[specific gate results]`
- If NO-GO: blocking concern: `[issue]`
- Affected requirement/risk: `[ID]`
- Likely consequence of release: `[consequence]`
- Required change before go-live: `[specific remediation and evidence needed]`

## Integrity confirmation

`[Confirm every linked artefact points to the identical final SHA/tag. If a result was not run, it must be recorded as unavailable rather than inferred.]`
