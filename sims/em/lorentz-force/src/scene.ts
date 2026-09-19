// ========================================================================
// lorentz-force — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 3 차원 장면을 고정 시점으로 투영한 좌표(physics.ts `project`)를 월드 좌표로 쓴다.
// 겹침은 scene 에 쓴 순서다(`drawOrder: 'scene'`):
//
//   수평면 원(점선) → v–B 면(옅은 칠) → 뒤집히기 전 F 잔상(flip 단계)
//   → 세 화살표(시선에서 먼 끝부터) → 직각 표지 → 전하 → 이름표
//
// 강조색(accent)은 한 뜻에만 쓴다 — 힘 F. 속도 v 는 먹, 자기장 B 는 회색(배경 정보).
// ========================================================================

import type {
  BaseMeta,
  Bounds,
  Vector,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { add3, derive, dot3, mul3, project, readConstants, unit3, viewOf, type Vec3, type View } from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { LorentzForceState } from './state';

/** 수평면 원(v 끝이 도는 길)의 표본 수. */
const RING_SAMPLES = 96;
/** 화살표 굵기(화면 px) — F 가 가장 굵고, B 는 배경 정보라 가늘다. */
const FORCE_WIDTH_PX = 4;
const VELOCITY_WIDTH_PX = 3.5;
const FIELD_WIDTH_PX = 3;
/** 뒤집히기 전 F 잔상의 굵기(화면 px). */
const GHOST_WIDTH_PX = 2;
/** 화살촉 크기(월드). */
const HEAD_SIZE = 0.16;
/** 수평면 원 · 직각 표지 굵기(화면 px). */
const RING_WIDTH_PX = 1.2;
const RIGHT_MARK_WIDTH_PX = 1.6;
/** 직각 표지 한 변의 길이(월드). */
const RIGHT_MARK_SIZE = 0.27;
/** v–B 면 채움 불투명도 — 뒤의 화살표가 비쳐 보이는 정도. */
const PLANE_FILL_OPACITY = 0.16;
/** 수평면 원의 불투명도 — 안내선이라 옅게. */
const RING_OPACITY = 0.7;
/** 뒤집히기 전 F 잔상의 불투명도. */
const GHOST_OPACITY = 0.55;
/** 전하 원판 반지름 · 부호 획 반 길이(월드). */
const CHARGE_RADIUS = 0.11;
const SIGN_ARM = 0.062;
/** 이름표를 화살표 끝에서 바깥으로 미는 거리 · 옆으로 비키는 거리(화면 px). */
const LABEL_PUSH_PX = 12;
const LABEL_SIDE_PX = 16;
/** 이름표 글자 크기(화면 px). */
const LABEL_FONT_PX = 16;
const ZERO_FONT_PX = 14;
/** `F = 0` 표식을 전하에서 비키는 자리(화면 px, 아래가 +). */
const ZERO_OFFSET_PX: Vec2 = [-34, 20];
/** 이 아래의 사인(|v × B̂| / |v|)이면 F · 면 · 직각 표지를 그리지 않는다 — 머리만 남은 점이 방향처럼 읽힌다. */
const FORCE_VISIBLE = 0.02;

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
const muted = { colorRole: 'muted', emphasis: 'strong' } as const;

const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];

/**
 * 투영된 방향으로 화면 px 만큼 밀어낸 오프셋(화면은 아래가 +). `side` 를 주면 그 방향의
 * 오른쪽(화면 기준)으로 더 비킨다.
 */
function pushOut(dir: Vec2, px: number, side = 0): Vec2 {
  const len = Math.hypot(dir[0], dir[1]) || 1;
  const ux = dir[0] / len;
  const uy = -dir[1] / len;
  return [ux * px - uy * side, uy * px + ux * side];
}

interface Arrow {
  id: string;
  tip3: Vec3;
  prim: Primitive;
}

function arrow(view: View, id: string, vec: Vec3, width: number, style: Vector['style'], opacity: number): Arrow {
  const origin = project(view, [0, 0, 0]);
  return {
    id,
    tip3: vec,
    prim: {
      type: 'vector',
      id,
      from: origin,
      delta: sub(project(view, vec), origin),
      width,
      headSize: HEAD_SIZE,
      outline: 'background',
      opacity,
      style,
    },
  };
}

/** 전하에 새긴 부호 — 바탕색 획. 양이면 +, 음이면 −. 좌표는 `pos` 기준 월드, y 위. */
function signPath(charge: number): string {
  const a = SIGN_ARM;
  const bar = `M ${-a} 0 L ${a} 0`;
  return charge >= 0 ? `${bar} M 0 ${-a} L 0 ${a}` : bar;
}

export function scene(params: {
  state: LorentzForceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('lorentz-force: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const view = viewOf(c);
  const r = derive(timeline, c);
  const op = r.opacity;
  const origin = project(view, [0, 0, 0]);
  const hasForce = r.sinVB >= FORCE_VISIBLE;
  const out: Primitive[] = [];

  // ---- 수평면 원 — B 에 직각인 면. v 끝이 돌 때 지나는 길이고, F 는 늘 이 면 안에 있다 ----
  const ringR = c.speed * c.velocityScale;
  const ring: Vec2[] = [];
  for (let i = 0; i <= RING_SAMPLES; i++) {
    const a = (i / RING_SAMPLES) * Math.PI * 2;
    ring.push(project(view, [ringR * Math.cos(a), ringR * Math.sin(a), 0]));
  }
  out.push({
    type: 'trajectory',
    id: 'ring',
    points: ring,
    closed: true,
    width: RING_WIDTH_PX,
    opacity: op * RING_OPACITY,
    style: { ...muted, lineStyle: 'dashed' },
  });

  // ---- v–B 면 — F 는 이 면에서 곧게 솟는다. v ∥ B 이면 면이 접혀 사라진다 ----
  // 두 화살표 끝을 잇는 삼각형이다. 평행사변형(v + B 꼭짓점)은 v 가 뒤로 설 때 경계 위로 넘친다.
  if (hasForce) {
    out.push({
      type: 'region',
      id: 'plane',
      points: [origin, project(view, r.v), project(view, r.b)],
      fillOpacity: PLANE_FILL_OPACITY,
      opacity: op,
      style: muted,
    });
  }

  // ---- 뒤집히기 전 F — 부호가 바뀐 단계에만 점선으로 남는다 ----
  if (timeline.phase === 'flip') {
    const ghost = arrow(view, 'force-before', r.fBefore, GHOST_WIDTH_PX, { ...accent, lineStyle: 'dashed' }, op * GHOST_OPACITY);
    out.push(ghost.prim);
  }

  // ---- 세 화살표 — 시선에서 먼 끝부터 ----
  const arrows: Arrow[] = [
    arrow(view, 'field', r.b, FIELD_WIDTH_PX, muted, op),
    arrow(view, 'velocity', r.v, VELOCITY_WIDTH_PX, ink, op),
  ];
  if (hasForce) arrows.push(arrow(view, 'force', r.f, FORCE_WIDTH_PX, accent, op));
  // 방향의 깊이로 가른다. v ∥ B 이면 같은 값이라 목록 순서(B 먼저)가 남아 v 가 B 위에 온다.
  arrows.sort((a, b) => dot3(unit3(a.tip3), view.towardViewer) - dot3(unit3(b.tip3), view.towardViewer));
  for (const a of arrows) out.push(a.prim);

  // ---- 직각 표지 — F 와 v, F 와 B 사이. 힘이 줄면 함께 옅어진다 ----
  if (hasForce) {
    const fHat = unit3(r.f);
    const corner = (other: Vec3): Vec2[] => {
      const oHat = unit3(other);
      return [
        project(view, mul3(oHat, RIGHT_MARK_SIZE)),
        project(view, add3(mul3(oHat, RIGHT_MARK_SIZE), mul3(fHat, RIGHT_MARK_SIZE))),
        project(view, mul3(fHat, RIGHT_MARK_SIZE)),
      ];
    };
    out.push({
      type: 'lineSet',
      id: 'right-angles',
      lines: [corner(r.v), corner(r.b)],
      width: RIGHT_MARK_WIDTH_PX,
      opacity: op * r.sinVB,
      style: ink,
    });
  }

  // ---- 전하 — 짙은 원판에 바탕색 부호 ----
  out.push(
    {
      type: 'body',
      id: 'charge',
      pos: origin,
      shape: 'circle',
      size: CHARGE_RADIUS,
      glow: false,
      outline: 'none',
      opacity: op,
      style: ink,
    },
    {
      type: 'body',
      id: 'charge-sign',
      pos: origin,
      shape: 'custom',
      customPath: signPath(r.charge),
      fill: 'none',
      outline: 'background',
      opacity: op,
    },
  );

  // ---- 이름표 — 화살표 끝 너머 ----
  const label = (id: string, vec: Vec3, msg: Parameters<typeof text>[0], style: BaseMeta['style'], side: number, opacity: number): Primitive => {
    const tip = project(view, vec);
    return {
      type: 'readout',
      id,
      anchor: { world: tip, offset: pushOut(sub(tip, origin), LABEL_PUSH_PX, side) },
      text: text(msg),
      chip: false,
      font: 'text',
      fontSize: LABEL_FONT_PX,
      italic: true,
      weight: 'bold',
      align: 'center',
      opacity,
      style,
    };
  };
  out.push(label('field-label', r.b, 'label.field', muted, 0, op));
  // v 이름표는 옆으로 비킨다 — v 가 B 와 나란해지면 B 의 대 위에 얹히지 않게.
  out.push(label('velocity-label', r.v, 'label.velocity', ink, LABEL_SIDE_PX, op));
  if (hasForce) out.push(label('force-label', r.f, 'label.force', accent, 0, op));

  // ---- 힘이 없는 순간 ----
  if (timeline.phase === 'parallel') {
    out.push({
      type: 'readout',
      id: 'force-zero',
      anchor: { world: origin, offset: ZERO_OFFSET_PX },
      text: text('label.forceZero'),
      chip: false,
      font: 'text',
      fontSize: ZERO_FONT_PX,
      italic: true,
      weight: 'bold',
      align: 'center',
      opacity: op,
      style: accent,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`). id 'caption' 을 두지 않는다.
  return out;
}

/** 고정 경계 — 프레이밍이 흔들리면 v 의 회전과 시점의 회전이 섞인다. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
