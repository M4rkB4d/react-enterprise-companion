import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Payee } from '../schemas';

type WizardStep = 1 | 2 | 3;
interface PaymentDetails {
  amount: number;
  scheduledDate: string;
  memo: string;
}
interface PaymentWizardState {
  currentStep: WizardStep;
  selectedPayee: Payee | null;
  paymentDetails: PaymentDetails;
  isSubmitting: boolean;
  setStep: (step: WizardStep) => void;
  selectPayee: (payee: Payee) => void;
  setPaymentDetails: (details: PaymentDetails) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1 as WizardStep,
  selectedPayee: null,
  paymentDetails: { amount: 0, scheduledDate: new Date().toISOString().split('T')[0], memo: '' },
  isSubmitting: false,
};

export const usePaymentWizardStore = create<PaymentWizardState>()(
  devtools(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ currentStep: step }, false, 'setStep'),
      selectPayee: (payee) => set({ selectedPayee: payee, currentStep: 2 }, false, 'selectPayee'),
      setPaymentDetails: (details) => set({ paymentDetails: details }, false, 'setPaymentDetails'),
      setSubmitting: (isSubmitting) => set({ isSubmitting }, false, 'setSubmitting'),
      nextStep: () =>
        set(
          (state) => ({ currentStep: Math.min(state.currentStep + 1, 3) as WizardStep }),
          false,
          'nextStep',
        ),
      prevStep: () =>
        set(
          (state) => ({ currentStep: Math.max(state.currentStep - 1, 1) as WizardStep }),
          false,
          'prevStep',
        ),
      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'PaymentWizard' },
  ),
);
