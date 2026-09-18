// ========================================================================
// quantum-tunneling — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 장벽 몸과 |ψ|² 아래 칠은 `region`,
// 퍼텐셜 선 · E 선은 `trajectory`, |ψ|² 윤곽은 `lineSet`(밀도가 보일 만한 구간만 가닥으로),
// 두께는 `dimension`, 기호는 `readout` 이다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 두 레인은 두께만 다르다 — 위가 d, 아래가 d × `widthRatio`. 같은 묶음이 같은 순간에
// 두 장벽의 왼쪽 면(x = 0)을 친다.
//
// 색은 뜻마다 하나다 — |ψ|² 는 모두 같은 대상(한 입자의 확률)이라 오는 것 · 되튄 것 · 장벽
// 안 · 너머 모두 같은 먹색이다. 장벽 · 퍼텐셜 선 · E 선은 배경 정보라 muted. **강조색은
// 「두 레인이 다른 한 가지 = 두께」 에만** 쓴다. 되튄 것과 지나간 것을 색으로 가르지 않는다
// (S-piece).
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
  density,
  packetCenter,
  packetOpacity,
  readConstants,
  solveBarrier,
  type BarrierSolution,
  type QuantumTunnelingConstants,
} from './physics';
import { LANE_LEFT, LANE_RIGHT, LANE_STRIDE, SCENE_BOUNDS, WIDTH_DIM_DROP, text } from './schema';
import type { QuantumTunnelingState } from './state';

/** |ψ|² 표본 간격(월드). 겹침 무늬 한 줄(π/k ≈ 3.8)에 표본이 40 개쯤 들어간다. */
const SAMPLE_STEP = 0.1;
/** 장벽 안 표본 수 — 얇은 장벽에도 지수 곡선이 매끈하게. */
const BARRIER_SAMPLES = 40;
/**
 * 윤곽을 긋는 가장 낮은 밀도(들어오는 봉우리 = 1). 이보다 낮은 곳은 윤곽이 E 선 위에 누워
 * 점선을 덮어 실선으로 만들므로 긋지 않는다. 두꺼운 장벽 너머 봉우리(약 0.068)보다 한참 작다.
 */
const PSI_VISIBLE_MIN = 0.004;
/** |ψ|² 윤곽 · 퍼텐셜 선 · E 선 굵기(화면 px). */
const PSI_WIDTH_PX = 2;
const POTENTIAL_WIDTH_PX = 1.5;
const ENERGY_LINE_WIDTH_PX = 1;
/** |ψ|² 아래 칠 · 장벽 몸 칠의 불투명도. */
const PSI_FILL_OPACITY = 0.2;
const BARRIER_FILL_OPACITY = 0.22;
/** 글자 크기(화면 px). */
const SYMBOL_PX = 13;
const WIDTH_LABEL_PX = 13;
/** 글자 띄움(화면 px). */
const SYMBOL_GAP_PX = 8;
const WIDTH_LABEL_GAP_PX = 10;

/** 한 레인 — 장벽 두께와 기준선 높이. */
interface Lane {
  id: string;
  solution: BarrierSolution;
  /** 레인 기준선(V = 0)의 월드 y. */
  base: number;
  /** 두께 이름표 — 얇은 쪽은 `d`, 두꺼운 쪽은 `{k}d`. */
  thick: boolean;
}

/** |ψ|² 표본 — E 선이 가로축이다. 장벽 두 면에 표본을 꼭 둔다(곡선이 거기서 꺾인다). */
function psiSamples(lane: Lane, center: number, c: QuantumTunnelingConstants): { x: number; rho: number }[] {
  const s = lane.solution;
  const xs: number[] = [];
  for (let x = LANE_LEFT; x < 0; x += SAMPLE_STEP) xs.push(x);
  for (let i = 0; i <= BARRIER_SAMPLES; i++) xs.push((s.width * i) / BARRIER_SAMPLES);
  for (let x = s.width + SAMPLE_STEP; x <= LANE_RIGHT; x += SAMPLE_STEP) xs.push(x);
  return xs.map((x) => ({ x, rho: density(x, center, s, c.packetSigma) }));
}

/** 밀도가 보일 만한 구간만 가닥으로 끊는다 — 윤곽이 E 점선을 덮지 않게. */
function visibleRuns(pts: readonly Vec2[], rho: readonly number[]): Vec2[][] {
  const runs: Vec2[][] = [];
  let run: Vec2[] = [];
  for (let i = 0; i < pts.length; i++) {
    if (rho[i]! >= PSI_VISIBLE_MIN) run.push(pts[i]!);
    else if (run.length > 0) {
      if (run.length > 1) runs.push(run);
      run = [];
    }
  }
  if (run.length > 1) runs.push(run);
  return runs;
}

function laneScene(
  lane: Lane,
  center: number,
  opacity: number,
  c: QuantumTunnelingConstants,
): Primitive[] {
  const out: Primitive[] = [];
  const w = lane.solution.width;
  const y0 = lane.base;
  const yV = y0 + c.barrierHeight * c.energyScale;
  const yE = y0 + c.energy * c.energyScale;

  // ---- 장벽 — 몸과 퍼텐셜 모양 선 ----
  out.push({
    type: 'region',
    id: `${lane.id}-barrier`,
    points: [
      [0, y0],
      [0, yV],
      [w, yV],
      [w, y0],
    ],
    fillOpacity: BARRIER_FILL_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: `${lane.id}-potential`,
    points: [
      [LANE_LEFT, y0],
      [0, y0],
      [0, yV],
      [w, yV],
      [w, y0],
      [LANE_RIGHT, y0],
    ],
    width: POTENTIAL_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- V₀ 안내선 — 장벽 꼭대기 높이를 왼쪽 끝까지 잇는다. E 선이 그 아래에 놓인다 ----
  out.push({
    type: 'trajectory',
    id: `${lane.id}-barrier-level`,
    points: [
      [LANE_LEFT, yV],
      [0, yV],
    ],
    width: ENERGY_LINE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dotted' },
  });

  // ---- E 선 — 묶음의 에너지. 장벽 꼭대기보다 낮다 ----
  out.push({
    type: 'trajectory',
    id: `${lane.id}-energy`,
    points: [
      [LANE_LEFT, yE],
      [LANE_RIGHT, yE],
    ],
    width: ENERGY_LINE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // ---- |ψ|² — E 선 위에 얹힌 봉우리 ----
  if (opacity > 0) {
    const samples = psiSamples(lane, center, c);
    const curve = samples.map(({ x, rho }) => [x, yE + c.psiHeight * rho] as Vec2);
    const first = curve[0]!;
    const last = curve[curve.length - 1]!;
    out.push({
      type: 'region',
      id: `${lane.id}-psi-fill`,
      points: [...curve, [last[0], yE], [first[0], yE]],
      fillOpacity: PSI_FILL_OPACITY,
      opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'lineSet',
      id: `${lane.id}-psi`,
      lines: visibleRuns(
        curve,
        samples.map((p) => p.rho),
      ),
      width: PSI_WIDTH_PX,
      opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 기호 — V₀ 는 안내선 왼쪽 끝, E 는 E 선 오른쪽 끝(둘이 한 기둥이면 세로로 붙어 겹친다).
  // 장벽 둘레는 |ψ|² 가 지나가므로 비워 둔다 ----
  out.push({
    type: 'readout',
    id: `${lane.id}-energy-label`,
    anchor: { world: [LANE_RIGHT, yE], offset: [SYMBOL_GAP_PX, 0] },
    text: text('label.energy'),
    chip: false,
    font: 'text',
    fontSize: SYMBOL_PX,
    italic: true,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: `${lane.id}-barrier-label`,
    anchor: { world: [LANE_LEFT, yV], offset: [-SYMBOL_GAP_PX, 0] },
    text: text('label.barrier'),
    chip: false,
    font: 'text',
    fontSize: SYMBOL_PX,
    italic: true,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 두께 — 두 레인이 다른 단 한 가지 ----
  const yDim = y0 - WIDTH_DIM_DROP;
  out.push({
    type: 'dimension',
    id: `${lane.id}-width`,
    from: [0, yDim],
    to: [w, yDim],
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: `${lane.id}-width-label`,
    anchor: { world: [w / 2, yDim], offset: [0, WIDTH_LABEL_GAP_PX] },
    text: lane.thick ? text('label.width') : text('label.widthOne'),
    vars: { k: String(c.widthRatio) },
    chip: false,
    font: 'text',
    fontSize: WIDTH_LABEL_PX,
    italic: true,
    align: 'center',
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  return out;
}

export function scene(params: {
  state: QuantumTunnelingState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('quantum-tunneling: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const center = packetCenter(tl, c);
  const opacity = packetOpacity(tl);

  const lanes: Lane[] = [
    { id: 'thin', solution: solveBarrier(c, c.barrierWidth), base: LANE_STRIDE, thick: false },
    { id: 'thick', solution: solveBarrier(c, c.barrierWidth * c.widthRatio), base: 0, thick: true },
  ];

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return lanes.flatMap((lane) => laneScene(lane, center, opacity, c));
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
