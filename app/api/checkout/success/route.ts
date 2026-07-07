import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");
    const number = url.searchParams.get("number");

    if (!sessionId || !number) {
      return NextResponse.redirect(new URL("/store", request.url));
    }

    // 1. Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 2. Extract email
    const email = session.customer_details?.email || session.customer_email;

    if (email && session.payment_status === "paid") {
      // 3. Set the ownership cookie
      const cookieStore = await cookies();
      cookieStore.set({
        name: 'pfp_owner',
        value: email.toLowerCase(),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    // 4. Redirect to the owner dashboard
    return NextResponse.redirect(new URL(`/me?checkout=success&number=${number}`, request.url));

  } catch (error) {
    console.error("Checkout success endpoint error:", error);
    // Fallback redirect if something goes wrong
    return NextResponse.redirect(new URL("/me", request.url));
  }
}
