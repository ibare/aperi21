// ========================================================================
// chain-reaction — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음.
//
// 같은 연료 세 판이 가로로 나란하다 — 왼쪽부터 k = 2 · 1 · 0.5. 판마다
// - 핵은 먹색 점(`body`), 쪼개진 핵은 회색 조각 둘(`body`),
// - 이번 세대의 분열은 강조색 고리(닫힌 `trajectory`) — 강조색은 이 한 뜻에만 쓴다,
// - 중성자는 회색 작은 점(`body`)과 짧은 꼬리(`trajectory` fade tail),
// - 판 아래 세대 막대(`region` 사각형) — 세대마다 쪼개진 핵의 수가 막대 높이다,
// - 판 위 k 이름표와, 다 번진 뒤 떠오르는 폭주 · 임계 · 꺼짐(`readout`).
//
// 색 — 이웃 `nuclear-fission` 과 같은 대상 같은 색: 핵은 먹(`ink`), 중성자는 회색(`muted`).
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { latticeOf, planChain, readConstants, type ChainPlan } from './physics';
import {
  BAR_BASE_Y,
  BAR_PITCH,
  BAR_UNIT,
  BAR_W,
  IGNITE_FLIGHT,
  K_LABEL_Y,
  LATTICE_CY,
  NUCLEUS_R,
  PANEL_GAP,
  PANEL_W,
  SCENE_BOUNDS,
  text,
  type ChainReactionMessageKey,
} from './schema';
import type { ChainReactionState } from './state';

// ------------------------------------------------------------------------
// 위계 — 화면 px 이거나 월드 길이
// ------------------------------------------------------------------------

/** 쪼개진 조각의 반지름 · 두 조각이 벌어지는 거리(핵 반지름의 배수). */
const FRAG_R_RATIO = 0.6;
const FRAG_GAP_RATIO = 1.5;
/** 쪼개진 조각의 짙기 — 날아가는 중성자(같은 회색, 가득)보다 옅게 가라앉힌다. */
const FRAG_OPACITY = 0.55;
/** 분열 고리가 번지는 크기(핵 반지름의 배수, 쪼개짐 진행도 1 에서). */
const RING_GROW = 1.6;
/** 분열 고리 굵기(화면 px) · 원을 표본하는 점 수. */
const RING_W = 2;
const RING_SAMPLES = 28;
/** 중성자 반지름(월드) · 튀어나온 자리(부모 중심에서 핵 반지름의 배수). */
const NEUTRON_R = 0.07;
const EMERGE_RATIO = 1.5;
/** 중성자 꼬리 길이(월드) · 굵기(화면 px). */
const TRAIL_LEN = 0.5;
const TRAIL_W = 1.5;
/** 막대 면의 짙기. */
const BAR_FILL = 0.85;
/** 막대 바닥선 굵기(화면 px) · 바닥선이 막대 묶음 양옆으로 더 나가는 길이(월드). */
const BASE_W = 1;
const BASE_OVERHANG = 0.25;
/** k 이름표 · 판정 낱말 글자 크기(화면 px)와, 둘을 가운데에서 띄우는 거리(월드). */
const K_PX = 15;
const VERDICT_PX = 15;
const LABEL_SEP = 0.12;
/** 처음 중성자가 들어오는 방향(라디안) — 0 세대 핵마다 번갈아 왼쪽 위 · 오른쪽 아래에서. */
const IGNITE_ANGLE = Math.PI * 0.8;
/** 쪼개진 두 조각이 벌어지는 축을 핵 번호마다 돌리는 각(황금각) — 이웃 조각끼리 같은 쪽으로 늘어서지 않게. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const GREY = { colorRole: 'muted', emphasis: 'strong' } as const;
const ACCENT = { colorRole: 'accent', emphasis: 'strong' } as const;

const VERDICT_KEYS: readonly ChainReactionMessageKey[] = ['label.super', 'label.critical', 'label.sub'];

const lerp = (a: number, b: number, u: number): number => a + (b - a) * u;
const add = (a: Vec2, b: Vec2, s = 1): Vec2 => [a[0] + b[0] * s, a[1] + b[1] * s];

function dot(id: string, pos: Vec2, r: number, style: Body['style'], opacity: number): Body {
  return { type: 'body', id, shape: 'circle', pos, size: r, outline: 'background', glow: false, opacity, style };
}

function label(id: string, key: ChainReactionMessageKey, at: Vec2, vars: Record<string, string>, px: number, align: 'left' | 'right', opacity: number): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: text(key),
    vars,
    chip: false,
    font: 'text',
    align,
    fontSize: px,
    opacity,
    style: INK,
  };
}

/** 중성자와 그 꼬리 — 꼬리는 출발점보다 뒤로 가지 않는다. */
function neutron(id: string, start: Vec2, pos: Vec2, dir: Vec2, opacity: number, out: Primitive[]): void {
  if (opacity <= 0) return;
  const travelled = Math.hypot(pos[0] - start[0], pos[1] - start[1]);
  const len = Math.min(TRAIL_LEN, travelled);
  if (len > 0) {
    const trail: Trajectory = {
      type: 'trajectory',
      id: `${id}-trail`,
      points: [add(pos, dir, -len), pos],
      width: TRAIL_W,
      opacity,
      style: { ...GREY, fade: 'tail' },
    };
    out.push(trail);
  }
  out.push(dot(id, pos, NEUTRON_R, GREY, opacity));
}

function panel(
  p: number,
  kValue: number,
  cx: number,
  nuclei: readonly Vec2[],
  plan: ChainPlan,
  generations: number,
  tl: TimelineFrame,
  out: Primitive[],
): void {
  const world = (q: Vec2): Vec2 => [cx + q[0], LATTICE_CY + q[1]];
  const keep = 1 - tl.at('clear');
  const renew = tl.at('renew');
  const splitOf = (g: number): number => tl.at(`split${g}`);
  // 이번 세대 고리가 흐려지는 진행도 — 다음 세대가 날아가는 동안, 마지막 세대는 판정 동안.
  const ringFadeOf = (g: number): number => (g + 1 < generations ? tl.at(`fly${g + 1}`) : tl.at('verdict'));

  // ---- 세대 막대 ----
  const barsW = (generations - 1) * BAR_PITCH + BAR_W;
  const base: Trajectory = {
    type: 'trajectory',
    id: `p${p}-base`,
    points: [
      [cx - barsW / 2 - BASE_OVERHANG, BAR_BASE_Y],
      [cx + barsW / 2 + BASE_OVERHANG, BAR_BASE_Y],
    ],
    width: BASE_W,
    style: GREY,
  };
  out.push(base);
  for (let g = 0; g < generations; g++) {
    const h = plan.fissions[g]!.length * BAR_UNIT * splitOf(g);
    if (h <= 0 || keep <= 0) continue;
    const x = cx + (g - (generations - 1) / 2) * BAR_PITCH;
    const bar: Region = {
      type: 'region',
      id: `p${p}-bar-${g}`,
      points: [
        [x - BAR_W / 2, BAR_BASE_Y],
        [x + BAR_W / 2, BAR_BASE_Y],
        [x + BAR_W / 2, BAR_BASE_Y + h],
        [x - BAR_W / 2, BAR_BASE_Y + h],
      ],
      fillOpacity: BAR_FILL,
      opaque: true,
      opacity: keep,
      style: INK,
    };
    out.push(bar);
  }

  // ---- 핵 ----
  const rings: Primitive[] = [];
  nuclei.forEach((q, i) => {
    const pos = world(q);
    const g = plan.splitAt.get(i);
    const s = g === undefined ? 0 : splitOf(g);
    if (s <= 0) {
      out.push(dot(`p${p}-u${i}`, pos, NUCLEUS_R, INK, 1));
      return;
    }
    // 쪼개지는 중 — 먹색 핵이 사라지며 회색 조각 둘이 벌어진다. 벌어지는 축은 번호로 돌린다(황금각).
    if (s < 1) out.push(dot(`p${p}-u${i}`, pos, NUCLEUS_R, INK, 1 - s));
    const a = i * GOLDEN_ANGLE;
    const half = (NUCLEUS_R * FRAG_GAP_RATIO * s) / 2;
    const axis: Vec2 = [Math.cos(a), Math.sin(a)];
    const fo = s * keep * FRAG_OPACITY;
    if (fo > 0) {
      out.push(dot(`p${p}-f${i}a`, add(pos, axis, half), NUCLEUS_R * FRAG_R_RATIO, GREY, fo));
      out.push(dot(`p${p}-f${i}b`, add(pos, axis, -half), NUCLEUS_R * FRAG_R_RATIO, GREY, fo));
    }
    // 새 연료 — 조각이 물러난 자리에 다시 선다.
    if (renew > 0) out.push(dot(`p${p}-n${i}`, pos, NUCLEUS_R, INK, renew));
    // 이번 세대 분열의 고리.
    const ro = (1 - ringFadeOf(g!)) * keep;
    if (ro > 0) {
      // 고리 굵기를 고르려고 `body` 둘레 대신 닫힌 `trajectory` 로 긋는다 (장부 G03 · G28).
      const rr = NUCLEUS_R * (1 + RING_GROW * s);
      const pts: Vec2[] = [];
      for (let m = 0; m < RING_SAMPLES; m++) {
        const t = (m / RING_SAMPLES) * Math.PI * 2;
        pts.push([pos[0] + rr * Math.cos(t), pos[1] + rr * Math.sin(t)]);
      }
      const ring: Trajectory = {
        type: 'trajectory',
        id: `p${p}-ring${i}`,
        points: pts,
        closed: true,
        width: RING_W,
        opacity: ro,
        style: ACCENT,
      };
      rings.push(ring);
    }
  });
  out.push(...rings);

  // ---- 처음 중성자 ----
  const s0 = splitOf(0);
  plan.fissions[0]!.forEach((i, j) => {
    const a = IGNITE_ANGLE + j * Math.PI;
    const dir: Vec2 = [-Math.cos(a), -Math.sin(a)];
    const target = world(nuclei[i]!);
    const start = add(target, dir, -IGNITE_FLIGHT);
    const edge = add(target, dir, -NUCLEUS_R);
    if (s0 < 1) {
      const pos: Vec2 = [lerp(start[0], edge[0], tl.at('ignite')), lerp(start[1], edge[1], tl.at('ignite'))];
      neutron(`p${p}-in${j}`, start, pos, dir, 1 - s0, out);
    }
    // 다음 주기의 처음 중성자가 제자리에 선다.
    if (renew > 0) out.push(dot(`p${p}-in${j}-next`, start, NEUTRON_R, GREY, renew));
  });

  // ---- 세대마다 튀어나온 중성자 ----
  plan.neutrons.forEach((list, g) => {
    const s = splitOf(g);
    if (s <= 0 || list.length === 0) return;
    const f = tl.at(`fly${g + 1}`);
    list.forEach((nPlan, m) => {
      const from = world(nuclei[nPlan.from]!);
      const start = add(from, nPlan.dir, NUCLEUS_R * EMERGE_RATIO * s);
      const id = `p${p}-g${g}-${m}`;
      if (nPlan.target !== undefined) {
        const t = world(nuclei[nPlan.target]!);
        const edge = add(t, nPlan.dir, -NUCLEUS_R);
        const pos: Vec2 = [lerp(start[0], edge[0], f), lerp(start[1], edge[1], f)];
        // 닿은 핵이 쪼개지기 시작하면 그 속으로 사라진다.
        neutron(id, start, pos, nPlan.dir, 1 - splitOf(g + 1), out);
      } else {
        const to = world(nPlan.lostTo!);
        const pos: Vec2 = [lerp(start[0], to[0], f), lerp(start[1], to[1], f)];
        // 빠져나가며 흐려진다.
        neutron(id, start, pos, nPlan.dir, 1 - f, out);
      }
    });
  });

  // ---- 이름표 ----
  out.push(label(`p${p}-k`, 'label.k', [cx - LABEL_SEP, K_LABEL_Y], { k: String(kValue) }, K_PX, 'right', 1));
  const v = tl.at('verdict') * keep;
  if (v > 0) {
    out.push({ ...label(`p${p}-verdict`, VERDICT_KEYS[p]!, [cx + LABEL_SEP, K_LABEL_Y], {}, VERDICT_PX, 'left', v), weight: 'bold' });
  }
}

export function scene(params: {
  state: ChainReactionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl } = params;
  if (!tl) throw new Error('chain-reaction: schema.timeline 이 선언되어야 한다');
  const K = readConstants(params.stage);
  const nuclei = latticeOf(K.seed);
  const out: Primitive[] = [];
  K.ks.forEach((kv, p) => {
    const cx = (p - 1) * (PANEL_W + PANEL_GAP);
    panel(p, kv, cx, nuclei, planChain(nuclei, kv, K, p), K.generations, tl, out);
  });
  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
