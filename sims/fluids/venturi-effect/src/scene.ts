// ========================================================================
// venturi-effect — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 통 속 액체 · 가는 관 속 액주(region, opaque) · 통 벽 · 가는 관 벽 · 관 벽(trajectory) ·
// 관 속 공기 점 · 물방울(particleSystem) · 수면 기준 점선(trajectory). 겹침은 선언 순서
// 그대로다 (`drawOrder: 'scene'`).
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';

import {
  airDots,
  columnAt,
  dropletOpacity,
  droplets,
  flowAt,
  flowIntegral,
  pipeHalf,
  readConstants,
  volumeTable,
  type VenturiConstants,
} from './physics';
import {
  AIR_DOT_STYLE,
  DROP_STYLE,
  LEVEL_OVERHANG,
  LINE_PX,
  LIQUID_FILL,
  PIPE,
  SCENE_BOUNDS,
  TANK,
  THROAT_TUBE_X,
  TRAIL_SECONDS,
  TUBE_HALF,
  WIDE_TUBE_X,
} from './schema';
import type { VenturiEffectState } from './state';

/** 관 벽을 표본하는 x 간격(cm). 좁아지는 구간이 매끈하게 보일 만큼. */
const SAMPLE_DX = 0.1;
/** 통 벽이 수면 위로 솟은 높이(cm). */
const TANK_RIM = 0.9;

/** [a, b] 를 표본 간격으로 나눈 x 목록. 양 끝을 반드시 넣는다. */
function samples(a: number, b: number): number[] {
  const n = Math.max(1, Math.ceil((b - a) / SAMPLE_DX));
  const out: number[] = [];
  for (let i = 0; i <= n; i++) out.push(a + ((b - a) * i) / n);
  return out;
}

/** 액체 — 통과 관 속이 같은 액체라 같은 색 · 같은 짙기다. 겹쳐도 짙어지지 않게 불투명. */
function liquid(id: string, points: Vec2[]): Region {
  return {
    type: 'region',
    id,
    points,
    opaque: true,
    fillOpacity: LIQUID_FILL,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
}

function line(id: string, points: Vec2[], width: number, dashed = false): Primitive {
  return {
    type: 'trajectory',
    id,
    points,
    width,
    style: { colorRole: 'ink', emphasis: 'strong', ...(dashed ? { lineStyle: 'dashed' as const } : {}) },
  };
}

/** 가는 관 하나 — 관의 아랫벽에서 통 속까지 내려가는 두 벽. */
function tubeWalls(id: string, x: number, c: VenturiConstants): Primitive[] {
  return [-1, 1].map((side) => {
    const wx = x + side * TUBE_HALF;
    return line(`tube-${id}-${side < 0 ? 'l' : 'r'}`, [[wx, -pipeHalf(wx, c)], [wx, TANK.tubeDip]], LINE_PX.tube);
  });
}

export function scene(params: {
  state: VenturiEffectState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('venturi-effect: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const table = volumeTable(c);
  const integral = flowIntegral(tl);
  const f = flowAt(tl.u, tl);
  const out: Primitive[] = [];

  // ---- 통 속 액체 ----
  out.push(
    liquid('tank-liquid', [
      [TANK.xLeft, TANK.bottom],
      [TANK.xRight, TANK.bottom],
      [TANK.xRight, TANK.surface],
      [TANK.xLeft, TANK.surface],
    ]),
  );

  // ---- 가는 관 속 액주 ----
  // 넓은 곳 아래 관은 통의 수면 그대로, 목 아래 관만 빨려 올라간다. 같은 식 하나로 둘 다 계산한다.
  for (const [id, x] of [
    ['wide', WIDE_TUBE_X],
    ['throat', THROAT_TUBE_X],
  ] as const) {
    const col = columnAt(x, f, c);
    out.push(
      liquid(`column-${id}`, [
        [x - TUBE_HALF, TANK.tubeDip],
        [x + TUBE_HALF, TANK.tubeDip],
        [x + TUBE_HALF, col.top],
        [x - TUBE_HALF, col.top],
      ]),
    );
  }

  // ---- 통 벽 (위가 열린 그릇) ----
  out.push(
    line(
      'tank-wall',
      [
        [TANK.xLeft, TANK.surface + TANK_RIM],
        [TANK.xLeft, TANK.bottom],
        [TANK.xRight, TANK.bottom],
        [TANK.xRight, TANK.surface + TANK_RIM],
      ],
      LINE_PX.tank,
    ),
  );

  // ---- 가는 관 벽 ----
  out.push(...tubeWalls('wide', WIDE_TUBE_X, c));
  out.push(...tubeWalls('throat', THROAT_TUBE_X, c));

  // ---- 관 벽 ----
  // 윗벽은 한 줄, 아랫벽은 가는 관이 뚫고 들어오는 자리를 비운다.
  out.push(line('wall-top', samples(PIPE.xIn, PIPE.xOut).map((x): Vec2 => [x, pipeHalf(x, c)]), LINE_PX.wall));
  const cuts = [PIPE.xIn, WIDE_TUBE_X - TUBE_HALF, WIDE_TUBE_X + TUBE_HALF, THROAT_TUBE_X - TUBE_HALF, THROAT_TUBE_X + TUBE_HALF, PIPE.xOut];
  for (let i = 0; i < cuts.length; i += 2) {
    out.push(
      line(
        `wall-bottom-${i / 2}`,
        samples(cuts[i]!, cuts[i + 1]!).map((x): Vec2 => [x, -pipeHalf(x, c)]),
        LINE_PX.wall,
      ),
    );
  }

  // ---- 관 속 공기 ----
  // 바람이 없으면 멈춰 있고, 불면 목에서 간격이 벌어지고 꼬리가 길어진다. 액체보다 한 단 물러선다.
  const air = airDots(tl, f, integral, c, table);
  out.push({
    type: 'particleSystem',
    id: 'air',
    positions: air.positions,
    velocities: air.velocities,
    sizes: AIR_DOT_STYLE.size,
    trail: true,
    trailStyle: { seconds: TRAIL_SECONDS, width: AIR_DOT_STYLE.trailWidth, opacity: AIR_DOT_STYLE.trailOpacity },
    // 공기 점의 꼬리가 관 입구 · 출구 밖으로 삐져나오지 않게 관 길이로 자른다.
    clip: { min: [PIPE.xIn, SCENE_BOUNDS.minY], max: [PIPE.xOut, SCENE_BOUNDS.maxY] },
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 물방울 ----
  // 목까지 빨려 올라온 액체가 바람에 뜯겨 나간 것. 통의 액체와 같은 색이다 — 같은 액체다.
  const drops = droplets(tl, f, integral, c, table);
  const dOpacity = dropletOpacity(tl);
  if (drops.positions.length > 0 && dOpacity > 0) {
    out.push({
      type: 'particleSystem',
      id: 'droplets',
      positions: drops.positions,
      velocities: drops.velocities,
      sizes: DROP_STYLE.size,
      trail: true,
      trailStyle: { seconds: TRAIL_SECONDS, width: DROP_STYLE.trailWidth, opacity: DROP_STYLE.trailOpacity },
      opacity: dOpacity,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  }

  // ---- 수면 기준 점선 ----
  // 통의 수면을 두 관 너머까지 긋는다. 넓은 곳 아래 관의 액면은 이 선에 머물고,
  // 목 아래 관의 액면만 이 선을 넘어 올라간다.
  out.push({
    ...line(
      'level',
      [
        [TANK.xLeft - LEVEL_OVERHANG, TANK.surface],
        [TANK.xRight + LEVEL_OVERHANG, TANK.surface],
      ],
      LINE_PX.level,
      true,
    ),
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
