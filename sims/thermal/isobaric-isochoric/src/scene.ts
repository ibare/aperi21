// ========================================================================
// isobaric-isochoric — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없이 표준 어휘만 쓴다.
//
//   P-V 축              vector 둘 · readout(`P` · `V`) · lineSet(P 한 칸 눈금)
//   처음 상태 A          body circle 속 빈 것 · readout(`A`)
//   두 길               trajectory — 압력 고정은 가로, 부피 고정은 세로
//   칠해진 넓이          region (강조색 — 「기체가 한 일」 한 뜻) · readout(`W` · `W = 0`)
//   지금 상태점 둘        body circle · readout(「압력 고정」 · 「부피 고정」)
//   실린더 둘 · 기체      trajectory(벽) · region(옅은 칠)
//   피스톤 · 추 · 핀      body rect
//   가열판 둘            region · readout(`Q`)
//   온도 막대 둘          region(채움) · trajectory(관) · lineSet(눈금) · readout(`T` · `+… K`)
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
import { isobaricAt, isochoricAt, readConstants, type GasNow, type IsobaricIsochoricConstants } from './physics';
import { text, type IsobaricIsochoricMessageKey } from './schema';
import type { IsobaricIsochoricState } from './state';

// ------------------------------------------------------------------------
// 배치 (월드 단위, y 위)
// ------------------------------------------------------------------------

/** P-V 그림 — 부피 1 L 의 가로 길이 · 압력 한 칸의 세로 길이. */
const PV_X_PER_L = 2.4;
const PV_Y_PER_P = 1.35;
/** 축이 가장 큰 부피 · 압력보다 더 뻗는 길이. */
const AXIS_OVERSHOOT_V = 0.9;
const AXIS_OVERSHOOT_P = 0.6;
/** 축 머리 크기(월드). */
const AXIS_HEAD = 0.14;
/** 축 눈금 반 길이(월드). */
const TICK_HALF = 0.07;
/** 상태점 반지름(월드). */
const STATE_R = 0.07;
const NOW_R = 0.09;

/** 두 실린더 — 안쪽 좌우. 바닥 · 벽 위 끝은 같다. */
const CYL_BOTTOM = 0;
const CYL_TOP = 2.1;
const CYL_ISOBARIC = { left: 5.5, right: 6.7 } as const;
const CYL_ISOCHORIC = { left: 8.5, right: 9.7 } as const;
/** 부피 1 L 의 기체 기둥 높이. */
const GAS_H_PER_L = 0.9;
/** 피스톤 두께 · 벽과의 틈. */
const PISTON_H = 0.15;
const PISTON_GAP = 0.03;
/** 자유 피스톤 위 추. */
const WEIGHT: Vec2 = [0.7, 0.3];
/** 핀 — 벽을 가로지르는 짧은 막대. 피스톤 윗면에서 띄우는 틈. */
const PIN: Vec2 = [0.4, 0.08];
const PIN_GAP = 0.02;
/** 가열판 — 실린더 안쪽에서 들인 폭 · 위아래. */
const PLATE_INSET = 0.1;
const PLATE_BOTTOM = -0.32;
const PLATE_TOP = -0.1;
/** 온도 막대 — 실린더 오른벽에서 띄운 거리 · 폭 · 처음 온도 높이 · 가장 큰 상승의 높이 · 관 위 끝. */
const THERMO_OFFSET = 0.4;
const THERMO_W = 0.14;
const THERMO_T0 = 0.6;
const THERMO_MAX = 1.9;
const THERMO_TOP = 2.1;
/** 온도 막대 눈금 길이(관 오른쪽으로). */
const THERMO_TICK = 0.1;

// ------------------------------------------------------------------------
// 굵기 · 글자 · 불투명도 (화면 px 또는 0~1)
// ------------------------------------------------------------------------

const AXIS_PX = 1.5;
const PATH_PX = 2.5;
const WALL_PX = 3;
const GUIDE_PX = 1;
const TICK_PX = 1.5;
const AREA_FILL = 0.5;
const GAS_FILL = 0.07;
const THERMO_FILL = 0.75;
const PLATE_IDLE = 0.15;
const PLATE_ON = 0.7;
const AXIS_LABEL_PX = 14;
const POINT_LABEL_PX = 14;
const WORK_LABEL_PX = 18;
const NAME_PX = 13;
const SMALL_PX = 12;
/** 이름표를 앵커에서 띄우는 거리. */
const LABEL_GAP = 12;
/** 판 이름표와 판 사이 틈. */
const PLATE_LABEL_GAP = 6;
/** 작은 이름표를 앵커 아래로 내는 거리 — 틈 + 글자 반 높이. */
const SMALL_DROP = PLATE_LABEL_GAP + SMALL_PX / 2;

/** 부피 · 압력 → P-V 그림 위 자리. */
const pv = (v: number, p: number): Vec2 => [v * PV_X_PER_L, p * PV_Y_PER_P];

/** 부피 → 기체 기둥 위 끝. */
const gasTopOf = (v: number): number => CYL_BOTTOM + v * GAS_H_PER_L;

type Cyl = { readonly left: number; readonly right: number };

export function scene(params: {
  state: IsobaricIsochoricState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('isobaric-isochoric: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  const fade = tl.at('in') * (1 - tl.at('out'));
  const heat = tl.at('heat');
  const heating = tl.phase === 'heat';
  const holding = tl.u >= tl.start('hold');
  const started = heat > 0;

  const bar = isobaricAt(heat, c);
  const cho = isochoricAt(heat, c);

  const out: Primitive[] = [];

  // ================= P-V 그림 =================
  const [ax, ay] = pv(c.v0, c.p0);
  const [bx] = pv(bar.v, bar.p);
  const [, cy] = pv(cho.v, cho.p);

  // ---- 칠해진 넓이 — 가로선 아래 ----
  if (bx > ax) {
    out.push({
      type: 'region',
      id: 'area',
      points: [
        [ax, 0],
        [bx, 0],
        [bx, ay],
        [ax, ay],
      ],
      fillOpacity: AREA_FILL,
      opacity: fade,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 축 ----
  const vMax = isobaricAt(1, c).v;
  const pMax = isochoricAt(1, c).p;
  const vAxisEnd = pv(vMax, 0)[0] + AXIS_OVERSHOOT_V;
  const pAxisEnd = pv(0, pMax)[1] + AXIS_OVERSHOOT_P;
  out.push(axis('axis-v', [vAxisEnd, 0]));
  out.push(axis('axis-p', [0, pAxisEnd]));
  const ticks: Vec2[][] = [];
  for (let k = 1; k <= Math.floor(pMax); k++) {
    const y = k * PV_Y_PER_P;
    ticks.push([
      [-TICK_HALF, y],
      [TICK_HALF, y],
    ]);
  }
  out.push({
    type: 'lineSet',
    id: 'axis-p-ticks',
    lines: ticks,
    width: AXIS_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push(symbolLabel('axis-v-label', [vAxisEnd, 0], [LABEL_GAP, 0], 'V', AXIS_LABEL_PX, 'muted'));
  out.push(symbolLabel('axis-p-label', [0, pAxisEnd], [-LABEL_GAP, 0], 'P', AXIS_LABEL_PX, 'muted'));

  // ---- 두 길 ----
  if (started) {
    out.push(path('path-isobaric', [ax, ay], [bx, ay], fade));
    out.push(path('path-isochoric', [ax, ay], [ax, cy], fade));
  }

  // ---- 넓이 이름 ----
  if (holding) {
    out.push({
      ...symbolLabel('work-label', [(ax + bx) / 2, ay / 2], [0, 0], 'W', WORK_LABEL_PX, 'ink'),
      weight: 'bold',
      opacity: fade,
    });
    out.push({
      ...symbolLabel('work-zero-label', [ax, (ay + cy) / 2], [-LABEL_GAP, 0], 'W = 0', POINT_LABEL_PX, 'ink'),
      align: 'right',
      opacity: fade,
    });
  }

  // ---- A 표지 ----
  out.push({
    type: 'body',
    id: 'state-a',
    shape: 'circle',
    pos: [ax, ay],
    size: STATE_R,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    ...symbolLabel('state-a-label', [ax, ay], [-LABEL_GAP, LABEL_GAP], 'A', POINT_LABEL_PX, 'ink'),
    italic: false,
    weight: 'bold',
  });

  // ---- 지금 상태점 둘 · 이름 ----
  out.push(nowPoint('now-isobaric', [bx, ay], fade));
  out.push(nowPoint('now-isochoric', [ax, cy], fade));
  if (started) {
    out.push(nameLabel('now-isobaric-label', [bx, ay], [LABEL_GAP, 0], 'left', 'label.isobaric', fade));
    out.push(nameLabel('now-isochoric-label', [ax, cy], [0, -LABEL_GAP], 'center', 'label.isochoric', fade));
  }

  // ================= 두 실린더 =================
  out.push(...cylinder('isobaric', CYL_ISOBARIC, bar, c, heating, holding, fade));
  out.push(...cylinder('isochoric', CYL_ISOCHORIC, cho, c, heating, holding, fade));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 실린더 한 통 — 가열판 · 기체 · 피스톤 · (추 또는 핀) · 벽 · 이름 · 온도 막대. */
function cylinder(
  kind: 'isobaric' | 'isochoric',
  cyl: Cyl,
  gas: GasNow,
  c: IsobaricIsochoricConstants,
  heating: boolean,
  holding: boolean,
  fade: number,
): Primitive[] {
  const out: Primitive[] = [];
  const cx = (cyl.left + cyl.right) / 2;
  const gasTop = gasTopOf(gas.v);
  const pistonTop = gasTop + PISTON_H;

  // ---- 가열판 ----
  out.push({
    type: 'region',
    id: `${kind}-plate`,
    points: [
      [cyl.left + PLATE_INSET, PLATE_BOTTOM],
      [cyl.right - PLATE_INSET, PLATE_BOTTOM],
      [cyl.right - PLATE_INSET, PLATE_TOP],
      [cyl.left + PLATE_INSET, PLATE_TOP],
    ],
    fillOpacity: heating ? PLATE_ON : PLATE_IDLE,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  if (heating || holding) {
    out.push({
      ...symbolLabel(`${kind}-plate-label`, [cx, PLATE_BOTTOM], [0, SMALL_DROP], 'Q', POINT_LABEL_PX, 'ink'),
      opacity: fade,
    });
  }

  // ---- 기체 ----
  out.push({
    type: 'region',
    id: `${kind}-gas`,
    points: [
      [cyl.left, CYL_BOTTOM],
      [cyl.right, CYL_BOTTOM],
      [cyl.right, gasTop],
      [cyl.left, gasTop],
    ],
    fillOpacity: GAS_FILL,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 피스톤 ----
  out.push({
    type: 'body',
    id: `${kind}-piston`,
    shape: 'rect',
    pos: [cx, gasTop + PISTON_H / 2],
    size: [cyl.right - cyl.left - 2 * PISTON_GAP, PISTON_H],
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  if (kind === 'isobaric') {
    // 추 — 압력을 붙드는 것. 피스톤과 함께 오른다.
    out.push({
      type: 'body',
      id: `${kind}-weight`,
      shape: 'rect',
      pos: [cx, pistonTop + WEIGHT[1] / 2],
      size: WEIGHT,
      outline: 'background',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  } else {
    // 핀 — 부피를 붙드는 것. 두 벽을 가로질러 피스톤 윗면 바로 위에 박힌다.
    const pinY = pistonTop + PIN_GAP + PIN[1] / 2;
    for (const [side, x] of [
      ['l', cyl.left],
      ['r', cyl.right],
    ] as const) {
      out.push({
        type: 'body',
        id: `${kind}-pin-${side}`,
        shape: 'rect',
        pos: [x, pinY],
        size: PIN,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  }

  // ---- 벽 (피스톤 · 핀 위에 그어 가장자리가 먹선으로 남게) ----
  out.push({
    type: 'trajectory',
    id: `${kind}-wall`,
    points: [
      [cyl.left, CYL_TOP],
      [cyl.left, CYL_BOTTOM],
      [cyl.right, CYL_BOTTOM],
      [cyl.right, CYL_TOP],
    ],
    width: WALL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push(
    nameLabel(`${kind}-name`, [cx, CYL_TOP], [0, -LABEL_GAP], 'center', kind === 'isobaric' ? 'label.isobaric' : 'label.isochoric', 1),
  );

  // ---- 온도 막대 — 두 통이 같은 눈금을 쓴다 ----
  const perK = (THERMO_MAX - THERMO_T0) / Math.max(c.dTp, c.dTv);
  const level = THERMO_T0 + gas.dT * perK;
  const tx = cyl.right + THERMO_OFFSET;
  const l = tx - THERMO_W / 2;
  const r = tx + THERMO_W / 2;
  out.push({
    type: 'region',
    id: `${kind}-thermo-fill`,
    points: [
      [l, CYL_BOTTOM],
      [r, CYL_BOTTOM],
      [r, level],
      [l, level],
    ],
    fillOpacity: THERMO_FILL,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: `${kind}-thermo-tube`,
    points: [
      [l, CYL_BOTTOM],
      [r, CYL_BOTTOM],
      [r, THERMO_TOP],
      [l, THERMO_TOP],
    ],
    closed: true,
    width: GUIDE_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push(symbolLabel(`${kind}-thermo-label`, [tx, THERMO_TOP], [0, -LABEL_GAP], 'T', AXIS_LABEL_PX, 'muted'));
  // 처음 온도 눈금 — 두 막대가 같은 높이에서 출발한다.
  const tickLines: Vec2[][] = [
    [
      [r, THERMO_T0],
      [r + THERMO_TICK, THERMO_T0],
    ],
  ];
  if (holding) {
    tickLines.push([
      [r, level],
      [r + THERMO_TICK, level],
    ]);
    out.push({
      type: 'readout',
      id: `${kind}-rise`,
      anchor: { world: [r + THERMO_TICK, level], offset: [PLATE_LABEL_GAP, 0] },
      text: text('label.rise'),
      vars: { dt: String(kind === 'isobaric' ? c.dTp : c.dTv) },
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: NAME_PX,
      align: 'left',
      opacity: fade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'lineSet',
    id: `${kind}-thermo-ticks`,
    lines: tickLines,
    width: TICK_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  return out;
}

function axis(id: string, delta: Vec2): Primitive {
  return {
    type: 'vector',
    id,
    from: [0, 0],
    delta,
    width: AXIS_PX,
    headSize: AXIS_HEAD,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

function path(id: string, from: Vec2, to: Vec2, fade: number): Primitive {
  return {
    type: 'trajectory',
    id,
    points: [from, to],
    width: PATH_PX,
    opacity: fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

function nowPoint(id: string, pos: Vec2, fade: number): Primitive {
  return {
    type: 'body',
    id,
    shape: 'circle',
    pos,
    size: NOW_R,
    glow: false,
    outline: 'background',
    opacity: fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

/** 물리 기호 · 단위 표기 — 표식이다 (C1). */
function symbolLabel(
  id: string,
  at: Vec2,
  offset: Vec2,
  sym: string,
  fontSize: number,
  role: 'ink' | 'muted',
): Primitive & { type: 'readout' } {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset },
    text: sym,
    chip: false,
    font: 'text',
    italic: true,
    fontSize,
    align: 'center',
    style: { colorRole: role, emphasis: 'strong' },
  };
}

/** 「압력 고정」 · 「부피 고정」 — 문안 (C1). 실린더와 P-V 그림의 점을 같은 말로 잇는다. */
function nameLabel(
  id: string,
  at: Vec2,
  offset: Vec2,
  align: 'left' | 'center',
  k: IsobaricIsochoricMessageKey,
  opacity: number,
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset },
    text: text(k),
    chip: false,
    font: 'text',
    fontSize: NAME_PX,
    align,
    opacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { minX: -0.7, maxX: 11.6, minY: -1.0, maxY: 3.6 };
}
