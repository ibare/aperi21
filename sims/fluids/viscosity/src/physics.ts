// ========================================================================
// viscosity — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표의 함수이고, `step` 은 항등이다.
//
// 두 판 사이 흐름(쿠에트 흐름)이 자리를 잡은 뒤의 모습을 쓴다.
//
//   u(y) = U · y / h          층 빠르기는 높이에 비례한다 — 점성과 무관하다
//   τ    = η · U / h          층 사이 마찰(단위 넓이당)은 어느 층 사이에서나 같다
//   F    = τ · A              윗판을 끄는 힘은 그 마찰과 같다 — 점성에 비례한다
//
// 판이 막 움직이기 시작한 순간의 전이는 두지 않는다. 자리 잡는 시간 h²ρ/η 는 끈적할수록
// **짧아서**, 넣으면 「끈적한 쪽이 먼저 따라온다」 는 둘째 주장이 된다 (NOTES (b)).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  FORCE_SCALE,
  GAP,
  LAYER_COUNT,
  PLATE_SPEED,
  VISCOSITY_RATIO,
  VISCOSITY_THIN,
} from './schema';
import type { ViscosityState } from './state';

export interface ViscosityConstants {
  plateSpeed: number;
  viscosityThin: number;
  /** 끈적한 쪽 ÷ 묽은 쪽 — 선언값. */
  viscosityRatio: number;
  /** 끈적한 쪽 점성 = 묽은 쪽 × 비. */
  viscosityThick: number;
  layerCount: number;
  forceScale: number;
}

export function readConstants(stage: StageDef): ViscosityConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    plateSpeed: c.plateSpeed ?? PLATE_SPEED,
    viscosityThin: c.viscosityThin ?? VISCOSITY_THIN,
    viscosityRatio: c.viscosityRatio ?? VISCOSITY_RATIO,
    viscosityThick: (c.viscosityThin ?? VISCOSITY_THIN) * (c.viscosityRatio ?? VISCOSITY_RATIO),
    layerCount: Math.max(1, Math.round(c.layerCount ?? LAYER_COUNT)),
    forceScale: c.forceScale ?? FORCE_SCALE,
  };
}

/** 점성 비를 글자로 — 선언값 그대로. 유효숫자를 자동으로 줄이지 않는다 (S-piece). */
export function ratioText(c: ViscosityConstants): string {
  return String(c.viscosityRatio);
}

/** 층 i(0 이 맨 아래) 가운데 높이의 빠르기. u = U · y / h. */
export function layerSpeed(i: number, c: ViscosityConstants): number {
  return (c.plateSpeed * (i + 0.5)) / c.layerCount;
}

/** 윗판을 그 빠르기로 끄는 힘의 화살표 길이(월드). F ∝ η · U / h. */
export function forceLength(viscosity: number, c: ViscosityConstants): number {
  return (c.forceScale * viscosity * c.plateSpeed) / GAP;
}

export interface Reading {
  /** 윗판이 끌리기 시작한 뒤 흐른 시간(초). 서 있는 동안 0. */
  dragTime: number;
  /** 윗판이 끌리고 있는가 — 끄는 힘 화살표를 둘지. */
  pulling: boolean;
  /** 끈적한 쪽 화살표에 F 한 칸씩 눈금을 붙이는 단계인가. */
  comparing: boolean;
  /** 물러나며 옅어지는 정도(1 이면 또렷하다). */
  opacity: number;
}

/**
 * 시간표 → 화면에 놓을 값들. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두지 않는다 — 끌기가 시작한 시각은 `start('drag')`, 끝은
 * `end('fade')` 가 준다.
 */
export function derive(tl: TimelineFrame): Reading {
  const from = tl.start('drag');
  const to = tl.end('fade');
  const dragTime = Math.min(Math.max(tl.u - from, 0), to - from);
  return {
    dragTime,
    pulling: tl.u >= from,
    comparing: tl.at('compare') > 0,
    opacity: 1 - tl.at('fade'),
  };
}

/** 쌓는 상태가 없다 — 캡션에 끼울 글자 하나만 들고 있다. */
export function step(params: { state: ViscosityState }): ViscosityState {
  return params.state;
}
