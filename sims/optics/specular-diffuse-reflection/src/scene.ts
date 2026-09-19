// ========================================================================
// specular-diffuse-reflection — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 면의 몸(region) · 면 선
// (trajectory) · 빛줄기(ray, plugin-optics `traceRay` 로 추적) · 작은 법선(trajectory 점선) ·
// 이름표(readout)가 모두 어휘로 있다.
//
// 색은 뜻마다 하나다 — 빛은 plugin 이 정한 강조색(빛 한 가지 뜻), 두 면은 같은 대상(되튀게
// 하는 면)이라 같은 muted 몸 · 같은 먹 선, 법선은 먹 점선. 매끈한 면과 거친 면을 색으로
// 가르지 않는다 — 모양(평평함 · 톱니)과 이름표로 가른다 (S-piece).
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
import { beamPaths, prefix, rayReach, readConstants, roughSurface, smoothSurface, type BeamPath } from './physics';
import {
  NAME_LABEL_Y,
  NORMAL_LENGTH,
  ROUGH_CENTER_X,
  SCENE_BOUNDS,
  SMOOTH_CENTER_X,
  SURFACE_DEPTH,
  text,
  type SpecularDiffuseReflectionMessageKey,
} from './schema';
import type { SpecularDiffuseReflectionState } from './state';

/** 면 선 굵기(화면 px). */
const SURFACE_LINE_PX = 2;
/** 면 몸 채움 짙기. */
const SURFACE_FILL = 0.35;
/** 법선 점선 굵기(화면 px). 재는 기준선이라 가늘다. */
const NORMAL_WIDTH_PX = 1.4;
/** 면 이름표 글자 크기(화면 px). */
const NAME_LABEL_PX = 13;

/** 한 면과 그 위 빛줄기 묶음. */
interface Panel {
  id: 'smooth' | 'rough';
  cx: number;
  surface: Vec2[];
  label: SpecularDiffuseReflectionMessageKey;
}

function surfacePrims(p: Panel): Primitive[] {
  const first = p.surface[0]!;
  const last = p.surface[p.surface.length - 1]!;
  return [
    {
      type: 'region',
      id: `${p.id}-body`,
      points: [...p.surface, [last[0], -SURFACE_DEPTH], [first[0], -SURFACE_DEPTH]],
      fillOpacity: SURFACE_FILL,
      opaque: true,
      style: { colorRole: 'muted', emphasis: 'medium' },
    },
    {
      type: 'trajectory',
      id: `${p.id}-face`,
      points: p.surface,
      width: SURFACE_LINE_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
  ];
}

/** 닿은 자리마다 그 면 조각의 법선. `normals-in` 진행도만큼 짙어진다. */
function normalPrims(p: Panel, paths: readonly BeamPath[], alpha: number): Primitive[] {
  if (alpha <= 0) return [];
  return paths.map((b, i) => {
    const hit = b.points[1]!;
    return {
      type: 'trajectory',
      id: `${p.id}-normal-${i}`,
      points: [hit, [hit[0] + b.normal[0] * NORMAL_LENGTH, hit[1] + b.normal[1] * NORMAL_LENGTH]],
      width: NORMAL_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
    } satisfies Primitive;
  });
}

/**
 * 빛줄기 하나를 앞머리까지 선언한다. 들어오는 빛은 면에 닿기 전엔 앞머리에, 닿은 뒤엔
 * 가운데에 화살촉을 단다 — `ray` 의 촉이 끝에만 붙어(G217) 닿은 뒤 끝의 촉이 면에 묻힌다.
 * 나가는 빛은 앞머리(끝)에 촉을 단다.
 */
function rayPrims(id: string, points: readonly Vec2[], reach: number): Primitive[] {
  if (points.length < 2 || reach <= 0) return [];
  const start = points[0]!;
  const hit = points[1]!;
  const inLen = Math.hypot(hit[0] - start[0], hit[1] - start[1]);
  const out: Primitive[] = [];
  if (reach < inLen) {
    out.push({ type: 'ray', id: `${id}-in`, segments: prefix(points, reach), showArrow: true });
    return out;
  }
  const mid: Vec2 = [(start[0] + hit[0]) / 2, (start[1] + hit[1]) / 2];
  out.push(
    { type: 'ray', id: `${id}-in-a`, segments: [start, mid], showArrow: true },
    { type: 'ray', id: `${id}-in-b`, segments: [mid, hit] },
  );
  const outgoing = prefix(points.slice(1), reach - inLen);
  if (outgoing.length >= 2) {
    out.push({ type: 'ray', id: `${id}-out`, segments: outgoing, showArrow: true });
  }
  return out;
}

export function scene(params: {
  state: SpecularDiffuseReflectionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('specular-diffuse-reflection: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  const panels: Panel[] = [
    { id: 'smooth', cx: SMOOTH_CENTER_X, surface: smoothSurface(SMOOTH_CENTER_X), label: 'label.smooth' },
    { id: 'rough', cx: ROUGH_CENTER_X, surface: roughSurface(ROUGH_CENTER_X, c), label: 'label.rough' },
  ];
  const normalAlpha = timeline.at('normals-in');

  const bodies: Primitive[] = [];
  const normals: Primitive[] = [];
  const rays: Primitive[] = [];
  const labels: Primitive[] = [];

  for (const p of panels) {
    const paths = beamPaths(p.surface, p.cx, c);
    bodies.push(...surfacePrims(p));
    normals.push(...normalPrims(p, paths, normalAlpha));
    paths.forEach((b, i) => rays.push(...rayPrims(`${p.id}-ray-${i}`, b.points, rayReach(timeline, b.points))));
    labels.push({
      type: 'readout',
      id: `${p.id}-name`,
      anchor: { world: [p.cx, NAME_LABEL_Y] },
      text: text(p.label),
      chip: false,
      font: 'text',
      fontSize: NAME_LABEL_PX,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return [...bodies, ...normals, ...rays, ...labels];
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
