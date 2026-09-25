// ========================================================================
// photon-bond-threshold — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 겹침은 scene 에 쓴 순서(`drawOrder: 'scene'`) — 문턱 띠 · 가시광 조각 ·
// 축 · 눈금 · 문턱선 · 이름표 · 표지 · 광원 · 광자 · 결합선 · 원자.
//
// 색 — 광자와 축 위 표지는 같은 대상(광자 하나의 에너지)이라 `primary` 하나. 분자는 먹색. 강조색은
// **문턱 한 뜻에만** 쓴다(문턱선 · 문턱 너머 띠 · 문턱 이름표). 끊기느냐 마느냐는 색이 아니라 원자가
// 벌어지는 움직임으로 보인다 (S-piece). 가시광 밖의 광자에 색을 지어내지 않는다 — 파장은 물결 간격이다.
// 축 위 가시광 조각만 빛 채널(`lightRgb`)로 칠해 「눈에 보이는 빛은 이 한 줌」 을 보인다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  LineSet,
  ParticleSystem,
  Primitive,
  Readout,
  Region,
  ScalarField,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  axisX,
  energyAt,
  fadeAlpha,
  lightOfEv,
  moleculeAlpha,
  readConstants,
  schedule,
  snapshot,
  waveSpacing,
  type FlyingPhoton,
  type BondConstants,
} from './physics';
import { AXIS, SCENE_BOUNDS, SOURCE, text, type PhotonBondThresholdMessageKey } from './schema';
import type { PhotonBondThresholdState } from './state';

/** 광자 물결 뭉치의 길이 · 흔들림 폭(월드) · 표본 수. 모든 광자가 같은 길이라 물결 수가 파장을 말한다. */
const PACKET_LENGTH = 0.75;
const PACKET_AMPLITUDE = 0.09;
const PACKET_SAMPLES = 60;
/** 광자 선 굵기(화면 px). */
const PHOTON_WIDTH_PX = 2;

/** 축 선 굵기 · 눈금 굵기(화면 px). */
const AXIS_WIDTH_PX = 1.5;
const TICK_WIDTH_PX = 1;
/** 대역 경계 눈금 반길이 · 자릿수 눈금 반길이(월드). */
const EDGE_TICK = 0.11;
const DECADE_TICK = 0.05;
/** 문턱선 — 축 아래로 · 위로 뻗는 길이(월드) · 굵기(화면 px). */
const THRESHOLD_BELOW = 0.14;
const THRESHOLD_ABOVE = 0.42;
const THRESHOLD_WIDTH_PX = 2;
/** 문턱 너머 띠의 반높이(월드) · 채움 짙기. */
const BREAKING_BAND_HALF = 0.1;
const BREAKING_BAND_FILL = 0.28;
/** 가시광 조각의 반높이(월드) · 칸 수. */
const VISIBLE_HALF = 0.1;
const VISIBLE_COLS = 24;

/** 이름표 자리 — 축에서 위(눈금 수) · 아래(대역 이름) · 문턱 이름표 · 축 이름(월드). */
const TICK_LABEL_RISE = 0.24;
const BAND_LABEL_DROP = 0.42;
const THRESHOLD_LABEL_RISE = 0.62;
const AXIS_TITLE_AT: Vec2 = [-3.45, 0.24];
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;

/** 표지(광자 에너지) — 축 바로 아래에서 위를 가리키는 세모. 세모 높이 · 반폭(월드) · 축에서 띄움. */
const POINTER_HEIGHT = 0.17;
const POINTER_HALF = 0.09;
const POINTER_GAP = 0.03;

/** 광원 몸통 [길이, 폭](월드). */
const SOURCE_BODY: readonly [number, number] = [0.3, 0.42];

/** 결합선 굵기(화면 px) · 원자 반지름(화면 px). */
const BOND_WIDTH_PX = 3;
/** 끊긴 결합의 흔적 — 점선 굵기(화면 px) · 짙기. 두 원자가 한 분자였음을 남긴다. */
const BROKEN_WIDTH_PX = 1.5;
const BROKEN_OPACITY = 0.7;
const ATOM_PX = 7;

/** 로그 눈금 이름표 — 보일 문자열을 문안 키로 둔다(지수 조립 금지). 목록이 코드에 남는다 (NOTES (c) G105). */
const TICK_LABELS: readonly { ev: number; key: PhotonBondThresholdMessageKey }[] = [
  { ev: 1e-3, key: 'tick.milliEv' },
  { ev: 1, key: 'tick.ev' },
  { ev: 1e3, key: 'tick.kiloEv' },
];

/** 대역 이름과 그 대역의 두 끝(스테이지 상수 이름). 이름은 두 끝의 로그 가운데에 놓인다. */
const BANDS: readonly {
  key: PhotonBondThresholdMessageKey;
  from: keyof BondConstants;
  to: keyof BondConstants;
}[] = [
  { key: 'band.radio', from: 'axisMinEv', to: 'microwaveMinEv' },
  { key: 'band.microwave', from: 'microwaveMinEv', to: 'infraredMinEv' },
  { key: 'band.infrared', from: 'infraredMinEv', to: 'visibleMinEv' },
  { key: 'band.visible', from: 'visibleMinEv', to: 'ultravioletMinEv' },
  { key: 'band.ultraviolet', from: 'ultravioletMinEv', to: 'xrayMinEv' },
  { key: 'band.xray', from: 'xrayMinEv', to: 'axisMaxEv' },
];

/**
 * 광자 하나의 물결 뭉치 — 나는 방향을 따라 물결 간격으로 흔들리고 양 끝으로 잦아든다.
 * 광원 몸통 앞면보다 뒤에 놓일 몫은 긋지 않는다 — 막 떠난 광자가 광원 뒤로 삐져나오지 않게.
 */
function packet(p: FlyingPhoton, spacing: number): Vec2[] {
  const [ux, uy] = p.dir;
  const nx = -uy;
  const ny = ux;
  const travelled = (p.pos[0] - SOURCE.x) * ux + (p.pos[1] - SOURCE.y) * uy;
  const pts: Vec2[] = [];
  for (let i = 0; i <= PACKET_SAMPLES; i++) {
    const f = i / PACKET_SAMPLES;
    // 앞쪽 끝이 지금 자리다 — 뭉치는 그 뒤로 끌린다.
    const s = -f * PACKET_LENGTH;
    if (travelled + s < SOURCE_BODY[0] / 2) break;
    const env = Math.sin(Math.PI * f);
    const w = PACKET_AMPLITUDE * env * Math.sin((2 * Math.PI * s) / spacing);
    pts.push([p.pos[0] + ux * s + nx * w, p.pos[1] + uy * s + ny * w]);
  }
  return pts;
}

function label(
  id: string,
  t: Readout['text'],
  pos: Vec2,
  role: 'muted' | 'accent' = 'muted',
  vars?: Readout['vars'],
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: t,
    vars,
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: role, emphasis: 'strong' },
  };
}

export function scene(params: {
  state: PhotonBondThresholdState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('photon-bond-threshold: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const fade = fadeAlpha(tl);
  const molAlpha = moleculeAlpha(tl);
  const snap = snapshot(schedule(tl, c), tl.u, c);
  const X = (ev: number): number => axisX(ev, c, AXIS.x0, AXIS.x1);
  const y = AXIS.y;
  const out: Primitive[] = [];

  // ── 문턱 너머 띠 — 여기부터 광자 하나가 결합을 끊는다 ──
  const xt = X(c.thresholdEv);
  out.push({
    type: 'region',
    id: 'breaking-band',
    points: [
      [xt, y - BREAKING_BAND_HALF],
      [AXIS.x1, y - BREAKING_BAND_HALF],
      [AXIS.x1, y + BREAKING_BAND_HALF],
      [xt, y + BREAKING_BAND_HALF],
    ],
    fillOpacity: BREAKING_BAND_FILL,
    style: { colorRole: 'accent', emphasis: 'strong' },
  } satisfies Region);

  // ── 가시광 조각 — 축 위의 한 줌. 칸마다 그 에너지의 빛 색 ──
  const xv0 = X(c.visibleMinEv);
  const xv1 = X(c.ultravioletMinEv);
  const rgb: number[] = [];
  for (let i = 0; i < VISIBLE_COLS; i++) {
    const f = (i + 0.5) / VISIBLE_COLS;
    const ev = c.visibleMinEv * Math.pow(c.ultravioletMinEv / c.visibleMinEv, f);
    rgb.push(...lightOfEv(ev, c));
  }
  out.push({
    type: 'scalarField',
    id: 'visible-slice',
    min: [xv0, y - VISIBLE_HALF],
    max: [xv1, y + VISIBLE_HALF],
    cols: VISIBLE_COLS,
    rows: 1,
    values: rgb,
    range: [0, 1],
    colors: 'lightRgb',
  } satisfies ScalarField);

  // ── 축 · 대역 경계 눈금 · 자릿수 눈금 ──
  out.push({
    type: 'lineSet',
    id: 'axis',
    lines: [
      [
        [AXIS.x0, y],
        [AXIS.x1, y],
      ],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies LineSet);
  const decades: Vec2[][] = [];
  for (let d = Math.ceil(Math.log10(c.axisMinEv)); d <= Math.floor(Math.log10(c.axisMaxEv)); d++) {
    const x = X(Math.pow(10, d));
    decades.push([
      [x, y - DECADE_TICK],
      [x, y + DECADE_TICK],
    ]);
  }
  const edges: Vec2[][] = [c.microwaveMinEv, c.infraredMinEv, c.visibleMinEv, c.ultravioletMinEv, c.xrayMinEv].map(
    (ev) => [
      [X(ev), y - EDGE_TICK],
      [X(ev), y + EDGE_TICK],
    ],
  );
  out.push({
    type: 'lineSet',
    id: 'ticks',
    lines: [...decades, ...edges],
    width: TICK_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies LineSet);

  // ── 문턱선 ──
  out.push({
    type: 'lineSet',
    id: 'threshold',
    lines: [
      [
        [xt, y - THRESHOLD_BELOW],
        [xt, y + THRESHOLD_ABOVE],
      ],
    ],
    width: THRESHOLD_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  } satisfies LineSet);

  // ── 이름표 — 축 이름 · 눈금 수 · 대역 이름 · 문턱 ──
  out.push(label('axis-title', text('label.axis'), [AXIS_TITLE_AT[0], y + AXIS_TITLE_AT[1]]));
  for (const t of TICK_LABELS) {
    out.push(label(`tick-${t.key}`, text(t.key), [X(t.ev), y + TICK_LABEL_RISE]));
  }
  for (const b of BANDS) {
    const mid = Math.sqrt(c[b.from] * c[b.to]);
    out.push(label(`name-${b.key}`, text(b.key), [X(mid), y - BAND_LABEL_DROP]));
  }
  out.push(
    label('threshold-label', text('label.threshold'), [xt, y + THRESHOLD_LABEL_RISE], 'accent', {
      e: String(c.thresholdEv),
    }),
  );

  // ── 표지 — 지금 광원이 내는 광자 하나의 에너지 ──
  const xp = X(energyAt(tl, tl.u, c));
  out.push({
    type: 'body',
    id: 'pointer',
    pos: [xp, y - POINTER_GAP],
    shape: 'custom',
    customPath: `M 0 0 L ${-POINTER_HALF} ${-POINTER_HEIGHT} L ${POINTER_HALF} ${-POINTER_HEIGHT} Z`,
    opacity: fade,
    style: { colorRole: 'primary', emphasis: 'strong' },
  } satisfies Body);

  // ── 광원 ──
  out.push({
    type: 'body',
    id: 'source',
    pos: [SOURCE.x, SOURCE.y],
    shape: 'rect',
    size: SOURCE_BODY,
    outline: 'none',
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies Body);

  // ── 광자 — 물결 간격이 파장이다(눌러 편 것) ──
  const packets = snap.photons.map((p) => packet(p, waveSpacing(p.ev, c))).filter((l) => l.length >= 2);
  if (packets.length > 0) {
    out.push({
      type: 'lineSet',
      id: 'photons',
      lines: packets,
      width: PHOTON_WIDTH_PX,
      opacity: fade,
      style: { colorRole: 'primary', emphasis: 'strong' },
    } satisfies LineSet);
  }

  // ── 분자 — 이어진 결합선 · 원자 ──
  const bonds = snap.molecules.filter((m) => !m.broken).map((m) => [m.atoms[0], m.atoms[1]] as Vec2[]);
  if (bonds.length > 0) {
    out.push({
      type: 'lineSet',
      id: 'bonds',
      lines: bonds,
      width: BOND_WIDTH_PX,
      opacity: molAlpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies LineSet);
  }
  // 끊긴 결합 — 점선 흔적. `lineSet` 에 점선이 없어 분자마다 `trajectory` 하나 (장부 G68).
  snap.molecules.forEach((m, i) => {
    if (!m.broken) return;
    out.push({
      type: 'trajectory',
      id: `broken-${i}`,
      points: [m.atoms[0], m.atoms[1]],
      width: BROKEN_WIDTH_PX,
      opacity: molAlpha * BROKEN_OPACITY,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
    } satisfies Trajectory);
  });
  out.push({
    type: 'particleSystem',
    id: 'atoms',
    positions: snap.molecules.flatMap((m) => [m.atoms[0], m.atoms[1]]),
    sizes: ATOM_PX,
    opacity: molAlpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies ParticleSystem);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
