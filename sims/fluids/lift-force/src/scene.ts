// ========================================================================
// lift-force — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 압력장(scalarField) · 연기 줄(lineSet) · 추적 연기 줄(lineSet, 강조색) · 날개(region).
// 겹침은 원본의 그리는 순서 그대로다 (`drawOrder: 'scene'`). 캡션은 슬롯이 그린다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  Vec2,
  ViewDef,
} from '@aperi21/schema';

import { FIELD_COLS, FIELD_ROWS, airfoilPoints, splitForDrawing } from './physics';
import { PRESSURE_RANGE, SCENE_BOUNDS, SMOKE, STROKE, VIEW, Y_HALF } from './schema';
import type { LiftForceState } from './state';

export function scene(params: {
  state: LiftForceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
}): SceneGraph {
  const { state } = params;
  const aoa = state.flowAoaDeg;
  const out: Primitive[] = [];
  // 원본 캔버스 사각형. 연기 줄은 이 밖에서 뿌려지고 이 밖으로 흘러 나가므로 여기서 자른다.
  const frame = { min: [VIEW.xMin, -Y_HALF] as Vec2, max: [VIEW.xMax, Y_HALF] as Vec2 };

  // ---- 압력장 ----
  // 밝음 = 고압, 짙은 회청 = 저압. 0.25 간격 계단이라 등압 띠가 무늬로 읽힌다.
  out.push({
    type: 'scalarField',
    id: 'pressure',
    min: frame.min,
    max: frame.max,
    cols: FIELD_COLS,
    rows: FIELD_ROWS,
    values: state.field,
    range: PRESSURE_RANGE,
    colors: { high: 'secondary' },
  });

  // ---- 연기 줄 ----
  const smoke: Vec2[][] = [];
  const tracked: Vec2[][] = [];
  for (const line of state.lines) {
    const parts = splitForDrawing(aoa, line);
    if (line.id % SMOKE.trackEvery === 0) tracked.push(...parts);
    else smoke.push(...parts);
  }
  out.push({
    type: 'lineSet',
    id: 'smoke',
    lines: smoke,
    width: STROKE.smokeWidth,
    opacity: STROKE.smokeOpacity,
    clip: frame,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 추적 연기 줄 ----
  // 네 줄에 하나. 강조색은 「한 줄을 끝까지 따라가라」 한 뜻에만 쓴다.
  out.push({
    type: 'lineSet',
    id: 'tracked',
    lines: tracked,
    width: STROKE.trackWidth,
    clip: frame,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 날개 ----
  out.push({
    type: 'region',
    id: 'airfoil',
    points: airfoilPoints(aoa),
    fillOpacity: 1,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): Bounds {
  // 고정 경계 — 원본 캔버스 + 캡션 · 조작기 줄. 매 프레임 같은 값이다.
  return { ...SCENE_BOUNDS };
}
