import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 입자 크기를 끌게 하면 작은 입자에서 큰 물방울로 가는 사이(파장과 크기가 비슷한 구간)가
 * 화면을 차지하는데, 이 조각이 답하는 것은 두 끝의 대비 하나다 — **작은 입자는 파란빛을
 * 사방으로, 큰 물방울은 흰빛을 앞으로.** 그 답은 두 레인이 차례로 흩는 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
