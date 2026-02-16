// Tool Executor Types

export interface ToolExecutor<T = unknown> {
  name: string;
  execute(args: T, context: ExecutionContext): Promise<ToolResult>;
}

export interface ExecutionContext {
  userId: string;
  projectId: string;
  orgId?: string;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ToolCallResult {
  toolCallId: string;
  name: string;
  result: ToolResult;
}
