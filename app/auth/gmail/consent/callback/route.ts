import { google } from "googleapis";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { initOauthCLient } from "@/lib/oauth";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const oauth2Client = initOauthCLient(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      throw new Error("No code provided");
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    console.log("Attempting to store tokens for email:", userInfo.email);

    // Store tokens with explicit type casting
    await supabase.from("gmail_tokens").upsert(
      {
        email: userInfo.email as string,
        tokens: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          scope: tokens.scope,
          token_type: tokens.token_type,
          expiry_date: tokens.expiry_date,
        },
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "email",
      }
    );

    // Verify token storage
    const { data: verifyData, error: verifyError } = await supabase
      .from("gmail_tokens")
      .select("tokens")
      .eq("email", userInfo.email)
      .single();

    if (verifyError || !verifyData) {
      console.error("Token verification error:", verifyError);
      throw new Error("Failed to verify token storage");
    }

    const response = NextResponse.json({
      success: true,
      email: userInfo.email,
    });

    response.cookies.set({
      name: "consent_tokens",
      value: JSON.stringify(tokens),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("Full error object:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.details || "No additional details",
      },
      { status: 500 }
    );
  }
}
