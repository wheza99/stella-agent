import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { availableTools } from "@/lib/groq/tools/linkedin-search";
import { toolExecutors } from "@/lib/groq/executors/linkedin-search";
import { CHAT_SYSTEM_PROMPT } from "@/lib/groq/prompts/system";
import { ExecutionContext, ToolCallResult } from "@/lib/groq/executors/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export async function POST(request: Request) {
  console.log("[ChatAPI] POST /api/chat/groq");
  
  const { messages, model, org_id, project_id } = await request.json();
  const supabase = await createClient();
  let project = null;

  // 1. Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log("[ChatAPI] Unauthorized");
    return NextResponse.json(null, { status: 401 });
  }

  console.log("[ChatAPI] User:", user.id);
  console.log("[ChatAPI] Project ID:", project_id);

  // 2. Create project if org_id is provided (new conversation)
  if (org_id) {
    const { data: newProject, error: insertError } = await supabase
      .from("projects")
      .insert({
        title: "New Project",
        org_id: org_id,
      })
      .select()
      .single();
    if (insertError) {
      console.error("[ChatAPI] Failed to create project:", insertError);
      return NextResponse.json(
        { error: "Failed to create project", details: insertError },
        { status: 400 },
      );
    }
    project = newProject;
    console.log("[ChatAPI] Created new project:", project.id);
  }

  const effectiveProjectId = project?.id || project_id;

  // 3. Build messages with system prompt
  const messagesWithSystem = [
    { role: "system", content: CHAT_SYSTEM_PROMPT },
    ...messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      // Include tool_calls if present (for conversation history)
      ...(msg.tool_calls && { tool_calls: msg.tool_calls }),
      ...(msg.tool_call_id && { tool_call_id: msg.tool_call_id }),
    })),
  ];

  try {
    // 4. First call to Groq (may return tool calls)
    console.log("[ChatAPI] Calling Groq with tools...");
    const firstResponse = await groq.chat.completions.create({
      messages: messagesWithSystem,
      model: model || DEFAULT_MODEL,
      tools: availableTools,
      tool_choice: "auto",
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 0.95,
    });

    const firstMessage = firstResponse.choices[0].message;
    console.log("[ChatAPI] First response received");

    // 5. Check if tool calls are needed
    if (firstMessage.tool_calls && firstMessage.tool_calls.length > 0) {
      console.log("[ChatAPI] Tool calls detected:", firstMessage.tool_calls.length);
      
      const executionContext: ExecutionContext = {
        userId: user.id,
        projectId: effectiveProjectId,
        orgId: org_id,
      };

      // Execute all tool calls
      const toolResults: ToolCallResult[] = [];
      
      for (const toolCall of firstMessage.tool_calls) {
        console.log("[ChatAPI] Executing tool:", toolCall.function.name);
        
        const executor = toolExecutors[toolCall.function.name];
        
        if (executor) {
          const args = JSON.parse(toolCall.function.arguments);
          const result = await executor.execute(args, executionContext);
          
          toolResults.push({
            toolCallId: toolCall.id,
            name: toolCall.function.name,
            result,
          });
          
          console.log("[ChatAPI] Tool result:", result.success ? "success" : "failed");
        } else {
          console.log("[ChatAPI] No executor found for:", toolCall.function.name);
          toolResults.push({
            toolCallId: toolCall.id,
            name: toolCall.function.name,
            result: {
              success: false,
              error: `Unknown tool: ${toolCall.function.name}`,
            },
          });
        }
      }

      // 6. Second call to Groq with tool results
      console.log("[ChatAPI] Calling Groq with tool results...");
      
      const secondMessages = [
        ...messagesWithSystem,
        firstMessage,
        ...toolResults.map((tr) => ({
          role: "tool" as const,
          tool_call_id: tr.toolCallId,
          content: JSON.stringify(tr.result),
        })),
      ];

      const secondResponse = await groq.chat.completions.create({
        messages: secondMessages,
        model: model || DEFAULT_MODEL,
        temperature: 0.6,
        max_completion_tokens: 4096,
        top_p: 0.95,
      });

      const finalMessage = secondResponse.choices[0].message;
      console.log("[ChatAPI] Final response received");

      // 7. Store messages in database
      const { error: insertError } = await supabase.from("chats").insert([
        {
          role: "user",
          content: messages[messages.length - 1].content,
          project_id: effectiveProjectId,
          created_at: new Date().toISOString(),
        },
        {
          role: "assistant",
          content: finalMessage.content,
          project_id: effectiveProjectId,
          tool_calls: firstMessage.tool_calls?.map((tc) => ({
            id: tc.id,
            name: tc.function.name,
            arguments: tc.function.arguments,
          })),
          created_at: new Date(Date.now() + 1000).toISOString(),
        },
      ]);

      if (insertError) {
        console.error("[ChatAPI] Failed to insert messages:", insertError);
      }

      // 8. Return response with tool info
      return NextResponse.json({
        status: "success",
        output: {
          role: finalMessage.role,
          content: finalMessage.content,
        },
        toolCalls: toolResults.map((tr) => ({
          name: tr.name,
          success: tr.result.success,
          data: tr.result.data,
          error: tr.result.error,
        })),
        project,
      });
    }

    // 9. No tool calls - regular response
    console.log("[ChatAPI] No tool calls, returning regular response");
    
    const { error: insertError } = await supabase.from("chats").insert([
      {
        role: "user",
        content: messages[messages.length - 1].content,
        project_id: effectiveProjectId,
        created_at: new Date().toISOString(),
      },
      {
        role: firstMessage.role,
        content: firstMessage.content,
        project_id: effectiveProjectId,
        created_at: new Date(Date.now() + 1000).toISOString(),
      },
    ]);

    if (insertError) {
      console.error("[ChatAPI] Failed to insert messages:", insertError);
    }

    return NextResponse.json({
      status: "success",
      output: {
        role: firstMessage.role,
        content: firstMessage.content,
      },
      project,
    });

  } catch (error) {
    console.error("[ChatAPI] Error:", error);
    
    return NextResponse.json(
      {
        status: "error",
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
