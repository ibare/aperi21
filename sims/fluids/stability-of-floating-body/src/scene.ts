// ========================================================================
// stability-of-floating-body — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
// 물(scalarField — 깊을수록 짙게) · 선체(region) · 잠긴 단면 빗금(lineSet) · 윤곽 · 갑판
// (trajectory) · 수압 분포(region 면마다 + lineSet 화살) · 부심 자취(trajectory) · 두 작용선
// (점선 trajectory) · 짝힘(lineSet 막대 + sector 호 + region 화살촉) · 부심 · 무게중심(body +
// readout) · 수면(trajectory) · 배 이름(readout).
//
// 강조색(accent)은 짝힘 하나에만 쓴다. 물 · 부력 쪽은 모두 같은 파랑(secondary), 무게는 먹(ink).
// ========================================================================

import type {
  Body,
  LineSet,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  ScalarField,
  Sector,
  TimelineFrame,
  Trajectory,
  Vec2,
} from '@aperi21/schema';

import { dimsOf, pose } from './physics';
import { CENTERS, DRAW, HULLS, PX, SCENE_BOUNDS, WORLD, text } from './schema';
import type { HullState, StabilityOfFloatingBodyState } from './state';

const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];

/**
 * 볼록 다각형(반시계) 안에 드는 기울기 +1 직선 `x − y = k` 의 구간. 원본은 캔버스 clip 으로
 * 사선을 잘랐다 — 여기서는 사선마다 양 끝을 계산해 선 묶음으로 넘긴다.
 */
function clipDiagonal(poly: readonly Vec2[], k: number): [Vec2, Vec2] | null {
  let s0 = -Infinity;
  let s1 = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    const ex = b[0] - a[0];
    const ey = b[1] - a[1];
    // 안쪽 조건: cross(e, p − a) ≥ 0, p(s) = (k + s, s)
    const c0 = ex * (0 - a[1]) - ey * (k - a[0]);
    const c1 = ex * 1 - ey * 1;
    if (Math.abs(c1) < 1e-12) {
      if (c0 < 0) return null;
      continue;
    }
    const s = -c0 / c1;
    if (c1 > 0) s0 = Math.max(s0, s);
    else s1 = Math.min(s1, s);
  }
  if (!(s1 > s0)) return null;
  return [
    [k + s0, s0],
    [k + s1, s1],
  ];
}

/** 원본 캔버스의 사선 위치(`x = cx − 3·S − 200 + 7n` 을 지나 45° 로 오른다)를 월드 k 로. */
function hatchLines(cx: number, sub: readonly Vec2[]): Vec2[][] {
  const lines: Vec2[][] = [];
  if (sub.length < 3) return lines;
  const spacing = DRAW.hatchSpacingPx * PX;
  // 원본 사선은 수면 아래 2 m(200 px) 점 x = cx − 5 + 0.07n 에서 출발한다: x − y = cx − 3 + 0.07n.
  for (let n = -40; cx - 3 + spacing * n < cx + 5; n++) {
    const seg = clipDiagonal(sub, cx - 3 + spacing * n);
    if (seg) lines.push([seg[0], seg[1]]);
  }
  return lines;
}

/** 한 배를 선언한다. 원본 `drawHull` 의 순서 그대로. */
function hullScene(index: number, h: HullState, zg: number, alpha: number): Primitive[] {
  const cx = CENTERS[index]!;
  const d = dimsOf(index, zg);
  const p = pose(d, h.th);
  const at = (v: Vec2): Vec2 => [cx + v[0], v[1]];
  const poly = p.poly.map(at);
  const sub = p.sub.map(at);
  const G: Vec2 = [cx, p.gy];
  const B: Vec2 = at(p.B);
  const id = HULLS[index]!.id;
  const out: Primitive[] = [];

  // ---- 선체 단면 ----
  const hull: Region = {
    type: 'region',
    id: `${id}-hull`,
    points: poly,
    opaque: true,
    fillOpacity: 0.22,
    opacity: alpha,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  out.push(hull);

  // ---- 잠긴 단면(밀어낸 물의 모양) — 채움 색이 아닌 결로 가른다 ----
  const hatch: LineSet = {
    type: 'lineSet',
    id: `${id}-submerged`,
    lines: hatchLines(cx, sub),
    width: DRAW.hatchPx,
    opacity: alpha * DRAW.hatchOpacity,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
  out.push(hatch);

  // ---- 선체 윤곽 · 갑판 ----
  const outline: Trajectory = {
    type: 'trajectory',
    id: `${id}-outline`,
    points: poly,
    closed: true,
    width: DRAW.hullStrokePx,
    opacity: alpha,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(outline);
  const deck: Trajectory = {
    type: 'trajectory',
    id: `${id}-deck`,
    points: [poly[2]!, poly[3]!],
    width: DRAW.deckPx,
    opacity: alpha,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(deck);

  // ---- 선체를 누르는 수압 분포 — 면마다 분포 도형 + 바깥에서 면을 수직으로 누르는 화살 ----
  const arrows: Vec2[][] = [];
  for (let i = 0; i < p.poly.length; i++) {
    const a = p.poly[i]!;
    const b = p.poly[(i + 1) % p.poly.length]!;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = -(b[1] - a[1]) / len; // 안쪽 법선
    const ny = (b[0] - a[0]) / len;
    const N = Math.max(2, Math.round(len / DRAW.pressureSample));
    const base: Vec2[] = [];
    const tips: Vec2[] = [];
    for (let j = 0; j <= N; j++) {
      const u = j / N;
      const q: Vec2 = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
      if (q[1] > 1e-6) continue;
      const depth = -q[1];
      base.push(at(q));
      tips.push(at([q[0] - nx * depth * DRAW.pressureK, q[1] - ny * depth * DRAW.pressureK]));
    }
    if (base.length < 2) continue;
    const face: Region = {
      type: 'region',
      id: `${id}-pressure-${i}`,
      points: [...base, ...tips.slice().reverse()],
      fillOpacity: DRAW.pressureFillOpacity,
      opacity: alpha,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    };
    out.push(face);
    const back = DRAW.pressureHeadBackPx * PX;
    const half = DRAW.pressureHeadHalfPx * PX;
    for (let m = 0; m < base.length; m++) {
      const L = Math.hypot(tips[m]![0] - base[m]![0], tips[m]![1] - base[m]![1]);
      if (L < DRAW.pressureMinPx * PX) continue;
      arrows.push([tips[m]!, base[m]!]);
      // 화살촉 — 안쪽(nx, ny)을 향한 꺾쇠 두 획.
      arrows.push([
        add(base[m]!, [-back * nx - half * ny, -back * ny + half * nx]),
        base[m]!,
        add(base[m]!, [-back * nx + half * ny, -back * ny - half * nx]),
      ]);
    }
  }
  const pressureArrows: LineSet = {
    type: 'lineSet',
    id: `${id}-pressure-arrows`,
    lines: arrows,
    width: 1,
    opacity: alpha * DRAW.pressureLineOpacity,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
  out.push(pressureArrows);

  // ---- 부심 자취 — 몸체 좌표로 쌓은 점을 지금 자세로 돌려 놓는다 ----
  if (h.trail.length >= 2) {
    const c = Math.cos(h.th);
    const s = Math.sin(h.th);
    const trail: Trajectory = {
      type: 'trajectory',
      id: `${id}-trail`,
      points: h.trail.map(([bx, by]) => at([c * bx - s * by, p.gy + s * bx + c * by])),
      width: DRAW.trailPx,
      opacity: alpha * DRAW.trailOpacity,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    };
    out.push(trail);
  }

  // ---- 중력 작용선 · 부력 작용선 ----
  const gravityLine: Trajectory = {
    type: 'trajectory',
    id: `${id}-gravity-line`,
    points: [G, [G[0], DRAW.gravityLineTo]],
    width: DRAW.actionLinePx,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
  };
  out.push(gravityLine);
  const buoyLine: Trajectory = {
    type: 'trajectory',
    id: `${id}-buoyancy-line`,
    points: [B, [B[0], G[1] + DRAW.buoyLineAboveG]],
    width: DRAW.actionLinePx,
    opacity: alpha,
    style: { colorRole: 'secondary', emphasis: 'strong', lineStyle: 'dashed' },
  };
  out.push(buoyLine);

  // ---- 되세우거나 넘기는 짝힘 — 팔 막대 + 무게중심을 도는 굽은 화살 ----
  const gapPx = (B[0] - G[0]) / PX;
  if (Math.abs(gapPx) >= DRAW.coupleMinPx) {
    const y = G[1] + DRAW.coupleBarAboveG;
    const tick = DRAW.coupleTickPx * PX;
    const bar: LineSet = {
      type: 'lineSet',
      id: `${id}-couple-bar`,
      lines: [
        [[G[0], y], [B[0], y]],
        [[G[0], y - tick], [G[0], y + tick]],
        [[B[0], y - tick], [B[0], y + tick]],
      ],
      width: DRAW.couplePx,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(bar);

    // 원본은 화면 각(y 아래)으로 위쪽(−π/2)을 가운데 둔 호를 그었다. 월드 각은 부호만 뒤집힌다.
    // 부심이 오른쪽이면 반시계 — 세계에서도 화면에서도 반시계다.
    const ccw = gapPx > 0;
    const span = Math.min(1.9, 0.5 + Math.abs(gapPx) / 18);
    const from = Math.PI / 2 - (ccw ? span / 2 : -span / 2);
    const to = ccw ? from + span : from - span;
    const R = DRAW.coupleArcPx * PX;
    const arc: Sector = {
      type: 'sector',
      id: `${id}-couple-arc`,
      center: G,
      radius: R,
      from,
      to,
      fillOpacity: 0,
      rimWidth: DRAW.couplePx,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(arc);
    // 화살촉 — 호 끝에서 도는 방향(접선)으로 뾰족한 채운 삼각형.
    const e: Vec2 = [G[0] + R * Math.cos(to), G[1] + R * Math.sin(to)];
    const t: Vec2 = ccw ? [-Math.sin(to), Math.cos(to)] : [Math.sin(to), -Math.cos(to)];
    const nrm: Vec2 = [-t[1], t[0]];
    const tip = DRAW.coupleHeadTipPx * PX;
    const back = DRAW.coupleHeadBackPx * PX;
    const half = DRAW.coupleHeadHalfPx * PX;
    const head: Region = {
      type: 'region',
      id: `${id}-couple-head`,
      points: [
        [e[0] + t[0] * tip, e[1] + t[1] * tip],
        [e[0] - t[0] * back + nrm[0] * half, e[1] - t[1] * back + nrm[1] * half],
        [e[0] - t[0] * back - nrm[0] * half, e[1] - t[1] * back - nrm[1] * half],
      ],
      fillOpacity: 1,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(head);
  }

  // ---- 부심 ----
  const buoy: Body = {
    type: 'body',
    id: `${id}-buoyancy`,
    pos: B,
    shape: 'circle',
    size: DRAW.buoyRadiusPx * PX,
    outline: 'background',
    glow: false,
    opacity: alpha,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
  out.push(buoy);
  const buoyLabel: Readout = {
    type: 'readout',
    id: `${id}-buoyancy-label`,
    anchor: { world: B, offset: [0, DRAW.buoyLabelDyPx] },
    text: text('label.buoyancy'),
    chip: false,
    font: 'text',
    fontSize: DRAW.labelFontPx,
    opacity: alpha,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
  out.push(buoyLabel);

  // ---- 무게중심 — 테두리 원 + 가운데 점 ----
  const gRing: Body = {
    type: 'body',
    id: `${id}-gravity`,
    pos: G,
    shape: 'circle',
    size: DRAW.gRadiusPx * PX,
    fill: 'none',
    outline: 'role',
    glow: false,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(gRing);
  const gDot: Body = {
    type: 'body',
    id: `${id}-gravity-dot`,
    pos: G,
    shape: 'circle',
    size: DRAW.gDotPx * PX,
    outline: 'none',
    glow: false,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(gDot);
  const gLabel: Readout = {
    type: 'readout',
    id: `${id}-gravity-label`,
    anchor: { world: G, offset: [DRAW.gLabelDxPx, 0] },
    text: text('label.gravity'),
    chip: false,
    font: 'text',
    align: 'right',
    fontSize: DRAW.labelFontPx,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(gLabel);

  return out;
}

/** 원본 흐려짐 — 주기 끝 0.3 초에 사라지고, 다음 주기 첫 0.3 초에 돌아온다(첫 주기는 제외). */
function fadeAlpha(tl: TimelineFrame): number {
  const vanish = 1 - tl.at('vanish');
  const appear = tl.cycle > 0 ? tl.at('appear') : 1;
  return Math.max(0, Math.min(vanish, appear));
}

export function scene(params: {
  state: StabilityOfFloatingBodyState;
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('stability-of-floating-body: schema.timeline 이 선언되어야 한다');
  const alpha = fadeAlpha(timeline);
  const out: Primitive[] = [];

  // ---- 물 — 깊을수록 짙다(깊이에 비례하는 수압) ----
  const rows = DRAW.waterRows;
  const values: number[] = [];
  for (let r = 0; r < rows; r++) {
    const depth = ((r + 0.5) / rows) * -WORLD.waterBottom;
    values.push(depth, depth);
  }
  const water: ScalarField = {
    type: 'scalarField',
    id: 'water',
    min: [0, WORLD.waterBottom],
    max: [WORLD.width, 0],
    cols: 2,
    rows,
    values,
    range: DRAW.waterRange,
    colors: { high: 'secondary' },
  };
  out.push(water);

  state.hulls.forEach((h, i) => out.push(...hullScene(i, h, state.zgApplied, alpha)));

  // ---- 수면 ----
  const surface: Trajectory = {
    type: 'trajectory',
    id: 'surface',
    points: [
      [0, 0],
      [WORLD.width, 0],
    ],
    width: DRAW.surfacePx,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
  out.push(surface);

  // ---- 배 이름 ----
  HULLS.forEach((hull, i) => {
    const name: Readout = {
      type: 'readout',
      id: `${hull.id}-name`,
      anchor: { world: [CENTERS[i]!, DRAW.nameY] },
      text: text(hull.id === 'wide' ? 'label.wide' : 'label.narrow'),
      vars: { w: hull.w.toFixed(1) },
      chip: false,
      font: 'text',
      fontSize: DRAW.nameFontPx,
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    out.push(name);
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계. 매 프레임 같아야 카메라가 흔들리지 않는다.
  return { ...SCENE_BOUNDS };
}
