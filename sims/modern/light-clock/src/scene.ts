// ========================================================================
// light-clock — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 거울(lineSet) · 빛(body 원) ·
// 빛의 길(trajectory) · 째깍 섬광(trace ring) · 같은 순간의 자리(trace ring + 점선) ·
// 삼각형의 두 다리와 컴퍼스 호(trajectory 점선) · 직각 표시(lineSet) · 거울 사이
// 치수선(dimension) · 기호 이름표와 γ(readout) 가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 거울 · 시계는 먹색(두 시계가 같은 시계다), 작도선은 muted,
// **강조색은 「빛」 한 가지 뜻에만** (빛 알갱이 · 빛의 길 · 그 길의 이름 ct ·
// 정지 시계가 째깍인 순간 빛이 있던 자리).
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
import { clockFrame, readConstants } from './physics';
import { CLOCK_LABEL_GAP, MIRROR_LEN, REST_DIM_X, SCENE_BOUNDS, text } from './schema';
import type { LightClockState } from './state';

/** 거울 굵기(화면 px). 시계의 몸이라 가장 굵다. */
const MIRROR_WIDTH_PX = 4;
/** 지나간 자리에 남긴 거울(발사 자리 · 째깍의 자리) 굵기 · 짙기. */
const GHOST_WIDTH_PX = 2;
const GHOST_OPACITY = 0.45;
/** 빛 알갱이 반지름(월드). */
const PULSE_RADIUS = 0.075;
/** 빛의 길 굵기(화면 px). 정지 시계의 길은 곧아서 옅게 둔다. */
const PATH_WIDTH_PX = 2.5;
const REST_PATH_OPACITY = 0.45;
/** 째깍 섬광 — 거울에 닿은 자리에서 퍼지는 고리(화면 px) · 수명(초) · 굵기(화면 px). */
const FLASH_FROM_PX = 6;
const FLASH_TO_PX = 18;
const FLASH_LIFE = 0.35;
const FLASH_WIDTH_PX = 1.5;
/** 같은 순간의 자리 표시 고리(화면 px)와 그것을 정지 시계 빛에 잇는 점선의 굵기 · 짙기. */
const SAME_RING_PX = 6;
const SAME_RING_WIDTH_PX = 2;
const LINK_WIDTH_PX = 1;
const LINK_OPACITY = 0.7;
/** 작도선(두 다리 · 컴퍼스 호) 굵기(화면 px). */
const LEG_WIDTH_PX = 1.5;
/** 컴퍼스 호를 긋는 표본 수. */
const ARC_SAMPLES = 32;
/** 직각 표시 한 변(월드). */
const RIGHT_ANGLE = 0.16;
/** 이름표 글자 크기(화면 px) · 기호 글자 크기 · γ 글자 크기. */
const LABEL_PX = 12;
const SYMBOL_PX = 14;
const GAMMA_PX = 14;
/** 기호 이름표를 선에서 띄우는 거리(월드) — 가로 선 아래 · 빗변 옆, 세로 선 옆. */
const SYMBOL_GAP = 0.24;
const SIDE_SYMBOL_GAP = 0.12;
/** 빛의 길 이름 ct 를 붙이는 자리 — 발사 자리에서 빗변을 따라 간 비. 같은 순간의 고리(3/5 자리)를 비켜 위 거울 쪽에 둔다. */
const CT_LABEL_AT = 0.8;
/** γ 를 세로 다리에서 띄우는 거리(월드). */
const GAMMA_GAP = 0.7;

/** 빛 시계 한 벌 — 아래 · 위 거울. */
function mirrors(id: string, x: number, gap: number, opacity: number, width: number, ghost: boolean): Primitive {
  const h = MIRROR_LEN / 2;
  return {
    type: 'lineSet',
    id,
    lines: [
      [
        [x - h, 0],
        [x + h, 0],
      ],
      [
        [x - h, gap],
        [x + h, gap],
      ],
    ],
    width,
    opacity,
    style: ghost ? { colorRole: 'muted', emphasis: 'strong' } : { colorRole: 'ink', emphasis: 'strong' },
  };
}

function pulse(id: string, pos: Vec2, opacity: number): Primitive {
  return {
    type: 'body',
    id,
    pos,
    shape: 'circle',
    size: PULSE_RADIUS,
    opacity,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
}

function symbol(id: string, at: Vec2, key: 'symbol.ct' | 'symbol.vt' | 'symbol.ctau', align: 'left' | 'center' | 'right', opacity: number, accent: boolean): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: text(key),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: SYMBOL_PX,
    align,
    opacity,
    style: accent ? { colorRole: 'accent', emphasis: 'strong' } : { colorRole: 'ink', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: LightClockState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('light-clock: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const f = clockFrame(tl, c);
  const gap = c.mirrorGap;
  const out: Primitive[] = [];

  /** 움직이는 시계 — 나타나며 짙어지고, 째깍 뒤 빠져나가며 흐려진다. */
  const movingAlpha = tl.at('ready') * (1 - tl.at('exit'));
  /** 빛 알갱이 — 떠난 뒤부터 시계가 빠져나갈 때까지. */
  const pulseAlpha = f.s >= 0 ? 1 - tl.at('exit') : 0;
  /** 남는 기록(빛의 길 · 지나간 자리) — 주기 끝에서 흐려진다. */
  const keepAlpha = 1 - tl.at('fade');
  /** 작도 — 빛이 닿은 뒤 세워진다. */
  const buildAlpha = tl.at('build') * keepAlpha;
  const arrived = f.s >= f.movingTick;
  const restTicked = f.s >= c.tickPeriod;

  // ---- 작도(맨 아래) ----
  if (buildAlpha > 0) {
    // 가로 다리 vt — 시계가 한 째깍 동안 옆으로 간 거리.
    out.push({
      type: 'trajectory',
      id: 'leg-vt',
      points: [f.start, f.foot],
      width: LEG_WIDTH_PX,
      opacity: buildAlpha,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
    // 세로 다리 cτ — 움직이는 시계 안에서 본 빛의 길. 정지한 시계의 거울 사이와 같다.
    out.push({
      type: 'trajectory',
      id: 'leg-ctau',
      points: [f.foot, f.top],
      width: LEG_WIDTH_PX,
      opacity: buildAlpha,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
    out.push({
      type: 'lineSet',
      id: 'right-angle',
      lines: [
        [
          [f.foot[0] - RIGHT_ANGLE, 0],
          [f.foot[0] - RIGHT_ANGLE, RIGHT_ANGLE],
          [f.foot[0], RIGHT_ANGLE],
        ],
      ],
      width: LEG_WIDTH_PX,
      opacity: buildAlpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    // 컴퍼스 — 발사 자리에서 거울 사이(cτ)만큼을 곧추선 자리에서 빗변 위로 돌린다.
    // 닿는 곳이 정지 시계가 째깍인 순간 빛이 있던 자리다 — 빗변은 그보다 더 길다.
    const slant = Math.atan2(f.top[1] - f.start[1], f.top[0] - f.start[0]);
    const sweep = Math.PI / 2 + (slant - Math.PI / 2) * tl.at('build');
    const arc: Vec2[] = Array.from({ length: ARC_SAMPLES + 1 }, (_, i) => {
      const a = Math.PI / 2 + ((sweep - Math.PI / 2) * i) / ARC_SAMPLES;
      return [f.start[0] + Math.cos(a) * gap, f.start[1] + Math.sin(a) * gap] as Vec2;
    });
    out.push({
      type: 'trajectory',
      id: 'compass',
      points: [f.start, [f.start[0], gap], ...arc],
      width: LEG_WIDTH_PX,
      opacity: buildAlpha,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
    });
    // 정지 시계의 거울 사이 — 같은 cτ.
    out.push({
      type: 'dimension',
      id: 'rest-gap',
      from: [REST_DIM_X, 0],
      to: [REST_DIM_X, gap],
      opacity: buildAlpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push(symbol('rest-ctau', [REST_DIM_X - SIDE_SYMBOL_GAP, gap / 2], 'symbol.ctau', 'right', buildAlpha, false));
    out.push(symbol('vt', [(f.start[0] + f.foot[0]) / 2, -SYMBOL_GAP], 'symbol.vt', 'center', buildAlpha, false));
    out.push(symbol('ctau', [f.foot[0] + SIDE_SYMBOL_GAP, gap / 2], 'symbol.ctau', 'left', buildAlpha, false));
  }

  // ---- 지나간 자리 — 빛을 쏜 아래 거울, 째깍인 위 거울 ----
  if (f.s >= 0) {
    out.push(mirrors('ghost-start', f.start[0], 0, GHOST_OPACITY * keepAlpha, GHOST_WIDTH_PX, true));
  }
  if (arrived) {
    out.push(mirrors('ghost-top', f.top[0], gap, GHOST_OPACITY * keepAlpha, GHOST_WIDTH_PX, true));
  }

  // ---- 빛의 길 ----
  if (f.s >= 0) {
    out.push({
      type: 'trajectory',
      id: 'rest-path',
      points: [
        [0, 0],
        [0, restTicked ? gap : f.restPulseY],
      ],
      width: PATH_WIDTH_PX,
      opacity: REST_PATH_OPACITY * keepAlpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    out.push({
      type: 'trajectory',
      id: 'moving-path',
      points: [f.start, f.pathSoFar],
      width: PATH_WIDTH_PX,
      opacity: keepAlpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 같은 순간 — 정지 시계가 째깍일 때 움직이는 시계의 빛은 여기 있었다 ----
  if (restTicked) {
    out.push({
      type: 'trajectory',
      id: 'same-instant-link',
      points: [[0, gap], f.sameInstant],
      width: LINK_WIDTH_PX,
      opacity: LINK_OPACITY * (1 - tl.at('build')) * keepAlpha,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
    out.push({
      type: 'trace',
      id: 'same-instant',
      marks: [{ pos: f.sameInstant }],
      shape: 'ring',
      size: SAME_RING_PX,
      width: SAME_RING_WIDTH_PX,
      opacity: keepAlpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 빛의 길 이름 ct — 삼각형이 설 때.
  if (buildAlpha > 0) {
    const dx = f.top[0] - f.start[0];
    const dy = f.top[1] - f.start[1];
    const len = Math.hypot(dx, dy);
    const mid: Vec2 = [f.start[0] + dx * CT_LABEL_AT, f.start[1] + dy * CT_LABEL_AT];
    out.push(symbol('ct', [mid[0] - (dy / len) * SYMBOL_GAP, mid[1] + (dx / len) * SYMBOL_GAP], 'symbol.ct', 'right', buildAlpha, true));
  }

  // ---- 정지한 빛 시계 ----
  out.push(mirrors('rest-clock', 0, gap, 1, MIRROR_WIDTH_PX, false));
  out.push({
    type: 'readout',
    id: 'rest-label',
    anchor: { world: [0, gap + CLOCK_LABEL_GAP] },
    text: text('label.rest'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 움직이는 빛 시계 ----
  if (movingAlpha > 0) {
    out.push(mirrors('moving-clock', f.movingX, gap, movingAlpha, MIRROR_WIDTH_PX, false));
    out.push({
      type: 'readout',
      id: 'moving-label',
      anchor: { world: [f.movingX, gap + CLOCK_LABEL_GAP] },
      text: text('label.moving'),
      vars: { beta: String(c.beta) },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      opacity: movingAlpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 째깍 섬광 — 빛이 거울에 닿는 순간 ----
  if (pulseAlpha > 0) {
    if (f.restHitAge !== undefined) {
      out.push({
        type: 'trace',
        id: 'rest-flash',
        marks: [{ pos: [0, f.restHitY], age: f.restHitAge }],
        life: FLASH_LIFE,
        shape: 'ring',
        size: FLASH_FROM_PX,
        spreadTo: FLASH_TO_PX,
        width: FLASH_WIDTH_PX,
        opacity: pulseAlpha,
        style: { colorRole: 'ink', emphasis: 'medium' },
      });
    }
    if (f.movingHitAge !== undefined) {
      out.push({
        type: 'trace',
        id: 'moving-flash',
        marks: [{ pos: f.movingHitPos, age: f.movingHitAge }],
        life: FLASH_LIFE,
        shape: 'ring',
        size: FLASH_FROM_PX,
        spreadTo: FLASH_TO_PX,
        width: FLASH_WIDTH_PX,
        opacity: pulseAlpha,
        style: { colorRole: 'ink', emphasis: 'medium' },
      });
    }

    // ---- 빛 알갱이(맨 위) ----
    out.push(pulse('rest-pulse', [0, f.restPulseY], pulseAlpha));
    out.push(pulse('moving-pulse', f.movingPulse, pulseAlpha));
  }

  // ---- γ — 빗변과 세로 다리의 비 ----
  const gammaAlpha = tl.at('reveal') * keepAlpha;
  if (gammaAlpha > 0) {
    out.push({
      type: 'readout',
      id: 'gamma',
      anchor: { world: [f.foot[0] + GAMMA_GAP, gap / 2] },
      text: text('label.gamma'),
      vars: { n: String(c.gammaNum), d: String(c.gammaDen) },
      chip: false,
      font: 'text',
      fontSize: GAMMA_PX,
      align: 'left',
      opacity: gammaAlpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
