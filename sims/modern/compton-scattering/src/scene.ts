// ========================================================================
// compton-scattering — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 가운데 전자 하나. 광자가 왼쪽에서 x 축을 따라 들어와 부딪히고, 발마다 다른 각으로 튕겨 나가
// 위쪽 반원의 제자리에 멈춰 남는다. 멈춘 뭉치들은 모두 같은 반지름에서 시작하고 물결 수가
// 같아서 **뭉치 길이가 파장**이다 — 점선 호(들어온 파장의 길이)를 얼마나 넘느냐가 늘어난 몫이다.
//
// 색 — X선은 가시광 밖이라 빛 색을 지어내지 않는다. 광자는 들어오든 나가든 같은 대상이라
// `primary` 한 색, 전자는 먹색, 점선 호 · 이름표는 배경 정보라 `muted`. 늘어남은 색이 아니라
// 물결 간격과 뭉치 길이로 보인다 (S-piece).
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LineSet,
  ParticleSystem,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { packetLength, parkHead, readConstants, snapshot, type OutgoingNow } from './physics';
import { PARK_RADIUS, SCENE_BOUNDS, text } from './schema';
import type { ComptonScatteringState } from './state';

/** 물결 흔들림 폭(월드). 파장과 무관하게 같아서 간격만 다르다. */
const PACKET_AMPLITUDE = 0.12;
/** 물결 한 번에 찍는 표본 수. 간격이 고정이라 긴 뭉치일수록 점이 많을 뿐 모양은 같다. */
const SAMPLES_PER_CYCLE = 24;
/** 광자 선 굵기(화면 px). */
const PHOTON_WIDTH_PX = 2;

/** 들어온 파장 길이를 표시하는 점선 호의 굵기(화면 px) · 표본 수. */
const REFERENCE_WIDTH_PX = 1;
const REFERENCE_SAMPLES = 64;

/** 전자 점 반지름(화면 px). */
const ELECTRON_PX = 4.5;
/** 되튄 전자의 꼬리 — 길이(초) · 짙기 · 굵기(화면 px). 꼬리가 길수록 세게 밀려났다. */
const ELECTRON_TRAIL = { seconds: 0.7, opacity: 0.5, width: 2 } as const;
/** `e⁻` 표식을 전자에서 띄우는 자리(화면 px, 아래로). */
const ELECTRON_MARK_OFFSET: Vec2 = [0, 16];

/** 멈춘 뭉치 끝에서 이름표까지 띄우는 거리(월드). */
const LABEL_GAP = 0.22;
/** 이름표 정렬을 옆으로 붙일지 가를 방향 x 성분 — 이보다 옆을 보면 뭉치 끝에서 바깥쪽으로 붙인다. */
const SIDE_ALIGN_X = 0.3;
/** 들어오는 광자 이름표를 x 축 아래로 내리는 거리(월드). */
const INCIDENT_LABEL_DROP = 0.4;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;

/**
 * 물결 뭉치 한 개. `from` ~ `to`(원점에서 잰 거리) 구간을 방향 `dir` 로 긋고, 물결 위상은
 * 머리(`head`)에 붙어 뭉치와 함께 흐른다.
 */
function wave(dir: Vec2, from: number, to: number, head: number, lambdaWorld: number): Vec2[] {
  const [ux, uy] = dir;
  const nx = -uy;
  const ny = ux;
  const len = Math.max(0, to - from);
  const n = Math.max(1, Math.ceil((len / lambdaWorld) * SAMPLES_PER_CYCLE));
  const pts: Vec2[] = [];
  for (let i = 0; i <= n; i++) {
    const r = from + (len * i) / n;
    const w = PACKET_AMPLITUDE * Math.sin((2 * Math.PI * (head - r)) / lambdaWorld);
    pts.push([ux * r + nx * w, uy * r + ny * w]);
  }
  return pts;
}

function label(id: string, t: Readout['text'], pos: Vec2, align: Readout['align'], opacity: number, vars?: Readout['vars']): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: t,
    vars,
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align,
    opacity,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 멈춘 뭉치의 이름표 — 끝에서 바깥쪽으로, 옆을 보면 그쪽으로 붙인다. */
function shiftLabel(o: OutgoingNow, angle: number, shift: number, opacity: number): Readout {
  const r = o.head + LABEL_GAP;
  const [dx, dy] = o.dir;
  const align: Readout['align'] = dx > SIDE_ALIGN_X ? 'left' : dx < -SIDE_ALIGN_X ? 'right' : 'center';
  return label(`shift-${o.shot}`, text('label.shift'), [dx * r, dy * r], align, opacity, {
    a: String(angle),
    d: String(shift),
  });
}

export function scene(params: {
  state: ComptonScatteringState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('compton-scattering: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const snap = snapshot(tl, c);
  const out: Primitive[] = [];

  // ── 점선 호 — 들어온 파장 그대로라면 뭉치가 끝나는 자리 ──
  const refR = parkHead(c.incidentWavelength, c);
  const arc: Vec2[] = [];
  for (let i = 0; i <= REFERENCE_SAMPLES; i++) {
    const a = (Math.PI * i) / REFERENCE_SAMPLES;
    arc.push([refR * Math.cos(a), refR * Math.sin(a)]);
  }
  out.push({
    type: 'trajectory',
    id: 'reference-arc',
    points: arc,
    width: REFERENCE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
  } satisfies Trajectory);

  // ── 광자 — 들어오는 것 하나와 튕겨 나간 것들. 같은 대상이라 한 선언 ──
  const lines: Vec2[][] = [];
  const opacities: number[] = [];
  if (snap.incoming) {
    const inc = snap.incoming;
    // 원점을 넘은 몫은 전자에 흡수됐다 — 그리지 않는다.
    const to = Math.min(inc.head, 0);
    const from = inc.head - inc.length;
    if (to > from) {
      lines.push(wave([1, 0], from, to, inc.head, inc.lambda * c.waveScale));
      opacities.push(1);
    }
  }
  for (const o of snap.outgoing) {
    const from = Math.max(0, o.head - o.length);
    if (o.head <= from) continue;
    lines.push(wave(o.dir, from, o.head, o.head, o.lambda * c.waveScale));
    opacities.push(snap.alpha);
  }
  out.push({
    type: 'lineSet',
    id: 'photons',
    lines,
    opacities,
    width: PHOTON_WIDTH_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  } satisfies LineSet);

  // ── 전자 — 가운데서 기다리는 것 · 되튀어 나는 것 · 흐려지는 것 ──
  out.push({
    type: 'particleSystem',
    id: 'electrons',
    positions: snap.electrons.map((e) => e.pos),
    velocities: snap.electrons.map((e) => e.vel),
    opacities: snap.electrons.map((e) => e.alpha * snap.alpha),
    trail: true,
    trailStyle: ELECTRON_TRAIL,
    sizes: ELECTRON_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies ParticleSystem);
  const active = snap.electrons.find((e) => e.active);
  if (active) {
    out.push({
      type: 'readout',
      id: 'electron-mark',
      anchor: { world: active.pos, offset: ELECTRON_MARK_OFFSET },
      text: text('mark.electron'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies Readout);
  }

  // ── 이름표 — 들어오는 X선의 파장 · 멈춘 뭉치마다 각과 늘어난 파장 ──
  out.push(
    label(
      'incident',
      text('label.incident'),
      [-(PARK_RADIUS + packetLength(c.incidentWavelength, c) / 2), -INCIDENT_LABEL_DROP],
      'center',
      1,
      { l: String(c.incidentWavelength) },
    ),
  );
  for (const o of snap.outgoing) {
    if (!o.parked) continue;
    out.push(shiftLabel(o, c.angles[o.shot]!, c.shifts[o.shot]!, snap.alpha));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
