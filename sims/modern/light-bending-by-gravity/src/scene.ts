// ========================================================================
// light-bending-by-gravity — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 태양 · 지구 · 별 · 광자(body),
// 빛의 길 · 휘지 않은 길 · 거슬러 본 길(trajectory), 휜 각(sector), 바깥쪽 화살표(vector),
// 이름표(readout) 가 모두 표준 어휘로 있다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 태양 중심이 원점, 왼쪽 먼 곳에 별, 오른쪽에 지구가 있다. 실제로는 별이 훨씬 멀고 태양은 훨씬
// 작지만, 이 그림이 견주는 것은 거리가 아니라 **길의 모양과 두 자리의 어긋남**이다.
//
// 색은 뜻마다 하나 — **강조색은 「빛」 한 뜻에만**(빛의 길과 광자). 태양 primary, 별 · 지구 먹색,
// 거슬러 본 길 · 휜 각 · 화살표는 secondary, 휘지 않았다면의 점선은 배경 정보라 muted.
// 실제 별과 보이는 별은 같은 별이라 같은 색이고, 채움(찬 원 / 속 빈 원)으로만 가른다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  Trajectory,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  drawnDeflection,
  lightPath,
  pathSlope,
  pathY,
  photonX,
  readConstants,
  samplePath,
  unbentY,
} from './physics';
import { text, type LightBendingByGravityMessageKey } from './schema';
import type { LightBendingByGravityState } from './state';

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 태양 반지름. */
const SUN_R = 0.62;
/** 빛이 가장 가까이 지나는 거리 ÷ 태양 반지름 — 가장자리를 스친다. */
const GRAZE = 1.04;
/** 별 · 지구의 가로 자리. 지구는 y = 0 에 있다. */
const STAR_X = -6.5;
const EARTH_X = 4.6;
/** 별 · 지구의 반지름. */
const STAR_R = 0.11;
const EARTH_R = 0.16;
/** 광자의 반지름. */
const PHOTON_R = 0.09;
/** 빛의 길을 나누는 칸 수 — 별에서 지구까지. 광자가 가는 만큼만 긋는다. */
const PATH_SAMPLES = 160;
/** 휘지 않았다면의 점선이 끝나는 x — 지구 조금 너머. */
const UNBENT_END_X = EARTH_X + 0.4;
/** 휜 각 부채꼴의 반지름. */
const SECTOR_R = 1.7;
/** 휜 각 이름표를 꼭짓점에서 오른쪽으로 뗀 거리 — 부채꼴 반지름에 대한 비. */
const ANGLE_LABEL_AT = 0.6;
/** 실제 → 보이는 자리 화살표를 두 별 둘레에서 뗀 거리. */
const ARROW_GAP = 0.06;

// ------------------------------------------------------------------------
// 그리기 치수 — 화면 px 와 짙기 (C2)
// ------------------------------------------------------------------------

const PATH_WIDTH_PX = 2.5;
const GUIDE_WIDTH_PX = 1.5;
const ARROW_WIDTH_PX = 2;
const LABEL_PX = 12;
const ANGLE_PX = 14;
/** 이름표를 대상 옆으로 띄우는 거리(화면 px). */
const LABEL_GAP = 12;
/** 이름표를 대상 아래 · 위로 띄우는 거리(화면 px, 양수가 아래). */
const LABEL_BELOW = 14;
const LABEL_ABOVE = -12;
/** 휜 각 부채꼴의 채움 짙기. */
const SECTOR_FILL_OPACITY = 0.18;
/** 과장 알림을 화면 왼쪽 위 모서리에서 띄우는 거리(화면 px). */
const NOTE_OFFSET: Vec2 = [0, 4];

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const faint = { colorRole: 'muted', emphasis: 'strong' } as const;
const lightStyle = { colorRole: 'accent', emphasis: 'strong' } as const;
const guide = { colorRole: 'secondary', emphasis: 'strong' } as const;
const sunStyle = { colorRole: 'primary', emphasis: 'strong' } as const;

function line(
  id: string,
  points: readonly Vec2[],
  width: number,
  style: Trajectory['style'],
  opacity: number,
): Trajectory {
  return { type: 'trajectory', id, points, width, style, opacity };
}

function label(
  id: string,
  at: Vec2,
  offset: Vec2,
  key: LightBendingByGravityMessageKey,
  align: Readout['align'],
  opacity: number,
  style: Readout['style'] = faint,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align,
    opacity,
    style,
  };
}

export function scene(params: {
  state: LightBendingByGravityState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('light-bending-by-gravity: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const path = lightPath(SUN_R * GRAZE, drawnDeflection(c), EARTH_X);
  const out: Primitive[] = [];

  // 짙기 — 단계에서 읽는다. 비우는 단계(`reset`)에 모두 사라진다.
  const keep = 1 - tl.at('reset');
  const traceVis = tl.at('trace') * keep;
  const markVis = tl.at('mark') - tl.at('reset');

  const px = Math.min(photonX(tl, STAR_X, EARTH_X), EARTH_X);
  const starPos: Vec2 = [STAR_X, pathY(path, STAR_X)];
  const earthPos: Vec2 = [EARTH_X, 0];
  // 지구에 닿는 빛의 방향 — 지구는 이 방향을 곧게 거슬러 별을 찾는다.
  const arriveSlope = pathSlope(path, EARTH_X);
  const seenY = (x: number): number => arriveSlope * (x - EARTH_X);
  const seenPos: Vec2 = [STAR_X, seenY(STAR_X)];

  // ====================================================================
  // 태양
  // ====================================================================
  out.push({ type: 'body', id: 'sun', pos: [0, 0], shape: 'circle', size: SUN_R, style: sunStyle });

  // ====================================================================
  // 휜 각 — 휘지 않은 길과 나간 길 사이의 부채꼴
  // ====================================================================
  if (markVis > 0) {
    out.push({
      type: 'sector',
      id: 'bend-angle',
      center: path.vertex,
      radius: SECTOR_R,
      from: Math.atan(path.midSlope - path.alpha / 2),
      to: Math.atan(path.inSlope),
      fillOpacity: SECTOR_FILL_OPACITY,
      rimWidth: GUIDE_WIDTH_PX,
      opacity: markVis,
      style: guide,
    });
  }

  // ====================================================================
  // 휘지 않았다면 — 들어오던 방향 그대로 뻗는 점선. 광자가 태양 곁을 지나며 따라 자란다.
  // ====================================================================
  if (px > 0 && keep > 0) {
    const endX = px >= EARTH_X ? UNBENT_END_X : px;
    out.push(
      line(
        'unbent',
        [path.vertex, [endX, unbentY(path, endX)]],
        GUIDE_WIDTH_PX,
        { ...faint, lineStyle: 'dotted' },
        keep,
      ),
    );
  }

  // ====================================================================
  // 거슬러 본 길 — 지구에서 들어온 방향을 곧게 뒤로
  // ====================================================================
  if (traceVis > 0) {
    const backX = EARTH_X + (STAR_X - EARTH_X) * tl.at('trace');
    out.push(
      line('seen-line', [earthPos, [backX, seenY(backX)]], GUIDE_WIDTH_PX, { ...guide, lineStyle: 'dashed' }, keep),
    );
  }

  // ====================================================================
  // 빛의 길과 광자
  // ====================================================================
  if (px > STAR_X && keep > 0) {
    const count = Math.max(1, Math.round((PATH_SAMPLES * (px - STAR_X)) / (EARTH_X - STAR_X)));
    out.push(line('light-path', samplePath(path, STAR_X, px, count), PATH_WIDTH_PX, lightStyle, keep));
  }
  if (tl.at('bend') < 1) {
    out.push({
      type: 'body',
      id: 'photon',
      pos: [px, pathY(path, px)],
      shape: 'circle',
      size: PHOTON_R,
      outline: 'none',
      style: lightStyle,
    });
  }

  // ====================================================================
  // 지구 · 별(실제 자리) · 보이는 별
  // ====================================================================
  out.push({ type: 'body', id: 'earth', pos: earthPos, shape: 'circle', size: EARTH_R, glow: false, style: ink });
  out.push({ type: 'body', id: 'star', pos: starPos, shape: 'circle', size: STAR_R, outline: 'none', glow: false, style: ink });
  // 보이는 별은 거슬러 그은 파선이 별 자리까지 닿은 뒤(`mark`)에 떠오른다.
  if (markVis > 0) {
    out.push({
      type: 'body',
      id: 'seen-star',
      pos: seenPos,
      shape: 'circle',
      size: STAR_R,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: markVis,
      style: ink,
    });
  }

  // 실제 → 보이는 자리. 태양에서 바깥쪽이다.
  if (markVis > 0) {
    out.push({
      type: 'vector',
      id: 'shift',
      from: [STAR_X, starPos[1] + STAR_R + ARROW_GAP],
      // 두 별 원에서 각각 띄운 끝점 사이 — 끝점의 차로 길이를 얻는다.
      delta: [0, (seenPos[1] - STAR_R - ARROW_GAP) - (starPos[1] + STAR_R + ARROW_GAP)],
      width: ARROW_WIDTH_PX,
      opacity: markVis,
      style: guide,
    });
  }

  // ====================================================================
  // 이름표
  // ====================================================================
  out.push(label('sun-label', [0, -SUN_R], [0, LABEL_BELOW], 'label.sun', 'center', 1));
  out.push(label('earth-label', [EARTH_X, -EARTH_R], [0, LABEL_BELOW], 'label.earth', 'center', 1));

  // 별 이름표 — 처음에는 「별」, 보이는 자리가 표시되면 「실제 자리」 로 바뀐다.
  const starNameVis = 1 - markVis;
  if (starNameVis > 0) {
    out.push(label('star-label', starPos, [-LABEL_GAP, 0], 'label.star', 'right', starNameVis));
  }
  if (markVis > 0) {
    out.push(label('true-label', starPos, [-LABEL_GAP, 0], 'label.truePos', 'right', markVis, ink));
    out.push(label('seen-label', seenPos, [-LABEL_GAP, 0], 'label.seenPos', 'right', markVis, ink));

    const ax = path.vertex[0] + SECTOR_R * ANGLE_LABEL_AT;
    out.push({
      type: 'readout',
      id: 'angle-label',
      anchor: { world: [ax, unbentY(path, ax)], offset: [0, LABEL_ABOVE] },
      text: text('label.angle'),
      vars: { a: String(c.deflectionArcsec) },
      chip: false,
      font: 'text',
      fontSize: ANGLE_PX,
      weight: 'bold',
      align: 'left',
      opacity: markVis,
      style: guide,
    });
  }

  if (px > 0 && keep > 0) {
    const endX = UNBENT_END_X;
    out.push(
      label('unbent-label', [endX, unbentY(path, endX)], [0, LABEL_ABOVE], 'label.unbent', 'right', tl.at('bend') * keep),
    );
  }

  // 과장 알림 — 늘 떠 있다. 이 그림의 각은 실제가 아니라고 먼저 말한다.
  out.push({
    type: 'readout',
    id: 'exaggerated',
    anchor: { screen: 'top-left', offset: NOTE_OFFSET },
    text: text('label.exaggerated'),
    vars: { x: String(c.exaggeration) },
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'left',
    style: faint,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/**
 * 고정 경계. 왼쪽은 별 이름표(오른쪽 맞춤)까지, 오른쪽은 지구와 휘지 않은 점선 끝까지, 위는
 * 보이는 별의 이름표까지, 아래는 태양 이름표와 캡션 줄 몫까지. 매 프레임 같은 값이라야 카메라가
 * 흔들리지 않는다 (원칙 6).
 */
export function boundsHint(): Bounds {
  return { minX: -8.4, maxX: 5.3, minY: -1.5, maxY: 2.3 };
}
