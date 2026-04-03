// Slack MCP Plugin
export interface SlackConfig {
  botToken: string;
}

export async function sendMessage(config: SlackConfig, channel: string, text: string): Promise<{ ok: boolean; ts: string }> {
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ channel, text }),
  });
  return response.json();
}

export async function listChannels(config: SlackConfig): Promise<any[]> {
  const response = await fetch("https://slack.com/api/conversations.list", {
    headers: { "Authorization": `Bearer ${config.botToken}` },
  });
  return response.json();
}
