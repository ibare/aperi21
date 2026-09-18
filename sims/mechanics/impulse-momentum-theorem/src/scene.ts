// ========================================================================
// impulse-momentum-theorem — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 벽(`body` rect) · 공(`body` custom 타원) · 바닥과
// 축(`trajectory`) · 운동량 · 충격량 · 힘 화살표(`vector`) · 넓이(`region`) ·
// 이름표(`readout`) 가 모두 표준 어휘다.
//
// 색: 공은 먹색, 운동량은 primary, 벽이 미는 힘(화살표와 그래프 곡선)은
// secondary, 바닥 · 축 · 잔상 · 잇는 점선은 muted. 강조색은 **충격량** 한 뜻에만
// 쓴다 — 그래프의 넓이와 운동량 수직선 아래의 J 화살표. 둘이 같은 색이라
// 「넓이 = 화살표가 옮겨 간 길이」 가 한 대상으로 읽힌다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { derive, forceAt, readConstants } from './physics';
import {
  BALL_R,
  FLOOR_END_X,
  FLOOR_Y,
  FORCE_ARROW_LEN,
  GRAPH_AXIS_H,
  GRAPH_H,
  GRAPH_MARGIN,
  GRAPH_SAMPLES,
  GRAPH_W,
  GRAPH_X,
  GRAPH_Y,
  J_LANE_Y,
  P_AXIS_FROM,
  P_AXIS_TO,
  P_AXIS_Y,
  P_ORIGIN_X,
  P_UNIT,
  SCENE_BOUNDS,
  SQUASH_MAX,
  WALL_H,
  WALL_THICK,
  text,
  type ImpulseMomentumTheoremMessageKey,
} from './schema';
import type { ImpulseMomentumTheoremState } from './state';

/** 0 눈금의 반높이(월드). */
const TICK_HALF = 0.05;
/** 이름표를 앵커에서 띄우는 거리(화면 px). */
const LEFT_OF: Vec2 = [-8, 0];
const RIGHT_OF: Vec2 = [8, 0];
/** 화살표 굵기(화면 px) — 살아 있는 화살표와 잔상을 굵기로 가른다. */
const ARROW_W = 3;
const GHOST_W = 2;
/** 화살촉 크기(월드 → 렌더러가 배율을 곱한다). */
const HEAD = 0.07;
/** 넓이 이름표를 붙이는 최소 넓이 비율. 이보다 얇으면 글자가 칸 밖으로 나간다. */
const AREA_LABEL_MIN = 0.25;
/** 넓이 칸 불투명도. */
const AREA_FILL = 0.38;

function ellipsePath(rx: number, ry: number): string {
  return `M ${rx} 0 A ${rx} ${ry} 0 1 0 ${-rx} 0 A ${rx} ${ry} 0 1 0 ${rx} 0 Z`;
}

function line(
  id: string,
  points: readonly Vec2[],
  width: number,
  style: Trajectory['style'],
  opacity: number,
): Trajectory {
  return { type: 'trajectory', id, points, width, style, opacity };
}

function label(
  id: string,
  world: Vec2,
  offset: Vec2,
  key: ImpulseMomentumTheoremMessageKey,
  align: Readout['align'],
  style: Readout['style'],
  opacity: number,
  opts: { italic?: boolean; fontSize?: number; weight?: Readout['weight'] } = {},
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world, offset },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: opts.fontSize ?? 13,
    align,
    italic: opts.italic ?? false,
    weight: opts.weight ?? 'normal',
    opacity,
    style,
  };
}

export function scene(params: {
  state: ImpulseMomentumTheoremState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('impulse-momentum-theorem: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c, BALL_R, SQUASH_MAX);
  const op = r.opacity;

  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const momentum = { colorRole: 'primary', emphasis: 'strong' } as const;
  const force = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  // ================================================================
  // 왼쪽 위 — 벽과 공
  // ================================================================
  g.push(line('floor', [[-WALL_THICK, FLOOR_Y], [FLOOR_END_X, FLOOR_Y]], 1, muted, op));
  g.push({
    type: 'body',
    id: 'wall',
    shape: 'rect',
    pos: [-WALL_THICK / 2, FLOOR_Y + WALL_H / 2],
    size: [WALL_THICK, WALL_H],
    outline: 'none',
    opacity: op,
    style: muted,
  });
  // 공은 바닥에 얹혀 있다 — 눌려 세로가 커지면 중심도 그만큼 올라간다.
  const ballY = FLOOR_Y + r.ballHalfH;
  g.push({
    type: 'body',
    id: 'ball',
    shape: 'custom',
    pos: [r.ballCenterX, ballY],
    customPath: ellipsePath(r.ballHalfW, r.ballHalfH),
    opacity: op,
    style: ink,
  });
  // 벽이 미는 힘 — 닿아 있는 동안만. 벽 면에서 공 쪽으로, 그래프 곡선과 같은 모양으로
  // 자라고 준다. 먹색 공 위를 지나므로 바탕색 둘레로 떼어 낸다.
  if (r.force > 0) {
    g.push({
      type: 'vector',
      id: 'force',
      from: [0, ballY],
      delta: [(r.force / r.forceMax) * FORCE_ARROW_LEN, 0],
      width: ARROW_W,
      headSize: HEAD,
      outline: 'background',
      // 이름을 달지 않는다 — 먹색 공 위에 얹힌다. 그래프 세로축의 F 와 같은 색이 이름이다.
      opacity: op,
      style: force,
    });
  }

  // ================================================================
  // 왼쪽 아래 — 운동량 수직선
  // ================================================================
  const px = (p: number): number => P_ORIGIN_X + p * P_UNIT;
  const p0X = px(r.p0);
  const pX = px(r.p);

  g.push(line('p-axis', [[P_AXIS_FROM, P_AXIS_Y], [P_AXIS_TO, P_AXIS_Y]], 1, muted, op));
  g.push(
    line(
      'p-zero',
      [
        [P_ORIGIN_X, P_AXIS_Y - TICK_HALF],
        [P_ORIGIN_X, P_AXIS_Y + TICK_HALF],
      ],
      1,
      muted,
      op,
    ),
  );
  g.push(label('p-zero-name', [P_ORIGIN_X, P_AXIS_Y], [7, 14], 'label.zero', 'left', muted, op, { fontSize: 12 }));
  g.push(label('p-axis-name', [P_AXIS_TO, P_AXIS_Y], RIGHT_OF, 'label.momentum', 'left', muted, op, { fontSize: 12 }));

  // 처음 운동량의 잔상 — 닿는 순간부터 남는다. 그 전에는 지금 화살표가 곧 처음 운동량이다.
  if (r.touched) {
    g.push({
      type: 'vector',
      id: 'p-initial',
      from: [P_ORIGIN_X, P_AXIS_Y],
      delta: [p0X - P_ORIGIN_X, 0],
      width: GHOST_W,
      headSize: HEAD,
      opacity: op * 0.8,
      style: { ...muted, lineStyle: 'dashed' },
    });
    g.push(label('p-initial-name', [p0X, P_AXIS_Y], LEFT_OF, 'label.p0', 'right', muted, op, { italic: true }));
  }

  // 지금 운동량 — 공이 멈춘 순간에는 길이가 0 이라 렌더러가 그리지 않는다.
  g.push({
    type: 'vector',
    id: 'p-now',
    from: [P_ORIGIN_X, P_AXIS_Y],
    delta: [pX - P_ORIGIN_X, 0],
    width: ARROW_W,
    headSize: HEAD,
    label: text('label.p'),
    labelSide: 'auto',
    opacity: op,
    style: momentum,
  });

  // 충격량 — 처음 운동량의 끝에서 지금 운동량의 끝까지. 두 끝을 점선으로 수직선에 잇는다.
  // 이 화살표가 곧 「운동량의 변화」 이고, 그 길이가 그래프의 넓이와 같다.
  if (r.impulse > 0) {
    const link = { ...muted, lineStyle: 'dotted' } as const;
    // 멈춘 순간 J 화살표가 0 을 지난다. 그래프의 「멈춤」 선과 같은 모양으로 0 에서 J 줄까지
    // 내려 긋는다 — 넓이의 두 몫(멈추는 몫 · 되돌리는 몫)이 화살표의 두 몫과 맞대어진다.
    if (r.stopped) {
      g.push(
        line('j-stop-mark', [[P_ORIGIN_X, P_AXIS_Y], [P_ORIGIN_X, J_LANE_Y]], 1, { ...muted, lineStyle: 'dashed' }, op),
      );
    }
    g.push(line('j-link-from', [[p0X, P_AXIS_Y], [p0X, J_LANE_Y]], 1, link, op));
    g.push(line('j-link-to', [[pX, P_AXIS_Y], [pX, J_LANE_Y]], 1, link, op));
    g.push({
      type: 'vector',
      id: 'impulse',
      from: [p0X, J_LANE_Y],
      delta: [pX - p0X, 0],
      width: ARROW_W,
      headSize: HEAD,
      label: text('label.J'),
      labelSide: 'cw',
      opacity: op,
      style: accent,
    });
  }

  // ================================================================
  // 오른쪽 — 힘-시간 그래프
  // ================================================================
  const T = r.contactTime;
  const tauFrom = -GRAPH_MARGIN * T;
  const tauTo = (1 + GRAPH_MARGIN) * T;
  const gx = (tau: number): number => GRAPH_X + ((tau - tauFrom) / (tauTo - tauFrom)) * GRAPH_W;
  const gy = (f: number): number => GRAPH_Y + (f / r.forceMax) * GRAPH_H;
  const tauNow = Math.min(Math.max(r.tau, tauFrom), tauTo);

  // 쌓인 넓이 — 곡선보다 먼저 선언해 곡선 아래에 깔린다(`drawOrder: 'scene'`).
  const areaTo = Math.min(Math.max(r.tau, 0), T);
  if (areaTo > 0) {
    const pts: Vec2[] = [[gx(0), GRAPH_Y]];
    const n = Math.max(2, Math.ceil((GRAPH_SAMPLES * areaTo) / T));
    for (let i = 0; i <= n; i++) {
      const tau = (areaTo * i) / n;
      pts.push([gx(tau), gy(forceAt(tau, c, r.forceMax))]);
    }
    pts.push([gx(areaTo), GRAPH_Y]);
    g.push({
      type: 'region',
      id: 'area',
      points: pts,
      fillOpacity: AREA_FILL,
      opaque: true,
      opacity: op,
      style: accent,
    });
  }

  // 멈춘 순간의 자리 — 여기까지의 넓이가 처음 운동량, 여기부터가 되돌리는 몫이다.
  if (r.stopped) {
    const sx = gx(r.stopTau);
    const sTop = gy(forceAt(r.stopTau, c, r.forceMax));
    g.push(line('stop-mark', [[sx, GRAPH_Y], [sx, sTop]], 1, { ...muted, lineStyle: 'dashed' }, op));
    // 이름은 가로축 아래 — 곡선 꼭대기 곁이라 위에 두면 곡선에 걸린다.
    g.push(label('stop-name', [sx, GRAPH_Y], [0, 13], 'label.stop', 'center', muted, op, { fontSize: 12 }));
  }

  // 축
  g.push(line('t-axis', [[GRAPH_X, GRAPH_Y], [GRAPH_X + GRAPH_W + 0.08, GRAPH_Y]], 1, muted, op));
  g.push(line('f-axis', [[GRAPH_X, GRAPH_Y], [GRAPH_X, GRAPH_Y + GRAPH_AXIS_H]], 1, muted, op));
  g.push(label('t-name', [GRAPH_X + GRAPH_W + 0.08, GRAPH_Y], RIGHT_OF, 'label.t', 'left', muted, op, { italic: true }));
  g.push(label('f-name', [GRAPH_X, GRAPH_Y + GRAPH_AXIS_H], [6, 2], 'label.force', 'left', muted, op, { fontSize: 12 }));
  g.push(
    label('f-symbol', [GRAPH_X, GRAPH_Y + GRAPH_AXIS_H], LEFT_OF, 'label.F', 'right', force, op, {
      italic: true,
    }),
  );

  // 힘 곡선 — 지금까지 받은 것만. 앞으로 받을 모양을 미리 보이지 않는다.
  if (tauNow > tauFrom) {
    const pts: Vec2[] = [];
    const n = GRAPH_SAMPLES;
    for (let i = 0; i <= n; i++) {
      const tau = tauFrom + ((tauNow - tauFrom) * i) / n;
      pts.push([gx(tau), gy(forceAt(tau, c, r.forceMax))]);
    }
    g.push(line('force-curve', pts, 2, force, op));
  }

  // 넓이 이름 — 칸이 글자를 담을 만큼 쌓였을 때만. 운동량 수직선의 J 와 같은 기호 · 같은 색.
  const areaShare = r.impulse / r.impulseTotal;
  if (areaShare >= AREA_LABEL_MIN) {
    const cx = gx(Math.min(areaTo, T) * 0.4);
    g.push(
      label('area-name', [cx, GRAPH_Y + GRAPH_H * 0.32], [0, 0], 'label.J', 'center', accent, op, {
        italic: true,
        weight: 'bold',
        fontSize: 15,
      }),
    );
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
