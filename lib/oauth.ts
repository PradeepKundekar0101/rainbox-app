import { google } from "googleapis";

export const initOauthCLient = (
  clientId: string | undefined,
  clientSecret: string | undefined,
  redirectUrl: string | undefined
) => {
  if (!clientId || !clientSecret || !redirectUrl) {
    throw new Error("Missing required environment variables");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUrl
  );

  return oauth2Client;
};
