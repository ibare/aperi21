import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 **같은 재료 · 같은 전압에서 길이를 늘이면 전류가 줄고, 단면적을
 * 넓히면 는다** 하나이고, 그 답은 세 도선을 나란히 두고 같은 시간 동안 빠져나간 알갱이를
 * 쌓는 시간표로 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece). 길이 · 굵기를 끌게
 * 하면 세 도선의 견줌이 한 도선의 변화로 바뀌고, 배수가 정수가 아니면 무더기가 정수로 떨어지지 않는다.
 */
export const controllers: readonly ControllerSpec[] = [];
