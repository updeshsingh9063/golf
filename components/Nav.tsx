import Link from "next/link";

export function Nav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 px-4 py-4 sm:px-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-ink/10 bg-cream/75 px-4 py-3 shadow-[0_16px_60px_rgba(22,21,18,0.12)] backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3" aria-label="PFP Golf home">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-fairway text-sm font-black text-cream">
            PFP
          </span>
          <span className="text-sm font-black uppercase tracking-[0.22em] text-fairway">
            Golf
          </span>
        </Link>
        <div className="flex items-center gap-2 text-sm font-bold">
          <Link href="/numbers" className="rounded-full px-4 py-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink">
            Numbers
          </Link>
          <Link href="/store" className="rounded-full px-4 py-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink">
            Store
          </Link>
          <Link href="/me" className="hidden rounded-full px-4 py-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink sm:inline-flex">
            Owner
          </Link>
          <Link href="/#how" className="hidden rounded-full px-4 py-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink sm:inline-flex">
            How it works
          </Link>
          <span className="rounded-full bg-pie px-4 py-2 text-cream shadow-[0_8px_24px_rgba(197,121,51,0.35)]">
            Phase 1
          </span>
        </div>
      </nav>
    </header>
  );
}
