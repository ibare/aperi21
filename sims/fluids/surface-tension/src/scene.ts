// ========================================================================
// surface-tension — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 물(region) · 수면 막
// (trajectory) · 바늘(body) · 힘(vector)이 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 물과 수면 막은 secondary(같은 물의 몸과 살갗), 막이 당기는
// 힘 T 와 그 위쪽 몫은 primary(같은 힘과 그 일부), **강조색은 「누르는 힘 F」 한
// 뜻에만**, 바늘은 먹색.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { meniscus, readConstants, readNeedle, wettedArc } from './physics';
import {
  FORCE_SCALE,
  SCENE_BOUNDS,
  WATER_BOTTOM,
  WATER_HALF_WIDTH,
  text,
} from './schema';
import type { SurfaceTensionState } from './state';

/** 물 면의 짙기. 잠긴 바늘이 비쳐 보여야 한다. */
const WATER_FILL = 0.3;
/** 수면 막 선 굵기(화면 px). 막이 이 조각의 주인공이라 궤적 기본보다 굵다. */
const FILM_WIDTH = 2.5;
/** 위쪽 몫 화살표의 굵기(화면 px). T 의 일부라 T 보다 가늘다. */
const PART_WIDTH = 1.5;
/** 막이 이만큼도 휘지 않았으면 T 를 그리지 않는다(라디안) — 닿는 순간의 수치 잡음. */
const PHI_VISIBLE = 0.01;

export function scene(params: {
  state: SurfaceTensionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('surface-tension: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const n = readNeedle(timeline, c);
  const alpha = n.alpha;
  const out: Primitive[] = [];
  const [cx, cy] = n.center;

  // ---- 바늘 ----
  // 가장 먼저 쓴다 — 뚫린 뒤 물이 그 위를 덮어 「잠겼다」 로 읽힌다 (`drawOrder: 'scene'`).
  out.push({
    type: 'body',
    id: 'needle',
    pos: n.center,
    shape: 'circle',
    size: c.needleRadius,
    outline: 'none',
    glow: false,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 물 ----
  // 뜬 동안 물의 윗변은 왼쪽 수면 → 바늘 밑을 감싸는 호 → 오른쪽 수면이다. 바늘을 비껴
  // 가므로 뜬 바늘은 물에 덮이지 않고, 뚫린 뒤에는 평평한 윗변이 바늘을 덮는다.
  const phi = n.broken ? 0 : n.phi;
  const left = meniscus(n.center, phi, -1, WATER_HALF_WIDTH, c);
  const right = meniscus(n.center, phi, 1, WATER_HALF_WIDTH, c).reverse();
  const floating = !n.broken && phi >= PHI_VISIBLE;
  const top: Vec2[] = floating
    ? [...left, ...wettedArc(n.center, phi, c.needleRadius).slice(1, -1), ...right]
    : [
        [cx - WATER_HALF_WIDTH, 0],
        [cx + WATER_HALF_WIDTH, 0],
      ];
  const water: Vec2[] = [
    [cx - WATER_HALF_WIDTH, WATER_BOTTOM],
    ...top,
    [cx + WATER_HALF_WIDTH, WATER_BOTTOM],
  ];
  out.push({
    type: 'region',
    id: 'water',
    points: water,
    fillOpacity: WATER_FILL,
    // 뚫린 뒤 수면을 일렁이게 하지 않는다 — `ripple` 은 물 면에만 걸리고 막 선(궤적)은 곧게
    // 남아 둘이 따로 논다 (NOTES 「어휘 부족」).
    opacity: alpha,
    style: { colorRole: 'secondary', emphasis: 'medium' },
  });

  // ---- 수면 막 ----
  // 공기와 닿은 수면만 막이다 — 바늘 밑을 감싸는 호는 막이 아니라 그리지 않는다.
  if (floating) {
    out.push(
      film('film-left', left, alpha),
      film('film-right', [...right].reverse(), alpha),
    );
  } else {
    out.push(film('film', top, alpha));
  }

  // ---- 막이 당기는 힘 T 와 그 위쪽 몫 ----
  // 양쪽 닿는 자리에서 수면을 따라 바깥 · 위로. **길이가 늘 같다** — 표면 장력의 크기는
  // 그대로이고, 휜 만큼 방향만 돈다. 이 조각이 보이는 것이 바로 그 돎이다.
  if (floating) {
    const len = c.tension * FORCE_SCALE;
    for (const side of [-1, 1] as const) {
      const from: Vec2 = [cx + side * c.needleRadius * Math.sin(phi), -2 * c.capLength * Math.sin(phi / 2)];
      out.push({
        type: 'vector',
        id: side < 0 ? 'tension-left' : 'tension-right',
        from,
        delta: [side * len * Math.cos(phi), len * Math.sin(phi)],
        label: text('label.tension'),
        // 이름표를 막 선의 반대쪽(공기 쪽 · 곧추서면 바늘 쪽)에 고정한다. 반대로 두거나 기본(auto)
        // 이면 곧추선 순간 T 가 막 선에 올라탄다.
        labelSide: side < 0 ? 'cw' : 'ccw',
        opacity: alpha,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
      // 위쪽 몫 — T 끝 바로 밑에서 끝까지 솟은 만큼. 닿는 자리에서 세우면 바늘을 뚫고
      // 지나가 읽히지 않는다.
      const tipX = from[0] + side * len * Math.cos(phi);
      out.push({
        type: 'vector',
        id: side < 0 ? 'lift-left' : 'lift-right',
        from: [tipX, from[1]],
        delta: [0, len * Math.sin(phi)],
        width: PART_WIDTH,
        opacity: alpha,
        style: { colorRole: 'primary', emphasis: 'medium', lineStyle: 'dashed' },
      });
    }
  }

  // ---- 누르는 힘 F ----
  // 위에서 바늘 꼭대기를 누른다. T 와 같은 배율이라 받쳐진 동안 **점선 둘을 이으면 이
  // 길이**다. 중심에서 아래로 그리면 곧추선 순간 물 밑 깊이 내려가 세로가 두 배로 든다 —
  // 바늘 위는 비어 있다. 누르는 물체(손가락 · 이쑤시개)는 두지 않는다 — 화살표와 한 줄에
  // 겹쳐 라이트 테마에서 F 가 묻혔다.
  const loadLen = n.load * FORCE_SCALE;
  if (n.loadOpacity > 0) out.push({
    type: 'vector',
    id: 'load',
    from: [cx, cy + c.needleRadius + loadLen],
    delta: [0, -loadLen],
    label: text('label.load'),
    labelSide: 'cw',
    outline: 'background',
    opacity: alpha * n.loadOpacity,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

function film(id: string, points: readonly Vec2[], alpha: number): Primitive {
  return {
    type: 'trajectory',
    id,
    points,
    width: FILM_WIDTH,
    opacity: alpha,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
