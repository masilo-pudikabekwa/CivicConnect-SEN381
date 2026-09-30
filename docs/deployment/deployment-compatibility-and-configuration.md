# Deployment Compatibility and Configuration Baseline

The M2 requirement is to anticipate deployment, not to over-implement production operations. The current direction is therefore provider-neutral: a static frontend build, one managed Node web service and one managed PostgreSQL database. This is enough to test deployment compatibility while avoiding an early lock-in to a particular hosting vendor or paid plan.

## Configuration model

| **Variable**                 | **Purpose**                                                            | **Example in .env.example**             | **Secret?**               | **Rule**                                                    |
|------------------------------|------------------------------------------------------------------------|-----------------------------------------|---------------------------|-------------------------------------------------------------|
| NODE_ENV                     | Runtime mode                                                           | development                             | No                        | Set per environment.                                        |
| PORT                         | Backend listen port                                                    | 3000                                    | No                        | Provider may override.                                      |
| DATABASE_URL                 | PostgreSQL connection string                                           | postgresql://USER:PASSWORD@HOST:5432/DB | Yes                       | Never commit a real value. Inject locally/deployment-side.  |
| FRONTEND_ORIGIN              | Allowed browser origin for CORS                                        | http://localhost:5173                   | No / environment-specific | Use an allow-list, not \* with credentials.                 |
| AUTH_SECRET / SESSION_SECRET | Cryptographic signing/session secret depending on final auth mechanism | replace-me                              | Yes                       | Generate a strong value outside source control.             |
| LOG_LEVEL                    | Runtime logging level                                                  | info                                    | No                        | Do not log passwords, secrets or unnecessary personal data. |

A committed .env.example contains variable names and safe placeholders only. A real .env is developer-local and ignored by Git. Production/staging secrets are injected by the hosting platform or another approved secret store. This follows the same separation-of-config principle described by the Twelve-Factor App and supports the M1 secrets-management risk control.

## Availability, scaling and database SPOF implications

The selected design has two main runtime dependencies: the Node service and PostgreSQL. This is acceptable for the pilot, but it must be documented rather than ignored. The database is the main persistent-state SPOF. A managed database with provider backups is preferred; restore testing and exact retention remain later operational decisions. The Node API should remain stateless apart from the database so another instance can be added later if the pilot exceeds NFR-06.

For report lists, use pagination and indexes on likely access paths such as status, category, submittedAt and citizen/user ID after Person 2 confirms the schema and actual queries. Do not add Redis/cache at M2 unless measurement shows it is needed; it would add another stateful dependency without current evidence.
