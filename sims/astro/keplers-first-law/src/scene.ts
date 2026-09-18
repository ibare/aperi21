// ========================================================================
// keplers-first-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
// 궤도 · 장축 · 가운데 표지 · 끈 = trajectory, 태양 · 빈 초점 · 행성 = body,
// 이름표 = readout, 캡션 = 선언의 캡션 슬롯.
//
// 색은 뜻마다 하나다 — 태양과 빈 초점은 같은 회색(muted, 하나는 채움 · 하나는 테두리만),
// 행성은 먹색(ink), **강조색은 「끈」 한 가지 뜻에만** 쓴다. 궤도 위에 걸린 끈과 오른쪽에
// 곧게 편 끈이 같은 강조색이다 — 같은 끈이기 때문이다.
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
import { distance, ellipseGeometry, orbitPoints, planetAt, readConstants } from './physics';
import {
  BAR_LEFT,
  BAR_PIN_RADIUS,
  BAR_Y,
  PLANET_RADIUS,
  SCENE_BOUNDS,
  SUN_RADIUS,
  text,
} from './schema';
import type { KeplersFirstLawState } from './state';

/** 궤도 타원 표본 수. */
const ORBIT_SAMPLES = 180;
/** 선 굵기(화면 px) — 궤도는 가늘게, 끈은 테마 기본 굵기, 장축 · 가운데 표지는 안내선. */
const ORBIT_WIDTH = 1.5;
const STRING_WIDTH = 2.5;
const GUIDE_WIDTH = 1;
const CROSS_WIDTH = 1.5;
/** 가운데 + 표지의 반팔 길이(월드). */
const CROSS_HALF = 0.16;
/** 이름표 글자(화면 px)와 표지에서 띄우는 거리(월드). */
const LABEL_FONT = 12;
const LABEL_GAP = 0.42;
/** 펼친 끈 이름표를 끈 위로 띄우는 거리(월드). */
const BAR_LABEL_GAP = 0.5;

export function scene(params: {
  state: KeplersFirstLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const k = readConstants(params.stage);
  const g = ellipseGeometry(k);
  const planet = planetAt(tl, k, g);

  // 빈 초점은 `mirror` 에서 나타나고, 끈은 `tie` 에서 걸린다. 둘 다 `fade` 에서 거둔다.
  const leaving = 1 - tl.at('fade');
  const mirrorShown = tl.at('mirror') * leaving;
  const stringShown = tl.at('tie') * leaving;

  const out: Primitive[] = [];
  const label = (id: string, pos: Vec2, key: Parameters<typeof text>[0], opacity = 1, chip = true): void => {
    if (opacity <= 0) return;
    out.push({
      type: 'readout',
      id,
      anchor: { world: pos },
      text: text(key),
      // 끈이 이름표 위를 지나가도 읽히도록 바탕 칩을 깐다.
      chip,
      font: 'text',
      align: 'center',
      fontSize: LABEL_FONT,
      opacity,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  };

  // 1. 장축 — 두 초점이 가운데를 사이에 두고 같은 거리에 있다는 것을 잇는 안내선.
  if (mirrorShown > 0) {
    out.push({
      type: 'trajectory',
      id: 'major-axis',
      points: [
        [g.center[0] - g.a, g.center[1]],
        [g.center[0] + g.a, g.center[1]],
      ],
      width: GUIDE_WIDTH,
      opacity: mirrorShown,
      style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
    });
  }

  // 2. 궤도.
  out.push({
    type: 'trajectory',
    id: 'orbit',
    points: orbitPoints(g, ORBIT_SAMPLES),
    closed: true,
    width: ORBIT_WIDTH,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // 3. 가운데 + — 태양이 여기 있지 않다는 것을 보이려는 표지.
  out.push({
    type: 'trajectory',
    id: 'center-h',
    points: [
      [g.center[0] - CROSS_HALF, g.center[1]],
      [g.center[0] + CROSS_HALF, g.center[1]],
    ],
    width: CROSS_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'center-v',
    points: [
      [g.center[0], g.center[1] - CROSS_HALF],
      [g.center[0], g.center[1] + CROSS_HALF],
    ],
    width: CROSS_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 4. 끈 — 태양에서 행성을 거쳐 빈 초점까지 한 줄.
  if (stringShown > 0) {
    out.push({
      type: 'trajectory',
      id: 'string',
      points: [g.sun, planet, g.emptyFocus],
      width: STRING_WIDTH,
      opacity: stringShown,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 5. 태양 · 빈 초점 · 행성.
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
  if (mirrorShown > 0) {
    out.push({
      type: 'body',
      id: 'empty-focus',
      shape: 'circle',
      pos: g.emptyFocus,
      size: SUN_RADIUS,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: mirrorShown,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }
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

  // 6. 이름표 — 태양 · 가운데는 늘, 빈 초점은 나타날 때부터.
  label('label-sun', [g.sun[0], g.sun[1] - LABEL_GAP], 'label.sun');
  label('label-center', [g.center[0], g.center[1] + LABEL_GAP], 'label.center');
  label('label-empty-focus', [g.emptyFocus[0], g.emptyFocus[1] - LABEL_GAP], 'label.emptyFocus', mirrorShown);

  // 7. 곧게 편 끈 — 왼쪽 끝이 태양, 오른쪽 끝이 빈 초점, 행성 점이 태양에서 r₁ 만큼 떨어진 자리에 있다.
  //    두 끝은 움직이지 않는다. 행성이 돌면 점만 미끄러진다 — 두 토막이 길이를 주고받고 합은 그대로다.
  if (stringShown > 0) {
    const barRight = BAR_LEFT + 2 * g.a;
    const onBar = BAR_LEFT + distance(planet, g.sun);
    label('label-string', [(BAR_LEFT + barRight) / 2, BAR_Y + BAR_LABEL_GAP], 'label.string', stringShown, false);
    out.push({
      type: 'trajectory',
      id: 'string-straight',
      points: [
        [BAR_LEFT, BAR_Y],
        [barRight, BAR_Y],
      ],
      width: STRING_WIDTH,
      opacity: stringShown,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    out.push({
      type: 'body',
      id: 'bar-sun',
      shape: 'circle',
      pos: [BAR_LEFT, BAR_Y],
      size: BAR_PIN_RADIUS,
      glow: false,
      outline: 'background',
      opacity: stringShown,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'body',
      id: 'bar-empty-focus',
      shape: 'circle',
      pos: [barRight, BAR_Y],
      size: BAR_PIN_RADIUS,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: stringShown,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'body',
      id: 'bar-planet',
      shape: 'circle',
      pos: [onBar, BAR_Y],
      size: PLANET_RADIUS,
      glow: false,
      outline: 'background',
      opacity: stringShown,
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
