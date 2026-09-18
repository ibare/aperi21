// ========================================================================
// seismic-waves — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 지구 단면은 `region` 둘(맨틀 · 액체 외핵)과 닫힌 `trajectory` 둘(지표 · 핵 경계),
// 파선은 파가 지나온 만큼만 `trajectory` 로 — P 는 실선, S 는 점선. 파 머리의 흔들림은
// `lineSet` 둘로 — P 는 파선을 가로지르는 눈금의 간격이 몰렸다 풀리는 압축(앞뒤로 흔듦),
// S 는 파선 옆으로 출렁이는 물결(옆으로 흔듦). S 가 멈춘 자리는 `lineSet` × 표, 지표에
// 닿은 자리는 `particleSystem` 점이다. 그림자대는 지표 바깥의 강조색 호 `trajectory`.
//
// 색은 뜻마다 하나다 — 두 파는 같은 먹색이고(색으로 가르지 않는다, S-piece) 선 모양 ·
// 머리 모양 · 이름표로 가른다. **강조색은 「파가 닿지 못하는 지표」 한 가지 뜻에만.**
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LineSet,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { cutAt, headAt, pointAt, readConstants, traceRay, type RayPath } from './physics';
import { SCENE_BOUNDS, text, type SeismicWavesMessageKey } from './schema';
import type { SeismicWavesState } from './state';

// ---- 부채꼴 · 표본 ----
/** 파선 부채꼴의 출발각 간격(도, 곧장 아래에서 잰다). 여기에 외핵을 스치는 파선 하나를 더한다. */
const FAN_STEP_DEG = 6;
/** 부채꼴의 마지막 출발각(도). 90° 에 가까우면 지표를 스치듯 바로 닿아 보이지 않는다. */
const FAN_LAST_DEG = 84;
/** 스치는 파선을 핵 바로 바깥으로 비키는 여유(라디안). 핵에 닿지 않고 지표에 닿아야 한다. */
const GRAZE_NUDGE = 1e-5;
/** 원을 다각형으로 그릴 때의 꼭짓점 수. */
const CIRCLE_SAMPLES = 180;
/** 그림자대 호의 표본 간격(도). */
const ARC_SAMPLE_DEG = 1;

// ---- 파 머리 묶음 (월드, 지구 반지름 = 1) ----
/** 머리 뒤로 흔들림을 그리는 길이. */
const PACKET_LEN = 0.16;
/** S 물결 — 표본 수 · 한 파장 · 옆 폭. */
const S_PACKET_SAMPLES = 32;
const S_PACKET_WAVELENGTH = 0.055;
const S_PACKET_AMP = 0.028;
/** P 눈금 — 개수 · 한 파장(몰림 간격) · 몰림의 세기(0~1, 1 이면 눈금이 겹친다) · 눈금 반 길이. */
const P_TICK_COUNT = 11;
const P_PACKET_WAVELENGTH = 0.075;
const P_PACKET_SQUEEZE = 0.75;
const P_TICK_HALF = 0.03;
/** S 가 멈춘 × 표의 반 폭. */
const STOP_MARK_HALF = 0.022;

// ---- 선 · 글자 (화면 px) · 짙기 ----
const RAY_WIDTH_PX = 1.4;
const RAY_OPACITY = 0.72;
/** 외핵을 스치는 파선 — 그림자대의 경계를 정하는 선이라 조금 굵게. */
const GRAZE_WIDTH_PX = 2.2;
const PACKET_WIDTH_PX = 1.8;
const EARTH_RIM_WIDTH_PX = 1.6;
const CORE_RIM_WIDTH_PX = 1.2;
const CORE_RIM_OPACITY = 0.7;
const MANTLE_FILL = 0.08;
const CORE_FILL = 0.3;
const TICK_WIDTH_PX = 1;
const TICK_OPACITY = 0.7;
const SHADOW_ARC_WIDTH_PX = 6;
const ARRIVAL_DOT_PX = 2.6;
const FOCUS_RADIUS = 0.028;
const LABEL_PX = 13;
const TITLE_PX = 14;
const DEG_LABEL_PX = 12;

// ---- 이름표 자리 (월드) ----
/** 지표 각 눈금의 바깥 끝 · 각 이름표 · 그림자대 호 · 그림자대 이름표의 반지름. */
const TICK_OUTER_R = 1.07;
const DEG_LABEL_R = 1.13;
const SHADOW_ARC_R = 1.035;
const SHADOW_LABEL_R = 1.2;
/** 진원 이름표를 진원 위로 띄우는 거리. */
const FOCUS_LABEL_GAP = 0.1;
/** 양쪽 반의 이름표 — 원판 위 모서리 바깥. */
const HALF_TITLE_X = 0.98;
const HALF_TITLE_Y = 0.98;
/** 외핵 이름표 자리 — 왼쪽(S) 반의 핵 속. S파는 핵에 들어가지 않아 그 자리가 비어 있다. */
const CORE_LABEL_AT: Vec2 = [-0.27, -0.04];

const DEG = Math.PI / 180;

/** 진원에서 시계 방향 중심각(도) → 오른쪽 반(side +1) · 왼쪽 반(side −1)의 반지름 r 자리. */
function polar(deg: number, r: number, side: 1 | -1): Vec2 {
  return [side * r * Math.sin(deg * DEG), r * Math.cos(deg * DEG)];
}

function circle(r: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i < CIRCLE_SAMPLES; i++) {
    const a = (2 * Math.PI * i) / CIRCLE_SAMPLES;
    out.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return out;
}

function arc(fromDeg: number, toDeg: number, r: number, side: 1 | -1): Vec2[] {
  const out: Vec2[] = [];
  const n = Math.max(1, Math.ceil((toDeg - fromDeg) / ARC_SAMPLE_DEG));
  for (let i = 0; i <= n; i++) out.push(polar(fromDeg + ((toDeg - fromDeg) * i) / n, r, side));
  return out;
}

const mirror = (pts: readonly Vec2[], side: 1 | -1): Vec2[] =>
  side === 1 ? pts.slice() : pts.map(([x, y]) => [-x, y] as Vec2);

/** 파선 위 거리 s 자리에서 옆(왼쪽 법선)으로 w 만큼 비킨 점. */
function offsetAt(ray: RayPath, s: number, w: number): Vec2 {
  const { p, dir } = pointAt(ray, s);
  return [p[0] - dir[1] * w, p[1] + dir[0] * w];
}

/** S 머리 — 파선 옆으로 출렁이는 물결. 머리에서 멀어질수록 잦아든다. */
function sPacket(ray: RayPath, head: number): Vec2[] {
  const len = Math.min(PACKET_LEN, head);
  const out: Vec2[] = [];
  for (let i = 0; i <= S_PACKET_SAMPLES; i++) {
    const x = (len * i) / S_PACKET_SAMPLES;
    const env = Math.sin((Math.PI * x) / PACKET_LEN);
    const w = S_PACKET_AMP * env * Math.sin((2 * Math.PI * x) / S_PACKET_WAVELENGTH);
    out.push(offsetAt(ray, head - x, w));
  }
  return out;
}

/** P 머리 — 파선을 가로지르는 눈금. 눈금의 간격이 몰렸다 풀리는 것이 앞뒤 흔들림이다. */
function pPacket(ray: RayPath, head: number): Vec2[][] {
  const gap = PACKET_LEN / P_TICK_COUNT;
  const k = (2 * Math.PI) / P_PACKET_WAVELENGTH;
  const squeeze = P_PACKET_SQUEEZE / k;
  const out: Vec2[][] = [];
  for (let i = 0; i < P_TICK_COUNT; i++) {
    const x0 = i * gap;
    const x = x0 + squeeze * Math.sin(k * x0);
    if (x > head) break;
    out.push([offsetAt(ray, head - x, -P_TICK_HALF), offsetAt(ray, head - x, P_TICK_HALF)]);
  }
  return out;
}

export function scene(params: {
  state: SeismicWavesState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  if (!timeline) throw new Error('seismic-waves: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const m = state.model;
  const rc = c.coreRatio;
  const alpha = 1 - timeline.at('fade');
  const reveal = timeline.at('reveal');
  const out: Primitive[] = [];

  // 실제 시각(초). `mantle` + `core` 두 단계를 이은 구간이 travelMinutes 분이다.
  const tau = timeline.span(timeline.start('mantle'), timeline.end('core')) * c.travelMinutes * 60;
  const speedP = c.vP / c.earthRadiusKm;
  const speedS = c.vS / c.earthRadiusKm;

  // ---- 지구 단면 ----
  out.push({
    type: 'region',
    id: 'mantle',
    points: circle(1),
    fillOpacity: MANTLE_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'region',
    id: 'outer-core',
    points: circle(rc),
    fillOpacity: CORE_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'core-rim',
    points: circle(rc),
    closed: true,
    width: CORE_RIM_WIDTH_PX,
    opacity: CORE_RIM_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'label-core',
    anchor: { world: CORE_LABEL_AT },
    text: text('label.core'),
    chip: false,
    font: 'text',
    align: 'center',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 파선 부채꼴 ----
  const takeoffs: { a: number; graze: boolean }[] = [];
  for (let d = 0; d <= FAN_LAST_DEG; d += FAN_STEP_DEG) takeoffs.push({ a: d * DEG, graze: false });
  takeoffs.push({ a: m.grazeTakeoff + GRAZE_NUDGE, graze: true });

  const arrivals: Vec2[] = [];
  const pTicks: Vec2[][] = [];
  const sWaves: Vec2[][] = [];
  const stops: Vec2[][] = [];

  for (const { a, graze } of takeoffs) {
    const pRay = traceRay(a, m, rc, true);
    const sRay = traceRay(a, m, rc, false);
    const width = graze ? GRAZE_WIDTH_PX : RAY_WIDTH_PX;
    const tag = graze ? 'graze' : String(Math.round(a / DEG));

    // P — 오른쪽 반, 실선.
    const hp = headAt(pRay, tau, speedP, m.coreSpeedRatio);
    if (hp.s > 0) {
      out.push({
        type: 'trajectory',
        id: `p-ray-${tag}`,
        points: cutAt(pRay, hp.s).points,
        width,
        opacity: alpha * RAY_OPACITY,
        style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'solid' },
      });
      if (hp.done) arrivals.push(pRay.points[pRay.points.length - 1]!);
      else pTicks.push(...pPacket(pRay, hp.s));
    }

    // S — 왼쪽 반, 점선. 외핵에 닿으면 거기서 끝난다.
    const hs = headAt(sRay, tau, speedS, 1);
    if (hs.s > 0) {
      out.push({
        type: 'trajectory',
        id: `s-ray-${tag}`,
        points: mirror(cutAt(sRay, hs.s).points, -1),
        width,
        opacity: alpha * RAY_OPACITY,
        style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
      });
      const end = sRay.points[sRay.points.length - 1]!;
      if (hs.done && sRay.coreIn >= 0) {
        const [x, y] = [-end[0], end[1]];
        const h = STOP_MARK_HALF;
        stops.push([[x - h, y - h], [x + h, y + h]], [[x - h, y + h], [x + h, y - h]]);
      } else if (hs.done) {
        arrivals.push([-end[0], end[1]]);
      } else {
        sWaves.push(mirror(sPacket(sRay, hs.s), -1));
      }
    }
  }

  const packet = (id: string, lines: Vec2[][]): LineSet => ({
    type: 'lineSet',
    id,
    lines,
    width: PACKET_WIDTH_PX,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  if (pTicks.length > 0) out.push(packet('p-heads', pTicks));
  if (sWaves.length > 0) out.push(packet('s-heads', sWaves));
  if (stops.length > 0) out.push(packet('s-stops', stops));

  // ---- 지표 ----
  out.push({
    type: 'trajectory',
    id: 'earth-rim',
    points: circle(1),
    closed: true,
    width: EARTH_RIM_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 지표에 닿은 자리. 빈 띠는 아무도 그리지 않았다 — 점이 찍히지 않아서 생긴다.
  if (arrivals.length > 0) {
    out.push({
      type: 'particleSystem',
      id: 'arrivals',
      positions: arrivals,
      sizes: ARRIVAL_DOT_PX,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 지표의 각 눈금 · 이름표 ----
  // 값은 스테이지 상수를 그대로 쓴다 — 계산해 줄이지 않는다 (S-piece 유효숫자).
  const marks: { deg: number; side: 1 | -1 }[] = [
    { deg: c.shadowFromDeg, side: 1 },
    { deg: c.pShadowToDeg, side: 1 },
    { deg: c.shadowFromDeg, side: -1 },
  ];
  out.push({
    type: 'lineSet',
    id: 'deg-ticks',
    lines: marks.map(({ deg, side }) => [polar(deg, 1, side), polar(deg, TICK_OUTER_R, side)]),
    width: TICK_WIDTH_PX,
    opacity: alpha * TICK_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  marks.forEach(({ deg, side }, i) => {
    const label: Readout = {
      type: 'readout',
      id: `deg-label-${i}`,
      anchor: { world: polar(deg, DEG_LABEL_R, side) },
      text: text('label.deg'),
      vars: { deg: String(deg) },
      chip: false,
      font: 'text',
      align: side === 1 ? 'left' : 'right',
      fontSize: DEG_LABEL_PX,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    out.push(label);
  });

  // ---- 그림자대 ----
  // 파가 모두 닿은 뒤에 떠오른다 — 점이 찍히지 않은 띠를 먼저 보고, 그다음 이름을 붙인다.
  const shadowAlpha = alpha * reveal;
  if (shadowAlpha > 0) {
    const zones: { id: string; from: number; to: number; side: 1 | -1; label: SeismicWavesMessageKey }[] = [
      { id: 's', from: c.shadowFromDeg, to: 180, side: -1, label: 'label.shadowS' },
      { id: 'p', from: c.shadowFromDeg, to: c.pShadowToDeg, side: 1, label: 'label.shadowP' },
    ];
    for (const z of zones) {
      out.push({
        type: 'trajectory',
        id: `shadow-${z.id}`,
        points: arc(z.from, z.to, SHADOW_ARC_R, z.side),
        width: SHADOW_ARC_WIDTH_PX,
        opacity: shadowAlpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
      out.push({
        type: 'readout',
        id: `shadow-label-${z.id}`,
        anchor: { world: polar((z.from + z.to) / 2, SHADOW_LABEL_R, z.side) },
        text: text(z.label),
        chip: false,
        font: 'text',
        align: z.side === 1 ? 'left' : 'right',
        fontSize: LABEL_PX,
        weight: 'bold',
        opacity: shadowAlpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  // ---- 진원 · 양쪽 반의 이름 ----
  out.push({
    type: 'body',
    id: 'focus',
    pos: [0, 1],
    shape: 'circle',
    size: FOCUS_RADIUS,
    outline: 'background',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'label-focus',
    anchor: { world: [0, 1 + FOCUS_LABEL_GAP] },
    text: text('label.focus'),
    chip: false,
    font: 'text',
    align: 'center',
    fontSize: LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  const halves: { id: string; side: 1 | -1; label: SeismicWavesMessageKey }[] = [
    { id: 'p', side: 1, label: 'label.pHalf' },
    { id: 's', side: -1, label: 'label.sHalf' },
  ];
  for (const h of halves) {
    out.push({
      type: 'readout',
      id: `half-${h.id}`,
      anchor: { world: [h.side * HALF_TITLE_X, HALF_TITLE_Y] },
      text: text(h.label),
      chip: false,
      font: 'text',
      align: h.side === 1 ? 'left' : 'right',
      fontSize: TITLE_PX,
      weight: 'bold',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
