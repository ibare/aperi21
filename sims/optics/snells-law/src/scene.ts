// ========================================================================
// snells-law — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 줄기는 역할 색 `ink` 로 긋는다. 이 조각의 주장은 빛의 **경로**(법선에서 벌어진 각)이지
// 밝기가 아니다 — 빛 채널로 칠하면 라이트 바탕에서 흰 줄기가 사라진다(G92).
//
// 색: 줄기 · 법선 거리 막대 · 매질 이름은 먹색, 안내선(법선 · 경계면 · 원 틀)은 옅은 먹색,
// 아래 매질 면은 옅은 보조색 하나(세 매질이 같은 색 — 가르는 것은 이름 줄이다).
// 강조색은 **꺾인 각** 한 가지 뜻에만 쓴다 — 꺾인 쪽 호와 그 각 글자.
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
import { MEDIA, derive, indexOf, readConstants, refractedAngle, type MediumId } from './physics';
import {
  AIR_LABEL_Y,
  ARC_LABEL_GAP,
  ARC_R,
  ARROW_AT,
  ARROW_LEN,
  BOUNDARY_HALF,
  CIRCLE_R,
  COLUMN_X,
  MEDIUM_DEPTH,
  MEDIUM_ROW_Y,
  NORMAL_DOWN,
  NORMAL_UP,
  REFRACTED_LABEL_AT,
  RAY_LEN,
  SCENE_BOUNDS,
  text,
  type SnellsLawMessageKey,
} from './schema';
import type { SnellsLawState } from './state';

/** 선 굵기(화면 px) — 줄기 · 지난 줄기 · 법선 거리 막대 · 안내선 · 경계면 · 호 테두리. */
const RAY_WIDTH_PX = 2.5;
const GHOST_WIDTH_PX = 1.5;
const BAR_WIDTH_PX = 4;
const GUIDE_WIDTH_PX = 1;
const BOUNDARY_WIDTH_PX = 1.5;
const ARC_RIM_PX = 1.5;
/** 글자 크기(화면 px) — 매질 이름 · 각 글자. */
const LABEL_PX = 13;
const ANGLE_PX = 14;
/** 불투명도 — 아래 매질 면 · 호 채움 · 지난 줄기 · 떠난 매질 이름 · 막대 비교 점선. */
const MEDIUM_FILL = 0.16;
const ARC_FILL = 0.14;
const GHOST_OPACITY = 0.45;
const IDLE_ROW_OPACITY = 0.38;
const REFERENCE_OPACITY = 0.7;
/** 매질 이름 줄 사이 간격(화면 px). */
const ROW_GAP_PX = 20;
/** 원 틀을 표본하는 점 수 (곡선 어휘가 없다 — G28). */
const CIRCLE_SAMPLES = 96;

const NAME_KEY: Record<MediumId, SnellsLawMessageKey> = {
  water: 'label.water',
  glass: 'label.glass',
  diamond: 'label.diamond',
};

const INDEX_TEXT: Record<MediumId, keyof SnellsLawState> = {
  water: 'waterIndexText',
  glass: 'glassIndexText',
  diamond: 'diamondIndexText',
};

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const guide = { colorRole: 'muted', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;

/** 공기 쪽 줄기 방향(입사점을 떠나 위 왼쪽으로) · 아래 매질 쪽 줄기 방향(아래 오른쪽으로). */
const upLeft = (a: number): Vec2 => [-Math.sin(a), Math.cos(a)];
const downRight = (a: number): Vec2 => [Math.sin(a), -Math.cos(a)];
const at = (d: Vec2, r: number): Vec2 => [d[0] * r, d[1] * r];

function arrowOn(id: string, from: Vec2, dir: Vec2): Primitive {
  // 줄기 위 한 자리에 진행 방향 화살표. 꼬리가 `from` 에서 `dir` 로 향한다.
  return {
    type: 'vector',
    id,
    from: [from[0] - (dir[0] * ARROW_LEN) / 2, from[1] - (dir[1] * ARROW_LEN) / 2],
    delta: at(dir, ARROW_LEN),
    width: RAY_WIDTH_PX,
    style: ink,
  };
}

function label(
  id: string,
  key: SnellsLawMessageKey,
  world: Vec2,
  opts: { vars?: Record<string, string>; offset?: Vec2; align?: Readout['align']; size?: number; opacity?: number; role?: 'ink' | 'accent' | 'muted' },
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
    fontSize: opts.size ?? LABEL_PX,
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    style: { colorRole: opts.role ?? 'ink', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: SnellsLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('snells-law: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const g: Primitive[] = [];

  // ---- 아래 매질 면 — 세 매질이 같은 색이다. 가르는 것은 오른쪽 이름 줄이다. ----
  g.push({
    type: 'region',
    id: 'medium',
    points: [
      [-BOUNDARY_HALF, 0],
      [BOUNDARY_HALF, 0],
      [BOUNDARY_HALF, -MEDIUM_DEPTH],
      [-BOUNDARY_HALF, -MEDIUM_DEPTH],
    ],
    fillOpacity: MEDIUM_FILL,
    style: { colorRole: 'secondary', emphasis: 'medium' },
  });

  // ---- 경계면 · 법선 · 원 틀 ----
  g.push({
    type: 'trajectory',
    id: 'boundary',
    points: [
      [-BOUNDARY_HALF, 0],
      [BOUNDARY_HALF, 0],
    ],
    width: BOUNDARY_WIDTH_PX,
    style: guide,
  });
  g.push({
    type: 'trajectory',
    id: 'normal',
    points: [
      [0, NORMAL_UP],
      [0, -NORMAL_DOWN],
    ],
    width: GUIDE_WIDTH_PX,
    style: { ...guide, lineStyle: 'dashed' },
  });
  const circle: Vec2[] = [];
  for (let i = 0; i < CIRCLE_SAMPLES; i++) {
    const a = (2 * Math.PI * i) / CIRCLE_SAMPLES;
    circle.push([CIRCLE_R * Math.cos(a), CIRCLE_R * Math.sin(a)]);
  }
  g.push({
    type: 'trajectory',
    id: 'circle',
    points: circle,
    closed: true,
    width: GUIDE_WIDTH_PX,
    opacity: REFERENCE_OPACITY,
    style: { ...guide, lineStyle: 'dotted' },
  });

  // ---- 각 호 — 들어오는 쪽은 옅은 먹색, 꺾인 쪽은 강조색 ----
  g.push({
    type: 'sector',
    id: 'incident-arc',
    center: [0, 0],
    radius: ARC_R,
    from: Math.PI / 2,
    to: Math.PI / 2 + r.incident,
    fillOpacity: ARC_FILL,
    rimWidth: ARC_RIM_PX,
    style: guide,
  });
  g.push({
    type: 'sector',
    id: 'refracted-arc',
    center: [0, 0],
    radius: ARC_R,
    from: -Math.PI / 2,
    to: -Math.PI / 2 + r.refracted,
    fillOpacity: ARC_FILL,
    rimWidth: ARC_RIM_PX,
    style: accent,
  });

  // ---- 법선 거리 막대 — 원과 줄기가 만나는 자리에서 법선까지. ----
  // 꺾인 쪽 막대와 같은 높이에 들어오는 쪽 막대 길이를 점선으로 옮겨 둔다 — 꺾인 쪽이
  // 얼마나 짧아졌는지가 한 줄에서 읽힌다.
  const inHit = at(upLeft(r.incident), CIRCLE_R);
  const outHit = at(downRight(r.refracted), CIRCLE_R);
  g.push({
    type: 'trajectory',
    id: 'incident-bar',
    points: [[0, inHit[1]], inHit],
    width: BAR_WIDTH_PX,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });
  g.push({
    type: 'trajectory',
    id: 'incident-bar-copy',
    points: [
      [0, outHit[1]],
      [-inHit[0], outHit[1]],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: REFERENCE_OPACITY,
    style: { colorRole: 'secondary', emphasis: 'strong', lineStyle: 'dashed' },
  });
  g.push({
    type: 'trajectory',
    id: 'refracted-bar',
    points: [[0, outHit[1]], outHit],
    width: BAR_WIDTH_PX,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ---- 떠난 매질의 줄기 — 옅은 점선으로 남는다 ----
  for (const m of ['water', 'glass'] as const) {
    const w = r.ghost[m];
    if (w <= 0) continue;
    const a = refractedAngle(c.nAir, indexOf(c, m), r.incident);
    g.push({
      type: 'trajectory',
      id: `ghost-${m}`,
      points: [[0, 0], at(downRight(a), RAY_LEN)],
      width: GHOST_WIDTH_PX,
      opacity: GHOST_OPACITY * w,
      style: { ...ink, lineStyle: 'dashed' },
    });
  }

  // ---- 들어오는 줄기 · 꺾인 줄기 ----
  const inDir = upLeft(r.incident);
  const outDir = downRight(r.refracted);
  g.push({
    type: 'trajectory',
    id: 'incident-ray',
    points: [at(inDir, RAY_LEN), [0, 0]],
    width: RAY_WIDTH_PX,
    style: ink,
  });
  g.push({
    type: 'trajectory',
    id: 'refracted-ray',
    points: [[0, 0], at(outDir, RAY_LEN)],
    width: RAY_WIDTH_PX,
    style: ink,
  });
  g.push(arrowOn('incident-arrow', at(inDir, RAY_LEN * (1 - ARROW_AT)), [-inDir[0], -inDir[1]]));
  g.push(arrowOn('refracted-arrow', at(outDir, RAY_LEN * ARROW_AT), outDir));

  // ---- 각 글자 — 호 바깥, 각을 반으로 가르는 자리 ----
  g.push(
    label('incident-deg', 'label.deg', at(upLeft(r.incident / 2), ARC_R + ARC_LABEL_GAP), {
      vars: { deg: state.incidentText },
      align: 'center',
      size: ANGLE_PX,
      role: 'muted',
    }),
  );
  if (r.settled) {
    const now = MEDIA.find((m) => timeline.phase === m) ?? 'water';
    const degText = now === 'water' ? state.waterText : now === 'glass' ? state.glassText : state.diamondText;
    g.push(
      label('refracted-deg', 'label.deg', [REFRACTED_LABEL_AT[0], REFRACTED_LABEL_AT[1]], {
        vars: { deg: degText },
        align: 'right',
        size: ANGLE_PX,
        role: 'accent',
      }),
    );
  }

  // ---- 매질 이름 — 위는 공기, 아래는 세 매질의 줄. 지금 매질만 짙다. ----
  g.push(label('name-air', 'label.air', [COLUMN_X, AIR_LABEL_Y], { vars: { n: state.airIndexText } }));
  MEDIA.forEach((m, i) => {
    const w = r.weight[m];
    g.push(
      label(`name-${m}`, NAME_KEY[m], [COLUMN_X, MEDIUM_ROW_Y], {
        vars: { n: state[INDEX_TEXT[m]] },
        offset: [0, i * ROW_GAP_PX],
        opacity: IDLE_ROW_OPACITY + (1 - IDLE_ROW_OPACITY) * w,
      }),
    );
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
