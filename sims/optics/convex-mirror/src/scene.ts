// ========================================================================
// convex-mirror — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - (A) 거울은 `trajectory`(반사면 곡선) + `region`(뒷면 띠)이다. plugin `opticalElement` 의
//   `mirror-convex` 는 휨이 화면 px 로 고정이라(G219) 줄기가 닿는 자리를 그 곡선 위에 맞출 수
//   없다. 곡선을 직접 선언하고 줄기를 그 위에서 비치게 한다.
// - 줄기는 `ray`(plugin 강조색 하나) — 빛 한 가지 뜻이다. 거울 뒤로 거꾸로 이은 선은 같은
//   강조색의 **점선** `trajectory` 다 — 실제 빛이 아니라는 것은 선 모양으로 가른다.
// - 물체 · 상은 같은 먹색 화살표(`vector`)다. 상은 점선 화살표와 이름표 `허상` 으로 가른다.
// - (B) 두 판은 같은 어휘 · 같은 색이다. 다른 것은 거울 모양 하나 — 쐐기의 벌어짐이 그 결과다.
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
  clipByLength,
  fovPanel,
  mirrorImageTip,
  mirrorX,
  objectDistance,
  PANEL_XS,
  principalRays,
  readConstants,
} from './physics';
import {
  AXIS_FROM_X,
  AXIS_TO_X,
  MIRROR_BACK,
  MIRROR_HALF,
  POINT_RADIUS,
  SCENE_BOUNDS,
  text,
  type ConvexMirrorMessageKey,
} from './schema';
import type { ConvexMirrorState } from './state';

/** 광축 보조선 굵기(화면 px). 재는 기준선이라 가늘다. */
const AXIS_WIDTH_PX = 1;
/** 거울 반사면 굵기(화면 px). */
const MIRROR_WIDTH_PX = 3;
/** 거울 뒷면 띠 채움 짙기. */
const MIRROR_BACK_FILL = 0.35;
/** 거울 곡선을 자르는 마디 수. */
const MIRROR_SAMPLES = 24;
/** 거꾸로 이은 점선 굵기(화면 px). 줄기(`ray`, 테마 regular)의 연장이라 비슷하게. */
const EXTENSION_WIDTH_PX = 1.5;
/** 물체 · 상 화살표 굵기(화면 px). */
const ARROW_WIDTH_PX = 3;
/** 표식 `F` 글자 크기(화면 px). */
const POINT_LABEL_PX = 13;
/** 표식 `F` 가 점 아래로 내려간 거리(화면 px). */
const POINT_LABEL_DROP_PX = 13;
/** 상 이름표 글자 크기(화면 px). */
const IMAGE_LABEL_PX = 13;
/** 상 이름표가 상 끝 오른쪽으로 비켜난 거리(화면 px). */
const IMAGE_LABEL_SIDE_PX = 8;
/** 시야 부채꼴 채움 짙기 — 거울 · 줄기 · 눈 아래 옅게 깐다. */
const WEDGE_FILL = 0.22;
/** 판 이름표 글자 크기(화면 px). */
const PANEL_LABEL_PX = 13;
/** 판 이름표가 거울 뒷면 위로 올라간 거리(화면 px). */
const PANEL_LABEL_RISE_PX = 12;
/** 눈 윤곽의 반폭 · 반높이(월드). */
const EYE_HALF_W = 0.2;
const EYE_HALF_H = 0.1;
/** 눈동자 반지름(월드). */
const PUPIL_R = 0.055;
/** 눈 윤곽을 자르는 마디 수(위 · 아래 곡선 하나마다). */
const EYE_SAMPLES = 16;

/** (A) 거울 반사면 곡선 — 위 끝에서 아래 끝까지. */
function mirrorCurve(): Vec2[] {
  return Array.from({ length: MIRROR_SAMPLES + 1 }, (_, i) => {
    const y = MIRROR_HALF - (2 * MIRROR_HALF * i) / MIRROR_SAMPLES;
    return [mirrorX(y), y] as Vec2;
  });
}

/** 눈 윤곽 — 가로로 긴 아몬드. */
function eyeOutline(c: Vec2): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i <= EYE_SAMPLES; i++) {
    const k = -1 + (2 * i) / EYE_SAMPLES;
    pts.push([c[0] + EYE_HALF_W * k, c[1] + EYE_HALF_H * (1 - k * k)]);
  }
  for (let i = EYE_SAMPLES - 1; i >= 1; i--) {
    const k = -1 + (2 * i) / EYE_SAMPLES;
    pts.push([c[0] + EYE_HALF_W * k, c[1] - EYE_HALF_H * (1 - k * k)]);
  }
  return pts;
}

export function scene(params: {
  state: ConvexMirrorState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('convex-mirror: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  const out: Primitive[] = [];

  // ================= (A) 상 =================
  const clearA = tl.at('clear-a');
  const aOn = tl.at('show-a') * (1 - clearA);
  if (clearA < 1) {
    const f = c.focalLength;
    const h = c.objectHeight;

    // ---- 광축 ----
    out.push({
      type: 'trajectory',
      id: 'axis',
      points: [
        [AXIS_FROM_X, 0],
        [AXIS_TO_X, 0],
      ],
      width: AXIS_WIDTH_PX,
      opacity: aOn,
      style: { colorRole: 'muted', emphasis: 'medium' },
    });

    // ---- 거울 — 뒷면 띠 위에 반사면 곡선 ----
    const curve = mirrorCurve();
    out.push({
      type: 'region',
      id: 'mirror-back',
      points: [...curve, ...[...curve].reverse().map(([x, y]) => [x + MIRROR_BACK, y] as Vec2)],
      fillOpacity: MIRROR_BACK_FILL,
      opacity: aOn,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'trajectory',
      id: 'mirror',
      points: curve,
      width: MIRROR_WIDTH_PX,
      opacity: aOn,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // ---- 초점 F (거울 뒤) ----
    out.push({
      type: 'body',
      id: 'point-focus',
      shape: 'circle',
      pos: [f, 0],
      size: POINT_RADIUS,
      fill: 'solid',
      glow: false,
      opacity: aOn,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'point-label-focus',
      anchor: { world: [f, 0], offset: [0, POINT_LABEL_DROP_PX] },
      text: text('label.focus'),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: POINT_LABEL_PX,
      align: 'center',
      opacity: aOn,
      style: { colorRole: 'ink', emphasis: 'medium' },
    });

    // ---- 줄기 · 점선 · 상 ----
    const d = objectDistance(tl, c);
    const tip = mirrorImageTip(d, h, f);
    const reach = tl.at('trace-a');
    const imageOn = reach * (1 - clearA);

    principalRays(d, h, tip).forEach((ray, j) => {
      const shown = clipByLength(ray.path, clearA, tl.at('rays-a'));
      if (shown.length >= 2) {
        out.push({ type: 'ray', id: `ray-${j}`, segments: shown, showArrow: true });
      }
      if (reach > 0) {
        const [from, to] = ray.extension;
        out.push({
          type: 'trajectory',
          id: `extension-${j}`,
          points: [from, [from[0] + (to[0] - from[0]) * reach, from[1] + (to[1] - from[1]) * reach]],
          width: EXTENSION_WIDTH_PX,
          opacity: 1 - clearA,
          style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
        });
      }
    });

    // ---- 물체 ----
    out.push({
      type: 'vector',
      id: 'object',
      from: [-d, 0],
      delta: [0, h],
      width: ARROW_WIDTH_PX,
      opacity: aOn,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    if (imageOn > 0) {
      out.push({
        type: 'vector',
        id: 'image',
        from: [tip[0], 0],
        delta: [0, tip[1]],
        width: ARROW_WIDTH_PX,
        opacity: imageOn,
        style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
      });
      out.push({
        type: 'readout',
        id: 'image-label',
        anchor: { world: tip, offset: [IMAGE_LABEL_SIDE_PX, 0] },
        text: text('label.virtual'),
        chip: false,
        font: 'text',
        fontSize: IMAGE_LABEL_PX,
        align: 'left',
        opacity: imageOn,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  }

  // ================= (B) 시야 =================
  const clearB = tl.at('clear-b');
  const bOn = tl.at('show-b') * (1 - clearB);
  if (tl.at('show-b') > 0 && clearB < 1) {
    const wedgeOn = tl.at('field-b') * (1 - clearB);
    const panels: { id: 'plane' | 'convex'; label: ConvexMirrorMessageKey }[] = [
      { id: 'plane', label: 'label.plane' },
      { id: 'convex', label: 'label.convex' },
    ];
    const built = panels.map((p) => ({
      ...p,
      panel: fovPanel(PANEL_XS[p.id], p.id === 'convex', c, MIRROR_SAMPLES, MIRROR_BACK),
    }));
    // 두 판 이름표는 같은 높이 — 둘 중 높은 뒷면 위 끝에 맞춘다.
    const labelY = Math.max(...built.flatMap(({ panel }) => panel.back.map(([, y]) => y)));
    for (const { panel, ...p } of built) {

      if (wedgeOn > 0) {
        out.push({
          type: 'region',
          id: `wedge-${p.id}`,
          points: panel.fan,
          fillOpacity: WEDGE_FILL,
          opacity: wedgeOn,
          style: { colorRole: 'accent', emphasis: 'medium' },
        });
      }
      out.push({
        type: 'region',
        id: `fov-back-${p.id}`,
        points: panel.back,
        fillOpacity: MIRROR_BACK_FILL,
        opacity: bOn,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
      out.push({
        type: 'trajectory',
        id: `fov-mirror-${p.id}`,
        points: panel.mirror,
        width: MIRROR_WIDTH_PX,
        opacity: bOn,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      panel.rays.forEach((path, j) => {
        const shown = clipByLength(path, clearB, tl.at('sight-b'));
        if (shown.length >= 2) {
          out.push({ type: 'ray', id: `fov-ray-${p.id}-${j}`, segments: shown, showArrow: true });
        }
      });

      // 눈 — 바탕색으로 덮어 줄기 끝이 눈 안으로 들어간 것으로 읽힌다.
      const outline = eyeOutline(panel.eye);
      out.push({
        type: 'region',
        id: `eye-${p.id}`,
        points: outline,
        opaque: true,
        fillOpacity: 0,
        outline: outline.map((_, i) => [i, (i + 1) % outline.length] as const),
        opacity: bOn,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      out.push({
        type: 'body',
        id: `pupil-${p.id}`,
        pos: panel.eye,
        shape: 'circle',
        size: PUPIL_R,
        glow: false,
        outline: 'none',
        opacity: bOn,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });

      out.push({
        type: 'readout',
        id: `panel-label-${p.id}`,
        anchor: { world: [PANEL_XS[p.id], labelY], offset: [0, -PANEL_LABEL_RISE_PX] },
        text: text(p.label),
        chip: false,
        font: 'text',
        fontSize: PANEL_LABEL_PX,
        align: 'center',
        opacity: bOn,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
