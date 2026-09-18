// ========================================================================
// torque — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 벽(`surface` wall) · 닫혀 있던 자리(`trajectory` 점선) ·
// 쓸고 간 각(`sector`) · 팔 길이(`dimension`) · 문(`body` rect) · 경첩(`body` circle) ·
// 미는 힘(`vector`) · 기호(`readout`) 가 모두 표준 어휘로 있다.
//
// 색: 문 · 경첩 · 힘은 먹색(같은 장치, 같은 힘). 팔 길이는 무채색 안내선. 강조색은
// **문이 쓸고 간 각** 한 가지 뜻에만 쓴다 — 두 부채꼴의 벌어짐이 곧 주장이다.
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
import { derive, ratioText, readConstants, type TorqueConstants } from './physics';
import {
  ANGLE_LABEL_GAP,
  ANGLE_LABEL_MIN,
  ARM_DIM_GAP,
  ARROW_LEN,
  DOOR_THICK,
  HINGE_LEFT_X,
  HINGE_R,
  HINGE_RIGHT_X,
  SCENE_BOUNDS,
  WALL_BEHIND,
  WALL_BEYOND,
  text,
  type TorqueMessageKey,
} from './schema';
import type { TorqueState } from './state';

/** 팔 길이 기호를 치수선 가운데에서 바깥으로 더 띄우는 거리(화면 px). */
const ARM_LABEL_PX = 11;

interface DoorSpec {
  id: 'short' | 'long';
  hingeX: number;
  arm: number;
  theta: number;
  armKey: TorqueMessageKey;
  angleKey: TorqueMessageKey;
}

const along = (h: Vec2, u: Vec2, d: number): Vec2 => [h[0] + u[0] * d, h[1] + u[1] * d];

function door(
  g: Primitive[],
  d: DoorSpec,
  c: TorqueConstants,
  k: string,
  op: number,
): void {
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;

  const L = c.doorWidth;
  const hinge: Vec2 = [d.hingeX, 0];
  /** 문을 따라가는 단위 벡터와, 문이 열려 나가는 쪽(반시계) 법선. */
  const u: Vec2 = [Math.cos(d.theta), Math.sin(d.theta)];
  const n: Vec2 = [-u[1], u[0]];

  // ---- 벽 — 경첩 뒤와 문틀 너머. 옅어지지 않는다(방은 그대로 있다). ----
  g.push({
    type: 'surface',
    id: `${d.id}-wall-behind`,
    geometry: { kind: 'wall', from: [d.hingeX - WALL_BEHIND, 0], to: [d.hingeX - HINGE_R, 0] },
    material: 'solid',
  });
  g.push({
    type: 'surface',
    id: `${d.id}-wall-beyond`,
    geometry: { kind: 'wall', from: [d.hingeX + L + DOOR_THICK, 0], to: [d.hingeX + L + WALL_BEYOND, 0] },
    material: 'solid',
  });

  // ---- 문이 닫혀 있던 자리 — 연 각을 어디서부터 재는지 ----
  g.push({
    type: 'trajectory',
    id: `${d.id}-closed`,
    points: [hinge, [d.hingeX + L, 0]],
    width: 1,
    opacity: op * 0.8,
    style: { ...muted, lineStyle: 'dashed' },
  });

  // ---- 쓸고 간 각 — 강조색은 이 뜻에만 ----
  g.push({
    type: 'sector',
    id: `${d.id}-swept`,
    center: hinge,
    radius: L,
    from: 0,
    to: d.theta,
    fillOpacity: 0.2,
    rimWidth: 2,
    opacity: op,
    style: accent,
  });

  // ---- 팔 길이 — 경첩에서 미는 자리까지. 문이 열려 나가는 쪽에 띄운다. ----
  const dimFrom = along(hinge, n, ARM_DIM_GAP);
  const dimTo = along(along(hinge, u, d.arm), n, ARM_DIM_GAP);
  g.push({
    type: 'dimension',
    id: `${d.id}-arm`,
    from: dimFrom,
    to: dimTo,
    opacity: op,
    style: muted,
  });
  const armMid = along(along(hinge, u, d.arm / 2), n, ARM_DIM_GAP);
  g.push({
    type: 'readout',
    id: `${d.id}-arm-name`,
    // 화면 y 는 아래로 자라므로 월드 법선의 y 를 뒤집어 화면 px 로 띄운다.
    anchor: { world: armMid, offset: [n[0] * ARM_LABEL_PX, -n[1] * ARM_LABEL_PX] },
    text: text(d.armKey),
    vars: { k },
    chip: false,
    font: 'text',
    italic: true,
    fontSize: 15,
    align: 'center',
    opacity: op,
    style: muted,
  });

  // ---- 문 · 경첩 ----
  const doorCenter = along(hinge, u, L / 2);
  g.push({
    type: 'body',
    id: `${d.id}-door`,
    pos: doorCenter,
    shape: 'rect',
    size: [L, DOOR_THICK],
    orientation: d.theta,
    outline: 'none',
    opacity: op,
    style: ink,
  });
  g.push({
    type: 'body',
    id: `${d.id}-hinge`,
    pos: hinge,
    shape: 'circle',
    size: HINGE_R,
    outline: 'background',
    glow: false,
    style: ink,
  });

  // ---- 미는 힘 — 두 문에서 같은 길이. 머리가 문 면의 미는 자리에 닿는다. ----
  const push = along(along(hinge, u, d.arm), n, -DOOR_THICK / 2);
  g.push({
    type: 'vector',
    id: `${d.id}-force`,
    from: along(push, n, -ARROW_LEN),
    delta: [n[0] * ARROW_LEN, n[1] * ARROW_LEN],
    label: text('label.force'),
    labelSide: 'ccw',
    width: 3,
    opacity: op,
    style: ink,
  });

  // ---- 연 각의 기호 — 부채꼴 테 바깥, 각의 가운데 ----
  if (d.theta >= ANGLE_LABEL_MIN) {
    const mid = d.theta / 2;
    g.push({
      type: 'readout',
      id: `${d.id}-angle-name`,
      anchor: { world: along(hinge, [Math.cos(mid), Math.sin(mid)], L + ANGLE_LABEL_GAP) },
      text: text(d.angleKey),
      vars: { k },
      chip: false,
      font: 'text',
      italic: true,
      fontSize: 16,
      align: 'center',
      opacity: op,
      style: accent,
    });
  }
}

export function scene(params: {
  state: TorqueState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('torque: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const k = ratioText(c);
  const g: Primitive[] = [];

  door(
    g,
    {
      id: 'short',
      hingeX: HINGE_LEFT_X,
      arm: c.armShort,
      theta: r.thetaShort,
      armKey: 'label.armShort',
      angleKey: 'label.angleShort',
    },
    c,
    k,
    r.opacity,
  );
  door(
    g,
    {
      id: 'long',
      hingeX: HINGE_RIGHT_X,
      arm: c.armLong,
      theta: r.thetaLong,
      armKey: 'label.armLong',
      angleKey: 'label.angleLong',
    },
    c,
    k,
    r.opacity,
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
