// ========================================================================
// laser-and-stimulated-emission — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 거울 · 매질 띠(region) · 들뜬 원자
// (particleSystem 속 찬 점) · 바닥 원자(trace 고리) · 유도 방출 순간의 고리(trace ring) ·
// 광자 물결(lineSet) · 이름표(readout) · 지시 점선(trajectory) 이 모두 표준 어휘로 있다.
//
// 색 — 거울 · 매질 · 글자는 무채색 역할(muted), 원자는 먹(ink). 들뜸과 바닥은 **색이 아니라
// 속이 찼는가 · 비었는가**로 가른다. 강조색은 쓰지 않는다. **빛만 빛의 색이다** — 633 nm 의
// 색을 빛 채널로 칠한다. 모든 광자가 같은 색이다 — 같은 파장이기 때문이다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LineSet,
  ParticleSystem,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  atoms,
  chain,
  exitS,
  foldX,
  headS,
  laneWave,
  laneY,
  outerLaneY,
  photonLight,
  readConstants,
  seedLane,
  type LaserConstants,
} from './physics';
import { SCENE_BOUNDS, text, type LaserAndStimulatedEmissionMessageKey } from './schema';
import type { LaserAndStimulatedEmissionState } from './state';

/** 매질 띠가 바깥 길 너머로 더 나가는 여백(월드). */
const BAND_PAD = 0.95;
/** 매질 띠 채움 짙기. 원자 · 물결이 그 위에 또렷하도록 옅게. */
const BAND_OPACITY = 0.14;
/** 거울 두께(월드) · 매질 띠 위아래로 더 나가는 길이(월드). */
const MIRROR_THICK = 0.55;
const MIRROR_OVERHANG = 0.5;
/** 거울 짙기 — 온 거울은 짙게, 일부 통과 거울은 옅게(빛이 빠져나간다). */
const MIRROR_OPACITY = 0.9;
const OUTPUT_MIRROR_OPACITY = 0.4;
/** 원자 점 · 고리 반지름(화면 px), 고리 굵기(화면 px). */
const ATOM_PX = 3.4;
const ATOM_RING_WIDTH = 1.3;
/** 유도 방출 순간의 고리 — 시작 · 끝 반지름(화면 px), 굵기(화면 px), 수명(앞머리가 가는 월드 거리). */
const EMIT_RING_PX = 4;
const EMIT_RING_SPREAD_PX = 16;
const EMIT_RING_WIDTH = 1.4;
const EMIT_RING_LIFE = 3.5;
/** 광자 물결 굵기(화면 px). 한 길에 광자가 겹칠수록 굵어진다 — 늘어나는 몫 · 상한 광자 수. */
const WAVE_WIDTH = 2.2;
const WAVE_WIDTH_STEP = 0.9;
const WAVE_COUNT_CAP = 4;
/**
 * 물결을 그리는 오른쪽 끝(월드). 프레이밍 경계보다 넉넉히 멀다 — 경계에서 자르면 뷰포트가
 * 경계보다 넓을 때 물결이 허공에서 끊겨 보인다.
 */
const RUNWAY_MARGIN = 20;
const PHOTON_RUNWAY_X = SCENE_BOUNDS.maxX + RUNWAY_MARGIN;
/** 글자 크기(화면 px). */
const LABEL_PX = 12;
const SMALL_PX = 11;
/** 매질 띠 가장자리에서 이름표까지 띄우는 거리(월드) · 지시 점선 굵기(화면 px). */
const LABEL_GAP = 0.9;
const LEADER_WIDTH = 1;
/** 원자 지시 점선을 원자 조금 앞에서 멈추는 거리(월드) — 점을 가리지 않게. */
const ATOM_LEADER_GAP = 0.45;
/** 이름표를 앵커에서 위아래로 띄우는 거리(화면 px) — 띠 바깥쪽으로 글 덩이를 민다. */
const LABEL_NUDGE_PX = 7;

function label(
  id: string,
  key: LaserAndStimulatedEmissionMessageKey,
  pos: Vec2,
  opts: { size?: number; align?: Readout['align']; vars?: Record<string, string>; offset?: Vec2; opacity?: number } = {},
): Readout {
  return {
    type: 'readout',
    id,
    anchor: opts.offset ? { world: pos, offset: opts.offset } : { world: pos },
    text: text(key),
    ...(opts.vars ? { vars: opts.vars } : {}),
    chip: false,
    font: 'text',
    fontSize: opts.size ?? LABEL_PX,
    align: opts.align ?? 'center',
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 띠 바깥의 이름표에서 물결 · 원자까지 내리는 점선. */
function leader(id: string, x: number, fromY: number, toY: number): Trajectory {
  return {
    type: 'trajectory',
    id,
    points: [
      [x, fromY],
      [x, toY],
    ],
    width: LEADER_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
  };
}

function mirror(id: string, x: number, edge: number, opacity: number): Region {
  const y = edge + MIRROR_OVERHANG;
  return {
    type: 'region',
    id,
    points: [
      [x - MIRROR_THICK / 2, -y],
      [x + MIRROR_THICK / 2, -y],
      [x + MIRROR_THICK / 2, y],
      [x - MIRROR_THICK / 2, y],
    ],
    fillOpacity: opacity,
    opaque: true,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: LaserAndStimulatedEmissionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('laser-and-stimulated-emission: schema.timeline 이 선언되어야 한다');
  const c: LaserConstants = readConstants(stage);
  const list = atoms(c);
  const { photons, emissions } = chain(list, c);
  const head = headS(tl, c);
  const pump = tl.at('pump');
  const edge = outerLaneY(c) + BAND_PAD;
  const M = c.mirrorX;
  const out: Primitive[] = [];

  // ── 매질 띠 · 거울 ─────────────────────────────────
  out.push({
    type: 'region',
    id: 'medium',
    points: [
      [-M, -edge],
      [M, -edge],
      [M, edge],
      [-M, edge],
    ],
    fillOpacity: BAND_OPACITY,
    opaque: true,
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies Region);
  out.push(mirror('mirror-left', -M - MIRROR_THICK / 2, edge, MIRROR_OPACITY));
  out.push(mirror('mirror-right', M + MIRROR_THICK / 2, edge, OUTPUT_MIRROR_OPACITY));
  const topY = edge + MIRROR_OVERHANG + LABEL_GAP;
  out.push(label('mirror-left-label', 'label.mirror', [-M, topY], { size: SMALL_PX, offset: [0, -LABEL_NUDGE_PX] }));
  out.push(label('mirror-right-label', 'label.outputMirror', [M, topY], { size: SMALL_PX, offset: [0, -LABEL_NUDGE_PX] }));
  // ── 원자 — 들뜬 것은 속 찬 점, 바닥은 고리. 내려온 원자는 펌핑 동안 다시 찬다 ──
  const droppedAt = new Map<number, number>();
  for (const e of emissions) if (e.at <= head) droppedAt.set(e.atom, e.at);
  const dots: Vec2[] = [];
  const dotAlpha: number[] = [];
  const rings: { pos: Vec2 }[] = [];
  const dropped: { pos: Vec2 }[] = [];
  list.forEach((a, i) => {
    if (!a.excited) {
      rings.push({ pos: a.pos });
      return;
    }
    if (droppedAt.has(i)) {
      dropped.push({ pos: a.pos });
      if (pump > 0) {
        dots.push(a.pos);
        dotAlpha.push(pump);
      }
      return;
    }
    dots.push(a.pos);
    dotAlpha.push(1);
  });
  out.push({
    type: 'trace',
    id: 'ground-atoms',
    marks: rings,
    shape: 'ring',
    size: ATOM_PX,
    width: ATOM_RING_WIDTH,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies Trace);
  if (dropped.length > 0 && pump < 1) {
    out.push({
      type: 'trace',
      id: 'dropped-atoms',
      marks: dropped,
      shape: 'ring',
      size: ATOM_PX,
      width: ATOM_RING_WIDTH,
      opacity: 1 - pump,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies Trace);
  }
  out.push({
    type: 'particleSystem',
    id: 'excited-atoms',
    positions: dots,
    sizes: ATOM_PX,
    opacities: dotAlpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies ParticleSystem);

  // 매질 이름표 — 들뜬 원자가 반을 넘는 동안만. 연쇄가 매질을 바닥으로 내려 보내면 더는 참이 아니다.
  // 띠 아래 오른쪽에 둔다 — 왼쪽 아래는 첫 건넘에서 「광자 하나」 이름표가 지나는 자리다.
  const excitedNow = dotAlpha.reduce((sum, a) => sum + a, 0);
  if (excitedNow > list.length / 2) {
    out.push(
      label('medium-label', 'label.medium', [M - LABEL_GAP, -edge - LABEL_GAP], {
        size: SMALL_PX,
        align: 'right',
        offset: [0, LABEL_NUDGE_PX],
      }),
    );
  }

  // ── 유도 방출 순간의 고리 ────────────────────────────
  const flashes = emissions
    .filter((e) => e.at <= head && head - e.at < EMIT_RING_LIFE)
    .map((e) => ({ pos: list[e.atom]!.pos, age: head - e.at }));
  if (flashes.length > 0) {
    out.push({
      type: 'trace',
      id: 'emission-rings',
      marks: flashes,
      life: EMIT_RING_LIFE,
      shape: 'ring',
      size: EMIT_RING_PX,
      spreadTo: EMIT_RING_SPREAD_PX,
      width: EMIT_RING_WIDTH,
      style: { colorRole: 'muted', emphasis: 'strong' },
    } satisfies Trace);
  }

  // ── 광자 — 길마다 물결 하나. 같은 길에 겹친 광자는 굵기로 ────
  const rgb = photonLight(c);
  const live = photons.filter((p) => p.born <= head);
  const lanes = new Map<number, { born: number; n: number }>();
  for (const p of live) {
    const l = lanes.get(p.lane);
    lanes.set(p.lane, l ? { born: Math.min(l.born, p.born), n: l.n + 1 } : { born: p.born, n: 1 });
  }
  for (const [lane, { born, n }] of [...lanes].sort((p, q) => p[0] - q[0])) {
    const lines = laneWave(lane, born, head, c, PHOTON_RUNWAY_X);
    if (lines.length === 0) continue;
    out.push({
      type: 'lineSet',
      id: `photon-lane-${lane}`,
      lines,
      width: WAVE_WIDTH + WAVE_WIDTH_STEP * (Math.min(n, WAVE_COUNT_CAP) - 1),
      opacity: 1 - pump,
      light: { rgb },
    } satisfies LineSet);
  }

  // ── 첫 유도 방출의 이름표 — 광자가 둘이 될 때까지만 ──────────
  // 처음 내려오는 원자가 있는 쪽(위 · 아래)에 원자 · 새 광자 이름표, 반대쪽에 첫 광자 이름표.
  const first = emissions[0];
  const inFirstPass = tl.at('pass2') === 0;
  if (first && inFirstPass && live.length <= 2) {
    const atom = list[first.atom]!;
    const side = atom.lane >= seedLane(c) ? 1 : -1;
    const near = side * (edge + LABEL_GAP);
    const far = -near;
    const nudge = (s: number): Vec2 => [0, -s * LABEL_NUDGE_PX];
    const tailS = head - c.packetLength;
    if (head < first.at) {
      out.push(leader('atom-leader', atom.pos[0], side * edge, atom.pos[1] + side * ATOM_LEADER_GAP));
      out.push(label('atom-label', 'label.excitedAtom', [atom.pos[0], near], { size: SMALL_PX, offset: nudge(side) }));
    } else {
      const cloneFrom = Math.max(tailS, first.at);
      const x = foldX((cloneFrom + head) / 2, c);
      out.push(leader('clone-leader', x, side * edge, laneY(atom.lane, c) + side * c.packetAmplitude));
      out.push(label('clone-label', 'label.clone', [x, near], { size: SMALL_PX, offset: nudge(side) }));
    }
    if (tailS >= 0) {
      const x = foldX(head - c.packetLength / 2, c);
      out.push(leader('seed-leader', x, -side * edge, laneY(seedLane(c), c) - side * c.packetAmplitude));
      out.push(label('seed-label', 'label.photon', [x, far], { size: SMALL_PX, offset: nudge(-side) }));
    }
  }

  // ── 나간 빔의 이름표 — 묶음이 일부 통과 거울을 다 빠져나온 뒤 ─────
  const outStart = exitS(c);
  if (head - c.packetLength >= outStart && pump === 0) {
    const x = foldX(head - c.packetLength / 2, c);
    out.push(
      label('beam-label', 'label.beam', [x, -edge - LABEL_GAP], {
        size: SMALL_PX,
        vars: { nm: String(c.wavelengthNm) },
        offset: [0, LABEL_NUDGE_PX],
      }),
    );
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
