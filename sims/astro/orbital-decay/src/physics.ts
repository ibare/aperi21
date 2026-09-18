// ========================================================================
// orbital-decay — 순수 물리
// ========================================================================
// 위성은 처음 원 궤도의 오른쪽 (r₀, 0) 에서 반시계로 떠난다. 힘은 둘이다.
//
//   중력            a_g = −GM · r / |r|³
//   항력            a_d = −k · ρ(r) · |v| · v,     ρ(r) = exp(−(|r| − R)/H)   (지면 밀도 1)
//
// 항력은 늘 진행 반대쪽이다. 그런데 에너지를 잃은 위성은 조금 낮은 궤도로 내려앉고, 낮은 궤도의
// 원 속도 √(GM/r) 이 더 크다 — 거의 원인 궤도에서 내놓은 위치 에너지의 절반이 공기로, 절반이
// 속도로 간다. 이 조각은 그 결과를 식으로 쓰지 않고 **적분해서** 보인다.
//
// 적분이 필요하지만 상태에 쌓지 않는다. 매 프레임 주기 시작의 같은 처음 값에서 **고정 걸음 RK4** 로
// 지금 시각까지 다시 적분한다 — 같은 시각은 언제나 같은 화면이고, 주기가 돌아오면 저절로 되감긴다.
// 비용은 한 프레임에 7~8천 걸음(수백 μs)이다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ARROW_PER_SPEED,
  BAR_PER_ENERGY,
  DRAG_ARROW_LENGTH,
  DRAG_COEFFICIENT,
  GM,
  LAP_SECONDS,
  PLANET_RADIUS,
  SCALE_HEIGHT,
  START_RADIUS,
} from './schema';
import type { OrbitalDecayState } from './state';

export interface OrbitalDecayConstants {
  gm: number;
  planetRadius: number;
  startRadius: number;
  scaleHeight: number;
  dragCoefficient: number;
  lapSeconds: number;
  arrowPerSpeed: number;
  dragArrowLength: number;
  barPerEnergy: number;
}

export function readConstants(stage: StageDef): OrbitalDecayConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    gm: c.gm ?? GM,
    planetRadius: c.planetRadius ?? PLANET_RADIUS,
    startRadius: c.startRadius ?? START_RADIUS,
    scaleHeight: c.scaleHeight ?? SCALE_HEIGHT,
    dragCoefficient: c.dragCoefficient ?? DRAG_COEFFICIENT,
    lapSeconds: c.lapSeconds ?? LAP_SECONDS,
    arrowPerSpeed: c.arrowPerSpeed ?? ARROW_PER_SPEED,
    dragArrowLength: c.dragArrowLength ?? DRAG_ARROW_LENGTH,
    barPerEnergy: c.barPerEnergy ?? BAR_PER_ENERGY,
  };
}

/** 적분 걸음(물리 시간). 지면 근처 한 바퀴(약 6.3)를 300 걸음 넘게 나눈다. */
const DT = 0.02;
/** 자취에 점을 남기는 간격(걸음 수). 지면 근처 한 바퀴에도 60 점이 넘어 각져 보이지 않는다. */
const TRAIL_EVERY = 5;

/** 위치 · 속도(물리 단위). */
type Phase4 = [number, number, number, number];

/** 지금 위성과 이번 주기에 쌓인 것. */
export interface Satellite {
  pos: Vec2;
  vel: Vec2;
  /** 이번 주기에 지나온 길(월드). */
  trail: Vec2[];
  /** 지면에 닿았는가. 닿은 뒤에는 그 자리에 멈춘다. */
  landed: boolean;
  /** 처음에서 지금까지 내놓은 위치 에너지(단위 질량). */
  released: number;
  /** 그중 속도(운동 에너지)로 간 몫. */
  toSpeed: number;
  /** 그중 공기가 가져간 몫 = 처음 역학적 에너지 − 지금 역학적 에너지. */
  toAir: number;
}

function derivative(c: OrbitalDecayConstants, s: Phase4): Phase4 {
  const [x, y, vx, vy] = s;
  const r = Math.hypot(x, y);
  const g = -c.gm / (r * r * r);
  const rho = Math.exp(-(r - c.planetRadius) / c.scaleHeight);
  const drag = c.dragCoefficient * rho * Math.hypot(vx, vy);
  return [vx, vy, g * x - drag * vx, g * y - drag * vy];
}

function rk4(c: OrbitalDecayConstants, s: Phase4, h: number): Phase4 {
  const add = (a: Phase4, k: Phase4, f: number): Phase4 => [
    a[0] + k[0] * f,
    a[1] + k[1] * f,
    a[2] + k[2] * f,
    a[3] + k[3] * f,
  ];
  const k1 = derivative(c, s);
  const k2 = derivative(c, add(s, k1, h / 2));
  const k3 = derivative(c, add(s, k2, h / 2));
  const k4 = derivative(c, add(s, k3, h));
  return [
    s[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    s[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    s[2] + (h / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
    s[3] + (h / 6) * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3]),
  ];
}

/** 처음 원 궤도 한 바퀴의 물리 시간. */
function startLap(c: OrbitalDecayConstants): number {
  return 2 * Math.PI * Math.sqrt(c.startRadius ** 3 / c.gm);
}

/**
 * 비행 시계(화면 초). 주기 시작부터 `plunge` 가 끝날 때까지 흐르고 그 뒤로는 멈춘다 — `hold` · `fade`
 * 동안 위성은 떨어진 자리에 있다. 단계는 캡션만 가르고 움직임은 한 시계다.
 */
export function flightSeconds(tl: TimelineFrame): number {
  return Math.min(Math.max(tl.u - tl.start('sink'), 0), tl.end('plunge') - tl.start('sink'));
}

/** 비행 시계 s(화면 초)의 위성. 처음 값에서 다시 적분한다. */
export function satelliteAt(c: OrbitalDecayConstants, s: number): Satellite {
  const v0 = Math.sqrt(c.gm / c.startRadius);
  let st: Phase4 = [c.startRadius, 0, 0, v0];
  const trail: Vec2[] = [[st[0], st[1]]];
  const tEnd = (s / c.lapSeconds) * startLap(c);
  const steps = Math.floor(tEnd / DT);
  let landed = false;

  for (let i = 0; i < steps && !landed; i++) {
    const next = rk4(c, st, DT);
    if (Math.hypot(next[0], next[1]) <= c.planetRadius) {
      landed = true;
      st = toSurface(c, st, next);
    } else {
      st = next;
    }
    if (landed || (i + 1) % TRAIL_EVERY === 0) trail.push([st[0], st[1]]);
  }
  if (!landed) {
    const rest = tEnd - steps * DT;
    if (rest > 0) st = rk4(c, st, rest);
    trail.push([st[0], st[1]]);
  }

  const r = Math.hypot(st[0], st[1]);
  const v2 = st[2] * st[2] + st[3] * st[3];
  const released = c.gm / r - c.gm / c.startRadius;
  const toSpeed = v2 / 2 - (v0 * v0) / 2;
  return {
    pos: [st[0], st[1]],
    vel: [st[2], st[3]],
    trail,
    landed,
    released,
    toSpeed,
    toAir: released - toSpeed,
  };
}

/** 지면을 뚫은 걸음을 지면 위 자리로 되돌린다 — 두 걸음 사이를 반지름으로 선형 보간. */
function toSurface(c: OrbitalDecayConstants, a: Phase4, b: Phase4): Phase4 {
  const ra = Math.hypot(a[0], a[1]);
  const rb = Math.hypot(b[0], b[1]);
  const f = ra === rb ? 1 : (ra - c.planetRadius) / (ra - rb);
  const lerp = (i: number): number => a[i]! + (b[i]! - a[i]!) * f;
  const x = lerp(0);
  const y = lerp(1);
  const k = c.planetRadius / Math.hypot(x, y);
  return [x * k, y * k, lerp(2), lerp(3)];
}

/** 자취 · 기둥의 짙기 0~1. 마지막 단계에서 흐려지고 다음 주기에 새로 쌓인다. */
export function cycleOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 적분은 매 프레임 주기 시작에서 다시 한다. */
export function step(params: { state: OrbitalDecayState }): OrbitalDecayState {
  return params.state;
}
