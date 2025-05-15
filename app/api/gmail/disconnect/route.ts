import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@/utils/supabase/server";
import { initOauthCLient } from "@/lib/oauth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: tokenData, error: tokenError } = await supabase
      .from("gmail_tokens")
      .select("*")
      .eq("email", user.email)
      .single();

    if (tokenError) {
      return NextResponse.json(
        { error: "No Gmail connection found" },
        { status: 404 }
      );
    }

    const oauth2Client = initOauthCLient(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
    oauth2Client.setCredentials(tokenData.tokens);

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    try {
      await gmail.users.stop({
        userId: "me",
      });
    } catch (error) {
      console.error("Error stopping Gmail watch:", error);
    }

    const { error: watchError } = await supabase
      .from("gmail_watch")
      .delete()
      .eq("email", tokenData.email);

    if (watchError) {
      console.error("Error deleting watch record:", watchError);
    }

    const { error: deleteError } = await supabase
      .from("gmail_tokens")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting token:", deleteError);
    }

    try {
      await oauth2Client.revokeToken(tokenData.tokens.access_token);
    } catch (error) {
      console.error("Error revoking token:", error);
    }

    const cookieStore = cookies();
    cookieStore.delete("consent_tokens");

    return NextResponse.json(
      {
        success: true,
        message: "Gmail disconnected successfully",
      },
      {
        headers: {
          "Set-Cookie":
            "consent_tokens=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        },
      }
    );
  } catch (error: any) {
    console.error("Disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Gmail" },
      { status: 500 }
    );
  }
}
