// ========================================================================
// atmospheric-pressure — 순수 물리
// ========================================================================
// 높이 y 에서 공기가 누르는 압력은 **그 위에 있는 공기 전부의 무게**다. 같은 온도의
// 공기는 눌린 만큼 빽빽해지므로 머리 위 공기의 몫은
//   p(y) / p₀ = exp(−y / H)
// 이다. 이 조각이 보이는 것은 식의 모양이 아니라 「압력 = 위에 남은 공기의 몫」 이다.
//
// 알갱이 하나가 같은 양의 공기다. 그래서 알갱이의 높이를 **층화 분위수**로 뽑는다 —
// i 번째 알갱이는 누적 몫 (i + ½)/N 에 해당하는 높이에 선다. 그러면 어느 높이 위의
// 알갱이 수 비가 곧 그 높이의 압력 비다(정상 위 알갱이가 정확히 절반).
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  DOT_COUNT,
  DOT_JIGGLE,
  DOT_JIGGLE_SPEED,
  DOT_SPAN_X,
  SCALE_HEIGHT,
  SUMMIT_FRACTION,
} from './schema';
import type { AtmosphericPressureState } from './state';

export interface AtmosphericPressureConstants {
  /** 척도 높이 H(km). */
  scaleHeight: number;
  /** 정상에서 머리 위에 남는 공기의 몫(0~1). */
  summitFraction: number;
}

export function readConstants(stage: StageDef): AtmosphericPressureConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    scaleHeight: c.scaleHeight ?? SCALE_HEIGHT,
    summitFraction: c.summitFraction ?? SUMMIT_FRACTION,
  };
}

/** 높이 y(km) 위에 남은 공기의 몫 = 그 높이의 압력 / 땅의 압력. */
export function airAbove(y: number, c: AtmosphericPressureConstants): number {
  return Math.exp(-Math.max(0, y) / c.scaleHeight);
}

/** 머리 위 공기가 `summitFraction` 만큼 남는 높이(km) — 정상의 높이다. */
export function summitHeight(c: AtmosphericPressureConstants): number {
  return -c.scaleHeight * Math.log(c.summitFraction);
}

/** 황금비 수열 — 알갱이 가로 자리를 고르게 흩는다. 난수가 아니라 같은 화면이 늘 같다. */
const GOLDEN = 0.6180339887498949;

/**
 * 알갱이의 제자리(일렁이기 전). i 번째 알갱이의 높이는 누적 몫 (i + ½)/N 에 서므로
 * 어느 높이 위의 알갱이 수가 그 높이의 압력에 비례한다.
 */
export function dotHome(i: number, c: AtmosphericPressureConstants): Vec2 {
  const q = (i + 0.5) / DOT_COUNT;
  const y = -c.scaleHeight * Math.log(1 - q);
  const x = DOT_SPAN_X[0] + ((i * GOLDEN) % 1) * (DOT_SPAN_X[1] - DOT_SPAN_X[0]);
  return [x, y];
}

/**
 * 시각 t 의 알갱이 자리. 제자리 둘레를 작게 일렁인다 — 공기가 멈춰 있지 않다는 표시다.
 * 위상은 알갱이 번호에서 뽑아 같은 시각이 늘 같은 화면이다.
 */
export function dotAt(i: number, t: number, c: AtmosphericPressureConstants): Vec2 {
  const [x, y] = dotHome(i, c);
  const a = i * 2.399963;
  const w = DOT_JIGGLE_SPEED * (0.7 + ((i * 0.37) % 0.6));
  return [x + DOT_JIGGLE * Math.sin(w * t + a), Math.max(0.05, y + DOT_JIGGLE * Math.cos(w * 0.83 * t + a * 1.7))];
}

export interface ClimberReading {
  /** 센서 밑면의 높이(km). */
  height: number;
  /** 그 높이의 압력 / 땅의 압력 = 머리 위 공기의 몫. */
  pressureRatio: number;
  /** 기슭을 떠났는가 — 산 아래 화살표를 잔상으로 남길 조건이다. */
  leftGround: boolean;
}

/**
 * 센서를 읽는다. **단계 경계는 선언이 정한다** — 오르는 진행도를 `timeline.at('climb')`
 * 에게 묻는다. 산 아래 · 정상 단계에서는 진행도가 0 · 1 에 머물러 높이가 저절로 그대로다.
 */
export function readClimber(tl: TimelineFrame, c: AtmosphericPressureConstants): ClimberReading {
  const s = tl.at('climb');
  const height = s * summitHeight(c);
  return { height, pressureRatio: airAbove(height, c), leftGround: s > 0 };
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 지우고 기슭에서 다시 시작한다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: AtmosphericPressureState }): AtmosphericPressureState {
  return params.state;
}
