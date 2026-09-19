// ========================================================================
// dispersion — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 왼쪽 — 빛 없음 판(`region` `light: 0`) 위의 공기 / 유리 경계. 흰 줄기는 빛 채널의 가득 찬 빛,
// 색 줄기는 파장의 빛 색(`wavelengthToLinearRgb`)이다. 흰빛은 라이트 바탕에서 사라지므로(G92)
// 두 테마에서 같은 어두운 판을 깐다. 줄기는 겹치는 곳에서 더해진다(`blend: 'add'`) — 입사점 가까이
// 색 줄기가 겹친 자리는 다시 희게 보인다.
//
// 오른쪽 — 굴절률-파장 곡선. 곡선 · 축 · 글자는 먹색 계열(바탕 위), 곡선 위 점만 그 파장의 빛 색이다.
// 색은 대상을 가르는 역할 색이 아니라 빛 자체의 색이다(물리량).
// ========================================================================

import type { Bounds, EnvironmentDef, Primitive, Readout, SceneGraph, StageDef, TimelineFrame, Vec2, ViewDef } from '@aperi21/schema';
import { wavelengthToLinearRgb } from '@aperi21/plugin-optics';
import { DEG, derive, indexAt, rayWavelengths, readConstants, shownAngle, type DispersionConstants } from './physics';
import {
  BEAM_IN_LEN,
  GRAPH,
  GRAPH_NM_MAX,
  GRAPH_NM_MIN,
  GRAPH_PAD_HIGH,
  GRAPH_PAD_LOW,
  MEDIUM_LABEL_DY,
  MEDIUM_LABEL_X,
  PANEL,
  PANEL_TOP_LABEL_Y,
  RAY_OUT_LEN,
  SCENE_BOUNDS,
  text,
  type DispersionMessageKey,
} from './schema';
import type { DispersionState } from './state';

/** 선 굵기(화면 px) — 흰 줄기 · 색 줄기 · 짚은 줄기 · 경계면 · 법선 · 곡선 · 축 · 안내선. */
const BEAM_WIDTH_PX = 3;
const RAY_WIDTH_PX = 2;
const SCAN_WIDTH_PX = 3.5;
const BOUNDARY_WIDTH_PX = 1.5;
const NORMAL_WIDTH_PX = 1;
const CURVE_WIDTH_PX = 2;
const AXIS_WIDTH_PX = 1.2;
const GUIDE_WIDTH_PX = 1;
/** 판 위 빛의 세기 — 유리 면 · 경계면 · 법선. 판이 빛 없음이라 두 테마에서 같다. */
const GLASS_LIGHT = 0.018;
const BOUNDARY_LIGHT = 0.45;
const NORMAL_LIGHT = 0.4;
/** 불투명도 — 짚는 동안 나머지 색 줄기 · 정박점 안내선. */
const DIM_OPACITY = 0.22;
const GUIDE_OPACITY = 0.7;
/** 글자 크기(화면 px) — 매질 이름 · 판 위 줄 · 눈금 글자 · 축 이름. */
const LABEL_PX = 13;
const NOTE_PX = 12;
const TICK_PX = 12;
const AXIS_TITLE_PX = 12;
/** 글자 띄움(화면 px) — 눈금 글자와 축 사이, 축 이름과 축 끝 사이. */
const TICK_GAP_PX = 12;
const AXIS_TITLE_GAP_PX = 30;
const AXIS_TITLE_LIFT_PX = 14;
/** 판 아래 과장 배율 글자를 판 밑변에서 내리는 거리(화면 px). */
const GAIN_GAP_PX = 14;
/** 곡선 위 점의 반지름(월드) — 줄기 색 점 · 짚은 점. */
const DOT_R = 0.07;
const SCAN_DOT_R = 0.11;
/** 곡선을 표본하는 점 수 (곡선 어휘가 없다 — G28). */
const CURVE_SAMPLES = 80;

const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
const ink = { colorRole: 'ink', emphasis: 'strong' } as const;

/** 입사점을 떠나 위 왼쪽으로(들어오는 줄기의 반대 방향) · 유리 속 아래 오른쪽으로. */
const upLeft = (a: number): Vec2 => [-Math.sin(a), Math.cos(a)];
const downRight = (a: number): Vec2 => [Math.sin(a), -Math.cos(a)];
const at = (d: Vec2, r: number): Vec2 => [d[0] * r, d[1] * r];

function rect(b: { minX: number; maxX: number; minY: number; maxY: number }): Vec2[] {
  return [
    [b.minX, b.minY],
    [b.maxX, b.minY],
    [b.maxX, b.maxY],
    [b.minX, b.maxY],
  ];
}

function label(
  id: string,
  key: DispersionMessageKey,
  world: Vec2,
  opts: { vars?: Record<string, string>; offset?: Vec2; align?: Readout['align']; size?: number; font?: Readout['font']; role?: 'ink' | 'muted' },
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world, ...(opts.offset ? { offset: opts.offset } : {}) },
    text: text(key),
    ...(opts.vars ? { vars: opts.vars } : {}),
    chip: false,
    font: opts.font ?? 'text',
    align: opts.align ?? 'left',
    fontSize: opts.size ?? LABEL_PX,
    style: { colorRole: opts.role ?? 'ink', emphasis: 'strong' },
  };
}

/** 곡선 칸의 월드 자리. 세로 범위는 정박점 굴절률 폭을 위아래로 조금 벌린 것이다. */
function graphMap(c: DispersionConstants): { x: (nm: number) => number; y: (n: number) => number } {
  const spanN = c.nViolet - c.nRed;
  const lo = c.nRed - GRAPH_PAD_LOW * spanN;
  const hi = c.nViolet + GRAPH_PAD_HIGH * spanN;
  return {
    x: (nm) => GRAPH.minX + ((nm - GRAPH_NM_MIN) / (GRAPH_NM_MAX - GRAPH_NM_MIN)) * (GRAPH.maxX - GRAPH.minX),
    y: (n) => GRAPH.minY + ((n - lo) / (hi - lo)) * (GRAPH.maxY - GRAPH.minY),
  };
}

export function scene(params: {
  state: DispersionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('dispersion: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const g: Primitive[] = [];

  // ================= 왼쪽 — 공기 / 유리 경계 =================

  // ---- 빛 없음 판 · 유리 면 ----
  g.push({ type: 'region', id: 'panel', points: rect(PANEL), fillOpacity: 1, light: 0 });
  g.push({
    type: 'region',
    id: 'glass',
    points: rect({ ...PANEL, maxY: 0 }),
    fillOpacity: 1,
    light: GLASS_LIGHT,
  });

  // ---- 경계면 · 법선 ----
  g.push({
    type: 'trajectory',
    id: 'boundary',
    points: [
      [PANEL.minX, 0],
      [PANEL.maxX, 0],
    ],
    width: BOUNDARY_WIDTH_PX,
    light: BOUNDARY_LIGHT,
  });
  g.push({
    type: 'trajectory',
    id: 'normal',
    points: [
      [0, PANEL.maxY],
      [0, PANEL.minY],
    ],
    width: NORMAL_WIDTH_PX,
    light: NORMAL_LIGHT,
    style: { lineStyle: 'dashed' },
  });

  // ---- 들어오는 흰 줄기 — 입사점까지 자란다 ----
  const incident = c.incidentDeg * DEG;
  const source = at(upLeft(incident), BEAM_IN_LEN);
  if (r.beamIn > 0 && r.visible > 0) {
    g.push({
      type: 'trajectory',
      id: 'beam-in',
      points: [source, [source[0] * (1 - r.beamIn), source[1] * (1 - r.beamIn)]],
      width: BEAM_WIDTH_PX,
      light: 1,
      opacity: r.visible,
    });
  }

  // ---- 유리 속 색 줄기 부채 — 입사점에서 자란다. 짚는 동안 옅어진다. ----
  const wavelengths = rayWavelengths(c);
  const fanOpacity = r.visible * (1 - r.focus * (1 - DIM_OPACITY));
  if (r.raysOut > 0 && fanOpacity > 0) {
    wavelengths.forEach((nm, i) => {
      g.push({
        type: 'trajectory',
        id: `ray-${i}`,
        points: [[0, 0], at(downRight(shownAngle(c, nm)), RAY_OUT_LEN * r.raysOut)],
        width: RAY_WIDTH_PX,
        light: { rgb: wavelengthToLinearRgb(nm) },
        blend: 'add',
        opacity: fanOpacity,
      });
    });
  }

  // ---- 짚은 줄기 — 곡선 위 점과 같은 파장 ----
  const scanOpacity = r.visible * r.focus;
  if (scanOpacity > 0) {
    g.push({
      type: 'trajectory',
      id: 'ray-scan',
      points: [[0, 0], at(downRight(shownAngle(c, r.scanNm)), RAY_OUT_LEN)],
      width: SCAN_WIDTH_PX,
      light: { rgb: wavelengthToLinearRgb(r.scanNm) },
      blend: 'add',
      opacity: scanOpacity,
    });
  }

  // ---- 판 밖 글자 — 매질 이름(왼쪽) · 법선(위) · 과장 배율(아래) ----
  g.push(label('name-air', 'label.air', [MEDIUM_LABEL_X, MEDIUM_LABEL_DY], { align: 'right' }));
  g.push(label('name-glass', 'label.glass', [MEDIUM_LABEL_X, -MEDIUM_LABEL_DY], { align: 'right' }));
  g.push(label('name-normal', 'label.normal', [0, PANEL_TOP_LABEL_Y], { align: 'center', size: NOTE_PX, role: 'muted' }));
  g.push(
    label('gain', 'label.gain', [PANEL.maxX, PANEL.minY], {
      vars: { k: state.gainText },
      offset: [0, GAIN_GAP_PX],
      align: 'right',
      size: NOTE_PX,
      role: 'muted',
    }),
  );

  // ================= 오른쪽 — 굴절률-파장 곡선 =================

  const map = graphMap(c);
  const pt = (nm: number): Vec2 => [map.x(nm), map.y(indexAt(c, nm))];

  // ---- 축 ----
  g.push({
    type: 'trajectory',
    id: 'axis-x',
    points: [
      [GRAPH.minX, GRAPH.minY],
      [GRAPH.maxX, GRAPH.minY],
    ],
    width: AXIS_WIDTH_PX,
    style: muted,
  });
  g.push({
    type: 'trajectory',
    id: 'axis-y',
    points: [
      [GRAPH.minX, GRAPH.minY],
      [GRAPH.minX, GRAPH.maxY],
    ],
    width: AXIS_WIDTH_PX,
    style: muted,
  });
  g.push(
    label('axis-nm', 'label.axisNm', [GRAPH.maxX, GRAPH.minY], {
      offset: [0, AXIS_TITLE_GAP_PX],
      align: 'right',
      size: AXIS_TITLE_PX,
      role: 'muted',
    }),
  );
  g.push(
    label('axis-n', 'label.axisN', [GRAPH.minX, GRAPH.maxY], {
      offset: [0, -AXIS_TITLE_LIFT_PX],
      align: 'left',
      size: AXIS_TITLE_PX,
      role: 'muted',
    }),
  );

  // ---- 곡선 ----
  const curve: Vec2[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    curve.push(pt(GRAPH_NM_MIN + ((GRAPH_NM_MAX - GRAPH_NM_MIN) * i) / CURVE_SAMPLES));
  }
  g.push({ type: 'trajectory', id: 'curve', points: curve, width: CURVE_WIDTH_PX, style: ink });

  // ---- 정박점 — 축까지 점선, 파장 · 굴절률 글자(스테이지 상수 그대로) ----
  const anchors: { id: string; nm: number; nmText: string; nText: string }[] = [
    { id: 'red', nm: c.nmRed, nmText: state.nmRedText, nText: state.nRedText },
    { id: 'blue', nm: c.nmBlue, nmText: state.nmBlueText, nText: state.nBlueText },
    { id: 'violet', nm: c.nmViolet, nmText: state.nmVioletText, nText: state.nVioletText },
  ];
  for (const a of anchors) {
    const p = pt(a.nm);
    g.push({
      type: 'trajectory',
      id: `guide-${a.id}`,
      points: [[p[0], GRAPH.minY], p, [GRAPH.minX, p[1]]],
      width: GUIDE_WIDTH_PX,
      opacity: GUIDE_OPACITY,
      style: { ...muted, lineStyle: 'dotted' },
    });
    g.push(
      label(`tick-nm-${a.id}`, 'label.value', [p[0], GRAPH.minY], {
        vars: { v: a.nmText },
        offset: [0, TICK_GAP_PX],
        align: 'center',
        size: TICK_PX,
        font: 'mono',
        role: 'muted',
      }),
    );
    g.push(
      label(`tick-n-${a.id}`, 'label.value', [GRAPH.minX, p[1]], {
        vars: { v: a.nText },
        offset: [-TICK_GAP_PX, 0],
        align: 'right',
        size: TICK_PX,
        font: 'mono',
        role: 'muted',
      }),
    );
  }

  // ---- 곡선 위 색 점 — 유리 속 줄기와 같은 파장. 줄기가 자랄 때 나타난다. ----
  const dotOpacity = r.raysOut * fanOpacity;
  if (dotOpacity > 0) {
    wavelengths.forEach((nm, i) => {
      g.push({
        type: 'body',
        id: `dot-${i}`,
        pos: pt(nm),
        shape: 'circle',
        size: DOT_R,
        glow: false,
        light: { rgb: wavelengthToLinearRgb(nm) },
        opacity: dotOpacity,
      });
    });
  }

  // ---- 짚은 점 — 축까지 점선을 끌고 곡선을 따라 간다 ----
  if (scanOpacity > 0) {
    const p = pt(r.scanNm);
    g.push({
      type: 'trajectory',
      id: 'guide-scan',
      points: [[p[0], GRAPH.minY], p, [GRAPH.minX, p[1]]],
      width: GUIDE_WIDTH_PX,
      opacity: scanOpacity,
      style: { ...ink, lineStyle: 'dashed' },
    });
    g.push({
      type: 'body',
      id: 'dot-scan',
      pos: p,
      shape: 'circle',
      size: SCAN_DOT_R,
      glow: false,
      light: { rgb: wavelengthToLinearRgb(r.scanNm) },
      opacity: scanOpacity,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
