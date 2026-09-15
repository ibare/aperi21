import { useEffect, useMemo, type ReactNode } from 'react';
import { createHost } from '@aperi21/host';
import { HostProvider } from '@aperi21/react';
import { installAperi21Plugins, registerAperi21Bundles } from '@aperi21/bootstrap';
import { useTheme } from '../theme/ThemeProvider';
import { uiThemeFromCss } from './uiThemeFromCss';

/**
 * 카탈로그 앱의 light/dark 토글을 aperi21 Host 의 테마와 동기화.
 * Host 는 한 번만 만들고, 테마 변경 시 setTheme 로 in-place 갱신한다.
 *
 * 임베드의 **UI 축은 이 사이트의 CSS 토큰에서 온다** (`uiThemeFromCss`). 조작기가
 * 사이트와 같은 톤을 쓰되, 조각의 시각화는 엔진 기본값 그대로다.
 *
 * 플러그인 등록은 `installAperi21Plugins` 한 곳을 거친다 — 카탈로그가 optics·circuit
 * 둘만 정적으로 등록하고 있어서, 조각이 자기 렌더러를 Plugin 으로 들고 와도 그리지
 * 못했다 (S-host: 카탈로그는 한 곳에서만 선언한다).
 */
export function EngineProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const host = useMemo(
    () => {
      const h = createHost({ theme: uiThemeFromCss(theme), lang: 'ko' });
      // Tiptap NodeView 가 마운트될 때 같은 bundle 레지스트리를 통해 lazy load
      // 하므로, 부팅 시 한 번 loader 등록해 둔다.
      registerAperi21Bundles();
      void installAperi21Plugins(h);
      return h;
    },
    [],
  );

  useEffect(() => {
    host.setTheme(uiThemeFromCss(theme));
  }, [host, theme]);

  return <HostProvider host={host}>{children}</HostProvider>;
}
