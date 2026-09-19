// ========================================================================
// electrostatic-shielding — 순수 물리
// ========================================================================
// 고른 장 E₀(+x) 속의 속 빈 도체 원통(단면 반지름 a). 복소 퍼텐셜 w(z) 로 푼다 —
// 전위 φ = Re w, 장선은 Im w(흐름 함수 ψ)가 일정한 곡선이다.
//
//   유도가 끝났을 때(차폐)  바깥  w = −E₀ (z − a²/z)   → 겉면 r = a 에서 φ = 0 (등전위)
//                           안    w = 0                → 장이 없다
//   겉면 전하              σ ∝ cos θ — 장이 들어오는 왼쪽이 −, 나가는 오른쪽이 +
//
// 유도 도중은 겉면 전하가 최종값의 s 배(0 ≤ s ≤ 1)만큼 모인 상태로 둔다. 그 전하가 만드는
// 장은 바깥에서 쌍극자 s·E₀a²/z, 안에서 −s·E₀ 로 고르다. 그래서
//
//   바깥  ψ = −E₀ y (1 + s a²/r²)        안  ψ = −E₀ (1 − s) y
//
// 이다. s = 0 은 도체가 없는 고른 장, s = 1 은 완전한 차폐다. 도체 안의 전자가 옮겨 가는
// 실제 시간 변화(수 fs)는 그리지 않는다 — s 는 그 과정을 늘여 보인 진행도다 (NOTES b).
//
// 모든 것이 조각 시계의 함수다 — 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ARROW_SCALE,
  CHARGE_MARKS,
  CHEVRON_INSET,
  CHEVRON_LENGTH,
  FIELD_HALF_WIDTH,
  FIELD_STRENGTH,
  INNER_RADIUS,
  LINE_HALF_HEIGHT,
  LINE_SPACING,
  OUTER_RADIUS,
  PROBE_RADIUS,
} from './schema';
import type { ElectrostaticShieldingState } from './state';

/** 장선 반쪽(왼쪽 끝 → 겉면 또는 가운데)의 표본 수. 표현의 정밀도라 스테이지 상수에 두지 않는다. */
const LINE_SAMPLES = 72;
/** 원 표본 수 — 도체 고리의 둘레 (장부 G28). */
const CIRCLE_SAMPLES = 96;
/** 흐름 함수를 y 에 대해 푸는 이분법 반복 횟수. */
const BISECT_STEPS = 40;

export interface ElectrostaticShieldingConstants {
  /** 바깥 장 세기 E₀. */
  fieldStrength: number;
  /** 도체 바깥 · 안 반지름(월드). */
  outerRadius: number;
  innerRadius: number;
  /** 장선 간격 · 까는 반높이 · 펼치는 반폭(월드). */
  lineSpacing: number;
  lineHalfHeight: number;
  fieldHalfWidth: number;
  /** 장 → 힘 화살표 길이 배율. */
  arrowScale: number;
  /** 시험 전하 그림 반지름(월드). */
  probeRadius: number;
  /** 겉면 한쪽의 유도 전하 표식 개수. */
  chargeMarks: number;
  /** 장선 방향 촉 자리 · 길이(월드). */
  chevronInset: number;
  chevronLength: number;
}

export function readConstants(stage: StageDef): ElectrostaticShieldingConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    fieldStrength: c.fieldStrength ?? FIELD_STRENGTH,
    outerRadius: c.outerRadius ?? OUTER_RADIUS,
    innerRadius: c.innerRadius ?? INNER_RADIUS,
    lineSpacing: c.lineSpacing ?? LINE_SPACING,
    lineHalfHeight: c.lineHalfHeight ?? LINE_HALF_HEIGHT,
    fieldHalfWidth: c.fieldHalfWidth ?? FIELD_HALF_WIDTH,
    arrowScale: c.arrowScale ?? ARROW_SCALE,
    probeRadius: c.probeRadius ?? PROBE_RADIUS,
    chargeMarks: c.chargeMarks ?? CHARGE_MARKS,
    chevronInset: c.chevronInset ?? CHEVRON_INSET,
    chevronLength: c.chevronLength ?? CHEVRON_LENGTH,
  };
}

// ------------------------------------------------------------------------
// 시간표 → 지금의 유도 진행도
// ------------------------------------------------------------------------

/** 도체가 보이는 정도 0~1 — 놓여서, 치우는 단계에서 사라진다. */
export function conductorOpacity(tl: TimelineFrame): number {
  return tl.at('place') * (1 - tl.at('remove'));
}

/**
 * 겉면 전하가 모인 몫 s(0~1). 유도 단계에서 차고, 도체를 치우는 동안 함께 빠진다
 * (도체와 그 겉면 전하는 한 몸이라 따로 남지 않는다).
 */
export function inducedShare(tl: TimelineFrame): number {
  return tl.at('induce') * (1 - tl.at('remove'));
}

// ------------------------------------------------------------------------
// 장
// ------------------------------------------------------------------------

/** 안(r < a)의 장 세기 — 바깥 장에서 겉면 전하가 지운 만큼을 뺀 나머지 (1 − s)E₀, +x 방향. */
export function insideField(s: number, c: ElectrostaticShieldingConstants): number {
  return (1 - s) * c.fieldStrength;
}

/** 안에 놓인 시험 전하(단위 전하)가 받는 힘 화살표(월드 delta). */
export function probeForce(s: number, c: ElectrostaticShieldingConstants): Vec2 {
  return [c.arrowScale * insideField(s, c), 0];
}

/** 멀리서 장선이 출발하는 높이들 — 반 칸 어긋난 자리(±½, ±1½ …)의 양쪽 값만. */
export function lineOffsets(c: ElectrostaticShieldingConstants): number[] {
  const out: number[] = [];
  for (let k = 0; (k + 0.5) * c.lineSpacing <= c.lineHalfHeight; k++) out.push((k + 0.5) * c.lineSpacing);
  return out;
}

/**
 * 바깥 장선 하나(출발 높이 y₀ > 0)의 왼쪽 반 — 왼쪽 끝에서 겉면에 닿거나 가운데(x = 0)까지.
 * ψ = −E₀ y (1 + s a²/r²) 가 −E₀ y₀ 인 곡선을 x 마다 y 에 대해 푼다. r ≥ a 에서 이 식은 y 에 대해
 * 늘기만 하므로(기울기 ≥ 1 − s) 뿌리가 하나다. 겉면에 닿는 점은 y(1 + s) = y₀ 로 정확히 안다.
 * 닿는 쪽 끝에 표본을 몰아 둔다 — 겉면 곁에서 선이 겉면 쪽으로 가파르게 꺾인다.
 */
function outerHalfLine(y0: number, s: number, c: ElectrostaticShieldingConstants): { pts: Vec2[]; hits: boolean } {
  const a = c.outerRadius;
  const yHit = y0 / (1 + s);
  const hits = yHit < a;
  const xEnd = hits ? -Math.sqrt(a * a - yHit * yHit) : 0;
  const x0 = -c.fieldHalfWidth;
  const pts: Vec2[] = [];
  for (let i = 0; i < LINE_SAMPLES; i++) {
    const t = i / LINE_SAMPLES;
    const x = x0 + (xEnd - x0) * (1 - (1 - t) * (1 - t));
    pts.push([x, solveY(x, y0, s, c)]);
  }
  pts.push([xEnd, hits ? yHit : solveY(xEnd, y0, s, c)]);
  return { pts, hits };
}

/** 바깥 흐름 함수를 y 에 대해 푼다 — 겉면 밖(r ≥ a) 가지의 y. */
function solveY(x: number, y0: number, s: number, c: ElectrostaticShieldingConstants): number {
  const a2 = c.outerRadius * c.outerRadius;
  let lo = Math.sqrt(Math.max(0, a2 - x * x));
  let hi = y0;
  const f = (y: number) => y * (1 + (s * a2) / (x * x + y * y)) - y0;
  if (f(lo) >= 0) return lo;
  for (let i = 0; i < BISECT_STEPS; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * 바깥 장선 전부. 위 · 아래, 왼쪽 · 오른쪽이 대칭이다 — 왼쪽 위 반쪽을 풀어 거울로 옮긴다.
 * 겉면에 닿는 선은 왼쪽 가닥(겉면에서 끝남)과 오른쪽 가닥(겉면에서 시작)으로 갈리고,
 * 닿지 않는 선은 한 줄로 잇는다.
 */
export function outerLines(s: number, c: ElectrostaticShieldingConstants): Vec2[][] {
  const lines: Vec2[][] = [];
  for (const y0 of lineOffsets(c)) {
    const { pts, hits } = outerHalfLine(y0, s, c);
    for (const sy of [1, -1]) {
      const left = pts.map(([x, y]) => [x, sy * y] as Vec2);
      const right = [...pts].reverse().map(([x, y]) => [-x, sy * y] as Vec2);
      if (hits) {
        lines.push(left, right);
      } else {
        lines.push([...left, ...right.slice(1)]);
      }
    }
  }
  return lines;
}

/**
 * 안의 장선 — ψ = −E₀(1 − s) y 라 곧은 가로선이고 높이가 y₀ / (1 − s) 로 벌어진다. 겉면 안(r < a)에
 * 든 것만 긋는다. 모인 전하가 늘수록 선이 성겨져 겉면 밖으로 밀려나고, s = 1 이면 하나도 없다.
 */
export function innerLines(s: number, c: ElectrostaticShieldingConstants): Vec2[][] {
  const a = c.outerRadius;
  const lines: Vec2[][] = [];
  if (s >= 1) return lines;
  for (const y0 of lineOffsets(c)) {
    const y = y0 / (1 - s);
    if (y >= a) continue;
    const half = Math.sqrt(a * a - y * y);
    for (const sy of [1, -1]) {
      lines.push([
        [-half, sy * y],
        [half, sy * y],
      ]);
    }
  }
  return lines;
}

/**
 * 장선 방향 촉 자리 — 바깥 장선마다 양 끝에서 조금 들어온 곳. 거기서는 선이 거의 곧으므로
 * 촉은 +x 로 둔다 (장부 G57 — 선 묶음에 머리가 없다).
 */
export function chevronSpots(s: number, c: ElectrostaticShieldingConstants): Vec2[] {
  const spots: Vec2[] = [];
  for (const y0 of lineOffsets(c)) {
    for (const sx of [-1, 1]) {
      const x = sx * (c.fieldHalfWidth - c.chevronInset) - (sx > 0 ? c.chevronLength : 0);
      const y = solveY(x, y0, s, c);
      spots.push([x, y], [x, -y]);
    }
  }
  return spots;
}

/**
 * 유도 전하 표식 자리(겉면 한쪽, 각). 겉면 전하 σ ∝ cos θ 라 같은 전하량마다 하나를 놓으면
 * sin θ 가 고르게 놓인다 — 표식이 적도(θ = 0)에 몰리고 위아래 끝(θ = ±90°)에서 성기다.
 * 오른쪽(+) 반쪽의 각을 돌려준다. 왼쪽(−)은 π − θ 다.
 */
export function chargeMarkAngles(c: ElectrostaticShieldingConstants): number[] {
  const n = Math.max(1, Math.round(c.chargeMarks));
  return Array.from({ length: n }, (_, k) => Math.asin(-1 + (2 * k + 1) / n));
}

/**
 * 도체 고리 단면 — 바깥 원을 반시계로 돌고 안 원을 시계로 되돌아오는 열쇠구멍 다각형.
 * 채우면 가운데가 빈 고리가 된다 (장부 G18 — `region` 에 구멍이 없다).
 * `outerEdges` · `innerEdges` 는 두 원의 둘레 변 인덱스 쌍 (장부 G174).
 */
export function ringPolygon(c: ElectrostaticShieldingConstants): {
  points: Vec2[];
  outerEdges: [number, number][];
  innerEdges: [number, number][];
} {
  const points: Vec2[] = [];
  for (let i = 0; i <= CIRCLE_SAMPLES; i++) {
    const t = (i / CIRCLE_SAMPLES) * Math.PI * 2;
    points.push([c.outerRadius * Math.cos(t), c.outerRadius * Math.sin(t)]);
  }
  for (let i = CIRCLE_SAMPLES; i >= 0; i--) {
    const t = (i / CIRCLE_SAMPLES) * Math.PI * 2;
    points.push([c.innerRadius * Math.cos(t), c.innerRadius * Math.sin(t)]);
  }
  const outerEdges: [number, number][] = [];
  const innerEdges: [number, number][] = [];
  for (let i = 0; i < CIRCLE_SAMPLES; i++) {
    outerEdges.push([i, i + 1]);
    innerEdges.push([CIRCLE_SAMPLES + 1 + i, CIRCLE_SAMPLES + 2 + i]);
  }
  return { points, outerEdges, innerEdges };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ElectrostaticShieldingState }): ElectrostaticShieldingState {
  return params.state;
}
