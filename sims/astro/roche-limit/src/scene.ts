// ========================================================================
// roche-limit — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 행성(body) · 한계 원 ·
// 지나온 자취 · 확대 판 테두리(trajectory) · 알갱이(particleSystem) · 두 힘(vector) ·
// 이름표(readout)가 모두 표준 어휘로 있다.
//
// 한 월드에 판 둘을 둔다. 왼쪽은 위에서 본 궤도(행성 반지름 = 1), 오른쪽 위는 덩어리를
// `INSET.zoom` 배로 키워 덩어리와 함께 도는 틀로 본 것이다 — 같은 알갱이 자리를 좌표만
// 바꿔 그린다. 판 단위 좌표계가 없어 인스턴스마다 옮긴다 (G10).
//
// 색은 뜻마다 하나다 — **강조색은 「로슈 한계」 한 뜻에만**(점선 원과 그 이름). 두 힘은
// 같은 먹색이고 가르는 것은 이름과 방향이다(색을 가르면 「조석력은 빨강」 이 된다).
// 알갱이는 풀리기 전이나 뒤나 같은 주 대상 색 — 덩어리가 고리가 된 것이지 다른 것이
// 생긴 것이 아니다.
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
  centerAngleAt,
  centerDistanceAt,
  clumpToWorld,
  grainOffsets,
  grainPositions,
  readConstants,
  rocheDistance,
  tidalRatio,
} from './physics';
import { INSET, SCENE_BOUNDS, text } from './schema';
import type { RocheLimitState } from './state';

/** 한계 원 · 행성 테의 표본 수. */
const CIRCLE_SAMPLES = 160;
/** 한계 원 굵기(화면 px). */
const LIMIT_WIDTH_PX = 1.75;
/** 한계 원 이름이 서는 각(도)과 원에서 띄우는 거리(월드). */
const LIMIT_LABEL_DEG = -38;
const LIMIT_LABEL_GAP = 0.22;
/** 한계 원 이름 글자 크기(화면 px). */
const LIMIT_LABEL_PX = 13;
/** 알갱이 점 반지름(화면 px). */
const GRAIN_PX = 2.2;
/** 확대 판 알갱이 점 반지름(화면 px). */
const INSET_GRAIN_PX = 3;
/**
 * 확대 판에서 제 중력 화살표의 길이(판 월드 단위). 조석력 화살표는 이것의 (d_R / d)³ 배다 —
 * 한계에서 같아진다. 힘의 축척이라 물리량이 아니라 표현이다. 덩어리 반지름(판에서 약 1.34)보다
 * 조금 길어 중심 너머까지 닿는다.
 */
const FORCE_ARROW = 1.7;
/** 화살표 굵기(화면 px). */
const ARROW_WIDTH_PX = 2.5;
/** 확대 판 테두리 굵기(화면 px)와 이름의 자리(판 왼쪽 아래에서 안으로, 월드) · 크기(화면 px). */
const INSET_FRAME_PX = 1;
const INSET_NAME_INSET: Vec2 = [0.14, 0.24];
const INSET_NAME_PX = 12;
/** 지나온 자취가 덮는 시간(조각 시계 초)과 표본 수, 굵기(화면 px). */
const TRAIL_SECONDS = 1.6;
const TRAIL_SAMPLES = 48;
const TRAIL_WIDTH_PX = 1.5;

function circle(r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < CIRCLE_SAMPLES; i++) {
    const a = (2 * Math.PI * i) / CIRCLE_SAMPLES;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}

export function scene(params: {
  state: RocheLimitState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('roche-limit: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const dR = rocheDistance(c);
  const u = tl.u;
  const out: Primitive[] = [];

  // 풀리는 동안 덩어리에 딸린 것(화살표 · 자취)이 흐려지고, 마지막에 알갱이가 흐려진다.
  const released = tl.at('breakup');
  const attached = 1 - released;
  const grainsOpacity = 1 - tl.at('fade');

  // ---- 로슈 한계 — 점선 원과 이름 ----
  out.push({
    type: 'trajectory',
    id: 'roche-limit',
    points: circle(dR),
    closed: true,
    width: LIMIT_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
  });
  const labelAngle = (LIMIT_LABEL_DEG * Math.PI) / 180;
  out.push({
    type: 'readout',
    id: 'roche-limit-name',
    anchor: {
      world: [(dR + LIMIT_LABEL_GAP) * Math.cos(labelAngle), (dR + LIMIT_LABEL_GAP) * Math.sin(labelAngle)],
    },
    text: text('label.limit'),
    chip: false,
    font: 'text',
    fontSize: LIMIT_LABEL_PX,
    align: 'left',
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 행성 ----
  out.push({
    type: 'body',
    id: 'planet',
    pos: [0, 0],
    shape: 'circle',
    size: c.planetRadius,
    glow: false,
    outline: 'none',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 덩어리 중심이 지나온 자취 — 돌면서 다가온다는 것 ----
  const uTrail0 = Math.max(0, u - TRAIL_SECONDS);
  const trailTimes: number[] = [];
  for (let i = 0; i <= TRAIL_SAMPLES; i++) trailTimes.push(uTrail0 + ((u - uTrail0) * i) / TRAIL_SAMPLES);
  const track = centerAngleAt(tl, c, u, trailTimes);
  if (attached > 0 && u - uTrail0 > 0) {
    out.push({
      type: 'trajectory',
      id: 'clump-path',
      points: trailTimes.map((tt, i) => clumpToWorld(centerDistanceAt(tl, c, tt), track.at[i]!, [0, 0])),
      width: TRAIL_WIDTH_PX,
      opacity: attached,
      style: { colorRole: 'secondary', emphasis: 'medium', fade: 'tail' },
    });
  }

  // ---- 알갱이 ----
  const offsets = grainOffsets(c);
  const grains = grainPositions(tl, c, offsets, u, track.angle);
  out.push({
    type: 'particleSystem',
    id: 'grains',
    positions: grains,
    sizes: GRAIN_PX,
    opacity: grainsOpacity,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ================= 확대 판 — 덩어리와 함께 도는 틀 =================
  // 풀린 뒤에도 같은 틀(무리 중심의 거리 · 각)로 본다 — 알갱이가 판 밖으로 흩어져 나가고
  // 판 전체가 흐려진다. 고리가 되는 모습은 왼쪽 궤도 판의 몫이다.
  if (attached > 0) {
    const d = centerDistanceAt(tl, c, u);
    const cosT = Math.cos(track.angle);
    const sinT = Math.sin(track.angle);
    const [ccx, ccy] = clumpToWorld(d, track.angle, [0, 0]);
    /** 궤도 판 월드 → 확대 판. 행성에서 먼 쪽이 오른쪽, 도는 쪽이 위다. */
    const toInset = (p: Vec2): Vec2 => {
      const dx = p[0] - ccx;
      const dy = p[1] - ccy;
      const radial = dx * cosT + dy * sinT;
      const along = -dx * sinT + dy * cosT;
      return [INSET.cx + radial * INSET.zoom, INSET.cy + along * INSET.zoom];
    };
    const clip = { min: [INSET.x0, INSET.y0] as Vec2, max: [INSET.x1, INSET.y1] as Vec2 };

    out.push({
      type: 'trajectory',
      id: 'inset-frame',
      points: [
        [INSET.x0, INSET.y0],
        [INSET.x1, INSET.y0],
        [INSET.x1, INSET.y1],
        [INSET.x0, INSET.y1],
      ],
      closed: true,
      width: INSET_FRAME_PX,
      opacity: attached,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    });
    out.push({
      type: 'readout',
      id: 'inset-name',
      anchor: { world: [INSET.x0 + INSET_NAME_INSET[0], INSET.y0 + INSET_NAME_INSET[1]] },
      text: text('label.inset'),
      chip: false,
      font: 'text',
      fontSize: INSET_NAME_PX,
      align: 'left',
      opacity: attached,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    const near = grains.map(toInset);
    out.push({
      type: 'particleSystem',
      id: 'inset-grains',
      positions: near,
      sizes: INSET_GRAIN_PX,
      opacity: attached,
      clip,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });

    // ---- 두 힘 — 가까운 쪽 겉 알갱이(0 번)에 걸린다 ----
    // 제 중력은 덩어리 중심 쪽(오른쪽), 조석력은 행성 쪽(왼쪽). 한 알갱이에서 마주 보고 뻗으므로
    // 길이를 곧바로 견줄 수 있다. 제 중력의 길이는 거리와 상관없이 그대로다. 마주 보는 두 화살표의
    // 이름을 같은 쪽(cw)에 두면 선의 위아래로 갈린다 — 짧을 때 두 이름이 한데 겹치지 않는다.
    const tail = near[0]!;
    const tidal = FORCE_ARROW * tidalRatio(c, d);
    out.push({
      type: 'vector',
      id: 'self-gravity',
      from: tail,
      delta: [FORCE_ARROW, 0],
      label: text('label.selfGravity'),
      labelSide: 'cw',
      labelChip: true,
      width: ARROW_WIDTH_PX,
      outline: 'background',
      opacity: attached,
      clip,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'vector',
      id: 'tidal-pull',
      from: tail,
      delta: [-tidal, 0],
      label: text('label.tidal'),
      labelSide: 'cw',
      labelChip: true,
      width: ARROW_WIDTH_PX,
      outline: 'background',
      opacity: attached,
      clip,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
