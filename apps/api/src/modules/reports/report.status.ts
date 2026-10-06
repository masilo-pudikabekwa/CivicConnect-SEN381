import { ReportStatus } from "@prisma/client";

export const ALLOWED_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: []
};

export function canTransition(current: ReportStatus, next: ReportStatus): boolean {
  return ALLOWED_TRANSITIONS[current].includes(next);
}