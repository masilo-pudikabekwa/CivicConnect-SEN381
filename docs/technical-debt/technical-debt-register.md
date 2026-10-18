<!-- technical-debt-register.md -->
# Technical Debt Register

**Owner:** Dristen Venter (Person 2: Data, Core Construction & White-Box Testing Lead)
**Status:** Final (M4 closure). This register continues PED v3.0 Appendix D. It is not a new register: TD-01 to TD-13 keep their original IDs and wording, and TD-14 to TD-17 were found while closing M3.
**Final baseline:** ⟨UPDATE: final tag / commit SHA⟩

Debt is a deliberate or inadvertent shortcut whose cost grows if it is kept. A missing feature is only recorded here when it leaves a structural gap (for example TD-01 and TD-13). Bugs belong in the Defect Register (`docs/quality/defect-register.md`).

## How items are concluded

| Final status | Meaning |
|---|---|
| **Repaid** | Fixed on the final baseline; evidence is a merged PR, commit and passing test/CI run. |
| **Partially repaid** | The part that affected a Must requirement is fixed; the remainder is retained with its consequence stated. |
| **Retained: accepted** | Kept on purpose for the pilot. The consequence is acceptable at pilot scale and the trigger for repayment is stated. |
| **Retained: future work** | Kept because it needs work beyond the final-project period. Listed in PED v4.0 *Known limitations / future work*. |
| **No longer relevant** | The condition that made it debt no longer exists. |

"Type" follows the deliberate/inadvertent split used in PED v3.0: *deliberate* means the team chose the shortcut knowingly; *inadvertent* means it was found by inspection or testing.

## Register

| ID | Debt item and location | Type | Requirement / risk affected | Consequence if retained | Repayment and trigger | Owner | Final status | Evidence |
|---|---|---|---|---|---|---|---|---|
| **TD-01** | FR-10 email notifications not implemented; ADR-INTEGRATION-01 decided but not built. | Deliberate | FR-10 (Could), R-020 | Citizens must check status themselves. Adding email later needs an outbox and a worker, not a synchronous call in the status transaction. | Write an outbox row inside the status transaction and process it with a worker, when FR-10 is brought into scope. | Dristen / Phenyo | **Retained: future work** | RTM FR-10 row; ADR-INTEGRATION-01 status |
| **TD-02** | Single PostgreSQL node; no rehearsed restore; `/api/v1/health` does not check the database (`apps/api/src/app.ts`). | Deliberate | NFR-04, ASR-04, R-016 | A database outage stops the whole system while health still reports "ok", so uptime monitoring cannot be trusted and NFR-04 cannot be evidenced. | DB readiness check (`SELECT 1`) in the health route; one restore rehearsal; before real users. | Phenyo / Dristen | **Retained: accepted** | Go-live decision; staging runbook |
| **TD-03** | No pagination: the staff list returns the newest 100 rows only (`take: 100`, `report.service.ts` `listReports`). | Deliberate | FR-06, NFR-06 | With more than 100 matching reports (NFR-06 assumes 500), staff silently cannot see older reports. | Offset or cursor pagination on (`createdAt`, `id`), when reports exceed 100. | Dristen | **Retained: accepted** | NFR-06 volume-test record |
| **TD-04** | Reference `CC-YYYYMMDD-NNNN` used 9,000 random values per day with no retry; a duplicate hit the unique index and returned HTTP 500, losing the report. | Inadvertent | FR-03 (Must), NFR-01 | About 50% chance of a collision after ~112 reports in one day (birthday bound). The load test would very likely produce 500s and fail NFR-01. | Wider random part plus retry on unique violation (Prisma `P2002`); before the load test and final tag. Format change recorded as CR-013. | Dristen | **Repaid** (PR #37, `6af1309`) | UT-07, INT-08 (`tests/reports.test.ts`, `tests/integrity.test.ts`) ⟨UPDATE: CI run⟩ |
| **TD-05** | `updateStatus()` read the report, then updated it, with no conditional write. | Inadvertent | FR-05 (Must), ASR-02, ADR-PERSISTENCE-01 | Two simultaneous staff updates could both succeed, producing duplicate or contradictory audit history. | Conditional update (`WHERE reference = ? AND status = current`) inside the existing transaction; 0 rows changed returns HTTP 409. | Dristen | **Repaid** (PR #37, `8caf8fc`) | INT-05 (race invariant) and INT-09 (deterministic 409) in `tests/integrity.test.ts` ⟨UPDATE: CI run⟩ |
| **TD-06** | Errors mapped to HTTP codes by message text (`errorHandler.ts`); Prisma errors unmapped (become 500). | Inadvertent | ASR-02, FR-07 | Rewording a message changes the status code (login already returned 500 once: DEF-04). A duplicate-email race returns 500 instead of 409. | Typed error classes and a Prisma error mapper; at the next error-handling change. | Dristen | **Partially repaid**: typed `ConflictError` (`src/shared/errors.ts`) added with TD-05; older errors still matched by message | PR #37 |
| **TD-07** | No repository layer; services call Prisma directly. | Deliberate | ADR-DESIGN-02, CR-003 | Service tests need a real database; changing ORM touches every service. | Add repositories when a second consumer or a mocking need appears. | Dristen | **Retained: accepted** | ADR-DESIGN-02 |
| **TD-08** | Audit history is not append-only: deleting a report cascades to its history; the creation row is stored as `SUBMITTED → SUBMITTED`. | Inadvertent | FR-05, ED-003 | Accountability evidence can be lost with one delete. No delete endpoint exists, so the risk is limited to direct database access. | `ON DELETE RESTRICT`, nullable `fromStatus`, insert-only DB grant; when a retention policy is decided (ED-003). | Dristen | **Retained: accepted** | Schema doc §3; ED-003 |
| **TD-09** | Missing indexes on `status_history(reportId)`, `status_history(changedById)` and `reports(createdAt)`. | Inadvertent | NFR-06, ASR-05 | No measurable effect at 500 reports; history look-ups and date sorting slow down as data grows. | Additive index migration checked with `EXPLAIN`; together with TD-03. | Dristen | **Retained: accepted** | NFR-06 volume-test record |
| **TD-10** | Category and text lengths validated only in the API (Zod); `category` is free text in the database. | Deliberate | NFR-05, FR-02 | Scripts or future modules can store invalid data that bypasses the API. | Category lookup table or CHECK constraints; when categories become admin-managed. | Dristen | **Retained: accepted** | Schema doc §2 |
| **TD-11** | Versions behind ADR-TECH-01: Prisma 6, TypeScript 5.9, Vite 6, bcrypt instead of Argon2id (CR-009). | Deliberate | ADR-TECH-01 rev 1 | Each upgrade grows larger over time; bcrypt hashes need rehashing on login after an Argon2id switch. | One reviewed upgrade PR per major dependency after the final release. | Team | **Retained: future work** | CR-009; `package-lock.json` |
| **TD-12** | JWT (8 h lifetime, no revocation) stored in browser `localStorage`. | Deliberate | NFR-03, ASR-01 | An XSS bug could expose a token for up to 8 hours. Deactivation still applies on the next request because of the FR-09 re-query. | HttpOnly cookie or short-lived tokens with a Content Security Policy; before real users. | Dristen / Phenyo | **Retained: accepted** (go-live input) | Go-live decision |
| **TD-13** | FR-09 admin API/UI not implemented (CR-012). | Deliberate | FR-09 (Should) | Role changes and deactivation need direct database access. | Admin module (list users, change role/`isActive`) with audit. | Team | **Retained: future work** | CR-012; RTM FR-09 |
| **TD-14** | CI has no lint step (`.github/workflows/ci.yml`). Deviation from the Assignment 2 gate model, PED v3.0 §5.2. | Deliberate | R-017, maintainability | Style and some correctness problems (unused variables, floating promises) reach review instead of being blocked. | Add ESLint with a blocking CI step. | Masilo | **Retained: future work** | `ci.yml`; PED §5.2 |
| **TD-15** | CI reports no coverage (PED v3.0 §6.3). | Deliberate | Quality evidence | Untested code paths are not visible; reviewers rely on the risk-to-test mapping only. | Vitest coverage report as a CI warning (not a gate). | Masilo / Dristen | **Retained: future work** | PED §6.3 |
| **TD-16** | The React web workspace has no automated tests; the "E2E" tests are HTTP-level (PED v3.0 §5.4, §7.3). | Deliberate | NFR-02, FR-01, FR-04 | A broken screen is not caught by CI; UI behaviour is evidenced only by manual smoke tests (INTG-01 to INTG-12). | Browser-level tests (e.g. Playwright) for the two critical journeys. | Phenyo / Masilo | **Retained: future work** | PED §7.3 |
| **TD-17** | Environment validator accepts only `development`, `test`, `production` (`apps/api/src/config/env.ts`), while the staging runbook planned `NODE_ENV=staging`. | Inadvertent | ADR-DEPLOY-01, R-016 | Starting the API with `NODE_ENV=staging` fails validation, so staging must run as `production` and cannot be told apart from production by configuration alone. | Use `NODE_ENV=production` + `APP_ENV=staging` (as in PED v3.0 §2.3), or add `staging` to the enum. | Dristen / Phenyo | ⟨UPDATE: Repaid (PR #) or No longer relevant (runbook uses `APP_ENV`)⟩ | `env.ts`; staging runbook |

## Summary at final baseline

| Final status | Items |
|---|---|
| Repaid | TD-04, TD-05 |
| Partially repaid | TD-06 |
| Retained: accepted | TD-02, TD-03, TD-07, TD-08, TD-09, TD-10, TD-12 |
| Retained: future work | TD-01, TD-11, TD-13, TD-14, TD-15, TD-16 |

**Must requirements:** the two items that affected Must requirements (TD-04 → FR-03, TD-05 → FR-05) are repaid. No retained item causes a Must acceptance criterion to fail.

**Go-live relevance:** TD-02 (no database health check, no restore rehearsal), TD-12 (token storage) and TD-08 (audit history can be deleted at database level) are the retained items that would matter for real citizen data. They are inputs to the team's go-live decision in PED v4.0; they do not block the assessed pilot demonstration.

## Change history

| Date | Change | By |
|---|---|---|
| 2026-10-16 | TD-01 to TD-13 recorded in PED v3.0 Appendix D (8 deliberate, 5 found during M3 inspection). | Dristen |
| 2026-10-18 | Moved into the repository as a controlled file; TD-14 to TD-17 added from PED v3.0 §5.2/§5.4/§6.3 and `env.ts`; final-status column added. | Dristen |
| 2026-10-18 | TD-04, TD-05 repaid and TD-06 partially repaid in PR #37 (INT-05, INT-06, INT-08, INT-09, UT-07). ⟨UPDATE: CI run link⟩ | Dristen |
