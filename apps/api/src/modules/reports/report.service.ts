/**
 * ==============================================================================
 * Reporting Domain Service
 *
 * Traceability:
 *   - FR-01: Creates new civic reports with category, description, and location
 *   - FR-03: Returns confirmation with a unique reference number (retried on collision, TD-04)
 *   - FR-04: Retrieves report status scoped to the owning citizen (Stakeholder Conflict 2)
 *   - FR-05: Enforces transactional integrity and optimistic concurrency during status updates (TD-05)
 *   - ASR-02 / Indicative Defense Q4: Business correctness protected via atomic transactions
 * ==============================================================================
 */

import { Prisma, ReportStatus } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { ConflictError } from "../../shared/errors.js";
import { canTransition } from "./report.status.js";
import { generateReference } from "./report.reference.js";

// A clash is already very unlikely (TD-04); three attempts make a failed submission negligible
const MAX_REFERENCE_ATTEMPTS = 3;

/** True when a Prisma error is a unique-constraint violation on reports.reference. */
function isReferenceCollision(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002" &&
    String(err.meta?.target ?? "").includes("reference")
  );
}

export interface CreateReportDTO {
  category: string;
  description: string;
  location: string;
  citizenId: string;
}

export class ReportService {
  /**
   * Generates a tracking reference (FR-03). Kept as a method so tests can force a
   * collision; the format lives in report.reference.ts (CR-013).
   */
  generateReference(): string {
    return generateReference();
  }

  /**
   * Submits a report and initializes its audit log atomically (FR-01, FR-03).
   */
  async submitReport(data: CreateReportDTO) {
    // TD-04: if the reference is already taken, the whole transaction rolls back
    // and is retried with a new reference instead of returning HTTP 500
    for (let attempt = 1; attempt <= MAX_REFERENCE_ATTEMPTS; attempt++) {
      try {
        return await this.insertReport(data, this.generateReference());
      } catch (err) {
        if (!isReferenceCollision(err) || attempt === MAX_REFERENCE_ATTEMPTS) throw err;
      }
    }
    throw new Error("Could not allocate a unique report reference");
  }

  /** Inserts the report and its first audit row in one transaction (FR-01, FR-05). */
  private insertReport(data: CreateReportDTO, reference: string) {
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
      // CR-006: respond as "not found" so other citizens' reference numbers are never confirmed
      throw new Error(`Report with reference ${reference} not found`);
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

      // TD-05 / ADR-PERSISTENCE-01 rev 1: only write if the status is still the one we read.
      // If another staff member changed it first, PostgreSQL re-checks this WHERE after
      // their commit, 0 rows match, and this transaction rolls back with 409.
      const { count } = await tx.report.updateMany({
        where: { id: current.id, status: current.status },
        data: { status: nextStatus }
      });
      if (count === 0) {
        throw new ConflictError(
          `Report ${reference} was changed by another user. Reload it and try again.`
        );
      }

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

      return tx.report.findUniqueOrThrow({ where: { id: current.id } });
    });
  }
}

export const reportService = new ReportService();