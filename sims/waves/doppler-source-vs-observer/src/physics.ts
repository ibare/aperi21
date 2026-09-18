// ========================================================================
// doppler-source-vs-observer — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 것이 시간표 시각의 함수이고 `step` 은 항등이다.
//
// 한 칸의 이야기는 셋이다.
//
//   파면 k    τ_k = k·T 에 그때의 음원 자리 c_k 에서 나와 반지름 V·(τ − τ_k) 로 퍼진다
//   만남      파면 k 의 앞 끝 c_k + V·(τa − τ_k) 이 관찰자 자리 x_o(τa) 에 닿는 τa
//   간격      이웃한 두 파면의 앞 끝 사이 — 음원이 움직이면 (V − u)·T, 아니면 V·T
//
// 두 칸이 다른 것은 **누가 움직이느냐** 하나뿐이다. 음원이 움직이면 c_k 가 바뀌고,
// 관찰자가 움직이면 x_o 가 바뀐다. 같은 식이 두 칸을 모두 푼다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  FRONT_FADE_TAIL,
  FRONT_REACH,
  MEET_LIFE,
  MOVER_SPEED,
  OBSERVER_START_X,
  SCREEN_PERIOD,
  SCREEN_WAVE_SPEED,
  SOUND_SPEED,
  SOURCE_FREQ,
  SOURCE_START_X,
  STRIP_X0,
  STRIP_X1,
} from './schema';
import type { DopplerSourceVsObserverState } from './state';

/** 스테이지 상수. 비면 모듈 기본값으로 되돌린다. */
export interface DopplerConstants {
  soundSpeed: number;
  moverSpeed: number;
  sourceFreq: number;
  screenWaveSpeed: number;
  screenPeriod: number;
  sourceStartX: number;
  observerStartX: number;
}

export function readConstants(stage: StageDef): DopplerConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    soundSpeed: c.soundSpeed ?? SOUND_SPEED,
    moverSpeed: c.moverSpeed ?? MOVER_SPEED,
    sourceFreq: c.sourceFreq ?? SOURCE_FREQ,
    screenWaveSpeed: c.screenWaveSpeed ?? SCREEN_WAVE_SPEED,
    screenPeriod: c.screenPeriod ?? SCREEN_PERIOD,
    sourceStartX: c.sourceStartX ?? SOURCE_START_X,
    observerStartX: c.observerStartX ?? OBSERVER_START_X,
  };
}

/** 누가 움직이는가. 칸 하나가 하나를 고른다. */
export type Mover = 'source' | 'observer';

/** 파면 하나 — 중심 x(축 위) · 반지름 · 옅어짐. */
export interface FrontReading {
  cx: number;
  r: number;
  opacity: number;
}

export interface LaneReading {
  mover: Mover;
  sourceX: number;
  observerX: number;
  /** 지금 움직이는 중인가 — 속도 화살표를 걸지. */
  moving: boolean;
  fronts: FrontReading[];
  /** 관찰자가 지금 막 만난 파면들의 나이(초). 만남 고리가 번진다. */
  meetAges: number[];
  /** 시간창 안에서 만난 파면의 눈금 자리(월드 x). */
  ticks: number[];
  /** 지금 시각 표지 자리(월드 x). 시간창 밖이면 없다. */
  cursorX: number | null;
  /** 멈춰 세운 장면에서 잴 두 파면의 앞 끝(월드 x). 재지 않을 때는 없다. */
  gap: readonly [number, number] | null;
}

export interface Reading {
  top: LaneReading;
  bottom: LaneReading;
  /** 장면 전체의 옅어짐(1 이면 또렷하다). */
  opacity: number;
}

function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}

/** 움직임 구간 [τ0, τ1] 에서만 빠르기 v 로 옮겨 가는 자리. */
function travel(x0: number, v: number, tau: number, tau0: number, tau1: number): number {
  return x0 + v * (clamp(tau, tau0, tau1) - tau0);
}

/**
 * 파면(τ_k 에 c 에서 나옴)의 앞 끝이 관찰자에게 닿는 시각.
 *
 * 관찰자 자리는 조각별 1차 — 움직임 전 `xo` 고정, 움직이는 동안 속도 `-w`,
 * 뒤에는 멈춘 자리. 구간마다 풀고 그 구간 안에 드는 첫 해를 쓴다. 앞 끝이
 * 관찰자보다 늘 뒤에서 오므로(c < 관찰자) 해는 하나다.
 */
function arrival(c: number, tk: number, V: number, xo: number, w: number, tau0: number, tau1: number): number {
  // 움직임 전
  const pre = tk + (xo - c) / V;
  if (pre <= tau0) return pre;
  // 움직이는 동안: c + V(τ − τk) = xo − w(τ − τ0)
  const mid = (xo - c + V * tk + w * tau0) / (V + w);
  if (mid <= tau1) return Math.max(mid, tk);
  // 멈춘 뒤
  const xe = xo - w * (tau1 - tau0);
  return tk + (xe - c) / V;
}

/**
 * 시간표 시각 → 두 칸의 화면 값. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두지 않는다 — `start` · `end` · `at` 으로 선언을 읽는다.
 * 움직임은 `approach` 가 시작할 때 출발해 `count` 가 끝날 때 멈춘다. 그 뒤(`hold` ·
 * `fade`)는 멈춰 세운 장면이다 — 시계를 `count` 의 끝에 묶는다.
 */
export function derive(tl: TimelineFrame, c: DopplerConstants): Reading {
  const V = c.screenWaveSpeed;
  const T = c.screenPeriod;
  const w = V * (c.moverSpeed / c.soundSpeed);

  const tau0 = tl.start('approach');
  const tauC = tl.start('count');
  const tau1 = tl.end('count');
  const frozen = tl.u > tau1;
  const tau = Math.min(tl.u, tau1);
  const measuring = tl.at('count') >= 1;
  const life = FRONT_REACH / V;

  const lane = (mover: Mover): LaneReading => {
    const sourceAt = (t: number): number =>
      mover === 'source' ? travel(c.sourceStartX, w, t, tau0, tau1) : c.sourceStartX;
    const observerAt = (t: number): number =>
      mover === 'observer' ? travel(c.observerStartX, -w, t, tau0, tau1) : c.observerStartX;
    const ow = mover === 'observer' ? w : 0;

    const sourceX = sourceAt(tau);
    const observerX = observerAt(tau);

    // 주기 시작 전은 「멈춰 있던 영원한 과거」 다 — 음원은 제자리에서 계속 냈다.
    const kMin = Math.ceil((tau - life) / T);
    const kMax = Math.floor(tau / T);

    const fronts: FrontReading[] = [];
    const lead: { k: number; x: number }[] = [];
    for (let k = kMin; k <= kMax; k++) {
      const tk = k * T;
      const cx = sourceAt(tk);
      const r = V * (tau - tk);
      fronts.push({ cx, r, opacity: clamp((FRONT_REACH - r) / FRONT_FADE_TAIL, 0, 1) });
      lead.push({ k, x: cx + r });
    }

    // 만남 — 시간창보다 넉넉히 앞선 파면부터 훑는다.
    const ticks: number[] = [];
    const meetAges: number[] = [];
    const kFrom = Math.floor((tauC - 2 * life) / T);
    for (let k = kFrom; k <= kMax; k++) {
      const tk = k * T;
      const ta = arrival(sourceAt(tk), tk, V, c.observerStartX, ow, tau0, tau1);
      if (ta > tau) continue;
      if (ta >= tauC && ta <= tau1) {
        ticks.push(STRIP_X0 + ((ta - tauC) / (tau1 - tauC)) * (STRIP_X1 - STRIP_X0));
      }
      if (!frozen && tau - ta <= MEET_LIFE) meetAges.push(tau - ta);
    }

    const cursorX =
      tau >= tauC && !frozen ? STRIP_X0 + ((tau - tauC) / (tau1 - tauC)) * (STRIP_X1 - STRIP_X0) : null;

    // 멈춰 세운 장면에서 잰다 — 음원과 관찰자 사이에 든 앞 끝 중 관찰자에 가장
    // 가까운 이웃 두 개. 이웃(k, k+1)이어야 그 사이가 한 파장이다.
    let gap: readonly [number, number] | null = null;
    if (measuring) {
      const inside = lead.filter((f) => f.x > sourceX && f.x < observerX);
      // `lead` 는 k 가 오르는 순 — 오래된 것(앞 끝이 관찰자에 가까운 것)이 먼저다.
      for (let i = 1; i < inside.length && !gap; i++) {
        const a = inside[i - 1]!;
        const b = inside[i]!;
        if (b.k === a.k + 1) gap = [b.x, a.x];
      }
    }

    return {
      mover,
      sourceX,
      observerX,
      moving: tl.u >= tau0 && !frozen,
      fronts,
      meetAges,
      ticks,
      cursorX,
      gap,
    };
  };

  return {
    top: lane('source'),
    bottom: lane('observer'),
    opacity: tl.at('appear') * (1 - tl.at('fade')),
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: DopplerSourceVsObserverState }): DopplerSourceVsObserverState {
  return params.state;
}
