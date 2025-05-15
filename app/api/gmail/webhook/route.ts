import { google } from "googleapis";
import { NextResponse } from "next/server";
import { initOauthCLient } from "@/lib/oauth";
import { createClient } from "@/utils/supabase/server";
import { extractEmail } from "@/lib/gmail";

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const data = await request.json();
    const { message } = data;

    // Decode the message data from Pub/Sub
    const decodedData = JSON.parse(
      Buffer.from(message.data, "base64").toString()
    );

    const { emailAddress, historyId } = decodedData;

    // Fetch tokens and last history ID
    const { data: watchData } = await supabase
      .from("gmail_watch")
      .select("history_id")
      .eq("email", emailAddress)
      .single();

    const { data: tokenData } = await supabase
      .from("gmail_tokens")
      .select("tokens")
      .eq("email", emailAddress)
      .single();

    if (!tokenData) {
      throw new Error("No tokens found for this email");
    }

    const oauth2Client = initOauthCLient(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
    oauth2Client.setCredentials(tokenData.tokens);

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const history = await gmail.users.history.list({
      userId: "me",
      startHistoryId: watchData?.history_id || historyId,
    });

    const { data: tokenUser, error: tokenError } = await supabase
      .from("users")
      .select("id")
      .eq("email", emailAddress)
      .single();

    if (tokenError) {
      console.error("Error fetching token user:", tokenError);
      throw new Error("Failed to fetch user");
    }

    const { data: userSenders, error: sendersError } = await supabase
      .from("senders")
      .select(
        `
        id,
        email,
        user_id
      `
      )
      .eq("mail_service", "gmail")
      .eq("user_id", tokenUser.id);

    if (sendersError) {
      console.error("Error fetching senders:", sendersError);
      throw new Error("Failed to fetch senders");
    }

    // Process new messages
    const newMessages = [];
    for (const record of history.data.history || []) {
      for (const message of record.messagesAdded || []) {
        if (!message.message?.id) continue;

        const msg = await gmail.users.messages.get({
          userId: "me",
          id: message.message.id,
          format: "full",
        });

        const headers = msg.data.payload?.headers || [];
        const from = headers.find((h) => h.name === "From")?.value || "";
        const subject = headers.find((h) => h.name === "Subject")?.value;
        const date = headers.find((h) => h.name === "Date")?.value;

        const senderEmail = extractEmail(from);
        console.log("Sender email:", senderEmail);

        // Check if sender is tracked and return early if not
        const sender = userSenders?.find((s) => s.email === senderEmail);
        if (!sender) {
          console.log(`Skipping email: Sender ${senderEmail} not tracked`);
          return NextResponse.json({
            success: true,
            message: `Skipping email: Sender ${senderEmail} not tracked`,
            processed: 0,
          });
        }

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

        // Save the email using user_id from senders
        const { error: mailError } = await supabase.from("mails").insert({
          user_id: sender.user_id, // Using user_id from sender
          sender_id: sender.id,
          subject: subject || null,
          body: body || null,
          read: false,
          created_at: date
            ? new Date(date).toISOString()
            : new Date().toISOString(),
        });

        if (mailError) {
          console.error("Error saving mail:", mailError);
          continue;
        }

        newMessages.push({
          id: msg.data.id,
          threadId: msg.data.threadId,
          from,
          subject,
          date,
          body,
          sender_id: sender.id,
        });
      }
    }

    // Update the history ID
    if (history.data.historyId) {
      await supabase
        .from("gmail_watch")
        .update({
          history_id: history.data.historyId,
          updated_at: new Date().toISOString(),
        })
        .eq("email", emailAddress);
    }

    return NextResponse.json({
      success: true,
      messages: newMessages,
      processedCount: newMessages.length,
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}
