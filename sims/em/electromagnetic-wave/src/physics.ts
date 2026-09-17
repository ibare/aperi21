// ========================================================================
// electromagnetic-wave — 순수 계산
// ========================================================================
// DOM · 캔버스 · 색을 모른다 (S-sim). 식과 상수는 원본(index.html) 그대로다.
//
// 진동 전기 쌍극자의 자오면에서
//   전기력선 = Ψ(r,θ,t) = sin²θ · [ p'(τ)/c + p(τ)/r ] 의 등고선
//   자기장   = B_φ ∝ sinθ · [ p''(τ)/(c r) + p'(τ)/r² ]  (평면에 수직)
// τ = t − r/c. 전하가 멈추면 p = 0 이 되어 전하 근처의 장은 사라지고, 이미 방출된 부분은
// 닫힌 고리가 되어 계속 나아간다.
//
// 등고선은 조각이 마칭 스퀘어로 뽑아 선분 목록으로 넘긴다 — 등고선 어휘가 없다 (NOTES.md G66).
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import { B_SYMBOLS, DIFF_STEP, DIPOLE, FIELD_LINES, STAGE, WAVE } from './schema';
import type { ElectromagneticWaveState } from './state';

const OMEGA = (2 * Math.PI) / WAVE.period;
const C = WAVE.speed;
/** 파수. 등고선 값의 척도. */
const K = OMEGA / C;

/** 원본 px(y 아래) → 월드(y 위). */
export function toWorld(px: number, py: number): Vec2 {
  return [px, STAGE.height - py];
}

function mod(a: number, m: number): number {
  return ((a % m) + m) % m;
}

// ------------------------------------------------------------------------
// 원천 — 흔들기 시간표
// ------------------------------------------------------------------------

/**
 * 한 주기 안의 흔들기 경계(초). scene 이 시간표 단계의 `start` · `end` 에서 읽어 넘긴다.
 * 지연 시각은 지난 주기 · 다른 단계를 보아야 해서 지금 진행도만으로는 모자라다 (NOTES.md G59).
 */
export interface Drive {
  readonly period: number;
  readonly upStart: number;
  readonly upEnd: number;
  readonly downStart: number;
  readonly downEnd: number;
}

/** 포락선 — 경사는 코사인(원본 그대로). */
export function envelope(d: Drive, s: number): number {
  if (s < d.upStart || s > d.downEnd) return 0;
  if (s < d.upEnd) return 0.5 - 0.5 * Math.cos((Math.PI * (s - d.upStart)) / (d.upEnd - d.upStart));
  if (s > d.downStart) return 0.5 - 0.5 * Math.cos((Math.PI * (d.downEnd - s)) / (d.downEnd - d.downStart));
  return 1;
}

/** 쌍극자 모멘트 p(τ). 한 주기 안 위상 시각으로 접는다. */
export function dipoleMoment(d: Drive, tau: number): number {
  const s = mod(tau, d.period);
  return envelope(d, s) * Math.sin(OMEGA * s);
}

function dp(d: Drive, tau: number): number {
  return (dipoleMoment(d, tau + DIFF_STEP) - dipoleMoment(d, tau - DIFF_STEP)) / (2 * DIFF_STEP);
}

function ddp(d: Drive, tau: number): number {
  return (
    (dipoleMoment(d, tau + DIFF_STEP) - 2 * dipoleMoment(d, tau) + dipoleMoment(d, tau - DIFF_STEP)) /
    (DIFF_STEP * DIFF_STEP)
  );
}

// ------------------------------------------------------------------------
// 전기력선 — 흐름 함수 격자 → 등고선 선분
// ------------------------------------------------------------------------

const G = FIELD_LINES.grid;
const COLS = Math.ceil(STAGE.width / G) + 1;
const ROWS = Math.ceil(STAGE.height / G) + 1;

/** 등고선 값 — 양 · 음 세 쌍 (원본 순서 그대로). */
const LEVELS: readonly number[] = FIELD_LINES.levels.flatMap((f) => [f * K, -f * K]);

/** 시각 `tSrc` 의 흐름 함수 격자. 특이점 둘레는 NaN. */
function streamGrid(d: Drive, tSrc: number): Float64Array {
  const psi = new Float64Array(COLS * ROWS);
  for (let j = 0; j < ROWS; j++) {
    const y = DIPOLE.y - j * G;
    for (let i = 0; i < COLS; i++) {
      const x = i * G - DIPOLE.x;
      const r = Math.hypot(x, y);
      if (r < FIELD_LINES.rMin) {
        psi[j * COLS + i] = NaN;
        continue;
      }
      const s2 = (x * x) / (r * r);
      const tau = tSrc - r / C;
      psi[j * COLS + i] = s2 * (dp(d, tau) / C + dipoleMoment(d, tau) / r);
    }
  }
  return psi;
}

/** 전기력선 — 등고선 선분(월드, 두 점씩). 원본 마칭 스퀘어 그대로. */
export function fieldLineSegments(d: Drive, tSrc: number): Vec2[][] {
  const psi = streamGrid(d, tSrc);
  const out: Vec2[][] = [];
  for (const level of LEVELS) {
    for (let j = 0; j < ROWS - 1; j++) {
      for (let i = 0; i < COLS - 1; i++) {
        const a = psi[j * COLS + i]!;
        const b = psi[j * COLS + i + 1]!;
        const c = psi[(j + 1) * COLS + i + 1]!;
        const e = psi[(j + 1) * COLS + i]!;
        if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c) || Number.isNaN(e)) continue;
        const pts: [number, number][] = [];
        const x = i * G;
        const y = j * G;
        if ((a - level) * (b - level) < 0) pts.push([x + (G * (level - a)) / (b - a), y]);
        if ((b - level) * (c - level) < 0) pts.push([x + G, y + (G * (level - b)) / (c - b)]);
        if ((e - level) * (c - level) < 0) pts.push([x + (G * (level - e)) / (c - e), y + G]);
        if ((a - level) * (e - level) < 0) pts.push([x, y + (G * (level - a)) / (e - a)]);
        if (pts.length >= 2) out.push([toWorld(pts[0]![0], pts[0]![1]), toWorld(pts[1]![0], pts[1]![1])]);
        if (pts.length === 4) out.push([toWorld(pts[2]![0], pts[2]![1]), toWorld(pts[3]![0], pts[3]![1])]);
      }
    }
  }
  return out;
}

// ------------------------------------------------------------------------
// 자기장 — 평면에 수직, ⊙ / ⊗ 격자 기호
// ------------------------------------------------------------------------

/** 기호 하나 — 자리(월드) · 반지름(px) · 부호(나오는 쪽이 참). */
export interface BSymbol {
  readonly pos: Vec2;
  readonly radius: number;
  readonly out: boolean;
}

const B_REF = (OMEGA * OMEGA) / (C * B_SYMBOLS.refDistance);

/** 시각 `tSrc` 의 자기장 기호. 너무 작은 것 · 원천 가까운 것은 뺀다 (원본 그대로). */
export function magneticSymbols(d: Drive, tSrc: number): BSymbol[] {
  const out: BSymbol[] = [];
  const step = B_SYMBOLS.step;
  for (let py = step / 2; py < STAGE.height; py += step) {
    for (let px = step / 2 + B_SYMBOLS.xShift; px < STAGE.width; px += step) {
      const x = px - DIPOLE.x;
      const y = DIPOLE.y - py;
      const r = Math.hypot(x, y);
      if (r < B_SYMBOLS.rMin) continue;
      const sn = x / r;
      const tau = tSrc - r / C;
      const b = sn * (ddp(d, tau) / (C * r) + dp(d, tau) / (r * r));
      const m = Math.min(B_SYMBOLS.maxScale, Math.abs(b) / B_REF);
      const radius = m * B_SYMBOLS.radius;
      if (radius < B_SYMBOLS.minRadius) continue;
      out.push({ pos: toWorld(px, py), radius, out: b > 0 });
    }
  }
  return out;
}

/** 상태가 없다 — 항등 걸음 (S-sim 「상태가 시계뿐인 조각」). */
export function step(params: { state: ElectromagneticWaveState; dt: number }): ElectromagneticWaveState {
  return params.state;
}
