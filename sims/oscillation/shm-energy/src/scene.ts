// ========================================================================
// shm-energy — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 바닥 · 벽(surface) ·
// 용수철(constraint spring) · 상자(body) · 속도(vector) · 평형점과 양 끝 표시(lineSet +
// readout) · 에너지 막대 두 칸(region) · 합의 선(trajectory)이 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 운동 에너지 칸은 속도 화살표와 같은 primary(운동), 퍼텐셜 칸은
// 용수철과 같은 secondary(용수철에 담긴 것). **강조색은 「합」 한 가지 뜻에만** 쓴다
// (막대 꼭대기의 선과 E). 상자는 먹색, 바닥 · 표시선은 배경 정보라 muted.
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
import { phaseAngle, readConstants, readOscillator } from './physics';
import {
  BAR_HEIGHT,
  BAR_LABEL_INSET,
  BAR_LABEL_X,
  BAR_LEFT,
  BAR_RIGHT,
  BLOCK_SIZE,
  FLOOR_END_X,
  MARK_BOTTOM_Y,
  MARK_LABEL_Y,
  MARK_TOP_Y,
  SCENE_BOUNDS,
  SPEED_ARROW_SCALE,
  SPEED_ARROW_Y,
  TOTAL_LABEL_X,
  TOTAL_OVERHANG,
  WALL_TOP,
  WALL_X,
  text,
  type ShmEnergyMessageKey,
} from './schema';
import type { ShmEnergyState } from './state';

/** 표시선 · 막대 이름표 글자 크기(화면 px). 도식의 표식이라 캡션보다 작다. */
const MARK_LABEL_PX = 11;
const BAR_LABEL_PX = 12;
/** 표시선 굵기(화면 px)와 짙기. 재는 선이지 그림의 일부가 아니라 가장 가늘고 옅게. */
const MARK_WIDTH = 1;
const MARK_OPACITY = 0.45;
/** 막대 칸의 채움 짙기. 두 칸이 맞닿는 경계가 또렷해야 한다. */
const BAR_FILL = 0.78;
/** 용수철 감은 수. 가장 눌린 순간(약 1.2 m)에도 코일이 뭉치지 않는 만큼. */
const SPRING_COILS = 7;
/** 합의 선 굵기(화면 px). 막대 꼭대기에서 막대보다 도드라져야 한다. */
const TOTAL_WIDTH = 2;
/** 이만큼(월드 m)보다 짧은 속도 화살표는 그리지 않는다 — 끝에서 멈춘 순간 촉만 남는다. */
const MIN_ARROW = 0.04;

export function scene(params: {
  state: ShmEnergyState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('shm-energy: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const osc = readOscillator(phaseAngle(timeline), c);
  const out: Primitive[] = [];
  const half = BLOCK_SIZE / 2;

  // ---- 평형점 · 양 끝 표시 ----
  // 상자가 어디서 멈추고(±A) 어디서 가장 빠른지(0) 막대와 맞대어 읽는 자리다.
  const marks: { x: number; label: ShmEnergyMessageKey }[] = [
    { x: -c.amplitude, label: 'label.minusA' },
    { x: 0, label: 'label.zero' },
    { x: c.amplitude, label: 'label.plusA' },
  ];
  out.push({
    type: 'lineSet',
    id: 'marks',
    lines: marks.map(
      (m): Vec2[] => [
        [m.x, MARK_BOTTOM_Y],
        [m.x, MARK_TOP_Y],
      ],
    ),
    width: MARK_WIDTH,
    opacity: MARK_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  marks.forEach((m, i) => {
    out.push({
      type: 'readout',
      id: `mark-label-${i}`,
      anchor: { world: [m.x, MARK_LABEL_Y] },
      text: text(m.label),
      chip: false,
      fontSize: MARK_LABEL_PX,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  });

  // ---- 바닥 · 벽 ----
  out.push({
    type: 'surface',
    id: 'floor',
    geometry: { kind: 'wall', from: [WALL_X, 0], to: [FLOOR_END_X, 0] },
    material: 'solid',
  });
  out.push({
    type: 'surface',
    id: 'wall',
    geometry: { kind: 'wall', from: [WALL_X, 0], to: [WALL_X, WALL_TOP] },
    material: 'solid',
  });

  // ---- 용수철 · 상자 ----
  // 용수철은 퍼텐셜 칸과 같은 색이다 — 그 칸이 곧 이 용수철에 담긴 것이다.
  out.push({
    type: 'constraint',
    id: 'spring',
    subtype: 'spring',
    from: [WALL_X, half],
    to: [osc.x - half, half],
    coils: SPRING_COILS,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'block',
    pos: [osc.x, half],
    shape: 'rect',
    size: [BLOCK_SIZE, BLOCK_SIZE],
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 속도 화살표. 운동 에너지 칸과 같은 색이다 — 그 칸이 곧 이 빠르기가 담은 것이다.
  // 끝에서 멈춘 순간은 그리지 않는다. 그때 막대의 운동 에너지 칸도 비어 있다.
  const arrow = osc.v * SPEED_ARROW_SCALE;
  if (Math.abs(arrow) > MIN_ARROW) {
    out.push({
      type: 'vector',
      id: 'speed',
      from: [osc.x, SPEED_ARROW_Y],
      delta: [arrow, 0],
      label: text('label.speed'),
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // ---- 에너지 막대 ----
  // 높이가 정해진 막대 하나를 아래 · 위로 나눈다. 경계만 오르내리고 꼭대기는 움직이지
  // 않는다 — 한 칸이 비운 자리를 다른 칸이 채운다.
  const boundary = BAR_HEIGHT * osc.kineticShare;
  out.push({
    type: 'region',
    id: 'bar-kinetic',
    points: [
      [BAR_LEFT, 0],
      [BAR_RIGHT, 0],
      [BAR_RIGHT, boundary],
      [BAR_LEFT, boundary],
    ],
    fillOpacity: BAR_FILL,
    opaque: true,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'region',
    id: 'bar-potential',
    points: [
      [BAR_LEFT, boundary],
      [BAR_RIGHT, boundary],
      [BAR_RIGHT, BAR_HEIGHT],
      [BAR_LEFT, BAR_HEIGHT],
    ],
    fillOpacity: BAR_FILL,
    opaque: true,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // 합의 선. 막대 꼭대기에 늘 같은 자리로 걸려 있다 — 이 선이 움직이지 않는다는 것이 주장이다.
  out.push({
    type: 'trajectory',
    id: 'total',
    points: [
      [BAR_LEFT - TOTAL_OVERHANG, BAR_HEIGHT],
      [BAR_RIGHT + TOTAL_OVERHANG, BAR_HEIGHT],
    ],
    width: TOTAL_WIDTH,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'total-label',
    anchor: { world: [TOTAL_LABEL_X, BAR_HEIGHT] },
    text: text('label.total'),
    chip: false,
    fontSize: BAR_LABEL_PX,
    align: 'center',
    italic: true,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 칸 이름표. 운동 에너지 칸은 늘 바닥에, 퍼텐셜 칸은 늘 꼭대기에 붙어 있어서 이름표를
  // 그 끝에 고정해 두면 칸이 얇아져도 이름표가 칸을 따라 흔들리지 않는다.
  const barLabels: { id: string; y: number; label: ShmEnergyMessageKey; role: 'primary' | 'secondary' }[] = [
    { id: 'ke-label', y: BAR_LABEL_INSET, label: 'label.ke', role: 'primary' },
    { id: 'pe-label', y: BAR_HEIGHT - BAR_LABEL_INSET, label: 'label.pe', role: 'secondary' },
  ];
  for (const l of barLabels) {
    out.push({
      type: 'readout',
      id: l.id,
      anchor: { world: [BAR_LABEL_X, l.y] },
      text: text(l.label),
      chip: false,
      fontSize: BAR_LABEL_PX,
      align: 'center',
      weight: 'bold',
      style: { colorRole: l.role, emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
