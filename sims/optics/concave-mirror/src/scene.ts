// ========================================================================
// concave-mirror — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 거울은 `trajectory`(반사면 곡선) + `region`(뒷면 띠)이다. plugin `opticalElement` 의
//   `mirror-concave` 는 휨이 화면 px 로 고정이라(G219) 줄기가 닿는 자리를 그 곡선 위에 맞출 수
//   없다. 곡선을 직접 선언하고 줄기를 그 위에서 비치게 한다.
// - 줄기는 `ray`(plugin 강조색 하나) — 빛 한 가지 뜻이다. 허상 자리에서 거울 뒤로 거꾸로 이은
//   선은 같은 강조색의 **점선** `trajectory` 다 — 실제 빛이 아니라는 것은 선 모양으로 가른다.
// - 물체 · 상은 같은 먹색 화살표(`vector`)다. 거꾸로 · 바로는 화살표 방향으로, 실상 · 허상은
//   실선 · 점선과 이름표(`실상` · `허상`)로 가른다. 색으로 가르지 않는다 (S-piece).
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
  mirrorImage,
  mirrorX,
  objectDistance,
  principalRays,
  readConstants,
  stopDistances,
  stopProgress,
} from './physics';
import {
  AXIS_FROM_X,
  AXIS_TO_X,
  MIRROR_BACK,
  MIRROR_HALF,
  POINT_RADIUS,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { ConcaveMirrorState } from './state';

/** 광축 보조선 굵기(화면 px). 재는 기준선이라 가늘다. */
const AXIS_WIDTH_PX = 1;
/** 거울 반사면 굵기(화면 px). */
const MIRROR_WIDTH_PX = 3;
/** 거울 뒷면 띠 채움 짙기. */
const MIRROR_BACK_FILL = 0.35;
/** 거울 곡선을 자르는 마디 수. */
const MIRROR_SAMPLES = 24;
/** 거꾸로 이은 점선 굵기(화면 px). 줄기(`ray`, 테마 regular)와 같은 줄기의 연장이라 비슷하게. */
const EXTENSION_WIDTH_PX = 1.5;
/** 물체 · 상 화살표 굵기(화면 px). */
const ARROW_WIDTH_PX = 3;
/** 표식 `C` · `F` 글자 크기(화면 px). */
const POINT_LABEL_PX = 13;
/** 표식 `C` · `F` 가 점 아래로 내려간 거리(화면 px). */
const POINT_LABEL_DROP_PX = 13;
/** 상 이름표 글자 크기(화면 px). */
const IMAGE_LABEL_PX = 13;
/** 상 이름표가 상 화살표 옆으로 비켜난 거리(화면 px). */
const IMAGE_LABEL_SIDE_PX = 10;

/** 거울 반사면 곡선 — 위 끝에서 아래 끝까지. */
function mirrorCurve(): Vec2[] {
  return Array.from({ length: MIRROR_SAMPLES + 1 }, (_, i) => {
    const y = MIRROR_HALF - (2 * MIRROR_HALF * i) / MIRROR_SAMPLES;
    return [mirrorX(y), y] as Vec2;
  });
}

export function scene(params: {
  state: ConcaveMirrorState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('concave-mirror: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const f = c.focalLength;
  const h = c.objectHeight;

  const out: Primitive[] = [];

  // ---- 광축 ----
  out.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [AXIS_FROM_X, 0],
      [AXIS_TO_X, 0],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // ---- 거울 — 뒷면 띠 위에 반사면 곡선 ----
  const curve = mirrorCurve();
  const back: Vec2[] = [...curve, ...[...curve].reverse().map(([x, y]) => [x + MIRROR_BACK, y] as Vec2)];
  out.push({
    type: 'region',
    id: 'mirror-back',
    points: back,
    fillOpacity: MIRROR_BACK_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'mirror',
    points: curve,
    width: MIRROR_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 곡률 중심 C · 초점 F ----
  const points: { id: string; x: number; label: 'label.center' | 'label.focus' }[] = [
    { id: 'center', x: -2 * f, label: 'label.center' },
    { id: 'focus', x: -f, label: 'label.focus' },
  ];
  for (const p of points) {
    out.push({
      type: 'body',
      id: `point-${p.id}`,
      shape: 'circle',
      pos: [p.x, 0],
      size: POINT_RADIUS,
      fill: 'solid',
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `point-label-${p.id}`,
      anchor: { world: [p.x, 0], offset: [0, POINT_LABEL_DROP_PX] },
      text: text(p.label),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: POINT_LABEL_PX,
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
  }

  // ---- 자리마다 줄기 · 점선 · 상 ----
  const rays: Primitive[] = [];
  const extensions: Primitive[] = [];
  const images: Primitive[] = [];
  const labels: Primitive[] = [];

  stopDistances(c).forEach((d, i) => {
    const k = (i + 1) as 1 | 2 | 3;
    const pr = stopProgress(timeline, k);
    if (pr.front <= 0 || pr.tail >= 1) return;
    const image = mirrorImage(d, h, f);
    const principal = principalRays(d, h, image);

    principal.forEach((ray, j) => {
      const shown = clipByLength(ray.path, pr.tail, pr.front);
      if (shown.length >= 2) {
        rays.push({ type: 'ray', id: `ray-${k}-${j}`, segments: shown, showArrow: true });
      }
      if (ray.extension && pr.reach > 0 && pr.extension > 0) {
        const [from, to] = ray.extension;
        extensions.push({
          type: 'trajectory',
          id: `extension-${k}-${j}`,
          points: [from, [from[0] + (to[0] - from[0]) * pr.reach, from[1] + (to[1] - from[1]) * pr.reach]],
          width: EXTENSION_WIDTH_PX,
          opacity: pr.extension,
          style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
        });
      }
    });

    if (pr.image > 0) {
      const base: Vec2 = [image.tip[0], 0];
      images.push({
        type: 'vector',
        id: `image-${k}`,
        from: base,
        delta: [0, image.tip[1]],
        width: ARROW_WIDTH_PX,
        opacity: pr.image,
        style: { colorRole: 'ink', emphasis: 'strong', lineStyle: image.virtual ? 'dashed' : 'solid' },
      });
      // 이름표는 상 화살표의 가운데 높이, 실상은 왼쪽(줄기가 오른쪽에서 들어온다), 허상은 오른쪽(거울 밖).
      labels.push({
        type: 'readout',
        id: `image-label-${k}`,
        anchor: {
          world: [base[0], image.tip[1] / 2],
          offset: [image.virtual ? IMAGE_LABEL_SIDE_PX : -IMAGE_LABEL_SIDE_PX, 0],
        },
        text: text(image.virtual ? 'label.virtual' : 'label.real'),
        chip: false,
        font: 'text',
        fontSize: IMAGE_LABEL_PX,
        align: image.virtual ? 'left' : 'right',
        opacity: pr.image,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  });

  // ---- 물체 ----
  const objX = -objectDistance(timeline, c);
  const object: Primitive = {
    type: 'vector',
    id: 'object',
    from: [objX, 0],
    delta: [0, h],
    width: ARROW_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return [...out, ...rays, ...extensions, object, ...images, ...labels];
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
