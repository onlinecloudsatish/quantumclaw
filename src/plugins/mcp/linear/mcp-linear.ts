// Linear Issue Tracking MCP Plugin
export interface LinearConfig {
  apiKey: string;
  teamId?: string;
}

export interface IssueInput {
  title: string;
  description?: string;
  priority?: number;
}

export async function createIssue(config: LinearConfig, issue: IssueInput): Promise<{ id: string }> {
  const response = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Authorization": `${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation CreateIssue($input: IssueCreateInput!) { issueCreate(input: $input) { success id } }`,
      variables: { input: { ...issue, teamId: config.teamId } },
    }),
  });
  return response.json();
}

export async function listIssues(config: LinearConfig): Promise<any[]> {
  return [];
}
