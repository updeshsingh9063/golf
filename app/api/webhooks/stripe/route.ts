import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyStripeSignature } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (process.env.STRIPE_WEBHOOK_SECRET && !verifyStripeSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  switch (event.type) {
    case "checkout.session.completed":
      // Production handler:
      // 1. Create/attach owner from customer/customer_email.
      // 2. Store stripe_customer_id and default_pm_id.
      // 3. Mark hat sold and clear reservation.
      // 4. Persist order as paid.
      break;
    case "checkout.session.expired":
      // Production handler:
      // Release reservation and mark order expired.
      break;
    case "payment_intent.succeeded":
      // Production handler:
      // Reconcile the payment intent onto the paid order.
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
