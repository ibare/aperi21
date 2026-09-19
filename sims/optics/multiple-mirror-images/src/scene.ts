// ========================================================================
// multiple-mirror-images — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 거울(opticalElement) · 상이 놓이는
// 원(trajectory) · 두 거울 사이 각(sector) · 깃발 물체와 상(body custom) · 두 번 꺾인 줄기(ray,
// plugin-optics `traceRay` 로 추적) · 거꾸로 이은 점선(trajectory) · 눈(region + trajectory + body) ·
// 각도 · 개수 · 이름표(readout).
//
// 색은 뜻마다 하나다 — 빛은 plugin 이 정한 강조색 하나(`ray`), 물체와 상은 같은 대상이라 같은
// primary(물체는 채움, 상은 속 빈 윤곽), 거꾸로 이은 선 · 눈 · 개수는 먹, 원 · 각 · 이름표는 배경
// 정보라 muted. 한 번 꺾인 상과 두 번 꺾인 상을 색으로 가르지 않는다 — 깃폭이 뻗는 쪽이 가른다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  OpticalElement,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { traceRay } from '@aperi21/plugin-optics';
import { apply, heldSet, imageMaps, meet, mirrorDeg, mirrorDirections, readConstants, reflection } from './physics';
import {
  ANGLE_LABEL_R,
  ARC_R,
  COUNT_POS,
  EYE_HALF_H,
  EYE_HALF_W,
  EYE_POS,
  FLAG_CLOTH_H,
  FLAG_H,
  FLAG_POLE_W,
  FLAG_REACH,
  IRIS_R,
  MIRROR_LEN,
  OBJECT_LABEL_GAP,
  PUPIL_R,
  RING_R,
  SCENE_BOUNDS,
  TRACED_TURN,
  text,
} from './schema';
import type { MultipleMirrorImagesState } from './state';

/** 상이 놓이는 원 — 점선 굵기(화면 px) · 불투명도 · 표본 수 (원 어휘가 없다 — G28). */
const RING_WIDTH_PX = 1;
const RING_OPACITY = 0.7;
const RING_SAMPLES = 96;
/** 거꾸로 이은 점선 굵기(화면 px) · 불투명도. 빛(1.5 px 강조색 실선)과 모양으로 갈린다. */
const TRACE_WIDTH_PX = 1.5;
const TRACE_OPACITY = 0.85;
/** 각 부채꼴의 채움 불투명도 · 호 굵기(화면 px). */
const ARC_FILL_OPACITY = 0.12;
const ARC_RIM_PX = 1.25;
/** 눈동자 테 굵기(화면 px) · 눈 아몬드꼴 표본 수(한 변) · 눈동자 테 표본 수 (G28). */
const EYE_LINE_PX = 1.5;
const EYE_SAMPLES = 20;
const IRIS_SAMPLES = 32;
/** 글자 크기(화면 px) — 개수 표식 · 각도 표식 · 이름표. */
const COUNT_PX = 18;
const ANGLE_PX = 13;
const NAME_PX = 12;
/** 빛의 길을 보이는 동안 나머지 상의 불투명도 — 고른 상 하나가 앞으로 나온다. */
const OTHERS_OPACITY = 0.3;

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const guide = { colorRole: 'muted', emphasis: 'strong' } as const;
const thing = { colorRole: 'primary', emphasis: 'strong' } as const;

const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];
const dist = (a: Vec2, b: Vec2): number => Math.hypot(a[0] - b[0], a[1] - b[1]);
const unit = (a: number): Vec2 => [Math.cos(a), Math.sin(a)];

/** 물체 자리 — 두 거울 사이를 가르는 선(+y) 위, 꼭짓점에서 원 반지름만큼. */
const OBJECT_POS: Vec2 = [0, RING_R];

/**
 * 깃발 윤곽 — 물체 가운데에서 잰 월드 오프셋. 깃대가 +y(꼭짓점 바깥)로 서고 깃폭이 +x 로 뻗는다.
 * 상은 이 오프셋에 상의 변환을 그대로 건다(꼭짓점이 원점이라 선형이다).
 */
const FLAG_OUTLINE: readonly Vec2[] = [
  [-FLAG_POLE_W / 2, -FLAG_H / 2],
  [FLAG_POLE_W / 2, -FLAG_H / 2],
  [FLAG_POLE_W / 2, FLAG_H / 2 - FLAG_CLOTH_H],
  [FLAG_POLE_W / 2 + FLAG_REACH, FLAG_H / 2 - FLAG_CLOTH_H / 2],
  [FLAG_POLE_W / 2, FLAG_H / 2],
  [-FLAG_POLE_W / 2, FLAG_H / 2],
];

function flagPath(points: readonly Vec2[]): string {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ') + ' Z';
}

/** 꼭짓점에서 방향 `dir` 로 뻗은 평면거울. 법선 `normal` 이 두 거울 사이(물체 쪽)를 향한다. */
function mirror(id: string, dir: number, normal: number): OpticalElement {
  const [ux, uy] = unit(dir);
  return {
    type: 'opticalElement',
    id,
    subtype: 'mirror-flat',
    pos: [(ux * MIRROR_LEN) / 2, (uy * MIRROR_LEN) / 2],
    orientation: normal,
    size: MIRROR_LEN,
  };
}

/** 폴리라인을 앞에서부터 길이 비율 `g` 만큼만 남긴다 — 빛이 나아가는 중. */
function truncate(points: readonly Vec2[], g: number): Vec2[] {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += dist(points[i - 1]!, points[i]!);
  let left = total * g;
  const out: Vec2[] = [points[0]!];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const d = dist(a, b);
    if (left >= d) {
      out.push(b);
      left -= d;
      continue;
    }
    const s = d > 0 ? left / d : 0;
    out.push([a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s]);
    break;
  }
  return out;
}

export function scene(params: {
  state: MultipleMirrorImagesState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('multiple-mirror-images: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const deg = mirrorDeg(tl, c);
  const { right, left } = mirrorDirections(deg);
  const mirrors = [mirror('mirror-right', right, right + Math.PI / 2), mirror('mirror-left', left, left - Math.PI / 2)];
  const held = heldSet(tl, c);
  const out: Primitive[] = [];

  // ---- 상이 놓이는 원 — 꼭짓점 둘레, 물체를 지나는 ----
  const ring: Vec2[] = [];
  for (let i = 0; i < RING_SAMPLES; i++) {
    const [x, y] = unit((2 * Math.PI * i) / RING_SAMPLES);
    ring.push([x * RING_R, y * RING_R]);
  }
  out.push({
    type: 'trajectory',
    id: 'ring',
    points: ring,
    closed: true,
    width: RING_WIDTH_PX,
    opacity: RING_OPACITY,
    style: { ...guide, lineStyle: 'dashed' },
  });

  // ---- 두 거울 사이 각 — 부채꼴은 늘 있고, 각도 글자는 멈춘 각(선언값)에서만 ----
  out.push({
    type: 'sector',
    id: 'angle-arc',
    center: [0, 0],
    radius: ARC_R,
    from: right,
    to: left,
    fillOpacity: ARC_FILL_OPACITY,
    rimWidth: ARC_RIM_PX,
    style: guide,
  });
  out.push(...mirrors);
  if (held) {
    out.push({
      type: 'readout',
      id: 'angle-label',
      anchor: { world: [0, ANGLE_LABEL_R] },
      text: text('label.angle'),
      vars: { deg: String(held.deg) },
      chip: false,
      font: 'text',
      fontSize: ANGLE_PX,
      opacity: held.opacity,
      style: guide,
    });
  }

  // ---- 두 번 꺾인 빛의 길 — 첫 멈춤(A)에서만 ----
  // 고른 상은 꼭짓점 둘레 회전 한 번(2θ) — 오른쪽 거울에서 꺾이고 왼쪽 거울에서 또 꺾인 빛이 만든다.
  // 겨눔은 펼쳐서 고른다: 눈에서 상으로 그은 선이 왼쪽 거울과 만나는 점, 거기서 오른쪽 거울 속 상
  // (한 번 꺾인 상)으로 그은 선이 오른쪽 거울과 만나는 점. 꺾인 뒤의 길은 `traceRay` 가 돌려준다.
  const maps = imageMaps(c.angleA);
  const tracedMap = maps.find((m) => m.turn === TRACED_TURN && !m.flipped)!;
  const tracedImage = apply(tracedMap.map, OBJECT_POS);
  const onceImage = apply(reflection(mirrorDirections(c.angleA).right), OBJECT_POS);
  const pathOn = tl.phase === 'traceA' || tl.phase === 'pathA';
  const sightOn = tl.at('pathA') > 0 && tl.at('hideA') < 1;
  const eyeOn = tl.at('traceA') > 0 && tl.at('hideA') < 1;
  // 빛의 길을 보이는 동안(traceA ~ hideA) 나머지 상이 물러난다. `appearB` 뒤에는 둘 다 1 이라 0 이다.
  const dimAmt = tl.at('traceA') - tl.at('appearB');

  if (eyeOn) {
    const eyeOpacity = 1 - tl.at('hideA');
    if (sightOn || pathOn) {
      const aimL = unit(mirrorDirections(c.angleA).left);
      const aimR = unit(mirrorDirections(c.angleA).right);
      const p2 = meet(EYE_POS, sub(tracedImage, EYE_POS), [0, 0], aimL);
      const p1 = p2 ? meet(p2, sub(onceImage, p2), [0, 0], aimR) : null;
      if (p1 && p2) {
        const length = dist(OBJECT_POS, p1) + dist(p1, p2) + dist(p2, EYE_POS);
        const r = traceRay(OBJECT_POS, sub(p1, OBJECT_POS), mirrors, { maxBounces: 2, maxLength: length });
        const hit2 = r.segments[2];
        if (sightOn && hit2) {
          out.push({
            type: 'trajectory',
            id: 'sight',
            points: [hit2, tracedImage],
            width: TRACE_WIDTH_PX,
            opacity: TRACE_OPACITY * eyeOpacity,
            style: { ...ink, lineStyle: 'dashed' },
          });
        }
        if (pathOn) {
          // 다 그은 다리는 촉이 가운데 오도록 두 토막(G217), 자라는 중인 끝 다리는 끝에 촉.
          const g = tl.at('traceA');
          const grown = truncate(r.segments, g);
          for (let i = 1; i < grown.length; i++) {
            const a = grown[i - 1]!;
            const b = grown[i]!;
            const growing = g < 1 && i === grown.length - 1;
            if (growing) {
              out.push({ type: 'ray', id: `light-${i}`, segments: [a, b], showArrow: true });
              continue;
            }
            const m: Vec2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
            out.push(
              { type: 'ray', id: `light-${i}-a`, segments: [a, m], showArrow: true },
              { type: 'ray', id: `light-${i}-b`, segments: [m, b] },
            );
          }
        }
      }
    }

    // 눈 — 바탕색으로 덮어 줄기 끝이 눈 안으로 들어간 것으로 읽힌다.
    const eyePts: Vec2[] = [];
    for (let i = 0; i <= EYE_SAMPLES; i++) {
      const k = -1 + (2 * i) / EYE_SAMPLES;
      eyePts.push([EYE_POS[0] + EYE_HALF_W * k, EYE_POS[1] + EYE_HALF_H * (1 - k * k)]);
    }
    for (let i = EYE_SAMPLES - 1; i >= 1; i--) {
      const k = -1 + (2 * i) / EYE_SAMPLES;
      eyePts.push([EYE_POS[0] + EYE_HALF_W * k, EYE_POS[1] - EYE_HALF_H * (1 - k * k)]);
    }
    const iris: Vec2[] = [];
    for (let i = 0; i < IRIS_SAMPLES; i++) {
      const [x, y] = unit((2 * Math.PI * i) / IRIS_SAMPLES);
      iris.push([EYE_POS[0] + IRIS_R * x, EYE_POS[1] + IRIS_R * y]);
    }
    out.push(
      {
        type: 'region',
        id: 'eye',
        points: eyePts,
        opaque: true,
        fillOpacity: 0,
        outline: eyePts.map((_, i) => [i, (i + 1) % eyePts.length] as const),
        opacity: eyeOpacity,
        style: ink,
      },
      { type: 'trajectory', id: 'iris', points: iris, closed: true, width: EYE_LINE_PX, opacity: eyeOpacity, style: ink },
      {
        type: 'body',
        id: 'pupil',
        pos: EYE_POS,
        shape: 'circle',
        size: PUPIL_R,
        glow: false,
        outline: 'none',
        opacity: eyeOpacity,
        style: ink,
      },
    );
  }

  // ---- 상 — 멈춘 각에서만. 물체와 같은 색, 속 빈 윤곽 ----
  if (held) {
    imageMaps(held.deg).forEach((m, i) => {
      const chosen = held.deg === c.angleA && m.turn === tracedMap.turn && m.flipped === tracedMap.flipped;
      const others = chosen ? 1 : 1 - (1 - OTHERS_OPACITY) * dimAmt;
      const image: Body = {
        type: 'body',
        id: `image-${i}`,
        pos: apply(m.map, OBJECT_POS),
        shape: 'custom',
        customPath: flagPath(FLAG_OUTLINE.map((p) => apply(m.map, p))),
        fill: 'none',
        outline: 'role',
        opacity: held.opacity * others,
        style: thing,
      };
      out.push(image);
    });
    out.push({
      type: 'readout',
      id: 'count',
      anchor: { world: COUNT_POS },
      text: text('label.count'),
      vars: { n: String(held.count) },
      chip: false,
      font: 'text',
      fontSize: COUNT_PX,
      weight: 'bold',
      opacity: held.opacity,
      style: ink,
    });
  }

  // ---- 물체 — 채운 깃발 ----
  out.push({
    type: 'body',
    id: 'object',
    pos: OBJECT_POS,
    shape: 'custom',
    customPath: flagPath(FLAG_OUTLINE),
    style: thing,
  });
  out.push({
    type: 'readout',
    id: 'name-object',
    anchor: { world: [OBJECT_POS[0], OBJECT_POS[1] + FLAG_H / 2 + OBJECT_LABEL_GAP] },
    text: text('label.object'),
    chip: false,
    font: 'text',
    fontSize: NAME_PX,
    style: guide,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
