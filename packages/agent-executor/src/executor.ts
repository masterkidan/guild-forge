import Anthropic from '@anthropic-ai/sdk';
import { GuildEventSchema } from '@guild-forge/shared';
import type { AgentManifest } from '@guild-forge/shared';
import {
  loadAllTools,
  filterTools,
  toAnthropicTools,
  executeTool,
  type McpServerConfig,
} from './mcp-registry';

const MAX_TOOL_ROUNDS = 10;

export async function executeJob(
  jobData: unknown,
  manifest: AgentManifest,
  anthropic: Anthropic,
  mcpServers: McpServerConfig[],
): Promise<string> {
  const event = GuildEventSchema.parse(jobData);

  // Load and filter tools based on manifest permissions
  const allTools = await loadAllTools(mcpServers);
  const allowedTools = filterTools(allTools, manifest.spec.tools);
  const anthropicTools = toAnthropicTools(allowedTools);

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: JSON.stringify(event, null, 2) },
  ];

  let rounds = 0;

  while (rounds < MAX_TOOL_ROUNDS) {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: manifest.spec.resources.limits.tokensPerInvocation,
      system: manifest.spec.prompt,
      tools: anthropicTools.length > 0 ? anthropicTools : undefined,
      messages,
    });

    if (response.stop_reason === 'end_turn' || response.stop_reason !== 'tool_use') {
      const textBlock = response.content.find((b) => b.type === 'text');
      return textBlock?.type === 'text' ? textBlock.text : '';
    }

    // Collect all tool_use blocks
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    );

    // Add assistant turn to history
    messages.push({ role: 'assistant', content: response.content });

    // Execute all tool calls and collect results
    const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
      toolUseBlocks.map(async (block) => {
        const permEntry = allowedTools.find(
          ({ tool }) => tool.name.replace('.', '__') === block.name,
        );

        // autonomy=1: queue for approval — for now log and skip execution
        if (permEntry?.autonomy === 1) {
          console.warn(
            `[agent-executor] Tool ${block.name} requires approval (autonomy=1), skipping`,
          );
          return {
            type: 'tool_result' as const,
            tool_use_id: block.id,
            content: 'Tool execution requires human approval. Action has been queued.',
            is_error: false,
          };
        }

        try {
          const result = await executeTool(
            block.name,
            block.input as Record<string, unknown>,
            mcpServers,
          );

          if (permEntry?.autonomy === 2) {
            console.log(`[agent-executor] Tool ${block.name} executed (autonomy=2, notify)`);
          }

          return {
            type: 'tool_result' as const,
            tool_use_id: block.id,
            content: JSON.stringify(result),
            is_error: false,
          };
        } catch (err) {
          console.error(`[agent-executor] Tool ${block.name} failed:`, err);
          return {
            type: 'tool_result' as const,
            tool_use_id: block.id,
            content: String(err),
            is_error: true,
          };
        }
      }),
    );

    messages.push({ role: 'user', content: toolResults });
    rounds++;
  }

  console.warn(`[agent-executor] Hit max tool rounds (${MAX_TOOL_ROUNDS}) for ${manifest.metadata.name}`);
  return `Agent reached maximum tool call limit after ${MAX_TOOL_ROUNDS} rounds.`;
}
