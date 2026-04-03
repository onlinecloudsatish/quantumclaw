// GitHub MCP Plugin
export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

export async function createIssue(config: GitHubConfig, title: string, body: string): Promise<{ number: number }> {
  const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/issues`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.token}`,
      "Accept": "application/vnd.github.v3+json",
    },
    body: JSON.stringify({ title, body }),
  });
  return response.json();
}

export async function listIssues(config: GitHubConfig, state: "open" | "closed" = "open"): Promise<any[]> {
  const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/issues?state=${state}`, {
    headers: { "Authorization": `Bearer ${config.token}` },
  });
  return response.json();
}

export async function createPullRequest(config: GitHubConfig, title: string, body: string, head: string, base: string = "main"): Promise<{ number: number }> {
  const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/pulls`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.token}`,
      "Accept": "application/vnd.github.v3+json",
    },
    body: JSON.stringify({ title, body, head, base }),
  });
  return response.json();
}
