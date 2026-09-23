// ========================================================================
// thermal-conduction — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
//   막대 몸체        body(rect)      — 채움 + 테두리
//   나뭇결 · 금속결  trajectory      — 색 하나에만 정보를 싣지 않으려는 표지
//   달아오름         region 여럿     — 격자 한 칸이 띠 하나, θ 가 곧 fillOpacity
//   60 ℃ 앞머리      trajectory + body(custom) — 세로선과 오른쪽을 가리키는 쐐기
//   밀랍 구슬        body(circle / custom)     — 붙은 것 · 떨어지는 것 · 쌓인 것
//   버너 불꽃        body(custom) 2겹 + opacity
//   재질 이름표      readout
//   캡션             BundleSchema.caption 슬롯
//
// ---- 색은 세 가지 뜻뿐이다 ----
//   accent  뜨거움  — 불꽃도 달아오른 막대도 같은 주황이다. 둘 다 뜨거움이니까
//   muted   물건    — 막대와 구슬. 온도가 아니라 거기 있는 것
//   ink     사람이 잰 것 — 앞머리 선과 쐐기
// 그래서 **두 막대에서 같은 색 농도는 언제나 같은 온도**다.
// ========================================================================

import type {
  Body,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  Trajectory,
} from '@aperi21/schema';
import {
  BEAD_DROP,
  DX,
  FLOOR,
  MM,
  N,
  PREROLL_S,
  REF,
  ROD_LEFT,
  ROD_MM,
  ROD_THICK,
  SCENE_BOUNDS,
  px,
  text,
  wy,
} from './schema';
import type { ThermalConductionState, Rod } from './state';

// ------------------------------------------------------------------------
// 색 역할
// ------------------------------------------------------------------------

/** 막대 몸체. 재질 정체성이지 온도가 아니다 — 그 위에 뜨거움이 덮인다. */
const MATERIAL = { colorRole: 'muted', emphasis: 'subtle' } as const;
/** 결 — 색을 못 읽어도 재질이 있다는 것이 보이게 하는 가는 선. */
const GRAIN = { colorRole: 'muted', emphasis: 'medium' } as const;
/** 밀랍 구슬. 막대와 같은 역할(물건)이되 짙어서 사건이 눈에 띈다. */
const BEAD = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 뜨거움. 이 조각에서 강조색은 이 한 가지 뜻에만 쓴다. */
const HOT = { colorRole: 'accent', emphasis: 'strong' } as const;
/** 사람이 재서 그은 것. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 이름표. */
const LABEL = { colorRole: 'muted', emphasis: 'strong' } as const;

/** 겉불꽃의 옅기. 원본의 두 겹 알파를 인스턴스 불투명도로 옮긴 것이다. */
const FLAME_OUTER_OPACITY = 0.55;
const FLAME_INNER_OPACITY = 0.9;
/** 달아오름을 그리지 않는 문턱. 이보다 옅으면 종이와 구분되지 않는다. */
const HEAT_FLOOR = 0.012;
/** 앞머리 선 굵기(화면 px). 굵기는 물리량이 아니라 위계라 배율을 따라가지 않는다. */
const FRONT_WIDTH = 1.5;
/** 결 선 굵기(화면 px). */
const GRAIN_WIDTH = 1;
/** 이름표 글자 크기(화면 px). */
const LABEL_FONT = 15;

// ------------------------------------------------------------------------
// 자리
// ------------------------------------------------------------------------

/** 막대 하나가 차지하는 세로. */
interface RodBox {
  readonly top: number;
  readonly bottom: number;
  readonly center: number;
  /** 원본 캔버스의 윗면 y. 불꽃 흔들림의 위상으로만 쓴다. */
  readonly topPx: number;
}

function boxOf(topPx: number): RodBox {
  const top = wy(topPx);
  const bottom = wy(topPx + REF.rodH);
  return { top, bottom, center: (top + bottom) / 2, topPx };
}

const BOX: Record<Rod['id'], RodBox> = {
  steel: boxOf(REF.steelTop),
  wood: boxOf(REF.woodTop),
};

/** 데운 끝에서 `xmm` 떨어진 자리의 월드 x. */
function xAt(xmm: number): number {
  return ROD_LEFT + xmm * MM;
}

/** path 문자열에 넣을 수. 자릿수를 고정해 프레임마다 같은 모양이 나오게 한다. */
function n(v: number): string {
  return v.toFixed(4);
}

/**
 * 달아오름의 진하기.
 *
 * θ 를 그대로 알파로 쓰면 낮은 쪽이 너무 빨리 사라져 "번져 나가는 앞쪽" 이 보이지
 * 않는다. 0.7 승이 그 꼬리를 살린다.
 */
function heatAlpha(theta: number): number {
  const v = theta < 0 ? 0 : theta > 1 ? 1 : theta;
  return Math.pow(v, 0.7) * 0.95;
}

// ------------------------------------------------------------------------
// 외형 — `body` custom 의 path. 좌표는 `pos` 기준 월드, y 는 위
// ------------------------------------------------------------------------

/** 바닥에 놓여 납작해진 구슬. */
function squashedPath(r: number): string {
  const a = r * 1.15;
  const b = r * 0.82;
  return `M ${n(-a)} 0 A ${n(a)} ${n(b)} 0 1 0 ${n(a)} 0 A ${n(a)} ${n(b)} 0 1 0 ${n(-a)} 0 Z`;
}

/** 아직 붙어 있는 구슬의 밀랍 목. */
function neckPath(r: number): string {
  return `M ${n(-px(2))} ${n(r)} L 0 ${n(r + BEAD_DROP)} L ${n(px(2))} ${n(r)} Z`;
}

/**
 * 불꽃 두 겹.
 *
 * 흔들림을 난수가 아니라 `sin` 조합으로 만든다 — 난수는 호출 순서에 상태가 있어서
 * `?t=6.5` 로 연 화면과 실시간 6.5 초 화면이 갈린다.
 */
function flamePaths(t: number, topPx: number): { outer: string; inner: string } {
  const sway = px(Math.sin(t * 7.3 + topPx) * 2.2 + Math.sin(t * 11.9) * 1.1);
  const puff = 1 + 0.08 * Math.sin(t * 9.1 + topPx * 0.3);
  const outer =
    `M ${n(-px(15))} ${n(-px(30))} Q ${n(-px(17))} ${n(-px(6))} ${n(sway)} ${n(px(1))} ` +
    `Q ${n(px(17))} ${n(-px(6))} ${n(px(15))} ${n(-px(30))} Z`;
  const inner =
    `M ${n(-px(7))} ${n(-px(30))} Q ${n(-px(8))} ${n(-px(12))} ${n(sway * 0.6)} ${n(-px(3 - 3 * puff))} ` +
    `Q ${n(px(8))} ${n(-px(12))} ${n(px(7))} ${n(-px(30))} Z`;
  return { outer, inner };
}

// ------------------------------------------------------------------------
// 묶음별 선언
// ------------------------------------------------------------------------

/**
 * 버너 불꽃과 주둥이.
 *
 * 장식이 아니라 **경계조건**이다. 같은 크기·같은 색의 불꽃 둘이 "조건은 같다" 를
 * 보증한다. 이게 없으면 쇠가 더 센 불을 받았다는 의심이 남고, 그러면 주장이
 * 성립하지 않는다.
 */
function flame(rod: Rod, box: RodBox, t: number, out: Primitive[]): void {
  const cx = ROD_LEFT + px(REF.flameDx);
  const base = box.bottom;
  const { outer, inner } = flamePaths(t, box.topPx);

  const outerFlame: Body = {
    type: 'body',
    id: `flame-${rod.id}-outer`,
    shape: 'custom',
    pos: [cx, base],
    customPath: outer,
    style: HOT,
    opacity: FLAME_OUTER_OPACITY,
  };
  const innerFlame: Body = {
    type: 'body',
    id: `flame-${rod.id}-inner`,
    shape: 'custom',
    pos: [cx, base],
    customPath: inner,
    style: HOT,
    opacity: FLAME_INNER_OPACITY,
  };
  const nozzle: Body = {
    type: 'body',
    id: `burner-${rod.id}`,
    shape: 'rect',
    pos: [cx, base - px(33.5)],
    size: [px(22), px(7)],
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(outerFlame, innerFlame, nozzle);
}

/** 막대 몸체 · 결 · 달아오름. 두 막대가 똑같은 방식으로 그려진다. */
function rodBody(rod: Rod, box: RodBox, out: Primitive[]): void {
  const body: Body = {
    type: 'body',
    id: `rod-${rod.id}`,
    shape: 'rect',
    pos: [ROD_LEFT + px(REF.rodPx) / 2, box.center],
    size: [px(REF.rodPx), ROD_THICK],
    style: MATERIAL,
  };
  out.push(body);

  for (let g = 1; g <= 3; g++) {
    const gy = wy(box.topPx + (REF.rodH * g) / 4);
    const grain: Trajectory = {
      type: 'trajectory',
      id: `grain-${rod.id}-${g}`,
      points: [
        [ROD_LEFT, gy],
        [ROD_LEFT + px(REF.rodPx), gy],
      ],
      width: GRAIN_WIDTH,
      style: GRAIN,
    };
    out.push(grain);
  }

  // 격자 한 칸이 세로 띠 하나. 칸마다 하나씩 선언하고, 진하기는 그 칸의 온도다.
  // 범례도 컬러바도 두지 않는다 — 색은 "얼마나 뜨거운가" 를 재라고 있는 것이
  // 아니라 "어디까지 왔는가" 를 보라고 있다.
  for (let i = 0; i < N; i++) {
    const theta = (rod.T[i]! + rod.T[i + 1]!) / 2;
    if (theta < HEAT_FLOOR) continue;
    const x0 = xAt(i * DX);
    // 칸 사이에 이음매가 보이지 않게 한 칸을 아주 조금 넓게 덮는다.
    const x1 = x0 + DX * MM + px(1);
    const band: Region = {
      type: 'region',
      id: `heat-${rod.id}-${i}`,
      points: [
        [x0, box.bottom],
        [x1, box.bottom],
        [x1, box.top],
        [x0, box.top],
      ],
      fillOpacity: heatAlpha(theta),
      style: HOT,
    };
    out.push(band);
  }
}

/**
 * 60 ℃ 앞머리 — 세로선과 진행 방향을 가리키는 쐐기.
 *
 * 구슬이 "여기까지 왔다" 를 못 박고, 이 선이 "지금도 가고 있다" 를 잇는다.
 */
function front(rod: Rod, box: RodBox, out: Primitive[]): void {
  if (rod.front <= 0.3) return;
  const x = xAt(Math.min(ROD_MM, rod.front));
  const top = box.top + px(7);

  const line: Trajectory = {
    type: 'trajectory',
    id: `front-${rod.id}`,
    points: [
      [x, top],
      [x, box.bottom - px(3)],
    ],
    width: FRONT_WIDTH,
    style: INK,
  };
  const wedge: Body = {
    type: 'body',
    id: `wedge-${rod.id}`,
    shape: 'custom',
    pos: [x, top],
    customPath: `M 0 0 L ${n(px(7))} ${n(px(4))} L 0 ${n(px(8))} Z`,
    style: INK,
  };
  out.push(line, wedge);
}

/**
 * 밀랍 구슬 열 개.
 *
 * 붙어 있을 때는 원과 밀랍 목, 떨어지는 중에는 원, 바닥에 닿으면 납작한 타원이다.
 * 낙하가 왼쪽에서 오른쪽으로 차례로 전파하는 것 — 그 리듬이 확산이 √t 로
 * 느려진다는 사실 그 자체다.
 */
function beads(rod: Rod, box: RodBox, out: Primitive[]): void {
  const attach = box.bottom - BEAD_DROP;
  rod.beads.forEach((b, i) => {
    const landed = b.y >= FLOOR;
    const progress = b.y / FLOOR;
    const x = xAt(b.xmm) + b.slide * progress;
    const y = attach - b.y;
    const id = `bead-${rod.id}-${i}`;

    if (landed) {
      const piled: Body = {
        type: 'body',
        id,
        shape: 'custom',
        pos: [x, y],
        customPath: squashedPath(b.r),
        style: BEAD,
      };
      out.push(piled);
      return;
    }

    const ball: Body = {
      type: 'body',
      id,
      shape: 'circle',
      size: b.r,
      pos: [x, y],
      style: BEAD,
      // 구슬은 짙게 칠하되 후광은 없다.
      glow: false,
    };
    out.push(ball);

    if (!b.released) {
      const neck: Body = {
        type: 'body',
        id: `${id}-neck`,
        shape: 'custom',
        pos: [x, y],
        customPath: neckPath(b.r),
        style: BEAD,
      };
      out.push(neck);
    }
  });
}

/** 재질 이름표. 막대 위가 아니라 오른쪽 끝 바깥이라 세로를 쓰지 않는다. */
function label(rod: Rod, box: RodBox, out: Primitive[]): void {
  const name: Readout = {
    type: 'readout',
    id: `label-${rod.id}`,
    anchor: { world: [px(REF.labelX), box.center] },
    text: text(rod.id === 'steel' ? 'label.steel' : 'label.wood'),
    chip: false,
    align: 'left',
    font: 'text',
    weight: 'bold',
    fontSize: LABEL_FONT,
    style: LABEL,
  };
  out.push(name);
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: { state: ThermalConductionState }): SceneGraph {
  const { state } = params;
  // 원본의 화면 시각. 프리롤만큼 빼면 `?t=` 로 연 화면이 원본과 같은 위상에서 흔들린다.
  const t = state.t - PREROLL_S;
  const out: Primitive[] = [];

  const rods = state.rods.map((rod) => ({ rod, box: BOX[rod.id] }));

  // 그리는 순서가 곧 겹침이다 (`schema.drawOrder: 'scene'`).
  for (const { rod, box } of rods) flame(rod, box, t, out);
  for (const { rod, box } of rods) rodBody(rod, box, out);
  for (const { rod, box } of rods) front(rod, box, out);
  for (const { rod, box } of rods) beads(rod, box, out);
  for (const { rod, box } of rods) label(rod, box, out);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}



/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
