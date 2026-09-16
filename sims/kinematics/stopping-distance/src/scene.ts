// ========================================================================
// stopping-distance — 선언으로서의 장면
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 도로와 자취는 `region`, 위험 발견 지점은 `trajectory`(점선), 반복 눈금은
// `scale`(숫자 없이), 거리 값과 속력은 `readout`, 차는 `body` 다.
//
// 원본은 가로만 미터로 두고 세로는 픽셀로 그렸다. 엔진의 좌표는 등방이라 세로도
// 미터여야 하므로 `toM` · `worldY` 가 원본의 픽셀 상수를 한 배율로 미터로 옮긴다
// (schema.ts 「배치」). 이 파일에 새로 만든 치수는 없다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  Scale,
  SceneGraph,
  StageDef,
  TimelineFrame,
  ViewDef,
  Vec2,
} from '@aperi21/schema';

import { readConstants, readings, type CarReading } from './physics';
import {
  CARS,
  FONT,
  LABEL_FADE,
  LAYOUT,
  TICK_ALPHA,
  TICK_FADE,
  TOTAL_MAX,
  UNIT_CAR,
  text,
  toM,
  worldY,
} from './schema';
import type { StoppingDistanceState } from './state';

/** 경로 좌표의 자릿수. */
const n = (v: number): string => v.toFixed(4);

/**
 * 차 외형 — **앞범퍼가 원점**이다. 거리는 앞범퍼 위치로만 잰다.
 *
 * 원본의 두 사각(차체 24×11, 객실 12×7)을 한 경로로 낸다. 축척대로 그리면 실제
 * 차 길이(약 4.5 m)가 30 km/h 의 제동 띠(5.8 m)를 거의 덮으므로, 원본처럼 화면
 * 치수(24 px)를 그대로 미터로 옮긴다.
 */
const CAR_PATH = [
  `M ${n(-toM(24))} ${n(-toM(5))}`,
  `L 0 ${n(-toM(5))}`,
  `L 0 ${n(toM(6))}`,
  `L ${n(-toM(24))} ${n(toM(6))}`,
  'Z',
  `M ${n(-toM(18))} ${n(toM(5))}`,
  `L ${n(-toM(6))} ${n(toM(5))}`,
  `L ${n(-toM(6))} ${n(toM(12))}`,
  `L ${n(-toM(18))} ${n(toM(12))}`,
  'Z',
].join(' ');

/** 도로 띠의 옅기. 배경 위에 이만큼 올린 색으로 **불투명하게** 덮는다. */
const ROAD_FILL = 0.16;
/** 반응 구간 자취의 옅기. 강조가 아니므로 중립 회색이다. */
const REACT_FILL = 0.5;
/** 제동 구간 자취 — 강조색은 **제동**이라는 뜻 하나에만 쓴다. */
const BRAKE_FILL = 1;
/** 세로 점선의 옅기. 축이 아니라 전제를 보증하는 선 하나다. */
const GUIDE_OPACITY = 0.55;
/** 띠 안 글자를 왼쪽 변에서 띄우는 거리(px). */
const LABEL_INSET_PX = 5;
/** 속력 라벨을 차 위로 올리는 거리(px). 원본은 기준선 −17, 가운데 기준으로 −21. */
const SPEED_LABEL_UP_PX = 21;

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** 한 레인의 띠 윗변·아랫변·차 중심(월드 y). */
function lane(lanePx: number): { top: number; bottom: number; center: number } {
  return {
    top: worldY(lanePx + LAYOUT.barDyPx),
    bottom: worldY(lanePx + LAYOUT.barDyPx + LAYOUT.barHPx),
    center: worldY(lanePx),
  };
}

function band(
  id: string,
  x0: number,
  x1: number,
  top: number,
  bottom: number,
  role: NonNullable<Region['style']>['colorRole'],
  fillOpacity: number,
): Region {
  return {
    type: 'region',
    id,
    points: [
      [x0, top],
      [x1, top],
      [x1, bottom],
      [x0, bottom],
    ],
    // 겹쳐도 짙어지지 않는다 — 같은 대상은 같은 색이어야 한다.
    opaque: true,
    fillOpacity,
    style: { colorRole: role, emphasis: 'strong' },
  };
}

/**
 * 한 칸을 단위로 잘랐을 때 **안쪽**에 서는 눈금값. 끝 눈금은 띠의 변과 겹치므로
 * 두지 않는다 — 원본이 마지막 1 px 을 비운 것과 같다.
 */
function interiorTicks(length: number, unit: number): number[] {
  const out: number[] = [];
  for (let v = unit; v < length - toM(1); v += unit) out.push(v);
  return out;
}

/**
 * 반복 눈금. 한 구간의 길이를 단위로 삼아 배수를 **세는 일**로 만든다 —
 * 반응 띠는 1 / 2 / 3 칸, 제동 띠는 1 / 4 / 9 칸.
 *
 * `labelAt` 을 비운다. 숫자를 붙이면 세는 일이 읽는 일이 되어 장치가 무너진다.
 */
function ticks(
  id: string,
  start: number,
  length: number,
  unit: number,
  top: number,
  opacity: number,
): Scale | null {
  const at = interiorTicks(length, unit);
  if (at.length === 0) return null;
  return {
    type: 'scale',
    id,
    shape: 'linear',
    pos: [start, top],
    direction: [1, 0],
    size: length,
    range: [0, length],
    value: 0,
    tickAt: at,
    labelAt: [],
    opacity,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 띠 안에 얹히는 거리 값. 칸에 안 들어가면 빠진다. */
function distanceLabel(
  id: string,
  x: number,
  y: number,
  label: Readout['text'],
  metres: number,
  opacity: number,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: [x, y] },
    text: label,
    vars: { d: metres.toFixed(1) },
    chip: false,
    align: 'left',
    fontSize: FONT.dist,
    // 좁은 컨테이너에서 잘린 글자를 남기지 않는다.
    hideWhenClipped: true,
    opacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

function carParts(car: CarReading, centerY: number): Primitive[] {
  const pos: Vec2 = [car.x, centerY];
  const body: Body = {
    type: 'body',
    id: `car-${car.id}`,
    pos,
    shape: 'custom',
    customPath: CAR_PATH,
    // 채움만 한다. 저작자가 그린 모양 그대로 나가야 한다.
    fill: 'solid',
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  const wheel = (suffix: string, dx: number): Body => ({
    type: 'body',
    id: `wheel-${car.id}-${suffix}`,
    pos: [car.x - toM(dx), centerY - toM(7)],
    shape: 'circle',
    size: toM(3),
    fill: 'solid',
    outline: 'none',
    // 짙게 칠하되 후광은 없다 — 바퀴는 빛나지 않는다.
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  const out: Primitive[] = [body, wheel('rear', 18), wheel('front', 6)];

  if (car.braking) {
    // 브레이크등. 띠와 같은 붉은색이다 — 같은 뜻이기 때문이다.
    out.push({
      type: 'body',
      id: `brakelight-${car.id}`,
      pos: [car.x - toM(25), centerY + toM(1.5)],
      shape: 'rect',
      size: [toM(2), toM(5)],
      fill: 'solid',
      outline: 'none',
      style: { colorRole: 'primary', emphasis: 'strong' },
    } satisfies Body);
  }

  return out;
}

export function scene(params: {
  state: StoppingDistanceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('stopping-distance: schema.timeline 이 선언되어야 한다');

  const c = readConstants(stage);
  const cars = readings(CARS, c, timeline);
  const unit = cars.find((r) => r.id === UNIT_CAR.id) ?? cars[0]!;

  // 반복 눈금은 세 대가 모두 선 뒤에 나타난다. 자동으로 켜지는 것이 아니라
  // **세는 일이 주장일 때만** 켜지는 장치다.
  const tickOpacity =
    TICK_ALPHA * timeline.span(timeline.start('hold'), timeline.start('hold') + TICK_FADE);

  const out: Primitive[] = [];

  // ---- 도로 ----
  // 끝을 90 km/h 의 정지 거리(77.083 m)에 맞췄다. 가장 빠른 차가 그 끝에 정확히
  // 서는 것으로 "이 무대가 딱 그만큼이다" 를 말한다.
  for (const car of cars) {
    const g = lane(car.lanePx);
    out.push(band(`road-${car.id}`, 0, TOTAL_MAX, g.top, g.bottom, 'muted', ROAD_FILL));
  }

  // ---- 위험 발견 지점 ----
  // 축이 아니다. 세 띠가 **같은 원점**에서 잰 길이라는 전제를 보증하는 선 하나다.
  out.push({
    type: 'trajectory',
    id: 'hazard',
    points: [
      [0, worldY(LAYOUT.guideBottomPx)],
      [0, worldY(LAYOUT.guideTopPx)],
    ],
    width: 1,
    opacity: GUIDE_OPACITY,
    style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // ---- 반응 구간 자취 ----
  for (const car of cars) {
    if (car.reactTrailEnd <= 0) continue;
    const g = lane(car.lanePx);
    out.push(band(`react-${car.id}`, 0, car.reactTrailEnd, g.top, g.bottom, 'muted', REACT_FILL));
  }

  // ---- 제동 구간 자취 ----
  for (const car of cars) {
    const width = car.x - car.reactTrailEnd;
    if (width <= 0) continue;
    const g = lane(car.lanePx);
    out.push(
      band(`brake-${car.id}`, car.reactTrailEnd, car.x, g.top, g.bottom, 'primary', BRAKE_FILL),
    );
  }

  // ---- 반복 눈금 ----
  if (tickOpacity > 0) {
    for (const car of cars) {
      const g = lane(car.lanePx);
      const r = ticks(`react-ticks-${car.id}`, 0, car.reactDist, unit.reactDist, g.top, tickOpacity);
      if (r) out.push(r);
      const b = ticks(
        `brake-ticks-${car.id}`,
        car.reactDist,
        car.brakeDist,
        unit.brakeDist,
        g.top,
        tickOpacity,
      );
      if (b) out.push(b);
    }
  }

  // ---- 구간 거리 값 ----
  // 각 차가 **선 뒤에야** 나타난다. 자라는 동안 화면에 있는 것은 길이뿐이다.
  cars.forEach((car, i) => {
    if (car.stoppedFor === null) return;
    const opacity = clamp01(car.stoppedFor / LABEL_FADE);
    const y = worldY(car.lanePx + LAYOUT.barDyPx + LAYOUT.barHPx / 2);
    const named = i === 0;
    out.push(
      distanceLabel(
        `react-dist-${car.id}`,
        toM(LABEL_INSET_PX),
        y,
        text(named ? 'label.reactNamed' : 'label.dist'),
        car.reactDist,
        opacity,
      ),
    );
    out.push(
      distanceLabel(
        `brake-dist-${car.id}`,
        car.reactDist + toM(LABEL_INSET_PX),
        y,
        text(named ? 'label.brakeNamed' : 'label.dist'),
        car.brakeDist,
        opacity,
      ),
    );
  });

  // ---- 자동차 ----
  // 세 대가 모두 같은 어두운 색이다. 속력은 위에 적힌 글자와 서 있는 위치로
  // 구분한다 — 색이 형태의 일을 가로채지 않는다.
  for (const car of cars) {
    const g = lane(car.lanePx);
    out.push(...carParts(car, g.center));
  }

  // ---- 속력 ----
  for (const car of cars) {
    const label: Readout = {
      type: 'readout',
      id: `speed-${car.id}`,
      anchor: { world: [car.x - toM(24), worldY(car.lanePx - SPEED_LABEL_UP_PX)] },
      text: text('label.speed'),
      vars: { kmh: car.kmh },
      chip: false,
      align: 'left',
      fontSize: FONT.speed,
      // 좁은 컨테이너에서 맨 아래 차의 라벨이 오른쪽으로 잘려 나가던 자리다.
      clamp: true,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(label);
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/**
 * 고정 경계. 프레이밍은 주장의 일부다 — 무대는 발견 지점(0 m)부터 90 km/h 의
 * 정지 거리까지이고, 그보다 왼쪽에서 달려오는 차는 화면 밖에서 들어온다.
 */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return {
    minX: -toM(LAYOUT.originXPx),
    maxX: TOTAL_MAX + toM(LAYOUT.rightPadPx),
    minY: worldY(LAYOUT.guideBottomPx),
    maxY: worldY(LAYOUT.guideTopPx),
  };
}
