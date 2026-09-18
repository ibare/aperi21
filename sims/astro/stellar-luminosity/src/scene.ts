// ========================================================================
// stellar-luminosity — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
//   · 하늘 판 — `region` 빛 없음(`light: 0`). 두 별이 `body` 로 **같은 빛 세기**.
//   · 우주 판(옆모습) — `region` 빛 없음. 가까운 별 · 지구 · 먼 별이 한 줄에 놓인다.
//   · 지구가 받는 빛 — 지구 양옆의 작은 `region`, 빛 세기 = 그 별에서 받은 빛.
//   · 공 — 별을 중심으로 지구를 지나는 점선 원(`trajectory` closed).
//   · 공에 깐 빛 — `sector` 가 지구 쪽에서 양쪽으로 돌아 원판을 채운다. 빛 세기 = 지구가 받는 빛.
//     원판 넓이가 공 겉넓이와 같은 비(d²)로 커지므로 **넓이 × 세기 = 별이 내는 빛**이다.
//   · 되모으기 — 같은 `sector` 가 줄어들며 세기가 오른다. 넓이 × 세기를 지킨다 (physics).
//   · 이름 · 거리 · 광도 글자 — 판 밖 테마 바탕, 판 안은 바탕 칩.
//
// 빛(하늘의 별 · 받는 빛 · 공 · 모은 빛)은 빛 채널로만 칠한다 — 색 역할로 칠하면 라이트 테마에서
// 「밝은 것」 이 짙게 나온다 (G34). 두 별은 같은 색이다 — 다른 것은 빛의 양뿐이다.
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
import { gatheringDisc, readConstants, starFigures, type StarFigure } from './physics';
import {
  DIM_Y,
  EARTH_POS,
  NAME_Y,
  SCENE_BOUNDS,
  SKY_FAR_POS,
  SKY_MAX,
  SKY_MIN,
  SKY_NAME_Y,
  SKY_NEAR_POS,
  SKY_TITLE_Y,
  SPACE_MAX,
  SPACE_MIN,
  text,
  type StellarLuminosityMessageKey,
} from './schema';
import type { StellarLuminosityState } from './state';

/** 하늘 판 별의 반지름(월드). 두 별이 같은 크기다 — 크기로 밝기를 말하지 않는다. */
const SKY_STAR_R = 0.09;
/** 하늘 판 별의 빛 = 받은 빛 × 이 배율. 받은 빛(0.1)은 점 하나로는 너무 어두워 키운다 — 두 별에 같은 배율. */
const SKY_GAIN = 8;
/** 옆모습 별 자리 표시의 반지름과 빛. 광도가 드러나기 전에는 두 별이 같은 모양이다. */
const STAR_MARK_R = 0.07;
const STAR_MARK_LIGHT = 0.55;
/** 지구의 반지름(월드). */
const EARTH_R = 0.08;
/** 지구가 받는 빛 조각의 한 변(월드). */
const PATCH = 0.4;
/** 공 윤곽 · 시선의 빛과 굵기(화면 px). 안내선이라 옅고 가늘다. */
const SPHERE_LINE_LIGHT = 0.42;
const SIGHT_LIGHT = 0.22;
const GUIDE_WIDTH = 1;
/** 공 윤곽을 표본하는 점 수. */
const CIRCLE_SAMPLES = 96;
/** 광도 글자가 떠오르는 시간(초) — 되모은 원판이 멈춘 뒤. */
const LABEL_FADE = 0.4;
/** 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 공 윤곽이 나타나는 램프 배율 — 깔기 진행도의 이 배로 불투명도가 오른다(1/5 지점에서 다 선다). */
const OUTLINE_FADE_IN_RATE = 5;
/** 「받은 빛」 글자가 사라지는 램프 배율 — 깔기 진행도의 이 배로 불투명도가 내린다(1/3 지점에서 다 사라진다). */
const RECEIVED_FADE_OUT_RATE = 3;
/** 지구 이름표를 지구 아래로 띄우는 거리(월드). */
const EARTH_NAME_DROP = 0.55;
/** 「받은 빛」 이름표를 지구 위로 띄우는 거리(월드). */
const RECEIVED_LABEL_RISE = 0.62;
/** 광도 이름표를 되모은 원판 위로 띄우는 거리(월드). */
const LUMINOSITY_LABEL_RISE = 0.38;

function label(
  id: string,
  pos: Vec2,
  key: StellarLuminosityMessageKey,
  opts: { vars?: Record<string, string>; chip?: boolean; opacity?: number; role?: 'muted' | 'ink' } = {},
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text(key),
    ...(opts.vars ? { vars: opts.vars } : {}),
    chip: opts.chip ?? false,
    font: 'text',
    fontSize: LABEL_PX,
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    style: { colorRole: opts.role ?? 'ink', emphasis: 'strong' },
  };
}

function rect(min: Vec2, max: Vec2): Vec2[] {
  return [min, [max[0], min[1]], max, [min[0], max[1]]];
}

function circle(center: Vec2, r: number): Vec2[] {
  return Array.from({ length: CIRCLE_SAMPLES }, (_, i) => {
    const a = (i / CIRCLE_SAMPLES) * Math.PI * 2;
    return [center[0] + r * Math.cos(a), center[1] + r * Math.sin(a)] as Vec2;
  });
}

export function scene(params: {
  state: StellarLuminosityState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('stellar-luminosity: 시간표가 없다');
  const c = readConstants(params.stage);
  const { near, far } = starFigures(c);
  const out: Primitive[] = [];

  const back = tl.at('back');
  const keep = 1 - back;
  const spread = tl.at('spread');
  const gather = tl.at('gather');
  const revealStart = tl.start('reveal');
  const lumOpacity = tl.span(revealStart, revealStart + LABEL_FADE) * keep;

  // ---- 하늘 판 — 두 별이 똑같이 밝다 ----
  out.push({ type: 'region', id: 'sky', points: rect(SKY_MIN, SKY_MAX), light: 0, fillOpacity: 1 });
  const skyStars: readonly [string, Vec2, StarFigure][] = [
    ['sky-near', SKY_NEAR_POS, near],
    ['sky-far', SKY_FAR_POS, far],
  ];
  for (const [id, pos, s] of skyStars) {
    out.push({
      type: 'body',
      id,
      pos,
      shape: 'circle',
      size: SKY_STAR_R,
      outline: 'none',
      glow: true,
      light: Math.min(1, s.received * SKY_GAIN),
    });
  }
  out.push(label('sky-title', [(SKY_MIN[0] + SKY_MAX[0]) / 2, SKY_TITLE_Y], 'label.sky', { role: 'muted' }));
  out.push(label('sky-near-name', [SKY_NEAR_POS[0], SKY_NAME_Y], 'label.near'));
  out.push(label('sky-far-name', [SKY_FAR_POS[0], SKY_NAME_Y], 'label.far'));

  // ---- 우주 판 — 옆모습 ----
  out.push({ type: 'region', id: 'space', points: rect(SPACE_MIN, SPACE_MAX), light: 0, fillOpacity: 1 });

  // 가까운 별은 지구 왼쪽, 먼 별은 오른쪽. 두 공이 지구에서 맞닿는다.
  const sides: readonly [string, StarFigure, number][] = [
    ['near', near, -1],
    ['far', far, 1],
  ];
  const centerOf = (s: StarFigure, dir: number): Vec2 => [EARTH_POS[0] + dir * s.sphereR, EARTH_POS[1]];

  for (const [id, s, dir] of sides) {
    const center = centerOf(s, dir);
    // 시선 — 별에서 지구로 오는 빛의 길.
    out.push({
      type: 'trajectory',
      id: `sight-${id}`,
      points: [center, EARTH_POS],
      light: SIGHT_LIGHT,
      width: GUIDE_WIDTH,
    });
  }

  for (const [id, s, dir] of sides) {
    const center = centerOf(s, dir);
    // 공 윤곽 — 반지름이 거리인 공. 깔기가 시작되면 나타난다.
    const outlineOpacity = Math.min(1, spread * OUTLINE_FADE_IN_RATE) * keep;
    if (outlineOpacity > 0) {
      out.push({
        type: 'trajectory',
        id: `sphere-${id}`,
        points: circle(center, s.sphereR),
        closed: true,
        light: SPHERE_LINE_LIGHT,
        width: GUIDE_WIDTH,
        style: { lineStyle: 'dashed' },
        opacity: outlineOpacity,
      });
    }
    // 공에 깐 빛 → 되모은 빛. 지구 쪽(별에서 본 지구 방향)에서 양쪽으로 돌아 원판을 채운다.
    const toward = dir < 0 ? 0 : Math.PI;
    const disc = gatheringDisc(s, gather);
    const half = Math.PI * spread;
    if (half > 0 && keep > 0) {
      out.push({
        type: 'sector',
        id: `light-${id}`,
        center,
        radius: disc.r,
        from: toward - half,
        to: toward + half,
        light: disc.light,
        fillOpacity: 1,
        rimWidth: 0,
        opacity: keep,
      });
    }
    // 별 자리 — 광도가 드러나기 전에는 두 별이 같은 모양이다.
    out.push({
      type: 'body',
      id: `star-${id}`,
      pos: center,
      shape: 'circle',
      size: STAR_MARK_R,
      outline: 'none',
      glow: false,
      light: STAR_MARK_LIGHT,
    });
    // 지구가 받는 빛 — 공의 지구 자리 한 조각. 언제나 그대로다.
    const x0 = EARTH_POS[0];
    const x1 = EARTH_POS[0] + dir * PATCH;
    out.push({
      type: 'region',
      id: `received-${id}`,
      points: rect([Math.min(x0, x1), EARTH_POS[1] - PATCH / 2], [Math.max(x0, x1), EARTH_POS[1] + PATCH / 2]),
      light: s.received,
      fillOpacity: 1,
    });
  }

  // 지구.
  out.push({
    type: 'body',
    id: 'earth',
    pos: EARTH_POS,
    shape: 'circle',
    size: EARTH_R,
    outline: 'background',
    glow: false,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 글자 ----
  out.push(label('earth-name', [EARTH_POS[0], EARTH_POS[1] - EARTH_NAME_DROP], 'label.earth', { chip: true }));
  const receivedOpacity = Math.max(0, 1 - spread * RECEIVED_FADE_OUT_RATE) + back;
  if (receivedOpacity > 0) {
    out.push(
      label('received', [EARTH_POS[0], EARTH_POS[1] + RECEIVED_LABEL_RISE], 'label.received', {
        chip: true,
        opacity: Math.min(1, receivedOpacity),
      }),
    );
  }
  const names: readonly [string, StarFigure, number, StellarLuminosityMessageKey][] = [
    ['near', near, -1, 'label.near'],
    ['far', far, 1, 'label.far'],
  ];
  const dimOpacity = tl.at('distance') * keep;
  for (const [id, s, dir, nameKey] of names) {
    const center = centerOf(s, dir);
    out.push(label(`name-${id}`, [center[0], NAME_Y], nameKey));
    if (dimOpacity > 0) {
      out.push({
        type: 'dimension',
        id: `distance-${id}`,
        from: [center[0], DIM_Y],
        to: [EARTH_POS[0], DIM_Y],
        text: text('label.distance'),
        vars: { d: String(s.d) },
        opacity: dimOpacity,
      });
    }
    if (lumOpacity > 0) {
      out.push(
        // 원판 위에 둔다 — 아래는 지구 이름표 자리라 가까운 별 쪽에서 겹친다.
        label(`luminosity-${id}`, [center[0], center[1] + s.gatheredR + LUMINOSITY_LABEL_RISE], 'label.luminosity', {
          vars: { l: String(s.l) },
          chip: true,
          opacity: lumOpacity,
        }),
      );
    }
  }

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
