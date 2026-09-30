<!-- rtm.md -->
# Requirements Traceability Matrix (RTM)

| Source (Stakeholder / Need) | Requirement ID | Priority | Acceptance Criteria (summary) | Future evidence (M2+) |
|---|---|---|---|---|
| S01 Citizens / N01 | FR-01 | Must | Confirmed submission with reference number | Design: wireframe; Test: TC-01 |
| S02 Civic Personnel / N03 | FR-02 | Must | Required fields enforced, missing fields flagged | Design: form schema; Test: TC-02 |
| S01 Citizens / N02 | FR-03 | Must | On-screen confirmation <=2s | Test: TC-03 (performance) |
| S01 Citizens / N02 | FR-04 | Must | Status + last-updated date retrievable | Design: status API; Test: TC-04 |
| S02 Civic Personnel / N04 | FR-05 | Must | Valid transitions only, timestamped | Design: state machine; Test: TC-05 |
| S02 Civic Personnel / N04 | FR-06 | Should | Filter/sort within 3s | Test: TC-06 |
| S01/S04 / N01, N06 | FR-07 | Must | Registration & login behave as specified | Design: auth flow; Test: TC-07 |
| S04 Administrators / N06 | FR-08 | Must | Non-authorised roles denied access | Test: TC-08 (access control) |
| S04 Administrators / N06 | FR-09 | Should | Role/status change takes effect next request | Test: TC-09 |
| S01 Citizens / N02 | FR-10 | Could | Email sent within 5 minutes of status change | Test: TC-10 |
| Quality constraint | NFR-01 to NFR-06 | Must | See Section 2 acceptance criteria | Test: load/usability/security test plans |

**End-to-end trace example (for the defence):** S01 (Citizens),  N01 (submit a civic issue through a clear process) , IN-01 (Person 1's in-scope reporting capability) , FR-01 (this section) , acceptance criteria