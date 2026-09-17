// ========================================================================
// longitudinal-wave — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 공기 입자 약 2800 개는 `particleSystem` 하나, 흔들림 폭 선분과
// 띠 테두리는 `lineSet`, 강조 입자는 `body` 셋, 빽빽함 띠는 **지금 자리의 점을 센 밀도**를
// 한 줄짜리 `scalarField` 로, 띠 이름은 `readout` 으로 선언한다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  LineSet,
  ParticleSystem,
  Primitive,
  Readout,
  ScalarField,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { AMPLITUDE, buildMedium, densityProfile, readSeed, xAt } from './physics';
import {
  DENSITY_RANGE,
  FIELD_W,
  PARTICLE_OPACITY,
  PARTICLE_RADIUS,
  RANGE_TICK,
  SCENE_BOUNDS,
  STRIP_BORDER_OPACITY,
  STRIP_H,
  STRIP_LABEL_FONT,
  STRIP_LABEL_Y,
  STRIP_TOP,
  TAGGED_RADIUS,
  text,
} from './schema';
import type { LongitudinalWaveState } from './state';

export function scene(params: {
  state: LongitudinalWaveState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline, stage } = params;
  if (!timeline) throw new Error('longitudinal-wave: schema.timeline 이 선언되어야 한다');
  const t = timeline.u;
  const medium = buildMedium(readSeed(stage));
  const out: Primitive[] = [];

  // ---- 공기 입자 ----
  // 가로로만 움직인다. 줄무늬는 아무도 그리지 않았다 — 점이 몰려서 생긴다.
  const n = medium.x0.length;
  const xs = new Float64Array(n);
  const positions: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const x = xAt(medium.x0[i]!, t);
    xs[i] = x;
    if (x < -2 || x > FIELD_W + 2) continue;
    positions.push([x, medium.y[i]!]);
  }
  const air: ParticleSystem = {
    type: 'particleSystem',
    id: 'air',
    positions,
    sizes: PARTICLE_RADIUS,
    opacity: PARTICLE_OPACITY,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(air);

  // ---- 강조 입자의 흔들림 폭 ----
  // 평형 위치 ± 진폭. 무늬는 몇 파장을 지나가도 주황 점은 이 선분 밖으로 나가지 않는다.
  const rangeLines: Vec2[][] = [];
  for (const p of medium.tagged) {
    const l = p.x0 - AMPLITUDE;
    const r = p.x0 + AMPLITUDE;
    rangeLines.push([[l, p.y], [r, p.y]]);
    rangeLines.push([[l, p.y - RANGE_TICK], [l, p.y + RANGE_TICK]]);
    rangeLines.push([[r, p.y - RANGE_TICK], [r, p.y + RANGE_TICK]]);
  }
  const ranges: LineSet = {
    type: 'lineSet',
    id: 'tagged-range',
    lines: rangeLines,
    width: 1,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(ranges);

  // ---- 강조 입자 ----
  // 강조색은 「계속 같은 입자」 한 뜻에만. 바탕색 테두리로 무리에서 떼어 낸다.
  medium.tagged.forEach((p, j) => {
    const body: Body = {
      type: 'body',
      id: `tagged-${j}`,
      pos: [xAt(p.x0, t), p.y],
      shape: 'circle',
      size: TAGGED_RADIUS,
      outline: 'background',
      glow: false,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(body);
  });

  // ---- 빽빽함 띠 ----
  // 방금 선언한 배경 입자의 자리를 칸마다 센다 — 공식으로 따로 칠하지 않는다.
  // 칸 수 × 칸 폭이 판 폭을 조금 넘는다(290 × 3 = 870). 원본은 캔버스 끝이 잘랐으므로 판 폭에 맞춘다.
  const rel = densityProfile(xs);
  const cols = rel.length;
  const strip: ScalarField = {
    type: 'scalarField',
    id: 'density-strip',
    min: [0, STRIP_TOP - STRIP_H],
    max: [FIELD_W, STRIP_TOP],
    cols,
    rows: 1,
    values: rel,
    range: DENSITY_RANGE,
    colors: { high: 'ink' },
  };
  out.push(strip);

  // ---- 빽빽함 띠 테두리 ----
  const x0 = 0.5;
  const x1 = FIELD_W - 0.5;
  const yTop = STRIP_TOP - 0.5;
  const yBot = STRIP_TOP - STRIP_H + 0.5;
  const border: LineSet = {
    type: 'lineSet',
    id: 'density-border',
    lines: [[[x0, yTop], [x1, yTop], [x1, yBot], [x0, yBot], [x0, yTop]]],
    width: 1,
    opacity: STRIP_BORDER_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(border);

  // ---- 빽빽함 띠 이름 ----
  const label: Readout = {
    type: 'readout',
    id: 'density-label',
    anchor: { world: [2, STRIP_LABEL_Y] },
    text: text('label.strip'),
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: STRIP_LABEL_FONT,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(label);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 상태를 보지 않으므로 매 프레임 같다 — 카메라가 흔들리지 않는다. */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
