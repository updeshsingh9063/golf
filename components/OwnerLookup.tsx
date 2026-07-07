"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OwnerLookup() {
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const n = parseInt(number, 10);
    if (!n || n < 1 || n > 72) {
      setError("Please enter a number between 1 and 72.");
      return;
    }
    router.push(`/me?number=${n}`);
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-[2rem] border border-ink/10 bg-cream p-10 shadow-card text-center">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-pie">Access your dashboard</p>
        <h2 className="display mt-4 text-5xl font-black leading-none text-fairway">Enter your hat number.</h2>
        <p className="mt-4 text-base font-semibold text-ink/55">
          Type the collector number printed on your PFP Golf hat to view your owner dashboard.
        </p>

        <form onSubmit={handleLookup} className="mt-8 flex flex-col gap-4">
          <input
            id="hat-number-input"
            type="number"
            min={1}
            max={72}
            value={number}
            onChange={(e) => { setNumber(e.target.value); setError(""); }}
            placeholder="e.g. 01"
            className="w-full rounded-2xl border border-ink/15 bg-cream-soft px-6 py-5 text-center text-4xl font-black text-fairway outline-none focus:border-fairway placeholder:text-ink/25"
          />
          {error && (
            <p className="rounded-2xl bg-red-500/10 p-3 text-sm font-bold text-red-700">{error}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-full bg-fairway px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-cream shadow-[0_18px_48px_rgba(20,40,29,0.24)] transition hover:scale-[1.01]"
          >
            View My Dashboard →
          </button>
        </form>

        <p className="mt-6 text-xs font-semibold text-ink/40">
          Your hat number is stamped inside the brim and printed on your receipt.
        </p>
      </div>
    </div>
  );
}
