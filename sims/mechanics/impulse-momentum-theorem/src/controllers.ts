import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기 없음.
 *
 * 자동 진행 한 번으로 주장(넓이가 쌓이는 만큼 운동량 화살표가 옮겨 간다)이 끝난다.
 * 반발 계수를 고르게 하면 「더 튀면 충격량이 크다」 라는 두 번째 주장이 생기고, 그것은
 * 충돌 조각들의 몫이다.
 */
export const controllers: readonly ControllerSpec[] = [];
