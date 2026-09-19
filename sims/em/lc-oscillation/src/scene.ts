// ========================================================================
// lc-oscillation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 도선 · 판(lineSet) · 코일
// (trajectory) · 판 위 +/− 와 전기력선(lineSet, 가닥별 불투명도) · 코일을 꿰는 자기력선
// (lineSet, 닫힌 고리) · 전류(vector) · 에너지 막대(region + trajectory) · 이름표(readout).
//
// 색은 대상에 묶는다 — 판의 전하 · 판 사이 장 · 전기 막대는 `secondary`(축전기에 든 것),
// 코일을 꿰는 장 · 자기 막대는 `primary`(코일에 든 것). **강조색은 「합」 한 뜻에만**
// (막대 위의 선과 그 이름표). 도선 · 판 · 코일 · 전류 화살표는 먹색, 막대 틀은 muted.
// 전하 부호와 장의 방향은 색이 아니라 표식(+ · −)과 꺾쇠 방향으로 가른다 (S-piece).
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
import { peakCurrent, phaseAngle, readCircuit, readConstants } from './physics';
import {
  BAR_B_LEFT,
  BAR_B_RIGHT,
  BAR_BOTTOM,
  BAR_E_LEFT,
  BAR_E_RIGHT,
  BAR_HEIGHT,
  CHEVRON,
  COIL_CENTER_Y,
  COIL_HALF_HEIGHT,
  COIL_RADIUS,
  COIL_TILT,
  COIL_TURNS,
  CURRENT_ARROW_LIFT,
  FIELD_INSET,
  LOOP_BOTTOM,
  LOOP_HALF_H_BASE,
  LOOP_HALF_H_STEP,
  LOOP_INNER_BASE,
  LOOP_INNER_STEP,
  LOOP_LEFT,
  LOOP_OUTER_BASE,
  LOOP_OUTER_STEP,
  LOOP_RIGHT,
  LOOP_TOP,
  MARK_HALF,
  MARK_INSET,
  PLATE_BOTTOM_Y,
  PLATE_HALF_WIDTH,
  PLATE_MARGIN,
  PLATE_TOP_Y,
  SCENE_BOUNDS,
  TOTAL_OVERHANG,
  text,
  type LcOscillationMessageKey,
} from './schema';
import type { LcOscillationState } from './state';

// ------------------------------------------------------------------------
// 굵기 · 글자 · 짙기 (화면 px · 0~1)
// ------------------------------------------------------------------------

const WIRE_WIDTH = 2;
const PLATE_WIDTH = 4;
const COIL_WIDTH = 2;
const MARK_WIDTH = 1.8;
const E_FIELD_WIDTH = 1.4;
const B_FIELD_WIDTH = 1.4;
const FRAME_WIDTH = 1;
const TOTAL_WIDTH = 2;
const SYMBOL_PX = 14;
const BAR_LABEL_PX = 12;
/** 막대 채움 짙기. 틀 안에서 찬 만큼이 또렷해야 한다. */
const BAR_FILL = 0.78;
/** 이름표를 앵커에서 띄우는 거리(화면 px). */
const LABEL_GAP = 12;
/** 이만큼(월드)보다 짧은 전류 화살표는 그리지 않는다 — 전류 0 인 순간 촉만 남는다. */
const MIN_ARROW = 0.05;
/** 코일 한 바퀴 · 자기력선 고리 한 바퀴의 표본 수. */
const COIL_SAMPLES_PER_TURN = 24;
const LOOP_SAMPLES = 48;
/** 부동소수 여유 — 30/3 이 10.000…1 로 올림되어 빈 자리가 하나 더 생기지 않게. */
const COUNT_EPS = 1e-9;

// ------------------------------------------------------------------------
// 도우미
// ------------------------------------------------------------------------

/**
 * 가운데부터 채우는 순위. 칸 `n` 개 중 가운데에 가까운 칸이 먼저 찬다 — 장이 세질수록
 * 가닥이 가운데에서 바깥으로 늘어난다. 같은 거리면 왼쪽이 먼저.
 */
function centerOutRanks(n: number): number[] {
  const mid = (n - 1) / 2;
  const order = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b,
  );
  const ranks = new Array<number>(n);
  order.forEach((idx, r) => {
    ranks[idx] = r;
  });
  return ranks;
}

/** 순위 `rank` 칸의 짙기 — 채움 양 `amount`(칸 수)에서 앞 칸들이 가져가고 남은 몫. */
function fillAlpha(amount: number, rank: number): number {
  return Math.max(0, Math.min(1, amount - rank));
}

/** 세로 꺾쇠. `dir` 이 +1 이면 위, −1 이면 아래를 가리킨다. */
function chevron(x: number, y: number, dir: number): Vec2[] {
  const h = CHEVRON / 2;
  return [
    [x - CHEVRON, y - dir * h],
    [x, y + dir * h],
    [x + CHEVRON, y - dir * h],
  ];
}

function label(
  id: string,
  key: LcOscillationMessageKey,
  pos: Vec2,
  offset: Vec2,
  align: 'left' | 'center' | 'right',
  fontSize: number,
  style: Readout['style'],
  italic = false,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos, offset },
    text: text(key),
    chip: false,
    font: 'text',
    align,
    fontSize,
    italic,
    style,
  };
}

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const ELECTRIC = { colorRole: 'secondary', emphasis: 'strong' } as const;
const MAGNETIC = { colorRole: 'primary', emphasis: 'strong' } as const;
const TOTAL = { colorRole: 'accent', emphasis: 'strong' } as const;

export function scene(params: {
  state: LcOscillationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('lc-oscillation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const now = readCircuit(phaseAngle(timeline), c);
  const out: Primitive[] = [];

  const coilTop = COIL_CENTER_Y + COIL_HALF_HEIGHT;
  const coilBottom = COIL_CENTER_Y - COIL_HALF_HEIGHT;

  // ---- 코일을 꿰는 자기력선 — 코일 속을 지나 양옆 바깥으로 돌아 나오는 닫힌 고리 ----
  // 가닥 수 ∝ |I| (코일 속 장의 세기). 안쪽 가닥부터 찬다. 방향은 전류를 따라 뒤집힌다:
  // I > 0(코일 속을 아래로 흐름)일 때 코일 속 장은 아래, 바깥으로 돌아오는 변은 위.
  const bSlots = Math.ceil(peakCurrent(c) / c.currentPerLine - COUNT_EPS);
  const bAmount = Math.abs(now.current) / c.currentPerLine;
  const outsideDir = now.current >= 0 ? 1 : -1;
  const bLines: Vec2[][] = [];
  const bAlpha: number[] = [];
  for (let k = 0; k < bSlots; k++) {
    const a = fillAlpha(bAmount, k);
    if (a <= 0) continue;
    const inner = LOOP_INNER_BASE + LOOP_INNER_STEP * k;
    const outer = LOOP_OUTER_BASE + LOOP_OUTER_STEP * k;
    const halfH = LOOP_HALF_H_BASE + LOOP_HALF_H_STEP * k;
    for (const side of [1, -1]) {
      const cx = LOOP_RIGHT + side * (inner + outer) / 2;
      const rx = (outer - inner) / 2;
      const loop: Vec2[] = [];
      for (let i = 0; i <= LOOP_SAMPLES; i++) {
        const t = (2 * Math.PI * i) / LOOP_SAMPLES;
        loop.push([cx + rx * Math.cos(t), COIL_CENTER_Y + halfH * Math.sin(t)]);
      }
      bLines.push(loop, chevron(LOOP_RIGHT + side * outer, COIL_CENTER_Y, outsideDir));
      bAlpha.push(a, a);
    }
  }
  out.push({
    type: 'lineSet',
    id: 'magnetic-field',
    lines: bLines,
    opacities: bAlpha,
    width: B_FIELD_WIDTH,
    style: MAGNETIC,
  });

  // ---- 도선 ----
  out.push({
    type: 'lineSet',
    id: 'wires',
    lines: [
      [[LOOP_LEFT, LOOP_TOP], [LOOP_LEFT, PLATE_TOP_Y]],
      [[LOOP_LEFT, PLATE_BOTTOM_Y], [LOOP_LEFT, LOOP_BOTTOM]],
      [[LOOP_LEFT, LOOP_TOP], [LOOP_RIGHT, LOOP_TOP]],
      [[LOOP_LEFT, LOOP_BOTTOM], [LOOP_RIGHT, LOOP_BOTTOM]],
      [[LOOP_RIGHT, LOOP_TOP], [LOOP_RIGHT, coilTop]],
      [[LOOP_RIGHT, coilBottom], [LOOP_RIGHT, LOOP_BOTTOM]],
    ],
    width: WIRE_WIDTH,
    style: INK,
  });

  // ---- 코일 — 옆에서 본 나선 ----
  const coil: Vec2[] = [];
  const samples = COIL_TURNS * COIL_SAMPLES_PER_TURN;
  for (let i = 0; i <= samples; i++) {
    const phi = (2 * Math.PI * COIL_TURNS * i) / samples;
    const s = i / samples;
    coil.push([
      LOOP_RIGHT + COIL_RADIUS * Math.sin(phi),
      coilTop - 2 * COIL_HALF_HEIGHT * s - COIL_TILT * (1 - Math.cos(phi)),
    ]);
  }
  out.push({ type: 'trajectory', id: 'coil', points: coil, width: COIL_WIDTH, style: INK });

  // ---- 축전기 판 ----
  const plateL = LOOP_LEFT - PLATE_HALF_WIDTH;
  const plateR = LOOP_LEFT + PLATE_HALF_WIDTH;
  out.push({
    type: 'lineSet',
    id: 'plates',
    lines: [
      [[plateL, PLATE_TOP_Y], [plateR, PLATE_TOP_Y]],
      [[plateL, PLATE_BOTTOM_Y], [plateR, PLATE_BOTTOM_Y]],
    ],
    width: PLATE_WIDTH,
    style: INK,
  });

  // ---- 판의 전하와 판 사이 전기력선 ----
  // 표식 하나 = 전하 `chargePerMark`, 가닥 하나가 그 표식에서 나와 반대 판의 표식으로 간다.
  // 개수 ∝ |q| (판 사이 장의 세기). 가운데부터 찬다. 마지막 하나는 불투명도로 분수.
  const eSlots = Math.ceil(c.initialCharge / c.chargePerMark - COUNT_EPS);
  const eAmount = Math.abs(now.charge) / c.chargePerMark;
  const eRanks = centerOutRanks(eSlots);
  const topPositive = now.charge >= 0;
  const fieldDir = topPositive ? -1 : 1;
  const span = plateR - plateL - 2 * PLATE_MARGIN;
  const topMarkY = PLATE_TOP_Y - MARK_INSET;
  const bottomMarkY = PLATE_BOTTOM_Y + MARK_INSET;
  const fieldTop = PLATE_TOP_Y - FIELD_INSET;
  const fieldBottom = PLATE_BOTTOM_Y + FIELD_INSET;
  const fieldMid = (fieldTop + fieldBottom) / 2;
  const marks: Vec2[][] = [];
  const markAlpha: number[] = [];
  const eLines: Vec2[][] = [];
  const eAlpha: number[] = [];
  for (let i = 0; i < eSlots; i++) {
    const a = fillAlpha(eAmount, eRanks[i]!);
    if (a <= 0) continue;
    const x = eSlots === 1 ? LOOP_LEFT : plateL + PLATE_MARGIN + (span * i) / (eSlots - 1);
    const plusY = topPositive ? topMarkY : bottomMarkY;
    const minusY = topPositive ? bottomMarkY : topMarkY;
    marks.push(
      [[x - MARK_HALF, plusY], [x + MARK_HALF, plusY]],
      [[x, plusY - MARK_HALF], [x, plusY + MARK_HALF]],
      [[x - MARK_HALF, minusY], [x + MARK_HALF, minusY]],
    );
    markAlpha.push(a, a, a);
    eLines.push([[x, fieldTop], [x, fieldBottom]], chevron(x, fieldMid, fieldDir));
    eAlpha.push(a, a);
  }
  out.push({
    type: 'lineSet',
    id: 'electric-field',
    lines: eLines,
    opacities: eAlpha,
    width: E_FIELD_WIDTH,
    style: ELECTRIC,
  });
  out.push({
    type: 'lineSet',
    id: 'plate-charges',
    lines: marks,
    opacities: markAlpha,
    width: MARK_WIDTH,
    style: ELECTRIC,
  });

  // ---- 전류 — 윗도선 위의 화살표. 길이 ∝ I, 방향이 전류를 따라 뒤집힌다 ----
  const arrowLen = now.current * c.currentArrowScale;
  if (Math.abs(arrowLen) > MIN_ARROW) {
    const mid = (LOOP_LEFT + LOOP_RIGHT) / 2;
    out.push({
      type: 'vector',
      id: 'current',
      from: [mid - arrowLen / 2, LOOP_TOP + CURRENT_ARROW_LIFT],
      delta: [arrowLen, 0],
      label: text('label.current'),
      style: INK,
    });
  }

  // ---- 소자 이름표 ----
  out.push(
    label('capacitor-label', 'label.capacitor', [plateL, (PLATE_TOP_Y + PLATE_BOTTOM_Y) / 2], [-LABEL_GAP, 0], 'right', SYMBOL_PX, INK, true),
  );
  out.push(
    label('inductor-label', 'label.inductor', [LOOP_RIGHT, LOOP_TOP], [LABEL_GAP, -LABEL_GAP], 'left', SYMBOL_PX, INK, true),
  );

  // ---- 에너지 막대 둘 — 틀 높이가 합 E. 한쪽이 빈 만큼 다른 쪽이 찬다 ----
  const bars: {
    id: string;
    left: number;
    right: number;
    share: number;
    style: typeof ELECTRIC | typeof MAGNETIC;
    label: LcOscillationMessageKey;
  }[] = [
    { id: 'electric', left: BAR_E_LEFT, right: BAR_E_RIGHT, share: now.electricShare, style: ELECTRIC, label: 'label.electric' },
    { id: 'magnetic', left: BAR_B_LEFT, right: BAR_B_RIGHT, share: now.magneticShare, style: MAGNETIC, label: 'label.magnetic' },
  ];
  const barTop = BAR_BOTTOM + BAR_HEIGHT;
  for (const b of bars) {
    const fillTop = BAR_BOTTOM + BAR_HEIGHT * b.share;
    out.push({
      type: 'region',
      id: `bar-${b.id}`,
      points: [
        [b.left, BAR_BOTTOM],
        [b.right, BAR_BOTTOM],
        [b.right, fillTop],
        [b.left, fillTop],
      ],
      fillOpacity: BAR_FILL,
      opaque: true,
      style: b.style,
    });
    out.push({
      type: 'trajectory',
      id: `frame-${b.id}`,
      points: [
        [b.left, BAR_BOTTOM],
        [b.right, BAR_BOTTOM],
        [b.right, barTop],
        [b.left, barTop],
      ],
      closed: true,
      width: FRAME_WIDTH,
      style: MUTED,
    });
    out.push(
      label(`label-${b.id}`, b.label, [(b.left + b.right) / 2, BAR_BOTTOM], [0, LABEL_GAP], 'center', BAR_LABEL_PX, b.style),
    );
  }

  // 합의 선. 두 막대 꼭대기에 늘 같은 자리로 걸려 있다 — 이 선이 움직이지 않는다는 것이 주장이다.
  out.push({
    type: 'trajectory',
    id: 'total',
    points: [
      [BAR_E_LEFT - TOTAL_OVERHANG, barTop],
      [BAR_B_RIGHT + TOTAL_OVERHANG, barTop],
    ],
    width: TOTAL_WIDTH,
    style: TOTAL,
  });
  out.push(
    label('total-label', 'label.total', [(BAR_E_LEFT + BAR_B_RIGHT) / 2, barTop], [0, -LABEL_GAP], 'center', BAR_LABEL_PX, TOTAL),
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
