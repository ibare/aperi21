// ========================================================================
// inclined-plane — 선언으로서의 장면
// ========================================================================
// 그리지 않는다, 선언한다 (원칙 1). 자유 렌더 0건.
//
// 빗면은 `region`, 기울기 각은 `sector` + `readout`, 물체는 `body`, 분해 보조선은
// `trajectory`(점선), 세 힘은 `vector`, 라벨은 `readout` 이다. 각은 시간표의 두
// 단계 진행도에서 읽는다 — 주기 상수와 위상은 옮겨 오지 않았다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  Sector,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';

import {
  ANGLE_LABEL_OFFSET,
  ARC_R,
  ARC_WIDTH_PX,
  BLOCK_SIZE,
  GRAVITY_LABEL_OFFSET,
  GRAVITY_WIDTH_PX,
  GUIDE_WIDTH_PX,
  HEAD,
  LABEL_FONT_PX,
  NORMAL_WIDTH_PX,
  PARALLEL_LABEL_OFFSET,
  PARALLEL_WIDTH_PX,
  SCENE_BOUNDS,
  text,
} from './schema';
import { displayAngle, geometry, swingAngle } from './physics';
import type { InclinedPlaneState } from './state';

const ORIGIN: Vec2 = [0, 0];

function add(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

export function scene(params: {
  state: InclinedPlaneState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('inclined-plane: schema.timeline 이 선언되어야 한다');

  const auto = swingAngle(timeline.at('steepen'), timeline.at('flatten'));
  const deg = displayAngle(state, auto);
  const g = geometry(deg);
  const th = (deg * Math.PI) / 180;

  const out: Primitive[] = [];

  // ---- 빗면 ----
  // 옅은 채움 삼각형, 윤곽선 없음.
  const wedge: Region = {
    type: 'region',
    id: 'wedge',
    points: [ORIGIN, g.top, g.foot],
    fillOpacity: 0.16,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(wedge);

  // ---- 기울기 각 ----
  // 호만 긋는다(채움 없음). 월드에서 바닥 왼쪽(π)에서 빗면(π − θ)까지.
  const arc: Sector = {
    type: 'sector',
    id: 'angle-arc',
    center: ORIGIN,
    radius: ARC_R,
    from: Math.PI,
    to: Math.PI - th,
    fillOpacity: 0,
    rimWidth: ARC_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  // 각 안쪽은 화살표가 지나가므로 글자는 꼭짓점 오른쪽 바깥에 둔다 (원본).
  const angleLabel: Readout = {
    type: 'readout',
    id: 'angle-label',
    anchor: { world: ORIGIN, offset: ANGLE_LABEL_OFFSET },
    text: text('label.angle'),
    vars: { deg: Math.round(deg) },
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(arc, angleLabel);

  // ---- 물체 ----
  const block: Body = {
    type: 'body',
    id: 'block',
    pos: g.center,
    shape: 'rect',
    size: BLOCK_SIZE,
    orientation: g.orientation,
    outline: 'none',
    // 원본은 빗면보다 한 단 짙은 옅은 색이다. 더 옅게(opacity) 하면 빗면에 묻힌다.
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  out.push(block);

  // ---- 분해 보조선 ----
  // 두 성분 끝에서 중력 끝으로. 셋이 한 직사각형을 이뤄 "둘의 합이 중력" 을 보인다.
  const gTip = add(g.center, g.gravity);
  for (const [id, part] of [
    ['guide-parallel', g.parallel],
    ['guide-normal', g.normal],
  ] as const) {
    const guide: Trajectory = {
      type: 'trajectory',
      id,
      points: [add(g.center, part), gTip],
      width: GUIDE_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
    };
    out.push(guide);
  }

  // ---- 중력 ----
  // 길이 고정. 자동 스케일링이 들어오면 "전체는 그대로" 가 사라진다 (원본 NOTES (d)).
  const gravity: Vector = {
    type: 'vector',
    id: 'gravity',
    from: g.center,
    delta: g.gravity,
    width: GRAVITY_WIDTH_PX,
    headSize: HEAD,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  const gravityLabel: Readout = {
    type: 'readout',
    id: 'gravity-label',
    anchor: { world: gTip, offset: GRAVITY_LABEL_OFFSET },
    text: text('label.gravity'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(gravity, gravityLabel);

  // ---- 면에 수직인 성분 ----
  // 중력과 같은 먹색 — 주장의 배경이다. 라벨 없음(점선 직사각형과 자리로 읽힌다).
  const normal: Vector = {
    type: 'vector',
    id: 'normal',
    from: g.center,
    delta: g.normal,
    width: NORMAL_WIDTH_PX,
    headSize: HEAD,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(normal);

  // ---- 면에 나란한 성분 ----
  // 강조색은 이 하나에만. 캡션의 "끄는 몫" 과 같은 대상이다.
  const parallel: Vector = {
    type: 'vector',
    id: 'parallel',
    from: g.center,
    delta: g.parallel,
    width: PARALLEL_WIDTH_PX,
    headSize: HEAD,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  const parallelLabel: Readout = {
    type: 'readout',
    id: 'parallel-label',
    anchor: { world: add(g.center, g.parallel), offset: PARALLEL_LABEL_OFFSET },
    text: text('label.parallel'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(parallel, parallelLabel);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계. 각이 바뀌어도 카메라가 흔들리지 않는다 (S-piece).
  return { ...SCENE_BOUNDS };
}
