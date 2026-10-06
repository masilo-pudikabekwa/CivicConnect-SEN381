import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
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

  if (err instanceof Error) {
    if (err.message.includes("not found")) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
      return;
    }
    if (err.message.includes("Invalid status transition")) {
      res.status(422).json({ error: { code: "INVALID_TRANSITION", message: err.message } });
      return;
    }
    if (err.message.includes("Forbidden") || err.message.includes("Unauthorized")) {
      res.status(403).json({ error: { code: "FORBIDDEN", message: err.message } });
      return;
    }
    if (err.message.includes("already exists")) {
      res.status(409).json({ error: { code: "CONFLICT", message: err.message } });
      return;
    }
  }

  console.error("Unhandled internal server error:", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred"
    }
  });
}