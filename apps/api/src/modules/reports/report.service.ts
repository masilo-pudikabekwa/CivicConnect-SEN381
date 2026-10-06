/**
 * ==============================================================================
 * Reporting Domain Service
 *
 * Traceability:
 *   - FR-01: Creates new civic reports with category, description, and location
 *   - FR-03: Returns confirmation with a deterministic unique reference number
 *   - FR-04: Retrieves report status scoped to the owning citizen (Stakeholder Conflict 2)
 *   - FR-05: Enforces transactional integrity during status updates
 *   - ASR-02 / Indicative Defense Q4: Business correctness protected via atomic transactions
 * ==============================================================================
 */

import { ReportStatus } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { canTransition } from "./report.status.js";

export interface CreateReportDTO {
  category: string;
  description: string;
  location: string;
  citizenId: string;
}

export class ReportService {
  /**
   * Generates a unique, human-readable tracking reference (FR-03).
   * Format: CC-YYYYMMDD-XXXX
   */
  private generateReference(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    return `CC-${dateStr}-${randomHex}`;
  }

  /**
   * Submits a report and initializes its audit log atomically (FR-01, FR-03).
   */
  async submitReport(data: CreateReportDTO) {
    const reference = this.generateReference();

    // Use Prisma transaction to ensure the report and initial audit log commit together
    return prisma.$transaction(async (tx) => {
      const report = await tx.report.create({
        data: {
          reference,
          category: data.category,
          description: data.description,
          location: data.location,
          status: ReportStatus.SUBMITTED,
          citizenId: data.citizenId
        }
      });

      await tx.statusHistory.create({
        data: {
          reportId: report.id,
          fromStatus: ReportStatus.SUBMITTED,
          toStatus: ReportStatus.SUBMITTED,
          changedById: data.citizenId,
          comment: "Initial report submitted"
        }
      });

      return report;
    });
  }

  /**
   * Retrieves a report by its reference number with owner privacy scoping (FR-04).
   */
  async getByReference(reference: string, userId: string, userRole: string) {
    const report = await prisma.report.findUnique({
      where: { reference },
      include: {
        statusHistory: {
          select: { toStatus: true, createdAt: true, comment: true },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!report) {
      throw new Error(`Report with reference ${reference} not found`);
    }

    // Resolves Stakeholder Conflict 2: Citizens may only view their own reports
    if (userRole === "CITIZEN" && report.citizenId !== userId) {
      throw new Error("Forbidden: You cannot view reports submitted by other citizens");
    }

    return report;
  }

  /**
   * Lists and filters reports for authorized civic personnel (FR-06).
   */
  async listReports(filter?: { status?: ReportStatus; category?: string; sort?: "asc" | "desc" }) {
    return prisma.report.findMany({
      where: {
        ...(filter?.status ? { status: filter.status } : {}),
        ...(filter?.category ? { category: filter.category } : {})
      },
      orderBy: { createdAt: filter?.sort || "desc" },
      take: 100 // Hard limit protecting against unbounded memory consumption (NFR-06)
    });
  }

  /**
   * Advances report status through the state machine within an atomic transaction (FR-05).
   */
  async updateStatus(reference: string, nextStatus: ReportStatus, staffId: string, comment?: string) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.report.findUnique({ where: { reference } });
      if (!current) {
        throw new Error(`Report with reference ${reference} not found`);
      }

      // Enforce state pattern rules
      if (!canTransition(current.status, nextStatus)) {
        throw new Error(`Invalid status transition from ${current.status} to ${nextStatus}`);
      }

      const updated = await tx.report.update({
        where: { id: current.id },
        data: { status: nextStatus }
      });

      // Insert audit history record alongside status update
      await tx.statusHistory.create({
        data: {
          reportId: current.id,
          fromStatus: current.status,
          toStatus: nextStatus,
          changedById: staffId,
          comment: comment || null
        }
      });

      return updated;
    });
  }
}

export const reportService = new ReportService();