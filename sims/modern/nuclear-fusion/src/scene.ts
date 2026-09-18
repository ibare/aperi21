// ========================================================================
// nuclear-fusion — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음.
//
// 왼쪽 반응 — 핵자는 `body` 원. 양성자는 채운 원, 중성자는 속 빈 원(모양으로 가른다, 색이 아니다).
// ²H · ³H 가 양쪽에서 다가가 한 덩이가 되고, ⁴He 와 n 이 반대로 튀어 나간다.
//
// 가운데 온 막대 — 반응 전(²H + ³H) · 반응 뒤(⁴He + n) 질량을 `region` 으로 쌓는다(장부 G84).
// 두 막대의 높이 차는 1 px 도 안 된다 — 「결손은 아주 작다」 가 여기서 보인다.
//
// 오른쪽 확대창 — 두 막대의 위 끝만 `zoomFactor` 배로 키운다. 반응 뒤 막대의 위 끝(반응 전과의
// 차이)이 강조색으로 차 있다가, 입자가 날아가며 에너지 화살표가 자라는 동안 줄어들어 사라진다.
//
// 색 — 핵 · 막대 · 글자는 먹(`ink`), 축 · 창 · 이어 주는 선은 회색(`muted`). 강조색(`accent`)은
// 「에너지로 바뀌는 질량과 그 에너지」 한 뜻에만 쓴다: 확대창의 위 끝 조각, 에너지 화살표, 에너지 값.
// ========================================================================

import type {
  Body,
  Bounds,
  Dimension,
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
import {
  fullBarY,
  readConstants,
  speedRatioHeToN,
  zoomBarY,
  zoomWindowU,
} from './physics';
import { LAYOUT, SCENE_BOUNDS, text, type NuclearFusionMessageKey } from './schema';
import type { NuclearFusionState } from './state';

// ------------------------------------------------------------------------
// 위계 — 화면 px 이거나 월드 길이
// ------------------------------------------------------------------------

/** 핵자 반지름(월드)과 핵자 사이 간격(월드). */
const NUC_R = 0.13;
const NUC_STEP = 0.13;
/** ³H 의 아래 두 알갱이가 가운데에서 내려앉는 깊이(월드). */
const T_LOW = 0.1;
/** 헬륨 덩이의 바깥 반지름(월드) — 화살표 꼬리를 덩이 가장자리에 둔다. */
const CLUSTER_R = 0.3;
/** 합쳐진 덩이에서 중성자가 헬륨 중심에서 떨어져 앉는 거리(월드). */
const LUMP_N_OFFSET = 0.38;
/** 선 굵기(화면 px). */
const BASE_PX = 1;
const FRAME_PX = 1;
const GUIDE_PX = 1;
const ARROW_PX = 3;
/** 막대 면의 채움 짙기와 강조색 조각의 채움 짙기. */
const BAR_FILL = 0.16;
const DEFECT_FILL = 0.7;
/** 창 · 이어 주는 선의 짙기. */
const GUIDE_OPACITY = 0.7;
/** 온 막대 바닥선이 막대 밖으로 나가는 길이(월드). */
const BASE_OVERHANG = 0.2;
/** 온 막대에 표시하는 확대 구간 사각형이 막대 밖으로 나가는 길이(월드). */
const WINDOW_OVERHANG = 0.08;
/** 글자 크기(화면 px). */
const SYMBOL_PX = 15;
const MASS_PX = 11;
const BAR_NAME_PX = 12;
const SEGMENT_PX = 13;
const ZOOM_NAME_PX = 12;
const VALUE_PX = 12;
const ENERGY_PX = 13;
/** 핵 이름표 · 질량이 핵 중심에서 떨어지는 거리(화면 px). */
const SYMBOL_GAP = 24;
const MASS_GAP = 24;
/** 이름표를 가운데에서 비켜 두는 가로 거리(화면 px) — 맞닿는 두 핵의 글자가 겹치지 않게. */
const SIDE_NUDGE = 10;
/** 헬륨 덩이는 알갱이 넷이라 더 크다 — 이름표를 더 띄운다(화면 px). */
const CLUSTER_LABEL_GAP = 32;
/** 막대 이름이 바닥에서 떨어지는 거리(화면 px). */
const BAR_NAME_GAP = 12;
/** 확대창 이름이 창 위 끝에서 떨어지는 거리(화면 px). */
const ZOOM_NAME_GAP = 10;
/** 합 이름표가 막대 위 끝에서 떨어지는 거리(화면 px). */
const SUM_GAP = 10;
/** 결손 이름표가 치수선에서 떨어지는 거리(화면 px) · 두 줄의 세로 간격 절반(화면 px). */
const DEFECT_LABEL_DX = 8;
const DEFECT_LINE_HALF = 10;
/** 에너지 값이 화살표 끝에서 떨어지는 거리(화면 px). */
const ENERGY_LABEL_GAP = 12;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const ACCENT = { colorRole: 'accent', emphasis: 'strong' } as const;

const lerp = (a: number, b: number, u: number): number => a + (b - a) * u;
const lerp2 = (p: Vec2, q: Vec2, u: number): Vec2 => [lerp(p[0], q[0], u), lerp(p[1], q[1], u)];
const add = (p: Vec2, q: Vec2): Vec2 => [p[0] + q[0], p[1] + q[1]];
const scale = (p: Vec2, s: number): Vec2 => [p[0] * s, p[1] * s];

// ------------------------------------------------------------------------
// 핵자 배치 — 덩이 중심에서의 자리(월드)
// ------------------------------------------------------------------------

type Kind = 'p' | 'n';
interface Nucleon {
  kind: Kind;
  /** 반응 전 자리 — 어느 핵의 몇째 알갱이인가. */
  from: 'D' | 'T';
  at: Vec2;
  /** 반응 뒤 — 헬륨 덩이 안의 자리이거나, 떨어져 나가는 중성자(`free`). */
  to: Vec2 | 'free';
}

/**
 * 다섯 알갱이. ²H 는 p · n, ³H 는 p · n · n, ⁴He 는 p · n · n · p, 남는 n 하나가 튀어 나간다.
 * 반응의 정의라 스테이지 상수로 올리지 않는다.
 */
const NUCLEONS: readonly Nucleon[] = [
  { kind: 'p', from: 'D', at: [-NUC_STEP, 0], to: [-NUC_STEP, NUC_STEP] },
  { kind: 'n', from: 'D', at: [NUC_STEP, 0], to: [NUC_STEP, NUC_STEP] },
  { kind: 'p', from: 'T', at: [0, NUC_STEP], to: [NUC_STEP, -NUC_STEP] },
  { kind: 'n', from: 'T', at: [-NUC_STEP, -T_LOW], to: [-NUC_STEP, -NUC_STEP] },
  { kind: 'n', from: 'T', at: [NUC_STEP, -T_LOW], to: 'free' },
];

function nucleon(id: string, kind: Kind, pos: Vec2, opacity: number, out: Primitive[]): void {
  if (opacity <= 0) return;
  const b: Body = {
    type: 'body',
    id,
    shape: 'circle',
    pos,
    size: NUC_R,
    fill: kind === 'p' ? 'solid' : 'none',
    outline: kind === 'p' ? 'background' : 'role',
    glow: false,
    opacity,
    style: INK,
  };
  out.push(b);
}

function label(
  id: string,
  key: NuclearFusionMessageKey,
  anchor: Readout['anchor'],
  fontSize: number,
  align: 'left' | 'center' | 'right',
  opacity: number,
  style: Readout['style'],
  opts: { vars?: Record<string, string | number>; font?: 'text' | 'mono' } = {},
): Readout | null {
  if (opacity <= 0) return null;
  return {
    type: 'readout',
    id,
    anchor,
    text: text(key),
    ...(opts.vars ? { vars: opts.vars } : {}),
    chip: false,
    font: opts.font ?? 'text',
    align,
    fontSize,
    opacity,
    style,
  };
}

function push(out: Primitive[], p: Primitive | null): void {
  if (p) out.push(p);
}

/** 가로 구간 [x0, x1] · 세로 [y0, y1] 의 막대 면. `edges` 는 굵게 그을 변(아래 · 오른쪽 · 위 · 왼쪽 순 인덱스). */
function bar(
  id: string,
  xs: readonly [number, number],
  y0: number,
  y1: number,
  role: 'ink' | 'accent',
  opacity: number,
  edges: readonly (readonly [number, number])[],
  out: Primitive[],
): void {
  if (opacity <= 0 || y1 - y0 <= 0) return;
  const r: Region = {
    type: 'region',
    id,
    points: [
      [xs[0], y0],
      [xs[1], y0],
      [xs[1], y1],
      [xs[0], y1],
    ],
    fillOpacity: role === 'accent' ? DEFECT_FILL : BAR_FILL,
    outline: edges,
    opacity,
    style: role === 'accent' ? ACCENT : INK,
  };
  out.push(r);
}

/** 사각형 윤곽(닫힌 선). */
function rect(
  id: string,
  min: Vec2,
  max: Vec2,
  width: number,
  opacity: number,
  style: Trajectory['style'],
  out: Primitive[],
): void {
  if (opacity <= 0) return;
  const t: Trajectory = {
    type: 'trajectory',
    id,
    points: [min, [max[0], min[1]], max, [min[0], max[1]]],
    closed: true,
    width,
    opacity,
    style,
  };
  out.push(t);
}

const ALL_EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
] as const;
/** 확대창 안 막대 — 아래로는 창 밖까지 이어지므로 아래 변을 긋지 않는다. */
const OPEN_BOTTOM = [
  [1, 2],
  [2, 3],
  [3, 0],
] as const;
/** 강조색 조각 — 막대 윗면 위에 얹힌다. 아래 변은 막대의 윗변이 긋는다. */
const CAP_EDGES = OPEN_BOTTOM;

const center = (xs: readonly [number, number]): number => (xs[0] + xs[1]) / 2;

export function scene(params: {
  state: NuclearFusionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl } = params;
  if (!tl) throw new Error('nuclear-fusion: schema.timeline 이 선언되어야 한다');
  const k = readConstants(params.stage);

  /** 두 핵이 다가가는 몫 — `approach` 와 `close` 에 걸쳐 한 번에 간다. */
  const approach = tl.span(tl.start('approach'), tl.end('close'), 'smooth');
  const close = tl.at('close');
  const fuse = tl.at('fuse');
  const fly = tl.at('fly');
  const reveal = tl.at('reveal');
  const renew = tl.at('renew');
  const keep = 1 - tl.at('clear');
  /** 반응 뒤의 것이 보이는 정도 — 합쳐지며 나타나 `clear` 에서 물러난다. */
  const after = fuse * keep;
  /** 반응 뒤 질량이 에너지로 빠져나간 몫 0~1. */
  const drain = fly;
  /** 날아가는 거리 몫 — `fly` 시작부터 `hold` 끝까지 한결같이 간다. */
  const travel = tl.span(tl.start('fly'), tl.end('hold'));
  const out: Primitive[] = [];

  // ================= 가운데 — 온 막대 =================
  const base: Trajectory = {
    type: 'trajectory',
    id: 'bar-base',
    points: [
      [LAYOUT.barBefore[0] - BASE_OVERHANG, LAYOUT.barBaseY],
      [LAYOUT.barAfter[1] + BASE_OVERHANG, LAYOUT.barBaseY],
    ],
    width: BASE_PX,
    style: MUTED,
  };
  out.push(base);

  const yD = fullBarY(k.massD);
  const yBefore = fullBarY(k.sumBefore);
  bar('full-before-d', LAYOUT.barBefore, LAYOUT.barBaseY, yD, 'ink', 1, ALL_EDGES, out);
  bar('full-before-t', LAYOUT.barBefore, yD, yBefore, 'ink', 1, ALL_EDGES, out);
  push(out, label('full-before-d-name', 'symbol.D', { world: [center(LAYOUT.barBefore), (LAYOUT.barBaseY + yD) / 2] }, SEGMENT_PX, 'center', 1, INK));
  push(out, label('full-before-t-name', 'symbol.T', { world: [center(LAYOUT.barBefore), (yD + yBefore) / 2] }, SEGMENT_PX, 'center', 1, INK));

  const yHe = fullBarY(k.massHe);
  const yAfter = fullBarY(k.sumAfter);
  bar('full-after-he', LAYOUT.barAfter, LAYOUT.barBaseY, yHe, 'ink', after, ALL_EDGES, out);
  bar('full-after-n', LAYOUT.barAfter, yHe, yAfter, 'ink', after, ALL_EDGES, out);
  bar('full-after-defect', LAYOUT.barAfter, yAfter, fullBarY(k.sumAfter + k.massDefect * (1 - drain)), 'accent', after, CAP_EDGES, out);
  push(out, label('full-after-he-name', 'symbol.He', { world: [center(LAYOUT.barAfter), (LAYOUT.barBaseY + yHe) / 2] }, SEGMENT_PX, 'center', after, INK));
  push(out, label('full-after-n-name', 'symbol.n', { world: [center(LAYOUT.barAfter), (yHe + yAfter) / 2] }, SEGMENT_PX, 'center', after, INK));

  push(out, label('full-before-name', 'label.before', { world: [center(LAYOUT.barBefore), LAYOUT.barBaseY], offset: [0, BAR_NAME_GAP] }, BAR_NAME_PX, 'center', 1, INK));
  push(out, label('full-after-name', 'label.after', { world: [center(LAYOUT.barAfter), LAYOUT.barBaseY], offset: [0, BAR_NAME_GAP] }, BAR_NAME_PX, 'center', after, INK));

  // 확대창이 비추는 구간 — 온 막대 위 끝의 얇은 띠. 창의 왼쪽 두 모서리로 선을 잇는다.
  const [wBottomU, wTopU] = zoomWindowU(k);
  const wMin: Vec2 = [LAYOUT.barBefore[0] - WINDOW_OVERHANG, fullBarY(wBottomU)];
  const wMax: Vec2 = [LAYOUT.barAfter[1] + WINDOW_OVERHANG, fullBarY(wTopU)];
  rect('zoom-source', wMin, wMax, GUIDE_PX, GUIDE_OPACITY, MUTED, out);
  const toZoomTop: Trajectory = {
    type: 'trajectory',
    id: 'zoom-link-top',
    points: [[wMax[0], wMax[1]], [LAYOUT.zoomMin[0], LAYOUT.zoomMax[1]]],
    width: GUIDE_PX,
    opacity: GUIDE_OPACITY,
    style: { ...MUTED, lineStyle: 'dashed' },
  };
  const toZoomBottom: Trajectory = {
    type: 'trajectory',
    id: 'zoom-link-bottom',
    points: [[wMax[0], wMin[1]], [LAYOUT.zoomMin[0], LAYOUT.zoomMin[1]]],
    width: GUIDE_PX,
    opacity: GUIDE_OPACITY,
    style: { ...MUTED, lineStyle: 'dashed' },
  };
  out.push(toZoomTop, toZoomBottom);

  // ================= 오른쪽 — 확대창 =================
  rect('zoom-frame', LAYOUT.zoomMin, LAYOUT.zoomMax, FRAME_PX, 1, MUTED, out);
  push(
    out,
    label('zoom-name', 'label.zoom', { world: [LAYOUT.zoomMin[0], LAYOUT.zoomMax[1]], offset: [0, -ZOOM_NAME_GAP] }, ZOOM_NAME_PX, 'left', 1, MUTED, {
      vars: { z: String(k.zoomFactor) },
    }),
  );

  const zBottom = LAYOUT.zoomMin[1];
  const zBefore = zoomBarY(k.sumBefore, k);
  const zAfter = zoomBarY(k.sumAfter, k);
  const zCap = zoomBarY(k.sumAfter + k.massDefect * (1 - drain), k);
  bar('zoom-before', LAYOUT.zoomBefore, zBottom, zBefore, 'ink', 1, OPEN_BOTTOM, out);
  bar('zoom-after', LAYOUT.zoomAfter, zBottom, zAfter, 'ink', after, OPEN_BOTTOM, out);
  bar('zoom-defect', LAYOUT.zoomAfter, zAfter, zCap, 'accent', after, CAP_EDGES, out);

  // 비어 버린 자리 — 반응 전 높이까지의 점선 윤곽. 빠져나간 만큼 짙어진다.
  rect('zoom-gap', [LAYOUT.zoomAfter[0], zAfter], [LAYOUT.zoomAfter[1], zBefore], GUIDE_PX, GUIDE_OPACITY * drain * keep, { ...MUTED, lineStyle: 'dashed' }, out);

  push(out, label('zoom-before-sum', 'label.mass', { world: [center(LAYOUT.zoomBefore), zBefore], offset: [0, -SUM_GAP] }, MASS_PX, 'center', 1, INK, { vars: { m: String(k.sumBefore) }, font: 'mono' }));
  push(out, label('zoom-after-sum', 'label.mass', { world: [center(LAYOUT.zoomAfter), zAfter], offset: [0, -SUM_GAP] }, MASS_PX, 'center', reveal * keep, INK, { vars: { m: String(k.sumAfter) }, font: 'mono' }));
  push(out, label('zoom-before-name', 'label.before', { world: [center(LAYOUT.zoomBefore), zBottom], offset: [0, BAR_NAME_GAP] }, BAR_NAME_PX, 'center', 1, INK));
  push(out, label('zoom-after-name', 'label.after', { world: [center(LAYOUT.zoomAfter), zBottom], offset: [0, BAR_NAME_GAP] }, BAR_NAME_PX, 'center', after, INK));

  // 결손 — 치수선 · Δm · 나온 에너지.
  const show = reveal * keep;
  if (show > 0) {
    const d: Dimension = {
      type: 'dimension',
      id: 'defect-dimension',
      from: [LAYOUT.defectX, zAfter],
      to: [LAYOUT.defectX, zBefore],
      opacity: show,
      style: INK,
    };
    out.push(d);
  }
  const defectMid: Vec2 = [LAYOUT.defectX, (zAfter + zBefore) / 2];
  push(out, label('defect-mass', 'label.defect', { world: defectMid, offset: [DEFECT_LABEL_DX, -DEFECT_LINE_HALF] }, VALUE_PX, 'left', show, INK, { vars: { m: String(k.massDefect) }, font: 'mono' }));
  push(out, label('defect-energy', 'label.released', { world: defectMid, offset: [DEFECT_LABEL_DX, DEFECT_LINE_HALF] }, ENERGY_PX, 'left', show, ACCENT, { vars: { e: String(k.energyMeV) } }));

  // ================= 왼쪽 — 반응 =================
  const meet: Vec2 = [LAYOUT.meet[0], LAYOUT.meet[1]];
  const dirN: Vec2 = [Math.cos((LAYOUT.neutronDirDeg * Math.PI) / 180), Math.sin((LAYOUT.neutronDirDeg * Math.PI) / 180)];
  const dirHe: Vec2 = scale(dirN, -1);
  const heCenter = add(meet, scale(dirHe, LAYOUT.neutronTravel * speedRatioHeToN(k) * travel));
  const lumpN = add(meet, scale(dirN, LUMP_N_OFFSET));
  const nCenter = add(lumpN, scale(dirN, LAYOUT.neutronTravel * travel));

  /** 반응 전 두 핵의 중심 — `approach` 진행도로 다가간다. 다음 주기의 것은 처음 자리에 선다. */
  const dAt = (u: number): Vec2 => [lerp(LAYOUT.dStartX, meet[0] - LAYOUT.contactGap / 2, u), meet[1]];
  const tAt = (u: number): Vec2 => [lerp(LAYOUT.tStartX, meet[0] + LAYOUT.contactGap / 2, u), meet[1]];

  if (fuse <= 0) {
    NUCLEONS.forEach((q, i) => nucleon(`nucleon-${i}`, q.kind, add(q.from === 'D' ? dAt(approach) : tAt(approach), q.at), 1, out));
  } else {
    // 합쳐지고, 튀어 나간다. 헬륨 덩이는 함께 움직이고 남는 중성자는 따로 간다.
    NUCLEONS.forEach((q, i) => {
      const start = add(q.from === 'D' ? dAt(1) : tAt(1), q.at);
      const lump = q.to === 'free' ? lumpN : add(meet, q.to);
      const now = q.to === 'free' ? nCenter : add(heCenter, q.to);
      const pos = travel > 0 ? now : lerp2(start, lump, fuse);
      nucleon(`nucleon-${i}`, q.kind, pos, keep, out);
    });
  }
  // 다음 주기의 ²H · ³H — 처음 자리에 선다.
  if (renew > 0) {
    NUCLEONS.forEach((q, i) => nucleon(`nucleon-next-${i}`, q.kind, add(q.from === 'D' ? dAt(0) : tAt(0), q.at), renew, out));
  }

  // 반응 전 이름표 · 질량 — 합쳐지며 물러난다.
  // 두 핵의 이름표는 서로 바깥쪽(²H 는 왼쪽, ³H 는 오른쪽)으로 비켜 두어 맞닿아도 겹치지 않는다.
  const beforeShow = Math.max(renew, 1 - close);
  const dPos = renew > 0 ? dAt(0) : dAt(approach);
  const tPos = renew > 0 ? tAt(0) : tAt(approach);
  push(out, label('d-symbol', 'symbol.D', { world: dPos, offset: [SIDE_NUDGE, -SYMBOL_GAP] }, SYMBOL_PX, 'right', beforeShow, INK));
  push(out, label('d-mass', 'label.mass', { world: dPos, offset: [SIDE_NUDGE, MASS_GAP] }, MASS_PX, 'right', beforeShow, INK, { vars: { m: String(k.massD) }, font: 'mono' }));
  push(out, label('t-symbol', 'symbol.T', { world: tPos, offset: [-SIDE_NUDGE, -SYMBOL_GAP] }, SYMBOL_PX, 'left', beforeShow, INK));
  push(out, label('t-mass', 'label.mass', { world: tPos, offset: [-SIDE_NUDGE, MASS_GAP] }, MASS_PX, 'left', beforeShow, INK, { vars: { m: String(k.massT) }, font: 'mono' }));

  // 반응 뒤 — 에너지 화살표는 빠져나간 질량만큼 자란다. 길이가 그 입자의 에너지다.
  // 질량 글자는 두 입자가 가까운 첫머리에 서로 덮지 않도록 바깥쪽(n 은 왼쪽, ⁴He 도 왼쪽 아래)에 둔다.
  const flyShow = fly * keep;
  if (flyShow > 0) {
    const heArrow: Vector = {
      type: 'vector',
      id: 'energy-he',
      from: add(heCenter, scale(dirHe, CLUSTER_R)),
      delta: scale(dirHe, k.energyHeMeV * LAYOUT.arrowPerMeV * drain),
      width: ARROW_PX,
      opacity: keep,
      style: ACCENT,
    };
    const nArrow: Vector = {
      type: 'vector',
      id: 'energy-n',
      from: add(nCenter, scale(dirN, NUC_R)),
      delta: scale(dirN, k.energyNMeV * LAYOUT.arrowPerMeV * drain),
      width: ARROW_PX,
      opacity: keep,
      style: ACCENT,
    };
    out.push(heArrow, nArrow);
    const heTip = add(heCenter, scale(dirHe, CLUSTER_R + k.energyHeMeV * LAYOUT.arrowPerMeV * drain));
    const nTip = add(nCenter, scale(dirN, NUC_R + k.energyNMeV * LAYOUT.arrowPerMeV * drain));
    push(out, label('energy-he-value', 'label.energy', { world: heTip, offset: [ENERGY_LABEL_GAP, 0] }, ENERGY_PX, 'left', flyShow, ACCENT, { vars: { e: String(k.energyHeMeV) } }));
    push(out, label('energy-n-value', 'label.energy', { world: nTip, offset: [0, -ENERGY_LABEL_GAP] }, ENERGY_PX, 'center', flyShow, ACCENT, { vars: { e: String(k.energyNMeV) } }));

    push(out, label('he-symbol', 'symbol.He', { world: heCenter, offset: [0, -CLUSTER_LABEL_GAP] }, SYMBOL_PX, 'center', flyShow, INK));
    push(out, label('he-mass', 'label.mass', { world: heCenter, offset: [SIDE_NUDGE, CLUSTER_LABEL_GAP] }, MASS_PX, 'right', flyShow, INK, { vars: { m: String(k.massHe) }, font: 'mono' }));
    push(out, label('n-symbol', 'symbol.n', { world: nCenter, offset: [0, -SYMBOL_GAP] }, SYMBOL_PX, 'center', flyShow, INK));
    push(out, label('n-mass', 'label.mass', { world: nCenter, offset: [SIDE_NUDGE, MASS_GAP] }, MASS_PX, 'right', flyShow, INK, { vars: { m: String(k.massN) }, font: 'mono' }));
  }

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}

