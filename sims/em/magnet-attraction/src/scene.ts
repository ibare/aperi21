// ========================================================================
// magnet-attraction — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 옆에서 본 책상(`surface` ground) 위에 물건 여섯이 한 줄로 놓여 있고(`body` custom),
// 줄 아래 책상 앞면에 이름표(`readout`)가 붙어 있다. 그 위로 막대자석(`body` rect 둘 +
// 극 표식 `N` · `S`)이 왼쪽에서 오른쪽으로 지나간다.
//
// 물건은 모두 같은 색(먹)이다. 붙는 것과 안 붙는 것을 색으로 가르지 않는다 — 가르는 것은
// 움직임뿐이다 (S-piece: 색으로 설명하지 않는다). 모양은 물건을 알아보게 할 뿐이다.
// 이름표는 책상에 남는다 — 쇠붙이가 떠난 뒤 「쇠못」 · 「클립」 위의 빈자리가 무엇이 갔는지 말한다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  Surface,
  TimelineFrame,
  ViewDef,
} from '@aperi21/schema';
import { deriveItems, itemPos, magnetX, readConstants, type ItemKind } from './physics';
import { SCENE_BOUNDS, text, type MagnetAttractionMessageKey } from './schema';
import type { MagnetAttractionState } from './state';

/** 자극 표식 글자 크기(화면 px). 자석 폭 안에 들어가는 크기다. */
const POLE_LABEL_PX = 14;
/** 물건 이름표 글자 크기(화면 px). */
const ITEM_LABEL_PX = 12;
/** 이름표를 책상 면에서 아래로 내리는 거리(월드). 책상 앞면에 붙은 이름표로 읽힌다. */
const ITEM_LABEL_DROP = 0.34;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 옅은 회색 — 자석의 N 반쪽 채움. 극을 가르는 것은 색이 아니라 채움 유무와 표식이다. */
const FAINT = { colorRole: 'muted', emphasis: 'subtle' } as const;

/**
 * 물건의 외형 — SVG 경로, `pos` 기준 월드 단위, y 위. 치수는 `ITEM_KINDS.size` 와 맞춘다.
 * 채움(`solid`)은 얇은 것(못 · 은박), 둘레만(`none`)은 속이 보이는 것(나무 결 · 뚜껑 홈 · 감은 선 · 클립)이다.
 */
const ITEM_SHAPES: Record<ItemKind, { path: string; fill: 'solid' | 'none'; label: MagnetAttractionMessageKey }> = {
  wood: {
    path:
      'M -0.375 -0.225 L 0.375 -0.225 L 0.375 0.225 L -0.375 0.225 Z ' +
      'M -0.285 0.075 Q 0 0.15 0.285 0.045 M -0.285 -0.09 Q 0.03 -0.015 0.285 -0.12',
    fill: 'none',
    label: 'item.wood',
  },
  nail: {
    path: 'M -0.45 -0.09 L -0.405 -0.09 L -0.405 -0.03 L 0.3 -0.03 L 0.45 0 L 0.3 0.03 L -0.405 0.03 L -0.405 0.09 L -0.45 0.09 Z',
    fill: 'solid',
    label: 'item.nail',
  },
  copper: {
    path: 'M -0.42 0 L -0.33 0.105 L -0.225 -0.105 L -0.12 0.105 L -0.015 -0.105 L 0.09 0.105 L 0.195 -0.105 L 0.3 0.105 L 0.42 0',
    fill: 'none',
    label: 'item.copper',
  },
  plastic: {
    path:
      'M -0.27 -0.165 L 0.27 -0.165 L 0.27 0.165 L -0.27 0.165 Z M -0.27 0.075 L 0.27 0.075 ' +
      'M -0.15 -0.165 L -0.15 0.075 M -0.03 -0.165 L -0.03 0.075 M 0.09 -0.165 L 0.09 0.075 M 0.21 -0.165 L 0.21 0.075',
    fill: 'none',
    label: 'item.plastic',
  },
  clip: {
    path:
      'M -0.075 0.045 L 0.255 0.045 C 0.36 0.045 0.36 -0.12 0.255 -0.12 L -0.255 -0.12 ' +
      'C -0.405 -0.12 -0.405 0.12 -0.255 0.12 L 0.195 0.12',
    fill: 'none',
    label: 'item.clip',
  },
  aluminum: {
    path: 'M -0.42 -0.045 L 0.42 -0.045 L 0.39 0.03 L 0.15 0.045 L -0.075 0.015 L -0.3 0.045 L -0.405 0.03 Z',
    fill: 'solid',
    label: 'item.aluminum',
  },
};

export function scene(params: {
  state: MagnetAttractionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('magnet-attraction: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const out: Primitive[] = [];

  // 주기 처음에 나타나고 끝에 흐려진다 — 물건과 자석이 함께. 책상과 이름표는 늘 있다.
  const opacity = tl.at('appear') * (1 - tl.at('clear'));
  const xm = magnetX(c, tl.at('sweep'));

  // ---- 책상 ----
  const desk: Surface = { type: 'surface', id: 'desk', geometry: { kind: 'ground', y: 0 } };
  out.push(desk);

  // ---- 물건 · 이름표 ----
  for (const item of deriveItems(c)) {
    const shape = ITEM_SHAPES[item.kind];
    const body: Body = {
      type: 'body',
      id: `item-${item.kind}`,
      pos: itemPos(c, item, xm),
      shape: 'custom',
      customPath: shape.path,
      fill: shape.fill,
      outline: shape.fill === 'none' ? 'role' : 'none',
      opacity,
      style: INK,
    };
    out.push(body);
    const label: Readout = {
      type: 'readout',
      id: `name-${item.kind}`,
      anchor: { world: [item.rest[0], -ITEM_LABEL_DROP] },
      text: text(shape.label),
      chip: false,
      font: 'text',
      fontSize: ITEM_LABEL_PX,
      align: 'center',
      style: MUTED,
    };
    out.push(label);
  }

  // ---- 막대자석 ----
  // N 반쪽만 옅게 채우고 표식을 새긴다 — `magnetic-poles` 와 같은 모양 (장부 G183 · G177).
  const q = c.magnetLength / 4;
  const y = c.magnetHeight;
  const north: Body = {
    type: 'body',
    id: 'magnet-north-fill',
    pos: [xm + q, y],
    shape: 'rect',
    size: [c.magnetLength / 2, c.magnetWidth],
    fill: 'solid',
    outline: 'none',
    opacity,
    style: FAINT,
  };
  const outline: Body = {
    type: 'body',
    id: 'magnet-outline',
    pos: [xm, y],
    shape: 'rect',
    size: [c.magnetLength, c.magnetWidth],
    fill: 'none',
    outline: 'role',
    opacity,
    style: INK,
  };
  out.push(north, outline);
  for (const pole of ['north', 'south'] as const) {
    const mark: Readout = {
      type: 'readout',
      id: `magnet-${pole}`,
      anchor: { world: [pole === 'north' ? xm + q : xm - q, y] },
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

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 자석이 지나가는 구간 전체와 이름표 · 캡션 줄 — 매 프레임 같은 값이다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
