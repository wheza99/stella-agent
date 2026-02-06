import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const org_id = searchParams.get("org_id");
  const supabase = await createClient();

  // 1. Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(null, { status: 401 });
  }

  // 2. Get project
  const { data: projects, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", org_id)
    .order("updated_at", { ascending: false })
    .limit(10);
  if (projectError) {
    return NextResponse.json(
      { error: "Failed to get project", details: projectError },
      { status: 401 },
    );
  }

  // 3. Return response data
  return NextResponse.json({ status: "success", projects });
}
