import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ScanConfirm } from "@/components/ScanConfirm";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

async function getScanData(token: string) {
  const host = (await headers()).get("host");
  // Ensure we use https in production, http in local dev
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  
  const res = await fetch(`${protocol}://${host}/api/scan/${token}`, {
    cache: "no-store"
  });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to fetch scan data");
  }
  
  return res.json();
}

export default async function ScanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const scanData = await getScanData(token);

  if (!scanData) {
    notFound();
  }

  // Check if owner is already identified via cookie
  const cookieStore = await cookies();
  const ownerEmail = cookieStore.get("pfp_owner")?.value;

  return (
    <main className="flex min-h-screen flex-col bg-cream-soft">
      <Nav />
      
      <div className="flex flex-1 flex-col justify-center px-6 py-32 md:py-40">
        <div className="mx-auto w-full max-w-xl rounded-[2.5rem] border border-ink/10 bg-cream p-8 shadow-card sm:p-12">
          {scanData.status === "available" ? (
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-pie">Not Sold Yet</p>
              <h1 className="display mt-4 text-4xl font-black leading-none text-fairway">
                Hat #{String(scanData.number).padStart(2, "0")} is available.
              </h1>
              <p className="mt-4 text-sm font-semibold text-ink/60">
                You cannot scan to donate until this hat is owned and registered.
              </p>
              <a href="/store" className="mt-8 block rounded-full bg-fairway px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-cream shadow-card">
                Buy this hat
              </a>
            </div>
          ) : (
            <ScanConfirm 
              token={token} 
              hatNumber={scanData.number} 
              charityName={scanData.charityName}
              hasOwnerSession={!!ownerEmail}
            />
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
