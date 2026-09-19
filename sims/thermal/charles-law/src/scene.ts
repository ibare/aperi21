// ========================================================================
// charles-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽은 장치 — 무게추를 얹은 자유 피스톤 실린더 셋(surface 벽 · region 기체 기둥 ·
// body 피스톤과 추) · 함께 데우는 판(region) · 기체를 알리는 표식(body 원 · 네모 · 세모).
// 오른쪽은 V–t(℃) 그림 — 축(vector) · 점 찍은 온도의 눈금(lineSet + readout) ·
// 찍힌 점(body, 기체마다 같은 표식) · 점을 잇는 실선과 거꾸로 이은 점선(trajectory) ·
// 만나는 점의 고리(body)와 눈금 글자(readout) · 지금 온도 선(trajectory 점선).
//
// 색은 뜻마다 하나다. 세 기체의 점 · 선은 **같은 primary** — 셋 다 같은 것(부피)을 재고,
// 어느 기체인지는 표식 모양이 말한다 (S-piece — 색으로 설명하지 않는다). 기체 기둥은
// secondary, **강조색은 「열이 들어간다」 한 뜻에만** (데우는 판).
// ========================================================================

import type {
  Body,
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
  gasesOf,
  heating,
  readConstants,
  recorded,
  temperatureMoving,
  temperatureNow,
  checkpoints,
  volumeAt,
  zeroVolumeTemperature,
  type Gas,
} from './physics';
import {
  CYLINDER,
  GRAPH_LEFT,
  HEATER,
  PISTON_THICKNESS,
  SCENE_BOUNDS,
  TAG_HEIGHT,
  WEIGHT_SIZE,
  text,
} from './schema';
import type { CharlesLawState } from './state';

// ---- 장치 ----
/** 기체 기둥의 옅은 칠. 표식이 비쳐 보여야 한다. */
const GAS_FILL = 0.16;
/** 피스톤이 실린더 벽과 닿지 않게 줄이는 틈(월드). */
const PISTON_CLEARANCE = 0.025;
/** 데우는 판 — 꺼져 있을 때의 결 · 켜졌을 때의 칠. */
const HEATER_IDLE_FILL = 0.3;
const HEATER_ON_FILL = 0.85;

// ---- 표식 ----
/** 표식 크기(월드) — 원 반지름 · 세모 외접원 반지름. */
const MARK_R = 0.065;
/** 네모 한 변(월드) — 원 · 세모와 눈으로 같은 크기가 되게 원 지름보다 조금 작다. */
const SQUARE_SIDE = 0.11;
/** 세모 꼭짓점 — 외접원 반지름에 곱하는 cos 30° · sin 30°. 정삼각형의 모양이다. */
const TRI_HALF_WIDTH = Math.sqrt(3) / 2;
const TRI_BASE = 0.5;

// ---- V–t 그림 ----
/** 축 굵기(화면 px) · 축 끝이 보이는 범위 너머로 나오는 여유(월드) · 화살촉 크기(월드). */
const AXIS_WIDTH_PX = 1.4;
const AXIS_OVERHANG = 0.12;
const AXIS_HEAD = 0.11;
/** 점을 잇는 실선 · 거꾸로 이은 점선의 굵기(화면 px). */
const LINE_WIDTH_PX = 2;
const EXTEND_WIDTH_PX = 1.6;
/** 지금 온도 선의 굵기(화면 px) · 짙기. 재는 선이라 가늘고 물러나 있다. */
const CURSOR_WIDTH_PX = 1;
const CURSOR_OPACITY = 0.8;
/** 만나는 점 고리의 반지름(월드). */
const MEET_RING_R = 0.1;
/** 눈금선 길이(월드) · 굵기(화면 px). */
const TICK_LEN = 0.07;
const TICK_WIDTH_PX = 1.2;
/** 눈금 숫자 · 축 이름의 글자 크기와 띄움(화면 px). */
const TICK_LABEL_PX = 12;
const TICK_LABEL_GAP_PX = 13;
const MEET_LABEL_PX = 13;
const MEET_LABEL_GAP_PX = 20;
const AXIS_LABEL_PX = 14;
const AXIS_LABEL_GAP_PX = 14;

function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

/** 정삼각형 경로 — `body` custom 이라 좌표는 가운데 기준 월드 단위, y 위다. */
const TRIANGLE_PATH =
  `M 0 ${MARK_R} ` +
  `L ${MARK_R * TRI_HALF_WIDTH} ${-MARK_R * TRI_BASE} ` +
  `L ${-MARK_R * TRI_HALF_WIDTH} ${-MARK_R * TRI_BASE} Z`;

/**
 * 기체를 알리는 표식 — A 는 원, B 는 네모, C 는 세모. 실린더 속 표식과 그림의 점이
 * 같은 모양이라 어느 선이 어느 실린더인지 색 없이 읽힌다.
 */
function mark(gas: Gas, id: string, pos: Vec2, opacity: number): Body {
  const base = {
    type: 'body' as const,
    id,
    pos,
    opacity,
    outline: 'background' as const,
    glow: false,
    style: { colorRole: 'primary' as const, emphasis: 'strong' as const },
  };
  if (gas.id === 'a') return { ...base, shape: 'circle', size: MARK_R };
  if (gas.id === 'b') return { ...base, shape: 'rect', size: [SQUARE_SIDE, SQUARE_SIDE] };
  return { ...base, shape: 'custom', customPath: TRIANGLE_PATH };
}

export function scene(params: {
  state: CharlesLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('charles-law: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const gases = gasesOf(c);
  const tNow = temperatureNow(tl, c);
  const out: Primitive[] = [];

  // ================= 장치 =================
  const cylLeft = (i: number): number => CYLINDER.left + i * (CYLINDER.width + CYLINDER.gap);
  const firstLeft = cylLeft(0);
  const lastRight = cylLeft(gases.length - 1) + CYLINDER.width;

  // ---- 데우는 판 — 늘 결로 깔려 있고, 데우는 단계에만 강조색으로 켜진다. ----
  const plate = rect(firstLeft - HEATER.overhang, HEATER.bottom, lastRight + HEATER.overhang, HEATER.top);
  out.push({
    type: 'region',
    id: 'heater',
    points: plate,
    fill: 'hatch',
    fillOpacity: HEATER_IDLE_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  if (heating(tl)) {
    out.push({
      type: 'region',
      id: 'heater-on',
      points: plate,
      fillOpacity: HEATER_ON_FILL,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  gases.forEach((gas, i) => {
    const x0 = cylLeft(i);
    const x1 = x0 + CYLINDER.width;
    const cx = (x0 + x1) / 2;
    // 기체 기둥의 높이가 곧 부피다 — 그림의 V 축과 같은 배율.
    const h = volumeAt(gas.n, tNow, c) * c.worldPerLiter;

    out.push({
      type: 'region',
      id: `gas-${gas.id}`,
      points: rect(x0, 0, x1, h),
      fillOpacity: GAS_FILL,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
    // 피스톤 — 기체 위에 떠 있다. 막대로 붙들지 않아 부피가 스스로 정해진다.
    out.push({
      type: 'body',
      id: `piston-${gas.id}`,
      pos: [cx, h + PISTON_THICKNESS / 2],
      shape: 'rect',
      size: [CYLINDER.width - 2 * PISTON_CLEARANCE, PISTON_THICKNESS],
      outline: 'none',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    // 무게추 — 세 실린더에 같은 추. 그래서 압력이 같다.
    out.push({
      type: 'body',
      id: `weight-${gas.id}`,
      pos: [cx, h + PISTON_THICKNESS + WEIGHT_SIZE[1] / 2],
      shape: 'rect',
      size: [WEIGHT_SIZE[0], WEIGHT_SIZE[1]],
      outline: 'none',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    // 벽 — 바닥과 양옆. 위는 열려 피스톤이 오르내린다.
    out.push({
      type: 'surface',
      id: `wall-${gas.id}-left`,
      geometry: { kind: 'wall', from: [x0, CYLINDER.top], to: [x0, 0] },
      material: 'solid',
    });
    out.push({
      type: 'surface',
      id: `wall-${gas.id}-right`,
      geometry: { kind: 'wall', from: [x1, 0], to: [x1, CYLINDER.top] },
      material: 'solid',
    });
    out.push({
      type: 'surface',
      id: `wall-${gas.id}-bottom`,
      geometry: { kind: 'wall', from: [x0, 0], to: [x1, 0] },
      material: 'solid',
    });
    // 기체 표식 — 그림의 점과 같은 모양.
    out.push(mark(gas, `tag-${gas.id}`, [cx, TAG_HEIGHT], 1));
  });

  // ================= V–t 그림 (장부 G203 조립) =================
  const gx = (tC: number): number => GRAPH_LEFT + (tC - c.graphTMin) * c.worldPerDegree;
  const gy = (vL: number): number => vL * c.worldPerLiter;
  const originX = gx(0);
  const rec = recorded(tl, c);
  const lineIn = tl.at('lines') * rec.fade;
  const extendIn = tl.at('extend');
  const meetIn = tl.at('meet') * rec.fade;

  // ---- 지금 온도 선 — 온도가 움직이는 동안만. ----
  if (temperatureMoving(tl)) {
    out.push({
      type: 'trajectory',
      id: 'cursor',
      points: [
        [gx(tNow), 0],
        [gx(tNow), gy(c.graphVMax)],
      ],
      width: CURSOR_WIDTH_PX,
      opacity: CURSOR_OPACITY,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
    });
  }

  // ---- 거꾸로 이은 점선 — 찍은 두 끝점의 직선을 부피 0 까지. ----
  for (const gas of gases) {
    if (extendIn <= 0 || rec.fade <= 0) continue;
    const v0 = volumeAt(gas.n, c.tStart, c);
    const v1 = volumeAt(gas.n, c.tEnd, c);
    const tz = zeroVolumeTemperature(gas.n, c);
    const tTo = c.tStart + (tz - c.tStart) * extendIn;
    const vTo = v0 + ((v1 - v0) * (tTo - c.tStart)) / (c.tEnd - c.tStart);
    out.push({
      type: 'trajectory',
      id: `extend-${gas.id}`,
      points: [
        [gx(c.tStart), gy(v0)],
        [gx(tTo), gy(vTo)],
      ],
      width: EXTEND_WIDTH_PX,
      opacity: rec.fade,
      style: { colorRole: 'primary', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 점을 잇는 실선 — 시작 온도부터 끝 온도까지. ----
  for (const gas of gases) {
    if (lineIn <= 0) continue;
    out.push({
      type: 'trajectory',
      id: `line-${gas.id}`,
      points: [
        [gx(c.tStart), gy(volumeAt(gas.n, c.tStart, c))],
        [gx(c.tEnd), gy(volumeAt(gas.n, c.tEnd, c))],
      ],
      width: LINE_WIDTH_PX,
      opacity: lineIn,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // ---- 축 ----
  out.push({
    type: 'vector',
    id: 'axis-t',
    from: [gx(c.graphTMin), 0],
    delta: [(c.graphTMax - c.graphTMin) * c.worldPerDegree + AXIS_OVERHANG, 0],
    headSize: AXIS_HEAD,
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'axis-v',
    from: [originX, 0],
    delta: [0, gy(c.graphVMax) + AXIS_OVERHANG],
    headSize: AXIS_HEAD,
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-t-label',
    anchor: { world: [gx(c.graphTMax) + AXIS_OVERHANG, 0], offset: [0, AXIS_LABEL_GAP_PX] },
    text: text('label.temperature'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: AXIS_LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-v-label',
    anchor: { world: [originX, gy(c.graphVMax) + AXIS_OVERHANG], offset: [-AXIS_LABEL_GAP_PX, 0] },
    text: text('label.volume'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: AXIS_LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 눈금 — 점을 찍는 온도마다 선, 숫자는 시작 · 끝 온도에만. 격자는 두지 않는다. ----
  out.push({
    type: 'lineSet',
    id: 'ticks',
    lines: checkpoints(c).map((t): Vec2[] => [
      [gx(t), 0],
      [gx(t), -TICK_LEN],
    ]),
    width: TICK_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  const tickLabels: { id: string; t: number; value: string }[] = [
    { id: 'start', t: c.tStart, value: state.tStart },
    { id: 'end', t: c.tEnd, value: state.tEnd },
  ];
  for (const tk of tickLabels) {
    out.push({
      type: 'readout',
      id: `tick-${tk.id}`,
      anchor: { world: [gx(tk.t), 0], offset: [0, TICK_LABEL_GAP_PX] },
      text: text('label.celsius'),
      vars: { t: tk.value },
      chip: false,
      font: 'mono',
      fontSize: TICK_LABEL_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 찍힌 점 — 기체마다 같은 표식. ----
  if (rec.fade > 0) {
    for (const gas of gases) {
      for (const t of rec.temps) {
        out.push(mark(gas, `dot-${gas.id}-${t}`, [gx(t), gy(volumeAt(gas.n, t, c))], rec.fade));
      }
    }
  }

  // ---- 만나는 점 — 이은 선들이 닿은 자리에 고리와 눈금 글자. ----
  if (meetIn > 0) {
    const tz = zeroVolumeTemperature(gases[0]!.n, c);
    out.push({
      type: 'body',
      id: 'meet-ring',
      pos: [gx(tz), 0],
      shape: 'circle',
      size: MEET_RING_R,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: meetIn,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'meet-label',
      anchor: { world: [gx(tz), 0], offset: [0, MEET_LABEL_GAP_PX] },
      text: text('label.celsiusBelow'),
      vars: { t: state.kelvinOffset },
      chip: false,
      font: 'mono',
      weight: 'bold',
      fontSize: MEET_LABEL_PX,
      opacity: meetIn,
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
