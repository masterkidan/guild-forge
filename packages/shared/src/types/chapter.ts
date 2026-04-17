/**
 * Chapter Configuration - Team/org unit in Guild Forge.
 */
export interface ChapterManifest {
  apiVersion: 'guild/v1';
  kind: 'Chapter';
  metadata: ChapterMetadata;
  spec: ChapterSpec;
}

export interface ChapterMetadata {
  name: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

export interface ChapterSpec {
  /** Display name for the chapter */
  displayName: string;

  /** Chapter description */
  description?: string;

  /** Integration mappings (category -> MCP) */
  integrations: ChapterIntegrations;

  /** Token references for OAuth (vault paths) */
  tokenRefs: Record<string, string>;

  /** Resource quotas */
  quotas: ChapterQuotas;

  /** Notification settings */
  notifications?: NotificationConfig;
}

export interface ChapterIntegrations {
  PROJECT_MANAGEMENT?: 'jira' | 'asana' | 'linear';
  SOURCE_CONTROL?: 'github' | 'gitlab' | 'bitbucket';
  MESSAGING?: 'slack' | 'teams' | 'discord';
  DOCUMENTATION?: 'confluence' | 'notion' | 'gitbook';
  OBSERVABILITY?: 'datadog' | 'prometheus' | 'grafana';
  CI_CD?: 'github-actions' | 'gitlab-ci' | 'jenkins';
}

export interface ChapterQuotas {
  tokens: {
    /** Monthly token budget */
    monthly: number;
    /** Hourly burst limit */
    hourly?: number;
  };
  /** Max concurrent agent invocations */
  maxConcurrentAgents?: number;
}

export interface NotificationConfig {
  /** Default channel for chapter notifications */
  defaultChannel: string;
  /** Daily Raven briefing time (cron) */
  dailyBriefing?: string;
  /** Timezone for scheduling */
  timezone?: string;
}
