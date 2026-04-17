import { GuildEventSchema } from '@guild-forge/shared';
import type { AgentManifest } from '@guild-forge/shared';
import {
  loadAllTools,
  filterTools,
  executeTool,
  type McpServerConfig,
} from './mcp-registry.js';
import type { LlmProvider, ToolResult } from './llm-provider.js';

const MAX_TOOL_ROUNDS = 10;

export async function executeJob(
  jobData: unknown,
  manifest: AgentManifest,
  provider: LlmProvider,
  mcpServers: McpServerConfig[],
): Promise<string> {
  const event = GuildEventSchema.parse(jobData);

  const allTools = await loadAllTools(mcpServers);
  const allowedTools = filterTools(allTools, manifest.spec.tools);

  const normalizedTools = allowedTools.map(({ tool }) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));

  const session = provider.startSession({
    systemPrompt: manifest.spec.prompt,
    tools: normalizedTools,
    maxTokens: manifest.spec.resources.limits.tokensPerInvocation,
  });

  let turn = await session.send(JSON.stringify(event, null, 2));
  let rounds = 0;

  while (turn.type === 'tool_calls' && rounds < MAX_TOOL_ROUNDS) {
    const toolResults: ToolResult[] = await Promise.all(
      turn.calls.map(async (call) => {
        const permEntry = allowedTools.find(({ tool }) => tool.name === call.name);

        if (permEntry?.autonomy === 1) {
          console.warn(`[agent-executor] Tool ${call.name} requires approval (autonomy=1), skipping`);
          return {
            id: call.id,
            result: 'Tool execution requires human approval. Action has been queued.',
            isError: false,
          };
        }

        try {
          const result = await executeTool(call.name, call.input, mcpServers);
          if (permEntry?.autonomy === 2) {
            console.log(`[agent-executor] Tool ${call.name} executed (autonomy=2, notify)`);
          }
          return { id: call.id, result: JSON.stringify(result), isError: false };
        } catch (err) {
          console.error(`[agent-executor] Tool ${call.name} failed:`, err);
          return { id: call.id, result: String(err), isError: true };
        }
      }),
    );

    turn = await session.send(toolResults);
    rounds++;
  }

  if (turn.type === 'tool_calls') {
    console.warn(`[agent-executor] Hit max tool rounds (${MAX_TOOL_ROUNDS}) for ${manifest.metadata.name}`);
    return `Agent reached maximum tool call limit after ${MAX_TOOL_ROUNDS} rounds.`;
  }

  return turn.text;
}
