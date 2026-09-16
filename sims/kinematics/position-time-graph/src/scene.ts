// ========================================================================
// position-time-graph — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// ---- 한 월드, 한 눈금 ----
// 이 조각이 성립하는 이유는 **왼쪽 통로의 세로와 오른쪽 그래프의 세로축이 같은
// 눈금**이기 때문이다. 그래서 월드 y 를 아예 높이 그 자체로 둔다 — 통로 바닥이 0,
// 꼭대기가 1, 그래프의 세로도 같은 0~1. 두 그림이 같은 물리량을 같은 y 로 쓰므로
// 어긋날 자리가 없다. 원본이 `yTop`/`yBot` 상수를 두 그리기 코드에서 손으로 공유하던
// 자리다.
//
// 월드 x 는 원본 캔버스의 픽셀을 그대로 옮긴 것이고(1 px = 1/236 월드), 축척은
// 통로 높이 236 px = 1 로 잡았다. 그래서 아래 `REF` 의 숫자는 원본 `geom()` 의 값과
// 한 글자도 다르지 않다.
//
// ---- `graph` 를 쓰지 않은 이유 ----
// `graph`(style: 'line')는 **화면 우상단 HUD 카드**에 고정으로 뜬다
// (`renderer/primitives/graph.ts`). 카드로 떠 버리면 세로축이 통로와 다른 눈금을
// 갖게 되어 이 조각의 전제가 깨진다. 눈금 수와 범례도 함께 나오는데, 원본은 둘 다
// 두지 않기로 한 조각이다. `velocity-time-graph` 가 같은 이유로 `graph` 를 쓰지 않았다.
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

import { phaseId, RUN, text } from './schema';
import type { LaneState, PositionTimeGraphState } from './state';

// ------------------------------------------------------------------------
// 자리 — 원본 `geom()` 의 픽셀을 그대로
// ------------------------------------------------------------------------

/**
 * 원본 배치(px). 캔버스는 보고서 폭 900 에서 `.wrap`(max-width 860, padding 0 8px)
 * 안에 꽉 차 860 × 342 다. `gx1 = max(320, W - 30)` 이므로 860 에서 830.
 */
const REF = {
  width: 860,
  height: 342,
  yTop: 40,
  yBot: 276,
  lanes: [
    [22, 60],
    [68, 106],
  ],
  gx0: 142,
  gx1: 830,
  /** 축이 원점 너머로 더 뻗는 길이. 화살촉이 그 끝에 붙는다. */
  axisOver: 10,
  /** 화살촉 — 길이와 밑변 반폭. */
  head: { len: 7, half: 3.6 },
  /** 안내 점선이 구슬에서 떨어져 시작하는 거리. */
  guideGap: 12,
  /** 통로를 가로지르는 금이 통로 양 옆에서 물러서는 거리. */
  tickInset: 4,
  /** 구슬 반지름. */
  ball: 10,
  /** 자취 끝의 펜 점 반지름. */
  pen: 4.5,
  /** 자국의 속 찬 점 반지름. 그 둘레를 배경색이 두른다. */
  tickDot: 2.4,
  /** '높이' — 통로 머리 왼쪽에. 원본은 (22, yTop − 11) 기준선. */
  heightLabel: { x: 22, baseline: 40 - 11 },
  /** '시간' — 가로축 화살촉 아래 오른끝에. 원본은 (gx1 + 10, yBot + 17) 기준선, 오른쪽 정렬. */
  timeLabel: { x: 830 + 10, baseline: 276 + 17 },
  /** 글자 크기. 원본 FONT 는 12 px. */
  fontSize: 12,
  /** 선 굵기 — 축 · 안내선 · 자취 · 금. */
  axisWidth: 1.2,
  guideWidth: 1,
  trailWidth: 2.6,
  laneTickWidth: 1.6,
  /** 안내 점선과 통로의 금이 옅어지는 정도. */
  guideAlpha: 0.4,
  laneTickAlpha: 0.5,
  /** 통로 채움의 세기. 원본의 옅은 베이지(#e9e3d5)는 배경보다 한 톤 짙은 정도다. */
  laneFill: 0.1,
} as const;

/** 원본 1 px 이 월드로 얼마인가. 통로 높이 236 px 을 1 로 둔다. */
const PX = 1 / (REF.yBot - REF.yTop);
const px = (n: number): number => n * PX;

/** 원본 캔버스 x(px) → 월드 x. */
const wx = (n: number): number => px(n);
/** 원본 캔버스 y(px) → 월드 y. 통로 바닥이 0 이고 위가 자란다. */
const wy = (n: number): number => px(REF.yBot - n);

/** 높이 0~1 → 월드 y. 통로와 그래프가 **이 한 줄을 공유한다.** */
const Y = (pos: number): number => pos;
/** 이번 판의 시각(초) → 그래프의 월드 x. 주행이 끝나면 오른쪽 끝에 머문다. */
const X = (t: number): number =>
  wx(REF.gx0 + (Math.min(t, RUN) / RUN) * (REF.gx1 - REF.gx0));

/** 통로 한가운데의 월드 x. */
const laneCenter = (i: number): number => wx((REF.lanes[i]![0] + REF.lanes[i]![1]) / 2);

// ------------------------------------------------------------------------
// 색 — 구슬 하나에 색 하나
// ------------------------------------------------------------------------
// 그 구슬의 자취 · 자국 · 안내선이 모두 같은 색이다. 색이 뜻하는 것은 "어느
// 구슬인가" 하나뿐이고, 빠르기는 판마다 바뀌므로 색에 붙지 않는다 (S-piece).

const BEAD = [
  { colorRole: 'primary', emphasis: 'strong' },
  { colorRole: 'secondary', emphasis: 'strong' },
] as const;
/** 통로 바닥. 원본의 옅은 베이지. */
const LANE = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 축. 원본의 따뜻한 회색(#8d8778). */
const AXIS = { colorRole: 'muted', emphasis: 'medium' } as const;
/** 축 이름. 원본은 본문 먹색(#3f3a32). */
const LABEL = { colorRole: 'ink', emphasis: 'strong' } as const;

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

/** 속이 꽉 찬 다각형. 통로 바닥과 화살촉이 쓴다. */
function fill(
  id: string,
  points: readonly Vec2[],
  style: Region['style'],
  fillOpacity: number,
): Region {
  return { type: 'region', id, points, style, fillOpacity, opaque: true };
}

/**
 * 속 찬 원.
 *
 * `outline: 'background'` 는 **바탕색으로 두르는 것**이다 — 구슬과 자국의 점은 통로의
 * 금이나 자취 위에 겹쳐 놓이므로, 제 경계를 바탕으로 도려내야 선에 먹히지 않고
 * 읽힌다. 자취 끝의 펜 점은 제 선의 머리라 두르지 않는다(원본도 채우기만 한다).
 */
function dot(
  id: string,
  pos: Vec2,
  radius: number,
  style: Body['style'],
  opacity: number,
  outline: Body['outline'],
): Body {
  return { type: 'body', id, shape: 'circle', pos, size: radius, style, outline, glow: false, opacity };
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: PositionTimeGraphState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('position-time-graph: schema.timeline 이 선언되어야 한다');
  const s = params.state;

  // 장면의 투명도. 주행 첫머리에 살아나고 판 끝에 지워진다. 손잡이가 주도권을
  // 가져간 뒤에는 지우지 않는다 — 독자가 만드는 그래프가 저 혼자 사라지면 안 된다.
  const round = s.round === 1 ? 1 : 0;
  const a = s.manual ? 1 : tl.at(phaseId('appear', round)) * (1 - tl.at(phaseId('fade', round)));

  /** 펜이 지금 가 있는 시각. 주행이 끝나면 오른쪽 끝에 선다. */
  const penT = Math.min(s.tr, RUN);
  const lanes: readonly LaneState[] = [s.a, s.b];
  const out: Primitive[] = [];

  // ---- 오르는 두 길 ----
  // 통로를 **세로로 세운** 것이 이 조각의 전부다. 가로로 누웠다면 그래프의 세로축과
  // 눈금을 공유할 수 없고, 주장을 보이는 방법 자체가 사라진다.
  for (let i = 0; i < 2; i++) {
    const [x0, x1] = REF.lanes[i]!;
    out.push(
      fill(
        `lane-${i}`,
        [
          [wx(x0!), Y(0)],
          [wx(x1!), Y(0)],
          [wx(x1!), Y(1)],
          [wx(x0!), Y(1)],
        ],
        LANE,
        REF.laneFill,
      ),
    );
  }
  const heightLabel: Readout = {
    type: 'readout',
    id: 'label-height',
    anchor: { world: [wx(REF.heightLabel.x), wy(REF.heightLabel.baseline)], offset: [0, -4] },
    text: text('label.height'),
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: REF.fontSize,
    style: LABEL,
  };
  out.push(heightLabel);

  // ---- 시간과 높이의 축 ----
  // 축을 두는 것은 기본이 아니라 결정이다. 여기서는 "가로가 시간, 세로가 높이" 가
  // 주장의 전제라 뺄 수 없다. 대신 최소한으로 — 선 둘, 화살촉 둘, 낱말 둘. 눈금
  // 숫자도 격자도 없다.
  out.push(
    line(
      'axis',
      [
        [wx(REF.gx0), wy(REF.yTop - REF.axisOver)],
        [wx(REF.gx0), Y(0)],
        [wx(REF.gx1 + REF.axisOver), Y(0)],
      ],
      REF.axisWidth,
      AXIS,
    ),
  );
  out.push(
    fill(
      'axis-head-t',
      [
        [wx(REF.gx1 + REF.axisOver), Y(0)],
        [wx(REF.gx1 + REF.axisOver - REF.head.len), wy(REF.yBot - REF.head.half)],
        [wx(REF.gx1 + REF.axisOver - REF.head.len), wy(REF.yBot + REF.head.half)],
      ],
      AXIS,
      1,
    ),
  );
  out.push(
    fill(
      'axis-head-h',
      [
        [wx(REF.gx0), wy(REF.yTop - REF.axisOver)],
        [wx(REF.gx0 - REF.head.half), wy(REF.yTop - REF.axisOver + REF.head.len)],
        [wx(REF.gx0 + REF.head.half), wy(REF.yTop - REF.axisOver + REF.head.len)],
      ],
      AXIS,
      1,
    ),
  );
  const timeLabel: Readout = {
    type: 'readout',
    id: 'label-time',
    anchor: { world: [wx(REF.timeLabel.x), wy(REF.timeLabel.baseline)], offset: [0, -4] },
    text: text('label.time'),
    chip: false,
    align: 'right',
    font: 'text',
    fontSize: REF.fontSize,
    style: LABEL,
  };
  out.push(timeLabel);

  // ---- 높이를 잇는 안내선 ----
  // 통로의 높이와 그래프의 세로가 같은 값임을 잇는 유일한 장치다. 옅게.
  for (let i = 0; i < 2; i++) {
    const y = Y(lanes[i]!.pos);
    out.push(
      line(
        `guide-${i}`,
        [
          [laneCenter(i) + px(REF.guideGap), y],
          [X(penT), y],
        ],
        REF.guideWidth,
        { ...BEAD[i]!, lineStyle: 'dashed' },
        REF.guideAlpha * a,
      ),
    );
  }

  // ---- 구슬이 남긴 선 ----
  // 완성된 그래프를 띄우는 것이 아니라 펜이 끌려가며 남긴다. 빠른 구슬의 펜은 같은
  // 시간에 더 많이 올라가므로, 자라는 동안 두 선 사이가 **벌어진다.**
  for (let i = 0; i < 2; i++) {
    const lane = lanes[i]!;
    const points: Vec2[] = lane.trail.map(([t, p]) => [X(t), Y(p)]);
    // 끝점은 늘 덧붙인다 — 표본이 0.05 초마다라 그러지 않으면 펜이 선에서 떨어진다.
    points.push([X(penT), Y(lane.pos)]);
    out.push(line(`trail-${i}`, points, REF.trailWidth, BEAD[i]!, a));
    out.push(dot(`pen-${i}`, [X(penT), Y(lane.pos)], px(REF.pen), BEAD[i]!, a, 'none'));
  }

  // ---- 1초마다 찍히는 자국 ----
  // 「기울기」라는 말을 쓰지 않고 기울기를 재게 하는 장치다. 자국 사이의 세로 간격이
  // 곧 '1초에 오른 만큼' 이고, 같은 자국을 통로 쪽에도 금으로 남겨 그래프의 간격과
  // 실제로 오른 거리가 같은 것임을 맞대어 보게 한다.
  for (let i = 0; i < 2; i++) {
    const lane = lanes[i]!;
    const [x0, x1] = REF.lanes[i]!;
    if (lane.ticks.length > 0) {
      const laneTicks: Trace = {
        type: 'trace',
        id: `lane-ticks-${i}`,
        marks: lane.ticks.map(([, p]) => ({ pos: [laneCenter(i), Y(p)] as Vec2 })),
        shape: 'tick',
        // 통로를 가로지르므로 가로. 이 조각의 금은 모두 같은 쪽을 보므로
        // `marks[].direction` 은 쓰지 않는다.
        direction: [1, 0],
        size: x1! - x0! - REF.tickInset * 2,
        width: REF.laneTickWidth,
        style: BEAD[i]!,
        opacity: REF.laneTickAlpha * a,
      };
      out.push(laneTicks);
    }
    lane.ticks.forEach(([t, p], k) => {
      out.push(
        dot(`tick-dot-${i}-${k}`, [X(t), Y(p)], px(REF.tickDot), BEAD[i]!, a, 'background'),
      );
    });
  }

  // ---- 구슬 ----
  for (let i = 0; i < 2; i++) {
    out.push(
      dot(`ball-${i}`, [laneCenter(i), Y(lanes[i]!.pos)], px(REF.ball), BEAD[i]!, a, 'background'),
    );
  }

  return out;
}

/**
 * 고정 경계. 원본 캔버스 한 장(860 × 342)을 그대로 담는다 — 아래 66 px 이 '시간'
 * 낱말과 캡션의 자리다. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
 */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return {
    minX: wx(0),
    maxX: wx(REF.width),
    minY: wy(REF.height),
    maxY: wy(0),
  };
}
