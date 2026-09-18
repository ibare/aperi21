// ========================================================================
// electron-configuration — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 원소 칸(body rect, 속 빈) · 커서(region) ·
// 원소 기호 · 원자 번호 · 부껍질 이름 · 주기 번호 · 블록 이름(readout) · 괄호(lineSet) 가 모두 표준 어휘다.
//
// 원소 칸은 쌓음 원리 순서대로 하나씩 켜진다. 줄 아래 괄호가 지금 채우는 부껍질의 자리 폭
// (s 2 · p 6 · d 10 칸)을 먼저 보이고, 커서가 그 안을 한 칸씩 나아간다. 껍질이 닫히면 커서는
// 줄 끝에서 다음 줄 맨 앞으로 넘어간다 — 그것이 줄(주기)이 끝나는 모습이다.
//
// 색 — 칸 테 · 괄호 · 번호 · 이름은 무채색(muted), 원소 기호와 지금 채우는 부껍질 이름은 먹(ink).
// 강조색(accent)은 한 뜻에만 쓴다 — 「지금 들어오는 원소」 의 커서. 블록을 색으로 가르지 않는다
// (S-piece) — 블록은 칸의 자리와 위 괄호 · 이름이 가른다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  LineSet,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  AUFBAU,
  BLOCK_FIRST_GROUP,
  SEATS,
  cellPos,
  fillingSubshell,
  groupOf,
  hasStarted,
  readCells,
  readConstants,
  readCursor,
  type Block,
  type CellView,
  type Subshell,
} from './physics';
import {
  BLOCK_RISE,
  BRACKET,
  PERIOD_X,
  SCENE_BOUNDS,
  TILE,
  text,
  type ElectronConfigurationMessageKey,
} from './schema';
import type { ElectronConfigurationState } from './state';

/** 원소 기호 · 원자 번호 · 이름표 글자 크기(화면 px). */
const SYMBOL_PX = 13;
const Z_PX = 8;
const LABEL_PX = 11;
/** 칸 안에서 기호를 가운데보다 내리는 거리 · 번호를 올리는 거리(월드). */
const SYMBOL_DROP = 0.08;
const Z_RISE = 0.3;
/** 이름표를 앵커에서 띄우는 거리(화면 px) — 괄호 아래 · 괄호 위. */
const LABEL_GAP = 9;
/** 칸 테 짙기 — 기호보다 물러나게. */
const TILE_LINE_OPACITY = 0.85;
/** 괄호 굵기(화면 px). */
const BRACKET_WIDTH = 1.3;
/** 커서 — 칸보다 한 둘레 큰 테와, 기호가 비쳐 보이는 옅은 칠. */
const CURSOR_SIZE = 1.1;
const CURSOR_FILL = 0.16;
/** 가로 괄호 끝이 칸 가장자리에 맞도록 칸 가운데에서 벌리는 반폭(월드). */
const HALF_SPAN = TILE / 2;

/** 블록 이름의 문안 키 · 차지하는 족. */
const BLOCK_LABELS: readonly { block: Block; key: ElectronConfigurationMessageKey }[] = [
  { block: 's', key: 'label.blockS' },
  { block: 'd', key: 'label.blockD' },
  { block: 'p', key: 'label.blockP' },
];

/** 투명도를 붙인다 — 1 이면 붙이지 않는다. */
function faded<T extends Primitive>(p: T, alpha: number): T {
  return alpha < 1 ? { ...p, opacity: alpha } : p;
}

function worldLabel(
  id: string,
  body: Readout['text'],
  at: Vec2,
  offsetY: number,
  px: number,
  role: 'muted' | 'ink',
  bold = false,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset: [0, offsetY] },
    text: body,
    chip: false,
    font: 'text',
    fontSize: px,
    align: 'center',
    ...(bold ? { weight: 'bold' as const } : {}),
    style: { colorRole: role, emphasis: 'strong' },
  };
}

/** 부껍질이 차지하는 칸들을 이어진 족 구간으로 — 1s 는 1 족과 18 족 두 토막이다. */
function spans(s: Subshell, cells: readonly CellView[]): [number, number][] {
  const groups: number[] = [];
  for (let k = 0; k < SEATS[s.block]; k++) {
    const g = groupOf(s, k);
    if (cells.some((v) => v.subshell.id === s.id && v.group === g)) groups.push(g);
  }
  const out: [number, number][] = [];
  for (const g of groups) {
    const last = out[out.length - 1];
    if (last && last[1] === g - 1) last[1] = g;
    else out.push([g, g]);
  }
  return out;
}

/** 높이 `y` 에 긋는 가로 괄호 — 끝이 칸 쪽(`towardCells` 1 이면 위, -1 이면 아래)으로 꺾인다. */
function bracket(g0: number, g1: number, row: number, y: number, towardCells: 1 | -1): Vec2[] {
  const x0 = cellPos(g0, row)[0] - HALF_SPAN;
  const x1 = cellPos(g1, row)[0] + HALF_SPAN;
  const yt = y + towardCells * BRACKET.tick;
  return [[x0, yt], [x0, y], [x1, y], [x1, yt]];
}

export function scene(params: {
  state: ElectronConfigurationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('electron-configuration: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const cells = readCells(tl, c);
  const all = 1 - tl.at('fade');
  const out: Primitive[] = [];
  if (all <= 0) return out;

  // ── 주기 번호 — 그 줄에 첫 원소가 들어오면 선다 ───────────────
  const top: Vec2 = [PERIOD_X, cellPos(1, 1)[1] + TILE / 2];
  out.push(faded(worldLabel('period-head', text('label.period'), top, -LABEL_GAP, LABEL_PX, 'muted'), all));
  const rows = [...new Set(cells.map((v) => v.row))];
  for (const row of rows) {
    const lit = Math.max(...cells.filter((v) => v.row === row).map((v) => v.lit));
    if (lit <= 0) continue;
    out.push(
      faded(worldLabel(`period-${row}`, String(row), [PERIOD_X, cellPos(1, row)[1]], 0, LABEL_PX, 'muted'), all),
    );
  }

  // ── 부껍질 괄호 — 채우기 시작하면 자리 폭 전체가 먼저 보인다 ─────────
  const now = fillingSubshell(tl);
  const shellLines: Vec2[][] = [];
  const nowLines: Vec2[][] = [];
  for (const s of AUFBAU) {
    if (!hasStarted(tl, s)) continue;
    const isNow = now?.id === s.id;
    const y = cellPos(1, s.row)[1] - TILE / 2 - BRACKET.gap;
    for (const [g0, g1] of spans(s, cells)) {
      (isNow ? nowLines : shellLines).push(bracket(g0, g1, s.row, y, 1));
      const mid: Vec2 = [(cellPos(g0, s.row)[0] + cellPos(g1, s.row)[0]) / 2, y];
      // 부껍질 이름(`2p`)은 표식이다 (C1).
      out.push(
        faded(worldLabel(`shell-${s.id}-${g0}`, s.id, mid, LABEL_GAP, LABEL_PX, isNow ? 'ink' : 'muted', isNow), all),
      );
    }
  }
  if (shellLines.length) {
    out.push(
      faded(
        {
          type: 'lineSet',
          id: 'shell-brackets',
          lines: shellLines,
          width: BRACKET_WIDTH,
          style: { colorRole: 'muted', emphasis: 'strong' },
        } satisfies LineSet,
        all,
      ),
    );
  }
  if (nowLines.length) {
    out.push({
      type: 'lineSet',
      id: 'shell-bracket-now',
      lines: nowLines,
      width: BRACKET_WIDTH,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies LineSet);
  }

  // ── 원소 칸 — 켜진 만큼 짙다 ─────────────────────────
  for (const v of cells) {
    if (v.lit <= 0) continue;
    const a = v.lit * all;
    out.push(
      faded(
        {
          type: 'body',
          id: `tile-${v.z}`,
          pos: v.pos,
          shape: 'rect',
          size: [TILE, TILE],
          fill: 'none',
          outline: 'role',
          glow: false,
          style: { colorRole: 'muted', emphasis: 'strong' },
        } satisfies Body,
        a * TILE_LINE_OPACITY,
      ),
    );
    // 원자 번호 · 원소 기호는 표식이다 (C1).
    out.push(faded(worldLabel(`z-${v.z}`, String(v.z), [v.pos[0], v.pos[1] + Z_RISE], 0, Z_PX, 'muted'), a));
    out.push(
      faded(worldLabel(`sym-${v.z}`, v.symbol, [v.pos[0], v.pos[1] - SYMBOL_DROP], 0, SYMBOL_PX, 'ink', true), a),
    );
  }

  // ── 블록 이름 — 표가 다 나온 뒤 위에 떠오른다 ─────────────────
  const blocks = tl.at('blocks') * all;
  if (blocks > 0) {
    const y = cellPos(1, 1)[1] + TILE / 2 + BLOCK_RISE;
    const lines: Vec2[][] = [];
    for (const { block, key } of BLOCK_LABELS) {
      const g0 = BLOCK_FIRST_GROUP[block];
      const g1 = g0 + SEATS[block] - 1;
      lines.push(bracket(g0, g1, 1, y, -1));
      const mid: Vec2 = [(cellPos(g0, 1)[0] + cellPos(g1, 1)[0]) / 2, y];
      out.push(faded(worldLabel(`block-${block}`, text(key), mid, -LABEL_GAP, LABEL_PX, 'ink', true), blocks));
    }
    out.push(
      faded(
        {
          type: 'lineSet',
          id: 'block-brackets',
          lines,
          width: BRACKET_WIDTH,
          style: { colorRole: 'ink', emphasis: 'strong' },
        } satisfies LineSet,
        blocks,
      ),
    );
  }

  // ── 커서 — 지금 들어오는 원소. 블록 이름이 뜨면 물러난다 ───────────
  const cursor = readCursor(cells);
  const cursorAlpha = (1 - tl.at('blocks')) * all;
  if (cursor && cursorAlpha > 0) {
    const h = CURSOR_SIZE / 2;
    const [x, y] = cursor;
    out.push(
      faded(
        {
          type: 'region',
          id: 'cursor',
          points: [[x - h, y - h], [x + h, y - h], [x + h, y + h], [x - h, y + h]],
          fillOpacity: CURSOR_FILL,
          outline: [[0, 1], [1, 2], [2, 3], [3, 0]],
          style: { colorRole: 'accent', emphasis: 'strong' },
        } satisfies Region,
        cursorAlpha,
      ),
    );
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
