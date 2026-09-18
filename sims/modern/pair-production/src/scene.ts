// ========================================================================
// pair-production — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 가운데 원자핵 하나. 감마선 광자가 왼쪽에서 x 축을 따라 날아온다. 문턱 아래 광자는 원자핵을
// 지나 오른쪽으로 빠져나가고, 문턱 위 광자는 원자핵에 닿으며 사라진다 — 그 자리에서 두 궤적이
// 갈라져 나와 하나는 위로, 하나는 아래로 감긴다(거품 상자 사진의 모양).
//
// 색 — 감마선은 가시광 밖이라 빛 색을 지어내지 않는다. 광자는 `primary` 한 색, 두 입자의 궤적은
// 같은 먹색(`ink`)이다. 전자와 양전자는 색이 아니라 휘는 방향과 표식 `e⁻` · `e⁺` 로 가른다 (S-piece).
// 원자핵 · 이름표는 배경 정보라 `muted`.
// ========================================================================

import type {
  Body,
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
import { readConstants, SHOTS, snapshot, type PhotonNow } from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { PairProductionState } from './state';

/** 광자 물결 흔들림 폭(월드 mm). 에너지와 무관하게 같아서 간격만 다르다. */
const PACKET_AMPLITUDE = 0.45;
/** 물결 한 번에 찍는 표본 수. */
const SAMPLES_PER_CYCLE = 20;
/** 광자 선 굵기(화면 px). */
const PHOTON_WIDTH_PX = 2;

/** 궤적 굵기(화면 px). */
const TRACK_WIDTH_PX = 1.8;
/** 다음 발이 들어온 뒤 앞 발 궤적이 남는 짙기. */
const PREV_TRACK_OPACITY = 0.35;
/** 달리는 입자 머리 점 반지름(화면 px). */
const HEAD_PX = 3.5;

/** 원자핵 반지름(월드 mm). */
const NUCLEUS_RADIUS = 0.4;
/**
 * `원자핵` 이름표를 핵에서 띄우는 자리(화면 px) — 왼쪽 아래. 첫 발 동안만 있고 둘째 광자가 들어오며
 * 흐려진다 — 그 뒤에는 궤적이 핵 둘레를 채워 놓을 자리가 없다.
 */
const NUCLEUS_LABEL_OFFSET: Vec2 = [-10, 16];

/** `e⁻` · `e⁺` 표식을 궤적 가장 바깥 점에서 띄우는 거리(화면 px). */
const MARK_GAP_PX = 13;
/** 광자 이름표를 x 축 위로 띄우는 거리(화면 px). */
const PHOTON_LABEL_GAP_PX = 20;

/** 왼쪽 위 이름표(자기장 · 문턱)의 자리(월드 mm)와 줄 간격(월드 mm). */
const INFO_LABEL_POS: Vec2 = [SCENE_BOUNDS.minX + 0.4, SCENE_BOUNDS.maxY - 0.6];
const INFO_LINE_GAP = 1.5;

/** 이름표 · 표식 글자 크기(화면 px). */
const LABEL_PX = 12;
const MARK_PX = 14;

/** 광자 물결 — x 축 위 [from, to] 구간, 위상은 머리에 붙어 뭉치와 함께 흐른다. */
function wave(p: PhotonNow): Vec2[] {
  const len = Math.max(0, p.to - p.from);
  const n = Math.max(1, Math.ceil((len / p.wavelength) * SAMPLES_PER_CYCLE));
  const pts: Vec2[] = [];
  for (let i = 0; i <= n; i++) {
    const x = p.from + (len * i) / n;
    pts.push([x, PACKET_AMPLITUDE * Math.sin((2 * Math.PI * (p.head - x)) / p.wavelength)]);
  }
  return pts;
}

function label(
  id: string,
  t: Readout['text'],
  anchor: Readout['anchor'],
  align: Readout['align'],
  vars?: Readout['vars'],
  opacity = 1,
): Readout {
  return {
    type: 'readout',
    id,
    anchor,
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

export function scene(params: {
  state: PairProductionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('pair-production: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const snap = snapshot(tl, c);
  const out: Primitive[] = [];

  // ── 궤적 — 전자 · 양전자. 같은 대상의 자취라 한 선언, 앞 발은 옅게 남는다 ──
  out.push({
    type: 'lineSet',
    id: 'tracks',
    lines: snap.tracks.map((tr) => tr.points),
    opacities: snap.tracks.map((tr) => (1 - (1 - PREV_TRACK_OPACITY) * tr.dim) * snap.alpha),
    width: TRACK_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies LineSet);

  // ── 달리는 입자 머리 ──
  const moving = snap.tracks.filter((tr) => tr.moving);
  out.push({
    type: 'particleSystem',
    id: 'heads',
    positions: moving.map((tr) => tr.points[tr.points.length - 1]!),
    sizes: HEAD_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies ParticleSystem);

  // ── 원자핵 ──
  out.push({
    type: 'body',
    id: 'nucleus',
    pos: [0, 0],
    shape: 'circle',
    size: NUCLEUS_RADIUS,
    glow: false,
    outline: 'none',
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies Body);
  const nucleusMark = 1 - tl.at(SHOTS[1]!.in);
  if (nucleusMark > 0) {
    out.push(
      label('nucleus-mark', text('mark.nucleus'), { world: [0, 0], offset: NUCLEUS_LABEL_OFFSET }, 'right', undefined, nucleusMark),
    );
  }

  // ── 광자 ──
  const lines: Vec2[][] = [];
  if (snap.photon && snap.photon.to > snap.photon.from) lines.push(wave(snap.photon));
  out.push({
    type: 'lineSet',
    id: 'photon',
    lines,
    width: PHOTON_WIDTH_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  } satisfies LineSet);
  if (snap.photon && snap.photon.to > snap.photon.from) {
    const p = snap.photon;
    out.push(
      label(
        'photon-energy',
        text('label.photon'),
        { world: [(p.from + p.to) / 2, 0], offset: [0, -PHOTON_LABEL_GAP_PX] },
        'center',
        { e: String(p.energy) },
      ),
    );
  }

  // ── 표식 — 지금 발의 두 궤적, 가장 바깥 점을 지난 뒤 ──
  for (const tr of snap.tracks) {
    if (!tr.current || !tr.outermost) continue;
    out.push({
      type: 'readout',
      id: `mark-${tr.shot}-${tr.turn > 0 ? 'electron' : 'positron'}`,
      anchor: { world: tr.outermost, offset: [0, -tr.turn * MARK_GAP_PX] },
      text: text(tr.turn > 0 ? 'mark.electron' : 'mark.positron'),
      chip: false,
      font: 'text',
      fontSize: MARK_PX,
      align: 'center',
      opacity: snap.alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies Readout);
  }

  // ── 왼쪽 위 — 자기장과 문턱. 둘 다 선언값을 그대로 끼운다 ──
  out.push(
    label('field', text('label.field'), { world: INFO_LABEL_POS }, 'left', { b: String(c.field) }),
    label(
      'threshold',
      text('label.threshold'),
      { world: [INFO_LABEL_POS[0], INFO_LABEL_POS[1] - INFO_LINE_GAP] },
      'left',
      { t: String(c.threshold) },
    ),
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
