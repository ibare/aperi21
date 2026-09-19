// ========================================================================
// charge-on-conductor-surface — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 도체(`region` 면 + `trajectory` 닫힌 둘레) · + 전하(`lineSet`
// 십자 묶음) · 견줄 두 호(`trajectory`) · 호 이름표(`readout`) · 장 화살표(`vector`)가
// 모두 표준 어휘로 있다.
//
// 색: + 전하는 모두 같은 먹색이다. 뾰족한 끝의 전하를 다르게 칠하면 「그 전하만 다른
// 것」 으로 읽힌다 — 다른 것은 **간격**뿐이어야 한다 (S-piece). 강조색은 견줄 두 호
// 한 가지 뜻에만 쓴다. 장 화살표는 보조색이다.
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
import { framesAt } from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { ChargeOnConductorSurfaceState } from './state';

/** + 십자의 팔 길이(월드, 가운데에서 끝까지). 뾰족한 끝의 알갱이 간격보다 작아야 서로 붙지 않는다. */
const PLUS_ARM = 0.034;
/** + 십자 획 굵기(화면 px). */
const PLUS_WIDTH_PX = 2;
/** 도체 둘레 굵기(화면 px). */
const OUTLINE_WIDTH_PX = 2;
/** 도체 면의 채움 불투명도. */
const BODY_FILL_OPACITY = 0.35;
/** 견줄 호의 굵기(화면 px). */
const ARC_WIDTH_PX = 4;
/** 호 이름표 — 호의 바깥 끝에서 옆으로 띄우는 거리(월드)와 글자 크기(화면 px). */
const TAG_GAP = 0.1;
const TAG_PX = 13;
/** 장 화살표 굵기(화면 px)와 머리 크기(월드). */
const ARROW_WIDTH_PX = 2;
const ARROW_HEAD = 0.07;

export function scene(params: {
  state: ChargeOnConductorSurfaceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline: tl } = params;
  if (!tl) throw new Error('charge-on-conductor-surface: schema.timeline 이 선언되어야 한다');
  const op = tl.at('appear') * (1 - tl.at('fade'));
  const arcOp = op * tl.at('mark') * (1 - tl.at('fieldIn'));
  const grow = tl.at('fieldIn');
  const g: Primitive[] = [];

  // ---- 도체 ----
  g.push({
    type: 'region',
    id: 'conductor',
    points: state.outline,
    fillOpacity: BODY_FILL_OPACITY,
    opacity: op,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });
  g.push({
    type: 'trajectory',
    id: 'conductor-edge',
    points: state.outline,
    closed: true,
    width: OUTLINE_WIDTH_PX,
    opacity: op,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 견줄 두 호와 이름표 ----
  // 뾰족한 끝은 오른쪽, 뭉툭한 끝은 왼쪽에 있다 — 이름표를 호 바깥 옆에 둔다.
  const arcs: { id: string; points: Vec2[]; tag: 'tag.tip' | 'tag.blunt'; side: 1 | -1 }[] = [
    { id: 'tip', points: state.tipArc, tag: 'tag.tip', side: 1 },
    { id: 'blunt', points: state.bluntArc, tag: 'tag.blunt', side: -1 },
  ];
  for (const a of arcs) {
    g.push({
      type: 'trajectory',
      id: `arc-${a.id}`,
      points: a.points,
      width: ARC_WIDTH_PX,
      opacity: arcOp,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    const outer = a.points.reduce((m, p) => (p[0] * a.side > m[0] * a.side ? p : m), a.points[0] ?? [0, 0]);
    g.push({
      type: 'readout',
      id: `arc-tag-${a.id}`,
      anchor: { world: [outer[0] + a.side * TAG_GAP, outer[1]] },
      text: text(a.tag),
      chip: false,
      font: 'text',
      fontSize: TAG_PX,
      align: a.side > 0 ? 'left' : 'right',
      opacity: arcOp,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 장 화살표(겉면 바로 바깥) ----
  if (grow > 0) {
    state.arrows.forEach((a, i) => {
      g.push({
        type: 'vector',
        id: `field-${i}`,
        from: a.from,
        delta: [a.delta[0] * grow, a.delta[1] * grow],
        width: ARROW_WIDTH_PX,
        headSize: ARROW_HEAD,
        opacity: op,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
    });
  }

  // ---- + 전하(이완 경로를 spread 진행도로 되감는다) ----
  const charges = framesAt(state.frames, tl.at('spread'));
  g.push({
    type: 'lineSet',
    id: 'charges',
    lines: charges.flatMap(([x, y]): Vec2[][] => [
      [
        [x - PLUS_ARM, y],
        [x + PLUS_ARM, y],
      ],
      [
        [x, y - PLUS_ARM],
        [x, y + PLUS_ARM],
      ],
    ]),
    width: PLUS_WIDTH_PX,
    opacity: op,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
