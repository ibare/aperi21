// ========================================================================
// apparent-depth — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다. 겹침 순서가 판정 장치라 `drawOrder: 'scene'` — 먼저 쓴 것이 아래다.
//
// 줄기는 역할 색 `ink` 로 긋는다. 주장은 빛의 **경로**와 그 경로가 가리키는 자리이지 밝기가
// 아니다 — 빛 채널로 칠하면 라이트 바탕에서 흰 줄기가 사라진다(G92).
//
// 색: 줄기 · 거꾸로 이은 점선 · 눈은 먹색, 안내선(법선 · 바닥 · 수평 안내)은 옅은 먹색,
// 물 면은 옅은 보조색 하나(물 · 유리가 같은 색 — 가르는 것은 이름 줄이다), 동전은 주 대상색.
// 진짜 동전은 채우고 보이는 동전은 속을 비워 **같은 색 · 다른 채움**으로 가른다.
// 강조색은 **보이는 자리의 깊이** 한 가지 뜻에만 쓴다 — 겉보기 깊이 치수선과 그 글자.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { derive, readConstants, type Optics } from './physics';
import {
  APPARENT_DIM_X,
  ARROW_AT,
  ARROW_LEN,
  COIN_H,
  COIN_W,
  EYE_HALF_H,
  EYE_HALF_W,
  IRIS_R,
  MEDIUM_ROW_X,
  MEDIUM_ROW_Y,
  NORMAL_DOWN,
  NORMAL_UP,
  PUPIL_R,
  REAL_DIM_X,
  SCENE_BOUNDS,
  WATER_HALF,
  text,
  type ApparentDepthMessageKey,
} from './schema';
import type { ApparentDepthState } from './state';

/** 선 굵기(화면 px) — 줄기 · 거꾸로 이은 점선 · 안내선 · 바닥 · 눈 테. */
const RAY_WIDTH_PX = 2.5;
const TRACE_WIDTH_PX = 1.75;
const GUIDE_WIDTH_PX = 1;
const FLOOR_WIDTH_PX = 1.5;
const EYE_LINE_PX = 1.75;
/** 글자 크기(화면 px) — 매질 이름 · 치수 이름표. */
const LABEL_PX = 13;
/** 불투명도 — 물 면 · 거꾸로 이은 점선 · 떠난 매질 이름 · 물에서 보이던 자리 · 수평 안내. */
const WATER_FILL = 0.16;
const TRACE_OPACITY = 0.8;
const IDLE_ROW_OPACITY = 0.38;
const MEMORY_OPACITY = 0.4;
const LEVEL_OPACITY = 0.7;
/** 치수선 이름표를 선에서 띄우는 거리 · 매질 이름 줄 사이 간격(화면 px). */
const LABEL_GAP_PX = 8;
const ROW_GAP_PX = 20;
/** 눈 아몬드꼴을 표본하는 점 수(한 변) · 눈동자 테 원의 점 수 (곡선 어휘가 없다 — G28). */
const EYE_SAMPLES = 24;
const IRIS_SAMPLES = 48;

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const guide = { colorRole: 'muted', emphasis: 'strong' } as const;
const coinStyle = { colorRole: 'primary', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;

const lerp = (a: Vec2, b: Vec2, k: number): Vec2 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const mirror = (p: Vec2): Vec2 => [-p[0], p[1]];

function label(
  id: string,
  key: ApparentDepthMessageKey,
  world: Vec2,
  opts: {
    vars?: Record<string, string>;
    offset?: Vec2;
    align?: Readout['align'];
    opacity?: number;
    role?: 'ink' | 'accent' | 'muted';
  },
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world, ...(opts.offset ? { offset: opts.offset } : {}) },
    text: text(key),
    ...(opts.vars ? { vars: opts.vars } : {}),
    chip: false,
    font: 'text',
    align: opts.align ?? 'left',
    fontSize: LABEL_PX,
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    style: { colorRole: opts.role ?? 'ink', emphasis: 'strong' },
  };
}

/** 줄기 위 한 토막의 가운데쯤에 진행 방향 화살표. 꼬리가 `a` 쪽, 촉이 `b` 쪽이다. */
function arrowOn(id: string, a: Vec2, b: Vec2): Primitive {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const u: Vec2 = [dx / len, dy / len];
  const mid = lerp(a, b, ARROW_AT);
  return {
    type: 'vector',
    id,
    from: [mid[0] - (u[0] * ARROW_LEN) / 2, mid[1] - (u[1] * ARROW_LEN) / 2],
    delta: [u[0] * ARROW_LEN, u[1] * ARROW_LEN],
    width: RAY_WIDTH_PX,
    style: ink,
  };
}

/** 동전 — 윗면 가운데가 `top` 이다. 진짜는 채우고, 보이는 자리는 속을 비운다. */
function coin(id: string, top: number, hollow: boolean, opacity?: number): Primitive {
  return {
    type: 'body',
    id,
    pos: [0, top - COIN_H / 2],
    shape: 'rect',
    size: [COIN_W, COIN_H],
    ...(hollow ? { fill: 'none' as const, outline: 'role' as const } : {}),
    ...(opacity !== undefined ? { opacity } : {}),
    style: coinStyle,
  };
}

export function scene(params: {
  state: ApparentDepthState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('apparent-depth: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const g: Primitive[] = [];

  const depth = c.depthCm;
  const floorY = -depth - COIN_H;
  const eyeY = c.eyeHeightCm;
  const source: Vec2 = [0, -depth];

  // ---- 물 면 · 수면 · 바닥 — 물과 유리가 같은 색이다. 가르는 것은 오른쪽 이름 줄이다. ----
  g.push({
    type: 'region',
    id: 'medium',
    points: [
      [-WATER_HALF, 0],
      [WATER_HALF, 0],
      [WATER_HALF, floorY],
      [-WATER_HALF, floorY],
    ],
    fillOpacity: WATER_FILL,
    style: { colorRole: 'secondary', emphasis: 'medium' },
  });
  g.push({
    type: 'trajectory',
    id: 'surface-line',
    points: [
      [-WATER_HALF, 0],
      [WATER_HALF, 0],
    ],
    width: FLOOR_WIDTH_PX,
    style: guide,
  });
  g.push({
    type: 'trajectory',
    id: 'floor',
    points: [
      [-WATER_HALF, floorY],
      [WATER_HALF, floorY],
    ],
    width: FLOOR_WIDTH_PX,
    style: guide,
  });

  // ---- 굴절점의 법선 — 줄기가 법선 밖으로 꺾이는 것을 잰다 ----
  const hit = r.now.hitX;
  for (const [id, x] of [
    ['normal-right', hit],
    ['normal-left', -hit],
  ] as const) {
    g.push({
      type: 'trajectory',
      id,
      points: [
        [x, NORMAL_UP],
        [x, -NORMAL_DOWN],
      ],
      width: GUIDE_WIDTH_PX,
      style: { ...guide, lineStyle: 'dashed' },
    });
  }

  // ---- 수평 안내 — 치수선 끝이 어느 높이를 재는지 동전 · 보이는 동전과 잇는다 ----
  const apparentY = -r.now.apparentDepth;
  g.push({
    type: 'trajectory',
    id: 'level-real',
    points: [
      [REAL_DIM_X, -depth],
      [-COIN_W / 2, -depth],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: LEVEL_OPACITY,
    style: { ...guide, lineStyle: 'dotted' },
  });
  if (r.imageAlpha > 0) {
    g.push({
      type: 'trajectory',
      id: 'level-apparent',
      points: [
        [COIN_W / 2, apparentY],
        [APPARENT_DIM_X, apparentY],
      ],
      width: GUIDE_WIDTH_PX,
      opacity: LEVEL_OPACITY * r.imageAlpha,
      style: { ...guide, lineStyle: 'dotted' },
    });
  }

  // ---- 거꾸로 이은 점선 — 굴절점에서 물속으로 곧게, 교점까지 자란다 ----
  const meet: Vec2 = [0, apparentY];
  if (r.extend > 0 && r.traceAlpha > 0) {
    const right: Vec2 = [hit, 0];
    g.push({
      type: 'trajectory',
      id: 'trace-right',
      points: [right, lerp(right, meet, r.extend)],
      width: TRACE_WIDTH_PX,
      opacity: TRACE_OPACITY * r.traceAlpha,
      style: { ...ink, lineStyle: 'dashed' },
    });
    g.push({
      type: 'trajectory',
      id: 'trace-left',
      points: [mirror(right), lerp(mirror(right), meet, r.extend)],
      width: TRACE_WIDTH_PX,
      opacity: TRACE_OPACITY * r.traceAlpha,
      style: { ...ink, lineStyle: 'dashed' },
    });
  }

  // ---- 줄기 둘 — 동전 → 수면(꺾임) → 눈 ----
  const rayPoints = (o: Optics): { hitPt: Vec2; eyePt: Vec2 } => ({
    hitPt: [o.hitX, 0],
    eyePt: [o.eyeX, eyeY],
  });
  const { hitPt, eyePt } = rayPoints(r.now);
  g.push({
    type: 'trajectory',
    id: 'ray-right',
    points: [source, hitPt, eyePt],
    width: RAY_WIDTH_PX,
    style: ink,
  });
  g.push({
    type: 'trajectory',
    id: 'ray-left',
    points: [source, mirror(hitPt), mirror(eyePt)],
    width: RAY_WIDTH_PX,
    style: ink,
  });
  g.push(arrowOn('arrow-right-in', source, hitPt));
  g.push(arrowOn('arrow-left-in', source, mirror(hitPt)));
  // 공기 쪽 화살표는 수면에서 눈 아래 테까지의 토막 위에 둔다 — 눈이 덮는 끝을 피한다.
  const eyeRimY = eyeY - EYE_HALF_H;
  const rimPt = (p: Vec2): Vec2 => lerp(p, eyePt, eyeRimY / eyeY);
  g.push(arrowOn('arrow-right-out', hitPt, rimPt(hitPt)));
  g.push(arrowOn('arrow-left-out', mirror(hitPt), mirror(rimPt(hitPt))));

  // ---- 눈 — 바탕색으로 덮어 줄기 끝이 눈 안으로 들어간 것으로 읽힌다 ----
  const eyePts: Vec2[] = [];
  for (let i = 0; i <= EYE_SAMPLES; i++) {
    const x = -EYE_HALF_W + (2 * EYE_HALF_W * i) / EYE_SAMPLES;
    const k = x / EYE_HALF_W;
    eyePts.push([x, eyeY + EYE_HALF_H * (1 - k * k)]);
  }
  for (let i = EYE_SAMPLES - 1; i >= 1; i--) {
    const x = -EYE_HALF_W + (2 * EYE_HALF_W * i) / EYE_SAMPLES;
    const k = x / EYE_HALF_W;
    eyePts.push([x, eyeY - EYE_HALF_H * (1 - k * k)]);
  }
  g.push({
    type: 'region',
    id: 'eye',
    points: eyePts,
    opaque: true,
    fillOpacity: 0,
    outline: eyePts.map((_, i) => [i, (i + 1) % eyePts.length] as const),
    style: ink,
  });
  const iris: Vec2[] = [];
  for (let i = 0; i < IRIS_SAMPLES; i++) {
    const a = (2 * Math.PI * i) / IRIS_SAMPLES;
    iris.push([IRIS_R * Math.cos(a), eyeY + IRIS_R * Math.sin(a)]);
  }
  g.push({
    type: 'trajectory',
    id: 'iris',
    points: iris,
    closed: true,
    width: EYE_LINE_PX,
    style: ink,
  });
  g.push({
    type: 'body',
    id: 'pupil',
    pos: [0, eyeY],
    shape: 'circle',
    size: PUPIL_R,
    glow: false,
    outline: 'none',
    style: ink,
  });

  // ---- 동전 — 진짜(채움) · 물에서 보이던 자리(옅게) · 지금 보이는 자리(속 빈) ----
  g.push(coin('coin', -depth, false));
  if (r.waterMemory > 0) {
    g.push(coin('image-water', -r.water.apparentDepth, true, MEMORY_OPACITY * r.waterMemory));
  }
  if (r.imageAlpha > 0) {
    g.push(coin('image', apparentY, true, r.imageAlpha));
  }

  // ---- 치수선 — 왼쪽은 실제 깊이, 오른쪽은 보이는 자리의 깊이(강조색) ----
  g.push({
    type: 'dimension',
    id: 'dim-real',
    from: [REAL_DIM_X, 0],
    to: [REAL_DIM_X, -depth],
    style: guide,
  });
  g.push(
    label('dim-real-label', 'label.realDepth', [REAL_DIM_X, -depth / 2], {
      vars: { d: state.depthText },
      offset: [-LABEL_GAP_PX, 0],
      align: 'right',
    }),
  );
  if (r.imageAlpha > 0) {
    g.push({
      type: 'dimension',
      id: 'dim-apparent',
      from: [APPARENT_DIM_X, 0],
      to: [APPARENT_DIM_X, apparentY],
      opacity: r.imageAlpha,
      style: accent,
    });
  }
  if (r.settled) {
    const d = r.settled === 'water' ? state.waterApparentText : state.glassApparentText;
    g.push(
      label('dim-apparent-label', 'label.apparentDepth', [APPARENT_DIM_X, apparentY / 2], {
        vars: { d },
        offset: [LABEL_GAP_PX, 0],
        align: 'left',
        opacity: r.imageAlpha,
        role: 'accent',
      }),
    );
  }

  // ---- 매질 이름 — 물 · 유리 두 줄. 지금 매질만 짙다. ----
  g.push(
    label('name-water', 'label.water', [MEDIUM_ROW_X, MEDIUM_ROW_Y], {
      vars: { n: state.waterIndexText },
      opacity: IDLE_ROW_OPACITY + (1 - IDLE_ROW_OPACITY) * r.weight.water,
    }),
  );
  g.push(
    label('name-glass', 'label.glass', [MEDIUM_ROW_X, MEDIUM_ROW_Y], {
      vars: { n: state.glassIndexText },
      offset: [0, ROW_GAP_PX],
      opacity: IDLE_ROW_OPACITY + (1 - IDLE_ROW_OPACITY) * r.weight.glass,
    }),
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
