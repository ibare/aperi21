// ========================================================================
// ideal-gas-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽은 장치 — 막힌 실린더(surface) · 기체 기둥(region) · 분자(particleSystem) ·
// 피스톤과 막대(body) · 미는 손(vector) · 데우는 판(region).
// 오른쪽은 셈 — P · V · T 막대(region) 셋, 처음 높이 기준선(trajectory 점선),
// 붙든 양의 자물쇠(body custom), 따라간 배수 글자(readout).
//
// 색은 뜻마다 하나다. 막대 셋은 같은 색이다 — 셋 다 「처음 값에 대한 배수」 라는
// 같은 것을 재고, 무엇인지는 아래 기호가 말한다 (S-piece — 색으로 설명하지 않는다).
// 기체(기둥과 분자)는 secondary, **강조색은 「열이 들어간다」 한 뜻에만** (데우는 판).
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
  gasLength,
  heating,
  pressureStep,
  pushing,
  readConstants,
  readGas,
  readMolecules,
  temperatureStep,
  volumeStep,
  type StepVisibility,
} from './physics';
import {
  BAR_CENTERS,
  BAR_WIDTH,
  CYLINDER,
  HEATER,
  LOCK_GAP,
  MOLECULE_MARGIN,
  PISTON_THICKNESS,
  REFERENCE_OVERHANG,
  ROD_LENGTH,
  ROD_THICKNESS,
  SCENE_BOUNDS,
  text,
  type IdealGasLawMessageKey,
} from './schema';
import type { IdealGasLawState } from './state';

/** 분자 점 반지름(화면 px). */
const MOLECULE_PX = 2.6;
/** 분자 자취 — 속도 × 이 시간(초)만큼의 획, 굵기(화면 px), 짙기. */
const TRAIL_SECONDS = 0.16;
const TRAIL_WIDTH_PX = 1.4;
const TRAIL_OPACITY = 0.45;
/** 기체 기둥의 옅은 칠. 분자가 비쳐 보여야 한다. */
const GAS_FILL = 0.1;
/** 막대 채움의 짙기. 윗면 한 줄이 또렷하고 안은 옅다. */
const BAR_FILL = 0.35;
/** 데우는 판 — 꺼져 있을 때의 결 · 켜졌을 때의 칠. */
const HEATER_IDLE_FILL = 0.3;
const HEATER_ON_FILL = 0.85;
/** 처음 높이 기준선 굵기(화면 px) · 짙기. 재는 선이라 가늘고 물러나 있다. */
const REFERENCE_WIDTH_PX = 1;
const REFERENCE_OPACITY = 0.7;
/** 미는 손 화살표 길이 · 피스톤 막대 끝에서 띄운 거리(월드). */
const PUSH_ARROW_LEN = 0.55;
const PUSH_ARROW_GAP = 0.06;
/** 피스톤이 실린더 벽과 닿지 않게 줄이는 틈(월드). */
const PISTON_CLEARANCE = 0.03;
/** 막대 이름표 · 배수 글자 크기(화면 px)와 막대에서 띄운 거리(화면 px). */
const BAR_LABEL_PX = 15;
const BAR_LABEL_GAP_PX = 14;
const RESULT_PX = 14;
const RESULT_GAP_PX = 12;

/**
 * 자물쇠 모양 — 몸통 사각형 + 고리. `body` custom 경로라 좌표는 자물쇠 가운데 기준
 * 월드 단위, y 위다. 자물쇠 표식 어휘가 없어 경로로 그린다 (NOTES 「어휘 부족」).
 */
const LOCK_PATH =
  'M -0.14 -0.11 H 0.14 V 0.09 H -0.14 Z ' +
  'M -0.1 0.09 V 0.16 A 0.1 0.1 0 0 0 0.1 0.16 V 0.09 H 0.055 V 0.16 A 0.055 0.055 0 0 1 -0.055 0.16 V 0.09 Z';

/** 막대 하나 — 가운데 x, 지금 비, 이름표, 따라간 배수 글자. */
interface Bar {
  id: 'p' | 'v' | 't';
  x: number;
  ratio: number;
  label: IdealGasLawMessageKey;
  /** 이 막대에 자물쇠를 거는 단계. */
  lock: StepVisibility;
  /** 이 막대가 따라가거나 바뀐 단계들 — 배수 글자와 그 값. */
  results: { vis: StepVisibility; key: IdealGasLawMessageKey; k: string }[];
}

function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

export function scene(params: {
  state: IdealGasLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('ideal-gas-law: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const g = readGas(tl, c);
  const out: Primitive[] = [];

  const length = gasLength(g.volume, c);
  const pistonLeft = CYLINDER.left + length;
  const pistonRight = pistonLeft + PISTON_THICKNESS;
  const midY = (CYLINDER.bottom + CYLINDER.top) / 2;

  // ---- 기체 기둥 ----
  // 막힌 벽에서 피스톤까지. 이 칸의 길이가 곧 부피다.
  out.push({
    type: 'region',
    id: 'gas',
    points: rect(CYLINDER.left, CYLINDER.bottom, pistonLeft, CYLINDER.top),
    fillOpacity: GAS_FILL,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ---- 분자 ----
  // 배경이다 — 압력이 두드림이라는 것은 이웃 `gas-pressure` 가 말한다. 여기서는 부피를
  // 줄이면 같은 분자가 좁은 칸에 몰리고, 데우면 자취(= 속력)가 길어지는 것만 보인다.
  const field = readMolecules(state.molecules, tl, c, g, {
    left: CYLINDER.left,
    bottom: CYLINDER.bottom,
    top: CYLINDER.top,
    length,
    margin: MOLECULE_MARGIN,
  });
  out.push({
    type: 'particleSystem',
    id: 'molecules',
    positions: field.positions,
    velocities: field.velocities,
    sizes: MOLECULE_PX,
    trail: true,
    trailStyle: { seconds: TRAIL_SECONDS, width: TRAIL_WIDTH_PX, opacity: TRAIL_OPACITY },
    // 벽에서 막 튕긴 분자의 자취가 벽 너머로 새지 않게 기체 기둥 안에만 그린다.
    clip: { min: [CYLINDER.left, CYLINDER.bottom], max: [pistonLeft, CYLINDER.top] },
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ---- 피스톤과 막대 ----
  out.push({
    type: 'body',
    id: 'piston',
    pos: [(pistonLeft + pistonRight) / 2, midY],
    shape: 'rect',
    size: [PISTON_THICKNESS, CYLINDER.top - CYLINDER.bottom - 2 * PISTON_CLEARANCE],
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'piston-rod',
    pos: [pistonRight + ROD_LENGTH / 2, midY],
    shape: 'rect',
    size: [ROD_LENGTH, ROD_THICKNESS],
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 실린더 ----
  // 막힌 왼쪽 벽과 위 · 아래 벽. 오른쪽은 열려 피스톤이 드나든다.
  out.push({
    type: 'surface',
    id: 'wall-left',
    geometry: { kind: 'wall', from: [CYLINDER.left, CYLINDER.top], to: [CYLINDER.left, CYLINDER.bottom] },
    material: 'solid',
  });
  out.push({
    type: 'surface',
    id: 'wall-top',
    geometry: { kind: 'wall', from: [CYLINDER.left, CYLINDER.top], to: [CYLINDER.end, CYLINDER.top] },
    material: 'solid',
  });
  out.push({
    type: 'surface',
    id: 'wall-bottom',
    geometry: { kind: 'wall', from: [CYLINDER.left, CYLINDER.bottom], to: [CYLINDER.end, CYLINDER.bottom] },
    material: 'solid',
  });

  // ---- 미는 손 ----
  // 부피를 줄이는 단계에만 있다. 피스톤 막대 끝을 왼쪽으로 민다.
  if (pushing(tl)) {
    const tip = pistonRight + ROD_LENGTH + PUSH_ARROW_GAP;
    out.push({
      type: 'vector',
      id: 'push',
      from: [tip + PUSH_ARROW_LEN, midY],
      delta: [-PUSH_ARROW_LEN, 0],
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 데우는 판 ----
  // 늘 결로 깔려 있고, 온도를 올리는 단계에만 강조색으로 켜진다.
  const plate = rect(
    CYLINDER.left + HEATER.inset,
    HEATER.bottom,
    CYLINDER.end - HEATER.inset,
    HEATER.top,
  );
  out.push({
    type: 'region',
    id: 'heater',
    points: plate,
    fill: 'hatch',
    fillOpacity: HEATER_IDLE_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  if (heating(tl)) {
    out.push({
      type: 'region',
      id: 'heater-on',
      points: plate,
      fillOpacity: HEATER_ON_FILL,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- P · V · T 막대 ----
  const tStep = temperatureStep(tl);
  const pStep = pressureStep(tl);
  const vStep = volumeStep(tl);
  const bars: Bar[] = [
    {
      id: 'p',
      x: BAR_CENTERS.p,
      ratio: g.pRatio,
      label: 'label.pressure',
      lock: pStep,
      results: [
        { vis: tStep, key: 'label.times', k: state.k1 },
        { vis: vStep, key: 'label.times', k: state.k3 },
      ],
    },
    {
      id: 'v',
      x: BAR_CENTERS.v,
      ratio: g.vRatio,
      label: 'label.volume',
      lock: vStep,
      results: [
        { vis: tStep, key: 'label.timesInverse', k: state.k1 },
        { vis: pStep, key: 'label.times', k: state.k2 },
      ],
    },
    {
      id: 't',
      x: BAR_CENTERS.t,
      ratio: g.tRatio,
      label: 'label.temperature',
      lock: tStep,
      results: [
        { vis: pStep, key: 'label.times', k: state.k2 },
        { vis: vStep, key: 'label.times', k: state.k3 },
      ],
    },
  ];

  const base = CYLINDER.bottom;
  for (const bar of bars) {
    const top = base + bar.ratio * c.barUnit;
    const x0 = bar.x - BAR_WIDTH / 2;
    const x1 = bar.x + BAR_WIDTH / 2;
    out.push({
      type: 'region',
      id: `bar-${bar.id}`,
      points: rect(x0, base, x1, top),
      fillOpacity: BAR_FILL,
      // 바닥선과 윗면만 긋는다. 옆선을 그으면 상자가 되어 눈금틀처럼 읽힌다.
      outline: [
        [0, 1],
        [2, 3],
      ],
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // 처음 높이(비 1) 기준선. 세 막대를 한 줄로 꿰어 「처음보다 몇 배」 를 읽게 한다.
  const firstX = BAR_CENTERS.p - BAR_WIDTH / 2 - REFERENCE_OVERHANG;
  const lastX = BAR_CENTERS.t + BAR_WIDTH / 2 + REFERENCE_OVERHANG;
  const refY = base + c.barUnit;
  out.push({
    type: 'trajectory',
    id: 'reference',
    points: [
      [firstX, refY],
      [lastX, refY],
    ],
    width: REFERENCE_WIDTH_PX,
    opacity: REFERENCE_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });

  for (const bar of bars) {
    const top = base + bar.ratio * c.barUnit;

    // 막대 이름 — 기호다.
    out.push({
      type: 'readout',
      id: `bar-label-${bar.id}`,
      anchor: { world: [bar.x, base], offset: [0, BAR_LABEL_GAP_PX] },
      text: text(bar.label),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: BAR_LABEL_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // 자물쇠 — 붙든 막대 위에. 거는 단계 동안 나타나고 되돌리는 동안 사라진다.
    if (bar.lock.lock > 0) {
      out.push({
        type: 'body',
        id: `lock-${bar.id}`,
        pos: [bar.x, top + LOCK_GAP],
        shape: 'custom',
        customPath: LOCK_PATH,
        opacity: bar.lock.lock,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }

    // 배수 글자 — 바뀌기가 끝난 뒤, 바뀐 두 막대 위에. 값은 선언값 그대로다.
    bar.results.forEach((r, i) => {
      if (r.vis.result <= 0) return;
      out.push({
        type: 'readout',
        id: `result-${bar.id}-${i}`,
        anchor: { world: [bar.x, top], offset: [0, -RESULT_GAP_PX] },
        text: text(r.key),
        vars: { k: r.k },
        chip: false,
        font: 'text',
        fontSize: RESULT_PX,
        weight: 'bold',
        opacity: r.vis.result,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
