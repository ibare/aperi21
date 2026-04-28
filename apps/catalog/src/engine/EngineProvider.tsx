import { useEffect, useMemo, type ReactNode } from 'react';
import { createHost } from '@aperi21/host';
import { HostProvider } from '@aperi21/react';
import { opticsPlugin } from '@aperi21/plugin-optics';
import { circuitPlugin } from '@aperi21/plugin-circuit';
import { registerAperi21Bundles } from '@aperi21/bootstrap';
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
    () => {
      const h = createHost({ theme, lang: 'ko', plugins: [opticsPlugin, circuitPlugin] });
      // Tiptap NodeView 가 마운트될 때 같은 bundle 레지스트리를 통해 lazy load
      // 하므로, 부팅 시 한 번 loader 등록해 둔다. plugin 은 이미 위에서 등록.
      registerAperi21Bundles();
      return h;
    },
    [],
  );

  useEffect(() => {
    host.setTheme(theme);
  }, [host, theme]);

  return <HostProvider host={host}>{children}</HostProvider>;
}
