-- Unique fid when present
CREATE UNIQUE INDEX IF NOT EXISTS "User_fid_unique" ON "public"."User" ("fid") WHERE "fid" IS NOT NULL;

-- Prevent duplicate interests by same user on same project
CREATE UNIQUE INDEX IF NOT EXISTS "Interest_project_from_unique" ON "public"."Interest" ("projectId", "fromUserId");


