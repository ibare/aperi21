import type { HostI18n } from '@aperi21/host';
import { useHost } from './useHost';

export function useI18n(): HostI18n {
  return useHost().i18n;
}
