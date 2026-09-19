// ========================================================================
// first-law-of-thermodynamics — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없이 표준 어휘만 쓴다.
//
//   실린더 벽           trajectory (ㄷ자를 뒤집은 꺾은선)
//   가열판              region (알갱이가 날아가는 동안 짙어진다)
//   기체 · 분자         region(옅은 칠) · particleSystem(자취 = 속력)
//   피스톤 · 추 · 핀     body rect
//   처음 피스톤 자리     trajectory 점선 · dimension(올라간 높이)
//   온도 막대           region(관 · 채움) · trajectory(눈금) · readout
//   열 알갱이           body rect — Q 더미에서 ΔU · W 더미로 호를 그리며 날아간다
//   앞 판 잔상           trajectory closed 점선 (고정 판에서 자유 판의 더미 높이 · 온도 눈금)
//
// 겹침 순서는 scene 에 쓴 순서다 (`schema.drawOrder: 'scene'`).
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
import { bounce, goesToWork, molecules, readConstants, travelled, type TempSegment } from './physics';
import { text } from './schema';
import type { FirstLawOfThermodynamicsState } from './state';

// ------------------------------------------------------------------------
// 배치 (월드 단위, y 위)
// ------------------------------------------------------------------------

/** 실린더 안쪽 좌우 · 바닥 · 벽 위 끝. */
const CYL = { left: 0.4, right: 2.8, bottom: 0, top: 3.25 } as const;
/** 처음 기체 기둥 높이. 자유 피스톤에서는 온도에 비례해 오른다. */
const GAS_H0 = 2.0;
/** 피스톤 두께 · 피스톤과 벽 사이 틈. */
const PISTON_H = 0.22;
const PISTON_GAP = 0.03;
/** 추 크기. */
const WEIGHT_SIZE: Vec2 = [1.1, 0.5];
/** 분자가 벽에서 떨어져 튀는 여유. */
const MOL_MARGIN = 0.1;
/** 가열판. */
const HEATER = { left: 0.5, right: 2.7, bottom: -0.44, top: -0.16 } as const;
/** 핀 크기 · 벽에서 들어온 거리. */
const PIN_SIZE: Vec2 = [0.3, 0.12];
const PIN_GAP = 0.08;
/** 처음 높이를 재는 치수선의 x. */
const RISE_X = CYL.left - 0.22;

/** 온도 막대 — 가운데 x · 폭 · 처음 온도 높이 · 가장 높이 오른 온도의 높이. */
const THERMO = { x: 3.35, width: 0.22, base: 0, t0Level: 0.8, topLevel: 3.05 } as const;
/** 온도 눈금 짧은 선 길이. */
const TICK_LEN = 0.14;

/** 알갱이 더미 — 가운데 x (Q · ΔU · W) · 바닥 · 알갱이 한 변 · 쌓는 간격. */
const COLUMN = { q: 5.35, u: 6.95, w: 8.55, base: 0.08, block: 0.5, pitch: 0.58 } as const;
/** 알갱이가 날아가는 호가 두 끝보다 위로 솟는 높이. */
const ARC_LIFT = 0.9;
/** 더미 바닥선의 반폭. */
const BASE_HALF = 0.42;
/** 더미 이름표의 높이 — 기호 줄 · 문안 줄. */
const SYMBOL_Y = -0.28;
const WORD_Y = -0.62;

// ------------------------------------------------------------------------
// 굵기 · 글자 · 불투명도 (화면 px 또는 0~1)
// ------------------------------------------------------------------------

const WALL_PX = 3;
const GUIDE_PX = 1;
const TICK_PX = 1.5;
const MOL_PX = 2.6;
/** 분자 자취 길이 = 속도 × 이 시간(초). 빨라지면 자취가 길어진다. */
const TRAIL_S = 0.22;
const TRAIL_OPACITY = 0.45;
const GAS_FILL = 0.07;
const THERMO_FILL = 0.55;
const HEATER_IDLE = 0.18;
const HEATER_ON = 0.85;
const GHOST_OPACITY = 0.7;
const LABEL_PX = 13;
const SYMBOL_PX = 15;
const SMALL_PX = 12;
const LABEL_GAP = 6;
/** 작은 이름표를 앵커 위 · 아래로 내는 거리 — 틈 + 글자 반 높이. */
const SMALL_DROP = LABEL_GAP + SMALL_PX / 2;
/** 기체 이름표가 치수선에서 왼쪽으로 떨어진 거리. */
const GAS_LABEL_GAP = 12;

/** 알갱이 단계 id — 시간표의 `free-g1` … `lock-g5`. */
const grainPhase = (section: 'free' | 'lock', i: number): string => `${section}-g${i + 1}`;

export function scene(params: {
  state: FirstLawOfThermodynamicsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('first-law-of-thermodynamics: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  const locked = tl.u >= tl.start('lock-in');
  const section = locked ? 'lock' : 'free';
  const fade = locked
    ? tl.at('lock-in') * (1 - tl.at('lock-out'))
    : tl.at('free-in') * (1 - tl.at('free-out'));

  // 넣은 열의 몫(0~1) — 알갱이 단계 진행도의 합
  let heatFrac = 0;
  let heating = false;
  for (let i = 0; i < c.grains; i++) {
    const p = tl.at(grainPhase(section, i));
    heatFrac += p / c.grains;
    if (tl.phase === grainPhase(section, i)) heating = true;
  }
  const dT = locked ? c.dTLocked : c.dTFree;
  const T = c.t0 + dT * heatFrac;
  // 등압이면 부피가 온도에 비례한다(피스톤이 오른다). 고정이면 그대로다.
  const gasTop = locked ? CYL.bottom + GAS_H0 : CYL.bottom + GAS_H0 * (T / c.t0);
  const pistonTop = gasTop + PISTON_H;
  const cx = (CYL.left + CYL.right) / 2;

  const out: Primitive[] = [];

  // ---- 가열판 ----
  out.push({
    type: 'region',
    id: 'heater',
    points: [
      [HEATER.left, HEATER.bottom],
      [HEATER.right, HEATER.bottom],
      [HEATER.right, HEATER.top],
      [HEATER.left, HEATER.top],
    ],
    fillOpacity: heating ? HEATER_ON : HEATER_IDLE,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'label-heater',
    anchor: { world: [cx, HEATER.bottom], offset: [0, SMALL_DROP] },
    text: text('label.heater'),
    chip: false,
    font: 'text',
    fontSize: SMALL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 기체 ----
  out.push({
    type: 'region',
    id: 'gas',
    points: [
      [CYL.left, CYL.bottom],
      [CYL.right, CYL.bottom],
      [CYL.right, gasTop],
      [CYL.left, gasTop],
    ],
    fillOpacity: GAS_FILL,
    opacity: fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 분자: 속력은 √T, 벽에서 튄다. 간 거리는 시각의 닫힌 식 ----
  const segs = temperatureSegments(tl, c);
  const s = travelled(tl.u, segs, c);
  const speed = c.molSpeed * Math.sqrt(T / c.t0);
  const boxW = CYL.right - CYL.left - 2 * MOL_MARGIN;
  const boxH = gasTop - CYL.bottom - 2 * MOL_MARGIN;
  const positions: Vec2[] = [];
  const velocities: Vec2[] = [];
  for (const m of molecules(c)) {
    const [bx, sx] = bounce(m.x0 + m.dx * s);
    const [by, sy] = bounce(m.y0 + m.dy * s);
    positions.push([CYL.left + MOL_MARGIN + boxW * bx, CYL.bottom + MOL_MARGIN + boxH * by]);
    velocities.push([sx * m.dx * speed * boxW, sy * m.dy * speed * boxW]);
  }
  out.push({
    type: 'particleSystem',
    id: 'molecules',
    positions,
    velocities,
    sizes: MOL_PX,
    trail: true,
    trailStyle: { seconds: TRAIL_S, opacity: TRAIL_OPACITY },
    // 벽에서 막 튄 분자의 자취가 벽 밖으로 뻗지 않게 기체 안으로 자른다.
    clip: { min: [CYL.left, CYL.bottom], max: [CYL.right, gasTop] },
    opacity: fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'label-gas',
    anchor: { world: [RISE_X, CYL.bottom + GAS_H0 / 2], offset: [-GAS_LABEL_GAP, 0] },
    text: text('label.gas'),
    vars: { n: String(c.n) },
    chip: false,
    font: 'text',
    fontSize: SMALL_PX,
    align: 'right',
    opacity: fade,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 처음 피스톤 자리와 올라간 높이 (자유 판) ----
  const startTop = CYL.bottom + GAS_H0 + PISTON_H;
  if (!locked && heatFrac > 0) {
    out.push({
      type: 'trajectory',
      id: 'piston-start',
      points: [
        [CYL.left, startTop],
        [CYL.right, startTop],
      ],
      width: GUIDE_PX,
      opacity: fade,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
    out.push({
      type: 'dimension',
      id: 'piston-rise',
      from: [RISE_X, startTop],
      to: [RISE_X, pistonTop],
      opacity: fade,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 피스톤 · 추 ----
  out.push({
    type: 'body',
    id: 'piston',
    shape: 'rect',
    pos: [cx, gasTop + PISTON_H / 2],
    size: [CYL.right - CYL.left - 2 * PISTON_GAP, PISTON_H],
    opacity: fade,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'weight',
    shape: 'rect',
    pos: [cx, pistonTop + WEIGHT_SIZE[1] / 2],
    size: WEIGHT_SIZE,
    opacity: fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 핀 (고정 판) ----
  if (locked) {
    for (const [id, x] of [
      ['pin-left', CYL.left + PIN_SIZE[0] / 2 - PIN_GAP],
      ['pin-right', CYL.right - PIN_SIZE[0] / 2 + PIN_GAP],
    ] as const) {
      out.push({
        type: 'body',
        id,
        shape: 'rect',
        pos: [x, pistonTop + PIN_SIZE[1] / 2],
        size: PIN_SIZE,
        opacity: fade,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  }

  // ---- 실린더 벽 (분자 · 피스톤 위에 그어 가장자리가 먹선으로 남게) ----
  out.push({
    type: 'trajectory',
    id: 'cylinder',
    points: [
      [CYL.left, CYL.top],
      [CYL.left, CYL.bottom],
      [CYL.right, CYL.bottom],
      [CYL.right, CYL.top],
    ],
    width: WALL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 온도 막대 ----
  const perK = (THERMO.topLevel - THERMO.t0Level) / Math.max(c.dTFree, c.dTLocked);
  const levelOf = (dt: number): number => THERMO.t0Level + dt * perK;
  const tl0 = THERMO.x - THERMO.width / 2;
  const tr0 = THERMO.x + THERMO.width / 2;
  const tubeTop = THERMO.topLevel + THERMO.width;
  out.push({
    type: 'region',
    id: 'thermo-fill',
    points: [
      [tl0, THERMO.base],
      [tr0, THERMO.base],
      [tr0, levelOf(T - c.t0)],
      [tl0, levelOf(T - c.t0)],
    ],
    fillOpacity: THERMO_FILL,
    opacity: fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'thermo-tube',
    points: [
      [tl0, THERMO.base],
      [tr0, THERMO.base],
      [tr0, tubeTop],
      [tl0, tubeTop],
    ],
    closed: true,
    width: GUIDE_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'label-thermo',
    anchor: { world: [THERMO.x, tubeTop], offset: [0, -SMALL_DROP] },
    text: text('label.temperature'),
    chip: false,
    font: 'text',
    fontSize: SMALL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  // 처음 온도 눈금
  out.push(tick('tick-t0', levelOf(0), 1));
  out.push({
    type: 'readout',
    id: 'label-t0',
    anchor: { world: [tr0 + TICK_LEN, levelOf(0)], offset: [LABEL_GAP, 0] },
    text: text('label.t0'),
    vars: { t: String(c.t0) },
    chip: false,
    font: 'text',
    fontSize: SMALL_PX,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  // 자유 판의 오른 온도 — 자유 판 끝에 서고, 고정 판에서는 잔상으로 남는다
  const freeDone = locked || tl.u >= tl.start('free-hold');
  if (freeDone) {
    const ghost = locked ? GHOST_OPACITY : fade;
    out.push(tick('tick-free', levelOf(c.dTFree), ghost));
    out.push(riseLabel('label-rise-free', levelOf(c.dTFree), String(c.dTFree), ghost, locked));
  }
  if (locked && tl.u >= tl.start('lock-hold')) {
    out.push(tick('tick-locked', levelOf(c.dTLocked), fade));
    out.push(riseLabel('label-rise-locked', levelOf(c.dTLocked), String(c.dTLocked), fade, false));
  }

  // ---- 알갱이 더미: 바닥선 · 이름표 ----
  for (const [id, x, sym, word, vars] of [
    ['q', COLUMN.q, 'Q', text('label.q'), { q: String(c.q) }],
    ['u', COLUMN.u, 'ΔU', text('label.du'), undefined],
    ['w', COLUMN.w, 'W', text('label.w'), undefined],
  ] as const) {
    out.push({
      type: 'trajectory',
      id: `base-${id}`,
      points: [
        [x - BASE_HALF, COLUMN.base - PISTON_GAP],
        [x + BASE_HALF, COLUMN.base - PISTON_GAP],
      ],
      width: TICK_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `symbol-${id}`,
      anchor: { world: [x, SYMBOL_Y] },
      text: sym,
      chip: false,
      font: 'text',
      italic: true,
      weight: 'bold',
      fontSize: SYMBOL_PX,
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `word-${id}`,
      anchor: { world: [x, WORD_Y] },
      text: word,
      ...(vars ? { vars } : {}),
      chip: false,
      font: 'text',
      fontSize: SMALL_PX,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 앞 판 잔상: 자유 판에서 두 더미가 선 높이 (고정 판) ----
  if (locked) {
    for (const [id, x, count] of [
      ['ghost-u', COLUMN.u, c.uPart],
      ['ghost-w', COLUMN.w, c.wPart],
    ] as const) {
      if (count <= 0) continue;
      const half = COLUMN.block / 2 + PISTON_GAP;
      const top = COLUMN.base + (count - 1) * COLUMN.pitch + COLUMN.block + PISTON_GAP;
      out.push({
        type: 'trajectory',
        id,
        points: [
          [x - half, COLUMN.base],
          [x + half, COLUMN.base],
          [x + half, top],
          [x - half, top],
        ],
        closed: true,
        width: GUIDE_PX,
        opacity: GHOST_OPACITY,
        style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
      });
    }
  }

  // ---- 열 알갱이: Q 더미 맨 위부터 하나씩 떠나 ΔU · W 더미로 ----
  const slot = (x: number, k: number): Vec2 => [x, COLUMN.base + COLUMN.block / 2 + k * COLUMN.pitch];
  let uCount = 0;
  let wCount = 0;
  for (let i = 0; i < c.grains; i++) {
    const toWork = !locked && goesToWork(i, c);
    const from = slot(COLUMN.q, c.grains - 1 - i);
    const to = toWork ? slot(COLUMN.w, wCount++) : slot(COLUMN.u, uCount++);
    const p = tl.at(grainPhase(section, i));
    out.push({
      type: 'body',
      id: `grain-${i}`,
      shape: 'rect',
      pos: arc(from, to, p),
      size: [COLUMN.block, COLUMN.block],
      opacity: fade,
      outline: 'background',
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 온도 막대 오른쪽의 짧은 눈금. */
function tick(id: string, y: number, opacity: number): Primitive {
  const x = THERMO.x + THERMO.width / 2;
  return {
    type: 'trajectory',
    id,
    points: [
      [x, y],
      [x + TICK_LEN, y],
    ],
    width: TICK_PX,
    opacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

/** 오른 온도 이름표 `+90 K`. 잔상이면 옅은 색. */
function riseLabel(id: string, y: number, dt: string, opacity: number, ghost: boolean): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: [THERMO.x + THERMO.width / 2 + TICK_LEN, y], offset: [LABEL_GAP, 0] },
    text: text('label.rise'),
    vars: { dt },
    chip: false,
    font: 'text',
    weight: 'bold',
    fontSize: LABEL_PX,
    align: 'left',
    opacity,
    style: { colorRole: ghost ? 'muted' : 'ink', emphasis: 'strong' },
  };
}

/** 두 자리 사이를 위로 솟는 호로 잇는다(2차 베지에). p 는 단계 진행도(이징은 선언). */
function arc(a: Vec2, b: Vec2, p: number): Vec2 {
  const ctrl: Vec2 = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + ARC_LIFT];
  const q = 1 - p;
  return [
    q * q * a[0] + 2 * q * p * ctrl[0] + p * p * b[0],
    q * q * a[1] + 2 * q * p * ctrl[1] + p * p * b[1],
  ];
}

/**
 * 한 주기의 온도 구간 — 분자가 간 거리를 닫힌 식으로 더하려고 쓴다.
 * 구간 경계는 모두 시간표에서 읽는다. 알갱이 단계 안의 온도는 직선으로 둔다(이징은 자취 길이에만 걸린다).
 */
function temperatureSegments(tl: TimelineFrame, c: ReturnType<typeof readConstants>): TempSegment[] {
  const segs: TempSegment[] = [];
  for (const [section, dT, from, to] of [
    ['free', c.dTFree, 0, tl.start('lock-in')],
    ['lock', c.dTLocked, tl.start('lock-in'), tl.period],
  ] as const) {
    const first = tl.start(grainPhase(section, 0));
    segs.push({ from, to: first, tFrom: c.t0, tTo: c.t0 });
    for (let i = 0; i < c.grains; i++) {
      const id = grainPhase(section, i);
      segs.push({
        from: tl.start(id),
        to: tl.end(id),
        tFrom: c.t0 + (dT * i) / c.grains,
        tTo: c.t0 + (dT * (i + 1)) / c.grains,
      });
    }
    const last = tl.end(grainPhase(section, c.grains - 1));
    segs.push({ from: last, to, tFrom: c.t0 + dT, tTo: c.t0 + dT });
  }
  return segs;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { minX: -1.7, maxX: 9.4, minY: -1.15, maxY: 3.7 };
}
