// src/compliance/hooks/useMaskedData.ts

/**
 * PII MASKING HOOK
 *
 * Provides a togglable mask for sensitive data display.
 * Logs reveal/hide actions to the audit trail for compliance.
 *
 * Usage:
 *   const { displayValue, toggleReveal } = useMaskedData({
 *     value: 'john@example.com',
 *     type: 'email',
 *     resourceId: 'user:123',
 *   });
 *
 * Cross-ref: Doc 14 §3.5 for GDPR PII masking requirements
 */

import { useState, useMemo, useCallback } from 'react';
import { useAuditTrail } from './useAuditTrail';
import {
  maskEmail,
  maskPhone,
  maskAccountNumber,
  maskSSN,
  maskName,
} from '@/compliance/utils/data-masking';

type MaskableDataType = 'email' | 'phone' | 'account' | 'ssn' | 'name';

interface UseMaskedDataOptions {
  readonly value: string;
  readonly type: MaskableDataType;
  readonly resourceId?: string;
  readonly initiallyRevealed?: boolean;
}

interface UseMaskedDataReturn {
  readonly displayValue: string;
  readonly isRevealed: boolean;
  readonly toggleReveal: () => void;
  readonly reveal: () => void;
  readonly hide: () => void;
}

const MASKERS: Record<MaskableDataType, (value: string) => string> = {
  email: maskEmail,
  phone: maskPhone,
  account: maskAccountNumber,
  ssn: maskSSN,
  name: maskName,
};

export function useMaskedData({
  value,
  type,
  resourceId,
  initiallyRevealed = false,
}: UseMaskedDataOptions): UseMaskedDataReturn {
  const [isRevealed, setIsRevealed] = useState(initiallyRevealed);
  const { logEvent } = useAuditTrail();

  const maskedValue = useMemo(() => {
    const masker = MASKERS[type];
    return masker(value);
  }, [value, type]);

  const displayValue = isRevealed ? value : maskedValue;

  const reveal = useCallback(() => {
    setIsRevealed(true);
    logEvent({
      action: 'pii.revealed',
      resource: resourceId ?? `${type}:unknown`,
      metadata: { dataType: type },
    });
  }, [logEvent, resourceId, type]);

  const hide = useCallback(() => {
    setIsRevealed(false);
  }, []);

  const toggleReveal = useCallback(() => {
    if (isRevealed) {
      hide();
    } else {
      reveal();
    }
  }, [isRevealed, reveal, hide]);

  return { displayValue, isRevealed, toggleReveal, reveal, hide };
}
