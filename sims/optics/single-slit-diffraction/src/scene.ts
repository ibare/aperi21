// ========================================================================
// single-slit-diffraction — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 월드 1 = λ, 틈 가운데가 원점, 겹침은 쓴 순서다(`drawOrder: 'scene'`).
//
// 색 —
// - 빛(들어오는 파면 · 스크린 띠)은 빛 채널에 파장 색(`wavelengthToLinearRgb`)으로 칠한다. 스크린 띠는
//   빛 없음이 늘 거의 검정이라 라이트 · 다크에서 어두운 자리가 같이 어둡다.
// - 가림벽 · 점광원 · 줄기 · 세기 곡선 · 지금 띠 폭 괄호는 `ink`, 가장자리 줄기 · 호 · 0 기준선 · 앞의 띠 폭
//   점선은 `muted`.
// - 강조색(`accent`)은 「더 긴 몫(경로 차)」 한 뜻에만 쓴다 — 호 앞에서 줄기마다 더 긴 몫, 짝 단계에서는
//   짝마다 아래 줄기가 더 긴 λ/2 몫.
// ========================================================================

import type {
  Body,
  Bounds,
  LineSet,
  Primitive,
  Readout,
  SceneGraph,
  ScalarField,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
} from '@aperi21/schema';
import { wavelengthToLinearRgb } from '@aperi21/plugin-optics';
import { dist, firstDarkY, intensity, readConstants, sourcePoints } from './physics';
import {
  BARRIER_T,
  BRACKET_GAP,
  CURVE_GAP,
  CURVE_W,
  SCENE_BOUNDS,
  SCREEN_HALF,
  SCREEN_W,
  WAVE_HALF,
  WAVE_REACH,
  WAVE_STOP,
  text,
} from './schema';
import type { SingleSlitDiffractionState } from './state';

// ------------------------------------------------------------------------
// 그림 치수 — 화면 px 는 위계라 배율을 따르지 않는다 (C2)
// ------------------------------------------------------------------------

/** 들어오는 파면 굵기. */
const WAVE_PX = 2;
/** 점광원 줄기 · 가장자리 줄기 · 호 굵기. */
const RAY_PX = 1.2;
const EDGE_RAY_PX = 1;
const ARC_PX = 1.2;
/** 경로 차 계단 굵기. */
const STEP_PX = 3.2;
/** 세기 곡선 · 0 기준선 굵기. */
const CURVE_PX = 1.8;
const BASE_PX = 1;
/** 띠 폭 괄호 굵기. */
const BRACKET_PX = 1.6;
/** 표식 글자 크기 — λ · λ/2 와 짝 번호. */
const MARK_PX = 13;
const PAIR_PX = 11;
/** 짝 번호가 점광원 왼쪽으로 떨어진 거리(λ). */
const PAIR_LABEL_X = 0.45;
/** λ · λ/2 표식을 선분에서 띄우는 화면 거리(px). */
const MARK_GAP_PX = 12;
/** λ/2 표식을 선분 아래로 내리는 화면 거리(px) — 호 · 가장자리 줄기와 겹치지 않게. */
const HALF_MARK_DROP_PX = 20;

/** 점광원 점 반지름(λ). */
const SOURCE_R = 0.13;
/** 호가 위 끝 위 · 아래 끝 아래로 더 뻗는 길이(λ). */
const ARC_OVERRUN = 0.7;
/** 호 표본 수. */
const ARC_SAMPLES = 48;
/** 스크린 띠 · 곡선 표본 수(세로). */
const SCREEN_ROWS = 380;
/** 띠 폭 괄호 끝 눈금의 반 길이(λ) · 앞의 폭 점선 괄호가 지금 괄호 왼쪽으로 비켜 선 거리(λ). */
const BRACKET_TICK = 0.3;
const GHOST_SHIFT = 0.55;

// ------------------------------------------------------------------------
// 도움 함수
// ------------------------------------------------------------------------

const lerp = (a: Vec2, b: Vec2, s: number): Vec2 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];

/** a 에서 b 쪽으로 길이 len 만큼 간 점. */
function toward(a: Vec2, b: Vec2, len: number): Vec2 {
  const d = dist(a, b);
  return [a[0] + ((b[0] - a[0]) * len) / d, a[1] + ((b[1] - a[1]) * len) / d];
}

/** 곡선 기준선 x. */
function curveX0(L: number): number {
  return L + SCREEN_W + CURVE_GAP;
}

/** 지금 띠 폭 괄호 x. */
function bracketX(L: number): number {
  return curveX0(L) + CURVE_W + BRACKET_GAP;
}

// ------------------------------------------------------------------------
// 빛 · 장치
// ------------------------------------------------------------------------

/** 왼쪽에서 틈으로 다가오는 평면 파면 — 간격이 곧 λ 다. */
function incoming(t: number, speed: number, rgb: readonly [number, number, number]): LineSet {
  const face = -BARRIER_T / 2;
  const x0 = face - WAVE_REACH;
  const x1 = face - WAVE_STOP;
  const s = (((t * speed) % 1) + 1) % 1;
  const lines: Vec2[][] = [];
  for (let x = x0 + s; x <= x1; x += 1) {
    lines.push([
      [x, -WAVE_HALF],
      [x, WAVE_HALF],
    ]);
  }
  return { type: 'lineSet', id: 'incoming', lines, width: WAVE_PX, light: { rgb } };
}

function barrier(a: number): Body[] {
  const h = SCREEN_HALF - a / 2;
  const mid = (SCREEN_HALF + a / 2) / 2;
  const part = (id: string, y: number): Body => ({
    type: 'body',
    id,
    shape: 'rect',
    pos: [0, y],
    size: [BARRIER_T, h],
    outline: 'none',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  return [part('barrier-top', mid), part('barrier-bottom', -mid)];
}

/** 스크린 띠 — 행마다 그 높이의 세기로 파장 색 빛을 칠한다. */
function screen(a: number, L: number, rgb: readonly [number, number, number]): ScalarField {
  const values: number[] = [];
  for (let i = 0; i < SCREEN_ROWS; i++) {
    const y = SCREEN_HALF - ((i + 0.5) * 2 * SCREEN_HALF) / SCREEN_ROWS;
    const v = intensity(a, L, y);
    values.push(rgb[0] * v, rgb[1] * v, rgb[2] * v);
  }
  return {
    type: 'scalarField',
    id: 'screen',
    min: [L, -SCREEN_HALF],
    max: [L + SCREEN_W, SCREEN_HALF],
    cols: 1,
    rows: SCREEN_ROWS,
    values,
    range: [0, 1],
    colors: 'lightRgb',
  };
}

/** 세기 곡선과 0 기준선. */
function profile(a: number, L: number): Trajectory[] {
  const x0 = curveX0(L);
  const points: Vec2[] = [];
  for (let i = 0; i <= SCREEN_ROWS; i++) {
    const y = SCREEN_HALF - (i * 2 * SCREEN_HALF) / SCREEN_ROWS;
    points.push([x0 + CURVE_W * intensity(a, L, y), y]);
  }
  return [
    {
      type: 'trajectory',
      id: 'profile-zero',
      points: [
        [x0, SCREEN_HALF],
        [x0, -SCREEN_HALF],
      ],
      width: BASE_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
    {
      type: 'trajectory',
      id: 'profile-curve',
      points,
      width: CURVE_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
  ];
}

/** 가운데 밝은 띠의 폭 괄호 — 첫 어두운 점 두 곳 사이. */
function bracket(id: string, x: number, half: number): LineSet {
  return {
    type: 'lineSet',
    id,
    lines: [
      [
        [x, -half],
        [x, half],
      ],
      [
        [x - BRACKET_TICK, half],
        [x + BRACKET_TICK, half],
      ],
      [
        [x - BRACKET_TICK, -half],
        [x + BRACKET_TICK, -half],
      ],
    ],
    width: BRACKET_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

/** 앞(넓은 틈)의 띠 폭 — 점선 세로줄과 끝 눈금. */
function ghostBracket(x: number, half: number, opacity: number): Primitive[] {
  return [
    {
      type: 'trajectory',
      id: 'ghost-bracket',
      points: [
        [x, half],
        [x, -half],
      ],
      width: BRACKET_PX,
      opacity,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    },
    {
      type: 'lineSet',
      id: 'ghost-bracket-ticks',
      lines: [
        [
          [x - BRACKET_TICK, half],
          [x + BRACKET_TICK, half],
        ],
        [
          [x - BRACKET_TICK, -half],
          [x + BRACKET_TICK, -half],
        ],
      ],
      width: BRACKET_PX,
      opacity,
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
  ];
}

// ------------------------------------------------------------------------
// 작도 — 줄기 · 같은 거리 호 · 경로 차 계단 · 짝
// ------------------------------------------------------------------------

interface Construction {
  /** 틈 폭(λ). */
  a: number;
  /** 줄기가 뻗은 정도 0~1. */
  grow: number;
  /** 호 · 계단이 자란 정도 0~1. */
  arc: number;
  /** 짝 단계인가. */
  pair: boolean;
  /** 전체 불투명도(좁히기 · 넓히기 동안 옅어진다). */
  opacity: number;
}

function construction(tag: string, k: Construction, L: number, n: number): Primitive[] {
  const { a, grow, arc, pair, opacity } = k;
  const out: Primitive[] = [];
  const P: Vec2 = [L, firstDarkY(a, L)];
  const top: Vec2 = [0, a / 2];
  const bottom: Vec2 = [0, -a / 2];
  const r0 = dist(P, top);
  const srcs = sourcePoints(a, n);

  // 줄기 — 가장자리 둘은 옅게, 점광원 줄기는 짙게.
  out.push({
    type: 'lineSet',
    id: `${tag}-edge-rays`,
    lines: [
      [top, lerp(top, P, grow)],
      [bottom, lerp(bottom, P, grow)],
    ],
    width: EDGE_RAY_PX,
    opacity,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'lineSet',
    id: `${tag}-rays`,
    lines: srcs.map((s) => [s, lerp(s, P, grow)]),
    width: RAY_PX,
    opacity,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });

  if (arc > 0) {
    // P 를 중심으로 위 끝을 지나는 호 — 호 위의 모든 점은 P 까지 위 끝과 같은 거리다.
    const angle = (p: Vec2): number => {
      const v = Math.atan2(p[1] - P[1], p[0] - P[0]);
      return v > 0 ? v - 2 * Math.PI : v;
    };
    const from = angle([0, a / 2 + ARC_OVERRUN]);
    const to = angle([0, -a / 2 - ARC_OVERRUN]);
    const end = from + (to - from) * arc;
    const pts: Vec2[] = [];
    for (let i = 0; i <= ARC_SAMPLES; i++) {
      const th = from + ((end - from) * i) / ARC_SAMPLES;
      pts.push([P[0] + r0 * Math.cos(th), P[1] + r0 * Math.sin(th)]);
    }
    out.push({
      type: 'trajectory',
      id: `${tag}-arc`,
      points: pts,
      width: ARC_PX,
      opacity,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });

    // 경로 차 — 줄기마다 호 앞에서 더 긴 몫.
    const extra = srcs.map((s) => dist(s, P) - r0);
    const edgeExtra = dist(bottom, P) - r0;
    const edgeEnd = toward(bottom, P, edgeExtra * arc);
    const half = n / 2;

    if (!pair) {
      out.push({
        type: 'lineSet',
        id: `${tag}-steps`,
        lines: [...srcs.map((s, i) => [s, toward(s, P, extra[i]! * arc)]), [bottom, edgeEnd]],
        width: STEP_PX,
        opacity,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
      const lambdaMark: Readout = {
        type: 'readout',
        id: `${tag}-lambda`,
        anchor: { world: lerp(bottom, edgeEnd, 0.5), offset: [0, MARK_GAP_PX] },
        text: text('mark.lambda'),
        chip: false,
        font: 'text',
        italic: true,
        fontSize: MARK_PX,
        opacity: opacity * arc,
        style: { colorRole: 'accent', emphasis: 'strong' },
      };
      out.push(lambdaMark);
    } else {
      // 짝 — 위 절반 i 와 아래 절반 i + n/2. 아래 줄기의 더 긴 몫 중 짝의 몫만큼은 옅게,
      // 넘는 λ/2 만 강조색으로 남긴다.
      const plain: Vec2[][] = [];
      const surplus: Vec2[][] = [];
      for (let i = 0; i < half; i++) {
        const up = srcs[i]!;
        const low = srcs[i + half]!;
        plain.push([up, toward(up, P, extra[i]!)]);
        const cut = toward(low, P, extra[i]!);
        plain.push([low, cut]);
        surplus.push([cut, toward(low, P, extra[i + half]!)]);
      }
      plain.push([bottom, edgeEnd]);
      out.push({
        type: 'lineSet',
        id: `${tag}-steps`,
        lines: plain,
        width: STEP_PX,
        opacity,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
      out.push({
        type: 'lineSet',
        id: `${tag}-surplus`,
        lines: surplus,
        width: STEP_PX,
        opacity,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
      const last = surplus[surplus.length - 1]!;
      out.push({
        type: 'readout',
        id: `${tag}-half-lambda`,
        anchor: { world: lerp(last[0]!, last[1]!, 0.5), offset: [MARK_GAP_PX, HALF_MARK_DROP_PX] },
        text: text('mark.halfLambda'),
        chip: false,
        font: 'text',
        italic: true,
        fontSize: MARK_PX,
        opacity,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
      srcs.forEach((s, i) => {
        out.push({
          type: 'readout',
          id: `${tag}-pair-${i}`,
          anchor: { world: [s[0] - PAIR_LABEL_X, s[1]] },
          text: text('mark.pair'),
          vars: { k: String((i % half) + 1) },
          chip: false,
          font: 'mono',
          fontSize: PAIR_PX,
          align: 'right',
          opacity,
          style: { colorRole: 'ink', emphasis: 'strong' },
        });
      });
    }
  }

  // 점광원 — 줄기가 나오는 자리.
  srcs.forEach((s, i) => {
    out.push({
      type: 'body',
      id: `${tag}-source-${i}`,
      shape: 'circle',
      pos: s,
      size: SOURCE_R,
      outline: 'none',
      glow: false,
      opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  });
  return out;
}

// ------------------------------------------------------------------------
// 조립
// ------------------------------------------------------------------------

export function scene(params: {
  state: SingleSlitDiffractionState;
  stage: StageDef;
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('single-slit-diffraction: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const L = c.screenDistance;
  const n = c.sources;
  const rgb = wavelengthToLinearRgb(c.wavelengthNm);

  // 좁히기 → 되넓히기. 0 이면 넓은 틈, 1 이면 좁은 틈.
  const squeeze = tl.at('narrow') - tl.at('widen');
  const a = c.slitWide + (c.slitNarrow - c.slitWide) * squeeze;

  const out: Primitive[] = [
    incoming(tl.t, c.waveSpeed, rgb),
    screen(a, L, rgb),
    ...profile(a, L),
  ];

  // 가운데 띠 폭 — 지금은 실선, 좁히는 동안부터 넓은 틈의 폭을 점선으로 남긴다.
  const xb = bracketX(L);
  if (squeeze > 0) out.push(...ghostBracket(xb - GHOST_SHIFT, firstDarkY(c.slitWide, L), squeeze));
  out.push(bracket('bracket', xb, firstDarkY(a, L)));

  out.push(...barrier(a));

  const wideFade = 1 - tl.at('narrow');
  if (tl.at('wide-rays') > 0 && wideFade > 0) {
    out.push(
      ...construction(
        'wide',
        {
          a: c.slitWide,
          grow: tl.at('wide-rays'),
          arc: tl.at('wide-arc'),
          pair: tl.at('wide-pair') > 0,
          opacity: wideFade,
        },
        L,
        n,
      ),
    );
  }
  const narrowFade = 1 - tl.at('widen');
  if (tl.at('narrow-rays') > 0 && narrowFade > 0) {
    out.push(
      ...construction(
        'narrow',
        {
          a: c.slitNarrow,
          grow: tl.at('narrow-rays'),
          arc: tl.at('narrow-arc'),
          pair: tl.at('narrow-pair') > 0,
          opacity: narrowFade,
        },
        L,
        n,
      ),
    );
  }
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
