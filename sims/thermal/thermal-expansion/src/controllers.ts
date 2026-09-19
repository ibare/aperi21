import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다. 두 온도 · 길이 · α · 겨울 틈은 스테이지 상수이고, 자동 진행이 겨울과
 * 여름을 오가며 「여름에 틈이 거의 닫힌다」 를 끝까지 말한다. 온도를 끌어 보게 하면
 * 과장 배율로 그린 틈을 실제 값처럼 재게 된다.
 */
export const controllers: readonly ControllerSpec[] = [];
