# M3 Engineering Note: Frontend–API System Integration

## 1. Purpose and scope

This note records the integration work for `feat/m3-system-integration`. The target is reliable communication between the React/TypeScript browser SPA in `apps/web` and the Express modular-monolith API in `apps/api`, consistent with the M2 architecture.

The objective is to make the agreed core browser workflow communicate with the existing API across development and staging. It does not introduce a second platform or new external integrations.

## 2. Integration boundaries

| Boundary | Expected behaviour | Verification |
|---|---|---|
| Frontend API client → API | Requests use configured API base URL; staging/production requests do not fall back to a developer's localhost | Inspect API client configuration and browser Network panel |
| Browser origin → API CORS | API permits the actual frontend origin required for the selected environment | Verify configuration and make a safe browser request |
| Frontend → health route | `GET /api/v1/health` returns the documented healthy response when API is running | Record status, response and target URL |
| Frontend → report submission | `POST /api/v1/reports` sends the real request contract and displays correct success/error feedback | Submit synthetic data and record response/UI outcome |
| API → PostgreSQL via Prisma | API uses configured database and does not expose internal errors to users | Confirm test submission and approved database evidence |
| Configuration → build | Frontend and API use intended environment-specific values | Compare development and staging configuration with secrets redacted |

The M2 PED's examples use `VITE_API_BASE_URL` and `FRONTEND_ORIGIN`. Confirm names and the request contract against the current repository.

## 3. Integration procedure

1. **Establish baseline:** start from required core-workflow changes merged according to the branch sequence; record base commit.
2. **Inspect API contract:** confirm actual route, request body, authentication requirement, response schema and error format for report submission. Do not invent fields or payloads.
3. **Configure API origin:** read the API base URL from existing environment configuration; remove hardcoded development URLs where they break staging.
4. **Verify CORS/authentication:** confirm the configured frontend origin matches the environment. Follow the actual cookie/token contract; never commit a live token.
5. **Check health:** call `GET /api/v1/health` in development and staging and record actual response and candidate commit.
6. **Check report path:** use synthetic data, submit through browser and verify success/error feedback. Confirm persistence through the supported view or approved database check.
7. **Check failure behaviour:** in a controlled local check, use an invalid API base URL or stop the local API and confirm the UI does not falsely show success. Restore correct configuration immediately.
8. **Build and review:** run actual documented build, lint and test commands. Inspect failed requests, CORS errors, 4xx/5xx responses and accidental localhost references.
9. **Open PR:** include purpose, changed files, commands run, results, limitations and evidence links. Obtain two independent approvals and passing required CI before merge.

## 4. Integration smoke-test record

| ID | Scenario | Expected result | Actual result / evidence |
|---|---|---|---|
| INT-SM-01 | Open frontend using intended environment configuration | Frontend loads without configuration error | `[record result and evidence link]` |
| INT-SM-02 | Call `GET /api/v1/health` | Healthy status from intended API instance | `[record status, time, commit and link]` |
| INT-SM-03 | Submit valid synthetic report using real API contract | Request succeeds and UI shows expected confirmation/reference | `[record status and link]` |
| INT-SM-04 | Submit invalid data through relevant UI/API path | Validation feedback is shown; invalid data is not reported as saved | `[record result and test/RTM link]` |
| INT-SM-05 | Run frontend with API unavailable in a controlled local check | Clear failure; UI does not report success | `[record result and link]` |
| INT-SM-06 | Build for staging and inspect API requests | Requests target configured staging API; no accidental localhost dependency | `[record commit and link]` |

These smoke checks support integration evidence; they do not replace the team's required automated unit, black-box, API or E2E suite.

## 5. Pull Request evidence

| Item | Value |
|---|---|
| Branch | `feat/m3-system-integration` |
| Planned PR title | `feat(integration): integrate frontend client with backend modular monolith API` |
| PR URL | `[actual URL]` |
| Base/head commit | `[actual commit IDs]` |
| Independent approvals | `[review evidence]` |
| CI run | `[actual workflow URL and status]` |
| Known integration limitations | `[actual findings, or state none only after verification]` |

## References
- *CivicConnect PED v2.0 (M1 + M2)*, M2 §§4–9, especially frontend API boundary and initial API contract.
- *CivicConnect — Milestone 3 Team Workload Allocation Plan*, §2.2.
- *CivicConnect — Milestone 3 Git Branch Execution Sequence*, §§1–3.
- *SEN381 CivicConnect Milestone 3 Brief*, §§7–8 and 14.
