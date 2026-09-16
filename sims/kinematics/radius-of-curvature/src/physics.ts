// ========================================================================
// radius-of-curvature — 순수 물리
// ========================================================================
// 곡률 반지름을 **입력으로** 주고 곡선을 받는다. 곡선을 먼저 정하고 곡률을
// 미분하는 방향은 "화면에 담기면서 4배 차이 나는 곡률 반지름" 을 만들 수
// 없었다 (NOTES.md (b)). 그 유도는 `@aperi21/plugin-mechanics` 의 순수 함수로
// 올라가 있다 — 원칙 1 이 sim 에 허용하는 「도메인 plugin 의 순수 계산 함수」다.
// ========================================================================

import {
  angleAtArcLength,
  arcLengthAtAngle,
  pathFromCurvatureRadius,
  sampleAtArcLength,
  type CurvaturePath,
} from '@aperi21/plugin-mechanics';
import type { Vec2 } from '@aperi21/schema';

import { MEAN_RADIUS, PATH_SAMPLES, PERIOD, START_PHI, WOBBLE } from './schema';
import type { RadiusOfCurvatureState } from './state';

/** 매개변수 φ(바깥 법선의 방향각)에서의 곡률 반지름. */
export function radiusAt(phi: number): number {
  return MEAN_RADIUS - 3 * WOBBLE * Math.cos(2 * phi);
}

/**
 * 길 · 축폐선 · 호길이 표. **모양이 변하지 않으므로 한 번만 빚는다.**
 *
 * 모듈 상수이되 인스턴스 상태가 아니다 — 불변 표이고 임베드마다 같은 값이라
 * 섞일 것이 없다 (C5 는 인스턴스 상태를 금한다).
 */
export const CURVE: CurvaturePath = pathFromCurvatureRadius({
  radiusAt,
  samples: PATH_SAMPLES,
});

/**
 * 호길이 기준 속력. `ds = R dφ` 이므로 φ 를 등속으로 돌리면 굽은 곳에서 느려지고,
 * 그러면 **"느린 곳에서 원이 작다" 는 틀린 읽기가 생긴다.** 원이 바뀌는 이유가
 * 오직 자리라는 것을 지키려면 속력이 어디서나 같아야 한다.
 */
export const SPEED = CURVE.totalLength / PERIOD;

/** 시작 자리의 호길이. 도착한 순간 이미 부푸는 중이다. */
export function startArc(path: CurvaturePath): number {
  return arcLengthAtAngle(path, START_PHI);
}

/** 그 호길이에서 화면이 알아야 하는 전부. */
export interface Reading {
  /** 달리는 점. */
  point: Vec2;
  /** 얹힌 원의 중심 — 축폐선 위의 점. */
  center: Vec2;
  /** 얹힌 원의 반지름 = 그 자리의 곡률 반지름. */
  radius: number;
  /** 접촉점의 방향각. 원을 접촉점 기준으로 반 바퀴씩 펼치는 데 쓴다. */
  phi: number;
  /**
   * `dR/dφ = 6·WOBBLE·sin 2φ > 0` — 원이 커지는 중.
   *
   * **위치가 아니라 부호다.** 위치로 가르면 "가장 굽은 자리를 막 지나 부푸는 중" 에
   * '오므라든다' 가 떠서 화면과 어긋난다.
   */
  swelling: boolean;
}

export function deriveAt(arc: number): Reading {
  const s = sampleAtArcLength(CURVE, arc);
  return {
    point: s.point,
    center: s.center,
    radius: s.radius,
    phi: s.phi,
    swelling: Math.sin(2 * s.phi) > 0,
  };
}

/**
 * 끌린 자리를 호길이로 되읽는다.
 *
 * 조작기의 `snapTo` 가 이미 길의 표본 점열로 붙여 놓았으므로 여기서 하는 일은
 * **어느 표본인지 찾아 그 호길이를 꺼내는 것**뿐이다. 자동 진행과 손 조작이
 * 호길이 하나만 공유하니 인계가 대입 한 줄로 끝난다.
 */
export function arcAtPoint(pos: Vec2): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < CURVE.points.length; i++) {
    const p = CURVE.points[i];
    if (!p) continue;
    const d = (p[0] - pos[0]) ** 2 + (p[1] - pos[1]) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return CURVE.arcLengths[best] ?? 0;
}

/** 지금 자리의 φ. 호길이를 각으로 되읽어야 할 때 쓴다. */
export function angleAt(arc: number): number {
  return angleAtArcLength(CURVE, arc);
}

/**
 * 한 걸음.
 *
 * 잡고 있는 동안은 조작기가 쓴 자리가 이긴다. 놓으면 **그 자리에서** 자동 진행이
 * 이어진다 — 무엇으로 돌아갈지는 조각이 안다.
 */
export function step(params: {
  state: RadiusOfCurvatureState;
  dt: number;
}): RadiusOfCurvatureState {
  const { state, dt } = params;
  const arc = state.held ? arcAtPoint(state.pos) : state.arc + SPEED * dt;
  const d = deriveAt(arc);
  return { arc, pos: d.point, held: state.held, swelling: d.swelling };
}
