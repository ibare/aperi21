// ========================================================================
// seasonal-sun-path — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽 — 하늘 돔. 지평선 원판(region) · 지평선 타원 · 돔 윤곽(trajectory) · 방위 이름표,
// 지나온 계절의 태양 길(옅게) · 지금 태양 길(강조색) · 남중 고도 부채꼴(region + 호) · 태양(body).
// 오른쪽 — 하루 막대. 자정 → 정오 → 자정 한 줄에 지금 낮의 몫(강조색)과 지금 시각 바늘,
// 그 아래에 지나온 계절의 낮 몫 줄.
// 캡션은 선언의 캡션 슬롯이 그린다.
//
// 색 — 강조색은 「지금 계절」 한 뜻에만: 지금 태양 길 · 태양 · 남중 고도 부채꼴 · 지금 낮 막대.
// 지나온 길과 줄은 먹색을 옅게, 틀 · 지평선 · 글자는 회색.
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
  ALT_SECTOR_FRAC,
  ARC_STEP_DEG,
  BAR,
  DIR_LABEL_FRAC,
  NORTH_LABEL_FRAC,
  DOME_TITLE,
  HOLD_PHASES,
  SCENE_BOUNDS,
  SEASON_LABEL_HOUR_DEG,
  text,
  type HoldPhase,
  type SeasonalSunPathMessageKey,
} from './schema';
import {
  altitudeWedge,
  dayArc,
  dayFraction,
  daylightHours,
  declination,
  domeOutline,
  holdDeclination,
  holdDone,
  horizonPoint,
  horizonRing,
  hourAngle,
  project,
  readConstants,
  sunDir,
  type SeasonalSunPathConstants,
} from './physics';
import type { SeasonalSunPathState } from './state';

/** 선 굵기(화면 px). 위계라 배율을 따르지 않는다. */
const PATH_WIDTH_PX = 3;
const GHOST_WIDTH_PX = 1.8;
const HORIZON_WIDTH_PX = 1.4;
const DOME_WIDTH_PX = 1;
const GUIDE_WIDTH_PX = 1;
const WEDGE_RIM_PX = 1.6;
const NOW_HAND_PX = 2;
/** 글자 크기(화면 px). */
const LABEL_FONT_PX = 13;
const SMALL_FONT_PX = 12;
/** 태양 반지름(월드). */
const SUN_R = 6;
/** 관측자 점 반지름(월드). */
const OBSERVER_R = 2.2;
/** 지나온 길 · 줄의 불투명도. */
const GHOST_OPACITY = 0.55;
/** 지평선 원판 칠. */
const GROUND_FILL = 0.16;
/** 남중 고도 부채꼴 칠. */
const WEDGE_FILL = 0.26;
/** 막대 판의 밤 바탕 칠. */
const NIGHT_FILL = 0.14;
/** 지금 낮 막대 칠. */
const DAY_FILL = 0.85;
/** 지나온 계절 줄의 낮 칠. */
const GHOST_DAY_FILL = 0.5;
/** 계절 이름표를 길에서 띄우는 거리(화면 px). */
const SEASON_LABEL_RISE_PX = 12;
/** 방위 이름표를 옆으로 비키는 거리(화면 px) — 춘추분 길이 정동 · 정서를 지나고, 북은 춘추분 이름표 칩에 붙지 않게. */
const DIR_LABEL_NUDGE_PX = 10;
/** 남중 고도 이름표를 부채꼴 호에서 오른쪽 아래로 띄우는 거리(화면 px) — 칩이 좁은 동지 부채꼴을 덮지 않게. */
const WEDGE_LABEL_GAP_PX: Vec2 = [40, 8];
/** 지금 시각 바늘이 막대 위아래로 넘치는 길이(월드). */
const HAND_OVERHANG = 4;
/** 지평선 · 돔을 표본하는 각 간격(도). */
const RING_STEP_DEG = 4;

const SEASON_LABEL: Record<HoldPhase, SeasonalSunPathMessageKey> = {
  winter: 'label.winter',
  equinox: 'label.equinox',
  summer: 'label.summer',
};
/** 계절 이름표가 길의 위(+1) · 아래(−1) 어느 쪽에 붙는가 — 가장 낮은 동지 길은 아래에 달아 춘추분 이름표와 떨어뜨린다. */
const SEASON_LABEL_SIDE: Record<HoldPhase, number> = {
  winter: -1,
  equinox: 1,
  summer: 1,
};

const DEG = Math.PI / 180;

/** 하루 중 시각(시간)을 막대 위 가로 자리로. */
function barX(hours: number, c: SeasonalSunPathConstants): number {
  return BAR.x0 + (BAR.len * hours) / c.dayHours;
}

/** 가로 [x0, x1] · 가운데 높이 y · 두께 h 인 사각형. */
function rect(x0: number, x1: number, y: number, h: number): Vec2[] {
  return [
    [x0, y - h / 2],
    [x1, y - h / 2],
    [x1, y + h / 2],
    [x0, y + h / 2],
  ];
}

/** 계절 이름표 자리 — 오후 한 시각의 길 위 점. 길마다 높이가 달라 이름표가 겹치지 않는다. */
function seasonLabelSpot(decl: number, c: SeasonalSunPathConstants): Vec2 {
  return project(sunDir(decl, SEASON_LABEL_HOUR_DEG * DEG, c), c);
}

export function scene(params: {
  state: SeasonalSunPathState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('seasonal-sun-path: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  const decl = declination(timeline, c);
  const frac = dayFraction(timeline);
  const h = hourAngle(frac);
  // 지나온 길은 되돌아가는 동안 지운다 — 주기가 동지에서 다시 시작한다.
  const ghostFade = 1 - timeline.at('back');
  // 지금 머무는 계절 — 옮기는 동안은 없다. 이름표를 지금 길에 걸지 판정한다 (장부 G104).
  const holding = HOLD_PHASES.find((id) => timeline.phase === id);

  const out: Primitive[] = [];

  // ---- 돔 제목 — 관측 위도는 스테이지 상수 그대로 ----
  out.push({
    type: 'readout',
    id: 'dome-title',
    anchor: { world: [DOME_TITLE.x, DOME_TITLE.y] },
    text: text('label.domeTitle'),
    vars: { lat: String(c.latitude) },
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 지평선 원판 · 지평선 · 돔 윤곽 ----
  const ring = horizonRing(c, RING_STEP_DEG);
  out.push({
    type: 'region',
    id: 'ground',
    points: ring,
    fillOpacity: GROUND_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'horizon',
    points: ring,
    closed: true,
    width: HORIZON_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'dome',
    points: domeOutline(RING_STEP_DEG),
    width: DOME_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
  });

  // ---- 방위 이름표 ----
  const dirs: { az: number; key: SeasonalSunPathMessageKey; id: string; frac: number; nudge: number }[] = [
    { az: 0, key: 'label.north', id: 'dir-north', frac: NORTH_LABEL_FRAC, nudge: -1 },
    { az: 90, key: 'label.east', id: 'dir-east', frac: DIR_LABEL_FRAC, nudge: 1 },
    { az: 180, key: 'label.south', id: 'dir-south', frac: DIR_LABEL_FRAC, nudge: 0 },
    { az: 270, key: 'label.west', id: 'dir-west', frac: DIR_LABEL_FRAC, nudge: -1 },
  ];
  for (const d of dirs) {
    out.push({
      type: 'readout',
      id: d.id,
      anchor: { world: horizonPoint(d.az * DEG, c, d.frac), offset: [d.nudge * DIR_LABEL_NUDGE_PX, 0] },
      text: text(d.key),
      chip: false,
      font: 'text',
      fontSize: LABEL_FONT_PX,
      weight: 'bold',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 지나온 계절의 태양 길 — 옅게, 이름표와 함께 ----
  for (const id of HOLD_PHASES) {
    if (!holdDone(timeline, id) || ghostFade <= 0) continue;
    const d = holdDeclination(id, c);
    out.push({
      type: 'trajectory',
      id: `ghost-${id}`,
      points: dayArc(d, c, ARC_STEP_DEG),
      width: GHOST_WIDTH_PX,
      opacity: GHOST_OPACITY * ghostFade,
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
    out.push({
      type: 'readout',
      id: `ghost-${id}-label`,
      anchor: { world: seasonLabelSpot(d, c), offset: [0, -SEASON_LABEL_SIDE[id] * SEASON_LABEL_RISE_PX] },
      text: text(SEASON_LABEL[id]),
      chip: true,
      font: 'text',
      fontSize: SMALL_FONT_PX,
      opacity: ghostFade,
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
  }

  // ---- 남중 고도 — 자오선 평면의 부채꼴 ----
  const wedgeArc = altitudeWedge(decl, c, ALT_SECTOR_FRAC, ARC_STEP_DEG);
  out.push({
    type: 'region',
    id: 'noon-wedge',
    points: [[0, 0], ...wedgeArc],
    fillOpacity: WEDGE_FILL,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'noon-wedge-rim',
    points: wedgeArc,
    width: WEDGE_RIM_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  const noonPoint = project(sunDir(decl, 0, c), c);
  // 관측자에서 남중한 해까지 — 부채꼴의 끝 변을 돔까지 잇는다.
  out.push({
    type: 'trajectory',
    id: 'noon-ray',
    points: [[0, 0], noonPoint],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'medium', lineStyle: 'dashed' },
  });
  // 관측자에서 정남 지평선까지 — 부채꼴의 첫 변.
  out.push({
    type: 'trajectory',
    id: 'south-ray',
    points: [[0, 0], horizonPoint(180 * DEG, c)],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  const wedgeMid = wedgeArc[Math.floor(wedgeArc.length / 2)]!;
  out.push({
    type: 'readout',
    id: 'noon-wedge-label',
    anchor: { world: wedgeMid, offset: WEDGE_LABEL_GAP_PX },
    text: text('label.noonAltitude'),
    chip: true,
    font: 'text',
    fontSize: SMALL_FONT_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 지금 태양 길 ----
  out.push({
    type: 'trajectory',
    id: 'path-now',
    points: dayArc(decl, c, ARC_STEP_DEG),
    width: PATH_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  if (holding) {
    out.push({
      type: 'readout',
      id: 'path-now-label',
      anchor: { world: seasonLabelSpot(decl, c), offset: [0, -SEASON_LABEL_SIDE[holding] * SEASON_LABEL_RISE_PX] },
      text: text(SEASON_LABEL[holding]),
      chip: true,
      font: 'text',
      fontSize: SMALL_FONT_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 관측자 ----
  out.push({
    type: 'body',
    id: 'observer',
    pos: [0, 0],
    shape: 'circle',
    size: OBSERVER_R,
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 태양 — 지평선 위에 있을 때만 ----
  const sun = sunDir(decl, h, c);
  if (sun[2] > 0) {
    out.push({
      type: 'body',
      id: 'sun',
      pos: project(sun, c),
      shape: 'circle',
      size: SUN_R,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 하루 막대 ----
  out.push({
    type: 'readout',
    id: 'bar-title',
    anchor: { world: [BAR.x0 + BAR.len / 2, BAR.titleY] },
    text: text('label.barTitle'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  const noonHour = c.dayHours / 2;
  const dayNow = daylightHours(decl, c);
  // 지금 줄 — 밤 바탕 위에 낮의 몫. 낮은 정오를 가운데 둔다.
  out.push({
    type: 'region',
    id: 'bar-now-night',
    points: rect(barX(0, c), barX(c.dayHours, c), BAR.nowY, BAR.nowH),
    fillOpacity: NIGHT_FILL,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'region',
    id: 'bar-now-day',
    points: rect(barX(noonHour - dayNow / 2, c), barX(noonHour + dayNow / 2, c), BAR.nowY, BAR.nowH),
    fillOpacity: DAY_FILL,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'bar-now-name',
    anchor: { world: [BAR.nameX, BAR.nowY] },
    text: text('label.now'),
    chip: false,
    font: 'text',
    fontSize: SMALL_FONT_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  // 지금 시각 바늘 — 머무는 동안 하루를 가로지른다. 해가 뜬 동안만 낮 막대 위에 있다.
  const handX = barX(frac * c.dayHours, c);
  out.push({
    type: 'trajectory',
    id: 'bar-now-hand',
    points: [
      [handX, BAR.nowY - BAR.nowH / 2 - HAND_OVERHANG],
      [handX, BAR.nowY + BAR.nowH / 2 + HAND_OVERHANG],
    ],
    width: NOW_HAND_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 지나온 계절 줄 — 동지 · 춘추분 · 하지 순으로 아래로.
  HOLD_PHASES.forEach((id, i) => {
    if (!holdDone(timeline, id) || ghostFade <= 0) return;
    const y = BAR.rowY - i * BAR.rowGap;
    out.push({
      type: 'region',
      id: `bar-${id}-night`,
      points: rect(barX(0, c), barX(c.dayHours, c), y, BAR.rowH),
      fillOpacity: NIGHT_FILL,
      opacity: ghostFade,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    const hours = daylightHours(holdDeclination(id, c), c);
    out.push({
      type: 'region',
      id: `bar-${id}-day`,
      points: rect(barX(noonHour - hours / 2, c), barX(noonHour + hours / 2, c), y, BAR.rowH),
      fillOpacity: GHOST_DAY_FILL,
      opacity: ghostFade,
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
    out.push({
      type: 'readout',
      id: `bar-${id}-name`,
      anchor: { world: [BAR.nameX, y] },
      text: text(SEASON_LABEL[id]),
      chip: false,
      font: 'text',
      fontSize: SMALL_FONT_PX,
      opacity: ghostFade,
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
  });

  // 정오 · 자정 눈금 — 모든 줄을 세로로 꿰는 선. 춘추분 낮이 정확히 절반인 것이 정오 선 둘레의 대칭으로 보인다.
  const lastRowY = BAR.rowY - (HOLD_PHASES.length - 1) * BAR.rowGap;
  const guideTop = BAR.nowY + BAR.nowH / 2;
  const guideBottom = lastRowY - BAR.rowH / 2 - HAND_OVERHANG;
  const hourMarks: { hours: number; key: SeasonalSunPathMessageKey; id: string }[] = [
    { hours: 0, key: 'label.midnight', id: 'bar-mark-start' },
    { hours: noonHour, key: 'label.noon', id: 'bar-mark-noon' },
    { hours: c.dayHours, key: 'label.midnight', id: 'bar-mark-end' },
  ];
  for (const m of hourMarks) {
    const x = barX(m.hours, c);
    out.push({
      type: 'trajectory',
      id: `${m.id}-line`,
      points: [
        [x, guideTop],
        [x, guideBottom],
      ],
      width: GUIDE_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
    });
    out.push({
      type: 'readout',
      id: `${m.id}-label`,
      anchor: { world: [x, BAR.hourLabelY] },
      text: text(m.key),
      chip: false,
      font: 'text',
      fontSize: SMALL_FONT_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
