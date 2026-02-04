export interface Organization {
  id: string; // UUID
  name: string;
  slug: string | null;
  image_url: string | null;
  credits_total: number;
  credits_used: number;
  credits_remain: number;
  created_by: string | null; // UUID referencing users.id
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
