export interface Member {
  id: string;
  user_id: string;
  org_id: string;
  role: "admin" | "member";
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
