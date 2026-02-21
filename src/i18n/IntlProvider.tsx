import { useState, useEffect, type ReactNode, createContext, useContext } from 'react';
import { useLocaleStore, type SupportedLocale } from '@/stores/localeStore';

type Messages = Record<string, string>;

const messageCache = new Map<SupportedLocale, Messages>();

async function loadMessages(locale: SupportedLocale): Promise<Messages> {
  if (messageCache.has(locale)) {
    return messageCache.get(locale)!;
  }

  let messages: Messages;

  switch (locale) {
    case 'es-MX':
      messages = (await import('./messages/es-MX.json')).default;
      break;
    case 'ar-SA':
      messages = (await import('./messages/ar-SA.json')).default;
      break;
    case 'en-US':
    default:
      messages = (await import('./messages/en-US.json')).default;
      break;
  }

  messageCache.set(locale, messages);
  return messages;
}

interface IntlContextValue {
  locale: SupportedLocale;
  messages: Messages;
  t: (key: string, fallback?: string) => string;
}

const IntlContext = createContext<IntlContextValue>({
  locale: 'en-US',
  messages: {},
  t: (key) => key,
});

// eslint-disable-next-line react-refresh/only-export-components
export function useIntl() {
  return useContext(IntlContext);
}

interface AppIntlProviderProps {
  children: ReactNode;
}

export function AppIntlProvider({ children }: AppIntlProviderProps) {
  const locale = useLocaleStore((s) => s.locale);
  const [messages, setMessages] = useState<Messages>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadMessages(locale).then((msgs) => {
      if (cancelled) return;
      setMessages(msgs);
      setIsLoading(false);
      document.documentElement.dir = locale === 'ar-SA' ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const t = (key: string, fallback?: string): string => {
    return messages[key] ?? fallback ?? key;
  };

  if (isLoading && Object.keys(messages).length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return <IntlContext.Provider value={{ locale, messages, t }}>{children}</IntlContext.Provider>;
}
