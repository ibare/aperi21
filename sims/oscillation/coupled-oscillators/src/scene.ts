// ========================================================================
// coupled-oscillators — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 천장 보(`surface`) · 줄과 용수철(`constraint`) ·
// 추(`body`) · 처음 폭과 지난 흔들림의 호(`trajectory`) · 에너지 막대의 두 몫
// (`region`) · 몫의 경계(`trajectory`) · 막대 이름(`readout`) 이 모두 표준 어휘다.
//
// 색: 보 · 줄 · 추는 먹색(같은 장치), 용수철은 회색, 흔들림 호와 막대는 같은
// 보조색(둘 다 「흔들림의 크기」). 두 진자의 몫은 색이 아니라 결로 가른다 —
// 왼쪽 채움, 오른쪽 빗금. 강조색은 **몫의 경계** 한 가지 뜻에만 쓴다. 그 경계가
// 미끄러지는 것이 곧 「옮겨 간다」 다.
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
import { bobAt, derive, readConstants, type Pendulum } from './physics';
import {
  ARC_GAP,
  BAR_H,
  BAR_HALF_W,
  BAR_Y,
  BEAM_HALF_W,
  BOB_RADIUS,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { CoupledOscillatorsState } from './state';

/** 처음 폭 호의 표본 수. */
const GUIDE_SAMPLES = 24;
/** 경계 표지가 막대 위아래로 나가는 길이(월드). */
const DIVIDER_OVERHANG = 0.022;
/** 막대 이름을 막대 왼쪽 끝에서 띄우는 거리(화면 px). */
const BAR_LABEL_OFFSET: Vec2 = [-10, 0];
/** 이보다 얇은 몫은 칸을 두지 않는다(막대 폭 대비). 0 폭 다각형을 그리지 않으려는 것. */
const MIN_SHARE = 0.002;

const rect = (x0: number, x1: number, y0: number, y1: number): Vec2[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

/** 매단 점을 중심으로 반지름 r 의 호 — 각 목록을 따라. */
const arcPoints = (pivot: Vec2, r: number, thetas: readonly number[]): Vec2[] =>
  thetas.map((th) => bobAt(pivot, th, r));

export function scene(params: {
  state: CoupledOscillatorsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('coupled-oscillators: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const swing = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];
  const pendulums: readonly [string, Pendulum][] = [
    ['left', r.left],
    ['right', r.right],
  ];
  const arcR = r.length + ARC_GAP;

  // ---- 흔들림의 폭 ----
  // 점선 호는 처음 흔들어 놓은 폭이다. 두 진자 밑에 같은 것을 둔다 — 오른쪽 흔들림이
  // 이 점선 끝까지 닿는 것이 「통째로 옮겨 갔다」 다.
  // 그 위의 옅어지는 호는 지난 한 번 흔들림 동안 추가 지나간 자리다. 멈춘 화면에서도
  // 지금 얼마나 흔들리는지가 호의 길이로 보인다.
  for (const [side, p] of pendulums) {
    const guide: number[] = [];
    for (let i = 0; i <= GUIDE_SAMPLES; i++) {
      guide.push(-r.amplitude + (2 * r.amplitude * i) / GUIDE_SAMPLES);
    }
    g.push({
      type: 'trajectory',
      id: `reach-${side}`,
      points: arcPoints(p.pivot, arcR, guide),
      width: 1,
      style: { ...muted, lineStyle: 'dashed' },
    });
    g.push({
      type: 'trajectory',
      id: `sweep-${side}`,
      points: arcPoints(p.pivot, arcR, p.sweep),
      width: 3,
      style: { ...swing, fade: 'tail' },
    });
  }

  // ---- 천장 보 · 매단 줄 ----
  g.push({
    type: 'surface',
    id: 'beam',
    geometry: { kind: 'wall', from: [-BEAM_HALF_W, 0], to: [BEAM_HALF_W, 0] },
    material: 'solid',
  });
  const bobs: Vec2[] = pendulums.map(([, p]) => bobAt(p.pivot, p.theta, r.length));
  pendulums.forEach(([side, p], i) => {
    g.push({
      type: 'constraint',
      id: `string-${side}`,
      subtype: 'string',
      from: p.pivot,
      to: bobs[i]!,
      style: ink,
    });
  });

  // ---- 두 추를 잇는 약한 용수철 ----
  // 추보다 먼저 선언해 끝이 추 뒤로 들어간다 (`drawOrder: 'scene'`).
  g.push({
    type: 'constraint',
    id: 'coupling',
    subtype: 'spring',
    from: bobs[0]!,
    to: bobs[1]!,
    coils: 7,
    style: muted,
  });

  // ---- 추 ----
  pendulums.forEach(([side], i) => {
    g.push({
      type: 'body',
      id: `bob-${side}`,
      pos: bobs[i]!,
      shape: 'circle',
      size: BOB_RADIUS,
      glow: false,
      style: ink,
    });
  });

  // ---- 에너지 막대 — 막대 하나를 두 진자가 나눠 가진다 ----
  // 길이는 늘 같다(합이 그대로). 왼쪽 채움이 왼쪽 진자, 오른쪽 빗금이 오른쪽 진자의
  // 몫이다. 같은 에너지의 다른 몫이라 색이 같고 결로 가른다 (S-piece).
  const x0 = -BAR_HALF_W;
  const x1 = BAR_HALF_W;
  const split = x0 + (x1 - x0) * r.left.share;
  if (r.left.share > MIN_SHARE) {
    g.push({
      type: 'region',
      id: 'share-left',
      points: rect(x0, split, BAR_Y, BAR_Y + BAR_H),
      fillOpacity: 0.55,
      opaque: true,
      style: swing,
    });
  }
  if (r.right.share > MIN_SHARE) {
    g.push({
      type: 'region',
      id: 'share-right',
      points: rect(split, x1, BAR_Y, BAR_Y + BAR_H),
      fill: 'hatch',
      fillOpacity: 0.55,
      opaque: true,
      style: swing,
    });
  }
  // 막대의 제 길이 — 몫이 한쪽으로 몰려도 막대 전체가 어디까지인지 남긴다.
  g.push({
    type: 'trajectory',
    id: 'bar-outline',
    points: rect(x0, x1, BAR_Y, BAR_Y + BAR_H),
    closed: true,
    width: 1,
    style: muted,
  });
  // 몫의 경계. 강조색은 이 한 뜻에만.
  g.push({
    type: 'trajectory',
    id: 'share-divider',
    points: [
      [split, BAR_Y - DIVIDER_OVERHANG],
      [split, BAR_Y + BAR_H + DIVIDER_OVERHANG],
    ],
    width: 3,
    style: accent,
  });
  g.push({
    type: 'readout',
    id: 'energy-label',
    anchor: { world: [x0, BAR_Y + BAR_H / 2], offset: BAR_LABEL_OFFSET },
    text: text('label.energy'),
    chip: false,
    font: 'text',
    fontSize: 13,
    align: 'right',
    style: ink,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
