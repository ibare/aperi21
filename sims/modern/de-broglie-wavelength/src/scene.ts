// ========================================================================
// de-broglie-wavelength — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 물결 묶음(trajectory
// 표본) · 전자(body) · 흐르는 레인 눈금(lineSet) · 마루 안내선(trajectory 점선) ·
// 속도 화살표(vector) · 파장 치수선(dimension) · 기호(readout)가 모두 표준 어휘다.
//
// 색은 뜻마다 하나다 — 물결은 primary(두 레인이 같은 대상이라 같은 색), 전자는
// 먹색, 속도 화살표는 secondary, **강조색은 「파장」 한 가지 뜻에만**(치수선).
// 눈금 · 안내선은 배경 정보라 muted.
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
  readAccelerated,
  readConstants,
  readReference,
  sceneOpacity,
  wavelength,
  type DeBroglieConstants,
  type ElectronReading,
} from './physics';
import {
  ELECTRON_LABEL_X,
  ELECTRON_R,
  GUIDE_REACH,
  LANE_FAST_Y,
  LANE_REF_Y,
  MEASURE_DY,
  PACKET_AMP,
  PACKET_HALF,
  PACKET_SIGMA,
  SCENE_BOUNDS,
  SPEED_ARROW_SCALE,
  SPEED_ARROW_X,
  TRACK_DY,
  TRACK_GAP,
  TRACK_TICK,
  text,
} from './schema';
import type { DeBroglieWavelengthState } from './state';

/** 물결 묶음 하나의 표본 수. 가장 촘촘한 물결(λ/2)도 한 물결에 30 점 넘게 든다. */
const WAVE_SAMPLES = 480;
/** 물결 선 굵기(화면 px). 이 그림의 주인공이라 가장 굵다. */
const WAVE_WIDTH_PX = 2.4;
/** 레인 눈금 굵기(화면 px) · 짙기. 흐름만 읽히면 된다. */
const TRACK_WIDTH_PX = 1.5;
const TRACK_OPACITY = 0.6;
/** 마루 안내선 굵기(화면 px) · 짙기. 물결보다 한참 뒤로 물러나 있어야 한다. */
const GUIDE_WIDTH_PX = 1;
const GUIDE_OPACITY = 0.55;
/** 안내선이 물결 마루 위 · 골 아래로 삐져나가는 길이(월드). */
const GUIDE_OVERHANG = 0.08;
/** 기호 글자 크기(화면 px). */
const LABEL_PX = 14;
/** 화살표 이름표를 화살표 위로 띄우는 거리(화면 px, 위가 −). */
const ARROW_LABEL_GAP_PX = -13;

/** 한 레인의 선언 — 축 높이와 그 전자의 읽기. */
interface Lane {
  id: string;
  y: number;
  e: ElectronReading;
}

/** 가우스 포락선을 씌운 코사인 — 가운데(전자 자리)가 마루다. */
function packetPoints(y0: number, lambda: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i <= WAVE_SAMPLES; i++) {
    const x = -PACKET_HALF + (2 * PACKET_HALF * i) / WAVE_SAMPLES;
    const env = Math.exp(-(x * x) / (2 * PACKET_SIGMA * PACKET_SIGMA));
    pts.push([x, y0 + PACKET_AMP * env * Math.cos((2 * Math.PI * x) / lambda)]);
  }
  return pts;
}

/** 레인 눈금 — 전자가 지나온 만큼 뒤(왼쪽)로 흘러가 있다. 화면 가로를 감아 돈다. */
function trackTicks(y: number, travelled: number, c: DeBroglieConstants): Vec2[][] {
  const span = SCENE_BOUNDS.maxX - SCENE_BOUNDS.minX;
  const count = Math.floor(span / TRACK_GAP);
  const wrap = count * TRACK_GAP;
  const shift = travelled * c.trackFlow;
  const lines: Vec2[][] = [];
  for (let i = 0; i < count; i++) {
    const s = (((i * TRACK_GAP - shift) % wrap) + wrap) % wrap;
    const x = SCENE_BOUNDS.minX + s;
    lines.push([
      [x, y - TRACK_TICK / 2],
      [x, y + TRACK_TICK / 2],
    ]);
  }
  return lines;
}

export function scene(params: {
  state: DeBroglieWavelengthState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('de-broglie-wavelength: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const out: Primitive[] = [];

  const lanes: Lane[] = [
    { id: 'ref', y: LANE_REF_Y, e: readReference(timeline, c) },
    { id: 'fast', y: LANE_FAST_Y, e: readAccelerated(timeline, c) },
  ];
  const lambdaRef = wavelength(c.vSlow, c);
  const ratio = String(c.speedRatio);

  // ---- 흐르는 레인 눈금 ----
  // 카메라가 전자를 따라가므로 속력은 바닥이 뒤로 흐르는 빠르기로만 보인다.
  for (const lane of lanes) {
    out.push({
      type: 'lineSet',
      id: `track-${lane.id}`,
      lines: trackTicks(lane.y + TRACK_DY, lane.e.travelled, c),
      width: TRACK_WIDTH_PX,
      opacity: TRACK_OPACITY,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 위 물결의 마루 자리 안내선 ----
  // 두 레인을 세로로 꿴다. 처음에는 아래 마루도 여기에 한 개씩 걸리고, 다 빨라진
  // 뒤에는 이 선들 **사이에** 마루가 하나씩 더 생긴다 — 그것이 「절반」 이다.
  const guideTop = LANE_REF_Y + PACKET_AMP + GUIDE_OVERHANG;
  const guideBottom = LANE_FAST_Y - PACKET_AMP - GUIDE_OVERHANG;
  for (let n = -GUIDE_REACH; n <= GUIDE_REACH; n++) {
    out.push({
      type: 'trajectory',
      id: `guide-${n}`,
      points: [
        [n * lambdaRef, guideTop],
        [n * lambdaRef, guideBottom],
      ],
      width: GUIDE_WIDTH_PX,
      opacity: GUIDE_OPACITY * alpha,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  for (const lane of lanes) {
    const lambda = wavelength(lane.e.speed, c);

    // 물결 묶음. 두 레인이 같은 색 · 같은 폭 · 같은 높이다 — 다른 것은 간격뿐이다.
    out.push({
      type: 'trajectory',
      id: `wave-${lane.id}`,
      points: packetPoints(lane.y, lambda),
      width: WAVE_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });

    // 전자. 둘이 같은 크기 · 같은 색이다 — 같은 입자다.
    out.push({
      type: 'body',
      id: `electron-${lane.id}`,
      pos: [0, lane.y],
      shape: 'circle',
      size: ELECTRON_R,
      glow: false,
      outline: 'background',
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `electron-label-${lane.id}`,
      anchor: { world: [ELECTRON_LABEL_X, lane.y] },
      text: text('label.electron'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // 속도 화살표. 물결 묶음 앞에서 나는 방향을 가리키고, 길이가 속력에 비례한다.
    const arrowLen = lane.e.speed * SPEED_ARROW_SCALE;
    out.push({
      type: 'vector',
      id: `speed-${lane.id}`,
      from: [SPEED_ARROW_X, lane.y],
      delta: [arrowLen, 0],
      opacity: alpha,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
    // 기호는 속력이 정박값에 있을 때만 붙인다 — 자라는 화살표에 `2v` 가 붙어 있으면 거짓이다.
    if (lane.e.settled) {
      const fast = lane.e.settled === 'end';
      out.push({
        type: 'readout',
        id: `speed-label-${lane.id}`,
        anchor: { world: [SPEED_ARROW_X + arrowLen / 2, lane.y], offset: [0, ARROW_LABEL_GAP_PX] },
        text: text(fast ? 'label.speedFast' : 'label.speedRef'),
        vars: fast ? { k: ratio } : undefined,
        chip: false,
        font: 'text',
        italic: true,
        fontSize: LABEL_PX,
        opacity: alpha,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
    }

    // 파장 치수선. 전자 자리의 마루에서 다음 마루까지. 속력이 정박값에 있을 때만 잰다.
    // 다 빨라진 아래 레인은 위 λ 한 칸을 λ/k 칸 k 개로 잇대어 잰다.
    if (lane.e.settled) {
      const y = lane.y + MEASURE_DY;
      const fast = lane.e.settled === 'end' && c.speedRatio > 1;
      const cells = fast ? Math.round(c.speedRatio) : 1;
      for (let i = 0; i < cells; i++) {
        out.push({
          type: 'dimension',
          id: `lambda-${lane.id}-${i}`,
          from: [i * lambda, y],
          to: [(i + 1) * lambda, y],
          text: text(fast ? 'label.lambdaFast' : 'label.lambdaRef'),
          vars: fast ? { k: ratio } : undefined,
          opacity: alpha,
          style: { colorRole: 'accent', emphasis: 'strong' },
        });
      }
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
