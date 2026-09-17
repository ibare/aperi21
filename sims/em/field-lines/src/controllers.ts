import type { ControllerSpec } from '@aperi21/schema';

/** 잡히는 반경(화면 px). 원본 판정 반경 26 그대로. */
const GRAB_RADIUS_PX = 26;

/**
 * 음전하를 끌어 옮긴다.
 *
 * 독자가 "그럼 여기 두면?" 을 직접 확인하는 자리다 — 선이 몰리는 곳과 알갱이가
 * 빨라지는 곳이 **함께** 옮겨 간다. 놓으면 `step` 이 0.5초 시상수로 자동 경로에
 * 돌려보낸다. 자동 진행만으로도 조각은 할 말을 마친다 (S-piece).
 *
 * 손잡이는 `ring` — 채운 점이면 음전하의 가로선을 가린다. 원본은 손잡이를 따로
 * 그리지 않았다 (NOTES.md 「어휘 부족」 G21).
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'minus-drag',
    type: 'point-drag',
    binds: { pos: 'drag.pos', held: 'drag.held' },
    grabRadius: GRAB_RADIUS_PX,
    handle: 'ring',
  },
];
