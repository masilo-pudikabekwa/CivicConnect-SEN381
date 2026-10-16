/**
 * ==============================================================================
 * Centralized HTTP Error Handling Middleware
 *
 * Traceability:
 *   - ASR-02 / FE-03: Uniform error structure prevents internal details leaking
 *   - NFR-05: Maps Zod validation failures to a standard 400 Bad Request
 *
 * Design Intent:
 *   Intercepts all thrown exceptions and maps them to a predictable client shape:
 *   { error: { code: string, message: string, details?: any } }
 *   Ensures stack traces are suppressed in production.
 * ==============================================================================
 */

import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Handle request validation errors from Zod schemas (NFR-05)
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      }
    });
    return;
  }

  // Handle known domain and business rule errors
  if (err instanceof Error) {
    if (err.message.includes("not found")) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
      return;
    }
    // Rejected lifecycle transition (FR-05)
    if (err.message.includes("Invalid status transition")) {
      res.status(422).json({ error: { code: "INVALID_TRANSITION", message: err.message } });
      return;
    }

    // Failed login (FR-07): generic message by design, matched exactly
    if (err.message === "Invalid email or password") {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: err.message } });
      return;
    }
    
    // Access control or ownership check failed (FR-08)
    if (err.message.includes("Forbidden") || err.message.includes("Unauthorized")) {
      res.status(403).json({ error: { code: "FORBIDDEN", message: err.message } });
      return;
    }
    if (err.message.includes("already exists")) {
      res.status(409).json({ error: { code: "CONFLICT", message: err.message } });
      return;
    }
  }

  // Fallback for unexpected internal errors
  console.error("Unhandled internal server error:", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected internal server error occurred"
    }
  });
}