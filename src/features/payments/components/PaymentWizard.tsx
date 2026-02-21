import { useEffect } from 'react';
import { usePaymentWizardStore } from '../store/paymentWizardStore';
import { SelectPayeeStep } from './steps/SelectPayee';
import { PaymentDetailsStep } from './steps/PaymentDetails';
import { ReviewConfirmStep } from './steps/ReviewConfirm';

const steps = [
  { number: 1, label: 'Select Payee' },
  { number: 2, label: 'Payment Details' },
  { number: 3, label: 'Review & Confirm' },
] as const;

export default function PaymentWizard() {
  const currentStep = usePaymentWizardStore((s) => s.currentStep);
  const reset = usePaymentWizardStore((s) => s.reset);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <nav aria-label="Payment progress">
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
                {step.number < currentStep ? '✓' : step.number}
              </span>
              <span
                className={`text-sm ${step.number === currentStep ? 'font-medium text-gray-900' : 'text-gray-500'}`}
              >
                {step.label}
              </span>
              {step.number < steps.length && <div className="ml-2 h-px w-8 bg-gray-300" />}
            </li>
          ))}
        </ol>
      </nav>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {currentStep === 1 && <SelectPayeeStep />}
        {currentStep === 2 && <PaymentDetailsStep />}
        {currentStep === 3 && <ReviewConfirmStep />}
      </div>
    </div>
  );
}
