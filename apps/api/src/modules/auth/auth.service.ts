import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { env } from "../../config/env.js";

export class AuthService {
  async register(email: string, passwordPlain: string, name?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("An account with this email address already exists");
    }

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

  async login(email: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

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