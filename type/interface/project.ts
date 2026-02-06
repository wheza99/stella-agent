export interface Project {
    id: string; // UUID
    org_id: string; // UUID referencing organizations.id
    title: string;
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
}
