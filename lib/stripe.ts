import crypto from "node:crypto";
import { CURRENCY, HAT_PRICE_CENTS } from "@/lib/commerce";
import { consentText } from "@/lib/content";

type StripeCheckoutParams = {
  number: number;
  charity: string;
  email: string;
  origin: string;
};

export function hasStripeConfig() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export async function createStripeCheckoutSession({
  number,
  charity,
  email,
  origin
}: StripeCheckoutParams) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return {
      id: `demo_checkout_${number}`,
      url: `/me?checkout=demo&number=${number}`,
      demo: true
    };
  }

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("customer_email", email);
  params.set("success_url", `${origin}/me?checkout=success&number=${number}`);
  params.set("cancel_url", `${origin}/store?checkout=cancelled&number=${number}`);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", CURRENCY);
  params.set("line_items[0][price_data][unit_amount]", String(HAT_PRICE_CENTS));
  params.set("line_items[0][price_data][product_data][name]", `PFP Golf Collector Hat #${String(number).padStart(2, "0")}`);
  params.set("line_items[0][price_data][product_data][description]", `Playing With Pies numbered collector hat supporting ${charity}.`);
  params.set("payment_intent_data[setup_future_usage]", "off_session");
  params.set("metadata[hat_number]", String(number));
  params.set("metadata[charity]", charity);
  params.set("metadata[future_donation_consent]", "accepted");
  params.set("custom_text[submit][message]", consentText);

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Stripe Checkout failed.");
  }

  return {
    id: payload.id as string,
    url: payload.url as string,
    demo: false
  };
}

export function verifyStripeSignature(rawBody: string, signatureHeader: string | null) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !signatureHeader) {
    return false;
  }

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );

  const timestamp = parts.t;
  const signature = parts.v1;

  if (!timestamp || !signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
