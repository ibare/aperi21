import type { HostTheme } from '@aperi21/host';
import { useHost } from './useHost';

export function useTheme(): HostTheme {
  return useHost().theme;
}
