import { randomUUID } from 'crypto';
import type { GuildEvent, GuildEventType, EventPriority } from '@guild-forge/shared';

/**
 * Normalizes raw webhook payloads from external sources
 * into the canonical GuildEvent format.
 */
export function normalizeWebhook(
  source: string,
  rawPayload: Record<string, unknown>,
  chapterId: string,
): GuildEvent {
  const normalized = NORMALIZERS[source]?.(rawPayload) ?? {
    type: 'UNKNOWN' as GuildEventType,
    payload: rawPayload,
    priority: 'normal' as EventPriority,
  };

  return {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    source,
    chapterId,
    correlationId: randomUUID(),
    type: normalized.type,
    payload: normalized.payload,
    routing: {
      priority: normalized.priority,
    },
  };
}

interface NormalizedFields {
  type: GuildEventType;
  payload: Record<string, unknown>;
  priority: EventPriority;
}

type Normalizer = (raw: Record<string, unknown>) => NormalizedFields;

const NORMALIZERS: Record<string, Normalizer> = {
  jira: normalizeJira,
  github: normalizeGitHub,
  slack: normalizeSlack,
  teams: normalizeTeams,
  datadog: normalizeDatadog,
};

function normalizeJira(raw: Record<string, unknown>): NormalizedFields {
  const eventType = raw['webhookEvent'] as string | undefined;

  const typeMap: Record<string, GuildEventType> = {
    'jira:issue_created': 'TICKET_CREATED',
    'jira:issue_updated': 'TICKET_UPDATED',
    'sprint_started': 'SPRINT_STARTED',
    'sprint_closed': 'SPRINT_ENDED',
  };

  const issue = raw['issue'] as Record<string, unknown> | undefined;

  return {
    type: typeMap[eventType ?? ''] ?? 'UNKNOWN',
    priority: 'normal',
    payload: {
      ticketId: (issue?.['key'] as string) ?? null,
      summary: (issue?.['fields'] as any)?.['summary'] ?? null,
      status: (issue?.['fields'] as any)?.['status']?.['name'] ?? null,
      assignee: (issue?.['fields'] as any)?.['assignee']?.['displayName'] ?? null,
      raw,
    },
  };
}

function normalizeGitHub(raw: Record<string, unknown>): NormalizedFields {
  const action = raw['action'] as string | undefined;
  const pr = raw['pull_request'] as Record<string, unknown> | undefined;
  const ref = raw['ref'] as string | undefined;

  let type: GuildEventType = 'UNKNOWN';
  if (pr && action === 'opened') type = 'PR_OPENED';
  else if (pr && action === 'closed' && pr['merged']) type = 'PR_MERGED';
  else if (pr && action === 'closed') type = 'PR_CLOSED';
  else if (pr) type = 'PR_UPDATED';
  else if (ref) type = 'PUSH_RECEIVED';

  return {
    type,
    priority: 'normal',
    payload: {
      prId: pr?.['number'] ?? null,
      prTitle: pr?.['title'] ?? null,
      author: (pr?.['user'] as any)?.['login'] ?? null,
      branch: pr?.['head'] ? (pr['head'] as any)['ref'] : ref ?? null,
      raw,
    },
  };
}

function normalizeSlack(raw: Record<string, unknown>): NormalizedFields {
  const event = raw['event'] as Record<string, unknown> | undefined;
  const eventType = event?.['type'] as string | undefined;

  return {
    type: eventType === 'app_mention' ? 'MENTION_RECEIVED' : 'COMMAND_RECEIVED',
    priority: 'high',
    payload: {
      userId: event?.['user'] as string ?? null,
      channelId: event?.['channel'] as string ?? null,
      text: event?.['text'] as string ?? null,
      raw,
    },
  };
}

function normalizeTeams(raw: Record<string, unknown>): NormalizedFields {
  return {
    type: 'COMMAND_RECEIVED',
    priority: 'high',
    payload: {
      from: (raw['from'] as any)?.['name'] ?? null,
      text: (raw['text'] as string) ?? null,
      raw,
    },
  };
}

function normalizeDatadog(raw: Record<string, unknown>): NormalizedFields {
  const alertType = raw['alert_type'] as string | undefined;

  return {
    type: 'ALERT_TRIGGERED',
    priority: alertType === 'error' ? 'critical' : 'high',
    payload: {
      alertId: raw['id'] as string ?? null,
      title: raw['title'] as string ?? null,
      severity: alertType ?? 'unknown',
      raw,
    },
  };
}
