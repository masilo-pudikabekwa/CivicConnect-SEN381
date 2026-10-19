# Final Release Baseline and Go No Go Record

## Baseline identity

| Item | Verified value |
|---|---|
| Candidate SHA | `4e7e4cb31d1d8a1c97a7e8e50b18fa90f13a3d6a` |
| Annotated tag | `v4.0.0` |
| Tag URL | `[enter the verified v4.0.0 tag URL]` |
| Candidate freeze date | `2026-10-18` |
| Approvers | `[enter two reviewer names and approval links]` |

## Latest pre-freeze local verification

| Item | Observed result | Limitation |
|---|---|---|
| Combined branch | `4e7e4cb31d1d8a1c97a7e8e50b18fa90f13a3d6a` | Any subsequent code/documentation update requires a new candidate SHA. |
| Automated tests | 35/35 Vitest tests passed in CI quality-gate Run #27 | Final CI URL: `https://github.com/masilo-pudikabekwa/CivicConnect-SEN381/actions/runs/39166111212/job/117789326261`. |
| Production build | API TypeScript and web Vite builds passed in CI | Does not prove staging, load, volume, usability or availability. |
| M4 integrity closure | TD-04 and TD-05 repaid; CR-011 implemented; volume seed available | `[add the two review approvals and verified tag URL before release sign-off]` |

## Evidence gates

| Gate | Requirement / concern | Evidence location at candidate SHA | Observed result | Gate decision |
|---|---|---|---|---|
| CI and build | final code quality | `https://github.com/masilo-pudikabekwa/CivicConnect-SEN381/actions/runs/39166111212/job/117789326261` | `Pass: all blocking gates; 35/35 Vitest executions` | `pass` |
| Critical automated tests | FR-01 to FR-09 impacted tests | `CI quality-gate Run #27` | `Pass: 7 unit, 9 integration, 16 black-box and 3 E2E executions` | `pass` |
| Staging / simulated production | configuration and smoke acceptance | `[runbook / screenshots]` | `[result]` | `[pass/hold]` |
| NFR-01 | load performance | `[two result files]` | `[p95, errors]` | `[pass/hold]` |
| NFR-06 | volume performance | `[comparison files]` | `[increase]` | `[pass/hold]` |
| NFR-02 | usability | `[usability test record]` | `[completion / steps]` | `[pass/hold]` |
| Registers and RTM | final evidence integrity | `[links]` | `[complete/incomplete]` | `[pass/hold]` |

## Final deployment decision

- Declared state: `[choose Production, Simulated production, or Remained in staging]`
- Decision date and owner: `[date / name]`
- Decision: `NO-GO / HOLD pending evidence`
- Evidence basis: `CI Run #27 passed, but staging, load, volume, usability, uptime, smoke and rollback evidence remains outstanding.`
- If NO-GO: blocking concern: `No controlled final-SHA evidence for staging/rollback, NFR-01, NFR-02, NFR-04 or NFR-06.`
- Affected requirement/risk: `NFR-01, NFR-02, NFR-04, NFR-06; R-016, R-018 and R-019.`
- Likely consequence of release: `A production claim would be unsupported and could expose operational, performance and usability limitations.`
- Required change before go-live: `Record the outstanding evidence against the candidate SHA, complete this gate table, and obtain an evidence-based release decision.`

## Integrity confirmation

`[Confirm every linked artefact points to the identical final SHA/tag. If a result was not run, it must be recorded as unavailable rather than inferred.]`
