/**
 * ==============================================================================
 * Authentication & Account Domain Service
 *
 * Traceability:
 *   - FR-07: Account registration and login credential verification
 *   - NFR-03 / ASR-01: Passwords salted and hashed with bcrypt/Argon2id (never plaintext)
 *   - Indicative Defense Q1: Traceability from stakeholder security need to implementation
 * ==============================================================================
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { env } from "../../config/env.js";

export class AuthService {
  /**
   * Registers a new citizen account with salted password hashing (FR-07, NFR-03).
   */
  async register(email: string, passwordPlain: string, name?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("An account with this email address already exists");
    }

    // Hash password with salt cost factor 10 (OWASP guidance & NFR-03)
    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    return prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: Role.CITIZEN
      },
      select: { id: true, email: true, role: true, createdAt: true }
    });
  }

  /**
   * Verifies credentials and generates a signed JWT session token (FR-07).
   */
  async login(email: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      // Generic error prevents username enumeration attacks (ASR-01)
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    // Issue cryptographic token signed with AUTH_SECRET
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      env.AUTH_SECRET,
      { expiresIn: "8h" }
    );

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    };
  }
}

export const authService = new AuthService();