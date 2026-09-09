import type {
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { pressureIsotropyText } from './schema';
import { deriveForce, isSweepComplete, plateNormal, toRadians } from './physics';
import type { PressureIsotropyState } from './state';

// ========================================================================
// 그리지 않는다, 선언한다 (S-sim). 여기 있는 수는 전부 **그림의 치수**이고,
// 물리 값은 physics 가 stage 상수로부터 계산한 것만 쓴다.
// ========================================================================

/**
 * 그림 좌표. **1 단위 = 0.1 m.**
 *
 * 장면을 미터 그대로 선언할 수 없다. 호스트 카메라의 배율 상한이 400 px/m 라
 * 20 cm 짜리 장면은 세로 80 px 로 쪼그라든다. 그래서 이 파일의 좌표는 물리
 * 좌표가 아니라 표시 좌표이고, 축척은 아래 한 곳에서만 정해진다.
 *
 * 판도 실제 크기가 아니다 — 1 cm² 짜리 판을 깊이 20 cm 옆에 실척으로 그리면
 * 점 하나가 된다. 판의 크기는 읽히기 위한 치수이고, 판이 받는 힘의 **길이만**
 * 물리에서 온다.
 */
const UNITS_PER_METER = 10;

const LAYOUT = {
  /** 판의 길이 · 두께 (표시 치수). */
  plateLength: 0.8,
  plateThickness: 0.08,
  /**
   * 힘 화살표의 길이 축척. 0.196 N 이 0.50 단위가 되도록 잡았다.
   * **화살표 길이는 이 축척과 |F| 의 곱이 전부다.** 각도는 길이에 끼어들지
   * 않는다 — 그것이 자취를 원으로 만든다.
   */
  forceUnitsPerNewton: 2.551,
  /** 판 면과 화살촉 사이 여백. */
  faceGap: 0.12,
  /** 깊이 눈금의 x 위치. */
  rulerX: -1.0,
  /** 자취를 찍는 간격(도). */
  trailStepDeg: 3,
} as const;

/** 화살표 꼬리가 놓이는 반지름. |F| 가 일정하면 이것도 일정하다. */
function tailRadius(forceMagnitude: number): number {
  return LAYOUT.faceGap + LAYOUT.forceUnitsPerNewton * forceMagnitude;
}

function scaleVec(v: Vec2, k: number): Vec2 {
  return [v[0] * k, v[1] * k];
}

/** 자취 위의 한 점 — 각 thetaDeg 에서 side 쪽 화살표 꼬리가 있던 자리. */
function tailPoint(thetaDeg: number, side: 1 | -1, radius: number): Vec2 {
  return scaleVec(plateNormal(toRadians(thetaDeg)), side * radius);
}

/** 0° 부터 sweptDeg 까지 찍은 꼬리 자취. */
function trailPoints(sweptDeg: number, side: 1 | -1, radius: number): Vec2[] {
  const points: Vec2[] = [];
  for (let deg = 0; deg < sweptDeg; deg += LAYOUT.trailStepDeg) {
    points.push(tailPoint(deg, side, radius));
  }
  points.push(tailPoint(sweptDeg, side, radius));
  return points;
}

export function scene(params: {
  state: PressureIsotropyState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
}): SceneGraph {
  const { state } = params;

  const thetaRad = toRadians(state.plate.thetaDeg);
  const force = deriveForce(state.setup, thetaRad);
  const done = isSweepComplete(state);

  const waterY = state.setup.depth * UNITS_PER_METER;
  const normal = plateNormal(thetaRad);
  const radius = tailRadius(force.magnitude);
  const armLength = LAYOUT.forceUnitsPerNewton * force.magnitude;

  const items: Primitive[] = [
    // ---- 물 ----
    {
      type: 'surface',
      id: 'water-surface',
      geometry: { kind: 'ground', y: waterY },
      material: 'transparent',
    },
    {
      type: 'marker',
      id: 'water-label',
      kind: 'annotation',
      pos: [0.95, waterY - 0.14],
      text: pressureIsotropyText.water,
      style: { colorRole: 'muted' },
    },
    {
      type: 'marker',
      id: 'conditions',
      kind: 'annotation',
      pos: [-1.45, waterY + 0.42],
      text: pressureIsotropyText.conditions,
      style: { colorRole: 'muted' },
    },

    // ---- 깊이 ----
    {
      type: 'vector',
      id: 'depth-ruler',
      from: [LAYOUT.rulerX, waterY],
      delta: [0, -waterY],
      label: pressureIsotropyText.depth,
      style: { colorRole: 'muted', emphasis: 'medium' },
    },
    {
      type: 'marker',
      id: 'pressure',
      kind: 'annotation',
      pos: [-0.55, 1.0],
      text: pressureIsotropyText.pressure,
      style: { colorRole: 'secondary' },
    },

    // ---- 꼬리 자취 ----
    // 판이 돌아온 만큼만 있다. |F| 가 각도를 타면 이 자취는 찌그러진다.
    ...trailPrimitives(state.sweptDeg, radius, done),

    // ---- 판 ----
    {
      type: 'body',
      id: 'plate',
      pos: [0, 0],
      shape: 'rect',
      size: [LAYOUT.plateLength, LAYOUT.plateThickness],
      orientation: thetaRad,
      style: { colorRole: 'primary', emphasis: 'strong' },
    },

    // ---- 두 면이 받는 힘 ----
    // 꼬리는 반지름 `radius` 위에, 화살촉은 판 면 바로 바깥에 놓인다.
    // 방향은 각도를 타고 돌지만 길이는 |F| 하나로만 정해진다.
    forceArrow('force-front', normal, 1, radius, armLength),
    forceArrow('force-back', normal, -1, radius, armLength),

    // ---- 이 조각이 하는 말 ----
    {
      type: 'marker',
      id: 'area-and-force',
      kind: 'annotation',
      pos: [-1.45, -0.78],
      text: pressureIsotropyText.areaAndForce,
      style: { colorRole: 'accent' },
    },
    {
      type: 'marker',
      id: 'claim',
      kind: 'annotation',
      pos: [-1.45, -0.98],
      text: pressureIsotropyText.claim,
      style: { colorRole: 'muted' },
      highlight: done ? 'focused' : 'normal',
    },
  ];

  // 자취가 원으로 닫힌 뒤에야 그 사실을 말한다.
  if (done) {
    items.push({
      type: 'marker',
      id: 'trail-done',
      kind: 'annotation',
      pos: [radius + 0.14, 0.18],
      text: pressureIsotropyText.trailDone,
      style: { colorRole: 'accent' },
      highlight: 'focused',
    });
  }

  return items;
}

function forceArrow(
  id: string,
  normal: Vec2,
  side: 1 | -1,
  radius: number,
  armLength: number,
): Primitive {
  return {
    type: 'vector',
    id,
    from: scaleVec(normal, side * radius),
    delta: scaleVec(normal, -side * armLength),
    label: pressureIsotropyText.forceSymbol,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
}

function trailPrimitives(sweptDeg: number, radius: number, done: boolean): Primitive[] {
  if (sweptDeg <= 0) return [];
  const sides: (1 | -1)[] = [1, -1];
  return sides.map((side, i): Primitive => ({
    type: 'trajectory',
    id: `tail-trail-${i}`,
    points: trailPoints(sweptDeg, side, radius),
    // 도는 동안은 꼬리가 흐려지며 쌓이는 것이 보이고, 다 돌고 나면 흐림을 걷어
    // 원 하나로 굳는다.
    style: {
      colorRole: 'secondary',
      emphasis: done ? 'strong' : 'medium',
      fade: done ? 'none' : 'tail',
    },
    highlight: done ? 'focused' : 'normal',
  }));
}
