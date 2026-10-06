/**
 * ==============================================================================
 * Authentication HTTP Route Declarations
 *
 * Traceability:
 *   - FR-07: Public registration and login routes
 *   - FR-08: Session identity check endpoint
 * ==============================================================================
 */

import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.get("/me", authenticate, authController.me);