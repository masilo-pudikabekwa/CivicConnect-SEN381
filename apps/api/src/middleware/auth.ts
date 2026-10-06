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

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Bearer token required" } });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.AUTH_SECRET) as { sub: string };

    // Satisfies FR-09: Role/account state re-queried on every authenticated request
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Account inactive or missing" } });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } });
  }
}

export function requireRole(...roles: Array<"CITIZEN" | "PERSONNEL" | "ADMIN">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: { code: "FORBIDDEN", message: "Access denied for current user role" } });
      return;
    }
    next();
  };
}