// ========================================================================
// wave-attenuation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 줄 · 포락선 · 평형선 · 표시점
// 안내선 · 앞 높이 윤곽 · 마루 높이선(trajectory), 손잡이 · 마루 점(body), 높이 막대(region),
// 표시점 사이 거리(dimension), 몫 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 줄과 손잡이는 먹색. 따라가는 마루와 그 마루가 남긴 높이 막대는 같은
// 것(마루의 높이)의 지금과 기록이라 같은 primary. **강조색은 「같은 몫」 한 뜻에만** — 몫
// 이름표(`×0.5`). 포락선 · 평형선 · 안내선 · 앞 높이 윤곽 · 치수선은 배경 정보라 muted.
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
  barOpacity,
  crestX,
  displacement,
  envelope,
  markX,
  readConstants,
  ropeEndX,
} from './physics';
import { BAR_BASE_Y, ROPE_Y, SCENE_BOUNDS, text } from './schema';
import type { WaveAttenuationState } from './state';

// ---- 표본 수 — 상태로 계산하지 않는다 ----
/** 줄 · 포락선의 표본 수. 한 파장(1 m)에 약 40 점. */
const ROPE_SAMPLES = 330;

// ---- 선 굵기(화면 px) ----
const ROPE_WIDTH_PX = 2.5;
const GUIDE_WIDTH_PX = 1;
const ENVELOPE_WIDTH_PX = 1.5;
const GHOST_WIDTH_PX = 1.5;
const CREST_HEIGHT_WIDTH_PX = 1.5;

// ---- 짙기 ----
/** 평형선 · 막대 바닥선. 줄보다 한참 뒤로 물러나 있어야 한다. */
const BASELINE_OPACITY = 0.4;
/** 표시점 안내선. 줄을 가로지르므로 가장 옅다. */
const MARK_GUIDE_OPACITY = 0.35;
/** 포락선. 마루가 이 선을 따라 낮아지는 것이 보일 만큼. */
const ENVELOPE_OPACITY = 0.7;
/** 높이 막대의 채움. 다크 바탕에서도 앞 높이 윤곽과 또렷이 갈려야 한다. */
const BAR_FILL = 0.8;

// ---- 크기(월드 m) ----
/** 흔드는 손잡이 [가로, 세로]. */
const HANDLE_SIZE: readonly [number, number] = [0.16, 0.3];
/** 손잡이를 줄 왼쪽 끝에서 바깥으로 물린 거리. */
const HANDLE_INSET = 0.08;
const CREST_RADIUS = 0.09;
/** 높이 막대의 가로 폭. */
const BAR_WIDTH = 0.42;
/** 막대가 나타나는 데 걸리는 마루의 이동 거리 — 마루가 표시점을 지나며 높이를 내려놓는다. */
const BAR_REVEAL_DIST = 0.25;
/** 표시점 안내선이 가장 높은 마루 위로 나가는 길이. */
const MARK_GUIDE_OVERRUN = 0.12;
/** 평형선 · 바닥선이 줄 왼쪽 끝 앞으로 나가는 길이. */
const LINE_LEAD = 0.3;
/** 거리 치수선을 바닥선 아래로 내린 거리. 치수 글자가 바닥선과 막대 사이에 앉는다. */
const SPACING_DIM_DROP = 0.42;

// ---- 글자 ----
const RATIO_LABEL_PX = 14;
/** 몫 이름표를 앞 높이 윤곽 위로 띄우는 거리(월드 m). */
const RATIO_LABEL_GAP = 0.2;

export function scene(params: {
  state: WaveAttenuationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('wave-attenuation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const t = timeline.t;
  const ropeStart = markX(0, c);
  const ropeEnd = ropeEndX(c);
  const crest = crestX(timeline, c);
  const fade = barOpacity(timeline);
  const out: Primitive[] = [];

  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const primary = { colorRole: 'primary', emphasis: 'strong' } as const;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;

  // ---- 평형선 ----
  out.push({
    type: 'trajectory',
    id: 'equilibrium',
    points: [
      [ropeStart - LINE_LEAD, ROPE_Y],
      [ropeEnd, ROPE_Y],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: BASELINE_OPACITY,
    style: { ...muted, lineStyle: 'dashed' },
  });

  // ---- 표시점 안내선 ----
  // 같은 거리 d 마다 선 자리. 줄 위의 높이를 아래 막대 판으로 내려 잇는다.
  const guideTop = ROPE_Y + c.amplitude + MARK_GUIDE_OVERRUN;
  for (let k = 0; k < c.markCount; k++) {
    const x = markX(k, c);
    out.push({
      type: 'trajectory',
      id: `mark-guide-${k}`,
      points: [
        [x, guideTop],
        [x, BAR_BASE_Y],
      ],
      width: GUIDE_WIDTH_PX,
      opacity: MARK_GUIDE_OPACITY,
      style: { ...muted, lineStyle: 'dotted' },
    });
  }

  // ---- 포락선 ±A(x) ----
  // 마루와 골이 닿는 한계. 줄은 퍼지지 않는데도 이 선이 오른쪽으로 좁아진다.
  const upper: Vec2[] = [];
  const lower: Vec2[] = [];
  const rope: Vec2[] = [];
  for (let i = 0; i <= ROPE_SAMPLES; i++) {
    const x = ropeStart + ((ropeEnd - ropeStart) * i) / ROPE_SAMPLES;
    const a = envelope(x, c);
    upper.push([x, ROPE_Y + a]);
    lower.push([x, ROPE_Y - a]);
    rope.push([x, ROPE_Y + displacement(x, t, c)]);
  }
  for (const [id, points] of [
    ['envelope-upper', upper],
    ['envelope-lower', lower],
  ] as const) {
    out.push({
      type: 'trajectory',
      id,
      points,
      width: ENVELOPE_WIDTH_PX,
      opacity: ENVELOPE_OPACITY,
      style: { ...muted, lineStyle: 'dashed' },
    });
  }

  // ---- 막대 판 바닥선 ----
  out.push({
    type: 'trajectory',
    id: 'bar-baseline',
    points: [
      [ropeStart - LINE_LEAD, BAR_BASE_Y],
      [ropeEnd, BAR_BASE_Y],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: BASELINE_OPACITY,
    style: muted,
  });

  // ---- 표시점 사이 거리 ----
  // 모두 같은 d — 「같은 거리마다」 의 「같은」 이 이 치수선들이다. 값은 선언값 그대로다.
  const dimY = BAR_BASE_Y - SPACING_DIM_DROP;
  for (let k = 0; k + 1 < c.markCount; k++) {
    out.push({
      type: 'dimension',
      id: `spacing-${k}`,
      from: [markX(k, c), dimY],
      to: [markX(k + 1, c), dimY],
      text: text('label.spacing'),
      vars: { d: String(c.markSpacing) },
      style: muted,
    });
  }

  // ---- 줄 ----
  out.push({
    type: 'trajectory',
    id: 'rope',
    points: rope,
    width: ROPE_WIDTH_PX,
    style: ink,
  });

  // ---- 흔드는 손잡이 ----
  out.push({
    type: 'body',
    id: 'handle',
    pos: [ropeStart - HANDLE_INSET, ROPE_Y + displacement(ropeStart, t, c)],
    shape: 'rect',
    size: HANDLE_SIZE,
    outline: 'none',
    style: ink,
  });

  // ---- 높이 막대 ----
  // 마루가 표시점 k 를 지나면 그 자리 높이 A(x_k) 를 막대로 내려놓는다. k ≥ 1 이면 막대 뒤에
  // 앞 막대 높이 A(x_{k−1}) 의 점선 윤곽을 깔아, 새 막대가 그 윤곽의 어디까지 차는지 보인다 —
  // 어느 표시점에서나 같은 몫이다.
  const half = BAR_WIDTH / 2;
  for (let k = 0; k < c.markCount; k++) {
    const x = markX(k, c);
    const reveal = Math.min(1, Math.max(0, (crest - x) / BAR_REVEAL_DIST));
    const alpha = reveal * fade;
    if (alpha <= 0) continue;

    if (k >= 1) {
      const prevTop = BAR_BASE_Y + envelope(markX(k - 1, c), c);
      out.push({
        type: 'trajectory',
        id: `bar-ghost-${k}`,
        points: [
          [x - half, BAR_BASE_Y],
          [x - half, prevTop],
          [x + half, prevTop],
          [x + half, BAR_BASE_Y],
        ],
        width: GHOST_WIDTH_PX,
        opacity: alpha,
        style: { ...muted, lineStyle: 'dashed' },
      });
    }

    const top = BAR_BASE_Y + envelope(x, c);
    out.push({
      type: 'region',
      id: `bar-${k}`,
      points: [
        [x - half, BAR_BASE_Y],
        [x + half, BAR_BASE_Y],
        [x + half, top],
        [x - half, top],
      ],
      fillOpacity: BAR_FILL,
      opaque: true,
      opacity: alpha,
      style: primary,
    });

    if (k >= 1) {
      const prevTop = BAR_BASE_Y + envelope(markX(k - 1, c), c);
      out.push({
        type: 'readout',
        id: `step-ratio-${k}`,
        anchor: { world: [x, prevTop + RATIO_LABEL_GAP] },
        text: text('label.stepRatio'),
        // 몫은 선언된 정박값 그대로다 — 계산한 e^(−αd) 를 반올림해 띄우지 않는다 (S-piece 유효숫자).
        vars: { q: String(c.stepRatio) },
        chip: false,
        fontSize: RATIO_LABEL_PX,
        font: 'mono',
        weight: 'bold',
        align: 'center',
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  // ---- 따라가는 마루 ----
  // 줄 위에 있는 동안만. 평형선에서 마루까지의 높이선이 곧 아래 막대가 될 높이다.
  if (crest >= ropeStart && crest <= ropeEnd) {
    const crestY = ROPE_Y + displacement(crest, t, c);
    out.push({
      type: 'trajectory',
      id: 'crest-height',
      points: [
        [crest, ROPE_Y],
        [crest, crestY],
      ],
      width: CREST_HEIGHT_WIDTH_PX,
      style: primary,
    });
    out.push({
      type: 'body',
      id: 'crest',
      pos: [crest, crestY],
      shape: 'circle',
      size: CREST_RADIUS,
      outline: 'background',
      glow: false,
      style: primary,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
