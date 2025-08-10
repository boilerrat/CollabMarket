import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed a demo user (if not exists)
  const fid = BigInt(999999);
  const user = await prisma.users.upsert({
    where: { fid },
    update: {},
    create: { fid, handle: "demo_user" },
  });

  // Seed a project
  await prisma.projects.create({
    data: {
      owner_user_id: user.id,
      title: "Demo Project",
      pitch: "Build a mini app integration for collaborative projects.",
      category: "miniapp",
      onchain: false,
      contact_method: "farcaster",
      contact_value: "@demo_user",
      commitment: "part-time",
      incentives: ["bounty"],
      roles: { create: [{ skill: "typescript", level: "mid", count: 1 }] },
    },
  });

  // Seed a collaborator profile
  await prisma.collaborator_profiles.upsert({
    where: { user_id: user.id },
    update: {
      skills: ["typescript", "nextjs"],
      availability_hours_week: 5,
      categories: ["web"],
      visibility: "public",
    },
    create: {
      user_id: user.id,
      skills: ["typescript", "nextjs"],
      availability_hours_week: 5,
      categories: ["web"],
      visibility: "public",
    },
  });

  console.log("Seeded demo data.");
}

main().finally(async () => {
  await prisma.$disconnect();
});

