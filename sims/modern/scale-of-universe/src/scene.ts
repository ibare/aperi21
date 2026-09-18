// ========================================================================
// scale-of-universe — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 틀 · 10배 겹 정사각(trajectory closed),
// 대상(body · particleSystem · body custom), 사다리(lineSet), 이름표(readout), 틀의 치수선
// (dimension)이 모두 표준 어휘로 있다.
//
// 카메라를 움직이지 않는다. 틀은 늘 같은 자리 · 같은 크기이고, 대상의 크기만 10^(e − z) 로 바뀐다.
//
// 색은 뜻마다 하나다 — **강조색은 「지금 배율」 한 가지 뜻에만**(사다리 위 표지) 쓴다. 대상의 윤곽 ·
// 점 · 틀은 먹색, 채움 · 흩뿌린 점은 secondary, 10배 겹 · 사다리 눈금은 배경 정보라 muted.
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
  atomCloud,
  frameExponent,
  galaxyStars,
  overallAlpha,
  readConstants,
  relativeSize,
  rungs,
  universeGalaxies,
  type Rung,
  type ScaleOfUniverseConstants,
} from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { ScaleOfUniverseState } from './state';

// ------------------------------------------------------------------------
// 배치 (월드)
// ------------------------------------------------------------------------

/** 틀의 가운데와 반변. 대상은 모두 이 가운데에 놓인다. */
const FRAME_CENTER: Vec2 = [-1.35, 0.2];
const FRAME_HALF = 1.5;
/** 틀 아래 치수선을 내리는 깊이. */
const DIM_DROP = 0.24;
/** 사다리 — 세로선의 x 와 아래(가장 작은 지수) · 위(가장 큰 지수) 끝. */
const LADDER_X = 2.35;
const LADDER_BOTTOM = -1.3;
const LADDER_TOP = 1.45;
/** 10의 거듭제곱 한 칸 눈금 · 대상 단 눈금의 반길이. */
const TICK_SHORT = 0.05;
const TICK_LONG = 0.13;
/** 이름표를 단 눈금 끝에서 띄우는 거리. */
const LABEL_DX = 0.12;
/** 「한 칸 = ×10」 표식을 사다리 위 끝에서 올리는 거리. */
const STEP_LABEL_DY = 0.26;
/** 지금 배율 표지 — 사다리를 가로지르는 막대의 반길이. 단 눈금보다 길고 이름표에는 닿지 않는다. */
const MARKER_HALF = 0.16;

// ------------------------------------------------------------------------
// 모양 (대상 반지름에 대한 비)
// ------------------------------------------------------------------------

/** 세포핵 반지름 비와 세포 가운데에서 비킨 자리. */
const CELL_NUCLEUS_SHARE = 0.3;
const CELL_NUCLEUS_SHIFT: Vec2 = [0.18, 0.1];
/** 점이 된 대상의 반지름 비 — 렌더러의 최소 반지름(2px)에 닿으면 그 크기로 남는다. */
const DOT_SHARE = 0.5;

/**
 * 사람 윤곽 — 단위 좌표(발 −1 · 정수리 1, y 위). 몸통 다각형과 머리 원.
 * 지름 = 키라 머리 끝과 발끝이 틀 위아래에 닿는다.
 */
const PERSON_BODY: readonly Vec2[] = [
  [-0.07, 0.56], [0.07, 0.56], [0.3, 0.5], [0.36, 0.0], [0.28, -0.02], [0.23, 0.33],
  [0.2, -0.05], [0.2, -1.0], [0.05, -1.0], [0.0, -0.22], [-0.05, -1.0], [-0.2, -1.0],
  [-0.2, -0.05], [-0.23, 0.33], [-0.28, -0.02], [-0.36, 0.0], [-0.3, 0.5],
];
const PERSON_HEAD_CENTER: Vec2 = [0, 0.8];
const PERSON_HEAD_RADIUS = 0.19;
/** 경로 문자열 자릿수. 화면 글자가 아니라 SVG 경로 좌표다. */
const PATH_DIGITS = 5;

// ------------------------------------------------------------------------
// 선 · 글자 · 점 · 짙기
// ------------------------------------------------------------------------

const FRAME_WIDTH = 1.6;
const SQUARE_WIDTH = 1;
const SQUARE_OPACITY = 0.8;
const LADDER_WIDTH = 1;
const RUNG_WIDTH = 1.4;
const MARKER_WIDTH = 3;
const LABEL_PX = 12;
const SIZE_PX = 11;
const STEP_PX = 11;
const OBJECT_LABEL_PX = 12;
/** 줄어드는 대상 이름표를 대상 오른쪽 위로 띄우는 거리(화면 px). */
const OBJECT_LABEL_OFFSET: Vec2 = [10, -10];
const ATOM_DOT_PX = 1.6;
const GALAXY_STAR_PX = 1.3;
const UNIVERSE_DOT_PX = 1.4;
/** 지나온 · 아직 안 온 단 이름표의 짙기. 지금 단은 1. */
const IDLE_RUNG_OPACITY = 0.7;

// ------------------------------------------------------------------------
// 보임 — ρ = log₁₀(대상 지름 ÷ 틀 한 변) = e − z 의 함수. 표현의 문턱이지 물리량이 아니다.
// ------------------------------------------------------------------------

/** 틀보다 큰 대상이 들어오기 시작하는 ρ · 다 들어온 ρ. 틀 모서리에 윤곽이 닿는 것이 ρ ≈ 0.15. */
const RHO_ENTER_START = 0.25;
const RHO_ENTER_FULL = 0.05;
/** 줄어든 대상이 점으로만 남기 시작하는 ρ · 점마저 사라지는 ρ. */
const RHO_DOT = -1.8;
const RHO_GONE = -3.0;
/** 점 표지가 켜지는 ρ 구간. 모양이 알아볼 수 없게 작아지는 자리다. */
const RHO_DOT_ON_START = -1.0;
const RHO_DOT_ON_FULL = -1.5;
/** 줄어드는 대상 옆 이름표가 켜지는 ρ 구간 — 틀을 채우는 동안은 사다리 이름표로 충분하다. */
const RHO_LABEL_START = -0.3;
const RHO_LABEL_FULL = -0.6;
/** 10배 겹 정사각 — 몇 겹까지 그리는가, 옅어지기 시작 · 사라지는 ρ. */
const SQUARE_LAYERS = 4;
const RHO_SQUARE_FADE = -1.5;
const RHO_SQUARE_GONE = -3.0;

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** 0 → 1 로 오르는 구간 [a, b] 의 진행도 (a > b 도 된다 — 줄어드는 쪽으로 오른다). */
function ramp(x: number, a: number, b: number): number {
  return clamp01((x - a) / (b - a));
}

/** 대상이 틀 안에 보이는 정도. 들어오며 나타나고, 점이 된 뒤 사라진다. */
function presence(rho: number): number {
  return ramp(rho, RHO_ENTER_START, RHO_ENTER_FULL) * ramp(rho, RHO_GONE, RHO_DOT);
}

function frameClip(): { min: Vec2; max: Vec2 } {
  return {
    min: [FRAME_CENTER[0] - FRAME_HALF, FRAME_CENTER[1] - FRAME_HALF],
    max: [FRAME_CENTER[0] + FRAME_HALF, FRAME_CENTER[1] + FRAME_HALF],
  };
}

function square(half: number): Vec2[] {
  const [cx, cy] = FRAME_CENTER;
  return [
    [cx - half, cy - half],
    [cx + half, cy - half],
    [cx + half, cy + half],
    [cx - half, cy + half],
  ];
}

function ladderY(exp: number, list: readonly Rung[]): number {
  const lo = list[0]!.exp;
  const hi = list[list.length - 1]!.exp;
  return LADDER_BOTTOM + ((exp - lo) / (hi - lo)) * (LADDER_TOP - LADDER_BOTTOM);
}

function num(x: number): string {
  return x.toFixed(PATH_DIGITS);
}

/** 사람 윤곽 SVG 경로 — pos 기준 월드 단위, y 위. 반지름 s 로 늘린다. */
function personPath(s: number): string {
  const body = PERSON_BODY.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${num(x * s)} ${num(y * s)}`).join(' ');
  const hx = PERSON_HEAD_CENTER[0] * s;
  const hy = PERSON_HEAD_CENTER[1] * s;
  const r = PERSON_HEAD_RADIUS * s;
  const head =
    `M${num(hx + r)} ${num(hy)} ` +
    `A${num(r)} ${num(r)} 0 1 0 ${num(hx - r)} ${num(hy)} ` +
    `A${num(r)} ${num(r)} 0 1 0 ${num(hx + r)} ${num(hy)} Z`;
  return `${body} Z ${head}`;
}

function scaled(points: readonly Vec2[], s: number): Vec2[] {
  const [cx, cy] = FRAME_CENTER;
  return points.map(([x, y]) => [cx + x * s, cy + y * s] as Vec2);
}

/** 대상 하나의 모양. s 는 반지름(월드), a 는 불투명도. */
function objectShapes(
  r: Rung,
  s: number,
  a: number,
  c: ScaleOfUniverseConstants,
  clip: { min: Vec2; max: Vec2 },
): Primitive[] {
  const pos = FRAME_CENTER;
  const out: Primitive[] = [];
  switch (r.id) {
    case 'atom':
      out.push({
        type: 'particleSystem',
        id: 'atom-cloud',
        positions: scaled(atomCloud(c), s),
        sizes: ATOM_DOT_PX,
        opacity: a,
        clip,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
      out.push({
        type: 'body',
        id: 'atom-shell',
        pos,
        shape: 'circle',
        size: s,
        fill: 'none',
        outline: 'role',
        glow: false,
        opacity: a,
        clip,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      out.push({
        type: 'body',
        id: 'atom-nucleus',
        pos,
        shape: 'circle',
        size: s * c.nucleusShare,
        outline: 'none',
        glow: false,
        opacity: a,
        clip,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      break;
    case 'cell':
      out.push({
        type: 'body',
        id: 'cell-membrane',
        pos,
        shape: 'circle',
        size: s,
        fill: 'none',
        outline: 'role',
        glow: false,
        opacity: a,
        clip,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      out.push({
        type: 'body',
        id: 'cell-nucleus',
        pos: [pos[0] + CELL_NUCLEUS_SHIFT[0] * s, pos[1] + CELL_NUCLEUS_SHIFT[1] * s],
        shape: 'circle',
        size: s * CELL_NUCLEUS_SHARE,
        outline: 'none',
        glow: false,
        opacity: a,
        clip,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
      break;
    case 'person':
      out.push({
        type: 'body',
        id: 'person',
        pos,
        shape: 'custom',
        customPath: personPath(s),
        opacity: a,
        clip,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      break;
    case 'earth':
      out.push({
        type: 'body',
        id: 'earth',
        pos,
        shape: 'circle',
        size: s,
        outline: 'none',
        glow: false,
        opacity: a,
        clip,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
      break;
    case 'solar': {
      const outer = c.orbitsAu[c.orbitsAu.length - 1]!;
      c.orbitsAu.forEach((au, i) => {
        out.push({
          type: 'body',
          id: `solar-orbit-${i}`,
          pos,
          shape: 'circle',
          size: (s * au) / outer,
          fill: 'none',
          outline: 'role',
          glow: false,
          opacity: a,
          clip,
          style: { colorRole: 'muted', emphasis: 'strong' },
        });
      });
      out.push({
        type: 'body',
        id: 'solar-sun',
        pos,
        shape: 'circle',
        size: s * c.sunShare,
        outline: 'none',
        glow: false,
        opacity: a,
        clip,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      break;
    }
    case 'galaxy':
      out.push({
        type: 'particleSystem',
        id: 'galaxy-stars',
        positions: scaled(galaxyStars(c), s),
        sizes: GALAXY_STAR_PX,
        opacity: a,
        clip,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
      break;
    case 'universe':
      out.push({
        type: 'particleSystem',
        id: 'universe-galaxies',
        positions: scaled(universeGalaxies(c), s),
        sizes: UNIVERSE_DOT_PX,
        opacity: a,
        clip,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
      out.push({
        type: 'body',
        id: 'universe-horizon',
        pos,
        shape: 'circle',
        size: s,
        fill: 'none',
        outline: 'role',
        glow: false,
        opacity: a,
        clip,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      break;
  }
  return out;
}

export function scene(params: {
  state: ScaleOfUniverseState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('scale-of-universe: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const list = rungs(c);
  const z = frameExponent(timeline, list);
  const alpha = overallAlpha(timeline);
  const out: Primitive[] = [];
  if (alpha <= 0) return out;
  const clip = frameClip();

  // ---- 대상 — 틀 × 10^(e − z). 들어오며 나타나고, 점이 되어 사라진다 ----
  for (const r of list) {
    const rho = r.exp - z;
    const a = presence(rho) * alpha;
    if (a <= 0) continue;
    const s = FRAME_HALF * relativeSize(r.exp, z);
    out.push(...objectShapes(r, s, a, c, clip));
    // 모양을 알아볼 수 없게 작아지면 점 하나로 남는다.
    const dot = ramp(rho, RHO_DOT_ON_START, RHO_DOT_ON_FULL);
    if (dot > 0) {
      out.push({
        type: 'body',
        id: `${r.id}-dot`,
        pos: FRAME_CENTER,
        shape: 'circle',
        size: s * DOT_SHARE,
        outline: 'none',
        glow: false,
        opacity: dot * a,
        clip,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
    // 줄어드는 대상 옆 이름표 — 방금 틀을 채우던 그것이 점이 되는 것을 따라간다.
    const la = ramp(rho, RHO_LABEL_START, RHO_LABEL_FULL) * a;
    if (la > 0) {
      const d = s * Math.SQRT1_2;
      out.push({
        type: 'readout',
        id: `${r.id}-tag`,
        anchor: { world: [FRAME_CENTER[0] + d, FRAME_CENTER[1] + d], offset: OBJECT_LABEL_OFFSET },
        text: text(r.name),
        font: 'text',
        chip: false,
        align: 'left',
        fontSize: OBJECT_LABEL_PX,
        opacity: la,
        clip,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  }

  // ---- 10배 겹 정사각 — 틀 한 변의 1/10 · 1/100 … 한 칸 물러날 때마다 한 겹씩 안으로 ----
  // 대상 위에 긋는다 — 아래에 두면 세포핵 같은 채움에 반쯤 가려 잘린 조각처럼 보인다(첫 촬영).
  const top = Math.floor(z);
  for (let k = top; k > top - SQUARE_LAYERS; k--) {
    const rho = k - z;
    const a = ramp(rho, RHO_SQUARE_GONE, RHO_SQUARE_FADE);
    if (a <= 0) continue;
    out.push({
      type: 'trajectory',
      id: `decade-${k}`,
      points: square(FRAME_HALF * relativeSize(k, z)),
      closed: true,
      width: SQUARE_WIDTH,
      opacity: SQUARE_OPACITY * a * alpha,
      style: { colorRole: 'muted', emphasis: 'medium' },
    });
  }

  // ---- 틀 — 한 변이 10^z m. 늘 같은 자리 · 같은 크기 ----
  out.push({
    type: 'trajectory',
    id: 'frame',
    points: square(FRAME_HALF),
    closed: true,
    width: FRAME_WIDTH,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 틀의 치수선 — 대상에 머무는 동안만. 물러나는 중의 한 변은 사다리 표지가 말한다 ----
  // 페이드 없이 단계 경계에서 켜고 끈다 — 단계 안을 코드 상수 비율로 가르지 않는다 (S-piece).
  const holding = list.find((r) => timeline.phase === r.hold);
  if (holding) {
    const y = FRAME_CENTER[1] - FRAME_HALF - DIM_DROP;
    out.push({
      type: 'dimension',
      id: 'frame-side',
      from: [FRAME_CENTER[0] - FRAME_HALF, y],
      to: [FRAME_CENTER[0] + FRAME_HALF, y],
      text: text(holding.size),
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 사다리 — 한 칸 = 10배. 가장 작은 단에서 가장 큰 단까지 ----
  const lo = list[0]!.exp;
  const hi = list[list.length - 1]!.exp;
  const decadeTicks: Vec2[][] = [[[LADDER_X, LADDER_BOTTOM], [LADDER_X, LADDER_TOP]]];
  for (let k = lo; k <= hi; k++) {
    const y = ladderY(k, list);
    decadeTicks.push([[LADDER_X - TICK_SHORT, y], [LADDER_X + TICK_SHORT, y]]);
  }
  out.push({
    type: 'lineSet',
    id: 'ladder',
    lines: decadeTicks,
    width: LADDER_WIDTH,
    opacity: alpha,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'lineSet',
    id: 'ladder-rungs',
    lines: list.map((r) => {
      const y = ladderY(r.exp, list);
      return [[LADDER_X - TICK_LONG, y], [LADDER_X + TICK_LONG, y]] as Vec2[];
    }),
    width: RUNG_WIDTH,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  for (const r of list) {
    const y = ladderY(r.exp, list);
    const on = holding?.id === r.id ? 1 : IDLE_RUNG_OPACITY;
    const role = holding?.id === r.id ? 'ink' : 'muted';
    out.push({
      type: 'readout',
      id: `rung-name-${r.id}`,
      anchor: { world: [LADDER_X - TICK_LONG - LABEL_DX, y] },
      text: text(r.name),
      font: 'text',
      chip: false,
      align: 'right',
      fontSize: LABEL_PX,
      opacity: on * alpha,
      style: { colorRole: role, emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `rung-size-${r.id}`,
      anchor: { world: [LADDER_X + TICK_LONG + LABEL_DX, y] },
      text: text(r.size),
      // 고정폭 글꼴은 위 첨자 숫자를 한 칸씩 벌려 `10²¹` 이 `10² ¹` 로 읽힌다(첫 촬영, 장부 G149 와 같은 부류).
      font: 'text',
      chip: false,
      align: 'left',
      fontSize: SIZE_PX,
      opacity: on * alpha,
      style: { colorRole: role, emphasis: 'strong' },
    });
  }
  out.push({
    type: 'readout',
    id: 'ladder-step',
    anchor: { world: [LADDER_X, LADDER_TOP + STEP_LABEL_DY] },
    text: text('label.step'),
    font: 'mono',
    chip: false,
    fontSize: STEP_PX,
    opacity: alpha,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 지금 배율 — 사다리 위를 한 칸씩 오르는 막대 ----
  const my = ladderY(z, list);
  out.push({
    type: 'lineSet',
    id: 'zoom-marker',
    lines: [[[LADDER_X - MARKER_HALF, my], [LADDER_X + MARKER_HALF, my]]],
    width: MARKER_WIDTH,
    opacity: alpha,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
