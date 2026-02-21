// src/compliance/types/personal-data-inventory.ts

/**
 * PERSONAL DATA INVENTORY
 *
 * GDPR Article 30 requires a "Record of Processing Activities."
 * This TypeScript model serves as both documentation AND runtime
 * validation of what personal data the frontend handles.
 *
 * Cross-ref: Doc 14 §3 for GDPR consent management
 */

export type LegalBasis =
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'public_task'
  | 'legitimate_interests';

export type DataLocation =
  | 'browser_memory'
  | 'local_storage'
  | 'session_storage'
  | 'cookie'
  | 'backend_api'
  | 'third_party_service';

export interface PersonalDataRecord {
  readonly id: string;
  readonly name: string;
  readonly category: 'identity' | 'contact' | 'financial' | 'behavioral' | 'technical';
  readonly legalBasis: LegalBasis;
  readonly purpose: string;
  readonly locations: readonly DataLocation[];
  readonly retentionDays: number;
  readonly sharedWithThirdParties: boolean;
  readonly thirdParties: readonly string[];
  readonly deletable: boolean;
  readonly exportable: boolean;
}

export const BANKING_DATA_INVENTORY: readonly PersonalDataRecord[] = [
  {
    id: 'pdi_email',
    name: 'Email Address',
    category: 'contact',
    legalBasis: 'contract',
    purpose: 'Account authentication and communication',
    locations: ['backend_api', 'browser_memory'],
    retentionDays: 2555,
    sharedWithThirdParties: false,
    thirdParties: [],
    deletable: true,
    exportable: true,
  },
  {
    id: 'pdi_phone',
    name: 'Phone Number',
    category: 'contact',
    legalBasis: 'contract',
    purpose: 'MFA and account recovery',
    locations: ['backend_api', 'browser_memory'],
    retentionDays: 2555,
    sharedWithThirdParties: false,
    thirdParties: [],
    deletable: true,
    exportable: true,
  },
  {
    id: 'pdi_account_number',
    name: 'Bank Account Number',
    category: 'financial',
    legalBasis: 'contract',
    purpose: 'Core banking services',
    locations: ['backend_api', 'browser_memory'],
    retentionDays: 2555,
    sharedWithThirdParties: false,
    thirdParties: [],
    deletable: false,
    exportable: true,
  },
  {
    id: 'pdi_analytics',
    name: 'Page View Analytics',
    category: 'behavioral',
    legalBasis: 'consent',
    purpose: 'Service improvement and usage analytics',
    locations: ['third_party_service', 'cookie'],
    retentionDays: 365,
    sharedWithThirdParties: true,
    thirdParties: ['Analytics Provider'],
    deletable: true,
    exportable: false,
  },
] as const;
