import { useLocaleStore, type SupportedLocale } from '@/stores/localeStore';
import { Globe } from 'lucide-react';

const localeOptions: { value: SupportedLocale; label: string; flag: string }[] = [
  { value: 'en-US', label: 'English', flag: 'EN' },
  { value: 'es-MX', label: 'Español', flag: 'ES' },
  { value: 'ar-SA', label: 'العربية', flag: 'AR' },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleStore();

  return (
    <div className="flex items-center gap-1.5">
      <Globe className="h-4 w-4 text-gray-500" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as SupportedLocale)}
        className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        aria-label="Select language"
      >
        {localeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.flag} {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
