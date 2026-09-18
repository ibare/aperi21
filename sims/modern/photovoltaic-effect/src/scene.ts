// ========================================================================
// photovoltaic-effect — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다. 겹침은 scene 에 쓴 순서(`drawOrder: 'scene'`).
//
// 자유 렌더를 쓰지 않는다. 막대 두 조각 · 공핍층(`region`) · 전극(`body` rect) · 도선 · 바늘 ·
// 운반자 꼬리 · 광자 물결 뭉치(`lineSet`) · 전자(`particleSystem` 점) · 양공 · 쌍 표지(`trace` 고리) ·
// 전압계(`body` circle + `trajectory` 눈금 호) · 내부 전기장(`vector`) · 이름표(`readout`) 가 모두
// 표준 어휘로 있다.
//
// 색 — 초록빛은 빛 채널(`light: { rgb }`, `wavelengthToLinearRgb`)로만 칠한다. 적외선은 가시광 밖이라
// 색을 지어내지 않고 먹색 물결로 긋는다 — 두 빛을 가르는 것은 물결 간격이다. 전자 · 양공은 먹색 하나,
// 가르는 것은 채운 점 · 빈 고리의 모양과 가는 방향이다. 막대 · 전극 · 도선 · 전압계는 무채색, 공핍층
// 칠은 보조색. 강조색은 **바늘과 전극 극성**, 곧 「생긴 전압」 한 뜻에만 쓴다.
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
import {
  fadeOpacity,
  lambdaOf,
  LAMP_AT,
  lampWeights,
  photonEvOf,
  readConstants,
  schedule,
  snapshot,
  visibleRgb,
  type Carrier,
  type FlyingPhoton,
  type LightKind,
} from './physics';
import {
  BAR_HALF_H,
  HALF_LEN,
  METER_R,
  METER_Y,
  PLATE_W,
  SCENE_BOUNDS,
  text,
  type PhotovoltaicEffectMessageKey,
} from './schema';
import type { PhotovoltaicEffectState } from './state';

// ------------------------------------------------------------------------
// 모양 — 선 굵기 · 글자 크기 · 짙기 · 띄움 거리 (C2)
// ------------------------------------------------------------------------

/** 막대 칠 짙기 · 공핍층 칠 짙기. */
const BAR_FILL = 0.06;
const DEPLETION_FILL = 0.2;

/** 빛줄기 — 램프 구멍의 반폭(월드) · 채움 짙기(적외선 · 초록빛). 적외선 줄기는 무채색으로 옅게만. */
const BEAM_APERTURE = 0.1;
const BEAM_FILL_IR = 0.07;
const BEAM_FILL_VISIBLE = 0.16;

/** 광자 물결 뭉치 — 길이 · 흔들림 폭(월드) · 표본 수 · 굵기(화면 px). 두 빛이 같은 길이라 물결 수가 파장을 말한다. */
const PACKET_LENGTH = 0.62;
const PACKET_AMPLITUDE = 0.08;
const PACKET_SAMPLES = 40;
const PHOTON_WIDTH_PX = 2;

/** 전자 점 · 양공 고리 반지름(화면 px) · 고리 굵기(화면 px). 둘이 같은 크기로 보이게. */
const ELECTRON_PX = 3.6;
const HOLE_PX = 3.6;
const HOLE_WIDTH_PX = 1.6;
/** 움직이는 운반자의 꼬리 — 길이(월드) · 굵기(화면 px) · 짙기. 멈춘 화면에서도 가는 방향이 읽히게. */
const TRAIL_LEN = 0.32;
const TRAIL_WIDTH_PX = 1.6;
const TRAIL_OPACITY = 0.45;
/** 이보다 옅은 알갱이는 선언하지 않는다 — `trace` 는 최소 알파로 남긴다. */
const WEIGHT_CUTOFF = 0.06;
/** 쌍 표지 고리 — 처음 · 끝 반지름(화면 px) · 굵기(화면 px). */
const FLASH_PX = 3;
const FLASH_TO_PX = 14;
const FLASH_WIDTH_PX = 1.4;

/** 내부 전기장 화살표 — 막대 아래로 띄우는 거리(월드) · 굵기(화면 px). */
const FIELD_GAP = 0.3;
const FIELD_WIDTH_PX = 2;

/** 도선 굵기(화면 px). */
const WIRE_WIDTH_PX = 1.4;
/** 전압계 — 바늘 굴대의 높이(반지름 비, 가운데에서 아래로) · 바늘 길이(반지름 비) · 굵기(화면 px). */
const PIVOT_DROP = 0.3;
const NEEDLE_LEN = 0.95;
const NEEDLE_WIDTH_PX = 2.2;
/** 바늘 각(연직에서, 도) — 0 V 자리 · 개방 전압 자리. 오른쪽이 +. */
const NEEDLE_REST_DEG = -55;
const NEEDLE_FULL_DEG = 30;
/** 눈금 호 — 반지름 비 · 표본 수 · 굵기(화면 px). */
const DIAL_R = 0.82;
const DIAL_SAMPLES = 16;
const DIAL_WIDTH_PX = 1;
/** 계기 기호 `V` 자리(반지름 비, 가운데에서 아래로). */
const METER_SYMBOL_DROP = 0.62;
/** 전압 값 이름표 — 전압계 오른쪽으로 띄우는 거리 · 도선 위로 올리는 높이(반지름 비). 도선과 겹치지 않게. */
const VOLTAGE_GAP = 0.18;
const VOLTAGE_RISE = 0.55;

/** 램프 몸통 [너비, 높이](월드) · 구멍 반지름(월드). */
const LAMP_BODY: Vec2 = [0.8, 0.28];
const LAMP_APERTURE = 0.11;
/** 광자 이름표 — 램프 오른쪽으로 띄우는 거리(월드). */
const LAMP_LABEL_GAP = 0.6;

/** 이름표 글자 크기 · 극성 글자 크기 · 계기 기호 크기(화면 px). */
const LABEL_PX = 13;
const SIGN_PX = 18;
const METER_SYMBOL_PX = 11;
/** 조각 이름 · 극성을 막대 위 끝에서 올리는 거리(화면 px). */
const ABOVE_BAR: Vec2 = [0, -13];
/** 띠 간격 이름표 — 막대 아래에서 내리는 거리(화면 px). */
const BELOW_BAR: Vec2 = [0, 16];

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
const band = { colorRole: 'secondary', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;

const rect = (x0: number, x1: number, y0: number, y1: number): Vec2[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];
const BOX_EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
] as const;

const PHOTON_KEY: Record<LightKind, PhotovoltaicEffectMessageKey> = {
  ir: 'label.irPhoton',
  visible: 'label.visiblePhoton',
};

export function scene(params: {
  state: PhotovoltaicEffectState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('photovoltaic-effect: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const op = fadeOpacity(tl);
  const lamp = lampWeights(tl);
  const rgb = visibleRgb(c);
  const snap = snapshot(schedule(tl, c), tl.u, c);
  const dh = c.depletionHalf;
  const g: Primitive[] = [];

  // ================= 빛줄기 — 램프 구멍에서 공핍층 윗면까지 =================
  const beam: Vec2[] = [
    [-BEAM_APERTURE, LAMP_AT[1]],
    [BEAM_APERTURE, LAMP_AT[1]],
    [dh, BAR_HALF_H],
    [-dh, BAR_HALF_H],
  ];
  if (lamp.ir > 0) {
    g.push({ type: 'region', id: 'beam-ir', points: beam, fillOpacity: BEAM_FILL_IR, opacity: op * lamp.ir, style: muted });
  }
  if (lamp.visible > 0) {
    g.push({
      type: 'region',
      id: 'beam-visible',
      points: beam,
      fillOpacity: BEAM_FILL_VISIBLE,
      opacity: op * lamp.visible,
      light: { rgb },
    });
  }

  // ================= 막대 두 조각 · 공핍층 · 전극 =================
  g.push({
    type: 'region',
    id: 'p-bar',
    points: rect(-HALF_LEN, 0, -BAR_HALF_H, BAR_HALF_H),
    fillOpacity: BAR_FILL,
    outline: BOX_EDGES,
    opacity: op,
    style: muted,
  });
  g.push({
    type: 'region',
    id: 'n-bar',
    points: rect(0, HALF_LEN, -BAR_HALF_H, BAR_HALF_H),
    fillOpacity: BAR_FILL,
    outline: BOX_EDGES,
    opacity: op,
    style: muted,
  });
  g.push({
    type: 'region',
    id: 'depletion',
    points: rect(-dh, dh, -BAR_HALF_H, BAR_HALF_H),
    fillOpacity: DEPLETION_FILL,
    opacity: op,
    style: band,
  });
  const plateX = HALF_LEN + PLATE_W / 2;
  for (const sg of [-1, 1]) {
    g.push({
      type: 'body',
      id: sg < 0 ? 'p-plate' : 'n-plate',
      pos: [sg * plateX, 0],
      shape: 'rect',
      size: [PLATE_W, 2 * BAR_HALF_H],
      opacity: op,
      style: muted,
    });
  }

  // ================= 도선 · 전압계 =================
  g.push({
    type: 'lineSet',
    id: 'wires',
    lines: [-1, 1].map((sg): Vec2[] => [
      [sg * plateX, -BAR_HALF_H],
      [sg * plateX, METER_Y],
      [sg * METER_R, METER_Y],
    ]),
    width: WIRE_WIDTH_PX,
    opacity: op,
    style: muted,
  });
  g.push({
    type: 'body',
    id: 'meter',
    pos: [0, METER_Y],
    shape: 'circle',
    size: METER_R,
    fill: 'none',
    outline: 'role',
    glow: false,
    opacity: op,
    style: muted,
  });
  const pivot: Vec2 = [0, METER_Y - PIVOT_DROP * METER_R];
  const dial: Vec2[] = [];
  for (let i = 0; i <= DIAL_SAMPLES; i++) {
    const a = deg(NEEDLE_REST_DEG + ((NEEDLE_FULL_DEG - NEEDLE_REST_DEG) * i) / DIAL_SAMPLES);
    dial.push(tip(pivot, a, DIAL_R * METER_R));
  }
  g.push({ type: 'trajectory', id: 'dial', points: dial, width: DIAL_WIDTH_PX, opacity: op, style: muted });
  g.push({
    type: 'readout',
    id: 'meter-symbol',
    anchor: { world: [0, METER_Y - METER_SYMBOL_DROP * METER_R] },
    text: text('label.meter'),
    chip: false,
    font: 'text',
    fontSize: METER_SYMBOL_PX,
    align: 'center',
    opacity: op,
    style: muted,
  });
  const needleAngle = deg(NEEDLE_REST_DEG + (NEEDLE_FULL_DEG - NEEDLE_REST_DEG) * snap.charge);
  g.push({
    type: 'lineSet',
    id: 'needle',
    lines: [[pivot, tip(pivot, needleAngle, NEEDLE_LEN * METER_R)]],
    width: NEEDLE_WIDTH_PX,
    opacity: op,
    style: accent,
  });
  const hold = tl.at('holdIn');
  if (hold > 0) {
    g.push({
      ...label('voltage', [METER_R + VOLTAGE_GAP, METER_Y + VOLTAGE_RISE * METER_R], [0, 0], text('label.voltage'), op * hold, LABEL_PX, 'left'),
      vars: { v: String(c.openCircuitVoltage) },
      style: accent,
    });
  }

  // ================= 내부 전기장 — 공핍층 아래, n → p =================
  g.push({
    type: 'vector',
    id: 'field',
    from: [dh, -BAR_HALF_H - FIELD_GAP],
    delta: [-2 * dh, 0],
    label: text('label.field'),
    labelSide: 'ccw',
    width: FIELD_WIDTH_PX,
    opacity: op,
    style: ink,
  });

  // ================= 운반자 · 쌍 표지 =================
  const electrons = snap.electrons.filter((k) => k.weight > WEIGHT_CUTOFF);
  const holes = snap.holes.filter((k) => k.weight > WEIGHT_CUTOFF);
  const moving = [...electrons, ...holes].filter((k) => k.dir);
  if (moving.length > 0) {
    g.push({
      type: 'lineSet',
      id: 'carrier-trails',
      lines: moving.map((k): Vec2[] => [k.pos, [k.pos[0] - k.dir![0] * TRAIL_LEN, k.pos[1] - k.dir![1] * TRAIL_LEN]]),
      opacities: moving.map((k) => k.weight),
      width: TRAIL_WIDTH_PX,
      opacity: op * TRAIL_OPACITY,
      style: ink,
    });
  }
  if (snap.flashes.length > 0) {
    g.push({
      type: 'trace',
      id: 'pair-flashes',
      marks: snap.flashes.map((f) => ({ pos: f.pos, age: f.age })),
      life: c.flashLife,
      shape: 'ring',
      size: FLASH_PX,
      spreadTo: FLASH_TO_PX,
      width: FLASH_WIDTH_PX,
      opacity: op,
      style: ink,
    });
  }
  g.push(electronDots(electrons, op));
  g.push(holeRings(holes, op));

  // ================= 광자 — 빛마다 한 선언. 물결 간격이 파장이다 =================
  for (const k of ['ir', 'visible'] as const) {
    const ps = snap.photons.filter((p) => p.light === k);
    if (ps.length === 0) continue;
    const lw = lambdaOf(k, c) * c.waveScale;
    const decl: LineSet = {
      type: 'lineSet',
      id: `photons-${k}`,
      lines: ps.map((p) => packet(p, lw)),
      opacities: ps.map((p) => p.alpha),
      width: PHOTON_WIDTH_PX,
      opacity: op,
    };
    g.push(k === 'visible' ? { ...decl, light: { rgb } } : { ...decl, style: ink });
  }

  // ================= 램프 =================
  g.push({
    type: 'body',
    id: 'lamp-body',
    pos: [LAMP_AT[0], LAMP_AT[1] + LAMP_BODY[1] / 2],
    shape: 'rect',
    size: LAMP_BODY,
    outline: 'none',
    opacity: op,
    style: muted,
  });
  g.push({
    type: 'body',
    id: 'lamp-aperture',
    pos: LAMP_AT,
    shape: 'circle',
    size: LAMP_APERTURE,
    outline: 'none',
    glow: false,
    opacity: op,
    style: muted,
  });
  if (lamp.visible > 0) {
    g.push({
      type: 'body',
      id: 'lamp-aperture-visible',
      pos: LAMP_AT,
      shape: 'circle',
      size: LAMP_APERTURE,
      outline: 'none',
      glow: false,
      opacity: op * lamp.visible,
      light: { rgb },
    });
  }

  // ================= 이름표 · 극성 =================
  g.push(label('p-name', [-HALF_LEN / 2, BAR_HALF_H], ABOVE_BAR, text('label.pType'), op, LABEL_PX, 'center'));
  g.push(label('n-name', [HALF_LEN / 2, BAR_HALF_H], ABOVE_BAR, text('label.nType'), op, LABEL_PX, 'center'));
  g.push({
    ...label('band-gap', [HALF_LEN / 2, -BAR_HALF_H], BELOW_BAR, text('label.bandGap'), op, LABEL_PX, 'center'),
    vars: { g: String(c.bandGap) },
    weight: 'normal',
    style: muted,
  });
  const lampLabelAt: Vec2 = [LAMP_AT[0] + LAMP_LABEL_GAP, LAMP_AT[1]];
  for (const k of ['ir', 'visible'] as const) {
    const w = lamp[k];
    if (w <= 0) continue;
    g.push({
      ...label(`photon-${k}`, lampLabelAt, [0, 0], text(PHOTON_KEY[k]), op * w, LABEL_PX, 'left'),
      vars: { e: String(photonEvOf(k, c)) },
    });
  }
  if (snap.charge > 0) {
    g.push({
      ...label('p-sign', [-plateX, BAR_HALF_H], ABOVE_BAR, text('label.plus'), op * snap.charge, SIGN_PX, 'center'),
      style: accent,
    });
    g.push({
      ...label('n-sign', [plateX, BAR_HALF_H], ABOVE_BAR, text('label.minus'), op * snap.charge, SIGN_PX, 'center'),
      style: accent,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

const deg = (d: number): number => (d * Math.PI) / 180;

/** 굴대에서 연직으로부터 `a`(라디안, 오른쪽 +) 만큼 기운 방향으로 `len` 떨어진 자리. */
function tip(pivot: Vec2, a: number, len: number): Vec2 {
  return [pivot[0] + Math.sin(a) * len, pivot[1] + Math.cos(a) * len];
}

/** 광자 하나의 물결 뭉치 — 나는 방향을 따라 파장 간격으로 흔들리고 양 끝으로 잦아든다. */
function packet(p: FlyingPhoton, lambdaWorld: number): Vec2[] {
  const [ux, uy] = p.dir;
  const nx = -uy;
  const ny = ux;
  const pts: Vec2[] = [];
  for (let i = 0; i <= PACKET_SAMPLES; i++) {
    const f = i / PACKET_SAMPLES;
    // 앞쪽 끝이 지금 자리다 — 뭉치는 그 뒤로 끌린다. 램프 구멍 뒤로는 끌리지 않는다.
    const s = -f * Math.min(PACKET_LENGTH, p.travelled);
    const env = Math.sin(Math.PI * f);
    const w = PACKET_AMPLITUDE * env * Math.sin((2 * Math.PI * s) / lambdaWorld);
    pts.push([p.pos[0] + ux * s + nx * w, p.pos[1] + uy * s + ny * w]);
  }
  return pts;
}

function electronDots(list: readonly Carrier[], op: number): Primitive {
  return {
    type: 'particleSystem',
    id: 'electrons',
    positions: list.map((k) => k.pos),
    sizes: list.map((k) => ELECTRON_PX * k.weight),
    opacities: list.map((k) => k.weight),
    opacity: op,
    style: ink,
  };
}

/** 양공 — 속 빈 고리. `trace` 의 세기가 반지름과 짙기에 함께 걸려 옅어질 때 전자 점처럼 작아진다 (G167). */
function holeRings(list: readonly Carrier[], op: number): Primitive {
  return {
    type: 'trace',
    id: 'holes',
    marks: list.map((k) => ({ pos: k.pos, strength: k.weight })),
    shape: 'ring',
    size: HOLE_PX,
    width: HOLE_WIDTH_PX,
    opacity: op,
    style: ink,
  };
}

function label(
  id: string,
  at: Vec2,
  offset: Vec2,
  msg: Readout['text'],
  opacity: number,
  px: number,
  align: 'left' | 'center',
): Readout {
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
    style: ink,
  };
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
