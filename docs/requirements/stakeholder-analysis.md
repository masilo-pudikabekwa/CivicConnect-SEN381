<!-- stakeholder-analysis.md -->
SEN381 - CivicConnect
Milestone 1

Phenyo Phooko 602218
Masilo Pudikabekwa 603037
Dristen Erasmus Albertus Venter 601719

# Problem and Business Need

## Problem Statement
CivicConnect is intended to address the difficulty that community members experience when attempting to communicate local issues and civic concerns to the appropriate responsible parties. In a fragmented reporting environment, citizens may lack a clear and consistent mechanism through which issues can be submitted, monitored and followed up. This can result in poor visibility of outstanding issues, inefficient communication between community members and responsible personnel, and uncertainty regarding whether reported matters have been acknowledged or addressed.

The business need is therefore for a centralized civic-engagement platform that provides a structured channel for reporting community issues and enables relevant stakeholders to manage and track those reports. The value of CivicConnect is not merely the provision of another software interface, but the creation of a more transparent and structured information flow between people identifying community issues and the parties responsible for responding to them.

This problem is treated as the starting point for engineering decisions because stakeholder expectations and needs should be established before they are translated into detailed system requirements and later design decisions (NASA, 2023). The M1 baseline consequently focuses on defining what problem CivicConnect must address and for whom, while avoiding premature commitment to a particular technology or architecture.

## Value area

| Current problem | Intended CivicConnect value |
|---|---|
| Citizen engagement | Citizens may not have one consistent channel for communicating issues | A structured mechanism for submitting civic concerns |
| Transparency | Citizens may have limited visibility of what happens after reporting | Greater visibility of report status and progress |
| Operational coordination | Reports may be difficult to organize and prioritize | Centralized information for responsible personnel |
| Accountability | It may be unclear whether issues have been acknowledged or acted upon | Improved traceability of reported issues |
| Information management | Information can become fragmented across communication channels | A consistent record of submitted civic issues |

# Business Need and Intended Value

## Business-value argument
CivicConnect should therefore create value at two levels.
For citizens, it should reduce friction in reporting issues and provide greater visibility into what happens after a report is submitted.
For responsible organizations or personnel, it should provide structured, centralized information that can be used to organize and manage reported issues.

The distinction is important because successful software engineering must balance stakeholder needs rather than treating the system as a collection of technical features. The M1 brief explicitly expects the project to connect stakeholder needs to scope and later requirements rather than simply describing the software. 

Problem → Need → System Value

# Stakeholder Register

| ID | Stakeholder | Role | Primary needs / expectations | Influence | Interest |
|---|---|---|---|---|---|
| S01 | Citizens / Community Members | Primary users who report civic issues | Simple reporting, understandable process, feedback/status visibility | Medium | High |
| S02 | Civic/Administrative Personnel | Receive, review and manage reported issues | Structured reports, sufficient information, prioritization and workflow visibility | High | High |
| S03 | Project Sponsor / Client | Owns the business problem and project outcome | System addresses business objectives and remains within agreed scope | High | High |
| S04 | System Administrators | Maintain user/system information and operational controls | Reliable administration, controlled access and manageable system behavior | High | Medium |
| S05 | Community / Local Organizations | Indirectly affected by reported issues and outcomes | Visibility of relevant community concerns and effective resolution processes | Medium | Medium |
| S06 | Development Team | Designs and constructs the system | Clear scope, stable requirements and achievable engineering commitments | High | High |

# Stakeholder Needs

| ID | Stakeholder | Need | Implication for CivicConnect |
|---|---|---|---|
| N01 | Citizens | Submit civic issues through a clear and understandable process | Reporting capability |
| N02 | Citizens | Know whether a submitted issue has been received and what its status is | Status visibility |
| N03 | Civic Personnel | Receive sufficiently structured issue information | Structured reporting |
| N04 | Civic Personnel | Manage and monitor reported issues | Management workflow |
| N05 | Sponsor / Client | Demonstrable business value from the system | Core workflow must directly address civic reporting |
| N06 | Administrators | Control system information and access appropriately | Administrative capabilities |
| N07 | Development Team | Stable and achievable project boundaries | Explicit scope baseline |

# Power / Interest Analysis

| | HIGH INTEREST | LOW INTEREST |
|---|---|---|
| **HIGH POWER** | Manage Closely <br> Project Sponsor / Client <br> Civic/Administrative Personnel <br> System Administrators | Keep Satisfied <br> Relevant organizational management |
| **LOW POWER** | Keep Informed <br> Citizens / Community Members <br> Community Organizations | Monitor <br> Indirect stakeholders |

## Justification

**Project Client - High Power / High Interest**
The sponsor can influence scope and project success while having a direct interest in the business outcome.

**Civic/Administrative Personnel - High Power / High Interest**
These stakeholders influence how reported issues will be processed and are directly affected by the system's operational usefulness.

**Citizens - Lower Power / High Interest**
Citizens are central to the problem and have a strong interest in the system, but an individual citizen has comparatively limited authority over project scope.

**Community Organizations - Medium/Lower Power / Medium Interest**
They may be affected by civic issues and outcomes without having direct control over development decisions.

PMI's stakeholder-management guidance supports analyzing stakeholders according to their influence/power and interest so that management attention can be prioritized appropriately.

# Stakeholder Conflicts

| Stakeholder | Expectation |
|---|---|
| Citizens | Fast and simple reporting process |
| Civic personnel | Detailed information sufficient to understand and process the issue |

**Engineering conflict**
A shorter reporting process improves user participation and reduces friction, but insufficient information can make reported issues difficult to classify or action.

**Decision**
The M1 baseline should therefore include the minimum information needed to support the core reporting workflow, rather than attempting to collect every potentially useful piece of information.

**Downstream consequence**
This decision will later influence:
functional requirements; 
acceptance criteria; 
interface design; 
data requirements; 
validation rules.

## Stakeholder Conflict 2 - Transparency Vs Security

| Stakeholder | Expectation |
|---|---|
| Citizens | Visibility of issue status and progress |
| Individuals | Appropriate protection of information |

**Engineering conflict**
Greater transparency can improve accountability, but exposing too much information could create privacy or security risks.

**Decision**
The baseline should support appropriate status visibility without assuming that every piece of report information should be publicly visible.

**Downstream consequence**
This will influence later:
access-control requirements; 
information-classification decisions; 
privacy requirements; 
interface behavior; 
security testing. 

NIST's Privacy Framework provides a recognized risk-management approach for identifying and managing privacy risk in systems that process information about people.

# Stakeholder-to-Scope Traceability

| Stakeholder | Need | Resulting scope decision | Requirement ownership |
|---|---|---|---|
| Citizens | N01 – submit issue | IN-01 Reporting | Person 2 |
| Citizens | N02 – track status | IN-02 Status visibility | Person 2 |
| Civic personnel | N03 – structured information | IN-03 Structured report handling | Person 2 |
| Civic personnel | N04 – manage issues | IN-04 Issue management | Person 2 |
| Administrators | N06 – controlled administration | IN-05 Administration | Person 2 |
| Citizens / administrators | Privacy/security | DEF-01 Detailed privacy/access model | Person 2 + Person 3 |