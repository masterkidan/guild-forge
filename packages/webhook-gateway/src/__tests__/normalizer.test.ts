import { describe, it, expect } from 'vitest';
import { normalizeWebhook } from '../normalizer';

describe('normalizeWebhook', () => {
  describe('jira', () => {
    it('should normalize ticket created webhook', () => {
      const raw = {
        webhookEvent: 'jira:issue_created',
        issue: {
          key: 'PROJ-123',
          fields: {
            summary: 'Fix login bug',
            status: { name: 'To Do' },
            assignee: { displayName: 'Alice' },
          },
        },
      };

      const event = normalizeWebhook('jira', raw, 'platform-team');

      expect(event.type).toBe('TICKET_CREATED');
      expect(event.source).toBe('jira');
      expect(event.chapterId).toBe('platform-team');
      expect(event.payload.ticketId).toBe('PROJ-123');
      expect(event.routing.priority).toBe('normal');
    });

    it('should produce UNKNOWN for unrecognized jira events', () => {
      const raw = { webhookEvent: 'jira:unknown_event' };
      const event = normalizeWebhook('jira', raw, 'team-a');
      expect(event.type).toBe('UNKNOWN');
    });
  });

  describe('github', () => {
    it('should normalize PR opened webhook', () => {
      const raw = {
        action: 'opened',
        pull_request: {
          number: 42,
          title: 'Add feature X',
          user: { login: 'bob' },
          head: { ref: 'feature/x' },
          merged: false,
        },
      };

      const event = normalizeWebhook('github', raw, 'platform-team');

      expect(event.type).toBe('PR_OPENED');
      expect(event.payload.prId).toBe(42);
      expect(event.payload.author).toBe('bob');
    });

    it('should normalize PR merged webhook', () => {
      const raw = {
        action: 'closed',
        pull_request: { number: 42, title: 'Add X', user: { login: 'bob' }, merged: true, head: { ref: 'main' } },
      };

      const event = normalizeWebhook('github', raw, 'platform-team');
      expect(event.type).toBe('PR_MERGED');
    });
  });

  describe('slack', () => {
    it('should normalize app mention', () => {
      const raw = {
        event: { type: 'app_mention', user: 'U123', channel: 'C456', text: '!guild status' },
      };

      const event = normalizeWebhook('slack', raw, 'platform-team');

      expect(event.type).toBe('MENTION_RECEIVED');
      expect(event.routing.priority).toBe('high');
      expect(event.payload.text).toBe('!guild status');
    });
  });

  describe('datadog', () => {
    it('should normalize error alert with critical priority', () => {
      const raw = { id: 'alert-1', title: 'High error rate', alert_type: 'error' };
      const event = normalizeWebhook('datadog', raw, 'platform-team');

      expect(event.type).toBe('ALERT_TRIGGERED');
      expect(event.routing.priority).toBe('critical');
    });
  });

  describe('canonical fields', () => {
    it('should always include id, timestamp, correlationId', () => {
      const event = normalizeWebhook('github', { action: 'opened' }, 'team-a');

      expect(event.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(event.correlationId).toMatch(/^[0-9a-f-]{36}$/);
      expect(event.timestamp).toBeTruthy();
    });

    it('should route unknown sources to UNKNOWN type', () => {
      const event = normalizeWebhook('unknown-tool', { foo: 'bar' }, 'team-a');
      expect(event.type).toBe('UNKNOWN');
    });
  });
});
