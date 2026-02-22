// src/hooks/use-translated-form.ts

import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useForm, type UseFormProps, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';
import { createTranslatedErrorMap } from '@/i18n/translated-error-map';

/**
 * Wrapper around react-hook-form's useForm that integrates
 * translated Zod error messages via react-intl.
 *
 * Combines:
 * - react-hook-form for form state management
 * - Zod for validation
 * - react-intl for translated error messages
 *
 * @example
 * const form = useTranslatedForm({
 *   schema: paymentSchema,
 *   defaultValues: { amount: 0, currency: 'USD' },
 * });
 *
 * @see Doc 06 section 5 for react-hook-form integration
 */
export function useTranslatedForm<
  TFieldValues extends FieldValues = FieldValues,
>({
  schema,
  ...formOptions
}: {
  schema: z.ZodType<TFieldValues>;
} & Omit<UseFormProps<TFieldValues>, 'resolver'>) {
  const intl = useIntl();

  // Create a Zod error map that resolves translation keys
  const errorMap = useMemo(() => createTranslatedErrorMap(intl), [intl]);

  // Create the form with the translated resolver
  // Type assertion needed: Zod 4 classic types don't align perfectly
  // with @hookform/resolvers' core type expectations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useForm<TFieldValues>({
    ...formOptions,
    resolver: zodResolver(schema as any, { error: errorMap } as any) as any,
  });
}
