import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyStripeSignature } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { consentText } from "@/lib/content";
import { HAT_PRICE_CENTS, CURRENCY } from "@/lib/commerce";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (process.env.STRIPE_WEBHOOK_SECRET && !verifyStripeSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const email: string = session.customer_email ?? session.customer_details?.email ?? "";
      const stripeCustomerId: string = session.customer ?? "";
      const paymentIntentId: string = session.payment_intent ?? "";
      const hatNumber: number = Number(session.metadata?.hat_number);
      const charityName: string = session.metadata?.charity ?? "";
      const checkoutSessionId: string = session.id ?? "";

      if (!email || !hatNumber) {
        console.error("[webhook] Missing email or hat_number in session metadata", session.id);
        break;
      }

      // 1. Fetch PaymentIntent from Stripe to get the saved payment method
      let defaultPmId: string | null = null;
      if (paymentIntentId && process.env.STRIPE_SECRET_KEY) {
        try {
          const piRes = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
            headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }
          });
          const pi = await piRes.json();
          defaultPmId = pi.payment_method ?? null;
        } catch (err) {
          console.error("[webhook] Failed to fetch PaymentIntent:", err);
        }
      }

      // 2. Upsert owner: create or update by email
      const { data: ownerData, error: ownerError } = await supabaseAdmin
        .from("owners")
        .upsert(
          {
            email,
            stripe_customer_id: stripeCustomerId || null,
            default_pm_id: defaultPmId,
            mandate_accepted_at: new Date().toISOString(),
            mandate_text: consentText
          },
          { onConflict: "email" }
        )
        .select("id")
        .single();

      if (ownerError || !ownerData) {
        console.error("[webhook] Owner upsert failed:", ownerError);
        break;
      }

      const ownerId: string = ownerData.id;

      // 3. Resolve charity id
      const { data: charityData } = await supabaseAdmin
        .from("charities")
        .select("id")
        .eq("name", charityName)
        .single();

      // 4. Mark hat as sold, assign owner and clear reservation
      const { data: hatData, error: hatError } = await supabaseAdmin
        .from("hats")
        .update({
          status: "sold",
          owner_id: ownerId,
          charity_id: charityData?.id ?? null,
          reserved_until: null,
          stripe_checkout_session_id: checkoutSessionId
        })
        .eq("number", hatNumber)
        .select("id")
        .single();

      if (hatError || !hatData) {
        console.error("[webhook] Hat update failed:", hatError);
        break;
      }

      // 5. Create order record
      await supabaseAdmin.from("orders").upsert(
        {
          hat_id: hatData.id,
          owner_id: ownerId,
          email,
          charity_id: charityData?.id ?? null,
          stripe_checkout_session_id: checkoutSessionId,
          stripe_payment_intent_id: paymentIntentId || null,
          amount_cents: HAT_PRICE_CENTS,
          currency: CURRENCY,
          status: "paid",
          mandate_text: consentText,
          mandate_accepted_at: new Date().toISOString()
        },
        { onConflict: "stripe_checkout_session_id" }
      );

      console.log(`[webhook] ✅ Hat #${hatNumber} sold to ${email}`);
      break;
    }

    case "checkout.session.expired": {
      // Release reservation so the hat becomes available again
      const session = event.data.object;
      const hatNumber = Number(session.metadata?.hat_number);

      if (hatNumber) {
        await supabaseAdmin
          .from("hats")
          .update({ status: "available", reserved_until: null, charity_id: null, stripe_checkout_session_id: null })
          .eq("number", hatNumber)
          .eq("status", "reserved");

        // Mark order as expired
        await supabaseAdmin
          .from("orders")
          .update({ status: "expired" })
          .eq("stripe_checkout_session_id", session.id);

        console.log(`[webhook] Hat #${hatNumber} reservation expired and released`);
      }
      break;
    }

    case "payment_intent.succeeded": {
      const pi = event.data.object;
      
      if (pi.metadata?.type === "donation") {
        const hatId = pi.metadata.hat_id;
        const charityId = pi.metadata.charity_id;
        
        // Find owner by Stripe customer ID
        if (pi.customer) {
          const { data: owner } = await supabaseAdmin
            .from("owners")
            .select("id")
            .eq("stripe_customer_id", pi.customer)
            .single();

          if (owner && hatId && charityId) {
            // Upsert the donation using stripe_pi_id to prevent duplicates
            // with the synchronous log in /api/donate
            await supabaseAdmin.from("donations").upsert(
              {
                hat_id: hatId,
                payer_owner_id: owner.id,
                charity_id: charityId,
                amount_cents: pi.amount,
                platform_fee: 50, // Hardcoded for v1 PRD
                stripe_fee: 15 + Math.floor(pi.amount * 0.029), // Estimate
                stripe_pi_id: pi.id,
                status: "succeeded"
              },
              { onConflict: "stripe_pi_id" }
            );
            console.log(`[webhook] ✅ Donation ${pi.id} logged via webhook.`);
          }
        }
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
