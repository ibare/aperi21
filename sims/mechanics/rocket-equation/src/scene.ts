// ========================================================================
// rocket-equation — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 화면은 둘로 나뉜다. 위는 로켓과 그 곁을 지나는 별 — 별 획의 길이가 곧 지금 속도다.
// 아래는 칸마다 하나씩 서는 막대 — 그 칸이 붙인 속도다. 막대는 자기 연료 칸 **바로
// 아래**에 서므로 「이 칸이 이만큼」 이 자리로 읽힌다. 범례를 두지 않는 이유다.
//
// 색은 셋뿐이다. 먹색은 로켓(짐 · 껍데기 · 노즐), 보조색은 연료 — 칸 안에 있든
// 뒤로 뿜어져 나갔든 같은 것이라 같은 색이다. 강조색은 「붙은 속도」 한 가지 뜻에만
// 쓴다 (S-piece). 별 · 바닥 · 이름표는 배경 정보다.
// ========================================================================

import type {
  Primitive,
  SceneGraph,
  TimelineFrame,
  Vec2,
  Bounds,
} from '@aperi21/schema';
import { blockGain, blockShift, stableUnit } from './physics';
import {
  BAR_BASE_Y,
  BAR_SCALE,
  BAR_W,
  BLOCKS,
  BLOCK_W,
  BODY_HALF_H,
  BODY_Y,
  EXHAUST_JITTER_PX,
  EXHAUST_LIFE,
  EXHAUST_RATE,
  EXHAUST_SPEED,
  EXHAUST_WIDTH_PX,
  LABEL_FONT_PX,
  NOSE_TIP_X,
  NOZZLE_HALF_H,
  NOZZLE_LEN,
  SCENE_BOUNDS,
  STAR_BAND,
  STAR_COUNT,
  STAR_SPAN,
  STAR_TRAIL_OPACITY,
  STAR_TRAIL_SECONDS,
  STAR_TRAIL_WIDTH_PX,
  TANK_FRONT_X,
  TANK_REAR_X,
  text,
} from './schema';
import type { RocketEquationState } from './state';

/** 연료 칸이 껍데기 선에 닿지 않게 안으로 들이는 거리. */
const BLOCK_INSET = 0.035;
/** 이보다 짧은 막대는 그리지 않는다 — 바닥선과 구별되지 않는다. */
const BAR_MIN_H = 0.004;

/** 칸 k(뒤에서부터 1)의 왼쪽 · 오른쪽 · 가운데 x. */
const blockLeft = (k: number): number => TANK_REAR_X + (k - 1) * BLOCK_W;
const blockCenter = (k: number): number => blockLeft(k) + BLOCK_W / 2;

/** 별 하나하나의 제자리 · 크기 · 짙기. 시드에서 뽑아 프레임마다 떨지 않는다. */
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  x: STAR_SPAN[0] + stableUnit(i, 1) * (STAR_SPAN[1] - STAR_SPAN[0]),
  y: STAR_BAND[0] + stableUnit(i, 2) * (STAR_BAND[1] - STAR_BAND[0]),
  size: 0.9 + stableUnit(i, 3) * 1.3,
  opacity: 0.35 + stableUnit(i, 4) * 0.65,
}));

/** 별 띠를 감는다. 로켓이 나아간 만큼 별이 뒤로 흐르고, 끝에 닿으면 앞에서 다시 온다. */
function wrapped(x: number): number {
  const span = STAR_SPAN[1] - STAR_SPAN[0];
  return STAR_SPAN[0] + (((x - STAR_SPAN[0]) % span) + span) % span;
}

interface Flight {
  /** 지금 속도(월드/초). */
  speed: number;
  /** 주기가 시작한 뒤 나아간 거리(월드). */
  shift: number;
  /** 칸마다 지금까지 태운 비율 0~1. */
  burned: number[];
  /** 지금 태우고 있는 칸(없으면 0). */
  burning: number;
}

/**
 * 시간표에서 비행을 읽는다. 단계 경계를 상수로 두지 않고 `at` · `duration` 만 쓴다 —
 * 「이 칸을 0.2 초 더 길게」 가 선언으로 되어야 한다 (S-piece).
 */
function flight(timeline: TimelineFrame): Flight {
  const burned: number[] = [];
  let gain = 0;
  let shift = 0;
  let burning = 0;

  for (let k = 1; k <= BLOCKS; k++) {
    const p = timeline.at(`burn-${k}`);
    const c = timeline.at(`coast-${k}`);
    const burnSeconds = timeline.duration(`burn-${k}`);
    const coastSeconds = timeline.duration(`coast-${k}`);

    // 이 칸을 태우기 전의 속도로 흐른 거리 + 태우는 동안 속도가 자라며 흐른 거리.
    shift += gain * EXHAUST_SPEED * p * burnSeconds;
    shift += EXHAUST_SPEED * burnSeconds * blockShift(k, p);
    gain += blockGain(k, p);
    shift += gain * EXHAUST_SPEED * c * coastSeconds;

    burned.push(p);
    if (p > 0 && p < 1) burning = k;
  }

  shift +=
    gain * EXHAUST_SPEED * timeline.at('hold') * timeline.duration('hold') +
    gain * EXHAUST_SPEED * timeline.at('clear') * timeline.duration('clear');

  return { speed: gain * EXHAUST_SPEED, shift, burned, burning };
}

export function scene(params: {
  state: RocketEquationState;
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('rocket-equation: schema.timeline 이 선언되어야 한다');

  const f = flight(timeline);
  // 마지막 단계는 되감기다 — 막대가 옅어지고 연료가 다시 찬다.
  const rewind = timeline.at('clear');
  const out: Primitive[] = [];

  // ── 지나가는 별 — 획의 길이가 지금 속도다 ──
  // 로켓과 함께 가는 눈으로 본다. 속도가 커질수록 획이 길어지므로, 멈춘 화면
  // 한 장에서도 「지금 얼마나 빠른가」 가 길이로 읽힌다.
  out.push({
    type: 'particleSystem',
    id: 'stars',
    positions: STARS.map((s) => [wrapped(s.x - f.shift), s.y] as Vec2),
    velocities: STARS.map(() => [-f.speed, 0] as Vec2),
    sizes: STARS.map((s) => s.size),
    opacities: STARS.map((s) => s.opacity),
    trail: true,
    trailStyle: {
      seconds: STAR_TRAIL_SECONDS,
      width: STAR_TRAIL_WIDTH_PX,
      opacity: STAR_TRAIL_OPACITY,
    },
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ── 뒤로 뿜는 연료 ──
  // 칸이 바뀌어도 뿜는 빠르기 · 굵기 · 양이 같다. 「같은 연료를 같은 빠르기로」 가
  // 화면에서 같은 모양이어야 붙는 속도의 차이가 연료 탓으로 읽히지 않는다.
  out.push({
    type: 'stream',
    id: 'exhaust',
    from: [TANK_REAR_X - NOZZLE_LEN, BODY_Y],
    velocity: [-EXHAUST_SPEED, 0],
    rate: EXHAUST_RATE,
    life: EXHAUST_LIFE,
    width: EXHAUST_WIDTH_PX,
    jitter: EXHAUST_JITTER_PX,
    flow: f.burning > 0 ? 1 : 0,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ── 노즐 ──
  out.push({
    type: 'region',
    id: 'nozzle',
    points: [
      [TANK_REAR_X, BODY_Y - BODY_HALF_H],
      [TANK_REAR_X - NOZZLE_LEN, BODY_Y - NOZZLE_HALF_H],
      [TANK_REAR_X - NOZZLE_LEN, BODY_Y + NOZZLE_HALF_H],
      [TANK_REAR_X, BODY_Y + BODY_HALF_H],
    ],
    opaque: true,
    fillOpacity: 0.75,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ── 연료 칸이 들어앉는 몸통 안쪽 ──
  // 별이 몸통을 뚫고 지나 보이지 않게 불투명하게 깐다.
  out.push({
    type: 'region',
    id: 'tank-inside',
    points: [
      [TANK_REAR_X, BODY_Y - BODY_HALF_H],
      [TANK_FRONT_X, BODY_Y - BODY_HALF_H],
      [TANK_FRONT_X, BODY_Y + BODY_HALF_H],
      [TANK_REAR_X, BODY_Y + BODY_HALF_H],
    ],
    opaque: true,
    fillOpacity: 0.06,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ── 짐: 연료가 아닌 몫. 꽉 찬 먹색이라 연료와 섞이지 않는다 ──
  out.push({
    type: 'region',
    id: 'payload',
    points: [
      [TANK_FRONT_X, BODY_Y - BODY_HALF_H],
      [NOSE_TIP_X, BODY_Y],
      [TANK_FRONT_X, BODY_Y + BODY_HALF_H],
    ],
    opaque: true,
    fillOpacity: 0.82,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ── 연료 칸 ──
  // 칸마다 같은 폭 = 같은 양. 태우는 동안 뒤쪽(노즐 쪽)부터 비어 간다.
  for (let k = 1; k <= BLOCKS; k++) {
    const left = blockLeft(k);
    // 되감기 동안에는 모든 칸이 함께 다시 찬다.
    const remain = Math.max(1 - (f.burned[k - 1] ?? 0), rewind);
    if (remain <= 0.001) continue;
    const x0 = left + BLOCK_W * (1 - remain);
    out.push({
      type: 'region',
      id: `fuel-${k}`,
      points: [
        [x0 + BLOCK_INSET, BODY_Y - BODY_HALF_H + BLOCK_INSET],
        [left + BLOCK_W - BLOCK_INSET, BODY_Y - BODY_HALF_H + BLOCK_INSET],
        [left + BLOCK_W - BLOCK_INSET, BODY_Y + BODY_HALF_H - BLOCK_INSET],
        [x0 + BLOCK_INSET, BODY_Y + BODY_HALF_H - BLOCK_INSET],
      ],
      opaque: true,
      fillOpacity: 0.55,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  }

  // ── 칸을 가르는 벽 ──
  out.push({
    type: 'lineSet',
    id: 'dividers',
    lines: Array.from({ length: BLOCKS - 1 }, (_, j) => {
      const x = TANK_REAR_X + (j + 1) * BLOCK_W;
      return [
        [x, BODY_Y - BODY_HALF_H],
        [x, BODY_Y + BODY_HALF_H],
      ] as Vec2[];
    }),
    width: 1,
    opacity: 0.5,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ── 껍데기 ──
  out.push({
    type: 'trajectory',
    id: 'hull',
    points: [
      [TANK_REAR_X, BODY_Y - BODY_HALF_H],
      [TANK_FRONT_X, BODY_Y - BODY_HALF_H],
      [NOSE_TIP_X, BODY_Y],
      [TANK_FRONT_X, BODY_Y + BODY_HALF_H],
      [TANK_REAR_X, BODY_Y + BODY_HALF_H],
    ],
    closed: true,
    width: 2,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ── 막대가 서는 바닥 ──
  // 막대를 같은 바닥 위에 나란히 세우는 선이다. 눈금도 숫자도 없다 — 잴 것은
  // 값이 아니라 막대끼리의 길이 비다.
  out.push({
    type: 'trajectory',
    id: 'bar-base',
    points: [
      [TANK_REAR_X - 0.06, BAR_BASE_Y],
      [TANK_FRONT_X + 0.06, BAR_BASE_Y],
    ],
    width: 1,
    opacity: 0.6,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ── 지금 타는 칸과 그 막대를 잇는 점선 ──
  // 칸과 막대가 같은 x 에 있다는 것을 주기마다 여덟 번 다시 말해 준다.
  if (f.burning > 0) {
    const cx = blockCenter(f.burning);
    const h = BAR_SCALE * blockGain(f.burning, f.burned[f.burning - 1] ?? 0);
    out.push({
      type: 'trajectory',
      id: 'link',
      points: [
        [cx, BODY_Y - BODY_HALF_H],
        [cx, BAR_BASE_Y + h],
      ],
      width: 1,
      opacity: 0.45,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ── 칸이 붙인 속도 ──
  // 같은 폭의 막대가 같은 바닥에서 자란다. 폭이 같으니 다른 것은 길이뿐이고,
  // 뒤 칸일수록 길다 — 이 조각이 하는 한 주장이다.
  for (let k = 1; k <= BLOCKS; k++) {
    const h = BAR_SCALE * blockGain(k, f.burned[k - 1] ?? 0);
    if (h < BAR_MIN_H) continue;
    const cx = blockCenter(k);
    out.push({
      type: 'region',
      id: `gain-${k}`,
      points: [
        [cx - BAR_W / 2, BAR_BASE_Y],
        [cx + BAR_W / 2, BAR_BASE_Y],
        [cx + BAR_W / 2, BAR_BASE_Y + h],
        [cx - BAR_W / 2, BAR_BASE_Y + h],
      ],
      opaque: true,
      fillOpacity: 0.8,
      opacity: 1 - rewind,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ── 막대 줄의 이름 ──
  out.push({
    type: 'readout',
    id: 'gain-label',
    anchor: { world: [TANK_REAR_X - 0.1, BAR_BASE_Y], offset: [0, -2] },
    text: text('label.gain'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    align: 'right',
    clamp: true,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 매 프레임 같은 값이다 — 프레이밍은 주장의 일부다 (S-piece). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
