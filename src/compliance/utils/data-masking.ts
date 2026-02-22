// src/compliance/utils/data-masking.ts

/**
 * PII DATA MASKING UTILITIES
 *
 * Masks sensitive personal data for display in the UI.
 * Uses the bullet character (\u2022) as the mask character.
 *
 * Cross-ref: Doc 14 §3.4 for GDPR PII masking requirements
 */

const MASK_CHAR = '\u2022';

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return `${MASK_CHAR}${MASK_CHAR}@${MASK_CHAR}${MASK_CHAR}`;
  const visibleChars = Math.min(2, localPart.length);
  const masked =
    localPart.slice(0, visibleChars) +
    MASK_CHAR.repeat(Math.max(localPart.length - visibleChars, 2));
  return `${masked}@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return MASK_CHAR.repeat(10);
  const last4 = digits.slice(-4);
  return `${MASK_CHAR}${MASK_CHAR}${MASK_CHAR}-${MASK_CHAR}${MASK_CHAR}${MASK_CHAR}-${last4}`;
}

export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return MASK_CHAR.repeat(4);
  const last4 = accountNumber.slice(-4);
  const maskedPortion = MASK_CHAR.repeat(accountNumber.length - 4);
  return `${maskedPortion}${last4}`;
}

export function maskSSN(ssn: string): string {
  const digits = ssn.replace(/\D/g, '');
  if (digits.length < 4)
    return `${MASK_CHAR}${MASK_CHAR}${MASK_CHAR}-${MASK_CHAR}${MASK_CHAR}-${MASK_CHAR}${MASK_CHAR}${MASK_CHAR}${MASK_CHAR}`;
  return `${MASK_CHAR}${MASK_CHAR}${MASK_CHAR}-${MASK_CHAR}${MASK_CHAR}-${digits.slice(-4)}`;
}

export function maskName(name: string): string {
  return name
    .split(' ')
    .map((part) => {
      if (part.length <= 1) return part;
      return part[0] + MASK_CHAR.repeat(Math.min(part.length - 1, 3));
    })
    .join(' ');
}

export function maskGeneric(value: string, showFirst: number = 2, showLast: number = 4): string {
  if (value.length <= showFirst + showLast) {
    return MASK_CHAR.repeat(value.length);
  }
  const start = value.slice(0, showFirst);
  const end = value.slice(-showLast);
  const middleLength = value.length - showFirst - showLast;
  return `${start}${MASK_CHAR.repeat(middleLength)}${end}`;
}
