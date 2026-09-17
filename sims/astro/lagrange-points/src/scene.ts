// ========================================================================
// lagrange-points — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 유효 퍼텐셜 명암 → `scalarField` 순차형 하나 (밝을수록 높다)
// - 등고선 → `lineSet` 하나 (선분은 physics 가 마칭 스퀘어로 뽑는다 — 장부 G66)
// - 지구 · 달 → `body` 원 + 이름 `readout`
// - 평형점 십자 → `lineSet` 하나 + 이름 `readout` 다섯
// - 시험 물체 자취 → `lineSet` 하나 (구간별 흐려짐은 `opacities`), 머리 → `particleSystem` 하나
// ========================================================================

import type { Bounds, Primitive, Readout, SceneGraph, Vec2 } from '@aperi21/schema';
import { EARTH, LPOINTS, MOON, terrain } from './physics';
import { CAPTION_BAND, MARKS, PLOT, PX_PER_UNIT, TERRAIN, TEST, text } from './schema';
import type { LagrangePointsState } from './state';

/** 화면 px → 월드 (NOTES G25). */
const px = (n: number): number => n / PX_PER_UNIT;

/**
 * 평형점 이름의 자리(화면 px, 글자 가운데 기준). 원본은 기준선 기준으로 L3 은 옆(자취가
 * 위아래로 흐르므로), L5 는 아래, 나머지는 위에 두었다.
 */
const POINT_LABEL_OFFSET: readonly Vec2[] = [
  [0, -32],
  [0, -32],
  [-30, 0],
  [0, -32],
  [0, 32],
];

/** 프레이밍 가로 반폭(월드). 지형은 이보다 넓게 깔아 좌우 끝까지 덮는다. */
const FRAME_HALF_W = 2.25;

function nameLabel(id: string, world: Vec2, offset: Vec2, label: Readout['text'], vars?: Readout['vars']): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world, offset },
    text: label,
    ...(vars ? { vars } : {}),
    chip: false,
    font: 'text',
    fontSize: MARKS.labelFont,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

export function scene(params: { state: LagrangePointsState }): SceneGraph {
  const { state } = params;
  const out: Primitive[] = [];
  const land = terrain();

  // ---- 유효 퍼텐셜 지형 ----
  out.push({
    type: 'scalarField',
    id: 'terrain',
    min: land.min,
    max: land.max,
    cols: land.cols,
    rows: land.rows,
    values: land.values,
    range: [0, 1],
    opacity: TERRAIN.shadeOpacity,
    colors: { high: 'muted' },
  });
  out.push({
    type: 'lineSet',
    id: 'contours',
    lines: land.contours,
    width: TERRAIN.contourWidth,
    opacity: TERRAIN.contourOpacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 지구 · 달 ----
  out.push({
    type: 'body',
    id: 'earth',
    pos: EARTH,
    shape: 'circle',
    size: px(MARKS.earthR),
    outline: 'none',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push(nameLabel('earth-label', EARTH, [0, 22], text('label.earth')));
  out.push({
    type: 'body',
    id: 'moon',
    pos: MOON,
    shape: 'circle',
    size: px(MARKS.moonR),
    outline: 'none',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push(nameLabel('moon-label', MOON, [0, 18], text('label.moon')));

  // ---- 평형점 ----
  const c = px(MARKS.crossHalf);
  out.push({
    type: 'lineSet',
    id: 'points',
    lines: LPOINTS.flatMap(([x, y]) => [
      [
        [x - c, y],
        [x + c, y],
      ],
      [
        [x, y - c],
        [x, y + c],
      ],
    ]),
    width: MARKS.crossWidth,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  LPOINTS.forEach((p, i) => {
    out.push(nameLabel(`point-label-${i + 1}`, p, POINT_LABEL_OFFSET[i]!, text('label.point'), { n: i + 1 }));
  });

  // ---- 시험 물체 ----
  // 자취는 표본 8개씩 끊어 구간마다 나이로 흐리게 한다(원본 그대로). 떠난 물체는 통째로 흐려진다.
  const lines: Vec2[][] = [];
  const opacities: number[] = [];
  const heads: Vec2[] = [];
  const now = state.clock;
  for (const b of state.bodies) {
    const fade = b.endAt === null ? 1 : Math.max(0, 1 - (now - b.endAt) / TEST.fade);
    const tr = b.trail;
    for (let k = 0; k + 1 < tr.length; k += MARKS.trailChunk) {
      const end = Math.min(tr.length - 1, k + MARKS.trailChunk);
      const age = now - tr[end]![2];
      const alpha = fade * MARKS.trailAlpha * Math.max(0, 1 - age / TEST.trailKeep);
      const seg: Vec2[] = [];
      for (let m = k; m <= end; m++) seg.push([tr[m]![0], tr[m]![1]]);
      lines.push(seg);
      opacities.push(alpha);
    }
    if (b.endAt === null) heads.push([b.s[0], b.s[1]]);
  }
  out.push({
    type: 'lineSet',
    id: 'trails',
    lines,
    opacities,
    width: MARKS.trailWidth,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'particleSystem',
    id: 'heads',
    positions: heads,
    sizes: MARKS.headR,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계 — 원본 캔버스 세로 그대로에 아래 캡션 띠를 더한다. 매 프레임 같은 값 (S-piece). */
export function boundsHint(): Bounds {
  return { minX: -FRAME_HALF_W, maxX: FRAME_HALF_W, minY: -PLOT.halfH - CAPTION_BAND, maxY: PLOT.halfH };
}
