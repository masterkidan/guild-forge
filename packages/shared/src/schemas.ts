import { z } from 'zod';

/**
 * Zod schemas for runtime validation of Guild Forge types.
 */

export const GuildEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  type: z.string(),
  source: z.string(),
  chapterId: z.string(),
  correlationId: z.string(),
  payload: z.record(z.unknown()),
  routing: z.object({
    priority: z.enum(['critical', 'high', 'normal', 'low']),
    targetAgent: z.string().optional(),
  }),
});

export const ToolPermissionSchema = z.object({
  pattern: z.string(),
  autonomy: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).optional(),
});

export const AgentResourcesSchema = z.object({
  limits: z.object({
    tokensPerInvocation: z.number().positive(),
    maxActiveDuration: z.number().positive(),
  }),
  requests: z.object({
    contextWindow: z.number().positive().optional(),
  }).optional(),
});

export const AgentTriggerSchema = z.object({
  type: z.enum(['webhook', 'cron', 'event']),
  source: z.string().optional(),
  eventType: z.string().optional(),
  schedule: z.string().optional(),
  timezone: z.string().optional(),
});

export const AgentManifestSchema = z.object({
  apiVersion: z.literal('guild/v1'),
  kind: z.literal('Agent'),
  metadata: z.object({
    name: z.string(),
    chapter: z.string().optional(),
    labels: z.record(z.string()).optional(),
    annotations: z.record(z.string()).optional(),
  }),
  spec: z.object({
    prompt: z.string(),
    tools: z.array(ToolPermissionSchema),
    resources: AgentResourcesSchema,
    triggers: z.array(AgentTriggerSchema),
    providerAffinity: z.object({
      requiredDuringScheduling: z.object({
        capabilities: z.array(z.string()).optional(),
      }).optional(),
      preferredDuringScheduling: z.array(z.object({
        provider: z.string(),
        model: z.string().optional(),
        weight: z.number(),
      })).optional(),
    }).optional(),
  }),
});

export const ChapterIntegrationsSchema = z.object({
  PROJECT_MANAGEMENT: z.enum(['jira', 'asana', 'linear']).optional(),
  SOURCE_CONTROL: z.enum(['github', 'gitlab', 'bitbucket']).optional(),
  MESSAGING: z.enum(['slack', 'teams', 'discord']).optional(),
  DOCUMENTATION: z.enum(['confluence', 'notion', 'gitbook']).optional(),
  OBSERVABILITY: z.enum(['datadog', 'prometheus', 'grafana']).optional(),
  CI_CD: z.enum(['github-actions', 'gitlab-ci', 'jenkins']).optional(),
});

export const ChapterManifestSchema = z.object({
  apiVersion: z.literal('guild/v1'),
  kind: z.literal('Chapter'),
  metadata: z.object({
    name: z.string(),
    labels: z.record(z.string()).optional(),
    annotations: z.record(z.string()).optional(),
  }),
  spec: z.object({
    displayName: z.string(),
    description: z.string().optional(),
    integrations: ChapterIntegrationsSchema,
    tokenRefs: z.record(z.string()),
    quotas: z.object({
      tokens: z.object({
        monthly: z.number().positive(),
        hourly: z.number().positive().optional(),
      }),
      maxConcurrentAgents: z.number().positive().optional(),
    }),
    notifications: z.object({
      defaultChannel: z.string(),
      dailyBriefing: z.string().optional(),
      timezone: z.string().optional(),
    }).optional(),
  }),
});
