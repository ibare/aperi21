// ========================================================================
// diode-and-led — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 축(`vector`) · 눈금(`lineSet`) · 곡선(`trajectory`) · 지금 점(`body`) ·
// 띠(`lineSet`) · 띠 간격(`dimension`) · 전자(`particleSystem`) · 양공(`trace` 고리) · 빛 알갱이
// (`lineSet` + 빛 채널) · 이름표(`readout`) 가 모두 표준 어휘로 있다.
//
// 색: 곡선 · 전자 · 양공은 먹색, 축 · 띠 · 지난 곡선은 무채색. 강조색은 **지금 점** 한 뜻에만 쓴다 —
// 지금 걸린 전압과 흐르는 전류가 곡선 위 어디인지. 소자를 색으로 가르지 않는다. 빛의 색은 역할색이
// 아니라 빛 채널(`light: { rgb }`, `wavelengthToLinearRgb`)로만 칠한다 — 그 색 자체가 주장이다.
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
import {
  bandLevels,
  current,
  DEVICES,
  deviceSpec,
  drawnCurve,
  dropView,
  drops,
  fadeOpacity,
  fullCurve,
  gapNow,
  graphPoint,
  lightRgb,
  presence,
  readConstants,
  sweep,
  topVoltage,
  type Carrier,
  type DeviceId,
  type PhotonPacket,
} from './physics';
import {
  AXIS_V_MAX,
  AXIS_V_MIN,
  AXIS_Y_ABOVE,
  AXIS_Y_BELOW,
  BAND_X0,
  BAND_X1,
  GAP_DIM_GAP,
  GRAPH_H,
  SCENE_BOUNDS,
  text,
  VOLT_X,
  type DiodeAndLedMessageKey,
} from './schema';
import type { DiodeAndLedState } from './state';

// ------------------------------------------------------------------------
// 모양 — 선 굵기 · 글자 크기 · 짙기 · 띄움 거리 (C2)
// ------------------------------------------------------------------------

/** 축 굵기(화면 px) · 눈금 반길이(월드) · 눈금 굵기(화면 px). */
const AXIS_WIDTH_PX = 1.4;
const TICK_HALF = 0.09;
const TICK_WIDTH_PX = 1.4;
/** 곡선 굵기(화면 px) — 지금 곡선 · 지난 곡선. 지금 곡선은 축 위를 지날 때도 축보다 굵게 읽힌다. */
const CURVE_WIDTH_PX = 2.8;
const PAST_WIDTH_PX = 1.8;
/** 지난 곡선의 짙기. */
const PAST_OPACITY = 0.75;
/** 지금 점 반지름(월드). */
const MARKER_R = 0.1;
/** 띠 선 굵기(화면 px). */
const BAND_WIDTH_PX = 2.2;
/** 전자 점 · 양공 고리 반지름(화면 px) · 고리 굵기(화면 px). 둘이 같은 크기로 보이게. */
const ELECTRON_PX = 4;
const HOLE_PX = 4;
const HOLE_WIDTH_PX = 1.6;
/** 빛 알갱이 물결 굵기(화면 px). */
const PHOTON_WIDTH_PX = 2.6;

/** 글자 크기(화면 px) — 이름표 · 눈금 값 · 축 이름. */
const LABEL_PX = 13;
const TICK_PX = 12;
const AXIS_NAME_PX = 14;
/** 띄움 거리(화면 px) — 눈금 값(축 아래) · 방향 낱말(눈금 값 아래) · 곡선 이름(꼭대기 위) · 축 이름. */
const TICK_LABEL_OFFSET: Vec2 = [0, 13];
const DIRECTION_OFFSET: Vec2 = [0, 32];
const CURVE_NAME_OFFSET: Vec2 = [0, -12];
const AXIS_V_NAME_OFFSET: Vec2 = [10, -12];
const AXIS_I_NAME_OFFSET: Vec2 = [-12, 4];
/** 띠 이름 — 띠 선 왼쪽 끝 위 · 아래로 띄우는 거리(화면 px). 띠 간격 값 — 치수선 왼쪽(화면 px). */
const CONDUCTION_NAME_OFFSET: Vec2 = [0, -12];
const VALENCE_NAME_OFFSET: Vec2 = [0, 13];
const GAP_LABEL_OFFSET: Vec2 = [-26, 0];
/** 방향 낱말이 놓이는 전압(V) — 가로축 두 쪽의 가운데 무렵. */
const REVERSE_WORD_V = -1.25;
const FORWARD_WORD_V = 1.6;

const NAME_KEY: Record<DeviceId, DiodeAndLedMessageKey> = { si: 'label.si', red: 'label.red', blue: 'label.blue' };

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;

export function scene(params: {
  state: DiodeAndLedState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('diode-and-led: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const op = fadeOpacity(tl);
  const g: Primitive[] = [];

  // ================= 축 =================
  g.push({
    type: 'vector',
    id: 'axis-v',
    from: [AXIS_V_MIN * VOLT_X, 0],
    delta: [(AXIS_V_MAX - AXIS_V_MIN) * VOLT_X, 0],
    width: AXIS_WIDTH_PX,
    opacity: op,
    style: muted,
  });
  g.push({
    type: 'vector',
    id: 'axis-i',
    from: [0, -AXIS_Y_BELOW],
    delta: [0, AXIS_Y_BELOW + GRAPH_H + AXIS_Y_ABOVE],
    width: AXIS_WIDTH_PX,
    opacity: op,
    style: muted,
  });
  g.push(label('axis-v-name', [AXIS_V_MAX * VOLT_X, 0], AXIS_V_NAME_OFFSET, text('label.axisV'), op, AXIS_NAME_PX, muted));
  g.push(label('axis-i-name', [0, GRAPH_H + AXIS_Y_ABOVE], AXIS_I_NAME_OFFSET, text('label.axisI'), op, AXIS_NAME_PX, muted));
  g.push(label('word-reverse', [REVERSE_WORD_V * VOLT_X, 0], DIRECTION_OFFSET, text('label.reverse'), op, LABEL_PX, muted));
  g.push(label('word-forward', [FORWARD_WORD_V * VOLT_X, 0], DIRECTION_OFFSET, text('label.forward'), op, LABEL_PX, muted));

  // ================= 눈금 — 역방향 전압 · 소자마다 문턱 =================
  const ticks: { v: number; w: number }[] = [{ v: -c.reverseVoltage, w: 1 }];
  const tickOps: number[] = [];
  const reverseTick = label('tick-rev', graphPoint(-c.reverseVoltage, 0), TICK_LABEL_OFFSET, text('label.minusVolts'), op, TICK_PX, muted);
  g.push({ ...reverseTick, vars: { v: String(c.reverseVoltage) }, font: 'mono', weight: 'normal' });
  for (const d of DEVICES) {
    const spec = deviceSpec(c, d.id);
    const w = tl.at(d.fwd);
    if (w <= 0) continue;
    ticks.push({ v: spec.threshold, w });
    const lbl = label(`tick-${d.id}`, graphPoint(spec.threshold, 0), TICK_LABEL_OFFSET, text('label.volts'), op * w, TICK_PX, muted);
    g.push({ ...lbl, vars: { v: String(spec.threshold) }, font: 'mono', weight: 'normal' });
  }
  for (const k of ticks) tickOps.push(k.w);
  g.push({
    type: 'lineSet',
    id: 'ticks',
    lines: ticks.map((k): Vec2[] => [
      [k.v * VOLT_X, -TICK_HALF],
      [k.v * VOLT_X, TICK_HALF],
    ]),
    opacities: tickOps,
    width: TICK_WIDTH_PX,
    opacity: op,
    style: muted,
  });

  // ================= 곡선 — 지난 것(무채색) · 지금 것(먹색) · 지금 점(강조색) =================
  for (const d of DEVICES) {
    const { entered, exited } = presence(tl, d);
    if (exited <= 0) continue;
    g.push({
      type: 'trajectory',
      id: `curve-past-${d.id}`,
      points: fullCurve(c, deviceSpec(c, d.id)).map((s) => s.pos),
      width: PAST_WIDTH_PX,
      opacity: op * entered * exited * PAST_OPACITY,
      style: muted,
    });
  }
  for (const d of DEVICES) {
    const { entered, exited } = presence(tl, d);
    const live = entered * (1 - exited);
    if (live <= 0) continue;
    const spec = deviceSpec(c, d.id);
    const s = sweep(tl, c, d);
    if (s.hi > s.lo) {
      g.push({
        type: 'trajectory',
        id: `curve-${d.id}`,
        points: drawnCurve(c, spec, s.lo, s.hi),
        width: CURVE_WIDTH_PX,
        opacity: op * live,
        style: ink,
      });
    }
    g.push({
      type: 'body',
      id: `marker-${d.id}`,
      pos: graphPoint(s.v, current(c, spec, s.v)),
      shape: 'circle',
      size: MARKER_R,
      outline: 'background',
      glow: false,
      opacity: op * live,
      style: accent,
    });
  }
  // 곡선 이름 — 꼭대기 위. 곡선이 오르는 동안 나타나고, 지난 뒤에는 무채색으로 남는다.
  for (const d of DEVICES) {
    const { exited } = presence(tl, d);
    const shown = tl.at(d.rise);
    if (shown <= 0) continue;
    const top = graphPoint(topVoltage(c, deviceSpec(c, d.id)), 1);
    g.push(label(`name-${d.id}`, top, CURVE_NAME_OFFSET, text(NAME_KEY[d.id]), op * shown * (1 - exited), LABEL_PX, ink));
    if (exited > 0) {
      g.push(label(`name-past-${d.id}`, top, CURVE_NAME_OFFSET, text(NAME_KEY[d.id]), op * exited * PAST_OPACITY, LABEL_PX, muted));
    }
  }

  // ================= 띠 간격 판 =================
  const gap = gapNow(tl, c);
  const lv = bandLevels(gap);
  g.push({
    type: 'lineSet',
    id: 'bands',
    lines: [
      [
        [BAND_X0, lv.conduction],
        [BAND_X1, lv.conduction],
      ],
      [
        [BAND_X0, lv.valence],
        [BAND_X1, lv.valence],
      ],
    ],
    width: BAND_WIDTH_PX,
    opacity: op,
    style: muted,
  });
  g.push(label('conduction-name', [BAND_X0, lv.conduction], CONDUCTION_NAME_OFFSET, text('label.conduction'), op, LABEL_PX, muted, 'left'));
  g.push(label('valence-name', [BAND_X0, lv.valence], VALENCE_NAME_OFFSET, text('label.valence'), op, LABEL_PX, muted, 'left'));
  const dimX = BAND_X0 - GAP_DIM_GAP;
  g.push({
    type: 'dimension',
    id: 'gap-dim',
    from: [dimX, lv.valence],
    to: [dimX, lv.conduction],
    opacity: op,
    style: muted,
  });
  // 띠 간격 값 — 소자가 바뀌는 동안 엇갈려 바뀐다 (G109).
  for (const d of DEVICES) {
    const { entered, exited } = presence(tl, d);
    const w = entered * (1 - exited);
    if (w <= 0) continue;
    const lbl = label(`gap-${d.id}`, [dimX, (lv.valence + lv.conduction) / 2], GAP_LABEL_OFFSET, text('label.ev'), op * w, TICK_PX, ink);
    g.push({ ...lbl, vars: { e: String(deviceSpec(c, d.id).gap) }, font: 'mono', weight: 'normal', align: 'right' });
  }

  // ================= 떨어지는 전자 · 기다리는 양공 · 나가는 빛 =================
  const electrons: Carrier[] = [];
  const holes: Carrier[] = [];
  DEVICES.forEach((d, index) => {
    const { entered, exited } = presence(tl, d);
    const w = entered * (1 - exited);
    if (w <= 0) return;
    const spec = deviceSpec(c, d.id);
    const photons: PhotonPacket[] = [];
    for (const drop of drops(tl, c, d, index)) {
      const v = dropView(c, spec, drop, gap);
      if (v.electron) electrons.push({ ...v.electron, weight: v.electron.weight * w });
      if (v.hole) holes.push({ ...v.hole, weight: v.hole.weight * w });
      if (v.photon) photons.push({ ...v.photon, alpha: v.photon.alpha * w });
    }
    if (photons.length > 0 && spec.nm !== undefined) {
      g.push({
        type: 'lineSet',
        id: `photons-${d.id}`,
        lines: photons.map((p) => p.line),
        opacities: photons.map((p) => p.alpha),
        width: PHOTON_WIDTH_PX,
        opacity: op,
        light: { rgb: lightRgb(spec.nm) },
      });
    }
  });
  if (holes.length > 0) {
    g.push({
      type: 'trace',
      id: 'holes',
      marks: holes.map((h) => ({ pos: h.pos, strength: h.weight })),
      shape: 'ring',
      size: HOLE_PX,
      width: HOLE_WIDTH_PX,
      opacity: op,
      style: ink,
    });
  }
  if (electrons.length > 0) {
    g.push({
      type: 'particleSystem',
      id: 'electrons',
      positions: electrons.map((e) => e.pos),
      sizes: ELECTRON_PX,
      opacities: electrons.map((e) => e.weight),
      opacity: op,
      style: ink,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

function label(
  id: string,
  at: Vec2,
  offset: Vec2,
  msg: ReturnType<typeof text>,
  opacity: number,
  px: number,
  style: { colorRole: 'ink' | 'muted'; emphasis: 'strong' },
  align: 'left' | 'center' | 'right' = 'center',
): Extract<Primitive, { type: 'readout' }> {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset },
    text: msg,
    chip: false,
    font: 'text',
    fontSize: px,
    weight: 'bold',
    align,
    opacity,
    style,
  };
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
