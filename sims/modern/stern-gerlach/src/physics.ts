// ========================================================================
// stern-gerlach — 순수 물리 · 배치 계산
// ========================================================================
// 쌓는 상태가 없다. 원자마다의 방향(가정) · 갈래(실제) · 출발 높이 · 보낸 시각은 (시드, 주기 번호)의
// 함수이고, 그 원자가 지금 어디 있는지는 보낸 뒤 흐른 시간의 함수다. `step` 은 항등이다.
//
// 자석 안에서는 세로 힘이 일정해 길이 포물선이고, 자석을 나오면 곧게 간다. 스크린에서의 편향을 1 로
// 맞춘 모양 함수 s(x) 에 원자마다의 편향을 곱한다 —
//
//   자석 앞         s = 0
//   자석 안         s = (x − x₀)² / 2 / K
//   자석 뒤         s = (L² / 2 + L (x − x₁)) / K          K = L² / 2 + L (x_스크린 − x₁)
//
// 가정 원자는 자석이 세로축과 이루는 각 θ 가 제멋대로(구면에 고르게)라 편향이 D·cos θ 이고, cos θ 는
// [−1, 1] 에 고르게 퍼진다 — 스크린에 고른 세로 띠. 실제 원자는 편향이 +D 아니면 −D 둘뿐이다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ATOM_SPEED,
  BEAM_THICKNESS,
  BEAM_WIDTH,
  DEFLECTION_MAGNIFICATION,
  EXPECT_COUNT,
  MAGNET_LENGTH_MM,
  MAGNET_X0,
  MAGNET_X1,
  OVEN_X,
  PANEL_CX,
  REAL_COUNT,
  SCREEN_X,
  SEED,
  SPLIT_MM,
} from './schema';
import type { SternGerlachState } from './state';

/** 보내는 시각의 흔들림 — 고른 간격의 몇 분의 일까지 앞뒤로 흔드는가. 1 보다 작아 순서가 뒤집히지 않는다. */
const EMIT_JITTER = 0.7;
/** 주기 번호를 시드에 섞는 곱수(황금비 해시). */
const CYCLE_MIX = 0x9e3779b9;
/** 가정 원자 목록과 실제 원자 목록을 서로 다른 난수열로 뽑게 시드에 더하는 값. */
const REAL_STREAM = 0x5bd1e995;
/** 자석 안 포물선을 몇 점으로 표본하는가. */
const MAGNET_SAMPLES = 12;

export interface SternGerlachConstants {
  seed: number;
  expectCount: number;
  realCount: number;
  atomSpeed: number;
  /** 스크린에서의 한쪽 편향(월드) — 편향 배율을 곱한 값이다. */
  deflection: number;
  beamThickness: number;
  beamWidth: number;
}

export function readConstants(stage: StageDef): SternGerlachConstants {
  const c = stage.constants ?? {};
  const magnetMm = c.magnetLengthMm ?? MAGNET_LENGTH_MM;
  const splitMm = c.splitMm ?? SPLIT_MM;
  const magnification = c.deflectionMagnification ?? DEFLECTION_MAGNIFICATION;
  return {
    seed: c.seed ?? SEED,
    expectCount: Math.max(1, Math.round(c.expectCount ?? EXPECT_COUNT)),
    realCount: Math.max(1, Math.round(c.realCount ?? REAL_COUNT)),
    atomSpeed: c.atomSpeed ?? ATOM_SPEED,
    deflection: ((MAGNET_X1 - MAGNET_X0) * (splitMm / 2) * magnification) / magnetMm,
    beamThickness: c.beamThickness ?? BEAM_THICKNESS,
    beamWidth: c.beamWidth ?? BEAM_WIDTH,
  };
}

// ------------------------------------------------------------------------
// 시드 난수 — 같은 (시드, 주기)는 언제나 같은 원자들을 낸다
// ------------------------------------------------------------------------

/** 시드 난수(mulberry32). 상태를 닫아 둔 생성기를 돌려준다. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 원자 하나. */
export interface Atom {
  /** 보낸 시각(주기 안 시각, 초). */
  emit: number;
  /** 출발 높이(월드) — 빔 두께 안의 흔들림. */
  z0: number;
  /** 스크린에서의 편향(월드). 가정 원자는 D·cos θ, 실제 원자는 ±D. */
  dz: number;
  /** 스크린 정면에서의 가로 자리(월드, 판 가운데 기준). */
  y: number;
  /** 가정 원자의 자석 방향(옆 보기 단위 벡터). 실제 원자는 없다 — 자석을 지나기 전 방향을 그리지 않는다. */
  needle?: Vec2;
}

/** 빔 두께 안의 출발 높이 — 두 고른 난수의 합이라 가운데가 짙다. */
function beamOffset(rand: () => number, half: number): number {
  return (rand() + rand() - 1) * half;
}

/** 단계 `phase` 동안 고르게(흔들림 포함) 보내는 시각들. */
function emitTimes(rand: () => number, tl: TimelineFrame, phase: string, n: number): number[] {
  const start = tl.start(phase);
  const len = tl.duration(phase);
  const out: number[] = [];
  for (let k = 0; k < n; k++) out.push(start + (len * (k + 0.5 + (rand() - 0.5) * EMIT_JITTER)) / n);
  return out;
}

/**
 * 주기 `cycle` 의 가정 원자들 — 「자석 방향이 제멋대로라면」. `expect` 단계 동안 보낸다.
 * cos θ 를 [−1, 1] 에서 고르게 뽑는 것이 구면에 고른 방향이다. 옆 보기의 바늘은 (± sin θ, cos θ).
 *
 * cos θ 는 층화 표본으로 뽑는다 — [−1, 1] 을 원자 수만큼 고른 칸으로 나눠 칸마다 하나씩 뽑고, 보내는
 * 순서는 섞는다. 수십 개를 순전히 무작위로 뽑으면 덩이 몇 개로 뭉쳐 「고른 띠」 로 읽히지 않는다 (NOTES (b)).
 */
export function expectAtoms(tl: TimelineFrame, c: SternGerlachConstants): Atom[] {
  const rand = mulberry32((c.seed ^ Math.imul(tl.cycle + 1, CYCLE_MIX)) >>> 0);
  const n = c.expectCount;
  const cosines: number[] = [];
  for (let i = 0; i < n; i++) cosines.push(-1 + (2 * (i + rand())) / n);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cosines[i], cosines[j]] = [cosines[j]!, cosines[i]!];
  }
  return emitTimes(rand, tl, 'expect', n).map((emit, k) => {
    const cos = cosines[k]!;
    const sin = Math.sqrt(Math.max(0, 1 - cos * cos)) * (rand() < 0.5 ? -1 : 1);
    return {
      emit,
      z0: beamOffset(rand, c.beamThickness),
      dz: c.deflection * cos,
      y: (2 * rand() - 1) * c.beamWidth,
      needle: [sin, cos] as Vec2,
    };
  });
}

/** 주기 `cycle` 의 실제 원자들. `real` 단계 동안 보낸다. 원자마다 위 · 아래가 반반의 확률로 갈린다. */
export function realAtoms(tl: TimelineFrame, c: SternGerlachConstants): Atom[] {
  const rand = mulberry32((c.seed ^ REAL_STREAM ^ Math.imul(tl.cycle + 1, CYCLE_MIX)) >>> 0);
  return emitTimes(rand, tl, 'real', c.realCount).map((emit) => ({
    emit,
    z0: beamOffset(rand, c.beamThickness),
    dz: rand() < 0.5 ? c.deflection : -c.deflection,
    y: (2 * rand() - 1) * c.beamWidth,
  }));
}

// ------------------------------------------------------------------------
// 길 — 모양 함수와 지금 자리
// ------------------------------------------------------------------------

const MAGNET_L = MAGNET_X1 - MAGNET_X0;
const SHAPE_K = (MAGNET_L * MAGNET_L) / 2 + MAGNET_L * (SCREEN_X - MAGNET_X1);

/** 스크린에서의 편향을 1 로 맞춘 모양 함수. */
function shape(x: number): number {
  if (x <= MAGNET_X0) return 0;
  if (x <= MAGNET_X1) return (x - MAGNET_X0) ** 2 / 2 / SHAPE_K;
  return ((MAGNET_L * MAGNET_L) / 2 + MAGNET_L * (x - MAGNET_X1)) / SHAPE_K;
}

/** 원자 길 위 x 의 자리. */
function pointOn(a: Atom, x: number): Vec2 {
  return [x, a.z0 + a.dz * shape(x)];
}

/** 가마에서 스크린까지 온 길 — 곧은 두 토막과 자석 안 포물선. */
export function fullPath(a: Atom): Vec2[] {
  const pts: Vec2[] = [pointOn(a, OVEN_X)];
  for (let k = 0; k <= MAGNET_SAMPLES; k++) pts.push(pointOn(a, MAGNET_X0 + (MAGNET_L * k) / MAGNET_SAMPLES));
  pts.push(pointOn(a, SCREEN_X));
  return pts;
}

/** 원자 하나의 지금 모습. */
export interface AtomView {
  atom: Atom;
  /** 날아가는 중이면 지금 자리. 아직 안 보냈거나 스크린에 닿았으면 없다. */
  pos?: Vec2;
  /** 스크린에 닿았으면 스크린 정면 판 위 자국 자리. */
  hit?: Vec2;
}

/** 원자들의 지금 모습. 주기 안 시각 `tl.u` 의 함수다. */
export function readAtoms(atoms: readonly Atom[], tl: TimelineFrame, c: SternGerlachConstants): AtomView[] {
  const flight = (SCREEN_X - OVEN_X) / c.atomSpeed;
  return atoms.map((atom) => {
    const age = tl.u - atom.emit;
    if (age < 0) return { atom };
    if (age >= flight) return { atom, hit: [PANEL_CX + atom.y, atom.z0 + atom.dz] as Vec2 };
    return { atom, pos: pointOn(atom, OVEN_X + c.atomSpeed * age) };
  });
}

export function step(params: { state: SternGerlachState }): SternGerlachState {
  return params.state;
}
