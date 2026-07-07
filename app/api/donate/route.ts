import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import Stripe from "stripe";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

const DONATION_AMOUNT_CENTS = 500; // $5.00
const PLATFORM_FEE_CENTS = 50; // $0.50 (10%)
const STRIPE_FEE_ESTIMATE_CENTS = 15 + Math.floor(DONATION_AMOUNT_CENTS * 0.029); // ~$0.30

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // 1. Get the identity from the cookie
    const cookieStore = await cookies();
    const ownerEmail = cookieStore.get("pfp_owner")?.value;

    if (!ownerEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Look up the hat and charity
    const { data: hat, error: hatError } = await supabaseAdmin
      .from("hats")
      .select("id, status, charity_id, charities(name)")
      .eq("qr_token", token)
      .single();

    if (hatError || !hat) {
      return NextResponse.json({ error: "Hat not found" }, { status: 404 });
    }

    if (hat.status !== "sold") {
      return NextResponse.json({ error: "Hat is not sold" }, { status: 400 });
    }

    // 3. Look up the scanner (owner) details
    const { data: owner, error: ownerError } = await supabaseAdmin
      .from("owners")
      .select("id, stripe_customer_id, default_pm_id")
      .eq("email", ownerEmail)
      .single();

    if (ownerError || !owner || !owner.stripe_customer_id || !owner.default_pm_id) {
      return NextResponse.json({ error: "Scanner payment method not found" }, { status: 400 });
    }

    // 4. Create Idempotency Key (1 charge per hat per scanner per day)
    const today = new Date().toISOString().split("T")[0];
    const idempotencyKey = `donate-${hat.id}-${owner.id}-${today}`;

    // 5. Charge the scanner's saved payment method
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create(
        {
          amount: DONATION_AMOUNT_CENTS,
          currency: "usd",
          customer: owner.stripe_customer_id,
          payment_method: owner.default_pm_id,
          off_session: true,
          confirm: true,
          metadata: {
            type: "donation",
            hat_id: hat.id,
            charity_id: hat.charity_id,
          },
        },
        { idempotencyKey }
      );
    } catch (err: any) {
      console.error("Stripe charge failed:", err.message);
      // Handle SCA (Strong Customer Authentication)
      if (err.code === "authentication_required") {
        return NextResponse.json(
          {
            error: "Authentication required",
            clientSecret: err.raw?.payment_intent?.client_secret,
            paymentIntentId: err.raw?.payment_intent?.id,
          },
          { status: 402 } // Payment Required
        );
      }
      return NextResponse.json({ error: "Payment failed" }, { status: 400 });
    }

    if (paymentIntent.status === "succeeded") {
      // 6. Log the donation in Supabase
      const { error: donationError } = await supabaseAdmin
        .from("donations")
        .insert({
          hat_id: hat.id,
          payer_owner_id: owner.id,
          charity_id: hat.charity_id,
          amount_cents: DONATION_AMOUNT_CENTS,
          platform_fee: PLATFORM_FEE_CENTS,
          stripe_fee: STRIPE_FEE_ESTIMATE_CENTS,
          stripe_pi_id: paymentIntent.id,
          status: "succeeded",
        });

      if (donationError) {
        console.error("Failed to log donation in Supabase:", donationError);
        // It's still a success for the user as the card was charged
      }

      const charity = Array.isArray(hat.charities) ? hat.charities[0] : hat.charities;

      return NextResponse.json({
        success: true,
        donationId: paymentIntent.id,
        charityName: charity?.name,
      });
    }

    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });

  } catch (error) {
    console.error("Donate endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
