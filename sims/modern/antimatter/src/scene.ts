// ========================================================================
// antimatter — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 검출기 고리 하나. 고리 안 비켜 둔 자리(추적자)에 전자가 있고 양전자가 왼쪽에서 다가온다.
// 만나면 둘 다 사라지고 그 자리에서 광자 둘이 정반대로 날아가 고리의 두 칸에 닿는다. 두 칸을
// 이은 선이 남고, 소멸이 거듭될수록 선들이 그 자리에서 만난다.
//
// 색 — 감마선은 가시광 밖이라 빛 색을 지어내지 않는다. 광자와 섬광은 `primary` 한 색, 전자 ·
// 양전자는 같은 먹색(`ink`)이고 표식 `e⁻` · `e⁺` 로만 가른다 (S-piece). 선은 `ink`, 검출기 고리는
// 배경 정보라 `muted`, 광자를 받은 칸만 `accent` — 강조색은 「검출됨」 한 뜻에만 쓴다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  LineSet,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { readConstants, snapshot, type AntimatterConstants, type PhotonNow } from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { AntimatterState } from './state';

/** 검출기 칸 굵기(화면 px)와 칸 사이 틈(칸 너비 대비). */
const CELL_WIDTH_PX = 5;
const CELL_GAP_SHARE = 0.25;
/** 칸 호 하나를 찍는 표본 수. */
const CELL_SAMPLES = 4;
/** 광자를 받은 칸 굵기(화면 px). */
const LIT_WIDTH_PX = 8;

/** 두 검출 자리를 이은 선 굵기(화면 px)와, 다음 소멸이 오면 남는 짙기. */
const CHORD_WIDTH_PX = 1.6;
const CHORD_OLD_OPACITY = 0.55;

/** 광자 물결 흔들림 폭(월드 cm)과 물결 한 번에 찍는 표본 수, 선 굵기(화면 px). */
const PACKET_AMPLITUDE = 0.9;
const SAMPLES_PER_CYCLE = 16;
const PHOTON_WIDTH_PX = 2;

/** 전자 · 양전자 반지름(월드 cm). */
const PARTICLE_RADIUS = 0.9;
/** 만나는 순간 번지는 섬광 고리의 끝 반지름(월드 cm)과 굵기(화면 px). */
const FLASH_RADIUS = 4.5;
const FLASH_WIDTH_PX = 2;
/** 섬광 고리를 찍는 표본 수. */
const FLASH_SAMPLES = 40;

/** 소멸 자리 표지(속 빈 원) 반지름(월드 cm) — 만남이 끝난 뒤 그 자리에 남는다. */
const SITE_RADIUS = 1.6;

/**
 * `e⁻` · `e⁺` 표식을 점 위로 띄우는 거리와 바깥쪽(전자는 오른쪽, 양전자는 왼쪽)으로 비키는 거리(화면 px).
 * 만나는 순간 두 점이 겹쳐도 표식은 겹치지 않는다.
 */
const MARK_GAP_PX = 14;
const MARK_SIDE_PX = 4;
/** 정지 에너지 이름표를 점 옆으로 띄우는 거리(화면 px) — 전자는 오른쪽, 양전자는 왼쪽. */
const ENERGY_GAP_PX = 9;
/** 광자 이름표를 물결 옆으로 띄우는 거리(화면 px). */
const PHOTON_LABEL_GAP_PX = 16;

/** `검출기 고리` 이름표가 붙는 고리 위 각(라디안)과 거기서 띄우는 자리(화면 px). */
const DETECTOR_LABEL_ANGLE = (-28 * Math.PI) / 180;
const DETECTOR_LABEL_OFFSET: Vec2 = [10, 12];

/** 이름표 · 표식 글자 크기(화면 px). */
const LABEL_PX = 12;
const MARK_PX = 14;

/** 고리 위 각 a 의 점. */
const onRing = (a: number, r: number): Vec2 => [r * Math.cos(a), r * Math.sin(a)];

/** 검출기 칸 i 의 호. */
function cellArc(i: number, c: AntimatterConstants): Vec2[] {
  const w = (2 * Math.PI) / c.ringCells;
  const a0 = i * w + (w * CELL_GAP_SHARE) / 2;
  const a1 = (i + 1) * w - (w * CELL_GAP_SHARE) / 2;
  const pts: Vec2[] = [];
  for (let k = 0; k <= CELL_SAMPLES; k++) pts.push(onRing(a0 + ((a1 - a0) * k) / CELL_SAMPLES, c.ringRadius));
  return pts;
}

/** 광자 물결 — 소멸 자리에서 방향 `dir` 로 [from, to] 구간, 위상은 머리에 붙어 뭉치와 함께 흐른다. */
function wave(p: PhotonNow, c: AntimatterConstants): Vec2[] {
  const len = Math.max(0, p.to - p.from);
  const n = Math.max(1, Math.ceil((len / c.wavelength) * SAMPLES_PER_CYCLE));
  const [dx, dy] = p.dir;
  const [s0, s1] = c.source;
  const pts: Vec2[] = [];
  for (let i = 0; i <= n; i++) {
    const s = p.from + (len * i) / n;
    const y = PACKET_AMPLITUDE * Math.sin((2 * Math.PI * (p.head - s)) / c.wavelength);
    pts.push([s0 + dx * s - dy * y, s1 + dy * s + dx * y]);
  }
  return pts;
}

function label(
  id: string,
  t: Readout['text'],
  anchor: Readout['anchor'],
  align: Readout['align'],
  opts: { vars?: Readout['vars']; opacity?: number; mark?: boolean } = {},
): Readout {
  return {
    type: 'readout',
    id,
    anchor,
    text: t,
    vars: opts.vars,
    chip: false,
    font: 'text',
    fontSize: opts.mark ? MARK_PX : LABEL_PX,
    align,
    opacity: opts.opacity ?? 1,
    style: { colorRole: opts.mark ? 'ink' : 'muted', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: AntimatterState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('antimatter: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const snap = snapshot(tl, c);
  const out: Primitive[] = [];

  // ── 검출기 고리 — 칸마다 호 하나, 한 선언 ──
  const cells: Vec2[][] = [];
  for (let i = 0; i < c.ringCells; i++) cells.push(cellArc(i, c));
  out.push({
    type: 'lineSet',
    id: 'ring',
    lines: cells,
    width: CELL_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  } satisfies LineSet);

  // ── 두 검출 자리를 이은 선 — 앞선 것은 옅게 남는다 ──
  out.push({
    type: 'lineSet',
    id: 'chords',
    lines: snap.chords.map((ch) => [ch.a, ch.b]),
    opacities: snap.chords.map((ch) => ch.appear * (1 - (1 - CHORD_OLD_OPACITY) * ch.dim) * snap.alpha),
    width: CHORD_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies LineSet);

  // ── 광자를 받은 칸 ──
  out.push({
    type: 'lineSet',
    id: 'lit',
    lines: snap.lit.map((l) => cellArc(l.index, c)),
    opacities: snap.lit.map((l) => l.opacity * snap.alpha),
    width: LIT_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  } satisfies LineSet);

  // ── 광자 ──
  out.push({
    type: 'lineSet',
    id: 'photons',
    lines: snap.photons.map((p) => wave(p, c)),
    width: PHOTON_WIDTH_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  } satisfies LineSet);
  for (const [j, p] of snap.photons.entries()) {
    // 첫 소멸의 광자만, 고리에 닿기 전까지 — 닿으면 켜진 칸과 겹친다.
    if (p.event !== 0 || p.to < p.head) continue;
    const mid = (p.from + p.to) / 2;
    const at: Vec2 = [c.source[0] + p.dir[0] * mid, c.source[1] + p.dir[1] * mid];
    // 물결 옆 — 진행 방향의 왼쪽 법선. 화면 y 는 아래라 부호를 뒤집는다.
    const offset: Vec2 = [-p.dir[1] * PHOTON_LABEL_GAP_PX, -p.dir[0] * PHOTON_LABEL_GAP_PX];
    out.push(
      label(`photon-energy-${j}`, text('label.photon'), { world: at, offset }, 'center', {
        vars: { e: String(c.restEnergy) },
      }),
    );
  }

  // ── 섬광 ──
  if (snap.flash !== undefined) {
    const r = FLASH_RADIUS * snap.flash;
    const ring: Vec2[] = [];
    for (let k = 0; k < FLASH_SAMPLES; k++) {
      const a = (2 * Math.PI * k) / FLASH_SAMPLES;
      ring.push([c.source[0] + r * Math.cos(a), c.source[1] + r * Math.sin(a)]);
    }
    out.push({
      type: 'trajectory',
      id: 'flash',
      points: ring,
      closed: true,
      width: FLASH_WIDTH_PX,
      opacity: 1 - snap.flash,
      style: { colorRole: 'primary', emphasis: 'strong' },
    } satisfies Trajectory);
  }

  // ── 소멸 자리 — 입자가 사라진 뒤 그 자리를 속 빈 원으로 남긴다. 선들이 지나는 곳이다 ──
  if (snap.site) {
    out.push({
      type: 'body',
      id: 'site',
      pos: c.source,
      shape: 'circle',
      size: SITE_RADIUS,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: snap.site * snap.alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    } satisfies Body);
  }

  // ── 전자 · 양전자 — 같은 먹색, 표식으로만 가른다 ──
  const particles = [
    { id: 'electron', p: snap.electron, mark: text('mark.electron'), side: 1 },
    { id: 'positron', p: snap.positron, mark: text('mark.positron'), side: -1 },
  ] as const;
  for (const { id, p, mark, side } of particles) {
    if (!p || p.opacity <= 0) continue;
    out.push({
      type: 'body',
      id,
      pos: p.pos,
      shape: 'circle',
      size: PARTICLE_RADIUS,
      glow: false,
      outline: 'none',
      opacity: p.opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies Body);
    out.push(
      label(`${id}-mark`, mark, { world: p.pos, offset: [side * MARK_SIDE_PX, -MARK_GAP_PX] }, side > 0 ? 'left' : 'right', {
        opacity: p.opacity,
        mark: true,
      }),
      label(
        `${id}-energy`,
        text('label.restEnergy'),
        { world: p.pos, offset: [side * ENERGY_GAP_PX, 0] },
        side > 0 ? 'left' : 'right',
        { vars: { e: String(c.restEnergy) }, opacity: p.opacity },
      ),
    );
  }

  // ── 검출기 고리 이름표 ──
  out.push(
    label(
      'detector',
      text('label.detector'),
      { world: onRing(DETECTOR_LABEL_ANGLE, c.ringRadius), offset: DETECTOR_LABEL_OFFSET },
      'left',
    ),
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
