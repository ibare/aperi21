// ========================================================================
// rc-circuit — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음.
//
// 회로 기호 · 도선은 `trajectory` · `lineSet`, 스위치 접점은 `body` 점, 흐르는 전하와
// 곡선의 지금 점은 `particleSystem`, 극판의 +/− 는 `lineSet` 의 선별 불투명도, 그래프는
// 월드 좌표에 직접 놓은 `lineSet` · `trajectory` · `readout` 이다.
//
// 색 — 파랑(`secondary`) = 전하 Q 하나(도선의 점 · 극판의 +/− · 축전기 전압 곡선),
// 주황(`accent`) = "남은 차이" 하나(그래프 막대 · 저항 아래 막대 · ×0.368). 나머지는 먹 · 회색.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  LineSet,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { gapOf, tauMarks, vAt, voltageTrace } from './physics';
import {
  BAT,
  CANVAS_H,
  CHARGE_SPAN,
  CIRCUIT_SHIFT,
  CYCLE,
  DOT_GAP,
  GRAPH,
  PLATE,
  RES,
  SCENE_BOUNDS,
  SW_A,
  SW_B,
  SW_P,
  text,
  type RcCircuitMessageKey,
} from './schema';
import type { RcCircuitState } from './state';

// ------------------------------------------------------------------------
// 원본 캔버스 좌표(px, y 아래) → 월드(y 위)
// ------------------------------------------------------------------------

/** 그래프 · 캡션 쪽 좌표. */
const at = (x: number, y: number): Vec2 => [x, CANVAS_H - y];
/** 회로 쪽 좌표 — 원본은 회로 전체를 `CIRCUIT_SHIFT` 만큼 밀어 그렸다. */
const ct = (x: number, y: number): Vec2 => at(x + CIRCUIT_SHIFT, y);

const gx = (u: number): number => GRAPH.x0 + (GRAPH.x1 - GRAPH.x0) * (u / CYCLE);
const gy = (v: number): number => GRAPH.bottom - (GRAPH.bottom - GRAPH.top) * v;

// ------------------------------------------------------------------------
// 글자 크기 · 선 굵기 (원본 조각이 정한 위계, 화면 px)
// ------------------------------------------------------------------------

const LABEL_PX = 12;
const TICK_PX = 11;
const RATIO_PX = 9.5;
const WIRE_W = 2;
const SYMBOL_W = 2;
const BAT_NEG_W = 5;
const PLATE_W = 3;
const CHARGE_SIGN_W = 1.8;
const GRID_W = 1;
const CURVE_W = 2.2;
const MARK_W = 2;
const MARK_OPACITY = 0.6;
const GAP_NOW_W = 3.5;
const GAP_BAR_W = 5;
const DOT_R = 3.2;
const NOW_DOT_R = 4;
/** 이름표를 앵커 왼쪽으로 띄우는 거리(px). 원본 `GX0 - 6`. */
const LABEL_GAP = 6;

// ------------------------------------------------------------------------
// 회로 경로 — 흐르는 전하 점이 따라가는 길
// ------------------------------------------------------------------------

const CHARGE_PATH: readonly (readonly [number, number])[] = [
  [330, PLATE.bottom], [330, 260], [60, 260], [60, BAT.neg], [60, BAT.pos],
  [60, 50], SW_A, SW_P, [330, 50], [330, PLATE.top],
];
const DISCHARGE_PATH: readonly (readonly [number, number])[] = [
  [330, PLATE.top], [330, 50], SW_P, SW_B, [104, 260], [330, 260], [330, PLATE.bottom],
];

/** 경로를 따라 `offset` 부터 `spacing` 간격으로 점을 놓는다 (원본 `pointsAlong`). */
function pointsAlong(
  path: readonly (readonly [number, number])[],
  offset: number,
  spacing: number,
): [number, number][] {
  const out: [number, number][] = [];
  let acc = 0;
  let next = offset;
  for (let i = 0; i < path.length - 1; i++) {
    const [x0, y0] = path[i]!;
    const [x1, y1] = path[i + 1]!;
    const len = Math.hypot(x1 - x0, y1 - y0);
    while (next <= acc + len) {
      const f = (next - acc) / len;
      out.push([x0 + (x1 - x0) * f, y0 + (y1 - y0) * f]);
      next += spacing;
    }
    acc += len;
  }
  return out;
}

// ------------------------------------------------------------------------
// 조립 도우미
// ------------------------------------------------------------------------

function line(id: string, points: Vec2[], width: number, style: Trajectory['style']): Trajectory {
  return { type: 'trajectory', id, points, width, style };
}

function label(
  id: string,
  key: RcCircuitMessageKey,
  pos: Vec2,
  align: 'left' | 'center' | 'right',
  fontSize: number,
  style: Readout['style'],
  vars?: Record<string, string | number>,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text(key),
    ...(vars ? { vars } : {}),
    chip: false,
    font: 'text',
    align,
    fontSize,
    style,
  };
}

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const WIRE = { colorRole: 'ink', emphasis: 'medium' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const FAINT = { colorRole: 'muted', emphasis: 'subtle' } as const;
const CHARGE = { colorRole: 'secondary', emphasis: 'strong' } as const;
const GAP = { colorRole: 'accent', emphasis: 'strong' } as const;

export function scene(params: {
  state: RcCircuitState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
}): SceneGraph {
  const s = params.state;
  const charging = s.charging;
  const v = vAt(s.v0, s.u);
  const gapNow = gapOf(v, charging);
  const out: Primitive[] = [];

  // ---- 회로 도선 ----
  const wires: LineSet = {
    type: 'lineSet',
    id: 'wires',
    lines: [
      [ct(60, 50), ct(60, BAT.pos)],
      [ct(60, BAT.neg), ct(60, 260)],
      [ct(60, 50), ct(SW_A[0], 50)],
      [ct(SW_P[0], 50), ct(RES.left, 50)],
      [ct(RES.right, 50), ct(330, 50)],
      [ct(330, 50), ct(330, PLATE.top)],
      [ct(330, PLATE.bottom), ct(330, 260)],
      [ct(60, 260), ct(330, 260)],
      [ct(SW_B[0], SW_B[1]), ct(SW_B[0], 260)],
    ],
    width: WIRE_W,
    style: WIRE,
  };
  out.push(wires);
  // 우회 도선이 아래 도선에 닿는 이음점.
  out.push({ type: 'body', id: 'wire-joint', shape: 'point', pos: ct(SW_B[0], 260), style: WIRE });

  // ---- 전지 ----
  out.push(line('battery-long', [ct(40, BAT.pos), ct(80, BAT.pos)], SYMBOL_W, INK));
  out.push(line('battery-short', [ct(50, BAT.neg), ct(70, BAT.neg)], BAT_NEG_W, INK));
  out.push(label('battery-label', 'label.battery', ct(30, (BAT.pos + BAT.neg) / 2), 'right', LABEL_PX, MUTED));

  // ---- 저항 ----
  const zig: Vec2[] = [ct(RES.left, 50)];
  const n = 6;
  const seg = (RES.right - RES.left) / n;
  for (let i = 0; i < n; i++) zig.push(ct(RES.left + seg * (i + 0.5), 50 + (i % 2 ? 8 : -8)));
  zig.push(ct(RES.right, 50));
  out.push(line('resistor', zig, SYMBOL_W, INK));
  out.push(label('resistor-label', 'label.resistor', ct((RES.left + RES.right) / 2, 30), 'center', LABEL_PX, MUTED));

  // ---- 스위치 — 5τ 를 넘으면 날이 우회 도선 쪽으로 넘어간다 ----
  for (const [id, p] of [['a', SW_A], ['p', SW_P], ['b', SW_B]] as const) {
    const contact: Body = { type: 'body', id: `switch-${id}`, shape: 'point', pos: ct(p[0], p[1]), style: INK };
    out.push(contact);
  }
  const to = charging ? SW_A : SW_B;
  out.push(line('switch-blade', [ct(SW_P[0], SW_P[1]), ct(to[0], to[1])], SYMBOL_W, INK));

  // ---- 축전기 극판 ----
  out.push(line('plate-top', [ct(PLATE.left, PLATE.top), ct(PLATE.right, PLATE.top)], PLATE_W, INK));
  out.push(line('plate-bottom', [ct(PLATE.left, PLATE.bottom), ct(PLATE.right, PLATE.bottom)], PLATE_W, INK));
  out.push(label('capacitor-label', 'label.capacitor', ct(PLATE.right, PLATE.bottom + 20), 'right', LABEL_PX, MUTED));

  // ---- 극판의 전하 — 위 극판 안쪽 +, 아래 극판 안쪽 −. 개수 ∝ 쌓인 전하, 마지막 하나는 불투명도로 분수 ----
  const slots = 10;
  const filled = v * slots;
  const signs: Vec2[][] = [];
  const signAlpha: number[] = [];
  for (let i = 0; i < slots; i++) {
    const a = Math.max(0, Math.min(1, filled - i));
    if (a <= 0) continue;
    const x = PLATE.left + 5 + i * ((PLATE.right - PLATE.left - 10) / (slots - 1));
    const yp = PLATE.top + 9;
    const yn = PLATE.bottom - 9;
    signs.push([ct(x - 3.5, yp), ct(x + 3.5, yp)], [ct(x, yp - 3.5), ct(x, yp + 3.5)], [ct(x - 3.5, yn), ct(x + 3.5, yn)]);
    signAlpha.push(a, a, a);
  }
  out.push({ type: 'lineSet', id: 'plate-charges', lines: signs, opacities: signAlpha, width: CHARGE_SIGN_W, style: CHARGE });

  // ---- 흐르는 전하 — 점의 속도 ∝ 남은 차이 / R ----
  const path = charging ? CHARGE_PATH : DISCHARGE_PATH;
  const dots: Vec2[] = [];
  for (const [x, y] of pointsAlong(path, s.flow, DOT_GAP)) {
    if (charging && x === 60 && y > BAT.pos - 4 && y < BAT.neg + 4) continue;
    if (x > PLATE.left && x < PLATE.right && y > PLATE.top - 4 && y < PLATE.bottom + 4) continue;
    dots.push(ct(x, y));
  }
  out.push({ type: 'particleSystem', id: 'flowing-charge', positions: dots, sizes: DOT_R, style: CHARGE });

  // ---- τ 눈금 ----
  const grid: Vec2[][] = [];
  for (let k = 0; k <= CYCLE; k++) grid.push([at(gx(k), GRAPH.top - 6), at(gx(k), GRAPH.bottom)]);
  out.push({ type: 'lineSet', id: 'tau-grid', lines: grid, width: GRID_W, style: FAINT });
  out.push(line('time-axis', [at(GRAPH.x0, GRAPH.bottom), at(GRAPH.x1, GRAPH.bottom)], GRID_W, MUTED));
  for (let k = 1; k <= CYCLE; k++) {
    out.push(label(`tick-${k}`, 'label.tick', at(gx(k), GRAPH.bottom + 13), 'center', TICK_PX, MUTED, { k }));
  }
  out.push(label('tick-0', 'label.zero', at(GRAPH.x0 - LABEL_GAP, GRAPH.bottom), 'right', TICK_PX, MUTED));
  out.push(label('span-charging', 'label.charging', at(gx(CHARGE_SPAN / 2), 16), 'center', LABEL_PX, charging ? INK : MUTED));
  out.push(label('span-discharging', 'label.discharging', at(gx((CHARGE_SPAN + CYCLE) / 2), 16), 'center', LABEL_PX, charging ? MUTED : INK));
  out.push(label('tau-value', 'label.tau', at(GRAPH.x1, 16), 'right', LABEL_PX, MUTED, { tau: s.tauText }));

  // ---- 전지 전압 선 ----
  out.push(line('battery-voltage', [at(GRAPH.x0, gy(1)), at(GRAPH.x1, gy(1))], GRID_W, { ...MUTED, lineStyle: 'dashed' }));
  out.push(label('battery-voltage-label', 'label.batteryVoltage', at(GRAPH.x0 - LABEL_GAP, gy(1)), 'right', TICK_PX, MUTED));

  // ---- 축전기 전압 곡선과 지금 점 ----
  const trace = voltageTrace(s.v0, s.u).map(([u, vv]) => at(gx(u), gy(vv)));
  out.push(line('voltage-curve', trace, CURVE_W, CHARGE));
  out.push({ type: 'particleSystem', id: 'voltage-now', positions: [at(gx(s.u), gy(v))], sizes: NOW_DOT_R, style: CHARGE });
  out.push(label('voltage-label', 'label.capVoltage', at(GRAPH.x0 - LABEL_GAP, gy(0.5)), 'right', TICK_PX, CHARGE));

  // ---- 지난 τ 의 남은 차이 — 막대와 이웃 막대 사이의 ×0.368 ----
  const marks = tauMarks(s.v0, s.u);
  const bars: Vec2[][] = [];
  for (const m of marks) {
    const x = gx(m.k);
    const target = m.charging ? 1 : 0;
    bars.push([at(x, gy(m.v)), at(x, gy(target))], [at(x - 4, gy(m.v)), at(x + 4, gy(m.v))]);
  }
  out.push({ type: 'lineSet', id: 'tau-gaps', lines: bars, width: MARK_W, opacity: MARK_OPACITY, style: GAP });
  for (let i = 1; i < marks.length; i++) {
    const a = marks[i - 1]!;
    const b = marks[i]!;
    if (a.charging !== b.charging) continue;
    const y = b.charging ? GRAPH.top - 12 : GRAPH.bottom + 32;
    out.push(label(`ratio-${b.k}`, 'label.ratio', at((gx(a.k) + gx(b.k)) / 2, y), 'center', RATIO_PX, GAP));
  }

  // ---- 지금 남은 차이 — 그래프의 굵은 막대 + 저항에 걸린 전압(같은 양)의 가로 막대 ----
  out.push(line('gap-now', [at(gx(s.u), gy(v)), at(gx(s.u), gy(charging ? 1 : 0))], GAP_NOW_W, GAP));
  const barMax = RES.right - RES.left;
  if (gapNow > 0) {
    out.push(line('gap-resistor', [ct(RES.left, 68), ct(RES.left + barMax * gapNow, 68)], GAP_BAR_W, GAP));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
