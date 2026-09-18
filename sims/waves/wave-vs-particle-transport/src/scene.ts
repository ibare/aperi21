// ========================================================================
// wave-vs-particle-transport — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 줄 · 펄스 띠(trajectory),
// 표시한 조각 · 처음 자리 고리 · 손잡이 · 추(body), 추를 매단 용수철(constraint),
// 천장(surface)이 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 줄 · 손잡이 · 추는 먹색. 표시한 조각과 그 처음 자리 고리는 같은
// 조각의 지금과 처음이라 같은 primary. **강조색은 「건너가는 펄스」 한 뜻에만** — 줄 위에서
// 솟아 있는 구간을 덧칠한다. 천장 · 용수철 · 추가 멈춰 있던 자리 윤곽은 배경이라 muted.
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

import { pulseHeight, readConstants, receiverHeight, sinceLaunch } from './physics';
import { CEILING_Y, MARKED_XS, ROPE_START, SCENE_BOUNDS } from './schema';
import type { WaveVsParticleTransportState } from './state';

// ---- 표본 수 — 상태로 계산하지 않는다 ----
/** 줄의 표본 수. 펄스 폭(σ 0.5 m)에 약 20 점. */
const ROPE_SAMPLES = 340;

// ---- 선 굵기(화면 px) ----
const ROPE_WIDTH_PX = 2.5;
/** 펄스 띠. 줄보다 굵어 줄 위에 덧칠한 것으로 읽힌다. */
const PULSE_WIDTH_PX = 6;

// ---- 짙기 ----
/** 펄스 띠. 아래 먹색 줄이 비쳐 「줄의 한 구간」 으로 읽혀야 한다. */
const PULSE_OPACITY = 0.6;
/** 처음 자리 고리. 조각이 떠나 있을 때도 자리가 보이되 조각보다 물러나 있어야 한다. */
const RING_OPACITY = 0.75;
/** 추가 멈춰 있던 자리 윤곽. 추가 떠나 있을 때 빈 자리로 보일 만큼만. */
const WEIGHT_REST_OPACITY = 0.8;

// ---- 크기(월드 m) ----
/** 표시한 줄 조각의 반지름. */
const PIECE_RADIUS = 0.11;
/** 처음 자리 고리의 반지름. 조각이 들어앉으면 둘레가 조금 남는다. */
const RING_RADIUS = 0.2;
/** 흔드는 손잡이 [가로, 세로]. */
const HANDLE_SIZE: readonly [number, number] = [0.16, 0.34];
/** 손잡이를 줄 왼쪽 끝에서 바깥으로 물린 거리. */
const HANDLE_INSET = 0.08;
/** 끝 추 [가로, 세로]. 줄은 추의 왼쪽 면 가운데에 매인다. */
const WEIGHT_SIZE: readonly [number, number] = [0.5, 0.5];
/** 천장 판의 반 너비. */
const CEILING_HALF = 0.55;
/** 추를 매단 용수철의 감은 수. */
const SPRING_COILS = 6;
/** 줄 끝에서 추의 높이로 이어지는 구간의 길이 — 줄 끝이 추에 매여 함께 움직인다. */
const END_BLEND = 0.8;
/** 펄스 띠를 긋는 높이의 하한(진폭에 대한 몫). 이보다 낮은 자락은 평평한 줄로 둔다. */
const PULSE_VISIBLE_FRACTION = 0.04;

export function scene(params: {
  state: WaveVsParticleTransportState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('wave-vs-particle-transport: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const tau = sinceLaunch(timeline);
  const weightY = receiverHeight(tau, timeline.period, c);
  const out: Primitive[] = [];

  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const primary = { colorRole: 'primary', emphasis: 'strong' } as const;

  /** 줄 위 x 자리의 높이. 끝 가까이에서는 추에 매인 줄 끝의 높이로 이어진다. */
  const ropeY = (x: number): number => {
    const p = pulseHeight(x, tau, c);
    const s = Math.min(1, Math.max(0, (x - (c.ropeEnd - END_BLEND)) / END_BLEND));
    const w = s * s * (3 - 2 * s);
    return p * (1 - w) + weightY * w;
  };

  // ---- 천장과 용수철 ----
  const weightX = c.ropeEnd + WEIGHT_SIZE[0] / 2;
  out.push({
    type: 'surface',
    id: 'ceiling',
    // 오른쪽에서 왼쪽으로 긋는다 — 결이 천장 위쪽에 붙는다.
    geometry: {
      kind: 'wall',
      from: [weightX + CEILING_HALF, CEILING_Y],
      to: [weightX - CEILING_HALF, CEILING_Y],
    },
    material: 'rough',
    style: muted,
  });
  out.push({
    type: 'constraint',
    id: 'spring',
    subtype: 'spring',
    from: [weightX, CEILING_Y],
    to: 'weight',
    coils: SPRING_COILS,
    style: muted,
  });

  // ---- 추가 멈춰 있던 자리 ----
  // 속 빈 윤곽. 추가 이 자리를 떠나 오르내리는 것이 곧 건너온 에너지다 — 조각의 고리와
  // 짝이지만 뜻(제자리로 돌아오는 것)이 달라 색을 나눈다.
  out.push({
    type: 'body',
    id: 'weight-rest',
    pos: [weightX, 0],
    shape: 'rect',
    size: WEIGHT_SIZE,
    fill: 'none',
    outline: 'role',
    opacity: WEIGHT_REST_OPACITY,
    style: muted,
  });

  // ---- 처음 자리 고리 ----
  // 표시한 조각이 펄스가 오기 전에 있던 자리. 조각이 떠나 있는 동안에도 남아 있다.
  MARKED_XS.forEach((x, i) => {
    out.push({
      type: 'body',
      id: `home-${i}`,
      pos: [x, 0],
      shape: 'circle',
      size: RING_RADIUS,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: RING_OPACITY,
      style: primary,
    });
  });

  // ---- 줄 ----
  const rope: Vec2[] = [];
  for (let i = 0; i <= ROPE_SAMPLES; i++) {
    const x = ROPE_START + ((c.ropeEnd - ROPE_START) * i) / ROPE_SAMPLES;
    rope.push([x, ropeY(x)]);
  }
  out.push({
    type: 'trajectory',
    id: 'rope',
    points: rope,
    width: ROPE_WIDTH_PX,
    style: ink,
  });

  // ---- 건너가는 펄스 ----
  // 줄에서 솟아 있는 구간만 덧칠한다. 펄스가 추에 닿으면 줄 위에서 사라진다.
  const threshold = c.amplitude * PULSE_VISIBLE_FRACTION;
  const hump = rope.filter(([x]) => pulseHeight(x, tau, c) > threshold);
  if (hump.length >= 2) {
    out.push({
      type: 'trajectory',
      id: 'pulse',
      points: hump,
      width: PULSE_WIDTH_PX,
      opacity: PULSE_OPACITY,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 흔드는 손잡이 ----
  out.push({
    type: 'body',
    id: 'handle',
    pos: [ROPE_START - HANDLE_INSET, ropeY(ROPE_START)],
    shape: 'rect',
    size: HANDLE_SIZE,
    outline: 'none',
    style: ink,
  });

  // ---- 표시한 줄 조각 ----
  // 가로 자리는 언제나 고리와 같은 x 다. 높이만 펄스를 따라 오르내린다.
  MARKED_XS.forEach((x, i) => {
    out.push({
      type: 'body',
      id: `piece-${i}`,
      pos: [x, ropeY(x)],
      shape: 'circle',
      size: PIECE_RADIUS,
      outline: 'background',
      glow: false,
      style: primary,
    });
  });

  // ---- 끝 추 ----
  out.push({
    type: 'body',
    id: 'weight',
    pos: [weightX, weightY],
    shape: 'rect',
    size: WEIGHT_SIZE,
    outline: 'none',
    style: ink,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
