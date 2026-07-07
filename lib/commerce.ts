export const HAT_PRICE_CENTS = Number(process.env.HAT_PRICE_CENTS ?? 6500);
export const CURRENCY = process.env.STRIPE_CURRENCY ?? "usd";

export type CheckoutInput = {
  number: number;
  charity: string;
  email: string;
  consentAccepted: boolean;
};

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY.toUpperCase()
  }).format(cents / 100);
}

export function validateCheckoutInput(input: CheckoutInput) {
  if (!Number.isInteger(input.number) || input.number < 1 || input.number > 72) {
    return "Select a valid collector number between 1 and 72.";
  }

  if (!input.charity || input.charity.trim().length === 0) {
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

