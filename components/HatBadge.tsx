import type { HatNumber } from "@/lib/numbers";

const statusStyles = {
  available: "border-fairway/20 bg-cream text-fairway",
  reserved: "border-pie/30 bg-pie/10 text-crust",
  sold: "border-fairway bg-fairway text-cream"
};

export function HatBadge({ hat }: { hat: HatNumber }) {
  return (
    <article
      className={`number-card rounded-3xl border p-4 transition duration-200 ${statusStyles[hat.status]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] opacity-60">No.</p>
          <h3 className="display text-5xl font-black leading-none">{String(hat.number).padStart(2, "0")}</h3>
        </div>
        <span className="rounded-full border border-current/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]">
          {hat.status}
        </span>
      </div>
      <p className="mt-5 min-h-10 text-sm font-semibold leading-snug opacity-75">
        {hat.charity ?? (hat.status === "reserved" ? "Checkout hold" : "Ready for owner + charity")}
      </p>
    </article>
  );
}
