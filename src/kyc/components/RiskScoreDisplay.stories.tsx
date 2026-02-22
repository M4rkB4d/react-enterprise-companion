import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiskScoreDisplay } from './RiskScoreDisplay';

const baseFactors = [
  {
    name: 'Geographic Risk',
    score: 25,
    weight: 0.3,
    description: 'Customer located in a standard-risk jurisdiction.',
  },
  {
    name: 'Transaction Pattern',
    score: 15,
    weight: 0.25,
    description: 'Normal transaction frequency and amounts.',
  },
  {
    name: 'PEP Status',
    score: 0,
    weight: 0.2,
    description: 'Not a Politically Exposed Person.',
  },
  {
    name: 'Account Age',
    score: 10,
    weight: 0.15,
    description: 'Account established more than 2 years ago.',
  },
  {
    name: 'Source of Funds',
    score: 20,
    weight: 0.1,
    description: 'Funds sourced from verified employment income.',
  },
];

const meta = {
  title: 'KYC/RiskScoreDisplay',
  component: RiskScoreDisplay,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  args: {
    onRequestReassessment: () => {},
  },
} satisfies Meta<typeof RiskScoreDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LowRisk: Story = {
  args: {
    data: {
      overallScore: 18,
      level: 'low',
      factors: baseFactors,
      lastAssessedAt: '2025-12-01T10:00:00Z',
      nextReviewAt: '2026-06-01T10:00:00Z',
      assessedBy: 'Automated AML Engine v3.2',
    },
  },
};

export const MediumRisk: Story = {
  args: {
    data: {
      overallScore: 45,
      level: 'medium',
      factors: [
        {
          name: 'Geographic Risk',
          score: 60,
          weight: 0.3,
          description: 'Customer located in a medium-risk jurisdiction.',
        },
        {
          name: 'Transaction Pattern',
          score: 50,
          weight: 0.25,
          description: 'Occasional large transfers detected.',
        },
        {
          name: 'PEP Status',
          score: 0,
          weight: 0.2,
          description: 'Not a Politically Exposed Person.',
        },
        {
          name: 'Account Age',
          score: 40,
          weight: 0.15,
          description: 'Account established less than 1 year ago.',
        },
        {
          name: 'Source of Funds',
          score: 35,
          weight: 0.1,
          description: 'Mixed sources including business income.',
        },
      ],
      lastAssessedAt: '2026-01-15T14:30:00Z',
      nextReviewAt: '2026-04-15T14:30:00Z',
      assessedBy: 'Compliance Officer - Sarah K.',
    },
  },
};

export const HighRisk: Story = {
  args: {
    data: {
      overallScore: 72,
      level: 'high',
      factors: [
        {
          name: 'Geographic Risk',
          score: 85,
          weight: 0.3,
          description: 'Customer located in a high-risk jurisdiction (FATF grey list).',
        },
        {
          name: 'Transaction Pattern',
          score: 78,
          weight: 0.25,
          description: 'Frequent cross-border wire transfers detected.',
        },
        {
          name: 'PEP Status',
          score: 60,
          weight: 0.2,
          description: 'Relative of a Politically Exposed Person.',
        },
        {
          name: 'Account Age',
          score: 50,
          weight: 0.15,
          description: 'Account established less than 6 months ago.',
        },
        {
          name: 'Source of Funds',
          score: 70,
          weight: 0.1,
          description: 'Complex corporate structure obscuring fund origins.',
        },
      ],
      lastAssessedAt: '2026-02-10T09:00:00Z',
      nextReviewAt: '2026-03-10T09:00:00Z',
      assessedBy: 'Senior Compliance Analyst - Mark T.',
    },
  },
};

export const CriticalRisk: Story = {
  args: {
    data: {
      overallScore: 92,
      level: 'critical',
      factors: [
        {
          name: 'Geographic Risk',
          score: 95,
          weight: 0.3,
          description: 'Customer in FATF black-listed jurisdiction.',
        },
        {
          name: 'Transaction Pattern',
          score: 90,
          weight: 0.25,
          description: 'Structuring pattern detected - multiple sub-threshold deposits.',
        },
        {
          name: 'PEP Status',
          score: 100,
          weight: 0.2,
          description: 'Confirmed Politically Exposed Person (active office holder).',
        },
        {
          name: 'Account Age',
          score: 80,
          weight: 0.15,
          description: 'Account opened within the last 30 days.',
        },
        {
          name: 'Source of Funds',
          score: 88,
          weight: 0.1,
          description: 'Unable to verify legitimate source of funds.',
        },
      ],
      lastAssessedAt: '2026-02-20T16:45:00Z',
      nextReviewAt: '2026-02-27T16:45:00Z',
      assessedBy: 'AML Investigation Unit',
    },
  },
};

export const WithoutReassessmentButton: Story = {
  args: {
    data: {
      overallScore: 18,
      level: 'low',
      factors: baseFactors,
      lastAssessedAt: '2025-12-01T10:00:00Z',
      nextReviewAt: '2026-06-01T10:00:00Z',
      assessedBy: 'Automated AML Engine v3.2',
    },
    onRequestReassessment: undefined,
  },
};
