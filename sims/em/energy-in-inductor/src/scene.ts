// ========================================================================
// energy-in-inductor — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 코일 고리 · 자기력선 · 이음선
// (lineSet), 코일 속 에너지 칠 · 차오르는 삼각형(region), 전류 · 역기전력(vector),
// 축 · LI–I 직선 · 내림 점선(trajectory), 지금 자리 · 단자(body circle),
// 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 코일 · 이음선 · LI–I 직선은 먹색, 전류(화살표 · 그래프 위 지금 자리)는
// primary, 역기전력은 secondary, 자기력선은 muted(배경 장)다. **강조색은 「쌓인 에너지」
// 한 뜻에만**(코일 속 칠 · 삼각형 · ½LI²). 축 · 값 이름표 · 내림 점선도 muted.
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
import { currentAt, emfAt, readConstants, type EnergyInInductorConstants } from './physics';
import { text } from './schema';
import type { EnergyInInductorState } from './state';

// ------------------------------------------------------------------------
// 색
// ------------------------------------------------------------------------

/** 코일 · 이음선 · 단자 · LI–I 직선. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 축 · 값 이름표 · 내림 점선 — 배경 정보. */
const GUIDE = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 전류 — 화살표와 그래프 위 지금 자리. */
const CURRENT = { colorRole: 'primary', emphasis: 'strong' } as const;
/** 역기전력. */
const EMF = { colorRole: 'secondary', emphasis: 'strong' } as const;
/** 자기력선. */
const FIELD = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 쌓인 에너지 — 이 한 뜻에만 강조색을 쓴다. */
const ENERGY = { colorRole: 'accent', emphasis: 'strong' } as const;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽이 옆에서 본 코일, 오른쪽이 LI–I 그래프.
// ------------------------------------------------------------------------

/** 코일 가운데 · 축 높이 · 길이 · 고리 수 · 고리 반지름(가로 · 세로 — 비스듬히 본 고리). */
const COIL_X = -4.2;
const AXIS_Y = 1.5;
const COIL_LENGTH = 2.2;
const COIL_RINGS = 7;
const RING_RX = 0.16;
const RING_RY = 0.62;

/**
 * 자기력선 배치. 선 k 는 코일 속을 높이 h 로 지나 축을 따라 뻗고, 바깥 높이 H 로 돌아오는
 * 닫힌 고리다. 안쪽 선과 바깥쪽 선의 값 사이를 고르게 나눈다.
 * h 는 고리 세로 반지름에 대한 비, H 와 reach(가로 반 폭)는 월드 단위.
 */
const LINE_INNER_FRAC = 0.15;
const LINE_OUTER_FRAC = 0.8;
const LINE_INNER_RETURN = 0.97;
const LINE_OUTER_RETURN = 1.77;
const LINE_INNER_REACH = 1.55;
const LINE_OUTER_REACH = 2.35;
/**
 * 자기력선 고리의 모남 — 초타원 지수. 2 면 타원이고, 클수록 코일 속을 지나는 변이
 * 축과 나란히 곧게 뻗는다(코일 속의 고른 장).
 */
const FIELD_SQUARENESS = 2.4;

/** 이음선이 내려가 단자로 끝나는 높이 · 단자 반지름. */
const LEAD_Y = -1.0;
const TERMINAL_R = 0.07;
/** 전류 화살표 — 왼쪽 이음선에서 비켜선 거리 · 단자에서 띄운 시작 높이. */
const CURRENT_ARROW_INSET = 0.24;
const CURRENT_ARROW_LIFT = 0.08;
const CURRENT_ARROW_BASE = LEAD_Y + CURRENT_ARROW_LIFT;
/** 역기전력 화살표가 놓이는 높이 — 두 이음선 사이, 자기력선 아래. */
const EMF_Y = -0.58;
/** 코일 속 에너지 칠의 세로 반 폭(고리 세로 반지름에 대한 비). */
const COIL_FILL_FRAC = 0.85;

/** 그래프 원점 · 가로(I) 길이 · 세로(LI) 길이. 끝 전류와 그때의 LI 가 축 끝에 온다. */
const GRAPH_X0 = -0.6;
const GRAPH_Y0 = -0.6;
const GRAPH_W = 5.0;
const GRAPH_H = 3.4;
/** 축이 끝 전류 · LI 끝을 넘어 더 가는 길이 — 축 이름이 놓일 자리. */
const AXIS_OVERHANG = 0.4;

/**
 * 프레이밍 — 왼쪽 가장 바깥 자기력선부터 그래프 가로축 이름표까지, 위 자기력선 위의
 * 여백과 아래 캡션 띠(장부 G24). 가장 큰 장면(끝 전류의 자기력선 · 다 찬 삼각형)이 처음부터 들어간다.
 */
const SCENE_BOUNDS = { minX: -6.9, maxX: 5.2, minY: -2.0, maxY: 3.5 } as const;

// ------------------------------------------------------------------------
// 치수 — 굵기 · 글자 크기 · 띄움은 화면 px 또는 월드, 그 밖의 짙기
// ------------------------------------------------------------------------

/** 고리 · 이음선 · 자기력선 · 축 · LI–I 직선 · 내림 점선 굵기(화면 px). */
const RING_PX = 2.5;
const WIRE_PX = 2.2;
const FIELD_PX = 1.6;
const AXIS_PX = 1.5;
const LINE_PX = 2.5;
const DROP_PX = 1.3;
const TICK_PX = 1.5;
/** 전류 · 역기전력 화살표 굵기(화면 px). */
const ARROW_PX = 3;
/** 고리 반쪽 하나 · 자기력선 하나를 이루는 점 개수. */
const HALF_RING_SEGMENTS = 20;
const FIELD_SEGMENTS = 72;
/** 이보다 짧은 화살표(월드)는 두지 않는다 — 머리만 남아 방향이 읽히지 않는다. */
const ARROW_MIN = 0.06;
/** 가로축 끝 전류 눈금의 반 길이(월드). */
const TICK_HALF = 0.09;
/** 그래프 위 지금 자리 점의 반지름(월드). */
const NOW_DOT = 0.09;
/** 코일 속 에너지 칠 · 삼각형 칠의 짙기. 삼각형은 다크 바탕에서도 직선과 갈려야 한다. */
const COIL_FILL = 0.55;
const TRIANGLE_FILL = 0.5;

/** 이름표 글자 크기(화면 px) · ½LI² 넓이 이름표 크기. */
const LABEL_PX = 13;
const AREA_LABEL_PX = 15;
/** 이름표를 대상에서 띄우는 거리(월드). */
const AXIS_LABEL_GAP = 0.28;
const TICK_LABEL_GAP = 0.3;
/** ½LI² 가 놓이는 자리 — 그래프 안 비율(가로 I 비, 세로 LI 비). */
const ENERGY_LABEL_AT: Vec2 = [0.68, 0.27];

// ------------------------------------------------------------------------
// 코일
// ------------------------------------------------------------------------

/** 코일의 고리 중심 x 들. */
function ringXs(): number[] {
  return Array.from(
    { length: COIL_RINGS },
    (_, i) => COIL_X - COIL_LENGTH / 2 + (i * COIL_LENGTH) / (COIL_RINGS - 1),
  );
}

/**
 * 고리 반쪽들. 옆에서 비스듬히 본 고리라 **왼쪽 반이 뒤, 오른쪽 반이 앞**이다.
 * 자기력선 · 에너지 칠을 둘 사이에 선언하면 고리 속을 지나는 것으로 읽힌다.
 */
function halfRings(front: boolean): Vec2[][] {
  const from = front ? -Math.PI / 2 : Math.PI / 2;
  return ringXs().map((cx) =>
    Array.from({ length: HALF_RING_SEGMENTS + 1 }, (_, k): Vec2 => {
      const a = from + (k / HALF_RING_SEGMENTS) * Math.PI;
      return [cx + RING_RX * Math.cos(a), AXIS_Y + RING_RY * Math.sin(a)];
    }),
  );
}

/**
 * k 번째 자기력선(0 = 축에 가장 가까운 선). n 은 한쪽 선 수. 축 아래는 거울상이다.
 */
function fieldLine(k: number, n: number, side: 1 | -1): Vec2[] {
  const f = n > 1 ? k / (n - 1) : 0;
  const h = RING_RY * (LINE_INNER_FRAC + (LINE_OUTER_FRAC - LINE_INNER_FRAC) * f);
  const H = LINE_INNER_RETURN + (LINE_OUTER_RETURN - LINE_INNER_RETURN) * f;
  const reach = LINE_INNER_REACH + (LINE_OUTER_REACH - LINE_INNER_REACH) * f;
  const yc = (h + H) / 2;
  const b = (H - h) / 2;
  const e = 2 / FIELD_SQUARENESS;
  return Array.from({ length: FIELD_SEGMENTS + 1 }, (_, i): Vec2 => {
    const a = (i / FIELD_SEGMENTS) * Math.PI * 2;
    const cx = Math.cos(a);
    const sy = Math.sin(a);
    return [
      COIL_X + reach * Math.sign(cx) * Math.abs(cx) ** e,
      AXIS_Y + side * (yc + b * Math.sign(sy) * Math.abs(sy) ** e),
    ];
  });
}

// ------------------------------------------------------------------------
// 그래프
// ------------------------------------------------------------------------

/** 그래프 안 전류 I(A) · 선속 쇄교 LI 를 월드 자리로. 축 끝이 끝 전류와 그때의 LI 다. */
function graphPoint(current: number, linkage: number, c: EnergyInInductorConstants): Vec2 {
  return [
    GRAPH_X0 + (current / c.finalCurrent) * GRAPH_W,
    GRAPH_Y0 + (linkage / (c.inductance * c.finalCurrent)) * GRAPH_H,
  ];
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: EnergyInInductorState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('energy-in-inductor: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  const current = currentAt(tl, c);
  /** 끝 전류에 대한 지금 전류의 비 0~1. */
  const ratio = current / c.finalCurrent;
  const emf = emfAt(tl, c);

  const xs = ringXs();
  const firstX = xs[0]!;
  const lastX = xs[xs.length - 1]!;
  const footY = AXIS_Y - RING_RY;

  // ================= 왼쪽 — 코일 =================

  // 이음선 — 첫 · 끝 고리 아래 끝에서 단자로 내려간다.
  out.push({
    type: 'lineSet',
    id: 'leads',
    lines: [
      [
        [firstX, footY],
        [firstX, LEAD_Y],
      ],
      [
        [lastX, footY],
        [lastX, LEAD_Y],
      ],
    ],
    width: WIRE_PX,
    style: INK,
  });
  for (const [id, x] of [
    ['terminal-in', firstX],
    ['terminal-out', lastX],
  ] as const) {
    out.push({
      type: 'body',
      id,
      pos: [x, LEAD_Y],
      shape: 'circle',
      size: TERMINAL_R,
      fill: 'none',
      outline: 'role',
      glow: false,
      style: INK,
    });
  }

  // 고리 뒤 반쪽.
  out.push({ type: 'lineSet', id: 'rings-back', lines: halfRings(false), width: RING_PX, style: INK });

  // 코일 속 에너지 — 쌓인 에너지는 B² 에, 곧 전류의 제곱에 비례한다. 짙기가 그것을 따른다.
  if (ratio > 0) {
    out.push({
      type: 'region',
      id: 'coil-energy',
      points: [
        [firstX, AXIS_Y - RING_RY * COIL_FILL_FRAC],
        [lastX, AXIS_Y - RING_RY * COIL_FILL_FRAC],
        [lastX, AXIS_Y + RING_RY * COIL_FILL_FRAC],
        [firstX, AXIS_Y + RING_RY * COIL_FILL_FRAC],
      ],
      fillOpacity: COIL_FILL,
      opacity: ratio * ratio,
      style: ENERGY,
    });
  }

  // 자기력선 — 선 수가 전류에 비례한다. 축 가까운 선부터 서고, 선 하나가 자리를 잡는
  // 동안만 옅다. 전류가 줄면 바깥 선부터 사라진다.
  const n = c.fieldLines;
  const level = ratio * n;
  const lines: Vec2[][] = [];
  const opacities: number[] = [];
  for (let k = 0; k < n; k++) {
    const o = Math.min(1, Math.max(0, level - k));
    for (const side of [1, -1] as const) {
      lines.push(fieldLine(k, n, side));
      opacities.push(o);
    }
  }
  if (level > 0) {
    out.push({ type: 'lineSet', id: 'field-lines', lines, opacities, width: FIELD_PX, style: FIELD });
  }

  // 고리 앞 반쪽 — 자기력선 위.
  out.push({ type: 'lineSet', id: 'rings-front', lines: halfRings(true), width: RING_PX, style: INK });

  // 인덕턴스 — 두 단자 사이. 값은 스테이지 상수 그대로.
  out.push({
    type: 'readout',
    id: 'inductance-label',
    anchor: { world: [COIL_X, LEAD_Y] },
    text: text('label.inductance'),
    vars: { l: String(c.inductance) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'center',
    style: GUIDE,
  });

  // 전류 — 왼쪽 이음선 옆을 따라 위로(코일로 들어간다). 길이가 전류에 비례한다.
  const currentLen = current * c.currentArrowPerAmp;
  if (currentLen > ARROW_MIN) {
    out.push({
      type: 'vector',
      id: 'current',
      from: [firstX - CURRENT_ARROW_INSET, CURRENT_ARROW_BASE],
      delta: [0, currentLen],
      label: text('label.currentArrow'),
      labelSide: 'ccw',
      width: ARROW_PX,
      outline: 'background',
      style: CURRENT,
    });
  }

  // 역기전력 — 두 이음선 사이. 전류는 코일 속을 왼쪽에서 오른쪽으로 지난다.
  // 키우는 동안은 그것을 거슬러 왼쪽으로, 줄이는 동안은 그것을 따라 오른쪽으로 민다.
  // 전류가 고르게 바뀌므로 한 단계 안에서 길이가 일정하다.
  const emfLen = emf.volts * c.emfArrowPerVolt;
  if (emf.sense && emfLen > ARROW_MIN) {
    const dir = emf.sense === 'oppose' ? -1 : 1;
    out.push({
      type: 'vector',
      id: 'emf',
      from: [COIL_X - (dir * emfLen) / 2, EMF_Y],
      delta: [dir * emfLen, 0],
      label: text('label.emf'),
      labelSide: 'auto',
      width: ARROW_PX,
      style: EMF,
    });
  }

  // ================= 오른쪽 — LI–I 그래프 =================

  const origin = graphPoint(0, 0, c);
  const corner = graphPoint(c.finalCurrent, c.inductance * c.finalCurrent, c);
  const now = graphPoint(current, c.inductance * current, c);

  // 쌓인 에너지 — 직선 아래 0 ~ 지금 전류의 삼각형. 직선 아래로 깐다(drawOrder: 'scene').
  if (ratio > 0) {
    out.push({
      type: 'region',
      id: 'energy-triangle',
      points: [origin, [now[0], origin[1]], now],
      fillOpacity: TRIANGLE_FILL,
      style: ENERGY,
    });
  }

  // 축. 이름은 축 끝에.
  out.push({
    type: 'trajectory',
    id: 'axes',
    points: [
      [origin[0], origin[1] + GRAPH_H + AXIS_OVERHANG],
      origin,
      [origin[0] + GRAPH_W + AXIS_OVERHANG, origin[1]],
    ],
    width: AXIS_PX,
    style: GUIDE,
  });
  out.push({
    type: 'readout',
    id: 'axis-i',
    anchor: { world: [origin[0] + GRAPH_W + AXIS_OVERHANG, origin[1] - AXIS_LABEL_GAP] },
    text: text('label.axisI'),
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'center',
    style: GUIDE,
  });
  out.push({
    type: 'readout',
    id: 'axis-li',
    anchor: { world: [origin[0] - AXIS_LABEL_GAP, origin[1] + GRAPH_H + AXIS_OVERHANG] },
    text: text('label.axisLI'),
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'right',
    style: GUIDE,
  });

  // 끝 전류 눈금. 값은 스테이지 상수 그대로다.
  const iEnd = graphPoint(c.finalCurrent, 0, c);
  out.push({
    type: 'lineSet',
    id: 'current-tick',
    lines: [
      [
        [iEnd[0], iEnd[1] - TICK_HALF],
        [iEnd[0], iEnd[1] + TICK_HALF],
      ],
    ],
    width: TICK_PX,
    style: GUIDE,
  });
  out.push({
    type: 'readout',
    id: 'current-label',
    anchor: { world: [iEnd[0], iEnd[1] - TICK_LABEL_GAP] },
    text: text('label.current'),
    vars: { i: String(c.finalCurrent) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'center',
    style: GUIDE,
  });

  // LI–I 직선. 처음부터 끝까지 그려 둔다 — 선속이 전류에 비례한다는 것은 코일이 정한
  // 것이고, 쌓이는 것은 그 아래 넓이다.
  out.push({
    type: 'trajectory',
    id: 'li-line',
    points: [origin, corner],
    width: LINE_PX,
    style: INK,
  });

  // 지금 자리 — 직선 위의 점과 가로축까지 내린 점선. 전류와 함께 오르내린다.
  if (ratio > 0) {
    out.push({
      type: 'trajectory',
      id: 'now-drop',
      points: [now, [now[0], origin[1]]],
      width: DROP_PX,
      style: { ...GUIDE, lineStyle: 'dashed' },
    });
    out.push({
      type: 'body',
      id: 'now-dot',
      pos: now,
      shape: 'circle',
      size: NOW_DOT,
      outline: 'background',
      glow: false,
      style: CURRENT,
    });
  }

  // ½LI² — 끝 전류로 머무는 동안만. 삼각형 안에.
  if (tl.phase === 'hold') {
    out.push({
      type: 'readout',
      id: 'energy-label',
      anchor: {
        world: graphPoint(
          c.finalCurrent * ENERGY_LABEL_AT[0],
          c.inductance * c.finalCurrent * ENERGY_LABEL_AT[1],
          c,
        ),
      },
      text: text('label.energy'),
      // 강조색 삼각형 위의 강조색 글자라 바탕 칩을 깐다.
      chip: true,
      fontSize: AREA_LABEL_PX,
      italic: true,
      weight: 'bold',
      align: 'center',
      style: ENERGY,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
