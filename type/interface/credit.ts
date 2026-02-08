export interface Credit {
  id: string;
  org_id: string;
  plan: "free" | "pro";
  total: number;
  used: number;
  remain: number;
  expired_at: string | null; // ISO date string
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
