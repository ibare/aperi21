// ========================================================================
// iv-characteristic — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 평면의 축(vector) · 눈금(lineSet) ·
// 곡선(trajectory, 점 표본) · 지금 점(body) · 전압 내림선(trajectory 점선) · 이름표(readout)
// 가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — **강조색은 「지금 전압에서의 전류」 한 가지 뜻에만**(곡선을 긋는 점).
// 세 곡선은 모두 먹색이다 — 소자는 색이 아니라 이름표와 모양으로 가른다 (S-piece).
// 축 · 눈금 · 내림선은 배경 정보라 muted.
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
  cumulativeLengths,
  currentOf,
  headOf,
  readConstants,
  sampleCurve,
  sweepRange,
  toPlane,
  type Device,
  type IvCharacteristicConstants,
} from './physics';
import { SCENE_BOUNDS, text, type IvCharacteristicMessageKey } from './schema';
import type { IvCharacteristicState } from './state';

/** 한 단계가 긋는 곡선 토막의 표본 수. 다이오드 무릎이 꺾은선으로 보이지 않을 만큼. */
const SAMPLES_PER_SEGMENT = 240;
/** 곡선 굵기(화면 px). */
const CURVE_PX = 2.5;
/** 평면 축 굵기(화면 px) · 축 끝이 끝 값 너머로 더 나가는 길이(월드). */
const AXIS_PX = 1.5;
const AXIS_OVERRUN = 0.3;
/** 눈금 반높이(월드) · 굵기(화면 px). */
const TICK_HALF = 0.07;
const TICK_PX = 1.5;
/** 전압 내림선 굵기(화면 px). 지금 점이 어느 전압에 있는지 가로축으로 떨어뜨린다. */
const DROP_PX = 1;
/** 내림선이 이보다 짧으면(월드) 긋지 않는다 — 점이 가로축에 붙어 있을 때. */
const DROP_MIN = 0.02;
/** 지금 점 반지름(월드). */
const LIVE_POINT_RADIUS = 0.1;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 소자 이름표 띄움(화면 px) — 지금 점(또는 곡선 끝)의 오른쪽 위. */
const DEVICE_LABEL_OFFSET_PX: Vec2 = [10, -12];
/** 눈금 이름표 · 축 이름 · 원점 이름표 띄움(화면 px). */
const TICK_LABEL_GAP_PX = 14;
const AXIS_LABEL_GAP_PX = 12;

/** 곡선 한 토막 — 어느 단계가 어느 전압 구간을 긋는가. */
interface Segment {
  phase: string;
  from: number;
  to: number;
}

/** 소자 한 벌의 선언 — 이름표와 단계별 토막. */
interface DeviceSweep {
  device: Device;
  label: IvCharacteristicMessageKey;
  /**
   * 이름표 자리 — `'tip'` 은 긋는 점을 따라가고, `'end'` 는 처음부터 곡선이 닿을 끝에서 기다린다.
   * 다이오드 점은 원점 곁을 기어 지나는데 거기서 저항 · 전구 선이 모여, 점을 따라가는
   * 이름표가 두 선 위에 얹힌다(1 차 촬영).
   */
  labelAt: 'tip' | 'end';
  segments: Segment[];
}

/**
 * 소자마다 긋는 차례. 다이오드는 문턱에서 두 토막으로 갈린다 — 가로축을 기는 동안과
 * 치솟는 동안이 시간표의 두 단계다. 목록은 코드 표로 남는다 (NOTES (c) G105).
 */
function sweeps(c: IvCharacteristicConstants): DeviceSweep[] {
  const [r0, r1] = sweepRange('resistor', c);
  const [b0, b1] = sweepRange('bulb', c);
  const [d0, d1] = sweepRange('diode', c);
  const knee = Math.min(Math.max(c.diodeThreshold, d0), d1);
  return [
    { device: 'resistor', label: 'label.resistor', labelAt: 'tip', segments: [{ phase: 'resistor', from: r0, to: r1 }] },
    { device: 'bulb', label: 'label.bulb', labelAt: 'tip', segments: [{ phase: 'bulb', from: b0, to: b1 }] },
    {
      device: 'diode',
      label: 'label.diode',
      labelAt: 'end',
      segments: [
        { phase: 'diodeFlat', from: d0, to: knee },
        { phase: 'diodeRise', from: knee, to: d1 },
      ],
    },
  ];
}

export function scene(params: {
  state: IvCharacteristicState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('iv-characteristic: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  pushAxes(out, c);

  // 지난 곡선은 마지막 단계에서 흐려지고, 다음 주기에 다시 그어진다.
  const history = 1 - tl.at('fade');

  for (const sw of sweeps(c)) {
    // 이 소자가 이번 주기에 그은 부분 — 토막마다 그 단계의 진행도만큼.
    const drawn: Vec2[] = [];
    let started = false;
    for (const seg of sw.segments) {
      const p = tl.at(seg.phase);
      if (p <= 0) break;
      started = true;
      const pts = sampleCurve(sw.device, seg.from, seg.to, SAMPLES_PER_SEGMENT, c);
      const lengths = cumulativeLengths(pts);
      const part = headOf(pts, lengths, p * lengths[lengths.length - 1]!);
      drawn.push(...(drawn.length > 0 ? part.slice(1) : part));
    }
    if (!started || drawn.length < 2) continue;

    const tip = drawn[drawn.length - 1]!;
    const active = sw.segments.some((seg) => seg.phase === tl.phase);

    out.push({
      type: 'trajectory',
      id: `curve-${sw.device}`,
      points: drawn,
      width: CURVE_PX,
      opacity: history,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    if (active) {
      // 지금 전압 — 점에서 가로축으로 내린 점선이 전압이 쓸려 가는 것을 가로축 위에 보인다.
      if (Math.abs(tip[1]) > DROP_MIN) {
        out.push({
          type: 'trajectory',
          id: `drop-${sw.device}`,
          points: [[tip[0], 0], tip],
          width: DROP_PX,
          style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
        });
      }
      out.push({
        type: 'body',
        id: `live-${sw.device}`,
        pos: tip,
        shape: 'circle',
        size: LIVE_POINT_RADIUS,
        outline: 'background',
        glow: false,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }

    // 어느 소자의 곡선인지 — `tip` 이면 긋는 동안은 점을, 다 그은 뒤에는 곡선 끝을 따라가고,
    // `end` 면 곡선이 닿을 끝에서 기다린다.
    const last = sw.segments[sw.segments.length - 1]!;
    const labelPos = sw.labelAt === 'tip' ? tip : toPlane(last.to, currentOf(sw.device, last.to, c), c);
    out.push({
      type: 'readout',
      id: `label-${sw.device}`,
      anchor: { world: labelPos, offset: DEVICE_LABEL_OFFSET_PX },
      text: text(sw.label),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'left',
      opacity: history,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

// ------------------------------------------------------------------------
// I–V 평면의 축
// ------------------------------------------------------------------------

function pushAxes(out: Primitive[], c: IvCharacteristicConstants): void {
  const axisStyle = { colorRole: 'muted', emphasis: 'strong' } as const;
  const [vLeft] = toPlane(c.sweepVoltageMin, 0, c);
  const [vRight] = toPlane(c.sweepVoltageMax, 0, c);
  const [, iBottom] = toPlane(0, c.plotCurrentMin, c);
  const [, iTop] = toPlane(0, c.plotCurrentMax, c);
  const axisLeft = vLeft - AXIS_OVERRUN;
  const axisRight = vRight + AXIS_OVERRUN;
  const axisBottom = iBottom - AXIS_OVERRUN;
  const axisTop = iTop + AXIS_OVERRUN;

  out.push({
    type: 'vector',
    id: 'axis-v',
    from: [axisLeft, 0],
    delta: [axisRight - axisLeft, 0],
    width: AXIS_PX,
    style: axisStyle,
  });
  out.push({
    type: 'vector',
    id: 'axis-i',
    from: [0, axisBottom],
    delta: [0, axisTop - axisBottom],
    width: AXIS_PX,
    style: axisStyle,
  });
  out.push({
    type: 'readout',
    id: 'axis-v-label',
    anchor: { world: [axisRight, 0], offset: [AXIS_LABEL_GAP_PX, 0] },
    text: text('label.axisV'),
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'left',
    style: axisStyle,
  });
  out.push({
    type: 'readout',
    id: 'axis-i-label',
    anchor: { world: [0, axisTop], offset: [-AXIS_LABEL_GAP_PX, 0] },
    text: text('label.axisI'),
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'right',
    style: axisStyle,
  });
  out.push({
    type: 'readout',
    id: 'axis-origin-label',
    anchor: { world: [0, 0], offset: [-AXIS_LABEL_GAP_PX, TICK_LABEL_GAP_PX] },
    text: text('label.origin'),
    chip: false,
    fontSize: LABEL_PX,
    align: 'center',
    style: axisStyle,
  });
  // 원점 왼쪽이 역방향이다 — 가로축 왼쪽 끝 아래에 한 번.
  out.push({
    type: 'readout',
    id: 'axis-reverse-label',
    anchor: { world: [axisLeft, 0], offset: [0, TICK_LABEL_GAP_PX] },
    text: text('label.reverse'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'left',
    style: axisStyle,
  });

  // ---- 가로축 눈금 — 다이오드 문턱 · 쓸어 올리는 끝 전압 ----
  const ticks = [c.diodeThreshold, c.sweepVoltageMax];
  out.push({
    type: 'lineSet',
    id: 'axis-v-ticks',
    lines: ticks.map((v): Vec2[] => {
      const [x] = toPlane(v, 0, c);
      return [
        [x, -TICK_HALF],
        [x, TICK_HALF],
      ];
    }),
    width: TICK_PX,
    style: axisStyle,
  });
  ticks.forEach((v, k) => {
    out.push({
      type: 'readout',
      id: `axis-v-tick-label-${k}`,
      anchor: { world: toPlane(v, 0, c), offset: [0, TICK_LABEL_GAP_PX] },
      text: text('label.voltage'),
      vars: { v: String(v) },
      chip: false,
      fontSize: LABEL_PX,
      align: 'center',
      style: axisStyle,
    });
  });
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
