/**
 * ==============================================================================
 * Reporting HTTP Route Declarations & Authorization Boundaries
 *
 * Traceability:
 *   - FR-01, FR-02, FR-03: Citizen report creation
 *   - FR-04: Report tracking by reference
 *   - FR-05, FR-06: Staff report management, filtering, and status updates
 *   - FR-08: Role-based route guards
 * ==============================================================================
 */

import { Router } from "express";
import { reportController } from "./report.controller.js";
import { authenticate, requireRole } from "../../middleware/auth.js";

export const reportRouter = Router();

// Citizen report submission (FR-01, FR-02, FR-03)
reportRouter.post("/", authenticate, requireRole("CITIZEN"), reportController.create); // CR-011: staff and admin do not submit (CR-005)

// Citizen status query by reference (FR-04)
reportRouter.get("/:reference", authenticate, reportController.getByReference);

// Staff review & filtering list (FR-06)
reportRouter.get("/", authenticate, requireRole("PERSONNEL", "ADMIN"), reportController.list);

// Staff status transition update (FR-05)
reportRouter.patch("/:reference/status", authenticate, requireRole("PERSONNEL", "ADMIN"), reportController.updateStatus);