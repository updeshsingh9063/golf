"use client";

import { useMemo, useState } from "react";
import { brand, consentText } from "@/lib/content";
import { charities, hats } from "@/lib/numbers";

type CheckoutState = "idle" | "loading" | "error" | "ready";

export function StoreCheckout() {
  const available = useMemo(() => hats.filter((hat) => hat.status === "available"), []);
  const [number, setNumber] = useState(available[0]?.number ?? 2);
  const [charity, setCharity] = useState(charities[0]);
  const [email, setEmail] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [state, setState] = useState<CheckoutState>("idle");
  const [message, setMessage] = useState("");

  async function startCheckout() {
    setState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          number,
          charity,
          email,
          consentAccepted
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Checkout could not be started.");
      }

      if (payload.url) {
        window.location.href = payload.url;
        return;
      }

      setState("ready");
      setMessage("Checkout session created.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Checkout failed.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] border border-ink/10 bg-cream p-6 shadow-card">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-pie">Step 1</p>
        <h2 className="display mt-3 text-5xl font-black leading-none text-fairway">Choose your number.</h2>
        <div className="mt-7 grid max-h-[34rem] grid-cols-4 gap-2 overflow-auto pr-1 sm:grid-cols-6">
          {available.map((hat) => (
            <button
              key={hat.number}
              onClick={() => setNumber(hat.number)}
              className={`rounded-2xl border p-3 text-left transition ${
                number === hat.number
                  ? "border-fairway bg-fairway text-cream shadow-[0_14px_30px_rgba(20,40,29,0.24)]"
                  : "border-ink/10 bg-cream-soft text-fairway hover:border-pie/50"
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.18em] opacity-55">No.</span>
              <span className="display block text-3xl font-black leading-none">
                {String(hat.number).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-ink/10 bg-ink p-6 text-cream shadow-card">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-pie">Step 2</p>
        <h2 className="display mt-3 text-5xl font-black leading-none">Capture card-on-file.</h2>
        <p className="mt-4 text-sm font-semibold leading-6 text-cream/62">
          Stripe Checkout will run in payment mode and save the card for future off-session $5 donations after explicit consent.
        </p>

        <div className="mt-7 space-y-5">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-cream/50">Owner email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="owner@example.com"
              className="mt-2 w-full rounded-2xl border border-cream/15 bg-cream/10 px-4 py-4 text-base font-bold text-cream outline-none placeholder:text-cream/28 focus:border-pie"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-cream/50">Food charity</span>
            <select
              value={charity}
              onChange={(event) => setCharity(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-cream/15 bg-fairway px-4 py-4 text-base font-bold text-cream outline-none focus:border-pie"
            >
              {charities.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-cream/15 bg-cream/8 p-4">
            <div className="flex items-start gap-3">
              <input
                id="consent"
                checked={consentAccepted}
                onChange={(event) => setConsentAccepted(event.target.checked)}
                type="checkbox"
                className="mt-1 h-5 w-5 accent-pie"
              />
              <label htmlFor="consent" className="text-sm font-semibold leading-6 text-cream/76">
                {consentText}
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-pie/25 bg-pie/10 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cream/48">Collector hat</p>
                <p className="mt-2 text-2xl font-black">No. {String(number).padStart(2, "0")}</p>
              </div>
              <p className="display text-5xl font-black leading-none">{brand.hatPrice}</p>
            </div>
          </div>

          <button
            onClick={startCheckout}
            disabled={state === "loading"}
            className="w-full rounded-full bg-pie px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-cream shadow-[0_18px_48px_rgba(197,121,51,0.28)] transition hover:scale-[1.01] disabled:cursor-wait disabled:opacity-60"
          >
            {state === "loading" ? "Creating checkout..." : "Proceed to Stripe Checkout"}
          </button>

          {message ? (
            <p className={`rounded-2xl p-4 text-sm font-bold ${state === "error" ? "bg-red-500/15 text-red-100" : "bg-cream/10 text-cream"}`}>
              {message}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
