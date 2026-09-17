// ========================================================================
// interference — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 수면은 스칼라 장이라 **`scalarField` 하나**로 선언한다 —
// 원본처럼 2 월드 칸 격자에서 높이를 계산하고, 렌더러가 이미지 한 장으로 부드럽게 늘려 그린다.
// 두 파원은 `body` 원이고, 켜짐 · 꺼짐은 색이 아니라 채움 · 테두리로 가른다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  ScalarField,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { distance, heightAt } from './physics';
import {
  CELL,
  SCENE_BOUNDS,
  SOURCE_1,
  SOURCE_2,
  SOURCE_RADIUS,
  TONE_GAIN,
  WATER_H,
  WATER_W,
  WAVE_SPEED,
} from './schema';
import type { InterferenceState } from './state';

/** 수면 격자 가로 · 세로 칸 수. 원본 2 px 칸 그대로 430 × 170. */
const COLS = Math.round(WATER_W / CELL);
const ROWS = Math.round(WATER_H / CELL);

/**
 * 칸 가운데에서 두 파원까지 거리 — 시간과 무관한 고정 기하라 한 번만 계산한다.
 * 순서는 `scalarField.values` 와 같다: 행 우선, 첫 행이 월드 위쪽.
 * 모듈 상수다 — 인스턴스 상태가 아니라 선언에서 나온 고정 기하다 (원칙 6).
 */
function buildDistances(source: Vec2): Float32Array {
  const out = new Float32Array(COLS * ROWS);
  for (let j = 0; j < ROWS; j++) {
    const y = WATER_H - (j + 0.5) * CELL;
    for (let i = 0; i < COLS; i++) {
      out[j * COLS + i] = distance([(i + 0.5) * CELL, y], source);
    }
  }
  return out;
}
const R1 = buildDistances(SOURCE_1);
const R2 = buildDistances(SOURCE_2);

export function scene(params: {
  state: InterferenceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('interference: schema.timeline 이 선언되어야 한다');
  const out: Primitive[] = [];

  // 둘째 물결의 앞머리 · 꼬리. 켜짐 · 꺼짐 시각은 시간표 단계의 시작이다.
  const on = timeline.start('spread');
  const off = timeline.start('withdraw');
  const front = timeline.u >= on ? (timeline.u - on) * WAVE_SPEED : null;
  const tail = timeline.u >= off ? (timeline.u - off) * WAVE_SPEED : null;

  // ---- 수면 ----
  // 합만 그린다. 두 물결을 따로 그리거나 다른 색으로 칠하지 않는다 — 같은 물이다.
  // 마디선도 긋지 않는다. 잠잠한 자리는 늘 바탕 그대로 남아 멈춰 보인다.
  // 값은 tanh 로 누른 높이(−1 ~ 1). 발산형이라 0 이 바탕이고, 마루 · 골 모두 같은 물빛
  // (`secondary`)으로 짙어진다 — 한 가지 물빛만 쓴다. 마루와 골을 두 색으로 가르지 않는다.
  // 대신 마루 · 골의 명암 차이는 없어진다. NOTES 「수면 색」.
  const values = new Array<number>(COLS * ROWS);
  for (let k = 0; k < values.length; k++) {
    values[k] = Math.tanh(heightAt(R1[k]!, R2[k]!, timeline.t, front, tail) * TONE_GAIN);
  }
  const water: ScalarField = {
    type: 'scalarField',
    id: 'water',
    min: [0, 0],
    max: [WATER_W, WATER_H],
    cols: COLS,
    rows: ROWS,
    values,
    range: [-1, 1],
    colors: { low: 'secondary', high: 'secondary' },
  };
  out.push(water);

  // ---- 파원 ----
  // 강조색은 「파원」 한 뜻에만. 둘은 같은 대상이라 같은 색이고, 물결을 내는지는
  // 채움(냄) · 테두리(멈춤)로 가른다.
  const secondEmitting = timeline.phase === 'spread' || timeline.phase === 'hold';
  const source = (id: string, pos: Vec2, emitting: boolean): Body => ({
    type: 'body',
    id,
    pos,
    shape: 'circle',
    size: SOURCE_RADIUS,
    fill: emitting ? 'solid' : 'none',
    outline: emitting ? 'none' : 'role',
    glow: false,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push(source('source-1', SOURCE_1, true));
  out.push(source('source-2', SOURCE_2, secondEmitting));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 상태를 보지 않으므로 매 프레임 같다 — 카메라가 흔들리지 않는다. */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
