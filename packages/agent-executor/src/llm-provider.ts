import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// ─── Shared types ───────────────────────────────────────────────────────────

export interface NormalizedTool {
  name: string;          // dot notation: "jira.create_issue"
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;          // dot notation
  input: Record<string, unknown>;
}

export interface ToolResult {
  id: string;
  result: string;
  isError: boolean;
}

export type TurnResult =
  | { type: 'text'; text: string }
  | { type: 'tool_calls'; calls: ToolCall[] };

/** A stateful conversation session. Call send() once with the user message,
 *  then repeatedly with tool results until you get a 'text' response. */
export interface LlmSession {
  send(input: string | ToolResult[]): Promise<TurnResult>;
}

export interface LlmProvider {
  startSession(params: {
    systemPrompt: string;
    tools: NormalizedTool[];
    maxTokens: number;
  }): LlmSession;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Tool names can't contain dots in either Anthropic or OpenAI APIs */
const toApiName = (name: string) => name.replace(/\./g, '__');
const fromApiName = (name: string) => name.replace(/__/g, '.');

// ─── Anthropic provider ─────────────────────────────────────────────────────

export function createAnthropicProvider(apiKey: string, model: string): LlmProvider {
  const client = new Anthropic({ apiKey });

  return {
    startSession({ systemPrompt, tools, maxTokens }) {
      const anthropicTools: Anthropic.Tool[] = tools.map((t) => ({
        name: toApiName(t.name),
        description: t.description,
        input_schema: t.inputSchema as Anthropic.Tool['input_schema'],
      }));

      const messages: Anthropic.MessageParam[] = [];

      return {
        async send(input) {
          if (typeof input === 'string') {
            messages.push({ role: 'user', content: input });
          } else {
            // tool results
            const results: Anthropic.ToolResultBlockParam[] = input.map((r) => ({
              type: 'tool_result',
              tool_use_id: r.id,
              content: r.result,
              is_error: r.isError,
            }));
            messages.push({ role: 'user', content: results });
          }

          const response = await client.messages.create({
            model,
            max_tokens: maxTokens,
            system: systemPrompt,
            tools: anthropicTools.length > 0 ? anthropicTools : undefined,
            messages,
          });

          // Add assistant turn to history
          messages.push({ role: 'assistant', content: response.content });

          if (response.stop_reason === 'tool_use') {
            const calls: ToolCall[] = response.content
              .filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
              .map((b) => ({
                id: b.id,
                name: fromApiName(b.name),
                input: b.input as Record<string, unknown>,
              }));
            return { type: 'tool_calls', calls };
          }

          const textBlock = response.content.find((b) => b.type === 'text');
          return {
            type: 'text',
            text: textBlock?.type === 'text' ? textBlock.text : '',
          };
        },
      };
    },
  };
}

// ─── OpenAI-compatible provider (Ollama, OpenAI, etc.) ──────────────────────

export function createOpenAiCompatProvider(
  baseURL: string,
  model: string,
  apiKey = 'ollama',
): LlmProvider {
  const client = new OpenAI({ baseURL, apiKey });

  return {
    startSession({ systemPrompt, tools, maxTokens }) {
      const openAiTools: OpenAI.Chat.ChatCompletionTool[] = tools.map((t) => ({
        type: 'function',
        function: {
          name: toApiName(t.name),
          description: t.description,
          parameters: t.inputSchema,
        },
      }));

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
      ];

      return {
        async send(input) {
          if (typeof input === 'string') {
            messages.push({ role: 'user', content: input });
          } else {
            // tool results
            for (const r of input) {
              messages.push({
                role: 'tool',
                tool_call_id: r.id,
                content: r.result,
              });
            }
          }

          const response = await client.chat.completions.create({
            model,
            max_tokens: maxTokens,
            tools: openAiTools.length > 0 ? openAiTools : undefined,
            messages,
          });

          const choice = response.choices[0];
          if (!choice) throw new Error('Empty response from LLM');

          // Add assistant turn to history
          messages.push(choice.message);

          if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls?.length) {
            const calls: ToolCall[] = choice.message.tool_calls.map((tc) => ({
              id: tc.id,
              name: fromApiName(tc.function.name),
              input: JSON.parse(tc.function.arguments || '{}') as Record<string, unknown>,
            }));
            return { type: 'tool_calls', calls };
          }

          return {
            type: 'text',
            text: choice.message.content ?? '',
          };
        },
      };
    },
  };
}
