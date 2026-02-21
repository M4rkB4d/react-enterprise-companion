import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SupportedLocale = 'en-US' | 'es-MX' | 'ar-SA';

interface LocaleState {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en-US',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'locale-preference' },
  ),
);
