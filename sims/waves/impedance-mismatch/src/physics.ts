// ========================================================================
// impedance-mismatch — 순수 물리
// ========================================================================
// 가벼운 줄(Z1, x < J)과 이어 붙인 줄(Z2, x > J)이 이음매 x = J 에서 만난다.
// 들어오는 펄스 f(x − c) 는 이음매에서 둘로 나뉜다.
//
//   가벼운 쪽:  y(x) = f(x − c) + r · f(2J − x − c)          r = (Z1 − Z2)/(Z1 + Z2)
//   이은 쪽:    y(x) = t · f(J + ρ(x − J) − c)                t = 2Z1/(Z1 + Z2),  ρ = Z2/Z1
//
// 줄의 장력은 이음매 양쪽이 같으므로 빠르기는 Z 에 반비례한다 — 이은 줄에서 펄스는 ρ 배
// 느리게, ρ 배 좁게 간다(위 식의 ρ(x − J)). x = J 에서 두 식이 같다(1 + r = t).
//
// 펄스는 주기마다 하나씩 들어온다. 앞 주기의 펄스가 건너간 몫은 느린 줄 위를 계속 가므로,
// 펄스 여럿을 더한다 — 주기 이음매에서 건너간 펄스가 사라지며 튀지 않는다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  JUNCTION_X,
  PULSE_AMPLITUDE,
  PULSE_ENTRY,
  PULSE_WIDTH,
  RATIO_BOTTOM,
  RATIO_MIDDLE,
  RATIO_TOP,
  TAIL_LENGTH,
  WAVE_SPEED,
} from './schema';
import type { ImpedanceMismatchState } from './state';

export interface ImpedanceConstants {
  /** 가벼운 줄 위 빠르기(월드/초). */
  waveSpeed: number;
  /** 펄스 높이(월드). */
  amplitude: number;
  /** 펄스 폭(월드). */
  pulseWidth: number;
  /** 펄스가 줄 밖에서 들어오는 거리(월드). */
  entry: number;
  /** 이음매 자리(월드 x). */
  junctionX: number;
  /** 이어 붙인 줄의 길이(월드). */
  tailLength: number;
  /** 세 줄의 Z2/Z1 — 위 · 가운데 · 아래. */
  ratios: readonly [number, number, number];
}

export function readConstants(stage: StageDef): ImpedanceConstants {
  const c = stage.constants ?? {};
  return {
    waveSpeed: c.waveSpeed ?? WAVE_SPEED,
    amplitude: c.amplitude ?? PULSE_AMPLITUDE,
    pulseWidth: c.pulseWidth ?? PULSE_WIDTH,
    entry: c.entry ?? PULSE_ENTRY,
    junctionX: c.junctionX ?? JUNCTION_X,
    tailLength: c.tailLength ?? TAIL_LENGTH,
    ratios: [c.ratioTop ?? RATIO_TOP, c.ratioMiddle ?? RATIO_MIDDLE, c.ratioBottom ?? RATIO_BOTTOM],
  };
}

/** 반사 진폭 비 r = (Z1 − Z2)/(Z1 + Z2). ρ = Z2/Z1. 무거운 줄(ρ > 1)이면 음수 — 뒤집힌다. */
export function reflectionRatio(rho: number): number {
  return (1 - rho) / (1 + rho);
}

/** 투과 진폭 비 t = 2Z1/(Z1 + Z2) = 1 + r. */
export function transmissionRatio(rho: number): number {
  return 2 / (1 + rho);
}

/** 지금 주기 펄스의 중심(펼친 좌표) — 시각에 비례한다. 단계는 펄스를 움직이지 않는다. */
export function pulseCenter(tl: TimelineFrame, c: ImpedanceConstants): number {
  return -c.entry + c.waveSpeed * tl.u;
}

/** 한 주기 동안 펄스가 가는 거리 — 앞 주기 펄스와의 간격. */
export function pulseSpacing(tl: TimelineFrame, c: ImpedanceConstants): number {
  return c.waveSpeed * tl.period;
}

/**
 * 앞 주기 펄스를 몇 개까지 더할지. 가장 느린 줄에서 건너간 몫이 줄 오른쪽 끝을 벗어날 때까지다.
 * 선언된 상수에서만 나온다 — 상태를 따라가지 않는다.
 */
export function pastPulseCount(spacing: number, c: ImpedanceConstants): number {
  const slowest = Math.max(1, ...c.ratios);
  const reach = c.junctionX + slowest * (c.tailLength + c.entry) + c.entry;
  return Math.ceil(reach / spacing);
}

/** 가우스 꼴 펄스 하나. d 는 펄스 중심에서의 거리. */
function pulse(d: number, c: ImpedanceConstants): number {
  const q = d / c.pulseWidth;
  return c.amplitude * Math.exp(-q * q);
}

/**
 * 줄 위 x 의 변위. 지금 펄스(중심 s)와 앞 주기 펄스들(s + k·spacing)을 더한다.
 * 가벼운 쪽은 들어가는 펄스 + 되돌아온 몫, 이은 쪽은 건너간 몫.
 */
export function displacement(
  x: number,
  rho: number,
  s: number,
  spacing: number,
  count: number,
  c: ImpedanceConstants,
): number {
  const J = c.junctionX;
  const r = reflectionRatio(rho);
  const t = transmissionRatio(rho);
  let y = 0;
  for (let k = 0; k <= count; k++) {
    const center = s + k * spacing;
    if (x <= J) y += pulse(x - center, c) + r * pulse(2 * J - x - center, c);
    else y += t * pulse(J + rho * (x - J) - center, c);
  }
  return y;
}

/**
 * 「전부 되돌아왔다면」 의 윤곽 — |r| = 1 인 반사 몫. 무거운 줄이면 뒤집힌 쪽(고정단),
 * 가벼운 줄이면 그대로인 쪽(자유단)이다. 같은 줄이면 무거운 쪽 기준으로 둔다.
 */
export function fullReturn(x: number, rho: number, s: number, c: ImpedanceConstants): number {
  const sign = rho < 1 ? 1 : -1;
  return sign * pulse(2 * c.junctionX - x - s, c);
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ImpedanceMismatchState }): ImpedanceMismatchState {
  return params.state;
}
