export interface Chat {
    id: string;
    project_id: string;
    role: "user" | "assistant" | "tool" | "system";
    content: string | null;
    tool_calls?: any[];
    tool_call_id?: string;
    metadata?: Record<string, any>;
    created_at: string;
};
