/**
 * ==============================================================================
 * API Integration Tests: integrity, access control and M3 closure fixes
 *
 * Supertest against real PostgreSQL, same helpers as the black-box and E2E suites.
 *
 * Traceability:
 *   - INT-01: ASR-04 health endpoint
 *   - INT-02: FR-07 / ASR-01 unauthenticated submission rejected
 *   - INT-04: FR-08 / CR-011 admin and personnel cannot submit reports
 *   - INT-05: FR-05 / TD-05 concurrent status updates (ADR-PERSISTENCE-01 rev 1)
 *   - INT-06: ASR-02 status change rolls back if the audit insert fails
 *   - INT-07: FR-09 deactivation takes effect on the next request
 *   - INT-08: FR-03 / TD-04 reference collision is retried, not returned as 500
 *   - INT-09: FR-05 / TD-05 deterministic 409 when another writer commits first
 * ==============================================================================
 */

import { describe, it, expect, afterAll, beforeAll, vi } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { Role, ReportStatus } from "@prisma/client";
import { app, prisma, validReport, bearer, citizenToken, staffToken, submitReport } from "./helpers/testkit.js";
import { reportService } from "../src/modules/reports/report.service.js";
import { REFERENCE_PATTERN } from "../src/modules/reports/report.reference.js";

afterAll(() => prisma.$disconnect());

const patchStatus = (token: string, reference: string, status: ReportStatus, comment?: string) =>
  request(app).patch(`/api/v1/reports/${reference}/status`).set(bearer(token)).send({ status, comment });

describe("INT-01 health endpoint (ASR-04)", () => {
  it("returns 200 with status ok and no personal data", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(Object.keys(res.body).sort()).toEqual(["status", "timestamp"]);
  });
});

describe("INT-02 unauthenticated submission (FR-07, ASR-01)", () => {
  it("returns 401 and saves nothing", async () => {
    const marker = `INT-02 ${randomUUID()}`; // unique, because test files share one database
    const res = await request(app)
      .post("/api/v1/reports")
      .send({ ...validReport, description: `${validReport.description} ${marker}` });
    expect(res.status).toBe(401);
    expect(await prisma.report.count({ where: { description: { contains: marker } } })).toBe(0);
  });
});

describe("INT-04 only citizens submit reports (FR-08, CR-005, CR-011)", () => {
  it.each([Role.ADMIN, Role.PERSONNEL])("%s gets 403", async (role) => {
    const staff = await staffToken(role);
    const res = await submitReport(staff.token, validReport);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });
});

describe("INT-05 concurrent status updates (FR-05, TD-05)", () => {
  it("lets exactly one of several simultaneous identical transitions succeed, with one audit row", async () => {
    const citizen = await citizenToken();
    const staffA = await staffToken();
    const staffB = await staffToken();
    const reference = (await submitReport(citizen.token, validReport)).body.data.reference as string;
    expect((await patchStatus(staffA.token, reference, ReportStatus.UNDER_REVIEW)).status).toBe(200);

    // Five requests race from UNDER_REVIEW to IN_PROGRESS. A loser is rejected either way:
    // 409 if it read UNDER_REVIEW but lost the conditional write (TD-05 fix), or
    // 422 if the winner had already committed before it read. Which one happens is timing;
    // the invariant below is not.
    const results = await Promise.all(
      [staffA, staffB, staffA, staffB, staffA].map((s, i) =>
        patchStatus(s.token, reference, ReportStatus.IN_PROGRESS, `INT-05 racer ${i}`)
      )
    );
    const codes = results.map((r) => r.status);
    expect(codes.filter((c) => c === 200)).toHaveLength(1);
    expect(codes.every((c) => c === 200 || c === 409 || c === 422)).toBe(true);

    const report = await prisma.report.findUniqueOrThrow({ where: { reference } });
    expect(report.status).toBe(ReportStatus.IN_PROGRESS);
    const moves = await prisma.statusHistory.count({
      where: { reportId: report.id, toStatus: ReportStatus.IN_PROGRESS },
    });
    expect(moves).toBe(1); // before the fix, two racers could both write a history row
  });
});

describe("INT-06 audit insert failure rolls back the status change (ASR-02)", () => {
  const FAIL_COMMENT = "INT-06 FORCE FAILURE";

  // A test-only trigger makes the history insert fail for one magic comment, so the real
  // transaction in updateStatus is exercised. Other test files never use this comment.
  beforeAll(async () => {
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION cc_test_force_history_failure() RETURNS trigger AS $$
      BEGIN
        IF NEW."comment" = '${FAIL_COMMENT}' THEN
          RAISE EXCEPTION 'INT-06 forced audit insert failure';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql`);
    await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS cc_test_force_history_failure ON status_history`);
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER cc_test_force_history_failure BEFORE INSERT ON status_history
      FOR EACH ROW EXECUTE FUNCTION cc_test_force_history_failure()`);
  });

  afterAll(async () => {
    await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS cc_test_force_history_failure ON status_history`);
    await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS cc_test_force_history_failure()`);
  });

  it("leaves status and history unchanged when the history insert fails", async () => {
    const citizen = await citizenToken();
    const staff = await staffToken();
    const reference = (await submitReport(citizen.token, validReport)).body.data.reference as string;
    const report = await prisma.report.findUniqueOrThrow({ where: { reference } });
    const historyBefore = await prisma.statusHistory.count({ where: { reportId: report.id } });

    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {}); // expected 500 is logged
    const res = await patchStatus(staff.token, reference, ReportStatus.UNDER_REVIEW, FAIL_COMMENT);
    errorLog.mockRestore();

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("INT-06 forced"); // no internal detail leaked
    const after = await prisma.report.findUniqueOrThrow({ where: { reference } });
    expect(after.status).toBe(ReportStatus.SUBMITTED);
    expect(await prisma.statusHistory.count({ where: { reportId: report.id } })).toBe(historyBefore);
  });
});

describe("INT-07 deactivation takes effect on the next request (FR-09)", () => {
  it("rejects a still-valid token once the account is deactivated", async () => {
    const citizen = await citizenToken();
    expect((await request(app).get("/api/v1/auth/me").set(bearer(citizen.token))).status).toBe(200);

    await prisma.user.update({ where: { email: citizen.email }, data: { isActive: false } });

    const res = await request(app).get("/api/v1/auth/me").set(bearer(citizen.token));
    expect(res.status).toBe(401);
  });
});

describe("INT-08 reference collision is retried (FR-03, TD-04)", () => {
  it("returns 201 with a fresh reference when the first one is already taken", async () => {
    const citizen = await citizenToken();
    const taken = (await submitReport(citizen.token, validReport)).body.data.reference as string;

    // Force the next generated reference to clash with an existing one
    const spy = vi.spyOn(reportService, "generateReference").mockReturnValueOnce(taken);
    const res = await submitReport(citizen.token, validReport);
    const attempts = spy.mock.calls.length;
    spy.mockRestore();

    expect(res.status).toBe(201);
    expect(res.body.data.reference).not.toBe(taken);
    expect(res.body.data.reference).toMatch(REFERENCE_PATTERN);
    expect(attempts).toBe(2); // first attempt collided, second succeeded
  });
});

describe("INT-09 deterministic conflict: another writer commits first (FR-05, TD-05)", () => {
  it("returns 409 and writes no history when the status changed after it was read", async () => {
    const citizen = await citizenToken();
    const staff = await staffToken();
    const reference = (await submitReport(citizen.token, validReport)).body.data.reference as string;
    expect((await patchStatus(staff.token, reference, ReportStatus.UNDER_REVIEW)).status).toBe(200);
    const report = await prisma.report.findUniqueOrThrow({ where: { reference } });

    // Choreography (no timing luck involved):
    // 1. Our own transaction moves the report to IN_PROGRESS and holds the row lock, uncommitted.
    // 2. The API request reads the last committed status (UNDER_REVIEW), passes the transition
    //    check, and then blocks on our lock inside its conditional UPDATE.
    // 3. We wait until PostgreSQL reports that request as waiting on a lock, then commit.
    // 4. PostgreSQL re-checks the API's WHERE status = 'UNDER_REVIEW' against the committed row,
    //    0 rows match, and the API must answer 409 without writing a history row.
    let secondWriter: Promise<Awaited<ReturnType<typeof patchStatus>>> | undefined;
    await prisma.$transaction(
      async (tx) => {
        await tx.report.update({ where: { id: report.id }, data: { status: ReportStatus.IN_PROGRESS } });
        await tx.statusHistory.create({
          data: {
            reportId: report.id,
            fromStatus: ReportStatus.UNDER_REVIEW,
            toStatus: ReportStatus.IN_PROGRESS,
            changedById: staff.userId,
            comment: "INT-09 first writer",
          },
        });

        // .then() sends the HTTP request now; its result is awaited after we commit
        secondWriter = patchStatus(staff.token, reference, ReportStatus.IN_PROGRESS, "INT-09 second writer").then((r) => r);

        const deadline = Date.now() + 8000;
        for (;;) {
          const rows = await prisma.$queryRaw<{ waiting: bigint }[]>`
            SELECT count(*) AS waiting FROM pg_stat_activity
            WHERE wait_event_type = 'Lock' AND query ILIKE '%UPDATE%reports%' AND pid <> pg_backend_pid()`;
          if (Number(rows[0].waiting) > 0) break;
          if (Date.now() > deadline) throw new Error("INT-09 setup: the API request never blocked on the row lock");
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      },
      { timeout: 15000 }
    );

    const res = await secondWriter!;
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");

    const after = await prisma.report.findUniqueOrThrow({ where: { reference } });
    expect(after.status).toBe(ReportStatus.IN_PROGRESS);
    const secondWriterRows = await prisma.statusHistory.count({
      where: { reportId: report.id, comment: "INT-09 second writer" },
    });
    expect(secondWriterRows).toBe(0);
  }, 20000); // allows for the lock wait; normally finishes in well under a second
});
