// ========================================================================
// velocity-time-graph — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 넓이 · 떨어지는 기둥 · 길 위 띠 · 길은 `region`,
// 축 · 곡선 · 경계 · 말뚝 · 바늘은 `trajectory`, 지금 속도 점은 `marker`, 바퀴는
// `body`, 축 이름은 `readout`. 캡션은 선언의 캡션 슬롯이 그린다.
//
// ---- 두 칸, 월드 하나 ----
// 그래프 칸(위)과 길 칸(아래)을 **한 월드 좌표**에 위아래로 놓는다. 월드 1 = 길 1 m.
//
//   길      x = 간 거리(m),            y ∈ [0, BAND_H]
//   그래프  x = t · TIME_X,            y = AXIS_Y + v · VY
//
// TIME_X = D / T_END 라 그래프 폭과 길 폭이 같다 (원본도 둘 다 plotW).
// 칠 넓이 보존 — 그래프의 1 m(= 1 m/s × 1 s)가 차지하는 넓이 TIME_X · VY 를 길 위
// 1 m × 띠 두께 BAND_H 와 같게 둔다. 원본의 `h = pxs·pxv / k` 를 월드로 옮긴 것이다.
// 그래서 떨어지는 기둥은 모양만 바뀌고 칠의 양은 그대로다. 두 축척은 서로에게서
// 유도된다 — 따로 "알맞게" 맞추면 이 약속이 깨진다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Marker,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { TOTAL_DISTANCE as D, distance, landedUntil, stripProgress, velocity } from './physics';
import { KNOTS, STAGGER, SUB, T_END, V_MAX, text } from './schema';
import type { VelocityTimeGraphState } from './state';

// ------------------------------------------------------------------------
// 축척 — 원본 배치(860 × 250 캔버스)에서 그대로 유도한다
// ------------------------------------------------------------------------

/** 원본의 배치 상수(px). 보고서 폭(900)에서 캔버스는 860, 그래프 폭은 860 − 44 − 22. */
const REF = {
  height: 250,
  left: 44,
  right: 22,
  plotW: 860 - 44 - 22,
  /** 1 m/s 가 몇 px. */
  pxv: 16,
  /** 가로축 높이 — 22 + V_MAX · pxv + 6. */
  axisY: 22 + V_MAX * 16 + 6,
  /** 길 바닥 — H − 10. */
  bandBottom: 250 - 10,
  /** 캡션이 캔버스 안으로 들어오며 그림 아래 더 잡는 자리. 원본은 캔버스 밖 6px + 한 줄. */
  captionRoom: 30,
} as const;

/** 원본 1px 이 월드로 얼마인가. 원본의 k(길 1 m 의 px) = plotW / D 의 역수. */
const PX = D / REF.plotW;
const px = (n: number): number => n * PX;

/** 그래프에서 1 s 의 월드 폭. 그래프 폭 = 길 폭. */
const TIME_X = D / T_END;
/** 그래프에서 1 m/s 의 월드 높이. */
const VY = REF.pxv * PX;
/** 길 위 띠 두께 — 칠 넓이 보존. 곧 평균 속도의 그래프 높이다. */
const BAND_H = TIME_X * VY;
/** 그래프 가로축의 월드 높이. 길 바닥이 0. */
const AXIS_Y = px(REF.bandBottom - REF.axisY);

const gx = (t: number): number => t * TIME_X;
const gy = (v: number): number => AXIS_Y + v * VY;

// ------------------------------------------------------------------------
// 색 — 파랑 하나 = 넓이(= 간 거리). 나머지는 먹과 회색
// ------------------------------------------------------------------------
// 그래프 속 넓이, 떨어지는 기둥, 길 위 띠가 모두 같은 파랑이다 — 같은 대상이기
// 때문이다. 1초 경계(그래프의 가름선)와 말뚝(길)도 같은 것이라 같은 회색이다.

const INK = { colorRole: 'muted', emphasis: 'strong' } as const;
const GUIDE = { colorRole: 'muted', emphasis: 'subtle' } as const;
const AREA = { colorRole: 'secondary', emphasis: 'strong' } as const;
/** 파랑의 채움 세기. 원본의 옅은 파랑(#9cc3e6)에 가깝게. */
const AREA_FILL = 0.45;
/** 길의 채움 세기. 원본의 옅은 베이지 — 배경보다 한 톤 짙은 정도. */
const ROAD_FILL = 0.08;

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

function rect(x0: number, x1: number, y0: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

function fill(
  id: string,
  points: readonly Vec2[],
  style: Region['style'],
  fillOpacity: number,
  opacity = 1,
): Region {
  return { type: 'region', id, points, style, fillOpacity, opacity };
}

/**
 * 막 끝난 1초 기둥 i 를 가는 띠 SUB 개로 쪼개, 그래프 아래(폭 Δt, 높이 v)에서 길 위
 * (폭 v·Δt, 두께 BAND_H)로 같은 진행도 e 로 보간한다. 이웃 띠가 맞붙어 있으므로
 * 윗변을 이어 한 다각형으로 선언한다 — 띠 사이 이음매가 생기지 않게.
 */
function fallingColumn(i: number, e: number): Vec2[] {
  const bb = AXIS_Y * (1 - e); // 기둥의 바닥: 가로축 → 길 바닥(0)
  const pts: Vec2[] = [];
  for (let j = 0; j < SUB; j++) {
    const t0 = i - 1 + j / SUB;
    const t1 = t0 + 1 / SUB;
    const sx = gx(t0);
    const sw = TIME_X / SUB;
    const sh = (VY * (velocity(t0) + velocity(t1))) / 2;
    const tx = distance(t0);
    const tw = distance(t1) - distance(t0);
    const bx = sx + (tx - sx) * e;
    const bw = sw + (tw - sw) * e;
    const top = bb + (sh + (BAND_H - sh) * e);
    if (j === 0) pts.push([bx, bb]);
    pts.push([bx, top], [bx + bw, top]);
    if (j === SUB - 1) pts.push([bx + bw, bb]);
  }
  return pts;
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: VelocityTimeGraphState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('velocity-time-graph: schema.timeline 이 선언되어야 한다');
  const tau = tl.u;
  const tm = Math.min(tau, T_END); // 운동 시각
  const flight = tl.duration('land'); // 한 기둥의 비행 시간
  const fade = 1 - tl.at('fade');
  const fadeIn = tl.at('appear');
  const out: Primitive[] = [];

  // ---- 그래프 축 ----
  // 축 두 줄과 '속도' · '시간' 낱말은 둔다. 이 면이 무엇의 그래프인지 모르면 넓이가
  // 무엇의 넓이인지 모른다. 눈금·숫자·격자는 두지 않는다.
  out.push(
    line('axis', [[0, gy(V_MAX) + px(8)], [0, AXIS_Y], [D + px(6), AXIS_Y]], 1, INK),
  );
  const axisV: Readout = {
    type: 'readout',
    id: 'axis-v',
    anchor: { world: [0, gy(V_MAX)], offset: [-6, -4] },
    text: text('label.axisV'),
    chip: false,
    align: 'right',
    fontSize: 12,
    style: INK,
  };
  const axisT: Readout = {
    type: 'readout',
    id: 'axis-t',
    anchor: { world: [D, AXIS_Y], offset: [6, 14] },
    text: text('label.axisT'),
    chip: false,
    align: 'right',
    fontSize: 12,
    style: INK,
  };
  out.push(axisV, axisT);

  // ---- 쌓인 넓이 ----
  if (tm > 0) {
    const pts: Vec2[] = [[gx(0), AXIS_Y]];
    for (const [kt, kv] of KNOTS) {
      if (kt >= tm) break;
      pts.push([gx(kt), gy(kv)]);
    }
    pts.push([gx(tm), gy(velocity(tm))], [gx(tm), AXIS_Y]);
    out.push(fill('area', pts, AREA, AREA_FILL, fade));
  }

  // ---- 1초 경계 ----
  for (let i = 1; i < T_END && i <= tm; i++) {
    out.push(line(`bound-${i}`, [[gx(i), AXIS_Y], [gx(i), gy(velocity(i))]], 1, GUIDE, fade));
  }

  // ---- 속도 곡선 ----
  // 처음부터 전체를 그린다. 그래프는 주어진 것이고, 쌓이는 것은 넓이다.
  out.push(line('curve', KNOTS.map(([kt, kv]) => [gx(kt), gy(kv)] as Vec2), 2, INK));

  // ---- 지금 속도 점 ----
  const now: Marker = {
    type: 'marker',
    id: 'now',
    kind: 'pin',
    pos: [gx(tm), gy(velocity(tm))],
    style: INK,
    opacity: fade * fadeIn,
  };
  out.push(now);

  // ---- 길 ----
  // 내려앉은 띠 아래는 비워 둔다. 반투명 파랑이 길 위에 겹치면 그래프 속 넓이와
  // 다른 파랑이 되어 "같은 것" 이라는 말이 흐려진다.
  const edge = landedUntil(tau, flight);
  const landed = distance(edge);
  const roadL = -px(14);
  const roadR = D + px(14);
  if (landed > 0) {
    out.push(fill('road-head', rect(roadL, 0, 0, BAND_H), INK, ROAD_FILL));
    out.push(fill('road-tail', rect(landed, roadR, 0, BAND_H), INK, ROAD_FILL));
  } else {
    out.push(fill('road', rect(roadL, roadR, 0, BAND_H), INK, ROAD_FILL));
  }
  out.push(line('road-floor', [[roadL, -px(0.5)], [roadR, -px(0.5)]], 1, GUIDE));

  // ---- 펼친 넓이 ----
  if (landed > 0) {
    out.push(fill('band', rect(0, landed, 0, BAND_H), AREA, AREA_FILL, fade));
  }

  // ---- 1초 말뚝 ----
  // 물체가 1초마다 길에 떨군 말뚝. 내려앉은 띠가 말뚝 사이를 꼭 채우는지가 이
  // 조각의 증거다.
  for (let m = 0; m <= T_END && m <= tm; m++) {
    const xm = distance(m);
    out.push(line(`stake-${m}`, [[xm, BAND_H + px(7)], [xm, 0]], 1, GUIDE, fade));
  }

  // ---- 떼어 옮기는 넓이 ----
  for (let i = 1; i <= T_END; i++) {
    if (tau < i || tau > i + STAGGER + flight) continue;
    const p = stripProgress(i, 0, tau, flight);
    if (p <= 0 || p >= 1) continue;
    const e = tl.span(i, i + flight, 'inOutCubic');
    out.push(fill(`column-${i}`, fallingColumn(i, e), AREA, AREA_FILL, fade));
  }

  // ---- 물체 ----
  // 작은 수레와 위치 바늘. 바늘 끝이 가리키는 곳이 지금 물체가 있는 x(t).
  const cx = distance(tm);
  const base = BAND_H + px(3);
  const cartAlpha = fade * fadeIn;
  out.push(
    fill(
      'cart',
      [
        [cx - px(13), base + px(6)],
        [cx - px(13), base + px(14)],
        [cx + px(9), base + px(14)],
        [cx + px(14), base + px(8)],
        [cx + px(14), base + px(6)],
      ],
      INK,
      1,
      cartAlpha,
    ),
  );
  for (const [id, dx] of [['wheel-rear', -7], ['wheel-front', 8]] as const) {
    const wheel: Body = {
      type: 'body',
      id,
      shape: 'point',
      pos: [cx + px(dx), base + px(4)],
      style: INK,
      opacity: cartAlpha,
    };
    out.push(wheel);
  }
  out.push(line('needle', [[cx, base + px(6)], [cx, BAND_H - px(5)]], 1.5, INK, cartAlpha));

  return out;
}

/**
 * 고정 경계. 원본 캔버스 한 장(860 × 250)을 그대로 담는다 — 왼쪽 44px 는 '속도'
 * 낱말, 오른쪽 22px 는 '시간' 낱말 자리. 아래로 캡션 자리를 더 잡는다.
 * 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
 */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return {
    minX: -px(REF.left),
    maxX: D + px(REF.right),
    minY: -px(REF.height - REF.bandBottom + REF.captionRoom),
    maxY: px(REF.bandBottom),
  };
}
