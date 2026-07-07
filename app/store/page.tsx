import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { StoreCheckout } from "@/components/StoreCheckout";
import { supabase } from "@/lib/supabase";

export const revalidate = 30; // Re-fetch every 30 seconds

async function getStoreData() {
  const [hatsResult, charitiesResult] = await Promise.all([
    supabase
      .from("hats")
      .select("number, status")
      .in("status", ["available"])
      .order("number", { ascending: true }),
    supabase
      .from("charities")
      .select("id, name")
      .eq("active", true)
      .order("name", { ascending: true })
  ]);

  return {
    availableHats: (hatsResult.data ?? []) as { number: number; status: string }[],
    charities: (charitiesResult.data ?? []) as { id: string; name: string }[]
  };
}

export default async function StorePage() {
  const { availableHats, charities } = await getStoreData();

  return (
    <main>
      <Nav />

      <section className="px-6 pb-10 pt-32 md:pt-40">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-pie">Hat Store</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <h1 className="display max-w-5xl text-[clamp(4rem,10vw,9rem)] font-black leading-[0.82] text-fairway">
              Buy the hat. Save the card. Unlock the give.
            </h1>
            <p className="text-lg font-semibold leading-8 text-ink/68">
              The purchase flow captures a reusable payment method with your consent. The saved card powers the one-tap scan donation.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <StoreCheckout availableHats={availableHats} charities={charities} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
