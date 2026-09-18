// ========================================================================
// mass-spring-system — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 벽 · 바닥(`surface`) · 용수철(`constraint` spring) ·
// 추(`body`) · 쉬는 자리와 출발 자리 눈금(`trajectory`) · 진폭(`dimension`) ·
// 돌아옴 섬광과 돌아온 횟수(`trace`) · 질량 기호(`readout`) 가 모두 표준 어휘로 있다.
//
// 색: 추 · 용수철은 먹색(같은 장치). 강조색은 **「출발 자리로 돌아옴」** 한 가지 뜻에만
// 쓴다 — 출발 자리 눈금, 돌아온 순간의 섬광, 돌아온 횟수 점. 쉬는 자리 · 진폭 치수선은
// 배경 정보라 muted.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  ViewDef,
} from '@aperi21/schema';
import { readConstants, readLane, swingClock } from './physics';
import { COUNT_GAP, COUNT_X, LANES, SCENE_BOUNDS, WALL_X, text } from './schema';
import type { MassSpringSystemState } from './state';

/** 바닥이 끝나는 x. 가장 멀리 가는 추(1.02)를 지나고 횟수 점 줄 앞에서 멈춘다. */
const FLOOR_END_X = 1.16;
/** 벽이 바닥 위로 솟는 높이 — 추 높이에 더하는 여유(m). */
const WALL_OVERHANG = 0.1;
/** 쉬는 자리 · 출발 자리 눈금이 바닥 아래로 내려가는 길이(m). */
const TICK_DEPTH = 0.08;
/** 진폭 치수선을 추 윗면 위로 띄우는 거리(m). */
const DIM_GAP = 0.09;
/** 치수선이 나타나고 사라지는 시간(s). */
const DIM_FADE = 0.4;
/** 용수철 감은 수. 길게 늘어났을 때도 코일이 읽히는 수. */
const SPRING_COILS = 10;
/** 돌아옴 섬광 — 수명(s) · 처음 반지름 · 퍼지는 끝 반지름(화면 px). */
const RING_LIFE = 0.7;
const RING_FROM = 6;
const RING_TO = 34;
/** 돌아온 횟수 점의 반지름(화면 px). */
const COUNT_DOT = 5;
/** 질량 기호를 벽 왼쪽으로 띄우는 거리(화면 px). */
const MASS_LABEL_OFFSET = 12;

export function scene(params: {
  state: MassSpringSystemState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl } = params;
  if (!tl) throw new Error('mass-spring-system: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const clock = swingClock(tl);

  // 진폭 치수선은 붙잡혀 있는 동안만 — 놓자마자 옅어지고, `clear` 에서 돌아온다.
  const swingStart = tl.start('swingA');
  const dimOpacity = Math.max(1 - tl.span(swingStart, swingStart + DIM_FADE), tl.at('clear'));
  // 돌아온 횟수는 `clear` 동안 옅어져 다음 주기에 빈 줄로 시작한다.
  const countOpacity = 1 - tl.at('clear');

  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const spring = { colorRole: 'ink', emphasis: 'medium' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  for (const lane of LANES) {
    const r = readLane(lane, c, clock);
    const half = r.side / 2;
    const floorY = lane.y - half;

    // ---- 벽 · 바닥 ----
    g.push({
      type: 'surface',
      id: `${lane.id}-floor`,
      geometry: { kind: 'wall', from: [WALL_X, floorY], to: [FLOOR_END_X, floorY] },
      material: 'smooth',
    });
    g.push({
      type: 'surface',
      id: `${lane.id}-wall`,
      geometry: { kind: 'wall', from: [WALL_X, floorY], to: [WALL_X, floorY + r.side + WALL_OVERHANG] },
      material: 'solid',
    });

    // ---- 쉬는 자리(muted) · 출발 자리(강조) 눈금 — 바닥 아래로 내려 추에 가리지 않게 ----
    g.push({
      type: 'trajectory',
      id: `${lane.id}-rest-tick`,
      points: [
        [0, floorY],
        [0, floorY - TICK_DEPTH],
      ],
      width: 1,
      style: muted,
    });
    g.push({
      type: 'trajectory',
      id: `${lane.id}-release-tick`,
      points: [
        [r.release, floorY],
        [r.release, floorY - TICK_DEPTH],
      ],
      width: 2,
      style: accent,
    });

    // ---- 진폭 ----
    if (dimOpacity > 0.01) {
      const dimY = lane.y + half + DIM_GAP;
      g.push({
        type: 'dimension',
        id: `${lane.id}-amplitude`,
        from: [0, dimY],
        to: [r.release, dimY],
        text: text(lane.ampLabel),
        opacity: dimOpacity,
        style: muted,
      });
    }

    // ---- 용수철 · 추 ----
    g.push({
      type: 'constraint',
      id: `${lane.id}-spring`,
      subtype: 'spring',
      from: [WALL_X, lane.y],
      to: [r.x - half, lane.y],
      coils: SPRING_COILS,
      style: spring,
    });
    g.push({
      type: 'body',
      id: `${lane.id}-mass`,
      pos: [r.x, lane.y],
      shape: 'rect',
      size: [r.side, r.side],
      style: ink,
    });

    // ---- 돌아옴 — 섬광 한 번, 점 하나 ----
    if (r.sinceReturn !== undefined && r.sinceReturn < RING_LIFE) {
      g.push({
        type: 'trace',
        id: `${lane.id}-return-ring`,
        marks: [{ pos: [r.release, lane.y], age: r.sinceReturn }],
        life: RING_LIFE,
        shape: 'ring',
        size: RING_FROM,
        spreadTo: RING_TO,
        style: accent,
      });
    }
    if (r.returns > 0 && countOpacity > 0.01) {
      g.push({
        type: 'trace',
        id: `${lane.id}-returns`,
        marks: Array.from({ length: r.returns }, (_, i) => ({
          pos: [COUNT_X + i * COUNT_GAP, lane.y] as const,
        })),
        shape: 'dot',
        size: COUNT_DOT,
        opacity: countOpacity,
        style: accent,
      });
    }

    // ---- 질량 기호 ----
    g.push({
      type: 'readout',
      id: `${lane.id}-mass-label`,
      anchor: { world: [WALL_X, lane.y], offset: [-MASS_LABEL_OFFSET, 0] },
      text: text(lane.massLabel),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: 16,
      align: 'right',
      style: ink,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
