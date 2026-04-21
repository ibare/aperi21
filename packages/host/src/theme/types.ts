import type { ColorRole } from '@aperi21/schema';

export type ThemeMode = 'light' | 'dark';
export type Emphasis = 'strong' | 'medium' | 'subtle';

/**
 * 호스트가 관리하는 완전한 Theme 인터페이스.
 *
 * 참고: `@aperi21/schema` 의 `Theme` 은 plugin 렌더러가 보는 최소 계약(resolveColor
 * 등 4개 필드)만 정의되어 있다. 호스트와 React 계층은 이 확장 타입을 쓴다.
 * Phase 2에서 schema 의 Theme 을 이 형태로 맞추면서 통일할 예정.
 */
export interface HostTheme {
  mode: ThemeMode;

  resolveColor(role: ColorRole, emphasis?: Emphasis): string;

  background: string;
  foreground: string;
  muted: string;
  line: string;
  grid: string;

  fontFamily: string;
  fontFamilyMono: string;

  radiusSmall: number;
  radiusMedium: number;
  strokeWidth: { thin: number; regular: number; thick: number };
}
