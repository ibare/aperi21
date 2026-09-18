// ========================================================================
// supernova-and-neutron-star — 순수 물리
// ========================================================================
// 장난감 모형이다. 모든 것이 조각 시계의 함수라 쌓는 상태가 없다.
//
// - 무너짐: 받침을 잃은 핵은 자유낙하처럼 **점점 빨라지며** 줄어든다 —
//   반지름 = R_ns + (R_c − R_ns)(1 − (s/T)²), T 는 무너짐 단계 길이.
// - 둘레 물질: 덩이마다 자유낙하 시간이 반지름^1.5 에 비례한다(케플러 꼴). 핵 바로
//   바깥은 핵과 함께 쏟아지고, 먼 덩이는 아직 무슨 일이 났는지 모른 채 거의 제자리다.
// - 튕김: 핵이 중성자별 크기에 닿는 순간 단단해져 더 줄지 않는다. 그 겉면에서 충격파가
//   생겨 바깥으로 번지고, 충격파에 닿은 덩이는 떨어지다 말고 **밖으로** 밀려 나간다.
//
// 뉴트리노가 멈춘 충격파를 되살리는 과정 · 되떨어지는 물질은 두지 않았다 (NOTES (b)).
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  CORE_DIAMETER_KM,
  LAYOUT,
  NS_DIAMETER_KM,
  NS_ENLARGE,
  NS_MASS_SOLAR,
  PARCEL_COUNT,
  PARCEL_SEED,
} from './schema';
import type { SupernovaAndNeutronStarState } from './state';

export interface SupernovaConstants {
  coreDiameterKm: number;
  nsDiameterKm: number;
  nsMassSolar: number;
  nsEnlarge: number;
  parcelCount: number;
  parcelSeed: number;
}

/** 스테이지 상수를 읽는다. 선언이 이기고, 없으면 기본값. */
export function readConstants(stage: StageDef): SupernovaConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    coreDiameterKm: c.coreDiameterKm ?? CORE_DIAMETER_KM,
    nsDiameterKm: c.nsDiameterKm ?? NS_DIAMETER_KM,
    nsMassSolar: c.nsMassSolar ?? NS_MASS_SOLAR,
    nsEnlarge: c.nsEnlarge ?? NS_ENLARGE,
    parcelCount: c.parcelCount ?? PARCEL_COUNT,
    parcelSeed: c.parcelSeed ?? PARCEL_SEED,
  };
}

/**
 * 화면에 그리는 중성자별의 반지름(월드). 축척대로 줄인 크기(철 핵 반지름 × 지름 비)에
 * 과장 배율을 곱한다 — 배율은 선언값이고 화면 이름표가 그것을 밝힌다.
 */
export function nsDrawRadius(c: SupernovaConstants): number {
  return LAYOUT.coreRadius * (c.nsDiameterKm / c.coreDiameterKm) * c.nsEnlarge;
}

/** 무너짐이 시작된 뒤 흐른 조각 시계(초). 그 전에는 0. 경계는 시간표가 안다. */
function sinceCollapse(tl: TimelineFrame): number {
  return Math.max(0, tl.u - tl.start('collapse'));
}

/** 지금 핵의 반지름(월드). 무너짐 동안 점점 빨라지며 줄고, 중성자별 크기에서 멈춘다. */
export function coreRadius(tl: TimelineFrame, c: SupernovaConstants): number {
  const rNs = nsDrawRadius(c);
  const x = sinceCollapse(tl) / tl.duration('collapse');
  if (x >= 1) return rNs;
  return rNs + (LAYOUT.coreRadius - rNs) * (1 - x * x);
}

/** 충격파의 반지름(월드). 튕김이 시작되기 전에는 없다. */
export function shockRadius(tl: TimelineFrame, c: SupernovaConstants): number | null {
  const bounce = tl.at('bounce');
  if (bounce <= 0) return null;
  const rNs = nsDrawRadius(c);
  return (
    rNs +
    (LAYOUT.shockBounceRadius - rNs) * bounce +
    (LAYOUT.shockOutRadius - LAYOUT.shockBounceRadius) * tl.at('blast')
  );
}

/**
 * 충격파가 번지는 속력(월드 / 조각 시계 초). 두 단계가 `linear` 라 진행도의 기울기가
 * 단계 안에서 한 값이다. 덩이 꼬리의 길이에만 쓴다.
 */
function shockSpeed(tl: TimelineFrame, c: SupernovaConstants): number {
  if (tl.phase === 'bounce') {
    return (LAYOUT.shockBounceRadius - nsDrawRadius(c)) / tl.duration('bounce');
  }
  if (tl.phase === 'blast') {
    return (LAYOUT.shockOutRadius - LAYOUT.shockBounceRadius) / tl.duration('blast');
  }
  return 0;
}

// ------------------------------------------------------------------------
// 둘레 물질 — 시드 난수로 흩뿌린 덩이
// ------------------------------------------------------------------------

export interface Parcel {
  /** 처음 반지름(월드). */
  r0: number;
  /** 핵 중심에서 본 방향(라디안). */
  angle: number;
  /** 충격파 뒤 껍질 안의 자리 — 충격파 반지름에 곱한다. */
  behind: number;
}

/** 시드를 받는 결정적 난수(mulberry32). `Math.random` 을 쓰지 않는다 (S-sim). */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 1831565813) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 핵 겉면 바로 바깥부터 화면 모서리 너머까지 흩뿌린다. 반지름을 로그로 고르게 뽑아 넓이당
 * 밀도가 1/r² 로 준다 — 별의 물질은 중심 쪽이 빽빽하고, 핵과 함께 쏟아지는 안쪽 층이
 * 넉넉해야 「쏟아져 들어온다」 가 보인다. 넓이에 고르게 뿌렸더니 핵 둘레 덩이가 열 남짓이었다.
 */
export function parcels(c: SupernovaConstants): Parcel[] {
  const rand = seededRandom(c.parcelSeed);
  const inner = LAYOUT.coreRadius;
  const outer = LAYOUT.fieldRadius;
  const out: Parcel[] = [];
  for (let i = 0; i < c.parcelCount; i++) {
    const r0 = inner * Math.pow(outer / inner, rand());
    const angle = rand() * Math.PI * 2;
    const behind = LAYOUT.shellBehindMin + rand() * (1 - LAYOUT.shellBehindMin);
    out.push({ r0, angle, behind });
  }
  return out;
}

export interface ParcelReading {
  pos: Vec2;
  /** 속도(월드 / **화면** 초) — 꼬리 길이용. 늦춘 단계에서는 재생 속도를 곱해 둔다. */
  vel: Vec2;
}

/**
 * 덩이 하나의 지금 자리 · 속도.
 *
 * 떨어지는 자리와 충격파가 밀어낸 자리 중 **바깥 쪽**이 이긴다 — 충격파가 오기 전에는
 * 떨어지고, 충격파 뒤 껍질이 닿으면 그 순간부터 밖으로 나간다. 두 자리가 만나는 곳에서
 * 바뀌므로 덩이가 튀지 않는다.
 */
export function parcelAt(p: Parcel, tl: TimelineFrame, c: SupernovaConstants): ParcelReading {
  const rNs = nsDrawRadius(c);
  const s = sinceCollapse(tl);
  // 자유낙하 시간 ∝ r^1.5 — 핵 겉면의 덩이가 핵과 같은 때에 중성자별 겉면에 닿는다.
  const tff = tl.duration('collapse') * Math.pow(p.r0 / LAYOUT.coreRadius, 1.5);
  const x = s / tff;
  let r = x >= 1 ? rNs : rNs + (p.r0 - rNs) * (1 - x * x);
  let vr = x >= 1 ? 0 : (-(p.r0 - rNs) * 2 * x) / tff;

  const rs = shockRadius(tl, c);
  if (rs !== null && rs * p.behind > r) {
    r = rs * p.behind;
    vr = shockSpeed(tl, c) * p.behind;
  }

  const cx = Math.cos(p.angle);
  const cy = Math.sin(p.angle);
  const v = vr * tl.timeScale;
  return {
    pos: [LAYOUT.center[0] + r * cx, LAYOUT.center[1] + r * cy],
    vel: [v * cx, v * cy],
  };
}

/** 한 주기의 처음에 핵과 둘레 물질이 나타난 정도 0~1. */
export function appearProgress(tl: TimelineFrame): number {
  return tl.at('appear');
}

/** 남은 중성자별의 이름표가 나타난 정도 0~1. */
export function revealProgress(tl: TimelineFrame): number {
  return tl.at('reveal');
}

/** 남은 중성자별 · 이름표가 흐려지고 남은 정도 0~1. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: SupernovaAndNeutronStarState }): SupernovaAndNeutronStarState {
  return params.state;
}
