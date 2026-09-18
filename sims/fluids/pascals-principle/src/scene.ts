// ========================================================================
// pascals-principle — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 물(region) · 유압관 벽
// (surface) · 피스톤과 짐(body) · 손의 힘과 압력 화살표(vector) · 옮겨 간 물(region) ·
// 처음 자리(body 윤곽) · 행정 치수선(dimension) · 힘 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 물은 secondary, 피스톤 · 짐은 muted, 손의 힘은 먹색, 압력 화살표는
// primary, **강조색은 「옮겨 간 물」 한 가지 뜻에만**. 치수선은 배경 정보라 muted.
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
import { largeWidth, readConstants, readPose } from './physics';
import {
  CHANNEL_BOTTOM,
  CHANNEL_TOP,
  DIM_OFFSET,
  LARGE_LEFT,
  LOAD_HEIGHT,
  LOAD_WIDTH,
  PISTON_THICK,
  PRESSURE_GAP,
  PRESSURE_LENGTH,
  PUSH_LENGTH,
  SCENE_BOUNDS,
  SMALL_LEFT,
  WALL_TOP,
  text,
} from './schema';
import { ratioLabel, type PascalsPrincipleState } from './state';

/** 피스톤 판을 벽 안쪽으로 들이는 여백(m). 판이 벽 선에 묻히지 않게. */
const PISTON_INSET = 0.03;
/** 옮겨 간 물의 채움 짙기. 물 위에 얹혀도 물과 갈려야 하고 화살표를 가리지 않아야 한다. */
const MOVED_FILL = 0.34;
/** 처음 자리 윤곽의 짙기. 지금 피스톤보다 뒤로 물러나 있어야 한다. */
const GHOST_OPACITY = 0.5;
/** 이 행정 비율(0~1) 아래에서는 치수선 · 옮겨 간 물을 두지 않는다 — 끝점 둘이 겹친다. */
const MIN_STROKE_SHOWN = 0.04;
/** 힘 이름표 글자 크기(화면 px). 기호라 본문보다 작지 않게 — 읽혀야 한다. */
const LABEL_PX = 14;
/** 손의 힘 이름표를 화살표 오른쪽으로 띄우는 거리(화면 px). */
const PUSH_LABEL_OFFSET: Vec2 = [13, 0];

/** 축 정렬 사각형의 네 꼭짓점. 왼쪽 아래에서 반시계. */
function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

export function scene(params: {
  state: PascalsPrincipleState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline, state } = params;
  if (!timeline) throw new Error('pascals-principle: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const pose = readPose(timeline, c);
  const out: Primitive[] = [];

  const w = c.smallWidth;
  const W = largeWidth(c);
  const sL = SMALL_LEFT;
  const sR = SMALL_LEFT + w;
  const lL = LARGE_LEFT;
  const lR = LARGE_LEFT + W;
  const n = state.ratioText || ratioLabel(c.ratio);
  const strokeShown = c.stroke > 0 && -pose.smallY / c.stroke > MIN_STROKE_SHOWN;

  // ---- 물 ----
  // U 자로 닫힌 물. 두 피스톤 밑면이 곧 물의 위 끝이다.
  out.push({
    type: 'region',
    id: 'water',
    points: [
      [sL, pose.smallY],
      [sR, pose.smallY],
      [sR, CHANNEL_TOP],
      [lL, CHANNEL_TOP],
      [lL, pose.largeY],
      [lR, pose.largeY],
      [lR, CHANNEL_BOTTOM],
      [sL, CHANNEL_BOTTOM],
    ],
    style: { colorRole: 'secondary', emphasis: 'medium' },
  });

  // ---- 옮겨 간 물 ----
  // 작은 실린더에서 비운 몫(폭 w × d)과 큰 실린더로 들어온 몫(폭 N·w × d/N). 같은 양이다 —
  // 좁고 긴 기둥이 넓고 낮은 판이 된다. 그래서 큰 피스톤은 1/N 만 오른다.
  if (strokeShown) {
    out.push(
      {
        type: 'region',
        id: 'moved-out',
        points: rect(sL, pose.smallY, sR, 0),
        fillOpacity: MOVED_FILL,
        style: { colorRole: 'accent', emphasis: 'strong' },
      },
      {
        type: 'region',
        id: 'moved-in',
        points: rect(lL, 0, lR, pose.largeY),
        fillOpacity: MOVED_FILL,
        style: { colorRole: 'accent', emphasis: 'strong' },
      },
    );
  }

  // ---- 유압관 벽 ----
  const walls: [string, Vec2, Vec2][] = [
    ['wall-small-outer', [sL, WALL_TOP], [sL, CHANNEL_BOTTOM]],
    ['wall-bottom', [sL, CHANNEL_BOTTOM], [lR, CHANNEL_BOTTOM]],
    ['wall-large-outer', [lR, CHANNEL_BOTTOM], [lR, WALL_TOP]],
    ['wall-small-inner', [sR, WALL_TOP], [sR, CHANNEL_TOP]],
    ['wall-channel-top', [sR, CHANNEL_TOP], [lL, CHANNEL_TOP]],
    ['wall-large-inner', [lL, CHANNEL_TOP], [lL, WALL_TOP]],
  ];
  for (const [id, from, to] of walls) {
    out.push({ type: 'surface', id, geometry: { kind: 'wall', from, to }, material: 'solid' });
  }

  // ---- 처음 자리 ----
  // 두 피스톤이 출발한 높이. 윤곽만 옅게 — d 와 d/N 을 여기서부터 잰다.
  if (strokeShown) {
    out.push(
      {
        type: 'body',
        id: 'ghost-small',
        pos: [(sL + sR) / 2, PISTON_THICK / 2],
        shape: 'rect',
        size: [w - 2 * PISTON_INSET, PISTON_THICK],
        fill: 'none',
        outline: 'role',
        opacity: GHOST_OPACITY,
        style: { colorRole: 'muted', emphasis: 'strong' },
      },
      {
        type: 'body',
        id: 'ghost-large',
        pos: [(lL + lR) / 2, PISTON_THICK / 2],
        shape: 'rect',
        size: [W - 2 * PISTON_INSET, PISTON_THICK],
        fill: 'none',
        outline: 'role',
        opacity: GHOST_OPACITY,
        style: { colorRole: 'muted', emphasis: 'strong' },
      },
    );
  }

  // ---- 피스톤과 짐 ----
  out.push(
    {
      type: 'body',
      id: 'piston-small',
      pos: [(sL + sR) / 2, pose.smallY + PISTON_THICK / 2],
      shape: 'rect',
      size: [w - 2 * PISTON_INSET, PISTON_THICK],
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
    {
      type: 'body',
      id: 'piston-large',
      pos: [(lL + lR) / 2, pose.largeY + PISTON_THICK / 2],
      shape: 'rect',
      size: [W - 2 * PISTON_INSET, PISTON_THICK],
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
    {
      type: 'body',
      id: 'load',
      pos: [(lL + lR) / 2, pose.largeY + PISTON_THICK + LOAD_HEIGHT / 2],
      shape: 'rect',
      size: [LOAD_WIDTH, LOAD_HEIGHT],
      style: { colorRole: 'muted', emphasis: 'medium' },
    },
  );

  // ---- 압력 화살표 ----
  // 폭 w 마다 하나씩, 모두 같은 길이로 피스톤 밑면을 밀어 올린다. 작은 피스톤에 하나,
  // 큰 피스톤에 N 개 — 같은 압력이 N 배 넓이를 떠받치니 힘이 N 배다. 힘을 한 화살표의
  // 길이로 그리지 않고 **같은 화살표의 개수**로 보인다.
  if (pose.pressure > 0) {
    const columns: { id: string; x: number; top: number }[] = [
      { id: 'pressure-small-0', x: (sL + sR) / 2, top: pose.smallY },
    ];
    const count = Math.max(1, Math.round(W / w));
    for (let i = 0; i < count; i++) {
      columns.push({ id: `pressure-large-${i}`, x: lL + (i + 0.5) * (W / count), top: pose.largeY });
    }
    for (const col of columns) {
      out.push({
        type: 'vector',
        id: col.id,
        from: [col.x, col.top - PRESSURE_GAP - PRESSURE_LENGTH],
        delta: [0, PRESSURE_LENGTH],
        opacity: pose.pressure,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    }

    // ---- 손의 힘 ----
    const pushTop = pose.smallY + PISTON_THICK + PUSH_LENGTH;
    out.push({
      type: 'vector',
      id: 'push',
      from: [(sL + sR) / 2, pushTop],
      delta: [0, -PUSH_LENGTH],
      opacity: pose.pressure,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'label-force-small',
      anchor: { world: [(sL + sR) / 2, pushTop - PUSH_LENGTH / 2], offset: PUSH_LABEL_OFFSET },
      text: text('label.forceSmall'),
      chip: false,
      fontSize: LABEL_PX,
      italic: true,
      font: 'text',
      opacity: pose.pressure,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    // 짐에 새긴 무게 — 큰 피스톤이 밀어 올리는 힘과 같다.
    out.push({
      type: 'readout',
      id: 'label-force-large',
      anchor: { world: [(lL + lR) / 2, pose.largeY + PISTON_THICK + LOAD_HEIGHT / 2] },
      text: text('label.forceLarge'),
      vars: { n },
      chip: false,
      fontSize: LABEL_PX,
      italic: true,
      font: 'text',
      opacity: pose.pressure,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 행정 치수선 ----
  // 처음 자리에서 지금 자리까지. 작은 쪽은 왼쪽 바깥, 큰 쪽은 오른쪽 바깥.
  if (strokeShown) {
    out.push(
      {
        type: 'dimension',
        id: 'stroke-small',
        from: [sL - DIM_OFFSET, 0],
        to: [sL - DIM_OFFSET, pose.smallY],
        text: text('label.strokeSmall'),
      },
      {
        type: 'dimension',
        id: 'stroke-large',
        from: [lR + DIM_OFFSET, 0],
        to: [lR + DIM_OFFSET, pose.largeY],
        text: text('label.strokeLarge'),
        vars: { n },
      },
    );
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
