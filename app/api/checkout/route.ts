import { NextRequest, NextResponse } from "next/server";
import { validateCheckoutInput } from "@/lib/commerce";
import { createStripeCheckoutSession, hasStripeConfig } from "@/lib/stripe";

type GlobalWithReservations = typeof globalThis & {
  __pfpReservations?: Map<number, number>;
};

const reservationStore =
  (globalThis as GlobalWithReservations).__pfpReservations ??
  new Map<number, number>();

(globalThis as GlobalWithReservations).__pfpReservations = reservationStore;

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
  const now = Date.now();
  const existingReservation = reservationStore.get(input.number);

  if (existingReservation && existingReservation > now) {
    return NextResponse.json(
      {
        error: `Number ${input.number} is temporarily reserved. Pick another number or try again later.`
      },
      { status: 409 }
    );
  }

  reservationStore.set(input.number, now + 20 * 60 * 1000);

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
    reservationStore.delete(input.number);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create checkout session."
      },
      { status: 502 }
    );
  }
}
