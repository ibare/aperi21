// ========================================================================
// bose-einstein-condensate — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음 — 온도계(trajectory closed · region ·
// lineSet 눈금) · 덫 속 원자(particleSystem) · 속도 분포 곡선(trajectory)과 그 축
// (lineSet) · 글자(readout).
//
// 색은 뜻마다 하나다 — 원자와 분포 곡선은 먹색(같은 원자들을 두 방식으로 본 것).
// 바닥 상태로 몰린 원자도 **같은 색**이다: 몰렸다는 것은 색이 아니라 점이 한 자리에
// 겹쳐 쌓인 모양과 곡선의 높이로 보인다 (S-piece). 온도계 · 축 · 이름표는 배경 정보라
// muted. 강조색은 쓰지 않는다 — 가를 뜻이 하나도 없다.
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
import {
  atomPositions,
  drawAtoms,
  peakDensity,
  readConstants,
  readCooling,
  velocityDensity,
  type BoseEinsteinCondensateConstants,
} from './physics';
import {
  CLOUD_CENTER,
  PROFILE_BASE_Y,
  PROFILE_CENTER_X,
  PROFILE_HALF_WIDTH,
  PROFILE_PEAK_HEIGHT,
  SCENE_BOUNDS,
  THERMO_BOTTOM,
  THERMO_HALF_WIDTH,
  THERMO_TOP,
  THERMO_X,
  text,
  type BoseEinsteinCondensateMessageKey,
} from './schema';
import type { BoseEinsteinCondensateState } from './state';

/** 분포 곡선의 표본 수. 바닥 상태 봉우리(폭 0.12)가 각지지 않게 판 전체(6.6)에 촘촘히. */
const PROFILE_SAMPLES = 441;
/** 곡선 굵기(화면 px). */
const CURVE_WIDTH = 2;
/** 축 · 눈금 · 온도계 둘레 굵기(화면 px). 재는 선이라 가늘다. */
const AXIS_WIDTH = 1;
/** 원자 점의 반지름(화면 px) · 불투명도. 옅게 두어야 퍼진 구름의 성긴 점과 몰린 덩이가 갈린다. */
const ATOM_PX = 1.7;
const ATOM_OPACITY = 0.8;
/** 온도계 채움의 불투명도. */
const THERMO_FILL_OPACITY = 0.55;
/** 온도계 둘레가 채움 꼭대기(T_HIGH) 위로 더 나가는 길이(월드). */
const THERMO_HEADROOM = 0.25;
/** 온도계 · 분포 판의 눈금이 둘레 · 축 밖으로 나가는 길이(월드). */
const TICK_LEN = 0.14;
/** 속도축이 판 반폭 밖으로 더 나가는 길이(월드). 축 이름이 곡선 끝과 붙지 않게. */
const AXIS_OVERHANG = 0.3;
/** 글자 크기(화면 px) — 눈금 · 판 이름 · 봉우리 이름. */
const TICK_PX = 11;
const PANEL_PX = 12;
const PEAK_PX = 12;
/** 이름표를 앵커에서 띄우는 거리(화면 px). */
const TICK_LABEL_GAP = 14;
const SIDE_LABEL_GAP = 8;
const PANEL_LABEL_GAP = 16;
const PEAK_LABEL_GAP = 10;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const ATOM = { colorRole: 'ink', emphasis: 'medium' } as const;
const GUIDE = { colorRole: 'muted', emphasis: 'strong' } as const;

function label(
  id: string,
  key: BoseEinsteinCondensateMessageKey,
  world: Vec2,
  offset: Vec2,
  align: 'left' | 'center' | 'right',
  fontSize: number,
  opacity: number,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world, offset },
    text: text(key),
    chip: false,
    font: 'text',
    align,
    fontSize,
    opacity,
    style: GUIDE,
  };
}

/** 온도(Tc 배) → 온도계의 높이(월드). T_HIGH 가 꼭대기다. */
function thermoY(T: number, c: BoseEinsteinCondensateConstants): number {
  return THERMO_BOTTOM + (T / c.tHigh) * (THERMO_TOP - THERMO_BOTTOM);
}

function thermometer(T: number, c: BoseEinsteinCondensateConstants): Primitive[] {
  const l = THERMO_X - THERMO_HALF_WIDTH;
  const r = THERMO_X + THERMO_HALF_WIDTH;
  const top = THERMO_TOP + THERMO_HEADROOM;
  const level = thermoY(Math.max(0, T), c);
  const tc = thermoY(1, c);
  return [
    {
      type: 'region',
      id: 'thermo-fill',
      points: [
        [l, THERMO_BOTTOM],
        [r, THERMO_BOTTOM],
        [r, level],
        [l, level],
      ],
      fillOpacity: THERMO_FILL_OPACITY,
      style: GUIDE,
    },
    {
      type: 'trajectory',
      id: 'thermo-rim',
      points: [
        [l, THERMO_BOTTOM],
        [r, THERMO_BOTTOM],
        [r, top],
        [l, top],
      ],
      closed: true,
      width: AXIS_WIDTH,
      style: GUIDE,
    },
    // 임계 온도 눈금. 처음부터 있다 — 채움이 이 줄 아래로 내려가는 순간 구름이 무너진다.
    {
      type: 'lineSet',
      id: 'thermo-tc',
      lines: [
        [
          [l - TICK_LEN, tc],
          [r + TICK_LEN, tc],
        ],
      ],
      width: AXIS_WIDTH,
      style: GUIDE,
    },
    label('thermo-tc-label', 'label.tc', [l - TICK_LEN, tc], [-SIDE_LABEL_GAP, 0], 'right', TICK_PX, 1),
    label('thermo-label', 'label.thermo', [THERMO_X, THERMO_BOTTOM], [0, PANEL_LABEL_GAP], 'center', PANEL_PX, 1),
  ];
}

function profileAxes(): Primitive[] {
  const left = PROFILE_CENTER_X - PROFILE_HALF_WIDTH - AXIS_OVERHANG;
  const right = PROFILE_CENTER_X + PROFILE_HALF_WIDTH + AXIS_OVERHANG;
  return [
    {
      type: 'lineSet',
      id: 'profile-axis',
      lines: [
        [
          [left, PROFILE_BASE_Y],
          [right, PROFILE_BASE_Y],
        ],
        [
          [PROFILE_CENTER_X, PROFILE_BASE_Y],
          [PROFILE_CENTER_X, PROFILE_BASE_Y - TICK_LEN],
        ],
      ],
      width: AXIS_WIDTH,
      style: GUIDE,
    },
    label('profile-v', 'label.v', [right, PROFILE_BASE_Y], [SIDE_LABEL_GAP, 0], 'left', PANEL_PX, 1),
    label('profile-zero', 'label.zero', [PROFILE_CENTER_X, PROFILE_BASE_Y], [0, TICK_LABEL_GAP], 'center', TICK_PX, 1),
    label(
      'profile-label',
      'label.profile',
      [PROFILE_CENTER_X, PROFILE_BASE_Y],
      [0, TICK_LABEL_GAP + PANEL_LABEL_GAP],
      'center',
      PANEL_PX,
      1,
    ),
  ];
}

export function scene(params: {
  state: BoseEinsteinCondensateState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('bose-einstein-condensate: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const now = readCooling(timeline, c);
  const a = now.alpha;
  const out: Primitive[] = [...thermometer(now.T, c), ...profileAxes()];

  // ---- 덫 속 원자: 퍼진 구름이 줄어들고, Tc 아래에서 한가운데로 몰린다 ----
  const [cx, cy] = CLOUD_CENTER;
  const atoms = atomPositions(drawAtoms(c), now.T, now.f0, timeline.t, c);
  out.push({
    type: 'particleSystem',
    id: 'atoms',
    positions: atoms.map(([x, y]): Vec2 => [cx + x, cy + y]),
    sizes: ATOM_PX,
    opacity: a * ATOM_OPACITY,
    style: ATOM,
  });
  out.push(
    label('cloud-label', 'label.cloud', [cx, PROFILE_BASE_Y], [0, TICK_LABEL_GAP + PANEL_LABEL_GAP], 'center', PANEL_PX, 1),
  );

  // ---- 속도 분포: 언덕이 좁아지고, Tc 아래에서 한가운데 봉우리가 선다 ----
  // 세로 배율은 가장 차가운 멈춤의 봉우리에 맞춰 상수에서 한 번 정한다 — 매 프레임 같다.
  const scaleY = PROFILE_PEAK_HEIGHT / peakDensity(c);
  const curve: Vec2[] = [];
  for (let i = 0; i < PROFILE_SAMPLES; i++) {
    const v = -PROFILE_HALF_WIDTH + (2 * PROFILE_HALF_WIDTH * i) / (PROFILE_SAMPLES - 1);
    curve.push([PROFILE_CENTER_X + v, PROFILE_BASE_Y + scaleY * velocityDensity(v, now.T, now.f0, c)]);
  }
  out.push({
    type: 'trajectory',
    id: 'profile-curve',
    points: curve,
    width: CURVE_WIDTH,
    opacity: a,
    style: INK,
  });

  // 봉우리 이름 — Tc 아래로 내려가는 동안 나타나 봉우리 꼭대기를 따라 올라간다.
  const show = now.below * a;
  if (show > 0) {
    const top = PROFILE_BASE_Y + scaleY * velocityDensity(0, now.T, now.f0, c);
    out.push(
      label('peak-label', 'label.peak', [PROFILE_CENTER_X, top], [PEAK_LABEL_GAP, 0], 'left', PEAK_PX, show),
    );
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
