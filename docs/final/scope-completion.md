# M1 Scope to Final Delivery Calculation

## Scoring rule

Met = `1.0`; Partially Met = `0.5`; Not Met = `0.0`.

Only acceptance criteria applicable to the approved M1 baseline belong in the denominator. A changed or removed criterion needs its approved CR reference and must remain visible rather than being silently excluded.

## Final calculation table

| ID | Priority | M1 commitment / acceptance criterion | Final status | Score | Final-SHA evidence | Change / defect / limitation | What you must enter |
|---|---|---|---|---:|---|---|---|
| FR-01 | Must | Submit a valid civic report and receive confirmation | `[pending]` | `[0/0.5/1]` | `[test/demo/RTM URL]` | `[none or reference]` | `[actual result]` |
| FR-02 | Must | Reject invalid reporting input with usable validation feedback | `[pending]` | `[0/0.5/1]` | `[evidence]` | `[reference]` | `[actual result]` |
| FR-03 | Must | Return a unique report reference and timely confirmation | `Implemented - final CI/link pending` | `1 provisional` | `UT-07 and INT-08; local Vitest 35/35 on 61ddfe1` | `CR-013; TD-04 repaid. NFR-01 load evidence remains separate and pending.` | `[add final CI URL and frozen SHA]` |
| FR-04 | Must | Owner can view status; non-owner cannot discover another report | `[pending]` | `[0/0.5/1]` | `[E2E-01b at final SHA]` | `[CR-006]` | `[actual result]` |
| FR-05 | Must | Staff can make legal, audited status transitions | `Implemented - final CI/link pending` | `1 provisional` | `INT-05 concurrent writes, INT-06 rollback, INT-09 deterministic 409; local Vitest 35/35 on 61ddfe1` | `TD-05 repaid; TD-06 partially repaid.` | `[add final CI URL and frozen SHA]` |
| FR-06 | Should | Staff can filter the report queue | `[pending]` | `[0/0.5/1]` | `[E2E/INT evidence]` | `[reference]` | `[actual result]` |
| FR-07 | Must | Register/login securely with password rules and generic failures | `[pending]` | `[0/0.5/1]` | `[black-box tests]` | `[reference]` | `[actual result]` |
| FR-08 | Must | Enforce authenticated role-based access | `Implemented - final CI/link pending` | `1 provisional` | `INT-04 and RBAC test suite; local Vitest 35/35 on 61ddfe1` | `CR-011: Staff/Admin cannot submit reports.` | `[add final CI URL and frozen SHA]` |
| FR-09 | Should | Changed role/deactivation takes effect on next request; admin lifecycle capability if delivered | `[pending]` | `[0/0.5/1]` | `[auth test / admin evidence]` | `[CR-012]` | `[actual result]` |
| FR-10 | Could | Send notification after relevant status transition | `Deferred` | `0` | `[decision record]` | `[approved deferral]` | `[confirm whether applicable denominator]` |
| NFR-01 | Must | 50 concurrent POST requests for 15 s meet stated p95/error target | `[pending]` | `[0/0.5/1]` | `[two real performance outputs]` | `[load result]` | `[actual result]` |
| NFR-02 | Must | First-time usability task meets completion/steps target | `[pending]` | `[0/0.5/1]` | `[usability record]` | `[limitation]` | `[actual result]` |
| NFR-03 | Must | Enforce password complexity and secure hashing | `[pending]` | `[0/0.5/1]` | `[tests/code]` | `[reference]` | `[actual result]` |
| NFR-04 | Must | Meet stated availability/reliability acceptance criterion | `[pending]` | `[0/0.5/1]` | `[declared uptime window]` | `[partial/no-go if not sufficient]` | `[actual result]` |
| NFR-05 | Must | Validate and sanitise report data before persistence | `[pending]` | `[0/0.5/1]` | `[black-box tests]` | `[reference]` | `[actual result]` |
| NFR-06 | Must | At 100 users / 500 reports, response-time increase is <=20% | `Measurement pending` | `[0/0.5/1]` | `apps/api/prisma/seed-volume.ts is available via npm run seed:volume; baseline/volume measurements still required` | `TD-03 and TD-09 retained.` | `[run both measurements after final fixes]` |

## Calculation to complete after evidence is frozen

`Sum of final scores = [__]`

`Applicable approved acceptance criteria = [__]`

`Scope Completion Percentage = ([sum] / [applicable criteria]) x 100 = [__]%`

### Final conclusion

`[State whether the result meets the 80% target; identify any Must-have item not fully met, its evidence-based reason, stakeholder impact and controlled-change/defect link.]`
