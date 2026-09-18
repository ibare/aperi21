// ========================================================================
// simple-pendulum — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 보(`surface`) · 줄(`constraint`) · 추(`body`) · 쉬는
// 자리(`trajectory` 점선) · 줄 길이(`dimension` + `readout`) · 왕복을 마친 순간의
// 섬광(`trace` ring) · 왕복 횟수 점(`trace` dot) · 이름표(`readout`) 가 모두 표준
// 어휘로 있다.
//
// 색: 세 추와 줄은 먹색(같은 장치). 가벼운 추와 무거운 추는 색이 아니라 채움으로
// 가른다(속 빈 m · 채운 4m). 강조색은 **왕복 한 번을 마쳤다** 한 가지 뜻에만 쓴다 —
// 섬광과 횟수 점이 같은 사건이다.
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
import { readConstants, readPendulum, type PendulumReading } from './physics';
import {
  BEAM_FROM,
  BEAM_TO,
  BOB_RADIUS,
  COUNT_GAP,
  COUNT_Y,
  LONG_DIM_X,
  MASS_LABEL_DROP,
  PIVOT_X,
  REST_OVERHANG,
  SCENE_BOUNDS,
  SHORT_DIM_X,
  text,
} from './schema';
import type { SimplePendulumState } from './state';

/** 섬광 — 처음 반지름 · 퍼지는 끝 반지름(화면 px) · 수명(초). */
const FLASH = { size: 7, spreadTo: 22, life: 0.8 } as const;
/** 횟수 점 반지름(화면 px). */
const COUNT_DOT = 4;
/** 길이 이름표를 치수선에서 띄우는 거리(화면 px). */
const DIM_LABEL_GAP = 7;
/** 횟수 줄 이름표를 첫 점에서 띄우는 거리(화면 px). */
const ROW_LABEL_GAP = 14;

/** 배수는 선언값 그대로 — 이름표 `{k}m` 에 끼운다. 자릿수를 코드가 줄이지 않는다 (S-piece 유효숫자). */
const ratioText = (k: number): string => String(k);

/** 매단 자리에서 추 둘레까지의 거리 비 — 줄이 추 중심 대신 둘레에서 끝나게. */
const rimRatio = (length: number): number => (length - BOB_RADIUS) / length;

interface Column {
  id: 'light' | 'heavy' | 'long';
  x: number;
  length: number;
  /** 무거운 추만 채운다. */
  heavy: boolean;
}

export function scene(params: {
  state: SimplePendulumState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('simple-pendulum: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  const shortL = c.shortLength;
  const longL = c.shortLength * c.lengthRatio;
  const columns: readonly Column[] = [
    { id: 'light', x: PIVOT_X.light, length: shortL, heavy: false },
    { id: 'heavy', x: PIVOT_X.heavy, length: shortL, heavy: true },
    { id: 'long', x: PIVOT_X.long, length: longL, heavy: false },
  ];

  // ---- 보 ----
  g.push({
    type: 'surface',
    id: 'beam',
    geometry: { kind: 'wall', from: [BEAM_FROM, 0], to: [BEAM_TO, 0] },
    material: 'solid',
  });

  const flashes: { pos: Vec2; age: number }[] = [];
  const counts: { pos: Vec2 }[] = [];
  let firstCountX = Infinity;

  for (const col of columns) {
    const r: PendulumReading = readPendulum(timeline, col.length, c);
    const bob: Vec2 = [col.x + r.bob[0], r.bob[1]];

    // 쉬는 자리 — 매단 자리에서 연직 아래로. 흔들림이 이 선을 가로지르는 것이 박자다.
    g.push({
      type: 'trajectory',
      id: `rest-${col.id}`,
      points: [
        [col.x, 0],
        [col.x, -col.length - REST_OVERHANG],
      ],
      width: 1,
      opacity: 0.6,
      style: { ...muted, lineStyle: 'dashed' },
    });

    g.push({
      type: 'constraint',
      id: `string-${col.id}`,
      subtype: 'string',
      from: [col.x, 0],
      // 추 중심이 아니라 둘레에서 끝낸다 — 속 빈 추 안으로 줄이 비쳐 들어가면 추 안에
      // 획이 하나 더 보인다. `to` 에 추 id 를 주면 중심까지 긋는다.
      to: [col.x + r.bob[0] * rimRatio(col.length), r.bob[1] * rimRatio(col.length)],
      style: ink,
    });
    g.push({
      type: 'body',
      id: `bob-${col.id}`,
      pos: bob,
      shape: 'circle',
      size: BOB_RADIUS,
      fill: col.heavy ? 'solid' : 'none',
      outline: 'role',
      glow: false,
      style: ink,
    });

    // 질량 이름표 — 쉬는 자리 아래 고정. 움직이는 추를 따라가면 글자가 흔들린다.
    g.push({
      type: 'readout',
      id: `mass-${col.id}`,
      anchor: { world: [col.x, -col.length - MASS_LABEL_DROP] },
      text: col.heavy ? text('label.massTimes') : text('label.mass'),
      ...(col.heavy ? { vars: { k: ratioText(c.massRatio) } } : {}),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: 14,
      align: 'center',
      style: ink,
    });

    // 왕복을 마친 순간 — 놓은 자리에서 섬광이 퍼진다.
    const release: Vec2 = [col.x + r.release[0], r.release[1]];
    for (const age of r.returnAges) {
      if (age >= 0 && age < FLASH.life) flashes.push({ pos: release, age });
    }

    // 왕복 횟수 점 — 기둥 아래 한 줄. 한 주기 동안 마칠 수만큼 자리를 가운데 맞춘다.
    const n = r.returnsPerCycle;
    const x0 = col.x - ((n - 1) * COUNT_GAP) / 2;
    firstCountX = Math.min(firstCountX, x0);
    for (let k = 0; k < r.returns && k < n; k++) counts.push({ pos: [x0 + k * COUNT_GAP, COUNT_Y] });
  }

  // ---- 줄 길이 ----
  // 짧은 줄 둘은 길이가 같으므로 왼쪽에 한 번만 잰다. 긴 줄은 오른쪽 바깥에서.
  const dims: readonly { id: string; x: number; length: number; left: boolean }[] = [
    { id: 'short', x: SHORT_DIM_X, length: shortL, left: true },
    { id: 'long', x: LONG_DIM_X, length: longL, left: false },
  ];
  for (const d of dims) {
    g.push({
      type: 'dimension',
      id: `length-${d.id}`,
      from: [d.x, 0],
      to: [d.x, -d.length],
      style: muted,
    });
    g.push({
      type: 'readout',
      id: `length-${d.id}-name`,
      anchor: { world: [d.x, -d.length / 2], offset: [d.left ? -DIM_LABEL_GAP : DIM_LABEL_GAP, 0] },
      text: d.left ? text('label.length') : text('label.lengthTimes'),
      ...(d.left ? {} : { vars: { k: ratioText(c.lengthRatio) } }),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: 14,
      align: d.left ? 'right' : 'left',
      style: ink,
    });
  }

  // ---- 섬광 · 횟수 점 ----
  // 강조색은 이 한 가지 뜻 — 「왕복 한 번을 마쳤다」.
  g.push({
    type: 'trace',
    id: 'return-flash',
    marks: flashes.map((f) => ({ pos: f.pos, age: f.age })),
    life: FLASH.life,
    shape: 'ring',
    size: FLASH.size,
    spreadTo: FLASH.spreadTo,
    width: 2,
    style: accent,
  });
  g.push({
    type: 'trace',
    id: 'return-count',
    marks: counts,
    shape: 'dot',
    size: COUNT_DOT,
    style: accent,
  });
  g.push({
    type: 'readout',
    id: 'returns-name',
    anchor: { world: [firstCountX, COUNT_Y], offset: [-ROW_LABEL_GAP, 0] },
    text: text('label.returns'),
    chip: false,
    font: 'text',
    fontSize: 12,
    align: 'right',
    style: muted,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
