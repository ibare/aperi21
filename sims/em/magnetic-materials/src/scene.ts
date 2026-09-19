// ========================================================================
// magnetic-materials — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 세 줄이 나란하다 — 철(강자성) · 알루미늄(상자성) · 비스무트(반자성). 줄마다 천장 받침
// (`surface` wall rough)에 실(`constraint` string)로 막대(`body` rect)가 매달려 있고, 곧게
// 매달린 자리를 점선 추선(`trajectory`)이 남긴다. 막대 오른쪽에서 같은 막대자석(`body` rect
// 둘 + 극 표식 `readout`)이 N 끝을 앞세워 다가온다. 막대 안에는 원자 자리(`particleSystem`)와
// 그 위의 작은 쌍극자 화살표(`vector`)가 있다.
//
// 세 막대 · 세 자석은 모두 같은 색이다. 재료를 색으로 가르지 않는다 — 가르는 것은 기우는
// 방향 · 크기와 안쪽 화살표의 모양이다 (S-piece: 색으로 설명하지 않는다).
// ========================================================================

import type {
  Body,
  Bounds,
  Constraint,
  EnvironmentDef,
  ParticleSystem,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  Surface,
  TimelineFrame,
  Trajectory,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import {
  barPose,
  dipoles,
  domainWalls,
  magnetCenter,
  readConstants,
  type MaterialKind,
} from './physics';
import { SCENE_BOUNDS, text, type MagneticMaterialsMessageKey } from './schema';
import type { MagneticMaterialsState } from './state';

/** 자극 표식 글자 크기(화면 px). 자석 두께 안에 들어가는 크기다. */
const POLE_LABEL_PX = 14;
/** 재료 이름 · 자성 종류 이름표 글자 크기(화면 px). */
const NAME_LABEL_PX = 13;
const CLASS_LABEL_PX = 12;
/** 이름표를 막대 밑면(곧게 매달렸을 때)에서 아래로 내리는 거리(월드). */
const NAME_LABEL_DROP = 0.3;
const CLASS_LABEL_DROP = 0.62;
/** 곧은 막대 밑면 아래로 긋는 추선 눈금의 길이(월드). 이름표에 닿지 않는 만큼. */
const PLUMB_TICK = 0.14;
/** 받침의 반폭(월드). 매단 점 양쪽으로. */
const SUPPORT_HALF = 0.45;
/** 추선 · 구역 경계 굵기(화면 px). 안내선이라 가늘다. */
const GUIDE_WIDTH_PX = 1;
/** 쌍극자 화살표 굵기(화면 px)와 머리 크기(월드). 작은 막대 안에 아홉이 들어가는 크기다. */
const DIPOLE_WIDTH_PX = 2;
const DIPOLE_HEAD = 0.075;
/** 원자 자리 점 반지름(화면 px). 화살표 아래 깔리는 자리 표시라 작다. */
const ATOM_PX = 1.6;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const GUIDE = { colorRole: 'muted', emphasis: 'medium' } as const;
/** 옅은 회색 — 막대 · 자석 N 반쪽 채움. */
const FAINT = { colorRole: 'muted', emphasis: 'subtle' } as const;

const KINDS: readonly {
  kind: MaterialKind;
  name: MagneticMaterialsMessageKey;
  cls: MagneticMaterialsMessageKey;
}[] = [
  { kind: 'ferro', name: 'material.iron', cls: 'class.ferro' },
  { kind: 'para', name: 'material.aluminum', cls: 'class.para' },
  { kind: 'dia', name: 'material.bismuth', cls: 'class.dia' },
];

export function scene(params: {
  state: MagneticMaterialsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('magnetic-materials: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const out: Primitive[] = [];

  // 주기 처음에 나타나고 끝에 흐려진다. 받침 · 추선 · 이름표는 늘 있다.
  const opacity = tl.at('appear') * (1 - tl.at('clear'));
  // 자석이 다가온 정도 — 끌림 · 밀림 · 정렬이 모두 이것의 함수다.
  const f = tl.at('approach');
  const restBottom = c.pivotY - c.pendulumLength - c.barHeight / 2;

  for (const { kind, name, cls } of KINDS) {
    const x0 = c.x[kind];

    // ---- 받침 · 추선 ----
    // 받침은 오른쪽에서 왼쪽으로 긋는다 — 결(rough)이 진행 방향 오른쪽, 곧 위에 새겨진다.
    const support: Surface = {
      type: 'surface',
      id: `support-${kind}`,
      geometry: { kind: 'wall', from: [x0 + SUPPORT_HALF, c.pivotY], to: [x0 - SUPPORT_HALF, c.pivotY] },
      material: 'rough',
    };
    // 추선은 막대 밖에만 긋는다 — 막대 채움이 비쳐 안쪽 화살표를 가리지 않게. 곧게 매달렸을 때의
    // 실 자리(위)와 밑면 가운데 아래 눈금(아래)이 기울기의 기준이다.
    const plumbTop: Trajectory = {
      type: 'trajectory',
      id: `plumb-${kind}-top`,
      points: [
        [x0, c.pivotY],
        [x0, restBottom + c.barHeight],
      ],
      width: GUIDE_WIDTH_PX,
      style: { ...GUIDE, lineStyle: 'dashed' },
    };
    const plumbTick: Trajectory = {
      type: 'trajectory',
      id: `plumb-${kind}-tick`,
      points: [
        [x0, restBottom],
        [x0, restBottom - PLUMB_TICK],
      ],
      width: GUIDE_WIDTH_PX,
      style: { ...GUIDE, lineStyle: 'dashed' },
    };
    out.push(support, plumbTop, plumbTick);

    // ---- 실 · 막대 ----
    const pose = barPose(c, kind, f);
    const thread: Constraint = {
      type: 'constraint',
      id: `thread-${kind}`,
      subtype: 'string',
      from: [x0, c.pivotY],
      to: pose.top,
      opacity,
      style: INK,
    };
    const bar: Body = {
      type: 'body',
      id: `bar-${kind}`,
      pos: pose.center,
      shape: 'rect',
      size: [c.barWidth, c.barHeight],
      orientation: pose.angle,
      fill: 'solid',
      outline: 'line',
      opacity,
      style: FAINT,
    };
    out.push(thread, bar);

    // ---- 강자성 구역 경계 — 구역이 한 방향으로 맞춰질수록 옅어진다 ----
    if (kind === 'ferro') {
      domainWalls(c, pose).forEach(([a, b], i) => {
        const wall: Trajectory = {
          type: 'trajectory',
          id: `domain-wall-${i}`,
          points: [a, b],
          width: GUIDE_WIDTH_PX,
          opacity: opacity * (1 - f),
          style: { ...GUIDE, lineStyle: 'dotted' },
        };
        out.push(wall);
      });
    }

    // ---- 원자 자리 · 쌍극자 ----
    const ds = dipoles(c, kind, pose, f, tl.t);
    const atoms: ParticleSystem = {
      type: 'particleSystem',
      id: `atoms-${kind}`,
      positions: ds.map((d) => d.site),
      sizes: ATOM_PX,
      opacity,
      style: GUIDE,
    };
    out.push(atoms);
    ds.forEach((d, i) => {
      const arrow: Vector = {
        type: 'vector',
        id: `dipole-${kind}-${i}`,
        from: d.from,
        delta: d.delta,
        width: DIPOLE_WIDTH_PX,
        headSize: DIPOLE_HEAD,
        opacity,
        style: INK,
      };
      out.push(arrow);
    });

    // ---- 막대자석 — N 끝이 막대 쪽(왼쪽). N 반쪽만 옅게 채운다 (장부 G183 · G177) ----
    const [mx, my] = magnetCenter(c, kind, f);
    const q = c.magnetLength / 4;
    const northFill: Body = {
      type: 'body',
      id: `magnet-${kind}-north-fill`,
      pos: [mx - q, my],
      shape: 'rect',
      size: [c.magnetLength / 2, c.magnetThickness],
      fill: 'solid',
      outline: 'none',
      opacity,
      style: FAINT,
    };
    const magnet: Body = {
      type: 'body',
      id: `magnet-${kind}`,
      pos: [mx, my],
      shape: 'rect',
      size: [c.magnetLength, c.magnetThickness],
      fill: 'none',
      outline: 'role',
      opacity,
      style: INK,
    };
    out.push(northFill, magnet);
    for (const pole of ['north', 'south'] as const) {
      const mark: Readout = {
        type: 'readout',
        id: `magnet-${kind}-${pole}`,
        anchor: { world: [pole === 'north' ? mx - q : mx + q, my] },
        text: text(pole === 'north' ? 'mark.north' : 'mark.south'),
        chip: false,
        font: 'text',
        weight: 'bold',
        fontSize: POLE_LABEL_PX,
        align: 'center',
        opacity,
        style: INK,
      };
      out.push(mark);
    }

    // ---- 이름표 — 곧게 매달린 자리 아래 ----
    const nameLabel: Readout = {
      type: 'readout',
      id: `name-${kind}`,
      anchor: { world: [x0, restBottom - NAME_LABEL_DROP] },
      text: text(name),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: NAME_LABEL_PX,
      align: 'center',
      style: INK,
    };
    const classLabel: Readout = {
      type: 'readout',
      id: `class-${kind}`,
      anchor: { world: [x0, restBottom - CLASS_LABEL_DROP] },
      text: text(cls),
      chip: false,
      font: 'text',
      fontSize: CLASS_LABEL_PX,
      align: 'center',
      style: MUTED,
    };
    out.push(nameLabel, classLabel);
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 세 줄 전체와 멀리 있던 자석, 이름표 · 캡션 줄 — 매 프레임 같은 값이다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
