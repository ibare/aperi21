// ========================================================================
// nuclear-fission — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음.
//
// 핵은 `region` 하나(경계 다각형은 physics 가 원 · 흔들림 · 아령으로 계산)에 같은 점의
// `trajectory` closed 윤곽을 두른다. 중성자는 `body` 원 + 표식 `n`(`readout`), 튀어나온
// 중성자의 지나온 길은 `trajectory` 꼬리. 핵종 표기 ᴬX 는 `readout` 둘(위 첨자 A · 기호).
//
// 색 — 핵은 먹(`ink`), 중성자는 회색(`muted`) — 이웃 `nuclear-structure` 와 같은 대상 같은 색.
// 강조색(`accent`)은 「풀려난 에너지」 한 뜻에만 쓴다: 조각의 속도 화살표와 「약 200 MeV」.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import {
  circlePoints,
  dumbbellPoints,
  neutronDirections,
  radiusOf,
  readConstants,
  repelDistance,
  repelSpeed,
  symbolOf,
  wobblePoints,
  type Nuclide,
} from './physics';
import { BALANCE_OFFSET, ENERGY_POS, INCOMING_X, SCENE_BOUNDS, text, type NuclearFissionMessageKey } from './schema';
import type { NuclearFissionState } from './state';

// ------------------------------------------------------------------------
// 위계 — 화면 px 이거나 월드 길이
// ------------------------------------------------------------------------

/** 핵 면의 짙기 — 먹색을 거의 채운다. 중성자(회색)가 위에 얹혀 읽히는 정도. */
const NUCLEUS_FILL = 0.85;
/** 핵 윤곽 굵기(화면 px). */
const NUCLEUS_EDGE_W = 1.5;
/** 흔들림의 가장 큰 변형 비와 흔들리는 횟수. 끝에서 가로로 길어지는 쪽으로 넘어가도록 정수 번. */
const WOBBLE_AMP = 0.17;
const WOBBLE_COUNT = 3;
/** 핵종 표기가 핵 윗가장자리에서 떨어지는 거리(월드). */
const LABEL_GAP = 0.3;
/** 기호 · 위 첨자 A · 중성자 표식 · 장부 · 에너지 글자 크기(화면 px). */
const SYMBOL_PX = 22;
const SCRIPT_PX = 13;
const N_LABEL_PX = 13;
const BALANCE_PX = 15;
const ENERGY_PX = 17;
/** 위 첨자를 기호 왼쪽 위에 붙이는 띄움(화면 px). */
const SCRIPT_DX = -1;
const SCRIPT_DY = -9;
/** 중성자 표식 `n` 을 알갱이 옆 위에 두는 띄움(화면 px). 가로는 움직이는 쪽의 반대편에 둔다. */
const N_LABEL_DX = 12;
const N_LABEL_DY = -11;
/** 속도 화살표 길이 배율(월드 길이 / 월드 속력) · 굵기(화면 px). */
const ARROW_SCALE = 0.6;
const ARROW_W = 2.5;
/** 튀어나온 중성자 꼬리 굵기(화면 px) · 길이(월드). 가운데 글자를 가로지르지 않을 만큼 짧게. */
const TRAIL_W = 1;
const TRAIL_LEN = 0.9;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const NEUTRON = { colorRole: 'muted', emphasis: 'strong' } as const;
const ACCENT = { colorRole: 'accent', emphasis: 'strong' } as const;

const lerp = (a: number, b: number, u: number): number => a + (b - a) * u;

function nucleus(id: string, pts: Vec2[], opacity: number, out: Primitive[]): void {
  if (opacity <= 0) return;
  const face: Region = {
    type: 'region',
    id: `${id}-face`,
    points: pts,
    fillOpacity: NUCLEUS_FILL,
    opaque: true,
    opacity,
    style: INK,
  };
  const edge: Trajectory = {
    type: 'trajectory',
    id: `${id}-edge`,
    points: pts,
    closed: true,
    width: NUCLEUS_EDGE_W,
    opacity,
    style: INK,
  };
  out.push(face, edge);
}

/** 중성자 하나. `heading` 은 가로로 움직이는 쪽(+1 오른쪽 · −1 왼쪽) — 표식을 그 반대편에 둔다. */
function neutron(id: string, pos: Vec2, r: number, heading: number, opacity: number, out: Primitive[]): void {
  if (opacity <= 0) return;
  const side = heading > 0 ? -1 : 1;
  const b: Body = {
    type: 'body',
    id,
    shape: 'circle',
    pos,
    size: r,
    outline: 'background',
    glow: false,
    opacity,
    style: NEUTRON,
  };
  const offset: Vec2 = [side * N_LABEL_DX, N_LABEL_DY];
  out.push(b, label(`${id}-n`, 'label.value', pos, offset, { v: 'n' }, N_LABEL_PX, side > 0 ? 'left' : 'right', opacity, 'text'));
}

function label(
  id: string,
  key: NuclearFissionMessageKey,
  pos: Vec2,
  offset: Vec2,
  vars: Record<string, string | number>,
  fontSize: number,
  align: 'left' | 'center' | 'right',
  opacity: number,
  font: 'text' | 'mono',
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos, offset },
    text: text(key),
    vars,
    chip: false,
    font,
    align,
    fontSize,
    opacity,
    style: INK,
  };
}

/** 핵종 표기 ᴬX — 핵 위 가운데. */
function notation(id: string, k: Nuclide, x: number, top: number, opacity: number, out: Primitive[]): void {
  if (opacity <= 0) return;
  const at: Vec2 = [x, top + LABEL_GAP];
  out.push(label(`${id}-mass`, 'label.value', at, [SCRIPT_DX, SCRIPT_DY], { v: k.a }, SCRIPT_PX, 'right', opacity, 'text'));
  out.push(label(`${id}-symbol`, 'label.value', at, [0, 0], { v: symbolOf(k.z) }, SYMBOL_PX, 'left', opacity, 'text'));
}

export function scene(params: {
  state: NuclearFissionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl } = params;
  if (!tl) throw new Error('nuclear-fission: schema.timeline 이 선언되어야 한다');
  const k = readConstants(params.stage);
  const compound: Nuclide = { z: k.target.z, a: k.target.a + 1 };
  const rn = radiusOf(1, k.radiusScale);
  const rT = radiusOf(k.target.a, k.radiusScale);
  const rC = radiusOf(compound.a, k.radiusScale);
  const rH = radiusOf(k.heavy.a, k.radiusScale);
  const rL = radiusOf(k.light.a, k.radiusScale);
  // 두 조각의 질량 중심이 원점에 남도록 벌린다.
  const mSum = k.heavy.a + k.light.a;
  const wH = k.heavy.a / mSum;
  const wL = k.light.a / mSum;

  const approach = tl.at('approach');
  const absorb = tl.at('absorb');
  const wobble = tl.at('wobble');
  const stretch = tl.at('stretch');
  const split = tl.at('split');
  const clear = tl.at('clear');
  const renew = tl.at('renew');
  const keep = 1 - clear;
  const out: Primitive[] = [];

  if (split <= 0) {
    // ---- 갈라지기 전 — 한 덩어리 ----
    // 이름표 높이는 흔들림이 가장 클 때의 윗가장자리에 맞춘다 — 모양을 따라 오르내리면 글자가 떤다.
    // 흡수 동안 그 높이로 올라가고, 늘어나는 동안 조각의 윗가장자리로 내려온다.
    const wobbleTop = rC * (1 + WOBBLE_AMP);
    let pts: Vec2[];
    let top: number;
    if (stretch > 0) {
      const d = stretch * (rH + rL);
      const r1 = lerp(rC, rH, stretch);
      const r2 = lerp(rC, rL, stretch);
      pts = dumbbellPoints(-d * wL, r1, d * wH, r2, stretch);
      top = lerp(wobbleTop, Math.max(r1, r2), stretch);
    } else if (wobble > 0) {
      const b = WOBBLE_AMP * wobble * Math.sin(2 * Math.PI * WOBBLE_COUNT * wobble);
      pts = wobblePoints([0, 0], rC, b);
      top = wobbleTop;
    } else {
      pts = circlePoints([0, 0], lerp(rT, rC, absorb));
      top = lerp(rT, wobbleTop, absorb);
    }
    nucleus('nucleus', pts, 1, out);

    // 느린 중성자 — 다가와 닿고, 속으로 들어가며 사라진다.
    if (absorb < 1) {
      const touch = -(rT + rn);
      const x = absorb > 0 ? lerp(touch, 0, absorb) : lerp(INCOMING_X, touch, approach);
      neutron('incoming', [x, 0], rn, 1, 1 - absorb, out);
    }

    // 이름표 — 다 들어오면 A 가 하나 는다.
    notation('nucleus', absorb >= 1 ? compound : k.target, 0, top, 1, out);
    return out;
  }

  // ---- 갈라진 뒤 ----
  // 진행도는 모두 선형이라 τ 가 조각 시계와 같은 빠르기로 흐른다.
  const reveal = tl.at('reveal');
  const tally = tl.at('tally');
  const tau =
    split * tl.duration('split') +
    reveal * tl.duration('reveal') +
    tally * tl.duration('tally') +
    clear * tl.duration('clear');
  const T = k.repulsionTime;
  const vL = k.fragmentSpeed;
  const vH = (k.fragmentSpeed * k.light.a) / k.heavy.a;
  const d0 = rH + rL;
  const hx = -d0 * wL - repelDistance(tau, vH, T);
  const lx = d0 * wH + repelDistance(tau, vL, T);
  const neck: Vec2 = [-d0 * wL + rH, 0];

  // 튀어나온 중성자의 지나온 길 — 먼저 깔아 핵 · 알갱이 아래에 둔다.
  const dirs = neutronDirections(k.seed, tl.cycle, k.nOut);
  const npos = dirs.map((u): Vec2 => [neck[0] + u[0] * k.neutronSpeed * tau, neck[1] + u[1] * k.neutronSpeed * tau]);
  npos.forEach((p, i) => {
    const u = dirs[i]!;
    const len = Math.min(TRAIL_LEN, k.neutronSpeed * tau);
    const trail: Trajectory = {
      type: 'trajectory',
      id: `trail-${i}`,
      points: [[p[0] - u[0] * len, p[1] - u[1] * len], p],
      width: TRAIL_W,
      opacity: keep,
      style: { ...NEUTRON, fade: 'tail' },
    };
    out.push(trail);
  });

  // 다음 주기의 핵이 가운데에 다시 선다.
  nucleus('next', circlePoints([0, 0], rT), renew, out);
  nucleus('heavy', circlePoints([hx, 0], rH), keep, out);
  nucleus('light', circlePoints([lx, 0], rL), keep, out);

  // 서로 밀어내며 빨라지는 속도 — 풀려난 에너지가 가는 곳.
  const arrows: [string, number, number, number][] = [
    ['heavy-v', hx - rH, -1, repelSpeed(tau, vH, T)],
    ['light-v', lx + rL, 1, repelSpeed(tau, vL, T)],
  ];
  for (const [id, x, sign, v] of arrows) {
    const arrow: Vector = {
      type: 'vector',
      id,
      from: [x, 0],
      delta: [sign * v * ARROW_SCALE, 0],
      width: ARROW_W,
      opacity: keep,
      style: ACCENT,
    };
    out.push(arrow);
  }

  npos.forEach((p, i) => neutron(`out-${i}`, p, rn, dirs[i]![0], keep, out));
  neutron('incoming-next', [INCOMING_X, 0], rn, 1, renew, out);

  notation('heavy', k.heavy, hx, rH, keep, out);
  notation('light', k.light, lx, rL, keep, out);
  notation('next', k.target, 0, rT, renew, out);

  // 장부 · 에너지 — 느린 화면에서 떠오른다.
  const shown = reveal * keep;
  if (shown > 0) {
    const balance: Readout = {
      type: 'readout',
      id: 'balance',
      anchor: { screen: 'top-center', offset: [...BALANCE_OFFSET] },
      text: text('label.balance'),
      vars: { aT: k.target.a, aH: k.heavy.a, aL: k.light.a, n: k.nOut },
      chip: false,
      font: 'mono',
      align: 'center',
      fontSize: BALANCE_PX,
      opacity: shown,
      style: INK,
    };
    out.push(balance);
    const energy: Readout = {
      ...label('energy', 'label.energy', [...ENERGY_POS], [0, 0], { e: k.energyMeV }, ENERGY_PX, 'center', shown, 'text'),
      weight: 'bold',
      style: ACCENT,
    };
    out.push(energy);
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
