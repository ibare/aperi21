// ========================================================================
// thin-lens — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 광축(trajectory) ·
// 렌즈(opticalElement) · 초점과 상 점(body circle) · 물체와 상 화살표(vector) ·
// 세 광선(ray) · 이름표(readout)가 모두 어휘로 있다.
//
// 색은 뜻마다 하나다 — 빛(세 광선)은 plugin 이 주는 강조색 하나뿐이고, 물체 · 상 ·
// 상 점은 먹색 짙게, 작도의 기준(광축 · 초점 · 초점 이름표)은 먹색 옅게, 그 뒤의
// 광축은 muted 다. **세 광선을 색으로 가르지 않는다** — 셋을 가르는 것은 지나는
// 자리이고, 캡션이 하나씩 짚는 동안 하나씩 그어진다 (S-piece).
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
import { buildConstruction, buildLens, growPolyline, rayFractions, readConstants, sceneOpacity } from './physics';
import {
  AXIS_FROM_X,
  AXIS_TO_X,
  AXIS_Y,
  FOCUS_DOT_RADIUS,
  IMAGE_DOT_RADIUS,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { ThinLensState } from './state';

/** 광축의 굵기(화면 px). 재는 선이지 그림의 일부가 아니라 가장 가늘게. */
const AXIS_WIDTH_PX = 1;
/** 광축의 짙기. 물체 · 광선보다 뒤로 물러나 있어야 한다. */
const AXIS_OPACITY = 0.6;
/** 도식 이름표(물체 · 상)의 글자 크기(화면 px). 본문보다 작다. */
const LABEL_PX = 12;
/** 초점 표식(F · F′)의 글자 크기(화면 px). */
const FOCUS_LABEL_PX = 12;
/** 이름표를 화살표 옆으로 띄우는 거리(화면 px). */
const LABEL_SIDE_PX = 10;
/** 초점 이름표를 광축에서 위아래로 띄우는 거리(화면 px). */
const FOCUS_LABEL_DROP_PX = 15;
/**
 * 초점 이름표를 초점 점에서 가로로 비껴 놓는 거리(화면 px).
 *
 * 두 초점에는 **광선이 그 점을 지난다** — 초점 광선이 F 를, 평행 광선이 꺾여
 * F′ 를 지난다. 이름표를 점 바로 위아래에 두면 그 광선이 글자를 스친다. 광선이
 * 오는 쪽 반대편으로 비껴 놓는다.
 */
const FOCUS_LABEL_SIDE_PX = 10;

/** 광선 세 가닥의 인스턴스 id. 종류가 아니라 인스턴스라 각자 이름을 가진다 (원칙 7). */
const RAY_IDS = ['ray-parallel', 'ray-center', 'ray-focal'] as const;

export function scene(params: {
  state: ThinLensState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('thin-lens: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const geom = buildConstruction(c);
  const alpha = sceneOpacity(timeline);
  const out: Primitive[] = [];

  // ---- 광축 ----
  // 재는 기준선이다. 두 초점 · 물체 밑 · 상 밑이 모두 이 선 위에 놓인다.
  out.push({
    type: 'trajectory',
    id: 'optical-axis',
    points: [
      [AXIS_FROM_X, AXIS_Y],
      [AXIS_TO_X, AXIS_Y],
    ],
    width: AXIS_WIDTH_PX,
    opacity: AXIS_OPACITY * alpha,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 렌즈 ----
  // 화면에 그리는 것과 `findImage` 에 넘기는 것이 같은 선언 하나다.
  out.push({ ...buildLens(c), opacity: alpha });

  // ---- 두 초점 ----
  // 옛 조각은 초점 자리를 계산해 광선을 겨누면서 화면에 올리지 않았다. 그러면
  // 두 광선이 왜 그쪽으로 꺾이는지가 그림 밖에 있어 작도의 근거가 끊긴다.
  const foci: {
    id: string;
    pos: Vec2;
    labelKey: 'label.focusNear' | 'label.focusFar';
    offset: Vec2;
  }[] = [
    // 앞쪽 F 의 이름표는 축 아래 **왼쪽** — 초점 광선이 이 점을 지나 오른쪽 아래로 내려간다.
    {
      id: 'near',
      pos: geom.focusNear,
      labelKey: 'label.focusNear',
      offset: [-FOCUS_LABEL_SIDE_PX, FOCUS_LABEL_DROP_PX],
    },
    // 뒤쪽 F′ 의 이름표는 축 위 **오른쪽** — 평행 광선이 왼쪽 위에서 이 점으로 내려온다.
    {
      id: 'far',
      pos: geom.focusFar,
      labelKey: 'label.focusFar',
      offset: [FOCUS_LABEL_SIDE_PX, -FOCUS_LABEL_DROP_PX],
    },
  ];
  for (const f of foci) {
    out.push({
      type: 'body',
      id: `focus-${f.id}`,
      shape: 'circle',
      pos: f.pos,
      size: FOCUS_DOT_RADIUS,
      fill: 'solid',
      glow: false,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
    out.push({
      type: 'readout',
      id: `focus-label-${f.id}`,
      anchor: { world: f.pos, offset: f.offset },
      text: text(f.labelKey),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: FOCUS_LABEL_PX,
      align: 'center',
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
  }

  // ---- 물체 ----
  // 광축 위로 선 화살표. 광선 셋은 모두 이 끝에서 나간다.
  out.push({
    type: 'vector',
    id: 'object',
    from: [geom.objectTip[0], AXIS_Y],
    delta: [0, geom.objectTip[1] - AXIS_Y],
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'object-label',
    anchor: { world: [geom.objectTip[0], (AXIS_Y + geom.objectTip[1]) / 2], offset: [LABEL_SIDE_PX, 0] },
    text: text('label.object'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'left',
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });

  // ---- 상 ----
  // 만난 점까지 자란다. 물체와 **같은 먹색 화살표**다 — 다른 색으로 칠하면 다른
  // 종류로 읽힌다. 거꾸로 섰다는 것은 방향이 말한다 (S-piece).
  const rise = timeline.at('rise');
  if (rise > 0) {
    out.push({
      type: 'vector',
      id: 'image',
      from: geom.imageFoot,
      delta: [0, (geom.imageTip[1] - AXIS_Y) * rise],
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'image-label',
      anchor: { world: [geom.imageTip[0], (AXIS_Y + geom.imageTip[1]) / 2], offset: [LABEL_SIDE_PX, 0] },
      text: text('label.image'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'left',
      opacity: alpha * rise,
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
  }

  // ---- 세 표준 광선 ----
  // 하나씩 자란다. 자라는 앞머리에 화살촉이 붙어 빛이 가는 방향이 보이고, 다 그은
  // 뒤에는 화살촉이 오른쪽 끝에 남아 셋이 만난 뒤 다시 벌어지는 것을 가리킨다.
  const fractions = rayFractions(timeline);
  geom.rays.forEach((path, i) => {
    const segments = growPolyline(path, fractions[i] ?? 0);
    if (segments.length < 2) return;
    out.push({
      type: 'ray',
      id: RAY_IDS[i]!,
      segments,
      showArrow: true,
    });
  });

  // ---- 만난 점 ----
  // 광선 위에 찍힌다 — 셋이 지나는 자리에 점이 있는 것이 이 조각의 결론이다.
  const meet = timeline.at('meet');
  if (meet > 0) {
    out.push({
      type: 'body',
      id: 'image-point',
      shape: 'circle',
      pos: geom.imageTip,
      size: IMAGE_DOT_RADIUS,
      fill: 'solid',
      glow: false,
      outline: 'background',
      opacity: alpha * meet,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
