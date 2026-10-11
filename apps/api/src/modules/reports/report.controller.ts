/**
 * ==============================================================================
 * Reporting HTTP Controller & Transport Adapter
 *
 * Traceability:
 *   - FR-01: Citizen submits a civic issue report
 *   - FR-02: Mandatory structured data set (category, description, location)
 *   - FR-03: On-screen confirmation with unique reference number
 *   - FR-04: Citizen status query by tracking reference
 *   - FR-05: Controlled status transitions by authorized civic personnel
 *   - FR-06: Filter and sort reports by status/category/date
 *   - NFR-05 / FE-03: Input validation before persistence
 * ==============================================================================
 */

import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { reportService } from "./report.service.js";
import { ReportStatus } from "@prisma/client";

// Input validation schema enforcing FR-02 and NFR-05
const createReportSchema = z.object({
  category: z.enum(["ROADS", "WATER", "ELECTRICITY", "WASTE", "PARKS", "OTHER"]),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  location: z.string().min(5, "Location must be at least 5 characters").max(255)
});

// Schema for status transition updates (FR-05)
const updateStatusSchema = z.object({
  status: z.nativeEnum(ReportStatus),
  comment: z.string().max(500).optional()
});

export const reportController = {
  /**
   * Handles POST /api/v1/reports
   * Validates citizen input and persists a new report with unique reference (FR-01, FR-02, FR-03).
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createReportSchema.parse(req.body);
      const report = await reportService.submitReport({
        ...validated,
        citizenId: req.user!.id // Populated by authenticate middleware
      });

      res.status(201).json({
        data: {
          reference: report.reference,
          status: report.status,
          createdAt: report.createdAt
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Handles GET /api/v1/reports/:reference
   * Returns current status and audit history with ownership verification (FR-04).
   */
  async getByReference(req: Request, res: Response, next: NextFunction) {
    try {
      const reference = req.params.reference;

      if (typeof reference !== "string" || reference.trim().length === 0) {
        res.status(400).json({
          message: "A valid report reference is required."
        });
        return;
      }

      const report = await reportService.getByReference(
        reference,
        req.user!.id,
        req.user!.role
      );
      res.status(200).json({ data: report });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Handles GET /api/v1/reports
   * Lists and filters civic reports for personnel review (FR-06).
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as ReportStatus | undefined;
      const category = req.query.category as string | undefined;
      const sort = req.query.sort === "asc" ? "asc" : "desc";

      const reports = await reportService.listReports({ status, category, sort });
      res.status(200).json({ data: reports });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Handles PATCH /api/v1/reports/:reference/status
   * Executes a validated state transition with audit logging (FR-05).
   */
  
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const reference = req.params.reference;

      if (typeof reference !== "string" || reference.trim().length === 0) {
        res.status(400).json({
          message: "A valid report reference is required."
        });
        return;
      }

      const { status, comment } = updateStatusSchema.parse(req.body);

      const updated = await reportService.updateStatus(
        reference,
        status,
        req.user!.id,
        comment
      );

      res.status(200).json({ data: updated });
    } catch (err) {
      next(err);
    }
  }
};