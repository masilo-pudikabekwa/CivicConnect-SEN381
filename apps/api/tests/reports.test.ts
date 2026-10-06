/**
 * ==============================================================================
 * Automated State Machine Unit Tests
 *
 * Traceability:
 *   - FR-05: Valid transitions only
 *   - FE-03: Input validation and transition consistency
 *   - Section 9: Verification evidence for the core traced workflow path
 * ==============================================================================
 */

import { describe, it, expect } from "vitest";
import { canTransition, ALLOWED_TRANSITIONS } from "../src/modules/reports/report.status.js";
import { ReportStatus } from "@prisma/client";

describe("FR-05 & FE-03: Report Lifecycle State Transitions", () => {
  it("allows valid linear lifecycle progression", () => {
    expect(canTransition(ReportStatus.SUBMITTED, ReportStatus.UNDER_REVIEW)).toBe(true);
    expect(canTransition(ReportStatus.UNDER_REVIEW, ReportStatus.IN_PROGRESS)).toBe(true);
    expect(canTransition(ReportStatus.IN_PROGRESS, ReportStatus.RESOLVED)).toBe(true);
  });

  it("strictly forbids backwards transitions (e.g. RESOLVED -> SUBMITTED)", () => {
    expect(canTransition(ReportStatus.RESOLVED, ReportStatus.SUBMITTED)).toBe(false);
    expect(canTransition(ReportStatus.IN_PROGRESS, ReportStatus.SUBMITTED)).toBe(false);
  });

  it("strictly forbids skipping intermediate review states", () => {
    expect(canTransition(ReportStatus.SUBMITTED, ReportStatus.RESOLVED)).toBe(false);
    expect(canTransition(ReportStatus.SUBMITTED, ReportStatus.IN_PROGRESS)).toBe(false);
  });

  it("verifies RESOLVED is a terminal state with no outbound transitions", () => {
    expect(ALLOWED_TRANSITIONS[ReportStatus.RESOLVED]).toHaveLength(0);
  });
});