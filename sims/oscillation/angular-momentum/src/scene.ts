// ========================================================================
// angular-momentum — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 3 차원 팽이를 고정 시점으로 투영한 좌표(physics.ts `project`)를 월드 좌표로 쓴다.
// 팽이 하나 = 몸통(끝점과 원판 테의 볼록 껍질, `region`) · 원판 윗면(`region`) · 테
// (`trajectory` closed) · 바큇살(`lineSet`, 도는 만큼 잔상이 부채꼴로 번진다) · 축 막대
// (`trajectory`) · 머리(`body` point).
//
// 색은 뜻마다 하나다 — 세 팽이는 같은 대상이라 같은 색(먹 · 회색), **강조색은 「같은
// 충격」 한 뜻에만**(치는 화살표). 머리가 지나온 자취는 secondary, 곧게 선 기준선 ·
// 바닥 판은 배경 정보라 muted.
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
  TO_VIEWER,
  add3,
  cross3,
  mul3,
  norm3,
  project,
  readConstants,
  readTop,
  sceneOpacity,
  type Vec3,
} from './physics';
import {
  CROWN_HEIGHT,
  DISC_HEIGHT,
  DISC_RADIUS,
  FLOOR_BACK_Y,
  FLOOR_FRONT_Y,
  LABEL_Y,
  PLUMB_HEIGHT,
  SCENE_BOUNDS,
  TAP_ARROW_GAP,
  TAP_ARROW_LEN,
  TOP_X,
  text,
  type AngularMomentumMessageKey,
} from './schema';
import type { AngularMomentumState } from './state';

/** 원판 테 표본 수. */
const RIM_SAMPLES = 40;
/** 바큇살 수. */
const SPOKES = 3;
/**
 * 바큇살이 화면에서 도는 빠르기 — 각운동량 1 당 rad/s. 실제 스핀(수십 rad/s)은 화면
 * 주사율에 걸려 거꾸로 도는 것처럼 보이므로 비례만 지킨다.
 */
const VISUAL_SPIN_PER_L = 0.9;
/** 잔상 바큇살 — 몇 겹을, 각운동량 1 당 얼마 간격(rad)으로. 정지 화면에서도 빠르기가 읽힌다. */
const SPOKE_GHOSTS = 6;
const GHOST_STEP_PER_L = 0.022;
/** 곧게 선 기준선 · 자취 · 테 · 축의 굵기(화면 px). 굵기는 위계다. */
const PLUMB_WIDTH = 1;
const TRAIL_WIDTH = 2;
const RIM_WIDTH = 1.5;
const STEM_WIDTH = 3.5;
const SPOKE_WIDTH = 1.5;
/** 몸통 · 원판 윗면 짙기. 겹쳐도 짙어지지 않게 불투명하게 깐다. */
const BODY_FILL = 0.62;
const FACE_FILL = 0.28;
/** 충격이 지나간 뒤 남겨 두는 화살표의 짙기 — 「같은 충격」 을 결과 화면에서도 견준다. */
const TAP_GHOST_OPACITY = 0.35;
/** 바닥 판 짙기. 배경이라 가장 옅다. */
const FLOOR_FILL = 0.14;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;

const LABELS: readonly AngularMomentumMessageKey[] = ['label.still', 'label.slow', 'label.fast'];

/** 볼록 껍질(모노톤 체인). 몸통의 실루엣 = 끝점과 원판 테의 껍질이다. */
function hull(points: Vec2[]): Vec2[] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const turn = (o: Vec2, a: Vec2, b: Vec2): number =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Vec2[] = [];
  for (const q of p) {
    while (lower.length >= 2 && turn(lower[lower.length - 2]!, lower[lower.length - 1]!, q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper: Vec2[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i]!;
    while (upper.length >= 2 && turn(upper[upper.length - 2]!, upper[upper.length - 1]!, q) <= 0) upper.pop();
    upper.push(q);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

export function scene(params: {
  state: AngularMomentumState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('angular-momentum: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const out: Primitive[] = [];

  // ---- 바닥 ----
  // 옅은 판과 앞 가장자리 선. 끝점은 판 한가운데 깊이에 선다.
  out.push({
    type: 'region',
    id: 'floor',
    points: [
      [SCENE_BOUNDS.minX, FLOOR_FRONT_Y],
      [SCENE_BOUNDS.maxX, FLOOR_FRONT_Y],
      [SCENE_BOUNDS.maxX, FLOOR_BACK_Y],
      [SCENE_BOUNDS.minX, FLOOR_BACK_Y],
    ],
    fillOpacity: FLOOR_FILL,
    opaque: true,
    outline: [[0, 1]],
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  c.spins.forEach((spin, k) => {
    const x0 = TOP_X[k]!;
    const at = (p: Vec3): Vec2 => {
      const q = project(p);
      return [q[0] + x0, q[1]];
    };
    const top = readTop(timeline, spin, c);
    const a = top.axis;

    // 곧게 선 기준선. 기울기를 이것에 견줘 읽는다 — 눈금 없이 「얼마나 벗어났나」 만.
    out.push({
      type: 'trajectory',
      id: `plumb-${k}`,
      points: [at([0, 0, 0]), at([0, 0, PLUMB_HEIGHT])],
      width: PLUMB_WIDTH,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
    });

    // 머리가 지나온 자취. 안 도는 팽이는 바닥까지 긋는 호, 도는 팽이는 제자리 둘레의 고리.
    if (top.trail.length >= 2) {
      out.push({
        type: 'trajectory',
        id: `trail-${k}`,
        points: top.trail.map(at),
        width: TRAIL_WIDTH,
        opacity: alpha,
        style: { colorRole: 'secondary', emphasis: 'strong', fade: 'tail' },
      });
    }

    // ---- 팽이 몸 ----
    const ref: Vec3 = Math.abs(a[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u = norm3(cross3(a, ref));
    const v = cross3(a, u);
    const center = mul3(a, DISC_HEIGHT);
    const rim3 = (th: number): Vec3 =>
      add3(center, add3(mul3(u, DISC_RADIUS * Math.cos(th)), mul3(v, DISC_RADIUS * Math.sin(th))));
    const rim: Vec2[] = [];
    for (let i = 0; i < RIM_SAMPLES; i++) rim.push(at(rim3((i / RIM_SAMPLES) * Math.PI * 2)));
    const silhouette = hull([at([0, 0, 0]), ...rim]);
    const faceUp = a[0] * TO_VIEWER[0] + a[1] * TO_VIEWER[1] + a[2] * TO_VIEWER[2] > 0;

    const stem: Primitive = {
      type: 'trajectory',
      id: `stem-${k}`,
      points: [at(center), at(mul3(a, CROWN_HEIGHT))],
      width: STEM_WIDTH,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    const bodyFill: Primitive = {
      type: 'region',
      id: `body-${k}`,
      points: silhouette,
      fillOpacity: BODY_FILL,
      opaque: true,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    const bodyEdge: Primitive = {
      type: 'trajectory',
      id: `body-edge-${k}`,
      points: silhouette,
      closed: true,
      width: RIM_WIDTH,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };

    if (faceUp) {
      // 윗면이 보인다 — 몸통 위에 원판 윗면 · 바큇살 · 축 막대가 얹힌다.
      out.push(bodyFill, bodyEdge);
      out.push({
        type: 'region',
        id: `face-${k}`,
        points: rim,
        fillOpacity: FACE_FILL,
        opaque: true,
        opacity: alpha,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
      out.push({
        type: 'trajectory',
        id: `rim-${k}`,
        points: rim,
        closed: true,
        width: RIM_WIDTH,
        opacity: alpha,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      // 바큇살. 도는 팽이는 지나온 각에 옅은 잔상을 남겨 부채꼴로 번진다 — 빠를수록 넓다.
      const psi = spin * VISUAL_SPIN_PER_L * timeline.t;
      const ghosts = spin > 0 ? SPOKE_GHOSTS : 1;
      const lines: Vec2[][] = [];
      const opacities: number[] = [];
      for (let g = 0; g < ghosts; g++) {
        const back = g * spin * GHOST_STEP_PER_L;
        for (let s = 0; s < SPOKES; s++) {
          lines.push([at(center), at(rim3(psi - back + (s * 2 * Math.PI) / SPOKES))]);
          opacities.push(g === 0 ? 1 : 0.5 * (1 - g / ghosts));
        }
      }
      out.push({
        type: 'lineSet',
        id: `spokes-${k}`,
        lines,
        opacities,
        width: SPOKE_WIDTH,
        opacity: alpha,
        style: { colorRole: 'ink', emphasis: 'medium' },
      });
      out.push(stem);
    } else {
      // 아랫면 쪽에서 본다 — 축 막대가 원판 뒤로 가고 몸통이 원판을 가린다.
      out.push(stem, bodyFill, bodyEdge);
    }

    out.push({
      type: 'body',
      id: `crown-${k}`,
      pos: at(mul3(a, CROWN_HEIGHT)),
      shape: 'point',
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // ---- 치는 화살표 ----
    // 셋에게 같은 길이 · 같은 자리다. 다가와 머리에 닿는 순간 충격이 들어가고, 그 뒤로는
    // 친 자리에 옅게 남겨 결과 화면에서도 「같은 충격」 을 견줄 수 있게 한다.
    // 치는 방향은 월드 +x 다 — 투영하면 화면에서 조금 아래로 기운다.
    const approach = timeline.at('tap');
    const struck = timeline.u >= timeline.end('tap');
    if (approach > 0) {
      const gap = struck ? 0 : TAP_ARROW_GAP * (1 - approach);
      const tail = at([-TAP_ARROW_LEN - gap, 0, CROWN_HEIGHT]);
      const head = at([-gap, 0, CROWN_HEIGHT]);
      out.push({
        type: 'vector',
        id: `tap-${k}`,
        from: tail,
        delta: [head[0] - tail[0], head[1] - tail[1]],
        width: 3,
        opacity: alpha * (struck ? TAP_GHOST_OPACITY : 1),
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }

    // ---- 이름표 ----
    out.push({
      type: 'readout',
      id: `label-${k}`,
      anchor: { world: [x0, LABEL_Y] },
      text: text(LABELS[k]!),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
