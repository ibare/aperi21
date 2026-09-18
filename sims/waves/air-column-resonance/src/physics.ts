// ========================================================================
// air-column-resonance — 순수 물리
// ========================================================================
// 관 속 공기의 변위(관 방향) s(x, t). 입구(x = 0)의 음원이 진동수 f 로 울리고, 오른쪽
// 끝(x = L)이 관의 종류를 정한다.
//
//   양쪽 열림:  s = R · cos(k(L − x)) · cos φ,   R = a / √(sin²(kL) + γ²)
//   오른쪽 막힘: s = R · sin(k(L − x)) · cos φ,   R = a / √(cos²(kL) + γ²)
//
// k = 2πf / v. 열린 끝은 언제나 배(cos 0 = 1), 막힌 끝은 언제나 마디(sin 0 = 0)다.
// 입구도 열려 있으므로 입구가 배가 되는 진동수에서만 R 이 a / γ 로 치솟는다 —
// 열린 관은 kL = nπ (L = nλ/2), 막힌 관은 kL = (2n−1)π/2 (L = (2n−1)λ/4).
// 진동수를 v/4L 단위의 m 으로 쓰면 kL = mπ/2 라 짝수 m 은 열린 관, 홀수 m 은 막힌 관이다.
//
// γ 는 감쇠를 현상으로 넣은 것이고, 진동수를 천천히 바꾸므로 매 순간 정상 응답에 있다고 본다
// (준정적 — 이웃 `harmonics` 와 같은 꼴). a = peakDisplacement · γ 로 두어 크게 울릴 때 배의
// 변위가 `peakDisplacement` 가 된다. 열린 끝의 끝 보정은 뺀다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다. 공기 알갱이의 흩뿌림은 시드 결정적 난수다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  AIR_SEED,
  DAMPING,
  PEAK_DISPLACEMENT,
  RUNG_COUNT,
  SOUND_SPEED,
  TUBE_LENGTH,
} from './schema';
import type { AirColumnResonanceState } from './state';

export type TubeKind = 'open' | 'closed';

export interface AirColumnResonanceConstants {
  /** 관 길이(월드). */
  tubeLength: number;
  /** 소리 빠르기(월드/초). */
  soundSpeed: number;
  /** 크게 울릴 때 배의 변위(월드). */
  peakDisplacement: number;
  /** 감쇠(무차원). */
  damping: number;
  /** 계단 수 — 시간표의 `ring-n` 단계 수와 같다. */
  rungCount: number;
  /** 공기 알갱이 흩뿌림 시드. */
  seed: number;
}

export function readConstants(stage: StageDef): AirColumnResonanceConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    tubeLength: c.tubeLength ?? TUBE_LENGTH,
    soundSpeed: c.soundSpeed ?? SOUND_SPEED,
    peakDisplacement: c.peakDisplacement ?? PEAK_DISPLACEMENT,
    damping: c.damping ?? DAMPING,
    rungCount: c.rungCount ?? RUNG_COUNT,
    seed: c.seed ?? AIR_SEED,
  };
}

/** 계단 한 칸의 진동수 v / 4L (Hz) — 막힌 관의 가장 낮은 진동수다. */
export function quarterStep(c: AirColumnResonanceConstants): number {
  return c.soundSpeed / (4 * c.tubeLength);
}

/** 한 단계 동안 진동수(v/4L 단위)가 가는 구간. */
interface Leg {
  id: string;
  from: number;
  to: number;
}

/**
 * 시간표 단계와 진동수 구간의 짝. 단계 이름과 순서는 선언(`schema.timeline`)이 정하고,
 * 여기는 각 단계가 진동수를 어디서 어디로 옮기는지만 안다.
 */
function legs(c: AirColumnResonanceConstants): Leg[] {
  const out: Leg[] = [
    { id: 'rise', from: 1, to: 1 },
    { id: 'ring-1', from: 1, to: 1 },
  ];
  for (let m = 2; m <= c.rungCount; m++) {
    out.push({ id: `shift-${m}`, from: m - 1, to: m });
    out.push({ id: `ring-${m}`, from: m, to: m });
  }
  out.push({ id: 'rest', from: c.rungCount, to: c.rungCount });
  out.push({ id: 'fade', from: c.rungCount, to: c.rungCount });
  return out;
}

/** 지금 진동수(v/4L 단위). 진행도는 앞 단계에서 1, 뒤 단계에서 0 이라 합이 곧 지금 값이다. */
export function driveRatio(tl: TimelineFrame, c: AirColumnResonanceConstants): number {
  let r = 1;
  for (const leg of legs(c)) r += (leg.to - leg.from) * tl.at(leg.id);
  return r;
}

/**
 * 흔들림 위상 φ = 2π ∫ f dt (주기 시작부터). 단계마다 진동수가 선형으로 가므로
 * 흐른 몫 p 에 대해 ∫ = D · f₀ · (p · from + (to − from) · p² / 2) 이다.
 */
export function drivePhase(tl: TimelineFrame, c: AirColumnResonanceConstants): number {
  const f0 = quarterStep(c);
  let cycles = 0;
  for (const leg of legs(c)) {
    const p = tl.at(leg.id);
    cycles += tl.duration(leg.id) * f0 * (p * leg.from + ((leg.to - leg.from) * p * p) / 2);
  }
  return 2 * Math.PI * cycles;
}

/** 소리 크기 0~1 — 주기 처음에 커지고 끝에 잦아든다. 이음매에서 알갱이가 튀지 않게. */
export function loudness(tl: TimelineFrame): number {
  return tl.at('rise') * (1 - tl.at('fade'));
}

/** 파수 k (라디안/월드). 진동수는 v/4L 단위로 받는다. */
function waveNumber(ratio: number, c: AirColumnResonanceConstants): number {
  return (2 * Math.PI * ratio * quarterStep(c)) / c.soundSpeed;
}

/** 입구가 배가 되는지를 재는 값 — 0 이면 그 관의 모양이 맞는다. */
function mismatch(kind: TubeKind, ratio: number, c: AirColumnResonanceConstants): number {
  const kL = waveNumber(ratio, c) * c.tubeLength;
  return kind === 'open' ? Math.sin(kL) : Math.cos(kL);
}

/** 이 관이 이 진동수에서 크게 울리는가. 계단(정수 ratio)에서만 묻는다. */
export function rings(kind: TubeKind, ratio: number, c: AirColumnResonanceConstants): boolean {
  return Math.abs(mismatch(kind, ratio, c)) < 0.5;
}

/** 관의 흔들림 크기 R — 배의 변위(월드). 모양이 맞으면 `peakDisplacement`. */
export function response(kind: TubeKind, ratio: number, c: AirColumnResonanceConstants): number {
  const g = mismatch(kind, ratio, c);
  const drive = c.peakDisplacement * c.damping;
  return drive / Math.sqrt(g * g + c.damping * c.damping);
}

/** 관 위 x 에서 모양(−1~1). 오른쪽 끝이 열려 있으면 배, 막혀 있으면 마디. */
export function shape(kind: TubeKind, x: number, ratio: number, c: AirColumnResonanceConstants): number {
  const u = waveNumber(ratio, c) * (c.tubeLength - x);
  return kind === 'open' ? Math.cos(u) : Math.sin(u);
}

/** 관 위 x 의 공기 변위(관 방향, 월드). */
export function displacement(
  kind: TubeKind,
  x: number,
  ratio: number,
  phase: number,
  amp: number,
  c: AirColumnResonanceConstants,
): number {
  return amp * response(kind, ratio, c) * shape(kind, x, ratio, c) * Math.cos(phase);
}

/** 관 안의 마디(공기가 움직이지 않는 자리) x 목록. 0 ≤ x ≤ L. */
export function nodes(kind: TubeKind, ratio: number, c: AirColumnResonanceConstants): number[] {
  const k = waveNumber(ratio, c);
  const out: number[] = [];
  // shape 이 0 이 되는 k(L − x) — 막힘: jπ, 열림: (j + ½)π.
  const offset = kind === 'open' ? 0.5 : 0;
  for (let j = 0; ; j++) {
    const x = c.tubeLength - ((j + offset) * Math.PI) / k;
    if (x < 0) break;
    out.push(x);
  }
  return out;
}

/**
 * 공기 알갱이의 제자리 — 가로 0~1(관 길이 비), 세로 −1~1(관 반지름 비).
 * 칸마다 하나씩 흩뿌려 고르게 차되 줄지어 보이지 않게 한다. 시드 결정적 (S-sim).
 */
export function airSeats(seed: number, columns: number, rows: number): [number, number][] {
  let s = seed >>> 0;
  const rand = (): number => {
    // mulberry32
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out: [number, number][] = [];
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      out.push([(i + rand()) / columns, -1 + (2 * (j + rand())) / rows]);
    }
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: AirColumnResonanceState }): AirColumnResonanceState {
  return params.state;
}
