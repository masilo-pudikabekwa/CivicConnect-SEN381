<!-- decision-log.md -->
# Engineering Decision log
Rule: Only genuine decisions already made are recorded as "Decided." Where evidence is not yet sufficient, the decision is recorded as "Deferred" with reason and the evidence is still required. This log uses an Architecture Decision Record (ADR) structure to systematically capture context, alternatives, and trade-offs (Nygard, 2011).

## Index

| Engineering Decision ID | Title | Status | Date |
|---|---|---|---|
| ED-001 | Branch protection and PR review model for main branch | Decided | 2026-09-08 |
| ED-002 | Technology stack selection | Closed / Replaced by ADR-TECH-01 | 2026-09-09 |
| ED-003 | Detailed privacy/access-control model | Deferred to Milestone 2 | 2026-09-09 |
| ADR-ARCH-01 | SPA + modular monolith API | Proposed | 2026-09-30 |
| ADR-TECH-01 | React/TypeScript + Node/Express + PostgreSQL | Proposed | 2026-09-30 |
| ADR-DEPLOY-01 | Provider-neutral PaaS deployment direction | Proposed | 2026-09-30 |
| ADR-DESIGN-01 | Adopt Strategy and Observer Patterns | Proposed | 2026-09-30 |
| ADR-PERSISTENCE-01 | Application-layer Transactions and Optimistic Concurrency | Proposed | 2026-09-30 |
| ADR-INTEGRATION-01 | Asynchronous Dispatch for Notifications | Proposed | 2026-09-30 |

## ED-001: Branch protection and PR review model for main branch
| Field | Detail |
|---|---|
| Context | Master Project Brief mandates a protected main branch with a 2 reviewer approval model and requires GitHub governance to be operational from the start of Milestone 1. |
| Constraints | Team of 3 <br> Every pull request needs the 2 other members to review before merge. <br> GitHub Free only allows branch protection when repository is public. |
| Alternatives | Single reviewer approval <br> No branch protection |
| Decision | Adopted protected main, min 2 approvals excluding the author, bypass disabled. |
| Rationale | Directly satisfies the Master Brief's 2 reviewer control requirement; removes any single-person unreviewed merge path; produces auditable pull request history as required governance evidence, consistent with high-performance code review practices (Forsgren, et al., 2018). |
| Trade-offs | Slower merge velocity on a 3-person team every PR blocks on both other members reviewing. Governance files (.gitignore, PR template) had to go through this same flow, which is itself the team's first evidence of the review workflow. |
| Risks | Reviewer availability becomes a bottleneck if a teammate is unreachable near a deadline(R-011) |
| Evidence | Repo Settings → Branches ruleset screenshot; first merged PR showing 2 approvals. |
| Later consequence | Every substantive change in docs, config, and eventually application code all routes through this same pull request + 2-person review flow for the rest of the project. This affects M2–M4 velocity planning. |

## ED-002: Technology stack selection
| Field | Detail |
|---|---|
| Context | CivicConnect will need a confirmed technology stack. |
| Constraints | Stack choice must be justified against baselined requirements/NFRs (Driston's FR-01 to FR-10, NFR-01 to NFR-06), which are now drafted but not yet formally baselined/signed off. |
| Alternatives | Formally defer to M2 with documented rationale. |
| Decision | **Closed / Replaced by ADR-TECH-01** |
| Rationale | Master Project Brief (M1 boundaries) explicitly excludes final technology-stack selection from M1's required outputs. Deciding now would risk constraining architecture before the requirements baseline is signed off — the exact premature-decision risk the milestone gate exists to prevent. |
| Trade-offs | M2 will need dedicated time for a weighted decision matrix / ADR against the now-confirmed NFRs (e.g. NFR-01 performance, NFR-04 availability, NFR-06 scalability). |
| Risks | Left too late, it compresses the M2 timeline. |
| Evidence | |
| Later consequence | Requires a formal ADR at M2 (architecture/technology/persistence/integration choices need the full ADR treatment). |

## ED-003: Detailed privacy/access-control model
| Field | Detail |
|---|---|
| Context | |
| Constraints | |
| Alternatives | |
| Decision | Deferred to Milestone 2. |
| Rationale | Committing to a detailed access model before data classification is confirmed risks the same premature-decision problem as ED-002, and falls outside M1's boundary on detailed security implementation. |
| Trade-offs | FE-01 (Security and Privacy) stays partially open until this is resolved. NFR-03 alone is not sufficient to demonstrate the access control claims an assessor may probe. |
| Risks | If deferred too long, exposes report data to inappropriate users, or forces late redesign of FR-08's role model. |
| Evidence | This log entry <br> Phenyo’s stakeholder conflict and FE-01 <br> Driston’s NFR-03. |
| Later consequence | Feeds directly into FE-01 and NFR-03 hardening at M2, it requires an ADR once the model is chosen. |

## ADR-ARCH-01: Use SPA + modular monolith API
| Field | Detail |
|---|---|
| Context | CivicConnect must support one core browser-based reporting/management workflow, three user roles, measurable performance/availability, and a three-person development team. Native mobile, external municipal integration, and AI classification are outside the M1 baseline. |
| Constraints | Three-person development team, measurable performance/availability. |
| Alternatives | Single server-rendered monolith; SPA + modular monolith API; SPA + microservices. |
| Decision | Select a React SPA plus one modular Node/Express API and one PostgreSQL database. |
| Rationale | The selected option gives clear module boundaries and a testable HTTP interface without the operational cost and extra failure modes of microservices. It fits the pilot scale and team capability while leaving room to extract a module later if evidence later justifies it. |
| Trade-offs | Two build targets and an API contract must be maintained. The backend and database remain shared runtime dependencies. |
| Risks |  |
| Evidence |  |
| Later consequence | Repository structure must reflect module boundaries. New service extraction requires a later ADR and evidence. Diagrams/RTM use these boundaries. |

## ADR-TECH-01: Select React/TypeScript + Node/Express + PostgreSQL
| Field | Detail |
|---|---|
| Context | M1 deferred technology choice and recorded a high learning risk for a full ASP.NET Core/PostgreSQL alternative. The team already has Node/Express/MongoDB experience, but M2 now needs an integrity-focused persistence baseline. |
| Constraints | M2 requires an integrity-focused persistence baseline. |
| Alternatives | React + Node/Express + MongoDB; React + ASP.NET Core + PostgreSQL; React + Node/Express + PostgreSQL. |
| Decision | Use React 19.x + TypeScript 6.0, Node 24 LTS + Express 5.x, PostgreSQL 18.x and Prisma ORM 7.x. |
| Rationale | The hybrid keeps the familiar backend runtime/framework, reducing schedule risk, while PostgreSQL supplies relational constraints/transactions that fit users, roles, reports and workflow state. All major components are mainstream, open-source and deployable on common managed platforms. |
| Trade-offs | The team must learn PostgreSQL/Prisma conventions and cannot rely on MongoDB patterns. Exact dependency versions require lockfile maintenance and security updates. |
| Risks | PostgreSQL/Prisma is new to the team (R-003). |
| Evidence |  |
| Later consequence | README, package files, migrations and deployment configuration must use this stack. Any major stack replacement after baseline requires controlled change. |

## ADR-DEPLOY-01: Provider-neutral PaaS deployment direction
| Field | Detail |
|---|---|
| Context | M1 raised late-hosting and operational-cost risks, while M2 requires deployment compatibility but not production deployment. |
| Constraints | Budget/cost constraint. |
| Alternatives | Vendor-specific architecture now; Self-managed VM; Provider-neutral managed web service + managed PostgreSQL. |
| Decision | Use a provider-neutral deployment model: static frontend host, managed Node web service, and managed PostgreSQL. Select the exact vendor/plan later using current cost and availability evidence. |
| Rationale | This demonstrates deployability without hard-wiring business code to one cloud provider. It supports the cost constraint and keeps the deployment decision reversible. |
| Trade-offs | Some provider-specific configuration will still exist at deployment time. Free-tier limits and backup/availability guarantees must be checked when the team actually chooses the service. |
| Risks | Free-tier limits and backup guarantees must be checked when selecting the service. |
| Evidence |  |
| Later consequence | Use environment-based configuration, no secrets in repository, and record vendor selection as a later decision if it materially affects cost/availability. |

## ADR-DESIGN-01: Adopt Strategy and Observer Patterns
| Field | Detail |
|---|---|
| Context | CivicConnect handles distinct request categories (facility faults, IT support, security concerns) with different routing rules, and ticket status changes require alerting citizens, staff, and audit logs without tightly coupling the core `RequestService`. |
| Constraints | OCP, DIP, Decoupling. |
| Alternatives | Request Category Handling: Strategy Pattern vs. Factory Method Pattern. Status Notifications: Observer Pattern vs. Mediator Pattern. |
| Decision | Use the Strategy pattern to encapsulate request-processing rules per category behind an interface. Use the Observer pattern with a notification interface for status-change updates. |
| Rationale | Categories share the same core entity shape but vary in validation and routing behavior, directly addressing the OCP; Factory Method is rejected as object-graph complexity is low. Observer removes tight coupling to downstream notification consumers without introducing the central coordination complexity of a Mediator. |
| Trade-offs | Strategy may cause interface bloat if categories do not significantly differ. Observer introduces hidden control flows, requiring developers to trace registered observers. |
| Risks | Over-engineering if categories don't differ much. |
| Evidence |  |
| Later consequence | Inform M2 architecture/design decisions and record an ADR once the team commits. |

## ADR-PERSISTENCE-01: Application-layer Transactions and Optimistic Concurrency
| Field | Detail |
|---|---|
| Context | FR-05 (civic-personnel status transition) requires updating a report's status and logging a history/audit entry. Doing one without the other breaks traceability. Concurrency control is required for multi-user editing. |
| Constraints | Low contention expected at pilot scale (NFR-06). |
| Alternatives | Application-layer transaction (optimistic concurrency); DB-enforced transition via stored procedures/triggers (pessimistic locking). |
| Decision | Adopt an application-layer transaction wrapping the status update and audit insert. Enforce rules at the service layer, backed by a DB CHECK constraint, and use optimistic concurrency. |
| Rationale | This matches the team's Node.js/Express expertise, satisfies NFR-06 pilot-scale (low contention) metrics, and keeps business logic testable within the application. |
| Trade-offs | Second writers will fail fast during conflicts and must retry. |
| Risks | Conflicting writes. |
| Evidence |  |
| Later consequence | Inform the persistence/technology-stack ADR (feeding ED-002) and RTM. |

## ADR-INTEGRATION-01: Asynchronous Dispatch for Notifications
| Field | Detail |
|---|---|
| Context | FR-10 defines an email status-change notification. FR-10 is a "Could" priority, but NFR-01 is a "Must" requiring a 2-second confirmation target. |
| Constraints | NFR-01 performance target. |
| Alternatives | Synchronous call in the request path; Asynchronous, decoupled dispatch. |
| Decision | Implement asynchronous, decoupled dispatch for the email status-change notification. |
| Rationale | A synchronous call couples core application performance (NFR-01) to third-party availability. Asynchronous dispatch keeps these concerns separate while comfortably satisfying the 5-minute delivery window outlined in FR-10. |
| Trade-offs |  |
| Risks | Future dependency on a third-party notification channel (R-008). |
| Evidence |  |
| Later consequence | Informs notification-integration ADR and R-008. |