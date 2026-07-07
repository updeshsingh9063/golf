import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Check if the email exists in our owners table
    const { data: owner, error } = await supabaseAdmin
      .from("owners")
      .select("id")
      .eq("email", email)
      .single();

    if (error || !owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    // Set the identity cookie (HTTP-only, secure in prod)
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'pfp_owner',
      value: email,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Identity endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
