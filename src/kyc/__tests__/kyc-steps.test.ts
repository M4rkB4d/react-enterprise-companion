import { describe, it, expect } from 'vitest';
import {
  personalInfoSchema,
  addressSchema,
  documentUploadSchema,
  riskDeclarationSchema,
  kycSubmissionSchema,
} from '../schemas/kyc-steps';

describe('personalInfoSchema', () => {
  const validPersonalInfo = {
    firstName: 'Jane',
    lastName: 'Doe',
    dateOfBirth: '1990-05-15',
    nationality: 'US',
    taxId: '123-45-6789',
    taxCountry: 'US',
  };

  it('accepts valid personal info', () => {
    const result = personalInfoSchema.safeParse(validPersonalInfo);
    expect(result.success).toBe(true);
  });

  it('rejects empty firstName', () => {
    const result = personalInfoSchema.safeParse({ ...validPersonalInfo, firstName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid dateOfBirth', () => {
    const result = personalInfoSchema.safeParse({
      ...validPersonalInfo,
      dateOfBirth: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });
});

describe('addressSchema', () => {
  const validAddress = {
    streetAddress: '123 Main St',
    city: 'Springfield',
    stateOrProvince: 'IL',
    postalCode: '62701',
    country: 'US',
    residencySince: '2020-01-01',
  };

  it('accepts valid address', () => {
    const result = addressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it('rejects empty city', () => {
    const result = addressSchema.safeParse({ ...validAddress, city: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid residencySince date', () => {
    const result = addressSchema.safeParse({ ...validAddress, residencySince: '2020' });
    expect(result.success).toBe(false);
  });
});

describe('documentUploadSchema', () => {
  const validDoc = {
    documentType: 'passport' as const,
    documentNumber: 'AB1234567',
    issuingCountry: 'US',
    issueDate: '2020-01-01',
    expiryDate: '2030-01-01',
    frontImageId: 'img-front-001',
  };

  it('accepts valid document upload', () => {
    const result = documentUploadSchema.safeParse(validDoc);
    expect(result.success).toBe(true);
  });

  it('accepts document with optional backImageId', () => {
    const result = documentUploadSchema.safeParse({
      ...validDoc,
      backImageId: 'img-back-001',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid document type', () => {
    const result = documentUploadSchema.safeParse({
      ...validDoc,
      documentType: 'birth_certificate',
    });
    expect(result.success).toBe(false);
  });
});

describe('riskDeclarationSchema', () => {
  const validRisk = {
    employmentStatus: 'employed' as const,
    sourceOfFunds: 'salary' as const,
    expectedMonthlyVolume: 'under_5000' as const,
    isPEP: false,
    acceptedTerms: true as const,
  };

  it('accepts valid risk declaration', () => {
    const result = riskDeclarationSchema.safeParse(validRisk);
    expect(result.success).toBe(true);
  });

  it('rejects when acceptedTerms is false', () => {
    const result = riskDeclarationSchema.safeParse({
      ...validRisk,
      acceptedTerms: false,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid employment status', () => {
    const result = riskDeclarationSchema.safeParse({
      ...validRisk,
      employmentStatus: 'freelancer',
    });
    expect(result.success).toBe(false);
  });
});

describe('kycSubmissionSchema', () => {
  const fullSubmission = {
    personalInfo: {
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: '1990-05-15',
      nationality: 'US',
      taxId: '123-45-6789',
      taxCountry: 'US',
    },
    address: {
      streetAddress: '123 Main St',
      city: 'Springfield',
      stateOrProvince: 'IL',
      postalCode: '62701',
      country: 'US',
      residencySince: '2020-01-01',
    },
    document: {
      documentType: 'passport' as const,
      documentNumber: 'AB1234567',
      issuingCountry: 'US',
      issueDate: '2020-01-01',
      expiryDate: '2030-01-01',
      frontImageId: 'img-front-001',
    },
    riskDeclaration: {
      employmentStatus: 'employed' as const,
      sourceOfFunds: 'salary' as const,
      expectedMonthlyVolume: 'under_5000' as const,
      isPEP: false,
      acceptedTerms: true as const,
    },
  };

  it('accepts a full valid KYC submission', () => {
    const result = kycSubmissionSchema.safeParse(fullSubmission);
    expect(result.success).toBe(true);
  });

  it('rejects submission missing address section', () => {
    const { address: _, ...partial } = fullSubmission;
    const result = kycSubmissionSchema.safeParse(partial);
    expect(result.success).toBe(false);
  });
});
