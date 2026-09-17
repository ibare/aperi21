// ========================================================================
// buoyant-force-as-force — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 물통 · 손잡이 막대 · 수면선은 `trajectory`, 손잡이 끝판과
// 물체는 `body` rect, 용수철은 `constraint` spring, 물은 `region`(물체 위 반투명 덧칠),
// 세 힘은 `vector`, 화살표 이름은 `readout`. 캡션은 캡션 슬롯이 그린다.
//
// ---- 월드 = 원본 캔버스 ----
// 원본 캔버스 1px 을 월드 1 로 두고 y 만 위로 뒤집는다. 배치 상수를 그대로 옮긴다.
// ========================================================================

import type {
  Body,
  Constraint,
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { solve, supportAt } from './physics';
import { PHYSICS, text } from './schema';
import type { BuoyantForceAsForceState } from './state';

// ------------------------------------------------------------------------
// 배치 — 원본 index.html 의 상수 그대로
// ------------------------------------------------------------------------

/** 원본 캔버스(px). */
const W = 860;
const H = 360;
/** 캡션이 캔버스 안으로 들어오며 그림 아래 더 잡는 자리(원본 px). */
const CAPTION_ROOM = 34;

/** 원본 px(y 아래) → 월드(y 위). */
const at = (x: number, y: number): Vec2 => [x, H - y];

const WATER_Y = PHYSICS.waterY;
/** 물통 — 왼쪽 벽 · 오른쪽 벽 · 바닥. 벽은 수면보다 40 위까지 올라온다. */
const TANK = { x0: 250, x1: 610, y1: 345, rim: 40 } as const;
/** 물체 가운데 x. */
const CX = 430;
const BW = 64;
const BH = PHYSICS.blockH;
/** 무게 화살표 길이 — 모든 힘 화살표의 축척. */
const W_ARROW = 70;

/** 손잡이 끝판 반폭 · 반높이. */
const PLATE_HALF_W = 12;
const PLATE_HALF_H = 3;
/** 용수철은 끝판 아래 3px 에서 시작한다. */
const SPRING_FROM_DY = 3;
/** 원본 용수철 — 위·아래 한 벌이 7 번. */
const COILS = 7;

/**
 * 힘 화살표를 물체에 붙인다 (사용자 승인 수정, NOTES (a)). 꼬리는 물체 가운데 높이,
 * 가운데에서 좌우로 이만큼. 아래 힘(무게)은 왼쪽, 위 힘 둘은 오른쪽에 머리-꼬리로 잇는다.
 * 용수철 폭(코일 ±7)과 끝판(±12)에 겹치지 않을 만큼 벌렸다.
 */
const ARROW_DX = 20;
/** 이름 글자 — 물체 옆면에서 띄운 거리. */
const LABEL_GAP = 8;
/** 물이 미는 힘 이름의 높이 — 원본 `cy − min(길이, 20)/2`. */
const BUOY_LABEL_SPAN = 20;
/** 용수철이 당기는 힘 이름 — 무게 축척 끝에서 내린 거리(원본 6). */
const TENSION_LABEL_DY = 6;
/**
 * 글자가 수면선에 걸치지 않게 떼는 거리(원본 px) — 14px 글자 반 줄 + 여유
 * (사용자 승인 수정, NOTES (a)).
 */
const WATERLINE_CLEAR = 13;

// ------------------------------------------------------------------------
// 굵기 · 글자 — 원본 px
// ------------------------------------------------------------------------

const FONT_PX = 14;
const W_TANK = 2;
const W_ROD = 4;
const W_WATERLINE = 1.5;
const W_ARROW_LINE = 3;
/** 원본 화살촉 최대 크기. */
const HEAD = 10;

// ------------------------------------------------------------------------
// 색 — 강조색(accent)은 물이 미는 힘 하나에만. 무게 · 용수철 힘은 같은 먹색.
// 물의 파란색(secondary)은 물이라는 대상의 색이지 강조가 아니다.
// ------------------------------------------------------------------------

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const GREY = { colorRole: 'muted', emphasis: 'strong' } as const;
const GREY_LIGHT = { colorRole: 'muted', emphasis: 'medium' } as const;
const WATER = { colorRole: 'secondary', emphasis: 'strong' } as const;
const BUOY = { colorRole: 'accent', emphasis: 'strong' } as const;
/** 원본 물 채움 알파. */
const WATER_FILL_OPACITY = 0.38;

function line(id: string, points: readonly Vec2[], width: number, style: Trajectory['style']): Trajectory {
  return { type: 'trajectory', id, points, width, style };
}

function label(
  id: string,
  pos: Vec2,
  text_: Readout['text'],
  align: NonNullable<Readout['align']>,
  style: Readout['style'],
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text_,
    chip: false,
    align,
    font: 'text',
    fontSize: FONT_PX,
    style,
  };
}

/** 세로 화살표 — x, 꼬리 y, 머리 y(원본 px). */
function arrow(id: string, x: number, y0: number, y1: number, style: Vector['style']): Vector {
  return {
    type: 'vector',
    id,
    from: at(x, y0),
    delta: [0, y0 - y1],
    width: W_ARROW_LINE,
    headSize: HEAD,
    // 꼬리가 짙은 물체 위에 놓인다 — 바탕색으로 제 경계를 떼어 낸다.
    outline: 'background',
    style,
  };
}

/** 글자 높이 y 가 수면선에 걸치면 가까운 쪽으로 떼어 낸다. */
function clearOfWaterline(y: number): number {
  if (Math.abs(y - WATER_Y) >= WATERLINE_CLEAR) return y;
  return y < WATER_Y ? WATER_Y - WATERLINE_CLEAR : WATER_Y + WATERLINE_CLEAR;
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: BuoyantForceAsForceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('buoyant-force-as-force: schema.timeline 이 선언되어야 한다');

  const st = solve(supportAt(tl.at('lower') - tl.at('raise')));
  const out: Primitive[] = [];

  // ---- 물통 ----
  out.push(
    line(
      'tank',
      [
        at(TANK.x0, WATER_Y - TANK.rim),
        at(TANK.x0, TANK.y1),
        at(TANK.x1, TANK.y1),
        at(TANK.x1, WATER_Y - TANK.rim),
      ],
      W_TANK,
      GREY_LIGHT,
    ),
  );

  // ---- 손잡이 막대 ----
  out.push(line('rod', [at(CX, 0), at(CX, st.support)], W_ROD, GREY_LIGHT));
  const plate: Body = {
    type: 'body',
    id: 'plate',
    shape: 'rect',
    pos: at(CX, st.support),
    size: [PLATE_HALF_W * 2, PLATE_HALF_H * 2],
    outline: 'none',
    style: GREY_LIGHT,
  };
  out.push(plate);

  // ---- 용수철 ----
  const spring: Constraint = {
    type: 'constraint',
    id: 'spring',
    subtype: 'spring',
    from: at(CX, st.support + SPRING_FROM_DY),
    to: at(CX, st.top),
    coils: COILS,
    style: GREY,
  };
  out.push(spring);

  // ---- 물체 ----
  const block: Body = {
    type: 'body',
    id: 'block',
    shape: 'rect',
    pos: at(CX, st.top + BH / 2),
    size: [BW, BH],
    outline: 'none',
    style: GREY,
  };
  out.push(block);

  // ---- 물 ----
  // 물체 **뒤에** 선언해 위로 덮는다 — 수면 아래 부분이 저절로 푸르게 비친다.
  // 잠긴 부피를 따로 칠하지 않는다(강조색을 두 번째 뜻에 쓰지 않기 위해).
  const water: Region = {
    type: 'region',
    id: 'water',
    points: [
      at(TANK.x0 + 1, WATER_Y),
      at(TANK.x1 - 1, WATER_Y),
      at(TANK.x1 - 1, TANK.y1 - 1),
      at(TANK.x0 + 1, TANK.y1 - 1),
    ],
    fillOpacity: WATER_FILL_OPACITY,
    style: WATER,
  };
  out.push(water);
  out.push(line('waterline', [at(TANK.x0 + 1, WATER_Y), at(TANK.x1 - 1, WATER_Y)], W_WATERLINE, WATER));

  // ---- 세 힘 ----
  const cy = st.top + BH / 2;
  const gx = CX - ARROW_DX;
  const ux = CX + ARROW_DX;
  const buoyPx = W_ARROW * st.buoyancy;
  const tenPx = W_ARROW * st.tension;

  // 무게 — 처음부터 끝까지 길이가 변하지 않는다. 「무게가 줄어든다」 를 화면이 반박한다.
  out.push(arrow('weight', gx, cy, cy + W_ARROW, INK));
  // 이름은 물체 아래로 나온 구간의 가운데, 물체 왼쪽 면 바깥.
  out.push(
    label(
      'weight-label',
      at(CX - BW / 2 - LABEL_GAP, clearOfWaterline(cy + (BH / 2 + W_ARROW) / 2)),
      text('label.weight'),
      'right',
      INK,
    ),
  );

  // 위쪽 힘 둘을 머리-꼬리로 잇는다. 합친 끝은 늘 무게 길이와 같다.
  // 용수철 힘을 먼저 깔고 물이 미는 힘을 위에 — 잇는 자리에서 주황 머리가 온전히 보인다.
  out.push(arrow('tension', ux, cy - buoyPx, cy - buoyPx - tenPx, INK));
  out.push(
    label(
      'tension-label',
      at(CX + BW / 2 + LABEL_GAP, clearOfWaterline(cy - W_ARROW + TENSION_LABEL_DY)),
      text('label.tension'),
      'left',
      INK,
    ),
  );
  // 물 밖에서는 그리지 않는다.
  if (buoyPx >= 0.5) {
    out.push(arrow('buoyancy', ux, cy, cy - buoyPx, BUOY));
    out.push(
      label(
        'buoyancy-label',
        at(CX + BW / 2 + LABEL_GAP, clearOfWaterline(cy - Math.min(buoyPx, BUOY_LABEL_SPAN) / 2)),
        text('label.buoyancy'),
        'left',
        BUOY,
      ),
    );
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/**
 * 고정 경계. 원본 캔버스 한 장(860 × 360)을 그대로 담고, 아래로 캡션 자리를 더 잡는다.
 * 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
 */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { minX: 0, maxX: W, minY: -CAPTION_ROOM, maxY: H };
}
