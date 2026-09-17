// ========================================================================
// stress-strain-curve — 순수 물리
// ========================================================================
// 재료 모형은 원본 그대로다. 당길 때 탄성으로 예상한 응력이 뼈대곡선을 넘으면
// 곡선 위에 올라타며 남은 변형률이 자라고, 놓을 때는 `남은 + 응력 / E` 로 내려온다.
// 그래서 내려오는 선의 기울기는 저절로 처음 기울기와 같다.
// ========================================================================

import type { TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  BIG_PULL,
  E,
  HARDEN_LENGTH,
  HARDEN_RISE,
  SMALL_PULL,
  YIELD_STRAIN,
} from './schema';
import type { StressStrainCurveState } from './state';

/** 뼈대곡선 위 점을 잇는 간격(변형률). 원본은 프레임마다 점을 찍었다. */
const CURVE_SAMPLE = 0.04;

/** 한 번도 넘어 보지 않은 막대가 따르는 곡선. */
export function backbone(e: number): number {
  if (e <= YIELD_STRAIN) return E * e;
  return E * YIELD_STRAIN + HARDEN_RISE * (1 - Math.exp(-(e - YIELD_STRAIN) / HARDEN_LENGTH));
}

/** 지금 막대의 재료 상태. `trail` 은 (변형률, 응력) 자취. */
export interface Material {
  /** 지금 변형률. */
  e: number;
  /** 지금 응력. */
  s: number;
  /** 남은 변형률. */
  residual: number;
  /** 지나온 (변형률, 응력). 새 막대면 원점 하나. */
  trail: Vec2[];
  /** 새 막대가 들어오는 중이면 true — 앞 막대가 아니다. */
  fresh: boolean;
}

/** 원점에서 변형률 `e` 까지 당겨 올라간 자취 — 탄성 직선, 넘었으면 뼈대곡선. */
function loadingPath(e: number): Vec2[] {
  const out: Vec2[] = [[0, 0]];
  if (e <= YIELD_STRAIN) {
    out.push([e, E * e]);
    return out;
  }
  out.push([YIELD_STRAIN, E * YIELD_STRAIN]);
  for (let x = YIELD_STRAIN + CURVE_SAMPLE; x < e; x += CURVE_SAMPLE) out.push([x, backbone(x)]);
  out.push([e, backbone(e)]);
  return out;
}

/** 원점에서 `e` 까지 한 방향으로 당긴 뒤의 (응력, 남은 변형률). */
function pulledTo(e: number): { s: number; residual: number } {
  const s = backbone(e);
  // 탄성 구간이면 남은 것이 없다. 넘었으면 곡선 위에 있고, 남은 = e − s / E.
  return { s, residual: e <= YIELD_STRAIN ? 0 : e - s / E };
}

/**
 * 시간표에서 지금 재료 상태를 푼다.
 *
 * 멀리 당김과 멀리 놓기는 두 단계에 걸친 한 동작이라, 이징을 두 단계를 합친 구간에
 * `span` 으로 건다 (schema.ts 시간표 주석).
 */
export function materialAt(tl: TimelineFrame): Material {
  if (tl.phase === 'enter') {
    return { e: 0, s: 0, residual: 0, trail: [[0, 0]], fresh: true };
  }

  // ---- 첫 당김: 대조군 ----
  const small = SMALL_PULL;
  const smallTop: Vec2 = [small, E * small];
  if (tl.u < tl.end('hold-small')) {
    const e = small * tl.at('pull-small');
    return { e, s: E * e, residual: 0, trail: [[0, 0], [e, E * e]], fresh: false };
  }
  const smallCycle: Vec2[] = [[0, 0], smallTop];
  if (tl.u < tl.end('rest-small')) {
    const s = smallTop[1] * (1 - tl.at('release-small'));
    const e = s / E;
    return { e, s, residual: 0, trail: [...smallCycle, [e, s]], fresh: false };
  }
  // 첫 바퀴가 끝나 원점에 돌아와 있다.
  const before: Vec2[] = [...smallCycle, [0, 0]];

  // ---- 두 번째 당김: 꺾인 곳을 넘는다 ----
  if (tl.u < tl.end('hold-far')) {
    const e = BIG_PULL * tl.span(tl.start('pull-elastic'), tl.end('pull-plastic'), 'smooth');
    const { s, residual } = pulledTo(e);
    // 원점에서 다시 올라간다 — 첫 바퀴의 자취 끝과 이어진다.
    return { e, s, residual, trail: [...before, ...loadingPath(e).slice(1)], fresh: false };
  }

  const top = pulledTo(BIG_PULL);
  const up = [...before, ...loadingPath(BIG_PULL).slice(1)];
  const release = tl.span(tl.start('release-far'), tl.end('release-reveal'), 'smooth');
  const s = top.s * (1 - release);
  const e = top.residual + s / E;
  return { e, s, residual: top.residual, trail: [...up, [e, s]], fresh: false };
}

/** '남은 늘어남' 표시의 진하기 0~1 — 놓기 끝 무렵 나타나 새 막대가 들어올 때까지. */
export function revealAt(tl: TimelineFrame, fade: number): number {
  if (tl.phase === 'enter') return 0;
  const from = tl.start('release-reveal');
  return tl.span(from, from + fade, 'smooth');
}

/** 앞 막대의 진하기 0~1 — 주기 끝에 흐려지고 새 막대가 들어온다. */
export function sceneOpacityAt(tl: TimelineFrame): number {
  return tl.phase === 'enter' ? tl.at('enter') : 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 재료 상태가 시각의 함수다. */
export function step(params: { state: StressStrainCurveState }): StressStrainCurveState {
  return params.state;
}
