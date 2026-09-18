// ========================================================================
// star-radiation-gravity-balance — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
//   · 별 — `region` 원판(표본한 다각형) + `trajectory` 테두리. 칠의 짙기가 별 속 온도다 —
//     부풀면 옅어지고(식음) 오그라들면 짙어진다(데워짐).
//   · 처음 크기 — `trajectory` 점선 고리 + 이름표. 부풂 · 오그라듦을 잴 기준이다.
//   · 안쪽 층 — `trajectory` 점선 고리. 반지름의 `innerLayer` 배 자리.
//   · 중심 — `body` 원. 반지름이 중심 에너지를 따라 커지고 준다.
//   · 두 힘 — 표면 세 자리 · 안쪽 층 세 자리(서로 엇갈려)에서 한 점을 꼬리로 안쪽(중력)과 바깥쪽(압력)
//     화살표 한 쌍. 길이가 같으면 균형, 다르면 긴 쪽으로 별이 움직인다.
//
// 색은 대상을 가른다. 압력과 중심은 `accent` — 「중심이 낸 에너지와 그것이 미는 힘」 한 뜻.
// 중력은 `secondary`, 별은 `primary`, 기준 고리 · 층 고리는 `muted`.
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
  energyAt,
  radiusAt,
  readConstants,
  relativeTemperature,
  surfaceForces,
} from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { StarRadiationGravityBalanceState } from './state';

/** 원을 표본하는 점 수. */
const CIRCLE_STEPS = 96;
/**
 * 표면에서 두 힘을 보이는 자리(도, 월드 +x 에서 반시계). 맨 위(90°)의 쌍에 이름을 붙인다.
 * 한 방향에 한 쌍만 둔다 — 표면과 안쪽 층의 화살표가 같은 방향에 겹치면 가장 작은 별에서 엉킨다.
 */
const SURFACE_ANGLES_DEG = [90, 210, 330] as const;
/** 안쪽 층에서 두 힘을 보이는 자리 — 표면 자리 사이. */
const INNER_ANGLES_DEG = [30, 150, 270] as const;
/** 이름을 붙이는 표면 자리. */
const NAMED_ANGLE_DEG = 90;
/**
 * 처음 크기 이름표의 자리(도) — 화살표 자리 사이, 고리 바로 위. 별 테두리가 어느 크기로 지나가도
 * 읽히게 바탕 칩을 깐다.
 */
const CALM_LABEL_DEG = -60;
/** 별 칠의 짙기 — 처음 별의 온도일 때. 온도에 비례하고 상한에서 멈춘다. */
const STAR_FILL = 0.3;
const STAR_FILL_MAX = 0.55;
/** 선 굵기(화면 px). */
const RIM_WIDTH = 2;
const GUIDE_WIDTH = 1;
const SURFACE_ARROW_WIDTH = 3;
const INNER_ARROW_WIDTH = 2;
/** 글자 크기(화면 px). */
const LABEL_PX = 11;
/**
 * 화살표 이름을 끝에서 옆으로 띄우는 거리(화면 px). 월드 앵커 글자는 가운데 정렬이라(G122)
 * 글자 반 폭만큼 더 띄워 세로 화살표에 닿지 않게 한다.
 */
const NAME_OFFSET: Vec2 = [22, 0];

const rad = (deg: number): number => (deg * Math.PI) / 180;

function circle(r: number): Vec2[] {
  return Array.from({ length: CIRCLE_STEPS }, (_, i) => {
    const a = (i / CIRCLE_STEPS) * Math.PI * 2;
    return [r * Math.cos(a), r * Math.sin(a)] as Vec2;
  });
}

/** 화살표 옆의 이름. 화살표와 같은 색이라 어느 화살표의 이름인지 잇는다. */
function nameAt(
  id: string,
  tip: Vec2,
  key: 'label.gravity' | 'label.pressure',
  role: 'secondary' | 'accent',
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: tip, offset: NAME_OFFSET },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    style: { colorRole: role, emphasis: 'strong' },
  };
}

/**
 * 한 층의 한 자리에 걸린 두 힘. 층 위의 점을 꼬리로, 중력은 안쪽 · 압력은 바깥쪽으로 뻗는다.
 * 같은 점에서 맞서 뻗으므로 길이를 곧바로 견줄 수 있다.
 */
function forcePair(
  id: string,
  r: number,
  deg: number,
  gravityLen: number,
  pressureLen: number,
  width: number,
  named: boolean,
): Primitive[] {
  const ux = Math.cos(rad(deg));
  const uy = Math.sin(rad(deg));
  const at: Vec2 = [r * ux, r * uy];
  // 압력 이름은 화살표 **끝**, 중력 이름은 화살표 **가운데**에 붙인다. `vector.label` 은 꼬리에서 40%
  // 자리라 두 화살표가 짧아지면(가장 부푼 별) 한 꼬리를 나눠 쓰는 두 이름이 서로 겹친다 (G17).
  // 중력을 끝에 두면 가장 작은 별에서 중심 가까이 안쪽 층 화살표에 얹힌다.
  const names: Primitive[] = named
    ? [
        nameAt(`${id}-gravity-name`, [at[0] - (gravityLen / 2) * ux, at[1] - (gravityLen / 2) * uy], 'label.gravity', 'secondary'),
        nameAt(`${id}-pressure-name`, [at[0] + pressureLen * ux, at[1] + pressureLen * uy], 'label.pressure', 'accent'),
      ]
    : [];
  return [
    ...names,
    {
      type: 'vector',
      id: `${id}-gravity`,
      from: at,
      delta: [-gravityLen * ux, -gravityLen * uy],
      width,
      // 별 칠 위를 지나므로 바탕으로 제 경계를 떼어 낸다.
      outline: 'background',
      style: { colorRole: 'secondary', emphasis: 'strong' },
    },
    {
      type: 'vector',
      id: `${id}-pressure`,
      from: at,
      delta: [pressureLen * ux, pressureLen * uy],
      width,
      outline: 'background',
      style: { colorRole: 'accent', emphasis: 'strong' },
    },
  ];
}

export function scene(params: {
  state: StarRadiationGravityBalanceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('star-radiation-gravity-balance: 시간표가 없다');
  const c = readConstants(params.stage);
  const E = energyAt(tl, c);
  const R = radiusAt(tl, c);
  const r0 = c.calmRadius;
  const f = surfaceForces(E, R, c);
  const out: Primitive[] = [];

  // ---- 별 ----
  out.push({
    type: 'region',
    id: 'star',
    points: circle(R),
    fillOpacity: Math.min(STAR_FILL_MAX, STAR_FILL * relativeTemperature(R, c)),
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'star-rim',
    points: circle(R),
    closed: true,
    width: RIM_WIDTH,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 처음 크기 · 안쪽 층 ----
  out.push({
    type: 'trajectory',
    id: 'calm-size',
    points: circle(r0),
    closed: true,
    width: GUIDE_WIDTH,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
  });
  const la = rad(CALM_LABEL_DEG);
  out.push({
    type: 'readout',
    id: 'calm-size-label',
    anchor: { world: [r0 * Math.cos(la), r0 * Math.sin(la)] },
    text: text('label.calmSize'),
    chip: true,
    font: 'text',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const rIn = c.innerLayer * R;
  out.push({
    type: 'trajectory',
    id: 'inner-layer',
    points: circle(rIn),
    closed: true,
    width: GUIDE_WIDTH,
    style: { colorRole: 'primary', emphasis: 'subtle', lineStyle: 'dashed' },
  });

  // ---- 중심 ----
  out.push({
    type: 'body',
    id: 'core',
    pos: [0, 0],
    shape: 'circle',
    size: (c.coreRadius * E) / c.energyCalm,
    outline: 'none',
    glow: true,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 두 힘 ----
  const L = c.arrowPerForce;
  for (const deg of INNER_ANGLES_DEG) {
    out.push(
      ...forcePair(`inner-${deg}`, rIn, deg, L * f.gravity * c.innerLayer, L * f.pressure * c.innerLayer, INNER_ARROW_WIDTH, false),
    );
  }
  for (const deg of SURFACE_ANGLES_DEG) {
    out.push(
      ...forcePair(`surface-${deg}`, R, deg, L * f.gravity, L * f.pressure, SURFACE_ARROW_WIDTH, deg === NAMED_ANGLE_DEG),
    );
  }

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
