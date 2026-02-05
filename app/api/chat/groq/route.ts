import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(request: Request) {
  const { messages, model, org_id, project_id } = await request.json();
  const supabase = await createClient();
  let project = null;

  // 1. Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(null, { status: 401 });
  }

  // 2. Call Groq API
  const chatCompletion = await groq.chat.completions.create({
    messages: messages,
    model: model,
    temperature: 0.6,
    max_completion_tokens: 4096,
    top_p: 0.95,
    stream: false,
    stop: null,
  });

  // 3. Create project if org_id is provided
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
      return NextResponse.json(
        { error: "Failed to create project", details: insertError },
        { status: 401 },
      );
    }
    project = newProject;
  }

  // 4. Create message
  const { error: insertError } = await supabase
    .from("chats")
    .insert(
      [
        {
          role: "user",
          content: messages[messages.length - 1].content,
          project_id: project?.id || project_id,
          created_at: new Date().toISOString(),
        },
        {
          role: chatCompletion.choices[0].message.role,
          content: chatCompletion.choices[0].message.content,
          project_id: project?.id || project_id,
          created_at: new Date(Date.now() + 1000).toISOString(),
        }
      ]
    );
  if (insertError) {
    return NextResponse.json(
      { error: "Failed to create message", details: insertError },
      { status: 401 },
    );
  }

  // 5. Return response data
  return NextResponse.json({
    status: "success",
    output: chatCompletion.choices[0].message,
    project,
  });
}
