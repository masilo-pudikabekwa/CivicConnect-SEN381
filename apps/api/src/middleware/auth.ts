/**
 * ==============================================================================
 * Authentication & Role-Based Access Control (RBAC) Middleware
 *
 * Traceability:
 *   - FR-07: User authentication before accessing protected workflows
 *   - FR-08: Role-based authorization (CITIZEN, PERSONNEL, ADMIN)
 *   - FR-09: Re-queries user state from DB so role changes take immediate effect
 *   - ASR-01: Backend-enforced authorization; client tokens are never blindly trusted
 * ==============================================================================
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: "CITIZEN" | "PERSONNEL" | "ADMIN";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Validates the JWT bearer token and attaches the authenticated user to the request.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Bearer token required" } });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.AUTH_SECRET) as { sub: string };

    // Critical for FR-09: Query live user record so role or deactivation takes effect immediately
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Account inactive or no longer exists" } });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } });
  }
}

/**
 * Guards routes by checking if the authenticated user possesses one of the required roles (FR-08).
 */
export function requireRole(...roles: Array<"CITIZEN" | "PERSONNEL" | "ADMIN">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: { code: "FORBIDDEN", message: "Insufficient permissions for this action" } });
      return;
    }
    next();
  };
}