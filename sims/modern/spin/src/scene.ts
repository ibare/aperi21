// ========================================================================
// spin — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 장치 상자 · 통(region) · 가마 · 막대(body rect) ·
// 빔 갈래(lineSet) · 가는 원자와 통에 쌓인 점(particleSystem) · 축 글자와 스핀 표식(readout).
//
// 색 — 장치 · 통 · 글자는 무채색(muted), 원자 · 점 · 가마 · 막대는 먹(ink). 강조색은 쓰지 않는다.
// 어느 갈래로 나왔는지는 색이 아니라 **어느 통에 쌓였는가** 와 출구 옆 표식(↑ ↓ → ←)으로 가른다
// (S-piece: 색으로 설명하지 않는다). 몇 개가 나왔는지는 통에 쌓인 점 줄의 길이가 말한다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  LineSet,
  ParticleSystem,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { atoms, binOrigin, channels, OVEN_HALF, readAtoms, readConstants, type AtomView, type Bin } from './physics';
import {
  BIN_COLS,
  BIN_ROWS,
  DOT_PITCH,
  OVEN_X,
  PORT_SPLIT,
  SCENE_BOUNDS,
  SG1_X0,
  SG1_X1,
  SG1_Y,
  SG2_X0,
  SG2_X1,
  SG3_X0,
  SG3_X1,
  SG_HALF,
  STOP_X,
  text,
  type SpinMessageKey,
} from './schema';
import type { SpinState } from './state';

/** 가마 세로 크기(월드). 가로는 `OVEN_HALF` × 2. */
const OVEN_HEIGHT = 1.2;
/** 첫 장치 − 출구를 막는 막대 — 두께 · 길이(월드). */
const STOP_SIZE: Vec2 = [0.2, 0.7];
/** 장치 상자 · 통의 옅은 칠. */
const BOX_FILL = 0.14;
const BIN_FILL = 0.08;
/** 통의 안쪽 여백(월드) — 점과 테 사이. */
const BIN_PAD = 0.15;
/** 빔 갈래 굵기(화면 px) · 짙기. */
const CHANNEL_WIDTH = 1;
const CHANNEL_OPACITY = 0.3;
/** 가는 원자 · 통에 쌓인 점 크기(화면 px). */
const ATOM_PX = 2.6;
const DOT_PX = 2.6;
/** 글자 크기(화면 px) — 이름표 · 축 글자 · 스핀 표식. */
const LABEL_PX = 12;
const AXIS_PX = 17;
const MARK_PX = 14;
/** 이름표를 가마 위로 띄우는 거리(화면 px). */
const LABEL_GAP = 12;
/** 축 글자를 상자 왼쪽 위 모서리에서 들여 놓는 거리(월드). */
const AXIS_INSET: Vec2 = [0.55, 0.5];
/** 스핀 표식 — 출구에서 오른쪽으로 떼는 거리(월드) · 빔 선에서 위아래로 띄우는 거리(화면 px). */
const MARK_DX = 0.4;
const MARK_GAP = 10;

function label(
  id: string,
  key: SpinMessageKey,
  anchor: Readout['anchor'],
  opts: { size?: number; opacity?: number; bold?: boolean; italic?: boolean } = {},
): Readout {
  return {
    type: 'readout',
    id,
    anchor,
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: opts.size ?? LABEL_PX,
    align: 'center',
    ...(opts.bold ? { weight: 'bold' as const } : {}),
    ...(opts.italic ? { italic: true } : {}),
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

function rect(id: string, center: Vec2, size: Vec2): Body {
  return {
    type: 'body',
    id,
    pos: center,
    shape: 'rect',
    size,
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

function box(id: string, x0: number, x1: number, y0: number, y1: number, fill: number): Region {
  return {
    type: 'region',
    id,
    points: [
      [x0, y1],
      [x1, y1],
      [x1, y0],
      [x0, y0],
    ],
    opaque: true,
    fillOpacity: fill,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 통 테두리 — 가장 많이 담기는 앞부 ↑ 통에 맞춘 한 벌 크기라, 세 통의 점 줄 길이를 나란히 잴 수 있다. */
function bin(id: string, which: Bin): Region {
  const [x0, y] = binOrigin(which);
  const half = (BIN_ROWS * DOT_PITCH) / 2 + BIN_PAD;
  return box(id, x0, x0 + BIN_COLS * DOT_PITCH + BIN_PAD, y - half, y + half, BIN_FILL);
}

/** 통에 쌓인 점들. */
function rests(views: readonly AtomView[]): Vec2[] {
  return views.flatMap((v) => (v.rest ? [v.rest] : []));
}

/** 출구 옆 스핀 표식 — + 출구는 빔 선 위에, − 출구는 아래에. */
function portMark(id: string, key: SpinMessageKey, x1: number, y: number, up: boolean, opacity?: number): Readout {
  const port: Vec2 = [x1 + MARK_DX, y + (up ? PORT_SPLIT : -PORT_SPLIT)];
  return label(id, key, { world: port, offset: [0, up ? -MARK_GAP : MARK_GAP] }, {
    size: MARK_PX,
    bold: true,
    ...(opacity !== undefined ? { opacity } : {}),
  });
}

export function scene(params: {
  state: SpinState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('spin: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const same = readAtoms(atoms(tl, c, 'same'), tl, c);
  const cross = readAtoms(atoms(tl, c, 'cross'), tl, c);
  /** 가운데 장치가 x 로 돌아가 있는 정도 — `turn` 에 z → x, `fade` 에 x → z. */
  const toX = tl.at('turn') - tl.at('fade');
  /** 앞부 점은 `turn` 에, 뒷부 점은 `fade` 에 비워진다. */
  const keepSame = 1 - tl.at('turn');
  const keepCross = 1 - tl.at('fade');
  const sg2Y = SG1_Y + PORT_SPLIT;
  const sg3Y = sg2Y + PORT_SPLIT;
  const out: Primitive[] = [];

  // ── 장치 셋 · 통 셋 ──────────────────────────────────
  out.push(box('sg1', SG1_X0, SG1_X1, SG1_Y - SG_HALF, SG1_Y + SG_HALF, BOX_FILL));
  out.push(box('sg2', SG2_X0, SG2_X1, sg2Y - SG_HALF, sg2Y + SG_HALF, BOX_FILL));
  out.push(box('sg3', SG3_X0, SG3_X1, sg3Y - SG_HALF, sg3Y + SG_HALF, BOX_FILL));
  out.push(bin('bin-mid', 'mid'));
  out.push(bin('bin-up', 'up'));
  out.push(bin('bin-down', 'down'));

  // ── 빔 갈래 — 원자가 갈 수 있는 모든 길. 실제로 어디로 갔는지는 원자와 통이 말한다 ──
  out.push({
    type: 'lineSet',
    id: 'channels',
    lines: channels(),
    width: CHANNEL_WIDTH,
    opacity: CHANNEL_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies LineSet);

  // ── 가마 · 첫 장치 − 출구의 막대 ─────────────────────────
  out.push(rect('oven', [OVEN_X, SG1_Y], [2 * OVEN_HALF, OVEN_HEIGHT]));
  out.push(rect('stop', [STOP_X + STOP_SIZE[0] / 2, SG1_Y - PORT_SPLIT], STOP_SIZE));

  // ── 통에 쌓인 점 — 앞부 · 뒷부가 따로 비워진다 ───────────────
  const sameDots = rests(same);
  if (sameDots.length > 0 && keepSame > 0) {
    out.push({
      type: 'particleSystem',
      id: 'same-dots',
      positions: sameDots,
      sizes: DOT_PX,
      opacity: keepSame,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies ParticleSystem);
  }
  const crossDots = rests(cross);
  if (crossDots.length > 0 && keepCross > 0) {
    out.push({
      type: 'particleSystem',
      id: 'cross-dots',
      positions: crossDots,
      sizes: DOT_PX,
      opacity: keepCross,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies ParticleSystem);
  }

  // ── 가는 원자 ───────────────────────────────────────
  const flying = [...same, ...cross].flatMap((v) => (v.pos ? [v.pos] : []));
  if (flying.length > 0) {
    out.push({
      type: 'particleSystem',
      id: 'atoms',
      positions: flying,
      sizes: ATOM_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies ParticleSystem);
  }

  // ── 축 글자 — 장치가 재는 방향. 가운데 장치만 z ↔ x 로 바뀐다 ──────────
  const axisAt = (x0: number, y: number): Readout['anchor'] => ({
    world: [x0 + AXIS_INSET[0], y + SG_HALF - AXIS_INSET[1]],
  });
  out.push(label('axis-1', 'mark.z', axisAt(SG1_X0, SG1_Y), { size: AXIS_PX, bold: true, italic: true }));
  if (toX < 1) {
    out.push(label('axis-2z', 'mark.z', axisAt(SG2_X0, sg2Y), { size: AXIS_PX, bold: true, italic: true, opacity: 1 - toX }));
  }
  if (toX > 0) {
    out.push(label('axis-2x', 'mark.x', axisAt(SG2_X0, sg2Y), { size: AXIS_PX, bold: true, italic: true, opacity: toX }));
  }
  out.push(label('axis-3', 'mark.z', axisAt(SG3_X0, sg3Y), { size: AXIS_PX, bold: true, italic: true }));

  // ── 출구 옆 스핀 표식 ─────────────────────────────────
  out.push(portMark('port-1-up', 'mark.up', SG1_X1, SG1_Y, true));
  out.push(portMark('port-1-down', 'mark.down', SG1_X1, SG1_Y, false));
  if (toX < 1) {
    out.push(portMark('port-2-up', 'mark.up', SG2_X1, sg2Y, true, 1 - toX));
    out.push(portMark('port-2-down', 'mark.down', SG2_X1, sg2Y, false, 1 - toX));
  }
  if (toX > 0) {
    out.push(portMark('port-2-right', 'mark.right', SG2_X1, sg2Y, true, toX));
    out.push(portMark('port-2-left', 'mark.left', SG2_X1, sg2Y, false, toX));
  }
  out.push(portMark('port-3-up', 'mark.up', SG3_X1, sg3Y, true));
  out.push(portMark('port-3-down', 'mark.down', SG3_X1, sg3Y, false));

  // ── 이름표 ──────────────────────────────────────
  out.push(label('oven-label', 'label.oven', { world: [OVEN_X, SG1_Y + OVEN_HEIGHT / 2], offset: [0, -LABEL_GAP] }));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
