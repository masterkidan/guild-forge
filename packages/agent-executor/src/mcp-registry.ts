import type { ToolPermission } from '@guild-forge/shared';

export interface McpServerConfig {
  name: string;   // namespace prefix, e.g. "jira", "github", "slack"
  url: string;    // HTTP MCP server base URL
}

export interface McpTool {
  name: string;              // fully-qualified: "jira.create_issue"
  description: string;
  inputSchema: Record<string, unknown>;
}

export function parseMcpServers(raw: string | undefined): McpServerConfig[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as McpServerConfig[];
  } catch {
    console.error('[mcp-registry] Failed to parse MCP_SERVERS env var');
    return [];
  }
}

async function fetchServerTools(server: McpServerConfig): Promise<McpTool[]> {
  try {
    const res = await fetch(`${server.url}/tools`);
    if (!res.ok) {
      console.warn(`[mcp-registry] ${server.name} tools fetch failed: ${res.status}`);
      return [];
    }
    const body = await res.json() as {
      tools: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>;
    };
    return body.tools.map((t) => ({
      name: `${server.name}.${t.name}`,
      description: t.description,
      inputSchema: t.inputSchema,
    }));
  } catch (err) {
    console.warn(`[mcp-registry] Failed to connect to MCP server ${server.name}:`, err);
    return [];
  }
}

export async function loadAllTools(servers: McpServerConfig[]): Promise<McpTool[]> {
  const results = await Promise.all(servers.map(fetchServerTools));
  return results.flat();
}

function matchesPattern(toolName: string, pattern: string): boolean {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`).test(toolName);
}

export function filterTools(
  allTools: McpTool[],
  permissions: ToolPermission[],
): Array<{ tool: McpTool; autonomy: number }> {
  return allTools.flatMap((tool) => {
    for (const perm of permissions) {
      if (matchesPattern(tool.name, perm.pattern)) {
        const autonomy = perm.autonomy ?? 3;
        if (autonomy === 0) return [];
        return [{ tool, autonomy }];
      }
    }
    return [];
  });
}

export async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  servers: McpServerConfig[],
): Promise<unknown> {
  // Tool names use __ separator in AI SDK; normalize back to dot notation
  const normalized = toolName.replace(/__/g, '.');
  const dotIndex = normalized.indexOf('.');
  if (dotIndex === -1) throw new Error(`Invalid tool name: ${toolName}`);

  const serverName = normalized.slice(0, dotIndex);
  const methodName = normalized.slice(dotIndex + 1);

  const server = servers.find((s) => s.name === serverName);
  if (!server) throw new Error(`No MCP server configured for: ${serverName}`);

  const res = await fetch(`${server.url}/tools/${encodeURIComponent(methodName)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MCP tool ${normalized} failed (${res.status}): ${text}`);
  }

  return res.json();
}
