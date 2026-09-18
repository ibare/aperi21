// ========================================================================
// pair-production — 순수 계산
// ========================================================================
// 광자 에너지 E 가 문턱 2mₑc² 를 넘으면 광자가 사라지고 전자 · 양전자가 생긴다. 남는 몫
// E − 2mₑc² 를 둘이 반씩 운동 에너지 T 로 나눠 갖는다(원자핵이 가져가는 몫은 무시).
//
//   p = √(T² + 2 T mₑc²)            (MeV/c)
//   r = k · p / B                   (mm, k = 3.336 mm·T/(MeV/c))
//
// 거품 상자 속에서 달리며 에너지를 잃어 p 가 지수로 준다 — p(s) = p₀ e^(−s/L). 그러면 반지름도
// r(s) = r₀ e^(−s/L) 로 줄고, 진행 방향이 도는 각은
//
//   φ(s) = (L / r₀)(e^(s/L) − 1)
//
// 이다. 자기장이 종이에서 나오는 쪽(⊙)이라 +x 로 출발한 양전자는 아래로(시계 방향), 전자는 위로
// (반시계 방향) 휜다.
//
// 모든 것이 주기 안 시각의 함수다. 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ELECTRON_REST_MEV,
  ENERGIES_MEV,
  EXIT_X,
  FIELD_T,
  LOSS_LENGTH_MM,
  MM_PER_MEV_TESLA,
  PACKET_MM,
  START_X,
  STOP_RADIUS_MM,
  THRESHOLD_MEV,
  WAVE_AT_ONE_MEV_MM,
} from './schema';
import type { PairProductionState } from './state';

/** 궤적을 표본하는 걸음(mm). 가장 촘촘히 감긴 끝(반지름 0.5 mm)도 매끄럽게 보이는 간격. */
const TRACK_STEP_MM = 0.04;

// ------------------------------------------------------------------------
// 스테이지 상수
// ------------------------------------------------------------------------

export interface PairConstants {
  /** 쌍생성 문턱(MeV) — 화면에 띄우는 정박값이자 판정 기준. */
  threshold: number;
  /** 전자 정지 에너지(MeV). */
  electronRest: number;
  /** 자기장(T). */
  field: number;
  /** 반지름 환산(mm·T/(MeV/c)). */
  mmPerMeVTesla: number;
  /** 발마다 광자 에너지(MeV). */
  energies: readonly number[];
  /** 에너지 손실 길이(mm). */
  lossLength: number;
  /** 궤적을 끝내는 반지름(mm). */
  stopRadius: number;
  /** 광자 물결 뭉치 길이(mm). */
  packetLength: number;
  /** 1 MeV 광자의 물결 간격(mm). */
  waveAtOneMeV: number;
}

export function readConstants(stage: StageDef): PairConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    threshold: c.thresholdMeV ?? THRESHOLD_MEV,
    electronRest: c.electronRestMeV ?? ELECTRON_REST_MEV,
    field: c.fieldT ?? FIELD_T,
    mmPerMeVTesla: c.mmPerMeVTesla ?? MM_PER_MEV_TESLA,
    energies: [c.energy1 ?? ENERGIES_MEV[0], c.energy2 ?? ENERGIES_MEV[1], c.energy3 ?? ENERGIES_MEV[2]],
    lossLength: c.lossLength ?? LOSS_LENGTH_MM,
    stopRadius: c.stopRadius ?? STOP_RADIUS_MM,
    packetLength: c.packetLength ?? PACKET_MM,
    waveAtOneMeV: c.waveAtOneMeV ?? WAVE_AT_ONE_MEV_MM,
  };
}

// ------------------------------------------------------------------------
// 단계 → 발
// ------------------------------------------------------------------------

/**
 * 발마다 들어옴 · 그 뒤 단계 id. 시간표 단계에 값을 실을 자리가 없어(장부 G13) 몇 번째 광자인지와의
 * 짝을 여기 둔다. 길이 · 순서 · 캡션은 선언(`schema.timeline`)이 정한다. 발 수는 스테이지 상수
 * 에너지의 수와 같다 (장부 G105).
 */
export const SHOTS: readonly { in: string; out: string }[] = [
  { in: 'in-1', out: 'out-1' },
  { in: 'in-2', out: 'out-2' },
  { in: 'in-3', out: 'out-3' },
];

/** 한 주기가 끝나며 모두 흐려지는 단계. */
export const FADE_PHASE = 'fade';

// ------------------------------------------------------------------------
// 쌍 하나
// ------------------------------------------------------------------------

/** 광자가 쌍을 만들 수 있는지 — 에너지가 문턱 이상. */
export const makesPair = (energy: number, c: PairConstants): boolean => energy >= c.threshold;

/** 한 입자가 받는 운동 에너지(MeV) — 문턱을 넘은 몫의 절반. */
export const kineticEach = (energy: number, c: PairConstants): number => Math.max(0, energy - c.threshold) / 2;

/** 처음 회전 반지름(mm). */
export function startRadius(energy: number, c: PairConstants): number {
  const t = kineticEach(energy, c);
  const p = Math.sqrt(t * t + 2 * t * c.electronRest);
  return (c.mmPerMeVTesla * p) / c.field;
}

/** 멈출 때까지 달리는 길이(mm). 처음부터 멈출 만큼 느리면 0. */
export function trackLength(r0: number, c: PairConstants): number {
  return r0 > c.stopRadius ? c.lossLength * Math.log(r0 / c.stopRadius) : 0;
}

/**
 * 원점에서 +x 로 출발해 `sEnd` 까지 달린 궤적. `turn` 은 +1 이면 반시계(위로, 전자),
 * −1 이면 시계(아래로, 양전자).
 */
export function sampleTrack(r0: number, turn: 1 | -1, sEnd: number, c: PairConstants): Vec2[] {
  const pts: Vec2[] = [[0, 0]];
  if (sEnd <= 0 || r0 <= 0) return pts;
  const L = c.lossLength;
  const heading = (s: number): number => turn * (L / r0) * (Math.exp(s / L) - 1);
  const n = Math.max(1, Math.ceil(sEnd / TRACK_STEP_MM));
  const ds = sEnd / n;
  let x = 0;
  let y = 0;
  for (let i = 0; i < n; i++) {
    const a = heading((i + 0.5) * ds);
    x += Math.cos(a) * ds;
    y += Math.sin(a) * ds;
    pts.push([x, y]);
  }
  return pts;
}

/** 궤적에서 가장 바깥(전자는 가장 위, 양전자는 가장 아래) 점의 번호. 이름표 자리다. */
export function outermostIndex(pts: readonly Vec2[], turn: 1 | -1): number {
  let best = 0;
  for (let i = 1; i < pts.length; i++) {
    if (turn * pts[i]![1] > turn * pts[best]![1]) best = i;
  }
  return best;
}

// ------------------------------------------------------------------------
// 지금 화면
// ------------------------------------------------------------------------

/** 지금 날고 있는 광자 — x 축 위 [from, to] 구간, 물결 위상을 붙일 머리, 물결 간격, 에너지. */
export interface PhotonNow {
  shot: number;
  from: number;
  to: number;
  head: number;
  wavelength: number;
  energy: number;
}

/** 궤적 하나 — 지금까지 달린 점들, 달리는 중인지, 가장 바깥 점까지 왔는지. */
export interface TrackNow {
  shot: number;
  turn: 1 | -1;
  points: Vec2[];
  moving: boolean;
  /** 가장 바깥 점 — 이미 지났으면 있다. */
  outermost?: Vec2;
  /** 다음 발이 들어오며 옅어지는 진행도 0~1. */
  dim: number;
  /** 지금 발의 궤적인지(다음 발이 아직 들어오지 않았다). */
  current: boolean;
}

export interface Snapshot {
  photon?: PhotonNow;
  tracks: TrackNow[];
  /** 주기 끝의 흐려짐 — 쌓인 것 모두에 곱한다. */
  alpha: number;
}

export function snapshot(tl: TimelineFrame, c: PairConstants): Snapshot {
  const alpha = 1 - tl.at(FADE_PHASE);
  const tracks: TrackNow[] = [];
  let photon: PhotonNow | undefined;
  const L = c.packetLength;

  const shots = Math.min(SHOTS.length, c.energies.length);
  for (let k = 0; k < shots; k++) {
    const ids = SHOTS[k]!;
    const energy = c.energies[k]!;
    const pair = makesPair(energy, c);
    const wavelength = c.waveAtOneMeV / energy;

    // 들어옴 — 머리가 START_X 왼쪽에서 출발해, 단계가 끝날 때 꼬리가 원자핵(원점)에 닿는다.
    // 쌍을 만드는 광자는 원점을 넘은 몫이 사라진다.
    if (tl.phase === ids.in) {
      const head = -START_X + tl.at(ids.in) * (START_X + L);
      photon = { shot: k, from: head - L, to: pair ? Math.min(head, 0) : head, head, wavelength, energy };
    }

    const out = tl.at(ids.out);
    if (out <= 0) continue;

    if (!pair) {
      // 그대로 지나감 — 같은 빠르기로 오른쪽 밖(EXIT_X)까지 난다.
      if (tl.phase === ids.out) {
        const head = L + out * EXIT_X;
        photon = { shot: k, from: head - L, to: head, head, wavelength, energy };
      }
      continue;
    }

    // 쌍 — 전자는 위로, 양전자는 아래로 감긴다. 달린 길이는 단계 진행도에 비례한다.
    const r0 = startRadius(energy, c);
    const sEnd = trackLength(r0, c);
    const next = SHOTS[k + 1];
    const dim = next && k + 1 < shots ? tl.at(next.in) : 0;
    for (const turn of [1, -1] as const) {
      const full = sampleTrack(r0, turn, sEnd, c);
      const iOut = outermostIndex(full, turn);
      const nNow = Math.max(1, Math.round(out * (full.length - 1)));
      tracks.push({
        shot: k,
        turn,
        points: full.slice(0, nNow + 1),
        moving: out < 1,
        outermost: nNow >= iOut ? full[iOut] : undefined,
        dim,
        current: dim <= 0,
      });
    }
  }

  return { photon, tracks, alpha };
}

export function step(params: { state: PairProductionState }): PairProductionState {
  return params.state;
}
