# M3 Staging / Simulated-Staging Runbook

## 1. Purpose

Demonstrate the identified CivicConnect candidate in an environment separate from ordinary development. A real cloud deployment is optional for M3; credible simulated staging is acceptable if configuration, data separation, release identity and verification can be demonstrated.

## 2. Preconditions

- [ ] Frontend/API integration PR is merged through the required review process.
- [ ] Required unit/API, black-box and E2E checks are available and passed on the candidate baseline.
- [ ] CI is functioning and its actual run is linked.
- [ ] The schema/migration owner has confirmed the migration needed for the candidate.
- [ ] Staging database is separate from development and uses synthetic/non-sensitive data.
- [ ] Required environment values are available outside source control.
- [ ] Exact commit/tag to deploy is recorded.

## 3. Environment profile

The team plan proposes the following local simulated-staging profile. If hosted staging is used, replace local values with actual deployment configuration and URL.

| Item | Planned value / rule |
|---|---|
| Environment type | `[local simulated staging / hosted staging]` |
| Runtime mode | `NODE_ENV=staging`, if supported by the actual environment validator |
| API port | `3001` for planned local simulated staging unless actual runtime requires another value |
| Database | Separate `civicconnect_staging` database for the planned simulated-staging option |
| Frontend | Compiled production assets from `dist/`, not the Vite development server |
| Frontend API setting | Actual configured API base URL, using the existing project variable |
| API CORS origin | Actual staging frontend origin, configured through the established API setting |
| Release identity | Exact Git tag and commit SHA being assessed |
| Credentials | Injected through local environment or hosting secret facility; never put in this file |

## 4. Execution procedure

Commands in PED v2.0 are examples of workspace scripts. Check current `package.json` files and use the scripts that actually exist.

1. **Record candidate:** capture current commit SHA and intended tag.
2. **Prepare configuration:** set staging-only values. Confirm `DATABASE_URL` targets staging. Redact credentials in saved evidence.
3. **Install reproducibly:** use the lockfile and documented clean-install command (for example, `npm ci` if configured).
4. **Prepare persistence:** apply the approved migration command against staging only, after the schema owner confirms the migration is ready.
5. **Build:** run the actual documented build script for API and frontend. Confirm compiled assets exist.
6. **Start API:** use the actual documented staging command and capture startup status without secrets.
7. **Serve compiled frontend:** ensure the browser uses the configured staging API base URL.
8. **Health check:** request `GET /api/v1/health`; record status, timestamp, candidate commit and environment.
9. **Critical journey:** where feasible, run the core reporting journey against the candidate using synthetic data.
10. **Capture differences:** note differences from development that could affect behaviour, including database, CORS origin, build-time API configuration, authentication configuration, hosting or external dependencies.
11. **Review and clean up:** confirm test data is non-sensitive and remove temporary credentials from the session according to team process.
12. **Link evidence:** add the staging record and relevant logs/test output to the PED evidence index.

## 5. Staging verification record

| Field | Value |
|---|---|
| Environment type | `[actual option]` |
| URL / demonstration instructions | `[actual URL or exact local demo steps]` |
| Deployed tag | `[actual tag]` |
| Deployed commit SHA | `[actual SHA]` |
| Database isolation confirmed | `[yes/no + evidence]` |
| Compiled frontend confirmed | `[yes/no + evidence]` |
| `GET /api/v1/health` result | `[actual status/body/time]` |
| Critical journey result | `[pass/fail/blocked + evidence]` |
| CI/test baseline | `[actual CI run link]` |
| Configuration differences | `[observed differences]` |
| Limitations | `[actual limitations]` |
| Executed by / date | `[actual record]` |

## 6. Acceptance criteria

Staging evidence is acceptable when the environment is not merely the normal development server, the correct candidate is deployed, the database/configuration are separated from development, no secret is exposed, health and critical-journey results are recorded, and environment differences are explained.

A staging URL alone is not proof of a working deployment. A local simulated environment must be labelled accurately and demonstrated during the presentation.

## References
- *SEN381 CivicConnect Milestone 3 Brief*, §14 and submission requirements in §5.
- *CivicConnect PED v2.0 (M1 + M2)*, M2 §§7–9.
- *CivicConnect — Milestone 3 Team Workload Allocation Plan*, §§2.2–2.4.
- *CivicConnect — Milestone 3 Git Branch Execution Sequence*, §5.
