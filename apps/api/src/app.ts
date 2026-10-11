/**
 * ==============================================================================
 * Express 5 Composition Root
 *
 * Traceability:
 *   - ADR-ARCH-01: Modular Monolith API boundary
 *   - ASR-01 / ASR-04: Security headers (Helmet), CORS restriction, health endpoint
 *
 * Design Intent:
 *   Assembles all cross-cutting middleware, mounts versioned routers (/api/v1),
 *   and registers the central error handler. Excludes port listening for testability.
 * ==============================================================================
 */

import express from "express";
import helmet from "helmet";
import cors from "cors";
import { apiV1Router } from "./routes/apiV1.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { env } from "./config/env.js";

export function createApp() {
  const app = express();

  // Prevent framework fingerprinting
  app.disable("x-powered-by");

  // Secure HTTP headers
  app.use(helmet());

  // CORS allow-list restricted to approved frontend origin
  app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));

  // Strict JSON body size limit preventing DoS payloads (ASR-01)
  app.use(express.json({ limit: "100kb" }));

  // Browser-friendly root summary route
  app.get("/", (_req, res) => {
    res.status(200).json({
      name: "CivicConnect API (Modular Monolith)",
      version: "2.0.0",
      status: "running",
      endpoints: {
        health: "/api/v1/health",
        api: "/api/v1"
      },
      frontendUrl: env.FRONTEND_ORIGIN
    });
  });

  // Operational health check required for deployment monitoring (ASR-04)
  app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Main /api/v1 router boundary
  app.use("/api/v1", apiV1Router);

  // Central error handling middleware
  app.use(errorHandler);

  return app;
}