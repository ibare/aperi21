// ========================================================================
// ionizing-radiation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 물 한 판에 물 분자 점이 흩어져 있다. 왼쪽에서 광자가 물결 뭉치로 들어와 표적 분자에 닿는다.
// 자외선 광자는 닿고 사라질 뿐이고, X선 광자는 닿는 자리의 분자를 이온(`+`)으로 만들고 전자 하나를
// 떼어 낸다. 떨어진 전자(`e⁻`)는 먹색 궤적을 그으며 나아가고, 자리에 닿을 때마다 그 분자에 `+` 가 붙는다.
//
// 색 — 자외선 · X선은 가시광 밖이라 빛 색을 지어내지 않는다. 광자는 둘 다 `primary` 한 색이고 물결
// 간격만 다르다. 물 분자는 이온이 되어도 같은 `muted` 점이다 — 이온은 색이 아니라 표식 `+` 로 가른다
// (S-piece). 전자와 그 궤적은 `ink`.
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
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { MEDIUM, SCENE_BOUNDS, text } from './schema';
import { readConstants, snapshot, type PhotonNow } from './physics';
import type { IonizingRadiationState } from './state';

/** 물 분자 점 반지름(화면 px). */
const MOLECULE_PX = 3;
/** 전자 머리 점 반지름(화면 px). */
const HEAD_PX = 4;
/** 광자 선 · 전자 궤적 굵기(화면 px). */
const PHOTON_WIDTH_PX = 2;
const TRACK_WIDTH_PX = 1.6;
/** 물결 한 번에 찍는 표본 수. */
const SAMPLES_PER_WAVE = 16;

/** `+` 표식을 분자에서 띄우는 자리(화면 px) · 글자 크기. */
const ION_MARK_OFFSET: Vec2 = [7, -8];
const ION_MARK_PX = 13;
/** `e⁻` 표식을 전자 머리에서 띄우는 자리(화면 px) · 글자 크기. */
const ELECTRON_MARK_OFFSET: Vec2 = [-9, -12];
const ELECTRON_MARK_PX = 13;
/** 광자 에너지 이름표를 뭉치 위로 띄우는 자리(화면 px). */
const PHOTON_LABEL_OFFSET: Vec2 = [0, -16];
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 문턱 이름표 자리 — 물 상자 왼쪽 위에서 띄우는 높이(월드). */
const THRESHOLD_LABEL_RISE = 0.45;

/** 광자 물결 — 뭉치 [from, head] 구간, 위상은 머리에 붙어 뭉치와 함께 흐른다. */
function wave(p: PhotonNow, amplitude: number): Vec2[] {
  const len = Math.max(0, p.head - p.from);
  const n = Math.max(1, Math.ceil((len / p.wave) * SAMPLES_PER_WAVE));
  const pts: Vec2[] = [];
  for (let i = 0; i <= n; i++) {
    const x = p.from + (len * i) / n;
    pts.push([x, p.y + amplitude * Math.sin((2 * Math.PI * (p.head - x)) / p.wave)]);
  }
  return pts;
}

function mark(id: string, t: Readout['text'], at: Vec2, offset: Vec2, px: number, opacity: number): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset },
    text: t,
    chip: false,
    font: 'text',
    fontSize: px,
    align: 'center',
    opacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: IonizingRadiationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('ionizing-radiation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const snap = snapshot(tl, c);
  const out: Primitive[] = [];

  // ── 물 분자 — 흩뿌린 점 · 자외선 표적 · 전자가 이미 닿은 이온화 자리. 이온이 되어도 같은 점이다.
  //    아직 닿지 않은 자리는 그리지 않는다 — 고른 간격의 줄이 전자의 길을 미리 알려 준다 (NOTES (b)).
  const reached = snap.electron ? snap.electron.ions : 0;
  out.push({
    type: 'particleSystem',
    id: 'molecules',
    positions: [...snap.medium, [c.uvTargetX, c.uvTargetY], ...snap.sites.slice(0, reached)],
    sizes: MOLECULE_PX,
    opacity: snap.alpha,
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies ParticleSystem);

  // ── 문턱 — 선언값을 그대로 끼운다 ──
  out.push({
    type: 'readout',
    id: 'threshold',
    anchor: { world: [MEDIUM.minX, MEDIUM.maxY + THRESHOLD_LABEL_RISE] },
    text: text('label.threshold'),
    vars: { e: String(c.ionizationEv) },
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'left',
    opacity: snap.alpha,
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies Readout);

  // ── 광자 ──
  const lines: Vec2[][] = [];
  if (snap.photon && snap.photon.now.head > snap.photon.now.from) lines.push(wave(snap.photon.now, c.packetAmplitude));
  out.push({
    type: 'lineSet',
    id: 'photon',
    lines,
    width: PHOTON_WIDTH_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  } satisfies LineSet);
  if (snap.photon && snap.photon.now.head > snap.photon.now.from) {
    const p = snap.photon.now;
    const uv = snap.photon.kind === 'uv';
    out.push({
      type: 'readout',
      id: 'photon-energy',
      anchor: { world: [(p.from + p.head) / 2, p.y], offset: PHOTON_LABEL_OFFSET },
      text: text(uv ? 'label.uvPhoton' : 'label.xrayPhoton'),
      vars: { e: String(uv ? c.uvEv : c.xrayKev) },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      style: { colorRole: 'primary', emphasis: 'strong' },
    } satisfies Readout);
  }

  // ── 떨어진 전자 — 궤적 · 머리 · 이온 표식 ──
  const e = snap.electron;
  out.push({
    type: 'lineSet',
    id: 'track',
    lines: e && e.path.length > 1 ? [e.path] : [],
    opacities: e && e.path.length > 1 ? [snap.alpha] : [],
    width: TRACK_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies LineSet);
  out.push({
    type: 'particleSystem',
    id: 'electron',
    positions: e ? [e.head] : [],
    sizes: HEAD_PX,
    opacity: snap.alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies ParticleSystem);
  if (e) {
    out.push(mark('electron-mark', text('mark.electron'), e.head, ELECTRON_MARK_OFFSET, ELECTRON_MARK_PX, snap.alpha));
    for (let i = 0; i < e.ions; i++) {
      out.push(mark(`ion-${i}`, text('mark.ion'), snap.sites[i]!, ION_MARK_OFFSET, ION_MARK_PX, snap.alpha));
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
