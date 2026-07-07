import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const { data: hat, error } = await supabaseAdmin
      .from("hats")
      .select(`
        id,
        number,
        status,
        charities (
          id,
          name
        )
      `)
      .eq("qr_token", token)
      .single();

    if (error || !hat) {
      return NextResponse.json({ error: "Hat not found or invalid token" }, { status: 404 });
    }

    // Explicit typing/formatting for the response
    const charity = Array.isArray(hat.charities) ? hat.charities[0] : hat.charities;

    return NextResponse.json({
      hatId: hat.id,
      number: hat.number,
      status: hat.status,
      charityName: charity?.name || null,
      charityId: charity?.id || null,
    });
  } catch (error) {
    console.error("Scan token resolution error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
