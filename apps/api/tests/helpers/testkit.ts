import { randomUUID } from "node:crypto";
import request from "supertest";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";

export { prisma };
export const app = createApp(); // no port bound, so Supertest can drive it directly

// Meets NFR-03: >= 8 chars, upper, lower, digit
export const PASSWORD = "Passw0rdOk1";

// Unique per call: parallel test files share one DB, so we never clean tables
export const uniqueEmail = (tag = "user") => `${tag}-${randomUUID()}@civic.test`;

export const validReport = {
  category: "ROADS",
  description: "Large pothole in the left lane outside number 12",
  location: "12 Church Street, Pretoria",
};

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export const registerCitizen = async (email = uniqueEmail("citizen"), password = PASSWORD) => {
  const res = await request(app).post("/api/v1/auth/register").send({ email, password });
  return { res, email, password };
};

export const loginAs = (email: string, password: string) =>
  request(app).post("/api/v1/auth/login").send({ email, password });

// Setup helpers fail loudly so a broken precondition is never mistaken for a test failure
export async function citizenToken() {
  const { res, email, password } = await registerCitizen();
  if (res.status !== 201) throw new Error(`Setup: register -> ${res.status} ${JSON.stringify(res.body)}`);
  const login = await loginAs(email, password);
  if (login.status !== 200) throw new Error(`Setup: login -> ${login.status} ${JSON.stringify(login.body)}`);
  return { token: login.body.data.token as string, email };
}

// Self-registration only creates CITIZEN, so staff are inserted directly (same as seed.ts)
export async function staffToken(role: Role = Role.PERSONNEL) {
  const email = uniqueEmail("staff");
  await prisma.user.create({ data: { email, passwordHash: await bcrypt.hash(PASSWORD, 10), role } });
  const login = await loginAs(email, PASSWORD);
  if (login.status !== 200) throw new Error(`Setup: staff login -> ${login.status} ${JSON.stringify(login.body)}`);
  return { token: login.body.data.token as string, userId: login.body.data.user.id as string, email };
}

export const submitReport = (token: string, body: object) =>
  request(app).post("/api/v1/reports").set(bearer(token)).send(body);