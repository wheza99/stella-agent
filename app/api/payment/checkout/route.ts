import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import axios from "axios";
import crypto from "crypto";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { plan_name, plan_price, method, org_id } = await request.json();

  // 1. Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(null, { status: 401 });
  }

  // 2. Generate merchant ref & return_url
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.floor(Math.random() * 1000);
  const origin = request.headers.get("origin") || "http://localhost:3000";
  const merchant_ref = `INV-${timestamp}-${random}`;
  const return_url = `${origin}/payment/status`;

  // 3. Define Tripay API configuration
  const api_key = process.env.TRIPAY_API_KEY!;
  const private_key = process.env.TRIPAY_PRIVATE_KEY!;
  const merchant_kode = process.env.TRIPAY_MERCHANT_CODE!;
  const api_url = process.env.TRIPAY_API_URL!;

  // 4. Create Tripay Signature
  const signature = crypto
    .createHmac("sha256", private_key)
    .update(merchant_kode + merchant_ref + plan_price)
    .digest("hex");

  // 5. Call Tripay API to create transaction
  const response = await axios.post(
    api_url,
    {
      signature: signature,
      method: method,
      merchant_ref: merchant_ref,
      amount: plan_price,
      customer_name: user.user_metadata?.name || "Customer",
      customer_email: user.email || "customer@example.com",
      customer_phone: user.phone || "08123456789",
      order_items: [
        {
          sku: plan_name.replace(/\s+/g, "-").toUpperCase(),
          name: plan_name,
          price: plan_price,
          quantity: 1,
        },
      ],
      return_url: return_url,
      expired_time: timestamp + 24 * 60 * 60, // 24 hours
    },
    {
      headers: { Authorization: `Bearer ${api_key}` },
      validateStatus: (status) => status < 999,
    }
  );
  if (!response.data.success) {
    return NextResponse.json(
      { error: "Failed to create payment", details: response.data },
      { status: 401 }
    );
  }

  // 6. Save Tripay reference to database
  const { data: payment, error: insertError } = await supabase
    .from("payments")
    .insert({
      org_id: org_id,
      name: plan_name,
      amount: plan_price,
      status: "open",
      ref: merchant_ref,
      url: response.data.data.checkout_url || null,
      metadata: response.data,
    })
    .select()
    .single();
  if (insertError) {
    return NextResponse.json(
      { error: "Failed to save payment record", details: insertError },
      { status: 401 }
    );
  }

  // 7. Return response data
  return NextResponse.json({
    status: "success",
    payment,
  });
}
