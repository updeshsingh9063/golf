import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const hatNumber = Number(searchParams.get("number"));

  if (!hatNumber) {
    return NextResponse.json({ error: "Hat number required." }, { status: 400 });
  }

  // Find the hat and its owner
  const { data: hat, error: hatError } = await supabaseAdmin
    .from("hats")
    .select(`
      id,
      number,
      status,
      qr_token,
      charity:charities(id, name),
      owner:owners(id, email, stripe_customer_id, default_pm_id)
    `)
    .eq("number", hatNumber)
    .single();

  if (hatError || !hat) {
    return NextResponse.json({ error: "Hat not found." }, { status: 404 });
  }

  if (!hat.owner || Array.isArray(hat.owner) && hat.owner.length === 0) {
    return NextResponse.json({ error: "No owner found for this hat." }, { status: 404 });
  }

  const owner = Array.isArray(hat.owner) ? hat.owner[0] : hat.owner;

  // Fetch all hats this owner owns
  const { data: allHats } = await supabaseAdmin
    .from("hats")
    .select(`
      id,
      number,
      status,
      charity:charities(id, name)
    `)
    .eq("owner_id", owner.id)
    .eq("status", "sold");

  // Fetch donation stats per hat
  const hatIds = (allHats ?? []).map((h) => h.id);
  const { data: donations } = hatIds.length
    ? await supabaseAdmin
        .from("donations")
        .select("hat_id, amount_cents, status")
        .in("hat_id", hatIds)
        .eq("status", "succeeded")
    : { data: [] };

  const donationsByHat = new Map<string, { count: number; totalCents: number }>();
  for (const d of donations ?? []) {
    const current = donationsByHat.get(d.hat_id) ?? { count: 0, totalCents: 0 };
    donationsByHat.set(d.hat_id, {
      count: current.count + 1,
      totalCents: current.totalCents + d.amount_cents
    });
  }

  const hatsWithStats = (allHats ?? []).map((h) => {
    const stats = donationsByHat.get(h.id) ?? { count: 0, totalCents: 0 };
    const charityRecord = Array.isArray(h.charity) ? h.charity[0] : h.charity;
    return {
      id: h.id,
      number: h.number,
      charity: charityRecord?.name ?? null,
      donations: stats.count,
      totalGivenCents: stats.totalCents
    };
  });

  return NextResponse.json({
    owner: {
      id: owner.id,
      email: owner.email,
      stripeCustomerId: owner.stripe_customer_id,
      defaultPmId: owner.default_pm_id,
      hats: hatsWithStats
    },
    source: "supabase"
  });
}
