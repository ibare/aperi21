// ========================================================================
// physical-pendulum — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 막대(`body` rod) · 핀과 질량 중심(`body` circle) ·
// 핀에서 질량 중심까지 d(`trajectory`) · 돌아온 순간의 고리와 흔든 횟수 점(`trace`) ·
// 매단 자리 이름표(`readout`)가 모두 표준 어휘로 있다.
//
// 색: 네 막대는 같은 먹색(같은 물체). 강조색은 **매단 자리** 한 가지 뜻에만 쓴다 —
// 핀에서 질량 중심까지의 선분 d. 돌아온 고리 · 횟수 점은 보조색(박자의 기록).
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
import { derive, readConstants } from './physics';
import {
  D_LABELS,
  COLUMN_X,
  COUNT_GAP,
  COUNT_Y,
  LABEL_Y,
  PIVOT_Y,
  ROD_WIDTH,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { PhysicalPendulumState } from './state';

/** 핀 · 질량 중심 표지의 반지름(m). */
const PIN_RADIUS = 0.042;
const CM_RADIUS = 0.026;
/** 돌아온 고리 — 수명(초)과 처음 · 끝 반지름(화면 px). */
const RETURN_LIFE = 1.1;
const RETURN_SIZE = 5;
const RETURN_SPREAD = 17;
/** 횟수 점 반지름(화면 px). */
const COUNT_DOT = 3;
/** 횟수 점 줄이 핀 x 에서 왼쪽으로 물러나 시작하는 거리(m). */
const COUNT_INSET = 0.3;

const down = (theta: number): Vec2 => [Math.sin(theta), -Math.cos(theta)];
const add = (p: Vec2, v: Vec2, k = 1): Vec2 => [p[0] + v[0] * k, p[1] + v[1] * k];

export function scene(params: {
  state: PhysicalPendulumState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('physical-pendulum: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const op = r.opacity;
  const L = c.rodLength;

  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const record = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  const returns: { pos: Vec2; age: number }[] = [];
  const counts: { pos: Vec2 }[] = [];

  r.rods.forEach((rod, i) => {
    const x = COLUMN_X[i] ?? 0;
    const pin: Vec2 = [x, PIVOT_Y];
    const e = down(rod.theta);
    const cm = add(pin, e, rod.d);

    // ---- 막대 ----
    g.push({
      type: 'body',
      id: `rod-${i}`,
      pos: cm,
      shape: 'rod',
      size: [L, ROD_WIDTH],
      orientation: rod.theta - Math.PI / 2,
      // 속을 비운다 — 안에 놓인 강조색 d 가 바탕 위에서 읽혀야 한다. 짙은 막대 위에서는
      // 다크 테마에서 밝은 막대에 묻혔다.
      fill: 'none',
      outline: 'role',
      opacity: op,
      style: ink,
    });

    // ---- 매단 자리 — 핀에서 질량 중심까지 d ----
    g.push({
      type: 'trajectory',
      id: `arm-${i}`,
      points: [pin, cm],
      width: 3,
      opacity: op,
      style: accent,
    });
    g.push({
      type: 'body',
      id: `cm-${i}`,
      pos: cm,
      shape: 'circle',
      size: CM_RADIUS,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: op,
      style: ink,
    });
    g.push({
      type: 'body',
      id: `pin-${i}`,
      pos: pin,
      shape: 'circle',
      size: PIN_RADIUS,
      outline: 'background',
      glow: false,
      opacity: op,
      style: muted,
    });

    // ---- 박자의 기록 ----
    // 놓은 자리로 돌아온 순간 아래 끝에 고리가 퍼진다. 흔든 번 수는 아래 점 줄로 남는다.
    if (rod.sinceReturn !== undefined && rod.sinceReturn < RETURN_LIFE) {
      returns.push({ pos: add(pin, down(c.release), L / 2 + rod.d), age: rod.sinceReturn });
    }
    for (let n = 0; n < rod.swings; n++) {
      counts.push({ pos: [x - COUNT_INSET + n * COUNT_GAP, COUNT_Y] });
    }

    // ---- 매단 자리 이름표 ----
    g.push({
      type: 'readout',
      id: `d-label-${i}`,
      anchor: { world: [x, LABEL_Y] },
      text: text(D_LABELS[i]!),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: 13,
      align: 'center',
      opacity: op,
      style: muted,
    });
  });

  g.push({
    type: 'trace',
    id: 'returns',
    marks: returns,
    life: RETURN_LIFE,
    shape: 'ring',
    size: RETURN_SIZE,
    spreadTo: RETURN_SPREAD,
    width: 2,
    opacity: op,
    style: record,
  });
  g.push({
    type: 'trace',
    id: 'swing-counts',
    marks: counts,
    shape: 'dot',
    size: COUNT_DOT,
    opacity: op,
    style: record,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
