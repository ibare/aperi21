// ========================================================================
// electric-charge — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 천장(`surface`) · 실(`constraint`) · 공(`body`) ·
// 부호 표식과 쌍 이름(`readout`) · 전하가 없을 때 드리울 자리(`trajectory` 점선)가
// 모두 표준 어휘로 있다.
//
// 색: 세 쌍의 공 · 실 · 표식이 모두 같은 색이다. 부호를 가르는 것은 표식 `+` · `−`
// 이고, 쌍의 차이는 벌어짐과 모임이라는 **모양**이다 — 색으로 가르면 「+ 는 빨강,
// − 는 파랑」 이라는 색의 설명이 되어 부호 하나만 바뀌었다는 요점이 사라진다
// (S-piece). 강조색은 쓰지 않는다.
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
import { derive, readConstants, type BallPlace } from './physics';
import {
  CEILING_HALF_W,
  PAIR_X,
  SCENE_BOUNDS,
  text,
  type ElectricChargeMessageKey,
} from './schema';
import type { ElectricChargeState } from './state';

/** 부호 표식 글자 크기(화면 px). 공 안에 들어가는 크기다. */
const SIGN_PX = 15;
/** 쌍 이름 글자 크기(화면 px). */
const PAIR_LABEL_PX = 13;
/** 쌍 이름을 공 아래로 내리는 거리(화면 px). */
const PAIR_LABEL_OFFSET: Vec2 = [0, 20];
/** 연직 점선의 굵기(화면 px)와 불투명도. 배경 정보라 가늘고 옅다. */
const PLUMB_WIDTH_PX = 1;
const PLUMB_OPACITY = 0.7;

/** 한 쌍 — 두 공의 부호와 쌍 이름. 왼쪽부터 + · +, − · −, + · −. */
const PAIRS: readonly {
  signs: readonly [ElectricChargeMessageKey, ElectricChargeMessageKey];
  like: boolean;
  name: ElectricChargeMessageKey;
}[] = [
  { signs: ['mark.plus', 'mark.plus'], like: true, name: 'label.like' },
  { signs: ['mark.minus', 'mark.minus'], like: true, name: 'label.like' },
  { signs: ['mark.plus', 'mark.minus'], like: false, name: 'label.unlike' },
];

export function scene(params: {
  state: ElectricChargeState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('electric-charge: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const op = r.opacity;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const ball = { colorRole: 'muted', emphasis: 'subtle' } as const;
  const g: Primitive[] = [];

  // ---- 천장 ----
  g.push({
    type: 'surface',
    id: 'ceiling',
    geometry: { kind: 'wall', from: [-CEILING_HALF_W, 0], to: [CEILING_HALF_W, 0] },
    material: 'solid',
  });

  PAIRS.forEach((pair, i) => {
    const cx = PAIR_X[i] ?? 0;
    const place: BallPlace = pair.like ? r.like : r.unlike;
    const restY = -c.stringLength;

    ([-1, 1] as const).forEach((side, j) => {
      const pivot: Vec2 = [cx + (side * c.pivotGap) / 2, 0];
      const pos: Vec2 = [cx + side * place.halfSpan, place.y];

      // 전하가 없을 때 실이 드리우는 자리. 벌어졌는지 모였는지를 이 선에 대 본다.
      g.push({
        type: 'trajectory',
        id: `plumb-${i}-${j}`,
        points: [pivot, [pivot[0], restY - c.ballRadius]],
        width: PLUMB_WIDTH_PX,
        opacity: op * PLUMB_OPACITY,
        style: { ...muted, lineStyle: 'dashed' },
      });
      g.push({
        type: 'constraint',
        id: `string-${i}-${j}`,
        subtype: 'string',
        from: pivot,
        to: pos,
        opacity: op,
        style: ink,
      });
      g.push({
        type: 'body',
        id: `ball-${i}-${j}`,
        pos,
        shape: 'circle',
        size: c.ballRadius,
        glow: false,
        outline: 'line',
        opacity: op,
        style: ball,
      });
      g.push({
        type: 'readout',
        id: `sign-${i}-${j}`,
        anchor: { world: pos },
        text: text(pair.signs[j] ?? 'mark.plus'),
        chip: false,
        font: 'text',
        weight: 'bold',
        fontSize: SIGN_PX,
        align: 'center',
        opacity: op,
        style: ink,
      });
    });

    g.push({
      type: 'readout',
      id: `pair-name-${i}`,
      anchor: { world: [cx, restY - c.ballRadius], offset: PAIR_LABEL_OFFSET },
      text: text(pair.name),
      chip: false,
      font: 'text',
      fontSize: PAIR_LABEL_PX,
      align: 'center',
      opacity: op,
      style: muted,
    });
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
