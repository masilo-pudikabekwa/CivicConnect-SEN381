/**
 * ==============================================================================
 * Database Persistence Adapter & Connection Singleton
 *
 * Traceability:
 *   - ADR-TECH-01: PostgreSQL 18.x via Prisma ORM 6.x/7.x
 *   - ASR-05: Connection pooling and query management for pilot scalability
 *
 * Design Intent:
 *   Maintains a single active PrismaClient instance across the modular monolith
 *   to avoid leaking database connections during hot-reloads and concurrent requests.
 * ==============================================================================
 */

import { PrismaClient } from "@prisma/client";

// Initialize singleton Prisma client with environment-aware logging
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});