# CivicConnect - security

**FE-01) Security and Privacy**
* **Why this matters now:** 
CivicConnect will process information submitted by community members and may contain information that should not be visible to all users. The stakeholder conflict between transparency and information protection therefore needs to influence the M1 baseline before detailed requirements and system design are finalized.
* **Later engineering decision/activity influenced:** 
This consideration will influence access-control requirements, information classification, privacy requirements, authentication and authorization decisions, interface behavior and security verification.
* **Information still required:** 
The project still requires confirmation of the types of information that will be collected, who should be able to access different information, and what privacy or organizational rules apply.
* **Risk if ignored:** 
If security and privacy are considered too late, the system may require significant redesign of requirements, data handling and access controls, or may expose information to inappropriate users.

**FE-02) Testability of the Core Reporting Workflow**
* **Why this matters now:** 
The core CivicConnect workflow involves submitting an issue, capturing sufficient information, receiving confirmation, tracking status and enabling responsible personnel to manage the issue. These activities must be defined clearly enough to be verified later.
* **Later engineering decision/activity influenced:** 
This will influence functional requirements, acceptance criteria, validation rules, test-case design and later verification activities.
* **Information still required:** 
The project still needs agreement on the exact minimum information required for an issue report, valid status transitions and measurable acceptance conditions for the core workflow.
* **Risk if ignored:** 
If the workflow is not defined in a testable way, the team may be unable to determine objectively whether the system satisfies stakeholder needs, resulting in ambiguous requirements, inconsistent testing and possible rework.