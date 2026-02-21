import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type WizardStep = 1 | 2 | 3;

interface TransferWizardState {
  currentStep: WizardStep;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  memo: string;
  isSubmitting: boolean;
  setStep: (step: WizardStep) => void;
  setAccounts: (fromId: string, toId: string) => void;
  setAmount: (amount: number) => void;
  setMemo: (memo: string) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1 as WizardStep,
  fromAccountId: '',
  toAccountId: '',
  amount: 0,
  memo: '',
  isSubmitting: false,
};

export const useTransferStore = create<TransferWizardState>()(
  devtools(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ currentStep: step }, false, 'setStep'),
      setAccounts: (fromId, toId) =>
        set({ fromAccountId: fromId, toAccountId: toId }, false, 'setAccounts'),
      setAmount: (amount) => set({ amount }, false, 'setAmount'),
      setMemo: (memo) => set({ memo }, false, 'setMemo'),
      setSubmitting: (isSubmitting) => set({ isSubmitting }, false, 'setSubmitting'),
      nextStep: () =>
        set(
          (state) => ({
            currentStep: Math.min(state.currentStep + 1, 3) as WizardStep,
          }),
          false,
          'nextStep',
        ),
      prevStep: () =>
        set(
          (state) => ({
            currentStep: Math.max(state.currentStep - 1, 1) as WizardStep,
          }),
          false,
          'prevStep',
        ),
      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'TransferWizard' },
  ),
);
