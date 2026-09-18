// ========================================================================
// elliptical-orbit — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
// 원 궤도 유령 · 궤도 · 두 초점 사이 = trajectory, 중심 천체 · 빈 초점 · 행성 · 유령 점 = body,
// 이름표 · 이심률 값 = readout, 캡션 = 선언의 캡션 슬롯.
//
// 색은 뜻마다 하나다 — 중심 천체와 빈 초점은 같은 회색(muted, 채움 · 테두리만), 궤도는 secondary,
// 행성은 먹색(ink), 원 궤도 유령과 그 위의 점은 옅은 회색 점선 · 테두리. **강조색은 「두 초점 사이의
// 벌어짐」 한 가지 뜻에만** 쓴다 — 이 조각의 손잡이다.
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
  CIRCLE_ECCENTRICITY,
  bodyAt,
  eccentricityAt,
  meanAnomalyAt,
  orbitGeometry,
  orbitPoints,
  readConstants,
} from './physics';
import { PLANET_RADIUS, SCENE_BOUNDS, SUN_RADIUS, text, type EllipticalOrbitMessageKey } from './schema';
import type { EllipticalOrbitState } from './state';

/** 궤도 표본 수. */
const ORBIT_SAMPLES = 180;
/** 선 굵기(화면 px) — 궤도, 원 궤도 유령(안내선), 두 초점 사이(손잡이). */
const ORBIT_WIDTH = 2;
const GHOST_WIDTH = 1;
const FOCAL_WIDTH = 3;
/** 원 궤도 유령 · 유령 점의 불투명도. 지나간 기준이라 옅다. */
const GHOST_OPACITY = 0.7;
/** 이름표 글자 · 이심률 값 글자(화면 px). */
const LABEL_PX = 12;
const VALUE_PX = 13;
/** 중심 천체 · 빈 초점 이름표를 아래로, 이심률 값을 위로 띄우는 거리(월드). */
const LABEL_GAP = 0.42;
const VALUE_GAP = 0.45;
/**
 * 근점 · 원점 이름표를 꼭짓점에서 궤도 바깥쪽 위로 띄우는 거리(화면 px). 축 위 바로 옆에 두면 근점 이름표가
 * 원 궤도 유령의 점선 위에 얹히고(e = 0.3), 아래로 내리면 중심 천체 · 빈 초점 이름표에 붙는다(e = 0.8).
 */
const APSIS_LABEL_SIDE_PX = 4;
const APSIS_LABEL_RISE_PX = 14;
/** 원 궤도 이름표를 다는 원 위의 각(라디안, x 축에서 반시계)과 원 바깥으로 띄우는 거리(월드). */
const CIRCLE_LABEL_ANGLE = (3 * Math.PI) / 4;
const CIRCLE_LABEL_GAP = 0.35;
/** 이심률 값이 바뀔 때 앞 값이 사라지고 새 값이 나타나는 경계 — 벌리기 단계의 몫(0~1). */
const VALUE_SWAP_AT = 0.5;

export function scene(params: {
  state: EllipticalOrbitState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const k = readConstants(params.stage);
  const e = eccentricityAt(tl, k);
  const g = orbitGeometry(k.semiMajor, e);
  const circle = orbitGeometry(k.semiMajor, CIRCLE_ECCENTRICITY);
  const M = meanAnomalyAt(tl, k);
  const planet = bodyAt(M, g);
  const ghostPlanet = bodyAt(M, circle);

  // 빈 초점 · 원 궤도 유령은 처음 벌어질 때 나타나 닫힐 때 거둔다 — 원일 때는 궤도와 겹쳐 따로 보일 것이 없다.
  const apart = tl.at('spread1') * (1 - tl.at('close'));

  const out: Primitive[] = [];
  const label = (
    id: string,
    pos: Vec2,
    key: EllipticalOrbitMessageKey,
    opacity: number,
    align: 'left' | 'center' | 'right' = 'center',
    offset: Vec2 = [0, 0],
    chip = false,
  ): void => {
    if (opacity <= 0) return;
    out.push({
      type: 'readout',
      id,
      anchor: { world: pos, offset },
      text: text(key),
      chip,
      font: 'text',
      align,
      fontSize: LABEL_PX,
      opacity,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  };

  // 1. 원 궤도 유령 — 긴반지름이 같은 원. 근점이 그 안으로, 원점이 그 밖으로 나가는 것을 재는 기준.
  if (apart > 0) {
    out.push({
      type: 'trajectory',
      id: 'circle-ghost',
      points: orbitPoints(circle, ORBIT_SAMPLES),
      closed: true,
      width: GHOST_WIDTH,
      opacity: apart * GHOST_OPACITY,
      style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
    });
    const c = Math.cos(CIRCLE_LABEL_ANGLE);
    const s = Math.sin(CIRCLE_LABEL_ANGLE);
    const r = k.semiMajor + CIRCLE_LABEL_GAP;
    label('label-circle', [circle.sun[0] + r * c, circle.sun[1] + r * s], 'label.circle', apart, 'right');
  }

  // 2. 궤도.
  out.push({
    type: 'trajectory',
    id: 'orbit',
    points: orbitPoints(g, ORBIT_SAMPLES),
    closed: true,
    width: ORBIT_WIDTH,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // 3. 두 초점 사이 — 이 조각의 손잡이. 벌어진 만큼 강조색 막대가 길다.
  if (apart > 0) {
    out.push({
      type: 'trajectory',
      id: 'focal-gap',
      points: [g.sun, g.emptyFocus],
      width: FOCAL_WIDTH,
      opacity: apart,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 4. 원 위의 유령 점 — 같은 시계로 돈다. 궤도 위 행성과 같은 때에 한 바퀴를 마친다.
  if (apart > 0) {
    out.push({
      type: 'body',
      id: 'ghost-planet',
      shape: 'circle',
      pos: ghostPlanet,
      size: PLANET_RADIUS,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: apart * GHOST_OPACITY,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 5. 중심 천체 · 빈 초점 · 행성.
  if (apart > 0) {
    out.push({
      type: 'body',
      id: 'empty-focus',
      shape: 'circle',
      pos: g.emptyFocus,
      size: SUN_RADIUS,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: apart,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'body',
    id: 'sun',
    shape: 'circle',
    pos: g.sun,
    size: SUN_RADIUS,
    glow: false,
    outline: 'background',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'planet',
    shape: 'circle',
    pos: planet,
    size: PLANET_RADIUS,
    glow: false,
    outline: 'background',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 6. 이름표 — 중심 천체 · 근점 · 원점은 늘, 빈 초점은 벌어질 때부터.
  // 중심 천체 이름표에는 바탕 칩을 깐다 — 가장 길쭉한 궤도(e = 0.8)는 근점 곁에서 이 이름표 위를 지나간다.
  label('label-sun', [g.sun[0], g.sun[1] - LABEL_GAP], 'label.sun', 1, 'center', [0, 0], true);
  label('label-empty-focus', [g.emptyFocus[0], g.emptyFocus[1] - LABEL_GAP], 'label.emptyFocus', apart);
  label('label-periapsis', g.periapsis, 'label.periapsis', 1, 'right', [-APSIS_LABEL_SIDE_PX, -APSIS_LABEL_RISE_PX]);
  label('label-apoapsis', g.apoapsis, 'label.apoapsis', 1, 'left', [APSIS_LABEL_SIDE_PX, -APSIS_LABEL_RISE_PX]);

  // 7. 이심률 값 — 정박값에 머무는 동안만 그 선언값을 그대로 쓴다. 벌어지는 동안에는 앞 값이 앞 절반에
  //    사라지고 새 값이 뒤 절반에 나타난다(계산한 중간값을 띄우지 않는다 — S-piece 유효숫자).
  const leave = (id: string): number => {
    const swap = tl.start(id) + tl.duration(id) * VALUE_SWAP_AT;
    return 1 - tl.span(tl.start(id), swap);
  };
  const arrive = (id: string): number => {
    const swap = tl.start(id) + tl.duration(id) * VALUE_SWAP_AT;
    return tl.span(swap, tl.end(id));
  };
  const values: readonly { id: string; e: number; opacity: number }[] = [
    { id: 'value-0', e: CIRCLE_ECCENTRICITY, opacity: leave('spread1') + arrive('close') },
    { id: 'value-1', e: k.eccentricity1, opacity: arrive('spread1') * leave('spread2') },
    { id: 'value-2', e: k.eccentricity2, opacity: arrive('spread2') * leave('spread3') },
    { id: 'value-3', e: k.eccentricity3, opacity: arrive('spread3') * leave('close') },
  ];
  const valuePos: Vec2 = [(g.sun[0] + g.emptyFocus[0]) / 2, g.sun[1] + VALUE_GAP];
  for (const v of values) {
    if (v.opacity <= 0) continue;
    out.push({
      type: 'readout',
      id: v.id,
      anchor: { world: valuePos },
      text: text('label.eccentricity'),
      vars: { e: String(v.e) },
      chip: true,
      font: 'mono',
      italic: true,
      fontSize: VALUE_PX,
      opacity: v.opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
