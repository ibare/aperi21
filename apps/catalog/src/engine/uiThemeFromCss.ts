import { getTheme, type HostTheme, type ThemeMode } from '@aperi21/host';

/**
 * 카탈로그의 CSS 토큰에서 임베드의 **UI 축**을 만든다.
 *
 * 예전에는 같은 색이 두 벌이었다 — `tokens.css` 의 `--bg: #f5f1e8` 과 엔진
 * `themes.ts` 의 `background: '#F5F1E8'`. 한쪽만 고치면 사이트와 그 안의 조작기가
 * 갈렸고, 갈린 것을 알 방법은 화면을 보는 것뿐이었다.
 *
 * **그림 축은 가져오지 않는다.** 조각의 시각화는 사이트의 톤이 아니라 물리량의
 * 역할색을 따른다 — 사이트를 다시 칠한다고 속도 벡터의 색이 바뀌면 안 된다.
 * 두 축을 나눈 것이 정확히 이 구분을 위해서다.
 */
export function uiThemeFromCss(mode: ThemeMode): HostTheme {
  const base = getTheme(mode);
  if (typeof document === 'undefined') return base;

  const computed = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string): string => {
    const value = computed.getPropertyValue(name).trim();
    return value || fallback;
  };

  return {
    ...base,
    ui: {
      ...base.ui,
      surface: read('--surface-raised', base.ui.surface),
      border: read('--border', base.ui.border),
      label: read('--fg-muted', base.ui.label),
      text: read('--fg', base.ui.text),
      selected: read('--accent', base.ui.selected),
      toggled: read('--warning', base.ui.toggled),
      onSelected: read('--accent-fg', base.ui.onSelected),
      track: read('--border-strong', base.ui.track),
    },
  };
}
