import { z } from "zod";

export const projectRoleSchema = z.object({
  id: z.string().optional(),
  skill: z.string().min(1).max(64),
  level: z.string().max(64).optional().nullable(),
  count: z.coerce.number().int().min(1).max(50).optional().nullable(),
});

export const newProjectSchema = z.object({
  title: z.string().min(3).max(140),
  pitch: z.string().min(10).max(2000),
  project_type: z.string().max(64).optional(),
  skills: z.array(z.string().min(1).max(64)).max(32).default([]),
  roles: z.array(projectRoleSchema).max(16).optional().default([]),
});

export const updateProjectSchema = z.object({
  title: z.string().min(3).max(140).optional(),
  pitch: z.string().min(10).max(2000).optional(),
  skills: z.array(z.string().min(1).max(64)).max(32).optional(),
  projectType: z.string().max(64).optional(),
  status: z.string().max(64).optional(),
  archived: z.boolean().optional(),
  roles: z.array(projectRoleSchema).max(32).optional(),
});

export const profileUpsertSchema = z.object({
  display_name: z.string().min(1).max(64),
  handle: z.string().min(1).max(64),
  bio: z.string().max(2000).optional().default(""),
  skills: z.union([z.array(z.string().min(1).max(64)), z.string()]).optional(),
  project_types: z.union([z.array(z.string().min(1).max(64)), z.string()]).optional(),
  availability_hours_week: z.union([z.number(), z.string()]).optional(),
  links: z
    .union([
      z.array(
        z.object({ label: z.string().max(64).optional(), url: z.string().url() })
      ),
      z.string(),
    ])
    .optional(),
});

export const newInterestSchema = z.object({
  projectId: z.string().min(1),
  message: z.string().max(1000).optional(),
});

export type NewProjectInput = z.infer<typeof newProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProfileUpsertInput = z.infer<typeof profileUpsertSchema>;
export type NewInterestInput = z.infer<typeof newInterestSchema>;


