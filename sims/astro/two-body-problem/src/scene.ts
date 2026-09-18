// ========================================================================
// two-body-problem — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 두 천체(body) · 두 궤도 원 ·
// 잇는 선(trajectory) · 질량 중심 점(body) · 이름표 · 질량비 표시(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — **강조색은 「질량 중심」 한 뜻에만**(점과 그 이름). 두 천체는
// 같은 먹색이고 크기로 질량을 말한다(색으로 가르면 「무거운 것은 빨강」 이 된다). 두 궤도
// 원은 같은 보조색 — 누구의 원인지는 그 위에 얹힌 천체가 말한다. 잇는 선은 배경 정보라 muted.
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
import { ratioOpacity, readConstants, readPair } from './physics';
import { MASS_ROW_Y, RADIUS_ROW_Y, SCENE_BOUNDS, TEXT_X, text } from './schema';
import type { TwoBodyProblemState } from './state';

/** 궤도 원의 표본 수. */
const CIRCLE_SAMPLES = 120;
/** 궤도 원 굵기(화면 px). */
const ORBIT_WIDTH_PX = 1.75;
/** 두 천체를 잇는 선 굵기(화면 px). */
const LINK_WIDTH_PX = 1.25;
/** 질량 중심 점 반지름(월드). 12 : 1 의 무거운 천체보다 한참 작아 그 속에 든 것이 보인다. */
const BARYCENTER_R = 0.1;
/**
 * 질량 중심 이름표를 표지 아래로 내리는 거리(화면 px). 12 : 1 에서 무거운 천체가 흔들리며
 * 덮는 자리(궤도 + 천체 반지름) 밖이라, 「속으로 들어간」 점을 칩이 가리지 않는다.
 */
const BARYCENTER_LABEL_DROP = 44;
/** 질량 중심 이름표 글자 크기(화면 px). */
const BARYCENTER_LABEL_PX = 12;
/** 질량비 · 반지름비 표시 글자 크기(화면 px). */
const RATIO_PX = 14;

function circle(r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < CIRCLE_SAMPLES; i++) {
    const a = (2 * Math.PI * i) / CIRCLE_SAMPLES;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}

export function scene(params: {
  state: TwoBodyProblemState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('two-body-problem: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const pair = readPair(tl, c);
  const out: Primitive[] = [];

  // ---- 두 궤도 원 ----
  // 질량비가 옮겨 가는 동안 두 원이 크기를 주고받는다. 합(= 두 천체 사이 거리)은 그대로다.
  out.push({
    type: 'trajectory',
    id: 'orbit-light',
    points: circle(pair.lightOrbit),
    closed: true,
    width: ORBIT_WIDTH_PX,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'orbit-heavy',
    points: circle(pair.heavyOrbit),
    closed: true,
    width: ORBIT_WIDTH_PX,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ---- 잇는 선 ----
  // 두 천체를 잇는 곧은 선이 언제나 질량 중심을 지난다 — 「늘 반대편」 이 한 선으로 보인다.
  out.push({
    type: 'trajectory',
    id: 'link',
    points: [pair.heavyPos, pair.lightPos],
    width: LINK_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // 질량 중심 이름표는 천체 **아래**에 둔다 — 3 : 1 에서 무거운 천체가 그 위를 지나가면
  // 잠깐 가려질 뿐 천체를 칩으로 덮지 않는다. 표지(점)는 천체 위에 따로 둔다.
  out.push({
    type: 'readout',
    id: 'barycenter-label',
    anchor: { world: [0, 0], offset: [0, BARYCENTER_LABEL_DROP] },
    text: text('label.barycenter'),
    chip: true,
    font: 'text',
    fontSize: BARYCENTER_LABEL_PX,
    align: 'center',
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 두 천체 ----
  // 같은 먹색, 크기로 질량을 말한다.
  out.push({
    type: 'body',
    id: 'heavy',
    pos: pair.heavyPos,
    shape: 'circle',
    size: pair.heavySize,
    outline: 'none',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'light',
    pos: pair.lightPos,
    shape: 'circle',
    size: pair.lightSize,
    outline: 'none',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 질량 중심 ----
  // 천체 위에 긋는다 — 12 : 1 에서 무거운 천체가 이 자리를 덮고 돌 때도 표지가 보여야
  // 「중심이 천체 속으로 들어갔다」 가 읽힌다.
  // 강조색 점에 바탕색 테를 두른다 — 다크에서 먹색 천체는 밝은 크림색이라 금빛 선만으로는
  // 그 위에서 묻힌다(둘째 촬영). 테가 점을 천체에서 떼어 낸다.
  out.push({
    type: 'body',
    id: 'barycenter',
    pos: [0, 0],
    shape: 'circle',
    size: BARYCENTER_R,
    outline: 'background',
    glow: false,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 질량비 · 반지름비 ----
  // 선언한 수를 그대로 쓴다(S-piece 유효숫자). 같은 순서로 적으면 두 줄의 수가 뒤집혀 있다 —
  // 그 뒤집힘이 반비례다. 옮겨 가는 동안은 앞 줄이 사라진 뒤 다음 줄이 나타난다.
  const op = ratioOpacity(tl);
  const light = String(c.massLight);
  const rows: { id: string; heavy: number; opacity: number }[] = [
    { id: 'equal', heavy: c.massEqual, opacity: op.equal },
    { id: 'mid', heavy: c.massMid, opacity: op.mid },
    { id: 'heavy', heavy: c.massHeavy, opacity: op.heavy },
  ];
  for (const row of rows) {
    if (row.opacity <= 0) continue;
    const vars = { heavy: String(row.heavy), light };
    out.push({
      type: 'readout',
      id: `mass-ratio-${row.id}`,
      anchor: { world: [TEXT_X, MASS_ROW_Y] },
      text: text('label.massRatio'),
      vars,
      chip: false,
      font: 'text',
      fontSize: RATIO_PX,
      align: 'left',
      opacity: row.opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `radius-ratio-${row.id}`,
      anchor: { world: [TEXT_X, RADIUS_ROW_Y] },
      text: text('label.radiusRatio'),
      vars,
      chip: false,
      font: 'text',
      fontSize: RATIO_PX,
      align: 'left',
      opacity: row.opacity,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
