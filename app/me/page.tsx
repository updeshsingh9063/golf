import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { consentText } from "@/lib/content";
import { formatMoney } from "@/lib/commerce";
import { supabaseAdmin } from "@/lib/supabase";

async function getOwnerByHatNumber(hatNumber: number) {
  const { data: hat } = await supabaseAdmin
    .from("hats")
    .select(`
      id,
      number,
      status,
      charity:charities(id, name),
      owner:owners(id, email, stripe_customer_id, default_pm_id)
    `)
    .eq("number", hatNumber)
    .single();

  if (!hat?.owner) return null;

  const owner = Array.isArray(hat.owner) ? hat.owner[0] : hat.owner as {
    id: string; email: string; stripe_customer_id: string | null; default_pm_id: string | null;
  };

  // All hats this owner owns
  const { data: allHats } = await supabaseAdmin
    .from("hats")
    .select(`id, number, charity:charities(id, name)`)
    .eq("owner_id", owner.id)
    .eq("status", "sold")
    .order("number", { ascending: true });

  const hatIds = (allHats ?? []).map((h) => h.id);

  const { data: donations } = hatIds.length
    ? await supabaseAdmin
        .from("donations")
        .select("hat_id, amount_cents")
        .in("hat_id", hatIds)
        .eq("status", "succeeded")
    : { data: [] };

  const donationsByHat = new Map<string, { count: number; totalCents: number }>();
  for (const d of donations ?? []) {
    const cur = donationsByHat.get(d.hat_id) ?? { count: 0, totalCents: 0 };
    donationsByHat.set(d.hat_id, { count: cur.count + 1, totalCents: cur.totalCents + d.amount_cents });
  }

  return {
    id: owner.id,
    email: owner.email,
    stripeCustomerId: owner.stripe_customer_id,
    defaultPmId: owner.default_pm_id,
    hats: (allHats ?? []).map((h) => {
      const stats = donationsByHat.get(h.id) ?? { count: 0, totalCents: 0 };
      const charityRecord = Array.isArray(h.charity) ? h.charity[0] : h.charity as { name: string } | null;
      return { id: h.id, number: h.number, charity: charityRecord?.name ?? "No charity assigned", donations: stats.count, totalGivenCents: stats.totalCents };
    })
  };
}

export default async function OwnerPage({ searchParams }: { searchParams: Promise<{ number?: string; checkout?: string }> }) {
  const params = await searchParams;
  const hatNumber = Number(params.number ?? 0);
  const isSuccess = params.checkout === "success";

  const owner = hatNumber ? await getOwnerByHatNumber(hatNumber) : null;

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
              Owned numbers, charity assignments, donation history and your saved payment method.
            </p>
          </div>
        </div>
      </section>

      {isSuccess && (
        <section className="px-6 pb-4">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-fairway/30 bg-fairway/10 p-5">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-fairway">🎉 Purchase successful!</p>
              <p className="mt-1 text-sm font-semibold text-ink/68">Your hat is confirmed and your card is saved for one-tap donations.</p>
            </div>
          </div>
        </section>
      )}

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          {!owner ? (
            <div className="rounded-[2rem] border border-ink/10 bg-cream p-12 text-center shadow-card">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-pie">No owner found</p>
              <h2 className="display mt-4 text-5xl font-black leading-none text-fairway">No hat found.</h2>
              <p className="mt-4 text-lg font-semibold text-ink/60">
                {hatNumber ? `Hat #${hatNumber} has not been purchased yet or the number is invalid.` : "Please complete a purchase to access your owner area."}
              </p>
              <Link href="/store" className="mt-8 inline-block rounded-full bg-fairway px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-cream">
                Buy a hat
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
              <aside className="rounded-[2rem] border border-ink/10 bg-fairway p-6 text-cream shadow-card">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-cream/45">Owner identity</p>
                <h2 className="mt-4 text-3xl font-black">{owner.email}</h2>

                <div className="mt-8 space-y-3">
                  <InfoRow label="Stripe customer" value={owner.stripeCustomerId ?? "Pending"} />
                  <InfoRow label="Default payment" value={owner.defaultPmId ? `Saved (${owner.defaultPmId.slice(0, 14)}…)` : "Not yet saved"} />
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
                {owner.hats.map((hat) => (
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
          )}
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

