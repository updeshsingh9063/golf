import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { brand, phaseOneNotes, phaseTwoNotes } from "@/lib/content";
import { stats } from "@/lib/numbers";

const steps = [
  {
    eyebrow: "01",
    title: "Buy your number",
    copy: "Pick a collector hat number. Phase 2 will connect this to Stripe Checkout and save a reusable payment method."
  },
  {
    eyebrow: "02",
    title: "Choose a food charity",
    copy: "Each sold number points to a chosen charity. Phase 1 seeds the shape; Phase 2 adds owner assignment."
  },
  {
    eyebrow: "03",
    title: "Scan after the round",
    copy: "The printed QR token resolves to the hat and charity. Phase 3 turns that into the one-tap $5 give."
  }
];

export default function Home() {
  return (
    <main>
      <Nav />

      <section className="relative overflow-hidden px-6 pb-20 pt-32 md:pb-28 md:pt-40">
        <div className="absolute right-[-14rem] top-16 h-[34rem] w-[34rem] rounded-full border border-fairway/15" />
        <div className="absolute right-[-8rem] top-32 h-[22rem] w-[22rem] rounded-full border border-pie/20" />

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <div className="mb-8 inline-flex rounded-full border border-fairway/15 bg-cream/60 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-fairway shadow-sm">
              {brand.fullName}
            </div>
            <h1 className="display max-w-5xl text-[clamp(4.4rem,12vw,10.5rem)] font-black leading-[0.82] text-fairway">
              Lose the round. Feed the room.
            </h1>
            <p className="mt-8 max-w-2xl text-xl font-semibold leading-8 text-ink/72">
              {brand.name} sells limited, individually numbered collector hats. The QR on each hat turns a friendly golf loss into a one-tap {brand.donationAmount} charity donation.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/store" className="rounded-full bg-fairway px-7 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-cream shadow-card transition hover:scale-[1.015]">
                Buy your number
              </Link>
              <Link href="/numbers" className="rounded-full border border-ink/15 bg-cream/60 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-ink transition hover:bg-cream">
                See what numbers are left
              </Link>
            </div>
          </div>

          <div className="grain rounded-[2.2rem] border border-ink/10 bg-fairway p-5 text-cream shadow-card">
            <div className="rounded-[1.65rem] border border-cream/15 bg-cream/8 p-6">
              <div className="flex items-center justify-between border-b border-cream/15 pb-5">
                <span className="text-xs font-black uppercase tracking-[0.24em] text-cream/60">Collector card</span>
                <span className="rounded-full bg-pie px-3 py-1 text-xs font-black">QR READY</span>
              </div>
              <div className="py-10">
                <p className="display text-[7rem] font-black leading-none">#42</p>
                <p className="mt-4 max-w-sm text-lg font-semibold leading-7 text-cream/76">
                  Wednesday Pantry selected. Scan token remains opaque; the raw number never becomes the QR payload.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Metric label="available" value={stats.available} />
                <Metric label="sold" value={stats.sold} />
                <Metric label="reserved" value={stats.reserved} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="border-y rule bg-cream/45 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-pie">How it works</p>
              <h2 className="display mt-4 text-6xl font-black leading-[0.9] text-fairway md:text-8xl">
                The store is the funnel.
              </h2>
              <p className="mt-6 text-lg font-semibold leading-8 text-ink/68">
                Phase 1 proves the shape: premium drop, live availability, and the database foundation. The one-tap donation engine follows after saved-card capture.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <article key={step.eyebrow} className="rounded-[2rem] border border-ink/10 bg-cream p-6 shadow-[0_18px_48px_rgba(22,21,18,0.08)]">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-pie">{step.eyebrow}</p>
                  <h3 className="mt-12 text-2xl font-black text-fairway">{step.title}</h3>
                  <p className="mt-4 text-sm font-semibold leading-6 text-ink/62">{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[2rem] border border-ink/10 bg-cream p-8 shadow-card">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-pie">Brand story</p>
            <h2 className="display mt-4 text-5xl font-black leading-none text-fairway md:text-7xl">
              Pies. Wednesdays. A hat that acts like a club.
            </h2>
            <p className="mt-6 text-lg font-semibold leading-8 text-ink/66">
              The homepage frames each number as membership, not merchandise. Final palette, type, logo, hat photography and box renders should be locked from the client Drive kit.
            </p>
          </div>

          <div className="rounded-[2rem] border border-ink/10 bg-ink p-8 text-cream shadow-card">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-pie">Build ships</p>
            <ul className="mt-8 space-y-4">
              {[...phaseOneNotes, ...phaseTwoNotes].map((note) => (
                <li key={note} className="flex gap-4 text-lg font-bold">
                  <span className="mt-1 h-3 w-3 rounded-full bg-pie" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.4rem] border border-fairway/15 bg-fairway text-cream shadow-card">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grain p-8 md:p-12">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-pie">Community teaser</p>
              <h2 className="display mt-4 text-6xl font-black leading-[0.86] md:text-8xl">
                Wednesday bragging rights, numbered forever.
              </h2>
            </div>
            <div className="border-t border-cream/15 p-8 md:p-12 lg:border-l lg:border-t-0">
              <p className="max-w-2xl text-xl font-semibold leading-9 text-cream/74">
                The v1 community layer stays editorial, not functional: a premium club-like promise around limited numbers, food charities and the ritual after a lost round.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <Metric label="per scan" value={5} />
                <Metric label="edition" value={stats.total} />
                <Metric label="charities" value={4} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-cream/15 bg-cream/8 p-4">
      <p className="display text-4xl font-black leading-none">{value}</p>
      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-cream/55">{label}</p>
    </div>
  );
}
