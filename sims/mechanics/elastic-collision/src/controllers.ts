import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 독자가 해 볼 것은 「맞은 공도 움직이고 있었다면?」 하나인데, 그것을 시간표가 두 번째
 * 충돌로 직접 보인다 (`schema.timeline`). 조작기를 두면 독자가 손대는 동안 화면이 제
 * 일정과 다투게 된다.
 */
export const controllers: readonly ControllerSpec[] = [];
