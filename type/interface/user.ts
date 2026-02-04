import { Organization } from "./organization";

export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  organizations?: Organization[];
}
