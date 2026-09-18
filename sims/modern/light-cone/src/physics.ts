// ========================================================================
// light-cone — 순수 계산
// ========================================================================
// 캔버스 · DOM 을 모른다. 시간표 읽기(`TimelineFrame`)와 스테이지 상수만 받는다.
//
// 세 가지 계산뿐이다.
//   1. 투영 — (x, y, ct) 를 비스듬히 눕혀 평면 월드 좌표로. 조각의 배치 계산이다.
//   2. 원뿔 윤곽 — 꼭짓점과 테(타원)의 볼록 껍질. 껍질에 들지 못한 테 구간이 가려진 뒤쪽이다.
//   3. 로런츠 변환 — x 방향 속도 β 의 틀로. ct′ = γ(ct − βx), x′ = γ(x − βct), y′ = y.
//      원뿔 x² + y² = (ct)² 은 이 변환에 그대로라서 원뿔 선언은 틀과 무관하다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { BETA, PULSE_LIFE, EVENT_A, EVENT_B, EVENT_C, EVENT_D, SKEW_X, SKEW_Y, SLIDE_SAMPLES } from './schema';
import type { LightConeState } from './state';

/** 시공간의 한 점. 빛의 속도 = 1. */
export interface Event3 {
  x: number;
  y: number;
  ct: number;
}

export interface LightConeConstants {
  /** 틀을 바꿀 때 새 관찰자의 속도 v/c. */
  beta: number;
  /** 사건이 일어난 순간의 번쩍임이 사는 동안(ct). */
  pulseLife: number;
  /** 사건 넷 (E 기준). */
  events: readonly Event3[];
}

export function readConstants(stage: StageDef): LightConeConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const ev = (px: string, d: Event3): Event3 => ({
    x: c[`${px}X`] ?? d.x,
    y: c[`${px}Y`] ?? d.y,
    ct: c[`${px}Ct`] ?? d.ct,
  });
  return {
    beta: c.beta ?? BETA,
    pulseLife: c.pulseLife ?? PULSE_LIFE,
    events: [ev('a', EVENT_A), ev('b', EVENT_B), ev('c', EVENT_C), ev('d', EVENT_D)],
  };
}

// ------------------------------------------------------------------------
// 투영
// ------------------------------------------------------------------------

/** (x, y, ct) → 평면 월드. 뒤쪽(y > 0)이 오른쪽 위로 물러난다. */
export function project(e: Event3): Vec2 {
  return [e.x + e.y * SKEW_X, e.ct + e.y * SKEW_Y];
}

/** 높이 ct 에서 반지름 r 인 원(원뿔의 단면)의 표본. 투영하면 타원이다. */
export function circleAt(ct: number, r: number, samples: number): Event3[] {
  const out: Event3[] = [];
  for (let i = 0; i < samples; i++) {
    const a = (i / samples) * Math.PI * 2;
    out.push({ x: r * Math.cos(a), y: r * Math.sin(a), ct });
  }
  return out;
}

const cross = (o: Vec2, a: Vec2, b: Vec2): number =>
  (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

/** 볼록 껍질(반시계). monotone chain. */
export function convexHull(points: readonly Vec2[]): Vec2[] {
  const pts = [...points].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  if (pts.length < 3) return pts;
  const lower: Vec2[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Vec2[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]!;
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/** 원뿔 하나의 투영 — 윤곽(볼록 껍질)과 테를 보이는 구간 · 가려진 구간으로 나눈 것. */
export interface ConeOutline {
  hull: Vec2[];
  /** 윤곽 위에 놓인 테 구간(바깥 가장자리). */
  rimOuter: Vec2[][];
  /** 윤곽 안쪽으로 들어간 테 구간. 과거 원뿔에서는 원뿔 면 뒤로 가려진 쪽이다. */
  rimInner: Vec2[][];
}

/**
 * 꼭짓점이 원점이고 높이 `height`(음수면 과거) 인 원뿔.
 *
 * 테 표본 중 껍질의 꼭짓점이 된 것이 바깥 가장자리, 아닌 것이 안쪽이다. 타원은 볼록이라
 * 안쪽 구간은 한 덩이이고, 그 양 끝이 꼭짓점에서 테에 닿는 접점이다.
 */
export function coneOutline(height: number, samples: number): ConeOutline {
  const apex: Vec2 = [0, 0];
  const rim = circleAt(height, Math.abs(height), samples).map(project);
  const hull = convexHull([apex, ...rim]);
  const onHull = new Set(hull);
  const flags = rim.map((p) => onHull.has(p));
  return { hull, rimOuter: runs(rim, flags, true), rimInner: runs(rim, flags, false) };
}

/** 닫힌 점렬을 표시가 같은 연속 구간으로 나눈다. 구간 사이는 이웃 점을 함께 넣어 잇는다. */
function runs(ring: readonly Vec2[], flags: readonly boolean[], want: boolean): Vec2[][] {
  const n = ring.length;
  const start = flags.findIndex((f, i) => f !== flags[(i - 1 + n) % n]);
  if (start < 0) return flags[0] === want ? [[...ring, ring[0]!]] : [];
  const out: Vec2[][] = [];
  let cur: Vec2[] | null = null;
  for (let k = 0; k <= n; k++) {
    const i = (start + k) % n;
    if (flags[i] === want && k < n) {
      if (!cur) {
        cur = [ring[(i - 1 + n) % n]!];
        out.push(cur);
      }
      cur.push(ring[i]!);
    } else if (cur) {
      cur.push(ring[i]!);
      cur = null;
    }
  }
  return out;
}

// ------------------------------------------------------------------------
// 로런츠 변환
// ------------------------------------------------------------------------

/** x 방향 속도 β 로 움직이는 틀에서 본 사건. */
export function boost(e: Event3, beta: number): Event3 {
  const g = 1 / Math.sqrt(1 - beta * beta);
  return { x: g * (e.x - beta * e.ct), y: e.y, ct: g * (e.ct - beta * e.x) };
}

/** 틀을 0 에서 β 까지 바꾸는 동안 사건이 지나간 길(쌍곡선)의 투영. */
export function slidePath(e: Event3, beta: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i <= SLIDE_SAMPLES; i++) out.push(project(boost(e, (beta * i) / SLIDE_SAMPLES)));
  return out;
}

// ------------------------------------------------------------------------
// 시간표 읽기
// ------------------------------------------------------------------------

/** 지금 틀의 속도. 단계 진행도로 0 → β → 0 (이징은 선언이 정한다). */
export function frameBeta(tl: TimelineFrame, c: LightConeConstants): number {
  return c.beta * (tl.at('boost') - tl.at('unboost'));
}

/** 「지금」 단면의 높이(E 의 틀). 퍼짐 단계 동안 0 → 원뿔 높이. */
export function sliceHeight(tl: TimelineFrame, height: number): number {
  return height * tl.at('spread');
}

/** 사건 하나의 지금 모습. */
export interface EventReading {
  /** E 의 틀에서의 자리. */
  rest: Event3;
  /** 지금 틀에서의 자리. */
  now: Event3;
  /** 원뿔 안인가 — √(x² + y²) < ct. 틀과 무관하다. */
  inside: boolean;
  /** 단면이 이 사건의 높이를 지났는가(일어났는가). */
  happened: boolean;
  /** 일어난 뒤 흐른 ct. 일어나지 않았으면 음수. */
  since: number;
  /** E 에서 이 사건으로 가는 신호가 지금 간 몫 0~1 (안쪽 사건만 뜻이 있다). */
  signal: number;
}

export function readEvents(tl: TimelineFrame, c: LightConeConstants, height: number): EventReading[] {
  const tau = sliceHeight(tl, height);
  const beta = frameBeta(tl, c);
  // 퍼짐이 끝났으면 원뿔 높이 위의 사건까지 모두 일어난 것으로 본다.
  const done = tl.at('spread') >= 1;
  return c.events.map((e) => {
    const since = done ? Math.max(tau - e.ct, 0) : tau - e.ct;
    return {
      rest: e,
      now: boost(e, beta),
      inside: Math.hypot(e.x, e.y) < e.ct,
      happened: since >= 0,
      since,
      signal: done ? 1 : Math.max(0, Math.min(1, tau / e.ct)),
    };
  });
}

/** 이번 주기의 표지(신호선 · 판정 이름표)의 짙기. 마지막 단계에서 지운다. */
export function markOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: LightConeState }): LightConeState {
  return params.state;
}
