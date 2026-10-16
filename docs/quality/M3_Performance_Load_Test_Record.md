# M3 Performance / Load Test — Execution Record

> Complete this record only after running the test. Keep raw output or the CI artifact in the team's controlled evidence location and link it below.

## 1. Test identity

| Field | Actual value |
|---|---|
| Test ID | `PERF-M3-01` |
| Requirement | `NFR-01` |
| Operation | `POST /api/v1/reports` |
| Candidate tag | `[actual tag]` |
| Candidate commit SHA | `[actual SHA]` |
| Environment | `[local simulated staging / hosted staging]` |
| Autocannon version | `[actual version]` |
| Script path | `scripts/load-test.js` if this is the actual committed path |
| Run date/time | `[actual date/time and timezone]` |
| Executed by | `[actual name/role]` |
| Raw output/report | `[actual artifact link]` |

## 2. Workload definition

The team plan specifies 50 concurrent connections over 15 seconds. Confirm these parameters in the script and record any justified difference.

| Parameter | Planned setting | Actual setting |
|---|---|---|
| Concurrency | 50 | `[value]` |
| Duration | 15 seconds | `[value]` |
| Target | Staging `POST /api/v1/reports` | `[redacted target URL]` |
| Request body | Synthetic data matching real API schema | `[brief description; no personal data]` |
| Authentication | Test-only credentials if required | `[method only; do not include token]` |
| Database | Isolated staging database | `[confirm identity without credentials]` |
| Warm-up/repeat policy | Document what was done | `[actual details]` |

## 3. Results

| Metric | Measured value |
|---|---|
| Total requests | `[value]` |
| Successful responses | `[count and percentage]` |
| Failed responses | `[count and percentage]` |
| Timeouts | `[count]` |
| p50 latency | `[ms]` |
| p95 latency | `[ms]` |
| p99 latency | `[ms]` |
| Maximum latency | `[ms]` |
| Average latency | `[ms]` |
| Throughput / requests per second | `[value, if available]` |
| HTTP status distribution | `[actual counts]` |

## 4. Acceptance decision

**NFR-01 target:** 95th-percentile submission confirmation time `<= 2,000 ms` under normal load up to 50 concurrent simulated users.

- [ ] **PASS** — p95 is within target and success/error behaviour is acceptable.
- [ ] **FAIL** — p95 exceeds target or failures invalidate the result.
- [ ] **BLOCKED** — test could not run or evidence is insufficient.

**Reasoning:** `[explain how measurements support the selected status]`

**Limitations:** `[environment, data volume, authentication, network, duration or tool limitations]`

**Follow-up / retest:** `[action, owner and date, or reason no retest is required]`

## 5. Interpretation checklist

- [ ] Tested commit matches the candidate referenced in the PED.
- [ ] Endpoint and payload match the actual API contract.
- [ ] Workload was 50 concurrent connections for 15 seconds, or deviation is explained.
- [ ] p95 and success/error behaviour are both interpreted.
- [ ] Output is retained and linked.
- [ ] Conclusion is limited to this operation, workload and environment.
- [ ] No result is claimed for NFR-06, NFR-04 or municipal production scale without separate evidence.

## References
- *CivicConnect PED v2.0 (M1 + M2)*, NFR-01 and NFR-06.
- *CivicConnect — Milestone 3 Team Workload Allocation Plan*, §§2.3 and 5.
- *SEN381 CivicConnect Milestone 3 Brief*, §13.
- Autocannon documentation: https://github.com/mcollina/autocannon
