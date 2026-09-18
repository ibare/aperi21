import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 독자가 해 볼 것은 「무거운 것과 붙으면 어떻게 되나」 하나인데, 그 하나를 시간표가
 * 두 번째 충돌로 직접 보인다 (`schema.timeline`). 조작기를 두면 같은 것을 누르게
 * 시키면서 자동 진행은 그대로 둬야 해, 독자가 손대는 동안 화면이 제 일정과 다투게 된다.
 */
export const controllers: readonly ControllerSpec[] = [];
