/**
 * Canonical event format for all Guild Forge events.
 * All external webhooks are normalized to this format.
 */
export interface GuildEvent {
  /** Unique event ID (UUID) */
  id: string;

  /** ISO timestamp when event was received */
  timestamp: string;

  /** Normalized event type */
  type: GuildEventType;

  /** Source system (jira, github, slack, etc.) */
  source: string;

  /** Chapter this event belongs to */
  chapterId: string;

  /** Correlation ID for tracing */
  correlationId: string;

  /** Normalized payload */
  payload: Record<string, unknown>;

  /** Routing metadata */
  routing: {
    priority: EventPriority;
    targetAgent?: string;
  };
}

export type GuildEventType =
  // Project Management
  | 'TICKET_CREATED'
  | 'TICKET_UPDATED'
  | 'TICKET_ASSIGNED'
  | 'TICKET_COMPLETED'
  | 'SPRINT_STARTED'
  | 'SPRINT_ENDED'
  // Source Control
  | 'PR_OPENED'
  | 'PR_UPDATED'
  | 'PR_MERGED'
  | 'PR_CLOSED'
  | 'PUSH_RECEIVED'
  | 'REVIEW_SUBMITTED'
  // CI/CD
  | 'PIPELINE_STARTED'
  | 'PIPELINE_SUCCEEDED'
  | 'PIPELINE_FAILED'
  // Messaging
  | 'COMMAND_RECEIVED'
  | 'MENTION_RECEIVED'
  | 'DM_RECEIVED'
  // Observability
  | 'ALERT_TRIGGERED'
  | 'INCIDENT_CREATED'
  | 'INCIDENT_RESOLVED'
  // System
  | 'SCHEDULED_TRIGGER'
  | 'UNKNOWN';

export type EventPriority = 'critical' | 'high' | 'normal' | 'low';

export interface GuildEventMetadata {
  receivedAt: string;
  processedAt?: string;
  attempts: number;
  lastError?: string;
}
