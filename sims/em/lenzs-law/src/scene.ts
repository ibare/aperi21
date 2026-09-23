// ========================================================================
// lenzs-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 극은 색이 아니라 명도와 글자로 가른다 — 강조색은 '힘' 한 뜻에만 쓴다.
// 코일(trajectory 다섯) · 전하(trace) · 화살촉(body custom) · 자석(body rect) ·
// 화살표(vector) · 이름표(readout). 자유 렌더 계층을 쓰지 않는다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { readConstants } from './physics';
import {
  F_EPS,
  I_EPS,
  MAGNET_H,
  MAGNET_W,
  RING_RX,
  RING_RY,
  RING_X,
  SCENE_BOUNDS,
  V_EPS,
  Y_FORCE,
  Y_MOVE,
  text,
} from './schema';
import type { LenzLawState } from './state';

// ------------------------------------------------------------------------
// 색 — 강조색은 오직 "코일이 자석에 주는 힘" 하나에 걸린다
// ------------------------------------------------------------------------
// 관례대로 N 을 빨강으로 칠했다면 강조색이 두 가지 뜻을 갖게 되고, 힘 화살표가
// "자석의 일부" 로 읽힌다. 그래서 극은 명도와 글자로만 가른다.

/** 자석 N · 글자 · 움직임 화살표. 원본 #262523. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 코일선. 원본은 구리색이었다 — 색을 하나 쓰는 자리가 아니라 중립 회색으로 둔다. */
const COIL = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 유도 전류 — 전하와 화살촉이 같은 것이라 같은 색이다. 원본 #2f6b8f. */
const CURRENT = { colorRole: 'secondary', emphasis: 'strong' } as const;
/** 힘. 조각 전체에서 이 뜻에만 쓴다. 원본 #e0572a. */
const FORCE = { colorRole: 'accent', emphasis: 'strong' } as const;

/**
 * 자석 S 극의 빛의 양. 원본의 옅은 회색(#d2cfc8)을 먹과 바탕 사이의 **빛의 비**로
 * 옮긴 값이다 — 알파로 칠하면 감마 때문에 실제 나오는 밝기가 어긋난다.
 */
const SOUTH_LUMINANCE = 0.33;
/** N 글자. 짙은 반쪽에서 파낸 글자라 바탕에 가까운 빛의 양이다. */
const KNOCKOUT_LUMINANCE = 0.04;

// ------------------------------------------------------------------------
// 치수 — 원본 px. 굵기·글자 크기는 화면 px, 길이·크기는 월드(= px/100)
// ------------------------------------------------------------------------

/** 한 고리를 이루는 점 개수. */
const RING_SEGMENTS = 72;
/** 코일선 굵기(화면 px). 원본 2.4. */
const COIL_WIDTH_PX = 2.4;
/** 고리를 도는 전하 하나의 반지름(화면 px). 원본 2.3. */
const CHARGE_SIZE_PX = 2.3;
/** 고리 하나에 도는 전하 수. 원본 8 — π/4 간격. */
const CHARGES_PER_RING = 8;
/** 전하의 진하기. 원본 0.12 + 0.78·|I|. */
const CHARGE_ALPHA_MIN = 0.12;
const CHARGE_ALPHA_GAIN = 0.78;
/** 전류 화살촉 크기(월드). 원본 4 + 7·|I| px. */
const HEAD_MIN = 0.04;
const HEAD_GAIN = 0.07;
/** 움직임 화살표 — 길이(월드) · 굵기(화면 px) · 화살촉(월드). 원본 30 + 50·… , 2.4, 10. */
const MOVE_LEN_MIN = 0.3;
const MOVE_LEN_GAIN = 0.5;
const MOVE_WIDTH_PX = 2.4;
const MOVE_HEAD = 0.1;
/** 힘 화살표. 원본 18 + 74·… , 3.2, 11. */
const FORCE_LEN_MIN = 0.18;
const FORCE_LEN_GAIN = 0.74;
const FORCE_WIDTH_PX = 3.2;
const FORCE_HEAD = 0.11;
/**
 * 이름표가 자석 중심에서 **꼬리 쪽**으로 비켜서는 거리(월드). 원본 10 px.
 *
 * 화살표가 가리키는 곳은 방향이지 이름표가 아니고, 자석이 화면 끝에 있을 때
 * 이름표가 밖으로 나가지도 않는다.
 */
const LABEL_GAP = 0.1;
/** 이름표 글자 크기(화면 px). 원본 12. */
const LABEL_FONT_PX = 12;
/** 극 글자 크기(화면 px). 원본 14. */
const POLE_FONT_PX = 14;

function n(v: number): string {
  return v.toFixed(4);
}

/**
 * 전류 화살촉 — 삼각형 하나.
 *
 * `vector` 로는 나오지 않는다. 화살촉은 선 길이의 35 % 까지만 자라므로 머리만 있는
 * 화살표를 선언할 수 없다. 외형은 `pos` 기준 월드 단위이고 y 대칭이라 y 가 위인지
 * 아래인지와 무관하다.
 */
function currentHead(id: string, pos: Vec2, size: number, sign: number): Body {
  const tip = sign * size;
  const back = -sign * size * 0.45;
  const half = size * 0.72;
  return {
    type: 'body',
    id,
    pos,
    shape: 'custom',
    customPath: `M ${n(tip)} 0 L ${n(back)} ${n(half)} L ${n(back)} ${n(-half)} Z`,
    style: CURRENT,
  };
}

function arrow(
  id: string,
  from: Vec2,
  length: number,
  sign: number,
  width: number,
  headSize: number,
  style: Vector['style'],
): Vector {
  return { type: 'vector', id, from, delta: [sign * length, 0], width, headSize, style };
}

/** 화살표 꼬리 쪽 이름표. 화살표가 가는 반대쪽으로 붙는다. */
function tailLabel(id: string, at: Vec2, label: Readout['text'], sign: number, style: Readout['style']): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    font: 'text',
    align: sign > 0 ? 'right' : 'left',
    fontSize: LABEL_FONT_PX,
    style,
  };
}

export function scene(params: {
  state: LenzLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage } = params;
  const c = readConstants(stage);
  const out: Primitive[] = [];
  const x = state.u;

  // ---- 코일 ----
  // 옆에서 본 다섯 바퀴. `coil` 어휘를 쓰지 않는다 — 코일 도형이 "전류의 향을
  // 상단/하단 접선으로" 옮기는 규칙을 함께 들고 오면 안 되기 때문이다. 그 규칙은
  // 옆에서 본 고리일 때만 맞다 (원본 NOTES 「누가 강제하면 안 되는 것」).
  RING_X.forEach((cx, i) => {
    const ring: Trajectory = {
      type: 'trajectory',
      id: `coil-${i}`,
      points: Array.from({ length: RING_SEGMENTS }, (_, k): Vec2 => {
        const a = (k / RING_SEGMENTS) * Math.PI * 2;
        return [cx + RING_RX * Math.cos(a), RING_RY * Math.sin(a)];
      }),
      closed: true,
      width: COIL_WIDTH_PX,
      style: COIL,
    };
    out.push(ring);
  });

  // ---- 유도 전류 ----
  // 두 겹으로 그린다. 고리를 도는 전하 점들은 실시간에서 흐름이 느려지고 멈췄다가
  // **역류하는 것**을 보여 주고, 화살촉은 정지 화면에서 지금 어느 쪽으로 도는지를
  // 알려 준다.
  const mag = Math.min(1, Math.abs(state.current));
  const spin = state.current >= 0 ? 1 : -1;
  const marks: { pos: Vec2 }[] = [];
  for (const cx of RING_X) {
    for (let k = 0; k < CHARGES_PER_RING; k++) {
      const a = state.phase + (k * Math.PI * 2) / CHARGES_PER_RING;
      // 원본은 화면 좌표라 y 가 아래였다. 월드는 y 가 위라 부호를 뒤집는다.
      marks.push({ pos: [cx + RING_RX * Math.cos(a), -RING_RY * Math.sin(a)] });
    }
  }
  const charges: Trace = {
    type: 'trace',
    id: 'current-charges',
    marks,
    shape: 'dot',
    size: CHARGE_SIZE_PX,
    // 흐르는 빠르기와 함께 진하기가 전류의 세기다. 나이를 주지 않는다 — 지나간
    // 자국이 아니라 지금 어디에 있는지이고, 자리를 정하는 것은 조각이다.
    opacity: CHARGE_ALPHA_MIN + CHARGE_ALPHA_GAIN * mag,
    style: CURRENT,
  };
  out.push(charges);

  if (Math.abs(state.current) > I_EPS) {
    const size = HEAD_MIN + HEAD_GAIN * mag;
    RING_X.forEach((cx, i) => {
      // 상단에서 오른쪽이면 하단에서는 왼쪽이다 — 옆에서 본 고리의 접선 방향이다.
      out.push(currentHead(`current-head-top-${i}`, [cx, RING_RY], size, spin));
      out.push(currentHead(`current-head-bottom-${i}`, [cx, -RING_RY], size, -spin));
    });
  }

  // ---- 자석 ----
  // 반쪽 둘. 극은 색이 아니라 명도와 글자로 가른다.
  const halfSize: Vec2 = [MAGNET_W / 2, MAGNET_H];
  const north: Body = {
    type: 'body',
    id: 'magnet-north',
    pos: [x - MAGNET_W / 4, 0],
    shape: 'rect',
    size: halfSize,
    style: INK,
  };
  const south: Body = {
    type: 'body',
    id: 'magnet-south',
    pos: [x + MAGNET_W / 4, 0],
    shape: 'rect',
    size: halfSize,
    style: INK,
    luminance: SOUTH_LUMINANCE,
  };
  out.push(north, south);

  const poleN: Readout = {
    type: 'readout',
    id: 'magnet-pole-n',
    anchor: { world: [x - MAGNET_W / 4, 0] },
    text: text('label.poleN'),
    chip: false,
    font: 'text',
    weight: 'bold',
    align: 'center',
    fontSize: POLE_FONT_PX,
    style: INK,
    luminance: KNOCKOUT_LUMINANCE,
  };
  const poleS: Readout = {
    type: 'readout',
    id: 'magnet-pole-s',
    anchor: { world: [x + MAGNET_W / 4, 0] },
    text: text('label.poleS'),
    chip: false,
    font: 'text',
    weight: 'bold',
    align: 'center',
    fontSize: POLE_FONT_PX,
    style: INK,
  };
  out.push(poleN, poleS);

  // ---- 자석의 움직임 ----
  // 자석과 같은 잉크색이다 — 자석의 것이므로.
  if (Math.abs(state.v) >= V_EPS) {
    const s = state.v > 0 ? 1 : -1;
    const len = MOVE_LEN_MIN + MOVE_LEN_GAIN * Math.min(1.3, Math.abs(state.v) / c.v0);
    out.push(arrow('motion', [x, Y_MOVE], len, s, MOVE_WIDTH_PX, MOVE_HEAD, INK));
    out.push(tailLabel('motion-label', [x - s * LABEL_GAP, Y_MOVE], text('label.motion'), s, INK));
  }

  // ---- 코일이 주는 힘 ----
  // 문턱 아래에서는 **선언하지 않는다.** 그래서 자석이 한가운데를 지나는 한
  // 프레임에서 강조색이 화면에서 완전히 사라진다 (t = 0.75).
  if (Math.abs(state.force) >= F_EPS) {
    const s = state.force > 0 ? 1 : -1;
    const len = FORCE_LEN_MIN + FORCE_LEN_GAIN * Math.min(1.2, Math.abs(state.force));
    out.push(arrow('force', [x, Y_FORCE], len, s, FORCE_WIDTH_PX, FORCE_HEAD, FORCE));
    out.push(tailLabel('force-label', [x - s * LABEL_GAP, Y_FORCE], text('label.force'), s, FORCE));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
  return { ...SCENE_BOUNDS };
}
