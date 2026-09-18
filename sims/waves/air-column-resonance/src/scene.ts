// ========================================================================
// air-column-resonance — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 관 벽 · 봉투 테두리 · 사다리 커서는
// `trajectory`, 봉투 안 옅은 칠은 `region`, 막힌 끝은 `surface` wall, 공기 알갱이는 `particleSystem`, 음원 판 · 사다리
// 칸은 `body`, 마디는 `marker` pin, 글자는 `readout` 이다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 색은 뜻마다 하나다 — 두 관의 공기는 같은 것이라 같은 먹색, 관 벽 · 봉투 · 사다리 틀은
// 배경 정보라 muted. **강조색은 마디 한 뜻에만** 쓴다 — 크게 울리는 관에서 공기가 움직이지
// 않는 자리. 막힌 끝이 늘 마디라는 것이 그 점으로 보인다. 어느 관이 울리는지를 색으로
// 가르지 않는다 — 알갱이가 흔들리는 크기와 봉투의 부풂이 가른다 (S-piece).
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
import {
  airSeats,
  displacement,
  drivePhase,
  driveRatio,
  loudness,
  nodes,
  readConstants,
  response,
  rings,
  shape,
  type AirColumnResonanceConstants,
  type TubeKind,
} from './physics';
import {
  CLOSED_TUBE_Y,
  LADDER_STEP,
  LADDER_X,
  OPEN_TUBE_Y,
  SCENE_BOUNDS,
  SOURCE_GAP,
  SOURCE_THICKNESS,
  TUBE_RADIUS,
  text,
} from './schema';
import type { AirColumnResonanceState } from './state';

/** 봉투 표본 수 — 다섯째 계단(반파장 2.5 개)에도 고리마다 표본이 70 개쯤 들어간다. */
const ENVELOPE_SAMPLES = 180;
/** 공기 알갱이 — 관 하나에 가로 칸 수 × 세로 줄 수. */
const AIR_COLUMNS = 44;
const AIR_ROWS = 4;
/** 알갱이 크기(화면 px 반지름). */
const AIR_DOT_PX = 1.9;
/** 알갱이가 관 벽에 닿지 않게 세로로 쓰는 몫(관 반지름 비). */
const AIR_FILL = 0.78;
/** 봉투 높이 — 크게 울릴 때 봉투가 관 반지름의 이만큼까지 부푼다. */
const ENVELOPE_FILL = 0.9;
/** 봉투 안 옅은 칠의 불투명도. 알갱이가 비쳐 보이는 정도. */
const ENVELOPE_FILL_OPACITY = 0.22;
/** 관 벽 굵기 · 봉투 굵기 · 커서 굵기(화면 px). */
const WALL_WIDTH_PX = 2;
const ENVELOPE_WIDTH_PX = 1.5;
const CURSOR_WIDTH_PX = 1;
/** 막힌 끝 마개가 관 벽 밖으로 더 뻗는 길이(월드). */
const CAP_OVERHANG = 0.08;
/** 사다리 칸 반지름(월드) · 커서가 위 칸 줄 위로 뻗는 길이(월드). 아래로는 칸에서 멈춘다 — 눈금 글자에 겹치지 않게. */
const SLOT_RADIUS = 0.13;
const CURSOR_OVERHANG = 0.3;
/** 음원 판 높이(관 지름 비). */
const SOURCE_FILL = 0.85;
/** 글자 크기(화면 px). */
const TUBE_LABEL_PX = 13;
const SOURCE_LABEL_PX = 12;
const LADDER_LABEL_PX = 12;
const TICK_LABEL_PX = 12;
/** 글자 띄움(화면 px). */
const TUBE_LABEL_RISE_PX = 11;
const SOURCE_LABEL_GAP_PX = 8;
const LADDER_LABEL_RISE_PX = 11;
const TICK_LABEL_DROP_PX = 22;

const TUBES: readonly { kind: TubeKind; y: number }[] = [
  { kind: 'open', y: OPEN_TUBE_Y },
  { kind: 'closed', y: CLOSED_TUBE_Y },
];

/** 사다리 칸 x — 진동수 m(v/4L 단위)의 자리. 커서는 m 이 연속이라 칸 사이를 미끄러진다. */
function rungX(m: number): number {
  return LADDER_X + (m - 1) * LADDER_STEP;
}

/** 지금 머무는 계단. 옮기는 중이면 0 — 마디를 켜지 않는다. */
function heldRung(tl: TimelineFrame, c: AirColumnResonanceConstants): number {
  if (tl.phase === 'rise' || tl.phase === 'rest' || tl.phase === 'fade') {
    return tl.phase === 'rise' ? 1 : c.rungCount;
  }
  for (let m = 1; m <= c.rungCount; m++) if (tl.phase === `ring-${m}`) return m;
  return 0;
}

/** 이 계단에 벌써 닿았는가 — 사다리 칸을 채운다. */
function reached(tl: TimelineFrame, m: number): boolean {
  return tl.at(`ring-${m}`) > 0;
}

function tube(
  out: Primitive[],
  kind: TubeKind,
  y: number,
  ratio: number,
  phase: number,
  amp: number,
  held: number,
  seats: readonly [number, number][],
  c: AirColumnResonanceConstants,
): void {
  const L = c.tubeLength;
  const top = y + TUBE_RADIUS;
  const bottom = y - TUBE_RADIUS;

  // ---- 봉투 — 공기 변위의 크기를 관 가로로 편 모양 ----
  // 알갱이는 관 방향으로 흔들리지만 그 크기의 분포(배 · 마디)는 세로 높이로 보인다.
  // 봉투 안을 옅게 칠해 알갱이 아래 깔고, 점선 테두리는 알갱이 위에 긋는다 — 알갱이가
  // 빽빽해도 부푼 자리(배)와 오므라든 자리(마디)가 읽히게.
  const envScale = (amp * response(kind, ratio, c) * ENVELOPE_FILL * TUBE_RADIUS) / c.peakDisplacement;
  const upper: Vec2[] = [];
  const lower: Vec2[] = [];
  for (let i = 0; i <= ENVELOPE_SAMPLES; i++) {
    const x = (L * i) / ENVELOPE_SAMPLES;
    const h = envScale * Math.abs(shape(kind, x, ratio, c));
    upper.push([x, y + h]);
    lower.push([x, y - h]);
  }
  out.push({
    type: 'region',
    id: `${kind}-envelope-fill`,
    points: [...upper, ...lower.slice().reverse()],
    fillOpacity: ENVELOPE_FILL_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 공기 알갱이 ----
  const positions: Vec2[] = seats.map(([u, v]) => {
    const x0 = u * L;
    return [x0 + displacement(kind, x0, ratio, phase, amp, c), y + v * AIR_FILL * TUBE_RADIUS];
  });
  out.push({
    type: 'particleSystem',
    id: `${kind}-air`,
    positions,
    sizes: AIR_DOT_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  for (const [side, pts] of [
    ['upper', upper],
    ['lower', lower],
  ] as const) {
    out.push({
      type: 'trajectory',
      id: `${kind}-envelope-${side}`,
      points: pts,
      width: ENVELOPE_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 관 벽 ----
  for (const [id, wy] of [
    [`${kind}-wall-top`, top],
    [`${kind}-wall-bottom`, bottom],
  ] as const) {
    out.push({
      type: 'trajectory',
      id,
      points: [
        [0, wy],
        [L, wy],
      ],
      width: WALL_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }
  if (kind === 'closed') {
    // 마개 — 결은 바깥(오른쪽)에 긋는다. from → to 가 위로 가면 오른쪽이 바깥이다.
    out.push({
      type: 'surface',
      id: 'closed-cap',
      geometry: { kind: 'wall', from: [L, bottom - CAP_OVERHANG], to: [L, top + CAP_OVERHANG] },
      material: 'rough',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 음원 판 — 입구 앞에서 관 방향으로 흔들린다 ----
  out.push({
    type: 'body',
    id: `${kind}-source`,
    pos: [-SOURCE_GAP + amp * c.peakDisplacement * c.damping * Math.cos(phase), y],
    shape: 'rect',
    size: [SOURCE_THICKNESS, 2 * TUBE_RADIUS * SOURCE_FILL],
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 마디 — 크게 울리는 관에서만, 머무는 동안에만 ----
  if (held > 0 && rings(kind, held, c) && amp > 0) {
    nodes(kind, ratio, c).forEach((x, j) => {
      out.push({
        type: 'marker',
        id: `${kind}-node-${j}`,
        kind: 'pin',
        pos: [x, y],
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    });
  }

  // ---- 관 이름 ----
  out.push({
    type: 'readout',
    id: `${kind}-label`,
    anchor: { world: [0, top], offset: [0, -TUBE_LABEL_RISE_PX] },
    text: text(kind === 'open' ? 'label.openTube' : 'label.closedTube'),
    chip: false,
    font: 'text',
    fontSize: TUBE_LABEL_PX,
    align: 'left',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
}

export function scene(params: {
  state: AirColumnResonanceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('air-column-resonance: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const ratio = driveRatio(tl, c);
  const phase = drivePhase(tl, c);
  const amp = loudness(tl);
  const held = heldRung(tl, c);
  const seats = airSeats(c.seed, AIR_COLUMNS, AIR_ROWS);
  const out: Primitive[] = [];

  for (const { kind, y } of TUBES) tube(out, kind, y, ratio, phase, amp, held, seats, c);

  out.push({
    type: 'readout',
    id: 'source-label',
    anchor: { world: [-SOURCE_GAP - SOURCE_THICKNESS, OPEN_TUBE_Y], offset: [-SOURCE_LABEL_GAP_PX, 0] },
    text: text('label.source'),
    chip: false,
    font: 'text',
    fontSize: SOURCE_LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 사다리 — 계단마다 어느 관이 크게 울렸나 ----
  const cursorX = rungX(ratio);
  out.push({
    type: 'trajectory',
    id: 'ladder-cursor',
    points: [
      [cursorX, OPEN_TUBE_Y + CURSOR_OVERHANG],
      [cursorX, CLOSED_TUBE_Y - SLOT_RADIUS],
    ],
    width: CURSOR_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  for (const { kind, y } of TUBES) {
    for (let m = 1; m <= c.rungCount; m++) {
      const lit = rings(kind, m, c) && reached(tl, m);
      out.push({
        type: 'body',
        id: `${kind}-slot-${m}`,
        pos: [rungX(m), y],
        shape: 'circle',
        size: SLOT_RADIUS,
        fill: lit ? 'solid' : 'none',
        outline: lit ? 'none' : 'role',
        glow: false,
        style: { colorRole: lit ? 'ink' : 'muted', emphasis: 'strong' },
      });
    }
  }
  out.push({
    type: 'readout',
    id: 'ladder-label',
    anchor: { world: [rungX((1 + c.rungCount) / 2), OPEN_TUBE_Y + TUBE_RADIUS], offset: [0, -LADDER_LABEL_RISE_PX] },
    text: text('label.ladder'),
    chip: false,
    font: 'text',
    fontSize: LADDER_LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  // 눈금 — 열린 관의 기본 진동수 f₁ 의 배수. 계단 m 은 m/2 · f₁ 이다. 홀수 m 은 분수 `m/2`
  // 그대로, 짝수 m 은 정수 m/2 를 쓴다 — 반올림하는 수가 없다.
  for (let m = 1; m <= c.rungCount; m++) {
    const half = m / 2;
    const odd = m % 2 === 1;
    out.push({
      type: 'readout',
      id: `tick-label-${m}`,
      anchor: { world: [rungX(m), CLOSED_TUBE_Y], offset: [0, TICK_LABEL_DROP_PX] },
      text: odd ? text('label.fHalf') : half === 1 ? text('label.f1') : text('label.fn'),
      vars: { n: String(odd ? m : half) },
      chip: false,
      font: 'text',
      fontSize: TICK_LABEL_PX,
      italic: true,
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
