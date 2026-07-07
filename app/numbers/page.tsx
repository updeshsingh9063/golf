import Link from "next/link";
import { Footer } from "@/components/Footer";
import { HatBadge } from "@/components/HatBadge";
import { Nav } from "@/components/Nav";
import { supabaseAdmin } from "@/lib/supabase";

import { HatNumber } from "@/lib/numbers";

export const revalidate = 0; // Disable cache for live availability

export default async function NumbersPage() {
  const { data: hatsData } = await supabaseAdmin
    .from("hats")
    .select("number, status, charities(name)")
    .order("number", { ascending: true });

  const hats: HatNumber[] = (hatsData || []).map((row: any) => ({
    number: row.number,
    status: row.status,
    charity: row.charities?.name || null,
    ownerLabel: row.status === "sold" ? `Owner ${String(row.number).padStart(2, "0")}` : null,
  }));

  const stats = {
    available: hats.filter((h) => h.status === "available").length,
    sold: hats.filter((h) => h.status === "sold").length,
    reserved: hats.filter((h) => h.status === "reserved").length,
    total: hats.length || 72,
  };

  return (
    <main>
      <Nav />

      <section className="px-6 pb-10 pt-32 md:pt-40">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-pie">Live availability</p>
              <h1 className="display mt-4 max-w-4xl text-[clamp(4rem,11vw,9rem)] font-black leading-[0.82] text-fairway">
                Pick a number. Keep the ritual.
              </h1>
            </div>
            <div className="rounded-[2rem] border border-ink/10 bg-cream p-6 shadow-card">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-ink/45">Phase 1 note</p>
              <p className="mt-4 text-lg font-semibold leading-8 text-ink/68">
                This grid is read-only and seeded from the data model. Available numbers can be selected in the Phase 2 store flow.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <StatusPill label="Available" value={stats.available} />
            <StatusPill label="Reserved" value={stats.reserved} />
            <StatusPill label="Sold" value={stats.sold} />
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y rule py-4">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-fairway">
              Edition count: {stats.total}
            </p>
            <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-pie underline decoration-pie/30 underline-offset-4">
              Back to storefront
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {hats.map((hat) => (
              <HatBadge key={hat.number} hat={hat} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function StatusPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-full border border-ink/10 bg-cream/70 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-black uppercase tracking-[0.2em] text-ink/50">{label}</span>
        <span className="display text-4xl font-black leading-none text-fairway">{value}</span>
      </div>
    </div>
  );
}
