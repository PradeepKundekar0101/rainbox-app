import { google } from "googleapis";
import { NextResponse } from "next/server";
import { initOauthCLient } from "@/lib/oauth";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Fetch tokens from database
    const { data: tokenData, error } = await supabase
      .from("gmail_tokens")
      .select("tokens")
      .eq("email", email)
      .single();

    if (error || !tokenData) {
      return NextResponse.json(
        { error: "No tokens found for this email" },
        { status: 401 }
      );
    }

    const oauth2Client = initOauthCLient(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
    oauth2Client.setCredentials(tokenData.tokens);

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const topicName = process.env.PUBSUB_TOPIC_NAME;

    console.log("Setting up watch with topic:", topicName);

    const response = await gmail.users.watch({
      userId: "me",
      requestBody: {
        topicName: topicName,
        labelIds: ["INBOX", "UNREAD", "STARRED"],
        labelFilterAction: "INCLUDE",
      },
    });

    console.log("Watch response:", {
      historyId: response.data.historyId,
      expiration: response.data.expiration,
      topicName: topicName,
    });

    await supabase.from("gmail_watch").upsert({
      email,
      history_id: response.data.historyId,
      expiration: new Date(Number(response.data.expiration)),
      updated_at: new Date().toISOString(),
    });

    const { data: verifyData, error: verifyError } = await supabase
      .from("gmail_watch")
      .select("history_id, expiration")
      .eq("email", email)
      .single();

    if (verifyError || !verifyData) {
      console.error("Watch verification error:", verifyError);
      throw new Error("Failed to verify watch storage");
    }

    return NextResponse.json({
      success: true,
      historyId: response.data.historyId,
      expiration: response.data.expiration,
      stored: {
        historyId: verifyData.history_id,
        expiration: verifyData.expiration,
      },
    });
  } catch (error: any) {
    console.error("Watch setup error:", {
      message: error.message,
      details: error.details,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to setup watch", details: error.message },
      { status: 500 }
    );
  }
}
