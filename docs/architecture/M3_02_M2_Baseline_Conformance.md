# PED v3.0 — Section 2: M2 Baseline Conformance

## 2.1 Purpose

This section compares M2 architecture and technology decisions with the implementation represented by the identified M3 candidate. A decision is not considered implemented merely because it appears in PED v2.0.

## 2.2 M2 decisions and M3 verification

| M2 baseline decision | Expected M3 evidence | Status |
|---|---|---|
| Browser-based single-page application | React/TypeScript frontend under `apps/web`; demonstrate core browser journey | `TO VERIFY` |
| Modular-monolith API | One deployable Express API under `apps/api`, with Auth/Accounts, Reporting, Workflow and Administration boundaries | `TO VERIFY` |
| Shared security, validation and error middleware | Inspect middleware and route composition; confirm errors do not expose stack traces or raw database errors | `TO VERIFY` |
| Node.js 24 LTS and Express 5.x | Actual runtime and installed dependency versions from project configuration/CI | `TO VERIFY` |
| PostgreSQL 18.x through Prisma ORM 7.x | Actual database connection, Prisma configuration/migrations and successful staging connection | `TO VERIFY` |
| Provider-neutral managed-hosting direction | Deployment uses environment-provided configuration without an undocumented provider-specific dependency | `TO VERIFY` |
| Environment-injected configuration; no committed secrets | `.env.example` has placeholders only; real credentials remain outside version control | `TO VERIFY` |
| Backend-enforced access control | Protected API routes enforce authorization on the server; frontend visibility is not a security boundary | Link actual API/security tests |
| Core reporting/status workflow is the M3 priority | Submit and track a report through the integrated application; link actual test evidence | Link actual E2E/API evidence |
| Deferred scope remains controlled | Email notifications (FR-10), administrative UI and other deferred capabilities are not claimed complete without implementation/acceptance evidence | Confirm against repository and shared change records |

Replace `TO VERIFY` only after inspecting the candidate commit and recording a file path, PR, test result or deployment observation. Missing evidence must remain explicit.

## 2.3 Conformance method

For each row:
1. Identify the implementation files and the relevant M2 decision/requirement.
2. Verify behaviour in the running candidate where applicable; source-code presence alone does not prove the workflow works.
3. Link an existing test, CI run, staging observation or review record.
4. Record `CONFORMS`, `DEVIATION — CONTROLLED`, or `NOT VERIFIED`.
5. For a significant deviation, link the existing change request/ADR/decision record. Do not silently rewrite M2 decisions or create duplicate governance records.

Minor coding details do not automatically require an ADR. Changes affecting system boundaries, deployment assumptions, security, data handling or important quality attributes require a justified and traceable decision.

## 2.4 Known scope and change considerations

The M2 baseline is a browser SPA plus modular-monolith API. M3 should not introduce native mobile, direct external municipal-system integration or automated issue classification without formal change control.

The workload plan identifies email notifications and the administrative UI as deferred for the intended conditional-readiness rationale. Verify their actual status. If a deferred feature affects a Must requirement or critical acceptance criterion, it cannot be dismissed as harmless: record the impact and assess whether release must be blocked.

The branch plan identifies build/configuration and CI changes that may need controlled records. Confirm actual changes and refer to the shared `change/` or `decisions/` artefacts rather than duplicating those records here.

## 2.5 Conformance record

| Field | Record |
|---|---|
| Candidate tag / commit | `[actual tag and SHA]` |
| Reviewer/date | `[actual reviewer/role and date]` |
| Baseline decisions verified | `[list decisions]` |
| Significant deviations | `[none observed, or link controlled changes]` |
| Unverified decisions | `[list remaining gaps]` |
| Overall assessment | `[CONFORMS / CONFORMS WITH CONTROLLED DEVIATIONS / NOT VERIFIED]` |

## References
- *CivicConnect PED v2.0 (M1 + M2)*, M2 §§3–8 and 11–13.
- *SEN381 CivicConnect Milestone 3 Brief*, §7.
- *CivicConnect — Milestone 3 Team Workload Allocation Plan*, §2.4.
- *CivicConnect — Milestone 3 Git Branch Execution Sequence*, §§1–2 and 6.
