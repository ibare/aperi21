// ========================================================================
// magnetic-poles — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 위에서 내려다본 선로. 왼쪽 고정대(`surface` 결 있는 벽)에 막대자석 하나가 붙어 있고,
// 선로(`trajectory` 두 줄) 위 수레 판(`body` rect)의 돌림판(`body` circle) 위에 자석이
// 하나 더 얹혀 있다. 오른쪽 끝은 멈춤막이(`surface` 벽).
//
// 극: 두 자석 모두 N 반쪽만 옅게 채우고 표식 `N` · `S` 를 새긴다. 극을 가르는 것은
// 표식과 채움(모양)이다 — N 빨강 · S 파랑 관례색을 범례로 쓰지 않는다 (S-piece).
// 두 자석은 같은 색이다. 다른 것은 수레 위 자석이 어느 쪽을 보고 있느냐뿐이다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { cartMagnetAngle, cartX, farX, nearX, readConstants, type MagneticPolesConstants } from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { MagneticPolesState } from './state';

/** 수레 판의 세로(선로에 가로지른 방향) = 가로 × 이 비. 돌림판이 들어갈 만큼이다. */
const DECK_DEPTH_RATIO = 0.8;
/** 돌림판 반지름 = 자석이 돌며 쓸고 가는 반지름 + 이 여유(월드). */
const TURNTABLE_MARGIN = 0.04;
/** 바퀴 하나의 크기(월드) — 선로 방향 길이 · 폭. 판 모서리에서 안쪽으로 들인 거리. */
const WHEEL_SIZE: Vec2 = [0.3, 0.1];
const WHEEL_INSET = 0.3;
/** 고정대 · 멈춤막이 벽이 선로를 가로질러 뻗는 반 길이(월드). */
const STAND_HALF = 0.34;
const STOPPER_HALF = 0.82;
/** 선로 선 굵기(화면 px)와 불투명도. 배경 정보라 가늘고 옅다. */
const RAIL_WIDTH_PX = 1;
const RAIL_OPACITY = 0.8;
/** 놓은 자리에 남기는 판 윤곽(점선)의 굵기(화면 px)와 불투명도. */
const GHOST_WIDTH_PX = 1;
const GHOST_OPACITY = 0.7;
/** 자극 표식 글자 크기(화면 px). 자석 폭 안에 들어가는 크기다. */
const POLE_LABEL_PX = 15;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 옅은 회색 — 자석의 N 반쪽 채움과 돌림판 둘레. 극을 가르는 것은 색이 아니라 채움 유무다. */
const FAINT = { colorRole: 'muted', emphasis: 'subtle' } as const;

/**
 * 막대자석 하나 — N 반쪽 채움 · 둘레 · 표식 둘. 방향 `angle` 은 N 끝이 가리키는 쪽이다.
 * 네 인스턴스를 같은 각으로 함께 돌린다(묶음 회전이 없어 자리를 여기서 계산한다, G118).
 */
function magnet(
  c: MagneticPolesConstants,
  id: string,
  center: Vec2,
  angle: number,
): Primitive[] {
  const q = c.magnetLength / 4;
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const north: Vec2 = [center[0] + ux * q, center[1] + uy * q];
  const south: Vec2 = [center[0] - ux * q, center[1] - uy * q];

  const fill: Body = {
    type: 'body',
    id: `${id}-north-fill`,
    pos: north,
    shape: 'rect',
    size: [c.magnetLength / 2, c.magnetWidth],
    orientation: angle,
    fill: 'solid',
    outline: 'none',
    style: FAINT,
  };
  const outline: Body = {
    type: 'body',
    id: `${id}-outline`,
    pos: center,
    shape: 'rect',
    size: [c.magnetLength, c.magnetWidth],
    orientation: angle,
    fill: 'none',
    outline: 'role',
    style: INK,
  };
  const label = (pole: 'north' | 'south', at: Vec2): Readout => ({
    type: 'readout',
    id: `${id}-${pole}`,
    anchor: { world: at },
    text: text(pole === 'north' ? 'mark.north' : 'mark.south'),
    chip: false,
    font: 'text',
    weight: 'bold',
    fontSize: POLE_LABEL_PX,
    align: 'center',
    style: INK,
  });
  return [fill, outline, label('north', north), label('south', south)];
}

export function scene(params: {
  state: MagneticPolesState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('magnetic-poles: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const out: Primitive[] = [];

  const depth = c.deckSize * DECK_DEPTH_RATIO;
  const railY = depth / 2;
  const standX = c.fixedMagnetX - c.magnetLength / 2;
  const fixedEnd = c.fixedMagnetX + c.magnetLength / 2;
  const x = cartX(c, tl);
  const angle = cartMagnetAngle(tl);

  // ---- 선로 · 고정대 · 멈춤막이 ----
  for (const side of [-1, 1] as const) {
    out.push({
      type: 'trajectory',
      id: `rail-${side < 0 ? 'lower' : 'upper'}`,
      points: [
        [fixedEnd, side * railY],
        [c.trackEndX, side * railY],
      ],
      width: RAIL_WIDTH_PX,
      opacity: RAIL_OPACITY,
      style: MUTED,
    });
  }
  // 결은 벽의 바깥쪽(선로 반대쪽)에 긋는다 — from→to 의 오른쪽이 결이다.
  out.push({
    type: 'surface',
    id: 'stand',
    geometry: { kind: 'wall', from: [standX, STAND_HALF], to: [standX, -STAND_HALF] },
    material: 'rough',
    style: INK,
  });
  out.push({
    type: 'surface',
    id: 'stopper',
    geometry: { kind: 'wall', from: [c.trackEndX, -STOPPER_HALF], to: [c.trackEndX, STOPPER_HALF] },
    material: 'rough',
    style: INK,
  });

  // ---- 고정 자석 — N 이 오른쪽(수레 쪽) ----
  out.push(...magnet(c, 'fixed', [c.fixedMagnetX, 0], 0));

  // ---- 놓은 자리 ----
  // 수레를 놓은 뒤에는 놓은 자리에 판 윤곽을 점선으로 남긴다. 정지 화면에서도 수레가
  // 그 자리에서 어느 쪽으로 갔는지(다가왔는지 물러났는지) 읽힌다. 돌리는 동안에는
  // 수레가 그 자리에 있으므로 두지 않는다.
  const releasedFrom =
    tl.phase === 'attract' || tl.phase === 'near'
      ? farX(c)
      : tl.phase === 'repel' || tl.phase === 'far'
        ? nearX(c)
        : null;
  if (releasedFrom !== null) {
    const hx = c.deckSize / 2;
    const hy = depth / 2;
    out.push({
      type: 'trajectory',
      id: 'released-from',
      points: [
        [releasedFrom - hx, -hy],
        [releasedFrom + hx, -hy],
        [releasedFrom + hx, hy],
        [releasedFrom - hx, hy],
      ],
      closed: true,
      width: GHOST_WIDTH_PX,
      opacity: GHOST_OPACITY,
      style: { ...MUTED, lineStyle: 'dashed' },
    });
  }

  // ---- 수레 ----
  out.push({
    type: 'body',
    id: 'deck',
    pos: [x, 0],
    shape: 'rect',
    size: [c.deckSize, depth],
    fill: 'none',
    outline: 'role',
    style: MUTED,
  });
  for (const sx of [-1, 1] as const) {
    for (const sy of [-1, 1] as const) {
      out.push({
        type: 'body',
        id: `wheel-${sx}-${sy}`,
        pos: [x + sx * (c.deckSize / 2 - WHEEL_INSET), sy * railY],
        shape: 'rect',
        size: WHEEL_SIZE,
        fill: 'solid',
        outline: 'none',
        style: MUTED,
      });
    }
  }
  out.push({
    type: 'body',
    id: 'turntable',
    pos: [x, 0],
    shape: 'circle',
    size: Math.hypot(c.magnetLength, c.magnetWidth) / 2 + TURNTABLE_MARGIN,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: FAINT,
  });
  out.push(...magnet(c, 'cart', [x, 0], angle));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 고정대부터 멈춤막이까지와 캡션 줄 — 매 프레임 같은 값이다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
