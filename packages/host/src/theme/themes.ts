import type { HostTheme } from './types';
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
  // 먹 — 테마 전경색과 같은 값이다 (아래 lightTheme.foreground).
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

const baseTypography = {
  fontFamily: "'Newsreader', 'Noto Sans KR', Georgia, serif",
  fontFamilyMono: "'JetBrains Mono', 'SF Mono', monospace",
};

const baseGeometry = {
  radiusSmall: 2,
  radiusMedium: 4,
  strokeWidth: { thin: 0.5, regular: 1, thick: 2 },
};

export const lightTheme: HostTheme = {
  mode: 'light',
  background: '#F5F1E8',
  foreground: '#1A2332',
  muted: '#4A5668',
  line: '#D4CEC2',
  grid: '#E8E2D4',
  ...baseTypography,
  ...baseGeometry,
  resolveColor: makeResolveColor(lightPalette),
};

export const darkTheme: HostTheme = {
  mode: 'dark',
  background: '#0F1620',
  foreground: '#F5F1E8',
  muted: '#B8BFCC',
  line: '#2A3A58',
  grid: '#1A2332',
  ...baseTypography,
  ...baseGeometry,
  resolveColor: makeResolveColor(darkPalette),
};

export function getTheme(mode: 'light' | 'dark'): HostTheme {
  return mode === 'dark' ? darkTheme : lightTheme;
}
