// ========================================================================
// pressure-from-collisions — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽은 상자 둘 — 속력 v 와 kv. 벽 셋(surface) · 재는 오른쪽 벽(trajectory, 굵게) ·
// 분자(particleSystem) · 오른쪽 벽에 닿은 순간의 섬광(trace ring).
// 상자마다 아래 두 줄 — 한 번의 세기(vector) · 같은 시간에 센 횟수(lineSet 눈금).
// 오른쪽은 압력 막대 둘 — 닿을 때마다 그 세기만큼의 한 칸(region)이 쌓인다.
//
// 색은 뜻마다 하나다. **강조색은 「벽을 때린 한 번」 한 뜻에만** — 섬광 · 세기 화살표 ·
// 눈금 · 막대 칸이 모두 그 한 번이다. 분자는 secondary, 벽과 글자는 ink.
// 두 상자는 같은 색이다 — 무엇이 다른지는 위의 속력 표식 `v` · `kv` 가 말한다.
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
import { impulsePerHit, readConstants, readMolecules, wallHits, type BoxFrame, type WallHit } from './physics';
import {
  BAR_BASE,
  BAR_GAP,
  BAR_PITCH,
  BAR_WIDTH,
  BOX_GAP,
  BOX_ORIGIN,
  ROW_ARROW_Y,
  ROW_TALLY_Y,
  SCENE_BOUNDS,
  TALLY_HALF,
  TALLY_SPACING,
  text,
  type PressureFromCollisionsMessageKey,
} from './schema';
import type { PressureFromCollisionsState } from './state';

/** 분자 점 반지름(화면 px). */
const MOLECULE_PX = 3.2;
/** 분자 자취 — 속도 × 이 시간(초)만큼의 획, 굵기(화면 px), 짙기. 획 길이가 속력이다. */
const TRAIL_SECONDS = 0.22;
const TRAIL_WIDTH_PX = 1.6;
const TRAIL_OPACITY = 0.5;
/** 재는 오른쪽 벽의 굵기(화면 px). 나머지 벽(surface)보다 굵어 「이 벽」 으로 읽힌다. */
const MEASURED_WALL_PX = 5;
/** 벽 섬광 — 처음 반지름에서 퍼지는 끝 반지름 · 획 굵기(화면 px). */
const FLASH_RING_PX = 4;
const FLASH_SPREAD_PX = 18;
const FLASH_WIDTH_PX = 3;
/** 한 번의 세기 화살표 굵기(화면 px). */
const ARROW_WIDTH_PX = 3;
/** 세는 눈금 굵기(화면 px). */
const TALLY_WIDTH_PX = 2.5;
/** 막대 칸 채움의 짙기. 칸 경계선이 또렷하고 안은 옅다. */
const BLOCK_FILL = 0.35;
/** 막대 바닥선 — 두 막대 밖으로 나오는 여유(월드) · 굵기(화면 px). */
const BAR_FLOOR_OVERHANG = 0.14;
const BAR_FLOOR_PX = 1.5;
/** 표식 글자 크기(화면 px). */
const MARK_PX = 15;
const ROW_LABEL_PX = 13;
const RESULT_PX = 14;
/** 글자를 앵커에서 띄우는 거리(화면 px). */
const BOX_LABEL_GAP_PX = 14;
const ROW_LABEL_GAP_PX = 12;
const TIP_LABEL_GAP_PX = 8;
const BAR_LABEL_GAP_PX = 14;
const PRESSURE_LABEL_GAP_PX = 34;
const RESULT_GAP_PX = 12;

function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

/** 상자 하나 — 속력 배수, 표식, 막대 자리, 그리고 지금 프레임에 읽은 것. */
interface Column {
  id: 'slow' | 'fast';
  s: number;
  box: BoxFrame;
  barX: number;
  speedLabel: PressureFromCollisionsMessageKey;
  impulseLabel: PressureFromCollisionsMessageKey;
}

export function scene(params: {
  state: PressureFromCollisionsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('pressure-from-collisions: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];
  const t = tl.t;

  // ---- 시간표에서 읽는 짙기 ----
  // 세기 화살표와 두 줄 이름표는 `hit` 단계에 나타나 `clear` 단계에 사라진다.
  const rowsVis = tl.at('hit') * (1 - tl.at('clear'));
  // 센 것(눈금 · 칸)은 세는 동안 쌓이고 `clear` 단계에 사라진다.
  const countVis = 1 - tl.at('clear');
  // 배수 글자는 세기가 끝난 뒤부터.
  const resultVis = tl.at('count') >= 1 ? countVis : 0;

  // 이번 주기의 세는 구간(조각 시계). 세기 전이면 비어 있다.
  const cycleStart = t - tl.u;
  const countFrom = cycleStart + tl.start('count');
  const countTo = Math.min(t, cycleStart + tl.end('count'));

  const slowLeft = BOX_ORIGIN.x;
  const fastLeft = slowLeft + c.boxWidth + BOX_GAP;
  const barSlowX = fastLeft + c.boxWidth + BAR_GAP + BAR_WIDTH / 2;
  const columns: Column[] = [
    {
      id: 'slow',
      s: 1,
      box: { left: slowLeft, bottom: BOX_ORIGIN.y },
      barX: barSlowX,
      speedLabel: 'label.speed',
      impulseLabel: 'label.impulse',
    },
    {
      id: 'fast',
      s: c.speedFactor,
      box: { left: fastLeft, bottom: BOX_ORIGIN.y },
      barX: barSlowX + BAR_PITCH,
      speedLabel: 'label.speedTimes',
      impulseLabel: 'label.impulseTimes',
    },
  ];

  // ---- 막대 바닥선 ----
  out.push({
    type: 'trajectory',
    id: 'bar-floor',
    points: [
      [barSlowX - BAR_WIDTH / 2 - BAR_FLOOR_OVERHANG, BAR_BASE],
      [barSlowX + BAR_PITCH + BAR_WIDTH / 2 + BAR_FLOOR_OVERHANG, BAR_BASE],
    ],
    width: BAR_FLOOR_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  for (const col of columns) {
    const { box } = col;
    const right = box.left + c.boxWidth;
    const top = box.bottom + c.boxHeight;

    // ---- 분자 ----
    const field = readMolecules(state.molecules, t, col.s, box, c);
    out.push({
      type: 'particleSystem',
      id: `molecules-${col.id}`,
      positions: field.positions,
      velocities: field.velocities,
      sizes: MOLECULE_PX,
      trail: true,
      trailStyle: { seconds: TRAIL_SECONDS, width: TRAIL_WIDTH_PX, opacity: TRAIL_OPACITY },
      // 벽에서 막 튕긴 분자의 자취가 벽 밖으로 새지 않게 상자 안에만 그린다.
      clip: { min: [box.left, box.bottom], max: [right, top] },
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });

    // ---- 벽 ----
    // 왼쪽 · 위 · 아래는 가두는 벽, 오른쪽은 재는 벽이라 굵다.
    out.push({
      type: 'surface',
      id: `wall-left-${col.id}`,
      geometry: { kind: 'wall', from: [box.left, top], to: [box.left, box.bottom] },
      material: 'solid',
    });
    out.push({
      type: 'surface',
      id: `wall-top-${col.id}`,
      geometry: { kind: 'wall', from: [box.left, top], to: [right, top] },
      material: 'solid',
    });
    out.push({
      type: 'surface',
      id: `wall-bottom-${col.id}`,
      geometry: { kind: 'wall', from: [box.left, box.bottom], to: [right, box.bottom] },
      material: 'solid',
    });
    out.push({
      type: 'trajectory',
      id: `wall-measured-${col.id}`,
      points: [
        [right, box.bottom],
        [right, top],
      ],
      width: MEASURED_WALL_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // ---- 벽 섬광 ----
    // 오른쪽 벽에 닿은 순간마다 그 자리에서 퍼진다. 세는 단계 밖에서도 늘 — 벽은 늘 맞고 있다.
    const recent = wallHits(state.molecules, t - c.flashSeconds, t, col.s, box, c);
    if (recent.length > 0) {
      out.push({
        type: 'trace',
        id: `flash-${col.id}`,
        marks: recent.map((h) => ({ pos: [right, h.y] as Vec2, age: t - h.time })),
        life: c.flashSeconds,
        shape: 'ring',
        size: FLASH_RING_PX,
        spreadTo: FLASH_SPREAD_PX,
        width: FLASH_WIDTH_PX,
        // 벽 안쪽(왼쪽 반원)으로만 퍼진다 — 벽 너머는 상자 밖이다.
        arc: [Math.PI / 2, (3 * Math.PI) / 2],
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }

    // ---- 속력 표식 ----
    out.push({
      type: 'readout',
      id: `speed-${col.id}`,
      anchor: { world: [box.left + c.boxWidth / 2, top], offset: [0, -BOX_LABEL_GAP_PX] },
      text: text(col.speedLabel),
      vars: { k: state.k },
      chip: false,
      font: 'text',
      italic: true,
      fontSize: MARK_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // ---- 1 줄 — 한 번의 세기 ----
    const impulse = impulsePerHit(c, col.s);
    const arrowLen = impulse * c.arrowPerMomentum;
    if (rowsVis > 0) {
      out.push({
        type: 'vector',
        id: `impulse-${col.id}`,
        from: [box.left, ROW_ARROW_Y],
        delta: [arrowLen, 0],
        width: ARROW_WIDTH_PX,
        opacity: rowsVis,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
      out.push({
        type: 'readout',
        id: `impulse-label-${col.id}`,
        anchor: { world: [box.left + arrowLen, ROW_ARROW_Y], offset: [TIP_LABEL_GAP_PX, 0] },
        text: text(col.impulseLabel),
        vars: { k: state.k },
        chip: false,
        font: 'text',
        italic: true,
        align: 'left',
        fontSize: ROW_LABEL_PX,
        opacity: rowsVis,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }

    // ---- 2 줄 — 같은 시간에 센 횟수 · 막대 칸 ----
    const counted: WallHit[] = wallHits(state.molecules, countFrom, countTo, col.s, box, c);
    if (counted.length > 0 && countVis > 0) {
      out.push({
        type: 'lineSet',
        id: `tally-${col.id}`,
        lines: counted.map((_, i) => {
          const x = box.left + TALLY_SPACING * (i + 0.5);
          return [
            [x, ROW_TALLY_Y - TALLY_HALF],
            [x, ROW_TALLY_Y + TALLY_HALF],
          ] as Vec2[];
        }),
        width: TALLY_WIDTH_PX,
        opacity: countVis,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });

      // 한 번 닿을 때마다 그 세기만큼의 한 칸. 칸 높이가 세기, 칸 수가 횟수다.
      const blockH = impulse * c.blockPerMomentum;
      const x0 = col.barX - BAR_WIDTH / 2;
      const x1 = col.barX + BAR_WIDTH / 2;
      counted.forEach((_, i) => {
        out.push({
          type: 'region',
          id: `block-${col.id}-${i}`,
          points: rect(x0, BAR_BASE + i * blockH, x1, BAR_BASE + (i + 1) * blockH),
          fillOpacity: BLOCK_FILL,
          outline: [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 0],
          ],
          opacity: countVis,
          style: { colorRole: 'accent', emphasis: 'strong' },
        });
      });

      // 배수 글자 — 세기가 끝난 뒤, 빠른 쪽 눈금 끝과 막대 위에. 값은 선언값 그대로다.
      if (col.id === 'fast' && resultVis > 0) {
        out.push({
          type: 'readout',
          id: 'tally-times',
          anchor: {
            world: [box.left + TALLY_SPACING * counted.length, ROW_TALLY_Y],
            offset: [TIP_LABEL_GAP_PX, 0],
          },
          text: text('label.times'),
          vars: { k: state.k },
          chip: false,
          font: 'text',
          align: 'left',
          fontSize: RESULT_PX,
          weight: 'bold',
          opacity: resultVis,
          style: { colorRole: 'ink', emphasis: 'strong' },
        });
        out.push({
          type: 'readout',
          id: 'bar-times',
          anchor: { world: [col.barX, BAR_BASE + counted.length * blockH], offset: [0, -RESULT_GAP_PX] },
          text: text('label.timesTimes'),
          vars: { k: state.k },
          chip: false,
          font: 'text',
          fontSize: RESULT_PX,
          weight: 'bold',
          opacity: resultVis,
          style: { colorRole: 'ink', emphasis: 'strong' },
        });
      }
    }

    // ---- 막대 아래 속력 표식 ----
    out.push({
      type: 'readout',
      id: `bar-speed-${col.id}`,
      anchor: { world: [col.barX, BAR_BASE], offset: [0, BAR_LABEL_GAP_PX] },
      text: text(col.speedLabel),
      vars: { k: state.k },
      chip: false,
      font: 'text',
      italic: true,
      fontSize: ROW_LABEL_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 두 줄 이름표 — 왼쪽 상자 앞 ----
  if (rowsVis > 0) {
    const rows: { id: string; y: number; key: PressureFromCollisionsMessageKey }[] = [
      { id: 'row-hit', y: ROW_ARROW_Y, key: 'label.rowHit' },
      { id: 'row-count', y: ROW_TALLY_Y, key: 'label.rowCount' },
    ];
    for (const row of rows) {
      out.push({
        type: 'readout',
        id: row.id,
        anchor: { world: [slowLeft, row.y], offset: [-ROW_LABEL_GAP_PX, 0] },
        text: text(row.key),
        chip: false,
        font: 'text',
        align: 'right',
        fontSize: ROW_LABEL_PX,
        opacity: rowsVis,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
    }
  }

  // ---- 압력 기호 — 두 막대 아래 가운데 ----
  out.push({
    type: 'readout',
    id: 'pressure-mark',
    anchor: { world: [barSlowX + BAR_PITCH / 2, BAR_BASE], offset: [0, PRESSURE_LABEL_GAP_PX] },
    text: text('label.pressure'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: MARK_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
