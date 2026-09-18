// ========================================================================
// binding-energy-curve — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음.
//
// 곡선 판 — 축은 `trajectory` 한 줄 + 축 이름 `readout` 둘(장부 G47), 곡선은 핵종 표본을
// 잇는 `trajectory`. 핵은 `body` 점, 핵종 표기 ᴬX 는 `readout` 둘(위 첨자 A · 기호, 장부 G115).
//
// 두 길 — 왼쪽에서 수소 넷이 모여 ⁴He 로 오르고(융합), 오른쪽에서 ²³⁵U 가 둘로 갈라져
// ¹⁴¹Ba · ⁹²Kr 로 오른다(분열). 곡선 아래의 먹색 화살표 둘이 모두 철을 가리킨다.
//
// 색 — 곡선 · 핵 · 두 길 화살표는 먹(`ink`), 축 · 처음 높이 선 · 지나온 길은 회색(`muted`).
// 강조색(`accent`)은 「나오는 에너지」 한 뜻에만 쓴다: 처음 높이에서 오른 높이까지 세운 화살표.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
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
  curveAt,
  curvePoints,
  nuclide,
  nuclidePoint,
  plotPoint,
  readConstants,
  type BindingEnergyCurveConstants,
} from './physics';
import {
  FISSION_FROM,
  FISSION_TO,
  FISSION_WAY_A,
  FUSION_FROM,
  FUSION_TO,
  FUSION_WAY_A,
  GATHER_RADIUS,
  NOTATIONS,
  PEAK,
  PLOT,
  SCENE_BOUNDS,
  WAY_DROP,
  text,
  type BindingEnergyCurveMessageKey,
} from './schema';
import type { BindingEnergyCurveState } from './state';

// ------------------------------------------------------------------------
// 위계 — 화면 px 이거나 월드 길이
// ------------------------------------------------------------------------

/** 축 · 곡선 · 처음 높이 선 · 지나온 길 · 철의 점선 굵기(화면 px). */
const AXIS_PX = 1;
const CURVE_PX = 2.5;
const LEVEL_PX = 1;
const PATH_PX = 1;
const DIVIDER_PX = 1;
/** 두 길 화살표 · 오른 높이 화살표 굵기(화면 px). */
const WAY_PX = 2.5;
const RISE_PX = 3;
/** 핵 점 반지름(월드). */
const DOT_R = 0.075;
/** 꼭짓점 표지(속 빈 원) 반지름(월드). */
const PEAK_R = 0.09;
/** 분열 순간 두 점이 벌어지는 거리(월드). */
const SPLIT_GAP = 0.2;
/** 글자 크기(화면 px). */
const AXIS_LABEL_PX = 12;
const SYMBOL_PX = 16;
const SCRIPT_PX = 10;
const WAY_LABEL_PX = 14;
const ENERGY_PX = 13;
const PEAK_PX = 13;
/** 위 첨자 A 를 기호 왼쪽 위에 붙이는 띄움(화면 px). */
const SCRIPT_DX = -1;
const SCRIPT_DY = -7;
/** 축 이름이 축 끝에서 떨어지는 거리(화면 px). */
const AXIS_LABEL_GAP = 12;
/** 두 길 이름이 화살표 가운데에서 떨어지는 거리(화면 px). */
const WAY_LABEL_GAP = 16;
/** 「에너지」 글자가 오른 높이 화살표에서 떨어지는 거리(화면 px). */
const ENERGY_LABEL_DX = 8;
/** 분열의 「에너지」 글자가 처음 높이 선 아래로 떨어지는 거리(화면 px). */
const ENERGY_BELOW_DY = 14;
/** 꼭짓점 높이 글자가 철의 점에서 떨어지는 거리(화면 px). */
const PEAK_LABEL_OFFSET: Vec2 = [22, -16];
/** 처음 높이 선 · 지나온 길 · 철의 점선 짙기. */
const GUIDE_OPACITY = 0.7;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const ACCENT = { colorRole: 'accent', emphasis: 'strong' } as const;

const lerp = (a: number, b: number, u: number): number => a + (b - a) * u;
const lerp2 = (p: Vec2, q: Vec2, u: number): Vec2 => [lerp(p[0], q[0], u), lerp(p[1], q[1], u)];

function dot(id: string, pos: Vec2, opacity: number, out: Primitive[]): void {
  if (opacity <= 0) return;
  const b: Body = {
    type: 'body',
    id,
    shape: 'circle',
    pos,
    size: DOT_R,
    outline: 'background',
    glow: false,
    opacity,
    style: INK,
  };
  out.push(b);
}

function label(
  id: string,
  key: BindingEnergyCurveMessageKey,
  anchor: Readout['anchor'],
  fontSize: number,
  align: 'left' | 'center' | 'right',
  opacity: number,
  style: Readout['style'],
  vars?: Record<string, string | number>,
): Readout {
  return {
    type: 'readout',
    id,
    anchor,
    text: text(key),
    ...(vars ? { vars } : {}),
    chip: false,
    font: 'text',
    align,
    fontSize,
    opacity,
    style,
  };
}

/** 핵종 표기 ᴬX — 점에서 화면 px 로 띄운 자리. */
function notation(nuclideId: string, k: BindingEnergyCurveConstants, opacity: number, out: Primitive[]): void {
  if (opacity <= 0) return;
  const def = NOTATIONS.find((n) => n.nuclide === nuclideId);
  if (!def) return;
  const at = nuclidePoint(nuclideId, k);
  const [dx, dy] = def.offset;
  out.push(
    label(`${nuclideId}-mass`, 'label.value', { world: at, offset: [dx + SCRIPT_DX, dy + SCRIPT_DY] }, SCRIPT_PX, 'right', opacity, INK, {
      v: nuclide(nuclideId).massNumber,
    }),
  );
  out.push(label(`${nuclideId}-symbol`, def.symbol, { world: at, offset: [dx, dy] }, SYMBOL_PX, 'left', opacity, INK));
}

/** 처음 높이에서 지금 높이까지 세운 강조색 화살표 — 오른 만큼 나오는 에너지. */
function rise(id: string, x: number, fromY: number, toY: number, opacity: number, out: Primitive[]): void {
  const h = toY - fromY;
  if (opacity <= 0 || h <= 0) return;
  const v: Vector = {
    type: 'vector',
    id,
    from: [x, fromY],
    delta: [0, h],
    width: RISE_PX,
    opacity,
    style: ACCENT,
  };
  out.push(v);
}

/** 곡선 아래에서 철을 가리키는 두 길 화살표. `grow` 만큼 자란다. */
function way(
  id: string,
  aRange: readonly [number, number],
  name: BindingEnergyCurveMessageKey,
  grow: number,
  opacity: number,
  k: BindingEnergyCurveConstants,
  out: Primitive[],
): void {
  if (grow <= 0 || opacity <= 0) return;
  const p = plotPoint(aRange[0], curveAt(aRange[0], k));
  const q = plotPoint(aRange[1], curveAt(aRange[1], k));
  const from: Vec2 = [p[0], p[1] - WAY_DROP];
  const to: Vec2 = [q[0], q[1] - WAY_DROP];
  const arrow: Vector = {
    type: 'vector',
    id,
    from,
    delta: [(to[0] - from[0]) * grow, (to[1] - from[1]) * grow],
    width: WAY_PX,
    opacity,
    style: INK,
  };
  out.push(arrow);
  const mid = lerp2(from, to, 0.5);
  out.push(label(`${id}-name`, name, { world: mid, offset: [0, WAY_LABEL_GAP] }, WAY_LABEL_PX, 'center', opacity * grow, INK));
}

export function scene(params: {
  state: BindingEnergyCurveState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl } = params;
  if (!tl) throw new Error('binding-energy-curve: schema.timeline 이 선언되어야 한다');
  const k = readConstants(params.stage);

  const gather = tl.at('gather');
  const fuse = tl.at('fuse');
  const fuseWay = tl.at('fuse-way');
  const split = tl.at('split');
  const fission = tl.at('fission');
  const fissionWay = tl.at('fission-way');
  const meet = tl.at('meet');
  const clear = tl.at('clear');
  const renew = tl.at('renew');
  const keep = 1 - clear;
  const out: Primitive[] = [];

  // ================= 곡선 판 =================
  const origin: Vec2 = [PLOT.axisX, 0];
  const yTop = PLOT.axisTopMeV * PLOT.perMeV;
  const xEnd = PLOT.axisEndA * PLOT.perA;
  const axes: Trajectory = {
    type: 'trajectory',
    id: 'axes',
    points: [[origin[0], yTop], origin, [xEnd, 0]],
    width: AXIS_PX,
    style: MUTED,
  };
  out.push(axes);
  out.push(label('axis-binding', 'label.axisBinding', { world: [origin[0], yTop], offset: [0, -AXIS_LABEL_GAP] }, AXIS_LABEL_PX, 'left', 1, MUTED));
  out.push(label('axis-mass', 'label.axisMass', { world: [xEnd, 0], offset: [0, AXIS_LABEL_GAP] }, AXIS_LABEL_PX, 'right', 1, MUTED));

  // 철의 자리 — 두 길이 만나는 곳. 가로축에서 꼭짓점까지 세운 점선과 높이.
  const peak = nuclidePoint(PEAK, k);
  const show = meet * keep;
  if (show > 0) {
    const divider: Trajectory = {
      type: 'trajectory',
      id: 'peak-divider',
      points: [[peak[0], 0], [peak[0], peak[1] - PEAK_R]],
      width: DIVIDER_PX,
      opacity: GUIDE_OPACITY * show,
      style: { ...MUTED, lineStyle: 'dashed' },
    };
    out.push(divider);
  }

  const curve: Trajectory = {
    type: 'trajectory',
    id: 'binding-curve',
    points: curvePoints(k),
    width: CURVE_PX,
    style: INK,
  };
  out.push(curve);

  // ================= 두 길 화살표 — 곡선 아래에서 철을 가리킨다 =================
  way('fusion-way', FUSION_WAY_A, 'label.fusion', fuseWay, keep, k, out);
  way('fission-way', FISSION_WAY_A, 'label.fission', fissionWay, keep, k, out);

  // ================= 융합 — 수소 넷이 모여 헬륨으로 오른다 =================
  const h = nuclidePoint(FUSION_FROM, k);
  const he = nuclidePoint(FUSION_TO, k);
  if (fuse <= 0) {
    // 흩어진 수소가 모여든다. 다음 주기의 수소도 같은 자리에서 나타난다.
    const spread = GATHER_RADIUS * (1 - gather);
    for (let i = 0; i < k.fuseCount; i++) {
      const ang = Math.PI / 4 + (2 * Math.PI * i) / k.fuseCount;
      dot(`hydrogen-${i}`, [h[0] + spread * Math.cos(ang), h[1] + spread * Math.sin(ang)], 1, out);
    }
  } else {
    const pos = lerp2(h, he, fuse);
    rise('fusion-rise', pos[0], h[1], pos[1] - DOT_R, keep, out);
    if (keep > 0) {
      out.push(
        label('fusion-energy', 'label.energy', { world: [pos[0], lerp(h[1], pos[1], 0.5)], offset: [ENERGY_LABEL_DX, 0] }, ENERGY_PX, 'left', keep, ACCENT),
      );
    }
    dot('helium', pos, keep, out);
    // 다음 주기의 수소 넷 — 흩어진 자리에 선다.
    for (let i = 0; i < k.fuseCount; i++) {
      const ang = Math.PI / 4 + (2 * Math.PI * i) / k.fuseCount;
      dot(`hydrogen-next-${i}`, [h[0] + GATHER_RADIUS * Math.cos(ang), h[1] + GATHER_RADIUS * Math.sin(ang)], renew, out);
    }
  }

  // ================= 분열 — 우라늄이 둘로 갈라져 오른다 =================
  const u = nuclidePoint(FISSION_FROM, k);
  if (split <= 0) {
    dot('uranium', u, 1, out);
  } else {
    // 처음 높이 선 — 우라늄의 높이. 두 조각이 이 선에서 얼마나 올랐는지 잰다.
    const leftMost = Math.min(...FISSION_TO.map((id) => nuclidePoint(id, k)[0]));
    const level: Trajectory = {
      type: 'trajectory',
      id: 'fission-level',
      points: [u, [leftMost, u[1]]],
      width: LEVEL_PX,
      opacity: GUIDE_OPACITY * split * keep,
      style: { ...MUTED, lineStyle: 'dashed' },
    };
    out.push(level);

    FISSION_TO.forEach((id, i) => {
      const target = nuclidePoint(id, k);
      // 갈라지는 순간 — 곡선에 수직으로 조금 벌어진다(위 · 아래).
      const side = i === 0 ? 1 : -1;
      const start: Vec2 = [u[0], u[1] + side * SPLIT_GAP * split];
      const pos = lerp2(start, target, fission);
      if (fission > 0) {
        const path: Trajectory = {
          type: 'trajectory',
          id: `fission-path-${id}`,
          points: [u, pos],
          width: PATH_PX,
          opacity: GUIDE_OPACITY * keep,
          style: { ...MUTED, lineStyle: 'dotted' },
        };
        out.push(path);
        rise(`fission-rise-${id}`, pos[0], u[1], pos[1] - DOT_R, keep, out);
      }
      dot(`fragment-${id}`, pos, keep, out);
    });
    if (fission > 0 && keep > 0) {
      // 「에너지」 는 첫 조각(무거운 쪽) 화살표 밑, 처음 높이 선 아래에 하나만.
      const first = lerp2([u[0], u[1] + SPLIT_GAP], nuclidePoint(FISSION_TO[0], k), fission);
      out.push(
        label('fission-energy', 'label.energy', { world: [first[0], u[1]], offset: [0, ENERGY_BELOW_DY] }, ENERGY_PX, 'center', keep * fission, ACCENT),
      );
    }
    dot('uranium-next', u, renew, out);
  }

  // ================= 이름표 =================
  notation(FUSION_FROM, k, 1, out);
  notation(FUSION_TO, k, 1, out);
  notation(FISSION_FROM, k, 1, out);
  // 조각 이름표는 도착한 뒤에 뜬다 — 가는 동안 빈 자리에 이름만 떠 있으면 점과 떨어져 읽힌다.
  for (const id of FISSION_TO) notation(id, k, fissionWay * keep, out);

  // 꼭짓점 — 속 빈 원 · 이름표 · 높이.
  const mark: Body = {
    type: 'body',
    id: 'peak-mark',
    shape: 'circle',
    pos: peak,
    size: PEAK_R,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: INK,
  };
  out.push(mark);
  notation(PEAK, k, 1, out);
  if (show > 0) {
    out.push(label('peak-height', 'label.peak', { world: peak, offset: PEAK_LABEL_OFFSET }, PEAK_PX, 'left', show, INK, { e: k.peakMeV }));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
