import type { ColorRole } from '@aperi21/schema';
import type { Emphasis } from './types';

/** colorRole 전부 → hex 값. 라이트/다크 공통 팔레트. */
export type ColorPalette = Record<ColorRole, string>;

function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** emphasis 에 따라 원색을 조정. */
export function applyEmphasis(hex: string, emphasis: Emphasis = 'medium'): string {
  switch (emphasis) {
    case 'strong':
      return hex;
    case 'subtle':
      return hexToRgba(hex, 0.45);
    case 'medium':
    default:
      return hexToRgba(hex, 0.85);
  }
}

export function makeResolveColor(palette: ColorPalette) {
  return (role: ColorRole, emphasis?: Emphasis): string =>
    applyEmphasis(palette[role], emphasis);
}
