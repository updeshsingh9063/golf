import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { StoreCheckout } from "@/components/StoreCheckout";

export default function StorePage() {
  return (
    <main>
      <Nav />

      <section className="px-6 pb-10 pt-32 md:pt-40">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-pie">Phase 2 · Sales</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <h1 className="display max-w-5xl text-[clamp(4rem,10vw,9rem)] font-black leading-[0.82] text-fairway">
              Buy the hat. Save the card. Unlock the give.
            </h1>
            <p className="text-lg font-semibold leading-8 text-ink/68">
              The purchase flow exists to capture a reusable payment method with consent. The saved card powers Phase 3’s one-tap scan donation.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <StoreCheckout />
        </div>
      </section>

      <Footer />
    </main>
  );
}
