// ========================================================================
// electron-diffraction — 순수 물리
// ========================================================================
// 전압 V 로 가속한 전자의 파장 λ = λ₁ₖᵥ / √V. 간격 d 인 격자면에서 브래그 반사하면
// sin θ = λ / 2d 이고, 곧게 가던 빔에서 2θ 꺾여 거리 L 인 스크린에 반지름 L·tan 2θ 인
// 고리를 만든다. 박막이 다결정이라 모든 방향의 결정이 있어 점이 아니라 **고리**다.
//
// 스크린의 점 하나는 **그 전자가 도착한 순간의 전압**으로 반지름이 정해지고, 잔광 시간
// 동안 옅어진다. 그래서 전압이 오르는 동안 옛 점은 바깥에서 사라지고 새 점은 안쪽에
// 떨어진다 — 고리가 움직여 보이는 것은 이 둘이다.
//
// 모든 것이 시각의 함수다 — 쌓는 상태가 없다. 도착 점은 (시드, 도착 번호)에서 뽑는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ARRIVAL_RATE,
  BEAM_FLOW,
  CENTER_SPREAD,
  DOT_LIGHT,
  GLOW_LIFE,
  LAMBDA_AT_1KV_NM,
  LATTICE_D1_NM,
  LATTICE_D2_NM,
  RING_SPREAD,
  SCREEN_DISTANCE_CM,
  SEED,
  SHARE_CENTER,
  SHARE_INNER,
  VOLTAGE_HIGH_KV,
  VOLTAGE_LOW_KV,
} from './schema';
import type { ElectronDiffractionState } from './state';

export interface DiffractionConstants {
  voltageLowKv: number;
  voltageHighKv: number;
  lambdaAt1kvNm: number;
  screenDistanceCm: number;
  latticeD1Nm: number;
  latticeD2Nm: number;
  seed: number;
  arrivalRate: number;
  glowLife: number;
  shareCenter: number;
  shareInner: number;
  ringSpread: number;
  centerSpread: number;
  dotLight: number;
  beamFlow: number;
}

export function readConstants(stage: StageDef): DiffractionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    voltageLowKv: c.voltageLowKv ?? VOLTAGE_LOW_KV,
    voltageHighKv: c.voltageHighKv ?? VOLTAGE_HIGH_KV,
    lambdaAt1kvNm: c.lambdaAt1kvNm ?? LAMBDA_AT_1KV_NM,
    screenDistanceCm: c.screenDistanceCm ?? SCREEN_DISTANCE_CM,
    latticeD1Nm: c.latticeD1Nm ?? LATTICE_D1_NM,
    latticeD2Nm: c.latticeD2Nm ?? LATTICE_D2_NM,
    seed: c.seed ?? SEED,
    arrivalRate: c.arrivalRate ?? ARRIVAL_RATE,
    glowLife: c.glowLife ?? GLOW_LIFE,
    shareCenter: c.shareCenter ?? SHARE_CENTER,
    shareInner: c.shareInner ?? SHARE_INNER,
    ringSpread: c.ringSpread ?? RING_SPREAD,
    centerSpread: c.centerSpread ?? CENTER_SPREAD,
    dotLight: c.dotLight ?? DOT_LIGHT,
    beamFlow: c.beamFlow ?? BEAM_FLOW,
  };
}

// ------------------------------------------------------------------------
// 전압 — 시간표가 정한다
// ------------------------------------------------------------------------

/**
 * 주기 안 시각 `u` 에서 전압이 처음 값에서 올린 값까지 간 몫 0~1.
 *
 * **단계 경계는 시간표에게 묻는다.** 다만 `TimelineFrame.at` 은 지금 시각만 답하므로, 지난
 * 도착 시각의 몫은 두 경사 단계가 `linear` 라는 선언을 믿고 여기서 다시 센다 (NOTES (c) G59).
 */
export function voltageShare(tl: TimelineFrame, u: number): number {
  const rs = tl.start('raise');
  const re = tl.end('raise');
  const ls = tl.start('lower');
  const le = tl.end('lower');
  if (u >= rs && u < re) return (u - rs) / tl.duration('raise');
  if (u >= re && u < ls) return 1;
  if (u >= ls && u < le) return 1 - (u - ls) / tl.duration('lower');
  return 0;
}

export function voltageAt(tl: TimelineFrame, u: number, c: DiffractionConstants): number {
  return c.voltageLowKv + (c.voltageHighKv - c.voltageLowKv) * voltageShare(tl, u);
}

/** 전자의 드브로이 파장(nm). 전압의 제곱근에 반비례한다. */
export function wavelengthNm(voltageKv: number, c: DiffractionConstants): number {
  return c.lambdaAt1kvNm / Math.sqrt(voltageKv);
}

/** 격자면 간격 d 가 만드는 고리의 반지름(cm). sin θ = λ/2d, r = L·tan 2θ. */
export function ringRadius(voltageKv: number, d: number, c: DiffractionConstants): number {
  const s = wavelengthNm(voltageKv, c) / (2 * d);
  if (s >= 1) return Infinity;
  return c.screenDistanceCm * Math.tan(2 * Math.asin(s));
}

/** 지금 두 고리의 반지름 [안쪽, 바깥]. */
export function ringRadiiNow(tl: TimelineFrame, c: DiffractionConstants): readonly [number, number] {
  const v = voltageAt(tl, tl.u, c);
  return [ringRadius(v, c.latticeD1Nm, c), ringRadius(v, c.latticeD2Nm, c)];
}

/** 처음 전압의 두 고리 반지름 — 「처음 자리」 점선. */
export function ringRadiiLow(c: DiffractionConstants): readonly [number, number] {
  return [ringRadius(c.voltageLowKv, c.latticeD1Nm, c), ringRadius(c.voltageLowKv, c.latticeD2Nm, c)];
}

// ------------------------------------------------------------------------
// 빔 — 전자가 흘러간 거리
// ------------------------------------------------------------------------

/**
 * 조각 시계 처음부터 빔 속 전자가 흘러간 거리(처음 전압의 빠르기 = 1 로 센 초).
 *
 * 속력은 √V 에 비례한다. 전압이 고르게 오르내리므로 ∫√(1 + (q−1)x) dx 가 닫힌 식이다
 * (q = 올린 전압 / 처음 전압). 주기마다 같은 거리를 더해 주기 경계에서 빔이 튀지 않는다.
 */
export function beamTravel(tl: TimelineFrame, c: DiffractionConstants): number {
  const q = c.voltageHighKv / c.voltageLowKv;
  const rootQ = Math.sqrt(q);
  const dr = tl.duration('raise');
  const dl = tl.duration('lower');
  // 경사 단계 안에서 x(0~1)까지 흘러간 거리.
  const ramp = (x: number, d: number): number =>
    q === 1 ? d * x : ((2 * d) / (3 * (q - 1))) * (Math.pow(1 + (q - 1) * x, 1.5) - 1);
  const rampDown = (x: number, d: number): number =>
    q === 1 ? d * x : ((2 * d) / (3 * (q - 1))) * (Math.pow(q, 1.5) - Math.pow(q - (q - 1) * x, 1.5));

  const within = (u: number): number => {
    const rs = tl.start('raise');
    const re = tl.end('raise');
    const ls = tl.start('lower');
    const le = tl.end('lower');
    let s = Math.min(u, rs); // 처음 전압 — 빠르기 1
    if (u > rs) s += ramp(Math.min(1, (u - rs) / dr), dr);
    if (u > re) s += rootQ * (Math.min(u, ls) - re);
    if (u > ls) s += rampDown(Math.min(1, (u - ls) / dl), dl);
    if (u > le) s += u - le;
    return s;
  };

  return tl.cycle * within(tl.period) + within(tl.u);
}

// ------------------------------------------------------------------------
// 스크린의 점 — (시드, 도착 번호)의 함수
// ------------------------------------------------------------------------

/** (시드, 도착 번호, 몇 번째 수)에서 0~1 난수 하나. 상태가 없는 섞기 함수다. */
function unit(seed: number, n: number, k: number): number {
  let t =
    (Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul(n | 0, 0x85ebca77) ^ Math.imul(k + 1, 0xc2b2ae3d)) >>> 0;
  t = (t + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** 표준 정규 난수 하나(박스-뮬러). */
function gauss(seed: number, n: number, k: number): number {
  const a = 1 - unit(seed, n, k);
  const b = unit(seed, n, k + 1);
  return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b);
}

export interface ScreenDots {
  /** 스크린 가운데에서 잰 자리(cm). */
  offsets: Vec2[];
  /** 잔광 — 막 닿은 점이 1, 수명이 다하면 0. */
  opacities: number[];
}

/**
 * 지금 스크린에 빛나고 있는 점들. 잔광 시간 안에 도착한 전자 하나마다 점 하나다.
 *
 * 도착 번호 n 은 조각 시계 전체에서 센다 — 주기 경계 앞의 점도 앞 주기 끝 전압으로 제자리에
 * 남아 있다. 스크린 반지름 밖으로 떨어지는 점은 뺀다.
 */
export function screenDots(tl: TimelineFrame, c: DiffractionConstants, screenR: number): ScreenDots {
  const T = tl.cycle * tl.period + tl.u;
  const first = Math.ceil((T - c.glowLife) * c.arrivalRate);
  const last = Math.floor(T * c.arrivalRate);
  const offsets: Vec2[] = [];
  const opacities: number[] = [];
  for (let n = first; n <= last; n++) {
    const tn = n / c.arrivalRate;
    const age = T - tn;
    if (age < 0 || age >= c.glowLife) continue;
    const un = ((tn % tl.period) + tl.period) % tl.period;
    const v = voltageAt(tl, un, c);
    const pick = unit(c.seed, n, 0);
    const angle = 2 * Math.PI * unit(c.seed, n, 1);
    let r: number;
    if (pick < c.shareCenter) {
      // 곧게 지나간 전자 — 가운데 점. 빔 굵기만큼 퍼진다.
      r = Math.abs(gauss(c.seed, n, 2)) * c.centerSpread;
    } else {
      const d = pick < c.shareCenter + c.shareInner ? c.latticeD1Nm : c.latticeD2Nm;
      r = ringRadius(v, d, c) * (1 + c.ringSpread * gauss(c.seed, n, 2));
    }
    if (!(r < screenR)) continue;
    offsets.push([r * Math.cos(angle), r * Math.sin(angle)]);
    opacities.push(1 - age / c.glowLife);
  }
  return { offsets, opacities };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ElectronDiffractionState }): ElectronDiffractionState {
  return params.state;
}
