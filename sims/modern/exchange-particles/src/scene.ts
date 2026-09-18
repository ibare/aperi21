// ========================================================================
// exchange-particles — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 세로 시간 · 가로 공간의 파인만 도형 하나. 가로로 누운 「지금」 선(시간 조각)이 아래에서 위로
// 오르며 도형을 그려 낸다 — 조각 아래만 그려져 있고, 두 전자는 조각 위의 점으로 움직인다.
// 왼쪽 전자는 꼭짓점 A 에서 광자를 내놓으며 꺾이고, 광자 물결이 45° 로 건너가 꼭짓점 B 에서
// 오른쪽 전자를 꺾는다. 다 그려지면 조각이 걷히고, 같은 자리의 광자 물결이 글루온 고리로,
// 전자 표식이 쿼크 표식으로 바뀐다.
//
// 색 — 선 모양이 입자를 가르고 색은 가르지 않는다 (S-piece). 전자(쿼크) 선과 점은 `ink`, 매개 입자는
// 광자든 글루온이든 `primary` 한 색 — 「힘을 나르는 것」 한 대상이다. 강조색(`accent`)은 「주고받는
// 자리」(꼭짓점) 한 뜻에만 쓴다. 축과 시간 조각은 배경 정보라 `muted`.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  LineSet,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import {
  carrierMid,
  gluonLine,
  leftX,
  photonLine,
  readConstants,
  rightX,
  snapshot,
  worldline,
} from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { ExchangeParticlesState } from './state';

/** 전자(쿼크) 세계선 굵기(화면 px). */
const FERMION_WIDTH_PX = 2.4;
/** 매개 입자 선 굵기(화면 px). */
const CARRIER_WIDTH_PX = 2;
/** 광자 물결 폭(도형 단위)과 물결 한 번에 찍는 표본 수. */
const PHOTON_AMPLITUDE = 0.17;
const PHOTON_SAMPLES_PER_WAVE = 16;
/** 글루온 고리의 폭 / 걸음 비(1 보다 커야 고리가 진다)와 고리 하나에 찍는 표본 수. */
const GLUON_LOOP_RATIO = 2.2;
const GLUON_SAMPLES_PER_LOOP = 28;

/** 조각 위에서 움직이는 전자 점 반지름(도형 단위). */
const PARTICLE_RADIUS = 0.17;
/** 꼭짓점 점 반지름(도형 단위). */
const VERTEX_RADIUS = 0.13;

/** 시간 축의 가로 자리와 공간 축의 세로 자리(도형 단위), 축 굵기(화면 px). */
const TIME_AXIS_X = -7;
const SPACE_AXIS_Y = -0.5;
const AXIS_OVERHANG = 0.5;
const SPACE_AXIS_LENGTH = 13.4;
const AXIS_WIDTH_PX = 1.4;
const AXIS_HEAD = 0.28;

/** 시간 조각 선이 덮는 가로 범위(도형 단위)와 굵기(화면 px). */
const SLICE_FROM_X = -6.6;
const SLICE_TO_X = 5.8;
const SLICE_WIDTH_PX = 1.2;

/** 이름표 · 표식 글자 크기(화면 px). */
const LABEL_PX = 12;
const MARK_PX = 15;
/**
 * 전자 표식을 점 바깥쪽으로 띄우는 거리와 위로 올리는 거리(화면 px) — 왼쪽 전자는 왼쪽, 오른쪽 전자는
 * 오른쪽. 위로 올려 「지금」 점선이 글자를 지나지 않게 한다.
 */
const MARK_GAP_PX = 10;
const MARK_RISE_PX = 12;
/** 매개 입자 표식을 선 한가운데에서 왼쪽 위 법선으로 띄우는 거리(화면 px). */
const CARRIER_MARK_GAP_PX = 20;
/** 축 이름을 축 끝에서 띄우는 자리(화면 px). */
const TIME_LABEL_OFFSET: Vec2 = [0, -12];
const SPACE_LABEL_OFFSET: Vec2 = [8, 0];
const NOW_LABEL_OFFSET: Vec2 = [6, 0];

function label(
  id: string,
  t: Readout['text'],
  anchor: Readout['anchor'],
  align: Readout['align'],
  opts: { opacity?: number; mark?: boolean; italic?: boolean } = {},
): Readout {
  return {
    type: 'readout',
    id,
    anchor,
    text: t,
    chip: false,
    font: 'text',
    fontSize: opts.mark ? MARK_PX : LABEL_PX,
    italic: opts.italic,
    align,
    opacity: opts.opacity ?? 1,
    style: { colorRole: opts.mark ? 'ink' : 'muted', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: ExchangeParticlesState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('exchange-particles: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const snap = snapshot(tl, c);
  const out: Primitive[] = [];
  const s = snap.slice;

  // ── 축 — 세로 시간, 가로 공간 ──
  out.push(
    {
      type: 'vector',
      id: 'time-axis',
      from: [TIME_AXIS_X, SPACE_AXIS_Y],
      delta: [0, c.top - SPACE_AXIS_Y + AXIS_OVERHANG],
      width: AXIS_WIDTH_PX,
      headSize: AXIS_HEAD,
      style: { colorRole: 'muted', emphasis: 'medium' },
    } satisfies Vector,
    {
      type: 'vector',
      id: 'space-axis',
      from: [TIME_AXIS_X, SPACE_AXIS_Y],
      delta: [SPACE_AXIS_LENGTH, 0],
      width: AXIS_WIDTH_PX,
      headSize: AXIS_HEAD,
      style: { colorRole: 'muted', emphasis: 'medium' },
    } satisfies Vector,
    label(
      'time-label',
      text('label.time'),
      { world: [TIME_AXIS_X, c.top + AXIS_OVERHANG], offset: TIME_LABEL_OFFSET },
      'center',
    ),
    label(
      'space-label',
      text('label.space'),
      { world: [TIME_AXIS_X + SPACE_AXIS_LENGTH, SPACE_AXIS_Y], offset: SPACE_LABEL_OFFSET },
      'left',
    ),
  );

  // ── 시간 조각 — 「지금」. 아래만 그려져 있다 ──
  if (snap.sliceAlpha > 0) {
    out.push(
      {
        type: 'trajectory',
        id: 'slice',
        points: [
          [SLICE_FROM_X, s],
          [SLICE_TO_X, s],
        ],
        width: SLICE_WIDTH_PX,
        opacity: snap.sliceAlpha * snap.alpha,
        style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
      } satisfies Trajectory,
      label('now-label', text('label.now'), { world: [SLICE_TO_X, s], offset: NOW_LABEL_OFFSET }, 'left', {
        opacity: snap.sliceAlpha * snap.alpha,
      }),
    );
  }

  // ── 매개 입자 — 광자 물결이 글루온 고리로 바뀐다. 같은 색, 선 모양만 다르다 ──
  if (snap.carrier > 0) {
    const photon = photonLine(c, snap.carrier, PHOTON_AMPLITUDE, PHOTON_SAMPLES_PER_WAVE);
    out.push({
      type: 'lineSet',
      id: 'photon',
      lines: [photon],
      width: CARRIER_WIDTH_PX,
      opacity: (1 - snap.morph) * snap.alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    } satisfies LineSet);
  }
  if (snap.morph > 0) {
    out.push({
      type: 'lineSet',
      id: 'gluon',
      lines: [gluonLine(c, 1, GLUON_LOOP_RATIO, GLUON_SAMPLES_PER_LOOP)],
      width: CARRIER_WIDTH_PX,
      opacity: snap.morph * snap.alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    } satisfies LineSet);
  }
  // 표식은 광자가 다 건너간 뒤에 붙는다 — 건너가는 중에는 물결 머리가 제 모양을 말한다.
  if (snap.carrier >= 1) {
    const mid = carrierMid(c);
    // 선의 왼쪽 위 법선 쪽. 화면 y 는 아래라 세로 부호를 뒤집는다.
    const offset: Vec2 = [mid.normal[0] * CARRIER_MARK_GAP_PX, -mid.normal[1] * CARRIER_MARK_GAP_PX];
    out.push(
      label('photon-mark', text('mark.photon'), { world: mid.at, offset }, 'center', {
        mark: true,
        italic: true,
        opacity: (1 - snap.morph) * snap.alpha,
      }),
      label('gluon-mark', text('mark.gluon'), { world: mid.at, offset }, 'center', {
        mark: true,
        italic: true,
        opacity: snap.morph * snap.alpha,
      }),
    );
  }

  // ── 전자(쿼크) 세계선 — 조각까지만 ──
  out.push({
    type: 'lineSet',
    id: 'fermions',
    lines: [worldline('left', s, c), worldline('right', s, c)],
    width: FERMION_WIDTH_PX,
    opacity: snap.alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies LineSet);

  // ── 꼭짓점 — 주고받는 자리. 조각이 지나간 뒤에 선다 ──
  const vertices: { id: string; at: Vec2 }[] = [
    { id: 'vertex-emit', at: c.emit },
    { id: 'vertex-absorb', at: c.absorb },
  ];
  for (const v of vertices) {
    if (s < v.at[1]) continue;
    out.push({
      type: 'body',
      id: v.id,
      pos: v.at,
      shape: 'circle',
      size: VERTEX_RADIUS,
      glow: false,
      outline: 'none',
      opacity: snap.alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    } satisfies Body);
  }

  // ── 전자 — 조각 위의 점. 표식은 바깥쪽에, 끝에는 쿼크 표식으로 바뀐다 ──
  const particles = [
    { id: 'left', pos: [leftX(s, c), s] as Vec2, side: -1 },
    { id: 'right', pos: [rightX(s, c), s] as Vec2, side: 1 },
  ] as const;
  for (const { id, pos, side } of particles) {
    out.push({
      type: 'body',
      id: `${id}-particle`,
      pos,
      shape: 'circle',
      size: PARTICLE_RADIUS,
      glow: false,
      outline: 'none',
      opacity: snap.alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies Body);
    const anchor = { world: pos, offset: [side * MARK_GAP_PX, -MARK_RISE_PX] as Vec2 };
    const align = side > 0 ? 'left' : 'right';
    out.push(
      label(`${id}-electron-mark`, text('mark.electron'), anchor, align, {
        mark: true,
        opacity: (1 - snap.morph) * snap.alpha,
      }),
      label(`${id}-quark-mark`, text('mark.quark'), anchor, align, {
        mark: true,
        italic: true,
        opacity: snap.morph * snap.alpha,
      }),
    );
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
