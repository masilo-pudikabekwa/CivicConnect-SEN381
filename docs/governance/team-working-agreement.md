# Team Working Agreement (SEN381 Integrated Project)

### Team Members
1. **Phenyo Phooko (602218)** — Architecture & Technology Lead (Person 1)
2. **Dristen Erasmus Albertus Venter (601719)** — Data, Design & Implementation Lead (Person 2)
3. **Masilo Pudikabekwa (603037)** — Risk, Decisions, Governance & AI Management Lead (Person 3)

---

### 1. GitHub & Code Review Governance (ED-001)
* **Protected Main Branch**: Direct pushes to `main` are strictly prohibited. All changes must arrive via pull requests.
* **Mandatory Two-Reviewer Approval**: Every PR requires independent reviews and approvals from **both** other team members before merging. Self-approval is rejected.
* **Review Turnaround SLA**: Pull requests must be reviewed within **24 hours on weekdays**. Large PRs should be broken down to avoid blocking delivery (mitigating Risk R-011 and R-013).
* **Meaningful Peer Review**: Approvals must evaluate requirement alignment, test coverage, code structure, and security implications—rubber-stamping is prohibited.

---

### 2. Secrets & Configuration Management (R-007)
* Real passwords, database connection strings, and JWT signing keys must **never** be committed to Git.
* `.env` files must remain strictly developer-local and ignored by Git. Only `.env.example` templates may be tracked.

---

### 3. Responsible AI Engineering (Section 10)
* AI assistance is permitted as an engineering productivity tool, but all outputs must be independently tested and understood.
* Every material AI contribution must be logged in `docs/ai-usage/AI-Usage-Register.md` with verification details and issues found.
* *"AI generated it"* will never be used as an engineering defense.