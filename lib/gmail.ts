export function extractEmailData(message: any) {
  try {
    const headers = message.data.payload.headers;
    const subject = headers.find((h: any) => h.name === "Subject")?.value;
    const from = headers.find((h: any) => h.name === "From")?.value;
    const date = headers.find((h: any) => h.name === "Date")?.value;

    let body = "";
    if (message.data.payload.parts) {
      const textPart = message.data.payload.parts.find(
        (part: any) => part.mimeType === "text/plain"
      );
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, "base64").toString();
      }
    } else if (message.data.payload.body.data) {
      body = Buffer.from(message.data.payload.body.data, "base64").toString();
    }

    return {
      id: message.data.id,
      threadId: message.data.threadId,
      subject,
      from,
      date,
      body,
    };
  } catch (error) {
    console.error("Error extracting email data:", error);
    return null;
  }
}

export function extractEmail(from: string): string | null {
  const emailRegex = /<([^>]+)>|([^\s<]+@[^\s>]+)/;
  const match = from.match(emailRegex);
  return match ? match[1] || match[2] : null;
}
