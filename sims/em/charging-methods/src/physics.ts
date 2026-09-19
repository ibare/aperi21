// ========================================================================
// charging-methods — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 모든 자리가 시간표 진행도의 함수이고 `step` 은 항등이다.
//
// 전자는 하나하나가 이름(id)을 가진 알갱이다. 판마다 **누가 어느 물체에 몇 번째로
// 있는가**(보유 목록)를 단계 경계마다 적어 두고, 그 단계의 진행도로 두 보유 목록
// 사이의 자리를 잇는다. 그래서
//
//   - 다른 물체로 옮겨 가는 전자는 한 물체에서 다른 물체로 실제로 건너가고,
//   - 남은 전자는 줄어든 수에 맞춰 제 물체 안에서 다시 벌어지고,
//   - 원자핵 + 는 보유 목록에 없어 물체에 붙은 채 움직이지 않는다.
//
// 결과 표식(중성 · − · +)은 단계 이름으로 고르지 않고 **마지막으로 끝난 보유 목록의
// 전자 수와 원자핵 수의 차**로 정한다. 저작자가 옮기는 전자 수를 0 으로 두면 표식도
// 중성으로 남는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  CONTACT,
  CONTACT_EXCESS,
  CROWD_FRACTION,
  ELECTRON_STAGGER,
  FRICTION,
  GROUND_OUT,
  INDUCER_EXCESS,
  INDUCTION,
  NUCLEI_PER_OBJECT,
  PANEL_X,
  RUB_AMPLITUDE,
  RUB_STROKES,
  RUB_TRANSFER,
} from './schema';
import type { ChargingMethodsState } from './state';

// ------------------------------------------------------------------------
// 물체 안 배치 — 물체 가운데에서 잰 자리(월드). 위 줄에 +, 아래 두 줄에 전자.
// ------------------------------------------------------------------------

/** + 줄의 높이. */
const PLUS_ROW_Y = 0.22;
/** 전자 두 줄의 높이. */
const ELECTRON_ROW_Y = [-0.03, -0.25] as const;
/** 물체 좌우 끝에서 알갱이까지 띄우는 거리. */
const SIDE_PAD = 0.18;
/** 땅에 빠진 전자 줄 — 땅 기호 아래로 내리는 거리와 알갱이 간격. */
const EARTH_ROW_DROP = 0.4;
const EARTH_ROW_GAP = 0.3;
/** 접지선이 도체에 닿는 높이(도체 가운데에서). 전자 윗줄 높이다. */
const WIRE_TAP_Y = ELECTRON_ROW_Y[0];

export interface ChargingConstants {
  nucleiPerObject: number;
  rubTransfer: number;
  contactExcess: number;
  inducerExcess: number;
  groundOut: number;
  rubStrokes: number;
  rubAmplitude: number;
  crowdFraction: number;
  electronStagger: number;
}

export function readConstants(stage: StageDef): ChargingConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    nucleiPerObject: c.nucleiPerObject ?? NUCLEI_PER_OBJECT,
    rubTransfer: c.rubTransfer ?? RUB_TRANSFER,
    contactExcess: c.contactExcess ?? CONTACT_EXCESS,
    inducerExcess: c.inducerExcess ?? INDUCER_EXCESS,
    groundOut: c.groundOut ?? GROUND_OUT,
    rubStrokes: c.rubStrokes ?? RUB_STROKES,
    rubAmplitude: c.rubAmplitude ?? RUB_AMPLITUDE,
    crowdFraction: c.crowdFraction ?? CROWD_FRACTION,
    electronStagger: c.electronStagger ?? ELECTRON_STAGGER,
  };
}

// ------------------------------------------------------------------------
// 물체 · 보유 목록
// ------------------------------------------------------------------------

/** 판 안의 물체. 모양은 scene 이 고른다 — 털가죽만 결 있는 면이다. */
export type ObjectId = 'rod' | 'fur' | 'condA' | 'condB' | 'inducer' | 'cond';
/** 전자를 가질 수 있는 곳 — 물체 또는 땅. */
export type HolderId = ObjectId | 'earth';

export type ChargeSign = 'neutral' | 'negative' | 'positive';

export interface ObjectPlace {
  id: ObjectId;
  panel: number;
  center: Vec2;
  width: number;
  /** 마지막으로 끝난 보유 목록의 부호. */
  sign: ChargeSign;
}

/** 보유 목록 — 곳마다 그 안에 든 전자 id 들(순서가 자리 번호다). `crowd` 는 먼 쪽으로 몰림. */
type Holding = Partial<Record<HolderId, { ids: readonly string[]; crowd?: boolean }>>;

interface Transition {
  /** 이 단계의 진행도로 앞 목록에서 뒤 목록으로 잇는다. */
  phase: string;
  to: Holding;
  /** 땅으로 가는 전자는 접지선을 따라간다. */
  viaWire?: boolean;
}

interface PanelPlan {
  start: Holding;
  transitions: readonly Transition[];
}

function ids(prefix: string, from: number, to: number): string[] {
  const out: string[] = [];
  for (let i = from; i < to; i++) out.push(`${prefix}${i}`);
  return out;
}

/** 세 판의 보유 목록 차례. 수는 모두 스테이지 상수에서 온다. */
function plans(c: ChargingConstants): { friction: PanelPlan; contact: PanelPlan; induction: PanelPlan } {
  const n = Math.max(0, Math.round(c.nucleiPerObject));

  // 마찰 — 털가죽의 마지막 몇 개가 막대로 간다.
  const rub = Math.min(n, Math.max(0, Math.round(c.rubTransfer)));
  const rod0 = ids('r', 0, n);
  const fur0 = ids('f', 0, n);
  const friction: PanelPlan = {
    start: { rod: { ids: rod0 }, fur: { ids: fur0 } },
    transitions: [
      {
        phase: 'rub',
        to: { rod: { ids: [...rod0, ...fur0.slice(n - rub)] }, fur: { ids: fur0.slice(0, n - rub) } },
      },
    ],
  };

  // 접촉 — 같은 도체 둘이라 A 의 남는 전자를 반씩 나눈다.
  const excess = Math.max(0, Math.round(c.contactExcess));
  const move = Math.floor(excess / 2);
  const a0 = ids('a', 0, n + excess);
  const b0 = ids('b', 0, n);
  const contact: PanelPlan = {
    start: { condA: { ids: a0 }, condB: { ids: b0 } },
    transitions: [
      {
        phase: 'share',
        to: { condA: { ids: a0.slice(0, a0.length - move) }, condB: { ids: [...b0, ...a0.slice(a0.length - move)] } },
      },
    ],
  };

  // 유도 — 막대의 전자는 옮겨 가지 않는다. 도체의 전자가 몰리고, 일부가 땅으로 간다.
  const out = Math.min(n, Math.max(0, Math.round(c.groundOut)));
  const inducer = { ids: ids('m', 0, n + Math.max(0, Math.round(c.inducerExcess))) };
  const c0 = ids('c', 0, n);
  const stay = c0.slice(0, n - out);
  const gone = c0.slice(n - out);
  const induction: PanelPlan = {
    start: { inducer, cond: { ids: c0 } },
    transitions: [
      { phase: 'near', to: { inducer, cond: { ids: c0, crowd: true } } },
      { phase: 'ground', to: { inducer, cond: { ids: stay, crowd: true }, earth: { ids: gone } }, viaWire: true },
      { phase: 'withdraw', to: { inducer, cond: { ids: stay }, earth: { ids: gone } } },
    ],
  };

  return { friction, contact, induction };
}

// ------------------------------------------------------------------------
// 한 순간의 모습
// ------------------------------------------------------------------------

export interface Particle {
  id: string;
  pos: Vec2;
}

export interface ChargingFrame {
  opacity: number;
  objects: ObjectPlace[];
  nuclei: Particle[];
  electrons: Particle[];
  /** 접지선의 꺾인 점들과 불투명도. */
  wire: { points: Vec2[]; opacity: number };
  /** 땅 기호 윗선의 가운데. */
  earth: Vec2;
}

/** 물체의 폭과 지금 가운데. */
function objectGeometry(c: ChargingConstants, tl: TimelineFrame): Record<ObjectId, { panel: number; center: Vec2; width: number }> {
  const [fx, cx, ix] = PANEL_X;
  const stroke = Math.sin(2 * Math.PI * c.rubStrokes * tl.at('rub'));
  const lift = tl.at('rubApart');
  const reach = tl.at('touch') - tl.at('contactApart');
  const approach = tl.at('near') - tl.at('withdraw');
  return {
    rod: {
      panel: 0,
      center: [fx + c.rubAmplitude * stroke, FRICTION.rodRubY + (FRICTION.rodApartY - FRICTION.rodRubY) * lift],
      width: FRICTION.width,
    },
    fur: { panel: 0, center: [fx, FRICTION.furY], width: FRICTION.width },
    condA: { panel: 1, center: [cx + CONTACT.aX + (CONTACT.aTouchX - CONTACT.aX) * reach, CONTACT.y], width: CONTACT.width },
    condB: { panel: 1, center: [cx + CONTACT.bX, CONTACT.y], width: CONTACT.width },
    inducer: {
      panel: 2,
      center: [ix + INDUCTION.rodFarX + (INDUCTION.rodNearX - INDUCTION.rodFarX) * approach, INDUCTION.rodY],
      width: INDUCTION.rodW,
    },
    cond: { panel: 2, center: [ix + INDUCTION.condX, INDUCTION.condY], width: INDUCTION.condW },
  };
}

type Geometry = ReturnType<typeof objectGeometry>;

function earthTop(): Vec2 {
  return [(PANEL_X[2] ?? 0) + INDUCTION.wireX, INDUCTION.earthY];
}

/** 접지선 — 도체 오른쪽 끝에서 옆으로 나와 땅으로 내려간다. */
function wirePoints(g: Geometry): Vec2[] {
  const cond = g.cond;
  const tapY = cond.center[1] + WIRE_TAP_Y;
  const [ex, ey] = earthTop();
  return [
    [cond.center[0] + cond.width / 2, tapY],
    [ex, tapY],
    [ex, ey],
  ];
}

/** 곳 안에서 i 번째 전자의 자리(k 개 중). */
function slotPos(
  holder: HolderId,
  i: number,
  k: number,
  crowd: boolean,
  g: Geometry,
  c: ChargingConstants,
): Vec2 {
  if (holder === 'earth') {
    const [ex, ey] = earthTop();
    return [ex + (i - (k - 1) / 2) * EARTH_ROW_GAP, ey - EARTH_ROW_DROP];
  }
  const o = g[holder];
  const cols = Math.max(1, Math.ceil(k / 2));
  const row = i < cols ? 0 : 1;
  const col = row === 0 ? i : i - cols;
  let xa = -o.width / 2 + SIDE_PAD;
  const xb = o.width / 2 - SIDE_PAD;
  // 몰리는 쪽은 막대에서 먼 쪽(오른쪽)이다.
  if (crowd) xa = xb - (xb - xa) * c.crowdFraction;
  return [o.center[0] + xa + ((xb - xa) * (col + 0.5)) / cols, o.center[1] + (ELECTRON_ROW_Y[row] ?? 0)];
}

/** 보유 목록에서 전자마다의 자리. */
function placeAll(h: Holding, g: Geometry, c: ChargingConstants): Map<string, { pos: Vec2; holder: HolderId }> {
  const out = new Map<string, { pos: Vec2; holder: HolderId }>();
  for (const [holder, entry] of Object.entries(h) as [HolderId, { ids: readonly string[]; crowd?: boolean }][]) {
    entry.ids.forEach((id, i) => {
      out.set(id, { pos: slotPos(holder, i, entry.ids.length, entry.crowd ?? false, g, c), holder });
    });
  }
  return out;
}

/** 꺾은선 위 진행도 p(0~1) 자리 — 길이 비례. */
function alongPath(points: readonly Vec2[], p: number): Vec2 {
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    seg.push(d);
    total += d;
  }
  if (total === 0) return points[0] ?? [0, 0];
  let left = p * total;
  for (let i = 0; i < seg.length; i++) {
    const d = seg[i]!;
    if (left <= d || i === seg.length - 1) {
      const a = points[i]!;
      const b = points[i + 1]!;
      const s = d === 0 ? 0 : Math.min(1, left / d);
      return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
    }
    left -= d;
  }
  return points[points.length - 1] ?? [0, 0];
}

function lerp(a: Vec2, b: Vec2, s: number): Vec2 {
  return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
}

/**
 * 한 판의 전자 자리와, 마지막으로 끝난 보유 목록.
 *
 * 진행 중인 단계(진행도가 0 과 1 사이)가 있으면 그 앞뒤 목록 사이를 잇고, 없으면
 * 마지막으로 끝난 목록 그대로다.
 */
function panelElectrons(
  plan: PanelPlan,
  tl: TimelineFrame,
  g: Geometry,
  c: ChargingConstants,
): { electrons: Particle[]; settled: Holding } {
  let settled = plan.start;
  let moving: { t: Transition; p: number } | undefined;
  for (const t of plan.transitions) {
    const p = tl.at(t.phase);
    if (p >= 1) {
      settled = t.to;
      continue;
    }
    if (p > 0) moving = { t, p };
    break;
  }

  const from = placeAll(settled, g, c);
  if (!moving) {
    return { electrons: [...from].map(([id, v]) => ({ id, pos: v.pos })), settled };
  }
  const to = placeAll(moving.t.to, g, c);
  const wire = wirePoints(g);
  const electrons: Particle[] = [];
  // 선을 타는 전자는 한 줄로 떠난다 — k 번째는 시차 × k 만큼 늦게 출발하고, 모두 단계 끝에 닿는다.
  const riders = [...from].filter(([id, a]) => moving.t.viaWire && a.holder !== 'earth' && to.get(id)?.holder === 'earth');
  const lag = riders.length > 1 ? Math.min(c.electronStagger, 1 / riders.length) : 0;
  const riderRank = new Map(riders.map(([id], k) => [id, riders.length - 1 - k]));
  for (const [id, a] of from) {
    const b = to.get(id) ?? a;
    const rank = riderRank.get(id);
    if (rank !== undefined) {
      const span = 1 - lag * (riders.length - 1);
      const p = Math.min(1, Math.max(0, (moving.p - lag * rank) / span));
      electrons.push({ id, pos: alongPath([a.pos, ...wire, b.pos], p) });
    } else {
      electrons.push({ id, pos: lerp(a.pos, b.pos, moving.p) });
    }
  }
  return { electrons, settled };
}

function signOf(electrons: number, nuclei: number): ChargeSign {
  if (electrons > nuclei) return 'negative';
  if (electrons < nuclei) return 'positive';
  return 'neutral';
}

export function derive(tl: TimelineFrame, c: ChargingConstants): ChargingFrame {
  const g = objectGeometry(c, tl);
  const p = plans(c);
  const n = Math.max(0, Math.round(c.nucleiPerObject));

  const electrons: Particle[] = [];
  const settled: Holding = {};
  for (const plan of [p.friction, p.contact, p.induction]) {
    const r = panelElectrons(plan, tl, g, c);
    electrons.push(...r.electrons);
    Object.assign(settled, r.settled);
  }

  const objects: ObjectPlace[] = [];
  const nuclei: Particle[] = [];
  for (const id of Object.keys(g) as ObjectId[]) {
    const o = g[id];
    objects.push({ id, panel: o.panel, center: o.center, width: o.width, sign: signOf(settled[id]?.ids.length ?? 0, n) });
    const xa = -o.width / 2 + SIDE_PAD;
    const xb = o.width / 2 - SIDE_PAD;
    for (let i = 0; i < n; i++) {
      nuclei.push({
        id: `${id}-${i}`,
        pos: [o.center[0] + xa + ((xb - xa) * (i + 0.5)) / n, o.center[1] + PLUS_ROW_Y],
      });
    }
  }

  return {
    opacity: tl.at('appear') * (1 - tl.at('fade')),
    objects,
    nuclei,
    electrons,
    wire: { points: wirePoints(g), opacity: tl.at('connect') * (1 - tl.at('unground')) },
    earth: earthTop(),
  };
}

export function step(params: { state: ChargingMethodsState }): ChargingMethodsState {
  return params.state;
}
