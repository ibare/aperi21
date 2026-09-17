// ========================================================================
// average-acceleration — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 도로 · 축 · 곡선 · 기울기선 · 직각 표시는 `trajectory`,
// 차는 `body` custom(둥근 사각), 속도는 `vector`, 이름표 · 속력 · 눈금 · 값은
// `readout`. 캡션은 선언의 캡션 슬롯이 그린다.
//
// ---- 월드 = 원본 캔버스 ----
// 원본은 880 × 270 캔버스 한 장에 도로 칸(왼쪽)과 속도-시간 칸(오른쪽)을 각자의
// 축척으로 놓았다. 두 칸이 서로에게서 유도되는 약속이 없으므로 **원본 캔버스 1px 을
// 월드 1 로** 두고 y 만 위로 뒤집는다. 원본의 배치 상수를 한 글자도 바꾸지 않고
// 옮길 수 있다. 선 굵기 · 글자 크기 · 글자 띄움은 화면 px 그대로다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { A_AVG, positionA, positionB, velocityA, velocityB } from './physics';
import { RUN, V0, V1, text, type AverageAccelerationMessageKey } from './schema';
import type { AverageAccelerationState } from './state';

// ------------------------------------------------------------------------
// 배치 — 원본 index.html 의 상수 그대로
// ------------------------------------------------------------------------

/** 원본 캔버스(px). */
const W = 880;
const H = 270;
/** 캡션이 캔버스 안으로 들어오며 그림 아래 더 잡는 자리(원본 px). */
const CAPTION_ROOM = 34;

/** 원본 px(y 아래) → 월드(y 위). */
const at = (x: number, y: number): Vec2 => [x, H - y];

// 도로
const ROAD_X0 = 70;
/** 1 m = 3.6 px. */
const ROAD_SCALE = 3.6;
const LANE_A = 95;
const LANE_B = 200;
/** 1 m/s = 3 px. */
const ARROW_SCALE = 3;
const roadX = (m: number): number => ROAD_X0 + m * ROAD_SCALE;

// 그래프 — 1 s = 60 px, 1 m/s = 9.5 px
const G_X0 = 480;
const G_Y0 = 235;
const G_TX = 60;
const G_VY = 9.5;
const gx = (s: number): number => G_X0 + s * G_TX;
const gy = (v: number): number => G_Y0 - v * G_VY;

/** 차 크기(px) — 앞머리가 위치를 가리킨다. */
const CAR_W = 34;
const CAR_H = 18;
const CAR_R = 5;
/** 둥근 사각. pos(앞머리 · 차로 가운데) 기준 월드, y 위. */
const CAR_PATH = [
  `M ${-CAR_W + CAR_R} ${-CAR_H / 2}`,
  `L ${-CAR_R} ${-CAR_H / 2}`,
  `A ${CAR_R} ${CAR_R} 0 0 1 0 ${-CAR_H / 2 + CAR_R}`,
  `L 0 ${CAR_H / 2 - CAR_R}`,
  `A ${CAR_R} ${CAR_R} 0 0 1 ${-CAR_R} ${CAR_H / 2}`,
  `L ${-CAR_W + CAR_R} ${CAR_H / 2}`,
  `A ${CAR_R} ${CAR_R} 0 0 1 ${-CAR_W} ${CAR_H / 2 - CAR_R}`,
  `L ${-CAR_W} ${-CAR_H / 2 + CAR_R}`,
  `A ${CAR_R} ${CAR_R} 0 0 1 ${-CAR_W + CAR_R} ${-CAR_H / 2}`,
  'Z',
].join(' ');

/** 곡선 표본 간격(s). 원본과 같다. */
const CURVE_STEP = 0.02;
/** 달리기 시작 직후 기울기선을 숨기는 문턱(s). 두 점이 너무 가까우면 방향이 없다. */
const CHORD_MIN_S = 0.05;

// ------------------------------------------------------------------------
// 굵기 · 글자 — 원본 px
// ------------------------------------------------------------------------

const FONT_PX = 14;
const W_ROAD = 1;
const W_AXIS = 1.2;
const W_TICK = 1;
const W_ARROW = 3;
const ARROW_HEAD = 10;
const W_CURVE = 2.5;
/**
 * 처음-지금 기울기선. 원본은 1.5 px 점선이었고 곡선 **위**에 그었다 — 가는 곡선이
 * 곧 직선이라 가의 기울기선이 곡선에 통째로 묻혀 보이지 않았다. 여기서는 곡선보다
 * 넓고 옅은 점선 띠로 곡선 **아래**에 깐다. 가의 곡선 양옆으로 점선이 비어져 나와
 * 두 기울기선이 달리는 내내 보인다 (NOTES.md).
 */
const W_CHORD = 6;
const W_SLOPE = 3.5;
const W_MEASURE = 1;

// ------------------------------------------------------------------------
// 색 — 가 = 파랑, 나 = 초록, 강조(주황)는 "겹친 평균 가속도" 한 가지 뜻에만
// ------------------------------------------------------------------------
// 도로의 차 · 화살표 · 속력 · 그래프의 곡선 · 기울기선이 차마다 같은 색이다 —
// 같은 대상이기 때문이다.

const CAR_A = { colorRole: 'secondary', emphasis: 'strong' } as const;
const CAR_B = { colorRole: 'positive', emphasis: 'strong' } as const;
const CHORD_A = { colorRole: 'secondary', emphasis: 'subtle', lineStyle: 'dashed' } as const;
const CHORD_B = { colorRole: 'positive', emphasis: 'subtle', lineStyle: 'dashed' } as const;
const ACCENT = { colorRole: 'accent', emphasis: 'strong' } as const;
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 원본의 옅은 베이지 선 — 도로와 눈금. */
const FAINT = { colorRole: 'muted', emphasis: 'subtle' } as const;

// ------------------------------------------------------------------------
// 선언 도우미
// ------------------------------------------------------------------------

function line(
  id: string,
  points: readonly Vec2[],
  width: number,
  style: Trajectory['style'],
  opacity = 1,
): Trajectory {
  return { type: 'trajectory', id, points, width, style, opacity };
}

/**
 * 글자. 원본은 기준선(alphabetic)에 찍었고 readout 은 가운데 높이에 놓는다 — 14px
 * 글자에서 기준선은 가운데보다 5px 아래라, 원본의 `y + 5` 가 여기서는 `y` 다.
 */
function label(
  id: string,
  pos: Vec2,
  key: AverageAccelerationMessageKey,
  style: Readout['style'],
  align: NonNullable<Readout['align']>,
  opts: { offset?: Vec2; vars?: Readout['vars']; opacity?: number } = {},
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos, offset: opts.offset ?? [0, 0] },
    text: text(key),
    vars: opts.vars,
    chip: false,
    align,
    font: 'text',
    fontSize: FONT_PX,
    style,
    opacity: opts.opacity ?? 1,
  };
}

function sampled(fn: (s: number) => number, s: number): Vec2[] {
  const n = Math.max(1, Math.ceil(s / CURVE_STEP));
  const pts: Vec2[] = [];
  for (let i = 0; i <= n; i++) {
    const u = (s * i) / n;
    pts.push(at(gx(u), gy(fn(u))));
  }
  return pts;
}

interface Car {
  id: 'a' | 'b';
  lane: number;
  v: (s: number) => number;
  x: (s: number) => number;
  body: typeof CAR_A | typeof CAR_B;
  chord: typeof CHORD_A | typeof CHORD_B;
  name: AverageAccelerationMessageKey;
}

const CARS: readonly Car[] = [
  { id: 'a', lane: LANE_A, v: velocityA, x: positionA, body: CAR_A, chord: CHORD_A, name: 'label.carA' },
  { id: 'b', lane: LANE_B, v: velocityB, x: positionB, body: CAR_B, chord: CHORD_B, name: 'label.carB' },
];

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: AverageAccelerationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('average-acceleration: schema.timeline 이 선언되어야 한다');
  const s = tl.at('run') * RUN; // 운동 시각
  const done = tl.phase !== 'run';
  const out: Primitive[] = [];

  // ---- 도로 ----
  for (const lane of [LANE_A, LANE_B]) {
    out.push(line(`road-${lane}`, [at(ROAD_X0 - 30, lane + 14), at(roadX(85), lane + 14)], W_ROAD, FAINT));
  }
  out.push(line('start-line', [at(roadX(0), LANE_A - 45), at(roadX(0), LANE_B + 14)], W_ROAD, FAINT));

  // ---- 차와 이름표 ----
  for (const car of CARS) {
    const body: Body = {
      type: 'body',
      id: `car-${car.id}`,
      shape: 'custom',
      pos: at(roadX(car.x(s)), car.lane),
      customPath: CAR_PATH,
      style: car.body,
    };
    out.push(body, label(`name-${car.id}`, at(ROAD_X0 - 30, car.lane), car.name, car.body, 'left'));
  }

  // ---- 속도 화살표와 속력 ----
  for (const car of CARS) {
    const v = car.v(s);
    const tail = roadX(car.x(s)) - 17;
    const len = v * ARROW_SCALE;
    const arrow: Vector = {
      type: 'vector',
      id: `velocity-${car.id}`,
      from: at(tail, car.lane - 30),
      delta: [len, 0],
      width: W_ARROW,
      headSize: ARROW_HEAD,
      style: car.body,
    };
    out.push(arrow);
    // 소수 한 자리 고정 — 자릿수를 자동으로 줄이지 않는다 (S-piece).
    out.push(
      label(`speed-${car.id}`, at(tail + len + 6, car.lane - 30), 'label.speed', car.body, 'left', {
        vars: { v: v.toFixed(1) },
      }),
    );
  }

  // ---- 속도-시간 축 ----
  out.push(line('axis', [at(G_X0, gy(23)), at(G_X0, G_Y0), at(gx(5.4), G_Y0)], W_AXIS, INK));
  for (const v of [V1, V0]) {
    out.push(label(`tick-v-${v}`, at(G_X0 - 6, gy(v)), 'label.tickV', INK, 'right', { vars: { v } }));
    out.push(line(`tick-v-mark-${v}`, [at(G_X0 - 3, gy(v)), at(G_X0 + 3, gy(v))], W_TICK, FAINT));
  }
  out.push(label('axis-v', at(G_X0 - 6, gy(23)), 'label.axisV', INK, 'right'));
  out.push(label('tick-t-0', at(gx(0), G_Y0 + 13), 'label.tickT0', INK, 'center'));
  out.push(label('tick-t-end', at(gx(RUN), G_Y0 + 13), 'label.tickT', INK, 'center', { vars: { t: RUN } }));
  out.push(label('axis-t', at(gx(5.4) + 6, G_Y0), 'label.axisT', INK, 'left'));
  out.push(line('tick-t-mark', [at(gx(RUN), G_Y0 - 3), at(gx(RUN), G_Y0 + 3)], W_TICK, FAINT));

  // ---- 처음-지금 기울기선 (곡선 아래) ----
  if (s > CHORD_MIN_S && !done) {
    for (const car of CARS) {
      out.push(
        line(
          `chord-${car.id}`,
          [at(gx(0), gy(car.v(0))), at(gx(s), gy(car.v(s)))],
          W_CHORD,
          car.chord,
        ),
      );
    }
  }

  // ---- 속도 곡선 ----
  for (const car of CARS) {
    out.push(line(`curve-${car.id}`, sampled(car.v, s), W_CURVE, car.body));
  }

  // ---- 평균 가속도 기울기선 — 끝 시각에 하나로 겹친 선 ----
  if (done) {
    const k = tl.at('join');
    out.push(line('slope', [at(gx(0), gy(V0)), at(gx(RUN), gy(V1))], W_SLOPE, ACCENT, k));
    out.push(
      label('slope-value', at(gx(RUN / 2), gy((V0 + V1) / 2)), 'label.slope', ACCENT, 'right', {
        offset: [-8, -13],
        vars: { a: A_AVG.toFixed(0) },
        opacity: k,
      }),
    );

    // ---- 걸린 시간과 속도 변화 ----
    const m = tl.at('measure');
    out.push(
      line(
        'measure',
        [at(gx(0), gy(V0)), at(gx(RUN), gy(V0)), at(gx(RUN), gy(V1))],
        W_MEASURE,
        { ...INK, lineStyle: 'dashed' },
        m,
      ),
    );
    out.push(
      label('measure-dt', at(gx(4.2), gy(V0) + 13), 'label.dt', INK, 'center', {
        vars: { t: RUN },
        opacity: m,
      }),
    );
    out.push(
      label('measure-dv', at(gx(RUN) + 8, gy((V0 + V1) / 2)), 'label.dv', INK, 'left', {
        vars: { v: V1 - V0 },
        opacity: m,
      }),
    );
  }

  return out;
}

/**
 * 고정 경계. 원본 캔버스 한 장(880 × 270)을 그대로 담고, 아래로 캡션 자리를 더 잡는다.
 * 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
 */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { minX: 0, maxX: W, minY: -CAPTION_ROOM, maxY: H };
}
