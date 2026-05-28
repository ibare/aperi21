import type { ControllerSpec } from '@aperi21/schema';

/**
 * DC 회로는 파라미터(V, R1, R2) 슬라이더로 조절 — 스테이지별 회로도는 고정.
 * 별도 씬 내 제어 요소는 없으므로 컨트롤러 없음.
 */
export function controllers(): ControllerSpec[] {
  return [];
}
