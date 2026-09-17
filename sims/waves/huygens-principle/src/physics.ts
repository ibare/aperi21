// ========================================================================
// huygens-principle — 순수 물리
// ========================================================================
// 왼쪽: 들어오는 평면파 cos(k(x − x0) − ωt).
// 오른쪽: 파면 자리 위 점파원 합 Σ a·cos(kr − ωt − π/4) / √((r + λ/4)/λ).
// 점 하나는 태어난 뒤 c·(t − 태어남) 반경 안에만, 멈춘 뒤에는 c·(t − 멈춤) 반경 밖에만
// 기여한다 — 새 동그라미의 앞머리와 곧은 파면의 꼬리가 이것으로 생긴다.
//
// 좌표는 원본 화면 좌표(y 는 아래)로 계산한다. 격자 순서가 `scalarField.values` 와
// 같아진다(첫 행이 위). 점파원 배치가 위아래 대칭이라 월드로 옮길 때 뒤집히지 않는다.
// ========================================================================

import {
  CELL,
  FARTHEST,
  FIELD_H,
  FIELD_W,
  PRESS_CLIP,
  SEGMENTS,
  STAGE_COUNTS,
  WAVEFRONT_X,
  WAVELENGTH,
  WAVE_SPEED,
  huygensPrincipleSchema,
  stagePhaseId,
  type StageCount,
} from './schema';
import type { HuygensPrincipleState } from './state';

const K = (2 * Math.PI) / WAVELENGTH;
const OMEGA = K * WAVE_SPEED;
/** 가장 촘촘할 때 점 간격. */
const D_MIN = FIELD_H / SEGMENTS;
/** 점파원 하나의 세기 — 촘촘해졌을 때 들어오는 파와 같은 세기가 되도록. */
const AMP = D_MIN / WAVELENGTH;
/** 앞머리 · 꼬리를 부드럽게 하는 폭. */
const SOFT = WAVELENGTH * 0.5;

/** 왼쪽(입사파) 격자 가로 칸 수. 원본 ceil(230 / 3) = 77. */
export const LEFT_COLS = Math.ceil(WAVEFRONT_X / CELL);
/** 오른쪽(점파 합) 격자 가로 칸 수. 원본 ceil(610 / 3) = 204. */
export const RIGHT_COLS = Math.ceil((FIELD_W - WAVEFRONT_X) / CELL);
/** 격자 세로 칸 수. 원본 ceil(320 / 3) = 107. */
export const ROWS = Math.ceil(FIELD_H / CELL);

// ------------------------------------------------------------------------
// 점파원
// ------------------------------------------------------------------------

export interface Source {
  /** 화면 y(아래로). 월드 y 는 `FIELD_H − y`. */
  y: number;
  /** 처음 등장하는 단계의 점 수. 1 이면 늘 켜져 있다. */
  stage: StageCount;
}

/** 점 i 가 처음 등장하는 단계: 가운데 하나 → 양 끝 → 그 사이를 반씩 채운다. */
function levelOf(i: number): number {
  if (i === SEGMENTS / 2) return 0;
  let level = 1;
  let step = SEGMENTS / 2;
  while (i % step !== 0) {
    step /= 2;
    level++;
  }
  return level;
}

export const SOURCES: readonly Source[] = Array.from({ length: SEGMENTS + 1 }, (_, i) => ({
  y: i * D_MIN,
  stage: STAGE_COUNTS[levelOf(i)]!,
}));

/** 단계 시작 시각(주기 안)을 알려 주는 함수 — scene 이 `timeline.start` 로 넘긴다. */
export type StageStart = (phaseId: string) => number;

/** 주기 안 시각 `u` 에 켜져 있는 점파원. */
export function aliveSources(u: number, start: StageStart): Source[] {
  return SOURCES.filter((s) => s.stage === 1 || u >= start(stagePhaseId(s.stage)));
}

/** 한 점파원이 파를 내는 시간 구간들 [태어남, 멈춤] — 지난 주기의 꼬리까지 포함. */
function windows(src: Source, t: number, period: number, cycle: number, start: StageStart): [number, number][] {
  if (src.stage === 1) return [[-Infinity, Infinity]];
  const born = start(stagePhaseId(src.stage));
  const out: [number, number][] = [];
  for (const kk of [cycle - 1, cycle]) {
    if (kk < 0) continue;
    const b = kk * period + born;
    const e = (kk + 1) * period;
    if (b <= t && WAVE_SPEED * (t - e) < FARTHEST + WAVELENGTH) out.push([b, e]);
  }
  return out;
}

const smooth = (x: number): number => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

// ------------------------------------------------------------------------
// 고정 기하 — 칸마다 점파원까지 거리와 세기 · 위상의 두 성분
// ------------------------------------------------------------------------
// 시간과 무관해 한 번만 계산한다. 인스턴스 상태가 아니라 선언에서 나온 고정 기하다 (원칙 6).
// cos(kr − π/4 − ωt) = cos(kr − π/4)·cos ωt + sin(kr − π/4)·sin ωt.

interface SourceGeometry {
  r: Float32Array;
  c: Float32Array;
  s: Float32Array;
}

let geometry: SourceGeometry[] | null = null;

function sourceGeometry(): SourceGeometry[] {
  if (geometry) return geometry;
  const n = RIGHT_COLS * ROWS;
  geometry = SOURCES.map((src) => {
    const r = new Float32Array(n);
    const c = new Float32Array(n);
    const s = new Float32Array(n);
    for (let cy = 0; cy < ROWS; cy++) {
      const dy = (cy + 0.5) * CELL - src.y;
      for (let cx = 0; cx < RIGHT_COLS; cx++) {
        const dx = (cx + 0.5) * CELL;
        const k = cy * RIGHT_COLS + cx;
        const rr = Math.sqrt(dx * dx + dy * dy);
        const amp = AMP / Math.sqrt((rr + WAVELENGTH / 4) / WAVELENGTH);
        const ph = K * rr - Math.PI / 4;
        r[k] = rr;
        c[k] = amp * Math.cos(ph);
        s[k] = amp * Math.sin(ph);
      }
    }
    return { r, c, s };
  });
  return geometry;
}

// ------------------------------------------------------------------------
// 변위
// ------------------------------------------------------------------------

/**
 * 약한 점파도 보이도록 제곱근으로 누르되 부호는 유지한다. 결과는 −1 ~ 1.
 * 원본의 누르는 곡선 그대로다 — 색 사상이 아니라 값의 모양이다.
 */
export function press(v: number): number {
  return Math.sign(v) * Math.sqrt(Math.min(PRESS_CLIP, Math.abs(v)) / PRESS_CLIP);
}

/** 들어오는 평면파 — 칸 열마다 하나(세로로 같다). 누른 값을 `out` 에 쓴다. */
export function incidentColumns(out: number[], t: number): void {
  for (let cx = 0; cx < LEFT_COLS; cx++) {
    const x = (cx + 0.5) * CELL;
    out[cx] = press(Math.cos(K * (x - WAVEFRONT_X) - OMEGA * t));
  }
}

/**
 * 점파원 합 — 파면 자리 오른쪽 격자. 누른 값을 `out` 에 행 우선(첫 행이 위)으로 쓴다.
 *
 * @param t 조각 시계(초). 위상은 주기로 끊지 않는다
 * @param period 한 주기(초)
 * @param cycle 주기 번호
 * @param start 단계 시작 시각(주기 안)
 */
export function waveletField(out: number[], t: number, period: number, cycle: number, start: StageStart): void {
  const geo = sourceGeometry();
  const n = RIGHT_COLS * ROWS;
  const cosT = Math.cos(OMEGA * t);
  const sinT = Math.sin(OMEGA * t);
  const sum = new Float64Array(n);

  SOURCES.forEach((src, i) => {
    const ws = windows(src, t, period, cycle, start);
    if (ws.length === 0) return;
    const g = geo[i]!;
    for (let k = 0; k < n; k++) {
      const r = g.r[k]!;
      let w = 0;
      for (const [b, e] of ws) {
        const front = b === -Infinity ? 1 : smooth((WAVE_SPEED * (t - b) - r) / SOFT);
        const tail = e === Infinity ? 1 : smooth((r - WAVE_SPEED * (t - e)) / SOFT);
        w += front * tail;
      }
      if (w === 0) continue;
      sum[k] = sum[k]! + w * (g.c[k]! * cosT + g.s[k]! * sinT);
    }
  });

  for (let k = 0; k < n; k++) out[k] = press(sum[k]!);
}

// ------------------------------------------------------------------------
// step — 캡션 하나를 위한 시계
// ------------------------------------------------------------------------

const PHASES = huygensPrincipleSchema.timeline!.phases;
const PERIOD = PHASES.reduce((a, p) => a + p.duration, 0);
const SINGLE_DURATION = PHASES[0]!.duration;

/**
 * 시계를 세고 「되돌린 뒤 꼬리가 아직 화면에 있는가」 를 계산한다. 첫 주기에는 꼬리가 없다.
 * 시간표를 다시 계산하는 것은 `step` 이 `TimelineFrame` 을 받지 못해서다 (G01).
 */
export function step(params: { state: HuygensPrincipleState; dt: number }): HuygensPrincipleState {
  const t = params.state.t + params.dt;
  const cycle = Math.floor(t / PERIOD);
  const u = t - cycle * PERIOD;
  const returning = cycle >= 1 && u < SINGLE_DURATION && WAVE_SPEED * u < FARTHEST;
  return { t, returning };
}
