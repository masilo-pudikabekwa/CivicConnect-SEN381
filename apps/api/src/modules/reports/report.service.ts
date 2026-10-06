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
  private generateReference(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    return `CC-${dateStr}-${randomHex}`;
  }

  async submitReport(data: CreateReportDTO) {
    const reference = this.generateReference();

    // Transaction ensures report and initial audit log are created atomically
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

    // Role-based scoping (DEF-01 / Conflict 2: Citizens only see their own reports)
    if (userRole === "CITIZEN" && report.citizenId !== userId) {
      throw new Error("Forbidden: You cannot access reports submitted by other citizens");
    }

    return report;
  }

  async listReports(filter?: { status?: ReportStatus; category?: string; sort?: "asc" | "desc" }) {
    return prisma.report.findMany({
      where: {
        ...(filter?.status ? { status: filter.status } : {}),
        ...(filter?.category ? { category: filter.category } : {})
      },
      orderBy: { createdAt: filter?.sort || "desc" },
      take: 100
    });
  }

  async updateStatus(reference: string, nextStatus: ReportStatus, staffId: string, comment?: string) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.report.findUnique({ where: { reference } });
      if (!current) {
        throw new Error(`Report with reference ${reference} not found`);
      }

      if (!canTransition(current.status, nextStatus)) {
        throw new Error(`Invalid status transition from ${current.status} to ${nextStatus}`);
      }

      const updated = await tx.report.update({
        where: { id: current.id },
        data: { status: nextStatus }
      });

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