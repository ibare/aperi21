// ========================================================================
// heat-engine — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 열원 · 띠 · 일 더미 상자(region),
// 기관 상자 · 바퀴(body · lineSet), 흐르는 알갱이와 더미(particleSystem), 떼어 낸 자리
// (trajectory 점선), 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 열 알갱이 · 열 띠는 primary · muted, **강조색은 「일」 한 가지 뜻에만**
// (위로 꺾인 갈래 · 네모가 된 알갱이 · 일 더미). 버린 열은 색을 바꾸지 않는다 — 같은 열이
// 갈래만 다르다. 두 열원의 온도는 같은 `ink` 역할의 짙기로만 가른다 (빨강 · 파랑 두 역할 금지).
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
import { bands, readConstants, readGrains, rotorAngle } from './physics';
import { LAYOUT, SCENE_BOUNDS, text } from './schema';
import type { HeatEngineState } from './state';

/** 열원 · 기관 · 일 더미 이름표 글자 크기(화면 px). */
const NAME_PX = 13;
/** 띠 옆 양 표식(Q₁ · W · Q₂) 글자 크기(화면 px). */
const VALUE_PX = 13;
/** 뜨거운 · 찬 열원의 짙기 — 같은 역할의 명암으로 온도를 가른다. */
const HOT_FILL = 0.55;
const COLD_FILL = 0.14;
/** 열 띠 · 일 갈래 · 일 더미 상자의 짙기. */
const HEAT_BAND_FILL = 0.3;
const WORK_BAND_FILL = 0.42;
const WORK_BIN_FILL = 0.12;
/** 열 알갱이 반지름 · 일 알갱이(네모) 반변(화면 px). */
const HEAT_GRAIN_PX = 4.2;
const WORK_GRAIN_PX = 3.8;
/** 바퀴 살 · 떼어 낸 자리 윤곽의 굵기(화면 px). */
const SPOKE_PX = 2.5;
const EMPTY_OUTLINE_PX = 1;
/** 바퀴 살 끝 표지점의 반지름(월드). 바퀴가 도는지 읽히게 하는 점이다. */
const SPOKE_TIP_RADIUS = 0.07;

export function scene(params: {
  state: HeatEngineState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('heat-engine: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const b = bands(c);
  const half = LAYOUT.engineHalf;
  const hot = LAYOUT.hot;
  const cold = LAYOUT.cold;
  const bin = LAYOUT.workBin;
  const ww = b.workWidth;
  const out: Primitive[] = [];

  // ---- 떼어 냄 · 되돌림 ----
  // 찬 열원(과 거기 이르는 갈래)은 detach 동안 오른쪽으로 밀려나며 옅어지고, reset 동안 제자리로
  // 돌아오며 짙어진다. 그 사이(stall)에는 없다. 찬 쪽 더미는 열원과 함께 떠나고 돌아오지 않는다.
  const coldAlpha = 1 - tl.at('detach') + tl.at('reset');
  const coldShift = LAYOUT.detachShift * (tl.at('detach') - tl.at('reset'));
  const pileShift = LAYOUT.detachShift * tl.at('detach');
  const pileColdAlpha = 1 - tl.at('detach');
  /** 이번 주기에 쌓인 것 · 흐르는 것이 reset 동안 지워진다. */
  const clearAlpha = 1 - tl.at('reset');
  /** 떼어 낸 자리 윤곽 — 찬 열원이 없는 동안만. */
  const emptyAlpha = tl.at('detach') - tl.at('reset');

  const rect = (minX: number, maxX: number, minY: number, maxY: number): Vec2[] => [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ];

  // ---- 두 열원 ----
  out.push({
    type: 'region',
    id: 'hot-reservoir',
    points: rect(hot.minX, hot.maxX, hot.minY, hot.maxY),
    fillOpacity: HOT_FILL,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  if (emptyAlpha > 0) {
    out.push({
      type: 'trajectory',
      id: 'cold-empty',
      points: rect(cold.minX, cold.maxX, cold.minY, cold.maxY),
      closed: true,
      width: EMPTY_OUTLINE_PX,
      opacity: emptyAlpha,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }
  if (coldAlpha > 0) {
    out.push({
      type: 'region',
      id: 'cold-reservoir',
      points: rect(cold.minX + coldShift, cold.maxX + coldShift, cold.minY, cold.maxY),
      fillOpacity: COLD_FILL,
      opacity: coldAlpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 기관 바퀴 ----
  // 띠 아래에 깐다 — 알갱이가 바퀴 위를 지나간다. 한 바퀴 몫이 지나는 동안 한 바퀴 돌고 그 밖에는 서 있다.
  const angle = rotorAngle(tl, c);
  const tip: Vec2 = [Math.cos(angle) * LAYOUT.rotorRadius, Math.sin(angle) * LAYOUT.rotorRadius];
  out.push({
    type: 'body',
    id: 'rotor',
    pos: [0, 0],
    shape: 'circle',
    size: LAYOUT.rotorRadius,
    fill: 'none',
    outline: 'role',
    style: { colorRole: 'ink', emphasis: 'medium' },
  });
  out.push({
    type: 'lineSet',
    id: 'rotor-spoke',
    lines: [
      [
        [0, 0],
        tip,
      ],
    ],
    width: SPOKE_PX,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });
  out.push({
    type: 'body',
    id: 'rotor-tip',
    pos: tip,
    shape: 'circle',
    size: SPOKE_TIP_RADIUS,
    outline: 'none',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 띠 — 굵기가 열의 양이다 ----
  // 받은 열 띠는 기관 속 일 갈래 오른쪽 끝까지 온다. 거기서 위쪽 몫이 위로 꺾이고(일),
  // 아래쪽 몫이 오른쪽으로 계속 간다(버린 열).
  out.push({
    type: 'region',
    id: 'band-hot',
    points: rect(hot.maxX, ww / 2, b.bottom, b.top),
    fillOpacity: HEAT_BAND_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  if (coldAlpha > 0) {
    out.push({
      type: 'region',
      id: 'band-cold',
      points: rect(ww / 2, cold.minX + coldShift, b.bottom, b.bottom + b.coldWidth),
      fillOpacity: HEAT_BAND_FILL,
      opacity: coldAlpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'region',
    id: 'band-work',
    points: rect(-ww / 2, ww / 2, b.top, bin.minY),
    fillOpacity: WORK_BAND_FILL,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'region',
    id: 'work-bin',
    points: rect(bin.minX, bin.maxX, bin.minY, bin.maxY),
    fillOpacity: WORK_BIN_FILL,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: { colorRole: 'accent', emphasis: 'medium' },
  });

  // ---- 기관 상자 ----
  out.push({
    type: 'body',
    id: 'engine',
    pos: [0, 0],
    shape: 'rect',
    size: [half * 2, half * 2],
    fill: 'none',
    outline: 'role',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 알갱이 ----
  const grains = readGrains(tl, c);
  const heatPos: Vec2[] = [];
  const workPos: Vec2[] = [];
  const pilePos: Vec2[] = [];
  for (const g of grains) {
    if (g.inColdPile) pilePos.push([g.pos[0] + pileShift, g.pos[1]]);
    else if (g.isWork) workPos.push(g.pos);
    else heatPos.push(g.pos);
  }
  out.push({
    type: 'particleSystem',
    id: 'heat-grains',
    positions: heatPos,
    sizes: HEAT_GRAIN_PX,
    opacity: clearAlpha,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'particleSystem',
    id: 'cold-pile',
    positions: pilePos,
    sizes: HEAT_GRAIN_PX,
    opacity: pileColdAlpha,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'particleSystem',
    id: 'work-grains',
    positions: workPos,
    sizes: WORK_GRAIN_PX,
    shape: 'square',
    opacity: clearAlpha,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 이름표 ----
  const name = (id: string, at: Vec2, key: Parameters<typeof text>[0], align: 'center' | 'left', opacity = 1) =>
    out.push({
      type: 'readout',
      id,
      anchor: { world: at },
      text: text(key),
      chip: false,
      font: 'text',
      fontSize: NAME_PX,
      align,
      opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  name('name-hot', [(hot.minX + hot.maxX) / 2, hot.maxY + LAYOUT.labelGap], 'label.hot', 'center');
  if (coldAlpha > 0) {
    name(
      'name-cold',
      [(cold.minX + cold.maxX) / 2 + coldShift, cold.maxY + LAYOUT.labelGap],
      'label.cold',
      'center',
      coldAlpha,
    );
  }
  name('name-engine', [0, -half - LAYOUT.labelGap], 'label.engine', 'center');
  name('name-work', [bin.maxX + LAYOUT.labelGap, (bin.minY + bin.maxY) / 2], 'label.work', 'left');

  // 띠 옆 양 — 선언값 그대로의 글자.
  const value = (
    id: string,
    at: Vec2,
    key: Parameters<typeof text>[0],
    q: string,
    align: 'center' | 'left',
    role: 'muted' | 'accent',
    opacity = 1,
  ) =>
    out.push({
      type: 'readout',
      id,
      anchor: { world: at },
      text: text(key),
      vars: { q },
      chip: false,
      font: 'mono',
      fontSize: VALUE_PX,
      align,
      opacity,
      style: { colorRole: role, emphasis: 'strong' },
    });
  value('value-hot', [(hot.maxX - half) / 2, b.top + LAYOUT.labelGap], 'label.qHot', state.qHot, 'center', 'muted');
  value(
    'value-work',
    [ww / 2 + LAYOUT.labelGap, (half + bin.minY) / 2],
    'label.workAmount',
    state.work,
    'left',
    'accent',
  );
  if (coldAlpha > 0) {
    value(
      'value-cold',
      [(half + cold.minX) / 2 + coldShift, b.bottom - LAYOUT.labelGap],
      'label.qCold',
      state.qCold,
      'center',
      'muted',
      coldAlpha,
    );
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
