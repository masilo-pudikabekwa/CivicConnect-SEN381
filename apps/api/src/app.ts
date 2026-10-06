import express from "express";
import helmet from "helmet";
import cors from "cors";
import { apiV1Router } from "./routes/apiV1.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { env } from "./config/env.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "100kb" }));

  // Operational health check (ASR-04)
  app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/v1", apiV1Router);
  app.use(errorHandler);

  return app;
}