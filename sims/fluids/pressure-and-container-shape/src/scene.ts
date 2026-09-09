// ========================================================================
// pressure-and-container-shape — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 색은 role 로만 말하고 문안은 키로만 말한다.
//
// 표준 어휘가 닿는 곳은 표준 어휘로 쓴다 — 바닥선(surface) · 수면 안내선
// (trajectory) · 바닥을 누르는 압력 화살표(vector) · 나란해지는 순간의
// 섬광(event). 그릇 벽과 그 안에 차오르는 물만 자유 렌더 계층이 맡는다
// (원칙 4, NOTES.md 참고).
// ========================================================================

import type { EnvironmentDef, Primitive, SceneGraph, StageDef, ViewDef } from '@aperi21/schema';
import { commonBottomArea, readConstants } from './physics';
import {
  FOOTER_ANCHOR_Y,
  LEVEL_LINE_SPAN,
  LEVEL_READOUT_X,
  PRESSURE_ARROW_OFFSETS,
  PRESSURE_ARROW_RATIO,
  READOUT_PRIMITIVE_TYPE,
  VESSEL_PRIMITIVE_TYPE,
  VESSEL_SHAPES,
  type ReadoutPrimitive,
  type VesselPrimitive,
} from './schema';
import type { PressureAndContainerShapeState } from './state';

/**
 * 자유 렌더 계층의 프리미티브는 schema 의 Primitive 유니온에 없다. 호스트는
 * 문자열 type 으로 렌더러를 찾으므로 런타임에는 문제가 없고, 선언 시점에만
 * 이 한 곳에서 좁혀 준다 (NOTES.md 「막힌 지점」).
 */
function declare(p: VesselPrimitive | ReadoutPrimitive): Primitive {
  return p as unknown as Primitive;
}

/** Bundle.scene */
export function scene(params: {
  state: PressureAndContainerShapeState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
}): SceneGraph {
  const { state, stage } = params;
  const { rho, g } = readConstants(stage);
  const leveled = state.leveled;
  const out: Primitive[] = [];

  // 세 그릇이 함께 딛고 선 바닥. 바닥이 하나라는 것을 선으로 못박는다.
  out.push({
    type: 'surface',
    id: 'table',
    geometry: { kind: 'wall', from: [LEVEL_LINE_SPAN[0], 0], to: [LEVEL_LINE_SPAN[1], 0] },
    material: 'solid',
  });

  // 목표 수면 — 처음부터 보인다. 물이 어디로 향하는지, 그리고 그 높이가
  // 셋에게 하나라는 것을 미리 말한다. 다 차면 강조로 바뀐다.
  out.push({
    type: 'trajectory',
    id: 'target-level',
    points: [
      [LEVEL_LINE_SPAN[0], state.targetHeight],
      [LEVEL_LINE_SPAN[1], state.targetHeight],
    ],
    highlight: leveled ? 'focused' : 'normal',
    style: {
      colorRole: leveled ? 'accent' : 'muted',
      emphasis: leveled ? 'strong' : 'subtle',
      lineStyle: 'dashed',
    },
  });

  out.push(
    declare({
      type: READOUT_PRIMITIVE_TYPE,
      id: 'readout-level',
      variant: 'level',
      pos: [LEVEL_READOUT_X, state.targetHeight],
      height: state.targetHeight,
      leveled,
    }),
  );

  out.push(
    declare({
      type: READOUT_PRIMITIVE_TYPE,
      id: 'readout-givens',
      variant: 'givens',
      placement: 'screen-hud',
      rho,
      gravity: g,
      bottomArea: commonBottomArea(),
    }),
  );

  for (const shape of VESSEL_SHAPES) {
    const vessel = state.vessels.find((v) => v.id === shape.id);
    if (!vessel) continue;

    out.push(
      declare({
        type: VESSEL_PRIMITIVE_TYPE,
        id: `vessel-${shape.id}`,
        shapeId: shape.id,
        centerX: shape.centerX,
        bottomWidth: shape.bottomWidth,
        topWidth: shape.topWidth,
        wallHeight: shape.wallHeight,
        level: vessel.level,
        volume: vessel.volume,
        pressure: vessel.pressure,
        atTarget: vessel.atTarget,
        leveled,
      }),
    );

    // 물이 바닥을 누르는 힘. 길이는 수심에 비례한다 — 그래서 수면이
    // 나란해지는 순간 세 그릇의 화살표가 같은 길이가 된다.
    const arrowLength = vessel.level * PRESSURE_ARROW_RATIO;
    PRESSURE_ARROW_OFFSETS.forEach((offset, i) => {
      out.push({
        type: 'vector',
        id: `press-${shape.id}-${i}`,
        from: [shape.centerX + offset, 0],
        delta: [0, -arrowLength],
        style: { colorRole: 'accent', emphasis: leveled ? 'strong' : 'medium' },
      });
    });

    // 나란해진 그 순간에만 터지는 섬광. duration 이 지나면 스스로 사라진다.
    if (state.leveledAt !== null) {
      out.push({
        type: 'event',
        id: `level-flash-${shape.id}`,
        pos: [shape.centerX, FOOTER_ANCHOR_Y / 2],
        kind: 'flash',
        duration: 0.7,
        startedAt: state.leveledAt,
        intensity: 0.7,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  return out;
}
