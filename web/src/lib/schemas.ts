import { z } from "zod";

export const ProjectRoleInput = z.object({
  skill: z.string().min(1).max(64),
  level: z.string().min(1).max(64).optional(),
  count: z.number().int().min(1).max(20).optional().default(1),
});

export const ProjectInput = z.object({
  title: z.string().min(3).max(120),
  pitch: z.string().min(10).max(4000),
  category: z.string().min(2).max(64),
  onchain: z.boolean().optional().default(false),
  repoUrl: z.string().url().optional().nullable(),
  contactMethod: z.string().min(2).max(32),
  contactValue: z.string().min(2).max(256),
  commitment: z.string().min(2).max(64),
  startDate: z.string().datetime().optional().nullable(),
  incentives: z.array(z.string().min(1).max(48)).optional().default([]),
  roles: z.array(ProjectRoleInput).min(0).max(20).optional().default([]),
});

export const ProjectUpdateInput = ProjectInput.partial().extend({
  status: z.enum(["active", "archived"]).optional(),
});

export const CollaboratorProfileInput = z.object({
  skills: z.array(z.string().min(1).max(64)).max(50),
  bio: z.string().max(4000).optional().nullable(),
  availabilityHoursWeek: z.number().int().min(0).max(168).default(0),
  categories: z.array(z.string().min(1).max(64)).max(50).default([]),
  location: z.string().max(140).optional().nullable(),
  compPreference: z.string().max(140).optional().nullable(),
  visibility: z.enum(["public", "private"]).default("public"),
});

export const ReportInput = z.object({
  targetKind: z.enum(["project", "profile", "user"]),
  targetId: z.string().min(1),
  reason: z.string().min(10).max(4000),
});

export const ListQuery = z.object({
  q: z.string().max(120).optional(),
  category: z.string().max(64).optional(),
  visibility: z.enum(["public", "private"]).optional(),
  status: z.enum(["active", "archived"]).optional(),
  take: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().optional(),
});

