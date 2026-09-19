// ========================================================================
// brewster-angle — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
// 두 칸이다.
//   왼쪽 — 공기와 유리의 경계면, 법선, 들어온 · 반사 · 굴절 세 줄기. 줄기마다 떨림 표식을 번갈아 단다 —
//          ⊙ 는 입사면에 수직인 떨림, ↕ 는 입사면 안의 떨림(줄기에 수직). 들어온 빛은 두 표식이 같은 크기이고,
//          반사 줄기의 표식 크기는 그 떨림이 반사되는 진폭(× 선언 배율)이다. 56.3° 에서 반사 줄기의 ↕ 가 사라지고,
//          반사 줄기와 굴절 줄기 사이에 강조색 직각 부채꼴이 선다.
//   오른쪽 — 반사율-각 판. ⊙ 몫(실선)과 ↕ 몫(점선) 두 곡선과 지금 점, 56.3° 자리의 강조색 세로 점선.
//
// 색 — 줄기 · 판 · 눈금은 배경 정보라 muted, 떨림 표식 · 곡선 · 지금 점은 ink. 두 떨림은 색이 아니라
// 표식 모양(⊙ · ↕)과 선 모양(실선 · 점선)으로 가른다. 강조색은 「브루스터 각」 한 뜻에만 쓴다 —
// 직각 부채꼴 · 그 글자, 판의 56.3° 세로 점선 · 눈금 글자.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { BREWSTER_HOLD, fresnel, holdIndex, incidenceDeg, readConstants } from './physics';
import {
  BAR_MARK_HALF,
  BEAM_LEN,
  CURVE_LABEL_DEG,
  CURVE_SAMPLES,
  DOT_MARK_R,
  GLASS_DEPTH,
  IFACE_HALF,
  INCIDENT_ARROW_LEN,
  INC_ARC_R,
  INC_LABEL_R,
  MARK_MIN,
  MARK_SPOTS,
  NORMAL_DOWN,
  NORMAL_UP,
  PLOT_DEG_SPAN,
  PLOT_H,
  PLOT_PAD,
  PLOT_TOP_OVER,
  PLOT_W,
  PLOT_X0,
  PLOT_Y0,
  REFRACT_LEN,
  RIGHT_ARC_R,
  RIGHT_LABEL_R,
  SCENE_BOUNDS,
  TICK_LEN,
  text,
} from './schema';
import type { BrewsterAngleState } from './state';

/** 이름표 · 값 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 곡선 표식(⊙ · ↕) 글자 크기(화면 px). */
const CURVE_MARK_PX = 15;
/** 이름표를 앵커에서 띄우는 거리(화면 px). */
const LABEL_GAP = 12;
/** ⊙ 이름표를 표식 가운데에서 띄우는 거리(화면 px) — 표식 둘레 밖. */
const DOT_LABEL_GAP = 20;
/** ↕ 이름표를 표식 가운데에서 띄우는 거리(화면 px) — 화살 끝 밖. */
const BAR_LABEL_GAP = 30;
/** 매질 이름을 경계면 왼쪽 끝에서 띄우는 거리(화면 px). */
const MEDIUM_LABEL_INSET = 4;
/** 눈금 글자를 축 아래로 띄우는 거리(화면 px). */
const TICK_LABEL_GAP = 14;
/** 곡선 표식 띄움(화면 px) — ⊙ 는 실선 왼쪽 위, ↕ 는 점선 오른쪽 아래. */
const DOT_CURVE_LABEL_OFFSET: Vec2 = [-10, -12];
const BAR_CURVE_LABEL_OFFSET: Vec2 = [10, 12];
/** 굵기(화면 px). */
const IFACE_W = 1.8;
const NORMAL_W = 1;
const BEAM_W = 2;
const MARK_W = 2;
const ARC_W = 1.2;
const PLOT_AXIS_W = 1.2;
const CURVE_W = 2.2;
const GUIDE_W = 1;
/** 짙기 — 유리 채움 · 입사각 부채꼴 · 직각 부채꼴. */
const GLASS_FILL = 0.14;
const INC_SECTOR_FILL = 0.14;
const RIGHT_SECTOR_FILL = 0.28;
/** 반사율-각 판 지금 점 반지름(월드). */
const DOT_R = 0.08;

const RAD = Math.PI / 180;

/** 반사율-각 판의 월드 자리. */
function plotX(deg: number): number {
  return PLOT_X0 + PLOT_PAD + (deg / PLOT_DEG_SPAN) * PLOT_W;
}
function plotY(share: number): number {
  return PLOT_Y0 + share * PLOT_H;
}

const add = (a: Vec2, b: Vec2, k = 1): Vec2 => [a[0] + b[0] * k, a[1] + b[1] * k];

/**
 * 한 줄기의 떨림 표식. `out` 은 입사점에서 바깥으로 향하는 단위 방향, `len` 은 줄기 길이,
 * `dot` · `bar` 는 들어온 빛 표식에 견준 크기 몫. 짝수 자리가 ⊙, 홀수 자리가 ↕ 다.
 */
function marks(id: string, out: Vec2, len: number, dot: number, bar: number): Primitive[] {
  const prims: Primitive[] = [];
  // ↕ 는 줄기에 수직, 입사면(화면) 안.
  const perp: Vec2 = [-out[1], out[0]];
  MARK_SPOTS.forEach((f, i) => {
    const p: Vec2 = [out[0] * f * len, out[1] * f * len];
    if (i % 2 === 0) {
      if (dot < MARK_MIN) return;
      prims.push({
        type: 'body',
        id: `${id}-dot-ring-${i}`,
        pos: p,
        shape: 'circle',
        size: DOT_MARK_R * dot,
        fill: 'none',
        outline: 'role',
        glow: false,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      prims.push({
        type: 'body',
        id: `${id}-dot-center-${i}`,
        pos: p,
        shape: 'point',
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    } else {
      if (bar < MARK_MIN) return;
      const half = BAR_MARK_HALF * bar;
      prims.push({
        type: 'vector',
        id: `${id}-bar-a-${i}`,
        from: p,
        delta: [perp[0] * half, perp[1] * half],
        width: MARK_W,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      prims.push({
        type: 'vector',
        id: `${id}-bar-b-${i}`,
        from: p,
        delta: [-perp[0] * half, -perp[1] * half],
        width: MARK_W,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  });
  return prims;
}

export function scene(params: {
  state: BrewsterAngleState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  if (!timeline) throw new Error('brewster-angle: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const deg = incidenceDeg(timeline, c);
  const th = deg * RAD;
  const hold = holdIndex(timeline);
  const f = fresnel(deg, c);
  const degText = [state.deg0, state.deg1, state.deg2];
  const out: Primitive[] = [];

  // 바깥으로 향하는 줄기 방향 — 들어온 줄기는 광원 쪽, 반사는 오른쪽 위, 굴절은 오른쪽 아래.
  const uIn: Vec2 = [-Math.sin(th), Math.cos(th)];
  const uRe: Vec2 = [Math.sin(th), Math.cos(th)];
  const uTr: Vec2 = [Math.sin(f.thetaT), -Math.cos(f.thetaT)];
  const O: Vec2 = [0, 0];

  // ================= 왼쪽 — 매질 · 경계면 · 법선 =================

  out.push({
    type: 'region',
    id: 'glass',
    points: [
      [-IFACE_HALF, 0],
      [IFACE_HALF, 0],
      [IFACE_HALF, -GLASS_DEPTH],
      [-IFACE_HALF, -GLASS_DEPTH],
    ],
    fillOpacity: GLASS_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'interface',
    points: [
      [-IFACE_HALF, 0],
      [IFACE_HALF, 0],
    ],
    width: IFACE_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'normal',
    points: [
      [0, -NORMAL_DOWN],
      [0, NORMAL_UP],
    ],
    width: NORMAL_W,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: 'air-label',
    anchor: { world: [IFACE_HALF, 0], offset: [-MEDIUM_LABEL_INSET, -LABEL_GAP] },
    text: text('label.air'),
    chip: false,
    font: 'text',
    align: 'right',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'glass-label',
    anchor: { world: [-IFACE_HALF, 0], offset: [MEDIUM_LABEL_INSET, LABEL_GAP] },
    text: text('label.glass'),
    vars: { n: state.nGlass },
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 입사각 — 법선에서 들어온 줄기까지 쓴 부채꼴. 각 글자는 머물러 있을 때만 선언값으로 쓴다.
  out.push({
    type: 'sector',
    id: 'incidence-angle',
    center: O,
    radius: INC_ARC_R,
    from: Math.PI / 2,
    to: Math.PI / 2 + th,
    fillOpacity: INC_SECTOR_FILL,
    rimWidth: ARC_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  // 각 글자는 표식 뒤에 선언해 칩이 표식 위에 온다 (`drawOrder: 'scene'`).
  const incidenceLabel: Primitive[] = [];
  if (hold >= 0) {
    const mid = Math.PI / 2 + th / 2;
    incidenceLabel.push({
      type: 'readout',
      id: 'incidence-label',
      anchor: { world: [INC_LABEL_R * Math.cos(mid), INC_LABEL_R * Math.sin(mid)] },
      text: text('label.deg'),
      vars: { deg: degText[hold]! },
      // 법선 · 들어온 줄기 사이 좁은 틈에 놓여 선에 걸린다 — 바탕 칩으로 떼어 읽힌다.
      chip: true,
      fontSize: LABEL_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 직각 — 두 줄기가 직각을 이루는 머묾에서만. 반사 줄기에서 굴절 줄기까지 경계면 오른쪽을 지나 쓴다.
  if (hold === BREWSTER_HOLD) {
    const from = Math.PI / 2 - th;
    const to = -(Math.PI / 2 - f.thetaT);
    out.push({
      type: 'sector',
      id: 'right-angle',
      center: O,
      radius: RIGHT_ARC_R,
      from,
      to,
      fillOpacity: RIGHT_SECTOR_FILL,
      rimWidth: ARC_W,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    const mid = (from + to) / 2;
    out.push({
      type: 'readout',
      id: 'right-angle-label',
      anchor: { world: [RIGHT_LABEL_R * Math.cos(mid), RIGHT_LABEL_R * Math.sin(mid)] },
      text: text('label.deg'),
      vars: { deg: state.rightDeg },
      chip: false,
      fontSize: LABEL_PX,
      weight: 'bold',
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ================= 왼쪽 — 세 줄기 =================

  const inStart = add(O, uIn, BEAM_LEN);
  const reEnd = add(O, uRe, BEAM_LEN);
  const trEnd = add(O, uTr, REFRACT_LEN);
  out.push({
    type: 'trajectory',
    id: 'beam-in',
    points: [inStart, O],
    width: BEAM_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'beam-reflected',
    points: [O, reEnd],
    width: BEAM_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'beam-refracted',
    points: [O, trEnd],
    width: BEAM_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  // 진행 방향 — 들어온 줄기는 광원 쪽 끝에서 안으로, 나가는 두 줄기는 끝에 화살촉.
  out.push({
    type: 'vector',
    id: 'arrow-in',
    from: inStart,
    delta: [-uIn[0] * INCIDENT_ARROW_LEN, -uIn[1] * INCIDENT_ARROW_LEN],
    width: BEAM_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'arrow-reflected',
    from: add(reEnd, uRe, -INCIDENT_ARROW_LEN),
    delta: [uRe[0] * INCIDENT_ARROW_LEN, uRe[1] * INCIDENT_ARROW_LEN],
    width: BEAM_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'arrow-refracted',
    from: add(trEnd, uTr, -INCIDENT_ARROW_LEN),
    delta: [uTr[0] * INCIDENT_ARROW_LEN, uTr[1] * INCIDENT_ARROW_LEN],
    width: BEAM_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'reflected-label',
    anchor: { world: reEnd, offset: [uRe[0] * LABEL_GAP, -uRe[1] * LABEL_GAP] },
    text: text('label.reflected'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'refracted-label',
    anchor: { world: trEnd, offset: [uTr[0] * LABEL_GAP, -uTr[1] * LABEL_GAP] },
    text: text('label.refracted'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 떨림 표식 — 들어온 빛은 두 떨림이 같은 크기. 반사는 반사 진폭 × 배율, 굴절은 지나간 세기 몫의 제곱근.
  out.push(...marks('in', uIn, BEAM_LEN, 1, 1));
  out.push(
    ...marks('re', uRe, BEAM_LEN, c.reflectGain * Math.abs(f.rs), c.reflectGain * Math.abs(f.rp)),
  );
  out.push(...marks('tr', uTr, REFRACT_LEN, Math.sqrt(1 - f.Rs), Math.sqrt(1 - f.Rp)));

  // 들어온 줄기 표식 이름 — ⊙ 는 줄기 왼쪽 아래, ↕ 는 줄기 오른쪽 위. 공기 이름표는 오른쪽 끝에 두어 70° 에서 겹치지 않는다.
  const nIn: Vec2 = [Math.cos(th), Math.sin(th)];
  const dotSpot = MARK_SPOTS[2] * BEAM_LEN;
  const barSpot = MARK_SPOTS[3] * BEAM_LEN;
  out.push({
    type: 'readout',
    id: 'perp-label',
    anchor: {
      world: add(O, uIn, dotSpot),
      offset: [-nIn[0] * DOT_LABEL_GAP, nIn[1] * DOT_LABEL_GAP],
    },
    text: text('label.perp'),
    chip: false,
    font: 'text',
    align: 'right',
    fontSize: LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'in-plane-label',
    anchor: {
      world: add(O, uIn, barSpot),
      offset: [nIn[0] * BAR_LABEL_GAP, -nIn[1] * BAR_LABEL_GAP],
    },
    text: text('label.inPlane'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  out.push(...incidenceLabel);

  // ================= 오른쪽 — 반사율-각 판 =================

  const xEnd = plotX(PLOT_DEG_SPAN) + PLOT_PAD;
  const yTop = plotY(1) + PLOT_TOP_OVER;
  out.push({
    type: 'trajectory',
    id: 'plot-axes',
    points: [
      [PLOT_X0, yTop],
      [PLOT_X0, PLOT_Y0],
      [xEnd, PLOT_Y0],
    ],
    width: PLOT_AXIS_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'plot-title',
    anchor: { world: [PLOT_X0, yTop], offset: [0, -LABEL_GAP] },
    text: text('label.plotTitle'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'plot-theta',
    anchor: { world: [xEnd, PLOT_Y0], offset: [LABEL_GAP, 0] },
    text: text('label.theta'),
    chip: false,
    italic: true,
    fontSize: CURVE_MARK_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 브루스터 각 자리 — 강조색 세로 점선.
  const bx = plotX(c.deg[BREWSTER_HOLD]!);
  out.push({
    type: 'trajectory',
    id: 'brewster-guide',
    points: [
      [bx, PLOT_Y0],
      [bx, plotY(1)],
    ],
    width: GUIDE_W,
    style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'lineSet',
    id: 'plot-ticks',
    lines: c.deg.map((a) => [
      [plotX(a), PLOT_Y0],
      [plotX(a), PLOT_Y0 - TICK_LEN],
    ]),
    width: GUIDE_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  c.deg.forEach((a, k) => {
    const brewster = k === BREWSTER_HOLD;
    out.push({
      type: 'readout',
      id: `tick-label-${k}`,
      anchor: { world: [plotX(a), PLOT_Y0 - TICK_LEN], offset: [0, TICK_LABEL_GAP] },
      text: text('label.deg'),
      vars: { deg: degText[k]! },
      chip: false,
      fontSize: LABEL_PX,
      ...(brewster ? { weight: 'bold' as const } : {}),
      style: { colorRole: brewster ? 'accent' : 'muted', emphasis: 'strong' },
    });
  });

  // 두 곡선 — ⊙ 몫(실선)과 ↕ 몫(점선).
  const sCurve: Vec2[] = [];
  const pCurve: Vec2[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const a = (i / CURVE_SAMPLES) * PLOT_DEG_SPAN;
    const fr = fresnel(a, c);
    sCurve.push([plotX(a), plotY(fr.Rs)]);
    pCurve.push([plotX(a), plotY(fr.Rp)]);
  }
  out.push({
    type: 'trajectory',
    id: 'curve-s',
    points: sCurve,
    width: CURVE_W,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'curve-p',
    points: pCurve,
    width: CURVE_W,
    style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
  });
  const fl = fresnel(CURVE_LABEL_DEG, c);
  out.push({
    type: 'readout',
    id: 'curve-s-label',
    anchor: { world: [plotX(CURVE_LABEL_DEG), plotY(fl.Rs)], offset: DOT_CURVE_LABEL_OFFSET },
    text: text('label.dotMark'),
    chip: false,
    fontSize: CURVE_MARK_PX,
    align: 'right',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'curve-p-label',
    anchor: { world: [plotX(CURVE_LABEL_DEG), plotY(fl.Rp)], offset: BAR_CURVE_LABEL_OFFSET },
    text: text('label.barMark'),
    chip: false,
    fontSize: CURVE_MARK_PX,
    align: 'left',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 지금 점 — 같은 입사각에서 ⊙ 몫과 ↕ 몫.
  out.push({
    type: 'body',
    id: 'now-s',
    pos: [plotX(deg), plotY(f.Rs)],
    shape: 'circle',
    size: DOT_R,
    glow: false,
    outline: 'background',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'now-p',
    pos: [plotX(deg), plotY(f.Rp)],
    shape: 'circle',
    size: DOT_R,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
