// ========================================================================
// center-of-gravity — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 바닥(`surface`) · 상자(`region`) · 받침면(`trajectory`
// 굵은 선) · 수직선(`trajectory` 점선) · 수직선이 떨어진 자리와 무게 중심(`body`
// point · circle) · 미는 손(`vector`) · 이름표(`readout`) 가 모두 표준 어휘로 있다.
//
// 색: 상자는 무채색(`muted`), 수직선과 무게 중심은 먹색(한 대상 — 무게가 향하는 곳).
// 강조색은 **받침면** 한 가지 뜻에만 쓴다 — 상자 밑면과 그 밑면이 바닥에 드리운 띠.
// 수직선이 그 띠 안에 떨어지는가, 밖에 떨어지는가가 이 조각의 전부다.
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
import { boxPose, derive, readConstants, toWorld } from './physics';
import { PUSH_GAP, PUSH_LENGTH, SCENE_BOUNDS, text } from './schema';
import type { CenterOfGravityState } from './state';

/** 무게 중심 점의 반지름(m). */
const COG_RADIUS = 0.035;
/** 무게 중심 이름표를 점에서 띄우는 거리(화면 px). */
const COG_LABEL_OFFSET: Vec2 = [-10, -10];
/** 받침면 이름표를 바닥 아래로 내리는 거리(화면 px). */
const BASE_LABEL_OFFSET: Vec2 = [0, 18];
/** 받침면 띠가 이보다 좁으면 이름표를 달지 않는다(m) — 글자가 띠보다 넓어진다. */
const BASE_LABEL_MIN = 0.16;
/** 상자 밑면을 받침면으로 덧긋는 굵기 · 바닥 띠 굵기(화면 px). */
const BASE_FACE_WIDTH = 3;
const BASE_BAND_WIDTH = 5;

export function scene(params: {
  state: CenterOfGravityState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('center-of-gravity: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const op = r.opacity;

  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;

  // 축 P — 서 있는 상자의 오른쪽 아래 모서리. 원점은 밑면 가운데.
  const pivot: Vec2 = [c.boxWidth / 2, 0];
  const pose = boxPose(pivot, r.theta, c);
  const [p0, p1, p2, p3] = pose.corners;
  const cog = pose.cog;
  const g: Primitive[] = [];

  // ---- 바닥 ----
  g.push({ type: 'surface', id: 'floor', geometry: { kind: 'ground', y: 0 }, material: 'solid' });

  // ---- 상자 ----
  g.push({
    type: 'region',
    id: 'box',
    points: [p0, p1, p2, p3],
    fillOpacity: 0.3,
    opaque: true,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    opacity: op,
    style: muted,
  });

  // ---- 받침면 ----
  // 서 있거나 기울어 있는 동안은 밑면(P0–P1), 다 누운 뒤에는 옆면(P0–P3)이 받침면이다.
  // 바닥 띠는 그 면을 바닥에 곧장 내린 자리 — 수직선이 떨어지는 곳과 같은 바닥에서 견준다.
  const face: readonly [Vec2, Vec2] = r.lying ? [p0, p3] : [p1, p0];
  const bandFrom = Math.min(face[0][0], face[1][0]);
  const bandTo = Math.max(face[0][0], face[1][0]);
  g.push({
    type: 'trajectory',
    id: 'base-face',
    points: [face[0], face[1]],
    width: BASE_FACE_WIDTH,
    opacity: op,
    style: accent,
  });
  g.push({
    type: 'trajectory',
    id: 'base-band',
    points: [
      [bandFrom, 0],
      [bandTo, 0],
    ],
    width: BASE_BAND_WIDTH,
    opacity: op,
    style: accent,
  });
  if (bandTo - bandFrom >= BASE_LABEL_MIN) {
    g.push({
      type: 'readout',
      id: 'base-name',
      anchor: { world: [(bandFrom + bandTo) / 2, 0], offset: BASE_LABEL_OFFSET },
      text: text('label.base'),
      chip: false,
      font: 'text',
      fontSize: 12,
      align: 'center',
      opacity: op,
      style: accent,
    });
  }

  // ---- 수직선 ----
  // 무게 중심에서 바닥까지 곧장 내린다. 상자 면 위로 지나가야 밑면을 뚫는지 비껴가는지
  // 가 보인다 (`drawOrder: 'scene'` — 상자 뒤에 선언).
  g.push({
    type: 'trajectory',
    id: 'plumb',
    points: [cog, [cog[0], 0]],
    width: 1.5,
    opacity: op,
    style: { ...ink, lineStyle: 'dashed' },
  });
  g.push({
    type: 'body',
    id: 'plumb-foot',
    pos: [cog[0], 0],
    shape: 'point',
    opacity: op,
    style: ink,
  });

  // ---- 무게 중심 ----
  g.push({
    type: 'body',
    id: 'cog',
    pos: cog,
    shape: 'circle',
    size: COG_RADIUS,
    glow: false,
    outline: 'background',
    opacity: op,
    style: ink,
  });
  g.push({
    type: 'readout',
    id: 'cog-name',
    anchor: { world: cog, offset: COG_LABEL_OFFSET },
    text: text('label.cog'),
    // 칩을 깔지 않는다 — 월드 앵커의 칩은 `align` 을 따르지 않고 가운데에 놓여 점을 덮는다
    // (NOTES 새 부족). 상자 면이 옅어서 글자만으로 읽힌다.
    chip: false,
    font: 'text',
    fontSize: 12,
    align: 'right',
    opacity: op,
    style: ink,
  });

  // ---- 미는 손 ----
  // 기울이는 동안과 잡고 있는 동안만. 화살표가 사라지는 것이 「놓았다」 이다 —
  // 그 뒤에 상자가 어느 쪽으로 가는지는 무게가 정한다.
  if (r.pushing) {
    const cs = Math.cos(r.theta);
    const sn = Math.sin(r.theta);
    g.push({
      type: 'vector',
      id: 'push',
      from: toWorld(pivot, r.theta, [-c.boxWidth - PUSH_GAP - PUSH_LENGTH, c.boxHeight * 0.82]),
      delta: [PUSH_LENGTH * cs, -PUSH_LENGTH * sn],
      width: 2,
      opacity: op,
      style: muted,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
