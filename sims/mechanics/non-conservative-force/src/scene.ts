// ========================================================================
// non-conservative-force — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 —
// 거친 바닥(surface `rough`) · 잃은 에너지 막대(region) · A · B 기준선(lineSet) · 상자(body) ·
// 마찰 화살표(vector) · A→B 치수선(dimension) · 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 상자는 먹색(둘이 같은 대상이라 같은 색), 마찰 화살표는
// secondary, **강조색은 「마찰로 잃은 에너지」 한 가지 뜻에만** (막대와 그 끝 표식).
// 바닥 · 기준선 · 치수선은 배경 정보라 muted.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  ViewDef,
} from '@aperi21/schema';
import { readConstants, readDetour, readDirect, sceneOpacity, type BoxReading } from './physics';
import {
  BAR_BOTTOM,
  BAR_SCALE,
  BAR_TOP,
  BOX_SIZE,
  FRICTION_ARROW_LEN,
  FRICTION_ARROW_Y,
  GUIDE_BOTTOM_Y,
  GUIDE_LABEL_Y,
  GUIDE_TOP_Y,
  LANE_DETOUR_Y,
  LANE_DIRECT_Y,
  POINT_A,
  ROUGH_END,
  ROUGH_START,
  SCENE_BOUNDS,
  SPAN_MEASURE_Y,
  text,
  type NonConservativeForceMessageKey,
} from './schema';
import type { NonConservativeForceState } from './state';

/** 이름표 글자 크기(화면 px). 도식 표식이라 본문보다 작다. */
const LABEL_PX = 12;
/** 막대 끝 표식 글자 크기(화면 px). 강조색 수식이라 조금 크게. */
const LOSS_LABEL_PX = 13;
/** 막대 끝 · 이름표를 막대에서 띄우는 거리(화면 px). */
const LABEL_GAP_PX = 7;
/** 기준선 굵기(화면 px). 재는 선이지 그림의 일부가 아니라 가장 가늘게. */
const GUIDE_WIDTH = 1;
/** 기준선 짙기. 상자 · 막대보다 뒤로 물러나 있어야 한다. */
const GUIDE_OPACITY = 0.5;
/** 잃은 에너지 막대의 짙기. 다크 바탕에서도 또렷해야 한다. */
const BAR_FILL = 0.78;

/** 한 레인의 선언 — 바닥 높이, 상자 읽기, 막대 끝 표식. */
interface Lane {
  id: string;
  y: number;
  box: BoxReading;
  lossLabel: NonConservativeForceMessageKey;
}

export function scene(params: {
  state: NonConservativeForceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('non-conservative-force: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const pointB = POINT_A + c.span;
  const out: Primitive[] = [];

  const lanes: Lane[] = [
    { id: 'direct', y: LANE_DIRECT_Y, box: readDirect(timeline, c), lossLabel: 'label.lossDirect' },
    { id: 'detour', y: LANE_DETOUR_Y, box: readDetour(timeline, c), lossLabel: 'label.lossDetour' },
  ];

  // ---- A · B 기준선 ----
  // 두 레인과 두 막대를 세로로 꿴다. 위아래 상자가 **같은 두 점** 사이를 옮겨진다는
  // 것이 이 선으로 서고, B 선이 막대까지 내려와 「위 막대 끝 = L」 을 아래 막대와 맞대
  // 볼 수 있게 한다.
  out.push({
    type: 'lineSet',
    id: 'guides',
    lines: [
      [
        [POINT_A, GUIDE_BOTTOM_Y],
        [POINT_A, GUIDE_TOP_Y],
      ],
      [
        [pointB, GUIDE_BOTTOM_Y],
        [pointB, GUIDE_TOP_Y],
      ],
    ],
    width: GUIDE_WIDTH,
    opacity: GUIDE_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const guideLabels: [number, NonConservativeForceMessageKey][] = [
    [POINT_A, 'label.pointA'],
    [pointB, 'label.pointB'],
  ];
  for (const [x, k] of guideLabels) {
    out.push({
      type: 'readout',
      id: `guide-label-${k}`,
      anchor: { world: [x, GUIDE_LABEL_Y] },
      text: text(k),
      chip: false,
      fontSize: LABEL_PX,
      font: 'text',
      weight: 'bold',
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  // A→B 의 거리 L. 막대 끝 표식(fL · 2fL)의 L 이 무엇인지 여기서 선다.
  out.push({
    type: 'dimension',
    id: 'span-ab',
    from: [POINT_A, SPAN_MEASURE_Y],
    to: [pointB, SPAN_MEASURE_Y],
    text: text('label.span'),
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  for (const lane of lanes) {
    const { box, y } = lane;

    // ---- 거친 바닥 ----
    // 결은 면의 재질이다 — `rough` 면이 바닥선 아래로 사선 결을 긋는다. 두 레인의 바닥이
    // 같다는 것이 전제라 색을 가르지 않는다.
    out.push({
      type: 'surface',
      id: `floor-${lane.id}`,
      geometry: { kind: 'wall', from: [ROUGH_START, y], to: [ROUGH_END, y] },
      material: 'rough',
    });

    // ---- 잃은 에너지 막대 ----
    // 지나온 길을 A 에서부터 **펴 놓은** 길이다(1 m = 1 m). 상자가 되돌아와도 막대는
    // 오른쪽으로 계속 자란다 — 자리는 되돌아와도 잃은 것은 되돌아오지 않는다.
    const barMidY = y + (BAR_TOP + BAR_BOTTOM) / 2;
    out.push({
      type: 'readout',
      id: `lost-label-${lane.id}`,
      anchor: { world: [POINT_A, barMidY], offset: [-LABEL_GAP_PX, 0] },
      text: text('label.lost'),
      chip: false,
      fontSize: LABEL_PX,
      font: 'text',
      align: 'right',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    if (box.path > 0) {
      const barEnd = POINT_A + box.path * BAR_SCALE;
      out.push({
        type: 'region',
        id: `loss-${lane.id}`,
        points: [
          [POINT_A, y + BAR_TOP],
          [barEnd, y + BAR_TOP],
          [barEnd, y + BAR_BOTTOM],
          [POINT_A, y + BAR_BOTTOM],
        ],
        fillOpacity: BAR_FILL,
        opaque: true,
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
      // 제 여정을 마친 막대에만 끝 표식을 건다. 위 막대는 아래 상자가 아직 가는 동안
      // 먼저 fL 로 멎는다 — 「같은 B 에 섰는데 한쪽은 아직 잃는 중」 이 한 화면에 남는다.
      if (box.done) {
        out.push({
          type: 'readout',
          id: `loss-label-${lane.id}`,
          anchor: { world: [barEnd, barMidY], offset: [LABEL_GAP_PX, 0] },
          text: text(lane.lossLabel),
          chip: false,
          fontSize: LOSS_LABEL_PX,
          italic: true,
          weight: 'bold',
          align: 'left',
          opacity: alpha,
          style: { colorRole: 'accent', emphasis: 'strong' },
        });
      }
    }

    // ---- 상자 ----
    // 둘이 같은 크기 · 같은 색이다 — 다른 것은 지나온 길뿐이다.
    out.push({
      type: 'body',
      id: `box-${lane.id}`,
      pos: [box.x, y + BOX_SIZE[1] / 2],
      shape: 'rect',
      size: BOX_SIZE,
      outline: 'none',
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // ---- 마찰 화살표 ----
    // 움직이는 동안만, 늘 움직임의 **반대**를 향한다. 아래 상자가 돌아올 때 화살표가
    // 뒤집혀 다시 거스른다 — 마찰은 한 번도 돌려주지 않는다. 두 레인에서 같은 길이다.
    if (box.dir !== 0) {
      const rear = box.x - (box.dir * BOX_SIZE[0]) / 2;
      out.push({
        type: 'vector',
        id: `friction-${lane.id}`,
        from: [rear, y + FRICTION_ARROW_Y],
        delta: [-box.dir * FRICTION_ARROW_LEN, 0],
        label: text('label.friction'),
        labelSide: box.dir > 0 ? 'cw' : 'ccw',
        outline: 'background',
        opacity: alpha,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
