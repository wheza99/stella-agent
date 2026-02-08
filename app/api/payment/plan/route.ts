import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  // 2. Check Database for payment
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("org_id", org_id)
    .select()
    .limit(10);
  if (paymentError) {
    return NextResponse.json(
      { error: "Payment not found", details: paymentError },
      { status: 404 }
    );
  }

  // 3. Check Database for usage
  const { data: usage, error: usageError } = await supabase
    .from("usages")
    .select("*")
    .eq("org_id", org_id)
    .select()
    .limit(10);
  if (usageError) {
    return NextResponse.json(
      { error: "Usage not found", details: usageError },
      { status: 404 }
    );
  }

  // 4. Return response data
  return NextResponse.json({
    status: "success",
    payment,
    usage,
  });
}
