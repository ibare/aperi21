// ========================================================================
// muon-decay-evidence — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 뮤온 떼 · 붕괴 자리 · 지표에 닿은
// 뮤온(particleSystem) · 붕괴 섬광 · 닿는 섬광 · 반감기 눈금(trace) · 지표선 · 기둥 테 · 출발선
// (lineSet · trajectory) · 이름표와 닿은 수(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 뮤온은 두 기둥 모두 먹색(같은 뮤온이다), 붕괴한 자리 · 눈금 · 테는
// muted, **강조색은 「지표에 닿은 뮤온」 한 가지 뜻에만** (닿은 점 · 닿는 섬광 · 닿은 수).
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
import { columnFrame, drawMuons, halfDistanceKm, readConstants, type MuonConstants, type MuonDraw } from './physics';
import {
  CLASSICAL_X,
  COLUMN_HALF,
  COUNT_Y,
  DILATED_X,
  HALF_LABEL_GAP,
  HEADER_Y,
  LANDED_Y,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { MuonDecayEvidenceState } from './state';

/** 날아오는 뮤온 점 크기(화면 px). */
const MUON_PX = 1.4;
/** 붕괴한 자리 점 크기(화면 px) · 짙기. 배경 정보라 작고 옅다. */
const DECAY_SPOT_PX = 1;
const DECAY_SPOT_OPACITY = 0.55;
/** 붕괴 섬광 — 붕괴 자리에서 퍼지는 고리(화면 px) · 수명(초) · 굵기(화면 px). */
const DECAY_FLASH_FROM_PX = 1.5;
const DECAY_FLASH_TO_PX = 6;
const DECAY_FLASH_LIFE = 0.35;
const DECAY_FLASH_WIDTH_PX = 1;
/** 지표에 닿은 뮤온 점 크기(화면 px). 닿은 것이 주인공이라 한 단 크다. */
const LANDED_PX = 2.2;
/** 닿는 섬광 — 지표에서 위로 퍼지는 반원(화면 px) · 수명(초) · 굵기(화면 px). */
const LAND_FLASH_FROM_PX = 2;
const LAND_FLASH_TO_PX = 9;
const LAND_FLASH_LIFE = 0.5;
const LAND_FLASH_WIDTH_PX = 1.5;
/** 반감기 눈금 — 기둥 바깥 테에서 안쪽으로 들어오는 길이(월드) · 굵기(화면 px). */
const HALF_TICK_LEN = 0.35;
const HALF_TICK_WIDTH_PX = 1.5;
/** 기둥 테 · 출발선 굵기(화면 px) · 짙기. */
const FRAME_WIDTH_PX = 1;
const FRAME_OPACITY = 0.45;
/** 지표선 굵기(화면 px). */
const GROUND_WIDTH_PX = 2;
/** 이름표 글자 크기(화면 px) · 기둥 머리 글자 크기 · 닿은 수 글자 크기. */
const LABEL_PX = 11;
const HEADER_PX = 12;
const COUNT_PX = 12;
/** 반감기 거리 이름표 줄바꿈 폭(화면 px). */
const HALF_LABEL_WRAP_PX = 96;
/** 가운데 축의 둘째 줄(반감기)을 첫 줄(속력) 아래로 내리는 거리(화면 px). */
const HALF_LIFE_LINE_PX = 16;

/** 한 기둥의 모든 선언. `outerSign` 은 기둥 바깥 쪽(왼쪽 −1, 오른쪽 +1). */
function column(
  id: string,
  centerX: number,
  outerSign: -1 | 1,
  draw: MuonDraw,
  c: MuonConstants,
  dilated: boolean,
  fall: number,
  clock: number,
  kmPerSecond: number,
  swarmAlpha: number,
  recordAlpha: number,
  countAlpha: number,
): Primitive[] {
  const halfKm = halfDistanceKm(c, dilated);
  const f = columnFrame(draw, halfKm, fall, clock);
  const toWorld = (u: number): number => centerX + (u - 0.5) * 2 * COLUMN_HALF;
  const outerX = centerX + outerSign * COLUMN_HALF;
  const out: Primitive[] = [];

  // ---- 기둥 테(바깥 쪽 세로선) ----
  out.push({
    type: 'lineSet',
    id: `${id}-edge`,
    lines: [
      [
        [outerX, 0],
        [outerX, c.heightKm],
      ],
    ],
    width: FRAME_WIDTH_PX,
    opacity: FRAME_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 반감기 눈금 — 출발 높이에서 절반이 되는 거리마다 ----
  // 시간이 그대로면 촘촘하고(≈ 23 칸), 실제는 성기다(≈ 4.5 칸).
  const ticks: { pos: Vec2 }[] = [];
  for (let k = 1; c.heightKm - k * halfKm > 0; k++) {
    ticks.push({ pos: [outerX - (outerSign * HALF_TICK_LEN) / 2, c.heightKm - k * halfKm] });
  }
  out.push({
    type: 'trace',
    id: `${id}-half-ticks`,
    marks: ticks,
    shape: 'tick',
    size: HALF_TICK_LEN,
    direction: [1, 0],
    width: HALF_TICK_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: `${id}-half-label`,
    anchor: { world: [outerX + outerSign * HALF_LABEL_GAP, c.heightKm - halfKm / 2] },
    text: dilated ? text('label.dilatedHalf') : text('label.classicalHalf'),
    vars: { d: String(dilated ? c.dilatedHalfKm : c.classicalHalfM) },
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: outerSign < 0 ? 'right' : 'left',
    wrapWidth: HALF_LABEL_WRAP_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 붕괴한 자리 — 남아서 어디서 붕괴했는지의 분포가 된다 ----
  if (f.decayed.length > 0) {
    out.push({
      type: 'particleSystem',
      id: `${id}-decay-spots`,
      positions: f.decayed.map((d) => [toWorld(d.pos[0]), d.pos[1]] as Vec2),
      sizes: DECAY_SPOT_PX,
      opacity: DECAY_SPOT_OPACITY * recordAlpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    const fresh = f.decayed
      .map((d) => ({ pos: [toWorld(d.pos[0]), d.pos[1]] as Vec2, age: d.since / kmPerSecond }))
      .filter((m) => m.age < DECAY_FLASH_LIFE);
    if (fresh.length > 0) {
      out.push({
        type: 'trace',
        id: `${id}-decay-flash`,
        marks: fresh,
        life: DECAY_FLASH_LIFE,
        shape: 'ring',
        size: DECAY_FLASH_FROM_PX,
        spreadTo: DECAY_FLASH_TO_PX,
        width: DECAY_FLASH_WIDTH_PX,
        style: { colorRole: 'ink', emphasis: 'medium' },
      });
    }
  }

  // ---- 아직 날아오는 뮤온 ----
  if (f.alive.length > 0 && swarmAlpha > 0) {
    out.push({
      type: 'particleSystem',
      id: `${id}-muons`,
      positions: f.alive.map((p) => [toWorld(p[0]), p[1]] as Vec2),
      sizes: MUON_PX,
      opacity: swarmAlpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 지표에 닿은 뮤온 ----
  if (f.landed.length > 0) {
    const landedPos = f.landed.map((l) => [toWorld(l.x), LANDED_Y] as Vec2);
    const fresh = f.landed
      .map((l, i) => ({ pos: landedPos[i]!, age: l.since / kmPerSecond }))
      .filter((m) => m.age < LAND_FLASH_LIFE);
    if (fresh.length > 0) {
      out.push({
        type: 'trace',
        id: `${id}-land-flash`,
        marks: fresh,
        life: LAND_FLASH_LIFE,
        shape: 'ring',
        size: LAND_FLASH_FROM_PX,
        spreadTo: LAND_FLASH_TO_PX,
        arc: [0, Math.PI],
        width: LAND_FLASH_WIDTH_PX,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
    out.push({
      type: 'particleSystem',
      id: `${id}-landed`,
      positions: landedPos,
      sizes: LANDED_PX,
      opacity: recordAlpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 기둥 머리 이름표 ----
  out.push({
    type: 'readout',
    id: `${id}-header`,
    anchor: { world: [centerX, HEADER_Y] },
    text: dilated ? text('label.dilated') : text('label.classical'),
    ...(dilated ? { vars: { g: String(c.gammaShown) } } : {}),
    chip: false,
    font: 'text',
    fontSize: HEADER_PX,
    align: 'center',
    weight: 'bold',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 지표에 닿은 수 — 센 정수 ----
  if (countAlpha > 0) {
    out.push({
      type: 'readout',
      id: `${id}-count`,
      anchor: { world: [centerX, COUNT_Y] },
      text: text('label.arrived'),
      vars: { n: f.landed.length },
      chip: false,
      font: 'text',
      fontSize: COUNT_PX,
      align: 'center',
      weight: 'bold',
      opacity: countAlpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  return out;
}

export function scene(params: {
  state: MuonDecayEvidenceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('muon-decay-evidence: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const draw = drawMuons(c, tl.cycle);

  /** 떼 전체(가장 높이 있던 뮤온까지)가 `upper` 시작부터 `lower` 끝까지 지표로 내려온다. */
  const totalKm = c.heightKm + c.startBandKm;
  const fall = totalKm * tl.span(tl.start('upper'), tl.end('lower'));
  const kmPerSecond = totalKm / (tl.duration('upper') + tl.duration('lower'));
  /** 출발부터 흐른 시간을 같은 빠르기의 거리로 — 섬광의 나이를 재는 시계다. */
  const clock = Math.max(0, tl.u - tl.start('upper')) * kmPerSecond;

  const recordAlpha = 1 - tl.at('fade');
  const swarmAlpha = tl.at('appear') * recordAlpha;
  const countAlpha = tl.at('arrive') * recordAlpha;
  const out: Primitive[] = [];

  // ---- 출발선 — 대기 상층 ----
  out.push({
    type: 'trajectory',
    id: 'top-line',
    points: [
      [CLASSICAL_X - COLUMN_HALF, c.heightKm],
      [DILATED_X + COLUMN_HALF, c.heightKm],
    ],
    width: FRAME_WIDTH_PX,
    opacity: FRAME_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // ---- 두 기둥 — 같은 뮤온, 다른 것은 반감기 동안 가는 거리뿐 ----
  out.push(
    ...column('classical', CLASSICAL_X, -1, draw, c, false, fall, clock, kmPerSecond, swarmAlpha, recordAlpha, countAlpha),
  );
  out.push(
    ...column('dilated', DILATED_X, 1, draw, c, true, fall, clock, kmPerSecond, swarmAlpha, recordAlpha, countAlpha),
  );

  // ---- 지표선 — 닿은 뮤온 아래로 먼저 긋지 않고, 떼 위로 지나가지 않게 여기서 ----
  out.push({
    type: 'lineSet',
    id: 'ground',
    lines: [
      [
        [CLASSICAL_X - COLUMN_HALF, 0],
        [DILATED_X + COLUMN_HALF, 0],
      ],
    ],
    width: GROUND_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 가운데 높이 축 이름표 ----
  out.push({
    type: 'readout',
    id: 'height-label',
    anchor: { world: [0, c.heightKm] },
    text: text('label.height'),
    vars: { h: String(c.heightKm) },
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'speed-label',
    anchor: { world: [0, c.heightKm / 2] },
    text: text('label.speed'),
    vars: { beta: String(c.beta) },
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'half-life-label',
    anchor: { world: [0, c.heightKm / 2], offset: [0, HALF_LIFE_LINE_PX] },
    text: text('label.halfLife'),
    vars: { t: String(c.halfLifeUs) },
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'ground-label',
    anchor: { world: [0, COUNT_Y] },
    text: text('label.ground'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
