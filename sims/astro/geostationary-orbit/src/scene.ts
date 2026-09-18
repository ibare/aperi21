// ========================================================================
// geostationary-orbit — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽 — 북극 위에서 내려다본 지구(sector 원판 + 함께 도는 경선 살 lineSet)와 지표의 기지국
// (body custom 탑), 기지국 머리 위로 뻗은 점선(trajectory), 세 원 궤도(trajectory closed)와 위성
// (body), 기지국에서 보이는 위성만 잇는 선(trajectory). 지구 · 궤도는 같은 축척이다.
// 오른쪽 — 기지국에서 올려다본 하늘(적도면의 반원, sector 호 + 지평선). 위성은 반원 위의 점으로,
// 기지국에서 본 방향에 선다. 지평선 아래로 지면 사라진다.
// 캡션은 선언의 캡션 슬롯이 그린다.
//
// 색 — 위성마다 하나(궤도 · 이은 선 · 하늘의 점이 같은 대상이라 같은 색). 강조색은 정지 위성
// 한 뜻에만 쓴다. 지구 · 기지국 · 점선 · 지평선 · 글자는 무채색 역할.
// ========================================================================

import type {
  Bounds,
  ColorRole,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { MERIDIAN_COUNT, ORBIT_VIEW, SCENE_BOUNDS, SKY, text } from './schema';
import {
  SATELLITES,
  type SatelliteId,
  elapsedDays,
  onCircle,
  radiusKm,
  readConstants,
  satelliteAngle,
  skyView,
  stationAngle,
} from './physics';
import type { GeostationaryOrbitState } from './state';

/** 선 굵기(화면 px). 위계라 배율을 따르지 않는다. */
const ORBIT_WIDTH_PX = 1.2;
const LINK_WIDTH_PX = 2;
const GUIDE_WIDTH_PX = 1;
const OUTLINE_WIDTH_PX = 1;
const MERIDIAN_WIDTH_PX = 1;
/** 글자 크기(화면 px). */
const LABEL_FONT_PX = 13;
const SMALL_FONT_PX = 12;

/** 지구 원판의 채움 짙기. */
const EARTH_FILL_OPACITY = 0.22;
/** 초점이 아닌 위성의 이은 선 불투명도 — 캡션이 말하는 위성의 선만 짙다. */
const LINK_DIM_OPACITY = 0.35;

/** 위성 점의 크기(월드) — 왼쪽 궤도 위, 오른쪽 하늘 위. */
const SAT_R = 5;
const SKY_SAT_R = 6.5;
/** 기지국 탑 — 반너비 · 높이(월드). 왼쪽 지구 위, 오른쪽 하늘 판 가운데. */
const STATION_TOWER = { halfWidth: 3.5, height: 9 } as const;
const SKY_STATION_TOWER = { halfWidth: 7, height: 18 } as const;

/** 머리 위 점선이 가장 높은 궤도 너머로 넘치는 길이(월드). */
const OVERHEAD_OVERSHOOT = 14;
/** 궤도 원을 긋는 표본 수. */
const ORBIT_SAMPLES = 128;

/** 이름표 띄움 거리(월드). */
const ORBIT_LABEL_GAP = 9;
const SKY_LABEL_GAP = 14;
const SKY_OVERHEAD_LABEL_GAP = 22;
const SKY_TITLE_DROP = 46;
const SKY_STATION_LABEL_DROP = 16;
/** 지평선이 하늘 반원 양 끝 너머로 넘치는 길이(월드). */
const HORIZON_OVERHANG = 22;
/** 왼쪽 판 이름 자리(월드). */
const TOP_VIEW_LABEL_AT: Vec2 = [14, 362];

/** 위성마다 색 역할 · 궤도 이름. 정지 위성만 강조색이다. */
const SAT_ROLE: Record<SatelliteId, ColorRole> = { low: 'secondary', geo: 'accent', high: 'primary' };
const ORBIT_LABEL: Record<SatelliteId, 'label.lowOrbit' | 'label.geoOrbit' | 'label.highOrbit'> = {
  low: 'label.lowOrbit',
  geo: 'label.geoOrbit',
  high: 'label.highOrbit',
};

function add(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

/** 탑 모양 — 밑변이 pos, 꼭대기가 +y. `orientation` 으로 돌린다. */
function towerPath(t: { halfWidth: number; height: number }): string {
  return `M ${-t.halfWidth} 0 L ${t.halfWidth} 0 L 0 ${t.height} Z`;
}

export function scene(params: {
  state: GeostationaryOrbitState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('geostationary-orbit: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const days = elapsedDays(timeline);
  const out: Primitive[] = [];

  const center: Vec2 = [ORBIT_VIEW.cx, ORBIT_VIEW.cy];
  const toWorld = (km: number): number => km / ORBIT_VIEW.kmPerUnit;
  const earthR = toWorld(c.earthRadiusKm);
  const phi = stationAngle(days);
  const linkOpacity = (id: SatelliteId): number => (timeline.phase === id ? 1 : LINK_DIM_OPACITY);

  // ==== 왼쪽 — 북극 위에서 내려다본 지구와 궤도 ====

  // 궤도 — 위성의 색으로 옅게.
  for (const id of SATELLITES) {
    const r = toWorld(radiusKm(id, c));
    const pts: Vec2[] = [];
    for (let i = 0; i < ORBIT_SAMPLES; i++) pts.push(add(center, onCircle(r, (2 * Math.PI * i) / ORBIT_SAMPLES)));
    out.push({
      type: 'trajectory',
      id: `orbit-${id}`,
      points: pts,
      closed: true,
      width: ORBIT_WIDTH_PX,
      style: { colorRole: SAT_ROLE[id], emphasis: 'subtle' },
    });
  }

  // 궤도 이름 — 각 원의 맨 아래 바로 안쪽. 도는 점선 · 이은 선 · 위성이 글자 **위**로 지나가도록 먼저 둔다.
  for (const id of SATELLITES) {
    const r = toWorld(radiusKm(id, c));
    out.push({
      type: 'readout',
      id: `orbit-label-${id}`,
      anchor: { world: [ORBIT_VIEW.cx, ORBIT_VIEW.cy - r + ORBIT_LABEL_GAP] },
      text: text(ORBIT_LABEL[id]),
      chip: false,
      font: 'text',
      fontSize: SMALL_FONT_PX,
      style: { colorRole: SAT_ROLE[id], emphasis: 'strong' },
    });
  }

  // 지구 — 원판과 함께 도는 경선 살.
  out.push({
    type: 'sector',
    id: 'earth',
    center,
    radius: earthR,
    from: 0,
    to: 2 * Math.PI,
    fillOpacity: EARTH_FILL_OPACITY,
    rimWidth: OUTLINE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const spokes: Vec2[][] = [];
  for (let k = 0; k < MERIDIAN_COUNT; k++) {
    const a = phi + (k * Math.PI) / MERIDIAN_COUNT;
    spokes.push([add(center, onCircle(earthR, a)), add(center, onCircle(earthR, a + Math.PI))]);
  }
  out.push({
    type: 'lineSet',
    id: 'meridians',
    lines: spokes,
    width: MERIDIAN_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // 기지국 머리 위 — 지구와 함께 도는 점선.
  const stationTip = add(center, onCircle(earthR + STATION_TOWER.height, phi));
  const overheadEnd = add(center, onCircle(toWorld(c.highRadiusKm) + OVERHEAD_OVERSHOOT, phi));
  out.push({
    type: 'trajectory',
    id: 'overhead',
    points: [stationTip, overheadEnd],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // 기지국과 위성을 잇는 선 — 지평선 위에 있어 보이는 위성만.
  const views = new Map(SATELLITES.map((id) => [id, skyView(id, days, c)] as const));
  const satPos = new Map(
    SATELLITES.map((id) => [id, add(center, onCircle(toWorld(radiusKm(id, c)), satelliteAngle(id, days, c)))] as const),
  );
  for (const id of SATELLITES) {
    if (!views.get(id)!.visible) continue;
    out.push({
      type: 'trajectory',
      id: `link-${id}`,
      points: [stationTip, satPos.get(id)!],
      width: LINK_WIDTH_PX,
      opacity: linkOpacity(id),
      style: { colorRole: SAT_ROLE[id], emphasis: 'strong' },
    });
  }

  // 기지국 탑 — 지표에서 바깥으로.
  out.push({
    type: 'body',
    id: 'station',
    pos: add(center, onCircle(earthR, phi)),
    shape: 'custom',
    customPath: towerPath(STATION_TOWER),
    orientation: phi - Math.PI / 2,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 위성.
  for (const id of SATELLITES) {
    out.push({
      type: 'body',
      id: `sat-${id}`,
      pos: satPos.get(id)!,
      shape: 'circle',
      size: SAT_R,
      glow: false,
      outline: 'background',
      style: { colorRole: SAT_ROLE[id], emphasis: 'strong' },
    });
  }

  // 정지 궤도의 반지름 — 지구 중심에서 잰다. 수는 선언값 그대로 (S-piece 유효숫자).
  out.push({
    type: 'dimension',
    id: 'geo-radius',
    from: center,
    to: [ORBIT_VIEW.cx - toWorld(c.geoRadiusKm), ORBIT_VIEW.cy],
    text: text('label.geoRadius'),
    vars: { r: String(c.geoRadiusKm) },
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  out.push({
    type: 'readout',
    id: 'top-view-label',
    anchor: { world: TOP_VIEW_LABEL_AT },
    text: text('label.topView'),
    align: 'left',
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ==== 오른쪽 — 기지국에서 올려다본 하늘 ====

  const skyCenter: Vec2 = [SKY.cx, SKY.cy];
  const zenith: Vec2 = [SKY.cx, SKY.cy + SKY.R];
  out.push({
    type: 'sector',
    id: 'sky-dome',
    center: skyCenter,
    radius: SKY.R,
    from: 0,
    to: Math.PI,
    fillOpacity: 0,
    rimWidth: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  out.push({
    type: 'trajectory',
    id: 'horizon',
    points: [
      [SKY.cx - SKY.R - HORIZON_OVERHANG, SKY.cy],
      [SKY.cx + SKY.R + HORIZON_OVERHANG, SKY.cy],
    ],
    width: OUTLINE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const skyTip: Vec2 = [SKY.cx, SKY.cy + SKY_STATION_TOWER.height];
  out.push({
    type: 'trajectory',
    id: 'sky-overhead',
    points: [skyTip, zenith],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });

  const skyPos = (id: SatelliteId): Vec2 => {
    const a = views.get(id)!.fromZenith;
    return [SKY.cx + SKY.R * Math.sin(a), SKY.cy + SKY.R * Math.cos(a)];
  };
  for (const id of SATELLITES) {
    if (!views.get(id)!.visible) continue;
    out.push({
      type: 'trajectory',
      id: `sky-link-${id}`,
      points: [skyTip, skyPos(id)],
      width: LINK_WIDTH_PX,
      opacity: linkOpacity(id),
      style: { colorRole: SAT_ROLE[id], emphasis: 'strong' },
    });
  }
  out.push({
    type: 'body',
    id: 'sky-station',
    pos: skyCenter,
    shape: 'custom',
    customPath: towerPath(SKY_STATION_TOWER),
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  for (const id of SATELLITES) {
    if (!views.get(id)!.visible) continue;
    out.push({
      type: 'body',
      id: `sky-sat-${id}`,
      pos: skyPos(id),
      shape: 'circle',
      size: SKY_SAT_R,
      glow: false,
      outline: 'background',
      style: { colorRole: SAT_ROLE[id], emphasis: 'strong' },
    });
  }

  const skyLabels: { id: string; at: Vec2; key: 'label.west' | 'label.east' | 'label.overhead' }[] = [
    { id: 'sky-west', at: [SKY.cx - SKY.R, SKY.cy - SKY_LABEL_GAP], key: 'label.west' },
    { id: 'sky-east', at: [SKY.cx + SKY.R, SKY.cy - SKY_LABEL_GAP], key: 'label.east' },
    { id: 'sky-overhead-label', at: [SKY.cx, SKY.cy + SKY.R + SKY_OVERHEAD_LABEL_GAP], key: 'label.overhead' },
  ];
  for (const l of skyLabels) {
    out.push({
      type: 'readout',
      id: l.id,
      anchor: { world: l.at },
      text: text(l.key),
      chip: false,
      font: 'text',
      fontSize: SMALL_FONT_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'readout',
    id: 'sky-station-label',
    anchor: { world: [SKY.cx, SKY.cy - SKY_STATION_LABEL_DROP] },
    text: text('label.station'),
    chip: false,
    font: 'text',
    fontSize: SMALL_FONT_PX,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });
  out.push({
    type: 'readout',
    id: 'sky-title',
    anchor: { world: [SKY.cx, SKY.cy - SKY_TITLE_DROP] },
    text: text('label.sky'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
