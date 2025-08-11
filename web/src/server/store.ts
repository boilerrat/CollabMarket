import { Interest, Profile, Project, UserKey } from "@/types/domain";

export const profiles = new Map<UserKey, Profile>();
export const projects = new Map<string, Project>();
export const interests = new Map<string, Interest>();

export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}


