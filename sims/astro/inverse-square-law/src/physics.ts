// ========================================================================
// inverse-square-law — 순수 물리 · 배치
// ========================================================================
// 알갱이는 한 점에서 같은 순간 같은 빠르기로 떠나 방향을 바꾸지 않는다. 그래서 어느
// 순간이든 모두 반지름 R 인 구면 위에 있고, 알갱이 하나의 자리는 「제 방향 × R」 이다.
//
// 방향은 단위 구 위에 **고르게** 깐다 — 램버트 방위 등면적 사상으로 평면 격자를 구면에
// 옮기면 격자 한 칸이 구면에서도 같은 넓이를 맡는다. 반지름 R 의 구면에서 알갱이 하나가
// 맡는 넓이는 (간격 × R)² 이므로 고정된 창에 드는 수는 1/R² 을 따른다. 그것이 전부다.
//
// 화면은 정면에서 본 정사영이라 앞 반구만 둔다 — 뒤 반구 알갱이는 앞 반구에 가려진다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { LATTICE_STEP, MULTIPLE_2, MULTIPLE_3, RADIUS, WINDOW_SIDE } from './schema';
import type { InverseSquareLawState } from './state';

export interface InverseSquareLawConstants {
  /** 기준 거리 r 의 월드 길이. */
  radius: number;
  /** 둘째 · 셋째로 멈추는 거리의 배수. */
  multiple2: number;
  multiple3: number;
  /** 등면적 평면에서의 격자 간격(단위 구 기준). */
  latticeStep: number;
  /** 고정 창의 한 변 — r 에 대한 비. */
  windowSide: number;
}

export function readConstants(stage: StageDef): InverseSquareLawConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    radius: c.radius ?? RADIUS,
    multiple2: c.multiple2 ?? MULTIPLE_2,
    multiple3: c.multiple3 ?? MULTIPLE_3,
    latticeStep: c.latticeStep ?? LATTICE_STEP,
    windowSide: c.windowSide ?? WINDOW_SIDE,
  };
}

/** 한 알갱이의 방향 — 정면에서 본 단위 구 위 자리와 그 깊이. */
export interface GrainDirection {
  /** 단위 구 위 자리를 화면 평면에 정사영한 것. */
  p: Vec2;
  /** 보는 쪽으로의 깊이 0~1. 원판 가운데가 1, 둘레가 0. */
  depth: number;
  /** 기준 거리 r 에서 고정 창 안에 들었는가 — 강조색으로 따라가는 몫이다. */
  tagged: boolean;
}

/**
 * 격자를 ¼ 칸 엇놓는 양. 창이 가운데에 있으므로 격자가 창과 대칭이면 2r 에서 창 경계에
 * 알갱이가 걸친다(한 변 3 개 = 홀수). 엇놓으면 r · 2r · 3r 모두 경계에서 떨어진다.
 */
const LATTICE_OFFSET = 0.25;

/**
 * 앞 반구의 알갱이 방향들. 램버트 평면 반지름 √2 가 반구 경계다.
 *
 * 정사영 반지름은 `ρ·√(1 − ρ²/4)` — 평면 반지름 ρ 의 점은 극각 θ(ρ = 2 sin θ/2)에 놓이고
 * 화면에는 sin θ 로 보인다.
 */
export function grainDirections(c: InverseSquareLawConstants): GrainDirection[] {
  const h = c.latticeStep;
  const half = c.windowSide / 2;
  const edge = Math.SQRT2;
  const k = Math.ceil(edge / h) + 1;
  const out: GrainDirection[] = [];
  for (let i = -k; i <= k; i++) {
    for (let j = -k; j <= k; j++) {
      const u = (i + LATTICE_OFFSET) * h;
      const v = (j + LATTICE_OFFSET) * h;
      const rho = Math.hypot(u, v);
      if (rho >= edge) continue;
      const f = Math.sqrt(1 - (rho * rho) / 4);
      const x = u * f;
      const y = v * f;
      const depth = Math.sqrt(Math.max(0, 1 - x * x - y * y));
      out.push({ p: [x, y], depth, tagged: Math.max(Math.abs(x), Math.abs(y)) < half });
    }
  }
  return out;
}

/** 퍼지는 단계 하나 — 어느 배수에서 어느 배수로. 단계 id 는 `schema.timeline` 의 것이다. */
export interface GrowLeg {
  phase: string;
  from: number;
  to: number;
}

/** 세 번의 퍼짐. 점(0) → r → 2r → 3r. 배수는 스테이지 상수에서 온다. */
export function growLegs(c: InverseSquareLawConstants): GrowLeg[] {
  return [
    { phase: 'grow1', from: 0, to: 1 },
    { phase: 'grow2', from: 1, to: c.multiple2 },
    { phase: 'grow3', from: c.multiple2, to: c.multiple3 },
  ];
}

export interface ShellReading {
  /** 지금 구껍질의 반지름 — r 의 몇 배인가. */
  scale: number;
  /** 반지름이 자라는 빠르기(배수/초). 멈춘 단계에서 0. */
  rate: number;
}

/**
 * 지금 구껍질의 크기. **단계 경계는 선언이 정한다** — 각 퍼짐 단계의 진행도(`at`)를
 * 더할 뿐이라, 저작자가 단계를 늘이거나 줄여도 분기 없이 따라간다 (S-piece).
 */
export function readShell(tl: TimelineFrame, c: InverseSquareLawConstants): ShellReading {
  let scale = 0;
  let rate = 0;
  for (const leg of growLegs(c)) {
    scale += (leg.to - leg.from) * tl.at(leg.phase);
    // 퍼지는 단계는 linear 라 빠르기가 한결같다 — 거리 ÷ 단계 길이.
    if (tl.phase === leg.phase) rate = (leg.to - leg.from) / tl.duration(leg.phase);
  }
  return { scale, rate };
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 알갱이를 지우고 다시 터뜨린다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: InverseSquareLawState }): InverseSquareLawState {
  return params.state;
}
