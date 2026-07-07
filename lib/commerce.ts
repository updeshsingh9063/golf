import { charities, hats } from "@/lib/numbers";

export const HAT_PRICE_CENTS = Number(process.env.HAT_PRICE_CENTS ?? 6500);
export const CURRENCY = process.env.STRIPE_CURRENCY ?? "usd";

export type CheckoutInput = {
  number: number;
  charity: string;
  email: string;
  consentAccepted: boolean;
};

export const sampleOwner = {
  name: "Anthony R.",
  email: "anthony@example.com",
  stripeCustomerId: "cus_phase2_preview",
  defaultPaymentMethod: "Visa ending 4242",
  hats: [
    {
      number: 42,
      charity: "Wednesday Pantry",
      donations: 7,
      totalGivenCents: 3500
    },
    {
      number: 7,
      charity: "Second Harvest Kitchen",
      donations: 3,
      totalGivenCents: 1500
    }
  ]
};

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY.toUpperCase()
  }).format(cents / 100);
}

export function validateCheckoutInput(input: CheckoutInput) {
  const selectedHat = hats.find((hat) => hat.number === input.number);

  if (!selectedHat) {
    return "Select a valid collector number.";
  }

  if (selectedHat.status !== "available") {
    return `Number ${input.number} is not available.`;
  }

  if (!charities.includes(input.charity)) {
    return "Select an approved food charity.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return "Enter a valid owner email.";
  }

  if (!input.consentAccepted) {
    return "Future-donation consent is required before checkout.";
  }

  return null;
}
