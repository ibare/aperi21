// ========================================================================
// semiconductor-doping — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 결합(`lineSet`) · 원자(`body` 고리 + 기호 `readout`) ·
// 결합 전자(`particleSystem`) · 양공(`body` 빈 고리) · 풀려난 전자(`particleSystem` 꼬리) ·
// 띠(`region`) · 도너 · 억셉터 준위(`trajectory` 점선) · 띠틈(`dimension` + `readout`) ·
// 전기장(`vector`) · 판 이름(`readout`) 이 모두 표준 어휘로 있다.
//
// 색: 전자 · 양공은 먹색 하나(같은 전자와 그 빈자리) — 가르는 것은 표식 `e⁻` · `h⁺` 와 속 빈 고리다.
// 실리콘 원자 · 결합선 · 준위선 · 치수선은 무채색, 띠는 보조색. 강조색은 **불순물 원자** 한 가지
// 뜻(원자와 그 준위)에만 쓴다 — 무엇이 바뀌었는지가 그것 하나다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  allBonds,
  atomPos,
  bandLayout,
  bandSlotX,
  DOPANT_ROW,
  fadeOpacity,
  freeElectronPos,
  holeBond,
  holeMoves,
  missingCount,
  ownDots,
  readConstants,
  SPARE_OFFSETS,
  spareCount,
  type Bond,
  type SemiconductorDopingConstants,
} from './physics';
import {
  BAND_DX,
  BAND_HALF_W,
  BAND_SLOTS,
  COLS,
  PANEL_X,
  ROWS,
  SCENE_BOUNDS,
  text,
  type SemiconductorDopingMessageKey,
} from './schema';
import type { SemiconductorDopingState } from './state';

// ------------------------------------------------------------------------
// 모양 — 선 굵기 · 글자 크기 · 짙기 · 띄움 거리 (C2)
// ------------------------------------------------------------------------

/** 결합선 굵기(화면 px) · 짙기. 전자 점이 그 위에서 읽혀야 한다. */
const BOND_WIDTH_PX = 1.5;
const BOND_OPACITY = 0.55;
/** 원자 고리 반지름(월드). 결합 전자(원자에서 0.35)와 닿지 않게. */
const ATOM_RADIUS = 0.22;
/** 원자 기호 글자 크기(화면 px). */
const SYMBOL_PX = 11;
/** 전자 점 반지름(화면 px). */
const ELECTRON_PX = 3;
/** 양공 고리 반지름(월드). 전자 점과 같은 크기로 보이게. */
const HOLE_RADIUS = 0.065;
/** 건너가는 전자가 원자 위로 넘어가는 높이(월드) — 원자 고리를 가로지르지 않고 세로 결합의 두 전자 사이로 지나간다. */
const HOP_ARC = 0.5;
/** 풀려난 전자의 꼬리 — 흐르는 방향이 멈춘 화면에서도 읽히게. 길이(초 × 속력) · 굵기(화면 px) · 짙기. */
const TRAIL_SECONDS = 0.45;
const TRAIL_WIDTH_PX = 2;
const TRAIL_OPACITY = 0.45;

/** 띠 채움 짙기. */
const BAND_FILL = 0.16;
/** 준위 점선 굵기(화면 px). */
const LEVEL_WIDTH_PX = 1.5;
/** 에너지 값 글자 크기(화면 px) · 준위 값 글자를 준위선에서 틈 쪽으로 띄우는 거리(화면 px). */
const VALUE_PX = 11;
const LEVEL_VALUE_BELOW: Vec2 = [0, 10];
const LEVEL_VALUE_ABOVE: Vec2 = [0, -10];

/** 이름표 글자 크기 · 판 이름 글자 크기(화면 px). */
const LABEL_PX = 12;
const TITLE_PX = 13;
/** 판 이름을 격자 아래 끝에서 내리는 거리(화면 px). */
const TITLE_OFFSET: Vec2 = [0, 16];
/** 전자 · 양공 기호를 점에서 띄우는 거리(화면 px) — 격자에서는 둘 다 위. */
const TAG_ABOVE: Vec2 = [0, -12];
/** 띠 그림의 양공 기호는 아래 — 위에는 억셉터 준위의 전자가 있다. */
const TAG_BELOW: Vec2 = [0, 12];

/** 전기장 화살표 — 격자 위로 띄우는 거리 · 반길이(월드) · 굵기(화면 px). */
const FIELD_ROW_GAP = 0.4;
const FIELD_HALF_LEN = 0.7;
const FIELD_WIDTH_PX = 2;

type Kind = 'n' | 'p';

const TITLE_KEY: Record<Kind, SemiconductorDopingMessageKey> = { n: 'label.nType', p: 'label.pType' };
const DOPANT_KEY: Record<Kind, SemiconductorDopingMessageKey> = { n: 'label.p', p: 'label.b' };

const rect = (cx: number, halfW: number, yFrom: number, yTo: number): Vec2[] => [
  [cx - halfW, yFrom],
  [cx + halfW, yFrom],
  [cx + halfW, yTo],
  [cx - halfW, yTo],
];

const lerp = (a: Vec2, b: Vec2, s: number): Vec2 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];

export function scene(params: {
  state: SemiconductorDopingState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('semiconductor-doping: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const op = fadeOpacity(tl);
  const g: Primitive[] = [];
  for (const kind of ['n', 'p'] as const) panel(g, kind, c, tl, op);
  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const band = { colorRole: 'secondary', emphasis: 'strong' } as const;
const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;

/**
 * 전자 · 양공 기호. 바탕 칩은 깔지 않는다 — 칩이 결합 전자를 가려 격자가 비어 보였다(촬영 판정).
 */
function tag(id: string, at: Vec2, offset: Vec2, key: SemiconductorDopingMessageKey, opacity: number): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    weight: 'bold',
    align: 'center',
    opacity,
    style: ink,
  };
}

function ring(id: string, at: Vec2, opacity: number): Body {
  return {
    type: 'body',
    id,
    pos: at,
    shape: 'circle',
    size: HOLE_RADIUS,
    fill: 'none',
    outline: 'role',
    glow: false,
    opacity,
    style: ink,
  };
}

function panel(
  g: Primitive[],
  kind: Kind,
  c: SemiconductorDopingConstants,
  tl: TimelineFrame,
  op: number,
): void {
  const ox = PANEL_X[kind];
  const dope = tl.at('dope');
  const free = tl.at('free');

  // ================= 띠 그림 =================
  bandDiagram(g, kind, c, tl, op, ox + BAND_DX);

  // ================= 격자 =================
  const bonds = allBonds(ox);
  const dopantCol = kind === 'n' ? c.donorCol : c.acceptorCol;
  const dopant = atomPos(ox, dopantCol, DOPANT_ROW);

  // ---- 결합선 ----
  g.push({
    type: 'lineSet',
    id: `${kind}-bonds`,
    lines: [...bonds.values()].map((b) => [b.from, b.to]),
    width: BOND_WIDTH_PX,
    opacity: op * BOND_OPACITY,
    style: muted,
  });

  // ---- 원자 — 불순물 자리는 실리콘에서 불순물로 바뀐다 ----
  for (let r = 0; r < ROWS; r++) {
    for (let col = 0; col < COLS; col++) {
      const at = atomPos(ox, col, r);
      const isDopant = col === dopantCol && r === DOPANT_ROW;
      const siAlpha = isDopant ? 1 - dope : 1;
      if (siAlpha > 0) {
        g.push({
          type: 'body',
          id: `${kind}-atom-${col}-${r}`,
          pos: at,
          shape: 'circle',
          size: ATOM_RADIUS,
          fill: 'none',
          outline: 'role',
          glow: false,
          opacity: op * siAlpha,
          style: muted,
        });
        g.push(symbol(`${kind}-sym-${col}-${r}`, at, 'label.si', op * siAlpha, muted));
      }
      if (isDopant && dope > 0) {
        g.push({
          type: 'body',
          id: `${kind}-dopant`,
          pos: at,
          shape: 'circle',
          size: ATOM_RADIUS,
          fill: 'none',
          outline: 'role',
          glow: false,
          opacity: op * dope,
          style: accent,
        });
        g.push(symbol(`${kind}-dopant-sym`, at, DOPANT_KEY[kind], op * dope, accent));
      }
    }
  }

  // ---- 결합 전자 ----
  const positions: Vec2[] = [];
  const alphas: number[] = [];
  const put = (p: Vec2, a = 1): void => {
    positions.push(p);
    alphas.push(a);
  };
  const holes: Primitive[] = [];
  const tags: Primitive[] = [];
  const dotOf = (bond: string, side: 0 | 1): Vec2 => (bonds.get(bond) as Bond).dots[side];

  if (kind === 'n') {
    for (const b of bonds.values()) {
      put(b.dots[0]);
      put(b.dots[1]);
    }
    // 인에 남는 전자 — 도핑과 함께 나타나고, 첫째가 풀려나 흐른다.
    const spares = spareCount(c);
    for (let i = 0; i < spares; i++) {
      if (dope <= 0) break;
      if (i === 0) continue;
      const off = SPARE_OFFSETS[i]!;
      put([dopant[0] + off[0], dopant[1] + off[1]], dope);
    }
    if (spares > 0 && dope > 0) {
      const { pos, moving } = freeElectronPos(tl, c, ox);
      g.push({
        type: 'particleSystem',
        id: `${kind}-free-electron`,
        positions: [pos],
        velocities: [[moving ? -c.driftSpeed : 0, 0]],
        trail: moving,
        trailStyle: { seconds: TRAIL_SECONDS, width: TRAIL_WIDTH_PX, opacity: TRAIL_OPACITY },
        sizes: ELECTRON_PX,
        opacity: op * dope,
        style: ink,
      });
      if (free > 0) tags.push(tag(`${kind}-electron-tag`, pos, TAG_ABOVE, 'label.electron', op * free));
    }
  } else {
    // 붕소 — 모자란 전자 자리가 도핑과 함께 비고 빈 고리가 찬다. 첫 빈자리가 옮겨 간다.
    const missing = ownDots(dopantCol, DOPANT_ROW).slice(0, missingCount(c));
    const { done, move } = holeMoves(tl, c);
    const moved = free > 0;
    // 지금 빈자리(from)와 다음 빈자리(to) — 첫 빈자리는 옮겨 가는 동안 두 결합 사이에 걸친다.
    const fromDot = dotOf(holeBond(c, done), 0);
    // 다 옮긴 뒤(move 0)에는 다음 결합이 없을 수 있다 — 지금 자리로 둔다.
    const toDot = move > 0 ? dotOf(holeBond(c, done + 1), 0) : fromDot;
    const empty = new Set<string>();
    missing.forEach((m, i) => {
      if (i === 0 && moved) return;
      empty.add(`${m.bond}:${m.side}`);
    });
    if (moved) {
      empty.add(`${holeBond(c, done)}:0`);
      if (move > 0) empty.add(`${holeBond(c, done + 1)}:0`);
    }
    for (const [name, b] of bonds) {
      for (const side of [0, 1] as const) {
        const k = `${name}:${side}`;
        if (!empty.has(k)) {
          put(b.dots[side]);
          continue;
        }
        // 도핑 중에는 모자란 자리의 전자가 옅어진다(실리콘이 붕소로 바뀌는 중).
        if (!moved && dope < 1) put(b.dots[side], 1 - dope);
      }
    }
    // 건너오는 전자 — 오른쪽 결합에서 빈자리로, 원자 위로 넘어간다.
    if (moved && move > 0) {
      const p = lerp(toDot, fromDot, move);
      put([p[0], p[1] + HOP_ARC * Math.sin(Math.PI * move)]);
    }
    // 빈 고리 — 옮겨 가는 동안 떠난 자리에 차오르고 들어간 자리의 것이 사라진다.
    missing.forEach((m, i) => {
      if (i === 0 && moved) return;
      holes.push(ring(`${kind}-hole-${i}`, dotOf(m.bond, m.side), op * dope));
    });
    if (moved) {
      holes.push(ring(`${kind}-hole-from`, fromDot, op * (1 - move)));
      if (move > 0) holes.push(ring(`${kind}-hole-to`, toDot, op * move));
      tags.push(tag(`${kind}-hole-tag`, lerp(fromDot, toDot, move), TAG_ABOVE, 'label.hole', op * free));
    }
  }

  g.push({
    type: 'particleSystem',
    id: `${kind}-bond-electrons`,
    positions,
    opacities: alphas,
    sizes: ELECTRON_PX,
    opacity: op,
    style: ink,
  });
  g.push(...holes, ...tags);

  // ---- 전기장 — 두 격자에 같은 화살표, 처음부터 걸려 있다 ----
  const stubTop = (bonds.get(`v:0:${ROWS - 1}`) as Bond).to[1];
  const stubBottom = (bonds.get('v:0:-1') as Bond).from[1];
  g.push({
    type: 'vector',
    id: `${kind}-field`,
    from: [ox - FIELD_HALF_LEN, stubTop + FIELD_ROW_GAP],
    delta: [2 * FIELD_HALF_LEN, 0],
    label: text('label.field'),
    width: FIELD_WIDTH_PX,
    opacity: op,
    style: muted,
  });

  // ---- 판 이름 — 도핑 전에는 「순수한 실리콘」 ----
  const titleAt: Vec2 = [ox, stubBottom];
  g.push(title(`${kind}-title-pure`, titleAt, 'label.pure', op * (1 - dope)));
  if (dope > 0) g.push(title(`${kind}-title`, titleAt, TITLE_KEY[kind], op * dope));
}

function symbol(
  id: string,
  at: Vec2,
  key: SemiconductorDopingMessageKey,
  opacity: number,
  style: typeof muted | typeof accent,
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: SYMBOL_PX,
    weight: 'bold',
    align: 'center',
    opacity,
    style,
  };
}

function title(id: string, at: Vec2, key: SemiconductorDopingMessageKey, opacity: number): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset: TITLE_OFFSET },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: TITLE_PX,
    weight: 'bold',
    align: 'center',
    opacity,
    style: ink,
  };
}

/**
 * 띠 그림 — 아래 띠(찬) · 위 띠(빈), 도핑 뒤 도너(n) · 억셉터(p) 준위.
 * `free` 동안 n 은 도너 전자가 위 띠로, p 는 아래 띠 전자가 억셉터 준위로 오른다.
 */
function bandDiagram(
  g: Primitive[],
  kind: Kind,
  c: SemiconductorDopingConstants,
  tl: TimelineFrame,
  op: number,
  bx: number,
): void {
  const L = bandLayout(c);
  const dope = tl.at('dope');
  const free = tl.at('free');
  const valenceY = (L.valence.bottom + L.valence.top) / 2;
  const conductionY = (L.conduction.bottom + L.conduction.top) / 2;

  g.push({
    type: 'region',
    id: `${kind}-valence`,
    points: rect(bx, BAND_HALF_W, L.valence.bottom, L.valence.top),
    fillOpacity: BAND_FILL,
    opacity: op,
    style: band,
  });
  g.push({
    type: 'region',
    id: `${kind}-conduction`,
    points: rect(bx, BAND_HALF_W, L.conduction.bottom, L.conduction.top),
    fillOpacity: BAND_FILL,
    opacity: op,
    style: band,
  });

  // 띠틈 값 — 두 띠 사이 틈 한가운데. 틈 자체가 치수라 치수선은 두지 않는다.
  g.push(value(`${kind}-gap-value`, [bx, (L.valence.top + L.conduction.bottom) / 2], [0, 0], c.gapEv, op));

  // 불순물 준위 — 도핑과 함께 나타난다. 값 글자는 준위의 틈 쪽(가운데 쪽)에 붙는다.
  const levelY = kind === 'n' ? L.donorY : L.acceptorY;
  if (dope > 0) {
    g.push({
      type: 'trajectory',
      id: `${kind}-level`,
      points: [
        [bx - BAND_HALF_W, levelY],
        [bx + BAND_HALF_W, levelY],
      ],
      width: LEVEL_WIDTH_PX,
      opacity: op * dope,
      style: { ...accent, lineStyle: 'dashed' },
    });
    g.push(
      value(
        `${kind}-level-value`,
        [bx, levelY],
        kind === 'n' ? LEVEL_VALUE_BELOW : LEVEL_VALUE_ABOVE,
        kind === 'n' ? c.donorEv : c.acceptorEv,
        op * dope,
      ),
    );
  }

  // 전자 — 아래 띠는 칸마다 하나(찬 띠). n 은 도너 준위에 하나가 더 있다.
  const positions: Vec2[] = [];
  const alphas: number[] = [];
  const col = kind === 'n' ? c.donorCol : c.acceptorCol;
  const slot = Math.max(0, Math.min(BAND_SLOTS - 1, col));
  const sx = bandSlotX(bx, slot);
  for (let j = 0; j < BAND_SLOTS; j++) {
    if (kind === 'p' && j === slot && free > 0) continue;
    positions.push([bandSlotX(bx, j), valenceY]);
    alphas.push(1);
  }
  if (kind === 'n' && dope > 0) {
    const y = levelY + (conductionY - levelY) * free;
    positions.push([sx, y]);
    alphas.push(dope);
    if (free > 0) g.push(tag(`${kind}-band-electron-tag`, [sx, y], TAG_ABOVE, 'label.electron', op * free));
  }
  if (kind === 'p' && free > 0) {
    // 아래 띠 전자 하나가 억셉터 준위로 오르고, 떠난 자리에 양공이 남는다.
    positions.push([sx, valenceY + (levelY - valenceY) * free]);
    alphas.push(1);
    g.push(ring(`${kind}-band-hole`, [sx, valenceY], op * free));
    g.push(tag(`${kind}-band-hole-tag`, [sx, valenceY], TAG_BELOW, 'label.hole', op * free));
  }
  g.push({
    type: 'particleSystem',
    id: `${kind}-band-electrons`,
    positions,
    opacities: alphas,
    sizes: ELECTRON_PX,
    opacity: op,
    style: ink,
  });
}

function value(id: string, at: Vec2, offset: Vec2, ev: number, opacity: number): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset },
    text: text('label.energy'),
    vars: { e: String(ev) },
    chip: false,
    font: 'mono',
    fontSize: VALUE_PX,
    align: 'center',
    opacity,
    style: ink,
  };
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
