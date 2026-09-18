// ========================================================================
// explosion-and-recoil — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 바닥(`surface`) · 처음 이음매 자리(`trajectory` 점선) ·
// 두 덩이(`body`) · 1 초마다 남긴 자국(`trace` tick) · 파편(`particleSystem`) · 속도(`vector`) · 표식(`readout`) ·
// 같은 시간 동안 간 거리(`dimension`)가 모두 표준 어휘로 있다.
//
// 색: 두 덩이와 자국은 먹색(같은 대상 — 다른 것은 너비뿐), 강조색은 **속도** 한 가지
// 뜻에만 쓴다. 이음매 자리 · 파편 · 치수선 · 질량 표식은 배경 정보(muted)다.
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
import { derive, readConstants, type PieceReading } from './physics';
import {
  ARROW_LIFT,
  ARROW_SCALE,
  BLOCK_H,
  GROUND_X,
  SCENE_BOUNDS,
  WIDTH_PER_MASS,
  text,
  type ExplosionAndRecoilMessageKey,
} from './schema';
import type { ExplosionAndRecoilState } from './state';

/** 질량 표식을 바닥 아래로 내리는 거리(화면 px). */
const MASS_LABEL_OFFSET: Vec2 = [0, 16];
/** 속도 표식을 화살표 위로 올리는 거리(화면 px). */
const SPEED_LABEL_OFFSET: Vec2 = [0, -14];
/** 치수선 높이(월드) — 화살표 위. 치수선이 나올 때 화살표는 옅어져 있다. */
const DIM_Y = BLOCK_H + ARROW_LIFT + 0.2;
/** 처음 이음매 자리 표시의 위 끝(월드). */
const SEAM_TOP = DIM_Y + 0.04;

/** 파편 수 · 퍼지는 빠르기(월드/초) · 수명(초) · 아래로 끌리는 가속(월드/초²). */
const SPARK_COUNT = 12;
const SPARK_SPEED = 1.1;
const SPARK_LIFE = 0.7;
const SPARK_FALL = 2.4;

interface Side {
  id: 'heavy' | 'light';
  /** 가는 쪽 — 무거운 조각이 왼쪽(−1), 가벼운 조각이 오른쪽(+1). */
  dir: -1 | 1;
  width: number;
  reading: PieceReading;
  mass: ExplosionAndRecoilMessageKey;
  speed: ExplosionAndRecoilMessageKey;
  distance: ExplosionAndRecoilMessageKey;
}

export function scene(params: {
  state: ExplosionAndRecoilState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('explosion-and-recoil: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const op = r.opacity;
  const pieceOp = op * r.pieceOpacity;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  const sides: readonly Side[] = [
    {
      id: 'heavy',
      dir: -1,
      width: c.heavyMass * WIDTH_PER_MASS,
      reading: r.heavy,
      mass: 'label.heavyMass',
      speed: 'label.heavySpeed',
      distance: 'label.heavyDistance',
    },
    {
      id: 'light',
      dir: 1,
      width: c.lightMass * WIDTH_PER_MASS,
      reading: r.light,
      mass: 'label.lightMass',
      speed: 'label.lightSpeed',
      distance: 'label.lightDistance',
    },
  ];
  /** 이음매에서 `moved` 만큼 떨어진 덩이의 중심 x. */
  const centerX = (s: Side, moved: number): number => s.dir * (moved + s.width / 2);

  // ---- 바닥과 처음 이음매 자리 ----
  g.push({
    type: 'surface',
    id: 'floor',
    geometry: { kind: 'wall', from: [GROUND_X[0], 0], to: [GROUND_X[1], 0] },
    material: 'smooth',
    opacity: op,
  });
  // 두 덩이가 맞닿아 있던 자리. 두 거리를 여기서 잰다.
  g.push({
    type: 'trajectory',
    id: 'seam',
    points: [
      [0, 0],
      [0, SEAM_TOP],
    ],
    width: 1,
    opacity: op * 0.8,
    style: { ...muted, lineStyle: 'dashed' },
  });

  // ---- 1 초마다 남긴 자국 ----
  // 안쪽 면이 1 초마다 있던 자리에 세로 획을 남긴다(스트로보 — 늙지 않는 `trace`).
  // 같은 시간 간격이라 간격이 곧 빠르기다. 덩이 윤곽 전체를 남기면 무거운 쪽은
  // 간격(0.25)이 너비(0.48)보다 좁아 윤곽끼리 겹쳐 사다리처럼 엉킨다.
  for (const s of sides) {
    if (s.reading.ghosts.length === 0) continue;
    g.push({
      type: 'trace',
      id: `${s.id}-marks`,
      marks: s.reading.ghosts.map((moved) => ({ pos: [s.dir * moved, BLOCK_H / 2] as Vec2 })),
      shape: 'tick',
      size: BLOCK_H,
      width: 1.5,
      opacity: op * 0.55,
      style: ink,
    });
  }

  // ---- 두 덩이 ----
  for (const s of sides) {
    const x = centerX(s, s.reading.moved);
    g.push({
      type: 'body',
      id: `${s.id}-block`,
      pos: [x, BLOCK_H / 2],
      shape: 'rect',
      size: [s.width, BLOCK_H],
      opacity: pieceOp,
      style: ink,
    });
    g.push({
      type: 'readout',
      id: `${s.id}-mass`,
      anchor: { world: [x, 0], offset: MASS_LABEL_OFFSET },
      text: text(s.mass),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: 14,
      align: 'center',
      opacity: pieceOp,
      style: muted,
    });
  }

  // ---- 터지는 파편 ----
  // 이음매에서 부채꼴로 튀어 옅어진다. 「터졌다」 는 사건의 표지일 뿐, 운동량 셈에는
  // 넣지 않는다(질량이 없는 것으로 친다).
  if (r.sinceBurst >= 0 && r.sinceBurst < SPARK_LIFE) {
    const age = r.sinceBurst;
    const positions: Vec2[] = [];
    for (let i = 0; i < SPARK_COUNT; i++) {
      const a = (Math.PI * (i + 0.5)) / SPARK_COUNT;
      positions.push([
        Math.cos(a) * SPARK_SPEED * age,
        BLOCK_H * 0.55 + Math.sin(a) * SPARK_SPEED * age - 0.5 * SPARK_FALL * age * age,
      ]);
    }
    g.push({
      type: 'particleSystem',
      id: 'sparks',
      positions,
      sizes: 2.5,
      opacity: op * (1 - age / SPARK_LIFE),
      style: muted,
    });
  }

  // ---- 속도 ----
  // 강조색은 이 한 뜻에만. 화살표 길이는 속력에 비례한다 — 두 화살표의 비가 자국 간격의 비와 같다.
  for (const s of sides) {
    const len = s.reading.speedNow * ARROW_SCALE;
    if (len <= 0) continue;
    const x = centerX(s, s.reading.moved);
    const y = BLOCK_H + ARROW_LIFT;
    g.push({
      type: 'vector',
      id: `${s.id}-velocity`,
      from: [x, y],
      delta: [s.dir * len, 0],
      opacity: pieceOp,
      style: accent,
    });
    g.push({
      type: 'readout',
      id: `${s.id}-speed`,
      anchor: { world: [x + (s.dir * len) / 2, y], offset: SPEED_LABEL_OFFSET },
      text: text(s.speed),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: 14,
      align: 'center',
      opacity: pieceOp,
      style: accent,
    });
  }

  // ---- 같은 시간 동안 간 거리 ----
  // 3 초째 자국까지. 이음매에서 안쪽 면까지 잰다 — 너비가 달라도 간 거리만 남는다.
  if (r.measuring) {
    for (const s of sides) {
      // 3 초째 자국을 치수선 끝까지 점선으로 올려 잇는다 — 치수선이 무엇을 재는지 자리로 말한다.
      g.push({
        type: 'trajectory',
        id: `${s.id}-measure-lead`,
        points: [
          [s.dir * s.reading.measured, BLOCK_H],
          [s.dir * s.reading.measured, DIM_Y],
        ],
        width: 1,
        opacity: op * 0.8,
        style: { ...muted, lineStyle: 'dashed' },
      });
      g.push({
        type: 'dimension',
        id: `${s.id}-distance`,
        from: [0, DIM_Y],
        to: [s.dir * s.reading.measured, DIM_Y],
        text: text(s.distance),
        opacity: op,
        style: muted,
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
