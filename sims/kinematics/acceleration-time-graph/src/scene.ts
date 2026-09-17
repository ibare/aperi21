// ========================================================================
// acceleration-time-graph — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 넓이 칸은 `region`(깎이는 칸은 `fill: 'hatch'`),
// 축 · 눈금 · 가속도 선 · 시각 선 · 칸 테두리는 `trajectory`, 이름과 값은 `readout`.
// 캡션은 선언의 캡션 슬롯이 그린다.
//
// ---- 월드 = 원본 캔버스 ----
// 원본 860 × 300 캔버스의 px 를 월드 단위로 그대로 쓰고 y 만 뒤집는다(위가 +).
// 두 좌표계가 맞물리는 조건(칸 폭 = 막대 폭, 1 m/s² 높이 = 1 m/s 높이)이 원본 상수에
// 들어 있어서, 옮기면서 따로 맞출 것이 없다.
// ========================================================================

import type {
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { formatValue, readTiming, slabProgress, velocityBefore } from './physics';
import { ACCEL, FONT, LAYOUT as L, SEGMENTS, text } from './schema';
import type { AccelerationTimeGraphState } from './state';

/** 원본 캔버스 좌표(px, y 아래로)를 월드로. */
const W = (x: number, y: number): Vec2 => [x, L.height - y];

// ------------------------------------------------------------------------
// 색 — 파랑 하나 = 넓이. 나머지는 먹과 회색
// ------------------------------------------------------------------------
// 넓이는 어디에 있든(그래프 안 · 날아가는 중 · 막대 안 · 깎이는 중) 같은 파랑이다.
// 축 아래 칸은 색을 바꾸지 않고 점선 테두리와 빗금으로 가른다.

/** 원본 INK(짙은 먹) — 가속도 선 · 값. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 원본 FAINT(옅은 회색) — 축 · 눈금 · 시각 선 · 이름. */
const FAINT = { colorRole: 'muted', emphasis: 'subtle' } as const;
const FAINT_TEXT = { colorRole: 'muted', emphasis: 'medium' } as const;
/** 원본 FILL / FILL_EDGE — 같은 파랑의 채움과 테두리. */
const AREA = { colorRole: 'secondary', emphasis: 'strong' } as const;
/** 원본 FILL 의 알파 0.55. */
const AREA_FILL = 0.55;

// ------------------------------------------------------------------------
// 원본 배치 상수 (px)
// ------------------------------------------------------------------------

const DURATION = ACCEL.length;
/** 시간 축 끝이 마지막 눈금을 넘는 길이. */
const AXIS_OVERRUN = 14;
/** 축 이름 두 개가 놓이는 열(원본 '가속도' 의 x). */
const AXIS_NAME_X = 8;
/** 눈금 반길이. */
const TICK = 3;
/** 지금 시각 선의 위 · 아래 길이(축 기준). */
const NOW_UP = 100;
const NOW_DOWN = 80;
/** '1 s' 폭 표시 — 축 아래 거리와 글자 기준선. */
const SECOND_BAR_DY = 78;
const SECOND_TEXT_DY = 90;
/** 막대 바닥선이 막대 밖으로 나오는 길이. */
const BAR_FLOOR_OVERRUN = 16;
/** 칸을 들어 올리는 높이 — 둘 중 높은 쪽보다 이만큼 위를 지난다. */
const LIFT = 60;
const LIFT_CEILING = 4;
/** 캔버스 글자 기준선 → readout 세로 가운데. 글자 크기에 비례한다. */
const BASELINE_TO_MIDDLE = 0.35;

// ------------------------------------------------------------------------
// 선언 도우미
// ------------------------------------------------------------------------

function line(
  id: string,
  points: readonly Vec2[],
  width: number,
  style: Trajectory['style'],
  opacity = 1,
): Trajectory {
  return { type: 'trajectory', id, points, width, style, opacity };
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 원본 사각형(px)을 월드 꼭짓점으로. */
function corners(r: Rect): Vec2[] {
  return [W(r.x, r.y), W(r.x + r.w, r.y), W(r.x + r.w, r.y + r.h), W(r.x, r.y + r.h)];
}

function area(id: string, r: Rect, opacity = 1, fill: Region['fill'] = 'solid'): Region {
  return {
    type: 'region',
    id,
    points: corners(r),
    style: AREA,
    fillOpacity: AREA_FILL,
    fill,
    opacity,
  };
}

/** 원본 `strokeRect(x+.5, y+.5, w−1, h−1)` — 칸 안쪽으로 반 픽셀 들인 1px 테두리. */
function edge(id: string, r: Rect, dashed: boolean, opacity = 1): Trajectory {
  const inset = { x: r.x + 0.5, y: r.y + 0.5, w: r.w - 1, h: Math.max(0, r.h - 1) };
  return {
    type: 'trajectory',
    id,
    points: corners(inset),
    closed: true,
    width: 1,
    style: { ...AREA, lineStyle: dashed ? 'dashed' : 'solid' },
    opacity,
  };
}

/** 원본 `fillText(s, x, y)` 기준선 자리의 글. */
function label(
  id: string,
  x: number,
  baseline: number,
  body: Readout['text'],
  opts: {
    align: 'left' | 'center' | 'right';
    fontSize: number;
    style: Readout['style'];
    vars?: Readout['vars'];
    opacity?: number;
  },
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: W(x, baseline - opts.fontSize * BASELINE_TO_MIDDLE) },
    text: body,
    vars: opts.vars,
    chip: false,
    align: opts.align,
    font: 'text',
    fontSize: opts.fontSize,
    style: opts.style,
    opacity: opts.opacity,
  };
}

/** 칸 k 의 그래프 위 사각형. */
function slabInGraph(k: number): Rect {
  const a = ACCEL[k]!;
  const h = Math.abs(a) * L.pxPerA;
  return { x: L.graphX0 + L.pxPerS * k, y: a >= 0 ? L.axisY - h : L.axisY, w: L.pxPerS, h };
}

/** 칸 k 가 막대에 닿는 자리. 양의 칸은 쌓인 꼭대기 위에, 음의 칸은 꼭대기에서 아래로 겹친다. */
function slabOnBar(k: number): Rect {
  const a = ACCEL[k]!;
  const h = Math.abs(a) * L.pxPerA;
  const top = L.barBase - velocityBefore(k) * L.pxPerA;
  return { x: L.barX, y: a >= 0 ? top - h : top, w: L.pxPerS, h };
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: AccelerationTimeGraphState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('acceleration-time-graph: schema.timeline 이 선언되어야 한다');
  const timing = readTiming(params.stage);
  const fade = 1 - tl.at('fade');
  const slabs = ACCEL.map((_, k) => slabProgress(tl, timing, k));
  const axisEnd = L.graphX0 + L.pxPerS * DURATION + AXIS_OVERRUN;
  const out: Primitive[] = [];

  // ---- 시간 축 ----
  out.push(line('axis', [W(L.graphX0, L.axisY + 0.5), W(axisEnd, L.axisY + 0.5)], 1, FAINT));
  for (let s = 0; s <= DURATION; s++) {
    const x = L.graphX0 + L.pxPerS * s + 0.5;
    out.push(line(`tick-${s}`, [W(x, L.axisY - TICK), W(x, L.axisY + TICK)], 1, FAINT));
  }
  // 원본은 '시간' 을 축 끝 오른쪽, 축과 같은 높이에 두었다. 마지막 칸이 떠날 때 그 칸의
  // 넓이 값(−1.5 m/s)이 이 글자에 붙어 한 덩이로 읽혔다. 축 끝은 칸이 막대로 날아가는
  // 길목이라 그 근처 어디에 두어도 어느 칸의 값 글자가 지나간다(칸 여섯의 비행 경로를
  // 계산해 확인했다). 칸이 한 번도 지나지 않는 **축 시작 왼쪽**, '가속도' 와 같은 열로 옮긴다.
  out.push(
    label('axis-t', AXIS_NAME_X, L.axisY + 4, text('label.axisT'), {
      align: 'left',
      fontSize: FONT.label,
      style: FAINT_TEXT,
    }),
  );
  out.push(
    label('axis-a', AXIS_NAME_X, 30, text('label.axisA'), {
      align: 'left',
      fontSize: FONT.label,
      style: FAINT_TEXT,
    }),
  );
  // 한 칸의 폭이 1 초라는 것만 알린다.
  out.push(
    label('second', L.graphX0 + L.pxPerS * 0.5, L.axisY + SECOND_TEXT_DY, text('label.second'), {
      align: 'center',
      fontSize: FONT.label,
      style: FAINT_TEXT,
    }),
  );
  out.push(
    line(
      'second-bar',
      [W(L.graphX0 + 0.5, L.axisY + SECOND_BAR_DY), W(L.graphX0 + L.pxPerS - 0.5, L.axisY + SECOND_BAR_DY)],
      1,
      FAINT,
    ),
  );

  // ---- 채워지는 넓이 (지금 훑고 있는 칸) ----
  slabs.forEach((s, k) => {
    if (ACCEL[k] === 0 || s.fill <= 0 || s.fill >= 1) return;
    const r = slabInGraph(k);
    out.push(area(`filling-${k}`, { ...r, w: r.w * s.fill }, fade));
  });

  // ---- 떠난 넓이 자리 ----
  slabs.forEach((s, k) => {
    if (ACCEL[k] === 0 || s.fill < 1) return;
    out.push(edge(`ghost-${k}`, slabInGraph(k), true, fade));
  });

  // ---- 가속도 선 ----
  const steps: Vec2[] = [];
  ACCEL.forEach((a, k) => {
    const y = L.axisY - a * L.pxPerA;
    const x0 = L.graphX0 + L.pxPerS * k;
    steps.push(W(x0, y), W(x0 + L.pxPerS, y));
  });
  out.push(line('accel', steps, 2, INK));
  for (const [s0, s1] of SEGMENTS) {
    const a = ACCEL[s0]!;
    const x = L.graphX0 + (L.pxPerS * (s0 + s1)) / 2;
    const baseline = a >= 0 ? L.axisY - a * L.pxPerA - 8 : L.axisY - a * L.pxPerA + 18;
    out.push(
      label(`accel-${s0}`, x, baseline, text('label.accel'), {
        align: 'center',
        fontSize: FONT.label,
        style: INK,
        vars: { a: formatValue(a) },
      }),
    );
  }

  // ---- 지금 시각 선 ----
  const sweep = tl.span(0, DURATION);
  if (sweep < 1) {
    const x = L.graphX0 + L.pxPerS * DURATION * sweep + 0.5;
    out.push(line('now', [W(x, L.axisY - NOW_UP), W(x, L.axisY + NOW_DOWN)], 1, FAINT));
  }

  // ---- 속도 변화 막대 ----
  out.push(
    line(
      'bar-floor',
      [W(L.barX - BAR_FLOOR_OVERRUN, L.barBase + 0.5), W(L.barX + L.pxPerS + BAR_FLOOR_OVERRUN, L.barBase + 0.5)],
      1,
      FAINT,
      fade,
    ),
  );
  out.push(
    label('bar-name', L.barX + L.pxPerS / 2, L.barBase + 16, text('label.bar'), {
      align: 'center',
      fontSize: FONT.label,
      style: FAINT_TEXT,
      opacity: fade,
    }),
  );

  // 지금 막대 높이(m/s) — 깎이는 동안은 깎인 만큼 내려간다.
  let barTop = 0;
  slabs.forEach((s, k) => {
    const a = ACCEL[k]!;
    if (a > 0 && s.landed) barTop = velocityBefore(k) + a;
    if (a < 0 && s.landed) barTop = velocityBefore(k) + a * s.erase;
  });
  const barTopY = L.barBase - barTop * L.pxPerA;

  // 내려앉은 양의 칸. 깎여 나간 윗부분은 선언하지 않는다 — 원본은 흰 사각형으로
  // 덮어 지웠고, 여기서는 남은 높이까지만 칸을 둔다. 남은 꼭대기 테두리도 같이 나온다.
  slabs.forEach((s, k) => {
    if (ACCEL[k]! <= 0 || !s.landed) return;
    const r = slabOnBar(k);
    const top = Math.max(r.y, barTopY);
    const bottom = r.y + r.h;
    if (bottom - top <= 0) return;
    const kept = { ...r, y: top, h: bottom - top };
    out.push(area(`stacked-${k}`, kept, fade));
    out.push(edge(`stacked-edge-${k}`, kept, false, fade));
  });

  // ---- 깎이는 넓이 ----
  // 축 아래 칸이 막대 꼭대기에 겹쳐 내려앉고, 겹친 부분과 함께 위에서부터 줄어든다.
  // 같은 파랑의 다른 몫이라 색이 아니라 결(빗금)로 가른다.
  slabs.forEach((s, k) => {
    if (ACCEL[k]! >= 0 || !s.landed || s.settled) return;
    const r = slabOnBar(k);
    const remain = r.h * (1 - s.erase);
    const cut = { ...r, y: r.y + r.h - remain, h: remain };
    if (remain <= 0) return;
    out.push(area(`erasing-${k}`, cut, 1, 'hatch'));
    out.push(edge(`erasing-edge-${k}`, cut, true));
  });

  // ---- 옮겨지는 넓이 칸 ----
  slabs.forEach((s, k) => {
    const a = ACCEL[k]!;
    if (a === 0 || s.fill < 1 || s.landed) return;
    const p = s.flight;
    const from = slabInGraph(k);
    const to = slabOnBar(k);
    // 그래프 위 빈 곳으로 들어 올렸다가 막대에 내려놓는 이차 곡선.
    const apex = Math.max(LIFT_CEILING, Math.min(from.y, to.y) - LIFT);
    const ctrl = 2 * apex - (from.y + to.y) / 2;
    const r: Rect = {
      x: from.x + (to.x - from.x) * p,
      y: (1 - p) * (1 - p) * from.y + 2 * p * (1 - p) * ctrl + p * p * to.y,
      w: from.w,
      h: from.h,
    };
    out.push(area(`flying-${k}`, r));
    out.push(edge(`flying-edge-${k}`, r, a < 0));
    out.push(
      label(`flying-value-${k}`, r.x + r.w / 2, r.y + r.h / 2 + 5, text('label.velocity'), {
        align: 'center',
        fontSize: FONT.label,
        style: INK,
        vars: { v: (a > 0 ? '+' : '') + formatValue(a) },
      }),
    );
  });

  // ---- 속도 변화 값 (내려앉기가 끝난 합만 적는다) ----
  let settled = 0;
  slabs.forEach((s, k) => {
    if (s.settled) settled = velocityBefore(k) + ACCEL[k]!;
  });
  out.push(
    label(
      'bar-value',
      L.barX + L.pxPerS + 10,
      Math.min(L.barBase - 6, barTopY + 5),
      text('label.velocity'),
      { align: 'left', fontSize: FONT.value, style: INK, vars: { v: formatValue(settled) }, opacity: fade },
    ),
  );

  return out;
}

/**
 * 고정 경계. 원본 캔버스 한 장(860 × 300)을 그대로 담고, 아래로 캡션 자리를 더 잡는다.
 * 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
 */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { minX: 0, maxX: L.width, minY: -L.captionRoom, maxY: L.height };
}
