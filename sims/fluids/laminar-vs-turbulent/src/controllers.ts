import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다. 자동 진행이 본체이므로 재생 버튼은 규범과 정면으로 충돌한다.
 */
export function controllers(): ControllerSpec[] {
  return [];
}
