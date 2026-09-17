// ========================================================================
// interference — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 수면은 스칼라 장인데 그것을 칠하는 어휘가 없어
// **`region` 칸 격자**로 근사한다 — 칸마다 그 자리 높이를 한 색의 빛의 양
// (`luminance`)으로 준다. 마루는 옅게, 골은 짙게, 가만한 수면은 중간 짙기다.
// 두 파원은 `body` 원이고, 켜짐 · 꺼짐은 색이 아니라 채움 · 테두리로 가른다.
// NOTES 「어휘 부족」.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Region,
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
  TONE_MID,
  TONE_SPAN_CREST,
  TONE_SPAN_TROUGH,
  WATER_H,
  WATER_W,
  WAVE_SPEED,
} from './schema';
import type { InterferenceState } from './state';

/**
 * 칸끼리 겹치는 폭(월드). 이음매에 바탕이 실금으로 비치지 않게 칸을 조금 키운다.
 * 칸이 단색 불투명 채움이라 겹친 곳이 짙어지지 않는다 — 나중 칸이 덮는다.
 */
const CELL_OVERLAP = 0.8;

/** 칸 하나 — 기하는 시간과 무관하므로 한 번만 만든다. */
interface Cell {
  id: string;
  points: readonly Vec2[];
  r1: number;
  r2: number;
}

function buildCells(): readonly Cell[] {
  const cols = Math.ceil(WATER_W / CELL);
  const rows = Math.ceil(WATER_H / CELL);
  const out: Cell[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x0 = i * CELL;
      const y0 = j * CELL;
      const x1 = Math.min(WATER_W, x0 + CELL + CELL_OVERLAP);
      const y1 = Math.min(WATER_H, y0 + CELL + CELL_OVERLAP);
      const center: Vec2 = [x0 + CELL / 2, y0 + CELL / 2];
      out.push({
        id: `water-${i}-${j}`,
        points: [
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ],
        r1: distance(center, SOURCE_1),
        r2: distance(center, SOURCE_2),
      });
    }
  }
  return out;
}

/** 모듈 상수다 — 인스턴스 상태가 아니라 선언에서 나온 고정 기하다 (원칙 6). */
const CELLS = buildCells();

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
  // 마디선도 긋지 않는다. 잠잠한 자리는 늘 중간 짙기로 남아 멈춰 보인다.
  for (const cell of CELLS) {
    const v = Math.tanh(heightAt(cell.r1, cell.r2, timeline.t, front, tail) * TONE_GAIN);
    const water: Region = {
      type: 'region',
      id: cell.id,
      points: cell.points,
      // 단색으로 꽉 채운다. 알파로 섞으면 칸 가장자리의 안티에일리어싱이 바탕을
      // 비쳐 격자 무늬가 생긴다 — 톤은 알파가 아니라 `luminance` 로 준다.
      fillOpacity: 1,
      luminance: TONE_MID - (v >= 0 ? TONE_SPAN_CREST : TONE_SPAN_TROUGH) * v,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    };
    out.push(water);
  }

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
