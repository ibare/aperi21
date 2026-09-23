// ========================================================================
// projectile-range — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 지면(surface) ·
// 경로(trajectory) · 공(body) · 발사 속도(vector) · 착지 자국과 파문(trace) ·
// 각도 이름표(readout) · 더 간 거리(dimension) 가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 공 · 경로 · 자국은 모두 먹색(다섯이 **같은 공**이라 같은
// 색이다. 각도를 색으로 가르면 색이 형태의 일을 가로챈다), 발사 속도는 primary,
// **강조색은 「45° 가 더 간 거리」 한 가지 뜻에만**. 지면은 배경 정보라 muted.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  aimOpacity,
  extraOpacity,
  readConstants,
  readShot,
  sceneOpacity,
  type ShotReading,
} from './physics';
import {
  ANGLE_LABEL_R,
  ARROW_SCALE,
  BALL_R,
  EXTRA_DIM_Y,
  GROUND_Y,
  MARK_LABEL_Y_FIRST,
  MARK_LABEL_Y_SECOND,
  MARK_LEN,
  SCENE_BOUNDS,
  SPLASH_LIFE,
  text,
  type ProjectileRangeMessageKey,
} from './schema';
import type { ProjectileRangeState } from './state';

/** 경로 하나를 이루는 마디 수. 상태로 계산하지 않는 고정값이다. */
const PATH_SAMPLES = 48;
/** 경로 선의 굵기(화면 px)와 짙기. 주인공은 공과 자국이라 뒤로 물러나 있다. */
const PATH_WIDTH_PX = 1.5;
const PATH_OPACITY = 0.5;

/** 착지 자국 획의 굵기(화면 px). 지면선보다 굵어야 자국으로 읽힌다. */
const MARK_WIDTH_PX = 2;

/** 착지 파문 — 처음 반지름 · 퍼지는 끝 반지름 · 획 굵기(화면 px)와 처음 짙기. */
const SPLASH_SIZE_PX = 9;
const SPLASH_SPREAD_PX = 34;
const SPLASH_WIDTH_PX = 2;
const SPLASH_OPACITY = 0.7;
/**
 * 파문이 도는 각도 범위 — 월드 x 축에서 반시계로 0 ~ π, 곧 **지면 위 반원**이다.
 * 온전한 원으로 그리면 땅 밑으로도 퍼진다.
 */
const SPLASH_ARC: readonly [number, number] = [0, Math.PI];

/** 각도 이름표의 글자 크기(화면 px). 도식에 붙는 표식이라 본문보다 작다. */
const ANGLE_LABEL_PX = 12;

/** 자국 획이 지면 위로 솟는 방향. */
const MARK_DIRECTION: Vec2 = [0, 1];

/** 한 발 — 물리로 읽은 것과 그 발의 이름표 · 이름표가 놓일 줄. */
interface Shot extends ShotReading {
  /** 선언 안에서 유일한 이름. */
  id: string;
  /** 각도 표식의 문안 키. */
  label: ProjectileRangeMessageKey;
  /** 착지 이름표가 놓이는 줄의 높이(m). */
  labelY: number;
}

export function scene(params: {
  state: ProjectileRangeState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('projectile-range: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const aimAlpha = aimOpacity(timeline) * alpha;
  const extraAlpha = extraOpacity(timeline) * alpha;
  const out: Primitive[] = [];

  const read = (
    id: string,
    deg: number,
    label: ProjectileRangeMessageKey,
    labelY: number,
  ): Shot => ({ ...readShot(timeline, deg, c, PATH_SAMPLES), id, label, labelY });

  // 짝의 **나중에 내려온 쪽**(60° · 75°)이 둘째 줄을 쓴다.
  const shallow = read('shallow', c.angles.shallow, 'label.deg15', MARK_LABEL_Y_FIRST);
  const low = read('low', c.angles.low, 'label.deg30', MARK_LABEL_Y_FIRST);
  const best = read('best', c.angles.best, 'label.deg45', MARK_LABEL_Y_FIRST);
  const high = read('high', c.angles.high, 'label.deg60', MARK_LABEL_Y_SECOND);
  const steep = read('steep', c.angles.steep, 'label.deg75', MARK_LABEL_Y_SECOND);
  const shots: readonly Shot[] = [shallow, low, best, high, steep];

  // ---- 지면 ----
  out.push({
    type: 'surface',
    id: 'ground',
    geometry: { kind: 'ground', y: GROUND_Y },
    material: 'solid',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 경로 다섯 ----
  // 다섯이 같은 색 · 같은 굵기다. 내려앉은 뒤에도 남아, 짝지은 둘의 포물선이
  // **같은 x 에서 끝나는 것**이 한 화면에 보인다.
  for (const shot of shots) {
    if (shot.flown <= 0) continue;
    out.push({
      type: 'trajectory',
      id: `path-${shot.id}`,
      points: shot.path,
      width: PATH_WIDTH_PX,
      opacity: PATH_OPACITY * alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 착지 자국 ----
  // 지면을 가로지르는 짧은 획. 짝지은 둘은 **같은 자리에** 겹쳐 하나로 남는다 —
  // 그것이 이 조각이 말하려는 사실이다.
  const landed = shots.filter((s) => s.landed);
  if (landed.length > 0) {
    out.push({
      type: 'trace',
      id: 'landing-marks',
      marks: landed.map((s) => ({ pos: [s.range, GROUND_Y] as Vec2 })),
      shape: 'tick',
      size: MARK_LEN,
      direction: MARK_DIRECTION,
      width: MARK_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 착지 파문 ----
  // 내려앉는 순간의 짧은 강조. 공이 사라지고 자국이 남는 자리를 눈이 놓치지 않게 한다.
  const splashes: Trace['marks'] = shots
    .filter((s) => s.landed && s.landedFor < SPLASH_LIFE)
    .map((s) => ({ pos: [s.range, GROUND_Y] as Vec2, age: s.landedFor }));
  if (splashes.length > 0) {
    out.push({
      type: 'trace',
      id: 'landing-splash',
      marks: splashes,
      shape: 'ring',
      size: SPLASH_SIZE_PX,
      spreadTo: SPLASH_SPREAD_PX,
      arc: SPLASH_ARC,
      life: SPLASH_LIFE,
      width: SPLASH_WIDTH_PX,
      opacity: SPLASH_OPACITY * alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 공 다섯 ----
  // 내려앉으면 지운다 — 남는 것은 자국이고, 같은 자리에 공 둘이 겹쳐 서 있으면
  // 하나로 보여 「둘이 같은 자리에 왔다」 가 오히려 가려진다.
  for (const shot of shots) {
    if (shot.landed) continue;
    out.push({
      type: 'body',
      id: `ball-${shot.id}`,
      pos: shot.pos,
      shape: 'circle',
      size: BALL_R,
      outline: 'none',
      glow: false,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 발사 속도 화살표 다섯 ----
  // **다섯의 길이가 같다** — 그것이 「같은 속력」 을 말하는 방식이다. 속력의 수를
  // 적지 않는다. 쏘는 동안 걷힌다.
  if (aimAlpha > 0) {
    const arrowLen = c.speed * ARROW_SCALE;
    for (const shot of shots) {
      const rad = (shot.angleDeg * Math.PI) / 180;
      out.push({
        type: 'vector',
        id: `aim-${shot.id}`,
        from: [0, GROUND_Y],
        delta: [arrowLen * Math.cos(rad), arrowLen * Math.sin(rad)],
        opacity: aimAlpha,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
      out.push({
        type: 'readout',
        id: `aim-label-${shot.id}`,
        anchor: {
          world: [ANGLE_LABEL_R * Math.cos(rad), GROUND_Y + ANGLE_LABEL_R * Math.sin(rad)],
        },
        text: text(shot.label),
        chip: false,
        fontSize: ANGLE_LABEL_PX,
        align: 'center',
        opacity: aimAlpha,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  }

  // ---- 착지한 각도의 이름표 ----
  // 자국 **아래**에 줄로 쌓인다. 같은 자국에 이름표 둘이 위아래로 붙는 것이
  // 「이 둘이 같은 자리에 내려앉았다」 이고, 45° 만 한 줄로 홀로 있다.
  for (const shot of shots) {
    if (!shot.landed) continue;
    out.push({
      type: 'readout',
      id: `mark-label-${shot.id}`,
      anchor: { world: [shot.range, shot.labelY] },
      text: text(shot.label),
      chip: false,
      fontSize: ANGLE_LABEL_PX,
      align: 'center',
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 45° 가 더 간 거리 ----
  // 강조색이 쓰이는 유일한 자리다. 재는 것은 「짝이 있는 가장 먼 자국」(30° · 60°)
  // 에서 「짝 없이 홀로 남은 자국」(45°) 까지이고, 수를 적지 않는다 — 길이가 곧 말이다.
  if (extraAlpha > 0) {
    out.push({
      type: 'dimension',
      id: 'extra-range',
      from: [low.range, EXTRA_DIM_Y],
      to: [best.range, EXTRA_DIM_Y],
      opacity: extraAlpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
