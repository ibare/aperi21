// ========================================================================
// energy-flow-diagram — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
//   줄기 · 열 갈래 · 빛 갈래 · 마디   region (채움 다각형, 곡선은 점으로 표본)
//   흩어지는 꼬리                     region 여러 장 — 아래로 갈수록 옅게 (그라데이션 근사)
//   에너지 알갱이                     particleSystem — 색 · 투명도 묶음마다 한 인스턴스
//   단계 이름 · 갈래 값               readout
//
// 색 세 가지, 각각 한 뜻 — 줄기(muted) = 아직 쓰이지 않은 에너지, 열(negative 옅게) =
// 열로 샌 것, 강조(accent) = 빛이 된 것. 강조색은 빛 갈래와 그 알갱이에만 쓴다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  ParticleSystem,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  at,
  bez,
  branchesOf,
  dotPlace,
  flowsAt,
  readFlows,
  tailSpread,
  type Branch,
  type DotKind,
} from './physics';
import { LAYOUT, text } from './schema';
import type { EnergyFlowDiagramState } from './state';

/** 갈래 곡선 한 변을 자르는 마디 수 (원본 24). */
const CURVE_STEPS = 24;
/** 꼬리 그라데이션을 나누는 장 수. */
const TAIL_SLICES = 14;
/** 알갱이 투명도 묶음 수. 인스턴스 하나가 알파 하나라 이만큼으로 나눈다. */
const ALPHA_LEVELS = 5;
/** 알갱이 반지름(화면 px). 원본은 2 px 네모. */
const DOT_RADIUS_PX = 1;

/**
 * 색의 옅기(`luminance`, 빛의 양). 원본의 색을 테마 역할에서 섞어 얻는다.
 * - 열 갈래(원본의 옅은 흙색) ≈ negative 를 0.42 만큼
 * - 열 알갱이(원본의 짙은 흙색) ≈ negative 0.9
 * - 줄기 · 빛 위 알갱이(거의 흰 점) ≈ 역할색 0.1
 */
const HEAT_LUMINANCE = 0.42;
const HEAT_DOT_LUMINANCE = 0.9;
const PALE_DOT_LUMINANCE = 0.1;

/** 글자 크기(화면 px) — 원본 단계 이름 13 · 갈래 값 14. */
const STAGE_FONT_PX = 13;
const VALUE_FONT_PX = 14;

function heatStyle(): Pick<Region, 'style' | 'luminance'> {
  return { style: { colorRole: 'negative', emphasis: 'strong' }, luminance: HEAT_LUMINANCE };
}

/** 열 갈래 띠 — 바깥 변을 내려가고 안쪽 변을 거슬러 올라온다. */
function branchRibbon(id: string, b: Branch): Region {
  const pts: Vec2[] = [];
  for (let i = 0; i <= CURVE_STEPS; i++) {
    const p = bez(b.outer, i / CURVE_STEPS);
    pts.push(at(p[0], p[1]));
  }
  for (let i = CURVE_STEPS; i >= 0; i--) {
    const p = bez(b.inner, i / CURVE_STEPS);
    pts.push(at(p[0], p[1]));
  }
  return { type: 'region', id, points: pts, fillOpacity: 1, ...heatStyle() };
}

/**
 * 흩어지는 꼬리 — 아래로 퍼지며 옅어지는 사다리꼴. 원본은 세로 그라데이션 한 장이다.
 * `region` 에 그라데이션이 없어 여러 장으로 근사한다.
 *
 * 장을 이어 붙이면 이음매마다 밝은 줄이 생긴다(경계 안티앨리어싱의 틈). 그래서 모든 장이
 * 꼬리 **윗변에서 출발**해 아래로 점점 짧아지게 겹치고, 장마다 알파를 겹친 결과가
 * 띠 k 에서 `1 − (k + ½)/N` 이 되도록 푼다 — (1 − aₖ) = (1 − Oₖ) / (1 − Oₖ₊₁).
 */
function branchTail(id: string, b: Branch): Region[] {
  const { bend: R, yEnd, fade } = LAYOUT;
  const xl = b.xs + R;
  const xr = b.xs + R + b.w;
  const spread = tailSpread(b);
  const top = yEnd - 0.5;
  const coverage = (k: number): number => (k >= TAIL_SLICES ? 0 : 1 - (k + 0.5) / TAIL_SLICES);
  const out: Region[] = [];
  for (let i = TAIL_SLICES - 1; i >= 0; i--) {
    const c = (i + 1) / TAIL_SLICES;
    const yc = top + (yEnd + fade - top) * c;
    const alpha = 1 - (1 - coverage(i)) / (1 - coverage(i + 1));
    out.push({
      type: 'region',
      id: `${id}-${i}`,
      points: [at(xl, top), at(xr, top), at(xr + spread * c, yc), at(xl - spread * c, yc)],
      fillOpacity: alpha,
      ...heatStyle(),
    });
  }
  return out;
}

/** 원본 화면 좌표 사각형. */
function rect(id: string, x: number, y: number, w: number, h: number, style: Region['style']): Region {
  return {
    type: 'region',
    id,
    points: [at(x, y), at(x + w, y), at(x + w, y + h), at(x, y + h)],
    fillOpacity: 1,
    style,
  };
}

function label(
  id: string,
  x: number,
  y: number,
  body: Readout['text'],
  opts: Partial<Readout>,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: at(x, y) },
    text: body,
    chip: false,
    font: 'text',
    ...opts,
  };
}

/** 알갱이 묶음의 색. 자기가 있는 갈래의 색을 따른다. */
function dotLook(kind: DotKind): Pick<ParticleSystem, 'style' | 'luminance'> {
  switch (kind) {
    case 'stream':
      return { style: { colorRole: 'muted', emphasis: 'strong' }, luminance: PALE_DOT_LUMINANCE };
    case 'lightLane':
      return { style: { colorRole: 'accent', emphasis: 'strong' }, luminance: PALE_DOT_LUMINANCE };
    case 'light':
      return { style: { colorRole: 'accent', emphasis: 'strong' } };
    case 'heat':
      return { style: { colorRole: 'negative', emphasis: 'strong' }, luminance: HEAT_DOT_LUMINANCE };
  }
}

const DOT_KINDS: readonly DotKind[] = ['stream', 'lightLane', 'light', 'heat'];

export function scene(params: {
  state: EnergyFlowDiagramState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  if (!timeline) throw new Error('energy-flow-diagram: schema.timeline 이 선언되어야 한다');
  const t = timeline.t;
  const f = readFlows(stage);
  const r = flowsAt(state.mix, f);
  const brs = branchesOf(f, r);
  const { x0, nodes, xEnd, y0, unit, yEnd, bend: R, nodeWidth } = LAYOUT;
  const [plantX, lineX, bulbX] = nodes as [number, number, number];
  const out: Primitive[] = [];

  // ---- 열 갈래 ----
  brs.forEach((b, i) => {
    out.push(branchRibbon(`heat-${i}`, b));
    out.push(...branchTail(`heat-tail-${i}`, b));
  });

  // ---- 에너지 줄기 — 윗변 고정, 아랫변이 마디마다 계단처럼 깎인다 ----
  out.push({
    type: 'region',
    id: 'stream',
    points: [
      at(x0, y0),
      at(bulbX, y0),
      at(bulbX, y0 + f.atHome * unit),
      at(lineX, y0 + f.atHome * unit),
      at(lineX, y0 + (f.atHome + f.lineHeat) * unit),
      at(plantX, y0 + (f.atHome + f.lineHeat) * unit),
      at(plantX, y0 + 100 * unit),
      at(x0, y0 + 100 * unit),
    ],
    fillOpacity: 1,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 빛 갈래 ----
  out.push(
    rect('light', bulbX, y0, xEnd - bulbX, r.lightRaw * unit, { colorRole: 'accent', emphasis: 'strong' }),
  );

  // ---- 단계 마디 — 높이 = 그 마디로 들어오는 흐름 ----
  const ink: Region['style'] = { colorRole: 'ink', emphasis: 'strong' };
  out.push(rect('node-source', x0 - nodeWidth, y0, nodeWidth, 100 * unit, ink));
  out.push(rect('node-plant', plantX - nodeWidth / 2, y0, nodeWidth, 100 * unit, ink));
  out.push(rect('node-line', lineX - nodeWidth / 2, y0, nodeWidth, (f.atHome + f.lineHeat) * unit, ink));
  out.push(rect('node-bulb', bulbX - nodeWidth / 2, y0, nodeWidth, f.atHome * unit, ink));

  // ---- 에너지 알갱이 — 종류 × 투명도 묶음 ----
  const buckets = new Map<string, Vec2[]>();
  for (const d of state.dots) {
    const p = dotPlace(d, t, r, brs);
    if (!p || p.alpha <= 0) continue;
    const level = Math.max(1, Math.ceil(p.alpha * ALPHA_LEVELS));
    const k = `${p.kind}:${level}`;
    const list = buckets.get(k);
    if (list) list.push(p.pos);
    else buckets.set(k, [p.pos]);
  }
  for (const kind of DOT_KINDS) {
    for (let level = 1; level <= ALPHA_LEVELS; level++) {
      const positions = buckets.get(`${kind}:${level}`);
      if (!positions) continue;
      out.push({
        type: 'particleSystem',
        id: `dots-${kind}-${level}`,
        positions,
        sizes: DOT_RADIUS_PX,
        opacity: (level - 0.5) / ALPHA_LEVELS,
        ...dotLook(kind),
      });
    }
  }

  // ---- 단계 이름 ----
  const stageStyle: Readout['style'] = { colorRole: 'muted', emphasis: 'strong' };
  const stageY = y0 - 16;
  out.push(label('stage-plant', plantX, stageY, text('stage.plant'), { fontSize: STAGE_FONT_PX, style: stageStyle }));
  out.push(label('stage-line', lineX, stageY, text('stage.line'), { fontSize: STAGE_FONT_PX, style: stageStyle }));
  out.push(label('stage-bulb', bulbX, stageY, text('stage.bulb'), { fontSize: STAGE_FONT_PX, style: stageStyle }));

  // ---- 갈래 값 ----
  const valueStyle: Readout['style'] = { colorRole: 'ink', emphasis: 'strong' };
  out.push(
    label('value-source', x0 - 10, y0 + 50 * unit, text('value.source'), {
      vars: { amount: 100 },
      align: 'right',
      fontSize: VALUE_FONT_PX,
      style: valueStyle,
    }),
  );
  out.push(
    label('value-light', xEnd + 24, y0 + (r.lightRaw * unit) / 2, text('value.light'), {
      vars: { n: r.light },
      align: 'left',
      fontSize: VALUE_FONT_PX,
      style: valueStyle,
    }),
  );
  brs.forEach((b, i) => {
    out.push(
      label(`value-heat-${i}`, b.xs + R + b.w + 10, yEnd - 14, text('value.heat'), {
        vars: { n: b.value },
        align: 'left',
        fontSize: VALUE_FONT_PX,
        style: valueStyle,
      }),
    );
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계 — 원본 캔버스 한 장. 매 프레임 같은 값이라 카메라가 흔들리지 않는다. */
export function boundsHint(): Bounds {
  return { minX: 0, maxX: LAYOUT.width, minY: -LAYOUT.height, maxY: 0 };
}
