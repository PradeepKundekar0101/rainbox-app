import { initOauthCLient } from "@/lib/oauth";
import { google } from "googleapis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/gmail/senders?pageToken={nextPageToken}&pageSize=50
 * Takes in cookie for token and uses it to make the request, makes sure it only returns uniue senders for each page
 * query params:
 * - pageToken: string | undefined (the token for the next page of results)
 * - pageSize: number | undefined (the number of records processed in one request)
 */
export async function GET(request: Request) {
  try {
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
    const url = new URL(request.url);
    const pageToken = url.searchParams.get("pageToken");
    const pageSize = Math.min(
      Number(url.searchParams.get("pageSize")) || 100,
      100
    );

    const senderMap = new Map();
    let nextPageToken = pageToken || undefined;
    let hasMore = true;
    let totalProcessed = 0;

    const messagesRes = await gmail.users.messages.list({
      userId: "me",
      pageToken: nextPageToken,
      maxResults: pageSize,
    });

    const messages = messagesRes.data.messages || [];
    await Promise.all(
      messages.map(async (message) => {
        if (!message.id) return;

        const msg = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
          format: "metadata",
          metadataHeaders: ["From"],
        });

        const fromHeader = msg.data.payload?.headers?.find(
          (h) => h.name === "From"
        );
        if (fromHeader) {
          const from = fromHeader.value;
          const match = from?.match(/(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)/);
          if (match) {
            const name = match[1] || "";
            const email = match[2];
            senderMap.set(email, { name, email, fullName: from });
          }
        }
        totalProcessed++;
      })
    );

    return NextResponse.json({
      senders: Array.from(senderMap.values()),
      nextPageToken: messagesRes.data.nextPageToken,
      pageInfo: {
        currentPage: pageToken ? parseInt(pageToken) : 1,
        pageSize: pageSize,
        totalProcessed,
        hasNextPage: !!messagesRes.data.nextPageToken,
      },
    });
  } catch (error: any) {
    console.error("Error fetching senders:", error);
    return NextResponse.json(
      { error: "Failed to fetch senders", details: error.message },
      { status: 500 }
    );
  }
}
