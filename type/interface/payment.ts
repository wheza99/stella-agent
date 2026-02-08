export interface Payment {
  id: string; // UUID
  org_id: string; // UUID referencing organizations.id
  name: string; // e.g. "Pro Plan - Monthly"
  amount: number;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  url: string | null; // Invoice URL
  date: string; // ISO date string
  metadata: Record<string, unknown> | null; // JSONB
  created_at: string; // ISO timestamp
}
