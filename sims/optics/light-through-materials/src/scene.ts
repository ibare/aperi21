// ========================================================================
// light-through-materials — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 방은 빛 없음(`region` `light: 0`)이라 라이트 · 다크 모두 검다. 그 위의 빛 —
// 램프 · 줄기 · 흩어진 줄기 · 스크린에 닿은 빛 — 은 모두 빛 채널로 칠하고 세기가
// 줄기 세기 × 투과율에 비례한다. 빛이 닿지 않은 스크린은 방 바탕과 같은 검정이다: **그림자.**
//
// 판 셋은 빛이 아니라 색을 짓지 않는다 — 무채색 빛 세기와 채움으로 가른다(비치는 유리 · 뿌연 간유리 · 막힌 나무).
// 스크린 테처럼 빛이 아닌 것은 고정 회색 빛(`EQUIP_LIGHT`)으로 긋는다 — 역할 색 `muted` 는
// 라이트 테마에서 빛 없음 바탕과 거의 같은 짙기라 방 안에서 묻힌다 (NOTES (c)).
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LineSet,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  COLUMN_X,
  LAMP_PAD,
  LAMP_Y0,
  LAMP_Y1,
  LABEL_Y,
  PLATE_HALF_W,
  ROOM,
  SCENE_BOUNDS,
  SCREEN_Y0,
  SCREEN_Y1,
  BEAM_HALF,
  text,
  type LightThroughMaterialsMessageKey,
} from './schema';
import {
  PLATE_BOTTOM,
  PLATE_TOP,
  covers,
  insertion,
  lineXs,
  plateCenterX,
  readConstants,
  scatterAngles,
  scatterRay,
  screenIrradiance,
  type ScreenGrid,
} from './physics';
import type { LightThroughMaterialsState } from './state';

/** 줄기 · 흩어진 줄기 굵기(화면 px). */
const BEAM_PX = 1.5;
const SCATTER_PX = 1;
/** 흩어진 줄 하나에서 그려 보이는 줄기 수 — 스크린 밝기는 `SCREEN_SAMPLES` 개 전부로 만든다. */
const SCATTER_DRAWN = 3;
/** 스크린 칸 수 · 흩어진 줄 하나에서 뽑는 방향 수 · 떨어진 자리를 퍼뜨리는 종의 폭(월드). */
const SCREEN_COLS = 480;
const SCREEN_SAMPLES = 120;
const SCREEN_KERNEL = 0.2;
/** 빛이 아닌 것(스크린 테)을 긋는 고정 회색 빛의 세기 — 두 테마에서 같은 회색이다. */
const EQUIP_LIGHT = 0.3;
/** 스크린 테 굵기(화면 px). */
const EQUIP_PX = 1;
/** 재료 이름표 키 — `COLUMN_X` 와 같은 순서. */
const PLATE_LABEL: readonly LightThroughMaterialsMessageKey[] = ['label.glass', 'label.frosted', 'label.wood'];
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;

const rect = (x0: number, y0: number, x1: number, y1: number): Vec2[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];
/** 네모의 네 변 — `region.outline`. */
const RECT_EDGES: readonly (readonly [number, number])[] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
];

function beamSet(id: string, lines: Vec2[][], light: number, width: number): LineSet {
  return { type: 'lineSet', id, lines, width, light };
}

export function scene(params: {
  state: LightThroughMaterialsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('light-through-materials: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const s = insertion(timeline);
  const beam = c.beamIntensity;
  const out: Primitive[] = [];

  // ---- 어두운 방 — 빛 없음 ----
  out.push({
    type: 'region',
    id: 'room',
    points: rect(ROOM.minX, ROOM.minY, ROOM.maxX, ROOM.maxY),
    fillOpacity: 1,
    light: 0,
  });

  // ---- 스크린 — 칸마다 닿은 빛. 닿지 않은 곳은 빛 없음이라 방과 같다 ----
  const grid: ScreenGrid = {
    minX: ROOM.minX,
    maxX: ROOM.maxX,
    cols: SCREEN_COLS,
    kernel: SCREEN_KERNEL,
    samples: SCREEN_SAMPLES,
  };
  const values = screenIrradiance(c, s, grid);
  out.push({
    type: 'scalarField',
    id: 'screen',
    min: [grid.minX, SCREEN_Y0],
    max: [grid.maxX, SCREEN_Y1],
    cols: SCREEN_COLS,
    rows: 1,
    values,
    range: [0, 1],
    colors: 'light',
  });
  out.push({
    type: 'trajectory',
    id: 'screen-rim',
    points: rect(grid.minX, SCREEN_Y0, grid.maxX, SCREEN_Y1),
    closed: true,
    width: EQUIP_PX,
    light: EQUIP_LIGHT,
  });

  // ---- 줄기 — 가리지 않은 줄은 스크린까지, 가린 줄은 판 윗면까지. 판 아래는 재료가 정한다 ----
  const incoming: Vec2[][] = [];
  COLUMN_X.forEach((_, j) => {
    const m = c.materials[j]!;
    const plateX = plateCenterX(j, s);
    const through: Vec2[][] = [];
    const scattered: Vec2[][] = [];
    lineXs(j).forEach((x, i) => {
      if (!covers(plateX, x)) {
        incoming.push([
          [x, LAMP_Y0],
          [x, SCREEN_Y1],
        ]);
        return;
      }
      incoming.push([
        [x, LAMP_Y0],
        [x, PLATE_TOP],
      ]);
      if (m.transmit <= 0) return;
      if (m.passage === 'clear') {
        through.push([
          [x, PLATE_TOP],
          [x, SCREEN_Y1],
        ]);
        return;
      }
      for (const a of scatterAngles(c, j, i, SCATTER_DRAWN)) {
        const [p, q] = scatterRay(x, a);
        scattered.push([p, q]);
      }
    });
    if (through.length > 0) out.push(beamSet(`through-${j}`, through, beam * m.transmit, BEAM_PX));
    if (scattered.length > 0) {
      out.push(beamSet(`scattered-${j}`, scattered, beam * m.transmit * c.scatterRayShare, SCATTER_PX));
    }
  });
  out.push(beamSet('incoming', incoming, beam, BEAM_PX));

  // ---- 램프 셋 — 똑같은 빛 ----
  COLUMN_X.forEach((cx, j) => {
    out.push({
      type: 'region',
      id: `lamp-${j}`,
      points: rect(cx - BEAM_HALF - LAMP_PAD, LAMP_Y0, cx + BEAM_HALF + LAMP_PAD, LAMP_Y1),
      fillOpacity: 1,
      light: beam,
    });
  });

  // ---- 판 셋 ----
  COLUMN_X.forEach((_, j) => {
    const px = plateCenterX(j, s);
    const m = c.materials[j]!;
    out.push({
      type: 'region',
      id: `plate-${j}`,
      points: rect(px - PLATE_HALF_W, PLATE_BOTTOM, px + PLATE_HALF_W, PLATE_TOP),
      fillOpacity: m.fill,
      outline: RECT_EDGES,
      light: m.look,
    });
  });

  // ---- 재료 이름표 — 방 밖 테마 바탕 위, 그 판이 들어가는 줄기 아래 ----
  COLUMN_X.forEach((cx, j) => {
    out.push({
      type: 'readout',
      id: `label-${j}`,
      anchor: { world: [cx, LABEL_Y] },
      text: text(PLATE_LABEL[j]!),
      chip: false,
      font: 'text',
      align: 'center',
      fontSize: LABEL_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
