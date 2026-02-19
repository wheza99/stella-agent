import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { availableTools } from "@/lib/groq/tools/linkedin-search";
import { CHAT_SYSTEM_PROMPT } from "@/lib/groq/prompts/system";

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
  // Sanitize message object to remove null fields that API might reject
  const messagesWithSystem = [
    { role: "system", content: CHAT_SYSTEM_PROMPT },
    ...messages.map((msg: any) => {
      const cleanMsg: any = {
        role: msg.role,
        content: msg.content,
      };
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        cleanMsg.tool_calls = msg.tool_calls;
      }
      if (msg.tool_call_id) {
        cleanMsg.tool_call_id = msg.tool_call_id;
      }
      return cleanMsg;
    }),
  ];

  try {
    // 4. Call Groq API
    console.log("[ChatAPI] Calling Groq with tools...");
    const chatCompletion = await groq.chat.completions.create({
      messages: messagesWithSystem,
      model: model || DEFAULT_MODEL,
      tools: availableTools,
      tool_choice: "auto",
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 0.95,
    });

    const responseMessage = chatCompletion.choices[0].message;
    console.log("[ChatAPI] Response received");

    // 5. Identify new messages to insert
    // Strategy: Find the last message from 'assistant' in the input array.
    // Everything after that is considered a new message from the client side (user or tool).
    let newMessages = [];
    let lastAssistantIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        lastAssistantIndex = i;
        break;
      }
    }

    if (lastAssistantIndex === -1) {
      // First turn or no assistant history, assume all messages are new
      newMessages = messages;
    } else {
      // Get all messages after the last assistant message
      newMessages = messages.slice(lastAssistantIndex + 1);
    }

    // 6. Prepare batch insert
    const messagesToInsert = [
      ...newMessages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        tool_calls: msg.tool_calls,
        tool_call_id: msg.tool_call_id,
        project_id: effectiveProjectId,
        created_at: new Date().toISOString(),
      })),
      {
        role: responseMessage.role,
        content: responseMessage.content,
        tool_calls: responseMessage.tool_calls,
        project_id: effectiveProjectId,
        created_at: new Date(Date.now() + 1000).toISOString(),
      },
    ];

    const { error: insertError } = await supabase
      .from("chats")
      .insert(messagesToInsert);

    if (insertError) {
      console.error("[ChatAPI] Failed to insert messages:", insertError);
    }

    // 7. Return response with tool_calls (if any) for frontend to execute
    return NextResponse.json({
      status: "success",
      output: {
        role: responseMessage.role,
        content: responseMessage.content,
        tool_calls: responseMessage.tool_calls,
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
