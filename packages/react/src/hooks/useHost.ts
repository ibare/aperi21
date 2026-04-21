import type { Host } from '@aperi21/host';
import { useHostContext } from '../providers/HostProvider';

export function useHost(): Host {
  return useHostContext();
}
