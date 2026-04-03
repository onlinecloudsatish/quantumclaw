// Gmail MCP Plugin
export interface GmailConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export async function sendEmail(config: GmailConfig, to: string, subject: string, body: string): Promise<{ messageId: string }> {
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages.send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.refreshToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw: Buffer.from(`To: ${to}\nSubject: ${subject}\n\n${body}`).toString("base64"),
    }),
  });
  return response.json();
}

export async function listEmails(config: GmailConfig, maxResults: number = 10): Promise<any[]> {
  // Placeholder - requires full Gmail API setup
  return [];
}
