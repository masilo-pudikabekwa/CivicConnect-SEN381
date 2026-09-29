<!-- scope-baseline.md -->
# SCOPE BASELINE

## Scope Statement
CivicConnect will provide a controlled digital platform for the submission, management and tracking of civic issues. The M1 baseline includes the capabilities required to support the core stakeholder reporting and issue-management workflow while excluding additional functionality that is not necessary to satisfy the core objective or that requires evidence not yet available. Future capabilities may be considered through controlled change once their stakeholder value, resource implications, security implications and engineering feasibility have been evaluated.

## IN-SCOPE

| ID | Capability | Rationale |
|---|---|---|
| IN-01 | User issue reporting | Directly addresses the central citizen need |
| IN-02 | Capture of relevant issue information | Enables civic personnel to understand the reported issue |
| IN-03 | Issue status tracking | Provides visibility after submission |
| IN-04 | Issue management workflow | Allows responsible personnel to organize and manage reports |
| IN-05 | User/account handling appropriate to the core workflow | Supports controlled interaction with the system |
| IN-06 | Basic administrative functionality | Supports management and controlled operation |
| IN-07 | Appropriate confirmation/feedback to users | Addresses uncertainty after reporting |

## OUT-OF-SCOPE

| ID | Out-of-scope item | Reason |
|---|---|---|
| OUT-01 | Native mobile application | The M1 baseline focuses on establishing the core CivicConnect reporting and management capability without introducing a second application platform. |
| OUT-02 | Direct integration with external municipal systems | External interfaces, permissions and integration requirements have not yet been established. |
| OUT-03 | Advanced analytics and predictive reporting | These capabilities are not required to demonstrate the core civic issue reporting and management workflow. |
| OUT-04 | Automated/AI-based issue classification | Reliable representative data, accuracy criteria and security implications have not yet been established. |
| OUT-05 | Public/open publication of civic issue data | Privacy, data classification and governance implications require further investigation before this capability can be committed. |

## FUTURE SCOPE

| ID | Deferred capability | Why deferred | Evidence required before decision |
|---|---|---|---|
| DEF-01 | Native mobile application | Core objective can initially be addressed without committing to another platform | Usage evidence showing mobile-specific need and resource feasibility |
| DEF-02 | External municipal-system integration | Requires knowledge of external interfaces and organizational permissions | Confirmed integration requirements and interface documentation |
| DEF-03 | Advanced analytics | Not necessary for the core reporting workflow | Evidence of reporting/analytics needs and data volume |
| DEF-04 | Automated issue classification | Could reduce administrative effort but introduces additional accuracy/security concerns | Sufficient representative data and measurable performance criteria |
| DEF-05 | Public/open civic-data reporting | Potential transparency benefit, but privacy and governance implications need investigation | Data-classification and privacy analysis |

## THE ONE EXCLUSION TO DEFEND

**Decision**
A native mobile application is deliberately excluded from the M1 baseline.

**Reason**
The core CivicConnect business need is the structured reporting and management of civic issues. A separate mobile application is not necessary to establish that core capability and would expand the system boundary to an additional platform.

**Trade-off**
The exclusion reduces initial development and testing scope but means that mobile-specific capabilities are not committed at this stage.

**Why the decision is defensible**
The team should prioritize the capabilities that directly satisfy the highest-priority stakeholder needs. Introducing a second application platform before evidence establishes that it is necessary could consume resources and create additional maintenance and testing obligations without directly improving the core baseline.

**Reconsideration condition**
The decision should be reconsidered if evidence demonstrates that the browser-based baseline cannot adequately support the target user population or that mobile-specific access is a significant stakeholder requirement.