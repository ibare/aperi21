import type { ControllerSpec } from '@aperi21/schema';
import { U_MAX, Y_BOT, Y_TOP } from './schema';
import { worldX, worldY } from './scene';

/**
 * 조작기 선언은 데이터다 (원칙 7 ④). 하나 — 전체 에너지 선의 높이를 위아래로 끄는 것.
 *
 * 독자가 선을 언덕 바로 위 · 아래로 오르내리며 고리가 바깥 벽으로 튀는 순간을 직접
 * 찾게 하려는 것이다. 원본은 캔버스 어디를 끌어도 됐지만 `scale-drag` 는 트랙 가까이만
 * 잡히고 손잡이 점을 늘 그린다. 선 위 도표 안에 세우면 그 점이 **두 번째 물체**로 읽혀,
 * 트랙을 에너지 선의 오른쪽 끝 바깥에 세로로 세운다 — 손잡이가 선의 끝에 달린다
 * (NOTES 「어휘 부족」).
 *
 * 한 번 잡으면 그 뒤로는 끈 높이가 목표다. 내릴 때 마찰로만 내려가는 규칙은
 * `physics.step` 이 지킨다.
 */
const E_LO = Y_BOT + 0.02;
const E_HI = Y_TOP - 0.02;
/** 에너지 선 오른쪽 끝(원본 sx(U_MAX))에서 12 px 바깥. */
const TRACK_X = worldX(U_MAX) + 0.12;

export const controllers: readonly ControllerSpec[] = [
  {
    id: 'energy-drag',
    type: 'scale-drag',
    heldPath: 'held',
    binds: { value: 'target', held: 'held' },
    track: { pos: [TRACK_X, worldY(E_LO)], direction: [0, 1], size: worldY(E_HI) - worldY(E_LO) },
    range: [E_LO, E_HI],
  },
];
