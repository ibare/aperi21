// ========================================================================
// laser-and-stimulated-emission — 순수 물리 · 배치 계산
// ========================================================================
// 쌓는 상태가 없다. 원자의 자리 · 들뜸은 (시드, 스테이지 상수)의 함수이고, 광자 묶음의 자리와
// 누가 언제 유도 방출했는가는 앞머리가 간 거리의 함수다. `step` 은 항등이다.
//
// 앞머리가 간 거리를 **펼친 좌표 s** 로 센다. 거울 사이 길이 2M 마다 한 번 건너고, 화면 x 는
// s 를 두 거울에서 접은 자리다(반사). 세 번 건넌 뒤에는 일부 통과 거울을 지나 곧장 나간다.
//
// 유도 방출의 규칙 — 앞머리가 들뜬 원자를 지나는 순간, 그 원자의 길과 이웃 길에 있는 광자 하나하나가
// `stimulateChance` 의 몫으로 원자를 내려오게 한다(광자가 많을수록 잘 일어난다 — 그래서 불어날수록
// 더 빨리 불어난다). 내려온 원자의 길에 광자가 하나 더 생긴다. 새 광자는 같은 묶음 모양 ·
// 같은 앞머리 · 같은 파장이라 봉우리가 부른 광자와 한 줄로 맞는다. 바닥 원자의 흡수는 두지
// 않는다(NOTES (b)).
//
// 빛의 색은 `@aperi21/plugin-optics` 의 파장 → 선형광 계산에서 얻는다.
// ========================================================================

import { wavelengthToLinearRgb, type LinearRgb } from '@aperi21/plugin-optics';
import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ATOM_MARGIN,
  ATOMS_PER_LANE,
  EXCITED_FRACTION,
  LANE_GAP,
  LANES,
  MIRROR_X,
  OUT_RUN,
  PACKET_AMPLITUDE,
  PACKET_LENGTH,
  SEED,
  STIMULATE_CHANCE,
  WAVE_SCALE,
  WAVELENGTH_NM,
} from './schema';
import type { LaserAndStimulatedEmissionState } from './state';

/** 거울 사이를 건너는 단계들 — 시간표의 단계 id 와 같다. 건너는 횟수가 이 목록의 길이다(장부 G105). */
const PASS_PHASES = ['pass1', 'pass2', 'pass3'] as const;
/** 물결 한 파장을 몇 점으로 표본하는가. */
const SAMPLES_PER_WAVE = 14;
/** 원자가 칸 안에서 흩어지는 몫 — 칸 가장자리에 붙어 이웃 칸 원자와 겹치지 않게 가운데 몫만 쓴다. */
const CELL_SPREAD = 0.7;
/** 연쇄의 수열을 원자 배치의 수열과 가르는 시드 차. */
const CHAIN_SEED_OFFSET = 7919;

export interface LaserConstants {
  wavelengthNm: number;
  waveScale: number;
  packetLength: number;
  packetAmplitude: number;
  mirrorX: number;
  lanes: number;
  laneGap: number;
  atomsPerLane: number;
  atomMargin: number;
  excitedFraction: number;
  seed: number;
  stimulateChance: number;
  outRun: number;
}

export function readConstants(stage: StageDef): LaserConstants {
  const c = stage.constants ?? {};
  return {
    wavelengthNm: c.wavelengthNm ?? WAVELENGTH_NM,
    waveScale: c.waveScale ?? WAVE_SCALE,
    packetLength: c.packetLength ?? PACKET_LENGTH,
    packetAmplitude: c.packetAmplitude ?? PACKET_AMPLITUDE,
    mirrorX: c.mirrorX ?? MIRROR_X,
    lanes: c.lanes ?? LANES,
    laneGap: c.laneGap ?? LANE_GAP,
    atomsPerLane: c.atomsPerLane ?? ATOMS_PER_LANE,
    atomMargin: c.atomMargin ?? ATOM_MARGIN,
    excitedFraction: c.excitedFraction ?? EXCITED_FRACTION,
    seed: c.seed ?? SEED,
    stimulateChance: c.stimulateChance ?? STIMULATE_CHANCE,
    outRun: c.outRun ?? OUT_RUN,
  };
}

// ------------------------------------------------------------------------
// 시드 결정적 난수 — 다른 sim 의 것을 가져오지 않는다 (S-sim · C3)
// ------------------------------------------------------------------------

/** mulberry32. 같은 시드는 언제나 같은 수열이다. */
function makeRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------------
// 매질 · 거울
// ------------------------------------------------------------------------

/** 길 j 의 높이(월드). 가운데 길이 0. */
export const laneY = (lane: number, c: LaserConstants): number => (lane - (c.lanes - 1) / 2) * c.laneGap;

/** 첫 광자가 출발하는 길 — 가운데. */
export const seedLane = (c: LaserConstants): number => Math.floor((c.lanes - 1) / 2);

/** 가장 바깥 길의 높이(월드). 매질 띠 · 이름표 자리의 기준. */
export const outerLaneY = (c: LaserConstants): number => laneY(c.lanes - 1, c);

export interface Atom {
  lane: number;
  pos: Vec2;
  /** 주기 처음에 들떠 있는가. */
  excited: boolean;
}

/** 원자 배치 — 길마다 거울 사이를 `atomsPerLane` 칸으로 나누고, 칸 안의 x 와 들뜸을 시드로 뽑는다. */
export function atoms(c: LaserConstants): Atom[] {
  const rand = makeRandom(c.seed);
  const x0 = -c.mirrorX + c.atomMargin;
  const cell = (2 * (c.mirrorX - c.atomMargin)) / c.atomsPerLane;
  const out: Atom[] = [];
  for (let lane = 0; lane < c.lanes; lane++) {
    for (let k = 0; k < c.atomsPerLane; k++) {
      const x = x0 + (k + (1 - CELL_SPREAD) / 2 + CELL_SPREAD * rand()) * cell;
      out.push({ lane, pos: [x, laneY(lane, c)], excited: rand() < c.excitedFraction });
    }
  }
  return out;
}

/** 거울 사이 한 번 건너는 거리. */
const span = (c: LaserConstants): number => 2 * c.mirrorX;

/**
 * 펼친 좌표 s → 화면 x. 건넘 k 번째(0 부터)는 짝수면 왼쪽 → 오른쪽, 홀수면 되돌아온다.
 * 마지막 건넘 뒤에는 일부 통과 거울을 지나 곧장 나간다.
 */
export function foldX(s: number, c: LaserConstants): number {
  const L = span(c);
  const passes = PASS_PHASES.length;
  if (s >= passes * L) return c.mirrorX + (s - passes * L);
  const k = Math.floor(s / L);
  const r = s - k * L;
  return k % 2 === 0 ? -c.mirrorX + r : c.mirrorX - r;
}

/** s 가 몇 번째 접힌 조각에 있는가 — 물결을 거울에서 끊어 긋는 데 쓴다. */
function foldPiece(s: number, c: LaserConstants): number {
  return Math.min(PASS_PHASES.length, Math.floor(s / span(c)));
}

/** 일부 통과 거울을 지나는 자리(펼친 좌표) — 마지막 건넘의 끝. */
export const exitS = (c: LaserConstants): number => PASS_PHASES.length * span(c);

/**
 * 광자 앞머리가 간 거리 s. **단계 경계는 선언이 정한다** — 건넘 단계마다 진행도 × 거울 사이
 * 거리, 나가는 단계의 진행도 × `outRun` 을 더한다 (S-piece).
 */
export function headS(tl: TimelineFrame, c: LaserConstants): number {
  let s = 0;
  for (const id of PASS_PHASES) s += tl.at(id) * span(c);
  return s + tl.at('out') * c.outRun;
}

// ------------------------------------------------------------------------
// 유도 방출의 연쇄
// ------------------------------------------------------------------------

export interface Photon {
  lane: number;
  /** 태어난 자리(펼친 좌표). 이 자리보다 뒤에는 이 광자의 물결이 없다 — 원자에서 **자라 나온다.** */
  born: number;
}

export interface Emission {
  /** 바닥으로 내려온 원자(`atoms` 의 번호). */
  atom: number;
  /** 앞머리가 그 원자를 지난 자리(펼친 좌표). */
  at: number;
}

export interface Chain {
  photons: Photon[];
  /** 일어난 순서. */
  emissions: Emission[];
}

/**
 * 한 주기의 연쇄를 처음부터 센다. 스테이지 상수만의 함수라 같은 선언은 언제나 같은 연쇄다.
 * 건넘마다 앞머리가 원자를 만나는 순서대로 훑고, 만날 때마다 시드 수열에서 하나를 뽑는다 —
 * 원자 배치와 다른 수열이라 확률 몫을 바꿔도 매질은 그대로다.
 */
export function chain(list: readonly Atom[], c: LaserConstants): Chain {
  const L = span(c);
  const rand = makeRandom(c.seed + CHAIN_SEED_OFFSET);
  const photons: Photon[] = [{ lane: seedLane(c), born: 0 }];
  const emissions: Emission[] = [];
  const excited = list.map((a) => a.excited);
  for (let k = 0; k < PASS_PHASES.length; k++) {
    const meet = list
      .map((a, i) => ({ i, s: k * L + (k % 2 === 0 ? a.pos[0] + c.mirrorX : c.mirrorX - a.pos[0]) }))
      .sort((p, q) => p.s - q.s);
    for (const { i, s } of meet) {
      const draw = rand();
      if (!excited[i]) continue;
      const lane = list[i]!.lane;
      const near = photons.filter((p) => Math.abs(p.lane - lane) <= 1 && p.born < s).length;
      if (draw >= 1 - Math.pow(1 - c.stimulateChance, near)) continue;
      excited[i] = false;
      photons.push({ lane, born: s });
      emissions.push({ atom: i, at: s });
    }
  }
  return { photons, emissions };
}

// ------------------------------------------------------------------------
// 광자 물결
// ------------------------------------------------------------------------

/** 빛의 색(선형광). */
export const photonLight = (c: LaserConstants): LinearRgb => wavelengthToLinearRgb(c.wavelengthNm);

/**
 * 길 하나의 물결 — 앞머리 `head` 에서 뒤로 묶음 길이만큼, 그 길의 첫 광자가 태어난 자리 `born`
 * 보다 뒤는 빼고. 거울에서 접힌 자리마다 선을 끊는다. 화면 x 가 `maxX` 를 넘는 부분도 뺀다.
 *
 * 물결의 위상은 앞머리에만 걸려 있다 — 어느 길의 광자든 같은 s 에서 같은 높이라, 길을 가로질러
 * 봉우리가 한 줄로 선다(결이 맞는다).
 */
export function laneWave(lane: number, born: number, head: number, c: LaserConstants, maxX: number): Vec2[][] {
  const tail = head - c.packetLength;
  const from = Math.max(tail, born);
  if (head <= from) return [];
  const lambda = c.wavelengthNm * c.waveScale;
  const steps = Math.max(2, Math.ceil(((head - from) / lambda) * SAMPLES_PER_WAVE));
  const y0 = laneY(lane, c);
  const lines: Vec2[][] = [];
  let cur: Vec2[] = [];
  let piece = -1;
  for (let i = 0; i <= steps; i++) {
    const s = from + ((head - from) * i) / steps;
    const x = foldX(s, c);
    const p = foldPiece(s, c);
    if (p !== piece || x > maxX) {
      if (cur.length >= 2) lines.push(cur);
      cur = [];
      piece = p;
      if (x > maxX) continue;
    }
    // 묶음 모양 — 양 끝이 0 인 sin 봉우리. 물결은 앞머리에 맞춰 흐른다.
    const env = Math.sin((Math.PI * (s - tail)) / c.packetLength);
    cur.push([x, y0 + c.packetAmplitude * env * Math.sin((2 * Math.PI * (s - head)) / lambda)]);
  }
  if (cur.length >= 2) lines.push(cur);
  return lines;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: LaserAndStimulatedEmissionState }): LaserAndStimulatedEmissionState {
  return params.state;
}
