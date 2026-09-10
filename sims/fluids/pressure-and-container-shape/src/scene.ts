// ========================================================================
// pressure-and-container-shape — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 색은 role 로만 말하고 문안은 키로만 말한다.
//
// 예전에는 그릇과 물과 값을 이 sim 이 직접 그렸다(288줄). 그때 만든 것들이
// 코어 어휘로 올라가면서(REQUIREMENTS.md §3) 여기 남는 것은 선언뿐이다 —
// 벽은 `surface`, 차오르는 물은 `region`, 값은 `readout`.
// ========================================================================

import type {
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  Surface,
  ViewDef,
} from '@aperi21/schema';
import { commonBottomArea, readConstants, widthAtHeight } from './physics';
import {
  FOOTER_ANCHOR_Y,
  LEVEL_LINE_SPAN,
  LEVEL_READOUT_X,
  PRESSURE_ARROW_OFFSETS,
  PRESSURE_ARROW_RATIO,
  VESSEL_SHAPES,
  text,
  vesselText,
} from './schema';
import type { PressureAndContainerShapeState } from './state';

/** 수면 일렁임 진폭(화면 px). 일렁임은 물리량이 아니라 표현이다. */
const RIPPLE_PX = 3;
/** 수심(m)당 허용 진폭(px). 얕은 물이 바닥을 뚫고 출렁이지 않게. */
const RIPPLE_DEPTH_LIMIT = 40;
/** 그릇 아래 이름 줄이 압력 숫자에서 내려오는 거리(m). */
const NAME_DROP = 0.05;
/** 화면 좌상단 주어진 값 줄. 우상단 슬라이더 아래로 내려 잡는다. */
const GIVENS_TOP = 60;
const GIVENS_LINE_GAP = 14;
/**
 * 부피 칩이 수면 아래로 내려가 붙는 거리(화면 px).
 *
 * 월드로 잡으면 물이 얕을 때 칩이 바닥을 뚫는다. 앵커에서 띄우는 거리는
 * 배치라 화면 상수여야 한다.
 */
const CHIP_DROP_PX = 16;

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

  // 지금 수면 높이. 선 위에 쓴다 — 선 아래는 가장 오른쪽 그릇의 부피 칩이
  // 지나가는 자리다.
  out.push({
    type: 'readout',
    id: 'readout-level',
    anchor: { world: [LEVEL_READOUT_X, state.targetHeight + 0.02] },
    text: text('label.level'),
    vars: { h: state.targetHeight.toFixed(2) },
    chip: false,
    align: 'right',
    fontSize: 12,
    style: { colorRole: leveled ? 'accent' : 'muted', emphasis: 'strong' },
  });

  // 주어진 값 — 월드가 아니라 화면 좌상단에 붙는다. 그릇 위 좁은 띠에 두면
  // 낮은 배율에서 수면 높이 표시와 겹친다.
  const givens: Readout[] = [
    {
      type: 'readout',
      id: 'givens-constants',
      anchor: { screen: 'top-left', offset: [0, GIVENS_TOP] },
      text: text('label.constants'),
      vars: { rho: rho.toFixed(0), g: g.toFixed(1) },
      chip: false,
      fontSize: 10,
      style: { colorRole: 'muted', emphasis: 'medium' },
    },
    {
      type: 'readout',
      id: 'givens-area',
      anchor: { screen: 'top-left', offset: [0, GIVENS_TOP + GIVENS_LINE_GAP] },
      text: text('label.bottomArea'),
      vars: { a: commonBottomArea().toFixed(2) },
      chip: false,
      fontSize: 10,
      style: { colorRole: 'muted', emphasis: 'medium' },
    },
  ];
  out.push(...givens);

  for (const shape of VESSEL_SHAPES) {
    const vessel = state.vessels.find((v) => v.id === shape.id);
    if (!vessel) continue;

    const halfBottom = shape.bottomWidth / 2;
    const halfTop = shape.topWidth / 2;
    const level = Math.min(Math.max(vessel.level, 0), shape.wallHeight);
    const halfSurface = widthAtHeight(shape, level) / 2;

    // 그릇 벽 — 위가 열린 ㄷ 자. 바닥 폭은 셋 다 같고 위쪽만 다르다.
    const walls: Surface[] = [
      {
        type: 'surface',
        id: `wall-${shape.id}-left`,
        geometry: {
          kind: 'wall',
          from: [shape.centerX - halfTop, shape.wallHeight],
          to: [shape.centerX - halfBottom, 0],
        },
        material: 'solid',
      },
      {
        type: 'surface',
        id: `wall-${shape.id}-right`,
        geometry: {
          kind: 'wall',
          from: [shape.centerX + halfBottom, 0],
          to: [shape.centerX + halfTop, shape.wallHeight],
        },
        material: 'solid',
      },
    ];
    out.push(...walls);

    // 차오른 물 — 수면은 언제나 수평이다. 그릇 모양대로 담기므로 사다리꼴이다.
    if (level > 0.0005) {
      const water: Region = {
        type: 'region',
        id: `water-${shape.id}`,
        points: [
          [shape.centerX - halfBottom, 0],
          [shape.centerX + halfBottom, 0],
          [shape.centerX + halfSurface, level],
          [shape.centerX - halfSurface, level],
        ],
        // 물이 얕으면 일렁임도 얕다. 진폭이 수심을 넘으면 물결이 바닥을 뚫는다.
        ripple: {
          edge: [2, 3],
          amplitude: leveled ? 0 : Math.min(RIPPLE_PX, level * RIPPLE_DEPTH_LIMIT),
        },
        outline: [[2, 3]],
        style: { colorRole: 'secondary', emphasis: 'medium' },
      };
      out.push(water);
    }

    // 담긴 부피 — 수면 바로 아래에 붙어 물과 함께 올라간다.
    // 수면 위가 아니라 아래에 두는 이유: 다 차면 수면이 목표선과 겹치는데,
    // 그 위에 두면 세 그릇을 가로지르는 목표선이 숫자를 지나간다.
    out.push({
      type: 'readout',
      id: `volume-${shape.id}`,
      anchor: { world: [shape.centerX, level], offset: [0, CHIP_DROP_PX] },
      text: text('label.volume'),
      vars: { v: (vessel.volume * 1000).toFixed(1) },
      fontSize: 11,
      style: { colorRole: vessel.atTarget ? 'primary' : 'muted', emphasis: 'strong' },
    });

    // 바닥 압력 — 압력 화살표 아래에 숫자로 못박는다.
    out.push({
      type: 'readout',
      id: `pressure-${shape.id}`,
      anchor: { world: [shape.centerX, FOOTER_ANCHOR_Y] },
      text: text('label.pressure'),
      vars: { p: Math.round(vessel.pressure) },
      chip: false,
      fontSize: 13,
      style: { colorRole: leveled ? 'accent' : 'muted', emphasis: 'strong' },
    });

    out.push({
      type: 'readout',
      id: `name-${shape.id}`,
      anchor: { world: [shape.centerX, FOOTER_ANCHOR_Y - NAME_DROP] },
      text: vesselText(shape.id),
      chip: false,
      fontSize: 10,
      style: { colorRole: 'muted', emphasis: 'medium' },
    });

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
