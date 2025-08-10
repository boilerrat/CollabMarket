import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Enable pg_trgm extension for trigram indexes
  await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS pg_trgm");

  // Projects: trigram on title and pitch, plus combined search index
  await prisma.$executeRawUnsafe("CREATE INDEX IF NOT EXISTS idx_projects_title_trgm ON projects USING GIN (title gin_trgm_ops)");
  await prisma.$executeRawUnsafe("CREATE INDEX IF NOT EXISTS idx_projects_pitch_trgm ON projects USING GIN (pitch gin_trgm_ops)");
  await prisma.$executeRawUnsafe("CREATE INDEX IF NOT EXISTS idx_projects_search_tsv ON projects USING GIN (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(pitch,'')))");

  // Collaborators: GIN on skills array, trigram on bio
  await prisma.$executeRawUnsafe("CREATE INDEX IF NOT EXISTS idx_collab_skills_gin ON collaborator_profiles USING GIN (skills)");
  await prisma.$executeRawUnsafe("CREATE INDEX IF NOT EXISTS idx_collab_bio_trgm ON collaborator_profiles USING GIN (bio gin_trgm_ops)");

  console.log("Indexes ensured.");
}

main().finally(async () => {
  await prisma.$disconnect();
});

