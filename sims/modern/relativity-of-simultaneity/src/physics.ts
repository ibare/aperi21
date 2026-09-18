// ========================================================================
// relativity-of-simultaneity — 순수 물리
// ========================================================================
// 번쩍임 사건을 두 틀의 원점(x = 0, t = 0)으로 잡는다. 빛의 빠르기 c 는 화면 배율
// (`lightSpeed`, 월드/초)이고 기차는 v = β · c 로 달린다. 감지기 안쪽 면은 기차 안에서
// 등으로부터 a = 고유 길이 / 2 − 안쪽 들임 만큼 떨어져 있다.
//
//   기차 틀     기차는 서 있다. 빛 앞머리 ±c·t. 두 감지기에 t′ = a / c 에 함께 닿는다.
//   선로 틀     기차 가운데 v·t, 감지기 v·t ± a/γ. 빛 앞머리는 선로 위 번쩍인 자리에서 ±c·t.
//               뒤 끝 t_r = (a/γ) / (c + v)   앞 끝 t_f = (a/γ) / (c − v)
//
// t_r · t_f 는 기차 틀 도착 사건 (±a, a/c) 의 로런츠 변환 γ(t′ ± v·x′/c²) 과 같다.
//
// 두 판의 시각은 `travel` 시작에서 재고 `travel` 끝에서 멈춘다 — 뒤로는 멈춘 화면이다.
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { BETA, DETECTOR_INSET, LIGHT_SPEED, PROPER_LENGTH, SLEEPER_SPACING } from './schema';
import type { RelativityOfSimultaneityState } from './state';

export interface SimultaneityConstants {
  /** v/c. */
  beta: number;
  /** 기차의 고유 길이(월드). */
  properLength: number;
  /** 화면의 빛 빠르기(월드/초). */
  lightSpeed: number;
  /** 끝 벽에서 감지기 안쪽 면까지(월드, 고유). */
  detectorInset: number;
  /** 침목 간격(월드, 선로에서 잰 길이). */
  sleeperSpacing: number;
}

export function readConstants(stage: StageDef): SimultaneityConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    beta: c.beta ?? BETA,
    properLength: c.properLength ?? PROPER_LENGTH,
    lightSpeed: c.lightSpeed ?? LIGHT_SPEED,
    detectorInset: c.detectorInset ?? DETECTOR_INSET,
    sleeperSpacing: c.sleeperSpacing ?? SLEEPER_SPACING,
  };
}

/** 로런츠 인자. 화면에 띄우지 않는다 — 선로 판의 기차 길이 · 기차 판의 침목 간격에만 쓴다. */
export function lorentzGamma(beta: number): number {
  return 1 / Math.sqrt(1 - beta * beta);
}

/** 한 판(한 틀)에서 본 기차와 빛. 가로는 그 틀의 좌표, 원점은 번쩍인 자리. */
export interface PanelFrame {
  /** 이 틀의 시각(초). 번쩍이기 전은 음수. `travel` 끝에서 멈춘다. */
  t: number;
  /**
   * 멈추지 않는 시각(초) — 번쩍임 · 도착 섬광의 나이만 이것으로 센다. 멈춘 화면에서
   * 섬광 고리가 얼어붙어 남지 않게 한다.
   */
  clock: number;
  /** 기차 가운데(등)의 자리. */
  trainX: number;
  /** 기차 반 길이(이 틀에서 잰). */
  halfLength: number;
  /** 뒤 · 앞 감지기 안쪽 면의 자리. */
  rearFaceX: number;
  frontFaceX: number;
  /** 뒤 · 앞 감지기에 빛이 닿는 이 틀의 시각. */
  rearArrival: number;
  frontArrival: number;
  /** 선로 침목의 가로 밀림(이 틀에서). 침목 k 는 `sleeperShift + k · sleeperSpacing`. */
  sleeperShift: number;
  /** 이 틀에서 잰 침목 간격. */
  sleeperSpacing: number;
}

export interface SimultaneityFrame {
  /** 기차 안에서 본 것. */
  train: PanelFrame;
  /** 선로에서 본 것. */
  ground: PanelFrame;
  /** 빛 빠르기(월드/초) — 빛 앞머리는 두 판 모두 ±c·t. */
  c: number;
}

/**
 * 두 판의 시각 — `travel` 시작에서 재고 `travel` 끝에서 멈춘다. 번쩍임이 두 틀의
 * 원점이라 두 판이 같은 수를 시각으로 쓴다(각자 제 틀의 시각이다).
 */
export function panelTime(tl: TimelineFrame): number {
  return Math.min(tl.u - tl.start('travel'), tl.duration('travel'));
}

export function simultaneityFrame(tl: TimelineFrame, k: SimultaneityConstants): SimultaneityFrame {
  const t = panelTime(tl);
  const clock = tl.u - tl.start('travel');
  const c = k.lightSpeed;
  const v = k.beta * c;
  const gamma = lorentzGamma(k.beta);
  const a = k.properLength / 2 - k.detectorInset;

  // 기차 틀 — 기차가 서 있고 선로가 −v 로 흐른다. 선로 길이는 1/γ 로 줄어 보인다.
  const trainArrival = a / c;
  const train: PanelFrame = {
    t,
    clock,
    trainX: 0,
    halfLength: k.properLength / 2,
    rearFaceX: -a,
    frontFaceX: a,
    rearArrival: trainArrival,
    frontArrival: trainArrival,
    sleeperShift: -v * t,
    sleeperSpacing: k.sleeperSpacing / gamma,
  };

  // 선로 틀 — 선로가 서 있고 기차가 +v 로 달린다. 기차 길이는 1/γ 로 줄어 보인다.
  const trainX = v * t;
  const aG = a / gamma;
  const ground: PanelFrame = {
    t,
    clock,
    trainX,
    halfLength: k.properLength / 2 / gamma,
    rearFaceX: trainX - aG,
    frontFaceX: trainX + aG,
    rearArrival: aG / (c + v),
    frontArrival: aG / (c - v),
    sleeperShift: 0,
    sleeperSpacing: k.sleeperSpacing,
  };

  return { train, ground, c };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: RelativityOfSimultaneityState }): RelativityOfSimultaneityState {
  return params.state;
}
