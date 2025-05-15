import { google } from "googleapis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { initOauthCLient } from "@/lib/oauth";
import { extractEmail } from "@/lib/gmail";

export async function POST(request: Request) {
  const supabase = await createClient();
  // todo: ignore emails which have already been processed
  try {
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user's Gmail senders with IDs
    const { data: senders, error: sendersError } = await supabase
      .from("senders")
      .select("id, email")
      .eq("user_id", user.id)
      .eq("mail_service", "gmail");

    if (sendersError || !senders) {
      return NextResponse.json(
        { error: "Failed to fetch senders" },
        { status: 500 }
      );
    }

    const cookieStore = cookies();
    const tokensCookie = cookieStore.get("consent_tokens");

    if (!tokensCookie) {
      return NextResponse.json(
        { error: "No authentication tokens found" },
        { status: 401 }
      );
    }

    const tokens = JSON.parse(tokensCookie.value);
    const oauth2Client = initOauthCLient(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const messagesRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 100,
    });

    if (messagesRes.data.messages) {
      const emailsToInsert = await Promise.all(
        messagesRes.data.messages.map(async (message) => {
          const msg = await gmail.users.messages.get({
            userId: "me",
            id: message.id!,
            format: "full",
          });

          const headers = msg.data.payload?.headers || [];
          const from = headers.find((h) => h.name === "From")?.value || "";
          const subject = headers.find((h) => h.name === "Subject")?.value;
          const date = headers.find((h) => h.name === "Date")?.value;

          // Extract email from "From" field
          const senderEmail = extractEmail(from);
          if (!senderEmail) return null;

          // Find matching sender from our database
          const sender = senders.find((s) => s.email === senderEmail);
          if (!sender) return null;

          // Extract body
          let body = "";
          if (msg.data.payload?.parts) {
            const textPart = msg.data.payload.parts.find(
              (part) => part.mimeType === "text/plain"
            );
            if (textPart?.body?.data) {
              body = Buffer.from(textPart.body.data, "base64").toString();
            }
          } else if (msg.data.payload?.body?.data) {
            body = Buffer.from(msg.data.payload.body.data, "base64").toString();
          }

          return {
            user_id: user.id,
            sender_id: sender.id,
            subject: subject || null,
            body: body || null,
          };
        })
      );

      // Filter out nulls and insert valid emails
      const validEmails = emailsToInsert.filter(Boolean);
      if (validEmails.length > 0) {
        const { error: insertError } = await supabase
          .from("mails")
          .upsert(validEmails);

        if (insertError) {
          console.error("Error inserting emails:", insertError);
          return NextResponse.json(
            { error: "Failed to save emails" },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        processed: validEmails.length,
        total: messagesRes.data.messages.length,
      });
    }

    return NextResponse.json({ success: true, processed: 0, total: 0 });
  } catch (error: any) {
    console.error("Error processing emails:", error);
    return NextResponse.json(
      { error: "Failed to process emails", details: error.message },
      { status: 500 }
    );
  }
}
