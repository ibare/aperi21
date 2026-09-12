// ========================================================================
// apparent-brightness — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 칸의 밝기는 `luminance` 로 준다 — 알파로 칠하면 감마 때문에 실제 나오는 빛의
// 비가 1/4 · 1/9 이 아니게 되어 "네 배 옅다" 가 거짓이 된다. `luminance` 는
// 배경과 **선형광에서 섞고 다시 인코딩**한다.
//
// 주의 — `luminance` 는 `emphasis: 'strong'` 과 함께여야 한다. 테마가 medium ·
// subtle 에서 rgba 를 주는데 선형광 합성은 hex 만 푼다. 어긋나면 예외도 없이
// 알파로 떨어져 그 칸이 거짓말을 한다.
// ========================================================================

import type {
  EnvironmentDef,
  ParticleSystem,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { arrivalGlow, departGlow, fade, lastCross, liveShells } from './physics';
import { CELL, FRAMES, RAYS, SCENE_BOUNDS, SKEW_X, SKEW_Y, SPAN, text } from './schema';
import type { ApparentBrightnessState } from './state';

/** 빛다발 테두리 · 칸막이 · 칸 테두리의 굵기(화면 px). 굵기는 위계라 배율을 따라가지 않는다. */
const CONE_WIDTH_PX = 1;
const PARTITION_WIDTH_PX = 1.2;
const EDGE_WIDTH_PX = 1;
/** 빛이 닿는 순간 테두리가 이만큼 굵어진다(화면 px). */
const EDGE_FLASH_WIDTH_PX = 0.9;
/** 빛다발 테두리 · 칸 테두리의 짙기. 테두리는 빛 자체의 경계라 옅다. */
const CONE_OPACITY = 0.16;
const PARTITION_OPACITY = 0.62;
const EDGE_OPACITY = 0.34;
/** 빛이 닿는 순간 테두리가 이만큼 밝아진다. */
const EDGE_FLASH_OPACITY = 0.5;

/** 빛 알갱이 하나의 반지름과 그 둘레 번짐(화면 px). */
const QUANTUM_SIZE_PX = 2.6;
const QUANTUM_HALO_PX = 5.6;
/** 번짐의 짙기. 알갱이보다 옅어야 지금 자리가 세어진다. */
const QUANTUM_HALO_ALPHA = 0.2;

/** 별 — 번짐이 반지름의 세 배까지 퍼지므로 원본의 30 px 번짐은 10 px 알맹이에서 온다. */
const STAR_SIZE = 0.1;
/** 묶음이 떠나는 순간 잠깐 커지는 양(월드). 원본의 번짐 30 → 35 px. */
const STAR_FLASH = 0.0167;

/** 도착 자국 — 칸 한 변이 화면에서 차지하는 대략의 크기(px). 자국 크기는 화면 px 다. */
const ARRIVAL_RING_PX = 22;
/** 자국이 나이와 함께 이만큼 더 퍼진다(화면 px). */
const ARRIVAL_SPREAD_PX = 16;
const ARRIVAL_RING_WIDTH_PX = 1.2;
/** 자국이 사라지기까지(초). */
const ARRIVAL_LIFE = 0.34;

/** 자리 이름표 — 칸 아래로 띄우는 거리와 글자 크기(화면 px). */
const NAME_OFFSET_PX = 19;
const COUNT_OFFSET_PX = 36;
const NAME_FONT_PX = 12;
const COUNT_FONT_PX = 13;

/**
 * 오블리크 투영 — 카메라 없이 축척 셋으로 단면을 눕힌다.
 *
 * 카메라를 들이면 회전 조작기가 따라 들어온다. 이 조각에 필요한 3차원은
 * 여기까지다 (원본 NOTES 「다시 짜기 아까웠던 것」).
 */
function at(d: number, u: number, v: number): Vec2 {
  return [d * SPAN + u * SKEW_X, v * CELL - u * SKEW_Y];
}

/**
 * 빛다발의 갈래 방향 6×6. 단면의 한 칸 안에서 고르게 나눈 자리라 어느 알갱이도
 * 칸 경계에 걸치지 않는다.
 */
const DIRECTIONS: readonly { u: number; v: number }[] = Array.from(
  { length: RAYS * RAYS },
  (_, q) => ({
    u: (Math.floor(q / RAYS) + 0.5) / RAYS - 0.5,
    v: ((q % RAYS) + 0.5) / RAYS - 0.5,
  }),
);

/** 자리 이름표가 붙는 칸 아래 높이. */
function frameBottom(n: number): number {
  return -(n / 2) * (CELL + SKEW_Y);
}

export function scene(params: {
  state: ApparentBrightnessState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('apparent-brightness: schema.timeline 이 선언되어야 한다');
  const t = timeline.t;
  const out: Primitive[] = [];

  // ---- 빛의 테두리 ----
  // 그리드나 축이 아니라 **빛 자체의 경계**다. 칸이 왜 하필 1 · 4 · 9 인지 —
  // 뿔의 모서리가 정확히 칸의 모서리를 지난다 — 이 선이 없으면 근거가 없다.
  const far = 3;
  const corners: readonly Vec2[] = [
    [-0.5, -0.5],
    [0.5, -0.5],
    [0.5, 0.5],
    [-0.5, 0.5],
  ];
  corners.forEach(([cu, cv], i) => {
    const edge: Trajectory = {
      type: 'trajectory',
      id: `cone-${i}`,
      points: [at(0, 0, 0), at(far, cu * far, cv * far)],
      width: CONE_WIDTH_PX,
      opacity: CONE_OPACITY,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(edge);
  });

  // ---- 자리 세 개 ----
  // 먼 것부터 그린다. 가까운 칸이 먼 칸을 덮어야 겹침이 원본과 같다.
  for (const F of [...FRAMES].reverse()) {
    const h = F.n / 2;

    // 칸 채우기 — 한 칸이 받는 **빛의 양**은 1/거리² 이다. 알파가 아니라 빛이라
    // `luminance` 로 준다. 칸막이가 없어도 밝기만으로 1 · 1/4 · 1/9 이 읽힌다.
    for (let i = 0; i < F.n; i++) {
      for (let j = 0; j < F.n; j++) {
        const u = -h + i;
        const v = -h + j;
        const cell: Region = {
          type: 'region',
          id: `cell-${F.id}-${i}-${j}`,
          points: [at(F.d, u, v), at(F.d, u + 1, v), at(F.d, u + 1, v + 1), at(F.d, u, v + 1)],
          fillOpacity: 1,
          luminance: 1 / (F.d * F.d),
          style: { colorRole: 'accent', emphasis: 'strong' },
        };
        out.push(cell);
      }
    }

    // 칸막이 — 나뉘는 경계 그 자체다. 이 선이 없으면 "나뉜다" 가 일어날 곳이 없다.
    for (let m = 1; m < F.n; m++) {
      const a = -h + m;
      const along: Trajectory = {
        type: 'trajectory',
        id: `partition-${F.id}-u${m}`,
        points: [at(F.d, a, -h), at(F.d, a, h)],
        width: PARTITION_WIDTH_PX,
        opacity: PARTITION_OPACITY,
        style: { colorRole: 'muted', emphasis: 'strong' },
      };
      const across: Trajectory = {
        type: 'trajectory',
        id: `partition-${F.id}-v${m}`,
        points: [at(F.d, -h, a), at(F.d, h, a)],
        width: PARTITION_WIDTH_PX,
        opacity: PARTITION_OPACITY,
        style: { colorRole: 'muted', emphasis: 'strong' },
      };
      out.push(along, across);
    }

    // 바깥 테두리 — 빛이 막 닿은 순간 잠깐 밝고 굵어진다. 사건 시각에서 역산한
    // 지수 감쇠라 상태를 쌓지 않는다.
    const glow = arrivalGlow(t, F.d);
    const border: Trajectory = {
      type: 'trajectory',
      id: `edge-${F.id}`,
      points: [at(F.d, -h, -h), at(F.d, h, -h), at(F.d, h, h), at(F.d, -h, h)],
      closed: true,
      width: EDGE_WIDTH_PX + EDGE_FLASH_WIDTH_PX * glow,
      opacity: EDGE_OPACITY + EDGE_FLASH_OPACITY * glow,
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    out.push(border);

    // 도착한 순간의 짧은 강조 — 자국 하나가 나이와 함께 퍼지며 스러진다.
    // 자리를 주는 것은 조각이고, 나이 들여 지우는 것은 엔진이다.
    const arrival: Trace = {
      type: 'trace',
      id: `arrival-${F.id}`,
      marks: [{ pos: at(F.d, 0, 0), age: Math.max(0, t - lastCross(t, F.d)) }],
      life: ARRIVAL_LIFE,
      shape: 'ring',
      size: F.n * ARRIVAL_RING_PX,
      spreadTo: F.n * ARRIVAL_RING_PX + ARRIVAL_SPREAD_PX,
      width: ARRIVAL_RING_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    out.push(arrival);
  }

  // ---- 별 ----
  // 내는 양은 내내 같다. 묶음이 떠나는 순간 번짐만 잠깐 커진다.
  out.push({
    type: 'body',
    id: 'star',
    pos: at(0, 0, 0),
    shape: 'circle',
    size: STAR_SIZE + STAR_FLASH * departGlow(t),
    glow: true,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 빛 알갱이 ----
  // 개수는 끝까지 36개다. 줄어드는 것은 개수가 아니라 한 칸의 몫이다.
  // 자리 목록으로 오는 입자 떼라 경로 하나에 모아 일괄로 그려진다.
  for (const shell of liveShells(t)) {
    const alpha = fade(shell.d);
    if (alpha <= 0.01) continue;
    const positions = DIRECTIONS.map(({ u, v }) => at(shell.d, u * shell.d, v * shell.d));

    const halo: ParticleSystem = {
      type: 'particleSystem',
      id: `quanta-halo-${shell.k}`,
      positions,
      sizes: QUANTUM_HALO_PX,
      opacity: alpha * QUANTUM_HALO_ALPHA,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    const quanta: ParticleSystem = {
      type: 'particleSystem',
      id: `quanta-${shell.k}`,
      positions,
      sizes: QUANTUM_SIZE_PX,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(halo, quanta);
  }

  // ---- 자리 이름표 ----
  // 캡션은 지금 벌어지는 한 가지만 말하므로, 36 · 9 · 4 를 **나란히** 비교하려면
  // 세 자리에 각자 남아 있어야 한다.
  for (const F of FRAMES) {
    const anchorY = frameBottom(F.n);
    const name: Readout = {
      type: 'readout',
      id: `name-${F.id}`,
      anchor: { world: [F.d * SPAN, anchorY], offset: [0, NAME_OFFSET_PX] },
      text: text(F.nameKey),
      chip: false,
      align: 'center',
      font: 'text',
      fontSize: NAME_FONT_PX,
      style: { colorRole: 'muted', emphasis: 'medium' },
    };
    const count: Readout = {
      type: 'readout',
      id: `count-${F.id}`,
      anchor: { world: [F.d * SPAN, anchorY], offset: [0, COUNT_OFFSET_PX] },
      text: text('label.per'),
      vars: { n: F.per },
      chip: false,
      align: 'center',
      font: 'text',
      fontSize: COUNT_FONT_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    out.push(name, count);
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계. 프레이밍은 주장의 일부다 — 원본 캔버스를 그대로 옮겼다.
  return { ...SCENE_BOUNDS };
}
