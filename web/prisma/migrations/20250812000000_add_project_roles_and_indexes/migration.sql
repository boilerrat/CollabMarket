-- Enable pg_trgm extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ProjectRole table
CREATE TABLE IF NOT EXISTS "public"."ProjectRole" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "skill" TEXT NOT NULL,
  "level" TEXT,
  "count" INTEGER NOT NULL DEFAULT 1
);

-- Add columns for new JSON fields if missing
ALTER TABLE "public"."CollaboratorProfile" ADD COLUMN IF NOT EXISTS "links" JSONB;
ALTER TABLE "public"."Project" ADD COLUMN IF NOT EXISTS "ownerSnapshot" JSONB;

-- Full text search materialized tsvector columns (generated) for Projects
ALTER TABLE "public"."Project" ADD COLUMN IF NOT EXISTS "search" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce("pitch", '')), 'B')
  ) STORED;

-- GIN index on tsvector for FTS
CREATE INDEX IF NOT EXISTS "Project_search_idx" ON "public"."Project" USING GIN ("search");

-- Trigram indexes for fuzzy matches on title and pitch
CREATE INDEX IF NOT EXISTS "Project_title_trgm" ON "public"."Project" USING GIN ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Project_pitch_trgm" ON "public"."Project" USING GIN ("pitch" gin_trgm_ops);

-- Helpful composite index for filtering by projectType and archived
CREATE INDEX IF NOT EXISTS "Project_type_archived_idx" ON "public"."Project" ("projectType", "archived");


