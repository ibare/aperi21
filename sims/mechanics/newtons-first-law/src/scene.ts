// ========================================================================
// newtons-first-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 어휘 배정 —
//   도로 띠 · 차체 · 승객 몸통 · 바퀴 속       `region`
//   차선 · 뒷문 · 칸막이 · 바닥 · 바퀴테 · 살
//   · 같은 순간 잇기                            `trajectory`
//   지붕 표식 · 승객 머리                       `body`
//   두 줄의 스트로보 자취와 지금 점             `trace`
//   앞칸 부딪힘                                 `trace` (tick, 나이와 함께 사라짐)
//   이름표                                      `readout` (월드 앵커)
//   캡션                                        `BundleSchema.caption` 슬롯
//
// 차체를 **반투명하게** 둔다(`opaque` 아님). 승객의 자취는 버스가 지나온 자리에
// 남는데 차체가 불투명하면 결정적인 마지막 몇 점이 가려진다 — 차체를 채우는 것과
// 자취를 보이는 것 중 자취가 이긴다 (원본 NOTES).
// ========================================================================

import type {
  Body,
  EnvironmentDef,
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
import { impactAge, wallX } from './physics';
import { IMPACT_LIFE, LEFT_CUT, REF, px, text, wy } from './schema';
import type { NewtonsFirstLawState, Sample } from './state';

// ------------------------------------------------------------------------
// 화면 px 로 두는 것 — 굵기 · 점 크기 · 글자는 물리량이 아니라 위계다
// ------------------------------------------------------------------------

/** 지나온 자리의 점 반지름. */
const TRAIL_DOT = 3.5;
/** 맨 앞 "지금" 점의 반지름. */
const TRAIL_NOW = 5;
/** 자취의 진하기. 원본의 0.62. */
const TRAIL_ALPHA = 0.62;
/** 잇는 선의 진하기. 원본의 0.20. */
const LINK_ALPHA = 0.2;
/** 이름표 글자 크기와 지금 점에서 띄우는 거리. */
const LABEL_FONT = 12;
const LABEL_OFFSET: Vec2 = [11, 0];
/** 차체 채움 — 아주 옅게. 내부 자취가 비쳐야 한다. */
const BUS_FILL = 0.07;
/** 도로 띠 채움. */
const ROAD_FILL = 0.22;
/** 앞칸 부딪힘 획의 길이와 굵기. */
const IMPACT_LEN = 18;
const IMPACT_WIDTH = 2;
/** 바퀴를 몇 각형으로 그릴 것인가. */
const WHEEL_STEPS = 24;
/** 도로가 화면 밖으로 이어지게 양옆으로 더 내미는 길이(원본 px). */
const ROAD_BLEED = 60;

// ------------------------------------------------------------------------
// 색 — 둘뿐이다. 버스 계열과 승객
// ------------------------------------------------------------------------
// 자취 점 · 지금 점 · 이름표 · 접촉 표시까지 **각 대상은 어디에 나오든 자기 색**이다.
// 잇는 선만 중립 먹색인데, 그것은 어느 한쪽의 것이 아니라 둘 사이의 관계이기 때문이다.

const BUS = { colorRole: 'secondary', emphasis: 'strong' } as const;
const BUS_MED = { colorRole: 'secondary', emphasis: 'medium' } as const;
const BUS_SOFT = { colorRole: 'secondary', emphasis: 'subtle' } as const;
const RIDER = { colorRole: 'accent', emphasis: 'strong' } as const;
const ROAD = { colorRole: 'muted', emphasis: 'strong' } as const;
const LANE = { colorRole: 'muted', emphasis: 'subtle' } as const;
const LINK = { colorRole: 'ink', emphasis: 'strong' } as const;

// ------------------------------------------------------------------------
// 선언 도우미
// ------------------------------------------------------------------------

function line(
  id: string,
  points: readonly Vec2[],
  width: number,
  style: Trajectory['style'],
  opacity: number,
  closed = false,
): Trajectory {
  return { type: 'trajectory', id, points, width, style, opacity, closed };
}

function rect(x0: number, x1: number, y0: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

function circle(cx: number, cy: number, r: number, steps: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: NewtonsFirstLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('newtons-first-law: schema.timeline 이 선언되어야 한다');

  /** 사이클 끝의 잦아듦. 원본이 코드에 두었던 알파 램프를 시간표가 준다. */
  const fade = 1 - timeline.at('fade');

  const out: Primitive[] = [];
  const busX = state.busX;
  /** 지붕 표식 — 자취를 찍는 기준점. */
  const mark = busX + px(REF.markDx);
  const wall = wallX(busX);
  const busTrailY = wy(REF.trailBusY);
  const riderTrailY = wy(REF.trailRiderY);

  // ---- 도로 ----
  // 이 조각에서 도로는 배경이 아니라 **기준계 그 자체**다. 흰 점선이 한 번도
  // 움직이지 않는 것이 카메라가 땅에 붙어 있다는 말이고, 좌표축이나 격자를 따로
  // 두지 않은 이유이기도 하다. 화면 양옆으로 내밀어 끝이 보이지 않게 한다.
  const roadL = -px(ROAD_BLEED);
  const roadR = px(REF.width + ROAD_BLEED);
  const road: Region = {
    type: 'region',
    id: 'road',
    points: rect(roadL, roadR, wy(REF.roadY + REF.roadH), wy(REF.roadY)),
    opaque: true,
    fillOpacity: ROAD_FILL,
    style: ROAD,
    opacity: fade,
  };
  out.push(road);
  const laneY = wy(REF.roadY + REF.roadH / 2);
  out.push(
    line(
      'lane',
      [
        [roadL, laneY],
        [roadR, laneY],
      ],
      2,
      { ...LANE, lineStyle: 'dashed' },
      fade,
    ),
  );

  // ---- 버스 ----
  // 제동력이 걸리는 유일한 물체.
  const bodyShell: Region = {
    type: 'region',
    id: 'bus-body',
    points: rect(busX, busX + px(REF.busLen), wy(REF.busBottom), wy(REF.busTop)),
    fillOpacity: BUS_FILL,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: BUS,
    opacity: fade,
  };
  out.push(bodyShell);

  // 뒷문 — 차체가 버스로 읽히게 하는 최소한.
  REF.doorDx.forEach((dx, i) => {
    const x = busX + px(dx);
    out.push(
      line(
        `bus-door-${i}`,
        [
          [x, wy(REF.busTop + REF.doorTopInset)],
          [x, wy(REF.busBottom)],
        ],
        1,
        BUS_SOFT,
        fade,
      ),
    );
  });

  // 앞칸 칸막이 — 승객이 결국 닿게 되는 벽.
  out.push(
    line(
      'bus-partition',
      [
        [wall, wy(REF.busTop + 8)],
        [wall, wy(REF.busBottom)],
      ],
      3,
      BUS,
      fade,
    ),
  );

  // 버스 안 바닥.
  out.push(
    line(
      'bus-floor',
      [
        [busX + px(6), wy(REF.riderFoot)],
        [wall, wy(REF.riderFoot)],
      ],
      2,
      BUS_MED,
      fade,
    ),
  );

  // 바퀴 — 굴러가다 서는 것이 보이게 살 하나를 넣는다.
  const wheelY = wy(REF.wheelY);
  const wheelR = px(REF.wheelR);
  REF.wheelDx.forEach((dx, i) => {
    const cx = busX + px(dx);
    // 속은 바탕색이다. `opaque` 가 바탕을 먼저 깔아 도로가 비쳐 보이지 않는다.
    const hub: Region = {
      type: 'region',
      id: `wheel-hub-${i}`,
      points: circle(cx, wheelY, wheelR, WHEEL_STEPS),
      opaque: true,
      fillOpacity: 0,
      style: BUS,
      opacity: fade,
    };
    out.push(hub);
    out.push(line(`wheel-rim-${i}`, circle(cx, wheelY, wheelR, WHEEL_STEPS), 2.5, BUS, fade, true));
    // 살 하나. 월드는 y 가 위라 화면에서 같은 방향으로 돌게 각을 뒤집는다.
    const a = -state.wheel;
    const arm = wheelR - px(3);
    out.push(
      line(
        `wheel-spoke-${i}`,
        [
          [cx - Math.cos(a) * arm, wheelY - Math.sin(a) * arm],
          [cx + Math.cos(a) * arm, wheelY + Math.sin(a) * arm],
        ],
        2,
        BUS_MED,
        fade,
      ),
    );
  });

  // 지붕 표식 — 자취를 찍는 기준점.
  const roofMark: Body = {
    type: 'body',
    id: 'bus-mark',
    shape: 'circle',
    size: px(4),
    pos: [mark, wy(REF.busTop)],
    glow: false,
    style: BUS,
    opacity: fade,
  };
  out.push(roofMark);

  // ---- 같은 순간 잇기 ----
  // 같은 시각에 찍힌 버스와 승객을 한 쌍으로 묶는다. 등속에서는 수직으로 서 있고,
  // 버스만 느려지기 시작하면 승객 쪽이 앞서면서 기운다 — 기울기가 곧 그 순간까지
  // 벌어진 상대 변위다. 이것 하나가 주장의 절반을 진다.
  //
  // 표준 어휘 조합으로 되는 것은 승격하지 않는다 (원칙 4) — 점 2개짜리 궤적이다.
  const linkTop = wy(REF.trailBusY + 6);
  const linkBottom = wy(REF.trailRiderY - 6);
  const pairs: Sample[] = [...state.samples, { bus: mark, rider: state.riderX }];
  pairs.forEach((s, i) => {
    if (s.bus < LEFT_CUT && s.rider < LEFT_CUT) return;
    out.push(
      line(
        `link-${i}`,
        [
          [s.bus, linkTop],
          [s.rider, linkBottom],
        ],
        1,
        LINK,
        LINK_ALPHA * fade,
      ),
    );
  });

  // ---- 두 줄의 자취 ----
  // **`age` 를 주지 않는다.** 스트로보처럼 지나온 자리를 지우지 않고 남긴다 —
  // 점 사이 간격이 곧 그 0.3 초 동안 간 거리라, 지우면 주장이 사라진다.
  //
  // 버스는 브레이크 뒤로 간격이 좁아지고(36.6 → 25.8 → 15 → 0), 승객은 마찰이 0 인
  // 동안 42 px 그대로다. 그 차이가 "승객에게 걸린 수평힘이 0" 이라는 말과 같은 말이다.
  const busTrail: Trace = {
    type: 'trace',
    id: 'bus-trail',
    marks: state.samples
      .filter((s) => s.bus >= LEFT_CUT)
      .map((s) => ({ pos: [s.bus, busTrailY] as Vec2 })),
    shape: 'dot',
    size: TRAIL_DOT,
    style: BUS,
    opacity: TRAIL_ALPHA * fade,
  };
  out.push(busTrail);
  const busNow: Trace = {
    type: 'trace',
    id: 'bus-now',
    marks: [{ pos: [mark, busTrailY] }],
    shape: 'dot',
    size: TRAIL_NOW,
    style: BUS,
    opacity: TRAIL_ALPHA * fade,
  };
  out.push(busNow);
  // 이름은 지금 점 바로 옆, 진행 방향 앞쪽 빈자리에. 범례는 독자를 화면 구석으로
  // 보냈다 돌아오게 하지만, 대상에 붙은 이름은 보는 자리에서 읽힌다.
  const busLabel: Readout = {
    type: 'readout',
    id: 'bus-label',
    anchor: { world: [mark, busTrailY], offset: LABEL_OFFSET },
    text: text('label.bus'),
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: LABEL_FONT,
    style: BUS,
    opacity: fade,
  };
  out.push(busLabel);

  const riderTrail: Trace = {
    type: 'trace',
    id: 'rider-trail',
    marks: state.samples
      .filter((s) => s.rider >= LEFT_CUT)
      .map((s) => ({ pos: [s.rider, riderTrailY] as Vec2 })),
    shape: 'dot',
    size: TRAIL_DOT,
    style: RIDER,
    opacity: TRAIL_ALPHA * fade,
  };
  out.push(riderTrail);
  const riderNow: Trace = {
    type: 'trace',
    id: 'rider-now',
    marks: [{ pos: [state.riderX, riderTrailY] }],
    shape: 'dot',
    size: TRAIL_NOW,
    style: RIDER,
    opacity: TRAIL_ALPHA * fade,
  };
  out.push(riderNow);
  const riderLabel: Readout = {
    type: 'readout',
    id: 'rider-label',
    anchor: { world: [state.riderX, riderTrailY], offset: LABEL_OFFSET },
    text: text('label.rider'),
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: LABEL_FONT,
    style: RIDER,
    opacity: fade,
  };
  out.push(riderLabel);

  // ---- 승객 ----
  // 제동력이 걸리지 않는 물체. 마찰 0 이면 가속도 0 이라 버스가 느려지는 동안에도
  // 속도가 그대로다. 몸을 기울이지 않고 평행이동만 시킨다 — 기울이면 회전까지
  // 끌어들여 오히려 거짓말이 된다 (원본 NOTES).
  const torso: Region = {
    type: 'region',
    id: 'rider-torso',
    points: rect(
      state.riderX - px(REF.riderHalf),
      state.riderX + px(REF.riderHalf),
      wy(REF.riderFoot),
      wy(REF.riderFoot - 40),
    ),
    fillOpacity: 1,
    style: RIDER,
    opacity: fade,
  };
  out.push(torso);
  const head: Body = {
    type: 'body',
    id: 'rider-head',
    shape: 'circle',
    size: px(9),
    pos: [state.riderX, wy(REF.riderFoot - 49)],
    glow: false,
    style: RIDER,
    opacity: fade,
  };
  out.push(head);

  // ---- 앞칸 부딪힘 ----
  // 승객에게 **처음으로** 실제 힘이 걸리는 순간과 그 지점. 조각이 하려던 말의
  // 마지막 조각이다. 여기서만 자국에 나이를 준다 — 사건이라 사라져야 한다.
  const age = impactAge(state);
  if (age !== null && age <= IMPACT_LIFE) {
    const impact: Trace = {
      type: 'trace',
      id: 'impact',
      marks: [-22, 0, 22].map((dy) => ({
        pos: [wall + px(11), wy(REF.riderFoot - 26 + dy)] as Vec2,
        age,
      })),
      shape: 'tick',
      direction: [1, 0],
      size: IMPACT_LEN,
      width: IMPACT_WIDTH,
      life: IMPACT_LIFE,
      style: RIDER,
      opacity: fade,
    };
    out.push(impact);
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/**
 * 고정 경계 — 원본 캔버스 한 장(860 × 280)을 그대로 담는다. 매 프레임 같은 값이라
 * 카메라가 흔들리지 않는다 (원칙 6).
 *
 * **프레이밍이 곧 주장이다.** 카메라는 땅에 고정돼 있다. 버스를 따라가는 카메라는
 * 버스가 서 있는 것처럼 보이게 만들고, 그러면 승객만 혼자 앞으로 튀어나가는 그림이
 * 되어 "무언가가 밀었다" 는 잘못된 인상을 되레 강화한다.
 */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return {
    minX: 0,
    maxX: px(REF.width),
    minY: wy(REF.height),
    maxY: wy(0),
  };
}
