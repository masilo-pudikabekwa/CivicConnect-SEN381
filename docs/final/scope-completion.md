# M1 Scope to Final Delivery Calculation

## Scoring rule

Met = `1.0`; Partially Met = `0.5`; Not Met = `0.0`.

Only acceptance criteria applicable to the approved M1 baseline belong in the denominator. A changed or removed criterion needs its approved CR reference and must remain visible rather than being silently excluded.

## Final calculation table

| ID | Priority | M1 commitment / acceptance criterion | Final status | Score | Final-SHA evidence | Change / defect / limitation | What you must enter |
|---|---|---|---|---:|---|---|---|
| FR-01 | Must | Submit a valid civic report and receive confirmation | `Implemented` | `1 provisional` | `E2E-01; CI quality-gate Run #27 (35/35)` | `[none recorded]` | `[add final-SHA link to RTM evidence]` |
| FR-02 | Must | Reject invalid reporting input with usable validation feedback | `Implemented` | `1 provisional` | `Black-box suite; CI quality-gate Run #27 (35/35)` | `[none recorded]` | `[add final-SHA link to RTM evidence]` |
| FR-03 | Must | Return a unique report reference and timely confirmation | `Implemented` | `1 provisional` | `UT-07 and INT-08; CI quality-gate Run #27 (35/35)` | `CR-013; TD-04 repaid. NFR-01 load evidence remains separate and pending.` | `[add final-SHA link to CI and RTM evidence]` |
| FR-04 | Must | Owner can view status; non-owner cannot discover another report | `Implemented` | `1 provisional` | `E2E-01b; CI quality-gate Run #27 (35/35)` | `CR-006` | `[add final-SHA link to E2E-01b evidence]` |
| FR-05 | Must | Staff can make legal, audited status transitions | `Implemented` | `1 provisional` | `INT-05, INT-06 and INT-09; CI quality-gate Run #27 (35/35)` | `TD-05 repaid; TD-06 partially repaid.` | `[add final-SHA link to CI and RTM evidence]` |
| FR-06 | Should | Staff can filter the report queue | `Implemented` | `1 provisional` | `E2E-02; CI quality-gate Run #27 (35/35)` | `Pagination retained as TD-03.` | `[add final-SHA link to E2E-02 evidence]` |
| FR-07 | Must | Register/login securely with password rules and generic failures | `Implemented` | `1 provisional` | `BB-03, BB-06, BB-07 and BB-08; CI quality-gate Run #27 (35/35)` | `[none recorded]` | `[add final-SHA link to black-box evidence]` |
| FR-08 | Must | Enforce authenticated role-based access | `Implemented` | `1 provisional` | `INT-04 and RBAC test suite; CI quality-gate Run #27 (35/35)` | `CR-011: Staff/Admin cannot submit reports.` | `[add final-SHA link to INT-04 evidence]` |
| FR-09 | Should | Changed role/deactivation takes effect on next request; admin lifecycle capability if delivered | `Partially implemented` | `0.5 provisional` | `Next-request role re-check; CI quality-gate Run #27 (35/35)` | `CR-012; TD-13 retained.` | `[add final-SHA link to implemented-scope evidence]` |
| FR-10 | Could | Send notification after relevant status transition | `Deferred` | `0` | `[decision record]` | `[approved deferral]` | `[confirm whether applicable denominator]` |
| NFR-01 | Must | 50 concurrent POST requests for 15 s meet stated p95/error target | `[pending]` | `[0/0.5/1]` | `[two real performance outputs]` | `[load result]` | `[actual result]` |
| NFR-02 | Must | First-time usability task meets completion/steps target | `[pending]` | `[0/0.5/1]` | `[usability record]` | `[limitation]` | `[actual result]` |
| NFR-03 | Must | Enforce password complexity and secure hashing | `[pending]` | `[0/0.5/1]` | `[tests/code]` | `[reference]` | `[actual result]` |
| NFR-04 | Must | Meet stated availability/reliability acceptance criterion | `[pending]` | `[0/0.5/1]` | `[declared uptime window]` | `[partial/no-go if not sufficient]` | `[actual result]` |
| NFR-05 | Must | Validate and sanitise report data before persistence | `[pending]` | `[0/0.5/1]` | `[black-box tests]` | `[reference]` | `[actual result]` |
| NFR-06 | Must | At 100 users / 500 reports, response-time increase is <=20% | `Measurement pending` | `[0/0.5/1]` | `apps/api/prisma/seed-volume.ts is available via npm run seed:volume; baseline/volume measurements still required` | `TD-03 and TD-09 retained.` | `[run both measurements after final fixes]` |

## Calculation to complete after evidence is frozen

`Current provisional score = 10.5 / 16 = 65.625%`

`Applicable approved acceptance criteria = 16 [confirm whether deferred FR-10 remains in the approved denominator]`

`Scope Completion Percentage = (10.5 / 16) x 100 = 65.625% [recalculate after the outstanding NFR evidence is recorded]`

### Final conclusion

`The current provisional result does not meet the 80% target. NFR-01, NFR-02, NFR-04 and NFR-06 remain unmeasured; this is an evidence gap, not a failed test. Do not change their scores until final-SHA controlled evidence is attached. The post-measurement target described in PED v4.0 is 13.5 / 16 = 84.38%, subject to the recorded results.`
