// prisma/seed.ts
import { PrismaClient } from "../app/generated/prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Create a couple of users
  const user1 = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@example.com",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Bob",
      email: "bob@example.com",
    },
  });

  // Create some pickleball courts
  const court1 = await prisma.court.create({
    data: {
      name: "Central Park - Court 1",
      location: "New York, NY",
    },
  });

  const court2 = await prisma.court.create({
    data: {
      name: "Sunset Rec Center - Court A",
      location: "San Francisco, CA",
    },
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
