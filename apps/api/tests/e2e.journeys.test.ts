import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { ReportStatus } from "@prisma/client";
import { app, prisma, PASSWORD, uniqueEmail, validReport, bearer, loginAs, citizenToken, staffToken, submitReport } from "./helpers/testkit.js";
import { REFERENCE_PATTERN } from "../src/modules/reports/report.reference.js";

afterAll(() => prisma.$disconnect());

describe("E2E-01 Citizen journey: register -> login -> submit -> track", () => {
  it("completes end to end over HTTP against real PostgreSQL", async () => {
    const email = uniqueEmail("e2e-citizen");

    // 1. Register (FR-07). Response must never leak the hash
    const reg = await request(app).post("/api/v1/auth/register").send({ email, password: PASSWORD });
    expect(reg.status).toBe(201);
    expect(reg.body.data.role).toBe("CITIZEN");
    expect(reg.body.data).not.toHaveProperty("passwordHash");

    // 2. Login (FR-07)
    const login = await loginAs(email, PASSWORD);
    expect(login.status).toBe(200);
    const token = login.body.data.token as string;

    // 3. Session identity (FR-08)
    const me = await request(app).get("/api/v1/auth/me").set(bearer(token));
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(email);

    // 4. Submit (FR-01, FR-03). Reference format CC-YYYYMMDD-XXXXXX (CR-013)
    const created = await submitReport(token, validReport);
    expect(created.status).toBe(201);
    expect(created.body.data.reference).toMatch(REFERENCE_PATTERN);
    expect(created.body.data.status).toBe("SUBMITTED");

    // 5. Track (FR-04)
    const tracked = await request(app).get(`/api/v1/reports/${created.body.data.reference}`).set(bearer(token));
    expect(tracked.status).toBe(200);
    expect(tracked.body.data.status).toBe("SUBMITTED");
    expect(tracked.body.data.updatedAt).toBeTruthy();
  });

  it("E2E-01b another citizen gets 404, not 403 (CR-006: don't confirm the reference exists)", async () => {
    const owner = await citizenToken();
    const other = await citizenToken();
    const { body } = await submitReport(owner.token, validReport);
    const res = await request(app).get(`/api/v1/reports/${body.data.reference}`).set(bearer(other.token));
    expect(res.status).toBe(404);
  });
});

describe("E2E-02 Staff journey: login -> list -> advance status -> verify audit log", () => {
  it("moves a report through the full lifecycle and records an attributable audit trail", async () => {
    const citizen = await citizenToken();
    const staff = await staffToken();
    const created = await submitReport(citizen.token, validReport);
    const reference = created.body.data.reference as string;

    // 1. Staff loads reports filtered by status (FR-06)
    const list = await request(app).get("/api/v1/reports?status=SUBMITTED").set(bearer(staff.token));
    expect(list.status).toBe(200);
    expect(list.body.data.map((r: { reference: string }) => r.reference)).toContain(reference);

    // 2. Advance through every legal transition (FR-05)
    for (const next of ["UNDER_REVIEW", "IN_PROGRESS", "RESOLVED"]) {
      const res = await request(app)
        .patch(`/api/v1/reports/${reference}/status`)
        .set(bearer(staff.token))
        .send({ status: next, comment: `E2E move to ${next}` });
      expect(res.status, `transition to ${next}`).toBe(200);
      expect(res.body.data.status).toBe(next);
    }

    // 3. Audit log: read straight from the DB. Sorted by lifecycle rank so same-millisecond rows can't flake
    const report = await prisma.report.findUniqueOrThrow({ where: { reference } });
    const rank = (s: ReportStatus) => ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED"].indexOf(s);
    const trail = (await prisma.statusHistory.findMany({ where: { reportId: report.id } }))
      .sort((a, b) => rank(a.toStatus) - rank(b.toStatus));
    expect(trail.map((h) => h.toStatus)).toEqual(["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED"]);
    expect(trail.slice(1).every((h) => h.changedById === staff.userId)).toBe(true); // attributable

    // 4. Illegal move out of the terminal state is rejected (FR-05)
    const illegal = await request(app)
      .patch(`/api/v1/reports/${reference}/status`)
      .set(bearer(staff.token))
      .send({ status: "SUBMITTED" });
    expect(illegal.status).toBe(422);
    expect(illegal.body.error.code).toBe("INVALID_TRANSITION");

    // 5. Citizen sees the final status; citizens cannot use staff endpoints (FR-08)
    const seen = await request(app).get(`/api/v1/reports/${reference}`).set(bearer(citizen.token));
    expect(seen.body.data.status).toBe("RESOLVED");
    const forbidden = await request(app).get("/api/v1/reports").set(bearer(citizen.token));
    expect(forbidden.status).toBe(403);
  });
});