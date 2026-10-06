import { Router } from "express";
import { reportController } from "./report.controller.js";
import { authenticate, requireRole } from "../../middleware/auth.js";

export const reportRouter = Router();

reportRouter.post("/", authenticate, requireRole("CITIZEN", "ADMIN"), reportController.create);
reportRouter.get("/:reference", authenticate, reportController.getByReference);
reportRouter.get("/", authenticate, requireRole("PERSONNEL", "ADMIN"), reportController.list);
reportRouter.patch("/:reference/status", authenticate, requireRole("PERSONNEL", "ADMIN"), reportController.updateStatus);