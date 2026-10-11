/**
 * ==============================================================================
 * Authentication HTTP Controller & Transport Adapter
 *
 * Traceability:
 *   - FR-07: Account registration and login
 *   - NFR-03: Password complexity validation (min 8 chars, 1 uppercase, 1 digit)
 * ==============================================================================
 */

import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authService } from "./auth.service.js";

// Password complexity schema enforcing NFR-03
const registerSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[0-9]/, "Password must contain at least 1 number"),
  name: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const authController = {
  /**
   * Handles POST /api/v1/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = registerSchema.parse(req.body);
      const user = await authService.register(email, password, name);
      res.status(201).json({ data: user });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Handles POST /api/v1/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.login(email, password);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Handles GET /api/v1/auth/me (returns current authenticated session)
   */
  async me(req: Request, res: Response) {
    res.status(200).json({ data: req.user });
  }
};