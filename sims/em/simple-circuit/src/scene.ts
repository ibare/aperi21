// ========================================================================
// simple-circuit — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 아래에서 위로 —
//   전구의 빛(body circle · light 채널) → 전선(lineSet) → 끊는 토막(lineSet) → 끊는 자리
//   이음점(terminal) → 끊긴 자리 고리(body, 강조색) → 전지 두 판(lineSet) → 전구 기호
//   (circuitElement lamp, 선언만) → 빛살(lineSet) → 알갱이 꼬리(lineSet) · 알갱이
//   (particleSystem) → 이름표(readout) · 방향 표식(vector).
//
// 색은 뜻마다 하나다 — 전선 · 전지 · 전구 기호 · 토막은 먹색(장치), 알갱이와 `e⁻` 표식은
// primary(전자), **강조색은 「지금 끊긴 자리」 한 가지 뜻에만.** 전구가 켜졌는지는 색 역할이
// 아니라 빛 채널(밝기)과 빛살 모양으로 보인다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LocalizedText,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  CUTS,
  LOOP_PATH,
  arcsWithout,
  carrierCount,
  cumulativeLengths,
  flowDistance,
  isClosed,
  openness,
  outwardOf,
  pointAt,
  readConstants,
  subPath,
  swung,
  within,
} from './physics';
import {
  BATTERY_LONG_HALF,
  BATTERY_PLATE_GAP,
  BATTERY_SHORT_HALF,
  BATTERY_Y,
  LAMP_HALF,
  LAMP_RADIUS,
  LAMP_X,
  LOOP_BOTTOM,
  LOOP_LEFT,
  LOOP_TOP,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { SimpleCircuitState } from './state';

/** 전선 굵기(화면 px). */
const WIRE_PX = 2.5;
/** 전지 두 판의 굵기(화면 px). 짧은 판(−)을 더 굵게 긋는 관례를 따른다. */
const BATTERY_LONG_PX = 2.5;
const BATTERY_SHORT_PX = 4.5;
/** 알갱이 반지름 · 꼬리 굵기(화면 px) · 꼬리 불투명도. */
const CARRIER_PX = 3.2;
const TRAIL_PX = 2.2;
const TRAIL_OPACITY = 0.45;
/** 알갱이를 숨기는 여유(월드) — 전지 두 판 사이 · 전구 동그라미 안을 지날 때. */
const HIDE_MARGIN = 0.14;

/** 토막이 다 젖혀졌을 때의 각(라디안). 고리 바깥으로 든다. */
const SWING_MAX_RAD = (55 * Math.PI) / 180;
/** 끊긴 자리를 두르는 고리의 반지름(월드) · 굵기는 테마의 가는 선. */
const CUT_RING_RADIUS = 0.62;
/** 끊긴 자리 고리의 중심을 고리 바깥으로 띄우는 거리(월드) — 젖혀진 토막을 함께 두른다. */
const CUT_RING_OUTSET = 0.18;

/** 전구 빛 원이 기호 동그라미 반지름에서 차지하는 몫 — 테두리 선 안쪽에 들어간다. */
const LAMP_GLOW_FRACTION = 0.92;
const LAMP_GLOW_RADIUS = LAMP_RADIUS * LAMP_GLOW_FRACTION;
/** 빛살 — 전구 중심에서 잰 안쪽 · 바깥 끝(월드), 굵기(화면 px), 방향(도, 위쪽 반원). */
const RAY_INNER = 0.66;
const RAY_OUTER = 0.92;
const RAY_PX = 2;
const RAY_ANGLES_DEG = [30, 60, 90, 120, 150] as const;

/** 이름표 글자 크기(화면 px) · 대상에서 띄우는 거리(월드). */
const LABEL_PX = 13;
const SIGN_PX = 15;
const BATTERY_LABEL_GAP = 0.62;
const SIGN_GAP = 0.3;
const SIGN_RISE = 0.16;
const BULB_LABEL_DROP = 0.82;

/** 전자 방향 표식 — 아래 변 밑 높이, 화살표 꼬리 x · 길이, 기호를 화살표에서 띄우는 거리(월드). */
const ELECTRON_MARK_DROP = 0.42;
const ELECTRON_ARROW_FROM = 1.6;
const ELECTRON_ARROW_LEN = 0.9;
const ELECTRON_LABEL_GAP = 0.14;

export function scene(params: {
  state: SimpleCircuitState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('simple-circuit: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const closed = isClosed(tl);
  const out: Primitive[] = [];

  const path = LOOP_PATH;
  const lengths = cumulativeLengths(path);
  const total = lengths[lengths.length - 1]!;
  const topStart = lengths[3]!;
  /** 위 변의 x → 호길이(위 변은 오른쪽에서 왼쪽으로 돈다). */
  const sTop = (x: number): number => topStart + (path[3]![0] - x);
  /** 왼쪽 변의 y → 호길이(왼쪽 변은 위에서 아래로 돈다). */
  const sLeft = (y: number): number => LOOP_TOP - y;

  const batteryGap: [number, number] = [sLeft(BATTERY_Y + BATTERY_PLATE_GAP / 2), sLeft(BATTERY_Y - BATTERY_PLATE_GAP / 2)];
  const lampSpan: [number, number] = [sTop(LAMP_X + LAMP_HALF), sTop(LAMP_X - LAMP_HALF)];
  const cuts = CUTS.map((cut) => {
    const hinge = pointAt(path, lengths, cut.span[0]);
    return {
      ...cut,
      open: openness(tl, cut.id),
      hinge: hinge.pos,
      dir: hinge.dir,
      outward: outwardOf(hinge.dir),
      length: cut.span[1] - cut.span[0],
    };
  });

  // ---- 전구의 빛 — 기호 동그라미 안을 채운다. 켜지면 가득 찬 빛, 꺼지면 빛 없음 ----
  out.push({
    type: 'body',
    id: 'lamp-light',
    pos: [LAMP_X, LOOP_TOP],
    shape: 'circle',
    size: LAMP_GLOW_RADIUS,
    outline: 'none',
    glow: closed,
    light: closed ? 1 : 0,
  });

  // ---- 전선 — 전지 두 판 사이 · 전구 기호 · 끊는 토막 자리를 비우고 긋는다 ----
  const wireArcs = arcsWithout(0, total, total, [batteryGap, lampSpan, ...cuts.map((k) => k.span)]);
  out.push({
    type: 'lineSet',
    id: 'wires',
    lines: wireArcs.map(([a, b]) => subPath(path, lengths, a, b)),
    width: WIRE_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 끊는 토막 — 경첩에서 고리 바깥으로 젖혀진다 ----
  out.push({
    type: 'lineSet',
    id: 'cut-pieces',
    lines: cuts.map((k) => [k.hinge, swung(k.hinge, k.dir, k.outward, k.length, k.open * SWING_MAX_RAD)]),
    width: WIRE_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  for (const k of cuts) {
    for (const [end, s] of [['hinge', k.span[0]], ['contact', k.span[1]]] as const) {
      out.push({ type: 'terminal', id: `cut-${k.id}-${end}`, pos: pointAt(path, lengths, s).pos, kind: 'node' });
    }
  }

  // ---- 지금 끊긴 자리 — 강조색 고리. 젖혀진 만큼 짙어진다 ----
  for (const k of cuts) {
    if (k.open <= 0) continue;
    const mid = pointAt(path, lengths, (k.span[0] + k.span[1]) / 2).pos;
    out.push({
      type: 'body',
      id: `cut-${k.id}-ring`,
      pos: [mid[0] + k.outward[0] * CUT_RING_OUTSET, mid[1] + k.outward[1] * CUT_RING_OUTSET],
      shape: 'circle',
      size: CUT_RING_RADIUS,
      fill: 'none',
      outline: 'role',
      opacity: k.open,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 전지 — 긴 판(+)이 위, 짧은 판(−)이 아래 (G178: circuitElement battery 대신) ----
  const plusY = BATTERY_Y + BATTERY_PLATE_GAP / 2;
  const minusY = BATTERY_Y - BATTERY_PLATE_GAP / 2;
  out.push({
    type: 'lineSet',
    id: 'battery-plus',
    lines: [[[LOOP_LEFT - BATTERY_LONG_HALF, plusY], [LOOP_LEFT + BATTERY_LONG_HALF, plusY]]],
    width: BATTERY_LONG_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'lineSet',
    id: 'battery-minus',
    lines: [[[LOOP_LEFT - BATTERY_SHORT_HALF, minusY], [LOOP_LEFT + BATTERY_SHORT_HALF, minusY]]],
    width: BATTERY_SHORT_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 전구 기호 — 선언만 한다. bootstrap 이 plugin-circuit 으로 그린다 ----
  out.push({ type: 'circuitElement', id: 'lamp', subtype: 'lamp', pos: [LAMP_X, LOOP_TOP], rotation: 0 });

  // ---- 빛살 — 켜졌을 때만. 라이트 바탕에서 가득 찬 빛이 묻히므로 모양으로도 말한다 (G92) ----
  if (closed) {
    out.push({
      type: 'lineSet',
      id: 'lamp-rays',
      lines: RAY_ANGLES_DEG.map((deg) => {
        const a = (deg * Math.PI) / 180;
        const u: Vec2 = [Math.cos(a), Math.sin(a)];
        return [
          [LAMP_X + u[0] * RAY_INNER, LOOP_TOP + u[1] * RAY_INNER],
          [LAMP_X + u[0] * RAY_OUTER, LOOP_TOP + u[1] * RAY_OUTER],
        ];
      }),
      width: RAY_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 알갱이 — 이어져 있을 때만 돈다. 멈추면 꼬리가 사라진다 ----
  const n = carrierCount(total, c.carrierSpacing);
  const pitch = total / n;
  const offset = flowDistance(tl, c.flowSpeed, total);
  const trailLength = closed ? c.flowSpeed * c.trailSeconds : 0;
  const hidden: [number, number][] = [
    [batteryGap[0] - HIDE_MARGIN, batteryGap[1] + HIDE_MARGIN],
    [sTop(LAMP_X + LAMP_RADIUS) - HIDE_MARGIN, sTop(LAMP_X - LAMP_RADIUS) + HIDE_MARGIN],
  ];
  const positions: Vec2[] = [];
  const trails: Vec2[][] = [];
  for (let i = 0; i < n; i++) {
    const s = (offset + i * pitch) % total;
    if (hidden.some((h) => within(s, h))) continue;
    // 젖혀진 토막 위에 있던 알갱이는 토막과 함께 들린다.
    const onCut = cuts.find((k) => k.open > 0 && within(s, k.span));
    positions.push(
      onCut
        ? swung(onCut.hinge, onCut.dir, onCut.outward, s - onCut.span[0], onCut.open * SWING_MAX_RAD)
        : pointAt(path, lengths, s).pos,
    );
    if (trailLength > 0) {
      for (const [a, b] of arcsWithout(s - trailLength, s, total, hidden)) {
        trails.push(subPath(path, lengths, a, b));
      }
    }
  }
  if (trails.length > 0) {
    out.push({
      type: 'lineSet',
      id: 'carrier-trails',
      lines: trails,
      width: TRAIL_PX,
      opacity: TRAIL_OPACITY,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'particleSystem',
    id: 'carriers',
    positions,
    sizes: CARRIER_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 이름표 ----
  out.push(nameLabel('battery-label', [LOOP_LEFT - BATTERY_LABEL_GAP, BATTERY_Y], text('label.battery'), 'right'));
  out.push(signLabel('battery-plus-sign', [LOOP_LEFT + SIGN_GAP, plusY + SIGN_RISE], text('label.plus')));
  out.push(signLabel('battery-minus-sign', [LOOP_LEFT + SIGN_GAP, minusY - SIGN_RISE], text('label.minus')));
  out.push(nameLabel('bulb-label', [LAMP_X, LOOP_TOP - BULB_LABEL_DROP], text('label.bulb'), 'center'));

  // ---- 전자 방향 표식 — 알갱이가 무엇이고 어느 쪽으로 가는지 한 번 ----
  const markY = LOOP_BOTTOM - ELECTRON_MARK_DROP;
  out.push({
    type: 'vector',
    id: 'electron-direction',
    from: [ELECTRON_ARROW_FROM, markY],
    delta: [ELECTRON_ARROW_LEN, 0],
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'electron-label',
    anchor: { world: [ELECTRON_ARROW_FROM - ELECTRON_LABEL_GAP, markY] },
    text: text('label.electron'),
    chip: false,
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}

function nameLabel(id: string, at: Vec2, label: LocalizedText, align: 'left' | 'center' | 'right'): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

function signLabel(id: string, at: Vec2, label: LocalizedText): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    fontSize: SIGN_PX,
    weight: 'bold',
    align: 'left',
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}
