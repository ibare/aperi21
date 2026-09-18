// ========================================================================
// orbital-transfer — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 행성 · 우주선 · 쌍둥이(body), 안내 원 ·
// 자취(trajectory), 속도 · 밀기(vector)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 우주선은 먹색, 속도 화살표는 primary, 우주선이 실제로 간 길은 secondary,
// 행성 · 안내 원은 배경 정보라 muted. **강조색(accent)은 밀기(Δv) 한 뜻에만** 쓴다.
//
// 쌍둥이는 같은 모양 · 같은 색을 옅게 칠한다 — 「같은 우주선이 밀지 않았다면」 이라 색을 바꾸지 않는다.
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
  BURN1_ANGLE,
  BURN2_ANGLE,
  burnProgress,
  cycleOpacity,
  onCircle,
  readConstants,
  shipAt,
  transferOf,
  twinAt,
} from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { OrbitalTransferState } from './state';

/** 우주선 · 쌍둥이 반지름(월드). */
const SHIP_R = 0.07;
/** 행성의 짙기 — 배경 정보라 한 걸음 물린다. */
const PLANET_OPACITY = 0.55;
/** 안내 원(낮은 · 높은 원 궤도)의 짙기. */
const GUIDE_OPACITY = 0.8;
/** 안내 원 선 굵기(화면 px) — 안내선이라 가늘다. */
const GUIDE_WIDTH_PX = 1;
/** 자취 선 굵기(화면 px). */
const TRAIL_WIDTH_PX = 2.5;
/** 속도 · 밀기 화살표 굵기(화면 px). */
const ARROW_WIDTH_PX = 3;
/** 밀지 않은 쌍둥이와 그 속도 화살표의 짙기. */
const TWIN_OPACITY = 0.4;
/** 안내 원을 긋는 표본 수 — 원이 각져 보이지 않는 촘촘함. */
const GUIDE_SAMPLES = 180;

export function scene(params: {
  state: OrbitalTransferState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('orbital-transfer: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const tr = transferOf(c);
  const k = c.arrowPerSpeed;
  const fade = cycleOpacity(tl);
  const out: Primitive[] = [];

  // ---- 안내 원 · 행성 ----
  for (const [id, r] of [
    ['guide-low', c.innerRadius],
    ['guide-high', c.outerRadius],
  ] as const) {
    out.push({
      type: 'trajectory',
      id,
      points: circle(r),
      closed: true,
      width: GUIDE_WIDTH_PX,
      opacity: GUIDE_OPACITY,
      style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dotted' },
    });
  }
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

  const ship = shipAt(c, tr, tl);

  // ---- 우주선이 간 길 ----
  if (ship.trail.length >= 2) {
    out.push({
      type: 'trajectory',
      id: 'trail',
      points: ship.trail,
      width: TRAIL_WIDTH_PX,
      opacity: fade,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  }

  // ---- 밀기 자국 — 밀기가 끝나면 그 자리에 남는다. 두 자국이 옮겨 가는 데 든 전부다 ----
  const burn1At = onCircle(c, c.innerRadius, BURN1_ANGLE).pos;
  const burn2At = onCircle(c, c.outerRadius, BURN2_ANGLE).pos;
  const dv1 = (tr.vp - tr.v1) * k;
  const dv2 = (tr.v2 - tr.va) * k;
  if (tl.u >= tl.start('transfer')) {
    out.push(push('dv1-mark', burn1At, [dv1, 0], 'label.dv1', fade));
  }
  if (tl.u >= tl.start('high')) {
    out.push(push('dv2-mark', burn2At, [-dv2, 0], 'label.dv2', fade));
  }

  // ---- 밀지 않은 쌍둥이 — 낮은 궤도를 계속 돈다 ----
  const twin = twinAt(c, tl);
  if (twin) {
    out.push({
      type: 'vector',
      id: 'twin-velocity',
      from: twin.pos,
      delta: scaled(twin.vel, k),
      width: ARROW_WIDTH_PX,
      opacity: TWIN_OPACITY * fade,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
    out.push({
      type: 'body',
      id: 'twin',
      pos: twin.pos,
      shape: 'circle',
      size: SHIP_R,
      outline: 'none',
      glow: false,
      opacity: TWIN_OPACITY * fade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 우주선의 속도 — 길이가 곧 빠르기다 ----
  const v = scaled(ship.vel, k);
  out.push({
    type: 'vector',
    id: 'ship-velocity',
    from: ship.pos,
    delta: v,
    width: ARROW_WIDTH_PX,
    opacity: fade,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // 밀기 동안 속도 화살표 끝에서 Δv 가 자란다. 우주선은 그동안 멈춰 있다.
  if (ship.leg === 'burn1' || ship.leg === 'burn2') {
    const first = ship.leg === 'burn1';
    const grow = burnProgress(tl, ship.leg);
    const len = (first ? dv1 : dv2) * grow;
    const dir = first ? 1 : -1;
    out.push(
      push(
        'dv-live',
        [ship.pos[0] + v[0], ship.pos[1] + v[1]],
        [dir * len, 0],
        first ? 'label.dv1' : 'label.dv2',
        1,
      ),
    );
  }

  out.push({
    type: 'body',
    id: 'ship',
    pos: ship.pos,
    shape: 'circle',
    size: SHIP_R,
    outline: 'background',
    glow: false,
    opacity: fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 밀기 화살표 — 강조색은 이 뜻 하나에만 쓴다. */
function push(
  id: string,
  from: Vec2,
  delta: Vec2,
  label: 'label.dv1' | 'label.dv2',
  opacity: number,
): Primitive {
  return {
    type: 'vector',
    id,
    from,
    delta,
    width: ARROW_WIDTH_PX,
    label: text(label),
    labelSide: 'ccw',
    opacity,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
}

function scaled(v: Vec2, k: number): Vec2 {
  return [v[0] * k, v[1] * k];
}

function circle(r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < GUIDE_SAMPLES; i++) {
    const th = (2 * Math.PI * i) / GUIDE_SAMPLES;
    pts.push([r * Math.cos(th), r * Math.sin(th)]);
  }
  return pts;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
