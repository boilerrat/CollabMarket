import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const projects = await prisma.projects.findMany({
    where: { created_at: { gte: since }, is_deleted: false, status: "active" },
    orderBy: { created_at: "desc" },
    take: 10,
    select: { id: true, title: true, category: true },
  });
  if (projects.length === 0) {
    console.log("No new projects in the last 24h.");
    return;
  }
  const lines = projects.map((p) => `• ${p.title} [${p.category}] (id: ${p.id})`);
  const msg = `Daily Digest: Top New Listings\n${lines.join("\n")}`;
  // Placeholder: integrate Farcaster posting or webhook here
  console.log(msg);
}

main().finally(async () => {
  await prisma.$disconnect();
});

