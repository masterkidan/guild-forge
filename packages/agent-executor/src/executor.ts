import { generateText, tool, jsonSchema, stepCountIs } from 'ai';
import { GuildEventSchema } from '@guild-forge/shared';
import type { AgentManifest } from '@guild-forge/shared';
import { loadAllTools, filterTools, executeTool, type McpServerConfig } from './mcp-registry.js';
import { createModel } from './model.js';

export async function executeJob(
  jobData: unknown,
  manifest: AgentManifest,
  mcpServers: McpServerConfig[],
): Promise<string> {
  const event = GuildEventSchema.parse(jobData);

  // Build tools with autonomy enforcement baked into each execute()
  const allTools = await loadAllTools(mcpServers);
  const allowedTools = filterTools(allTools, manifest.spec.tools);

  const tools = Object.fromEntries(
    allowedTools.map(({ tool: mcpTool, autonomy }) => [
      mcpTool.name.replace(/\./g, '__'),
      tool({
        description: mcpTool.description,
        inputSchema: jsonSchema<Record<string, unknown>>(mcpTool.inputSchema),
        execute: async (args: Record<string, unknown>) => {
          if (autonomy === 1) {
            console.warn(`[agent-executor] ${mcpTool.name} requires approval (autonomy=1), skipping`);
            return 'Tool execution requires human approval. Action has been queued.';
          }
          const result = await executeTool(mcpTool.name, args, mcpServers);
          if (autonomy === 2) {
            console.log(`[agent-executor] ${mcpTool.name} executed (autonomy=2, notify)`);
          }
          return result;
        },
      }),
    ]),
  );

  const { text } = await generateText({
    model: createModel(),
    system: manifest.spec.prompt,
    prompt: JSON.stringify(event, null, 2),
    tools,
    stopWhen: stepCountIs(10),  // handles the full tool-call loop automatically
  });

  return text;
}
