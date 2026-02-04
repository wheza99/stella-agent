import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // 1. Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(null, { status: 401 });
  }

  // 2. Create organization
  const { name } = await request.json();
  const { data: newOrg, error } = await supabase
    .from("organizations")
    .insert({
      name: name || "New Organization",
      slug: name?.toLowerCase().replace(/\s+/g, '-') ?? "org" + "-" + Math.random().toString(36).substring(2, 7),
      created_by: user.id,
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json(
      { error: "Failed to create organization", details: error },
      { status: 401 }
    );
  }

  // 3. Return organization data
  return NextResponse.json({ status: "success", organization: newOrg });
}
