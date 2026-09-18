// ========================================================================
// black-hole-horizon — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 별 · 빛 펄스(body) · 지평선 원 ·
// 펄스 꼬리 · 막대 길 · c 선(trajectory) · 탈출 속도 막대(region) · 이름표(readout)가 모두 표준 어휘다.
//
// 별은 왼쪽(중심이 월드 원점), 빛은 표면에서 오른쪽으로 쏜다. 탈출 속도 막대는 오른쪽 아래.
//
// 색은 뜻마다 하나다 — 별은 먹색, 빛은 강조색(이 조각에서 강조색의 뜻은 「빛」 하나다), 지평선
// 원은 primary 점선, 탈출 속도 막대는 secondary, 막대 길 · 이름표 곁 글자는 muted.
// 빛이 빠져나가는 샷과 되돌아오는 샷을 다른 색으로 칠하지 않는다 — 「돌아온다」 는 움직임이 말한다
// (S-piece MUST NOT 「색으로 설명하지 않는다」).
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
import {
  HORIZON_PHASE,
  STOP_PHASES,
  TRAPPED_PHASES,
  currentStop,
  displayRadius,
  escapeOverLight,
  fadeOpacity,
  flightProgress,
  horizonOpacity,
  readConstants,
  starRadius,
  trappedRadius,
} from './physics';
import { BAR_ORIGIN, SCENE_BOUNDS, text } from './schema';
import type { BlackHoleHorizonState } from './state';

/** 별의 짙기 — 먹색 원판이 화면 왼쪽을 채울 때 너무 무겁지 않게. */
const STAR_OPACITY = 0.9;
/** 빛 펄스 점의 반지름(월드). */
const PULSE_R = 0.07;
/** 빛 펄스 꼬리 길이(월드) · 굵기(화면 px). */
const PULSE_TAIL = 0.9;
const PULSE_TAIL_WIDTH_PX = 3;
/** 되돌아오는 펄스의 꼬리가 거슬러 보는 비행 진행도 · 표본 수. */
const TRAPPED_TAIL_SPAN = 0.22;
const TRAPPED_TAIL_SAMPLES = 10;
/** 지평선 안에서 빛을 쏘는 방향 수(고르게 나눈다). */
const TRAPPED_RAYS = 8;
/**
 * 방향을 반 칸 돌려 놓는다 — 곧장 위로 쏜 빛이 지평선 꼭대기에서 멈추면 지평선 이름표를 가린다.
 */
const TRAPPED_RAY_PHASE = 0.5;
/** 빠져나가는 펄스가 「화면을 벗어났다」 로 치는 자리 — 오른쪽 끝에서 이만큼 더(월드). */
const EXIT_MARGIN = 0.4;
/** 지평선 원의 표본 수 · 굵기(화면 px). */
const RING_SAMPLES = 96;
const RING_WIDTH_PX = 2;
/** 지평선 이름표를 원 꼭대기 위로 띄우는 거리(화면 px) · 크기. */
const RING_LABEL_GAP = 12;
const RING_LABEL_PX = 12;
/** 반지름 글자를 별 표면 오른쪽 아래로 띄우는 거리(화면 px) · 크기. */
const RADIUS_LABEL_OFFSET: Vec2 = [8, 18];
const RADIUS_LABEL_PX = 12;
/** 탈출 속도 막대의 반높이(월드). */
const BAR_HALF = 0.13;
/** 막대 채움 불투명도. */
const BAR_FILL = 0.85;
/** 막대 길(0 부터 오른쪽 끝까지 깔린 가는 선)의 굵기 · 짙기. */
const TRACK_WIDTH_PX = 1;
const TRACK_OPACITY = 0.7;
/** c 선의 반높이(월드) · 굵기(화면 px). */
const C_LINE_HALF = 0.3;
const C_LINE_WIDTH_PX = 2;
/** 막대 이름 · c 이름을 위로 띄우는 거리(화면 px) · 크기. */
const BAR_LABEL_RISE = 14;
const BAR_LABEL_PX = 12;

function circle(radius: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < RING_SAMPLES; i++) {
    const a = (i / RING_SAMPLES) * Math.PI * 2;
    pts.push([radius * Math.cos(a), radius * Math.sin(a)]);
  }
  return pts;
}

function pulse(id: string, pos: Vec2, opacity: number): Primitive {
  return {
    type: 'body',
    id,
    pos,
    shape: 'circle',
    size: PULSE_R,
    outline: 'none',
    glow: true,
    opacity,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
}

function tail(id: string, points: readonly Vec2[], opacity: number): Primitive {
  return {
    type: 'trajectory',
    id,
    points,
    width: PULSE_TAIL_WIDTH_PX,
    opacity,
    style: { colorRole: 'accent', emphasis: 'strong', fade: 'tail' },
  };
}

export function scene(params: {
  state: BlackHoleHorizonState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('black-hole-horizon: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];
  const fade = fadeOpacity(tl);

  const x = starRadius(c, tl);
  const starR = displayRadius(c, x);
  const ringR = displayRadius(c, 1);
  const ring = horizonOpacity(c, x);

  // ---- 별 ----
  // 질량은 그대로, 반지름만 준다. 선형 구간 밖(태양 크기 · 그 100 분의 1)은 눌러 그린다 — 크기는
  // 반지름 글자가 말한다.
  out.push({
    type: 'body',
    id: 'star',
    pos: [0, 0],
    shape: 'circle',
    size: starR,
    outline: 'none',
    glow: false,
    opacity: STAR_OPACITY * fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 지평선 ----
  // 질량이 그대로라 지평선 반지름도 그대로다. 별이 선형 구간에 들어와야 비율이 참이라 그때부터 선다.
  if (ring > 0) {
    out.push({
      type: 'trajectory',
      id: 'horizon',
      points: circle(ringR),
      closed: true,
      width: RING_WIDTH_PX,
      opacity: ring * fade,
      style: { colorRole: 'primary', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }
  // 이름표는 표면이 지평선에 닿은 뒤에 선다 — 그 전에는 반지름 글자가 별의 크기를 말한다.
  const namedHorizon = tl.phase === HORIZON_PHASE || tl.at(HORIZON_PHASE) >= 1;
  if (namedHorizon) {
    out.push({
      type: 'readout',
      id: 'horizon-label',
      anchor: { world: [0, ringR], offset: [0, -RING_LABEL_GAP] },
      text: text('label.horizon'),
      // 선언값 그대로 — 2GM/c² 를 계산해 줄이지 않는다 (S-piece 유효숫자).
      vars: { r: String(c.horizonLabelKm) },
      chip: false,
      font: 'text',
      fontSize: RING_LABEL_PX,
      align: 'center',
      opacity: fade,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // ---- 멈춤 — 반지름 글자와 빠져나가는 빛 ----
  const stop = currentStop(tl);
  if (stop !== null) {
    out.push({
      type: 'readout',
      id: 'radius-label',
      anchor: { world: [starR, 0], offset: RADIUS_LABEL_OFFSET },
      text: text('label.radius'),
      // 선언값 그대로 (S-piece 유효숫자).
      vars: { r: String(c.stopRadiiKm[stop]!) },
      chip: false,
      font: 'text',
      fontSize: RADIUS_LABEL_PX,
      align: 'left',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // 빛은 표면에서 오른쪽 끝 너머까지 나간다. 화면 시간은 샷마다 따로 줄인다 — NOTES (b).
    const f = flightProgress(tl, STOP_PHASES[stop]!.pulse);
    if (f !== null) {
      const endX = SCENE_BOUNDS.maxX + EXIT_MARGIN;
      const px = starR + f * (endX - starR);
      out.push(
        tail(
          'pulse-tail',
          [
            [Math.max(starR, px - PULSE_TAIL), 0],
            [px, 0],
          ],
          fade,
        ),
      );
      out.push(pulse('pulse', [px, 0], fade));
    }
  }

  // ---- 지평선 안 — 되돌아오는 빛 ----
  // 표면에서 광속으로 바깥에 쏜 빛이 느려지다 지평선에서 멈추고, 떨어져 표면으로 돌아온다.
  const trappedF = flightProgress(tl, TRAPPED_PHASES.pulse);
  if (trappedF !== null) {
    const f = trappedF;
    // 한 방향만 쏘면 「그 방향이 우연히 막혔다」 로 읽힐 수 있어 사방으로 쏜다 — 모두 같은 거리에서 돌아선다.
    const now = displayRadius(c, trappedRadius(x, f));
    const past: number[] = [];
    for (let i = TRAPPED_TAIL_SAMPLES; i >= 0; i--) {
      const g = Math.max(0, f - (TRAPPED_TAIL_SPAN * i) / TRAPPED_TAIL_SAMPLES);
      past.push(displayRadius(c, trappedRadius(x, g)));
    }
    for (let k = 0; k < TRAPPED_RAYS; k++) {
      const a = ((k + TRAPPED_RAY_PHASE) / TRAPPED_RAYS) * Math.PI * 2;
      const ux = Math.cos(a);
      const uy = Math.sin(a);
      out.push(tail(`trapped-tail-${k}`, past.map((r): Vec2 => [r * ux, r * uy]), fade));
      out.push(pulse(`trapped-${k}`, [now * ux, now * uy], fade));
    }
  }

  // ---- 탈출 속도 막대 ----
  // 0 에서 오른쪽으로 자란다. c 선까지가 광속이다 — 뉴턴식은 지평선 안에서 c 를 넘는 값을 준다.
  const [bx, by] = BAR_ORIGIN;
  const cx = bx + c.barLength;
  out.push({
    type: 'trajectory',
    id: 'bar-track',
    points: [
      [bx, by],
      [SCENE_BOUNDS.maxX, by],
    ],
    width: TRACK_WIDTH_PX,
    opacity: TRACK_OPACITY * fade,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  const barEnd = bx + escapeOverLight(x) * c.barLength;
  out.push({
    type: 'region',
    id: 'bar',
    points: [
      [bx, by - BAR_HALF],
      [barEnd, by - BAR_HALF],
      [barEnd, by + BAR_HALF],
      [bx, by + BAR_HALF],
    ],
    fillOpacity: BAR_FILL,
    opaque: true,
    opacity: fade,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'c-line',
    points: [
      [cx, by - C_LINE_HALF],
      [cx, by + C_LINE_HALF],
    ],
    width: C_LINE_WIDTH_PX,
    opacity: fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'c-label',
    anchor: { world: [cx, by + C_LINE_HALF], offset: [0, -BAR_LABEL_RISE] },
    text: text('label.light'),
    chip: false,
    font: 'text',
    fontSize: BAR_LABEL_PX,
    align: 'center',
    opacity: fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'bar-label',
    anchor: { world: [bx, by + BAR_HALF], offset: [0, -BAR_LABEL_RISE] },
    text: text('label.escape'),
    chip: false,
    font: 'text',
    fontSize: BAR_LABEL_PX,
    align: 'left',
    opacity: fade,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
