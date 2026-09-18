import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * Δx 슬라이더를 두면 「좁히면 넓어진다」 를 손으로 해 볼 수 있지만, 이 조각의 답은
 * 손잡이가 무엇이든 같다 — 점은 바닥 곡선 위를 오갈 뿐이고 어디로 끌어도 빗금 안으로
 * 들어가지 않는다. 자동 진행이 좁힘과 풂을 한 주기 안에 모두 보인다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
