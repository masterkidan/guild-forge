/**
 * Agent Manifest - K8s-style YAML definition for Guild agents.
 */
export interface AgentManifest {
  apiVersion: 'guild/v1';
  kind: 'Agent';
  metadata: AgentMetadata;
  spec: AgentSpec;
}

export interface AgentMetadata {
  name: string;
  chapter?: string; // If omitted, agent is org-wide
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

export interface AgentSpec {
  /** Path to prompt in Codex (e.g., codex://agents/quartermaster/prompt.md) */
  prompt: string;

  /** MCP tool access configuration */
  tools: ToolPermission[];

  /** Resource limits */
  resources: AgentResources;

  /** Triggers that invoke this agent */
  triggers: AgentTrigger[];

  /** LLM provider preferences */
  providerAffinity?: ProviderAffinity;
}

export interface ToolPermission {
  /** Tool pattern (e.g., "jira.read_*", "slack.send_message") */
  pattern: string;

  /** Autonomy level for this tool (0-3), defaults to 3 */
  autonomy?: AutonomyLevel;
}

export type AutonomyLevel = 0 | 1 | 2 | 3;
// 0 = deny
// 1 = queue for approval
// 2 = execute + notify
// 3 = execute silently

export interface AgentResources {
  limits: {
    /** Max tokens per invocation */
    tokensPerInvocation: number;
    /** Max active duration in seconds */
    maxActiveDuration: number;
  };
  requests?: {
    /** Preferred context window size */
    contextWindow?: number;
  };
}

export interface AgentTrigger {
  type: 'webhook' | 'cron' | 'event';
  /** For webhook: source name (jira, github, etc.) */
  source?: string;
  /** For event: event type pattern */
  eventType?: string;
  /** For cron: cron expression */
  schedule?: string;
  /** For cron: timezone */
  timezone?: string;
}

export interface ProviderAffinity {
  /** Required capabilities (hard requirement) */
  requiredDuringScheduling?: {
    capabilities?: string[];
  };
  /** Preferred providers (soft preference) */
  preferredDuringScheduling?: ProviderPreference[];
}

export interface ProviderPreference {
  provider: string;
  model?: string;
  weight: number;
}
