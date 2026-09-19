// ========================================================================
// optical-fiber — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 왼쪽은 섬유 — 옅은 클래딩 띠 속에 조금 짙은 코어 띠, 그 속을 먹색 한 줄기가 되튀며 나아간다.
// 아래는 「입사각 부채」 — 코어 벽 위 한 점에 튄 자리마다의 입사각을 참 각도 그대로
// 옮겨 긋는다. 섬유 크기에서는 82.8° 와 80.6° 가 구별되지 않아 부채에서 크게 보인다(NOTES (b)).
//
// 줄기는 역할 색 `ink` 로 긋는다. 주장은 빛의 **경로**(벽에서 되튀는가 새는가)이지 밝기가 아니다 —
// 빛 채널의 흰 줄기는 라이트 바탕에서 사라진다(G92).
//
// 색: 줄기 · 부채의 입사각 선은 먹색, 코어는 옅은 보조색, 클래딩 · 벽 · 법선은 옅은 먹색.
// 강조색은 **임계각** 한 가지 뜻에만 쓴다 — 부채의 임계각 선과 그 글자.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { DEG, cutPath, derive, fiberLength, fiberPoint, fiberShape, readConstants, traceFiber } from './physics';
import {
  FAN_CENTER,
  FAN_CLAD_H,
  FAN_CORE_H,
  FAN_LEAK_LEN,
  FAN_NORMAL,
  FAN_R,
  FAN_WALL_LEFT,
  FAN_WALL_RIGHT,
  SCENE_BOUNDS,
  text,
  type OpticalFiberMessageKey,
} from './schema';
import type { OpticalFiberState } from './state';

/** 선 굵기(화면 px) — 줄기 · 벽 · 클래딩 테 · 부채 선 · 임계각 선. */
const RAY_WIDTH_PX = 2.5;
const WALL_WIDTH_PX = 1;
const FAN_LINE_PX = 1.5;
const CRITICAL_PX = 2;
/** 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 불투명도 — 코어 · 클래딩 채움, 지난 부채 선, 클래딩 테. */
const CORE_FILL = 0.3;
const CLAD_FILL = 0.14;
/** 부채의 코어 띠는 섬유보다 옅게 — 그 위에 얹는 임계각 너머 띠가 읽히도록. */
const FAN_CORE_FILL = 0.12;
const BAND_FILL = 0.3;
const OLD_LINE_OPACITY = 0.4;
const RIM_OPACITY = 0.6;
/** 가운데 선을 표본하는 점 수 (곡선 어휘가 없다 — G28). */
const FIBER_SAMPLES = 160;
/** 줄기 머리 화살표 길이(월드). */
const ARROW_LEN = 0.45;
/** 가장 최근에 튄 자리를 두르는 고리 반지름(월드). */
const RING_R = 0.2;
/** 광원 몸통 크기(월드) · 들머리에서 왼쪽으로 떨어진 거리. */
const SOURCE_SIZE: Vec2 = [0.36, 0.5];
const SOURCE_GAP = 0.3;
/** 부채 이름표 띄움(화면 px) — 선 위 · 선 아래 · 옆. */
const LABEL_ABOVE: Vec2 = [0, -8];
const LABEL_BELOW: Vec2 = [0, 16];
const LABEL_SIDE: Vec2 = [8, 0];

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const guide = { colorRole: 'muted', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
const coreStyle = { colorRole: 'secondary', emphasis: 'medium' } as const;

const dirOf = (a: number): Vec2 => [Math.cos(a), Math.sin(a)];
const along = (p: Vec2, d: Vec2, r: number): Vec2 => [p[0] + d[0] * r, p[1] + d[1] * r];

function label(
  id: string,
  key: OpticalFiberMessageKey,
  world: Vec2,
  opts: { vars?: Record<string, string>; offset?: Vec2; align?: Readout['align']; role?: 'ink' | 'accent' | 'muted' },
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world, ...(opts.offset ? { offset: opts.offset } : {}) },
    text: text(key),
    ...(opts.vars ? { vars: opts.vars } : {}),
    chip: false,
    font: 'text',
    align: opts.align ?? 'left',
    fontSize: LABEL_PX,
    style: { colorRole: opts.role ?? 'ink', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: OpticalFiberState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('optical-fiber: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const f = fiberShape(c, [0, 0], r.radius);
  const g: Primitive[] = [];

  // ---- 섬유 — 클래딩 띠 위에 코어 띠 ----
  const L = fiberLength(f);
  const band = (s: number): Vec2[] => {
    const pts: Vec2[] = [];
    for (let i = 0; i <= FIBER_SAMPLES; i++) pts.push(fiberPoint(f, (L * i) / FIBER_SAMPLES, s));
    return pts;
  };
  const coreL = band(c.coreHalf);
  const coreR = band(-c.coreHalf);
  const cladL = band(c.cladHalf);
  const cladR = band(-c.cladHalf);
  g.push({
    type: 'region',
    id: 'cladding',
    points: [...cladL, ...cladR.slice().reverse()],
    fillOpacity: CLAD_FILL,
    style: guide,
  });
  g.push({
    type: 'region',
    id: 'core',
    points: [...coreL, ...coreR.slice().reverse()],
    fillOpacity: CORE_FILL,
    style: coreStyle,
  });
  g.push({ type: 'trajectory', id: 'wall-left', points: coreL, width: WALL_WIDTH_PX, style: guide });
  g.push({ type: 'trajectory', id: 'wall-right', points: coreR, width: WALL_WIDTH_PX, style: guide });
  g.push({ type: 'trajectory', id: 'rim-left', points: cladL, width: WALL_WIDTH_PX, opacity: RIM_OPACITY, style: guide });
  g.push({ type: 'trajectory', id: 'rim-right', points: cladR, width: WALL_WIDTH_PX, opacity: RIM_OPACITY, style: guide });

  // ---- 광원 — 들머리 왼쪽 ----
  g.push({
    type: 'body',
    id: 'source',
    pos: [-SOURCE_GAP, c.launchOffset],
    shape: 'rect',
    size: SOURCE_SIZE,
    glow: false,
    style: ink,
  });

  // ---- 입사각 부채 — 바탕(코어 띠 · 클래딩 띠 · 벽 · 법선 · 띠 · 임계각 선) ----
  const o: Vec2 = [FAN_CENTER[0], FAN_CENTER[1]];
  const up = Math.PI / 2;
  const critical = c.criticalDeg * DEG;
  g.push({
    type: 'region',
    id: 'fan-core',
    points: [
      [o[0] - FAN_WALL_LEFT, o[1]],
      [o[0] + FAN_WALL_RIGHT, o[1]],
      [o[0] + FAN_WALL_RIGHT, o[1] + FAN_CORE_H],
      [o[0] - FAN_WALL_LEFT, o[1] + FAN_CORE_H],
    ],
    fillOpacity: FAN_CORE_FILL,
    style: coreStyle,
  });
  g.push({
    type: 'region',
    id: 'fan-clad',
    points: [
      [o[0] - FAN_WALL_LEFT, o[1]],
      [o[0] + FAN_WALL_RIGHT, o[1]],
      [o[0] + FAN_WALL_RIGHT, o[1] - FAN_CLAD_H],
      [o[0] - FAN_WALL_LEFT, o[1] - FAN_CLAD_H],
    ],
    fillOpacity: CLAD_FILL,
    style: guide,
  });
  // 임계각 너머 띠 — 임계각 선에서 벽까지. 여기 드는 선은 되튄다.
  g.push({
    type: 'sector',
    id: 'fan-band',
    center: o,
    radius: FAN_R,
    from: up - critical,
    to: 0,
    fillOpacity: BAND_FILL,
    rimWidth: 0,
    style: guide,
  });
  g.push({
    type: 'trajectory',
    id: 'fan-wall',
    points: [
      [o[0] - FAN_WALL_LEFT, o[1]],
      [o[0] + FAN_WALL_RIGHT, o[1]],
    ],
    width: WALL_WIDTH_PX,
    style: guide,
  });
  g.push({
    type: 'trajectory',
    id: 'fan-normal',
    points: [o, along(o, dirOf(up), FAN_NORMAL)],
    width: WALL_WIDTH_PX,
    style: { ...guide, lineStyle: 'dashed' },
  });
  g.push({
    type: 'trajectory',
    id: 'fan-critical',
    points: [o, along(o, dirOf(up - critical), FAN_R)],
    width: CRITICAL_PX,
    style: accent,
  });

  // ---- 광선 ----
  const path = traceFiber(f, c);
  const s = r.reveal * path.total;
  const cut = cutPath(path, s);
  const rayOn = r.rayOpacity > 0;
  if (rayOn && s > 0) {
    g.push({ type: 'trajectory', id: 'ray', points: cut.core, width: RAY_WIDTH_PX, opacity: r.rayOpacity, style: ink });
    if (cut.leak) {
      g.push({ type: 'trajectory', id: 'ray-leak', points: cut.leak, width: RAY_WIDTH_PX, opacity: r.rayOpacity, style: ink });
    }
    // 머리 화살표 — 지금 나아가는 방향.
    const tail = cut.leak ? cut.leak[0] : cut.core[cut.core.length - 2];
    if (tail) {
      const dx = cut.head[0] - tail[0];
      const dy = cut.head[1] - tail[1];
      const len = Math.hypot(dx, dy);
      if (len > 1e-6) {
        const k = Math.min(ARROW_LEN, len) / len;
        g.push({
          type: 'vector',
          id: 'ray-head',
          from: [cut.head[0] - dx * k, cut.head[1] - dy * k],
          delta: [dx * k, dy * k],
          width: RAY_WIDTH_PX,
          opacity: r.rayOpacity,
          style: ink,
        });
      }
    }
  }

  // ---- 튄 자리와 부채의 입사각 선 — 빛이 닿은 자리까지만 ----
  const reached = rayOn ? path.bounces.filter((b) => b.at <= s + 1e-9) : [];
  reached.forEach((b, i) => {
    const latest = i === reached.length - 1;
    const op = r.rayOpacity * (latest ? 1 : OLD_LINE_OPACITY);
    g.push({
      type: 'trajectory',
      id: `fan-line-${i}`,
      points: [o, along(o, dirOf(up - b.incidence), FAN_R)],
      width: FAN_LINE_PX,
      opacity: op,
      style: ink,
    });
    if (b.leaks) {
      // 새어 나간 빛 — 클래딩 쪽(왼쪽 아래)으로 꺾여 나간다(굴절각은 굴절률에서).
      const t = Math.asin(Math.min(1, (c.nCore / c.nClad) * Math.sin(b.incidence)));
      const d = dirOf(-up - t);
      g.push({
        type: 'vector',
        id: 'fan-leak',
        from: o,
        delta: [d[0] * FAN_LEAK_LEN, d[1] * FAN_LEAK_LEN],
        width: FAN_LINE_PX,
        opacity: r.rayOpacity,
        style: ink,
      });
    }
    if (latest) {
      g.push({
        type: 'body',
        id: 'bounce-ring',
        pos: b.pos,
        shape: 'circle',
        size: RING_R,
        fill: 'none',
        outline: 'role',
        glow: false,
        opacity: r.rayOpacity,
        style: ink,
      });
    }
  });

  // ---- 부채 이름표 ----
  const wallLeft: Vec2 = [o[0] - FAN_WALL_LEFT, o[1]];
  const wallRight: Vec2 = [o[0] + FAN_WALL_RIGHT, o[1]];
  g.push(label('fan-core-name', 'label.core', wallLeft, { vars: { n: state.coreIndexText }, offset: LABEL_ABOVE, role: 'muted' }));
  g.push(label('fan-clad-name', 'label.clad', wallLeft, { vars: { n: state.cladIndexText }, offset: LABEL_BELOW, role: 'muted' }));
  g.push(label('fan-normal-name', 'label.normal', along(o, dirOf(up), FAN_NORMAL), { offset: LABEL_SIDE, role: 'muted' }));
  g.push(
    label('fan-critical-name', 'label.critical', along(o, dirOf(up - critical), FAN_R), {
      vars: { deg: state.criticalText },
      offset: LABEL_SIDE,
      align: 'left',
      role: 'accent',
    }),
  );
  g.push(label('fan-title', 'label.fan', wallRight, { offset: LABEL_BELOW, align: 'right', role: 'muted' }));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
