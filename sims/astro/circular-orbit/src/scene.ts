// ========================================================================
// circular-orbit — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 행성 · 위성 · 유령(body) ·
// 자취 · 곧은 길 · 직각 표지(trajectory) · 속도 · 중력 · 끌어내림(vector) ·
// 유령 이름(readout)이 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 위성은 먹색, 속도는 primary, **강조색은 「중력」 한 뜻에만**
// (중력 화살표와 그것이 끌어내린 틈). 자취(위성이 실제로 간 길)는 secondary,
// 행성 · 유령 · 곧은 길 · 직각 표지는 배경 정보라 muted.
//
// **궤도 원을 미리 그리지 않는다.** 원은 위성이 지나간 자취로만 생긴다 — 미리 그리면
// 「꺾임이 이어져 원이 된다」 가 「원래 원 위에 있었다」 로 뒤집힌다.
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
import {
  angleAt,
  inwardAt,
  pointAt,
  readConstants,
  readGhost,
  tangentAt,
  trailOpacity,
} from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { CircularOrbitState } from './state';

/**
 * 속도 화살표 길이(월드). 크기가 내내 같다 — 빠르기가 변하지 않는다는 것이 이 길이로 보인다.
 * 값의 크기가 아니라 방향이 주장이라 물리량에서 셈하지 않고 읽기 좋은 길이로 둔다.
 */
const VELOCITY_ARROW = 0.78;
/** 중력 화살표 길이(월드). 역시 내내 같다 — 궤도 반지름이 그대로라 중력의 세기도 그대로다. */
const GRAVITY_ARROW = 0.56;
/** 직각 표지 한 변(월드). 두 화살표의 밑동에 붙는 작은 ㄱ자다. */
const RIGHT_ANGLE = 0.15;
/** 위성 · 유령 반지름(월드). */
const SATELLITE_R = 0.075;
/** 자취 표본 간격(rad). 3° — 선이 각져 보이지 않는 촘촘함. */
const TRAIL_STEP = Math.PI / 60;
/** 닫힌 원의 표본 수. */
const CIRCLE_SAMPLES = 120;
/** 유령 이름표를 유령 위로 띄우는 거리(화면 px). */
const GHOST_LABEL_LIFT = -16;
/** 행성의 짙기 — 배경 정보라 한 걸음 물린다. */
const PLANET_OPACITY = 0.55;
/** 자취 선 굵기(화면 px). */
const TRAIL_WIDTH_PX = 2.5;
/** 「중력이 없다면」 곧은 길 점선 굵기(화면 px). */
const GHOST_PATH_WIDTH_PX = 1.5;
/** 유령 이름표 글자 크기(화면 px). */
const GHOST_LABEL_PX = 12;
/** 끌어내린 몫 화살표 굵기(화면 px). */
const DROP_WIDTH_PX = 2;
/** 직각 표지 선 굵기(화면 px). */
const RIGHT_ANGLE_WIDTH_PX = 1.25;
/** 속도 · 중력 화살표 굵기(화면 px). */
const FORCE_ARROW_WIDTH_PX = 3;

export function scene(params: {
  state: CircularOrbitState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('circular-orbit: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  const theta = angleAt(tl, c, tl.u);
  const sat = pointAt(c, theta);
  const tangent = tangentAt(theta);
  const inward = inwardAt(theta);

  // ---- 행성 ----
  // 중력이 향하는 곳. 배경 정보라 muted — 주장은 행성이 아니라 위성의 길에 있다.
  out.push({
    type: 'body',
    id: 'planet',
    pos: [0, 0],
    shape: 'circle',
    size: c.planetRadius,
    outline: 'none',
    glow: false,
    opacity: PLANET_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 자취 ----
  // 이번 주기 첫 자리부터 지금 자리까지. `close` 가 끝나는 순간 한 바퀴를 채워 닫힌다.
  const start = angleAt(tl, c, 0);
  const closed = tl.u >= tl.end('close');
  const trail: Vec2[] = [];
  if (closed) {
    for (let i = 0; i < CIRCLE_SAMPLES; i++) {
      trail.push(pointAt(c, start + (2 * Math.PI * i) / CIRCLE_SAMPLES));
    }
  } else {
    const n = Math.max(1, Math.ceil((theta - start) / TRAIL_STEP));
    for (let i = 0; i <= n; i++) trail.push(pointAt(c, start + ((theta - start) * i) / n));
  }
  if (trail.length >= 2) {
    out.push({
      type: 'trajectory',
      id: 'trail',
      points: trail,
      closed,
      width: TRAIL_WIDTH_PX,
      opacity: trailOpacity(tl),
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  }

  // ---- 「중력이 없다면」 유령 ----
  // 떠나는 순간의 속도로 곧게 간다. 유령은 행성에서 멀어지고, 같은 시간 위성은 중심
  // 쪽으로 떨어져 자취 위에 남는다. 그 틈이 중력이 끌어내린 몫이다.
  const ghost = readGhost(tl, c);
  if (ghost) {
    out.push({
      type: 'trajectory',
      id: 'ghost-path',
      points: [ghost.from, ghost.at],
      width: GHOST_PATH_WIDTH_PX,
      opacity: ghost.alpha,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
    out.push({
      type: 'body',
      id: 'ghost',
      pos: ghost.at,
      shape: 'circle',
      size: SATELLITE_R,
      fill: 'none',
      outline: 'role',
      opacity: ghost.alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'ghost-label',
      anchor: { world: ghost.at, offset: [0, GHOST_LABEL_LIFT] },
      text: text('label.ghost'),
      chip: false,
      font: 'text',
      fontSize: GHOST_LABEL_PX,
      align: 'center',
      opacity: ghost.alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    // 끌어내림. 유령에서 같은 시각의 위성까지 — 중력(강조색)이 한 일이라 같은 색이다.
    const drop: Vec2 = [ghost.satellite[0] - ghost.at[0], ghost.satellite[1] - ghost.at[1]];
    out.push({
      type: 'vector',
      id: 'drop',
      from: ghost.at,
      delta: drop,
      width: DROP_WIDTH_PX,
      opacity: ghost.alpha,
      style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 직각 표지 ----
  // 속도(옆)와 중력(중심) 사이의 ㄱ자. 이 표지가 한 바퀴 내내 위성을 따라다닌다 —
  // 「늘 직각」 이 한 순간의 우연이 아니라는 것.
  const r = RIGHT_ANGLE;
  out.push({
    type: 'trajectory',
    id: 'right-angle',
    points: [
      [sat[0] + tangent[0] * r, sat[1] + tangent[1] * r],
      [sat[0] + (tangent[0] + inward[0]) * r, sat[1] + (tangent[1] + inward[1]) * r],
      [sat[0] + inward[0] * r, sat[1] + inward[1] * r],
    ],
    width: RIGHT_ANGLE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 위성 ----
  out.push({
    type: 'body',
    id: 'satellite',
    pos: sat,
    shape: 'circle',
    size: SATELLITE_R,
    outline: 'none',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 속도 · 중력 ----
  // 둘 다 길이가 내내 같다. 도는 것은 방향뿐이다.
  // 이름은 서로 등진 쪽에 붙인다 — 속도는 궤도 바깥, 중력은 속도의 반대편. `auto` 는
  // 둘 다 화면 위쪽을 골라 궤도 아래에서 두 이름이 한자리에 겹친다.
  out.push({
    type: 'vector',
    id: 'velocity',
    from: sat,
    delta: [tangent[0] * VELOCITY_ARROW, tangent[1] * VELOCITY_ARROW],
    width: FORCE_ARROW_WIDTH_PX,
    label: text('label.velocity'),
    labelSide: 'cw',
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'gravity',
    from: sat,
    delta: [inward[0] * GRAVITY_ARROW, inward[1] * GRAVITY_ARROW],
    width: FORCE_ARROW_WIDTH_PX,
    label: text('label.gravity'),
    labelSide: 'ccw',
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
