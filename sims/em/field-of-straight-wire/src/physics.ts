// ========================================================================
// field-of-straight-wire — 순수 물리
// ========================================================================
// 화면에서 실제로 일어나는 것은 바늘이 **돌아가는 것** 하나다. 아래 한 줄이
// 주장 셋을 한꺼번에 만든다 — 따로 연출한 것이 없다.
//
//   θ' = rate · |B| · sin(θ_B − θ)
//   B  = 지구장(0, 1) + 전선장 I·(RC/r)·t̂
//
// 1. 고리 방향   — 전선 가까이서는 전선장이 지구장을 압도해 θ_B 가 거의 접선이다
// 2. 멀수록 덜   — 전선장은 1/r, 지구장은 어디서나 1. 멀어질수록 북으로 끌린다
// 3. 안에서 밖으로 번진다 — 회전 속도가 |B| 에 비례하니 시간상수가 거리에 비례한다
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import {
  followAngle,
  wireFieldDirection,
  wireFieldMagnitude,
  wrapAngle,
} from '@aperi21/plugin-em';
import {
  CAPTION_THRESHOLD,
  CURRENT_PHASES,
  EARTH_FIELD,
  FOLLOW_RATE,
  NEUTRAL_RADIUS,
  RINGS,
  SAMPLE_BOUNDS,
  WIRE,
} from './schema';
import type { FieldOfStraightWireState } from './state';

/** 한 주기(초). 선언한 구간 길이의 합이다 — 주기를 따로 적지 않는다. */
export const CURRENT_PERIOD = CURRENT_PHASES.reduce((sum, p) => sum + p.duration, 0);

/** 구간 전환의 곡선. 값이 바뀌는 구간에만 걸린다. */
function smoothstep(u: number): number {
  return u * u * (3 - 2 * u);
}

/**
 * 지금 전류 (−1 … 1). 선언한 구간표(`CURRENT_PHASES`)를 앞에서부터 훑는다.
 *
 * 경계를 상수로 두고 `if (u < 3.25)` 로 가르지 않는다 — 그러면 "이 구간을
 * 0.3 초 더 길게" 를 저작자가 할 수 없다 (S-piece · 원칙 2).
 */
export function currentAt(t: number): number {
  let u = t % CURRENT_PERIOD;
  if (u < 0) u += CURRENT_PERIOD;
  for (const phase of CURRENT_PHASES) {
    if (u < phase.duration) {
      if (phase.from === phase.to) return phase.to;
      return phase.from + (phase.to - phase.from) * smoothstep(u / phase.duration);
    }
    u -= phase.duration;
  }
  return CURRENT_PHASES[CURRENT_PHASES.length - 1]?.to ?? 0;
}

/** 나침반 하나가 서는 자리. */
export interface CompassSample {
  /** 월드 좌표. */
  readonly pos: Vec2;
  /** 전선에서의 거리. 전선장의 크기가 이것으로 정해진다. */
  readonly r: number;
}

/**
 * 나침반이 서는 자리들. 링 선언에서 좌표를 만들고 화면 밖은 빼낸다.
 *
 * **좌표만 내준다.** 그 자리에 무엇이 어떤 모양으로 서는지는 `scene` 이 정한다 —
 * 배치기가 링을 그려 주거나 장선을 깔아 주면 이 조각은 성립하지 않는다
 * (원본 NOTES 「엔진이 강제하면 안 되는 것」).
 *
 * 순수 함수다. 같은 선언은 언제나 같은 자리를 같은 순서로 내주므로
 * `state.angles` 의 인덱스가 이것과 짝지어진다.
 */
export function deriveSamples(): CompassSample[] {
  const out: CompassSample[] = [];
  for (const ring of RINGS) {
    for (let k = 0; k < ring.count; k++) {
      const phi = ring.offset + (k * 2 * Math.PI) / ring.count;
      const x = WIRE[0] + ring.r * Math.cos(phi);
      const y = WIRE[1] + ring.r * Math.sin(phi);
      if (x < SAMPLE_BOUNDS.minX || x > SAMPLE_BOUNDS.maxX) continue;
      if (y < SAMPLE_BOUNDS.minY || y > SAMPLE_BOUNDS.maxY) continue;
      out.push({ pos: [x, y], r: ring.r });
    }
  }
  return out;
}

/**
 * 그 자리의 알짜 자기장 — 지구장 + 전선장.
 *
 * 지구장을 남겨 둔 것이 "멀수록 덜" 의 근거다. 전선장만 두면 방향이 거리와
 * 무관한 완전한 접선이 되어 거리 의존이 아예 사라진다.
 */
export function netField(pos: Vec2, current: number): Vec2 {
  const dx = pos[0] - WIRE[0];
  const dy = pos[1] - WIRE[1];
  const r = Math.hypot(dx, dy);
  const magnitude = wireFieldMagnitude(r, Math.abs(current) * NEUTRAL_RADIUS);
  const [tx, ty] = wireFieldDirection(dx, dy, current);
  return [magnitude * tx + EARTH_FIELD[0], magnitude * ty + EARTH_FIELD[1]];
}

/**
 * 캡션이 보는 자리. 문장이 갈리는 것은 전류의 **부호**이지 시각이 아니다.
 *
 * 선언은 이 결과가 놓인 자리(`forward` · `reversed`)를 이름으로 가리킬 뿐이고,
 * 세는 것은 여기다 (`CaptionSlotDef.cases`, 원칙 2).
 */
export function captionFlags(current: number): { forward: boolean; reversed: boolean } {
  return { forward: current > CAPTION_THRESHOLD, reversed: current < -CAPTION_THRESHOLD };
}

/**
 * 한 스텝 전진. 바늘마다 그 자리의 알짜 자기장을 1차로 따라간다.
 *
 * 각도 wrap 과 최단각 처리는 `@aperi21/plugin-em` 이 한다 — 나침반 · 풍향계 ·
 * 바람에 눕는 풀 · 전기 쌍극자가 전부 같은 식이라, 조각마다 다시 짜면 조각마다
 * 다르게 틀린다.
 */
export function step(params: {
  state: FieldOfStraightWireState;
  dt: number;
}): FieldOfStraightWireState {
  const { state, dt } = params;
  const t = state.t + dt;
  const samples = deriveSamples();

  // 적분은 **구간 시작**의 전류로 한다. 도착 시각의 값으로 적분하면 아직 오지
  // 않은 장을 한 걸음 먼저 겪는 셈이라, 전류가 켜지고 뒤집히는 구간에서 바늘이
  // 한 프레임만큼 앞서 돈다.
  const driving = currentAt(state.t);
  // 화면이 읽는 값은 도착 시각의 것이다 — 이 상태로 그려지는 프레임의 시각이다.
  const current = currentAt(t);

  const angles = state.angles.map((theta, i) => {
    const sample = samples[i];
    if (!sample) return theta;
    const [bx, by] = netField(sample.pos, driving);
    const strength = Math.hypot(bx, by);
    const target = Math.atan2(by, bx);
    return wrapAngle(followAngle(theta, target, dt, { rate: FOLLOW_RATE, strength }));
  });

  return { t, current, angles, ...captionFlags(current) };
}
