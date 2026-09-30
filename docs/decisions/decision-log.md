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