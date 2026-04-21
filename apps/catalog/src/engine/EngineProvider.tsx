import { useEffect, useMemo, type ReactNode } from 'react';
import { createHost } from '@aperi21/host';
import { HostProvider } from '@aperi21/react';
import { useTheme } from '../theme/ThemeProvider';

/**
 * 카탈로그 앱의 light/dark 토글을 aperi21 Host 의 테마와 동기화.
 * Host 는 한 번만 만들고, 테마 변경 시 setTheme 로 in-place 갱신한다.
 */
export function EngineProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const host = useMemo(() => createHost({ theme, lang: 'ko' }), []);

  useEffect(() => {
    host.setTheme(theme);
  }, [host, theme]);

  return <HostProvider host={host}>{children}</HostProvider>;
}
