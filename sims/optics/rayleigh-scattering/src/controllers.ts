import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 해의 높이를 끌게 하면 지평선 쪽 끝을 스쳐 지나가 버려 「길이 길어지면 붉어진다」 가
 * 한 순간에만 선다. 이 조각이 답하는 것은 **짧은 길은 거의 희고 긴 길은 붉다** 하나이고,
 * 그 답은 해가 머리 위에서 지평선까지 내려가는 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
