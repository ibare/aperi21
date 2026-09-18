// ========================================================================
// orbital-velocity — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 행성 · 산 · 포탄(body) · 자취
// (trajectory) · 쏜 속도(vector) · 배수 글자(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 포탄은 먹색, 쏜 속도(화살표와 그 배수)는 primary, 포탄이 실제로 간 길과
// 그 길의 배수 글자는 secondary, 행성 · 산은 배경 정보라 muted. **강조색은 쓰지 않는다** — 원을
// 강조색으로 칠하면 「원은 한 속도에서만」 을 모양이 아니라 색이 말한다.
//
// **궤도 원을 미리 그리지 않는다.** 원도 타원도 포탄이 지나간 자취로만 생긴다.
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
  SHOT_PHASES,
  currentShot,
  orbitOf,
  progressAlong,
  readConstants,
  shotElapsed,
  trailOpacity,
  type Orbit,
} from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { OrbitalVelocityState } from './state';

/** 포탄 반지름(월드). */
const BALL_R = 0.045;
/** 산 밑동의 반폭(월드). 산꼭대기가 쏘는 자리다. */
const MOUNTAIN_HALF_WIDTH = 0.17;
/** 산 밑동을 행성 안으로 묻는 깊이(월드) — 둥근 땅과 곧은 밑변 사이에 틈이 보이지 않게. */
const MOUNTAIN_SINK = 0.04;
/** 행성 · 산의 짙기 — 배경 정보라 한 걸음 물린다. */
const PLANET_OPACITY = 0.55;
/** 지나간 샷 자취의 짙기 — 지금 쏘는 샷과 갈리게 물린다. */
const PAST_TRAIL_OPACITY = 0.5;
/** 자취 선 굵기(화면 px). */
const TRAIL_WIDTH_PX = 2.5;
/** 쏜 속도 화살표 굵기(화면 px). */
const ARROW_WIDTH_PX = 3;
/** 배수 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 배수 글자를 기준점에서 띄우는 거리(화면 px). */
const LABEL_GAP = 14;
/**
 * 땅에 떨어진 자리의 배수 글자를 행성 **안쪽**으로 들이는 거리(화면 px). 바깥쪽은 뒤 샷들의 자취가
 * 지나는 자리라 글자가 선 위에 얹힌다(첫 촬영 t=3.2 · 19.5).
 */
const LAND_LABEL_GAP = 26;
/**
 * 열린 궤도의 배수 글자가 서는 가로 자리(오른쪽 끝에서 안쪽으로, 월드). 포탄은 화면 밖으로
 * 나가지만 글자는 그 길이 끝에 닿기 전에 선다.
 */
const OPEN_LABEL_INSET = 0.35;

export function scene(params: {
  state: OrbitalVelocityState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('orbital-velocity: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];
  const now = currentShot(tl);
  const fade = trailOpacity(tl);

  // ---- 행성 · 산 ----
  out.push({
    type: 'body',
    id: 'planet',
    pos: [0, 0],
    shape: 'circle',
    size: c.planetRadius,
    outline: 'none',
    glow: false,
    opacity: PLANET_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const w = MOUNTAIN_HALF_WIDTH;
  const peak = c.launchRadius - c.planetRadius + MOUNTAIN_SINK;
  out.push({
    type: 'body',
    id: 'mountain',
    pos: [0, c.planetRadius - MOUNTAIN_SINK],
    shape: 'custom',
    customPath: `M ${-w} 0 L 0 ${peak} L ${w} 0 Z`,
    opacity: PLANET_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 샷마다의 자취 · 배수 글자 ----
  const launch: Vec2 = [0, c.launchRadius];
  for (let i = 0; i < SHOT_PHASES.length; i++) {
    const s = shotElapsed(tl, i);
    if (s <= 0) continue;
    const k = c.speeds[i]!;
    const orbit = orbitOf(c, k);
    const go = progressAlong(orbit, s);
    const live = i === now;
    // 쏘는 동안 지난 자취는 물린다. 다 쏜 뒤(`hold`)에는 다섯이 같은 짙기로 나란히 선다.
    const opacity = (live || now < 0 ? 1 : PAST_TRAIL_OPACITY) * fade;

    if (go.trail.length >= 2) {
      out.push({
        type: 'trajectory',
        id: `trail-${i + 1}`,
        points: go.trail,
        closed: orbit.end === 'closed' && s >= orbit.duration,
        width: TRAIL_WIDTH_PX,
        opacity,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
    }

    // 자취의 배수 글자 — 포탄이 그 자리를 지나야 선다.
    const tag = labelSpot(orbit);
    if (go.reached >= tag.index) {
      out.push({
        type: 'readout',
        id: `trail-label-${i + 1}`,
        anchor: { world: orbit.points[tag.index]!, offset: tag.offset },
        text: text('label.speed'),
        vars: { k: String(k) },
        chip: false,
        font: 'text',
        fontSize: LABEL_PX,
        align: 'center',
        opacity,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
    }

    if (!live) continue;

    // ---- 지금 쏘는 포탄 ----
    // 열린 궤도는 따라가기를 멈춘 뒤(화면 밖) 포탄을 두지 않는다.
    if (!(orbit.end === 'open' && s >= orbit.duration)) {
      out.push({
        type: 'body',
        id: 'ball',
        pos: go.at,
        shape: 'circle',
        size: BALL_R,
        outline: 'none',
        glow: false,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }

    // ---- 쏜 속도 ----
    // 쏘는 자리에 남아 이번 샷의 속도를 가리킨다 — 길이가 곧 빠르기다.
    const len = k * c.arrowPerSpeed;
    out.push({
      type: 'vector',
      id: 'launch-velocity',
      from: launch,
      delta: [len, 0],
      width: ARROW_WIDTH_PX,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'launch-label',
      anchor: { world: [launch[0] + len, launch[1]], offset: [0, -LABEL_GAP] },
      text: text('label.speed'),
      vars: { k: String(k) },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/**
 * 자취에 배수 글자를 붙일 자리 — 표본 번호와 화면 띄움.
 *
 * - 떨어진 궤도: 땅에 닿은 자리, 행성 안쪽으로 들인다.
 * - 닫힌 궤도: 쏜 자리 반대편(가장 아래), 아래로 띄운다 — 원과 타원의 글자가 세로로 갈린다.
 * - 열린 궤도: 오른쪽 끝 조금 안쪽을 지나는 자리, 위로 띄운다.
 */
function labelSpot(orbit: Orbit): { index: number; offset: Vec2 } {
  const pts = orbit.points;
  const last = pts.length - 1;
  if (orbit.end === 'land') {
    const p = pts[last]!;
    const r = Math.hypot(p[0], p[1]) || 1;
    // 중심 쪽으로. 화면 y 는 아래가 + 라 월드 y 를 뒤집는다.
    return { index: last, offset: [(-p[0] / r) * LAND_LABEL_GAP, (p[1] / r) * LAND_LABEL_GAP] };
  }
  if (orbit.end === 'closed') {
    return { index: Math.round(last / 2), offset: [0, LABEL_GAP] };
  }
  const limit = SCENE_BOUNDS.maxX - OPEN_LABEL_INSET;
  let index = pts.findIndex((p) => p[0] >= limit);
  if (index < 0) index = last;
  return { index, offset: [0, -LABEL_GAP] };
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
