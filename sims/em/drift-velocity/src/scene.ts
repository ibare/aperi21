// ========================================================================
// drift-velocity — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층도 plugin-circuit 도 쓰지 않는다 — 도선 띠 ·
// 스위치 레버 · 전지 두 판 · 빛살(lineSet), 전구의 빛 · 둘레 · 단자(body), 표시 고리(trajectory),
// 전자와 표류 꼬리(particleSystem), 방향 표식(vector), 부호 · 빠르기 이름표(readout).
//
// 색은 뜻마다 하나다 — 전자는 primary, **강조색은 「표시한 전자」 한 뜻에만**(표시 고리 ·
// 닫을 때의 자리 눈금). 장치(전지 · 전구 둘레 · 단자 · 빛살)는 먹색, 도선 띠는 muted.
// 전구의 밝기는 역할색이 아니라 빛 채널(`light`)이라 두 테마에서 켜진 등이 밝다.
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
  arcsWithout,
  carrierCount,
  carrierS,
  driftAtCycleStart,
  driftDistance,
  isClosed,
  pointAt,
  readConstants,
  sOnBottom,
  sOnLeft,
  sOnRight,
  subPath,
  switchOpenness,
  taggedIndex,
  thermalOffset,
  type DriftVelocityConstants,
} from './physics';
import {
  BATTERY_LONG_HALF,
  BATTERY_PLATE_GAP,
  BATTERY_SHORT_HALF,
  BATTERY_SIGN_X,
  BATTERY_Y,
  ELECTRON_ARROW_FROM,
  ELECTRON_ARROW_LEN,
  LAMP_RADIUS,
  LAMP_Y,
  LOOP_BOTTOM,
  LOOP_LEFT,
  LOOP_RIGHT,
  SCENE_BOUNDS,
  SWITCH_CONTACT_X,
  SWITCH_HINGE_X,
  TAG_SITE_X,
  text,
} from './schema';
import type { DriftVelocityState } from './state';

/** 도선 띠 굵기(화면 px) · 짙기. 전자가 그 안에서 떠는 관으로 읽히게 넓고 옅다. */
const WIRE_BAND_PX = 20;
const WIRE_BAND_OPACITY = 0.28;
/** 전자 반지름(화면 px). */
const CARRIER_PX = 3;
/** 표류 꼬리 굵기(화면 px) · 짙기. 밀리는 방향만 알리면 되어 가늘다. */
const TRAIL_PX = 1.5;
const TRAIL_OPACITY = 0.55;
/** 레버가 가장 벌어졌을 때의 각(라디안) — 고리 안쪽으로 들린다. 배치 각이다. */
const SWITCH_OPEN_RAD = (28 * Math.PI) / 180;
/** 스위치 단자 · 경첩 점의 반지름(월드). */
const SWITCH_TERMINAL_RADIUS = 0.07;
/** 전지 판 굵기(화면 px) — 긴 판(+)과 짧은 판(−). */
const BATTERY_LONG_PX = 3;
const BATTERY_SHORT_PX = 5;
/** 전구 안 가위표의 반길이(전구 반지름에 대한 몫) · 굵기(화면 px). */
const LAMP_CROSS_FRACTION = 0.7;
const LAMP_CROSS_PX = 1.5;
/** 빛살 — 전구 바깥쪽(오른쪽)으로 뻗는 각(도) · 안쪽 끝 · 바깥 끝(전구 중심에서 월드) · 굵기(px). */
const RAY_ANGLES_DEG = [-60, -30, 0, 30, 60] as const;
const RAY_INNER = LAMP_RADIUS + 0.12;
const RAY_OUTER = LAMP_RADIUS + 0.42;
const RAY_PX = 2;
/**
 * 표시 고리 반지름(월드) · 굵기(px) · 둘레 표본 수. `body` 둘레는 가는 선으로 고정이라 전자 떼
 * 속에서 묻혀, 닫힌 `trajectory` 로 굵게 긋는다.
 */
const TAG_RING_RADIUS = 0.17;
const TAG_RING_PX = 2;
const TAG_RING_SAMPLES = 28;
/** 닫을 때의 자리 눈금 반길이(월드) · 굵기(px). */
const TAG_TICK_HALF = 0.26;
const TAG_TICK_PX = 2;
/** 빠르기 이름표 — 눈금 위로 띄우는 거리(화면 px) · 글자 크기(px). */
const SPEED_LABEL_GAP_PX = -26;
const LABEL_PX = 13;
/** 전지 부호 글자 크기(px). */
const SIGN_PX = 14;
/** 방향 화살표 굵기(px). */
const DIRECTION_ARROW_PX = 2;

export function scene(params: {
  state: DriftVelocityState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('drift-velocity: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const closed = isClosed(tl);
  const out: Primitive[] = [];

  // ---- 고리 위 구간 ----
  const plusY = BATTERY_Y + BATTERY_PLATE_GAP / 2;
  const minusY = BATTERY_Y - BATTERY_PLATE_GAP / 2;
  const batterySpan: [number, number] = [sOnLeft(plusY), sOnLeft(minusY)];
  const switchSpan: [number, number] = [sOnBottom(SWITCH_HINGE_X), sOnBottom(SWITCH_CONTACT_X)];
  const lampSpan: [number, number] = [sOnRight(LAMP_Y - LAMP_RADIUS), sOnRight(LAMP_Y + LAMP_RADIUS)];

  const hinge: Vec2 = [SWITCH_HINGE_X, LOOP_BOTTOM];
  const contact: Vec2 = [SWITCH_CONTACT_X, LOOP_BOTTOM];
  const leverAngle = switchOpenness(tl) * SWITCH_OPEN_RAD;
  const leverDir: Vec2 = [Math.cos(leverAngle), Math.sin(leverAngle)];
  const leverLen = SWITCH_CONTACT_X - SWITCH_HINGE_X;
  const leverTip: Vec2 = [hinge[0] + leverDir[0] * leverLen, hinge[1] + leverDir[1] * leverLen];

  // ---- 도선 띠 — 전지 두 판 사이 · 스위치 · 전구 속을 비우고, 레버도 같은 띠로 ----
  const wireLines: Vec2[][] = arcsWithout([batterySpan, switchSpan, lampSpan]).map(([a, b]) => subPath(a, b));
  wireLines.push([hinge, leverTip]);
  out.push({
    type: 'lineSet',
    id: 'wire',
    lines: wireLines,
    width: WIRE_BAND_PX,
    opacity: WIRE_BAND_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 전구 — 켜지면 가득 찬 빛, 꺼지면 빛 없음. 닿는 순간 · 들리는 순간에 바뀐다 ----
  const lampCenter: Vec2 = [LOOP_RIGHT, LAMP_Y];
  out.push({
    type: 'body',
    id: 'lamp-light',
    pos: lampCenter,
    shape: 'circle',
    size: LAMP_RADIUS,
    outline: 'none',
    glow: closed,
    light: closed ? 1 : 0,
  });
  const cross = LAMP_RADIUS * LAMP_CROSS_FRACTION * Math.SQRT1_2;
  out.push({
    type: 'lineSet',
    id: 'lamp-cross',
    lines: [
      [
        [lampCenter[0] - cross, lampCenter[1] - cross],
        [lampCenter[0] + cross, lampCenter[1] + cross],
      ],
      [
        [lampCenter[0] - cross, lampCenter[1] + cross],
        [lampCenter[0] + cross, lampCenter[1] - cross],
      ],
    ],
    width: LAMP_CROSS_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'lamp-rim',
    pos: lampCenter,
    shape: 'circle',
    size: LAMP_RADIUS,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  if (closed) {
    // 가득 찬 빛이 라이트 미색 바탕에 묻히므로 모양으로도 말한다 (G92).
    out.push({
      type: 'lineSet',
      id: 'lamp-rays',
      lines: RAY_ANGLES_DEG.map((deg) => {
        const a = (deg * Math.PI) / 180;
        const u: Vec2 = [Math.cos(a), Math.sin(a)];
        return [
          [lampCenter[0] + u[0] * RAY_INNER, lampCenter[1] + u[1] * RAY_INNER],
          [lampCenter[0] + u[0] * RAY_OUTER, lampCenter[1] + u[1] * RAY_OUTER],
        ];
      }),
      width: RAY_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 전지 — 긴 판(+)이 위, 짧은 판(−)이 아래. 전자는 − 에서 나와 + 로 들어간다 ----
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
  for (const [id, y, label] of [
    ['battery-sign-plus', plusY, 'label.plus'],
    ['battery-sign-minus', minusY, 'label.minus'],
  ] as const) {
    out.push({
      type: 'readout',
      id,
      anchor: { world: [BATTERY_SIGN_X, y] },
      text: text(label),
      chip: false,
      fontSize: SIGN_PX,
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 스위치 단자 — 경첩과 닿는 자리 ----
  for (const [id, pos] of [
    ['switch-hinge', hinge],
    ['switch-contact', contact],
  ] as const) {
    out.push({
      type: 'body',
      id,
      pos,
      shape: 'circle',
      size: SWITCH_TERMINAL_RADIUS,
      outline: 'none',
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 전자 ----
  // 모든 전자가 같은 표류 거리를 받는다 — 닫히는 순간 곳곳에서 함께 밀리고, 여는 순간 함께 멈춘다.
  const n = carrierCount(c);
  const drift = driftDistance(tl, c);
  const driftStart = driftAtCycleStart(tl, c);
  const tagged = taggedIndex(sOnBottom(TAG_SITE_X), n, driftStart);
  const place = (s: number, i: number): Vec2 | undefined => carrierPlace(s, i, tl.t, c, {
    battery: batterySpan,
    lamp: lampSpan,
    lever: switchSpan,
    hinge,
    leverDir,
  });
  const positions: Vec2[] = [];
  const velocities: Vec2[] = [];
  let taggedPos: Vec2 | undefined;
  for (let i = 0; i < n; i++) {
    const s = carrierS(i, n, drift);
    const pos = place(s, i);
    if (!pos) continue;
    positions.push(pos);
    const dir = inSpan(s, switchSpan) ? leverDir : pointAt(s).dir;
    velocities.push(closed ? [dir[0] * c.driftSpeed, dir[1] * c.driftSpeed] : [0, 0]);
    if (i === tagged) taggedPos = pos;
  }
  out.push({
    type: 'particleSystem',
    id: 'electrons',
    positions,
    velocities,
    trail: closed,
    trailStyle: { seconds: c.trailSeconds, width: TRAIL_PX, opacity: TRAIL_OPACITY },
    sizes: CARRIER_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 표시한 전자 — 닫을 때의 자리 눈금과 지금 자리의 고리 ----
  const tagFade = 1 - tl.at('untag');
  const tickPoint = pointAt(carrierS(tagged, n, driftStart));
  const tickFrom: Vec2 = [
    tickPoint.pos[0] - tickPoint.inward[0] * TAG_TICK_HALF,
    tickPoint.pos[1] - tickPoint.inward[1] * TAG_TICK_HALF,
  ];
  const tickTo: Vec2 = [
    tickPoint.pos[0] + tickPoint.inward[0] * TAG_TICK_HALF,
    tickPoint.pos[1] + tickPoint.inward[1] * TAG_TICK_HALF,
  ];
  const tickOpacity = tl.at('close') * tagFade;
  if (tickOpacity > 0) {
    out.push({
      type: 'lineSet',
      id: 'tag-start',
      lines: [[tickFrom, tickTo]],
      width: TAG_TICK_PX,
      opacity: tickOpacity,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }
  const ringOpacity = tl.at('tag') * tagFade;
  if (taggedPos && ringOpacity > 0) {
    const ring: Vec2[] = [];
    for (let k = 0; k < TAG_RING_SAMPLES; k++) {
      const a = (2 * Math.PI * k) / TAG_RING_SAMPLES;
      ring.push([taggedPos[0] + TAG_RING_RADIUS * Math.cos(a), taggedPos[1] + TAG_RING_RADIUS * Math.sin(a)]);
    }
    out.push({
      type: 'trajectory',
      id: 'tag-ring',
      points: ring,
      closed: true,
      width: TAG_RING_PX,
      opacity: ringOpacity,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 실제 빠르기 — 견줌 단계부터. 값은 스테이지 상수를 그대로 쓴다 ----
  if (tl.at('compare') > 0 && tagFade > 0) {
    out.push({
      type: 'readout',
      id: 'real-speed',
      anchor: { world: tickTo, offset: [0, SPEED_LABEL_GAP_PX] },
      text: text('label.realSpeed'),
      vars: { v: String(c.driftMmPerS) },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      opacity: tagFade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 전자 방향 표식 — 밀리는 동안만. 아래 변의 전자는 오른쪽으로 간다 ----
  const arrowOpacity = tl.at('close') * (1 - tl.at('release'));
  if (arrowOpacity > 0) {
    out.push({
      type: 'vector',
      id: 'electron-direction',
      from: [ELECTRON_ARROW_FROM[0], ELECTRON_ARROW_FROM[1]],
      delta: [ELECTRON_ARROW_LEN, 0],
      label: text('label.electron'),
      labelSide: 'ccw',
      width: DIRECTION_ARROW_PX,
      opacity: arrowOpacity,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

interface Spans {
  battery: readonly [number, number];
  lamp: readonly [number, number];
  lever: readonly [number, number];
  hinge: Vec2;
  leverDir: Vec2;
}

function inSpan(s: number, span: readonly [number, number]): boolean {
  return s >= span[0] && s <= span[1];
}

/**
 * 전자의 화면 자리 — 고리 위 자리 + 열운동 흔들림. 전지 속 · 전구 속에서는 그리지 않고,
 * 스위치 구간의 전자는 레버와 함께 들린다(틈에 떠 있으면 「끊겼는데 건너간다」 로 읽힌다).
 */
function carrierPlace(
  s: number,
  i: number,
  t: number,
  c: DriftVelocityConstants,
  spans: Spans,
): Vec2 | undefined {
  if (inSpan(s, spans.battery) || inSpan(s, spans.lamp)) return undefined;
  const [along, across] = thermalOffset(i, t, c);
  if (inSpan(s, spans.lever)) {
    const d = spans.leverDir;
    const f = s - spans.lever[0] + along;
    return [spans.hinge[0] + d[0] * f - d[1] * across, spans.hinge[1] + d[1] * f + d[0] * across];
  }
  const p = pointAt(s);
  return [
    p.pos[0] + p.dir[0] * along + p.inward[0] * across,
    p.pos[1] + p.dir[1] * along + p.inward[1] * across,
  ];
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
