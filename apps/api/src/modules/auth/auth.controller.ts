// apps/api/src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authService } from "./auth.service.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Requires 1 uppercase letter").regex(/[0-9]/, "Requires 1 number"),
  name: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = registerSchema.parse(req.body);
      const user = await authService.register(email, password, name);
      res.status(201).json({ data: user });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.login(email, password);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response) {
    res.status(200).json({ data: req.user });
  }
};