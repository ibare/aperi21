// ========================================================================
// conservative-force — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 길(trajectory) ·
// 높이 안내선(trajectory 점선) · 두 점(body point + readout) · 상자(body) ·
// 중력(vector) · 중력이 한 일 막대(region) · 높이 차(dimension + readout) 가
// 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 상자 · 두 점은 먹색(같은 대상), 중력 화살표는 secondary,
// **강조색은 「중력이 한 일」 한 가지 뜻에만**(두 막대). 길 · 안내선 · 치수선은
// 배경 정보라 muted.
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
import { pathAt, readBox, readConstants, samplePath, sceneOpacity, type PathShape } from './physics';
import {
  BAR_LABEL_Y,
  BAR_W,
  BAR_X1,
  BAR_X2,
  BOX_SIZE,
  GUIDE_END_X,
  MEASURE_LABEL_DX,
  MEASURE_X,
  MG_LEN,
  PATH_LABEL_GAP,
  PATH_LABEL_X,
  SCENE_BOUNDS,
  text,
  type ConservativeForceMessageKey,
} from './schema';
import type { ConservativeForceState } from './state';

/** 이름표 글자 크기(화면 px). 도식 기호라 캡션보다 조금 크다. */
const LABEL_PX = 14;
/** 길 이름표 글자 크기(화면 px). 길을 가리키는 낱말이라 기호보다 작다. */
const PATH_LABEL_PX = 12;
/** 길 굵기(화면 px). 상자보다 뒤로 물러난 배경이다. */
const PATH_WIDTH = 2;
/** 안내선 · 막대 바닥선 굵기(화면 px). 재는 선이라 가장 가늘게. */
const GUIDE_WIDTH = 1;
/** 막대 채움 짙기. 다크 바탕에서도 바닥선과 갈려야 한다. */
const BAR_FILL = 0.72;
/** 막대가 이보다 낮으면(m) 그리지 않는다 — 넓이 0 의 면은 선 한 줄로 번진다. */
const BAR_EPS = 1e-4;

/** 한 길의 선언 — 도는 높이와 막대 자리, 이름표 키, 이름표를 길 위/아래 어느 쪽에 둘지. */
interface Lane {
  id: string;
  path: PathShape;
  barX: number;
  pathLabel: ConservativeForceMessageKey;
  workLabel: ConservativeForceMessageKey;
  /** +1 이면 길 위에, −1 이면 길 아래에 이름표를 둔다 — 두 길 사이에 끼지 않게. */
  labelSide: 1 | -1;
}

export function scene(params: {
  state: ConservativeForceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('conservative-force: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const out: Primitive[] = [];

  const lanes: Lane[] = [
    {
      id: 'over',
      path: { turnY: c.peakY },
      barX: BAR_X1,
      pathLabel: 'label.path1',
      workLabel: 'label.work1',
      labelSide: 1,
    },
    {
      id: 'under',
      path: { turnY: c.troughY },
      barX: BAR_X2,
      pathLabel: 'label.path2',
      workLabel: 'label.work2',
      labelSide: -1,
    },
  ];

  const pointA: Vec2 = [0, c.aY];
  const pointB: Vec2 = [c.bX, c.bY];

  // ---- 높이 안내선 ----
  // A 의 높이는 점선으로 A 에서 막대 너머까지 긋는다 — 막대 끝이 닿는 목표다.
  // B 의 높이는 실선으로 B 에서 막대 너머까지 — 두 막대가 서는 바닥이다.
  out.push({
    type: 'trajectory',
    id: 'guide-a',
    points: [pointA, [GUIDE_END_X, c.aY]],
    width: GUIDE_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'trajectory',
    id: 'guide-b',
    points: [pointB, [GUIDE_END_X, c.bY]],
    width: GUIDE_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 높이 차 h ----
  // 치수선은 늘 둔다. 끝에서 두 막대가 이 길이와 같아지는 것이 판정 장치다.
  out.push({
    type: 'dimension',
    id: 'height',
    from: [MEASURE_X, c.bY],
    to: [MEASURE_X, c.aY],
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'height-label',
    anchor: { world: [MEASURE_X + MEASURE_LABEL_DX, (c.aY + c.bY) / 2] },
    text: text('label.height'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 길 둘 ----
  for (const lane of lanes) {
    out.push({
      type: 'trajectory',
      id: `path-${lane.id}`,
      points: samplePath(lane.path, c),
      width: PATH_WIDTH,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    const labelY = pathAt(PATH_LABEL_X, lane.path, c).y + lane.labelSide * PATH_LABEL_GAP;
    out.push({
      type: 'readout',
      id: `path-label-${lane.id}`,
      anchor: { world: [PATH_LABEL_X, labelY] },
      text: text(lane.pathLabel),
      chip: false,
      font: 'text',
      fontSize: PATH_LABEL_PX,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 두 점 A · B ----
  // B 의 이름표는 오른쪽 위에 둔다 — 아래에 두면 도착한 상자의 중력 화살표가 그 위를 지난다.
  for (const [id, pos, labelKey, offset] of [
    ['a', pointA, 'label.pointA', [-14, 0]],
    ['b', pointB, 'label.pointB', [24, -12]],
  ] as const) {
    out.push({
      type: 'body',
      id: `point-${id}`,
      pos,
      shape: 'point',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `point-label-${id}`,
      anchor: { world: pos, offset },
      text: text(labelKey),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 길마다: 막대 · 상자 · 중력 ----
  for (const lane of lanes) {
    const box = readBox(timeline, lane.path, c);

    // 중력이 한 일 ÷ mg. B 의 높이선 위에 서고, 음이면 그 아래로 내려간다. 막대 높이가
    // 곧 「A 보다 얼마나 내려왔나」 라서, 끝에서 윗변이 A 의 안내선에 닿는다.
    if (Math.abs(box.workOverMg) > BAR_EPS) {
      const top = c.bY + box.workOverMg;
      out.push({
        type: 'region',
        id: `work-${lane.id}`,
        points: [
          [lane.barX, c.bY],
          [lane.barX + BAR_W, c.bY],
          [lane.barX + BAR_W, top],
          [lane.barX, top],
        ],
        fillOpacity: BAR_FILL,
        outline: [[2, 3]],
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
    out.push({
      type: 'readout',
      id: `work-label-${lane.id}`,
      anchor: { world: [lane.barX + BAR_W / 2, BAR_LABEL_Y] },
      text: text(lane.workLabel),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: LABEL_PX,
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // 상자. 길에 맞춰 눕혀 길 위에 얹는다. 둘이 같은 크기 · 같은 색 — 같은 상자다.
    const [nx, ny] = [-Math.sin(box.angle), Math.cos(box.angle)];
    const center: Vec2 = [box.foot[0] + (nx * BOX_SIZE[1]) / 2, box.foot[1] + (ny * BOX_SIZE[1]) / 2];
    out.push({
      type: 'body',
      id: `box-${lane.id}`,
      pos: center,
      shape: 'rect',
      size: BOX_SIZE,
      orientation: box.angle,
      outline: 'none',
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // 중력. 어느 길의 어느 자리에서도 같은 크기 · 같은 방향이다 — 이 조각의 전제다.
    out.push({
      type: 'vector',
      id: `gravity-${lane.id}`,
      from: center,
      delta: [0, -MG_LEN],
      label: text('label.gravity'),
      labelSide: 'cw',
      outline: 'background',
      opacity: alpha,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
