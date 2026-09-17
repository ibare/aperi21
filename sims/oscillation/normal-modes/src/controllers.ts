import type { ControllerSpec } from '@aperi21/schema';
import { N, snapColumn } from './schema';
import { grabKey } from './physics';

/**
 * 원본의 구슬 끌기 판정 반경(화면 px). 가장 가까운 구슬을 이 안에서 잡는다.
 */
const GRAB_RADIUS_PX = 26;

/**
 * 조작기 — 구슬 끌기. 구슬마다 인스턴스 하나 (원칙 7).
 *
 * 붙잡은 동안 그 구슬만 끈 자리에, 나머지는 멈춘 0 에 둔다. 놓으면 거기서 흔들림이
 * 시작되고 모드 줄이 새로 나뉜다 — 가운데 구슬을 당기면 세 모양, 둘째 구슬이면 네 모양.
 * 자동 진행만으로 조각은 할 말을 마치고, 이것은 「들어 있는 모양이 당긴 자리에 달렸다」
 * 를 독자가 직접 해 보는 자리다.
 *
 * 구슬은 세로로만 움직인다 — `snapTo` 에 그 구슬의 세로 칸 표본을 준다.
 */
export const controllers: readonly ControllerSpec[] = Array.from(
  { length: N },
  (_, j): ControllerSpec => ({
    id: `bead-${j}`,
    type: 'point-drag',
    binds: { pos: `grab.${grabKey(j)}.pos`, held: `grab.${grabKey(j)}.held` },
    grabRadius: GRAB_RADIUS_PX,
    snapTo: snapColumn(j),
  }),
);
