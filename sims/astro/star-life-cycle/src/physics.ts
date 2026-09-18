// ========================================================================
// star-life-cycle — 순수 계산
// ========================================================================
// 두 별의 HR 도 경로 · 시간표 → 나이 · 흑체의 빛 색 · 별 반지름.
// DOM · 캔버스 · 테마 색을 모른다. 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { spectrumToLinearRgb, type LinearRgb } from '@aperi21/plugin-optics';
import {
  AGE_END,
  END_HEAVY,
  L_AXIS,
  MASS_HEAVY,
  MASS_LIGHT,
  MS_HEAVY,
  MS_LIGHT,
  NEBULA_NM,
  PLOT,
  RULER,
  SUN_TEMPERATURE_K,
  TIP_LIGHT,
  T_AXIS,
} from './schema';
import type { StarLifeCycleState } from './state';

// ------------------------------------------------------------------------
// 스테이지 상수
// ------------------------------------------------------------------------

export interface LifeConstants {
  /** 두 별의 질량(태양 질량). */
  massLight: number;
  massHeavy: number;
  /** 무거운 별의 주계열 수명 · 일생(년). */
  msHeavy: number;
  endHeavy: number;
  /** 가벼운 별의 주계열 수명 · 껍질을 벗기까지의 일생(년). */
  msLight: number;
  tipLight: number;
  /** 시간 자의 끝(년). */
  ageEnd: number;
  /** 태양의 유효 온도(K) — 반지름의 기준점. */
  sunTemperatureK: number;
  /** 행성상 성운 고리의 빛 파장(nm). */
  nebulaNm: number;
}

export function readConstants(stage: StageDef): LifeConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    massLight: c.massLight ?? MASS_LIGHT,
    massHeavy: c.massHeavy ?? MASS_HEAVY,
    msHeavy: c.msHeavy ?? MS_HEAVY,
    endHeavy: c.endHeavy ?? END_HEAVY,
    msLight: c.msLight ?? MS_LIGHT,
    tipLight: c.tipLight ?? TIP_LIGHT,
    ageEnd: c.ageEnd ?? AGE_END,
    sunTemperatureK: c.sunTemperatureK ?? SUN_TEMPERATURE_K,
    nebulaNm: c.nebulaNm ?? NEBULA_NM,
  };
}

// ------------------------------------------------------------------------
// 좌표 — 설계 px(y 아래) → 월드(y 위)
// ------------------------------------------------------------------------

/** log10 온도 → 설계 x. */
export function sx(lt: number): number {
  return PLOT.left + ((T_AXIS.left - lt) / (T_AXIS.left - T_AXIS.right)) * (PLOT.right - PLOT.left);
}

/** log10 광도 → 설계 y. */
export function sy(ll: number): number {
  return PLOT.top + ((L_AXIS.top - ll) / (L_AXIS.top - L_AXIS.bottom)) * (PLOT.bottom - PLOT.top);
}

/** 설계 좌표 → 월드. */
export function at(x: number, y: number): Vec2 {
  return [x, -y];
}

/** HR 도 위 한 점(log T, log L) → 월드. */
export function hr(p: HrPoint): Vec2 {
  return at(sx(p[0]), sy(p[1]));
}

/** 나이(년) → 시간 자 위 설계 x. 선형 — 1000만 년과 120억 년의 비가 길이로 그대로 보인다. */
export function rulerX(age: number, c: LifeConstants): number {
  const f = Math.max(0, Math.min(1, age / c.ageEnd));
  return RULER.left + f * (RULER.right - RULER.left);
}

// ------------------------------------------------------------------------
// 경로 — 단계마다 걷는 HR 도 위 꺾은선. 모양은 진화 계산 결과를 손으로 옮긴 근사다.
// ------------------------------------------------------------------------

/** (log10 T, log10 L) */
export type HrPoint = readonly [number, number];

export interface TrackLeg {
  /** 이 구간을 걷는 시간표 단계 id. 경계는 `timeline` 이 안다 (S-piece). */
  phase: string;
  /** 앞 구간 끝에서 이어지는 꺾은선 점들. */
  points: readonly HrPoint[];
}

export interface Track {
  /** 영년 주계열(태어난 자리). */
  start: HrPoint;
  legs: readonly TrackLeg[];
}

/**
 * 태양의 20 배 — 주계열에서 조금 밝아지며 식다가, 광도를 거의 그대로 둔 채 오른쪽으로
 * 건너 붉은 초거성이 된다. 끝(초신성)은 경로가 아니라 scene 이 사라짐으로 보인다.
 */
export const HEAVY_TRACK: Track = {
  start: [4.54, 4.62],
  legs: [
    { phase: 'both-ms', points: [[4.47, 4.92]] },
    { phase: 'heavy-cross', points: [[4.2, 5.0], [3.85, 5.04], [3.62, 5.07]] },
    { phase: 'heavy-rsg', points: [[3.56, 5.15]] },
  ],
};

/**
 * 태양 정도 — 주계열에서 조금 밝아진 뒤 준거성 → 붉은 거성 가지를 오른쪽 위로 오르고
 * (헬륨 핵 연소 · 점근 거성 가지는 한 줄로 합쳤다, NOTES (b)), 껍질을 벗으며 광도를 그대로 둔 채
 * 왼쪽으로 건너 뜨거운 중심이 드러난 뒤, 백색 왜성 냉각선(반지름 일정)을 따라 오른쪽 아래로 식는다.
 */
export const LIGHT_TRACK: Track = {
  start: [3.755, -0.15],
  legs: [
    { phase: 'light-ms', points: [[3.765, 0.3]] },
    {
      phase: 'light-giant',
      points: [[3.7, 0.4], [3.66, 1.0], [3.6, 2.2], [3.53, 3.35], [3.5, 3.6]],
    },
    { phase: 'light-shed', points: [[3.9, 3.62], [4.5, 3.6], [5.0, 3.5], [5.15, 3.3]] },
    { phase: 'light-cool', points: [[5.1, 1.6], [4.6, -0.4], [4.1, -2.4]] },
  ],
};

/** 주계열 띠(0.2 ~ 40 태양 질량의 영년 주계열 근사). */
export const MAIN_SEQUENCE: readonly HrPoint[] = [
  [3.5, -2.4],
  [3.56, -1.5],
  [3.62, -0.9],
  [3.7, -0.4],
  [3.76, 0],
  [3.85, 0.6],
  [3.97, 1.3],
  [4.1, 1.9],
  [4.26, 2.8],
  [4.4, 3.6],
  [4.54, 4.62],
  [4.64, 5.3],
];

/** 설계 px 에서 잰 두 점 사이 길이 — 경로를 화면에서 고른 빠르기로 걷게 한다. */
function screenDist(a: HrPoint, b: HrPoint): number {
  return Math.hypot(sx(b[0]) - sx(a[0]), sy(b[1]) - sy(a[1]));
}

export interface TrackReading {
  /** 지금 자리. */
  now: HrPoint;
  /** 태어난 자리부터 지금까지 지나온 꺾은선. */
  trail: HrPoint[];
}

/**
 * 시간표로 경로를 읽는다. 구간마다 그 단계의 진행도(`at`)만큼 화면 길이를 따라 걷는다.
 * 단계 전이면 앞 구간 끝에 머물고, 단계 뒤면 끝까지 간 것이다.
 */
export function readTrack(track: Track, tl: TimelineFrame): TrackReading {
  const trail: HrPoint[] = [track.start];
  let cur: HrPoint = track.start;
  for (const leg of track.legs) {
    const p = tl.at(leg.phase);
    if (p <= 0) break;
    const pts = [cur, ...leg.points];
    let total = 0;
    for (let i = 1; i < pts.length; i++) total += screenDist(pts[i - 1]!, pts[i]!);
    let left = total * Math.min(1, p);
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1]!;
      const b = pts[i]!;
      const d = screenDist(a, b);
      if (left >= d) {
        trail.push(b);
        cur = b;
        left -= d;
        continue;
      }
      const s = d > 0 ? left / d : 1;
      cur = [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
      trail.push(cur);
      left = 0;
      break;
    }
    if (p < 1) break;
  }
  return { now: cur, trail };
}

// ------------------------------------------------------------------------
// 시계 — 단계마다 지나는 나이 구간
// ------------------------------------------------------------------------

/** 나이 구간의 양 끝. 스테이지 상수 이름이거나 0. */
type AgeMark = keyof LifeConstants | 'zero';

/**
 * 단계 → 그 단계 동안 시계가 지나는 나이 구간. 무거운 별의 단계들은 1000만 년 안에서,
 * 가벼운 별의 단계들은 100억 년 너머까지 — 같은 화면 시간에 흐르는 나이가 천 배 다르다.
 * 초거성으로 건너는 동안 · 껍질을 벗는 동안은 실제로 수만 년이라 시계를 세운다.
 */
const AGE_LEGS: readonly { phase: string; from: AgeMark; to: AgeMark }[] = [
  { phase: 'both-ms', from: 'zero', to: 'msHeavy' },
  { phase: 'heavy-cross', from: 'msHeavy', to: 'msHeavy' },
  { phase: 'heavy-rsg', from: 'msHeavy', to: 'endHeavy' },
  { phase: 'light-ms', from: 'endHeavy', to: 'msLight' },
  { phase: 'light-giant', from: 'msLight', to: 'tipLight' },
  { phase: 'light-shed', from: 'tipLight', to: 'tipLight' },
  { phase: 'light-cool', from: 'tipLight', to: 'ageEnd' },
];

function mark(m: AgeMark, c: LifeConstants): number {
  return m === 'zero' ? 0 : c[m];
}

/** 지금 나이(년). */
export function ageNow(tl: TimelineFrame, c: LifeConstants): number {
  let age = 0;
  for (const leg of AGE_LEGS) {
    const p = tl.at(leg.phase);
    if (p <= 0) break;
    const a = mark(leg.from, c);
    age = a + (mark(leg.to, c) - a) * p;
    if (p < 1) break;
  }
  return age;
}

// ------------------------------------------------------------------------
// 별의 모습 — 반지름 · 흑체색
// ------------------------------------------------------------------------

/** log10 반지름(태양 = 0). L = 4πR²σT⁴ 에서. 기준 온도는 스테이지 상수 `sunTemperatureK`. */
export function logRadius(p: HrPoint, sunTemperatureK: number): number {
  return 0.5 * p[1] - 2 * (p[0] - Math.log10(sunTemperatureK));
}

/** 플랑크 식의 둘째 복사 상수 hc/k (nm · K). */
const PLANCK_C2_NM_K = 1.4388e7;

/** 온도 T(K) 흑체의 파장 nm 복사 세기(상대값, 앞 상수는 뺐다). */
function planck(nm: number, T: number): number {
  return 1 / (Math.pow(nm, 5) * (Math.exp(PLANCK_C2_NM_K / (nm * T)) - 1));
}

/**
 * log10 온도 → 흑체의 빛 색(선형광). 플랑크 스펙트럼을 눈에 보이는 색으로 옮기고,
 * 가장 큰 성분이 1 이 되게 나눈다 — 밝기는 크기가 말하고 색은 온도만 말한다.
 * 색역 밖 음수 성분은 0 으로 자른다.
 */
export function blackbodyRgb(lt: number): LinearRgb {
  const T = Math.pow(10, lt);
  const v = spectrumToLinearRgb((nm) => planck(nm, T));
  const r = Math.max(0, v[0]);
  const g = Math.max(0, v[1]);
  const b = Math.max(0, v[2]);
  const m = Math.max(r, g, b) || 1;
  return [r / m, g / m, b / m];
}

// ------------------------------------------------------------------------
// step — 쌓을 것이 없다
// ------------------------------------------------------------------------

/** 모든 것이 시각의 함수라 항등이다 (S-sim 「상태가 시계뿐인 조각」). */
export function step(params: { state: StarLifeCycleState }): StarLifeCycleState {
  return params.state;
}
