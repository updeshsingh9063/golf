import { NextResponse } from "next/server";
import { hats, stats } from "@/lib/numbers";

export async function GET() {
  return NextResponse.json({
    hats,
    stats,
    source: "phase-one-seed"
  });
}
