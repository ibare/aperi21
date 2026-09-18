// ========================================================================
// wave-speed-in-medium — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 줄 · 간 거리 막대(trajectory),
// 눈금(lineSet), 벽(body), 당김(vector), 줄 이름표(readout) 가 모두 표준 어휘다.
//
// 색은 뜻마다 하나다 — 줄은 먹색, **강조색은 「펄스가 간 거리」 한 뜻에만**(막대 셋).
// 벽 · 당김 화살표 · 눈금 · 이름표는 배경 정보라 muted. 세 줄은 색이 아니라 이름표 ·
// 당김 화살표 길이 · 줄 굵기로 갈린다.
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
  displacement,
  markOpacity,
  pulseCenter,
  raceEnd,
  raceTime,
  readConstants,
  strings,
  waveSpeed,
  type StringMedium,
} from './physics';
import {
  ARROW_GAP,
  ARROW_PER_TENSION,
  BAR_GAP,
  LABEL_X,
  LANE_Y,
  SCENE_BOUNDS,
  WALL_HALF_HEIGHT,
  WALL_WIDTH,
  text,
  type WaveSpeedInMediumMessageKey,
} from './schema';
import type { WaveSpeedInMediumState } from './state';

// ---- 표본 수 — 상태로 계산하지 않는다 ----
/** 줄 하나의 표본 수. 펄스 반폭(0.3 m)에 약 12 점. */
const STRING_SAMPLES = 400;

// ---- 선 굵기(화면 px) ----
/** 기준 줄의 굵기. 다른 줄은 선밀도 비의 제곱근을 곱한다 — 같은 재질이면 μ ∝ 지름². */
const STRING_WIDTH_PX = 2;
/** 간 거리 막대. 줄보다 굵게 — 줄 아래에서 띠로 읽혀야 한다. */
const BAR_WIDTH_PX = 5;
/** 눈금 · 평형 안내선. */
const GUIDE_WIDTH_PX = 1;
/** 당김 화살표. */
const ARROW_WIDTH_PX = 2;

// ---- 짙기 ----
const BAR_OPACITY = 0.75;
const TICK_OPACITY = 0.8;

// ---- 크기 ----
/** 눈금 반 높이(월드 m) — 막대를 가운데 두고 위아래로. */
const TICK_HALF = 0.09;
/** 당김 화살표 머리(월드 m). */
const ARROW_HEAD = 0.14;
/** 줄 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;

/** 줄마다 이름표 문안 키와 끼울 배수. */
function laneLabel(
  s: StringMedium,
  c: ReturnType<typeof readConstants>,
): { key: WaveSpeedInMediumMessageKey; vars?: Record<string, string> } {
  if (s.id === 'taut') return { key: 'label.laneTaut', vars: { k: String(c.tensionFactor) } };
  if (s.id === 'heavy') return { key: 'label.laneHeavy', vars: { k: String(c.densityFactor) } };
  return { key: 'label.laneBase' };
}

export function scene(params: {
  state: WaveSpeedInMediumState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('wave-speed-in-medium: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const tau = raceTime(timeline);
  const alpha = markOpacity(timeline);
  const lanes = strings(c);
  const out: Primitive[] = [];

  // ---- 눈금 ----
  // 가장 느린 줄의 펄스가 경주 동안 가는 거리를 한 칸으로, 출발 자리부터 줄 끝까지 칸을 막대 높이에 긋는다.
  // 경주가 끝나면 막대 셋이 칸 네 개 · 두 개 · 한 개에서 멈춘다.
  const slowest = Math.min(...lanes.map(waveSpeed));
  const unit = slowest * raceEnd(timeline);
  const ticks: Vec2[][] = [];
  const tickCount = unit > 0 ? Math.floor((c.length - c.pulseStart) / unit + 1e-9) : 0;
  for (const s of lanes) {
    const y = LANE_Y[s.id] - BAR_GAP;
    for (let k = 0; k <= tickCount; k++) {
      const x = c.pulseStart + k * unit;
      ticks.push([
        [x, y - TICK_HALF],
        [x, y + TICK_HALF],
      ]);
    }
  }
  out.push({
    type: 'lineSet',
    id: 'ticks',
    lines: ticks,
    width: GUIDE_WIDTH_PX,
    opacity: TICK_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  for (const s of lanes) {
    const y0 = LANE_Y[s.id];
    const xc = pulseCenter(s, tau, c);

    // ---- 펄스가 간 거리 ----
    const barEnd = Math.min(xc, c.length);
    if (barEnd > c.pulseStart) {
      out.push({
        type: 'trajectory',
        id: `bar-${s.id}`,
        points: [
          [c.pulseStart, y0 - BAR_GAP],
          [barEnd, y0 - BAR_GAP],
        ],
        width: BAR_WIDTH_PX,
        opacity: BAR_OPACITY * alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }

    // ---- 줄 ----
    // 흐려지는 단계에서는 펄스가 잦아들어 다음 주기의 출발로 튀지 않게 한다.
    const pts: Vec2[] = [];
    for (let i = 0; i <= STRING_SAMPLES; i++) {
      const x = (c.length * i) / STRING_SAMPLES;
      pts.push([x, y0 + alpha * displacement(x, xc, c)]);
    }
    out.push({
      type: 'trajectory',
      id: `string-${s.id}`,
      points: pts,
      width: STRING_WIDTH_PX * Math.sqrt(s.linearDensity / c.linearDensity),
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // ---- 벽 ----
    out.push({
      type: 'body',
      id: `wall-${s.id}`,
      pos: [-WALL_WIDTH / 2, y0],
      shape: 'rect',
      size: [WALL_WIDTH, 2 * WALL_HALF_HEIGHT],
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // ---- 당김 ----
    // 오른쪽 끝을 당기는 힘. 길이가 장력에 비례한다 — 위 줄의 화살표가 네 배 길다.
    out.push({
      type: 'vector',
      id: `pull-${s.id}`,
      from: [c.length + ARROW_GAP, y0],
      delta: [(ARROW_PER_TENSION * s.tension) / c.tension, 0],
      headSize: ARROW_HEAD,
      width: ARROW_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // ---- 이름표 ----
    const label = laneLabel(s, c);
    out.push({
      type: 'readout',
      id: `label-${s.id}`,
      anchor: { world: [LABEL_X, y0] },
      text: text(label.key),
      ...(label.vars ? { vars: label.vars } : {}),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: LABEL_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
