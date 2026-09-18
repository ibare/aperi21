import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 질량 · 속도를 고르게 하면 「이번에도 합이 그대로인가」 를 독자가 확인할 수는 있지만,
 * 이 조각의 대비는 값이 아니라 **누가 미느냐**(서로 · 벽)에 있고 그 대비는 한 주기
 * 안에 자동으로 끝난다 (S-piece). 속도를 키우면 합 화살표가 줄 밖으로 나가 프레이밍도
 * 무너진다.
 */
export const controllers: readonly ControllerSpec[] = [];
