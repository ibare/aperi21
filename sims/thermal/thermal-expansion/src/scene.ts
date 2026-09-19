// ========================================================================
// thermal-expansion — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
//   침목            body(rect)        — 움직이지 않는다. 레일 끝이 그 위로 밀려 나오는 것을 재는 자
//   레일 두 토막    region            — 겨울 길이. 옆모습 사각형 + 머리 띠 선(lineSet)
//   늘어난 끝       region(hatch)     — 같은 레일의 다른 몫이라 색이 아니라 결(빗금)로 가른다
//   이음매 틈       dimension + lineSet — 틈 양 끝을 잰다. 글자는 겨울 · 여름 정박 단계에서만
//   온도계          region 셋 + body  — 관 바탕 · 채움(높이 = 온도) · 둘레, 아래 알뿌리
//   눈금 글자       lineSet + readout — 선언한 두 온도만
//   과장 배율 알림  readout           — 틈과 늘어난 길이를 몇 배로 키웠는지
//   캡션            BundleSchema.caption 슬롯
//
// ---- 색은 뜻마다 하나다 ----
//   ink     레일 — 두 토막이 같은 색이고 늘어난 끝도 같은 색이다(결만 다르다)
//   accent  온도의 높이 — 온도계 채움과 알뿌리
//   muted   물건과 자 — 침목 · 치수선 · 관 둘레 · 눈금 · 글자
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
import { growMm, mmToWorld, readConstants, tempAt, type ThermalExpansionConstants } from './physics';
import {
  BULB_R,
  DIM_Y,
  NOTE_Y,
  RAIL_H,
  RAIL_HEAD_H,
  RAIL_WORLD,
  SCENE_BOUNDS,
  SLEEPERS_PER_RAIL,
  SLEEPER_SIZE,
  SLEEPER_SPACING,
  THERMO_BOTTOM,
  THERMO_TOP,
  THERMO_WIDTH,
  THERMO_X,
  text,
} from './schema';
import type { ThermalExpansionState } from './state';

/** 레일 채움의 짙기. 빗금(바탕색 사선)이 또렷이 보일 만큼 짙다. */
const RAIL_FILL = 0.85;
/** 레일 머리 띠 선 · 치수 보조선 · 관 둘레 · 눈금 굵기(화면 px). */
const THIN_WIDTH = 1;
/** 침목 불투명도. 물건이라 옅다. */
const SLEEPER_OPACITY = 0.75;
/** 온도계 채움의 짙기와 관 바탕의 옅기. */
const TUBE_FILL = 0.85;
const TUBE_BG = 0.06;
/** 알뿌리 중심을 관 아래 끝에서 내리는 몫(반지름에 대한 비). 관과 알뿌리가 이어져 보인다. */
const BULB_DROP = 0.7;
/** 눈금 짧은 선의 길이(월드). */
const TICK_LEN = 0.1;
/** 눈금 글자 · 틈 글자 · 알림 글자 크기(화면 px). */
const TICK_LABEL_PX = 12;
const NOTE_PX = 11;
/** 눈금 글자를 눈금에서 띄우는 거리(화면 px). */
const LABEL_GAP = 6;
/** 늘어난 끝이 이보다 짧으면(월드) 빗금을 두지 않는다 — 겨울 그림에 실오라기가 남지 않게. */
const MIN_GROW_WORLD = 0.004;

const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const SLEEPER = { colorRole: 'muted', emphasis: 'subtle' } as const;
const RAIL = { colorRole: 'ink', emphasis: 'strong' } as const;
const HEAT_LEVEL = { colorRole: 'accent', emphasis: 'strong' } as const;

function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

/** 온도(℃) → 온도계 채움 높이(월드 y). */
function thermoY(temp: number, c: ThermalExpansionConstants): number {
  const f = (temp - c.axisMin) / (c.axisMax - c.axisMin);
  return THERMO_BOTTOM + Math.min(1, Math.max(0, f)) * (THERMO_TOP - THERMO_BOTTOM);
}

/** 레일 한 토막의 자리 — 겨울 길이의 두 끝과, 지금 양 끝으로 늘어난 길이. */
interface RailBox {
  id: 'left' | 'right';
  /** 겨울 길이의 왼쪽 · 오른쪽 끝. 가운데가 고정이라 온도에 따라 움직이지 않는다. */
  x0: number;
  x1: number;
  /** 바깥쪽 끝 · 이음매 쪽 끝이 늘어난 길이(월드). */
  growOuter: number;
  growInner: number;
}

export function scene(params: {
  state: ThermalExpansionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('thermal-expansion: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const k = mmToWorld(c);
  const out: Primitive[] = [];

  const temp = tempAt(tl, c);
  // 겨울 틈의 절반 — 레일은 이음매를 가운데(x = 0)에 두고 좌우에 놓인다.
  const halfGap0 = (c.gapColdMm * k) / 2;
  // 레일 한 토막은 양 끝으로 ΔL/2 씩 늘어난다. 이음매 쪽은 맞닿으면 더 나가지 않는다.
  const grow = (growMm(temp, c) * k) / 2;
  const growInner = Math.min(grow, halfGap0);
  const rails: RailBox[] = [
    { id: 'left', x0: -halfGap0 - RAIL_WORLD, x1: -halfGap0, growOuter: grow, growInner },
    { id: 'right', x0: halfGap0, x1: halfGap0 + RAIL_WORLD, growOuter: grow, growInner },
  ];

  // ---- 침목 ----
  // 레일 가운데를 중심으로 같은 간격. 이음매 바로 밑은 비운다. 움직이지 않는다.
  const [sw, sh] = SLEEPER_SIZE;
  for (const r of rails) {
    const mid = (r.x0 + r.x1) / 2;
    for (let i = 0; i < SLEEPERS_PER_RAIL; i++) {
      const x = mid + (i - (SLEEPERS_PER_RAIL - 1) / 2) * SLEEPER_SPACING;
      out.push({
        type: 'body',
        id: `sleeper-${r.id}-${i}`,
        shape: 'rect',
        pos: [x, -sh / 2],
        size: [sw, sh],
        opacity: SLEEPER_OPACITY,
        style: SLEEPER,
      });
    }
  }

  // ---- 레일 ----
  // 겨울 길이는 채움, 늘어난 끝은 같은 색의 빗금. 레일 머리 띠 선은 늘어난 끝까지 잇는다.
  const headLines: Vec2[][] = [];
  for (const r of rails) {
    const outerX = r.id === 'left' ? r.x0 : r.x1;
    const innerX = r.id === 'left' ? r.x1 : r.x0;
    const outDir = r.id === 'left' ? -1 : 1;
    out.push({
      type: 'region',
      id: `rail-${r.id}`,
      points: rect(r.x0, 0, r.x1, RAIL_H),
      opaque: true,
      fillOpacity: RAIL_FILL,
      style: RAIL,
    });
    const ends: { id: string; from: number; to: number }[] = [
      { id: 'outer', from: outerX, to: outerX + outDir * r.growOuter },
      { id: 'inner', from: innerX, to: innerX - outDir * r.growInner },
    ];
    for (const e of ends) {
      if (Math.abs(e.to - e.from) < MIN_GROW_WORLD) continue;
      out.push({
        type: 'region',
        id: `grow-${r.id}-${e.id}`,
        points: rect(Math.min(e.from, e.to), 0, Math.max(e.from, e.to), RAIL_H),
        opaque: true,
        fillOpacity: RAIL_FILL,
        fill: 'hatch',
        style: RAIL,
      });
    }
    const a = outerX + outDir * r.growOuter;
    const b = innerX - outDir * r.growInner;
    headLines.push([
      [Math.min(a, b), RAIL_H - RAIL_HEAD_H],
      [Math.max(a, b), RAIL_H - RAIL_HEAD_H],
    ]);
  }
  out.push({
    type: 'lineSet',
    id: 'rail-heads',
    lines: headLines,
    width: THIN_WIDTH,
    style: MUTED,
  });

  // ---- 이음매 틈 ----
  // 두 이음매 쪽 끝에서 위로 보조선을 세우고 그 사이를 잰다. 글자는 정박 단계에서만 —
  // 변하는 동안의 틈을 반올림해 띄우지 않는다 (S-piece 유효숫자).
  const gapL = -halfGap0 + growInner;
  const gapR = halfGap0 - growInner;
  out.push({
    type: 'lineSet',
    id: 'gap-guides',
    lines: [
      [
        [gapL, RAIL_H],
        [gapL, DIM_Y],
      ],
      [
        [gapR, RAIL_H],
        [gapR, DIM_Y],
      ],
    ],
    width: THIN_WIDTH,
    style: MUTED,
  });
  const gapText =
    tl.phase === 'winter' ? state.gapColdText : tl.phase === 'summer' ? state.gapHotText : undefined;
  out.push({
    type: 'dimension',
    id: 'gap-dim',
    from: [gapL, DIM_Y],
    to: [gapR, DIM_Y],
    ...(gapText !== undefined ? { text: text('label.gap'), vars: { g: gapText } } : {}),
    style: MUTED,
  });

  // ---- 과장 배율 알림 ----
  out.push({
    type: 'readout',
    id: 'exaggeration-note',
    anchor: { world: [0, NOTE_Y] },
    text: text('label.exaggeration'),
    vars: { x: state.exaggerationText },
    chip: false,
    font: 'text',
    fontSize: NOTE_PX,
    align: 'center',
    style: MUTED,
  });

  // ---- 온도계 ----
  const tx0 = THERMO_X - THERMO_WIDTH / 2;
  const tx1 = THERMO_X + THERMO_WIDTH / 2;
  const bulbY = THERMO_BOTTOM - BULB_R * BULB_DROP;
  out.push({
    type: 'region',
    id: 'thermo-bg',
    points: rect(tx0, THERMO_BOTTOM, tx1, THERMO_TOP),
    opaque: true,
    fillOpacity: TUBE_BG,
    style: MUTED,
  });
  out.push({
    type: 'body',
    id: 'thermo-bulb',
    shape: 'circle',
    pos: [THERMO_X, bulbY],
    size: BULB_R,
    glow: false,
    style: HEAT_LEVEL,
  });
  out.push({
    type: 'region',
    id: 'thermo-fill',
    points: rect(tx0, bulbY, tx1, thermoY(temp, c)),
    fillOpacity: TUBE_FILL,
    style: HEAT_LEVEL,
  });
  out.push({
    type: 'region',
    id: 'thermo-rim',
    points: rect(tx0, THERMO_BOTTOM, tx1, THERMO_TOP),
    fillOpacity: 0,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: MUTED,
  });

  // ---- 눈금: 선언한 두 온도 ----
  const ticks: { id: string; temp: number; label: string }[] = [
    { id: 'cold', temp: c.tCold, label: state.coldText },
    { id: 'hot', temp: c.tHot, label: state.hotText },
  ];
  out.push({
    type: 'lineSet',
    id: 'thermo-ticks',
    lines: ticks.map((t): Vec2[] => [
      [tx0 - TICK_LEN, thermoY(t.temp, c)],
      [tx0, thermoY(t.temp, c)],
    ]),
    width: THIN_WIDTH,
    style: MUTED,
  });
  for (const t of ticks) {
    out.push({
      type: 'readout',
      id: `tick-${t.id}`,
      anchor: { world: [tx0 - TICK_LEN, thermoY(t.temp, c)], offset: [-LABEL_GAP, 0] },
      text: text('label.temp'),
      vars: { t: t.label },
      chip: false,
      font: 'mono',
      fontSize: TICK_LABEL_PX,
      align: 'right',
      style: MUTED,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
