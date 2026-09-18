// ========================================================================
// floating-and-draft — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 물통(trajectory) · 상자(body) ·
// 물(region) · 무게와 떠받치는 힘(vector) · 이름표(readout).
//
// 색은 뜻마다 하나다 — 세 상자는 같은 muted(재료를 색으로 가르지 않는다, 밀도는 이름표 수가
// 말한다), 물은 secondary, 무게는 먹색. **강조색은 「밀어낸 물의 무게 = 떠받치는 힘」 한 가지
// 뜻에만** 쓴다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LocalizedText,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  ViewDef,
} from '@aperi21/schema';
import { equilibriumDraft, readConstants, readDraft, sceneOpacity } from './physics';
import type { FloatingAndDraftConstants } from './physics';
import {
  BLOCK_XS,
  FLUID_LABEL_X,
  FLUID_LABEL_Y,
  MATERIAL_LABEL_Y,
  SCENE_BOUNDS,
  TANK_FLOOR_Y,
  TANK_HALF_WIDTH,
  TANK_RIM_Y,
  text,
} from './schema';
import type { FloatingAndDraftState } from './state';

/** 물의 짙기 — 맑은 물 · 진한 소금물. 같은 물이 진해지는 것을 형태(짙기)로만 보인다. 색은 그대로다. */
const WATER_FILL = 0.28;
const SALT_FILL = 0.4;
/** 수면 일렁임(화면 px). */
const RIPPLE_PX = 1.2;
/** 물통 벽 굵기(화면 px). */
const WALL_WIDTH = 2;
/** 힘 화살표 굵기(화면 px). */
const FORCE_WIDTH = 3;
/**
 * 떠받치는 힘 화살표를 선언하는 최소 길이(월드 m). 이보다 짧으면 화살촉이 길이의 0.35 로 줄어
 * 방향 없는 눈금으로 읽힌다(장부 G02). 그래서 막 잠기기 시작한 순간은 그리지 않는다.
 */
const MIN_FORCE = 0.1;
/**
 * 두 힘 화살표를 상자 가운데에서 좌우로 비키는 거리(월드 m). 한 점에서 마주 뻗으면 한 줄의 양끝 화살표로
 * 읽혀 두 힘의 길이를 견줄 수 없다. 꼬리를 같은 높이에 나란히 두어 길이가 같은지를 대칭으로 본다.
 */
const FORCE_SPLIT = 0.13;
/** 맑은 물에서 잠겼던 선(화면 px 굵기). 소금물에서 상자가 떠오르며 이 선이 물 밖으로 올라온다. */
const MARK_WIDTH = 1.5;
/** 두 힘 이름표를 상자 오른쪽 면에서 띄우는 거리(화면 px) · 글자 크기. */
const FORCE_LABEL_GAP = 6;
const FORCE_LABEL_PX = 12;
/** 상자 · 물 이름표 글자 크기(화면 px). */
const MATERIAL_LABEL_PX = 13;
const FLUID_LABEL_PX = 12;

/** 상자 셋 — 이름표 문안 키와 밀도를 고르는 상수 이름. 줄마다의 값은 스테이지 상수다(장부 G105). */
const BLOCKS: readonly {
  id: string;
  label: 'label.cork' | 'label.wood' | 'label.ice';
  rho: (c: FloatingAndDraftConstants) => number;
}[] = [
  { id: 'cork', label: 'label.cork', rho: (c) => c.rhoCork },
  { id: 'wood', label: 'label.wood', rho: (c) => c.rhoWood },
  { id: 'ice', label: 'label.ice', rho: (c) => c.rhoIce },
];
/** 두 힘에 이름을 다는 상자 — 화살표가 가장 길어 이름 자리가 있는 얼음. */
const NAMED_BLOCK = 'ice';

/** 밀도 이름표 — 선언된 자릿수(`densityDigits`)로 쓴다. 코드가 자릿수를 정하지 않는다 (S-piece 유효숫자). */
function density(v: number, digits: number): string {
  return v.toFixed(digits);
}

export function scene(params: {
  state: FloatingAndDraftState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('floating-and-draft: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const salt = timeline.at('salt');
  const out: Primitive[] = [];

  const halfW = c.blockWidth / 2;
  const k = c.forceScale;
  const readings = BLOCKS.map((b) => readDraft(b.rho(c), timeline, c));

  // ---- 물통 ----
  out.push({
    type: 'trajectory',
    id: 'tank',
    points: [
      [-TANK_HALF_WIDTH, TANK_RIM_Y],
      [-TANK_HALF_WIDTH, TANK_FLOOR_Y],
      [TANK_HALF_WIDTH, TANK_FLOOR_Y],
      [TANK_HALF_WIDTH, TANK_RIM_Y],
    ],
    width: WALL_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 상자 셋 ---- 물보다 먼저 선언해 물이 잠긴 몫 위에 덮인다. 같은 크기 · 같은 색이다.
  BLOCKS.forEach((b, i) => {
    const x = BLOCK_XS[i] ?? 0;
    const yBottom = -readings[i]!.draft;
    out.push({
      type: 'body',
      id: `block-${b.id}`,
      pos: [x, yBottom + c.blockHeight / 2],
      shape: 'rect',
      size: [c.blockWidth, c.blockHeight],
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  });

  // ---- 물 ---- 소금물로 진해지는 동안 짙기만 오른다.
  out.push({
    type: 'region',
    id: 'water',
    points: [
      [-TANK_HALF_WIDTH, 0],
      [TANK_HALF_WIDTH, 0],
      [TANK_HALF_WIDTH, TANK_FLOOR_Y],
      [-TANK_HALF_WIDTH, TANK_FLOOR_Y],
    ],
    ripple: { edge: [0, 1], amplitude: RIPPLE_PX },
    fillOpacity: WATER_FILL + (SALT_FILL - WATER_FILL) * salt,
    style: { colorRole: 'secondary', emphasis: 'medium' },
  });

  // ---- 맑은 물에서 잠겼던 선 ---- 상자에 붙어 함께 움직인다. 물이 진해지는 동안 나타나, 상자가
  // 떠오르며 이 선이 수면 위로 올라오는 것으로 「덜 잠긴다」 를 보인다.
  if (salt > 0) {
    BLOCKS.forEach((b, i) => {
      const x = BLOCK_XS[i] ?? 0;
      const y = -readings[i]!.draft + equilibriumDraft(b.rho(c), c.rhoWater, c);
      out.push({
        type: 'trajectory',
        id: `fresh-line-${b.id}`,
        points: [
          [x - halfW, y],
          [x + halfW, y],
        ],
        width: MARK_WIDTH,
        opacity: alpha * salt,
        style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
      });
    });
  }

  // ---- 두 힘 ---- 상자 가운데 높이에서 무게는 아래로(왼쪽), 밀어낸 물의 무게는 위로(오른쪽).
  // 같은 배율이라 위 화살표가 아래 화살표만큼 자란 순간 상자가 멈춘다.
  BLOCKS.forEach((b, i) => {
    const x = BLOCK_XS[i] ?? 0;
    const r = readings[i]!;
    const yCenter = -r.draft + c.blockHeight / 2;
    const weightLen = k * r.weight;
    const liftLen = k * r.lift;
    out.push({
      type: 'vector',
      id: `weight-${b.id}`,
      from: [x - FORCE_SPLIT, yCenter],
      delta: [0, -weightLen],
      width: FORCE_WIDTH,
      outline: 'background',
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    if (liftLen >= MIN_FORCE) {
      out.push({
        type: 'vector',
        id: `lift-${b.id}`,
        from: [x + FORCE_SPLIT, yCenter],
        delta: [0, liftLen],
        width: FORCE_WIDTH,
        outline: 'background',
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }

    if (b.id === NAMED_BLOCK) {
      // 이름은 화살표 끝 높이, 상자 오른쪽 면 바깥에 둔다 — 화살표 축과 상자를 가리지 않는다.
      out.push({
        type: 'readout',
        id: 'weight-label',
        anchor: { world: [x + halfW, yCenter - weightLen], offset: [FORCE_LABEL_GAP, 0] },
        text: text('label.weight'),
        chip: false,
        font: 'text',
        weight: 'bold',
        fontSize: FORCE_LABEL_PX,
        align: 'left',
        opacity: alpha,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      if (liftLen >= MIN_FORCE) {
        out.push({
          type: 'readout',
          id: 'lift-label',
          anchor: { world: [x + halfW, yCenter + liftLen], offset: [FORCE_LABEL_GAP, 0] },
          text: text('label.lift'),
          chip: false,
          font: 'text',
          weight: 'bold',
          fontSize: FORCE_LABEL_PX,
          align: 'left',
          opacity: alpha,
          style: { colorRole: 'accent', emphasis: 'strong' },
        });
      }
    }
  });

  // ---- 상자 이름표 ---- 재료와 밀도. 물통 바닥 아래 제자리 — 상자가 움직여도 그대로다.
  BLOCKS.forEach((b, i) => {
    out.push({
      type: 'readout',
      id: `name-${b.id}`,
      anchor: { world: [BLOCK_XS[i] ?? 0, MATERIAL_LABEL_Y] },
      text: text(b.label),
      vars: { rho: density(b.rho(c), c.densityDigits) },
      chip: false,
      font: 'text',
      fontSize: MATERIAL_LABEL_PX,
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  });

  // ---- 물 이름표 ---- 소금물 단계의 앞 절반에 맑은 물 이름이 흐려지고, 뒤 절반에 소금물 이름이
  // 나타난다. 같은 자리에서 겹쳐 읽히지 않게 둘의 시간을 가른다 (장부 G109).
  const saltStart = timeline.start('salt');
  const saltMid = saltStart + timeline.duration('salt') / 2;
  const saltEnd = timeline.end('salt');
  const fluidLabel = (id: string, t: LocalizedText, rho: number, opacity: number): void => {
    if (opacity <= 0) return;
    out.push({
      type: 'readout',
      id,
      anchor: { world: [FLUID_LABEL_X, FLUID_LABEL_Y] },
      text: t,
      vars: { rho: density(rho, c.densityDigits) },
      chip: false,
      font: 'text',
      fontSize: FLUID_LABEL_PX,
      align: 'left',
      opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  };
  fluidLabel('fluid-water', text('label.water'), c.rhoWater, 1 - timeline.span(saltStart, saltMid));
  fluidLabel('fluid-salt', text('label.salt'), c.rhoSalt, timeline.span(saltMid, saltEnd));
  // 물의 밀도가 바뀌는 것은 짙기와 이름표가 말한다. 지나는 값(1.07 …)은 두지 않는다 — NOTES (b).

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
