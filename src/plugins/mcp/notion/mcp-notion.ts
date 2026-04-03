// Notion MCP Plugin
export interface NotionConfig {
  apiKey: string;
  databaseId?: string;
}

export async function createPage(config: NotionConfig, title: string, content: string): Promise<{ id: string }> {
  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.apiKey}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: config.databaseId },
      properties: {
        Name: { title: [{ text: { content: title } }] },
      },
      children: [{ object: "block", paragraph: { rich_text: [{ text: { content } }] } }],
    }),
  });
  return response.json();
}

export async function queryDatabase(config: NotionConfig): Promise<any[]> {
  const response = await fetch(`https://api.notion.com/v1/databases/${config.databaseId}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.apiKey}`,
      "Notion-Version": "2022-06-28",
    },
  });
  return response.json();
}
