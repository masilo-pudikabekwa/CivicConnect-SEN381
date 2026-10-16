# PED v3.0 — Section 4: Construction and Configuration Management

## 4.1 Construction-control approach

M3 construction should preserve a reviewable history and produce one identifiable release candidate. The assigned branches are `feat/m3-system-integration`, `deploy/staging-environment`, `test/performance-load` and `release/v3.0.0-rc1`.

The repository governance baseline requires:
- no substantive direct development on protected `main`, except a documented exceptional case;
- a Pull Request for substantive work;
- two approvals from team members other than the author;
- meaningful review comments, not approval-only reviews;
- required CI checks passing before merge;
- no credentials, tokens or private keys committed to source control;
- progressive commits showing how the work evolved.

For each PR, record its URL, changed files, reviewers, approvals, CI run and merged commit. The repository is the source of truth for this history.

## 4.2 Environment separation

M3 permits hosted staging or credible simulated staging. The environment must be distinct from normal development in configuration and data, identify the candidate being demonstrated and permit repeatable verification.

The team plan proposes a simulated-staging option using `NODE_ENV=staging`, an isolated database named `civicconnect_staging`, API port `3001` and compiled frontend assets (`dist/`). If hosted staging is used, record the actual provider, URL and configuration instead.

| Setting / control | Required handling | Evidence |
|---|---|---|
| `NODE_ENV` | Set to `staging` for simulated staging if supported by the actual environment validator | Redacted configuration record |
| API port | `3001` for planned local simulated staging unless the actual platform assigns a port | Startup log and health-check URL |
| `DATABASE_URL` | Point to isolated staging database, not a developer or production database | Redacted database identity; never include credentials |
| `FRONTEND_ORIGIN` | Actual staging frontend origin permitted by API CORS configuration | Configuration record and browser/API check |
| `VITE_API_BASE_URL` | Use the existing frontend API-base variable described by M2; set before production build | Build configuration and network request |
| `AUTH_SECRET` or equivalent | Supply through environment or hosting secret facility; never commit its value | Presence/validation evidence with value redacted |
| Frontend build | Serve compiled production assets (`dist/`), not the development server | Build output and deployed version |
| Release identity | Deploy the exact candidate commit/tag being assessed | Tag/SHA in staging log |

Check variable names against actual code and `.env.example` before use. This table does not authorize inventing a new variable if the repository uses another name.

## 4.3 Secrets and safe configuration

- Commit `.env.example` with names and safe placeholders only.
- Keep `.env` and local secret files ignored by Git.
- Never paste secrets into PED files, PR comments, screenshots or logs.
- Use synthetic, non-sensitive test data in M3 staging.
- If a secret is accidentally committed, treat it as exposed: revoke/rotate it, remove it through the approved process and record the incident. Removing it in a later commit does not make the leaked value safe.
- Validate required environment values at startup. Missing database or authentication configuration should fail clearly rather than presenting a misleading healthy status.

## 4.4 Build and promotion controls

1. Start from the merged integration baseline and confirm required CI/test checks pass.
2. Apply the documented database migration procedure to the isolated staging database only, after the schema owner confirms the migration is ready.
3. Build API and frontend using the repository's actual workspace scripts.
4. Set staging variables before building the frontend where the bundler embeds API configuration at build time.
5. Start the API using the actual documented staging command.
6. Serve the compiled frontend assets.
7. Call `GET /api/v1/health`; record status and response.
8. Execute the agreed critical browser journey against staging where feasible.
9. Record deployed tag/commit, environment type, test result and differences from development.
10. Promote to release-candidate review only after the evidence is reviewed.

PED v2.0 gives example scripts such as `npm run build`, `npm test` and `npm run lint`. Verify current `package.json` scripts before running them.

## 4.5 Evidence checklist

- [ ] Integration PR merged and reviewed.
- [ ] Required CI checks pass on candidate commit.
- [ ] Two independent approvals are visible for the substantive PR.
- [ ] Staging/test environment is separate from ordinary development.
- [ ] Staging database is isolated.
- [ ] No secrets are committed or exposed in evidence.
- [ ] Frontend uses the intended staging API origin, not a hardcoded developer URL.
- [ ] Compiled frontend assets are used for staging demonstration.
- [ ] Health check and critical journey results are recorded.
- [ ] Exact deployed commit/tag is recorded.
- [ ] Configuration differences and limitations are explained.

## References
- *CivicConnect PED v2.0 (M1 + M2)*, M2 §§7–9.
- *SEN381 CivicConnect Milestone 3 Brief*, §§8 and 14.
- *CivicConnect — Milestone 3 Team Workload Allocation Plan*, §§2.1–2.4.
- *CivicConnect — Milestone 3 Git Branch Execution Sequence*, §§5–8.
