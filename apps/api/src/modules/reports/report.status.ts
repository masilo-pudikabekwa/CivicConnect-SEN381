/**
 * ==============================================================================
 * Report Lifecycle State Machine (State Pattern)
 *
 * Traceability:
 *   - FR-05: Restricts status changes to strictly permitted next states
 *   - FE-03: Single source of truth for transition rules across controllers/services
 *   - Indicative Defense Q7 & Q9: Research-informed design pattern application
 *
 * Transition Graph:
 *   SUBMITTED -> UNDER_REVIEW -> IN_PROGRESS -> RESOLVED (Terminal)
 *   (Backwards or skipping transitions are strictly forbidden)
 * ==============================================================================
 */

import { ReportStatus } from "@prisma/client";

// Table-driven transition rules
export const ALLOWED_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: [] // Terminal state in Milestone 2 baseline
};

/**
 * Evaluates whether a proposed status transition is permitted by the state machine.
 */
export function canTransition(current: ReportStatus, next: ReportStatus): boolean {
  return ALLOWED_TRANSITIONS[current].includes(next);
}