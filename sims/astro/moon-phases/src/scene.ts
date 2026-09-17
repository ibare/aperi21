// ========================================================================
// moon-phases — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 햇빛(lineSet) · 궤도와 시선(trajectory) · 반쪽 달과 지구 · 강조색 호와 고리(sector) ·
// 지구에서 본 원판(scalarField) · 칸 이름(readout). 캡션은 선언의 캡션 슬롯이 그린다.
//
// 밝기 — 달의 낮 면 · 밤 면(반쪽 달 · 원판)은 테마와 무관한 **빛의 세기**(`light`)로 칠한다.
// 빛이 아닌 것(강조 호 · 궤도 · 시선 · 글자 · 지구)은 역할 색이다.
// ========================================================================

import type {
  EnvironmentDef,
  Primitive,
  SceneGraph,
  Sector,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { NIGHT_LIGHT, discLight, moonAt } from './physics';
import {
  ARC_GAP,
  DISC_CELLS,
  EARTH_R,
  GHOST_OPACITY,
  GHOST_R,
  MOON_R,
  ORBIT,
  RAYS,
  RING_GAP,
  SCENE_BOUNDS,
  SIGHT_GAP,
  VIEW,
  flipY,
  moonPhasesSchema,
  text,
} from './schema';
import type { MoonPhasesState } from './state';

/** 선 굵기(화면 px) — 원본 lineWidth. */
const RAY_WIDTH_PX = 1.2;
const ORBIT_WIDTH_PX = 1;
const SIGHT_WIDTH_PX = 1;
const ACCENT_WIDTH_PX = 3;
const ACCENT_DIAMETER_WIDTH_PX = 1.5;
/** 원본 글자 크기(px). */
const LABEL_FONT_PX = 13;
/** 원본 글자 기준선(y)에서 13px 글자의 가운데까지. readout 은 가운데에 맞춘다(G16). */
const BASELINE_TO_MIDDLE = 4.5;
/** 궤도 원을 나누는 점 수. */
const ORBIT_SEGMENTS = 180;

const HALF = Math.PI / 2;
/** 달 둘레 윤곽 굵기(화면 px). */
const OUTLINE_PX = 1;

function circle(cx: number, cy: number, r: number, n: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

/**
 * 반원 두 개로 나눈 원 — 오른쪽(태양 쪽)이 햇빛 받는 반쪽, 왼쪽이 그늘. 원본의 두 `arc` 채움.
 *
 * 달(`moon`)은 **빛의 세기**(`light`)로 칠한다 — 밝기가 주장이라 테마를 따라 뒤집히면 안 된다.
 * 지구에서 본 원판과 같은 세기다. 지구(`earth`)는 밝기가 주장이 아니라 원본대로 파랑 두 톤(역할 색)이다.
 */
function halves(id: string, center: Vec2, r: number, body: 'moon' | 'earth', opacity?: number): Sector[] {
  const base = { type: 'sector' as const, center, radius: r, fillOpacity: 1, rimWidth: 0, ...(opacity !== undefined ? { opacity } : {}) };
  if (body === 'earth') {
    return [
      { ...base, id: `${id}-night`, from: HALF, to: 3 * HALF, style: { colorRole: 'secondary', emphasis: 'subtle' } },
      { ...base, id: `${id}-day`, from: -HALF, to: HALF, style: { colorRole: 'secondary', emphasis: 'strong' } },
    ];
  }
  return [
    { ...base, id: `${id}-night`, from: HALF, to: 3 * HALF, light: NIGHT_LIGHT },
    { ...base, id: `${id}-day`, from: -HALF, to: HALF, light: 1 },
    // 둘레 — 빛이 아니다. 라이트 테마에서 가득 찬 빛(흰색)이 미색 바탕에 묻혀 낮 면 경계가 사라지므로
    // 역할 색 윤곽으로 원을 잡아 준다 (NOTES 「새 부족」).
    {
      type: 'sector',
      id: `${id}-outline`,
      center,
      radius: r,
      from: 0,
      to: 2 * Math.PI,
      fillOpacity: 0,
      rimWidth: OUTLINE_PX,
      style: { colorRole: 'muted', emphasis: 'medium' },
      ...(opacity !== undefined ? { opacity } : {}),
    },
  ];
}

/** 햇빛 줄무늬 — 오른쪽에서 왼쪽으로 흐르는 짧은 가로 획. 원본 draw 의 이중 루프 그대로. */
function rayLines(t: number): Vec2[][] {
  const shift = (t * RAYS.speed) % RAYS.pitch;
  const lines: Vec2[][] = [];
  for (let y = RAYS.yFrom; y <= RAYS.yTo; y += RAYS.rowStep) {
    const stagger = ((y / RAYS.rowStep) % 2) * RAYS.stagger;
    for (let x = RAYS.xStart; x > -RAYS.pitch; x -= RAYS.pitch) {
      const x0 = x - shift - stagger;
      const a = Math.max(RAYS.xMin, x0);
      const b = Math.min(RAYS.xMax, x0 + RAYS.dash);
      if (b > a) lines.push([[a, flipY(y)], [b, flipY(y)]]);
    }
  }
  return lines;
}

export function scene(params: {
  state: MoonPhasesState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('moon-phases: schema.timeline 이 선언되어야 한다');

  // 원본 moonAngle — θ₀ 는 startAt 으로 옮겼으므로 주기 진행도에 끌기 차이만 더한다.
  const theta = 2 * Math.PI * timeline.at('orbit') + state.offset;
  const [mx, my] = moonAt(theta);
  const out: Primitive[] = [];

  // ---- 햇빛 ----
  // 흐름은 시각의 함수다. 원본은 앞당기기 전의 흐른 시간으로 흘렸으므로 앞당김을 빼고 같은 위상을 맞춘다.
  out.push({
    type: 'lineSet',
    id: 'sunlight',
    lines: rayLines(timeline.t - (moonPhasesSchema.startAt ?? 0)),
    width: RAY_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });
  out.push({
    type: 'readout',
    id: 'sunlight-label',
    anchor: { world: [456, flipY(16 - BASELINE_TO_MIDDLE)] },
    text: text('label.sunlight'),
    chip: false,
    align: 'right',
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 달의 궤도 ----
  out.push({
    type: 'trajectory',
    id: 'orbit',
    points: circle(ORBIT.cx, ORBIT.cy, ORBIT.R, ORBIT_SEGMENTS),
    closed: true,
    width: ORBIT_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });

  // ---- 궤도 위 여덟 자리의 달 — 어느 자리에서든 햇빛 받는 반쪽은 오른쪽 ----
  for (let q = 0; q < 8; q++) {
    out.push(...halves(`ghost-${q}`, moonAt((q * Math.PI) / 4), GHOST_R, 'moon', GHOST_OPACITY));
  }

  // ---- 지구 ----
  out.push(...halves('earth', [ORBIT.cx, ORBIT.cy], EARTH_R, 'earth'));

  // ---- 지구에서 달을 보는 시선 ----
  const ang = Math.atan2(my - ORBIT.cy, mx - ORBIT.cx);
  const [ux, uy] = [Math.cos(ang), Math.sin(ang)];
  out.push({
    type: 'trajectory',
    id: 'sight',
    points: [
      [ORBIT.cx + ux * (EARTH_R + SIGHT_GAP.earth), ORBIT.cy + uy * (EARTH_R + SIGHT_GAP.earth)],
      [mx - ux * (MOON_R + SIGHT_GAP.moon), my - uy * (MOON_R + SIGHT_GAP.moon)],
    ],
    width: SIGHT_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
  });

  // ---- 위에서 본 달 ----
  out.push(...halves('moon', [mx, my], MOON_R, 'moon'));

  // ---- 지구를 향한 반쪽(위에서) — 강조색은 이 대상 하나에만 ----
  const a = Math.atan2(ORBIT.cy - my, ORBIT.cx - mx); // 달에서 지구 쪽
  const rArc = MOON_R + ARC_GAP;
  out.push({
    type: 'sector',
    id: 'facing-arc',
    center: [mx, my],
    radius: rArc,
    from: a - HALF,
    to: a + HALF,
    fillOpacity: 0,
    rimWidth: ACCENT_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'facing-diameter',
    points: [
      [mx + Math.cos(a - HALF) * rArc, my + Math.sin(a - HALF) * rArc],
      [mx + Math.cos(a + HALF) * rArc, my + Math.sin(a + HALF) * rArc],
    ],
    width: ACCENT_DIAMETER_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // ---- 지구에서 본 달 — 표면 법선과 태양 방향의 내적으로 칸마다 명암 ----
  out.push({
    type: 'scalarField',
    id: 'disc',
    min: [VIEW.cx - VIEW.R, VIEW.cy - VIEW.R],
    max: [VIEW.cx + VIEW.R, VIEW.cy + VIEW.R],
    cols: DISC_CELLS,
    rows: DISC_CELLS,
    values: discLight(theta),
    range: [0, 1],
    colors: 'light',
  });

  // ---- 지구를 향한 반쪽(지구에서) — 왼쪽 칸 강조색 호와 같은 대상 ----
  out.push({
    type: 'sector',
    id: 'facing-ring',
    center: [VIEW.cx, VIEW.cy],
    radius: VIEW.R + RING_GAP,
    from: 0,
    to: 2 * Math.PI,
    fillOpacity: 0,
    rimWidth: ACCENT_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 칸 이름 ----
  const nameY = flipY(332 - BASELINE_TO_MIDDLE);
  out.push({
    type: 'readout',
    id: 'name-top',
    anchor: { world: [ORBIT.cx, nameY] },
    text: text('label.topView'),
    chip: false,
    align: 'center',
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'name-earth',
    anchor: { world: [VIEW.cx, nameY] },
    text: text('label.earthView'),
    chip: false,
    align: 'center',
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같은 값이라야 카메라가 흔들리지 않는다.
  return { ...SCENE_BOUNDS };
}
