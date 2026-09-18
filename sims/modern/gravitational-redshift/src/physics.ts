// ========================================================================
// gravitational-redshift — 순수 물리
// ========================================================================
// 별 반지름 R, 슈바르츠실트 반지름 r_s, 별 중심에서 잰 거리 r.
//
//   받은 파장 ÷ 낸 파장          stretch = 1/√(1 − r_s/R)     → q = r_s/R = 1 − 1/stretch²
//   r 에 멈춰 선 이가 재는 파장   λ(r) = λ_e · stretch · √(1 − r_s/r)
//
// **가로축은 눌러 그린다.** 길 위 자리 u(0 = 표면, 1 = 무한히 먼 곳)를 u = 1 − √(R/r) 로 잡는다.
// 중성자별은 늘어남의 대부분이 표면에서 반지름 하나 안에서 일어나, r 에 비례하게 그리면 빛이
// 별을 떠나자마자 이미 붉다 — 「올라오며」 가 보이지 않는다. 이렇게 누르면
//
//   R/r = (1 − u)²                 뉴턴 퍼텐셜 −GM/r 의 깊이가 (1 − u)² 로 부드럽게 준다
//   λ(u) = λ_e · stretch · √(1 − q(1 − u)²)     u = 1(먼 곳)에서 정확히 λ_e · stretch
//
// 이고, 길 끝에서 받는 파장이 선언값과 같다.
//
// 물결 묶음 — 길 위에서 물결 간격은 제자리 파장에 비례한다(길이 L 인 길에서 λ_e 를 `emitWorld`
// 로 그린다). 표면에서 u 까지 들어가는 물결 수는 닫힌 꼴이다.
//
//   n(u) = L / (emitWorld · stretch · √q) · [asin(√q) − asin(√q (1 − u))]
//
// 묶음은 물결 `waveCycles` 개다. 앞이 u_f 에 있으면 뒤는 n(u_b) = n(u_f) − waveCycles 인 자리다
// (표면 안쪽이면 표면에서 자른다 — 아직 나오는 중). 물결 수가 그대로이므로 간격이 벌어지는 만큼
// 묶음이 길어진다. 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { wavelengthToLinearRgb, type LinearRgb } from '@aperi21/plugin-optics';
import { EMIT_NM, RECEIVED_NM, STRETCH, WAVE_CYCLES, WORLD_PER_NM } from './schema';
import type { GravitationalRedshiftState } from './state';

export interface GravitationalRedshiftConstants {
  /** 받은 파장 ÷ 낸 파장. */
  stretch: number;
  /** 표면에서 낸 파장(nm). */
  emitNm: number;
  /** 먼 곳에서 받는 파장(nm) — 화면 글자용 선언값. */
  receivedNm: number;
  /** 한 줄기에 담긴 물결 수. */
  waveCycles: number;
  /** 그림 배율 — 파장 1 nm 의 월드 길이. */
  worldPerNm: number;
}

export function readConstants(stage: StageDef): GravitationalRedshiftConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    stretch: c.stretch ?? STRETCH,
    emitNm: c.emitNm ?? EMIT_NM,
    receivedNm: c.receivedNm ?? RECEIVED_NM,
    waveCycles: c.waveCycles ?? WAVE_CYCLES,
    worldPerNm: c.worldPerNm ?? WORLD_PER_NM,
  };
}

/** 빛의 길 한 벌 — 별의 촘촘함과, 길 길이 L(월드) · 낸 파장의 그림 길이. */
export interface LightPath {
  /** r_s / R. */
  q: number;
  stretch: number;
  emitNm: number;
  /** λ_e 를 그리는 월드 길이. */
  emitWorld: number;
  /** 표면(u = 0)에서 먼 곳(u = 1)까지 길의 월드 길이. */
  length: number;
}

export function lightPath(c: GravitationalRedshiftConstants, length: number): LightPath {
  return {
    q: 1 - 1 / (c.stretch * c.stretch),
    stretch: c.stretch,
    emitNm: c.emitNm,
    emitWorld: c.emitNm * c.worldPerNm,
    length,
  };
}

/** 길 위 u 에서 파장 ÷ 낸 파장. 표면에서 1, 먼 곳에서 stretch. */
export function wavelengthRatio(p: LightPath, u: number): number {
  const w = 1 - u;
  return p.stretch * Math.sqrt(1 - p.q * w * w);
}

/** 길 위 u 에서의 파장(nm). */
export function wavelengthNmAt(p: LightPath, u: number): number {
  return p.emitNm * wavelengthRatio(p, u);
}

/** 퍼텐셜 깊이 비 R/r = (1 − u)². 표면에서 1, 먼 곳에서 0. */
export function depthAt(u: number): number {
  const w = 1 - Math.min(1, Math.max(0, u));
  return w * w;
}

/** √q. stretch 가 1(늘어남 없음)이면 q = 0 이라 나눗셈이 깨지므로 아주 작은 값으로 받친다. */
const MIN_Q = 1e-9;
function sqrtQ(p: LightPath): number {
  return Math.sqrt(Math.max(p.q, MIN_Q));
}

function cycleScale(p: LightPath): number {
  return p.length / (p.emitWorld * p.stretch * sqrtQ(p));
}

/** 표면에서 u 까지 들어가는 물결 수(사이클). */
export function cyclesTo(p: LightPath, u: number): number {
  const sq = sqrtQ(p);
  const uc = Math.min(1, Math.max(0, u));
  return cycleScale(p) * (Math.asin(sq) - Math.asin(sq * (1 - uc)));
}

/** 표면에서 물결 n 개만큼 떨어진 자리 u. `cyclesTo` 의 역함수. */
export function positionAtCycles(p: LightPath, n: number): number {
  const sq = sqrtQ(p);
  const nc = Math.min(cyclesTo(p, 1), Math.max(0, n));
  return 1 - Math.sin(Math.asin(sq) - nc / cycleScale(p)) / sq;
}

/** 물결 위 한 표본 — 길 위 자리 u · 가로 변위(진폭 배수, −1~1) · 그 자리 파장(nm). */
export interface WaveSample {
  u: number;
  y: number;
  nm: number;
}

/**
 * 앞이 `frontU` 에 있는 묶음의 표본. 물결 무늬는 앞에 붙어 함께 간다 — 앞에서 k 사이클 뒤의
 * 자리는 늘 같은 위상이다. 사이클마다 `perCycle` 개를 고르게 뽑는다.
 */
export function packetSamples(p: LightPath, frontU: number, cycles: number, perCycle: number): WaveSample[] {
  const nFront = cyclesTo(p, frontU);
  const nBack = Math.max(0, nFront - cycles);
  const count = Math.max(2, Math.ceil((nFront - nBack) * perCycle) + 1);
  const out: WaveSample[] = [];
  for (let i = 0; i < count; i++) {
    const n = nBack + ((nFront - nBack) * i) / (count - 1);
    const u = positionAtCycles(p, n);
    out.push({ u, y: Math.sin(2 * Math.PI * (nFront - n)), nm: wavelengthNmAt(p, u) });
  }
  return out;
}

/** 묶음의 뒤끝 자리 u. */
export function packetBack(p: LightPath, frontU: number, cycles: number): number {
  return positionAtCycles(p, Math.max(0, cyclesTo(p, frontU) - cycles));
}

/** 파장의 빛 색(선형광). 가시광 밖은 검정이다 — 이 조각은 500~650 nm 안에 머문다. */
export function lightOfNm(nm: number): LinearRgb {
  return wavelengthToLinearRgb(nm);
}

/** 모든 것이 시각의 함수다 — 쌓는 상태가 없어 항등이다. */
export function step(params: { state: GravitationalRedshiftState }): GravitationalRedshiftState {
  return params.state;
}
