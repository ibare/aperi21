// ========================================================================
// earth-rotation-day-night — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽 — 햇빛(lineSet) · 북극 위에서 본 지구(sector 반쪽 둘, 빛 세기 `light`) · 함께 도는
// 경선 살(lineSet) · 가장자리의 관측자(trajectory 몸 + body 머리) · 자전 화살(sector 호 + vector 촉).
// 오른쪽 — 관측자가 겪은 빛을 한 바퀴 길이로 편 띠(scalarField `light`) · 눈금 · 치수선.
// 캡션은 선언의 캡션 슬롯이 그린다.
//
// 밝기 — 낮 반쪽 · 밤 반쪽 · 띠는 테마와 무관한 **빛의 세기**로 칠한다(밝기가 주장이다).
// 빛이 아닌 것(살 · 윤곽 · 글자 · 화살)은 역할 색이고, 강조색은 관측자 하나에만 쓴다 —
// 지구 위의 관측자와 띠 위의 「지금」 은 같은 대상이다.
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
  EARTH,
  NIGHT_LIGHT,
  MERIDIAN_COUNT,
  OBSERVER,
  RAYS,
  SCENE_BOUNDS,
  SPIN_ARROW,
  STRIP,
  STRIP_CURSOR_OVERHANG,
  STRIP_DIMENSION_Y,
  STRIP_HALF_LABEL_Y,
  STRIP_TICK,
  STRIP_TITLE_Y,
  SUN_ANGLE,
  earthRotationDayNightSchema,
  text,
} from './schema';
import { SUNSET_FRACTION, angleAt, readConstants, stripValues, turnFraction } from './physics';
import type { EarthRotationDayNightState } from './state';

/** 선 굵기(화면 px). 위계라 배율을 따르지 않는다. */
const RAY_WIDTH_PX = 1.2;
const MERIDIAN_WIDTH_PX = 1;
const OUTLINE_WIDTH_PX = 1;
const OBSERVER_WIDTH_PX = 3;
const SPIN_ARROW_WIDTH_PX = 2;
const CURSOR_WIDTH_PX = 2.5;
const TICK_WIDTH_PX = 1;
/** 글자 크기(화면 px). */
const LABEL_FONT_PX = 13;
const SMALL_FONT_PX = 12;
/** 북극 점의 크기(월드). */
const POLE_R = 2.5;

const HALF = Math.PI / 2;

/** 중심 · 반지름 · 각으로 원 위 점. */
function onCircle(cx: number, cy: number, r: number, a: number): Vec2 {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

/** 띠에서 몫 f 의 가로 자리. */
function stripX(f: number): number {
  return STRIP.x0 + (STRIP.x1 - STRIP.x0) * f;
}

/**
 * 햇빛 줄무늬 — 왼쪽(태양 쪽)에서 오른쪽으로 흐르는 짧은 가로 획.
 * 지구의 원판을 가로지르는 줄은 지구 표면에서, 나머지는 지구 가운데 가로 자리에서 멈춘다 —
 * 햇빛이 지구에 닿는 곳까지만 긋는다.
 */
function rayLines(t: number): Vec2[][] {
  const shift = (t * RAYS.speed) % RAYS.pitch;
  const lines: Vec2[][] = [];
  for (let y = RAYS.yFrom; y <= RAYS.yTo; y += RAYS.rowStep) {
    const dy = y - EARTH.cy;
    const xMax =
      Math.abs(dy) < EARTH.R
        ? EARTH.cx - Math.sqrt(EARTH.R * EARTH.R - dy * dy) - RAYS.surfaceGap
        : EARTH.cx;
    const stagger = (Math.round(y / RAYS.rowStep) % 2) * RAYS.stagger;
    for (let x = RAYS.xMin - RAYS.pitch; x < xMax + RAYS.pitch; x += RAYS.pitch) {
      const x0 = x + shift + stagger;
      const a = Math.max(RAYS.xMin, x0);
      const b = Math.min(xMax, x0 + RAYS.dash);
      if (b > a) lines.push([[a, y], [b, y]]);
    }
  }
  return lines;
}

export function scene(params: {
  state: EarthRotationDayNightState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('earth-rotation-day-night: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  const f = turnFraction(timeline);
  const phi = angleAt(f, c);
  const out: Primitive[] = [];

  // ---- 햇빛 — 흐름은 시각의 함수 ----
  out.push({
    type: 'lineSet',
    id: 'sunlight',
    lines: rayLines(timeline.t - (earthRotationDayNightSchema.startAt ?? 0)),
    width: RAY_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });
  out.push({
    type: 'readout',
    id: 'sunlight-label',
    anchor: { world: [RAYS.xMin + 80, RAYS.yTo + 12] },
    text: text('label.sunlight'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 지구 — 햇빛 반쪽 · 그늘 반쪽은 태양 쪽에 고정. 돌지 않는다 ----
  const center: Vec2 = [EARTH.cx, EARTH.cy];
  out.push({
    type: 'sector',
    id: 'earth-night',
    center,
    radius: EARTH.R,
    from: SUN_ANGLE + HALF,
    to: SUN_ANGLE + 3 * HALF,
    fillOpacity: 1,
    rimWidth: 0,
    light: NIGHT_LIGHT,
  });
  out.push({
    type: 'sector',
    id: 'earth-day',
    center,
    radius: EARTH.R,
    from: SUN_ANGLE - HALF,
    to: SUN_ANGLE + HALF,
    fillOpacity: 1,
    rimWidth: 0,
    light: 1,
  });

  // ---- 경선 살 — 지구와 함께 돈다. 관측자는 그중 한 살 끝에 서 있다 ----
  const spokes: Vec2[][] = [];
  for (let k = 0; k < MERIDIAN_COUNT; k++) {
    const a = phi + (k * Math.PI) / MERIDIAN_COUNT;
    spokes.push([onCircle(EARTH.cx, EARTH.cy, EARTH.R, a), onCircle(EARTH.cx, EARTH.cy, EARTH.R, a + Math.PI)]);
  }
  out.push({
    type: 'lineSet',
    id: 'meridians',
    lines: spokes,
    width: MERIDIAN_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // 둘레 — 빛이 아니다. 라이트 테마에서 가득 찬 빛(흰색)이 미색 바탕에 묻히므로 역할 색 윤곽으로 원을 잡는다 (G92).
  out.push({
    type: 'sector',
    id: 'earth-outline',
    center,
    radius: EARTH.R,
    from: 0,
    to: 2 * Math.PI,
    fillOpacity: 0,
    rimWidth: OUTLINE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'north-pole',
    pos: center,
    shape: 'circle',
    size: POLE_R,
    glow: false,
    outline: 'none',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 관측자 — 가장자리에 선 사람. 강조색은 이 대상 하나에만 ----
  out.push({
    type: 'trajectory',
    id: 'observer-body',
    points: [
      onCircle(EARTH.cx, EARTH.cy, EARTH.R + OBSERVER.footGap, phi),
      onCircle(EARTH.cx, EARTH.cy, EARTH.R + OBSERVER.bodyTo, phi),
    ],
    width: OBSERVER_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'observer-head',
    pos: onCircle(EARTH.cx, EARTH.cy, EARTH.R + OBSERVER.headAt, phi),
    shape: 'circle',
    size: OBSERVER.headR,
    glow: false,
    outline: 'none',
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 자전 화살 — 굽은 호 + 끝의 촉. 방향은 스테이지 상수 spin 을 따른다 ----
  const [arcFrom, arcTo] = c.spin > 0 ? [SPIN_ARROW.from, SPIN_ARROW.to] : [SPIN_ARROW.to, SPIN_ARROW.from];
  out.push({
    type: 'sector',
    id: 'spin-arc',
    center,
    radius: SPIN_ARROW.radius,
    from: arcFrom,
    to: arcTo,
    fillOpacity: 0,
    rimWidth: SPIN_ARROW_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });
  // 촉 — 호 끝에서 접선 방향. 호 끝 조금 앞에서 출발해 끝에 닿는다.
  const tip = onCircle(EARTH.cx, EARTH.cy, SPIN_ARROW.radius, arcTo);
  const tangent: Vec2 = [-Math.sin(arcTo) * c.spin, Math.cos(arcTo) * c.spin];
  out.push({
    type: 'vector',
    id: 'spin-head',
    from: [tip[0] - tangent[0] * SPIN_ARROW.headLen, tip[1] - tangent[1] * SPIN_ARROW.headLen],
    delta: [tangent[0] * SPIN_ARROW.headLen, tangent[1] * SPIN_ARROW.headLen],
    width: SPIN_ARROW_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });
  out.push({
    type: 'readout',
    id: 'spin-label',
    anchor: { world: onCircle(EARTH.cx, EARTH.cy, SPIN_ARROW.labelRadius, (SPIN_ARROW.from + SPIN_ARROW.to) / 2) },
    text: text('label.spin'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });

  // ---- 지구 칸 이름 ----
  out.push({
    type: 'readout',
    id: 'name-top',
    anchor: { world: [EARTH.cx, 18] },
    text: text('label.topView'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 관측자가 겪는 낮과 밤 — 한 바퀴를 띠 하나로 ----
  const top = STRIP.cy + STRIP.h / 2;
  const bottom = STRIP.cy - STRIP.h / 2;
  out.push({
    type: 'scalarField',
    id: 'strip',
    min: [STRIP.x0, bottom],
    max: [STRIP.x1, top],
    cols: STRIP.cells,
    rows: 1,
    values: stripValues(f, STRIP.cells, c),
    range: [0, 1],
    colors: 'light',
  });
  out.push({
    type: 'trajectory',
    id: 'strip-outline',
    points: [
      [STRIP.x0, bottom],
      [STRIP.x1, bottom],
      [STRIP.x1, top],
      [STRIP.x0, top],
    ],
    closed: true,
    width: OUTLINE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 해 뜸 · 해 짐 · 다시 해 뜸 눈금.
  const ticks: { f: number; key: 'label.sunrise' | 'label.sunset'; id: string }[] = [
    { f: 0, key: 'label.sunrise', id: 'tick-sunrise' },
    { f: SUNSET_FRACTION, key: 'label.sunset', id: 'tick-sunset' },
    { f: 1, key: 'label.sunrise', id: 'tick-sunrise-next' },
  ];
  out.push({
    type: 'lineSet',
    id: 'strip-ticks',
    lines: ticks.map((k) => [
      [stripX(k.f), bottom],
      [stripX(k.f), bottom - STRIP_TICK.len],
    ]),
    width: TICK_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  for (const k of ticks) {
    out.push({
      type: 'readout',
      id: k.id,
      anchor: { world: [stripX(k.f), STRIP_TICK.labelY] },
      text: text(k.key),
      chip: false,
      font: 'text',
      fontSize: SMALL_FONT_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 낮 · 밤 이름표 — 두 반 바퀴의 가운데 위.
  out.push({
    type: 'readout',
    id: 'strip-day',
    anchor: { world: [stripX(SUNSET_FRACTION / 2), STRIP_HALF_LABEL_Y] },
    text: text('label.day'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });
  out.push({
    type: 'readout',
    id: 'strip-night',
    anchor: { world: [stripX((SUNSET_FRACTION + 1) / 2), STRIP_HALF_LABEL_Y] },
    text: text('label.night'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });
  out.push({
    type: 'readout',
    id: 'strip-title',
    anchor: { world: [(STRIP.x0 + STRIP.x1) / 2, STRIP_TITLE_Y] },
    text: text('label.stripTitle'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 지금 — 띠 위의 관측자. 지구 위의 관측자와 같은 대상이라 같은 강조색이다.
  const xNow = stripX(f);
  out.push({
    type: 'trajectory',
    id: 'strip-now',
    points: [
      [xNow, bottom - STRIP_CURSOR_OVERHANG],
      [xNow, top + STRIP_CURSOR_OVERHANG],
    ],
    width: CURSOR_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 한 바퀴 = 하루.
  out.push({
    type: 'dimension',
    id: 'one-turn',
    from: [STRIP.x0, STRIP_DIMENSION_Y],
    to: [STRIP.x1, STRIP_DIMENSION_Y],
    text: text('label.oneTurn'),
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
