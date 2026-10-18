/**
 * ==============================================================================
 * Volume seed for NFR-06 (100 users / 500 reports) and staging demos
 *
 * Usage (staging or test database ONLY, never real data):
 *   SEED_VOLUME_CONFIRM=yes npm run seed:volume -w apps/api
 *
 * Creates 100 citizens, 3 personnel, 1 admin and 500 reports spread across
 * categories and statuses. Every report gets a matching audit trail, so the
 * "every report has history" check in docs/architecture/database-schema.md holds.
 * All accounts use the password VolumeSeed1 and the @volume.test email domain.
 * ==============================================================================
 */

import bcrypt from "bcryptjs";
import { PrismaClient, ReportStatus, Role } from "@prisma/client";
import { generateReference } from "../src/modules/reports/report.reference.js";

const prisma = new PrismaClient();

const CITIZENS = 100;
const REPORTS = 500;
const CATEGORIES = ["ROADS", "WATER", "ELECTRICITY", "WASTE", "PARKS", "OTHER"];
const LIFECYCLE: ReportStatus[] = [
  ReportStatus.SUBMITTED,
  ReportStatus.UNDER_REVIEW,
  ReportStatus.IN_PROGRESS,
  ReportStatus.RESOLVED,
];

async function main() {
  if (process.env.SEED_VOLUME_CONFIRM !== "yes") {
    throw new Error("Refusing to seed: set SEED_VOLUME_CONFIRM=yes and point DATABASE_URL at a staging/test database.");
  }

  const passwordHash = await bcrypt.hash("VolumeSeed1", 10);
  const run = Date.now().toString(36); // lets the script run more than once without email clashes

  await prisma.user.createMany({
    data: [
      ...Array.from({ length: CITIZENS }, (_, i) => ({ email: `citizen${i}-${run}@volume.test`, passwordHash, role: Role.CITIZEN })),
      ...Array.from({ length: 3 }, (_, i) => ({ email: `staff${i}-${run}@volume.test`, passwordHash, role: Role.PERSONNEL })),
      { email: `admin-${run}@volume.test`, passwordHash, role: Role.ADMIN },
    ],
  });

  const citizens = await prisma.user.findMany({ where: { email: { endsWith: `-${run}@volume.test` }, role: Role.CITIZEN } });
  const staff = await prisma.user.findMany({ where: { email: { endsWith: `-${run}@volume.test` }, role: Role.PERSONNEL } });

  for (let i = 0; i < REPORTS; i++) {
    const citizen = citizens[i % citizens.length];
    const finalStatus = LIFECYCLE[i % LIFECYCLE.length];
    const steps = LIFECYCLE.slice(0, LIFECYCLE.indexOf(finalStatus) + 1);

    await prisma.$transaction(async (tx) => {
      const report = await tx.report.create({
        data: {
          reference: generateReference(),
          category: CATEGORIES[i % CATEGORIES.length],
          description: `Volume seed report ${i}: synthetic issue for NFR-06 testing`,
          location: `${(i % 200) + 1} Seed Street, Test City`,
          status: finalStatus,
          citizenId: citizen.id,
        },
      });
      // Same audit shape the API writes: creation row, then one row per transition
      await tx.statusHistory.createMany({
        data: steps.map((to, s) => ({
          reportId: report.id,
          fromStatus: s === 0 ? ReportStatus.SUBMITTED : steps[s - 1],
          toStatus: to,
          changedById: s === 0 ? citizen.id : staff[s % staff.length].id,
          comment: s === 0 ? "Initial report submitted" : "Volume seed transition",
        })),
      });
    });
  }

  console.log(`Seeded ${CITIZENS} citizens, ${staff.length} personnel, 1 admin and ${REPORTS} reports (run ${run}).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
