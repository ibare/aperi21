import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 온도를 끌게 하면 복사 막대가 화면 밖으로 나가 프레이밍이 무너지고(3배면 81배), 막대 위
 * 배수 글자가 정박값에서 벗어난 계산값이 된다. 이 조각이 답하는 것은 **온도 두 배에 복사
 * 열여섯 배** 하나이고, 그 답은 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
