import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { consentText } from "@/lib/content";
import { formatMoney, sampleOwner } from "@/lib/commerce";

export default function OwnerPage() {
  return (
    <main>
      <Nav />

      <section className="px-6 pb-10 pt-32 md:pt-40">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-pie">Owner area</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <h1 className="display max-w-5xl text-[clamp(4rem,10vw,9rem)] font-black leading-[0.82] text-fairway">
              Your hats, charities and card-on-file.
            </h1>
            <p className="text-lg font-semibold leading-8 text-ink/68">
              Phase 2 creates the loyalty surface: owned numbers, charity assignment, donation history and payment method management.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="rounded-[2rem] border border-ink/10 bg-fairway p-6 text-cream shadow-card">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cream/45">Owner identity</p>
            <h2 className="mt-4 text-3xl font-black">{sampleOwner.name}</h2>
            <p className="mt-2 text-sm font-semibold text-cream/58">{sampleOwner.email}</p>

            <div className="mt-8 space-y-3">
              <InfoRow label="Stripe customer" value={sampleOwner.stripeCustomerId} />
              <InfoRow label="Default payment" value={sampleOwner.defaultPaymentMethod} />
              <InfoRow label="Mandate" value="Accepted at checkout" />
            </div>

            <div className="mt-8 rounded-2xl border border-cream/15 bg-cream/8 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-pie">Consent text</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-cream/68">{consentText}</p>
            </div>

            <button className="mt-6 w-full rounded-full border border-cream/20 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-cream/80">
              Manage payment method
            </button>
          </aside>

          <section className="space-y-4">
            {sampleOwner.hats.map((hat) => (
              <article key={hat.number} className="rounded-[2rem] border border-ink/10 bg-cream p-6 shadow-[0_18px_48px_rgba(22,21,18,0.08)]">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-pie">Owned number</p>
                    <h3 className="display mt-2 text-6xl font-black leading-none text-fairway">
                      #{String(hat.number).padStart(2, "0")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:min-w-72">
                    <Stat label="Donations" value={String(hat.donations)} />
                    <Stat label="Total given" value={formatMoney(hat.totalGivenCents)} />
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-ink/10 bg-cream-soft p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-ink/42">Selected charity</p>
                      <p className="mt-1 text-xl font-black text-fairway">{hat.charity}</p>
                    </div>
                    <button className="rounded-full bg-fairway px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-cream">
                      Change charity
                    </button>
                  </div>
                </div>
              </article>
            ))}

            <Link href="/store" className="block rounded-[2rem] border border-dashed border-pie/50 bg-pie/10 p-6 text-center text-sm font-black uppercase tracking-[0.18em] text-crust">
              Buy another number
            </Link>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cream/15 bg-cream/8 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cream/42">{label}</p>
      <p className="mt-2 break-all text-sm font-black text-cream/82">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-cream-soft p-4">
      <p className="display text-4xl font-black leading-none text-fairway">{value}</p>
      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-ink/42">{label}</p>
    </div>
  );
}
