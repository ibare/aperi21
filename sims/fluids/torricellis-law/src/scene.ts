// ========================================================================
// torricellis-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 이 조각은 자유 렌더 계층을 쓰지 않는다. 물통(surface) · 물(region) ·
// 물줄기(stream) · 깊이(dimension) · 값(readout) · 표지(marker+trajectory) 가
// 모두 표준 어휘로 있다.
// ========================================================================

import type {
  EnvironmentDef,
  Marker,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  Stream,
  Surface,
  ViewDef,
  Vec2,
} from '@aperi21/schema';
import { pulseAge, readConstants, readings } from './physics';
import {
  DROPLET_LIFE,
  DROPLET_RATE,
  HOLE_GAP,
  SCENE_BOUNDS,
  TANK,
  text,
} from './schema';
import type { TorricellisLawState } from './state';

/** 물줄기 획 굵기(화면 px). */
const JET_WIDTH_PX = 2.4;
/** 물줄기 끝의 흩날림(화면 px). 출생 번호에서 뽑아 프레임마다 떨지 않는다. */
const JET_JITTER_PX = 5;
/** 수면 일렁임(화면 px). */
const RIPPLE_PX = 3;
/** 속도 라벨이 구멍 오른쪽으로 나오는 거리(화면 px). */
const SPEED_LABEL_OFFSET: Vec2 = [26, -12];
/** 캡션이 아래에서 올라온 자리(화면 px). */
const CAPTION_OFFSET: Vec2 = [0, -4];

function wall(id: string, from: Vec2, to: Vec2): Surface {
  return { type: 'surface', id, geometry: { kind: 'wall', from, to }, material: 'solid' };
}

export function scene(params: {
  state: TorricellisLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
}): SceneGraph {
  const { state, stage } = params;
  const c = readConstants(stage);
  const holes = readings(c);
  const out: Primitive[] = [];

  // ---- 물통 ----
  // 바닥을 그리지 않는다. 물통은 허공에 놓여 있고 물줄기가 닿는 면이 없다 —
  // 착지 지점이 존재하지 않으므로 비교할 대상도 없다 (NOTES.md 「함정」).
  out.push(wall('tank-left', [TANK.left, TANK.bottom], [TANK.left, TANK.top]));
  out.push(wall('tank-floor', [TANK.left, TANK.bottom], [TANK.wall, TANK.bottom]));

  // 오른쪽 벽은 구멍으로 끊긴다. 아래에서 위로 훑으며 사이를 잇는다.
  const cuts = holes.map((h) => h.y).sort((a, b) => a - b);
  let y = TANK.bottom;
  cuts.forEach((holeY, i) => {
    out.push(wall(`tank-right-${i}`, [TANK.wall, y], [TANK.wall, holeY - HOLE_GAP / 2]));
    y = holeY + HOLE_GAP / 2;
  });
  out.push(wall('tank-right-top', [TANK.wall, y], [TANK.wall, TANK.top]));

  // ---- 물 ----
  const water: Region = {
    type: 'region',
    id: 'water',
    points: [
      [TANK.left, TANK.bottom],
      [TANK.wall, TANK.bottom],
      [TANK.wall, c.waterLevel],
      [TANK.left, c.waterLevel],
    ],
    ripple: { edge: [2, 3], amplitude: RIPPLE_PX },
    outline: [[2, 3]],
    style: { colorRole: 'secondary', emphasis: 'medium' },
  };
  out.push(water);

  // ---- 물줄기 ----
  // 세 줄기를 **같은 색**으로 칠한다. 같은 물이기 때문이다. 줄기마다 색을 주면
  // "종류가 다른 셋" 으로 읽히고, 차이가 색으로 설명돼 버린다. 셋을 가르는 것은
  // 오직 운동이어야 한다.
  for (const h of holes) {
    const jet: Stream = {
      type: 'stream',
      id: `jet-${h.id}`,
      from: [TANK.wall, h.y],
      velocity: [h.speed, 0],
      acceleration: [0, -c.g],
      rate: DROPLET_RATE,
      // 수명이 셋 다 같다 = 화면의 모든 물방울은 "같은 시간 동안 날아간 것" 이다.
      // 그래서 더 멀리 뻗은 물줄기가 더 빠른 물줄기로 언제나 읽힌다.
      life: DROPLET_LIFE,
      width: JET_WIDTH_PX,
      jitter: JET_JITTER_PX,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    };
    out.push(jet);

    // 수면에서 구멍까지의 깊이 — ㄴ자로 꺾어 구멍에 직접 묶는다.
    out.push({
      type: 'dimension',
      id: `depth-${h.id}`,
      from: [h.depthInset, c.waterLevel],
      to: [TANK.wall, h.y],
      elbow: true,
      text: text('label.depth'),
      vars: { h: h.depth.toFixed(2) },
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // 구멍 옆 분출 속도.
    const speedLabel: Readout = {
      type: 'readout',
      id: `speed-${h.id}`,
      anchor: { world: [TANK.wall, h.y], offset: SPEED_LABEL_OFFSET },
      text: text('label.speed'),
      vars: { v: h.speed.toFixed(2) },
      chip: false,
      align: 'left',
      fontSize: 12,
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    out.push(speedLabel);
  }

  // ---- 동시 출발 표지 ----
  // 같은 순간 떠난 물방울 하나씩을 찍고 점선으로 잇는다. 시간이 갈수록 선이
  // 기울고, 수명에 이르면 잠시 멈춘다. 이때 표지는 각 물줄기의 선두에 놓인다.
  //
  // 색을 쓰는 곳은 여기 하나뿐이다 — 물이 아닌 것, 곧 **관찰자가 찍은 표시**.
  const age = pulseAge(state.t);
  if (age !== null) {
    const marks: Vec2[] = holes.map((h) => [
      TANK.wall + h.speed * age,
      h.y - 0.5 * c.g * age * age,
    ]);
    out.push({
      type: 'trajectory',
      id: 'pulse-line',
      points: marks,
      style: { colorRole: 'accent', emphasis: 'medium', lineStyle: 'dashed' },
    });
    marks.forEach((pos, i) => {
      const mark: Marker = {
        type: 'marker',
        id: `pulse-${holes[i]!.id}`,
        kind: 'pin',
        pos,
        style: { colorRole: 'accent', emphasis: 'strong' },
      };
      out.push(mark);
    });
  }

  // ---- 캡션 ----
  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다. 법칙의 정의나 공식은 쓰지
  // 않는다 — 그건 바로 위 문단이 할 말이다.
  out.push({
    type: 'readout',
    id: 'caption',
    anchor: { screen: 'bottom-center', offset: CAPTION_OFFSET },
    text: age !== null ? text('caption.pulse') : text('caption.main'),
    chip: false,
    fontSize: 13,
    style: { colorRole: age !== null ? 'accent' : 'muted', emphasis: 'strong' },
  });

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계. 프레이밍이 곧 주장이다 — 착지 지점을 화면에 두지 않는다.
  return { ...SCENE_BOUNDS };
}
