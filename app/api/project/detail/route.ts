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

export async function PUT(request: Request) {
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

  if (!project_id) {
    return NextResponse.json(
      { status: "error", error: "Project ID is required" },
      { status: 400 },
    );
  }

  // 2. Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // 3. Get project and verify ownership via organization membership
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("id, org_id")
    .eq("id", project_id)
    .single();

  if (fetchError || !project) {
    return NextResponse.json(
      { status: "error", error: "Project not found" },
      { status: 404 },
    );
  }

  // 4. Check if user is a member of the organization
  const { data: membership, error: membershipError } = await supabase
    .from("members")
    .select("id")
    .eq("org_id", project.org_id)
    .eq("user_id", user.id)
    .single();

  if (membershipError || !membership) {
    return NextResponse.json(
      { status: "error", error: "You don't have permission to update this project" },
      { status: 403 },
    );
  }

  // 5. Build update object (only allow certain fields)
  const updateData: Record<string, unknown> = {};
  
  if (body.title !== undefined) {
    updateData.title = body.title;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { status: "error", error: "No valid fields to update" },
      { status: 400 },
    );
  }

  // 6. Update project
  const { data: updatedProject, error: updateError } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", project_id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { status: "error", error: "Failed to update project", details: updateError },
      { status: 500 },
    );
  }

  // 7. Return updated project
  return NextResponse.json({
    status: "success",
    project: updatedProject,
  });
}
