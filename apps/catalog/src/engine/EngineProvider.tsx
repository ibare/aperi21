import { useMemo, type ReactNode } from 'react';
import { createHost } from '@aperi21/host';
import { HostProvider } from '@aperi21/react';
import { useTheme } from '../theme/ThemeProvider';

/**
 * 카탈로그 앱의 기존 light/dark 토글 상태를 aperi21 엔진 Host 의 테마로 동기화한다.
 * 테마가 바뀔 때마다 Host 를 재생성 — Phase 1 에는 plugin 이 없어 생성 비용이 낮다.
 * Phase 2 에서 plugin 이 붙으면 이 부분을 setTheme 기반 in-place 갱신으로 바꾼다.
 */
export function EngineProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const host = useMemo(
    () => createHost({ theme, lang: 'ko' }),
    [theme],
  );

  return <HostProvider host={host}>{children}</HostProvider>;
}
