// ========================================================================
// stellar-nucleosynthesis — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 별의 겹(body 원) ·
// 불꽃 테와 축 · 곡선(trajectory) · 계단과 붙여 본 화살표(vector) · 곡선 위 점
// (body point) · 원소 기호와 축 이름(readout)이 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 —
//   primary  별의 겹. 같은 대상이라 한 색이고, 안으로 갈수록 짙어지는 것은 겹을
//            가르는 명암일 뿐 원소마다 다른 색이 아니다 (S-piece — 색으로 설명하지 않는다)
//   accent   **지금 일어나는 융합** 한 뜻에만 — 자라는 핵의 불꽃 테와 곡선 위 머리 점
//   positive 융합이 곡선을 오른 계단 — 에너지가 나온다
//   negative 철 너머로 붙여 본 화살표 — 에너지를 먹는다
//   muted    곡선 · 축 · 철의 벽 · 축 이름 (배경 정보)
//   ink      원소 기호
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
  beyondProgress,
  curvePoints,
  nuclidePoint,
  readConstants,
  readShells,
  sceneOpacity,
  wallProgress,
} from './physics';
import {
  BEYOND_TARGET,
  HEAVY_MARKS,
  NUCLIDES,
  PLOT,
  SCENE_BOUNDS,
  SHELLS,
  SHELL_LABEL_ANGLES,
  STAR_CENTER,
  text,
} from './schema';
import type { StellarNucleosynthesisState } from './state';

/** 맨 바깥 겹(수소)의 짙기와 철 핵의 짙기. 그 사이 겹은 고르게 짙어진다. */
const TINT_OUTER = 0.2;
const TINT_CORE = 0.72;
/** 불꽃 테의 굵기(화면 px)와 원을 표본하는 점 수. */
const BURN_RING_PX = 3;
const RING_SAMPLES = 72;
/** 이만큼(월드)도 자라지 않은 겹 · 테는 그리지 않는다 — 점 하나가 깜빡이지 않게. */
const MIN_RADIUS = 0.02;
/** 겹 이름표가 나타나기까지 그 자리를 넘어 더 자라야 하는 거리(월드). 글자 반 높이쯤. */
const LABEL_REVEAL = 0.1;
/** 겹 위 원소 기호 글자 크기(화면 px). */
const SHELL_LABEL_PX = 12;
/** 곡선 위 원소 기호 글자 크기 · 점에서 띄우는 거리(화면 px). */
const CURVE_LABEL_PX = 11;
const CURVE_LABEL_GAP = 11;
/** 축 이름 글자 크기 · 축에서 띄우는 거리(화면 px). */
const AXIS_LABEL_PX = 11;
const AXIS_LABEL_GAP = 12;
/** 곡선 · 축 · 철의 벽 굵기(화면 px). 곡선이 축보다 짙고 굵다. */
const CURVE_PX = 2;
const AXIS_PX = 1;
const WALL_PX = 1.5;
/** 곡선 · 축 · 벽의 짙기. 곡선은 배경 정보지만 계단이 그 위를 밟는 것이 읽혀야 한다. */
const CURVE_OPACITY = 0.7;
const AXIS_OPACITY = 0.6;
const WALL_OPACITY = 0.8;
/** 다 오른 계단의 짙기. 지금 오르는 계단보다 물러난다. */
const STEP_DONE_OPACITY = 0.6;
/** 계단 · 붙여 본 화살표 굵기(화면 px). */
const STEP_PX = 2.5;
/** 곡선 위 머리 점의 반지름(월드). 지금 융합이 와 있는 자리라 핵종 점보다 크다. */
const HEAD_RADIUS = 0.08;
/** 곡선 위 핵종 점의 반지름(월드). */
const DOT_RADIUS = 0.04;

export function scene(params: {
  state: StellarNucleosynthesisState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('stellar-nucleosynthesis: schema.timeline 이 선언되어야 한다');
  const table = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const shells = readShells(timeline);
  const out: Primitive[] = [];

  // ================= 별의 단면 — 양파 =================

  // 겹을 바깥에서 안으로 차례로 덮는다. 반투명을 겹쳐 쌓으면 겹친 곳이 짙어지므로,
  // 겹 i 가 **쌓인 결과** 가 목표 짙기가 되도록 겹마다 알파를 거꾸로 푼다.
  const n = SHELLS.length;
  const tintOf = (i: number): number => TINT_OUTER + ((TINT_CORE - TINT_OUTER) * i) / (n - 1);
  SHELLS.forEach((s, i) => {
    const r = s.radius * shells[i]!.grown;
    if (r < MIN_RADIUS) return;
    const layerAlpha = i === 0 ? tintOf(0) : 1 - (1 - tintOf(i)) / (1 - tintOf(i - 1));
    out.push({
      type: 'body',
      id: `shell-${s.nuclide}`,
      pos: STAR_CENTER,
      shape: 'circle',
      size: r,
      outline: 'none',
      glow: false,
      opacity: layerAlpha * (i === 0 ? 1 : alpha),
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  });

  // 불꽃 테 — 지금 자라는 핵의 가장자리. 재가 쌓이는 자리이자 지금 타는 자리다.
  // 철이 다 자란 뒤로는 자라는 겹이 없어 테가 꺼진다: 「중심의 불이 꺼진다」.
  SHELLS.forEach((s, i) => {
    const reading = shells[i]!;
    if (!reading.growing) return;
    const r = s.radius * reading.grown;
    if (r < MIN_RADIUS) return;
    out.push({
      type: 'trajectory',
      id: `burn-${s.nuclide}`,
      points: circle(STAR_CENTER, r),
      closed: true,
      width: BURN_RING_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  });

  // 겹 이름표 — 겹이 다 쌓였을 때의 자리(겹 두께의 가운데)에 고정한다. 자라는 핵이
  // 그 자리를 덮을 만큼 커지면 나타난다. 자리가 움직이지 않아야 다음 겹이 안에서
  // 자라도 이름이 제 겹에 남는다.
  SHELLS.forEach((s, i) => {
    const inner = SHELLS[i + 1]?.radius;
    // 철 핵(가장 안쪽)은 한가운데, 나머지는 겹 두께의 가운데를 번갈아 든 방향으로.
    const mid = inner === undefined ? 0 : (s.radius + inner) / 2;
    const angle = SHELL_LABEL_ANGLES[i % 2]!;
    const r = s.radius * shells[i]!.grown;
    // 얇은 겹은 가운데 + 여유가 바깥 반지름을 넘는다 — 그때는 다 자랐을 때 나타난다.
    // 철 핵은 한가운데 이름이 자라는 불꽃 테에 걸리므로 다 자란 뒤에 나타난다.
    const reveal = inner === undefined ? s.radius : Math.min(mid + LABEL_REVEAL, s.radius);
    if (r < reveal) return;
    out.push({
      type: 'readout',
      id: `shell-label-${s.nuclide}`,
      anchor: {
        world: [STAR_CENTER[0] + mid * Math.cos(angle), STAR_CENTER[1] + mid * Math.sin(angle)],
      },
      text: text(s.symbol),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: SHELL_LABEL_PX,
      opacity: i === 0 ? 1 : alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  });

  // ================= 핵자당 결합 에너지 곡선 =================

  const origin: Vec2 = [PLOT.originX, PLOT.originY];
  const heaviest = NUCLIDES[NUCLIDES.length - 1]!;
  const xEnd = nuclidePoint(heaviest.id, table)[0] + PLOT.axisOverX;
  const yTop = PLOT.originY + PLOT.axisTopMeV * PLOT.perMeV;

  out.push({
    type: 'trajectory',
    id: 'axes',
    points: [
      [origin[0], yTop],
      origin,
      [xEnd, origin[1]],
    ],
    width: AXIS_PX,
    opacity: AXIS_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-binding',
    anchor: { world: [origin[0], yTop], offset: [0, -AXIS_LABEL_GAP] },
    text: text('label.axisBinding'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: AXIS_LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-mass',
    anchor: { world: [xEnd, origin[1]], offset: [0, AXIS_LABEL_GAP] },
    text: text('label.axisMass'),
    chip: false,
    font: 'text',
    align: 'right',
    fontSize: AXIS_LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  out.push({
    type: 'trajectory',
    id: 'binding-curve',
    points: curvePoints(table),
    width: CURVE_PX,
    opacity: CURVE_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 철의 벽 — 가로축에서 철의 자리까지 세운 점선. 철 너머로 붙여 보는 동안 나타난다.
  // 철 이름표를 가르지 않게 철의 점에서 멈춘다.
  const iron = nuclidePoint(SHELLS[n - 1]!.nuclide, table);
  const wall = wallProgress(timeline);
  if (wall > 0) {
    out.push({
      type: 'trajectory',
      id: 'iron-wall',
      points: [
        [iron[0], origin[1]],
        iron,
      ],
      width: WALL_PX,
      opacity: WALL_OPACITY * wall * alpha,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // 계단 — 겹 하나가 쌓이는 동안 앞 원소의 자리에서 이 원소의 자리로 곡선을 오른다.
  // 오른 높이가 나온 에너지다. 수소 → 헬륨이 가장 크고, 뒤로 갈수록 얕아진다.
  const points = SHELLS.map((s) => nuclidePoint(s.nuclide, table));
  for (let i = 1; i < n; i++) {
    const reading = shells[i]!;
    if (reading.grown <= 0) continue;
    const from = points[i - 1]!;
    const to = points[i]!;
    const delta: Vec2 = [(to[0] - from[0]) * reading.grown, (to[1] - from[1]) * reading.grown];
    out.push({
      type: 'vector',
      id: `step-${SHELLS[i]!.nuclide}`,
      from,
      delta,
      width: STEP_PX,
      opacity: (reading.growing ? 1 : STEP_DONE_OPACITY) * alpha,
      style: { colorRole: 'positive', emphasis: 'strong' },
    });
  }

  // 철 너머로 붙여 본 화살표 — 철에서 더 무거운 쪽으로 가면 곡선을 내려간다.
  if (wall > 0) {
    const target = nuclidePoint(BEYOND_TARGET, table);
    out.push({
      type: 'vector',
      id: 'beyond-iron',
      from: iron,
      delta: [(target[0] - iron[0]) * wall, (target[1] - iron[1]) * wall],
      width: STEP_PX,
      opacity: alpha,
      style: { colorRole: 'negative', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // 핵종 점과 원소 기호. 양파의 겹과 같은 기호로 곡선 위 자리를 잇는다.
  SHELLS.forEach((s, i) => {
    const p = points[i]!;
    out.push({
      type: 'body',
      id: `dot-${s.nuclide}`,
      pos: p,
      shape: 'circle',
      size: DOT_RADIUS,
      outline: 'none',
      glow: false,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `curve-label-${s.nuclide}`,
      anchor: { world: p, offset: [0, -s.labelSide * CURVE_LABEL_GAP] },
      text: text(s.symbol),
      chip: false,
      font: 'text',
      fontSize: CURVE_LABEL_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  });

  // 머리 점 — 지금 융합이 곡선 위 어디에 와 있는가. 자라는 겹이 없으면 없다.
  SHELLS.forEach((s, i) => {
    const reading = shells[i]!;
    if (i === 0 || !reading.growing) return;
    const from = points[i - 1]!;
    const to = points[i]!;
    out.push({
      type: 'body',
      id: `head-${s.nuclide}`,
      pos: [from[0] + (to[0] - from[0]) * reading.grown, from[1] + (to[1] - from[1]) * reading.grown],
      shape: 'circle',
      size: HEAD_RADIUS,
      outline: 'background',
      glow: false,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  });

  // 곁말 — 철보다 무거운 원소는 곡선의 내리막에 있다. 이 불이 아니라 다른 사건이 만든다.
  const beyond = beyondProgress(timeline);
  if (beyond > 0) {
    for (const h of HEAVY_MARKS) {
      const p = nuclidePoint(h.nuclide, table);
      const o = beyond * alpha;
      out.push({
        type: 'body',
        id: `dot-${h.nuclide}`,
        pos: p,
        shape: 'circle',
        size: DOT_RADIUS,
        outline: 'none',
        glow: false,
        opacity: o,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      out.push({
        type: 'readout',
        id: `curve-label-${h.nuclide}`,
        anchor: { world: p, offset: [0, -h.labelSide * CURVE_LABEL_GAP] },
        text: text(h.symbol),
        chip: false,
        font: 'text',
        fontSize: CURVE_LABEL_PX,
        opacity: o,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 원을 점으로 표본한다 — 곡선 어휘가 없다 (장부 G28). */
function circle(center: Vec2, r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k < RING_SAMPLES; k++) {
    const a = (2 * Math.PI * k) / RING_SAMPLES;
    pts.push([center[0] + r * Math.cos(a), center[1] + r * Math.sin(a)]);
  }
  return pts;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
