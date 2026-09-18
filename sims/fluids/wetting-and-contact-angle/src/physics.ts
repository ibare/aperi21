// ========================================================================
// wetting-and-contact-angle — 순수 물리
// ========================================================================
// 물방울 가장자리(세 상이 만나는 점)에서 가로 몫의 균형 — 영의 식:
//   γ_고체·공기 = γ_고체·물 + γ_물·공기 · cos θ
// 이 맞는 θ 가 접촉각이다. 고체 쪽 두 장력이 바뀌면 θ 가 바뀐다. 맞지 않는 동안의
// 가로 차이(알짜 힘)
//   F = γ_고체·공기 − γ_고체·물 − γ_물·공기 · cos θ
// 가 가장자리를 바깥(+) · 안(−)으로 민다.
//
// 방울 단면은 중력을 뺀 2차원 원형 캡이다. 넓이 A 와 접촉각 θ 에서
//   R = √(A / (θ − sin θ cos θ)),  밑 반폭 b = R sin θ,  원 중심 높이 −R cos θ.
// θ 가 90° 를 넘으면 원 중심이 고체 면 위로 올라가 방울이 밑보다 불룩해진다.
//
// 뭉침 · 퍼짐 동안 θ 는 시간표 진행도로 두 평형각 사이를 옮긴다(준정적). 그 사이의 알짜
// 힘은 위 식으로 매 순간 계산한다 — 멈출 각에 다가갈수록 0 으로 잦아든다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  DROP_AREA,
  GLASS_SOLID_AIR,
  GLASS_SOLID_LIQUID,
  LIQUID_TENSION,
  WAX_SOLID_AIR,
  WAX_SOLID_LIQUID,
} from './schema';
import type { WettingAndContactAngleState } from './state';

export interface WettingConstants {
  /** 물·공기 표면 장력. */
  liquidTension: number;
  /** 깨끗한 유리의 고체·공기 · 고체·물 장력. */
  glassSolidAir: number;
  glassSolidLiquid: number;
  /** 왁스의 고체·공기 · 고체·물 장력. */
  waxSolidAir: number;
  waxSolidLiquid: number;
  /** 방울 단면 넓이. */
  dropArea: number;
}

export function readConstants(stage: StageDef): WettingConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    liquidTension: c.liquidTension ?? LIQUID_TENSION,
    glassSolidAir: c.glassSolidAir ?? GLASS_SOLID_AIR,
    glassSolidLiquid: c.glassSolidLiquid ?? GLASS_SOLID_LIQUID,
    waxSolidAir: c.waxSolidAir ?? WAX_SOLID_AIR,
    waxSolidLiquid: c.waxSolidLiquid ?? WAX_SOLID_LIQUID,
    dropArea: c.dropArea ?? DROP_AREA,
  };
}

/**
 * 평형 접촉각. 영의 식을 θ 로 푼다. 고체·공기 쪽이 너무 세면(cos θ > 1) 방울이 끝없이
 * 퍼지고(완전 젖음), 너무 약하면(cos θ < −1) 공처럼 떨어진다 — 그림이 서도록 양 끝을 조금
 * 안쪽에서 자른다.
 */
export function equilibriumAngle(solidAir: number, solidLiquid: number, liquid: number): number {
  const cos = (solidAir - solidLiquid) / liquid;
  const ANGLE_MIN = 0.12;
  const ANGLE_MAX = Math.PI - 0.12;
  return Math.min(ANGLE_MAX, Math.max(ANGLE_MIN, Math.acos(Math.max(-1, Math.min(1, cos)))));
}

/** 한 시각의 가장자리 — 장력 셋 · 접촉각 · 알짜 힘 · 표면. */
export interface EdgeReading {
  /** 고체·공기 장력(바깥으로). */
  solidAir: number;
  /** 고체·물 장력(안으로). */
  solidLiquid: number;
  /** 물·공기 장력(물 표면을 따라). */
  liquid: number;
  /** 지금 접촉각(라디안, 물 쪽에서 잰다). */
  theta: number;
  /** 가로 알짜 힘. + 는 바깥, − 는 안. 평형이면 0. */
  net: number;
  /** 표면이 왁스인 정도 0~1 — 0 은 깨끗한 유리, 1 은 왁스. */
  wax: number;
}

const lerp = (a: number, b: number, s: number): number => a + (b - a) * s;

/**
 * 가장자리를 읽는다. **단계 경계는 선언이 정한다** — 모든 값을 `timeline.at(id)` 의 합성으로
 * 만들어 분기가 없다(`at` 은 그 단계 전 0 · 동안 0~1 · 뒤 1). 저작자가 단계 길이를 바꾸면
 * 물리가 그대로 따라간다.
 */
export function readEdge(tl: TimelineFrame, c: WettingConstants): EdgeReading {
  // 표면 — 왁스로 바뀌었다가(coat) 다시 유리로(strip).
  const wax = tl.at('coat') * (1 - tl.at('strip'));
  const solidAir = lerp(c.glassSolidAir, c.waxSolidAir, wax);
  const solidLiquid = lerp(c.glassSolidLiquid, c.waxSolidLiquid, wax);

  // 모양 — 뭉침(bead) 동안 유리 평형각에서 왁스 평형각으로, 퍼짐(spread-out) 동안 되돌아간다.
  const thetaGlass = equilibriumAngle(c.glassSolidAir, c.glassSolidLiquid, c.liquidTension);
  const thetaWax = equilibriumAngle(c.waxSolidAir, c.waxSolidLiquid, c.liquidTension);
  const shape = tl.at('bead') * (1 - tl.at('spread-out'));
  const theta = lerp(thetaGlass, thetaWax, shape);

  const net = solidAir - solidLiquid - c.liquidTension * Math.cos(theta);
  return { solidAir, solidLiquid, liquid: c.liquidTension, theta, net, wax };
}

/** 원형 캡의 기하. */
export interface Cap {
  /** 원 반지름. */
  radius: number;
  /** 밑(고체와 닿는 폭)의 반. 가장자리는 (±halfBase, 0). */
  halfBase: number;
  /** 원 중심 높이(고체 면 기준). */
  centerY: number;
}

export function capOf(theta: number, area: number): Cap {
  const radius = Math.sqrt(area / (theta - Math.sin(theta) * Math.cos(theta)));
  return { radius, halfBase: radius * Math.sin(theta), centerY: -radius * Math.cos(theta) };
}

/** 방울 표면(물·공기) — 왼쪽 가장자리에서 꼭대기를 지나 오른쪽 가장자리까지. */
export function capOutline(cap: Cap, theta: number, samples = 72): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i <= samples; i++) {
    const phi = -theta + (2 * theta * i) / samples;
    out.push([cap.radius * Math.sin(phi), cap.centerY + cap.radius * Math.cos(phi)]);
  }
  // 가장자리는 정확히 고체 면 위에 둔다 — 표본 끝의 반올림 잡음이 면 아래로 새지 않게.
  out[0] = [-cap.halfBase, 0];
  out[samples] = [cap.halfBase, 0];
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: WettingAndContactAngleState }): WettingAndContactAngleState {
  return params.state;
}
