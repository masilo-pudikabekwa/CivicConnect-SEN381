/**
 * ==============================================================================
 * Backend Server Entry Point & Process Bootstrap
 *
 * Traceability:
 *   - ADR-ARCH-01: Modular Monolith API process
 *   - ASR-04: High availability and deployment simplicity
 *
 * Design Intent:
 *   Separates HTTP process listening from the Express application composition root
 *   (defined in app.ts). This enables integration and API tests (Supertest) to import
 *   and test the application without binding to a physical network port.
 * ==============================================================================
 */

import { createApp } from "./app.js";
import { env } from "./config/env.js";

// Instantiate the configured Express composition root
const app = createApp();

// Start the HTTP server on the validated port (default 3000)
app.listen(env.PORT, () => {
  console.log(`[CivicConnect Modular Monolith] running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});