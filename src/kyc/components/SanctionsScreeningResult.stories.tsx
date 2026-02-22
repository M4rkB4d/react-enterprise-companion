import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
import { AuditProvider } from '@/compliance/providers/AuditProvider';
import { SanctionsScreeningResult } from './SanctionsScreeningResult';
import type { SanctionsScreeningData } from './SanctionsScreeningResult';
const allLists = ['OFAC_SDN', 'EU_CONSOLIDATED', 'UN_SECURITY_COUNCIL', 'HMT'] as const;

const meta = {
  title: 'KYC/SanctionsScreeningResult',
  component: SanctionsScreeningResult,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuditProvider>
          <div className="max-w-2xl">
            <Story />
          </div>
        </AuditProvider>
      </MemoryRouter>
    ),
  ],
  args: {
    onRequestRescreen: () => {},
    onConfirmMatch: () => {},
    onDismissMatch: () => {},
  },
} satisfies Meta<typeof SanctionsScreeningResult>;

export default meta;
type Story = StoryObj<typeof meta>;

const clearData: SanctionsScreeningData = {
  screeningId: 'scr_20260220_001',
  subjectName: 'John A. Smith',
  subjectType: 'individual',
  screenedAt: '2026-02-20T14:30:00Z',
  outcome: 'clear',
  listsChecked: [...allLists],
  matches: [],
  processingTimeMs: 234,
};

export const Clear: Story = {
  args: {
    data: clearData,
  },
};

export const PotentialMatch: Story = {
  args: {
    data: {
      screeningId: 'scr_20260220_002',
      subjectName: 'Ahmad Al-Rashid',
      subjectType: 'individual',
      screenedAt: '2026-02-20T15:10:00Z',
      outcome: 'potential_match',
      listsChecked: [...allLists],
      matches: [
        {
          listName: 'OFAC_SDN',
          matchedName: 'Ahmed Al-Rashid',
          matchScore: 72,
          listEntryId: 'SDN-18923',
          listedSince: '2019-06-15T00:00:00Z',
          program: 'SDGT - Global Terrorism Sanctions',
          remarks:
            'Name similarity detected. Date of birth and nationality differ from listed individual.',
        },
      ],
      processingTimeMs: 412,
    },
  },
};

export const ConfirmedMatch: Story = {
  args: {
    data: {
      screeningId: 'scr_20260220_003',
      subjectName: 'Petrokov Industries Ltd',
      subjectType: 'entity',
      screenedAt: '2026-02-20T16:00:00Z',
      outcome: 'confirmed_match',
      listsChecked: [...allLists],
      matches: [
        {
          listName: 'EU_CONSOLIDATED',
          matchedName: 'Petrokov Industries Limited',
          matchScore: 96,
          listEntryId: 'EU-2024-5567',
          listedSince: '2024-03-01T00:00:00Z',
          program: 'EU Regulation 269/2014 - Ukraine',
          remarks:
            'Entity sanctioned for involvement in financing activities undermining territorial integrity.',
        },
        {
          listName: 'HMT',
          matchedName: 'Petrokov Industries Ltd',
          matchScore: 99,
          listEntryId: 'HMT-RUS-0892',
          listedSince: '2024-03-15T00:00:00Z',
          program: 'Russia Sanctions Regime',
          remarks: 'Exact match. Entity registered at same address as listed entry.',
        },
      ],
      processingTimeMs: 567,
    },
  },
};

export const MultipleMatches: Story = {
  args: {
    data: {
      screeningId: 'scr_20260220_004',
      subjectName: 'Hassan Mohamed',
      subjectType: 'individual',
      screenedAt: '2026-02-20T17:30:00Z',
      outcome: 'potential_match',
      listsChecked: [...allLists],
      matches: [
        {
          listName: 'OFAC_SDN',
          matchedName: 'Hassan Mohamed Ali',
          matchScore: 65,
          listEntryId: 'SDN-22104',
          listedSince: '2020-11-20T00:00:00Z',
          program: 'SDNTK - Narcotics Trafficking',
          remarks: 'Partial name match. Further verification required.',
        },
        {
          listName: 'UN_SECURITY_COUNCIL',
          matchedName: 'Hasan Muhammed',
          matchScore: 58,
          listEntryId: 'UN-TAL-4421',
          listedSince: '2018-07-10T00:00:00Z',
          program: 'ISIL/Al-Qaida Sanctions',
          remarks: 'Phonetic name similarity. Different transliteration variant.',
        },
      ],
      processingTimeMs: 389,
    },
  },
};

export const WithoutActions: Story = {
  args: {
    data: clearData,
    onRequestRescreen: undefined,
    onConfirmMatch: undefined,
    onDismissMatch: undefined,
  },
};
