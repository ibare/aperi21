// ========================================================================
// normal-force — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음.
//
// 바닥(region 채움 + trajectory 윗면, 눌린 자리는 베지어 표본) · 막대(trajectory) ·
// 상자(region 채움 + trajectory 윤곽) · 힘 셋(vector + readout 이름표).
// 캡션은 선언의 캡션 슬롯이 그린다. 그리는 순서는 원본 mark 순서다 (`drawOrder: 'scene'`).
//
// 원본 좌표(아래로 +)를 월드(위로 +)로 옮길 때 y 만 뒤집는다.
// ========================================================================

import type { Bounds, Primitive, Readout, SceneGraph, StageDef, Vec2 } from '@aperi21/schema';

import { readConstants } from './physics';
import {
  BH,
  BW,
  CX,
  DENT_EASE,
  DENT_PER_N,
  FLOOR_DEPTH,
  FLOOR_Y,
  MAT_HALF,
  PX_PER_M,
  PX_PER_N,
  SCENE_BOUNDS,
  text,
  type NormalForceMessageKey,
} from './schema';
import type { NormalForceState } from './state';

// ------------------------------------------------------------------------
// 원본 그리기 치수 (px)
// ------------------------------------------------------------------------

/** 바닥 윗면 · 상자 테두리 굵기. */
const EDGE_WIDTH = 1.5;
/** 막대 굵기. */
const ROD_WIDTH = 6;
/** 무게 · 막대 힘 화살표 굵기, 수직항력 화살표 굵기. */
const ARROW_WIDTH = 3;
const NORMAL_WIDTH = 4;
/** 화살촉 길이(월드 = 원본 px). 원본 min(12, 길이). 짧은 화살표는 렌더러가 비율로 줄인다. */
const ARROW_HEAD = 12;
/** 이름표 글자 크기. */
const LABEL_FONT = 15;
/** 무게 화살표 — 상자 오른쪽에서 뗀 거리, 이름표 틈 · 아래로 내림. */
const WEIGHT_DX = 46;
const WEIGHT_LABEL_DX = 14;
const WEIGHT_LABEL_DY = 12;
/** 막대 힘 화살표 — 막대에서 뗀 거리, 상자 윗면과의 틈, 이름표 틈, 0 일 때 글자 자리. */
const ROD_ARROW_DX = 22;
const ROD_ARROW_GAP = 4;
const ROD_LABEL_DX = 14;
const ROD_ZERO_DX = 6;
const ROD_ZERO_DY = 22;
/** 수직항력 화살표 — 상자 왼쪽에서 뗀 거리, 이름표 틈, 0 일 때 글자 높이. */
const NORMAL_DX = 46;
const NORMAL_LABEL_DX = 14;
const NORMAL_ZERO_DY = 12;
/** 베지어 한 구간을 자르는 마디 수. */
const CURVE_STEPS = 12;
/**
 * 채움 짙기. 원본은 바탕보다 살짝 짙은 무채색 판(--floor)과 그보다 조금 더 짙은
 * 상자(--block)였다. 색 리터럴 대신 무채색 역할을 불투명하게 옅게 깐다 (C2).
 */
const FLOOR_FILL = 0.1;
const BLOCK_FILL = 0.18;

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const edge = { colorRole: 'muted', emphasis: 'strong' } as const;
const rodStyle = { colorRole: 'muted', emphasis: 'medium' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;

/** 원본 좌표 → 월드. y 를 뒤집는다. */
function at(x: number, y: number): Vec2 {
  return [x, -y];
}

/** 3차 베지어를 표본으로 자른다. 시작점은 빼고 끝점은 넣는다. */
function cubic(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 1; i <= CURVE_STEPS; i++) {
    const s = i / CURVE_STEPS;
    const m = 1 - s;
    const a = m * m * m;
    const b = 3 * m * m * s;
    const c = 3 * m * s * s;
    const d = s * s * s;
    out.push([
      a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
      a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
    ]);
  }
  return out;
}

function label(
  id: string,
  key: NormalForceMessageKey,
  pos: Vec2,
  align: Readout['align'],
  style: Readout['style'],
  vars?: Readout['vars'],
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text(key),
    ...(vars ? { vars } : {}),
    chip: false,
    align,
    font: 'text',
    fontSize: LABEL_FONT,
    style,
  };
}

export function scene(params: { state: NormalForceState; stage: StageDef }): SceneGraph {
  const { state, stage } = params;
  const k = readConstants(stage.constants);
  const { Fd, Nd } = state;
  const out: Primitive[] = [];

  const dent = state.N * DENT_PER_N;
  const lift = state.h * PX_PER_M;
  const blockBottom = FLOOR_Y + dent - lift;
  const blockTop = blockBottom - BH;
  const bx = CX - BW / 2;

  // ---- 바닥 ----
  // 상자 아래만 눌려 들어간 윗면. 원본의 두 베지어를 같은 제어점으로 자른다.
  const x0 = CX - MAT_HALF;
  const x1 = CX + MAT_HALF;
  const e = DENT_EASE;
  const top: Vec2[] = [
    at(x0, FLOOR_Y),
    at(bx - e, FLOOR_Y),
    ...cubic(at(bx - e, FLOOR_Y), at(bx - e / 2, FLOOR_Y), at(bx - 4, FLOOR_Y + dent), at(bx, FLOOR_Y + dent)),
    at(bx + BW, FLOOR_Y + dent),
    ...cubic(
      at(bx + BW, FLOOR_Y + dent),
      at(bx + BW + 4, FLOOR_Y + dent),
      at(bx + BW + e / 2, FLOOR_Y),
      at(bx + BW + e, FLOOR_Y),
    ),
    at(x1, FLOOR_Y),
  ];
  out.push({
    type: 'region',
    id: 'floor-fill',
    points: [...top, at(x1, FLOOR_Y + FLOOR_DEPTH), at(x0, FLOOR_Y + FLOOR_DEPTH)],
    opaque: true,
    fillOpacity: FLOOR_FILL,
    style: edge,
  });
  out.push({ type: 'trajectory', id: 'floor-top', points: top, width: EDGE_WIDTH, style: edge });

  // ---- 막대 ----
  out.push({
    type: 'trajectory',
    id: 'rod',
    points: [at(CX, 0), at(CX, blockTop)],
    width: ROD_WIDTH,
    style: rodStyle,
  });

  // ---- 상자 ----
  const box: Vec2[] = [at(bx, blockTop), at(bx + BW, blockTop), at(bx + BW, blockBottom), at(bx, blockBottom)];
  out.push({ type: 'region', id: 'box-fill', points: box, opaque: true, fillOpacity: BLOCK_FILL, style: edge });
  out.push({ type: 'trajectory', id: 'box-outline', points: box, closed: true, width: EDGE_WIDTH, style: edge });

  // ---- 무게 화살표 ----
  // 길이는 고정이고 상자 위치만 따라간다.
  const wx = bx + BW + WEIGHT_DX;
  const wy0 = blockTop + BH / 2;
  out.push({
    type: 'vector',
    id: 'weight',
    from: at(wx, wy0),
    delta: [0, -k.weight * PX_PER_N],
    width: ARROW_WIDTH,
    headSize: ARROW_HEAD,
    style: ink,
  });
  out.push(label('weight-label', 'label.weight', at(wx + WEIGHT_LABEL_DX, wy0 + WEIGHT_LABEL_DY), 'left', ink, { w: k.weight }));

  // ---- 막대 힘 화살표 ----
  // 화면에 쓰는 정수 힘으로 그린다 — 화살표 길이와 글자가 같은 값이다.
  const rx = CX + ROD_ARROW_DX;
  const ry = blockTop - ROD_ARROW_GAP;
  if (Fd !== 0) {
    const len = Math.abs(Fd) * PX_PER_N;
    // 당김은 윗면에서 위로, 누름은 위에서 윗면으로.
    const fromY = Fd > 0 ? ry : ry - len;
    out.push({
      type: 'vector',
      id: 'rod-force',
      from: at(rx, fromY),
      delta: [0, Fd > 0 ? len : -len],
      width: ARROW_WIDTH,
      headSize: ARROW_HEAD,
      style: ink,
    });
    out.push(
      label('rod-force-label', Fd > 0 ? 'label.pull' : 'label.push', at(rx + ROD_LABEL_DX, ry - len / 2), 'left', ink, {
        f: Math.abs(Fd),
      }),
    );
  } else {
    out.push(label('rod-force-label', 'label.rodZero', at(rx + ROD_ZERO_DX, blockTop - ROD_ZERO_DY), 'left', edge));
  }

  // ---- 수직항력 화살표 ----
  // 강조색은 이 화살표와 그 글자 하나에만 쓴다. 0 이면 화살표 없이 글자만.
  const nx = bx - NORMAL_DX;
  const ny0 = FLOOR_Y + dent;
  if (Nd > 0) {
    out.push({
      type: 'vector',
      id: 'normal',
      from: at(nx, ny0),
      delta: [0, Nd * PX_PER_N],
      width: NORMAL_WIDTH,
      headSize: ARROW_HEAD,
      style: accent,
    });
    out.push(label('normal-label', 'label.normal', at(nx - NORMAL_LABEL_DX, ny0 - (Nd * PX_PER_N) / 2), 'right', accent, { n: Nd }));
  } else {
    out.push(label('normal-label', 'label.normal', at(nx - NORMAL_LABEL_DX, FLOOR_Y - NORMAL_ZERO_DY), 'right', accent, { n: 0 }));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계 — 원본 캔버스 전체와 캡션 한 줄. 매 프레임 같은 값이라 카메라가 흔들리지 않는다. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
