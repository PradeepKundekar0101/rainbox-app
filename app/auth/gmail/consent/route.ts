import { NextResponse } from "next/server";
import { google } from "googleapis";
import { initOauthCLient } from "@/lib/oauth";

export async function GET(request: Request) {
  const oauth2Client = initOauthCLient(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });

  return NextResponse.json({ url });
}
