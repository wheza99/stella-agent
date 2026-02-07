import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import axios from "axios";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tripay_ref = searchParams.get("tripay_ref");
  const merchant_ref = searchParams.get("merchant_ref");
  const supabase = await createClient();

  // 1. Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(null, { status: 401 });
  }

  // 2. Check Database for transaction
  const { data: checkPayment, error: checkPaymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("ref", merchant_ref)
    .select()
    .single();
  if (checkPaymentError) {
    return NextResponse.json(
      { error: "Transaction not found", details: checkPaymentError },
      { status: 404 }
    );
  }
  let payment = checkPayment;

  // 3. Check Tripay status
  if (checkPayment.status === "open") {
    const api_url = process.env.TRIPAY_API_URL || "";
    const baseUrl = api_url.replace("/transaction/create", "");
    const checkUrl = `${baseUrl}/transaction/detail?reference=${tripay_ref}`;
    const api_key = process.env.TRIPAY_API_KEY!;

    const response = await axios.get(checkUrl, {
      headers: { Authorization: `Bearer ${api_key}` },
      validateStatus: (status) => status < 999,
    });
    if (!response.data.success) {
      return NextResponse.json(
        { error: "Failed to check payment status", details: response.data },
        { status: 404 }
      );
    }

    if (response.data.data.status === "PAID") {
      // 1. Update payment status
      const { data: updatePayment, error: updatePaymentError } = await supabase
        .from("payments")
        .update({ status: "paid" })
        .eq("ref", merchant_ref)
        .select()
        .single();
      if (updatePaymentError) {
        return NextResponse.json(
          { error: "Failed to update payment status", details: updatePaymentError },
          { status: 404 }
        );
      }
      payment = updatePayment;

      // 2. Insert credit record
      const { data: creditData, error: creditError } = await supabase
        .from("credits")
        .insert({
          org_id: payment.org_id,
          amount: 1000,
          type: "refill",
          description: "Pro Plan Purchase",
          metadata: payment.metadata
        })
        .select()
        .single();
      if (creditError) {
        return NextResponse.json(
          { error: "Failed to insert credit record", details: creditError },
          { status: 404 }
        );
      }
      let credit = creditData;

      // 3. Get organization data
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("total_credits")
        .eq("id", payment.org_id)
        .single();
      if (orgError) {
        return NextResponse.json(
          { error: "Failed to get organization data", details: orgError },
          { status: 404 }
        );
      }

      // 4. Update organization credits
      const { data: updateOrgData, error: updateOrgError } = await supabase
        .from("organizations")
        .update({ total_credits: orgData?.total_credits + 1000 || 1000 })
        .eq("id", payment.org_id)
        .select()
        .single();
      if (updateOrgError) {
        return NextResponse.json(
          { error: "Failed to update organization credits", details: updateOrgError },
          { status: 404 }
        );
      }
      let org = updateOrgData;

      // 5. Return response data
      return NextResponse.json({
        status: "success",
        payment,
        credit,
        org,
      });
    }
  }

  // 4. Return response data
  return NextResponse.json({
    status: "success",
    payment,
  });
}
