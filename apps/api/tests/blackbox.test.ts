import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma, PASSWORD, uniqueEmail, validReport, citizenToken, submitReport, registerCitizen, loginAs } from "./helpers/testkit";

afterAll(() => prisma.$disconnect()); // avoid open handles after the run

// Zod errors come back as { error: { code, details: [{ field, message }] } }
const failedFields = (res: { body: any }): string[] => (res.body.error?.details ?? []).map((d: any) => d.field);

describe("BVA: description length (FR-02 / NFR-05). Rule: min 10, max 1000", () => {
  let token: string;
  beforeAll(async () => { ({ token } = await citizenToken()); });

  it("BB-01 length 9 (just below min) is rejected", async () => {
    const res = await submitReport(token, { ...validReport, description: "a".repeat(9) });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(failedFields(res)).toContain("description");
  });

  it("BB-02 length 10 (exactly min) is accepted", async () => {
    const res = await submitReport(token, { ...validReport, description: "a".repeat(10) });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("SUBMITTED");
  });

  it("BB-09 length 1001 (just above max) is rejected", async () => {
    const res = await submitReport(token, { ...validReport, description: "a".repeat(1001) });
    expect(res.status).toBe(400);
    expect(failedFields(res)).toContain("description");
  });
});

describe("BVA: password length (FR-07 / NFR-03). Rule: min 8 + upper + lower + digit", () => {
  it("BB-03 length 7 (just below min) is rejected", async () => {
    // 'Abcde12' has upper, lower and digit, so length is the ONLY rule violated
    const { res } = await registerCitizen(uniqueEmail(), "Abcde12");
    expect(res.status).toBe(400);
    expect(failedFields(res)).toContain("password");
  });

  it("BB-06 length 8 (exactly min) is accepted", async () => {
    const { res } = await registerCitizen(uniqueEmail(), "Abcdef12");
    expect(res.status).toBe(201);
  });

  it("BB-07 no lowercase letter is rejected (NFR-03 requires mixed case)", async () => {
    const { res } = await registerCitizen(uniqueEmail(), "PASSWORD12"); // long enough, has upper + digit
    expect(res.status).toBe(400);
    expect(failedFields(res)).toContain("password");
  });
});

describe("EP: report category classes (FR-02)", () => {
  let token: string;
  beforeAll(async () => { ({ token } = await citizenToken()); });

  // Valid class: every category the form offers
  it.each(["ROADS", "WATER", "ELECTRICITY", "WASTE", "PARKS", "OTHER"])(
    "BB-04 valid category %s is accepted",
    async (category) => {
      const res = await submitReport(token, { ...validReport, category });
      expect(res.status).toBe(201);
    }
  );

  // Invalid classes: unlisted word, wrong case, empty string
  it.each(["POTHOLES", "roads", ""])("BB-05 invalid category '%s' is rejected", async (category) => {
    const res = await submitReport(token, { ...validReport, category });
    expect(res.status).toBe(400);
    expect(failedFields(res)).toContain("category");
  });
});

describe("Credentials (FR-07 acceptance: incorrect login gives a generic error)", () => {
  it("BB-08 wrong password and unknown email both return 401 with the same message", async () => {
    const { email } = await registerCitizen();
    const wrongPw = await loginAs(email, "Wrong1234x");
    const ghost = await loginAs(uniqueEmail("ghost"), PASSWORD);
    expect(wrongPw.status).toBe(401);
    expect(ghost.status).toBe(401);
    expect(wrongPw.body.error.message).toBe(ghost.body.error.message); // no user enumeration
  });
});