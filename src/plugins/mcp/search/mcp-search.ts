// Search MCP Plugin (Brave Search)
export interface SearchConfig {
  apiKey: string;
}

export async function searchWeb(config: SearchConfig, query: string, count: number = 10): Promise<{ results: Array<{ title: string; url: string; snippet: string }> }> {
  const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`, {
    headers: {
      "Accept": "application/json",
      "X-Subscription-Token": config.apiKey,
    },
  });
  return response.json();
}
