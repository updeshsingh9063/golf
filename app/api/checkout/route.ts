import { NextRequest, NextResponse } from "next/server";
import { validateCheckoutInput } from "@/lib/commerce";
import { createStripeCheckoutSession, hasStripeConfig } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const input = {
    number: Number(body.number),
    charity: String(body.charity ?? ""),
    email: String(body.email ?? "").trim().toLowerCase(),
    consentAccepted: Boolean(body.consentAccepted)
  };

  const validationError = validateCheckoutInput(input);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const origin = request.nextUrl.origin;

  // 1. Get Charity ID from Supabase
  const { data: charityData } = await supabaseAdmin
    .from("charities")
    .select("id")
    .eq("name", input.charity)
    .single();

  if (!charityData) {
    return NextResponse.json({ error: "Invalid charity selected." }, { status: 400 });
  }

  // 2. Atomically reserve the hat in Supabase
  const { data: updateData, error: updateError } = await supabaseAdmin
    .from("hats")
    .update({ status: "reserved", charity_id: charityData.id })
    .eq("number", input.number)
    .eq("status", "available")
    .select();

  if (updateError || !updateData || updateData.length === 0) {
    return NextResponse.json(
      { error: `Number ${input.number} is temporarily reserved or sold. Pick another number.` },
      { status: 409 }
    );
  }

  try {
    const session = await createStripeCheckoutSession({
      number: input.number,
      charity: input.charity,
      email: input.email,
      origin
    });

    return NextResponse.json({
      checkoutSessionId: session.id,
      url: session.url,
      mode: hasStripeConfig() ? "stripe" : "demo",
      reservation: {
        number: input.number,
        status: "reserved",
        expiresInMinutes: 20
      }
    });
  } catch (error) {
    // Revert reservation if Stripe session creation fails
    await supabaseAdmin
      .from("hats")
      .update({ status: "available", charity_id: null })
      .eq("number", input.number);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create checkout session."
      },
      { status: 502 }
    );
  }
}
