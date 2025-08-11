export type UserKey = string; // temporary identifier derived from session cookie

export type Profile = {
  userKey: UserKey;
  display_name: string;
  handle: string;
  bio: string;
  skills: string[];
  project_types?: string[];
  availability_hours_week: number | null;
  createdAt: number;
  updatedAt: number;
};

export type Project = {
  id: string;
  ownerKey: UserKey;
  title: string;
  pitch: string;
  project_type?: string;
  skills: string[];
  createdAt: number;
  updatedAt: number;
};

export type InterestStatus = "pending" | "accepted" | "dismissed";

export type Interest = {
  id: string;
  projectId: string;
  fromKey: UserKey;
  message?: string;
  skillMatch: boolean;
  status: InterestStatus;
  createdAt: number;
};


