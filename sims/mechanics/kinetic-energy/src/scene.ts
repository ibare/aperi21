// ========================================================================
// kinetic-energy — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 바닥(surface) ·
// 거친 띠와 미끄러진 자국(region) · 눈금(lineSet + readout) · 상자(body) ·
// 화살표(vector) · 미끄러진 거리(dimension)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 상자는 먹색(둘이 같은 대상이라 같은 색), 속도 화살표는
// primary, 마찰 화살표는 secondary, **강조색은 「미끄러진 거리」 한 가지 뜻에만**
// (자국 띠와 그것을 재는 치수선). 바닥 · 눈금은 배경 정보라 muted.
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
import { readBox, readConstants, sceneOpacity } from './physics';
import {
  BOX_SIZE,
  CELL,
  CELL_COUNT,
  CELL_LABELS,
  FRICTION_ARROW_LEN,
  FRICTION_ARROW_Y,
  LANE_FAST_Y,
  LANE_SLOW_Y,
  MEASURE_Y,
  ROUGH_DEPTH,
  ROUGH_END,
  ROUGH_START,
  SCENE_BOUNDS,
  SKID_THICKNESS,
  SPEED_ARROW_SCALE,
  SPEED_ARROW_Y,
  TICK_BOTTOM_Y,
  TICK_LABEL_Y,
  TICK_TOP_Y,
  text,
  type KineticEnergyMessageKey,
} from './schema';
import type { KineticEnergyState } from './state';

/** 눈금 이름표 글자 크기(화면 px). 자에 적힌 수라 본문보다 작다. */
const TICK_LABEL_PX = 11;
/** 눈금선 굵기(화면 px). 재는 선이지 그림의 일부가 아니라 가장 가늘게. */
const TICK_WIDTH = 1;
/** 눈금선 짙기. 상자 · 자국보다 뒤로 물러나 있어야 한다. */
const TICK_OPACITY = 0.45;
/** 거친 바닥 띠의 짙기. 바닥의 결이라 옅다. */
const ROUGH_FILL = 0.3;
/** 미끄러진 자국 띠의 짙기. 상자가 지나온 길이 다크 바탕에서도 또렷해야 한다. */
const SKID_FILL = 0.72;

/** 한 레인의 선언 — 바닥 높이와 진입 속력, 화살표에 붙는 기호. */
interface Lane {
  id: string;
  y: number;
  entrySpeed: number;
  speedLabel: KineticEnergyMessageKey;
}

export function scene(params: {
  state: KineticEnergyState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('kinetic-energy: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const out: Primitive[] = [];

  const lanes: Lane[] = [
    { id: 'slow', y: LANE_SLOW_Y, entrySpeed: c.vSlow, speedLabel: 'label.speedSlow' },
    { id: 'fast', y: LANE_FAST_Y, entrySpeed: c.vFast, speedLabel: 'label.speedFast' },
  ];

  // ---- 거친 바닥 ----
  // 사선 결로 깐다. 색을 따로 주면 「다른 바닥」 이 아니라 「다른 종류」 로 읽히고,
  // 두 레인의 바닥이 같다는 것이 이 조각의 전제다 (S-piece — 색으로 설명하지 않는다).
  for (const lane of lanes) {
    out.push({
      type: 'region',
      id: `rough-${lane.id}`,
      points: [
        [ROUGH_START, lane.y],
        [ROUGH_END, lane.y],
        [ROUGH_END, lane.y - ROUGH_DEPTH],
        [ROUGH_START, lane.y - ROUGH_DEPTH],
      ],
      fill: 'hatch',
      fillOpacity: ROUGH_FILL,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 눈금 ----
  // 한 칸 = 느린 상자가 미끄러진 거리 d. 두 레인을 세로로 꿰어야 「위가 한 칸일 때
  // 아래는 몇 칸인가」 를 눈으로 셀 수 있다. 재는 것이 거리 자체가 아니라 **칸 수**라
  // 거리 격자(`chrome.grid`)를 켜지 않는다.
  const ticks: Vec2[][] = [];
  for (let i = 1; i <= CELL_COUNT; i++) {
    const x = ROUGH_START + i * CELL;
    ticks.push([
      [x, TICK_BOTTOM_Y],
      [x, TICK_TOP_Y],
    ]);
  }
  out.push({
    type: 'lineSet',
    id: 'cell-ticks',
    lines: ticks,
    width: TICK_WIDTH,
    opacity: TICK_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  CELL_LABELS.forEach((labelKey, i) => {
    out.push({
      type: 'readout',
      id: `cell-label-${i + 1}`,
      anchor: { world: [ROUGH_START + (i + 1) * CELL, TICK_LABEL_Y] },
      text: text(labelKey),
      chip: false,
      fontSize: TICK_LABEL_PX,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  });

  // ---- 바닥선 ----
  for (const lane of lanes) {
    out.push({
      type: 'surface',
      id: `floor-${lane.id}`,
      geometry: { kind: 'wall', from: [SCENE_BOUNDS.minX, lane.y], to: [SCENE_BOUNDS.maxX, lane.y] },
      material: 'solid',
    });
  }

  // ---- 상자마다: 자국 · 상자 · 화살표 · 재어 본 거리 ----
  for (const lane of lanes) {
    const box = readBox(timeline, lane.entrySpeed, c);

    // 미끄러진 자국. 들어간 자리부터 지금 자리까지 바닥 위에 남는다 — 이 띠의
    // 길이가 곧 마찰이 일한 거리이고, 그것이 상자가 담고 있던 에너지다.
    if (box.slid > 0) {
      out.push({
        type: 'region',
        id: `skid-${lane.id}`,
        points: [
          [ROUGH_START, lane.y],
          [box.x, lane.y],
          [box.x, lane.y + SKID_THICKNESS],
          [ROUGH_START, lane.y + SKID_THICKNESS],
        ],
        fillOpacity: SKID_FILL,
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }

    // 상자. 둘이 같은 크기 · 같은 색이다 — 다른 것은 들어간 속력뿐이다.
    out.push({
      type: 'body',
      id: `box-${lane.id}`,
      pos: [box.x, lane.y + BOX_SIZE[1] / 2],
      shape: 'rect',
      size: BOX_SIZE,
      outline: 'none',
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // 속도 화살표. 길이가 속력에 비례해, 들어가는 순간 아래 화살표가 위의 두 배로
    // 보이고 미끄러지는 동안 함께 줄어든다. 기호는 속력이 변하지 않는 동안만 붙인다 —
    // 줄어드는 화살표에 `2v` 가 남아 있으면 화면과 어긋난다.
    if (box.speed > 0) {
      out.push({
        type: 'vector',
        id: `speed-${lane.id}`,
        from: [box.x, lane.y + SPEED_ARROW_Y],
        delta: [box.speed * SPEED_ARROW_SCALE, 0],
        label: box.sliding ? undefined : text(lane.speedLabel),
        opacity: alpha,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    }

    // 마찰 화살표. **두 레인의 길이가 같다** — 같은 상자가 같은 바닥에 눌려 있으니
    // 붙잡는 힘이 같다는 것이 이 조각의 전제다.
    if (box.sliding) {
      out.push({
        type: 'vector',
        id: `friction-${lane.id}`,
        from: [box.x - BOX_SIZE[0] / 2, lane.y + FRICTION_ARROW_Y],
        delta: [-FRICTION_ARROW_LEN, 0],
        label: text('label.friction'),
        labelSide: 'cw',
        outline: 'background',
        opacity: alpha,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
    }

    // 멈춘 뒤 미끄러진 거리를 잰다. 위 상자는 먼저 멈추므로 먼저 나타나고, 그
    // 순간 아래 상자는 아직 미끄러지는 중이다 — 「같은 시간, 다른 거리」가 화면에
    // 남는다.
    if (box.stopped) {
      out.push({
        type: 'dimension',
        id: `measure-${lane.id}`,
        from: [ROUGH_START, lane.y + MEASURE_Y],
        to: [box.x, lane.y + MEASURE_Y],
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
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
