// ========================================================================
// field-of-loop-and-solenoid — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 고리 축을 품은 단면이다. 화면에 서는 것은 넷이다.
//
// - 장선 — 배치(고리 하나 · 몇 개 · 많이)마다 `lineSet` 하나. 고리를 더 놓는 동안
//   앞 배치의 선이 옅어지고 다음 배치의 선이 짙어진다.
// - 화살표 — 격자 자리마다 `vector`. 장은 전류에 비례해 겹치므로 고리를 더 놓는 동안의
//   장은 두 배치의 장을 진행도로 섞은 것이 **정확히** 그 순간의 장이다(새 고리의 전류가
//   0 에서 오른다).
// - 고리 윤곽 — 도선 위 · 아래 단면을 잇는 옅은 세로 타원. 두 점이 한 고리라는 것을 보인다.
// - 단면 기호 — 위 도선 ⊙(전류가 화면 밖으로) · 아래 도선 ⊗(안으로). 강조색은 여기 한
//   뜻(전류가 흐르는 도선)에만 쓴다. 새 고리의 기호는 그 전류만큼 짙다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  LineSet,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { arrowAt, readConstants, type LoopConfig } from './physics';
import { FIELD_CLIP, SCENE_BOUNDS } from './schema';
import type { FieldOfLoopAndSolenoidState } from './state';

/** 장선 굵기(화면 px). */
const FIELD_LINE_PX = 1.4;
/** 화살표 굵기(화면 px). 장선보다 굵어야 선 위에서 화살표로 읽힌다. */
const ARROW_PX = 2;
/** 고리 윤곽 굵기(화면 px)와 불투명도. 배경 정보라 옅다. */
const LOOP_OUTLINE_PX = 1;
const LOOP_OUTLINE_OPACITY = 0.55;
/** ⊗ 가위표 굵기(화면 px). */
const CROSS_PX = 1.6;
/** ⊙ 가운데 점의 반지름 · ⊗ 가위표 팔 길이 — 기호 원 반지름에 대한 비. */
const DOT_RATIO = 0.36;
const CROSS_RATIO = 0.62;
/** 고리 윤곽 타원을 이루는 꼭짓점 수. */
const LOOP_SEGMENTS = 40;
/** 이보다 옅은 배치 · 기호는 선언하지 않는다. */
const MIN_WEIGHT = 0.01;
/** 두 고리 자리를 같은 자리로 보는 거리 — 고리 간격에 대한 비. */
const SAME_SPOT_RATIO = 0.25;

/** 세 배치의 무게 — 한 순간에 많아야 둘이 0 이 아니고, 합은 1 이다. */
function weights(tl: TimelineFrame | undefined): { one: number; few: number; many: number } {
  if (!tl) return { one: 1, few: 0, many: 0 };
  const back = tl.at('reset');
  if (back > 0) return { one: back, few: 0, many: 1 - back };
  const toMany = tl.at('addMany');
  if (toMany > 0) return { one: 0, few: 1 - toMany, many: toMany };
  const toFew = tl.at('addFew');
  return { one: 1 - toFew, few: toFew, many: 0 };
}

/** 배치에 그 자리의 고리가 있는지. 같은 간격으로 가운데에 맞춰 놓으므로 자리가 겹친다. */
function has(config: LoopConfig, x: number, eps: number): boolean {
  return config.loops.some((x0) => Math.abs(x0 - x) < eps);
}

function ellipse(x: number, halfWidth: number, radius: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i <= LOOP_SEGMENTS; i++) {
    const a = (i * 2 * Math.PI) / LOOP_SEGMENTS;
    pts.push([x + halfWidth * Math.cos(a), radius * Math.sin(a)]);
  }
  return pts;
}

export function scene(params: {
  state: FieldOfLoopAndSolenoidState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  const c = readConstants(stage);
  const w = weights(timeline);
  const configs: readonly (readonly [string, LoopConfig, number])[] = [
    ['one', state.one, w.one],
    ['few', state.few, w.few],
    ['many', state.many, w.many],
  ];
  const out: Primitive[] = [];

  // ---- 장선 ----
  // 같은 대상(자기장)이라 배치가 달라도 같은 색이다. 무게만큼 짙다.
  for (const [name, config, weight] of configs) {
    if (weight < MIN_WEIGHT) continue;
    const lines: LineSet = {
      type: 'lineSet',
      id: `lines-${name}`,
      lines: config.lines,
      width: FIELD_LINE_PX,
      opacity: weight,
      clip: { min: FIELD_CLIP.min, max: FIELD_CLIP.max },
      style: { colorRole: 'secondary', emphasis: 'strong' },
    };
    out.push(lines);
  }

  // ---- 고리 · 단면 기호 ----
  // 고리 자리의 합집합. 자리마다 짙기 = 그 고리를 가진 배치들의 무게 합 = 그 고리의 전류 몫.
  const eps = c.loopSpacing * SAME_SPOT_RATIO;
  const spots: number[] = [];
  for (const [, config] of configs) {
    for (const x of config.loops) if (!spots.some((s) => Math.abs(s - x) < eps)) spots.push(x);
  }
  spots.sort((a, b) => a - b);
  const strength = spots.map((x) =>
    configs.reduce((sum, [, config, weight]) => sum + (has(config, x, eps) ? weight : 0), 0),
  );

  const outlines: LineSet = {
    type: 'lineSet',
    id: 'loop-outlines',
    lines: spots.map((x) => ellipse(x, c.loopTilt, c.loopRadius)),
    opacities: strength,
    width: LOOP_OUTLINE_PX,
    opacity: LOOP_OUTLINE_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(outlines);

  const arm = c.wireMark * CROSS_RATIO * Math.SQRT1_2;
  const crosses: Vec2[][] = [];
  const crossOpacity: number[] = [];
  spots.forEach((x, i) => {
    const s = strength[i] ?? 0;
    if (s < MIN_WEIGHT) return;
    const top: Vec2 = [x, c.loopRadius];
    const bottom: Vec2 = [x, -c.loopRadius];
    for (const [id, pos] of [
      [`wire-out-${i}`, top],
      [`wire-in-${i}`, bottom],
    ] as const) {
      const ring: Body = {
        type: 'body',
        id,
        pos,
        shape: 'circle',
        size: c.wireMark,
        fill: 'none',
        outline: 'role',
        opacity: s,
        style: { colorRole: 'accent', emphasis: 'strong' },
      };
      out.push(ring);
    }
    // ⊙ — 전류가 화면 밖으로.
    const dot: Body = {
      type: 'body',
      id: `wire-out-dot-${i}`,
      pos: top,
      shape: 'circle',
      size: c.wireMark * DOT_RATIO,
      outline: 'none',
      glow: false,
      opacity: s,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(dot);
    // ⊗ — 전류가 화면 안으로.
    crosses.push(
      [
        [bottom[0] - arm, bottom[1] - arm],
        [bottom[0] + arm, bottom[1] + arm],
      ],
      [
        [bottom[0] - arm, bottom[1] + arm],
        [bottom[0] + arm, bottom[1] - arm],
      ],
    );
    crossOpacity.push(s, s);
  });
  const cross: LineSet = {
    type: 'lineSet',
    id: 'wire-in-crosses',
    lines: crosses,
    opacities: crossOpacity,
    width: CROSS_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(cross);

  // ---- 화살표 ----
  // 격자 자리마다 지금 장. 두 배치의 장을 무게로 섞는 것이 전류가 오르는 동안의 장이다.
  state.grid.forEach((p, i) => {
    let bx = 0;
    let by = 0;
    for (const [, config, weight] of configs) {
      const b = config.field[i];
      if (!b || weight === 0) continue;
      bx += weight * b[0];
      by += weight * b[1];
    }
    const { from, delta } = arrowAt(p, [bx, by], c);
    const arrow: Vector = {
      type: 'vector',
      id: `b-${i}`,
      from,
      delta,
      width: ARROW_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(arrow);
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
