import { createContext, useContext, type ReactNode } from 'react';
import type { Host } from '@aperi21/host';

export const HostContext = createContext<Host | null>(null);

export interface HostProviderProps {
  host: Host;
  children: ReactNode;
}

export function HostProvider({ host, children }: HostProviderProps) {
  return <HostContext.Provider value={host}>{children}</HostContext.Provider>;
}

export function useHostContext(): Host {
  const host = useContext(HostContext);
  if (!host) {
    throw new Error('useHost must be used within HostProvider');
  }
  return host;
}
