// ========================================================================
// triple-point — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
//   그릇            trajectory(닫힌 벽) · region 물 · region(hatch) 얼음 조각 · particleSystem 김
//   상 이름          readout — 그릇에 지금 있는 것만
//   확대 상평형 그림   region 얼음 · 물 영역(김 영역은 비움) · trajectory 경계 셋 · 틀 · 안내 점선
//   눈금             readout — 삼중점 온도 · 압력 글자만
//   지금 점 · 옮김    body · vector · readout(벗어난 폭)
//   캡션            BundleSchema.caption 슬롯
//
// ---- 색은 뜻마다 하나다 ----
//   secondary 물이라는 한 물질 — 얼음 · 물 · 김, 그림의 얼음 · 물 영역도 같은 색이다.
//             결(얼음은 사선)과 모양(물은 면, 김은 알갱이 · 빈 영역)으로 가른다 (S-piece)
//   ink       상 경계선
//   accent    지금 자리 — 점 · 옮긴 화살표 · 벗어난 폭 글자, 한 뜻에만
//   muted     그릇 벽 · 틀 · 안내선 · 눈금 · 이름
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
  hash01,
  meltT,
  readConstants,
  readNow,
  subP,
  vapP,
  type TriplePointConstants,
} from './physics';
import {
  DIAGRAM,
  ICE_ABOVE,
  ICE_SIDE,
  SCENE_BOUNDS,
  VESSEL,
  VESSEL_LABEL_GAP,
  WATER_FULL,
  text,
  type TriplePointMessageKey,
} from './schema';
import type { TriplePointState } from './state';

/** 이름 · 축 이름 글자 크기 · 눈금과 폭 글자 크기(화면 px). */
const LABEL_PX = 12;
const VALUE_PX = 11;
/** 그림 안 영역 이름 글자 크기(화면 px). */
const REGION_LABEL_PX = 13;
/** 선 굵기(화면 px) — 경계선 · 그릇 벽 · 틀 · 안내 점선 · 옮김 화살표. */
const BOUNDARY_PX = 1.8;
const WALL_PX = 2;
const FRAME_PX = 1;
const GUIDE_PX = 1;
const ARROW_PX = 2.2;
/** 안내 점선 · 틀의 짙기 — 경계선보다 물러나 있어야 한다. */
const GUIDE_OPACITY = 0.6;
/** 얼음 · 물의 채움 짙기(그릇과 그림 영역이 같다). */
const ICE_FILL = 0.5;
const WATER_FILL = 0.34;
/** 지금 점 · 삼중점 반지름(월드). */
const NOW_R = 0.1;
const TP_R = 0.05;
/** 김 알갱이 크기(화면 px) · 좌우 흔들림(월드) · 벽 · 수면 · 천장에서 떨어지는 거리(월드). */
const VAPOR_DOT_PX = 3;
const VAPOR_WOBBLE = 0.08;
const VAPOR_INSET = 0.18;
/** 알갱이마다 떠도는 빠르기 차 — 한 번 떠도는 시간에 곱하는 몫의 폭. */
const VAPOR_PACE_SPREAD = 0.6;
/** 얼음 · 물 이름 사이의 가장 작은 세로 간격(월드). */
const LABEL_SEP = 0.3;
/** 글자를 앵커에서 띄우는 거리(화면 px) — 눈금 · 축 이름 · 벗어난 폭. */
const TICK_GAP = 12;
/** 압력 눈금 글자를 축 왼쪽으로 띄우는 거리(화면 px) — 가로 띄움이라 세로 눈금보다 좁게. */
const P_TICK_GAP_PX = 6;
const AXIS_GAP = 12;
const TAG_GAP = 14;
/**
 * 압력 쪽 폭 글자를 화살표 오른쪽으로 미는 거리(화면 px). 월드 앵커 칩은 `align` 을 무시하고
 * 가운데에 놓이므로(장부 G122) 칩 반폭만큼 더 민다 — 덜 밀면 점과 융해선 사이를 덮는다.
 */
const TAG_SIDE_PX = 38;
/**
 * 그림 안 영역 이름의 자리 — 확대창 반폭에 대한 몫(ΔT, Δp). 점이 옮겨 가는 네 자리
 * (가로 ±dT, 세로 ±dP)를 피해 영역 한가운데 쪽에 둔다.
 */
const REGION_LABEL_AT: Record<'ice' | 'water' | 'vapor', Vec2> = {
  ice: [-0.68, 0.62],
  water: [0.6, 0.78],
  vapor: [0.42, -0.66],
};
const PHASE_NAME: Record<'ice' | 'water' | 'vapor', TriplePointMessageKey> = {
  ice: 'label.ice',
  water: 'label.water',
  vapor: 'label.vapor',
};

const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const SUBSTANCE = { colorRole: 'secondary', emphasis: 'strong' } as const;
const LINE = { colorRole: 'ink', emphasis: 'medium' } as const;
const NOW = { colorRole: 'accent', emphasis: 'strong' } as const;

/** 네모 하나의 네 꼭짓점. */
function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

const ALL_EDGES: readonly (readonly [number, number])[] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
];

function label(
  id: string,
  pos: Vec2,
  key: TriplePointMessageKey,
  opt: {
    size: number;
    align: 'left' | 'center' | 'right';
    offset?: Vec2;
    vars?: Record<string, string>;
    style?: typeof MUTED | typeof NOW | typeof LINE;
    /** 배경 칩 — 결 · 선 위에 놓이는 글자만. */
    chip?: boolean;
  },
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: opt.offset ? { world: pos, offset: opt.offset } : { world: pos },
    text: text(key),
    ...(opt.vars ? { vars: opt.vars } : {}),
    chip: opt.chip ?? false,
    font: 'text',
    align: opt.align,
    fontSize: opt.size,
    style: opt.style ?? MUTED,
  };
}

/** 확대 그림의 사상 — (ΔT K, Δp Pa) → 월드. */
function diagramMap(c: TriplePointConstants): (dT: number, dp: number) => Vec2 {
  const cx = (DIAGRAM.x0 + DIAGRAM.x1) / 2;
  const cy = (DIAGRAM.y0 + DIAGRAM.y1) / 2;
  const hw = (DIAGRAM.x1 - DIAGRAM.x0) / 2;
  const hh = (DIAGRAM.y1 - DIAGRAM.y0) / 2;
  return (dT, dp) => [cx + (dT / c.winT) * hw, cy + (dp / c.winP) * hh];
}

/** 삼중점에서 방향 (a, b) 로 나간 선이 확대창 가장자리에 닿는 자리(ΔT, Δp). */
function rayToEdge(c: TriplePointConstants, a: number, b: number): Vec2 {
  const s = Math.min(a === 0 ? Infinity : c.winT / Math.abs(a), b === 0 ? Infinity : c.winP / Math.abs(b));
  return [a * s, b * s];
}

export function scene(params: {
  state: TriplePointState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('triple-point: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const now = readNow(tl, c);
  const D = diagramMap(c);
  const out: Primitive[] = [];

  // ================= 확대 상평형 그림 =================

  // 세 경계의 끝(확대창 가장자리). 승화선은 왼쪽 아래, 증발선은 오른쪽 위, 융해선은 거의 곧게 위로.
  const S = rayToEdge(c, -1, subP(c, -1));
  const V = rayToEdge(c, 1, vapP(c, 1));
  const M = rayToEdge(c, meltT(c, 1), 1);
  const W = c.winT;
  const H = c.winP;
  const sOnLeft = Math.abs(S[0] + W) < 1e-9;
  const vOnRight = Math.abs(V[0] - W) < 1e-9;
  const O: Vec2 = [0, 0];

  const icePoly: Vec2[] = [O, S, ...(sOnLeft ? [] : [[-W, -H] as Vec2]), [-W, H], M];
  const waterPoly: Vec2[] = [O, M, ...(vOnRight ? [[W, H] as Vec2] : []), V];

  out.push({
    type: 'region',
    id: 'field-ice',
    points: icePoly.map(([t, p]) => D(t, p)),
    fill: 'hatch',
    fillOpacity: ICE_FILL,
    opaque: true,
    style: SUBSTANCE,
  });
  out.push({
    type: 'region',
    id: 'field-water',
    points: waterPoly.map(([t, p]) => D(t, p)),
    fillOpacity: WATER_FILL,
    opaque: true,
    style: SUBSTANCE,
  });
  // 김 영역은 칠하지 않는다 — 그릇에서 김이 빈 자리를 떠도는 알갱이인 것과 같다.

  // ---- 틀 · 안내 점선 ----
  out.push({
    type: 'trajectory',
    id: 'frame',
    points: rect(DIAGRAM.x0, DIAGRAM.y0, DIAGRAM.x1, DIAGRAM.y1),
    closed: true,
    width: FRAME_PX,
    opacity: GUIDE_OPACITY,
    style: MUTED,
  });
  // 삼중점을 지나는 가로 · 세로 점선. 벗어나는 점은 늘 이 둘 중 하나를 따라 움직인다 —
  // 따라가는 선이 곧 붙든 양이다(가로면 압력, 세로면 온도).
  for (const [id, a, b] of [
    ['guide-p', D(-W, 0), D(W, 0)],
    ['guide-t', D(0, -H), D(0, H)],
  ] as const) {
    out.push({
      type: 'trajectory',
      id,
      points: [a, b],
      width: GUIDE_PX,
      opacity: GUIDE_OPACITY,
      style: { ...MUTED, lineStyle: 'dashed' },
    });
  }

  // ---- 경계선 셋 ----
  for (const [id, end] of [
    ['boundary-sub', S],
    ['boundary-vap', V],
    ['boundary-melt', M],
  ] as const) {
    out.push({ type: 'trajectory', id, points: [D(0, 0), D(end[0], end[1])], width: BOUNDARY_PX, style: LINE });
  }

  // ---- 영역 이름 ----
  for (const ph of ['ice', 'water', 'vapor'] as const) {
    const [fx, fy] = REGION_LABEL_AT[ph];
    out.push(label(`region-${ph}`, D(fx * W, fy * H), PHASE_NAME[ph], { size: REGION_LABEL_PX, align: 'center', style: LINE }));
  }

  // ---- 삼중점 · 눈금 · 축 이름 ----
  out.push({ type: 'body', id: 'tp', pos: D(0, 0), shape: 'circle', size: TP_R, glow: false, outline: 'none', style: LINE });
  out.push(label('tp-name', D(0, H), 'label.triplePoint', { size: LABEL_PX, align: 'center', offset: [0, -AXIS_GAP] }));
  out.push(
    label('tick-t', D(0, -H), 'label.tempTick', { size: VALUE_PX, align: 'center', offset: [0, TICK_GAP], vars: { t: state.tTp } }),
  );
  out.push(
    label('tick-p', D(-W, 0), 'label.pressTick', { size: VALUE_PX, align: 'right', offset: [-P_TICK_GAP_PX, 0], vars: { p: state.pTp } }),
  );
  out.push(label('axis-p', D(-W, H), 'label.pressAxis', { size: LABEL_PX, align: 'left', offset: [0, -AXIS_GAP] }));
  out.push(label('axis-t', D(W, -H), 'label.tempAxis', { size: LABEL_PX, align: 'right', offset: [0, TICK_GAP] }));

  // ---- 옮김 화살표 · 벗어난 폭 · 지금 점 ----
  const here = D(now.at[0], now.at[1]);
  if (now.departed && now.reach > 0) {
    const from = D(0, 0);
    out.push({
      type: 'vector',
      id: 'shift',
      from,
      delta: [here[0] - from[0], here[1] - from[1]],
      width: ARROW_PX,
      style: NOW,
    });
    const tip = D(now.target[0] / 2, now.target[1] / 2);
    const isT = now.ex.axis === 'T';
    out.push(
      label('shift-tag', tip, now.ex.tag, {
        size: VALUE_PX,
        align: 'center',
        offset: isT ? [0, TAG_GAP] : [TAG_SIDE_PX, 0],
        vars: { d: isT ? state.dT : state.dP },
        style: NOW,
        // 얼음 영역의 사선 결 · 증발선 위에 놓이므로 칩으로 떼어 낸다.
        chip: true,
      }),
    );
  }
  out.push({ type: 'body', id: 'now', pos: here, shape: 'circle', size: NOW_R, glow: false, outline: 'background', style: NOW });

  // ================= 그릇 =================

  const { x0, x1, y0, y1 } = VESSEL;
  const w = x1 - x0;
  const level = y0 + now.shares.water * WATER_FULL * (y1 - y0);

  // ---- 물 ----
  if (now.shares.water > 0) {
    out.push({
      type: 'region',
      id: 'water',
      points: rect(x0, y0, x1, level),
      fillOpacity: WATER_FILL,
      opaque: true,
      style: SUBSTANCE,
    });
  }

  // ---- 얼음 ----
  // 남은 얼음 몫만큼 넓이가 줄도록 한 변이 제곱근으로 준다. 물이 있으면 떠서 윗부분만 나온다.
  let iceTop: number = y0;
  let iceMid: number = y0;
  if (now.shares.ice > 0) {
    const side = ICE_SIDE * Math.sqrt(now.shares.ice);
    const cell = w / c.iceCubes;
    const cy = Math.max(y0 + side / 2, level + ICE_ABOVE * side - side / 2);
    iceTop = cy + side / 2;
    iceMid = cy;
    for (let i = 0; i < c.iceCubes; i++) {
      const cx = x0 + (i + 0.5) * cell;
      out.push({
        type: 'region',
        id: `ice-${i}`,
        points: rect(cx - side / 2, cy - side / 2, cx + side / 2, cy + side / 2),
        fill: 'hatch',
        fillOpacity: ICE_FILL,
        opaque: true,
        outline: ALL_EDGES,
        style: SUBSTANCE,
      });
    }
  }

  // ---- 김 ----
  // 김 몫만큼의 알갱이가 수면 위 빈 자리를 떠돈다. 알갱이 i 의 자리는 (시드, i, 시각)의
  // 닫힌 식이라 같은 시각은 같은 화면이다. 번호가 앞선 알갱이부터 남는다 — 김이 줄면 뒤 번호가 사라진다.
  const shown = Math.floor(now.shares.vapor * c.vaporDots + 1e-9);
  const floor = level + VAPOR_INSET;
  const ceil = y1 - VAPOR_INSET;
  if (shown > 0) {
    const positions: Vec2[] = [];
    for (let i = 0; i < shown; i++) {
      const pace = c.vaporDriftS * (1 + VAPOR_PACE_SPREAD * (hash01(c.seed, i, 3) - 0.5));
      const phase = (hash01(c.seed, i, 0) + tl.t / pace) % 1;
      const tri = 1 - Math.abs(2 * phase - 1);
      const xBase = x0 + VAPOR_INSET + hash01(c.seed, i, 1) * (w - 2 * VAPOR_INSET);
      const wobble = VAPOR_WOBBLE * Math.sin(2 * Math.PI * (phase + hash01(c.seed, i, 2)));
      positions.push([xBase + wobble, floor + tri * (ceil - floor)]);
    }
    out.push({ type: 'particleSystem', id: 'vapor', positions, sizes: VAPOR_DOT_PX, style: SUBSTANCE });
  }

  // ---- 그릇 벽 — 닫힌 그릇 ----
  out.push({ type: 'trajectory', id: 'vessel', points: rect(x0, y0, x1, y1), closed: true, width: WALL_PX, style: MUTED });

  // ---- 그릇 속 이름 — 지금 있는 것만, 그릇 오른쪽에 제 높이로 ----
  const labelX = x1 + VESSEL_LABEL_GAP;
  const waterY = (y0 + level) / 2;
  if (now.shares.water > 0) out.push(label('name-water', [labelX, waterY], 'label.water', { size: LABEL_PX, align: 'left' }));
  if (now.shares.ice > 0) {
    const y = now.shares.water > 0 ? Math.max(iceMid, waterY + LABEL_SEP) : iceMid;
    out.push(label('name-ice', [labelX, y], 'label.ice', { size: LABEL_PX, align: 'left' }));
  }
  if (shown > 0) {
    out.push(label('name-vapor', [labelX, (Math.max(floor, iceTop) + ceil) / 2], 'label.vapor', { size: LABEL_PX, align: 'left' }));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
