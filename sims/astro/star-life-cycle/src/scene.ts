// ========================================================================
// star-life-cycle — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음.
//
// 위: HR 도 — 밤하늘(region, 빛 없음) · 축(trajectory · lineSet · readout) · 주계열 띠 ·
//     두 별이 지나온 길(trajectory, 회색 빛) · 행성상 성운 고리 · 초신성 끝 고리 · 두 별(body, 흑체색) ·
//     이름표(readout).
// 아래: 시간 자 — 두 별의 일생 막대(trajectory) · 지금 나이 표시선(accent) · 눈금.
// 겹침은 쓴 순서 그대로다 (`drawOrder: 'scene'`).
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { wavelengthToLinearRgb } from '@aperi21/plugin-optics';
import {
  HEAVY_TRACK,
  LIGHT_TRACK,
  MAIN_SEQUENCE,
  ageNow,
  at,
  blackbodyRgb,
  hr,
  logRadius,
  readConstants,
  readTrack,
  rulerX,
  sx,
  sy,
  type HrPoint,
  type LifeConstants,
} from './physics';
import { L_AXIS, PLOT, RULER, SCENE_BOUNDS, text, type StarLifeCycleMessageKey } from './schema';
import type { StarLifeCycleState } from './state';

/** 축 · 눈금 글자 크기(화면 px). */
const AXIS_FONT_PX = 12;
/** 이름표 글자 크기(화면 px). */
const LABEL_FONT_PX = 12;
/** 축 · 눈금선 굵기(화면 px). */
const AXIS_WIDTH_PX = 1;
/** 눈금선 길이(설계 px). */
const TICK_LEN = 4;
/** 눈금 글자를 눈금선에서 띄우는 거리(설계 px). */
const TICK_LABEL_GAP = 12;
/** 온도축 이름을 눈금 글자 아래로 내리는 거리(설계 px). */
const T_AXIS_NAME_DROP = 30;
/** 광도축 이름 · 단위 자리(설계 px). 그림 영역 왼쪽 여백 가운데. */
const L_AXIS_NAME_X = 30;
const L_AXIS_NAME_LINE = 16;
/** 눈금 글자를 축에서 왼쪽으로 띄우는 거리(설계 px). */
const L_TICK_LABEL_GAP = 8;

/** 주계열 띠 굵기(화면 px) · 빛 세기 · 짙기. 밤하늘 위 옅은 회색 빛. */
const BAND_WIDTH_PX = 10;
const BAND_LIGHT = 0.5;
const BAND_OPACITY = 0.3;
/** 지나온 길 굵기(화면 px) · 빛 세기. */
const TRAIL_WIDTH_PX = 1.5;
const TRAIL_LIGHT = 0.55;

/**
 * 별 점 크기(월드 = 설계 px) = 기본 + 계수 × log10 반지름, 위 · 아래로 자른다.
 * 반지름은 백색 왜성 0.01 에서 초거성 1000 까지 다섯 자릿수라 로그로 줄인다.
 */
const STAR_SIZE_BASE = 4;
const STAR_SIZE_PER_DEX = 2.2;
const STAR_SIZE_MIN = 2;
const STAR_SIZE_MAX = 11;

/** 질량 이름표를 별 점에서 띄우는 거리(화면 px, 점 크기에 더한다). */
const MASS_LABEL_GAP = 14;

/** 행성상 성운 고리 — 굵기 · 짙기 · 반지름(설계 px) · 표본 수. 빛의 파장은 스테이지 상수 `nebulaNm`. */
const NEBULA_WIDTH_PX = 2;
const NEBULA_OPACITY = 0.9;
const NEBULA_R0 = 8;
const NEBULA_R1 = 30;
const NEBULA_SEGMENTS = 48;
/** 고리가 짙어지는 빠르기 — 껍질을 벗는 단계의 앞 절반에 다 짙어진다. */
const NEBULA_FADE_IN = 2;

/** 초신성 끝 고리 — 크기(월드) · 빛 세기. 폭발 장면이 아니라 「여기서 끝났다」 표지다. */
const END_RING_SIZE = 7;
const END_RING_LIGHT = 0.85;

/** 시간 자 — 일생 막대 굵기(화면 px) · 지금 표시선 굵기 · 위아래 넘침(설계 px). */
const BAR_WIDTH_PX = 6;
const CURSOR_WIDTH_PX = 1.5;
const CURSOR_OVER = 10;
/** 시간 자 눈금 글자를 기준선 아래로 내리는 거리 · 끝 이름표를 막대 끝에서 띄우는 거리(설계 px). */
const RULER_LABEL_DROP = 12;
const END_LABEL_GAP = 10;
/** 줄 이름표(질량) · 축 이름을 시간 자 왼쪽에서 띄우는 거리(설계 px). */
const ROW_LABEL_GAP = 8;

/** 온도 눈금(K). */
const TEMP_TICKS: readonly { K: number; key: StarLifeCycleMessageKey }[] = [
  { K: 100000, key: 'tick.t100000' },
  { K: 30000, key: 'tick.t30000' },
  { K: 10000, key: 'tick.t10000' },
  { K: 3000, key: 'tick.t3000' },
];
/** 광도 눈금(log10 L). 글자는 10 의 거듭제곱 문안. */
const LUM_TICKS: readonly { ll: number; key: StarLifeCycleMessageKey }[] = [
  { ll: 6, key: 'tick.l6' },
  { ll: 4, key: 'tick.l4' },
  { ll: 2, key: 'tick.l2' },
  { ll: 0, key: 'tick.l0' },
  { ll: -2, key: 'tick.l-2' },
];
/** 시간 자 눈금(년). */
const AGE_TICKS: readonly { age: number; key: StarLifeCycleMessageKey }[] = [
  { age: 0, key: 'tick.age0' },
  { age: 5e9, key: 'tick.age5e9' },
  { age: 1e10, key: 'tick.age1e10' },
];

/**
 * 지나는 자리의 이름표 — HR 도 위 자리 · 나타나게 하는 단계. 그 단계 진행도만큼 짙어진다.
 * 자리는 경로와 겹치지 않게 고른 배치다(월드 앵커 칩은 가운데 정렬, G122).
 */
const STAGE_LABELS: readonly { key: StarLifeCycleMessageKey; pos: HrPoint; phase?: string }[] = [
  { key: 'label.mainSequence', pos: [4.2, 1.1] },
  { key: 'label.supergiant', pos: [3.62, 4.5], phase: 'heavy-rsg' },
  { key: 'label.giant', pos: [3.78, 2.9], phase: 'light-giant' },
  { key: 'label.nebula', pos: [4.85, 2.6], phase: 'light-shed' },
  { key: 'label.whiteDwarf', pos: [4.78, -1.1], phase: 'light-cool' },
];
/** 초신성 끝 이름표 자리 — 끝 고리 왼쪽 위. */
const HEAVY_END_LABEL: HrPoint = [3.9, 5.95];

function label(
  id: string,
  pos: Vec2,
  key: StarLifeCycleMessageKey,
  align: Readout['align'],
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: AXIS_FONT_PX,
    align,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
}

/** 밤하늘 위 이름표 — 두 테마 모두에서 읽히게 바탕 칩을 깐다. */
function skyLabel(id: string, pos: Vec2, key: StarLifeCycleMessageKey, opacity: number): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text(key),
    chip: true,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    opacity,
    style: { colorRole: 'ink', emphasis: 'medium' },
  };
}

function starSize(p: HrPoint, c: LifeConstants): number {
  return Math.max(
    STAR_SIZE_MIN,
    Math.min(STAR_SIZE_MAX, STAR_SIZE_BASE + STAR_SIZE_PER_DEX * logRadius(p, c.sunTemperatureK)),
  );
}

function star(id: string, p: HrPoint, opacity: number, c: LifeConstants): Body {
  return {
    type: 'body',
    id,
    pos: hr(p),
    shape: 'circle',
    size: starSize(p, c),
    outline: 'none',
    glow: true,
    opacity,
    light: { rgb: blackbodyRgb(p[0]) },
  };
}

function massLabel(
  id: string,
  p: HrPoint,
  mass: number,
  below: boolean,
  opacity: number,
  c: LifeConstants,
): Readout {
  const lift = starSize(p, c) + MASS_LABEL_GAP;
  return {
    type: 'readout',
    id,
    anchor: { world: hr(p), offset: [0, below ? lift : -lift] },
    text: text('label.mass'),
    vars: { m: String(mass) },
    chip: true,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    opacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

function trail(id: string, pts: readonly HrPoint[]): Primitive[] {
  if (pts.length < 2) return [];
  return [
    {
      type: 'trajectory',
      id,
      points: pts.map(hr),
      width: TRAIL_WIDTH_PX,
      light: TRAIL_LIGHT,
    },
  ];
}

export function scene(params: {
  state: StarLifeCycleState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('star-life-cycle: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  // ---- 밤하늘: 그림 영역은 빛이 없다 ----
  // 흑체색(흰빛에 가까운 태양 · 푸른 흰 별)이 라이트 테마 미색 바탕에 묻히지 않게 (G92, hr-diagram 과 같다).
  out.push({
    type: 'region',
    id: 'sky',
    points: [at(PLOT.left, PLOT.top), at(PLOT.right, PLOT.top), at(PLOT.right, PLOT.bottom), at(PLOT.left, PLOT.bottom)],
    light: 0,
    fillOpacity: 1,
  });

  // ---- 축과 눈금 ----
  out.push({
    type: 'trajectory',
    id: 'axis',
    points: [at(PLOT.left, PLOT.top), at(PLOT.left, PLOT.bottom), at(PLOT.right, PLOT.bottom)],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });
  const ticks: Vec2[][] = [];
  for (const t of TEMP_TICKS) {
    const x = sx(Math.log10(t.K));
    ticks.push([at(x, PLOT.bottom), at(x, PLOT.bottom + TICK_LEN)]);
  }
  for (const t of LUM_TICKS) {
    const y = sy(t.ll);
    ticks.push([at(PLOT.left - TICK_LEN, y), at(PLOT.left, y)]);
  }
  out.push({
    type: 'lineSet',
    id: 'axis-ticks',
    lines: ticks,
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });
  for (const t of TEMP_TICKS) {
    out.push(label(`tick-t${t.K}`, at(sx(Math.log10(t.K)), PLOT.bottom + TICK_LABEL_GAP), t.key, 'center'));
  }
  out.push(
    label('axis-temperature', at((PLOT.left + PLOT.right) / 2, PLOT.bottom + T_AXIS_NAME_DROP), 'axis.temperature', 'center'),
  );
  for (const t of LUM_TICKS) {
    out.push(label(`tick-l${t.ll}`, at(PLOT.left - L_TICK_LABEL_GAP, sy(t.ll)), t.key, 'right'));
  }
  // 세로로 세울 수 없어(G16) 이름과 단위를 두 줄로 가로 배치한다.
  const lMid = sy((L_AXIS.top + L_AXIS.bottom) / 2);
  out.push(label('axis-luminosity', at(L_AXIS_NAME_X, lMid - L_AXIS_NAME_LINE / 2), 'axis.luminosity', 'center'));
  out.push(label('axis-luminosity-unit', at(L_AXIS_NAME_X, lMid + L_AXIS_NAME_LINE / 2), 'axis.luminosityUnit', 'center'));

  // ---- 주계열 띠 ----
  out.push({
    type: 'trajectory',
    id: 'main-sequence',
    points: MAIN_SEQUENCE.map(hr),
    width: BAND_WIDTH_PX,
    opacity: BAND_OPACITY,
    light: BAND_LIGHT,
  });

  // ---- 두 별의 경로 ----
  const heavy = readTrack(HEAVY_TRACK, tl);
  const light = readTrack(LIGHT_TRACK, tl);
  out.push(...trail('trail-heavy', heavy.trail), ...trail('trail-light', light.trail));

  // ---- 행성상 성운: 껍질을 벗는 동안 가벼운 별 둘레에 번지고, 식는 동안 옅어진다 ----
  const shed = tl.at('light-shed');
  const cool = tl.at('light-cool');
  if (shed > 0 && cool < 1) {
    const r = NEBULA_R0 + (NEBULA_R1 - NEBULA_R0) * ((shed + cool) / 2);
    const [cx, cy] = [sx(light.now[0]), sy(light.now[1])];
    const ring: Vec2[] = [];
    for (let i = 0; i < NEBULA_SEGMENTS; i++) {
      const a = (2 * Math.PI * i) / NEBULA_SEGMENTS;
      ring.push(at(cx + r * Math.cos(a), cy + r * Math.sin(a)));
    }
    out.push({
      type: 'trajectory',
      id: 'nebula',
      points: ring,
      closed: true,
      width: NEBULA_WIDTH_PX,
      opacity: NEBULA_OPACITY * Math.min(1, shed * NEBULA_FADE_IN) * (1 - cool),
      light: { rgb: wavelengthToLinearRgb(c.nebulaNm) },
    });
  }

  // ---- 무거운 별의 끝: 점이 꺼지고 그 자리에 빈 고리가 남는다(폭발 장면은 그리지 않는다) ----
  const collapse = tl.at('heavy-collapse');
  if (collapse > 0) {
    out.push({
      type: 'body',
      id: 'heavy-end',
      pos: hr(heavy.now),
      shape: 'circle',
      size: END_RING_SIZE,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: collapse,
      light: END_RING_LIGHT,
    });
  }

  // ---- 두 별 ----
  if (collapse < 1) out.push(star('star-heavy', heavy.now, 1 - collapse, c));
  out.push(star('star-light', light.now, 1, c));

  // ---- 이름표 ----
  for (const s of STAGE_LABELS) {
    const o = s.phase ? tl.at(s.phase) : 1;
    if (o <= 0) continue;
    out.push(skyLabel(`name-${s.key}`, hr(s.pos), s.key, o));
  }
  if (collapse > 0) out.push(skyLabel('name-heavy-end', hr(HEAVY_END_LABEL), 'label.heavyEnd', collapse));
  if (collapse < 1) out.push(massLabel('mass-heavy', heavy.now, c.massHeavy, false, 1 - collapse, c));
  out.push(massLabel('mass-light', light.now, c.massLight, true, 1, c));

  // ---- 시간 자 ----
  out.push(...ruler(ageNow(tl, c), c));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/**
 * 시간 자 — 선형 나이 축 위 두 줄. 막대는 그 별이 빛나며 탄 동안(일생)이고, 표시선은 지금 나이다.
 * 무거운 별의 막대는 끝까지 자라도 점 하나 — 1000만 년은 140억 년 자에서 1 px 도 안 된다.
 */
function ruler(age: number, c: LifeConstants): Primitive[] {
  const out: Primitive[] = [];
  out.push({
    type: 'trajectory',
    id: 'ruler-base',
    points: [at(RULER.left, RULER.base), at(RULER.right, RULER.base)],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });
  out.push({
    type: 'lineSet',
    id: 'ruler-ticks',
    lines: AGE_TICKS.map((t) => [at(rulerX(t.age, c), RULER.base), at(rulerX(t.age, c), RULER.base + TICK_LEN)]),
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });
  for (const t of AGE_TICKS) {
    out.push(label(`ruler-tick-${t.age}`, at(rulerX(t.age, c), RULER.base + RULER_LABEL_DROP), t.key, 'center'));
  }
  out.push(label('ruler-name', at(RULER.left - ROW_LABEL_GAP, RULER.base + RULER_LABEL_DROP), 'axis.age', 'right'));

  const rows: readonly {
    id: string;
    y: number;
    mass: number;
    end: number;
    endKey: StarLifeCycleMessageKey;
  }[] = [
    { id: 'heavy', y: RULER.rowHeavy, mass: c.massHeavy, end: c.endHeavy, endKey: 'label.lifeHeavy' },
    { id: 'light', y: RULER.rowLight, mass: c.massLight, end: c.tipLight, endKey: 'label.lifeLight' },
  ];
  for (const r of rows) {
    out.push({
      type: 'readout',
      id: `ruler-row-${r.id}`,
      anchor: { world: at(RULER.left - ROW_LABEL_GAP, r.y) },
      text: text('label.mass'),
      vars: { m: String(r.mass) },
      chip: false,
      font: 'text',
      fontSize: AXIS_FONT_PX,
      align: 'right',
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
    const x1 = rulerX(Math.min(age, r.end), c);
    out.push({
      type: 'trajectory',
      id: `ruler-bar-${r.id}`,
      points: [at(RULER.left, r.y), at(x1, r.y)],
      width: BAR_WIDTH_PX,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
    if (age >= r.end) {
      out.push({
        ...label(`ruler-end-${r.id}`, at(x1 + END_LABEL_GAP, r.y), r.endKey, 'left'),
        style: { colorRole: 'ink', emphasis: 'medium' },
      });
    }
  }

  // 지금 나이 — 강조색은 이 한 뜻에만 쓴다.
  const xn = rulerX(age, c);
  out.push({
    type: 'trajectory',
    id: 'ruler-now',
    points: [at(xn, RULER.rowHeavy - CURSOR_OVER), at(xn, RULER.base)],
    width: CURSOR_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  return out;
}

/** 고정 경계. 프레이밍은 주장의 일부다 — 설계 캔버스 전체를 그대로 담는다 (원칙 6). */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
