/**
 * ==============================================================================
 * Configuration Boundary & Environment Validation
 *
 * Traceability:
 *   - ADR-DEPLOY-01: Provider-neutral configuration via environment variables
 *   - Risk R-007 / FE-06: Strict separation of secrets from version control
 *
 * Design Intent:
 *   Uses Zod to validate all required environment variables at process startup.
 *   Fails fast with descriptive errors if secrets or connection URLs are missing.
 * ==============================================================================
 */

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required for PostgreSQL persistence"),
  FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters for security")
});

export const env = envSchema.parse(process.env);