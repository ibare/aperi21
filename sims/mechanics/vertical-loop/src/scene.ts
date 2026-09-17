// ========================================================================
// vertical-loop — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 레일(trajectory closed) · 꼭대기 최소 속력 기준(vector 점선 + readout) ·
// 떨어진 공의 궤적(trajectory 점) · 레일을 떠난 지점(body 테두리 + readout) ·
// 레일이 미는 힘과 속력(vector) · 공(body) · 이름표(readout).
// 캡션은 선언의 캡션 슬롯이 그린다.
// ========================================================================

import type {
  Body,
  Primitive,
  Readout,
  SceneGraph,
  TimelineFrame,
  Trajectory,
  Vec2,
  Vector,
} from '@aperi21/schema';
import { FAIL, PASS, TABLE_DT, G, sample, type LoopTable } from './physics';
import {
  ARROW_HEAD,
  BALL_RADIUS,
  LOOPS,
  NORMAL_LABEL_MIN,
  NORMAL_SCALE,
  RAIL_RADIUS,
  REFERENCE_Y,
  SCENE_BOUNDS,
  SEP_RING_RADIUS,
  SPEED_SCALE,
  text,
} from './schema';
import type { VerticalLoopState } from './state';

/** 레일 원을 이루는 점 개수. */
const RAIL_SEGMENTS = 120;
/** 레일 굵기(화면 px). 원본 3. */
const RAIL_WIDTH_PX = 3;
/** 화살표 굵기(화면 px). 원본 2.5. */
const ARROW_WIDTH_PX = 2.5;
/** 궤적 굵기(화면 px). 원본 2. */
const TRACE_WIDTH_PX = 2;
/** 기준 화살표 이름표가 화살표 위로 오르는 거리(화면 px). 원본 18. */
const REFERENCE_LABEL_OFFSET: Vec2 = [0, -18];
/** 「레일을 떠남」 이 떠난 자리에서 비켜 서는 거리(화면 px). 원본 (BALL_R + 12, −12). */
const LEFT_RAIL_LABEL_OFFSET: Vec2 = [22, -12];
/** 힘 이름표가 화살표 끝에서 더 나가는 거리(화면 px). 원본 12, 세로로 2 더 비킨다. */
const NORMAL_LABEL_GAP = 12;
const NORMAL_LABEL_NUDGE = 2;
/** 공 이름표가 레일 바닥 아래로 내려가는 거리(화면 px). 원본 22. */
const NAME_OFFSET: Vec2 = [0, 22];

/** 같은 물리량(속력)은 같은 색 — 공의 화살표와 꼭대기 기준 화살표. */
const SPEED_STYLE = { colorRole: 'secondary', emphasis: 'strong' } as const;
/** 레일이 미는 힘은 다른 색. */
const NORMAL_STYLE = { colorRole: 'positive', emphasis: 'strong' } as const;
/** 강조색은 「레일을 떠난 지점」 한 뜻에만. */
const ACCENT_STYLE = { colorRole: 'accent', emphasis: 'strong' } as const;
const RAIL_STYLE = { colorRole: 'muted', emphasis: 'subtle' } as const;
const TRACE_STYLE = { colorRole: 'muted', emphasis: 'medium' } as const;
const BALL_STYLE = { colorRole: 'ink', emphasis: 'strong' } as const;
const NAME_STYLE = { colorRole: 'muted', emphasis: 'strong' } as const;

function add(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

export function scene(params: {
  state: VerticalLoopState;
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('vertical-loop: schema.timeline 이 선언되어야 한다');
  const tau = timeline.u;
  // 순환 끝에서 떨어진 공과 그 흔적을 흐리게 지운다 (통과 공은 이음매가 없다).
  const fade = 1 - timeline.at('fade');
  const out: Primitive[] = [];

  const loops = LOOPS.map((l) => ({
    ...l,
    center: [l.x, 0] as Vec2,
    table: (l.id === 'pass' ? PASS : FAIL) as LoopTable,
  }));
  const states = loops.map((l) => sample(l.table, tau));
  const fail = loops[1]!;

  // ---- 레일 ----
  for (const l of loops) {
    const rail: Trajectory = {
      type: 'trajectory',
      id: `rail-${l.id}`,
      points: Array.from({ length: RAIL_SEGMENTS }, (_, i): Vec2 => {
        const a = (i / RAIL_SEGMENTS) * Math.PI * 2;
        return [l.x + RAIL_RADIUS * Math.cos(a), RAIL_RADIUS * Math.sin(a)];
      }),
      closed: true,
      width: RAIL_WIDTH_PX,
      style: RAIL_STYLE,
    };
    out.push(rail);
  }

  // ---- 꼭대기 최소 속력 기준 ----
  // 왼쪽을 향한 점선. 길이 √(gR) 은 공의 속력 화살표와 같은 자다.
  for (const l of loops) {
    const from: Vec2 = [l.x, REFERENCE_Y];
    const reference: Vector = {
      type: 'vector',
      id: `min-speed-${l.id}`,
      from,
      delta: [-Math.sqrt(G) * SPEED_SCALE, 0],
      headSize: ARROW_HEAD,
      width: ARROW_WIDTH_PX,
      style: { ...SPEED_STYLE, lineStyle: 'dashed' },
    };
    out.push(reference);
    const label: Readout = {
      type: 'readout',
      id: `min-speed-label-${l.id}`,
      anchor: { world: from, offset: REFERENCE_LABEL_OFFSET },
      text: text('label.minSpeed'),
      chip: false,
      font: 'text',
      fontSize: 12,
      style: SPEED_STYLE,
    };
    out.push(label);
  }

  const sep = fail.table.sep;
  const impact = fail.table.impact;
  const leftRail = sep !== null && tau >= sep.t;

  // ---- 떨어진 공의 궤적 ----
  // 이탈 시각에서 지금(또는 착지)까지를 표에서 다시 읽는다.
  if (sep && leftRail) {
    const end = impact ? Math.min(tau, impact.t) : tau;
    const points: Vec2[] = [];
    for (let s = sep.t; s <= end + 1e-9; s += TABLE_DT * 2) {
      const p = sample(fail.table, s);
      points.push(add(fail.center, [p.x, p.y]));
    }
    if (points.length >= 2) {
      const trace: Trajectory = {
        type: 'trajectory',
        id: 'fall-trace',
        points,
        width: TRACE_WIDTH_PX,
        opacity: fade,
        style: { ...TRACE_STYLE, lineStyle: 'dotted' },
      };
      out.push(trace);
    }
  }

  // ---- 레일을 떠난 지점 ----
  if (sep && leftRail) {
    const at = add(fail.center, [sep.x, sep.y]);
    const ring: Body = {
      type: 'body',
      id: 'left-rail-ring',
      pos: at,
      shape: 'circle',
      size: SEP_RING_RADIUS,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: fade,
      style: ACCENT_STYLE,
    };
    out.push(ring);
    const label: Readout = {
      type: 'readout',
      id: 'left-rail-label',
      anchor: { world: at, offset: LEFT_RAIL_LABEL_OFFSET },
      text: text('label.leftRail'),
      chip: false,
      font: 'text',
      align: 'left',
      fontSize: 13,
      opacity: fade,
      style: ACCENT_STYLE,
    };
    out.push(label);
  }

  // ---- 레일이 미는 힘 ----
  // 공 가장자리에서 고리 중심 쪽으로. 길이는 수직항력에 비례하고, 0 이 되면 사라진다.
  loops.forEach((l, k) => {
    const s = states[k]!;
    if (!s.rail || s.N <= 0) return;
    const r = Math.hypot(s.x, s.y);
    const ux = -s.x / r;
    const uy = -s.y / r;
    const len = s.N * NORMAL_SCALE;
    const pos = add(l.center, [s.x, s.y]);
    const from = add(pos, [ux * BALL_RADIUS, uy * BALL_RADIUS]);
    const normal: Vector = {
      type: 'vector',
      id: `normal-${l.id}`,
      from,
      delta: [ux * len, uy * len],
      headSize: ARROW_HEAD,
      width: ARROW_WIDTH_PX,
      style: NORMAL_STYLE,
    };
    out.push(normal);
    if (len > NORMAL_LABEL_MIN) {
      // 화면 좌표(y 아래)로 끝에서 더 나간 자리. 원본은 위로 향하면 2 px 더 올린다.
      const sx = ux;
      const sy = -uy;
      const label: Readout = {
        type: 'readout',
        id: `normal-label-${l.id}`,
        anchor: {
          world: add(from, [ux * len, uy * len]),
          offset: [
            sx * NORMAL_LABEL_GAP,
            sy * NORMAL_LABEL_GAP + (sy < 0 ? -NORMAL_LABEL_NUDGE : NORMAL_LABEL_NUDGE),
          ],
        },
        text: text('label.normal'),
        chip: false,
        font: 'text',
        fontSize: 12,
        style: NORMAL_STYLE,
      };
      out.push(label);
    }
  });

  // ---- 속력 ----
  loops.forEach((l, k) => {
    const s = states[k]!;
    if (s.rest) return;
    const speed: Vector = {
      type: 'vector',
      id: `speed-${l.id}`,
      from: add(l.center, [s.x, s.y]),
      delta: [s.vx * SPEED_SCALE, s.vy * SPEED_SCALE],
      headSize: ARROW_HEAD,
      width: ARROW_WIDTH_PX,
      opacity: l.id === 'fail' ? fade : 1,
      style: SPEED_STYLE,
    };
    out.push(speed);
  });

  // ---- 공 ----
  loops.forEach((l, k) => {
    const s = states[k]!;
    const ball: Body = {
      type: 'body',
      id: `ball-${l.id}`,
      pos: add(l.center, [s.x, s.y]),
      shape: 'circle',
      size: BALL_RADIUS,
      glow: false,
      outline: 'none',
      opacity: l.id === 'fail' ? fade : 1,
      style: BALL_STYLE,
    };
    out.push(ball);
  });

  // ---- 공 이름표 ----
  // 두 공의 차이가 들어온 속력뿐임을 알린다.
  for (const l of loops) {
    const name: Readout = {
      type: 'readout',
      id: `name-${l.id}`,
      anchor: { world: [l.x, -RAIL_RADIUS], offset: NAME_OFFSET },
      text: text(l.id === 'pass' ? 'label.fastBall' : 'label.slowBall'),
      chip: false,
      font: 'text',
      fontSize: 14,
      style: NAME_STYLE,
    };
    out.push(name);
  }

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
  return { ...SCENE_BOUNDS };
}
