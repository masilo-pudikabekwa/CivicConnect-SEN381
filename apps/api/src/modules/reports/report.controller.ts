import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { reportService } from "./report.service.js";
import { ReportStatus } from "@prisma/client";

// Input validation enforcing FR-02 and NFR-05
const createReportSchema = z.object({
  category: z.enum(["ROADS", "WATER", "ELECTRICITY", "WASTE", "PARKS", "OTHER"]),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  location: z.string().min(5, "Location must be at least 5 characters").max(255)
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(ReportStatus),
  comment: z.string().max(500).optional()
});

export const reportController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createReportSchema.parse(req.body);
      const report = await reportService.submitReport({
        ...validated,
        citizenId: req.user!.id
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

  async getByReference(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportService.getByReference(
        req.params.reference,
        req.user!.id,
        req.user!.role
      );
      res.status(200).json({ data: report });
    } catch (err) {
      next(err);
    }
  },

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

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, comment } = updateStatusSchema.parse(req.body);
      const updated = await reportService.updateStatus(
        req.params.reference,
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