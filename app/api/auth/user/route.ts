import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    // 1. Get current authenticated user from Supabase Auth
    const {
        data: { user: authUser },
        error: authError,
    } = await supabase.auth.getUser();

    // 2. Check if user exists in public.users table
    if (authError || !authUser) {
        return NextResponse.json(null);
    }

    // 3. Check if user exists in public.users table
    const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", authUser.email)
        .single();
    let finalUser = existingUser;

    // 4. If user doesn't exist, create a new record
    if (!existingUser) {
        const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert([
                {
                    id: authUser.id, // Link public user ID to auth user ID
                    email: authUser.email,
                    name:
                        authUser.user_metadata?.full_name ||
                        authUser.user_metadata?.name ||
                        authUser.email?.split("@")[0],
                },
            ])
            .select()
            .single();
        if (insertError) {
            return NextResponse.json(
                { error: "Failed to create user record", details: insertError },
                { status: 401 },
            );
        }
        finalUser = newUser;
    }

    // 5. Fetch user's memberships
    const { data: memberData } = await supabase
        .from("members")
        .select(`
      role,
      organizations (*)
    `)
        .eq("user_id", finalUser.id);

    // 6. Map memberships to include organization details
    const organizations = memberData?.map((m) => ({
        ...(Array.isArray(m.organizations) ? m.organizations[0] : m.organizations),
        role: m.role,
    })) || [];

    // 7. Return user data with organizations
    return NextResponse.json({ ...finalUser, organizations });
}
