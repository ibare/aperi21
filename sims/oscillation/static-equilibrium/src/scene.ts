// ========================================================================
// static-equilibrium — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 처음 자리(`trajectory` 점선) · 돈 각(`sector`) · 작용선
// (`trajectory` 점선) · 막대(`body` rect + orientation) · 중심 표지(`trajectory` 열십자) ·
// 힘(`vector`) 이 모두 표준 어휘로 있다.
//
// 색: 막대 · 힘은 먹색(같은 막대, 같은 힘). 작용선 · 처음 자리 · 중심 표지는 무채색
// 안내선. 강조색은 **오른쪽 막대가 돈 각** 한 가지 뜻에만 쓴다 — 도느냐 마느냐가 주장이다.
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
import { derive, readConstants, type StaticEquilibriumConstants } from './physics';
import {
  ARROW_LEN,
  BAR_THICK,
  CROSS_ARM,
  LEFT_CENTER_X,
  LINE_OVERHANG,
  RIGHT_CENTER_X,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { StaticEquilibriumState } from './state';

interface BarSpec {
  id: 'left' | 'right';
  centerX: number;
  /** 막대가 돈 각(rad). */
  theta: number;
  /** 옮긴 힘의 자리 — 중심에서 막대를 따라(m). 0 이면 두 힘이 한 선 위. */
  shifted: number;
  /** 막대 · 돈 각의 불투명도. 오른쪽 막대만 주기마다 다시 놓이며 옅어진다. */
  barOpacity: number;
  /** 힘 · 작용선의 불투명도. */
  forceOpacity: number;
  /** 처음 자리 점선 · 돈 각을 그릴지. 돌지 않는 왼쪽 막대에는 그릴 것이 없다. */
  showTurn: boolean;
}

const along = (p: Vec2, u: Vec2, d: number): Vec2 => [p[0] + u[0] * d, p[1] + u[1] * d];

function bar(g: Primitive[], b: BarSpec, c: StaticEquilibriumConstants): void {
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;

  const half = c.barLength / 2;
  const center: Vec2 = [b.centerX, 0];
  /** 막대를 따라가는 단위 벡터와, 그 반시계 법선. 힘은 막대에 붙어 함께 돈다. */
  const u: Vec2 = [Math.cos(b.theta), Math.sin(b.theta)];
  const n: Vec2 = [-u[1], u[0]];

  if (b.showTurn) {
    // ---- 처음 자리 — 돈 각을 어디서부터 재는지 ----
    g.push({
      type: 'trajectory',
      id: `${b.id}-rest`,
      points: [
        [b.centerX - half, 0],
        [b.centerX + half, 0],
      ],
      width: 1,
      opacity: b.barOpacity * 0.8,
      style: { ...muted, lineStyle: 'dashed' },
    });
    // ---- 돈 각 — 막대 두 반쪽이 쓸고 간 자리. 강조색은 이 뜻에만 ----
    for (const [k, base] of [
      ['a', 0],
      ['b', Math.PI],
    ] as const) {
      g.push({
        type: 'sector',
        id: `${b.id}-swept-${k}`,
        center,
        radius: half,
        from: base,
        to: base + b.theta,
        fillOpacity: 0.18,
        rimWidth: 2,
        opacity: b.barOpacity,
        style: accent,
      });
    }
  }

  // ---- 두 힘의 자리 — 가운데 하나, 옮긴 하나 ----
  const pA = center;
  const pB = along(center, u, b.shifted);
  const reach = BAR_THICK / 2 + ARROW_LEN + LINE_OVERHANG;

  // ---- 작용선 — 두 힘이 한 선 위인지 어긋났는지 ----
  for (const [k, p] of [
    ['a', pA],
    ['b', pB],
  ] as const) {
    g.push({
      type: 'trajectory',
      id: `${b.id}-line-${k}`,
      points: [along(p, n, -reach), along(p, n, reach)],
      width: 1,
      opacity: b.forceOpacity * 0.9,
      style: { ...muted, lineStyle: 'dashed' },
    });
  }

  // ---- 막대 ----
  g.push({
    type: 'body',
    id: `${b.id}-bar`,
    pos: center,
    shape: 'rect',
    size: [c.barLength, BAR_THICK],
    orientation: b.theta,
    outline: 'none',
    opacity: b.barOpacity,
    style: ink,
  });

  // ---- 중심 표지 — 판에 고정된 열십자. 막대가 돌아도 중심은 여기 머문다. ----
  g.push({
    type: 'trajectory',
    id: `${b.id}-center-h`,
    points: [
      [b.centerX - CROSS_ARM, 0],
      [b.centerX + CROSS_ARM, 0],
    ],
    width: 1,
    style: muted,
  });
  g.push({
    type: 'trajectory',
    id: `${b.id}-center-v`,
    points: [
      [b.centerX, -CROSS_ARM],
      [b.centerX, CROSS_ARM],
    ],
    width: 1,
    style: muted,
  });

  // ---- 힘 — 같은 길이, 반대 방향. 머리가 막대 면에 닿는다. ----
  const faceA = along(pA, n, -BAR_THICK / 2);
  g.push({
    type: 'vector',
    id: `${b.id}-force-a`,
    from: along(faceA, n, -ARROW_LEN),
    delta: [n[0] * ARROW_LEN, n[1] * ARROW_LEN],
    label: text('label.force'),
    width: 3,
    opacity: b.forceOpacity,
    style: ink,
  });
  const faceB = along(pB, n, BAR_THICK / 2);
  g.push({
    type: 'vector',
    id: `${b.id}-force-b`,
    from: along(faceB, n, ARROW_LEN),
    delta: [-n[0] * ARROW_LEN, -n[1] * ARROW_LEN],
    label: text('label.force'),
    width: 3,
    opacity: b.forceOpacity,
    style: ink,
  });
}

export function scene(params: {
  state: StaticEquilibriumState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('static-equilibrium: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const g: Primitive[] = [];

  // 왼쪽 — 두 힘이 끝까지 한 선 위. 막대는 늘 제자리이고 옅어지지 않는다.
  bar(
    g,
    {
      id: 'left',
      centerX: LEFT_CENTER_X,
      theta: 0,
      shifted: 0,
      barOpacity: 1,
      forceOpacity: r.opacity,
      showTurn: false,
    },
    c,
  );
  // 오른쪽 — 한 힘을 막대 끝으로 옮긴다.
  bar(
    g,
    {
      id: 'right',
      centerX: RIGHT_CENTER_X,
      theta: r.theta,
      shifted: r.shifted,
      barOpacity: r.opacity,
      forceOpacity: r.opacity,
      showTurn: true,
    },
    c,
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
