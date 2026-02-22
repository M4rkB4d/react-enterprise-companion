import { describe, it, expect } from 'vitest';
import {
  RetentionScheduleConfigSchema,
  DEFAULT_RETENTION_SCHEDULE,
} from '../schemas/retention-schedule';

describe('RetentionScheduleConfigSchema', () => {
  it('validates the default retention schedule', () => {
    const result = RetentionScheduleConfigSchema.safeParse(DEFAULT_RETENTION_SCHEDULE);
    expect(result.success).toBe(true);
  });

  it('accepts a minimal valid config', () => {
    const config = {
      version: '1.0',
      lastReviewedAt: '2025-01-01T00:00:00Z',
      approvedBy: 'Admin',
      entries: [],
    };
    const result = RetentionScheduleConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('rejects config with empty version', () => {
    const config = {
      version: '',
      lastReviewedAt: '2025-01-01T00:00:00Z',
      approvedBy: 'Admin',
      entries: [],
    };
    const result = RetentionScheduleConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('rejects config with invalid datetime for lastReviewedAt', () => {
    const config = {
      version: '1.0',
      lastReviewedAt: 'not-a-date',
      approvedBy: 'Admin',
      entries: [],
    };
    const result = RetentionScheduleConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('rejects entry with negative retention value', () => {
    const config = {
      version: '1.0',
      lastReviewedAt: '2025-01-01T00:00:00Z',
      approvedBy: 'Admin',
      entries: [
        {
          dataType: 'logs',
          displayLabel: 'Logs',
          regulation: 'Internal',
          activeRetention: { value: -1, unit: 'days' },
          archiveRetention: { value: 0, unit: 'never' },
          erasureEligible: true,
          description: 'Test',
        },
      ],
    };
    const result = RetentionScheduleConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('rejects entry with invalid retention unit', () => {
    const config = {
      version: '1.0',
      lastReviewedAt: '2025-01-01T00:00:00Z',
      approvedBy: 'Admin',
      entries: [
        {
          dataType: 'logs',
          displayLabel: 'Logs',
          regulation: 'Internal',
          activeRetention: { value: 5, unit: 'weeks' },
          archiveRetention: { value: 0, unit: 'never' },
          erasureEligible: true,
          description: 'Test',
        },
      ],
    };
    const result = RetentionScheduleConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('rejects entry with empty dataType', () => {
    const config = {
      version: '1.0',
      lastReviewedAt: '2025-01-01T00:00:00Z',
      approvedBy: 'Admin',
      entries: [
        {
          dataType: '',
          displayLabel: 'Logs',
          regulation: 'Internal',
          activeRetention: { value: 5, unit: 'days' },
          archiveRetention: { value: 0, unit: 'never' },
          erasureEligible: true,
          description: 'Test',
        },
      ],
    };
    const result = RetentionScheduleConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });
});
