// ========================================================================
// youngs-double-slit — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 월드 좌표는 원본 논리 px 에서 y 만 뒤집은 것이다(월드 y = H − 원본 y). 겹침은 scene 에 쓴 순서다
// (`drawOrder: 'scene'`) — 원본 그리기 순서 그대로.
//
// 색 —
// - 스크린에 닿은 빛은 밝기 자체가 주장이라 역할 색이 아니라 빛의 세기 채널(`colors: 'light'`)로 칠한다.
//   두 테마에서 「꺼진 줄 = 빛 없음」 의 극성이 같다.
// - 물결장은 빛의 **순간 변위**(마루 · 골)이지 밝기가 아니다. 발산형 한 장 — 0 은 바탕, 골은 `ink`,
//   마루는 `muted` 로 짙어진다. 무채색 두 짙기라 「한 색조」 를 지키고, 서로 지우는 방사형 띠는 바탕으로 남는다.
//   원본의 「마루는 바탕보다 밝게」 는 줄 수 없다 (NOTES 「어휘 부족」).
// - 가림벽 · 가림판 · 지금 곡선은 `ink`, 비교 곡선 · 0 기준선 · 그 글씨는 `muted`.
// - 강조색(`accent`)은 「꺼진 줄」 한 뜻에만.
// ========================================================================

import type {
  Body,
  Bounds,
  LineSet,
  Primitive,
  Readout,
  SceneGraph,
  ScalarField,
  TimelineFrame,
  Trajectory,
  Vec2,
} from '@aperi21/schema';
import {
  DARK_ROWS,
  FIELD_COLS,
  FIELD_ROWS,
  GHOST,
  IMAX,
  SLIT_A_Y,
  SLIT_B_Y,
  autoWindows,
  fieldValues,
  screenFrame,
  shutterOpen,
} from './physics';
import {
  BARRIER_T,
  BARRIER_X,
  BOTTOM_BAND_PX,
  CELL,
  H,
  PROFILE_SPAN,
  PROFILE_X0,
  SCREEN_W,
  SCREEN_X,
  SLIT_W,
  W,
  text,
} from './schema';
import type { SlitWindow, YoungsDoubleSlitState } from './state';

/** 원본 선 굵기(화면 px) — 비교 점선 1.2 · 0 기준선 1 · 지금 곡선 1.8 · 꺼진 줄 눈금 2. */
const WIDTH = { ghost: 1.2, zero: 1, profile: 1.8, mark: 2 } as const;
/** 「슬릿 하나일 때」 글씨 — 원본 12 px, 비교 곡선에서 오른쪽으로 8 px. */
const GHOST_LABEL_FONT_PX = 12;
const GHOST_LABEL_GAP = 8;

/** 원본 px(y 아래) → 월드(y 위). */
const wy = (y: number): number => H - y;

/** 원본 `fillRect(x, y, w, h)` 를 채운 사각형 물체로. */
function rect(id: string, x: number, y: number, w: number, h: number): Body {
  return {
    type: 'body',
    id,
    shape: 'rect',
    pos: [x + w / 2, wy(y + h / 2)],
    size: [w, h],
    outline: 'none',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

// ------------------------------------------------------------------------
// 물결장
// ------------------------------------------------------------------------

function field(t: number, windows: readonly SlitWindow[]): ScalarField {
  return {
    type: 'scalarField',
    id: 'wave-field',
    min: [0, wy(FIELD_ROWS * CELL)],
    max: [FIELD_COLS * CELL, H],
    cols: FIELD_COLS,
    rows: FIELD_ROWS,
    values: fieldValues(t, windows),
    range: [-1, 1],
    colors: { low: 'ink', high: 'muted' },
  };
}

// ------------------------------------------------------------------------
// 가림벽 · 가림판
// ------------------------------------------------------------------------

function barrier(): Primitive[] {
  const x0 = BARRIER_X - BARRIER_T / 2;
  const aTop = SLIT_A_Y - SLIT_W / 2 - 2;
  const aBot = SLIT_A_Y + SLIT_W / 2 + 2;
  const bTop = SLIT_B_Y - SLIT_W / 2 - 2;
  const bBot = SLIT_B_Y + SLIT_W / 2 + 2;
  return [
    rect('barrier-top', x0, 0, BARRIER_T, aTop),
    rect('barrier-middle', x0, aBot, BARRIER_T, bTop - aBot),
    rect('barrier-bottom', x0, bBot, BARRIER_T, H - bBot),
  ];
}

function shutter(open: boolean): Body {
  const h = SLIT_W + 10;
  const y = open ? SLIT_B_Y + SLIT_W / 2 + 4 : SLIT_B_Y - h / 2;
  return rect('shutter', BARRIER_X - BARRIER_T / 2 - 5, y, 5, h);
}

// ------------------------------------------------------------------------
// 스크린 · 밝기 곡선 · 꺼진 줄
// ------------------------------------------------------------------------

/** 스크린 띠 — 행마다 한 칸, 빛의 양 = 세기 / 최대 세기. */
function screen(intensity: readonly number[]): ScalarField {
  return {
    type: 'scalarField',
    id: 'screen',
    min: [SCREEN_X, 0],
    max: [SCREEN_X + SCREEN_W, H],
    cols: 1,
    rows: H,
    values: intensity.map((v) => Math.min(1, v / IMAX)),
    range: [0, 1],
    colors: 'light',
  };
}

function curve(values: readonly number[]): Vec2[] {
  return values.map((v, y) => [PROFILE_X0 + (PROFILE_SPAN * v) / IMAX, wy(y + 0.5)]);
}

function ghost(): Primitive[] {
  const line: Trajectory = {
    type: 'trajectory',
    id: 'ghost-curve',
    points: curve(GHOST),
    width: WIDTH.ghost,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
  };
  // 실선 곡선이 0 가까이 내려가는 꺼진 줄 높이에 붙여 겹치지 않게 한다(원본 그대로).
  const ly = Math.round(DARK_ROWS[Math.min(1, DARK_ROWS.length - 1)] ?? 20);
  const label: Readout = {
    type: 'readout',
    id: 'ghost-label',
    anchor: { world: [PROFILE_X0 + (PROFILE_SPAN * GHOST[ly]!) / IMAX + GHOST_LABEL_GAP, wy(ly)] },
    text: text('label.ghost'),
    chip: false,
    font: 'text',
    fontSize: GHOST_LABEL_FONT_PX,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  return [line, label];
}

function profile(intensity: readonly number[]): Primitive[] {
  const zero: Trajectory = {
    type: 'trajectory',
    id: 'profile-zero',
    points: [
      [PROFILE_X0 + 0.5, H],
      [PROFILE_X0 + 0.5, 0],
    ],
    width: WIDTH.zero,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  const now: Trajectory = {
    type: 'trajectory',
    id: 'profile-curve',
    points: curve(intensity),
    width: WIDTH.profile,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  return [zero, now];
}

function darkMarks(): LineSet {
  const lines: Vec2[][] = [];
  for (const y of DARK_ROWS) {
    lines.push([
      [SCREEN_X - 12, wy(y)],
      [SCREEN_X - 2, wy(y)],
    ]);
    lines.push([
      [SCREEN_X + SCREEN_W + 2, wy(y)],
      [PROFILE_X0 - 2, wy(y)],
    ]);
  }
  return {
    type: 'lineSet',
    id: 'dark-marks',
    lines,
    width: WIDTH.mark,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
}

// ------------------------------------------------------------------------
// 조립
// ------------------------------------------------------------------------

export function scene(params: { state: YoungsDoubleSlitState; timeline?: TimelineFrame }): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('youngs-double-slit: schema.timeline 이 선언되어야 한다');
  const s = params.state;

  // 단추를 눌렀으면 상태의 창 목록과 그 시계, 아니면 시간표 — 열림은 `open` 시작, 닫힘은 그 끝.
  const t = s.manual ? s.clock : tl.t;
  const windows = s.manual
    ? s.windows
    : autoWindows(tl.t, tl.start('open'), tl.end('open'), tl.period);

  const open = shutterOpen(t, windows);
  const frame = screenFrame(t, windows);
  // 캡션 「꺼졌다」 를 고르는 바로 그 상태 값에서만 눈금을 보인다 — 캡션이 가리킬 때 눈금이 없는 경우가 없다.
  const showMarks = s.capDark;

  const out: Primitive[] = [
    field(t, windows),
    ...barrier(),
    shutter(open),
    screen(frame.intensity),
    ...ghost(),
    ...profile(frame.intensity),
  ];
  if (showMarks) out.push(darkMarks());
  return out;
}

/** 고정 프레이밍 — 원본 캔버스 사각형에 캡션 · 단추 줄을 더한 것. 매 프레임 같은 값이다. */
export function boundsHint(): Bounds {
  return { minX: 0, maxX: W, minY: -BOTTOM_BAND_PX, maxY: H };
}
