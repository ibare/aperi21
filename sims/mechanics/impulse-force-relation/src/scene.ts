// ========================================================================
// impulse-force-relation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더 없이 표준 어휘로 선다 — 벽(body rect) · 방석과 공(body custom) · 결과 축과 힘의
// 기록(trajectory) · 기록 아래 넓이(region) · 속도와 힘(vector) · 글자(readout).
// 좌표는 원본 캔버스 px 를 y 만 뒤집어 그대로 쓴다 (schema.ts 「배치」).
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
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { forceRel, pushIn, speedRel } from './physics';
import {
  ARROW_HEAD,
  AXIS_OVERSHOOT,
  BALL_Y,
  CUSHION,
  CUSHION_HALF,
  FORCE_LEN,
  FORCE_WIDTH,
  GRAIN_CELLS,
  GRAIN_HALF,
  GRAPH_BASE_Y,
  GRAPH_H,
  GRAPH_INSET,
  GRAPH_SAMPLES,
  GRAPH_SHRINK,
  GRAPH_TAU,
  HEIGHT,
  LANE_W,
  LANE_X,
  R,
  SCENE_BOUNDS,
  T_HARD,
  V0,
  VEL_LEN,
  VEL_LIFT,
  VEL_WIDTH,
  WALL_HALF,
  WALL_INSET,
  WALL_THICK,
  text,
} from './schema';
import type { ImpulseForceRelationState } from './state';

/** 줄 이름 글자 — 원본 13 px, 기준선 y 18. 가운데 기준선으로 옮기면 약 4.5 px 위다. */
const LANE_NAME = { fontSize: 13, y: HEIGHT - 13.5 } as const;
/** 축 글자 — 원본 12 px. 「힘」 기준선 gy0 − gh + 4, 「시간」 기준선 gy0 + 14. */
const AXIS_FONT = 12;
const AXIS_TEXT_LIFT = 4;
/** 방석 오목한 자리의 베지어 손잡이 — 원본 30 · R + 4. */
const CUSHION_CTRL_OUTER = 30;
const CUSHION_CTRL_INNER = R + 4;
/** 방석 면 전체가 함께 눌리는 비율 · 벽에 닿기 전 남기는 두께. */
const CUSHION_FACE_SHARE = 0.8;
const CUSHION_KEEP = 6;
/** 딱딱한 벽에서 찌그러지는 최대 비율 · 세로로 부푸는 비율. */
const SQUASH_MAX = 0.7;
const SQUASH_BULGE = 0.35;
/** 이 아래의 속도 · 힘은 그리지 않는다 (원본 문턱). */
const SPEED_EPS = 0.01;
const FORCE_EPS = 0.004;
/** 결 선 · 기록 채움의 불투명도. */
const GRAIN_OPACITY = 0.5;
/** 방석 채움의 불투명도 — 원본의 옅은 방석 면. `muted subtle` 만으로는 벽과 톤이 가깝다. */
const CUSHION_FILL_OPACITY = 0.55;
const RECORD_FILL = 0.22;

type Kind = 'hard' | 'soft';

/** 타원 외형(pos 기준). */
function ellipsePath(rx: number, ry: number): string {
  return `M ${rx} 0 A ${rx} ${ry} 0 1 0 ${-rx} 0 A ${rx} ${ry} 0 1 0 ${rx} 0 Z`;
}

function line(id: string, points: readonly Vec2[], width: number, style: Trajectory['style'], opacity?: number): Trajectory {
  return { type: 'trajectory', id, points, width, style, ...(opacity !== undefined ? { opacity } : {}) };
}

function label(id: string, world: Vec2, key: Parameters<typeof text>[0], fontSize: number, align: Readout['align']): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize,
    align,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 한 줄(벽 또는 방석). 원본 `drawLane` 과 같은 순서로 쌓는다. */
function lane(out: Primitive[], kind: Kind, x0: number, tSoft: number, tau: number): void {
  const T = kind === 'hard' ? T_HARD : tSoft;

  // ── 위: 공과 벽 ──
  const wallX = x0 + LANE_W - WALL_INSET;
  const faceX = kind === 'hard' ? wallX : wallX - CUSHION;
  const d = pushIn(tau, T);
  const v = speedRel(tau, T);
  const f = forceRel(tau, T);

  const ballRight = tau < 0 ? faceX + V0 * tau : kind === 'hard' ? faceX : faceX + d;
  // 딱딱한 벽: 공이 파고들지 못하고 찌그러진다.
  const squash = kind === 'hard' ? Math.min(d, R * SQUASH_MAX) : 0;
  const rx = R - squash / 2;
  const ry = R + squash * SQUASH_BULGE;
  const cx = ballRight - rx;

  const wall: Body = {
    type: 'body',
    id: `${kind}-wall`,
    shape: 'rect',
    pos: [wallX + WALL_THICK / 2, BALL_Y],
    size: [WALL_THICK, WALL_HALF * 2],
    outline: 'none',
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(wall);

  if (kind === 'soft') {
    // 방석 면 전체가 함께 눌리고, 공이 닿은 자리만 조금 더 들어간다.
    const compressed = Math.max(0, Math.min(d, CUSHION - CUSHION_KEEP));
    const left = faceX + compressed - wallX;
    const edge = faceX + compressed * CUSHION_FACE_SHARE - wallX;
    const h = CUSHION_HALF;
    const path =
      `M 0 ${h} L ${edge} ${h} ` +
      `C ${edge} ${CUSHION_CTRL_OUTER} ${left} ${CUSHION_CTRL_INNER} ${left} 0 ` +
      `C ${left} ${-CUSHION_CTRL_INNER} ${edge} ${-CUSHION_CTRL_OUTER} ${edge} ${-h} ` +
      `L 0 ${-h} Z`;
    out.push({
      type: 'body',
      id: 'cushion',
      shape: 'custom',
      pos: [wallX, BALL_Y],
      customPath: path,
      opacity: CUSHION_FILL_OPACITY,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    });
    out.push({
      type: 'body',
      id: 'cushion-edge',
      shape: 'custom',
      pos: [wallX, BALL_Y],
      customPath: path,
      fill: 'none',
      outline: 'role',
      style: { colorRole: 'muted', emphasis: 'medium' },
    });
    // 방석 속 결 (눌리면 촘촘해진다).
    const leftX = faceX + compressed;
    for (let i = 1; i < GRAIN_CELLS; i++) {
      const x = leftX + ((wallX - leftX) * i) / GRAIN_CELLS;
      out.push(
        line(
          `grain-${i}`,
          [
            [x, BALL_Y + GRAIN_HALF],
            [x, BALL_Y - GRAIN_HALF],
          ],
          1,
          { colorRole: 'muted', emphasis: 'subtle' },
          GRAIN_OPACITY,
        ),
      );
    }
  }

  out.push({
    type: 'body',
    id: `${kind}-ball`,
    shape: 'custom',
    pos: [cx, BALL_Y],
    customPath: ellipsePath(rx, ry),
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  if (v > SPEED_EPS) {
    const vel: Vector = {
      type: 'vector',
      id: `${kind}-velocity`,
      from: [cx - rx, BALL_Y + VEL_LIFT],
      delta: [VEL_LEN * v, 0],
      headSize: ARROW_HEAD,
      width: VEL_WIDTH,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    };
    out.push(vel);
  }

  if (f > FORCE_EPS) {
    const force: Vector = {
      type: 'vector',
      id: `${kind}-force`,
      from: [cx, BALL_Y],
      delta: [-FORCE_LEN * f, 0],
      headSize: ARROW_HEAD,
      width: FORCE_WIDTH,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(force);
  }

  out.push(
    label(`${kind}-name`, [x0, LANE_NAME.y], kind === 'hard' ? 'label.hard' : 'label.soft', LANE_NAME.fontSize, 'left'),
  );

  // ── 아래: 힘-시간 곡선 ──
  const gx = x0 + GRAPH_INSET;
  const gw = LANE_W - GRAPH_SHRINK;
  const [tauMin, tauMax] = GRAPH_TAU;
  const X = (s: number): number => gx + ((s - tauMin) / (tauMax - tauMin)) * gw;
  const Y = (fr: number): number => GRAPH_BASE_Y + fr * GRAPH_H;

  out.push(
    line(
      `${kind}-axes`,
      [
        [gx, GRAPH_BASE_Y + GRAPH_H + AXIS_OVERSHOOT],
        [gx, GRAPH_BASE_Y],
        [gx + gw, GRAPH_BASE_Y],
      ],
      1,
      { colorRole: 'muted', emphasis: 'subtle' },
    ),
  );
  // 원본 기준선 → 가운데 기준선: 글자 크기의 약 0.35 만큼 위.
  const mid = AXIS_FONT * 0.35;
  out.push(label(`${kind}-axis-force`, [gx - 5, GRAPH_BASE_Y + GRAPH_H - AXIS_TEXT_LIFT + mid], 'label.force', AXIS_FONT, 'right'));
  out.push(label(`${kind}-axis-time`, [gx + gw, GRAPH_BASE_Y - 14 + mid], 'label.time', AXIS_FONT, 'right'));

  // 받은 힘의 기록 — 접촉 뒤 지금까지만 자란다.
  const now = Math.min(tau, tauMax);
  if (now > 0) {
    const end = Math.min(now, T);
    const curve: Vec2[] = [];
    for (let i = 0; i <= GRAPH_SAMPLES; i++) {
      const s = (end * i) / GRAPH_SAMPLES;
      curve.push([X(s), Y(forceRel(s, T))]);
    }
    const area: Region = {
      type: 'region',
      id: `${kind}-impulse`,
      points: [[X(0), Y(0)], ...curve, [X(end), Y(0)]],
      fillOpacity: RECORD_FILL,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(area);
    const stroke: Vec2[] = [[X(0), Y(0)], ...curve];
    if (now > T) stroke.push([X(now), Y(0)]);
    out.push(line(`${kind}-record`, stroke, 2, { colorRole: 'accent', emphasis: 'strong' }));
  }
}

export function scene(params: {
  state: ImpulseForceRelationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('impulse-force-relation: schema.timeline 이 선언되어야 한다');
  // 접촉 뒤 시각. 벽·방석이 같은 순간에 닿는다.
  const tau = timeline.u - timeline.start('hardContact');
  const out: Primitive[] = [];
  lane(out, 'hard', LANE_X[0], state.tSoft, tau);
  lane(out, 'soft', LANE_X[1], state.tSoft, tau);
  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다.
  return { ...SCENE_BOUNDS };
}
