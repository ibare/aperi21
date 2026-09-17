// ========================================================================
// moon-phases — 순수 계산
// ========================================================================
// 궤도 각 · 달 자리 · 밝은 면적 비율 · 지구에서 본 원판의 명암. DOM · 캔버스 · 색을 모른다.
// 식과 상수는 원본(tasks/piece-lab/moon-phases/index.html)을 그대로 옮겼다.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import { DISC_CELLS, ORBIT, OVERLAP_EDGE, moonPhasesSchema } from './schema';
import type { MoonPhasesState } from './state';

/** 시간표 한 주기(초). */
export function period(): number {
  return (moonPhasesSchema.timeline?.phases ?? []).reduce((s, p) => s + p.duration, 0) || 1;
}

/** 궤도 위 달 자리(월드). θ 는 지구에서 태양(+x) 쪽에서 반시계. */
export function moonAt(theta: number): Vec2 {
  return [ORBIT.cx + ORBIT.R * Math.cos(theta), ORBIT.cy + ORBIT.R * Math.sin(theta)];
}

/** 지구에서 보이는 원판 중 밝은 면적 비율 (1 − cos θ)/2. */
export function litFraction(theta: number): number {
  return (1 - Math.cos(theta)) / 2;
}

/** 캡션을 가르는 겹침 판정 — 원본 captionFor 의 두 경계. */
export function overlapFlags(theta: number): { noOverlap: boolean; fullOverlap: boolean } {
  const k = litFraction(theta);
  return { noOverlap: k < OVERLAP_EDGE.none, fullOverlap: k > OVERLAP_EDGE.full };
}

/** 원본 색 두 개의 휘도 — 명암 비율을 옮기는 데만 쓰는 수학 상수(원본 sunlit · night 의 녹색 채널 근사). */
const LIT_LEVEL = 230;
const DARK_LEVEL = 49;

/**
 * 지구에서 본 달 원판의 **밝기** 격자(0 = 그늘 면, 1 = 햇빛 받는 면). 행 우선, 첫 행이 위.
 * 원판 밖은 0 — 장의 바탕이다. 그늘 면도 바탕과 같다 (원본은 바탕보다 조금 밝은 색, NOTES (a)).
 *
 * 원본 renderMoonDisc 와 같은 셈이다. 시선 방향 d = (cos θ, sin θ), 원판 위 (u, v) 의 표면 법선
 * n = u·r + v·z − w·d 의 태양 방향 성분 nx = u·sin θ − w·cos θ. 명암 경계는 nx ±0.025 안에서
 * smoothstep, 밝은 면은 0.93 + 0.07·nx 로 가장자리 쪽이 조금 어둡다. 원판 테두리는 한 칸 폭으로 흐린다.
 */
export function discBrightness(theta: number, n: number = DISC_CELLS): number[] {
  const dx = Math.cos(theta);
  const dy = Math.sin(theta);
  const out = new Array<number>(n * n);
  for (let j = 0; j < n; j++) {
    const v = 1 - ((j + 0.5) / n) * 2;
    for (let i = 0; i < n; i++) {
      const u = ((i + 0.5) / n) * 2 - 1;
      const rr = u * u + v * v;
      const k = j * n + i;
      if (rr > 1.02) {
        out[k] = 0;
        continue;
      }
      const w = Math.sqrt(Math.max(0, 1 - rr));
      const nx = u * dy - w * dx;
      let s = (nx + 0.025) / 0.05;
      s = s < 0 ? 0 : s > 1 ? 1 : s;
      s = s * s * (3 - 2 * s);
      const shade = 0.93 + 0.07 * Math.max(0, nx);
      // 원본: 색 = DARK + (LIT·shade − DARK)·s. 밝기 비율 b(0 = 그늘, 1 = 햇빛)로 옮긴다.
      const b = (s * (LIT_LEVEL * shade - DARK_LEVEL)) / (LIT_LEVEL - DARK_LEVEL);
      const edge = Math.max(0, Math.min(1, (1 - Math.sqrt(rr)) * (n / 2) + 0.5));
      out[k] = b * edge;
    }
  }
  return out;
}

/**
 * 한 걸음. 달은 시각의 함수라 쌓을 것은 끌기의 위상 차이뿐이다.
 *
 * 잡고 있으면 손잡이 자리의 궤도 각에서 위상 차이를 다시 잡는다(원본 aim). 놓으면 그 차이를
 * 그대로 두어 그 자리에서 다시 돈다. `step` 이 시간표를 받지 못해 시계를 따로 센다 (G01).
 */
export function step(params: { state: MoonPhasesState; dt: number }): MoonPhasesState {
  const { state, dt } = params;
  const t = state.t + dt;
  const base = (2 * Math.PI * t) / period();
  let offset = state.offset;
  if (state.held) {
    const [px, py] = state.moonPos;
    offset = Math.atan2(py - ORBIT.cy, px - ORBIT.cx) - base;
  }
  const theta = base + offset;
  return { ...state, t, offset, moonPos: moonAt(theta), ...overlapFlags(theta) };
}
