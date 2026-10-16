# PED v3.0 — Section 8: Performance and Reliability

## 8.1 Performance question

M3 requires one small, justified performance/load exercise. The selected operation is `POST /api/v1/reports`, because it is on the citizen reporting path and directly relates to M2 requirement NFR-01.

The team plan specifies **50 concurrent connections for 15 seconds** using Autocannon. NFR-01 defines the acceptance target as the 95th-percentile submission confirmation time being **no more than 2 seconds** under normal load of up to 50 concurrent simulated users. The measured result must come from the actual run.

`GET /api/v1/health` can be used as a separate sanity check, but it is not a substitute for measuring report submission.

## 8.2 Test environment and workload

| Parameter | Required record |
|---|---|
| Candidate | Exact tag and commit SHA |
| Environment | Local simulated staging or hosted staging; do not conflate them |
| API target | Actual staging base URL, with secrets removed |
| Operation | `POST /api/v1/reports` |
| Concurrency | 50 connections |
| Duration | 15 seconds |
| Test data | Synthetic request body matching actual API contract |
| Authentication | Test-only account/token if required; never record the secret |
| Database | Staging database identity, credentials redacted |
| Tool | Autocannon version and actual script/command |
| Results | p95/other latency figures, throughput if available, successful responses, errors and timeouts |

Use a repeatable test script (the workload plan names `scripts/load-test.js`) and retain actual output or a machine-readable report in the team's evidence location. The script must match the real endpoint contract and must not embed live credentials.

## 8.3 Result interpretation

| Measure | Result |
|---|---|
| p95 response time | `[measured value in ms]` |
| NFR-01 target | `p95 <= 2,000 ms` |
| Successful responses | `[count and percentage]` |
| Failed responses / timeouts | `[count, percentage and status breakdown]` |
| Throughput | `[measured requests/second, if reported]` |
| Average / p50 / p99 / maximum latency | `[values reported by the tool]` |
| Test environment and duration | `[actual values]` |
| Acceptance | `[PASS / FAIL / BLOCKED]` |
| Evidence link | `[actual output/report/CI artifact]` |

Interpretation rules:
- If p95 is at or below 2,000 ms and request success/error behaviour is acceptable, the result supports NFR-01 for this workload and environment.
- If p95 exceeds 2,000 ms, or a meaningful proportion of submissions fail/time out, NFR-01 is not demonstrated; investigate and retest.
- Low latency with many failed requests is not a successful performance result.
- The team plan mentions local results below 100 ms as a possible defence point; do not report that as fact unless the captured run confirms it.

## 8.4 What the test proves—and does not prove

A successful run provides evidence about report-submission latency and request behaviour under the stated concurrency, duration, data and environment. It does **not** establish:
- multi-region or real-world network latency;
- capacity for a full municipality;
- M2 NFR-06 (100 registered users and 500 stored reports with no more than a 20% increase in average response time), unless that separate volume test is performed;
- long-term availability or the NFR-04 uptime target;
- performance of every dashboard/filter/admin operation;
- production email-provider behaviour or external dependency reliability;
- production readiness or absence of defects.

State staging hardware, database size, test data and network path because they affect interpretation. A local test that meets the target is evidence for that local test only.

## 8.5 Reliability and residual risk

Inspect failed requests/timeouts, API health, database connectivity and application logs during the run. If the tool/environment cannot collect resource metrics reliably, state that limitation rather than inventing CPU, memory or throughput measurements.

A possible residual risk—only if supported by evidence—is that the student staging environment cannot represent municipal production scale. Mitigation is to limit the M3 conclusion to the measured workload and require a representative load test before a real production release.

## 8.6 Current evidence status

**Performance result: pending actual execution.** The source project documents specify the workload and target but do not provide a verified run output in the materials used to prepare this fragment. Complete the result table only after executing the test against the identified candidate.

## References
- *CivicConnect PED v2.0 (M1 + M2)*, NFR-01 and NFR-06.
- *CivicConnect — Milestone 3 Team Workload Allocation Plan*, §§2.2–2.5 and 5.
- *SEN381 CivicConnect Milestone 3 Brief*, §13 and §16.
- Autocannon documentation: https://github.com/mcollina/autocannon
