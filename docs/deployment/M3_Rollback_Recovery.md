# M3 Rollback and Recovery Procedure

## 1. Purpose

Rollback is a controlled response to a candidate that cannot be operated safely or does not satisfy critical acceptance criteria. The goal is to restore a known-good application version while protecting persistent data and preserving evidence of the failure.

This is a student staging/release-candidate procedure, not a claim that production-grade disaster recovery has been implemented.

## 2. Rollback triggers

Stop promotion and assess rollback when the candidate fails to start or repeatedly fails health checks; the critical report journey fails; a required CI/test gate fails; a release-blocking security/data-integrity issue is discovered; the candidate uses the wrong database or exposes secrets; or a migration/configuration change makes the previous candidate unsafe.

A non-critical defect does not automatically require rollback. Record severity, business impact, workaround and the release decision.

## 3. Before rollback

1. Stop further promotion and identify the exact failed tag/commit.
2. Preserve relevant CI output, logs and observations; redact secrets and personal data.
3. Identify the last known-good tag/commit and verify it exists.
4. Determine whether the failed candidate changed database schema or data.
5. Confirm the rollback target can run against the current database state. Application rollback is not automatically safe if a migration is not backward-compatible.
6. Tell the team which version is being restored and who will verify recovery.

## 4. Restore the previous version

The branch-execution plan names `v2.0.0` as the intended rollback reference and gives `git checkout v2.0.0`, `npm run build` and `npm run start` as an example sequence. Treat this as a plan, not a command to run blindly: verify the tag exists, inspect the current workspace scripts, and use a clean worktree or controlled redeploy rather than unexpectedly switching a shared working directory.

```bash
git fetch --tags
git tag --list "v2.0.0"
# Use a clean worktree or redeploy the verified v2.0.0 artifact.
# Then run the build/start commands documented by the actual repository.
```

Before using the illustrative commands, confirm `v2.0.0` exists and the root `package.json` defines the expected scripts. If a script is absent, use the actual documented build/start procedure.

Do not delete or reset the staging database as a routine rollback step. If a migration changed the schema, follow the database owner's approved recovery approach. Preserve a backup/restore point where supported, and never perform an unreviewed destructive migration to make the old application start.

## 5. Verify recovery

- [ ] Record restored tag/commit and deployment time.
- [ ] Call `GET /api/v1/health` and record the actual result.
- [ ] Run the critical report-submission journey with synthetic data.
- [ ] Verify the application is connected to the intended database.
- [ ] Check for unexpected 4xx/5xx errors or failed persistence.
- [ ] Confirm the previous version does not expose credentials or sensitive data.
- [ ] Record whether data written by the failed candidate remains compatible.
- [ ] Keep the failed candidate and evidence available for diagnosis; do not rewrite Git history to conceal the failure.

## 6. Rollback record

| Field | Value |
|---|---|
| Failed candidate tag/SHA | `[actual value]` |
| Trigger and impact | `[actual observation]` |
| Previous known-good tag/SHA | `[verified value]` |
| Database/schema impact assessed by | `[role and result]` |
| Recovery method | `[redeploy / clean-worktree build / other actual method]` |
| Health-check result | `[actual result]` |
| Critical journey result | `[actual result]` |
| Data integrity checked | `[actual result and evidence]` |
| Follow-up issue/defect | `[link to shared defect record]` |
| Recovery approved by / date | `[actual record]` |

## 7. Limitations

The procedure is verified only after a controlled exercise or documented rehearsal proves the commands and data assumptions are valid. If rollback has not been executed, report it as **documented but not exercised**.

## References
- *CivicConnect — Milestone 3 Team Workload Allocation Plan*, §2.2.
- *CivicConnect — Milestone 3 Git Branch Execution Sequence*, §§5–8.
- *SEN381 CivicConnect Milestone 3 Brief*, §§14–16.
- *CivicConnect PED v2.0 (M1 + M2)*, M2 §7 and deployment assumptions.
