// Simple JS seed to avoid extra dev dependencies
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { id: "seed-user-alice" },
    update: {},
    create: {
      id: "seed-user-alice",
      fid: 1111,
      handle: "alice",
      displayName: "Alice",
      avatarUrl: "https://placehold.co/64x64",
    },
  });

  const bob = await prisma.user.upsert({
    where: { id: "seed-user-bob" },
    update: {},
    create: {
      id: "seed-user-bob",
      fid: 2222,
      handle: "bob",
      displayName: "Bob",
      avatarUrl: "https://placehold.co/64x64",
    },
  });

  await prisma.collaboratorProfile.upsert({
    where: { userId: alice.id },
    update: {},
    create: {
      userId: alice.id,
      bio: "Full-stack dev interested in Mini Apps",
      skills: ["react", "nextjs", "solidity"],
      projectTypes: ["oss", "miniapp"],
      availabilityHoursWeek: 10,
      links: [{ label: "GitHub", url: "https://github.com/alice" }],
    },
  });

  await prisma.collaboratorProfile.upsert({
    where: { userId: bob.id },
    update: {},
    create: {
      userId: bob.id,
      bio: "Designer into crypto UX",
      skills: ["design", "figma"],
      projectTypes: ["product", "miniapp"],
      availabilityHoursWeek: 5,
      links: [{ label: "Website", url: "https://bob.example" }],
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "seed-project-1" },
    update: {},
    create: {
      id: "seed-project-1",
      ownerId: alice.id,
      title: "Mini App for Collaborators",
      pitch: "Find builders fast. Post roles and match by skills.",
      projectType: "miniapp",
      skills: ["react", "nextjs"],
      ownerSnapshot: { handle: alice.handle, displayName: alice.displayName, avatarUrl: alice.avatarUrl },
    },
  });

  await prisma.projectRole.createMany({
    data: [
      { projectId: project.id, skill: "react", level: "mid", count: 1 },
      { projectId: project.id, skill: "designer", level: "senior", count: 1 },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


