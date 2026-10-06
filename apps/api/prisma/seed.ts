/**
 * ==============================================================================
 * Database Seed Script for Testing & Demonstration
 *
 * Traceability:
 *   - FR-07: Creates default test credentials for Citizen and Staff roles
 *   - NFR-03: Hashes passwords with salt before storing in PostgreSQL
 *   - Section 7: Demonstrates working baseline development
 * ==============================================================================
 */

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("CivicPass123!", 10);

  // Seed default Citizen account for report submission testing
  const citizen = await prisma.user.upsert({
    where: { email: "citizen@example.com" },
    update: {},
    create: {
      email: "citizen@example.com",
      passwordHash,
      name: "John Citizen",
      role: Role.CITIZEN
    }
  });

  // Seed default Civic Personnel account for workflow review testing
  const staff = await prisma.user.upsert({
    where: { email: "staff@example.com" },
    update: {},
    create: {
      email: "staff@example.com",
      passwordHash,
      name: "Officer Sarah",
      role: Role.PERSONNEL
    }
  });

  console.log("Database seeded successfully:", {
    citizen: citizen.email,
    staff: staff.email
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });