import { useEffect } from 'react';
import { useTransferStore } from '../store/transferStore';
import { SelectAccountsStep } from './steps/SelectAccounts';
import { EnterAmountStep } from './steps/EnterAmount';
import { ConfirmTransferStep } from './steps/ConfirmTransfer';

const steps = [
  { number: 1, label: 'Select Accounts' },
  { number: 2, label: 'Enter Amount' },
  { number: 3, label: 'Confirm' },
] as const;

export default function TransferWizard() {
  const currentStep = useTransferStore((s) => s.currentStep);
  const reset = useTransferStore((s) => s.reset);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <nav aria-label="Transfer progress">
        <ol className="flex items-center gap-4">
          {steps.map((step) => (
            <li key={step.number} className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step.number === currentStep
                    ? 'bg-blue-600 text-white'
                    : step.number < currentStep
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {step.number < currentStep ? '\u2713' : step.number}
              </span>
              <span
                className={`text-sm ${
                  step.number === currentStep ? 'font-medium text-gray-900' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
              {step.number < steps.length && <div className="ml-2 h-px w-8 bg-gray-300" />}
            </li>
          ))}
        </ol>
      </nav>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {currentStep === 1 && <SelectAccountsStep />}
        {currentStep === 2 && <EnterAmountStep />}
        {currentStep === 3 && <ConfirmTransferStep />}
      </div>
    </div>
  );
}
