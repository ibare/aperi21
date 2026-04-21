import { useEffect, useMemo, type ReactNode } from 'react';
import { createHost } from '@aperi21/host';
import { HostProvider } from '@aperi21/react';
import { opticsPlugin } from '@aperi21/plugin-optics';
import { circuitPlugin } from '@aperi21/plugin-circuit';
import { useTheme } from '../theme/ThemeProvider';

/**
 * 카탈로그 앱의 light/dark 토글을 aperi21 Host 의 테마와 동기화.
 * Host 는 한 번만 만들고, 테마 변경 시 setTheme 로 in-place 갱신한다.
 *
 * Phase 2-A 에서 ray_tracing/dc_circuit 번들을 위해 optics/circuit 플러그인을
 * 초기 등록한다. 이들은 PrimitiveRenderer(ray, opticalElement, circuitElement,
 * wire, terminal) 와 utilities(traceRay, findImage, solveMna, manhattanRoute)
 * 를 호스트에 제공한다.
 */
export function EngineProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const host = useMemo(
    () => createHost({ theme, lang: 'ko', plugins: [opticsPlugin, circuitPlugin] }),
    [],
  );

  useEffect(() => {
    host.setTheme(theme);
  }, [host, theme]);

  return <HostProvider host={host}>{children}</HostProvider>;
}
