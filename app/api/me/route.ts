import { NextResponse } from "next/server";
import { sampleOwner } from "@/lib/commerce";

export async function GET() {
  return NextResponse.json({
    owner: sampleOwner,
    source: "phase-two-preview"
  });
}
