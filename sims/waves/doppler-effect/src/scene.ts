// ========================================================================
// doppler-effect — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 이 조각은 자유 렌더 계층을 쓰지 않는다. 파면과 방출점이 **같은 방출 이력을
// 보는 `trace` 두 개**이고(퍼지는 원 / 남는 점), 원천은 `body` 의 custom 외형이다.
//
// 파면을 기성품 「파동」 어휘로 그리지 않는 것이 이 조각의 조건이었다 — 동심원을
// 통째로 받아 오면 방출점이 사라지고, 방출점이 사라지면 촘촘한 앞쪽은 그냥
// "앞쪽 파동이 짧아졌다" 로 읽힌다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  AMBULANCE_PATH,
  AXIS_Y,
  EMISSION_DOT_PX,
  EMISSION_OPACITY,
  FRONT_LIFE,
  FRONT_OPACITY,
  RING_SPREAD_PX,
  RING_WIDTH_PX,
  SCENE_BOUNDS,
} from './schema';
import type { DopplerEffectState } from './state';

export function scene(params: {
  state: DopplerEffectState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state } = params;
  const out: Primitive[] = [];

  // 자국 하나가 방출 사건 하나다. 아래 둘이 **같은 목록**을 보므로 파면과 그
  // 방출점은 함께 태어나 함께 늙는다.
  const marks: Trace['marks'] = state.fronts.map((f) => ({
    pos: [f.x, AXIS_Y] as Vec2,
    age: state.t - f.t0,
  }));

  // ---- 파면 ----
  // 나이와 함께 `size`(0)에서 `spreadTo` 까지 퍼지는 원. 채우지 않는다 —
  // 촘촘한 쪽에서 간격이 유지되려면 선이 얇아야 하고, 채우면 겹침이 색 덩어리가
  // 되어 「간격」이 사라진다.
  const fronts: Trace = {
    type: 'trace',
    id: 'fronts',
    marks,
    life: FRONT_LIFE,
    shape: 'ring',
    size: 0,
    spreadTo: RING_SPREAD_PX,
    width: RING_WIDTH_PX,
    opacity: FRONT_OPACITY,
    style: { colorRole: 'ink', emphasis: 'medium' },
  };
  out.push(fronts);

  // ---- 방출점 ----
  // 같은 목록을 점으로 한 번 더. **같은 잉크색이다** — 하나의 방출 사건이라는
  // 같은 대상의 두 부분이라 색을 나누지 않는다 (S-piece: 색으로 설명하지 않는다).
  // 멈춰 있을 때는 한자리에 겹쳐 있다가 달리기 시작하면 줄로 갈라진다.
  const emissions: Trace = {
    type: 'trace',
    id: 'emissions',
    marks,
    life: FRONT_LIFE,
    shape: 'dot',
    size: EMISSION_DOT_PX,
    opacity: EMISSION_OPACITY,
    style: { colorRole: 'ink', emphasis: 'medium' },
  };
  out.push(emissions);

  // ---- 구급차 ----
  // 강조색을 쓰는 **유일한** 요소. 강조색의 뜻은 「원천」 하나다.
  const source: Body = {
    type: 'body',
    id: 'source',
    pos: [state.x, AXIS_Y],
    shape: 'custom',
    customPath: AMBULANCE_PATH,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(source);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/**
 * 고정 경계. 상태를 보지 않으므로 매 프레임 같은 값이다 — 카메라가 흔들리지
 * 않고(원칙 6), 프레이밍이 선언에 있다(S-piece).
 *
 * 파면 반지름이 화면 px 라 이 경계는 배율이 `PX_PER_WORLD` 가 되도록 맞춰져
 * 있다. 그 묶임의 이유는 `schema.ts` 머리와 NOTES 「어휘 부족」에 있다.
 */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
