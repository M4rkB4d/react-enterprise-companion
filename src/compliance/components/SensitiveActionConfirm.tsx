// src/compliance/components/SensitiveActionConfirm.tsx

/**
 * SENSITIVE ACTION CONFIRMATION
 *
 * Double-confirmation dialog for high-risk actions:
 * - Wire transfers above threshold
 * - Account closures
 * - Beneficiary changes
 * - Large withdrawals
 *
 * The user must explicitly confirm TWICE, and each confirmation
 * is logged as a separate audit event.
 *
 * Cross-ref: Doc 03 §5 for modal/dialog patterns
 * Cross-ref: §5.2 for audit logging
 */

import { useState, useCallback, type ReactNode } from 'react';
import { useAuditTrail } from '@/compliance/hooks/useAuditTrail';

interface SensitiveActionConfirmProps {
  /** Human-readable description of the action */
  readonly actionDescription: string;
  /** Machine-readable action type for the audit log */
  readonly auditAction: string;
  /** Resource being acted upon */
  readonly auditResource: string;
  /** Additional metadata for the audit log */
  readonly metadata?: Record<string, unknown>;
  /** Called when the user confirms both steps */
  readonly onConfirm: () => void | Promise<void>;
  /** Called when the user cancels */
  readonly onCancel: () => void;
  /** Trigger element (button that opens the dialog) */
  readonly children: ReactNode;
}

type ConfirmStep = 'idle' | 'first_confirm' | 'second_confirm' | 'executing';

export function SensitiveActionConfirm({
  actionDescription,
  auditAction,
  auditResource,
  metadata = {},
  onConfirm,
  onCancel,
  children,
}: SensitiveActionConfirmProps) {
  const [step, setStep] = useState<ConfirmStep>('idle');
  const { logEvent } = useAuditTrail();

  const handleFirstConfirm = useCallback(() => {
    setStep('second_confirm');
    logEvent({
      action: `${auditAction}.first_confirm`,
      resource: auditResource,
      metadata,
    });
  }, [auditAction, auditResource, metadata, logEvent]);

  const handleSecondConfirm = useCallback(async () => {
    setStep('executing');
    logEvent({
      action: `${auditAction}.second_confirm`,
      resource: auditResource,
      metadata,
    });

    try {
      await onConfirm();
      logEvent({
        action: `${auditAction}.executed`,
        resource: auditResource,
        metadata,
      });
    } catch {
      logEvent({
        action: `${auditAction}.execution_failed`,
        resource: auditResource,
        metadata,
      });
    } finally {
      setStep('idle');
    }
  }, [auditAction, auditResource, metadata, onConfirm, logEvent]);

  const handleCancel = useCallback(() => {
    logEvent({
      action: `${auditAction}.cancelled`,
      resource: auditResource,
      metadata,
    });
    setStep('idle');
    onCancel();
  }, [auditAction, auditResource, metadata, onCancel, logEvent]);

  return (
    <>
      {/* Trigger */}
      <div onClick={() => setStep('first_confirm')}>{children}</div>

      {/* First confirmation */}
      {step === 'first_confirm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            role="alertdialog"
            aria-label="Confirm action"
            className="mx-4 w-full max-w-md rounded-xl bg-white p-8 shadow-2xl"
          >
            <h2 className="mb-4 text-xl font-bold text-slate-900">Confirm Action</h2>
            <p className="mb-6 text-slate-600">{actionDescription}</p>
            <div className="flex gap-3">
              <button
                onClick={handleFirstConfirm}
                className="flex-1 rounded-lg bg-amber-500 px-6 py-3 font-semibold
                           text-white hover:bg-amber-600"
              >
                Continue
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 rounded-lg border border-slate-300 px-6 py-3
                           font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Second confirmation */}
      {step === 'second_confirm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            role="alertdialog"
            aria-label="Final confirmation"
            className="mx-4 w-full max-w-md rounded-xl border-2 border-red-300
                       bg-white p-8 shadow-2xl"
          >
            <h2 className="mb-4 text-xl font-bold text-red-700">Final Confirmation</h2>
            <p className="mb-2 text-slate-600">
              This action <strong>cannot be undone</strong>.
            </p>
            <p className="mb-6 font-medium text-slate-900">{actionDescription}</p>
            <div className="flex gap-3">
              <button
                onClick={handleSecondConfirm}
                className="flex-1 rounded-lg bg-red-600 px-6 py-3 font-semibold
                           text-white hover:bg-red-700"
              >
                Confirm &amp; Execute
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 rounded-lg border border-slate-300 px-6 py-3
                           font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Executing state */}
      {step === 'executing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-xl bg-white p-8 shadow-2xl">
            <p className="text-slate-600">Processing...</p>
          </div>
        </div>
      )}
    </>
  );
}
