/**
 * ==============================================================================
 * API Version 1 Top-Level Composition Router
 *
 * Traceability:
 *   - ADR-ARCH-01: Modular Monolith API boundary
 *   - PED v2.0 Section 6.7: Versioned /api/v1 contract
 *
 * Design Intent:
 *   Mounts feature module routers under the versioned /api/v1 prefix.
 *   Keeps modules isolated while presenting a unified HTTP interface.
 * ==============================================================================
 */

import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { reportRouter } from "../modules/reports/report.routes.js";

export const apiV1Router = Router();

// Mount authentication and account routes
apiV1Router.use("/auth", authRouter);

// Mount civic issue reporting and workflow routes
apiV1Router.use("/reports", reportRouter);