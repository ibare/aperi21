// ========================================================================
// direction-of-acceleration — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 —
// 바닥선·출발선(trajectory) · 지나간 자리(trace) · 공(body) · 화살표(vector) ·
// 화살표 끝 이름(readout) 이 모두 표준 어휘로 있다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vector,
  ViewDef,
} from '@aperi21/schema';

import {
  maxDistance,
  maxVelocity,
  position,
  readConstants,
  runTime,
  strobeDistances,
  velocity,
} from './physics';
import { LANE_SIGNS, text } from './schema';
import type { DirectionOfAccelerationState } from './state';

// ------------------------------------------------------------------------
// 축척 — 원본 배치(868 × 220 캔버스)를 월드로 그대로 옮긴다
// ------------------------------------------------------------------------
//
// 원본 1px = 월드 1. 원본 캔버스 폭은 컨테이너(최대 900 − 여백 32)를 따랐고, 대조
// 스크립트가 여는 폭에서 868 이다. 세로는 위를 +로 뒤집는다 (월드 y = 220 − 원본 y).

const REF = {
  width: 868,
  height: 220,
  /** 출발선의 x. */
  left: 100,
  /** 바닥선이 출발선 왼쪽으로 더 나가는 길이. */
  groundOverhang: 16,
  /** 바닥선이 캔버스 오른쪽 끝에서 모자란 길이. */
  groundInset: 8,
  /** 레인별 공 중심의 원본 y. */
  laneY: [78, 178],
  ballR: 11,
  /** 바닥선이 공 아래로 더 내려간 틈. */
  groundGap: 4,
  /** 출발선 눈금의 반길이. */
  startTickHalf: 6,
  /** 속도 화살표가 공에서 떨어져 시작하는 틈. */
  velocityGap: 3,
  /** 속도 화살표: 1 m/s 당 픽셀. */
  velocityPx: 14,
  /** 가속도 화살표 길이(크기 1 m/s², 고정). */
  accelPx: 44,
  /** 가속도 화살표가 공 윗면에서 뜬 높이. */
  accelLift: 16,
  /** 화살표 머리 크기. */
  head: 9,
  /** 이름이 화살표 끝에서 떨어진 틈. */
  labelGap: 6,
  /** 이 길이보다 짧은 속도 화살표는 이름을 숨긴다. */
  labelMinPx: 30,
  /** 트랙 끝 뒤로 남기는 오른쪽 여백(가장 긴 속도 화살표 이름 자리). */
  rightRoom: 50,
  /** 자취 점 반지름(화면 px). */
  dotR: 3.5,
} as const;

/** 화살표·출발선 굵기(화면 px). 원본 그대로. */
const ARROW_WIDTH_PX = 2.5;
const START_WIDTH_PX = 1.5;
const GROUND_WIDTH_PX = 1;
/** 이름 글자 크기(화면 px). */
const LABEL_FONT_PX = 13;

/** 원본 y(아래로 자람) → 월드 y(위로 자람). */
function wy(py: number): number {
  return REF.height - py;
}

export function scene(params: {
  state: DirectionOfAccelerationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('direction-of-acceleration: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const s = runTime(c, timeline.u);

  // 주기의 처음에 밝아지고 끝에 흐려진다. 바닥선·출발선은 흐려지지 않는다 (원본).
  const alpha = timeline.at('appear') * (1 - timeline.at('vanish'));

  // 같은 쪽 공이 멈춤 시각까지 간 거리가 트랙 끝에 오도록 — 두 레인이 같은 축척이다.
  const maxArrow = maxVelocity(c) * REF.velocityPx;
  const track = REF.width - REF.left - maxArrow - REF.ballR - REF.velocityGap - REF.rightRoom;
  const scale = track / maxDistance(c);

  const out: Primitive[] = [];

  LANE_SIGNS.forEach((sign, i) => {
    const laneY = REF.laneY[i]!;
    const ballY = wy(laneY);
    const groundY = wy(laneY + REF.ballR + REF.groundGap);
    const lane = sign > 0 ? 'with' : 'against';

    // ---- 바닥선 ----
    const ground: Trajectory = {
      type: 'trajectory',
      id: `ground-${lane}`,
      points: [
        [REF.left - REF.groundOverhang, groundY],
        [REF.width - REF.groundInset, groundY],
      ],
      width: GROUND_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    };
    out.push(ground);

    // ---- 출발선 ---- 두 공이 같은 곳에서 출발했다는 것이 대조의 전제다.
    const start: Trajectory = {
      type: 'trajectory',
      id: `start-${lane}`,
      points: [
        [REF.left, groundY + REF.startTickHalf],
        [REF.left, groundY - REF.startTickHalf],
      ],
      width: START_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(start);

    // ---- 지나간 자리 ----
    // 같은 시간 간격의 자리라 점 사이가 곧 빠르기다. 늙지 않는다 — 지우면 간격이 사라진다.
    // 공과 같은 대상이라 같은 색이다.
    const dots: Trace = {
      type: 'trace',
      id: `strobe-${lane}`,
      marks: strobeDistances(c, sign, s).map((d) => ({ pos: [REF.left + d * scale, groundY] })),
      shape: 'dot',
      size: REF.dotR,
      style: { colorRole: 'primary', emphasis: 'strong' },
      opacity: alpha,
    };
    out.push(dots);

    const bx = REF.left + position(c, sign, s) * scale;
    const v = velocity(c, sign, s);

    // ---- 공 ---- 두 공 같은 색. 후광·윤곽 없는 채운 원.
    const ball: Body = {
      type: 'body',
      id: `ball-${lane}`,
      shape: 'circle',
      pos: [bx, ballY],
      size: REF.ballR,
      fill: 'solid',
      outline: 'none',
      glow: false,
      style: { colorRole: 'primary', emphasis: 'strong' },
      opacity: alpha,
    };
    out.push(ball);

    // ---- 속도 화살표 ---- 공 앞에서 오른쪽. 짧아지다 멈추면 사라진다.
    const vx0 = bx + REF.ballR + REF.velocityGap;
    const vLen = v * REF.velocityPx;
    const vArrow: Vector = {
      type: 'vector',
      id: `velocity-${lane}`,
      from: [vx0, ballY],
      delta: [vLen, 0],
      headSize: REF.head,
      width: ARROW_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
      opacity: alpha,
    };
    out.push(vArrow);
    if (vLen > REF.labelMinPx) {
      const vLabel: Readout = {
        type: 'readout',
        id: `velocity-label-${lane}`,
        anchor: { world: [vx0 + vLen, ballY], offset: [REF.labelGap, 0] },
        text: text('label.velocity'),
        chip: false,
        align: 'left',
        font: 'text',
        fontSize: LABEL_FONT_PX,
        style: { colorRole: 'ink', emphasis: 'strong' },
        opacity: alpha,
      };
      out.push(vLabel);
    }

    // ---- 가속도 화살표 ---- 공 위. 두 레인 같은 길이, 방향만 반대. 강조색은 여기에만.
    const ay = wy(laneY - REF.ballR - REF.accelLift);
    const aArrow: Vector = {
      type: 'vector',
      id: `acceleration-${lane}`,
      from: [bx, ay],
      delta: [sign * REF.accelPx, 0],
      headSize: REF.head,
      width: ARROW_WIDTH_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
      opacity: alpha,
    };
    out.push(aArrow);
    const aLabel: Readout = {
      type: 'readout',
      id: `acceleration-label-${lane}`,
      anchor: { world: [bx + sign * REF.accelPx, ay], offset: [sign * REF.labelGap, 0] },
      text: text('label.acceleration'),
      chip: false,
      align: sign > 0 ? 'left' : 'right',
      font: 'text',
      fontSize: LABEL_FONT_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
      opacity: alpha,
    };
    out.push(aLabel);
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/**
 * 고정 경계. 프레이밍은 주장의 일부라 매 프레임 같은 값이다 (S-piece).
 *
 * 러너가 사방 36px(맞춤 여백 12 + 기본 여백 24)을 두고 맞추므로, 원본 캔버스에서
 * 그만큼 안쪽을 경계로 주면 원본 폭에서 1px = 월드 1 로 원본 자리에 그대로 놓인다.
 * 세로는 원본 220px 중 위 36 ~ 아래 214 를 담는다 — 그림(가속도 이름 ~ 아래 자취)이
 * 이 안에 있고, 캔버스 아래 남는 줄에 캡션 슬롯이 앉는다.
 */
export function boundsHint(): Bounds {
  const pad = 36;
  return {
    minX: pad,
    maxX: REF.width - pad,
    minY: wy(214),
    maxY: wy(pad),
  };
}
