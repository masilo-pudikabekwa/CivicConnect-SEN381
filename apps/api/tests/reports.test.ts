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
import { generateReference, REFERENCE_PATTERN } from "../src/modules/reports/report.reference.js";

describe("FR-05 & FE-03: Report Lifecycle State Transitions", () => {
  it("UT-01 allows SUBMITTED -> UNDER_REVIEW", () => {
    expect(canTransition(ReportStatus.SUBMITTED, ReportStatus.UNDER_REVIEW)).toBe(true);
  });

  it("UT-02 allows UNDER_REVIEW -> IN_PROGRESS", () => {
    expect(canTransition(ReportStatus.UNDER_REVIEW, ReportStatus.IN_PROGRESS)).toBe(true);
  });

  it("UT-03 allows IN_PROGRESS -> RESOLVED", () => {
    expect(canTransition(ReportStatus.IN_PROGRESS, ReportStatus.RESOLVED)).toBe(true);
  });

  it("UT-04 strictly forbids backwards transitions (e.g. RESOLVED -> SUBMITTED)", () => {
    expect(canTransition(ReportStatus.RESOLVED, ReportStatus.SUBMITTED)).toBe(false);
    expect(canTransition(ReportStatus.IN_PROGRESS, ReportStatus.SUBMITTED)).toBe(false);
  });

  it("UT-05 strictly forbids skipping intermediate review states", () => {
    expect(canTransition(ReportStatus.SUBMITTED, ReportStatus.RESOLVED)).toBe(false);
    expect(canTransition(ReportStatus.SUBMITTED, ReportStatus.IN_PROGRESS)).toBe(false);
  });

  it("UT-06 verifies RESOLVED is a terminal state with no outbound transitions", () => {
    expect(ALLOWED_TRANSITIONS[ReportStatus.RESOLVED]).toHaveLength(0);
  });
});

describe("FR-03 & TD-04: Report reference format (CR-013)", () => {
  it("UT-07 generates CC-YYYYMMDD-XXXXXX from the UTC date and the safe alphabet", () => {
    const ref = generateReference(new Date("2026-10-18T23:30:00Z"));
    expect(ref).toMatch(REFERENCE_PATTERN);
    expect(ref.startsWith("CC-20261018-")).toBe(true);
    // 0, O, 1 and I are excluded so references can be read back over the phone
    for (let i = 0; i < 200; i++) expect(generateReference().slice(-6)).not.toMatch(/[01OI]/);
  });
});
