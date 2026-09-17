// ========================================================================
// tidal-force — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 한 월드에 판 둘을 나란히 둔다. 월드 1 단위가 원본 캔버스 1 px 이고 y 는 위다.
// 왼쪽 판은 물리 좌표를 0.95 배, 오른쪽 판은 구름 중심을 빼고 1.4 배 해 옮긴다 —
// 같은 입자 상태를 좌표만 바꿔 그린다. 판 단위 좌표계가 없어 인스턴스마다 옮긴다
// (NOTES G10).
//
// 어휘로 근사한 둘 (NOTES 「어휘 부족」):
// - 천체 중력장의 1/r² 음영 → 동심 원판(`region`) 누적 알파
// - 조석 잔차장의 흐르는 획 → 획마다 `trace` tick 인스턴스 하나
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  ParticleSystem,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { gravityAt, gravityParameter, screenClock } from './physics';
import { CANVAS_H, CANVAS_W, LEFT, RIGHT, SCENE_BOUNDS, STREAK_STEP, text } from './schema';
import type { TidalForceState } from './state';

// ---- 원본 상수 (px) ----

/** 중력장 음영 — 가장 짙은 알파와 번지는 끝 반지름. */
const FIELD_ALPHA = 0.42;
const FIELD_REACH = 520;
/** 원본 방사형 그라데이션의 색 정지점 수 — 정지점 사이는 선형이다. */
const FIELD_STOPS = 14;
/** 음영을 근사하는 동심 원판 수와 원판 둘레의 꼭짓점 수. */
const FIELD_BANDS = 56;
const DISC_SIDES = 96;
/**
 * 중력장 음영과 조석 잔차장은 같은 대상(중력)이라 같은 색이다. 원본의 옅은 푸른 회색에
 * 짙기가 가장 가까운 것이 `secondary` 의 `subtle` 이다 — `strong` 은 원본보다 짙고 채도가 높아
 * 흐름 무늬가 먼지와 강조색을 누른다 (NOTES G08).
 */
const FIELD_EMPHASIS = 'subtle' as const;

/** 꺾쇠 한 팔 길이 · 굵기. */
const BRACKET_ARM = 10;
const BRACKET_WIDTH_PX = 1.5;
/** 왼쪽 먼지 — 원본 2 × 2 px 사각 점과 넓이가 같은 원. */
const LEFT_DUST_PX = 1.13;
/** 양 끝 먼지 반지름 — 왼쪽 3, 오른쪽 4 (원본 px = 월드). */
const LEFT_END_R = 3;
const RIGHT_END_R = 4;
const RIGHT_DUST_PX = 1.7;
const END_LINE_PX = 2;
/** 흐름 무늬 — 획 굵기, 길이 4 + 12s, 짙기 0.1 + 0.75s, 흐르는 빠르기. */
const STREAK_WIDTH_PX = 1.6;
const STREAK_MIN_LEN = 4;
const STREAK_GAIN_LEN = 12;
const STREAK_MIN_ALPHA = 0.1;
const STREAK_GAIN_ALPHA = 0.75;
const STREAK_RATE = 0.9;
const STREAK_SLIDE = 0.7;
/** 점선 원 굵기. */
const GHOST_WIDTH_PX = 1.2;
const GHOST_SIDES = 72;
/** 확대 화면 테두리 굵기와 이름의 자리 · 크기. */
const FRAME_WIDTH_PX = 1;
const NAME_FONT_PX = 13;
const NAME_INSET: Vec2 = [10, 8];

// ---- 좌표 ----

/** 원본 화면 px → 월드. */
const w = (px: number, py: number): Vec2 => [px, -py];
/** 물리 좌표 → 왼쪽 판(정지틀). */
const toLeft = (x: number, y: number): Vec2 => w(LEFT.bodyX + x * LEFT.scale, LEFT.cy + y * LEFT.scale);
/** 중심에 대한 상대 좌표 → 오른쪽 판(함께 떨어지는 틀). */
const toRight = (dx: number, dy: number): Vec2 => w(RIGHT.cx + dx * RIGHT.zoom, RIGHT.cy + dy * RIGHT.zoom);

const CANVAS_CLIP = { min: w(0, CANVAS_H), max: w(CANVAS_W, 0) };
const RIGHT_CLIP = { min: w(RIGHT.x0, RIGHT.y1), max: w(RIGHT.x1, RIGHT.y0) };

function circle(cx: number, cy: number, r: number, sides: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    pts.push(w(cx + r * Math.cos(a), cy + r * Math.sin(a)));
  }
  return pts;
}

// ---- 중력장 음영 — 동심 원판 ----

/** 원본 그라데이션의 알파(반지름 r px). 정지점 사이 선형 보간. */
function fieldAlpha(r: number): number {
  const span = FIELD_REACH - LEFT.bodyR;
  const gEnd = (LEFT.bodyR / FIELD_REACH) ** 2;
  const stopAlpha = (i: number): number => {
    const rr = LEFT.bodyR + (i / FIELD_STOPS) * span;
    return FIELD_ALPHA * (((LEFT.bodyR / rr) ** 2 - gEnd) / (1 - gEnd));
  };
  const f = Math.min(1, Math.max(0, (r - LEFT.bodyR) / span)) * FIELD_STOPS;
  const i = Math.min(FIELD_STOPS - 1, Math.floor(f));
  return stopAlpha(i) + (stopAlpha(i + 1) - stopAlpha(i)) * (f - i);
}

/**
 * 바깥 원판부터 안으로 겹친다. 같은 색을 겹친 알파는 1 − Π(1 − aⱼ) 이므로, 띠마다
 * 목표 알파가 되도록 원판 하나의 알파를 거꾸로 푼다. 반지름은 알파가 고르게 줄도록
 * 제곱근 간격으로 잡는다 — 짙기가 빨리 변하는 천체 곁에 띠가 촘촘하다.
 */
const FIELD_DISCS: readonly Region[] = (() => {
  const out: Region[] = [];
  let covered = 0;
  for (let k = 0; k < FIELD_BANDS; k++) {
    const outer = LEFT.bodyR + (FIELD_REACH - LEFT.bodyR) * (1 - k / FIELD_BANDS) ** 2;
    const inner = LEFT.bodyR + (FIELD_REACH - LEFT.bodyR) * (1 - (k + 1) / FIELD_BANDS) ** 2;
    const target = fieldAlpha((outer + inner) / 2);
    const a = target <= covered ? 0 : 1 - (1 - target) / (1 - covered);
    covered = target;
    if (a <= 0) continue;
    out.push({
      type: 'region',
      id: `field-${k}`,
      points: circle(LEFT.bodyX, LEFT.cy, outer, DISC_SIDES),
      fillOpacity: a,
      clip: CANVAS_CLIP,
      style: { colorRole: 'secondary', emphasis: FIELD_EMPHASIS },
    });
  }
  return out;
})();

export function scene(params: {
  state: TidalForceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  if (!timeline) throw new Error('tidal-force: schema.timeline 이 선언되어야 한다');
  const r0 = stage.constants.r0 ?? 0;
  const gm = gravityParameter(stage.constants);
  const out: Primitive[] = [];

  // 멈춘 채 흐려지는 단계 — 움직이는 것만 흐린다. 장 · 천체 · 틀은 그대로다.
  const a = 1 - timeline.at('fade');
  const [cx, cy] = [state.center[0]!, state.center[1]!];
  const dust = state.dust;

  // ================= 왼쪽 판 — 정지틀 =================

  // 천체의 중력장 — 세기 ∝ 1/r² 를 음영의 짙기로.
  out.push(...FIELD_DISCS);

  const body: Body = {
    type: 'body',
    id: 'body',
    pos: w(LEFT.bodyX, LEFT.cy),
    shape: 'circle',
    size: LEFT.bodyR,
    glow: false,
    outline: 'none',
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(body);

  // 확대 구역 표시 — 구름 중심을 따라다니는 네 귀퉁이 꺾쇠. 오른쪽 판이 보여 주는 영역이다.
  // 왼쪽 판의 것은 모두 원본 캔버스 경계에서 자른다 — 러너 여백으로 삐져나오면 안 된다.
  {
    const [bx, byNeg] = toLeft(cx, cy);
    const by = -byNeg;
    const hw = ((RIGHT.cx - RIGHT.x0) / RIGHT.zoom) * LEFT.scale;
    const hwR = ((RIGHT.x1 - RIGHT.cx) / RIGHT.zoom) * LEFT.scale;
    const hh = ((RIGHT.cy - RIGHT.y0) / RIGHT.zoom) * LEFT.scale;
    const corners: readonly [number, number, number, number][] = [
      [bx - hw, by - hh, 1, 1],
      [bx + hwR, by - hh, -1, 1],
      [bx - hw, by + hh, 1, -1],
      [bx + hwR, by + hh, -1, -1],
    ];
    corners.forEach(([x, y, sx, sy], i) => {
      const bracket: Trajectory = {
        type: 'trajectory',
        id: `bracket-${i}`,
        points: [w(x + sx * BRACKET_ARM, y), w(x, y), w(x, y + sy * BRACKET_ARM)],
        width: BRACKET_WIDTH_PX,
        opacity: a,
        clip: CANVAS_CLIP,
        style: { colorRole: 'muted', emphasis: 'subtle' },
      };
      out.push(bracket);
    });
  }

  // 먼지 구름 — 왼쪽 판 밖으로 나간 것은 빼 둔다.
  {
    const positions: Vec2[] = [];
    for (let i = 8; i < dust.length; i += 4) {
      const p = toLeft(dust[i]!, dust[i + 1]!);
      if (p[0] > LEFT.x1) continue;
      positions.push(p);
    }
    const cloud: ParticleSystem = {
      type: 'particleSystem',
      id: 'dust-left',
      positions,
      sizes: LEFT_DUST_PX,
      opacity: a,
      clip: CANVAS_CLIP,
      style: { colorRole: 'ink', emphasis: 'medium' },
    };
    out.push(cloud);
  }

  // 양 끝 먼지 — 강조색은 이 한 뜻(천체를 잇는 직선 위 양 끝)에만.
  for (let e = 0; e < 2; e++) {
    const end: Body = {
      type: 'body',
      id: `end-left-${e}`,
      pos: toLeft(dust[e * 4]!, dust[e * 4 + 1]!),
      shape: 'circle',
      size: LEFT_END_R,
      glow: false,
      outline: 'none',
      opacity: a,
      clip: CANVAS_CLIP,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(end);
  }

  // ================= 오른쪽 판 — 구름과 함께 떨어지는 눈 =================

  // 확대 화면은 왼쪽 음영 위에 놓인 따로 된 바탕.
  const backdrop: Region = {
    type: 'region',
    id: 'comoving-backdrop',
    points: [w(RIGHT.x0, RIGHT.y0), w(RIGHT.x1, RIGHT.y0), w(RIGHT.x1, RIGHT.y1), w(RIGHT.x0, RIGHT.y1)],
    opaque: true,
    fillOpacity: 0,
  };
  out.push(backdrop);

  // 조석 잔차장 — 각 자리의 끌림에서 구름 중심의 끌림을 뺀 것. 함께 떨어지는 눈에 남는 힘.
  // 방향은 획이 흐르는 쪽, 세기는 획의 길이 · 짙기. 위상은 화면 시각에서 돈다.
  {
    const [gcx, gcy] = gravityAt(gm, cx, cy);
    const t = screenClock(timeline);
    const bodyR2 = (LEFT.bodyR / LEFT.scale) ** 2;
    let k = 0;
    for (let py = RIGHT.y0 + STREAK_STEP / 2; py < RIGHT.y1; py += STREAK_STEP) {
      for (let px = RIGHT.x0 + STREAK_STEP / 2; px < RIGHT.x1; px += STREAK_STEP) {
        const seed = state.streakSeeds[k++ % state.streakSeeds.length]!;
        const dx = (px - RIGHT.cx) / RIGHT.zoom;
        const dy = (py - RIGHT.cy) / RIGHT.zoom;
        const wx = cx + dx;
        const wy = cy + dy;
        if (wx * wx + wy * wy < bodyR2) continue;
        const [gx, gy] = gravityAt(gm, wx, wy);
        const rx = gx - gcx;
        const ry = gy - gcy;
        const m = Math.hypot(rx, ry);
        if (m < 1e-6) continue;
        const s = Math.min(1, Math.sqrt(m / 40));
        const ux = rx / m;
        const uy = ry / m;
        const ph = (t * STREAK_RATE + seed) % 1;
        const fade = Math.sin(Math.PI * ph);
        const alpha = a * (STREAK_MIN_ALPHA + STREAK_GAIN_ALPHA * s) * fade;
        if (alpha <= 0.004) continue;
        const slide = (ph - 0.5) * STREAK_STEP * STREAK_SLIDE;
        const streak: Trace = {
          type: 'trace',
          id: `streak-${k}`,
          marks: [{ pos: w(px + ux * slide, py + uy * slide), direction: [ux, -uy] }],
          shape: 'tick',
          size: STREAK_MIN_LEN + STREAK_GAIN_LEN * s,
          width: STREAK_WIDTH_PX,
          opacity: alpha,
          clip: RIGHT_CLIP,
          style: { colorRole: 'secondary', emphasis: FIELD_EMPHASIS },
        };
        out.push(streak);
      }
    }
  }

  // 고르게 끌렸다면 있었을 자리 — 늘어남은 비교 대상이 있어야 보인다.
  const ghost: Trajectory = {
    type: 'trajectory',
    id: 'uniform-pull-outline',
    points: circle(RIGHT.cx, RIGHT.cy, r0 * RIGHT.zoom, GHOST_SIDES),
    closed: true,
    width: GHOST_WIDTH_PX,
    opacity: a,
    clip: RIGHT_CLIP,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
  };
  out.push(ghost);

  // 확대한 먼지 구름 — 중심을 고정해 본 입자들.
  {
    const positions: Vec2[] = [];
    for (let i = 8; i < dust.length; i += 4) positions.push(toRight(dust[i]! - cx, dust[i + 1]! - cy));
    const cloud: ParticleSystem = {
      type: 'particleSystem',
      id: 'dust-right',
      positions,
      sizes: RIGHT_DUST_PX,
      opacity: a,
      clip: RIGHT_CLIP,
      style: { colorRole: 'ink', emphasis: 'medium' },
    };
    out.push(cloud);
  }

  // 확대한 양 끝 먼지와 처음 자리에서 벗어난 거리.
  for (let e = 0; e < 2; e++) {
    const home = toRight(state.offsets[e * 2]!, state.offsets[e * 2 + 1]!);
    const now = toRight(dust[e * 4]! - cx, dust[e * 4 + 1]! - cy);
    const reach: Trajectory = {
      type: 'trajectory',
      id: `end-reach-${e}`,
      points: [home, now],
      width: END_LINE_PX,
      opacity: a,
      clip: RIGHT_CLIP,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    const end: Body = {
      type: 'body',
      id: `end-right-${e}`,
      pos: now,
      shape: 'circle',
      size: RIGHT_END_R,
      glow: false,
      outline: 'none',
      opacity: a,
      clip: RIGHT_CLIP,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(reach, end);
  }

  // 확대 화면 테두리와 이름 — 이 화면이 구름과 함께 떨어지는 눈으로 본 것이라는 표시.
  const frame: Trajectory = {
    type: 'trajectory',
    id: 'comoving-frame',
    points: [
      w(RIGHT.x0 + 0.5, RIGHT.y0 + 0.5),
      w(RIGHT.x1 - 0.5, RIGHT.y0 + 0.5),
      w(RIGHT.x1 - 0.5, RIGHT.y1 - 0.5),
      w(RIGHT.x0 + 0.5, RIGHT.y1 - 0.5),
    ],
    closed: true,
    width: FRAME_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  const name: Readout = {
    type: 'readout',
    id: 'comoving-name',
    anchor: { world: w(RIGHT.x0 + NAME_INSET[0], RIGHT.y0 + NAME_INSET[1] + NAME_FONT_PX / 2) },
    text: text('label.comoving'),
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: NAME_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  out.push(frame, name);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계. 프레이밍은 주장의 일부다 — 원본 캔버스를 그대로 옮겼다.
  return { ...SCENE_BOUNDS };
}
