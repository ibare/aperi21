// ========================================================================
// time-dilation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 문자판(body 속 빈 원) ·
// 바늘과 12시 눈금(lineSet) · 째깍 섬광(trace ring) · 째깍 기록(trace tick + readout) ·
// 기록 안내선(trajectory 점선) · γ 치수선(dimension)이 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 시계는 두 종류 모두 먹색(같은 시계다), 정지 시계의 기록은
// muted, **강조색은 「지나가는 시계의 째깍」 한 가지 뜻에만** (레일 위 기록 눈금 ·
// 숫자 · 안내선 · 그 한 째깍을 재는 γ 치수선).
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
import { clockFrame, readConstants } from './physics';
import {
  CLOCK_RADIUS,
  GAMMA_DIM_Y,
  MOVING_COUNT_Y,
  MOVING_LABEL_Y,
  MOVING_Y,
  RAIL_Y,
  REST_COUNT_Y,
  REST_LABEL_X,
  REST_MARK_Y,
  REST_Y,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { TimeDilationState } from './state';

/** 바늘 굵기(화면 px). 시계에서 가장 먼저 읽혀야 하는 선이다. */
const HAND_WIDTH_PX = 2.5;
/** 바늘 길이 — 문자판 반지름에 대한 비. */
const HAND_SHARE = 0.82;
/** 12시 눈금 — 문자판 안쪽으로 들어오는 길이의 비와 굵기(화면 px). */
const NOON_SHARE = 0.22;
const NOON_WIDTH_PX = 2;
/** 레일 굵기(화면 px) · 짙기. 배경 정보라 가늘고 옅다. */
const RAIL_WIDTH_PX = 1;
const RAIL_OPACITY = 0.5;
/** 째깍 섬광 — 문자판 둘레에서 퍼지는 고리(화면 px) · 수명(초) · 굵기(화면 px). */
const FLASH_FROM_PX = 26;
const FLASH_TO_PX = 36;
const FLASH_LIFE = 0.3;
const FLASH_WIDTH_PX = 1.5;
/** 째깍 기록 눈금의 길이(월드)와 굵기(화면 px). */
const RECORD_TICK_LEN = 0.2;
const RECORD_TICK_WIDTH_PX = 2;
/** 기록 숫자 글자 크기(화면 px). */
const COUNT_PX = 11;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 지나가는 시계의 째깍 기록에서 정지 시계 줄로 내리는 안내선 굵기(화면 px) · 짙기. */
const GUIDE_WIDTH_PX = 1;
const GUIDE_OPACITY = 0.55;

/** 문자판 하나 — 테 · 12시 눈금 · 바늘. `turns` 는 바늘이 돈 바퀴 수. */
function clockParts(id: string, center: Vec2, turns: number, opacity: number): Primitive[] {
  const [cx, cy] = center;
  const angle = 2 * Math.PI * turns; // 12시에서 시계 방향
  const handTip: Vec2 = [
    cx + Math.sin(angle) * CLOCK_RADIUS * HAND_SHARE,
    cy + Math.cos(angle) * CLOCK_RADIUS * HAND_SHARE,
  ];
  return [
    {
      type: 'body',
      id: `${id}-face`,
      pos: center,
      shape: 'circle',
      size: CLOCK_RADIUS,
      fill: 'none',
      outline: 'role',
      opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'lineSet',
      id: `${id}-noon`,
      lines: [
        [
          [cx, cy + CLOCK_RADIUS],
          [cx, cy + CLOCK_RADIUS * (1 - NOON_SHARE)],
        ],
      ],
      width: NOON_WIDTH_PX,
      opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'lineSet',
      id: `${id}-hand`,
      lines: [[center, handTip]],
      width: HAND_WIDTH_PX,
      opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
  ];
}

export function scene(params: {
  state: TimeDilationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('time-dilation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const f = clockFrame(tl, c);
  const out: Primitive[] = [];

  /** 지나가는 시계 — 나타나며 짙어지고, 줄을 지난 뒤 빠져나가며 흐려진다. */
  const movingAlpha = tl.at('appear') * (1 - tl.at('after'));
  /** 째깍 기록 — 주기 끝에서 흐려진다. */
  const recordAlpha = 1 - tl.at('fade');
  const restXs = Array.from({ length: c.restClocks }, (_, k) => k * c.spacing);

  // ---- 레일 ----
  out.push({
    type: 'lineSet',
    id: 'rail',
    lines: [
      [
        [SCENE_BOUNDS.minX, RAIL_Y],
        [SCENE_BOUNDS.maxX, RAIL_Y],
      ],
    ],
    width: RAIL_WIDTH_PX,
    opacity: RAIL_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 지나가는 시계의 째깍 기록에서 내리는 안내선 ----
  // 정지 시계 사이 어디에 떨어지는지가 곧 「한 째깍 = 정지 시계 몇 째깍」 이다.
  // 문자판 아래로 지나가도록 먼저 선언한다.
  for (let n = 1; n <= f.movingCount; n++) {
    const x = f.movingTickX(n);
    out.push({
      type: 'trajectory',
      id: `guide-${n}`,
      points: [
        [x, RAIL_Y],
        [x, REST_MARK_Y],
      ],
      width: GUIDE_WIDTH_PX,
      opacity: GUIDE_OPACITY * recordAlpha,
      style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 정지 시계 줄 ----
  // 서로 맞춰 두었으므로 바늘이 모두 같은 자리를 가리킨다.
  restXs.forEach((x, k) => out.push(...clockParts(`rest-${k}`, [x, REST_Y], f.restTurns, 1)));

  // 째깍 섬광 — 모든 정지 시계가 한꺼번에 째깍인다.
  out.push({
    type: 'trace',
    id: 'rest-flash',
    marks: restXs.map((x) => ({ pos: [x, REST_Y] as Vec2, age: f.restTickAge })),
    life: FLASH_LIFE,
    shape: 'ring',
    size: FLASH_FROM_PX,
    spreadTo: FLASH_TO_PX,
    width: FLASH_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });

  // 정지 시계의 째깍 기록 — 지나가는 시계가 k 번째 시계 옆에 설 때 정지 시계들이
  // 막 k 번째 째깍을 마친다. 그 시계 아래에 눈금과 수를 남긴다.
  if (f.restCount >= 0) {
    out.push({
      type: 'trace',
      id: 'rest-records',
      marks: restXs.slice(0, f.restCount + 1).map((x) => ({ pos: [x, REST_MARK_Y] as Vec2 })),
      shape: 'tick',
      size: RECORD_TICK_LEN,
      width: RECORD_TICK_WIDTH_PX,
      opacity: recordAlpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    for (let k = 0; k <= f.restCount; k++) {
      out.push({
        type: 'readout',
        id: `rest-count-${k}`,
        anchor: { world: [restXs[k]!, REST_COUNT_Y] },
        text: text('label.count'),
        vars: { n: k },
        chip: false,
        fontSize: COUNT_PX,
        align: 'center',
        opacity: recordAlpha,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
    }
  }

  // ---- 지나가는 시계의 째깍 기록 ----
  // 제 바늘이 12시를 지날 때 레일 위 그 자리에 눈금을 남긴다.
  if (f.movingCount >= 0) {
    out.push({
      type: 'trace',
      id: 'moving-records',
      marks: Array.from({ length: f.movingCount + 1 }, (_, n) => ({
        pos: [f.movingTickX(n), RAIL_Y] as Vec2,
      })),
      shape: 'tick',
      size: RECORD_TICK_LEN,
      width: RECORD_TICK_WIDTH_PX,
      opacity: recordAlpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    for (let n = 0; n <= f.movingCount; n++) {
      out.push({
        type: 'readout',
        id: `moving-count-${n}`,
        anchor: { world: [f.movingTickX(n), MOVING_COUNT_Y] },
        text: text('label.count'),
        vars: { n },
        chip: false,
        fontSize: COUNT_PX,
        align: 'center',
        weight: 'bold',
        opacity: recordAlpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  // ---- 한 째깍의 길이 — 지나가는 시계가 떠난 뒤 ----
  // 지나가는 시계의 첫 째깍 동안 그 시계가 간 거리 = 정지 시계 γ 칸.
  const dimAlpha = tl.at('after') * recordAlpha;
  if (dimAlpha > 0 && f.movingCount >= 1) {
    out.push({
      type: 'dimension',
      id: 'gamma-span',
      from: [f.movingTickX(0), GAMMA_DIM_Y],
      to: [f.movingTickX(1), GAMMA_DIM_Y],
      text: text('label.gamma'),
      vars: { n: String(c.gammaNum), d: String(c.gammaDen) },
      opacity: dimAlpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 지나가는 시계 ----
  if (movingAlpha > 0) {
    const center: Vec2 = [f.movingX, MOVING_Y];
    out.push(...clockParts('moving', center, f.movingTurns, movingAlpha));
    out.push({
      type: 'trace',
      id: 'moving-flash',
      marks: [{ pos: center, age: f.movingTickAge }],
      life: FLASH_LIFE,
      shape: 'ring',
      size: FLASH_FROM_PX,
      spreadTo: FLASH_TO_PX,
      width: FLASH_WIDTH_PX,
      opacity: movingAlpha,
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
    out.push({
      type: 'readout',
      id: 'moving-label',
      anchor: { world: [f.movingX, MOVING_LABEL_Y] },
      text: text('label.moving'),
      vars: { beta: String(c.beta) },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      opacity: movingAlpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 정지 시계 줄 이름표 ----
  out.push({
    type: 'readout',
    id: 'rest-label',
    anchor: { world: [REST_LABEL_X, REST_Y] },
    text: text('label.rest'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
