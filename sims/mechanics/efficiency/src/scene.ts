// ========================================================================
// efficiency — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 띠 · 갈래 · 기계 상자(region) ·
// 흐르는 점(particleSystem) · 양 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 에너지 띠는 한 대상이라 같은 muted 이고, **강조색은 「쓸모로
// 나가는 몫」 한 가지 뜻에만** 쓴다. 샌 몫은 색을 바꾸지 않고 결(hatch)로 가른다 —
// 같은 에너지의 다른 몫이지 다른 것이 아니다 (S-piece — 색으로 설명하지 않는다).
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
import { flowShape, gainFor, matchProgress, percentText, readConstants } from './physics';
import {
  ORIGIN_A,
  ORIGIN_B,
  SCENE_BOUNDS,
  text,
  type EfficiencyMessageKey,
} from './schema';
import type { EfficiencyState } from './state';

/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 기계 이름 글자 크기(화면 px). 양 이름표보다 한 단 크다. */
const NAME_PX = 14;
/** 들어가는 띠 · 샌 갈래의 짙기. 배경 정보라 쓸모 갈래보다 물러나 있다. */
const BAND_FILL = 0.42;
/** 쓸모 갈래의 짙기. 다크 바탕에서도 또렷해야 한다. */
const USEFUL_FILL = 0.85;
/** 흐르는 점의 크기(화면 px)와 인스턴스 짙기. 띠의 결이지 주인공이 아니다. */
const DOT_PX = 1.6;
const DOT_OPACITY = 0.6;

interface Machine {
  id: string;
  name: EfficiencyMessageKey;
  origin: number;
  inJ: number;
  outJ: number;
}

export function scene(params: {
  state: EfficiencyState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('efficiency: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const m = matchProgress(timeline);
  const target = Math.max(c.inA, c.inB);

  const machines: Machine[] = [
    { id: 'a', name: 'label.machineA', origin: ORIGIN_A, inJ: c.inA, outJ: c.outA },
    { id: 'b', name: 'label.machineB', origin: ORIGIN_B, inJ: c.inB, outJ: c.outB },
  ];

  // 이름표는 맞추는 동작의 한가운데에서 J → % 로 바뀐다. 입구를 같은 굵기로 맞춘 뒤에는
  // 「몇 J」 가 아니라 「넣은 것의 몇 %」 가 화면이 말하는 값이다. 둘이 동시에 뜨지 않게
  // 가운데에서 0 을 지난다.
  const asPercent = m >= 0.5;
  const labelAlpha = Math.abs(1 - 2 * m);

  const bands: Primitive[] = [];
  const dotPositions: Vec2[] = [];
  const dotOpacities: number[] = [];
  const covers: Primitive[] = [];

  for (const mc of machines) {
    const shape = flowShape(mc.origin, mc.inJ, mc.outJ, gainFor(mc.inJ, target, m), timeline.t);
    const lossJ = mc.inJ - mc.outJ;

    // ---- 띠 ----
    bands.push(
      {
        type: 'region',
        id: `inlet-${mc.id}`,
        points: shape.inlet,
        fillOpacity: BAND_FILL,
        opaque: true,
        style: { colorRole: 'muted', emphasis: 'strong' },
      },
      {
        type: 'region',
        id: `loss-${mc.id}`,
        points: shape.loss,
        fill: 'hatch',
        fillOpacity: BAND_FILL,
        opaque: true,
        style: { colorRole: 'muted', emphasis: 'strong' },
      },
      {
        type: 'region',
        id: `useful-${mc.id}`,
        points: shape.useful,
        fillOpacity: USEFUL_FILL,
        opaque: true,
        style: { colorRole: 'accent', emphasis: 'strong' },
      },
    );

    dotPositions.push(...shape.dots);
    dotOpacities.push(...shape.dotOpacities);

    // ---- 기계 상자 · 이름 ----
    covers.push(
      {
        type: 'region',
        id: `machine-${mc.id}`,
        points: shape.machine,
        fillOpacity: 1,
        style: { colorRole: 'ink', emphasis: 'strong' },
      },
      {
        type: 'readout',
        id: `name-${mc.id}`,
        anchor: { world: shape.nameAt },
        text: text(mc.name),
        chip: false,
        fontSize: NAME_PX,
        font: 'text',
        weight: 'bold',
        align: 'center',
        style: { colorRole: 'ink', emphasis: 'strong' },
      },
    );

    // ---- 양 이름표 ----
    const amount = (id: string, at: Vec2, joules: number, pct: string, align: 'left' | 'center') =>
      ({
        type: 'readout',
        id: `${id}-${mc.id}`,
        anchor: { world: at },
        text: asPercent ? text('label.percent') : text('label.joules'),
        vars: { v: asPercent ? pct : String(joules) },
        chip: false,
        fontSize: LABEL_PX,
        align,
        opacity: labelAlpha,
        style: { colorRole: 'ink', emphasis: 'strong' },
      }) satisfies Primitive;

    covers.push(
      amount('in', shape.inletLabelAt, mc.inJ, '100', 'left'),
      {
        ...amount('out', shape.usefulLabelAt, mc.outJ, percentText(mc.outJ, mc.inJ), 'left'),
        weight: 'bold',
        style: { colorRole: 'accent', emphasis: 'strong' },
      },
      amount('lost', shape.lossLabelAt, lossJ, percentText(lossJ, mc.inJ), 'center'),
    );
  }

  // 점은 띠 위, 기계 상자 아래 — 기계 안으로 들어갔다가 갈래로 나오는 것으로 읽힌다.
  return [
    ...bands,
    {
      type: 'particleSystem',
      id: 'energy-dots',
      positions: dotPositions,
      opacities: dotOpacities,
      sizes: DOT_PX,
      opacity: DOT_OPACITY,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    ...covers,
  ];
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
