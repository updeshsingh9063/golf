"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/commerce";
import { loadStripe } from "@stripe/stripe-js";

type Props = {
  token: string;
  hatNumber: number;
  charityName: string;
  hasOwnerSession: boolean;
};

type ScanState = "confirm" | "loading" | "success" | "error" | "identify";

export function ScanConfirm({ token, hatNumber, charityName, hasOwnerSession }: Props) {
  const [state, setState] = useState<ScanState>(hasOwnerSession ? "confirm" : "identify");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [donationId, setDonationId] = useState("");

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setState("loading");

    try {
      const res = await fetch("/api/auth/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to verify ownership");
        setState("identify");
        return;
      }

      // Success, move to confirm
      setState("confirm");
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
      setState("identify");
    }
  };

  const handleDonate = async () => {
    setErrorMsg("");
    setState("loading");

    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      
      if (res.status === 401) {
        // Session lost
        setState("identify");
        setErrorMsg("Session expired. Please identify yourself again.");
        return;
      }
      
      if (res.status === 402) {
        // SCA required - trigger 3D Secure modal
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        if (!stripe) {
          setErrorMsg("Failed to load payment provider.");
          setState("error");
          return;
        }

        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret);
        
        if (confirmError) {
          setErrorMsg(confirmError.message || "Authentication failed.");
          setState("error");
          return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
          setDonationId(paymentIntent.id);
          setState("success");
          return;
        }
      }

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to process donation");
        setState("error");
        return;
      }

      setDonationId(data.donationId);
      setState("success");
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  };

  if (state === "identify") {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-pie">Verify Ownership</p>
        <h1 className="display mt-4 text-4xl font-black leading-none text-fairway">
          Who's paying?
        </h1>
        <p className="mt-3 text-sm font-semibold text-ink/60">
          Enter the email you used to buy a PFP Golf hat to authorize this $5 donation.
        </p>

        <form onSubmit={handleIdentify} className="mt-8 flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
            placeholder="your@email.com"
            required
            className="w-full rounded-2xl border border-ink/15 bg-cream px-6 py-4 text-center text-lg font-bold outline-none focus:border-fairway"
          />
          {errorMsg && (
            <p className="rounded-xl bg-red-500/10 p-3 text-sm font-bold text-red-700">{errorMsg}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-full bg-fairway px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-cream shadow-card transition hover:scale-[1.01]"
          >
            Verify & Continue
          </button>
        </form>

        <div className="mt-8 border-t border-ink/10 pt-6">
          <p className="text-xs font-semibold text-ink/50">Don't own a hat yet?</p>
          <Link href="/store" className="mt-2 inline-block rounded-full border border-fairway px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-fairway">
            Buy a hat to participate
          </Link>
        </div>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fairway border-t-transparent" />
        <p className="text-sm font-black uppercase tracking-[0.2em] text-fairway">Processing...</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-fairway text-cream">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-pie">Donation Complete</p>
        <h1 className="display mt-4 text-4xl font-black leading-none text-fairway">
          $5 to {charityName}
        </h1>
        <p className="mt-4 text-sm font-semibold text-ink/60">
          The donation has been charged to your saved card. Thanks for playing with pies!
        </p>
        <p className="mt-2 text-xs font-medium text-ink/40">Ref: {donationId}</p>
        
        <Link href={`/me`} className="mt-8 block w-full rounded-full border border-fairway px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-fairway transition hover:bg-fairway/5">
          View your dashboard
        </Link>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600">Donation Failed</p>
        <p className="mt-4 text-sm font-semibold text-ink/70">{errorMsg}</p>
        
        <button
          onClick={() => setState("confirm")}
          className="mt-8 w-full rounded-full bg-fairway px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-cream shadow-card transition hover:scale-[1.01]"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Confirm state
  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto mb-6 w-max rounded-2xl bg-cream-soft px-6 py-3">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-ink/50">Hat Number</p>
        <p className="display mt-1 text-5xl font-black leading-none text-fairway">
          #{String(hatNumber).padStart(2, "0")}
        </p>
      </div>
      
      <h1 className="display text-4xl font-black leading-none text-fairway">
        Donate {formatMoney(500)}
      </h1>
      <p className="mt-4 text-lg font-semibold text-ink/70">
        to <strong className="text-fairway">{charityName}</strong>
      </p>

      <div className="mt-10">
        <button
          onClick={handleDonate}
          className="w-full rounded-full bg-fairway px-7 py-5 text-sm font-black uppercase tracking-[0.18em] text-cream shadow-[0_18px_48px_rgba(20,40,29,0.24)] transition hover:scale-[1.02]"
        >
          Confirm One-Tap Give
        </button>
        <p className="mt-4 text-xs font-medium text-ink/45">
          This will charge the payment method saved to your profile.
        </p>
      </div>
    </div>
  );
}
