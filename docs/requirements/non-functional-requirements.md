<!-- non-functional-requirements.md -->
# Non-Functional Requirements (NFRs)
NFRs are stated in measurable terms so they can be verified rather than assessed subjectively, consistent with ISO/IEC/IEEE 29148 guidance on requirements quality (ISO/IEC/IEEE, 2018).

| ID | Requirement | Source | Acceptance Criteria |
|---|---|---|---|
| NFR-01 | Performance: the system shall return a submission confirmation within 2 seconds for 95% of submissions under normal load (up to 50 concurrent users). | IN-01 / Quality constraint | Load test at 50 concurrent simulated users records 95th-percentile confirmation time <= 2 seconds. |
| NFR-02 | Usability: a first-time citizen user shall be able to complete and submit a basic report in 5 steps or fewer, unaided. | N01 / stakeholder conflict 1 | Usability test with representative participants: >=80% complete an unaided submission within 5 steps / 3 minutes. |
| NFR-03 | Security: account passwords shall meet a minimum complexity (>=8 characters, mixed case and a number) and be stored as a salted hash, never in plaintext. | N06 / stakeholder conflict 2 / FE-01 | Configuration/code review confirms salted hashing algorithm in use; registration with a non-compliant password is rejected. |
| NFR-04 | Availability: the core reporting workflow shall be available for at least 99% of scheduled operating hours during the evaluation period. | N05 (sponsor value) | Uptime log for the evaluation period shows >=99% availability. |
| NFR-05 | Data validation: all user-supplied input on the report form shall be validated (required fields, maximum length, permitted characters) before it is persisted. | N03 / quality constraint | Submitting invalid input (empty required field, over-length text, disallowed characters) is rejected with an explanatory message and no record is created. |
| NFR-06 | Scalability: the system shall support at least 100 registered users and 500 stored reports without more than a 20% increase in average response time. | N07 / cost-resource constraint | Volume test with 100 users / 500 reports shows response-time degradation <=20% versus baseline. |

# Constraints Analysis

| Category | Constraint | Engineering implication |
|---|---|---|
| Scope | The initial release deliberately excludes a native mobile application, direct integration with external municipal systems, and automated issue classification, in order to ship a stable core reporting and management capability first. | FRs and NFRs above are written in capability/behaviour terms rather than tied to a specific technology stack, so the requirements baseline does not lock in a platform or integration decision ahead of an architecture spike. |
| Schedule / Delivery | The organisation has committed to a phased release plan with a fixed go-live date for the initial pilot deployment to a partner municipality. | Requirements are prioritised (Must/Should/Could) so the Must set (FR-01–FR-05, FR-07, FR-08, all NFRs) is deliverable within the committed release window even if Should/Could items slip to a later release; full security hardening and penetration testing are scheduled for a pre-launch phase rather than attempted during initial development. |
| Budget / Infrastructure | Infrastructure spend for the pilot is capped until usage data justifies further investment; the platform must run on cost-efficient, managed hosting rather than a bespoke enterprise deployment. | NFR-04 and NFR-06 are set at pilot-scale targets (99% availability, 100 users / 500 reports) rather than enterprise-scale SLAs, with a defined path to re-provision infrastructure once real usage volumes are known. |
| Quality / Verifiability | Engineering standards require every requirement to be independently testable and traceable before it is accepted into a release baseline. | Every FR/NFR above carries a unique ID, a source, and measurable acceptance criteria; ambiguous or unverifiable requirements are rejected at review rather than passed to development. |
| Regulatory / Security | Reports may contain personal or location data about identifiable individuals, bringing the system into scope of data-protection obligations (e.g. POPIA or an equivalent data-protection regime). | Baseline authentication and role-based access (FR-07, FR-08, NFR-03) are mandatory from the first release, even though the full data-classification and retention model is deferred pending a formal privacy/legal review, consistent with OWASP baseline authentication guidance (OWASP Foundation, n.d.). |

## Trade-off / Ripple Effect
**Interaction identified:** the delivery-schedule constraint and the regulatory/security constraint interact directly. The committed go-live date does not allow time to complete a full data-classification and privacy review before the first release, so field-level access controls and retention rules (DEF-01) cannot ship in the initial version.

**Resulting trade-off:** the initial release commits only to coarse-grained protections, authentication (FR-07) and role-based access (FR-08, NFR-03), rather than granular data classification. This is treated as an accepted, time-boxed risk rather than an oversight, tracked in the Risk Register with an owner and a target remediation date.

**Ripple effect:** if the go-live date were to move, the security baseline could be hardened before release. Since the date is fixed, the fine-grained privacy/access model must instead ship as a fast-follow release, which carries its own downstream consequences: a migration plan is needed for any data already collected under the coarser model, and the risk owner must monitor for regulatory exposure during the interim period.

---

# Constraints Analysis

| Category | Constraint | Engineering implication |
|---|---|---|
| Scope | The initial release deliberately excludes a native mobile application, direct integration with external municipal systems, and automated issue classification, in order to ship a stable core reporting and management capability first. | FRs and NFRs above are written in capability/behaviour terms rather than tied to a specific technology stack, so the requirements baseline does not lock in a platform or integration decision ahead of an architecture spike. |
| Schedule / Delivery | The organisation has committed to a phased release plan with a fixed go-live date for the initial pilot deployment to a partner municipality. | Requirements are prioritised (Must/Should/Could) so the Must set (FR-01–FR-05, FR-07, FR-08, all NFRs) is deliverable within the committed release window even if Should/Could items slip to a later release; full security hardening and penetration testing are scheduled for a pre-launch phase rather than attempted during initial development. |
| Budget / Infrastructure | Infrastructure spend for the pilot is capped until usage data justifies further investment; the platform must run on cost-efficient, managed hosting rather than a bespoke enterprise deployment. | NFR-04 and NFR-06 are set at pilot-scale targets (99% availability, 100 users / 500 reports) rather than enterprise-scale SLAs, with a defined path to re-provision infrastructure once real usage volumes are known. |
| Quality / Verifiability | Engineering standards require every requirement to be independently testable and traceable before it is accepted into a release baseline. | Every FR/NFR above carries a unique ID, a source, and measurable acceptance criteria; ambiguous or unverifiable requirements are rejected at review rather than passed to development. |
| Regulatory / Security | Reports may contain personal or location data about identifiable individuals, bringing the system into scope of data-protection obligations (e.g. POPIA or an equivalent data-protection regime). | Baseline authentication and role-based access (FR-07, FR-08, NFR-03) are mandatory from the first release, even though the full data-classification and retention model is deferred pending a formal privacy/legal review, consistent with OWASP baseline authentication guidance (OWASP Foundation, n.d.). |

## Trade-off / Ripple Effect
**Interaction identified:** the delivery-schedule constraint and the regulatory/security constraint interact directly. The committed go-live date does not allow time to complete a full data-classification and privacy review before the first release, so field-level access controls and retention rules (DEF-01) cannot ship in the initial version.

**Resulting trade-off:** the initial release commits only to coarse-grained protections, authentication (FR-07) and role-based access (FR-08, NFR-03), rather than granular data classification. This is treated as an accepted, time-boxed risk rather than an oversight, tracked in the Risk Register with an owner and a target remediation date.

**Ripple effect:** if the go-live date were to move, the security baseline could be hardened before release. Since the date is fixed, the fine-grained privacy/access model must instead ship as a fast-follow release, which carries its own downstream consequences: a migration plan is needed for any data already collected under the coarser model, and the risk owner must monitor for regulatory exposure during the interim period.