// ========================================================================
// surface-tension — 순수 물리
// ========================================================================
// 2차원 메니스커스(바늘 축 방향으로 균일한 단면)의 닫힌 해를 쓴다. 먼 곳에서 평평한
// 수면이 기울기 ψ 인 자리에서는
//   깊이  z(ψ) = −2·lc·sin(ψ/2)
//   가로  x(ψ) = lc·[G(φ) − G(ψ)],   G(ψ) = 2·cos(ψ/2) + ln tan(ψ/4)
// 이다(φ 는 바늘에 닿는 자리의 기울기, x 는 그 자리에서 바깥으로 잰 거리). 막은 양쪽에서
// 기울기 φ 로 바늘을 당기므로 떠받치는 힘은 2γ·sin φ 이고, 누르는 힘 F 와 같아지는
// 기울기에서 멈춘다: sin φ = F / 2γ. φ = 90° 가 받칠 수 있는 끝이다.
//
// 바늘은 물이 젖지 않는다고 본다(접촉각 180°) — 수면이 바늘 둘레에 접선으로 붙는다.
// 접촉각이 무엇을 바꾸는지는 `wetting-and-contact-angle` 의 몫이다. 파인 물의 부력도
// 빼고 막의 당김만 본다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  CAP_LENGTH,
  DROP_HEIGHT,
  NEEDLE_RADIUS,
  SINK_DEPTH,
  TENSION,
  WEIGHT,
} from './schema';
import type { SurfaceTensionState } from './state';

export interface SurfaceTensionConstants {
  /** 표면 장력 γ(단위 길이당). */
  tension: number;
  /** 바늘 무게(단위 길이당). */
  weight: number;
  /** 모세관 길이 lc. */
  capLength: number;
  /** 바늘 단면 반지름. */
  needleRadius: number;
  /** 내려놓기 시작할 때 바늘 밑면의 높이. */
  dropHeight: number;
  /** 뚫린 뒤 바늘 중심이 가라앉는 깊이. */
  sinkDepth: number;
}

export function readConstants(stage: StageDef): SurfaceTensionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    tension: c.tension ?? TENSION,
    weight: c.weight ?? WEIGHT,
    capLength: c.capLength ?? CAP_LENGTH,
    needleRadius: c.needleRadius ?? NEEDLE_RADIUS,
    dropHeight: c.dropHeight ?? DROP_HEIGHT,
    sinkDepth: c.sinkDepth ?? SINK_DEPTH,
  };
}

/** 한 시각의 장면 — 바늘 · 막 · 누르는 힘. */
export interface NeedleReading {
  /** 바늘 중심. */
  center: Vec2;
  /** 막이 바늘에 닿는 자리의 기울기(라디안). 0 이면 수면이 평평하다. */
  phi: number;
  /** 누르는 힘 F(무게 + 위에서 더 누르는 힘). γ 단위. */
  load: number;
  /** 막이 뚫렸는가. 뚫린 뒤로는 막이 당기지 않고 수면이 평평하다. */
  broken: boolean;
  /**
   * 누르는 힘 F 의 불투명도. 바늘이 수면에 닿아 받쳐지는 동안 나타나고, 뚫리면 사라진다 —
   * 받치는 것이 없어 견줄 상대가 사라졌다.
   */
  loadOpacity: number;
  /** 그림 전체의 불투명도 — 주기 끝에서 흐려진다. */
  alpha: number;
}

/** 막이 기울기 φ 로 닿을 때 바늘 중심 높이. 닿는 자리 깊이 + 그 자리에서 중심까지. */
function restingCenterY(phi: number, c: SurfaceTensionConstants): number {
  return -2 * c.capLength * Math.sin(phi / 2) + c.needleRadius * Math.cos(phi);
}

/**
 * 장면을 읽는다. **단계 경계는 선언이 정한다** — 모든 값을 `timeline.at(id)` 의 합성으로
 * 만들어 분기가 없다(`at` 은 그 단계 전 0 · 동안 0~1 · 뒤 1). 저작자가 단계 길이를 바꾸면
 * 물리가 그대로 따라간다.
 */
export function readNeedle(tl: TimelineFrame, c: SurfaceTensionConstants): NeedleReading {
  // 누르는 힘 — 무게에서 출발해 누름 단계 동안 받칠 수 있는 끝(2γ)까지 오른다.
  const maxLoad = 2 * c.tension;
  const load = c.weight + (maxLoad - c.weight) * tl.at('press');

  // 막의 기울기 — 받쳐지는 동안 0 에서 평형각으로 자라고, 그 뒤로는 평형각 sin φ = F/2γ.
  const phiEq = Math.asin(Math.min(1, load / maxLoad));
  const phi = phiEq * tl.at('settle');

  // 뚫림은 선언된 단계가 시작하는 시각에 온다 — 그때 막이 곧추서 있다(`limit`).
  const broken = tl.u >= tl.start('sink');

  const rest = restingCenterY(phi, c);
  const fall = c.dropHeight * (1 - tl.at('drop'));
  const floatY = rest + fall;
  // 뚫린 뒤: 곧추선 자리에서 가라앉는 깊이까지.
  const limitY = restingCenterY(Math.PI / 2, c);
  const sinkY = limitY + (-c.sinkDepth - limitY) * tl.at('sink');
  const centerY = broken ? sinkY : floatY;

  return {
    center: [0, centerY],
    phi,
    load,
    broken,
    loadOpacity: broken ? 0 : tl.at('settle'),
    alpha: 1 - tl.at('fade'),
  };
}

function g(psi: number): number {
  return 2 * Math.cos(psi / 2) + Math.log(Math.tan(psi / 4));
}

/**
 * 한쪽 수면의 점들 — 바깥 끝(`reach` 거리)에서 바늘에 닿는 자리까지 순서대로.
 * `side` 는 −1(왼쪽) · +1(오른쪽). 기울기를 등비로 나눠 표본해 닿는 자리 근처가 촘촘하다.
 */
export function meniscus(
  center: Vec2,
  phi: number,
  side: -1 | 1,
  reach: number,
  c: SurfaceTensionConstants,
): Vec2[] {
  const contactX = center[0] + side * c.needleRadius * Math.sin(phi);
  const contactY = -2 * c.capLength * Math.sin(phi / 2);
  const edgeX = center[0] + side * reach;
  // 평평한 수면 — 닫힌 해의 로그가 φ = 0 에서 발산하므로 따로 둔다.
  if (phi < 1e-4) return [[edgeX, 0], [contactX, 0]];
  const out: Vec2[] = [];
  const samples = 48;
  const psiMin = phi * 1e-4;
  const gPhi = g(phi);
  let first = true;
  for (let i = 0; i <= samples; i++) {
    // i = 0 이 가장 바깥(ψ 최소), i = samples 가 닿는 자리(ψ = φ).
    const psi = psiMin * Math.pow(phi / psiMin, i / samples);
    const x = contactX + side * c.capLength * (gPhi - g(psi));
    if (side * (x - edgeX) > 0) continue;
    const y = -2 * c.capLength * Math.sin(psi / 2);
    if (first) {
      out.push([edgeX, y]);
      first = false;
    }
    out.push([x, y]);
  }
  out[out.length - 1] = [contactX, contactY];
  return out;
}

/** 바늘 밑을 감싸는 호 — 왼쪽 닿는 자리에서 오른쪽 닿는 자리까지. */
export function wettedArc(center: Vec2, phi: number, r: number): Vec2[] {
  const out: Vec2[] = [];
  const n = 24;
  for (let i = 0; i <= n; i++) {
    const th = -phi + (2 * phi * i) / n;
    out.push([center[0] + r * Math.sin(th), center[1] - r * Math.cos(th)]);
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: SurfaceTensionState }): SurfaceTensionState {
  return params.state;
}
