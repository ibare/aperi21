import type { Bounds, EnvironmentDef, OpticalElement, StageDef, Vec2 } from '@aperi21/schema';
import { findImage } from '@aperi21/plugin-optics';
import type { RayTracingState } from './state';

/**
 * stage.constants.subtype 에 따라 요소 종류 결정.
 *   1 = lens-convex, 2 = lens-concave, 3 = mirror-flat.
 */
function subtypeOf(stage: StageDef): OpticalElement['subtype'] {
  switch (stage.constants.subtype) {
    case 1:
      return 'lens-convex';
    case 2:
      return 'lens-concave';
    case 3:
    default:
      return 'mirror-flat';
  }
}

function buildElement(stage: StageDef, focalLength: number): OpticalElement {
  const subtype = subtypeOf(stage);
  const isLens = subtype === 'lens-convex' || subtype === 'lens-concave';
  return {
    id: 'el1',
    type: 'opticalElement',
    subtype,
    pos: [0, 0],
    orientation: Math.PI / 2, // 법선이 +x 를 향하도록 (수직 평면)
    size: 10,
    focalLength: isLens ? focalLength : Math.abs(focalLength),
  };
}

function buildThreeRays(source: Vec2, element: OpticalElement, focalLength: number) {
  // 주요 광선: (1) 광축 평행 (2) 중심 통과 (3) 초점 통과.
  const axis: Vec2 = [Math.cos(element.orientation), Math.sin(element.orientation)];
  // 렌즈 수직 평면 위의 두 초점
  const F1: Vec2 = [element.pos[0] - axis[0] * focalLength, element.pos[1] - axis[1] * focalLength];
  return [
    {
      id: 'r1',
      origin: source,
      // 광축 평행 — axis 방향. 실제 배치상 source 가 렌즈의 앞쪽(−axis) 에 있다고 가정.
      direction: axis,
      wavelength: 550,
    },
    {
      id: 'r2',
      origin: source,
      direction: norm2(sub2(element.pos, source)),
      wavelength: 550,
    },
    {
      id: 'r3',
      origin: source,
      direction: norm2(sub2(F1, source)),
      wavelength: 550,
    },
  ];
}

function sub2(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}
function norm2(v: Vec2): Vec2 {
  const L = Math.hypot(v[0], v[1]);
  if (L < 1e-9) return [1, 0];
  return [v[0] / L, v[1] / L];
}

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): RayTracingState {
  const { values, stage } = params;
  const focalLength = values.focalLength ?? 8;
  const element = buildElement(stage, focalLength);
  // 광원은 렌즈 중심에서 축의 −방향으로 objectDistance 만큼, 광축 수직으로 height.
  const axis: Vec2 = [Math.cos(element.orientation), Math.sin(element.orientation)];
  const perp: Vec2 = [-axis[1], axis[0]];
  const source: Vec2 = [
    element.pos[0] - axis[0] * (values.objectDistance ?? 20) + perp[0] * (values.objectHeight ?? 3),
    element.pos[1] - axis[1] * (values.objectDistance ?? 20) + perp[1] * (values.objectHeight ?? 3),
  ];
  return {
    element,
    sourcePos: source,
    rays: buildThreeRays(source, element, focalLength),
    image: findImage(source, element),
  };
}

export function step(params: { state: RayTracingState }): RayTracingState {
  // 시간 모델이 static 이므로 상태 전진은 없다. 파라미터 변경은 initialState 로 재빌드됨.
  return params.state;
}

export function boundsHint(state: RayTracingState): Bounds {
  const xs = [state.element.pos[0], state.sourcePos[0]];
  const ys = [state.element.pos[1], state.sourcePos[1]];
  if (state.image) {
    xs.push(state.image.position[0]);
    ys.push(state.image.position[1]);
  }
  const minX = Math.min(...xs) - 6;
  const maxX = Math.max(...xs) + 6;
  const minY = Math.min(...ys) - 6;
  const maxY = Math.max(...ys) + 6;
  return { minX, minY, maxX, maxY };
}

export function derivedValues(state: RayTracingState): Record<string, number> {
  const out: Record<string, number> = {};
  if (state.image) {
    out.magnification = state.image.magnification;
  }
  return out;
}
