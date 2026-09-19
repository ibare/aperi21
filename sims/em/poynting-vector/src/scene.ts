// ========================================================================
// poynting-vector — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 아래에서 위로 (drawOrder: 'scene') —
//   S 흐름선(lineSet) → B 고리 뒤 반쪽(trajectory 점선) → 도선 · 전지 판 · 저항(lineSet)
//   → B 고리 앞 반쪽(lineSet) · 도는 방향 촉(vector) → E 화살표 · S 화살표(vector)
//   → ⊙ · ⊗ 표식(lineSet + particleSystem) → 에너지 알갱이(particleSystem) → 전류 화살표 I · 극 표식 · B 이름표.
//
// 색은 뜻마다 하나다 — 도선 · 전지 · 저항 · 전류 화살표는 먹색(장치), E 는 primary, B 는
// secondary. **강조색은 「에너지 흐름」 한 뜻에만** — S 화살표 · 흐름선 · 알갱이.
// ========================================================================

import type { Bounds, Primitive, SceneGraph, StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { dotsOn, readConstants, stationXs } from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { PoyntingVectorState } from './state';

// ------------------------------------------------------------------------
// 그림 치수 — 화면 px 는 위계라 배율을 따르지 않는다 (C2)
// ------------------------------------------------------------------------

/** 도선 · 저항 굵기(화면 px). */
const WIRE_PX = 2.5;
/** 전지 두 판 굵기(화면 px). 짧은 판(−)을 더 굵게 긋는 관례를 따른다. */
const BATTERY_LONG_PX = 2.5;
const BATTERY_SHORT_PX = 4.5;
/** 전지 두 판의 반 길이(월드). */
const BATTERY_LONG_HALF = 0.3;
const BATTERY_SHORT_HALF = 0.16;
/** 저항 지그재그 꺾임 수 · 진폭(월드). */
const ZIGZAG_TEETH = 6;
const ZIGZAG_AMP = 0.14;

/** B 고리를 비스듬히 본 납작함 — 가로 반지름 / 세로 반지름. 앞 반쪽이 왼쪽에 온다. */
const LOOP_SQUASH = 0.35;
/** B 고리 반쪽을 표본하는 점 수 (G28). */
const LOOP_SAMPLES = 16;
/** B 고리 굵기(화면 px). */
const LOOP_PX = 1.3;
/** B 고리의 도는 방향 촉 — 축 길이 · 머리(월드). */
const LOOP_HEAD_LEN = 0.22;
const LOOP_HEAD = 0.13;
/** 촉을 다는 고리 위 자리 — +y 에서 앞쪽으로 잰 각(라디안). 도선 바깥쪽 앞이다. */
const LOOP_HEAD_AT = Math.PI / 4;

/** ⊙ · ⊗ 표식 — 고리 반지름(월드) · 표본 수 · 획 굵기(화면 px) · 가운데 점(화면 px). */
const SYMBOL_R = 0.1;
const SYMBOL_SAMPLES = 18;
const SYMBOL_PX = 1.3;
const SYMBOL_DOT_PX = 2.2;
/** ⊗ 가위표가 고리 반지름에서 차지하는 몫. */
const CROSS_FRACTION = 0.68;

/** E · S 화살표 굵기(화면 px) · 머리(월드). */
const E_PX = 2;
const S_PX = 2.8;
const E_HEAD = 0.1;
const S_HEAD = 0.14;

/** 전류 화살표 — 자리(도선 위 x) · 길이(월드) · 굵기(화면 px). */
const CURRENT_ARROW_X = 3.25;
const CURRENT_ARROW_LEN = 0.55;
const CURRENT_PX = 2.5;
const CURRENT_HEAD = 0.14;

/** S 흐름선 굵기(화면 px) · 불투명도. 알갱이 크기(화면 px). */
const STREAM_PX = 1.2;
const STREAM_OPACITY = 0.4;
const DOT_PX = 2.6;

/** 흐름이 켜지면 E · B 를 이만큼으로 옅게 한다 — 시선이 S 와 알갱이로 간다. */
const DIM_DURING_FLOW = 0.5;

/** 극 표식 · B 이름표 자리 띄움(월드) · 글자 크기(화면 px). */
const POLE_OFFSET: Vec2 = [0.22, 0.2];
const B_LABEL_OFFSET: Vec2 = [-0.2, 0.2];
const LABEL_PX = 14;

// ------------------------------------------------------------------------
// 모양 표본
// ------------------------------------------------------------------------

function ring(c: Vec2, r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k <= SYMBOL_SAMPLES; k++) {
    const a = (2 * Math.PI * k) / SYMBOL_SAMPLES;
    pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
  }
  return pts;
}

/**
 * 도선을 감는 B 고리의 반쪽. 고리는 도선에 수직인 면(yz)의 원이고, 비스듬히 보아
 * 앞(화면 쪽) 반쪽이 왼쪽, 뒤 반쪽이 오른쪽에 온다. θ 는 +y 에서 앞쪽으로 잰다.
 */
function loopHalf(cx: number, cy: number, r: number, front: boolean): Vec2[] {
  const pts: Vec2[] = [];
  const base = front ? 0 : Math.PI;
  for (let k = 0; k <= LOOP_SAMPLES; k++) {
    const th = base + (Math.PI * k) / LOOP_SAMPLES;
    pts.push([cx - r * LOOP_SQUASH * Math.sin(th), cy + r * Math.cos(th)]);
  }
  return pts;
}

function zigzag(x: number, half: number): Vec2[] {
  const pts: Vec2[] = [[x, half]];
  for (let k = 1; k < ZIGZAG_TEETH * 2; k++) {
    const y = half - (2 * half * k) / (ZIGZAG_TEETH * 2);
    pts.push([x + (k % 2 === 1 ? ZIGZAG_AMP : -ZIGZAG_AMP), y]);
  }
  pts.push([x, -half]);
  return pts;
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: { state: PoyntingVectorState; stage: StageDef; timeline?: TimelineFrame }): SceneGraph {
  const { state, timeline: tl } = params;
  if (!tl) throw new Error('poynting-vector: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const W = c.loopHalfWidth;
  const H = c.wireY;
  const r = c.probeReach;

  // 단계 진행도 — 나타남 · 흐름 켜짐 · 흐려짐은 모두 선언된 단계다.
  const out1 = 1 - tl.at('fade');
  const dim = 1 - (1 - DIM_DURING_FLOW) * tl.at('flowIn');
  const eAlpha = tl.at('eIn') * out1 * dim;
  const bAlpha = tl.at('bIn') * out1 * dim;
  const sAlpha = tl.at('sIn') * out1;
  const flowAlpha = tl.at('flowIn') * out1;

  const out: Primitive[] = [];

  // ---- S 흐름선 — 전지 틈에서 저항 몸통까지 (= 등전위선) ----
  out.push({
    type: 'lineSet',
    id: 'stream-lines',
    lines: state.lines,
    width: STREAM_PX,
    opacity: flowAlpha * STREAM_OPACITY,
    style: { colorRole: 'accent', emphasis: 'medium' },
  });

  // ---- B 고리 뒤 반쪽 — 도선 아래로 지난다 ----
  const xs = stationXs(c);
  // 도선마다 전류 방향(+1 오른쪽). 위 도선은 전지 + 에서 저항으로, 아래 도선은 되돌아온다.
  const wires: { y: number; dir: 1 | -1 }[] = [
    { y: H, dir: 1 },
    { y: -H, dir: -1 },
  ];
  xs.forEach((x, i) => {
    wires.forEach((w, j) => {
      out.push({
        type: 'trajectory',
        id: `loop-back-${i}-${j}`,
        points: loopHalf(x, w.y, r, false),
        width: LOOP_PX,
        opacity: bAlpha,
        style: { colorRole: 'secondary', emphasis: 'medium', lineStyle: 'dashed' },
      });
    });
  });

  // ---- 도선 · 전지 리드 · 저항 리드 ----
  out.push({
    type: 'lineSet',
    id: 'wires',
    lines: [
      [[-W, c.batteryGapHalf], [-W, H], [W, H], [W, c.resistorHalf]],
      [[-W, -c.batteryGapHalf], [-W, -H], [W, -H], [W, -c.resistorHalf]],
    ],
    width: WIRE_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  // 전지 — 긴 판(+)이 위, 짧은 판(−)이 아래 (G178: circuitElement battery 대신)
  out.push({
    type: 'lineSet',
    id: 'battery-plus',
    lines: [[[-W - BATTERY_LONG_HALF, c.batteryGapHalf], [-W + BATTERY_LONG_HALF, c.batteryGapHalf]]],
    width: BATTERY_LONG_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'lineSet',
    id: 'battery-minus',
    lines: [[[-W - BATTERY_SHORT_HALF, -c.batteryGapHalf], [-W + BATTERY_SHORT_HALF, -c.batteryGapHalf]]],
    width: BATTERY_SHORT_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  // 저항 — 지그재그 (G90)
  out.push({
    type: 'lineSet',
    id: 'resistor',
    lines: [zigzag(W, c.resistorHalf)],
    width: WIRE_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- B 고리 앞 반쪽 — 도선 위로 지난다 ----
  const fronts: Vec2[][] = [];
  xs.forEach((x) => wires.forEach((w) => fronts.push(loopHalf(x, w.y, r, true))));
  out.push({
    type: 'lineSet',
    id: 'loop-front',
    lines: fronts,
    width: LOOP_PX,
    opacity: bAlpha,
    style: { colorRole: 'secondary', emphasis: 'medium' },
  });
  // 도는 방향 — 앞 반쪽의 도선 바깥쪽 자리. 오른쪽으로 흐르는 전류를 감는 고리는 위에서 앞으로 내려온다.
  xs.forEach((x, i) => {
    wires.forEach((w, j) => {
      const th = w.dir > 0 ? LOOP_HEAD_AT : Math.PI - LOOP_HEAD_AT;
      const at: Vec2 = [x - r * LOOP_SQUASH * Math.sin(th), w.y + r * Math.cos(th)];
      const tx = -r * LOOP_SQUASH * Math.cos(th) * w.dir;
      const ty = -r * Math.sin(th) * w.dir;
      const k = LOOP_HEAD_LEN / Math.hypot(tx, ty);
      out.push({
        type: 'vector',
        id: `loop-dir-${i}-${j}`,
        from: [at[0] - (tx * k) / 2, at[1] - (ty * k) / 2],
        delta: [tx * k, ty * k],
        headSize: LOOP_HEAD,
        width: LOOP_PX,
        opacity: bAlpha,
        style: { colorRole: 'secondary', emphasis: 'medium' },
      });
    });
  });

  // ---- E · S 화살표 — 관찰 자리에서 출발한다. B 표식을 그 위에 얹어 뿌리가 표식 안에서 시작한다 ----
  // 바깥 자리는 E · S 가 표식 반지름보다 짧아 긋지 않는다 (NOTES b).
  const inner = state.probes.filter((p) => p.inner);
  inner.forEach((p, i) => {
    out.push({
      type: 'vector',
      id: `e-${i}`,
      from: p.pos,
      delta: p.e,
      headSize: E_HEAD,
      width: E_PX,
      opacity: eAlpha,
      ...(p.named ? { label: text('label.e'), labelSide: 'cw' as const } : {}),
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  });
  inner.forEach((p, i) => {
    out.push({
      type: 'vector',
      id: `s-${i}`,
      from: p.pos,
      delta: p.s,
      headSize: S_HEAD,
      width: S_PX,
      opacity: sAlpha,
      outline: 'background',
      ...(p.named ? { label: text('label.s') } : {}),
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  });

  // ---- ⊙ · ⊗ — 고리가 회로 면을 뚫는 자리 (G182) ----
  const strokes: Vec2[][] = [];
  const dots: Vec2[] = [];
  for (const p of state.probes) {
    strokes.push(ring(p.pos, SYMBOL_R));
    if (p.bOut) {
      dots.push(p.pos);
    } else {
      const d = SYMBOL_R * CROSS_FRACTION * Math.SQRT1_2;
      const [x, y] = p.pos;
      strokes.push([[x - d, y - d], [x + d, y + d]]);
      strokes.push([[x - d, y + d], [x + d, y - d]]);
    }
  }
  out.push({
    type: 'lineSet',
    id: 'b-symbols',
    lines: strokes,
    width: SYMBOL_PX,
    opacity: bAlpha,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });
  if (dots.length > 0) {
    out.push({
      type: 'particleSystem',
      id: 'b-symbol-dots',
      positions: dots,
      sizes: SYMBOL_DOT_PX,
      opacity: bAlpha,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  }

  // ---- 에너지 알갱이 — S 흐름선을 따라 전지에서 저항으로 ----
  const energy: Vec2[] = [];
  state.lines.forEach((line, i) => {
    for (const q of dotsOn(line, state.lineLengths[i]!, tl.t, c)) energy.push(q);
  });
  if (energy.length > 0 && flowAlpha > 0) {
    out.push({
      type: 'particleSystem',
      id: 'energy',
      positions: energy,
      sizes: DOT_PX,
      opacity: flowAlpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 전류 화살표 I — 위 도선은 저항 쪽, 아래 도선은 전지 쪽 ----
  out.push({
    type: 'vector',
    id: 'current-top',
    from: [-CURRENT_ARROW_X - CURRENT_ARROW_LEN / 2, H],
    delta: [CURRENT_ARROW_LEN, 0],
    headSize: CURRENT_HEAD,
    width: CURRENT_PX,
    label: text('label.i'),
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'current-bottom',
    from: [CURRENT_ARROW_X + CURRENT_ARROW_LEN / 2, -H],
    delta: [-CURRENT_ARROW_LEN, 0],
    headSize: CURRENT_HEAD,
    width: CURRENT_PX,
    label: text('label.i'),
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 극 표식 · B 이름표 ----
  out.push({
    type: 'readout',
    id: 'pole-plus',
    anchor: { world: [-W + POLE_OFFSET[0], c.batteryGapHalf + POLE_OFFSET[1]] },
    text: text('label.plus'),
    chip: false,
    fontSize: LABEL_PX,
    weight: 'bold',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'pole-minus',
    anchor: { world: [-W + POLE_OFFSET[0], -c.batteryGapHalf - POLE_OFFSET[1]] },
    text: text('label.minus'),
    chip: false,
    fontSize: LABEL_PX,
    weight: 'bold',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  const named = state.probes.find((p) => p.named);
  if (named) {
    out.push({
      type: 'readout',
      id: 'b-label',
      anchor: { world: [named.pos[0] - r * LOOP_SQUASH + B_LABEL_OFFSET[0], H + B_LABEL_OFFSET[1]] },
      text: text('label.b'),
      chip: false,
      fontSize: LABEL_PX,
      font: 'mono',
      weight: 'bold',
      opacity: bAlpha,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  }

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
