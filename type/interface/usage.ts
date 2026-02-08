export interface Usage {
  id: string;
  org_id: string;
  amount: number; // Negative for usage, positive for refill
  description: string;
  type: 'usage' | 'refill' | 'adjustment';
  metadata: {
    model?: string;
    mode?: string;
    [key: string]: unknown;
  } | null;
  created_at: string;
}
