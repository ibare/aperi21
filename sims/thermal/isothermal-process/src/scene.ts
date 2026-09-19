// ========================================================================
// isothermal-process — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽은 장치 — 항온조(region) 위에 세운 실린더(surface) · 기체 기둥(region) ·
// 분자(particleSystem) · 피스톤(body) · 열 알갱이와 두 더미 Q · W(body) · 온도(readout).
// 오른쪽은 P–V 그림 — 축(vector) · 같은 온도의 곡선(trajectory) · 지나온 아래 넓이(region) ·
// 두 부피의 눈금 · 안내선 · 지금 점(body).
//
// 색은 뜻마다 하나다. **강조색은 열 알갱이 한 뜻에만** — 들어온 Q 더미 · 길 위의 알갱이 ·
// 나간 W 더미가 같은 알갱이라 같은 색이다. 둘은 **어느 더미에 앉았는가**로 갈린다
// (S-piece). 기체는 secondary, 항온조는 muted, 넓이는 primary, 곡선 · 축 · 피스톤은 먹과 muted.
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
import { grainProgress, pressureRatioAt, readConstants, readGas, readMolecules } from './physics';
import {
  BATH,
  CYLINDER,
  GRAIN_SOURCE_Y,
  GRAPH_ORIGIN,
  PISTON_THICKNESS,
  Q_STACK,
  SCENE_BOUNDS,
  TEMPERATURE_AT,
  WALL_HEADROOM,
  W_STACK,
  text,
} from './schema';
import type { IsothermalProcessState } from './state';

// ---- 장치 ----
/** 분자 점 반지름 · 자취(화면 px, 초, 짙기). 분자는 작은 배경이다. */
const MOLECULE_PX = 2;
const MOLECULE_MARGIN = 0.05;
const TRAIL_SECONDS = 0.12;
const TRAIL_WIDTH_PX = 1.2;
const TRAIL_OPACITY = 0.4;
/** 기체 기둥 · 항온조의 옅은 칠. 분자 · 알갱이가 비쳐 보여야 한다. */
const GAS_FILL = 0.1;
const BATH_FILL = 0.2;
/** 피스톤이 실린더 벽과 닿지 않게 줄이는 틈(월드). */
const PISTON_CLEARANCE = 0.03;
/** 항온조 이름표 — 왼쪽 아래 모서리에서 띄운 거리(화면 px) · 글자 크기. */
const BATH_LABEL_OFFSET: Vec2 = [8, -12];
const BATH_LABEL_PX = 12;
/** 온도 글자 크기(화면 px). */
const TEMPERATURE_PX = 13;

// ---- 열 알갱이 ----
/** 알갱이 반지름 · 더미에서 알갱이 사이 간격(월드). */
const GRAIN_RADIUS = 0.085;
const GRAIN_SPACING = 0.23;
/** 피스톤 위에서 벽을 넘어 W 더미로 가는 호 — 조종점이 벽 끝에서 오른쪽 · 위로 떨어진 거리(월드), 표본 수. */
const ARC_REACH = 0.35;
const ARC_LIFT = 0.55;
const ARC_SAMPLES = 16;
/** 더미 이름표(Q · W)가 맨 위 자리 위로 띄운 거리(월드) · 글자 크기(화면 px). */
const STACK_LABEL_GAP = 0.32;
const STACK_LABEL_PX = 15;
/** 아직 오지 않은 더미 자리의 테두리 짙기 — 몇 개가 올지 자리로 보인다. */
const SLOT_OPACITY = 0.55;

// ---- P–V 그림 ----
/** 축 굵기(화면 px) · 축 끝이 보이는 범위 너머로 나오는 여유(월드) · 화살촉 크기(월드). */
const AXIS_WIDTH_PX = 1.4;
const AXIS_OVERHANG = 0.15;
const AXIS_HEAD = 0.12;
/** 곡선 표본 수와 굵기(화면 px). */
const CURVE_SAMPLES = 64;
const CURVE_WIDTH_PX = 2;
/** 지나온 아래 넓이의 칠. 곡선 · 안내선이 비쳐 보여야 한다. */
const AREA_FILL = 0.28;
/** 넓이 표식 `W` — 넓이가 이만큼(월드) 넓어진 뒤에만 띄운다, 넓이 높이에서의 자리 비, 글자 크기(화면 px). */
const AREA_LABEL_MIN_WIDTH = 0.35;
const AREA_LABEL_HEIGHT = 0.4;
const AREA_LABEL_PX = 15;
/** 두 부피의 안내선 굵기(화면 px) · 짙기. */
const GUIDE_WIDTH_PX = 1.2;
const GUIDE_OPACITY = 0.7;
/** 지금 점 반지름(월드). */
const POINT_RADIUS = 0.075;
/** 눈금선 길이(월드), 눈금 이름 · 축 이름의 띄움(화면 px), 글자 크기(화면 px). */
const TICK_LEN = 0.08;
const TICK_WIDTH_PX = 1.2;
const TICK_LABEL_GAP_PX = 13;
const TICK_LABEL_PX = 13;
const AXIS_LABEL_GAP_PX = 14;
const AXIS_LABEL_PX = 15;

function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

/** 폴리라인 위의 거리 비 s(0~1) 자리와, 첫 `mark` 점까지의 거리 비. */
function along(points: readonly Vec2[], s: number, mark: number): { pos: Vec2; markAt: number } {
  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const d = Math.hypot(points[i]![0] - points[i - 1]![0], points[i]![1] - points[i - 1]![1]);
    lens.push(d);
    total += d;
  }
  let markLen = 0;
  for (let i = 0; i < mark; i++) markLen += lens[i]!;
  let left = s * total;
  let pos: Vec2 = points[points.length - 1]!;
  for (let i = 0; i < lens.length; i++) {
    const d = lens[i]!;
    if (left <= d) {
      const f = d > 0 ? left / d : 0;
      const a = points[i]!;
      const b = points[i + 1]!;
      pos = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      break;
    }
    left -= d;
  }
  return { pos, markAt: total > 0 ? markLen / total : 0 };
}

export function scene(params: {
  state: IsothermalProcessState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('isothermal-process: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const g = readGas(tl, c);
  const out: Primitive[] = [];
  /** 되돌리는 동안 더미 · 넓이가 옅어진다. */
  const fade = 1 - tl.at('reset');

  // ================= 장치 =================
  const gasHeight = g.vRatio * c.worldPerVolume;
  const pistonBottom = CYLINDER.bottom + gasHeight;
  const pistonTop = pistonBottom + PISTON_THICKNESS;
  const wallTop = CYLINDER.bottom + c.k * c.worldPerVolume + PISTON_THICKNESS + WALL_HEADROOM;
  const cx = (CYLINDER.left + CYLINDER.right) / 2;

  // ---- 항온조 — 실린더 바닥이 닿는 넓은 열원. 온도는 이름표 글자로. ----
  out.push({
    type: 'region',
    id: 'bath',
    points: rect(BATH.left, BATH.bottom, BATH.right, BATH.top),
    fillOpacity: BATH_FILL,
    outline: [[3, 2]],
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'bath-label',
    anchor: { world: [BATH.left, BATH.bottom], offset: BATH_LABEL_OFFSET },
    text: text('label.bath'),
    vars: { t: state.t },
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: BATH_LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 기체 기둥 — 바닥에서 피스톤까지. 이 칸의 높이가 곧 부피다. ----
  out.push({
    type: 'region',
    id: 'gas',
    points: rect(CYLINDER.left, CYLINDER.bottom, CYLINDER.right, pistonBottom),
    fillOpacity: GAS_FILL,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ---- 분자 — 온도가 그대로라 자취 길이(속력)도 그대로다. ----
  const field = readMolecules(state.molecules, tl, c, g, {
    left: CYLINDER.left,
    right: CYLINDER.right,
    bottom: CYLINDER.bottom,
    height: gasHeight,
    margin: MOLECULE_MARGIN,
  });
  out.push({
    type: 'particleSystem',
    id: 'molecules',
    positions: field.positions,
    velocities: field.velocities,
    sizes: MOLECULE_PX,
    trail: true,
    trailStyle: { seconds: TRAIL_SECONDS, width: TRAIL_WIDTH_PX, opacity: TRAIL_OPACITY },
    clip: { min: [CYLINDER.left, CYLINDER.bottom], max: [CYLINDER.right, pistonBottom] },
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ---- 피스톤 ----
  out.push({
    type: 'body',
    id: 'piston',
    pos: [cx, (pistonBottom + pistonTop) / 2],
    shape: 'rect',
    size: [CYLINDER.right - CYLINDER.left - 2 * PISTON_CLEARANCE, PISTON_THICKNESS],
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 실린더 — 두 옆 벽과 바닥. 바닥은 항온조 윗면에 닿는다. ----
  out.push({
    type: 'surface',
    id: 'wall-left',
    geometry: { kind: 'wall', from: [CYLINDER.left, wallTop], to: [CYLINDER.left, CYLINDER.bottom] },
    material: 'solid',
  });
  out.push({
    type: 'surface',
    id: 'wall-right',
    geometry: { kind: 'wall', from: [CYLINDER.right, CYLINDER.bottom], to: [CYLINDER.right, wallTop] },
    material: 'solid',
  });
  out.push({
    type: 'surface',
    id: 'wall-bottom',
    geometry: { kind: 'wall', from: [CYLINDER.left, CYLINDER.bottom], to: [CYLINDER.right, CYLINDER.bottom] },
    material: 'solid',
  });

  // ---- 온도 — 주기 내내 같은 글자다. ----
  out.push({
    type: 'readout',
    id: 'temperature',
    anchor: { world: [TEMPERATURE_AT[0], TEMPERATURE_AT[1]] },
    text: text('label.temperature'),
    vars: { t: state.t },
    font: 'text',
    fontSize: TEMPERATURE_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 열 알갱이 — 항온조 → 기체 → 피스톤 → 벽 넘어 W 더미 ----
  const progress = grainProgress(g, c);
  const slot = (x: number, y: number, j: number): Vec2 => [x, y + j * GRAIN_SPACING];
  let entered = 0;
  let landed = 0;
  const flying: Vec2[] = [];
  for (let i = 0; i < c.grains; i++) {
    const s = progress[i]!;
    const target = slot(W_STACK.x, W_STACK.y, i);
    // 벽을 넘는 호 — 피스톤 윗면에서 조종점(벽 끝 오른쪽 위)을 거쳐 더미 자리로.
    const ctrl: Vec2 = [CYLINDER.right + ARC_REACH, wallTop + ARC_LIFT];
    const path: Vec2[] = [
      [cx, GRAIN_SOURCE_Y],
      [cx, CYLINDER.bottom],
      [cx, pistonTop],
    ];
    for (let j = 1; j <= ARC_SAMPLES; j++) {
      const f = j / ARC_SAMPLES;
      const a = (1 - f) * (1 - f);
      const b = 2 * (1 - f) * f;
      const d = f * f;
      path.push([a * cx + b * ctrl[0] + d * target[0], a * pistonTop + b * ctrl[1] + d * target[1]]);
    }
    const { pos, markAt } = along(path, s, 1);
    if (s >= markAt && s > 0) entered++;
    if (s >= 1) landed++;
    else if (s > 0) flying.push(pos);
  }

  // Q 더미 — 항온조 윗면을 지나 기체로 들어온 알갱이 수만큼. 올 자리는 테두리만.
  // W 더미 — 피스톤 쪽으로 나가 앉은 알갱이.
  const stacks: { id: 'q' | 'w'; x: number; y: number; filled: number; label: 'label.heat' | 'label.work' }[] = [
    { id: 'q', x: Q_STACK.x, y: Q_STACK.y, filled: entered, label: 'label.heat' },
    { id: 'w', x: W_STACK.x, y: W_STACK.y, filled: landed, label: 'label.work' },
  ];
  for (const st of stacks) {
    for (let j = 0; j < c.grains; j++) {
      const on = j < st.filled;
      out.push({
        type: 'body',
        id: `${st.id}-slot-${j}`,
        pos: slot(st.x, st.y, j),
        shape: 'circle',
        size: GRAIN_RADIUS,
        fill: on ? 'solid' : 'none',
        outline: on ? 'none' : 'role',
        glow: false,
        opacity: on ? fade : fade * SLOT_OPACITY,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
    out.push({
      type: 'readout',
      id: `${st.id}-label`,
      anchor: { world: [st.x, st.y + (c.grains - 1) * GRAIN_SPACING + STACK_LABEL_GAP] },
      text: text(st.label),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: STACK_LABEL_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  flying.forEach((pos, i) => {
    out.push({
      type: 'body',
      id: `grain-flying-${i}`,
      pos,
      shape: 'circle',
      size: GRAIN_RADIUS,
      outline: 'background',
      glow: false,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  });

  // ================= P–V 그림 (장부 G203 조립) =================
  const [ox, oy] = GRAPH_ORIGIN;
  const gx = (v: number): number => ox + v * c.graphWorldPerVolume;
  const gy = (p: number): number => oy + p * c.graphWorldPerPressure;

  // ---- 지나온 아래 넓이 — V₁ 에서 이번에 부푼 자리까지. 되돌리는 동안 옅어진다. ----
  const vReached = 1 + (c.k - 1) * tl.at('expand');
  if (vReached > 1) {
    const top: Vec2[] = [];
    for (let i = 0; i <= CURVE_SAMPLES; i++) {
      const v = 1 + ((vReached - 1) * i) / CURVE_SAMPLES;
      top.push([gx(v), gy(pressureRatioAt(v))]);
    }
    out.push({
      type: 'region',
      id: 'area',
      points: [[gx(1), oy], ...top, [gx(vReached), oy]],
      fillOpacity: AREA_FILL,
      opacity: fade,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
    if (gx(vReached) - gx(1) >= AREA_LABEL_MIN_WIDTH) {
      const vMid = (1 + vReached) / 2;
      out.push({
        type: 'readout',
        id: 'area-label',
        anchor: { world: [gx(vMid), oy + (gy(pressureRatioAt(vReached)) - oy) * AREA_LABEL_HEIGHT] },
        text: text('label.work'),
        chip: false,
        font: 'text',
        italic: true,
        opacity: fade,
        fontSize: AREA_LABEL_PX,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  }

  // ---- 두 부피의 안내선 — 축에서 곡선까지 점선. ----
  const ends = [
    { id: 'start', v: 1, label: 'label.volumeStart' as const },
    { id: 'end', v: c.k, label: 'label.volumeEnd' as const },
  ];
  for (const e of ends) {
    out.push({
      type: 'trajectory',
      id: `guide-${e.id}`,
      points: [
        [gx(e.v), oy],
        [gx(e.v), gy(pressureRatioAt(e.v))],
      ],
      width: GUIDE_WIDTH_PX,
      opacity: GUIDE_OPACITY,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 같은 온도의 곡선 — 지금 점과 같은 계산으로 표본한다. ----
  const vMin = 1 / c.graphPMax;
  const curve: Vec2[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const v = vMin + ((c.graphVMax - vMin) * i) / CURVE_SAMPLES;
    curve.push([gx(v), gy(pressureRatioAt(v))]);
  }
  out.push({
    type: 'trajectory',
    id: 'isotherm',
    points: curve,
    width: CURVE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 축 ----
  out.push({
    type: 'vector',
    id: 'axis-v',
    from: [ox, oy],
    delta: [c.graphVMax * c.graphWorldPerVolume + AXIS_OVERHANG, 0],
    headSize: AXIS_HEAD,
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'axis-p',
    from: [ox, oy],
    delta: [0, c.graphPMax * c.graphWorldPerPressure + AXIS_OVERHANG],
    headSize: AXIS_HEAD,
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-v-label',
    anchor: {
      world: [ox + c.graphVMax * c.graphWorldPerVolume + AXIS_OVERHANG, oy],
      offset: [0, AXIS_LABEL_GAP_PX],
    },
    text: text('label.volume'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: AXIS_LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-p-label',
    anchor: {
      world: [ox, oy + c.graphPMax * c.graphWorldPerPressure + AXIS_OVERHANG],
      offset: [-AXIS_LABEL_GAP_PX, 0],
    },
    text: text('label.pressure'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: AXIS_LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 눈금 — 두 부피에만. 격자는 두지 않는다. ----
  out.push({
    type: 'lineSet',
    id: 'graph-ticks',
    lines: ends.map((e) => [
      [gx(e.v), oy],
      [gx(e.v), oy - TICK_LEN],
    ]),
    width: TICK_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  for (const e of ends) {
    out.push({
      type: 'readout',
      id: `tick-${e.id}`,
      anchor: { world: [gx(e.v), oy], offset: [0, TICK_LABEL_GAP_PX] },
      text: text(e.label),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: TICK_LABEL_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 지금 점 — 곡선 위에서 부피를 따라간다. ----
  out.push({
    type: 'body',
    id: 'point-now',
    pos: [gx(g.vRatio), gy(g.pRatio)],
    shape: 'circle',
    size: POINT_RADIUS,
    outline: 'background',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
