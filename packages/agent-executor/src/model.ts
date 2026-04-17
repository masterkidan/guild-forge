import { anthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

/**
 * Reads LLM config from env vars and returns an AI SDK LanguageModel.
 *
 * LLM_PROVIDER=anthropic  → uses ANTHROPIC_API_KEY + ANTHROPIC_MODEL
 * LLM_PROVIDER=ollama     → uses OLLAMA_BASE_URL + OLLAMA_MODEL (no key needed)
 */
export function createModel(): LanguageModel {
  const provider = process.env.LLM_PROVIDER ?? 'anthropic';

  if (provider === 'anthropic') {
    const model = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001';
    return anthropic(model);
  }

  // Ollama or any OpenAI-compatible endpoint
  const baseURL = process.env.OLLAMA_BASE_URL ?? 'http://host.minikube.internal:11434';
  const model = process.env.OLLAMA_MODEL ?? 'qwen2.5';
  const apiKey = process.env.OPENAI_COMPAT_API_KEY ?? 'ollama';

  const openai = createOpenAI({ baseURL: `${baseURL}/v1`, apiKey });
  return openai(model);
}
