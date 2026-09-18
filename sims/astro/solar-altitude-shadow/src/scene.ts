// ========================================================================
// solar-altitude-shadow — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽 판 — 땅 위 막대를 옆에서 본 그림. 햇빛 받는 땅 띠(빛 1) 위에 그림자(빛 없음),
// 태양 → 막대 끝 → 그림자 끝을 잇는 빛줄기 하나, 그림자 끝의 고도각 부채꼴, 이번 주기에
// 지나온 정박 고도의 그림자 끝 눈금과 「{alt}°」.
// 오른쪽 판 — 같은 폭의 햇빛 다발(띠 + 빛줄기 여섯)이 어두운 땅 띠에 닿는 자리. 닿는 땅의
// 밝기가 넓이당 받는 빛(sin α)이다. 곁에 「넓이당 햇빛」 막대와 지나온 정박 고도의 눈금.
// 캡션은 선언의 캡션 슬롯이 그린다.
//
// 밝기 — 태양 · 땅 띠 · 그림자 · 닿는 땅 · 다발은 테마와 무관한 **빛의 세기**로 칠한다(햇빛이
// 주장이다). 나머지(막대 · 선 · 막대그래프 · 글자)는 역할 색. 강조색은 「지금 고도」 하나에만
// 쓴다 — 고도각 부채꼴과 머무는 정박 고도의 글자.
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
  BEAM_LENGTH,
  BEAM_PANEL,
  BEAM_RAYS,
  GROUND_BAND,
  NIGHT_LIGHT,
  PER_AREA_BAR,
  SCENE_BOUNDS,
  SHADOW_PANEL,
  SUN_DISTANCE,
  SUN_R,
  text,
} from './schema';
import {
  anchors,
  footprintLength,
  holding,
  lightPerArea,
  reached,
  readConstants,
  shadowLength,
  altitudeNow,
  sunDirection,
  type AltitudeAnchor,
} from './physics';
import type { SolarAltitudeShadowState } from './state';

/** 선 굵기(화면 px). 위계라 배율을 따르지 않는다. */
const SUN_RAY_WIDTH_PX = 1.4;
const BEAM_RAY_WIDTH_PX = 1;
const TICK_WIDTH_PX = 1.5;
const ANGLE_RIM_PX = 1.5;
const BAR_FRAME_WIDTH_PX = 1;
/** 글자 크기(화면 px). */
const LABEL_FONT_PX = 13;
const SMALL_FONT_PX = 12;
/** 막대 굵기(월드). */
const STICK_W = 6;
/** 고도각 부채꼴 반지름(월드) · 채움 불투명도. */
const ANGLE_R = 34;
const ANGLE_FILL_OPACITY = 0.2;
/** 다발 띠 채움 불투명도 — 빛줄기가 비쳐 보이는 정도. */
const BEAM_FILL_OPACITY = 0.35;
/** 넓이당 햇빛 막대의 채움 불투명도. */
const BAR_FILL_OPACITY = 0.85;
/** 지나온 정박 고도(지금이 아닌 것) 눈금 · 글자의 불투명도. */
const GHOST_OPACITY = 0.55;
/** 그림자 끝 눈금이 땅 띠 아래로 내려가는 길이(월드). */
const TIP_TICK_DROP = 7;
/** 그림자 끝 고도 글자 · 「그림자」 글자를 땅선 아래로 내리는 거리(월드). */
const TIP_LABEL_DROP = 26;
const SHADOW_LABEL_DROP = 48;
/** 태양 이름표를 원판 위로 띄우는 거리(월드). */
const SUN_LABEL_LIFT = 13;
/** 막대 이름표를 막대 왼쪽으로 띄우는 거리(월드). */
const STICK_LABEL_GAP = 24;
/** 닿는 땅 치수선을 땅선 아래로 내리는 거리(월드). */
const FOOTPRINT_DIM_DROP = 34;
/** 다발 폭 치수선을 다발 끝에서 태양 쪽으로 띄우는 거리(월드). */
const CAP_DIM_GAP = 10;
/** 막대그래프 눈금이 막대 왼쪽으로 삐져나오는 길이 · 고도 글자 자리(월드). */
const BAR_TICK_OUT = 6;
const BAR_LABEL_GAP = 22;
/** 「넓이당 햇빛」 글자를 막대 틀 위로 띄우는 거리(월드). */
const BAR_TITLE_LIFT = 14;

function add(a: Vec2, b: readonly [number, number], k: number): Vec2 {
  return [a[0] + b[0] * k, a[1] + b[1] * k];
}

/** 땅선 아래 띠 한 칸 — x0 에서 x1 까지, 빛 세기 `light`. */
function groundBand(id: string, x0: number, x1: number, light: number): Primitive {
  return {
    type: 'region',
    id,
    points: [
      [x0, -GROUND_BAND],
      [x1, -GROUND_BAND],
      [x1, 0],
      [x0, 0],
    ],
    fillOpacity: 1,
    light,
  };
}

/** 정박 고도 글자 — 지금 머무는 것은 강조색, 지나온 것은 옅은 회색. */
function altitudeLabel(id: string, at: Vec2, a: AltitudeAnchor, current: boolean): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: text('label.altitude'),
    vars: { alt: String(a.deg) },
    chip: false,
    font: 'text',
    fontSize: SMALL_FONT_PX,
    weight: current ? 'bold' : 'normal',
    opacity: current ? 1 : GHOST_OPACITY,
    style: current ? { colorRole: 'accent', emphasis: 'strong' } : { colorRole: 'muted', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: SolarAltitudeShadowState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('solar-altitude-shadow: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  const alt = altitudeNow(timeline, c);
  const d = sunDirection(alt);
  const now = holding(timeline, c);
  const visited = anchors(c).filter((a) => reached(timeline, a));
  const out: Primitive[] = [];

  // ================= 왼쪽 판 — 막대와 그림자 =================
  const foot = SHADOW_PANEL.footX;
  const H = c.stickHeight;
  const tipX = foot + shadowLength(alt, H);
  const top: Vec2 = [foot, H];

  // 햇빛 받는 땅(빛 1) 위에 그림자(빛 없음). 다크에서는 밝은 띠의 끊긴 자리, 라이트에서는 검은 띠로 읽힌다.
  out.push(groundBand('lit-ground', SHADOW_PANEL.x0, SHADOW_PANEL.x1, 1));
  out.push(groundBand('shadow', foot, tipX, NIGHT_LIGHT));
  out.push({
    type: 'surface',
    id: 'ground-left',
    geometry: { kind: 'wall', from: [SHADOW_PANEL.x0, 0], to: [SHADOW_PANEL.x1, 0] },
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 지나온 정박 고도의 그림자 끝 — 눈금과 고도 글자. 지금 머무는 것은 강조색.
  const tipTicks: Vec2[][] = [];
  for (const a of visited) {
    const x = foot + shadowLength(a.deg, H);
    tipTicks.push([
      [x, 0],
      [x, -GROUND_BAND - TIP_TICK_DROP],
    ]);
    out.push(altitudeLabel(`tip-alt-${a.phase}`, [x, -TIP_LABEL_DROP], a, now?.phase === a.phase));
  }
  out.push({
    type: 'lineSet',
    id: 'tip-ticks',
    lines: tipTicks,
    width: TICK_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 막대 끝을 스치는 빛줄기 — 태양에서 그림자 끝까지.
  const sun = add(top, d, SUN_DISTANCE);
  out.push({
    type: 'trajectory',
    id: 'sun-ray',
    points: [sun, [tipX, 0]],
    width: SUN_RAY_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 고도각 — 그림자 끝에서 땅과 빛줄기 사이.
  out.push({
    type: 'sector',
    id: 'altitude-angle',
    center: [tipX, 0],
    radius: ANGLE_R,
    from: Math.PI - (alt * Math.PI) / 180,
    to: Math.PI,
    fillOpacity: ANGLE_FILL_OPACITY,
    rimWidth: ANGLE_RIM_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 막대.
  out.push({
    type: 'body',
    id: 'stick',
    pos: [foot, H / 2],
    shape: 'rect',
    size: [STICK_W, H],
    glow: false,
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'stick-label',
    anchor: { world: [foot - STICK_LABEL_GAP, H / 2] },
    text: text('label.stick'),
    chip: false,
    font: 'text',
    fontSize: SMALL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'shadow-label',
    anchor: { world: [(foot + tipX) / 2, -SHADOW_LABEL_DROP] },
    text: text('label.shadow'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 태양 — 가득 찬 빛. 라이트 바탕에 묻히지 않게 둘레는 선 색 (G92).
  out.push({
    type: 'body',
    id: 'sun',
    pos: sun,
    shape: 'circle',
    size: SUN_R,
    glow: false,
    outline: 'line',
    light: 1,
  });
  out.push({
    type: 'readout',
    id: 'sun-label',
    anchor: { world: [sun[0], sun[1] + SUN_R + SUN_LABEL_LIFT] },
    text: text('label.sun'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ================= 오른쪽 판 — 같은 폭의 햇빛 다발 =================
  const hit = BEAM_PANEL.hitX;
  const half = footprintLength(alt, c.beamWidth) / 2;
  const a0: Vec2 = [hit - half, 0];
  const b0: Vec2 = [hit + half, 0];
  // 다발 끝(태양 쪽)의 가로선은 다발에 수직이다 — 수직 방향 n = (sin α, cos α).
  const n: readonly [number, number] = [d[1], -d[0]];
  const capMid = add([hit, 0], d, BEAM_LENGTH);
  const capA = add(capMid, n, -c.beamWidth / 2);
  const capB = add(capMid, n, c.beamWidth / 2);

  // 다발 밖 땅은 어둡게 두고, 다발이 닿는 땅만 넓이당 받는 빛(sin α)만큼 밝힌다.
  out.push(groundBand('dark-ground', BEAM_PANEL.x0, BEAM_PANEL.x1, NIGHT_LIGHT));
  out.push(groundBand('lit-patch', a0[0], b0[0], lightPerArea(alt)));
  out.push({
    type: 'surface',
    id: 'ground-right',
    geometry: { kind: 'wall', from: [BEAM_PANEL.x0, 0], to: [BEAM_PANEL.x1, 0] },
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 다발 띠와 빛줄기 — 같은 수의 빛줄기가 땅에서 벌어진다.
  out.push({
    type: 'region',
    id: 'beam',
    points: [a0, b0, capB, capA],
    fillOpacity: BEAM_FILL_OPACITY,
    light: 1,
  });
  const rays: Vec2[][] = [];
  for (let k = 0; k < BEAM_RAYS; k++) {
    const s = k / (BEAM_RAYS - 1);
    rays.push([
      [capA[0] + (capB[0] - capA[0]) * s, capA[1] + (capB[1] - capA[1]) * s],
      [a0[0] + (b0[0] - a0[0]) * s, 0],
    ]);
  }
  out.push({
    type: 'lineSet',
    id: 'beam-rays',
    lines: rays,
    width: BEAM_RAY_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 다발의 폭 — 늘 같다. 닿는 땅의 길이 — 해가 낮을수록 길다.
  out.push({
    type: 'dimension',
    id: 'beam-width',
    from: add(capA, d, CAP_DIM_GAP),
    to: add(capB, d, CAP_DIM_GAP),
    text: text('label.sameWidth'),
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'dimension',
    id: 'lit-length',
    from: [a0[0], -FOOTPRINT_DIM_DROP],
    to: [b0[0], -FOOTPRINT_DIM_DROP],
    text: text('label.litGround'),
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 넓이당 햇빛 막대 — 해가 머리 위일 때의 높이를 틀로 두고, 지금 sin α 만큼 찬다.
  const bx0 = PER_AREA_BAR.x - PER_AREA_BAR.w / 2;
  const bx1 = PER_AREA_BAR.x + PER_AREA_BAR.w / 2;
  const fill = PER_AREA_BAR.full * lightPerArea(alt);
  out.push({
    type: 'region',
    id: 'per-area-bar',
    points: [
      [bx0, 0],
      [bx1, 0],
      [bx1, fill],
      [bx0, fill],
    ],
    fillOpacity: BAR_FILL_OPACITY,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'per-area-frame',
    points: [
      [bx0, 0],
      [bx1, 0],
      [bx1, PER_AREA_BAR.full],
      [bx0, PER_AREA_BAR.full],
    ],
    closed: true,
    width: BAR_FRAME_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const barTicks: Vec2[][] = [];
  for (const a of visited) {
    const y = PER_AREA_BAR.full * lightPerArea(a.deg);
    barTicks.push([
      [bx0 - BAR_TICK_OUT, y],
      [bx1, y],
    ]);
    out.push(altitudeLabel(`bar-alt-${a.phase}`, [bx0 - BAR_LABEL_GAP, y], a, now?.phase === a.phase));
  }
  out.push({
    type: 'lineSet',
    id: 'bar-ticks',
    lines: barTicks,
    width: TICK_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'per-area-title',
    anchor: { world: [PER_AREA_BAR.x, PER_AREA_BAR.full + BAR_TITLE_LIFT] },
    text: text('label.perArea'),
    chip: false,
    font: 'text',
    fontSize: SMALL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
