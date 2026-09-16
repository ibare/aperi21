// ========================================================================
// vector-addition — 순수 물리
// ========================================================================
// 시각과 단계는 엔진이 시간표 선언(`schema.timeline`)에서 준다. 여기가 하는 일은
// 끌린 머리를 **쓸 수 있는 자리로 되돌리는 것** 하나다 — 조작기는 포인터가 짚은
// 자리를 그대로 써 넣고, 그것이 화살표로 성립하는지는 조각이 안다.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';

import { MIN_LENGTH, ORIGIN, TIP_X, TIP_Y } from './schema';
import type { VectorAdditionState } from './state';

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * 꼬리에서 나간 머리를 쓸 수 있는 자리로 옮긴다. 원본 `setVec()` 과 같은 순서다 —
 * 너무 짧으면 먼저 최소 길이로 늘이고, 그 다음 가장자리로 자른다. 순서를 뒤집으면
 * 화면 끝에서 화살표가 최소 길이를 넘겨 튀어나간다.
 */
function settle(tail: Vec2, tip: Vec2): Vec2 {
  let vx = tip[0] - tail[0];
  let vy = tip[1] - tail[1];
  const len = Math.hypot(vx, vy);
  if (len < MIN_LENGTH) {
    const k = MIN_LENGTH / (len || 1);
    vx *= k;
    vy *= k;
  }
  return [
    clamp(tail[0] + vx, TIP_X[0], TIP_X[1]),
    clamp(tail[1] + vy, TIP_Y[0], TIP_Y[1]),
  ];
}

function same(a: Vec2, b: Vec2): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

/**
 * 한 걸음.
 *
 * 누적하는 것이 없다 — `dt` 를 쓰지 않는다. 그래도 매 프레임 도는 이유는 조작기가
 * 써 넣은 자리를 여기서 정리하고, **가를 끌 때 나가 따라오게** 하기 위해서다.
 * 나는 옮겨 붙어도 변하지 않는 벡터이므로, 가의 머리가 움직이면 나의 머리도 같은
 * 만큼 움직인다.
 */
export function step(params: { state: VectorAdditionState }): VectorAdditionState {
  const s = params.state;
  const aTip = settle(ORIGIN, s.aTip);
  const bDelta = s.bHeld
    ? (((): Vec2 => {
        const settled = settle(aTip, s.bTip);
        return [settled[0] - aTip[0], settled[1] - aTip[1]];
      })())
    : s.bDelta;
  const bTip: Vec2 = [aTip[0] + bDelta[0], aTip[1] + bDelta[1]];
  const dragging = s.aHeld || s.bHeld;

  if (
    same(aTip, s.aTip) &&
    same(bTip, s.bTip) &&
    same(bDelta, s.bDelta) &&
    dragging === s.dragging
  ) {
    return s;
  }
  return { ...s, aTip, bTip, bDelta, dragging };
}
