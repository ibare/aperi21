// ========================================================================
// wetting-and-contact-angle — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 판 · 방울(region) · 방울
// 표면(trajectory) · 장력(vector) · 접촉각(sector) · 이름(readout)이 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 방울과 그 표면은 secondary(같은 물의 몸과 살갗), 세 장력은
// primary(같은 종류의 힘 셋), **강조색은 「가장자리를 미는 알짜 힘」 한 뜻에만**, 판과
// 접촉각은 먹색 계열. 표면이 바뀐 것은 색이 아니라 **결**(유리는 매끈, 왁스는 빗금)로 가른다
// — 같은 판이 다른 표면을 입은 것이다.
//
// 힘은 오른쪽 가장자리에만, 각은 왼쪽 가장자리에만 둔다. 좌우가 대칭이라 한쪽씩 맡기면
// 화살표와 부채꼴이 한 점에 겹치지 않는다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LocalizedText,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { capOf, capOutline, readConstants, readEdge } from './physics';
import {
  ANGLE_RADIUS,
  FORCE_SCALE,
  NET_DROP,
  PLATE_DEPTH,
  PLATE_HALF_WIDTH,
  SCENE_BOUNDS,
  SURFACE_LABEL_AT,
  text,
} from './schema';
import type { WettingAndContactAngleState } from './state';

/** 방울 면의 짙기. */
const DROP_FILL = 0.35;
/** 판 면의 짙기. 방울보다 옅어 방울이 판 위에 얹혀 읽힌다. */
const PLATE_FILL = 0.22;
/** 방울 표면 선 굵기(화면 px). 각이 이 선의 기울기라 궤적 기본보다 굵다. */
const SURFACE_WIDTH = 2.5;
/** 알짜 힘이 이보다 작으면 그리지 않는다(장력 단위) — 맞선 상태의 수치 잡음. */
const NET_VISIBLE = 0.02;
/** 부채꼴에서 θ 글자를 띄우는 거리(월드). */
const THETA_LABEL_GAP = 0.13;

export function scene(params: {
  state: WettingAndContactAngleState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('wetting-and-contact-angle: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const e = readEdge(timeline, c);
  const cap = capOf(e.theta, c.dropArea);
  const out: Primitive[] = [];

  // ---- 고체 판 ----
  // 같은 판 둘 — 매끈한 유리와 빗금 친 왁스가 서로 겹쳐 바뀐다. 색은 같다(같은 판).
  const plate: Vec2[] = [
    [-PLATE_HALF_WIDTH, 0],
    [PLATE_HALF_WIDTH, 0],
    [PLATE_HALF_WIDTH, -PLATE_DEPTH],
    [-PLATE_HALF_WIDTH, -PLATE_DEPTH],
  ];
  out.push(
    {
      type: 'region',
      id: 'plate-glass',
      points: plate,
      fillOpacity: PLATE_FILL,
      outline: [[0, 1]],
      opacity: 1 - e.wax,
      style: { colorRole: 'ink', emphasis: 'medium' },
    },
    {
      type: 'region',
      id: 'plate-wax',
      points: plate,
      fillOpacity: PLATE_FILL,
      fill: 'hatch',
      outline: [[0, 1]],
      opacity: e.wax,
      style: { colorRole: 'ink', emphasis: 'medium' },
    },
  );

  // ---- 표면 이름 ----
  out.push(
    surfaceLabel('surface-glass', text('label.glass'), 1 - e.wax),
    surfaceLabel('surface-wax', text('label.wax'), e.wax),
  );

  // ---- 물방울 ----
  const outline = capOutline(cap, e.theta);
  out.push({
    type: 'region',
    id: 'drop',
    points: outline,
    fillOpacity: DROP_FILL,
    style: { colorRole: 'secondary', emphasis: 'medium' },
  });
  // 물·공기 표면만 긋는다 — 밑(고체와 닿는 면)은 판의 윗변이 이미 긋는다.
  out.push({
    type: 'trajectory',
    id: 'drop-surface',
    points: outline,
    width: SURFACE_WIDTH,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ---- 접촉각 θ (왼쪽 가장자리) ----
  // 물 쪽에서 잰다 — 고체 면(안쪽 = +x)에서 물 표면의 접선까지.
  const left: Vec2 = [-cap.halfBase, 0];
  out.push({
    type: 'sector',
    id: 'contact-angle',
    center: left,
    radius: ANGLE_RADIUS,
    from: 0,
    to: e.theta,
    fillOpacity: 0.18,
    rimWidth: 1.5,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  const mid = e.theta / 2;
  const r = ANGLE_RADIUS + THETA_LABEL_GAP;
  out.push({
    type: 'readout',
    id: 'theta',
    anchor: { world: [left[0] + r * Math.cos(mid), r * Math.sin(mid)] },
    text: text('label.theta'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: 14,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 세 장력 (오른쪽 가장자리) ----
  // 같은 배율이라 가로로 견준다: 바깥(고체·공기) 하나 대 안(고체·물 + 물·공기의 가로 몫).
  const right: Vec2 = [cap.halfBase, 0];
  const k = FORCE_SCALE;
  out.push(
    {
      type: 'vector',
      id: 'solid-air',
      from: right,
      delta: [e.solidAir * k, 0],
      label: text('label.solidAir'),
      // 가로 두 장력의 이름은 모두 아래(판 안)에 둔다. 위는 물·공기 화살표와 그 이름이 쓴다 —
      // 방울이 뭉쳐 물·공기가 곧추서면 위에 둔 이름끼리 가장자리에서 겹쳤다(첫 촬영).
      labelSide: 'cw',
      style: { colorRole: 'primary', emphasis: 'strong' },
    },
    {
      type: 'vector',
      id: 'solid-liquid',
      from: right,
      delta: [-e.solidLiquid * k, 0],
      label: text('label.solidLiquid'),
      labelSide: 'ccw',
      style: { colorRole: 'primary', emphasis: 'strong' },
    },
    {
      type: 'vector',
      id: 'liquid-air',
      from: right,
      // 물 표면을 따라 가장자리에서 꼭대기 쪽으로.
      delta: [-Math.cos(e.theta) * e.liquid * k, Math.sin(e.theta) * e.liquid * k],
      label: text('label.liquidAir'),
      labelSide: 'cw',
      outline: 'background',
      style: { colorRole: 'primary', emphasis: 'strong' },
    },
  );

  // ---- 알짜 힘 ----
  // 가로 몫이 맞지 않는 동안만 선다. 고체 면 아래로 내려 세 장력과 한 줄에 겹치지 않게 한다.
  if (Math.abs(e.net) > NET_VISIBLE) {
    out.push({
      type: 'vector',
      id: 'net',
      from: [right[0], -NET_DROP],
      delta: [e.net * k, 0],
      label: text('label.net'),
      labelSide: e.net > 0 ? 'cw' : 'ccw',
      outline: 'background',
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

function surfaceLabel(id: string, label: LocalizedText, opacity: number): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: SURFACE_LABEL_AT },
    text: label,
    chip: false,
    font: 'text',
    fontSize: 12,
    opacity,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
