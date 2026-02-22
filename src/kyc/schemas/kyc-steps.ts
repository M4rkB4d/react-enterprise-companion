// src/kyc/schemas/kyc-steps.ts

import { z } from 'zod';

/**
 * Step 1: Personal Information
 */
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, { error: 'validation.required' }),
  lastName: z.string().min(1, { error: 'validation.required' }),
  dateOfBirth: z.string().date({ error: 'validation.invalidDate' }),
  nationality: z.string().min(2, { error: 'validation.required' }),
  taxId: z.string().min(1, { error: 'validation.required' }),
  taxCountry: z.string().min(2, { error: 'validation.required' }),
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;

/**
 * Step 2: Address Verification
 */
export const addressSchema = z.object({
  streetAddress: z.string().min(1, { error: 'validation.required' }),
  city: z.string().min(1, { error: 'validation.required' }),
  stateOrProvince: z.string().min(1, { error: 'validation.required' }),
  postalCode: z.string().min(1, { error: 'validation.required' }),
  country: z.string().min(2, { error: 'validation.required' }),
  residencySince: z.string().date({ error: 'validation.invalidDate' }),
});

export type Address = z.infer<typeof addressSchema>;

/**
 * Step 3: Document Upload
 */
export const documentUploadSchema = z.object({
  documentType: z.enum(['passport', 'national_id', 'drivers_license'], {
    error: 'validation.required',
  }),
  documentNumber: z.string().min(1, { error: 'validation.required' }),
  issuingCountry: z.string().min(2, { error: 'validation.required' }),
  issueDate: z.string().date({ error: 'validation.invalidDate' }),
  expiryDate: z.string().date({ error: 'validation.invalidDate' }),
  frontImageId: z.string().min(1, { error: 'validation.required' }),
  backImageId: z.string().optional(),
});

export type DocumentUpload = z.infer<typeof documentUploadSchema>;

/**
 * Step 4: Risk Assessment Declaration
 */
export const riskDeclarationSchema = z.object({
  employmentStatus: z.enum(
    ['employed', 'self_employed', 'retired', 'student', 'unemployed'],
    { error: 'validation.required' },
  ),
  sourceOfFunds: z.enum(
    ['salary', 'business', 'investments', 'inheritance', 'savings', 'other'],
    { error: 'validation.required' },
  ),
  expectedMonthlyVolume: z.enum(
    ['under_5000', '5000_25000', '25000_100000', 'over_100000'],
    { error: 'validation.required' },
  ),
  isPEP: z.boolean(),
  pepDetails: z.string().optional(),
  acceptedTerms: z.literal(true, {
    error: 'validation.mustAcceptTerms',
  }),
});

export type RiskDeclaration = z.infer<typeof riskDeclarationSchema>;

/**
 * Combined KYC submission schema (all 4 steps).
 */
export const kycSubmissionSchema = z.object({
  personalInfo: personalInfoSchema,
  address: addressSchema,
  document: documentUploadSchema,
  riskDeclaration: riskDeclarationSchema,
});

export type KYCSubmission = z.infer<typeof kycSubmissionSchema>;
