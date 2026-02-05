import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const project_id = searchParams.get("project_id");
  const supabase = await createClient();

  // 1. Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(null, { status: 401 });
  }

  // 2. Get project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", project_id)
    .single();
  if (projectError) {
    return NextResponse.json(
      { error: "Failed to get project", details: projectError },
      { status: 401 },
    );
  }

  // 3. Get project chats
  const { data: chatsData, error: chatsError } = await supabase
    .from("chats")
    .select("*")
    .eq("project_id", project_id)
    .order("created_at", { ascending: false })
    .limit(10);
  if (chatsError) {
    return NextResponse.json(
      { error: "Failed to get project chats", details: chatsError },
      { status: 401 },
    );
  }
  const chats = chatsData ? chatsData.reverse() : [];

  // 4. Return response data
  return NextResponse.json({
    status: "success",
    project,
    chats,
  });
}
