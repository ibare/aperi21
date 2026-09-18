// ========================================================================
// gears — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 기어는 `body` custom(SVG 경로) — 톱니 사다리꼴 테두리와
// 덜어 낸 구멍을 경로 하나에 담고 `orientation` 으로 돌린다. 지난 톱니는 같은 자리 ·
// 같은 각에 톱니만 담은 경로를 하나 더 겹친다. 접점의 힘은 `vector`, 팔은 `dimension`,
// 돌림힘은 원호(`trajectory`) + 촉(`region` 삼각형), 이름표는 `readout`.
//
// 색: 두 기어 · 축은 먹색(같은 장치). 강조색은 **맞물린 자리를 지난 톱니** 한 가지
// 뜻에만 쓴다. 두 힘 F 는 같은 크기의 같은 종류라 같은 색(primary), 돌림힘 화살표는
// 보조색(secondary), 팔 치수선은 무채색.
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
import { derive, pitchRadius, readConstants, type Reading } from './physics';
import {
  ADDENDUM,
  AXLE_R,
  AXLE_Y,
  BIG_HOLE_CHOICES,
  DEDENDUM,
  FORCE_GAP,
  FORCE_LEN,
  HUB_HOLE,
  PAIR_MID_X,
  SCENE_BOUNDS,
  SMALL_HOLES,
  TOOTH_HALF_ROOT,
  TOOTH_HALF_TIP,
  TORQUE_GAP,
  TORQUE_SWEEP_PER_UNIT,
  text,
} from './schema';
import type { GearsState } from './state';

/** 기어 옅은 면의 짙기. 윤곽이 모양을 말하고, 면은 「속이 찬 판」 이라는 것만 말한다. */
const FACE_OPACITY = 0.1;
/** 톱니 수 이름표 · 지나간 톱니 줄을 기어 아래 끝에서 띄우는 거리(화면 px). */
const TEETH_LABEL_OFFSET: Vec2 = [0, 16];
const PASSED_LABEL_OFFSET: Vec2 = [0, 35];
/** 팔 이름표를 치수선 위로 올리는 거리(화면 px). */
const ARM_LABEL_OFFSET: Vec2 = [0, -11];
/** 돌림힘 화살촉의 길이 · 반폭(월드). */
const TORQUE_HEAD_LEN = 0.085;
const TORQUE_HEAD_HALF = 0.05;
/** 원호를 표본하는 간격(라디안). */
const ARC_STEP = Math.PI / 48;
/** 구멍 원을 표본하는 점 수. */
const HOLE_SEGMENTS = 28;
/** 돌림힘 이름표를 원호 바깥으로 띄우는 거리(월드). */
const TORQUE_LABEL_GAP = 0.14;
/** 힘 이름표를 화살 끝에서 띄우는 거리(화면 px). */
const FORCE_LABEL_OFFSET = 12;

// ------------------------------------------------------------------------
// 기어 모양 — 기어 자기 좌표(중심 원점, y 위)의 경로
// ------------------------------------------------------------------------

interface GearGeom {
  teeth: number;
  /** 피치 · 이뿌리 · 이끝 반지름. */
  r: number;
  root: number;
  tip: number;
  /** 톱니 하나의 각 간격. */
  pitch: number;
  /** 톱니 중심 각(기어 자기 좌표). */
  toothAngle(j: number): number;
}

const polar = (rad: number, a: number): Vec2 => [rad * Math.cos(a), rad * Math.sin(a)];
const fmt = (v: number): string => v.toFixed(4);

/** 톱니 하나의 네 꼭짓점 — 이뿌리 왼쪽 · 이끝 왼쪽 · 이끝 오른쪽 · 이뿌리 오른쪽 (반시계). */
function toothCorners(g: GearGeom, c: number, m: number): Vec2[] {
  const hr = (TOOTH_HALF_ROOT * m) / g.root;
  const ht = (TOOTH_HALF_TIP * m) / g.tip;
  return [polar(g.root, c - hr), polar(g.tip, c - ht), polar(g.tip, c + ht), polar(g.root, c + hr)];
}

function ring(points: readonly Vec2[]): string {
  const [first, ...rest] = points;
  if (!first) return '';
  return `M ${fmt(first[0])} ${fmt(first[1])} ${rest.map((p) => `L ${fmt(p[0])} ${fmt(p[1])}`).join(' ')} Z`;
}

/** 원 하나를 **시계 방향**으로 — 바깥 테두리(반시계)와 감긴 방향이 반대라 구멍이 된다. */
function hole(cx: number, cy: number, rad: number): string {
  const pts: Vec2[] = [];
  for (let i = 0; i < HOLE_SEGMENTS; i++) {
    const a = -(2 * Math.PI * i) / HOLE_SEGMENTS;
    pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
  }
  return ring(pts);
}

/** 기어 전체 — 톱니 테두리 + 축 구멍 + 덜어 낸 구멍. */
function gearPath(g: GearGeom, m: number, holes: number): string {
  const outline: Vec2[] = [];
  for (let j = 0; j < g.teeth; j++) outline.push(...toothCorners(g, g.toothAngle(j), m));
  // 톱니 각은 반시계로 늘어나도록 정렬돼 있어야 테두리가 꼬이지 않는다.
  const parts = [ring(outline), hole(0, 0, HUB_HOLE)];
  const ringR = (HUB_HOLE + g.root) / 2;
  const holeR = Math.min(0.34 * (g.root - HUB_HOLE), 0.55 * ringR * Math.sin(Math.PI / holes));
  for (let i = 0; i < holes; i++) {
    const [hx, hy] = polar(ringR, (2 * Math.PI * (i + 0.5)) / holes);
    parts.push(hole(hx, hy, holeR));
  }
  return parts.join(' ');
}

/** 고른 톱니만 — 톱니마다 닫힌 사다리꼴. */
function teethPath(g: GearGeom, m: number, angles: readonly number[]): string {
  return angles.map((a) => ring(toothCorners(g, a, m))).join(' ');
}

function geom(teeth: number, r: number, m: number, toothAngle: (j: number) => number): GearGeom {
  return {
    teeth,
    r,
    root: r - DEDENDUM * m,
    tip: r + ADDENDUM * m,
    pitch: (2 * Math.PI) / teeth,
    toothAngle,
  };
}

/** 기어비 k 를 이름표 글자로. 1.5 는 그대로, 정수는 소수점 없이. */
function ratioText(k: number): string {
  return Number.isInteger(k) ? String(k) : k.toFixed(1);
}

/** 중심 c · 반지름 rad 의 원호. from → to 로 (각이 줄면 시계 방향). */
function arc(c: Vec2, rad: number, from: number, to: number): Vec2[] {
  const n = Math.max(2, Math.ceil(Math.abs(to - from) / ARC_STEP));
  const pts: Vec2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    pts.push([c[0] + rad * Math.cos(a), c[1] + rad * Math.sin(a)]);
  }
  return pts;
}

/** 원호 끝의 화살촉 — 끝점에서 접선 방향으로 뾰족한 삼각형. */
function arcHead(c: Vec2, rad: number, end: number, dir: 1 | -1): Vec2[] {
  const tip: Vec2 = [c[0] + rad * Math.cos(end), c[1] + rad * Math.sin(end)];
  // 접선(도는 방향) 단위 벡터와 바깥 법선.
  const tx = -Math.sin(end) * dir;
  const ty = Math.cos(end) * dir;
  const nx = Math.cos(end);
  const ny = Math.sin(end);
  const bx = tip[0] - tx * TORQUE_HEAD_LEN;
  const by = tip[1] - ty * TORQUE_HEAD_LEN;
  return [
    [tip[0] + tx * 0.01, tip[1] + ty * 0.01],
    [bx + nx * TORQUE_HEAD_HALF, by + ny * TORQUE_HEAD_HALF],
    [bx - nx * TORQUE_HEAD_HALF, by - ny * TORQUE_HEAD_HALF],
  ];
}

export function scene(params: {
  state: GearsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('gears: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const n1 = c.smallTeeth;
  const n2 = params.state.bigTeeth;
  const m = c.module;
  const r: Reading = derive(timeline, c, n2);

  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const force = { colorRole: 'primary', emphasis: 'strong' } as const;
  const torque = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  // ---- 배치 — 접점 xc 에서 두 피치 원이 맞닿는다. 묶음 전체가 가운데 서도록 옮긴다 ----
  const r1 = pitchRadius(n1, c);
  const r2 = pitchRadius(n2, c);
  const xc = PAIR_MID_X - r2 + r1;
  const c1: Vec2 = [xc - r1, AXLE_Y];
  const c2: Vec2 = [xc + r2, AXLE_Y];
  const contact: Vec2 = [xc, AXLE_Y];

  // 작은 기어: 톱니 0 이 접점(각 0)을 향한다. 큰 기어: 접점(각 π)에 톱니 사이 골이 온다.
  const small = geom(n1, r1, m, (j) => j * ((2 * Math.PI) / n1));
  const p2 = (2 * Math.PI) / n2;
  const big = geom(n2, r2, m, (j) => Math.PI + (j + 0.5) * p2);

  const smallPath = gearPath(small, m, SMALL_HOLES);
  // 이음매 없는 주기 — 작은 기어 두 바퀴 동안 큰 기어가 구멍 간격의 배수만큼 돌아야 한다.
  const bigHoles = BIG_HOLE_CHOICES.find((h) => (2 * n1 * h) % n2 === 0) ?? BIG_HOLE_CHOICES[0];
  const bigPath = gearPath(big, m, bigHoles);

  // 이번 주기에 접점을 지난 톱니. 작은 기어는 톱니 0, 1, 2 … 순으로(시계 방향으로 돌아
  // 위에서 내려온다), 큰 기어는 접점 바로 위 톱니부터(반시계로 돌아 위에서 내려온다).
  const passedSmall: number[] = [];
  for (let j = 0; j < r.passedSmall; j++) passedSmall.push(j * small.pitch);
  const passedBig: number[] = [];
  for (let i = 0; i < r.passedBig; i++) passedBig.push(Math.PI - (i + 0.5) * big.pitch);

  const gears = [
    { id: 'small', center: c1, path: smallPath, angle: r.angleSmall, geo: small, passed: passedSmall },
    { id: 'big', center: c2, path: bigPath, angle: r.angleBig, geo: big, passed: passedBig },
  ] as const;

  // ---- 기어 — 옅은 면 · 지난 톱니 · 윤곽 (쓴 순서대로 겹친다) ----
  for (const gear of gears) {
    g.push({
      type: 'body',
      id: `${gear.id}-face`,
      pos: gear.center,
      shape: 'custom',
      customPath: gear.path,
      orientation: gear.angle,
      outline: 'none',
      opacity: FACE_OPACITY,
      style: ink,
    });
  }
  for (const gear of gears) {
    if (gear.passed.length === 0 || r.countOpacity <= 0) continue;
    g.push({
      type: 'body',
      id: `${gear.id}-passed`,
      pos: gear.center,
      shape: 'custom',
      customPath: teethPath(gear.geo, m, gear.passed),
      orientation: gear.angle,
      outline: 'none',
      opacity: r.countOpacity,
      style: accent,
    });
  }
  for (const gear of gears) {
    g.push({
      type: 'body',
      id: `${gear.id}-outline`,
      pos: gear.center,
      shape: 'custom',
      customPath: gear.path,
      orientation: gear.angle,
      fill: 'none',
      outline: 'role',
      style: ink,
    });
    g.push({
      type: 'body',
      id: `${gear.id}-axle`,
      pos: gear.center,
      shape: 'circle',
      size: AXLE_R,
      glow: false,
      outline: 'none',
      style: ink,
    });
  }

  // ---- 톱니 수 — 원인이라 늘 보인다 ----
  // 윗줄은 원인(톱니 수)이라 늘 보이고, 아랫줄은 이번 주기에 지나간 톱니 수다 — 세는 동안
  // 두 기어에서 같이 늘고, 다 세고 나면 둘 다 작은 기어 톱니 수에서 멈춘다.
  const labels = [
    { id: 'small', center: c1, tip: small.tip, n: n1, passed: r.passedSmall },
    { id: 'big', center: c2, tip: big.tip, n: n2, passed: r.passedBig },
  ] as const;
  for (const l of labels) {
    const at: Vec2 = [l.center[0], l.center[1] - l.tip];
    g.push({
      type: 'readout',
      id: `${l.id}-teeth`,
      anchor: { world: at, offset: TEETH_LABEL_OFFSET },
      text: text('label.teeth'),
      vars: { n: l.n },
      chip: false,
      font: 'text',
      fontSize: 13,
      align: 'center',
      style: muted,
    });
    if (r.countOpacity > 0) {
      g.push({
        type: 'readout',
        id: `${l.id}-passed-count`,
        anchor: { world: at, offset: PASSED_LABEL_OFFSET },
        text: text('label.passed'),
        vars: { p: l.passed },
        chip: false,
        font: 'text',
        fontSize: 13,
        weight: 'bold',
        align: 'center',
        opacity: r.countOpacity,
        style: accent,
      });
    }
  }

  // ---- 힘 · 팔 · 돌림힘 ----
  const op = r.forceOpacity;
  if (op > 0) {
    const k = ratioText(r.ratio);

    // 팔 — 축에서 접점까지. 큰 기어 쪽이 k 배 길다. 치수선 글자는 작은 고정 글꼴이라
    // 기어 몸 위에서 묻혀, 이름표를 따로 두고 치수선은 선만 쓴다.
    const arms = [
      { id: 'small', from: c1, to: contact, label: text('label.armSmall'), vars: undefined },
      { id: 'big', from: contact, to: c2, label: text('label.armBig'), vars: { k } },
    ] as const;
    for (const a of arms) {
      g.push({
        type: 'dimension',
        id: `arm-${a.id}`,
        from: a.from,
        to: a.to,
        opacity: op,
        style: muted,
      });
      g.push({
        type: 'readout',
        id: `arm-${a.id}-name`,
        anchor: { world: [(a.from[0] + a.to[0]) / 2, a.from[1]], offset: ARM_LABEL_OFFSET },
        text: a.label,
        ...(a.vars ? { vars: a.vars } : {}),
        chip: true,
        font: 'text',
        fontSize: 14,
        italic: true,
        align: 'center',
        opacity: op,
        style: ink,
      });
    }

    // 접점의 두 힘 — 크기가 같고 방향이 반대. 작은 기어가 큰 기어의 톱니를 도는 쪽(아래)으로
    // 밀고, 큰 기어는 같은 크기로 되민다(위). 한 줄에 겹치지 않게 좌우로 조금 벌린다.
    // 두 피치 원의 공통 접선을 따라가므로 화살은 곧 기어 밖으로 나간다. 이름표는 화살
    // 끝에 둔다 — 화살 옆은 어느 쪽이든 톱니 위다.
    const forces = [
      { id: 'on-big', x: contact[0] + FORCE_GAP, dy: -FORCE_LEN, off: FORCE_LABEL_OFFSET },
      { id: 'on-small', x: contact[0] - FORCE_GAP, dy: FORCE_LEN, off: -FORCE_LABEL_OFFSET },
    ] as const;
    for (const f of forces) {
      g.push({
        type: 'vector',
        id: `force-${f.id}`,
        from: [f.x, contact[1]],
        delta: [0, f.dy],
        opacity: op,
        outline: 'background',
        style: force,
      });
      g.push({
        type: 'readout',
        id: `force-${f.id}-name`,
        anchor: { world: [f.x, contact[1] + f.dy], offset: [0, f.off] },
        text: text('label.force'),
        chip: false,
        font: 'text',
        fontSize: 14,
        italic: true,
        align: 'center',
        opacity: op,
        style: force,
      });
    }

    // 돌림힘 — 이끝 원 바깥의 굽은 화살표. 쓸린 각이 돌림힘에 비례한다(τ 하나에 60°).
    // 작은 기어는 시계 방향(모터가 돌리는 쪽), 큰 기어는 반시계(접점의 힘이 돌리는 쪽).
    // 맞물린 자리와 아래 이름표를 피하는 자리에서 출발한다 — 작은 기어는 왼쪽 위에서,
    // 큰 기어는 오른쪽 아래에서 위로.
    const torques = [
      { id: 'small', center: c1, rad: small.tip + TORQUE_GAP, from: (160 * Math.PI) / 180, dir: -1 as const, sweep: TORQUE_SWEEP_PER_UNIT, label: text('label.torqueSmall') },
      { id: 'big', center: c2, rad: big.tip + TORQUE_GAP, from: (-40 * Math.PI) / 180, dir: 1 as const, sweep: TORQUE_SWEEP_PER_UNIT * r.ratio, label: text('label.torqueBig') },
    ];
    for (const t of torques) {
      const end = t.from + t.dir * t.sweep;
      // 원호는 촉 밑동까지만 — 끝까지 그으면 선이 촉 끝으로 삐져나온다.
      const lineEnd = end - (t.dir * TORQUE_HEAD_LEN * 0.8) / t.rad;
      g.push({
        type: 'trajectory',
        id: `torque-${t.id}-arc`,
        points: arc(t.center, t.rad, t.from, lineEnd),
        width: 2,
        opacity: op,
        style: torque,
      });
      g.push({
        type: 'region',
        id: `torque-${t.id}-head`,
        points: arcHead(t.center, t.rad, end, t.dir),
        fillOpacity: 1,
        opaque: true,
        opacity: op,
        style: torque,
      });
      // 이름표는 원호 한가운데 바깥에.
      const mid = t.from + (t.dir * t.sweep) / 2;
      g.push({
        type: 'readout',
        id: `torque-${t.id}-name`,
        anchor: { world: polarAt(t.center, t.rad + TORQUE_LABEL_GAP, mid) },
        text: t.label,
        ...(t.id === 'big' ? { vars: { k } } : {}),
        chip: false,
        font: 'text',
        fontSize: 14,
        italic: true,
        align: 'center',
        opacity: op,
        style: torque,
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

function polarAt(c: Vec2, rad: number, a: number): Vec2 {
  return [c[0] + rad * Math.cos(a), c[1] + rad * Math.sin(a)];
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
