// ========================================================================
// laplace-pressure — 순수 물리
// ========================================================================
// 거품은 반지름 a 인 관 입 위에 얹힌 구면 캡이다. 캡 높이를 h 라 하면
//   곡률 반지름  R(h) = (a² + h²) / (2h)
//   부피        V(h) = π·h·(3a² + h²) / 6
// 이고, 비누막은 겉 · 속 두 면이라 안팎 압력차가 Δp = 4γ/R 이다. h = a 가 반구이며
// R 이 가장 작다(= a) — 그래서 작은 거품은 반구까지는 쪼그라들수록 더 세게 밀고, 반구를
// 지나면 막이 펴지며 R 이 다시 커진다.
//
// 관 속 공기는 압력차에 비례해 흐른다: dV작/dt = −k·(Δp작 − Δp큰), 두 거품의 부피 합은
// 그대로다(공기의 압축은 뺀다 — Δp 는 대기압에 비해 아주 작다). 두 막의 R 이 같아지면
// 멈춘다. 그때 작은 쪽은 반구보다 낮은 얕은 캡이다.
//
// 흐름 단계 안에서 흐른 초만으로 결과가 정해지므로, 매 프레임 그 초까지 고정 걸음으로
// 처음부터 적분한다 — 같은 시각은 언제나 같은 화면이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { CONDUCTANCE, LARGE_RADIUS, MOUTH_RADIUS, SMALL_RADIUS, TENSION } from './schema';
import type { LaplacePressureState } from './state';

export interface LaplacePressureConstants {
  /** 표면 장력 γ. */
  tension: number;
  /** 관 입 반지름 a. */
  mouthRadius: number;
  /** 처음 작은 거품의 반지름(≥ a). */
  smallRadius: number;
  /** 처음 큰 거품의 반지름(≥ a). */
  largeRadius: number;
  /** 관의 전도도 k. */
  conductance: number;
}

export function readConstants(stage: StageDef): LaplacePressureConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    tension: c.tension ?? TENSION,
    mouthRadius: c.mouthRadius ?? MOUTH_RADIUS,
    smallRadius: c.smallRadius ?? SMALL_RADIUS,
    largeRadius: c.largeRadius ?? LARGE_RADIUS,
    conductance: c.conductance ?? CONDUCTANCE,
  };
}

/** 캡의 곡률 반지름. */
export function capRadius(h: number, a: number): number {
  return (a * a + h * h) / (2 * h);
}

/** 캡의 부피. */
export function capVolume(h: number, a: number): number {
  return (Math.PI * h * (3 * a * a + h * h)) / 6;
}

/** 반구보다 큰 거품의 캡 높이(반지름 R 에서). */
function tallCapHeight(r: number, a: number): number {
  return r + Math.sqrt(Math.max(0, r * r - a * a));
}

/** 부피에서 캡 높이 — V(h) 는 h 에 대해 단조 증가다. 뉴턴 걸음, `guess` 에서 출발. */
function heightOfVolume(v: number, a: number, guess: number): number {
  let h = Math.max(1e-4, guess);
  for (let i = 0; i < 8; i++) {
    const dv = (Math.PI * (a * a + h * h)) / 2;
    h = Math.max(1e-4, h - (capVolume(h, a) - v) / dv);
  }
  return h;
}

/** 적분 걸음(초). 끝무렵 얕은 캡이 가장 빠르게 변하는 자리에서도 안정한 크기. */
const DT = 1 / 240;

/** 한 시각의 두 거품. */
export interface BubblePair {
  /** 작은 거품 · 큰 거품의 캡 높이. */
  hSmall: number;
  hLarge: number;
  /** 두 막의 곡률 반지름. */
  rSmall: number;
  rLarge: number;
  /** 두 거품 안의 압력(대기압 위로 더한 몫, 4γ/R). */
  pSmall: number;
  pLarge: number;
  /** 작은 거품 → 큰 거품으로 옮기는 부피 빠르기(부피/초). 밸브가 닫혀 있으면 0. */
  flowRate: number;
  /** 밸브가 열린 정도 0~1. */
  valveOpen: number;
  /** 그림 전체의 불투명도 — 주기 끝에서 흐려진다. */
  alpha: number;
}

/**
 * 장면을 읽는다. **단계 경계는 선언이 정한다** — 밸브는 `at('open')`, 흐른 시간은
 * `at('flow') × duration('flow')`(선형 단계)라 분기가 없다. 저작자가 흐름 단계를 늘리면
 * 같은 물리가 더 오래 보인다.
 */
export function readBubbles(tl: TimelineFrame, c: LaplacePressureConstants): BubblePair {
  const a = c.mouthRadius;
  let hS = tallCapHeight(Math.max(a, c.smallRadius), a);
  let hL = tallCapHeight(Math.max(a, c.largeRadius), a);
  const total = capVolume(hS, a) + capVolume(hL, a);

  const pressure = (h: number): number => (4 * c.tension) / capRadius(h, a);

  const elapsed = tl.at('flow') * tl.duration('flow');
  const steps = Math.ceil(elapsed / DT - 1e-9);
  for (let i = 0; i < steps; i++) {
    const dt = Math.min(DT, elapsed - i * DT);
    const q = c.conductance * (pressure(hS) - pressure(hL));
    const vS = Math.max(1e-6, capVolume(hS, a) - q * dt);
    hS = heightOfVolume(vS, a, hS);
    hL = heightOfVolume(total - vS, a, hL);
  }

  const valveOpen = tl.at('open');
  const pS = pressure(hS);
  const pL = pressure(hL);
  // 흐름 단계 안에서만 흐른다. 열리는 동안은 밸브가 반쯤 가려 흐름을 열린 만큼 줄인다.
  const flowing = tl.at('flow') < 1 ? valveOpen : 0;
  return {
    hSmall: hS,
    hLarge: hL,
    rSmall: capRadius(hS, a),
    rLarge: capRadius(hL, a),
    pSmall: pS,
    pLarge: pL,
    flowRate: Math.max(0, c.conductance * (pS - pL)) * flowing,
    valveOpen,
    alpha: 1 - tl.at('fade'),
  };
}

/**
 * 거품 막의 점들 — 관 입 왼쪽 끝에서 위로 돌아 오른쪽 끝까지. 입은 (cx ± a, 0).
 * 캡 중심은 입 아래 (R − h) 자리다.
 */
export function capArc(cx: number, h: number, a: number, samples = 64): [number, number][] {
  const r = capRadius(h, a);
  const cy = h - r;
  // 입 끝이 중심에서 이루는 각(오른쪽 끝). 왼쪽 끝은 π − 그 각.
  const right = Math.atan2(-cy, a);
  const left = Math.PI - right;
  const out: [number, number][] = [];
  for (let i = 0; i <= samples; i++) {
    const th = left + ((right - left) * i) / samples;
    out.push([cx + r * Math.cos(th), cy + r * Math.sin(th)]);
  }
  out[0] = [cx - a, 0];
  out[samples] = [cx + a, 0];
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: LaplacePressureState }): LaplacePressureState {
  return params.state;
}
