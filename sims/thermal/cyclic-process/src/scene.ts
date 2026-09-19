// ========================================================================
// cyclic-process — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없이 표준 어휘만 쓴다.
//
//   P-V 축           vector 둘 · readout(`P` · `V`)
//   한 일            region (강조색, opaque) — 팽창한 길 아래
//   받은 일          region (강조색, opaque, hatch) — 압축한 길 아래. cancel 에서 지워진다
//   넓이 이름        readout (한 일 · 받은 일 · 남은 일)
//   지나온 길        trajectory
//   A 표지 · 상태점   body circle · readout(`A`)
//   온도계           trajectory closed(관) · body circle(알) · region(막대) ·
//                    trajectory 점선(「처음」 눈금) · readout(`T` · 「처음」)
//
// 강조색은 「일(넓이)」 한 뜻에만 쓴다. 온도계 막대는 먹색 한 역할이다.
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
import { maxTemperature, readConstants, temperatureOf, walkCycle } from './physics';
import { text } from './schema';
import type { CyclicProcessState } from './state';

// ------------------------------------------------------------------------
// 배치 (월드 단위, y 위)
// ------------------------------------------------------------------------

/** P-V 그림 — 부피 한 단위의 가로 길이 · 압력 한 단위의 세로 길이. */
const X_PER_V = 1.35;
const Y_PER_P = 0.95;
/** 축이 가장 큰 부피 · 압력보다 더 뻗는 길이. */
const AXIS_OVERSHOOT = 0.6;
/** 축 머리 크기(월드). */
const AXIS_HEAD = 0.14;
/** 상태점 · A 표지 반지름(월드). */
const NOW_R = 0.09;
const STATE_R = 0.07;

/** 온도계 — 관 가운데 x · 관 폭 · 관 아래 끝 · 위 끝 · 알 반지름(월드). */
const THERMO = { x: 7.7, width: 0.24, bottom: 0.12, top: 3.1, bulbR: 0.2 } as const;
/** 가장 높은 온도가 닿는 자리 — 관 길이 중 이만큼(나머지는 관 끝 여유). */
const THERMO_SPAN = 0.88;
/** 막대가 관 안쪽 벽에서 떨어진 틈(월드). */
const LIQUID_INSET = 0.05;
/** 「처음」 눈금이 관 밖으로 뻗는 길이(월드). */
const MARK_REACH = 0.16;

// ------------------------------------------------------------------------
// 굵기 · 글자 · 불투명도 (화면 px 또는 0~1)
// ------------------------------------------------------------------------

const AXIS_PX = 1.5;
const PATH_PX = 2.5;
const TUBE_PX = 1.5;
const MARK_PX = 1.5;
const AREA_FILL = 0.45;
const LIQUID_FILL = 0.85;
const AXIS_LABEL_PX = 14;
const POINT_LABEL_PX = 14;
const AREA_LABEL_PX = 13;
const SMALL_PX = 12;
/** 축 이름 · 상태 이름 · 눈금 이름을 앵커에서 띄우는 거리. */
const LABEL_GAP = 12;
/** 온도계 「처음」 눈금 글자를 관 왼쪽으로 띄우는 거리(화면 px) — 눈금 표시에 붙여 둔다. */
const START_LABEL_GAP = 6;
/** `T` 를 관 위 끝에서 띄우는 거리 — 틈 + 글자 반 높이. */
const THERMO_LABEL_RISE = 6 + AXIS_LABEL_PX / 2;

/** 부피 · 압력 → P-V 그림 위 자리. */
const pv = (v: number, p: number): Vec2 => [v * X_PER_V, p * Y_PER_P];

/** 가로 [x0, x1] × 세로 [y0, y1] 사각형. */
const rect = (x0: number, y0: number, x1: number, y1: number): Vec2[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

export function scene(params: {
  state: CyclicProcessState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('cyclic-process: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  const now = walkCycle(
    {
      expand: tl.at('expand'),
      cool: tl.at('cool'),
      compress: tl.at('compress'),
      heat: tl.at('heat'),
    },
    c,
  );
  const fade = 1 - tl.at('out');
  const cancel = tl.at('cancel');

  const out: Primitive[] = [];

  // ================= P-V 그림 =================
  const [x1, yHigh] = pv(c.v1, c.pHigh);
  const [x2, yLow] = pv(c.v2, c.pLow);
  const [xf] = pv(now.vFilled, 0);
  const [xs] = pv(now.vSwept, 0);

  // ---- 한 일: 팽창한 길 아래. 압축이 시작되면 빗금이 된 몫만큼 아래 모서리가 빠진다 ----
  if (xf > x1) {
    const swept = xs < x2;
    const done = xs <= x1;
    const pts: Vec2[] = !swept
      ? rect(x1, 0, xf, yHigh)
      : done
        ? rect(x1, yLow, x2, yHigh)
        : [
            [x1, 0],
            [xs, 0],
            [xs, yLow],
            [x2, yLow],
            [x2, yHigh],
            [x1, yHigh],
          ];
    out.push({
      type: 'region',
      id: 'work-out',
      points: pts,
      fillOpacity: AREA_FILL,
      opaque: true,
      opacity: fade,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 받은 일: 압축한 길 아래 — 같은 넓이의 다른 몫이라 색이 아니라 결로 가른다 ----
  if (xs < x2 && cancel < 1) {
    out.push({
      type: 'region',
      id: 'work-in',
      points: rect(xs, 0, x2, yLow),
      fillOpacity: AREA_FILL,
      opaque: true,
      fill: 'hatch',
      opacity: fade * (1 - cancel),
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 축 ----
  const vAxisEnd = x2 + AXIS_OVERSHOOT;
  const pAxisEnd = yHigh + AXIS_OVERSHOOT;
  out.push({
    type: 'vector',
    id: 'axis-v',
    from: [0, 0],
    delta: [vAxisEnd, 0],
    width: AXIS_PX,
    headSize: AXIS_HEAD,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'axis-p',
    from: [0, 0],
    delta: [0, pAxisEnd],
    width: AXIS_PX,
    headSize: AXIS_HEAD,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push(symbol('axis-v-label', [vAxisEnd, 0], [LABEL_GAP, 0], 'V', 'muted'));
  out.push(symbol('axis-p-label', [0, pAxisEnd], [-LABEL_GAP, 0], 'P', 'muted'));

  // ---- 넓이 이름 ----
  // 고리 안 이름은 hold 단계 경계에서 「한 일」 → 「남은 일」 로 갈아 끼운다. 같은 자리에서
  // 교차 페이드하면 두 글자가 겹쳐 뭉개진다.
  const loopCenter: Vec2 = [(x1 + x2) / 2, (yLow + yHigh) / 2];
  const holding = tl.u >= tl.start('hold');
  if (tl.u >= tl.start('cool')) {
    out.push(
      areaLabel(
        holding ? 'label-net' : 'label-work-out',
        loopCenter,
        text(holding ? 'label.net' : 'label.workOut'),
        fade,
      ),
    );
  }
  if (tl.u >= tl.start('heat') && cancel < 1) {
    out.push(areaLabel('label-work-in', [(x1 + x2) / 2, yLow / 2], text('label.workIn'), fade * (1 - cancel)));
  }

  // ---- 지나온 길 ----
  if (now.points.length > 1) {
    out.push({
      type: 'trajectory',
      id: 'path',
      points: now.points.map(([v, p]) => pv(v, p)),
      width: PATH_PX,
      opacity: fade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- A 표지 · 지금 상태점 ----
  out.push({
    type: 'body',
    id: 'state-a',
    shape: 'circle',
    pos: [x1, yHigh],
    size: STATE_R,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push(symbol('state-a-label', [x1, yHigh], [-LABEL_GAP, -LABEL_GAP], 'A', 'ink'));
  out.push({
    type: 'body',
    id: 'state-now',
    shape: 'circle',
    pos: pv(now.v, now.p),
    size: NOW_R,
    glow: false,
    outline: 'background',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ================= 온도계 =================
  const tubeLeft = THERMO.x - THERMO.width / 2;
  const tubeRight = THERMO.x + THERMO.width / 2;
  const levelOf = (T: number): number =>
    THERMO.bottom + (T / maxTemperature(c)) * (THERMO.top - THERMO.bottom) * THERMO_SPAN;
  const level = levelOf(temperatureOf(now.v, now.p));
  const startLevel = levelOf(temperatureOf(c.v1, c.pHigh));

  out.push({
    type: 'trajectory',
    id: 'thermo-tube',
    points: rect(tubeLeft, THERMO.bottom, tubeRight, THERMO.top),
    closed: true,
    width: TUBE_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'region',
    id: 'thermo-liquid',
    points: rect(tubeLeft + LIQUID_INSET, 0, tubeRight - LIQUID_INSET, level),
    fillOpacity: LIQUID_FILL,
    opaque: true,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'thermo-bulb',
    shape: 'circle',
    pos: [THERMO.x, 0],
    size: THERMO.bulbR,
    glow: false,
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'thermo-start-mark',
    points: [
      [tubeLeft - MARK_REACH, startLevel],
      [tubeRight + MARK_REACH, startLevel],
    ],
    width: MARK_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: 'thermo-start-label',
    anchor: { world: [tubeLeft - MARK_REACH, startLevel], offset: [-START_LABEL_GAP, 0] },
    text: text('label.start'),
    chip: false,
    font: 'text',
    fontSize: SMALL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push(symbol('thermo-label', [THERMO.x, THERMO.top], [0, -THERMO_LABEL_RISE], 'T', 'muted'));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 물리 기호 · 상태 이름 — 표식이다 (C1). */
function symbol(
  id: string,
  at: Vec2,
  offset: Vec2,
  sym: string,
  role: 'muted' | 'ink',
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset },
    text: sym,
    chip: false,
    font: 'text',
    italic: role === 'muted',
    weight: role === 'ink' ? 'bold' : 'normal',
    fontSize: role === 'ink' ? POINT_LABEL_PX : AXIS_LABEL_PX,
    align: 'center',
    style: { colorRole: role, emphasis: 'strong' },
  };
}

/** 넓이 이름. 빗금 위에서도 읽히게 칩을 깐다. */
function areaLabel(id: string, at: Vec2, label: ReturnType<typeof text>, opacity: number): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: true,
    font: 'text',
    weight: 'bold',
    fontSize: AREA_LABEL_PX,
    align: 'center',
    opacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { minX: -0.8, maxX: 8.9, minY: -1.0, maxY: 3.7 };
}
