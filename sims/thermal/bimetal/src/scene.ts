// ========================================================================
// bimetal — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
//   곧은 자리      trajectory(점선)  — 실온의 띠 윤곽. 휜 띠가 어디서 벗어났는지 재는 자리
//   황동 장        region(hatch)     — 위 장. 휜 호를 표본한 다각형
//   강철 장        region            — 아래 장. 같은 먹색, 결(빗금 없음)과 이름표로 가른다
//   물림쇠         body(rect)        — 띠의 한 끝을 문다. 움직이지 않는다
//   이름표         readout ×2        — 황동 · 강철. 띠를 따라 움직인다
//   온도계         region 셋 + body  — 관 바탕 · 채움(높이 = 온도) · 둘레, 아래 알뿌리
//   눈금 글자      lineSet + readout — 선언한 세 온도만
//   과장 배율 알림 readout           — 휜 정도를 몇 배로 키웠는지
//   캡션           BundleSchema.caption 슬롯
//
// ---- 색은 뜻마다 하나다 ----
//   ink     띠 — 두 장이 같은 색이다(결과 이름표만 다르다). 역할색 범례를 쓰지 않는다
//   accent  온도의 높이 — 온도계 채움과 알뿌리
//   muted   물건과 자 — 곧은 자리 점선 · 물림쇠 · 관 둘레 · 눈금 · 글자
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
import { bendAngle, readConstants, tempAt, type BimetalConstants } from './physics';
import {
  BULB_R,
  CLAMP_BOTTOM,
  CLAMP_TOP,
  CLAMP_W,
  LAYER_WORLD,
  NAME_AT,
  NOTE_POS,
  SCENE_BOUNDS,
  STRIP_WORLD,
  THERMO_BOTTOM,
  THERMO_TOP,
  THERMO_WIDTH,
  THERMO_X,
  text,
} from './schema';
import type { BimetalState } from './state';

/** 띠 한 장의 호를 표본하는 점 수. 휜 각이 커도 모서리가 보이지 않을 만큼. */
const STRIP_SAMPLES = 48;
/** 휜 각이 이보다 작으면(라디안) 곧은 띠로 계산한다 — 0 으로 나누지 않게. */
const STRAIGHT_EPS = 1e-6;
/** 띠 채움의 짙기. 빗금(바탕색 사선)이 또렷이 보일 만큼 짙다. */
const STRIP_FILL = 0.85;
/** 곧은 자리 점선 · 관 둘레 · 눈금 굵기(화면 px). */
const THIN_WIDTH = 1;
/** 물림쇠 불투명도. 물건이라 옅다. */
const CLAMP_OPACITY = 0.8;
/** 온도계 채움의 짙기와 관 바탕의 옅기. */
const TUBE_FILL = 0.85;
const TUBE_BG = 0.06;
/** 알뿌리 중심을 관 아래 끝에서 내리는 몫(반지름에 대한 비). 관과 알뿌리가 이어져 보인다. */
const BULB_DROP = 0.7;
/** 눈금 짧은 선의 길이(월드). */
const TICK_LEN = 0.1;
/** 눈금 글자 · 이름표 · 알림 글자 크기(화면 px). */
const TICK_LABEL_PX = 12;
const NAME_PX = 13;
const NOTE_PX = 11;
/** 눈금 글자를 눈금에서, 이름표를 띠 면에서 띄우는 거리(화면 px). */
const LABEL_GAP = 6;
const NAME_GAP = 11;

const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const CLAMP = { colorRole: 'muted', emphasis: 'medium' } as const;
const STRIP = { colorRole: 'ink', emphasis: 'strong' } as const;
const HEAT_LEVEL = { colorRole: 'accent', emphasis: 'strong' } as const;

function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

/** 온도(℃) → 온도계 채움 높이(월드 y). */
function thermoY(temp: number, c: BimetalConstants): number {
  const f = (temp - c.axisMin) / (c.axisMax - c.axisMin);
  return THERMO_BOTTOM + Math.min(1, Math.max(0, f)) * (THERMO_TOP - THERMO_BOTTOM);
}

/**
 * 두 장이 맞붙은 면 위, 물린 끝에서 호 길이 s 인 점과 그 자리의 위쪽 법선.
 * 곡률 k(월드) > 0 이면 곡률 중심이 아래 — 위 장(황동)이 바깥이다.
 */
function bondAt(s: number, k: number): { p: Vec2; n: Vec2 } {
  if (Math.abs(k) < STRAIGHT_EPS) return { p: [s, 0], n: [0, 1] };
  const a = k * s;
  return {
    p: [Math.sin(a) / k, -(1 - Math.cos(a)) / k],
    n: [Math.sin(a), Math.cos(a)],
  };
}

/** 맞붙은 면에서 법선 방향으로 `h` 만큼 떨어진 점. */
function offset(b: { p: Vec2; n: Vec2 }, h: number): Vec2 {
  return [b.p[0] + b.n[0] * h, b.p[1] + b.n[1] * h];
}

export function scene(params: {
  state: BimetalState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('bimetal: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  const temp = tempAt(tl, c);
  // 휜 각은 호 길이에 곡률을 곱한 것 — 그린 띠 길이로 나눠 월드 곡률을 얻는다.
  const k = bendAngle(temp, c) / STRIP_WORLD;

  // ---- 곧은 자리 ----
  // 실온의 띠 윤곽. 휜 띠 아래에 깔려, 곧을 때는 가려지고 휘면 드러난다.
  out.push({
    type: 'trajectory',
    id: 'straight-ghost',
    points: rect(0, -LAYER_WORLD, STRIP_WORLD, LAYER_WORLD),
    closed: true,
    width: THIN_WIDTH,
    style: { ...MUTED, lineStyle: 'dashed' },
  });

  // ---- 두 장 ----
  // 맞붙은 면을 표본하고 위(황동) · 아래(강철)로 한 장 두께만큼 띄운다.
  const bonds = Array.from({ length: STRIP_SAMPLES + 1 }, (_, i) =>
    bondAt((i / STRIP_SAMPLES) * STRIP_WORLD, k),
  );
  const bondLine = bonds.map((b) => b.p);
  const topLine = bonds.map((b) => offset(b, LAYER_WORLD));
  const bottomLine = bonds.map((b) => offset(b, -LAYER_WORLD));
  out.push({
    type: 'region',
    id: 'steel',
    points: [...bottomLine, ...[...bondLine].reverse()],
    opaque: true,
    fillOpacity: STRIP_FILL,
    style: STRIP,
  });
  out.push({
    type: 'region',
    id: 'brass',
    points: [...bondLine, ...[...topLine].reverse()],
    opaque: true,
    fillOpacity: STRIP_FILL,
    fill: 'hatch',
    style: STRIP,
  });

  // ---- 물림쇠 ----
  out.push({
    type: 'body',
    id: 'clamp',
    shape: 'rect',
    pos: [-CLAMP_W / 2, (CLAMP_BOTTOM + CLAMP_TOP) / 2],
    size: [CLAMP_W, CLAMP_TOP - CLAMP_BOTTOM],
    opacity: CLAMP_OPACITY,
    style: CLAMP,
  });

  // ---- 이름표 ----
  // 띠를 따라 움직인다 — 황동은 위 면 위, 강철은 아래 면 아래.
  const nameAt = bondAt(NAME_AT * STRIP_WORLD, k);
  out.push({
    type: 'readout',
    id: 'name-brass',
    anchor: { world: offset(nameAt, LAYER_WORLD), offset: [0, -NAME_GAP] },
    text: text('label.brass'),
    chip: false,
    font: 'text',
    fontSize: NAME_PX,
    align: 'center',
    style: MUTED,
  });
  out.push({
    type: 'readout',
    id: 'name-steel',
    anchor: { world: offset(nameAt, -LAYER_WORLD), offset: [0, NAME_GAP] },
    text: text('label.steel'),
    chip: false,
    font: 'text',
    fontSize: NAME_PX,
    align: 'center',
    style: MUTED,
  });

  // ---- 과장 배율 알림 ----
  out.push({
    type: 'readout',
    id: 'exaggeration-note',
    anchor: { world: NOTE_POS },
    text: text('label.exaggeration'),
    vars: { x: state.exaggerationText },
    chip: false,
    font: 'text',
    fontSize: NOTE_PX,
    align: 'center',
    style: MUTED,
  });

  // ---- 온도계 ----
  const tx0 = THERMO_X - THERMO_WIDTH / 2;
  const tx1 = THERMO_X + THERMO_WIDTH / 2;
  const bulbY = THERMO_BOTTOM - BULB_R * BULB_DROP;
  out.push({
    type: 'region',
    id: 'thermo-bg',
    points: rect(tx0, THERMO_BOTTOM, tx1, THERMO_TOP),
    opaque: true,
    fillOpacity: TUBE_BG,
    style: MUTED,
  });
  out.push({
    type: 'body',
    id: 'thermo-bulb',
    shape: 'circle',
    pos: [THERMO_X, bulbY],
    size: BULB_R,
    glow: false,
    style: HEAT_LEVEL,
  });
  out.push({
    type: 'region',
    id: 'thermo-fill',
    points: rect(tx0, bulbY, tx1, thermoY(temp, c)),
    fillOpacity: TUBE_FILL,
    style: HEAT_LEVEL,
  });
  out.push({
    type: 'region',
    id: 'thermo-rim',
    points: rect(tx0, THERMO_BOTTOM, tx1, THERMO_TOP),
    fillOpacity: 0,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: MUTED,
  });

  // ---- 눈금: 선언한 세 온도 ----
  const ticks: { id: string; temp: number; label: string }[] = [
    { id: 'cold', temp: c.tCold, label: state.coldText },
    { id: 'room', temp: c.tRoom, label: state.roomText },
    { id: 'hot', temp: c.tHot, label: state.hotText },
  ];
  out.push({
    type: 'lineSet',
    id: 'thermo-ticks',
    lines: ticks.map((t): Vec2[] => [
      [tx0 - TICK_LEN, thermoY(t.temp, c)],
      [tx0, thermoY(t.temp, c)],
    ]),
    width: THIN_WIDTH,
    style: MUTED,
  });
  for (const t of ticks) {
    out.push({
      type: 'readout',
      id: `tick-${t.id}`,
      anchor: { world: [tx0 - TICK_LEN, thermoY(t.temp, c)], offset: [-LABEL_GAP, 0] },
      text: text('label.temp'),
      vars: { t: t.label },
      chip: false,
      font: 'mono',
      fontSize: TICK_LABEL_PX,
      align: 'right',
      style: MUTED,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
