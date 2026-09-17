// ========================================================================
// total-internal-reflection — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 월드 좌표 = 원본 캔버스 px(y 위). 겹침은 scene 에 쓴 순서다(`drawOrder: 'scene'`).
//
// 빛 — 들어오는 · 되돌아오는 · 나가는 빛은 **밝기가 곧 몫**이라 역할 색이 아니라 빛의 세기 채널(`light`)로
// 칠한다. 두 테마에서 극성이 같다. 장면 바탕(두 매질)도 빛 없음(`light: 0`)으로 깔아 어느 테마에서나
// 어둡다 — 원본도 페이지와 무관하게 장면만 어둡게 두었다(원본 NOTES (c)).
// 강조색(accent)은 한 뜻에만 — 임계각(장면의 점선 · 수치, 그래프의 세로선 · 수치).
// ========================================================================

import type {
  Body,
  Bounds,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  Sector,
  TimelineFrame,
  Trajectory,
  Vec2,
} from '@aperi21/schema';
import { DEG, W, criticalAngle, currentAngle, sourcePos, split } from './physics';
import {
  BAND,
  CANVAS,
  CURVE,
  GUIDE,
  LAMP,
  LAYOUT,
  MEDIA,
  SCENE_BOUNDS,
  TEXT_AT,
  VISIBLE_FLOOR,
  text,
  type TotalInternalReflectionMessageKey,
} from './schema';
import type { TotalInternalReflectionState } from './state';

/** 원본 선 굵기(화면 px) — 경계면 1.5 · 법선 1 · 임계각 점선 1.5 · 호 1.2 · 그래프 틀 1 · 곡선 2 · 보조선 1. */
const WIDTH = { boundary: 1.5, normal: 1, critical: 1.5, arc: 1.2, frame: 1, curve: 2, guide: 1 } as const;
/** 원본 글자 크기(화면 px) — 매질 13 · 수치 14 · 그래프 12 · 백분율 13. */
const FONT = { medium: 13, value: 14, graph: 12, pct: 13 } as const;
/** 곡선 아래 채움 · 현재 표지 보조선의 불투명도. 원본 0.28 · 0.35. */
const ALPHA = { curveFill: 0.2, guide: 0.35 } as const;
/** 현재 입사각 점 반지름(원본 px). */
const DOT_R = 5;

/** 몫을 밝기로 — 몫이 있으면 바닥 0.08 을 둔다(원본 `visible`). 그래프는 실제 몫을 쓴다. */
const visible = (f: number): number => (f <= 0 ? 0 : VISIBLE_FLOOR + (1 - VISIBLE_FLOOR) * f);

/**
 * 원본의 밝기는 **화면값**(검은 바탕 위에 얹은 알파)이고 빛 채널은 **선형광**을 받는다. 그대로 넘기면
 * 4% 반사광 · 번짐 겹이 원본보다 훨씬 밝아져 「되돌아오는 빛은 흐리다」 가 약해진다 — 화면값을 선형광으로
 * 되돌려 준다(sRGB 전달 함수의 역, 수학 상수). 빛 채널에 사상 곡선을 고를 자리가 없다(NOTES 「어휘 부족」).
 */
const displayToLight = (v: number): number => {
  const c = Math.min(1, Math.max(0, v));
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

const WATER_CLIP = { min: W(0, CANVAS.height), max: W(LAYOUT.sceneW, LAYOUT.by) };
const AIR_CLIP = { min: W(0, LAYOUT.by), max: W(LAYOUT.sceneW, 0) };

/** 원본 글자는 윗변(top) · 아랫변(bottom) 기준이고 readout 월드 앵커는 가운데 기준이라 반 글자 옮긴다. */
function label(
  id: string,
  key: TotalInternalReflectionMessageKey,
  x: number,
  y: number,
  opts: {
    vars?: Record<string, string>;
    size: number;
    baseline: 'top' | 'middle' | 'bottom';
    align: 'left' | 'center' | 'right';
    role: 'muted' | 'accent' | 'ink';
    emphasis?: 'strong' | 'medium';
    bold?: boolean;
  },
): Readout {
  const dy = opts.baseline === 'top' ? opts.size / 2 : opts.baseline === 'bottom' ? -opts.size / 2 : 0;
  return {
    type: 'readout',
    id,
    anchor: { world: W(x, y + dy) },
    text: text(key),
    ...(opts.vars ? { vars: opts.vars } : {}),
    chip: false,
    font: 'text',
    align: opts.align,
    fontSize: opts.size,
    ...(opts.bold ? { weight: 'bold' as const } : {}),
    style: { colorRole: opts.role, emphasis: opts.emphasis ?? 'strong' },
  };
}

// ------------------------------------------------------------------------
// 장면 — 매질 · 빛 · 안내선 · 광원
// ------------------------------------------------------------------------

interface Beam {
  id: string;
  /** 원본 캔버스 px 의 입사점 · 방향(y 아래) · 뒤 · 앞 길이 · 폭 · 밝기. */
  dir: Vec2;
  back: number;
  fwd: number;
  width: number;
  alpha: number;
  clip: { min: Vec2; max: Vec2 };
}

/** 원본 `band` 의 한 겹 — 폭 배수 k 의 사각형(월드). */
function bandRect(b: Beam, k: number): Vec2[] {
  const [dx, dy] = b.dir;
  const nx = -dy;
  const ny = dx;
  const h = (b.width / 2) * k;
  const x = LAYOUT.px;
  const y = LAYOUT.by;
  const ax = x - dx * b.back;
  const ay = y - dy * b.back;
  const bx = x + dx * b.fwd;
  const by = y + dy * b.fwd;
  return [W(ax + nx * h, ay + ny * h), W(bx + nx * h, by + ny * h), W(bx - nx * h, by - ny * h), W(ax - nx * h, ay - ny * h)];
}

/**
 * 빛 띠. 원본은 세 겹을 가산 합성으로 겹친다. 빛 채널은 칠한 자리의 빛을 **바꾸는** 것이라 더하지 못해,
 * 겹마다 그 안쪽에서 더해진 세기(바깥 겹 알파의 합)를 주고 바깥 겹부터 안쪽 겹 순서로 모든 띠를 칠한다.
 * 띠끼리 겹치는 입사점 근처는 더해지지 않는다(NOTES 「어휘 부족」 G35).
 */
function beams(list: Beam[]): Region[] {
  const out: Region[] = [];
  let sum = 0;
  BAND.layers.forEach((layer, i) => {
    sum += layer.alpha;
    for (const b of list) {
      if (b.alpha <= 0) continue;
      out.push({
        type: 'region',
        id: `${b.id}-${i}`,
        points: bandRect(b, layer.k),
        light: displayToLight(b.alpha * sum),
        fillOpacity: 1,
        clip: b.clip,
      });
    }
  });
  return out;
}

function scenePrimitives(theta: number, n1: number): { out: Primitive[]; R: number } {
  const { sceneW, by, px } = LAYOUT;
  const { R, T, thetaT } = split(n1, theta);
  const thc = criticalAngle(n1);
  const sx = Math.sin(theta);
  const cy = Math.cos(theta);
  const out: Primitive[] = [];

  // ---- 매질 — 빛 없음으로 깐 어두운 바탕. 두 매질을 가르는 옅은 색은 빛 띠 뒤에 얹는다. ----
  const rect = (x0: number, y0: number, x1: number, y1: number): Vec2[] => [W(x0, y0), W(x1, y0), W(x1, y1), W(x0, y1)];
  const airRect = rect(0, 0, sceneW, by);
  const waterRect = rect(0, by, sceneW, CANVAS.height);
  out.push(
    { type: 'region', id: 'air', points: airRect, light: 0, fillOpacity: 1 },
    { type: 'region', id: 'water', points: waterRect, light: 0, fillOpacity: 1 },
  );

  // ---- 매질 이름 ----
  const mediumKey: TotalInternalReflectionMessageKey =
    n1 === MEDIA.glass ? 'label.glass' : n1 === MEDIA.diamond ? 'label.diamond' : 'label.water';
  const nameOpts = { size: FONT.medium, baseline: 'top', align: 'left', role: 'muted', emphasis: 'medium' } as const;
  out.push(
    label('name-air', 'label.air', TEXT_AT.mediumX, TEXT_AT.airY, { ...nameOpts, vars: { n: (1).toFixed(2) } }),
    label('name-medium', mediumKey, TEXT_AT.mediumX, by + TEXT_AT.waterDy, { ...nameOpts, vars: { n: n1.toFixed(2) } }),
  );

  // ---- 빛 — 들어오는 · 되돌아오는 · 나가는 ----
  const list: Beam[] = [
    { id: 'reflected', dir: [sx, cy], back: BAND.width, fwd: BAND.length, width: BAND.width, alpha: visible(R), clip: WATER_CLIP },
  ];
  if (thetaT !== null && T > 0) {
    // 경계 위 발자국(폭 / cosθi)을 같게 두면 나가는 띠의 폭은 폭 · cosθt / cosθi.
    const wT = (BAND.width * Math.cos(thetaT)) / cy;
    list.push({
      id: 'transmitted',
      dir: [Math.sin(thetaT), -Math.cos(thetaT)],
      back: BAND.width,
      fwd: BAND.length,
      width: Math.max(BAND.minWidth, wT),
      alpha: visible(T),
      clip: AIR_CLIP,
    });
  }
  // 들어오는 빛이 가장 밝다 — 입사점에서 겹칠 때 가려지지 않게 마지막에 둔다.
  list.push({ id: 'incident', dir: [sx, -cy], back: BAND.length, fwd: BAND.width, width: BAND.width, alpha: 1, clip: WATER_CLIP });
  out.push(...beams(list));

  // 매질 색 — 빛 띠 **위에** 옅게 얹는다. 번짐 겹은 칠한 자리의 빛을 바꾸므로 아래에 깔면 띠 둘레가 매질보다
  // 어두운 테가 된다(가산 합성이 없다, G35). 위에 얹으면 띠가 그만큼 옅게 물든다.
  out.push(
    { type: 'region', id: 'air-tint', points: airRect, fillOpacity: 0.1, style: { colorRole: 'muted', emphasis: 'medium' } },
    { type: 'region', id: 'water-tint', points: waterRect, fillOpacity: 0.14, style: { colorRole: 'secondary', emphasis: 'medium' } },
  );

  // ---- 경계면 · 법선 ----
  const boundary: Trajectory = {
    type: 'trajectory',
    id: 'boundary',
    points: [W(0, by), W(sceneW, by)],
    width: WIDTH.boundary,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  const normal: Trajectory = {
    type: 'trajectory',
    id: 'normal',
    points: [W(px, by - GUIDE.normalUp), W(px, by + GUIDE.normalDown)],
    width: WIDTH.normal,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
  };
  out.push(boundary, normal);

  // ---- 임계각 방향 · 수치 ----
  const critical: Trajectory = {
    type: 'trajectory',
    id: 'critical-dir',
    points: [W(px, by), W(px - Math.sin(thc) * GUIDE.criticalLen, by + Math.cos(thc) * GUIDE.criticalLen)],
    width: WIDTH.critical,
    style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
  };
  out.push(
    critical,
    label('critical-value', 'label.critical', TEXT_AT.mediumX, TEXT_AT.criticalY, {
      vars: { deg: (thc / DEG).toFixed(1) },
      size: FONT.value,
      baseline: 'top',
      align: 'left',
      role: 'accent',
    }),
  );

  // ---- 입사각 — 법선 아래에서 광원 쪽으로 θ 만큼 쓴 호 · 수치 ----
  const arc: Sector = {
    type: 'sector',
    id: 'incident-arc',
    center: W(px, by),
    radius: GUIDE.arcRadius,
    from: -Math.PI / 2,
    to: -Math.PI / 2 - theta,
    fillOpacity: 0,
    rimWidth: WIDTH.arc,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(
    arc,
    label('incident-value', 'label.incident', TEXT_AT.mediumX, TEXT_AT.incidentY, {
      vars: { deg: (theta / DEG).toFixed(1) },
      size: FONT.value,
      baseline: 'top',
      align: 'left',
      role: 'muted',
    }),
  );

  // ---- 광원 — 입사점을 겨누는 작은 등. 발광면만 빛이다. ----
  const [lx, ly] = sourcePos(theta);
  const lampBody: Body = {
    type: 'body',
    id: 'lamp-body',
    shape: 'rect',
    pos: [lx + LAMP.bodyShift * sx, ly - LAMP.bodyShift * cy],
    size: [LAMP.body[0], LAMP.body[1]],
    orientation: theta,
    outline: 'line',
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  const lampFace: Body = {
    type: 'body',
    id: 'lamp-face',
    shape: 'rect',
    pos: [lx, ly],
    size: [LAMP.face[0], LAMP.face[1]],
    orientation: theta,
    outline: 'none',
    light: 1,
  };
  out.push(lampBody, lampFace);

  return { out, R };
}

// ------------------------------------------------------------------------
// 그래프 — 입사각별 되돌아오는 빛의 몫
// ------------------------------------------------------------------------

function graphPrimitives(theta: number, n1: number, R: number): Primitive[] {
  const { gx0, gx1, gy0, gy1 } = LAYOUT;
  const thc = criticalAngle(n1);
  const X = (deg: number): number => gx0 + ((gx1 - gx0) * deg) / 90;
  const Y = (f: number): number => gy1 - (gy1 - gy0) * f;
  const out: Primitive[] = [];
  const g = { size: FONT.graph, role: 'muted' } as const;

  // ---- 틀 ----
  out.push(
    {
      type: 'trajectory',
      id: 'graph-frame',
      points: [W(gx0, gy0), W(gx0, gy1), W(gx1, gy1)],
      width: WIDTH.frame,
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
    label('tick-x0', 'label.deg', X(0), gy1 + 6, { ...g, vars: { deg: '0' }, baseline: 'top', align: 'center' }),
    label('tick-x90', 'label.deg', X(90), gy1 + 6, { ...g, vars: { deg: '90' }, baseline: 'top', align: 'center' }),
    label('axis-x', 'label.axisX', (gx0 + gx1) / 2, gy1 + 22, { ...g, baseline: 'top', align: 'center' }),
    label('tick-y100', 'label.pct', gx0 - 6, Y(1), { ...g, vars: { pct: '100' }, baseline: 'middle', align: 'right' }),
    label('tick-y0', 'label.pct', gx0 - 6, Y(0), { ...g, vars: { pct: '0' }, baseline: 'middle', align: 'right' }),
    label('axis-y', 'label.axisY', gx0, gy0 - 12, { ...g, baseline: 'bottom', align: 'left' }),
  );

  // ---- 반사 비율 곡선 · 아래 채움 ----
  const curve: Vec2[] = [];
  const count = Math.round(90 / CURVE.stepDeg);
  for (let i = 0; i <= count; i++) {
    const deg = i * CURVE.stepDeg;
    curve.push(W(X(deg), Y(split(n1, Math.min(deg, CURVE.lastDeg) * DEG).R)));
  }
  out.push(
    {
      type: 'region',
      id: 'curve-fill',
      points: [W(X(0), Y(0)), ...curve, W(X(90), Y(0))],
      fillOpacity: ALPHA.curveFill,
      style: { colorRole: 'secondary', emphasis: 'medium' },
    },
    {
      type: 'trajectory',
      id: 'curve',
      points: curve,
      width: WIDTH.curve,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    },
  );

  // ---- 임계각 세로선 · 수치 ----
  out.push(
    {
      type: 'trajectory',
      id: 'graph-critical',
      points: [W(X(thc / DEG), gy0), W(X(thc / DEG), gy1)],
      width: WIDTH.critical,
      style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
    },
    label('graph-critical-value', 'label.deg', X(thc / DEG), gy1 + 6, {
      size: FONT.graph,
      vars: { deg: (thc / DEG).toFixed(1) },
      baseline: 'top',
      align: 'center',
      role: 'accent',
    }),
  );

  // ---- 현재 입사각 표지 ----
  const x = X(theta / DEG);
  const y = Y(R);
  // 임계각 아래에서는 100% 로 반올림하지 않는다 — 조금이라도 나가는 빛이 있다.
  const pct = R >= 1 ? 100 : Math.min(99, Math.round(R * 100));
  const left = x > (gx0 + gx1) / 2;
  const ly = Math.max(gy0 + 8, Math.min(gy1 - 10, y + (R > 0.9 ? 16 : -14)));
  const dot: Body = {
    type: 'body',
    id: 'now-dot',
    shape: 'circle',
    pos: W(x, y),
    size: DOT_R,
    outline: 'background',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(
    {
      type: 'trajectory',
      id: 'now-guide',
      points: [W(x, y), W(x, gy1)],
      width: WIDTH.guide,
      opacity: ALPHA.guide,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    dot,
    label('now-pct', 'label.pct', x + (left ? -10 : 10), ly, {
      size: FONT.pct,
      vars: { pct: String(pct) },
      baseline: 'middle',
      align: left ? 'right' : 'left',
      role: 'ink',
      bold: true,
    }),
  );
  return out;
}

export function scene(params: {
  state: TotalInternalReflectionState;
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('total-internal-reflection: schema.timeline 이 선언되어야 한다');
  const theta = currentAngle(state, timeline.phase, timeline.progress);
  const { out, R } = scenePrimitives(theta, state.n);
  out.push(...graphPrimitives(theta, state.n, R));
  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): Bounds {
  // 고정 경계 — 원본 캔버스 그대로.
  return { ...SCENE_BOUNDS };
}
