// ========================================================================
// de-broglie-wavelength — 순수 물리
// ========================================================================
// λ = h/p = (h/m)/v. 같은 입자라 h/m 은 두 전자가 같고, 파장은 속력에 반비례한다.
//
// 아래 전자는 `accelerate` 단계 동안 고르게 밀린다(등가속). 시간표가 그 단계를
// `linear` 로 선언했으므로 진행도가 곧 「더해진 속력의 비율」 이고, 지나온 거리는
// 진행도의 제곱으로 닫힌 식이 된다 — 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { H_OVER_M, SPEED_RATIO, TRACK_FLOW, V_SLOW } from './schema';
import type { DeBroglieWavelengthState } from './state';

export interface DeBroglieConstants {
  /** 두 전자의 처음 속력. */
  vSlow: number;
  /** 아래 전자가 다 빨라졌을 때의 배수(정수). */
  speedRatio: number;
  /** h/m 을 그림 단위로 키운 값 — 속력 1 일 때의 파장. */
  hOverM: number;
  /** 속력 1 당 눈금이 흐르는 빠르기(월드/초). */
  trackFlow: number;
}

export function readConstants(stage: StageDef): DeBroglieConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    vSlow: c.vSlow ?? V_SLOW,
    speedRatio: c.speedRatio ?? SPEED_RATIO,
    hOverM: c.hOverM ?? H_OVER_M,
    trackFlow: c.trackFlow ?? TRACK_FLOW,
  };
}

/** 물질파의 파장. 속력에 반비례한다. */
export function wavelength(speed: number, c: DeBroglieConstants): number {
  return c.hOverM / speed;
}

export interface ElectronReading {
  /** 지금 속력. */
  speed: number;
  /** 이번 주기에 지나온 거리(속력 단위 × 초). 눈금이 흐른 양이다. */
  travelled: number;
  /**
   * 속력이 정박값에 있는가 — `'start'` 는 처음 속력, `'end'` 는 다 빨라진 속력,
   * `null` 은 빨라지는 중. 기호(`v` · `2v` · `λ` · `λ/2`)를 붙일 조건이다 — 바뀌는
   * 중인 물결에 `λ/2` 가 붙어 있으면 화면과 어긋난다.
   */
  settled: 'start' | 'end' | null;
}

/** 위 전자 — 끝까지 처음 속력이다. */
export function readReference(tl: TimelineFrame, c: DeBroglieConstants): ElectronReading {
  return { speed: c.vSlow, travelled: c.vSlow * tl.u, settled: 'start' };
}

/**
 * 아래 전자. **단계 경계는 선언이 정한다** — 빨라지기 시작하는 시각도, 그 길이도
 * 시간표에게 묻는다 (S-piece 「시간표는 선언이다」).
 */
export function readAccelerated(tl: TimelineFrame, c: DeBroglieConstants): ElectronReading {
  const gain = c.vSlow * (c.speedRatio - 1);
  const k = tl.at('accelerate');
  const d = tl.duration('accelerate');
  // 등가속: 더해진 속력 = gain·k, 더해진 거리 = gain·d·k²/2 (빨라지는 동안)
  // + gain·(다 빨라진 뒤 흐른 시간).
  const extra = gain * (0.5 * d * k * k + Math.max(0, tl.u - tl.end('accelerate')));
  return {
    speed: c.vSlow + gain * k,
    travelled: c.vSlow * tl.u + extra,
    settled: k <= 0 ? 'start' : k >= 1 ? 'end' : null,
  };
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 지우고 처음 속력으로 되돌린다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: DeBroglieWavelengthState }): DeBroglieWavelengthState {
  return params.state;
}
