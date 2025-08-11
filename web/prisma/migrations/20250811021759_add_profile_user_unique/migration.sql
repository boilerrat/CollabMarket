/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `CollaboratorProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CollaboratorProfile_userId_key" ON "public"."CollaboratorProfile"("userId");
