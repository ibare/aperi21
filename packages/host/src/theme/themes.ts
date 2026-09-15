import type { HostTheme, SceneTheme, ThemeMode, UiTheme } from './types';
import { makeResolveColor, type ColorPalette } from './engine';

// 카탈로그 앱 tokens.css 와 같은 시그니처 톤을 유지한다.
// 직접 색상 문자열은 이 파일 안에서만 허용된다.

const lightPalette: ColorPalette = {
  primary: '#C73E3A',
  secondary: '#2F5CAA',
  accent: '#B8751F',
  muted: '#6B7280',
  positive: '#2A7A5A',
  negative: '#8B2A2A',
  // 먹 — 테마 전경색과 같은 값이다 (아래 lightScene.foreground).
  ink: '#1A2332',
};

const darkPalette: ColorPalette = {
  primary: '#E85A55',
  secondary: '#5E8FD6',
  accent: '#D9B26A',
  muted: '#7C8699',
  positive: '#6BB88A',
  negative: '#D46A66',
  ink: '#F5F1E8',
};

/**
 * 두 축이 공유하는 뿌리. 여기 있는 것만 두 축에 같은 값으로 들어간다 —
 * 글꼴처럼 갈라지면 한 화면이 두 서체로 보이는 것들이다.
 */
const typography = {
  fontFamily: "'Newsreader', 'Noto Sans KR', Georgia, serif",
  fontFamilyMono: "'JetBrains Mono', 'SF Mono', monospace",
};

const sceneGeometry = {
  fontSize: { small: 10, regular: 11, large: 13 },
  strokeWidth: { hair: 0.5, thin: 1, regular: 1.5, thick: 2, heavy: 3 },
};

/**
 * 조작기 쪽 치수. 그림 쪽(`sceneGeometry`)과 **따로 둔다** — 조작기를 키우거나
 * 여백을 넓히는 일이 그림의 선 굵기를 건드리면 안 된다.
 */
const uiGeometry = {
  fontSize: { small: 10, regular: 11, large: 12 },
  spacing: { xs: 4, sm: 6, md: 10, lg: 12 },
  radius: { small: 2, medium: 4, container: 8 },
  strokeWidth: { thin: 1, regular: 1.5, thick: 2, heavy: 3 },
  layout: { margin: 12, gap: 8, controlHeight: 22, stackGap: 10 },
};

/** 색만 받아 축 하나를 완성한다. 글꼴·치수는 위의 한 벌을 그대로 쓴다. */
function sceneOf(
  palette: ColorPalette,
  colors: Pick<SceneTheme, 'background' | 'foreground' | 'muted' | 'line' | 'grid'>,
): SceneTheme {
  return { ...colors, ...typography, ...sceneGeometry, resolveColor: makeResolveColor(palette) };
}

const lightScene = sceneOf(lightPalette, {
  background: '#F5F1E8',
  foreground: '#1A2332',
  muted: '#4A5668',
  line: '#D4CEC2',
  grid: '#E8E2D4',
});

const darkScene = sceneOf(darkPalette, {
  background: '#0F1620',
  foreground: '#F5F1E8',
  muted: '#B8BFCC',
  line: '#2A3A58',
  grid: '#1A2332',
});

const lightUi: UiTheme = {
  surface: 'rgba(107, 114, 128, 0.12)',
  border: '#D4CEC2',
  label: '#4A5668',
  text: '#1A2332',
  selected: '#C73E3A',
  toggled: '#B8751F',
  onSelected: '#F5F1E8',
  track: '#D4CEC2',
  ...typography,
  ...uiGeometry,
};

const darkUi: UiTheme = {
  surface: 'rgba(124, 134, 153, 0.18)',
  border: '#2A3A58',
  label: '#B8BFCC',
  text: '#F5F1E8',
  selected: '#E85A55',
  toggled: '#D9B26A',
  onSelected: '#0F1620',
  track: '#2A3A58',
  ...typography,
  ...uiGeometry,
};

export const lightTheme: HostTheme = { mode: 'light', scene: lightScene, ui: lightUi };
export const darkTheme: HostTheme = { mode: 'dark', scene: darkScene, ui: darkUi };

export function getTheme(mode: ThemeMode): HostTheme {
  return mode === 'dark' ? darkTheme : lightTheme;
}
