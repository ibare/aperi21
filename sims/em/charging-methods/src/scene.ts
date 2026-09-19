// ========================================================================
// charging-methods — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 막대 · 도체(`body` rect) · 털가죽(`region` 결 있는 면) ·
// 원자핵 + 와 전자 e⁻(`readout` 표식) · 접지선(`trajectory`) · 땅 기호(`lineSet`) ·
// 판 이름과 결과 표식(`readout`)이 모두 표준 어휘로 있다.
//
// 색: 모든 물체가 같은 색이고, + 와 e⁻ 도 같은 먹색이다. 둘을 가르는 것은 표식의
// 모양과 **움직임**이다 — + 는 물체에 붙어 있고 e⁻ 만 건너간다. 옮겨 간 전자를
// 강조색으로 칠하면 「그 전자만 다른 종류」 로 읽혀 전자가 모두 같다는 것이 흐려진다
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
import { derive, readConstants, type ChargeSign, type ObjectId } from './physics';
import {
  OBJECT_H,
  PANEL_TITLE_Y,
  PANEL_X,
  SCENE_BOUNDS,
  TAG_DROP,
  text,
  type ChargingMethodsMessageKey,
} from './schema';
import type { ChargingMethodsState } from './state';

/** 원자핵 + 표식 글자 크기(화면 px). */
const PLUS_PX = 15;
/** 전자 e⁻ 표식 글자 크기(화면 px). */
const ELECTRON_PX = 13;
/** 결과 표식 글자 크기(화면 px). */
const TAG_PX = 12;
/** 판 이름 글자 크기(화면 px). */
const TITLE_PX = 14;
/** 판 옆 결과 표식을 물체 오른쪽 끝에서 띄우는 거리(월드). */
const TAG_SIDE_GAP = 0.15;
/** 접지선 굵기(화면 px). */
const WIRE_WIDTH_PX = 2;
/** 땅 기호 — 세 가로선의 반폭(월드)과 선 사이 간격, 선 굵기(화면 px). */
const EARTH_BAR_HALF = [0.3, 0.2, 0.1] as const;
const EARTH_BAR_GAP = 0.09;
const EARTH_WIDTH_PX = 2;

const PANEL_TITLES: readonly ChargingMethodsMessageKey[] = ['panel.friction', 'panel.contact', 'panel.induction'];

const TAG_KEY: Record<ChargeSign, ChargingMethodsMessageKey> = {
  neutral: 'tag.neutral',
  negative: 'tag.negative',
  positive: 'tag.positive',
};

/**
 * 결과 표식을 놓는 쪽. 마찰의 두 물체는 위아래로 붙어 있어 사이에 둘 자리가 없으므로
 * 오른쪽 옆에, 나머지는 물체 아래에 둔다.
 */
const TAG_SIDE: Record<ObjectId, 'right' | 'below'> = {
  rod: 'right',
  fur: 'right',
  condA: 'below',
  condB: 'below',
  inducer: 'below',
  cond: 'below',
};

export function scene(params: {
  state: ChargingMethodsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('charging-methods: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const f = derive(timeline, c);
  const op = f.opacity;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const matter = { colorRole: 'muted', emphasis: 'subtle' } as const;
  const g: Primitive[] = [];

  // ---- 판 이름 ----
  PANEL_TITLES.forEach((k, i) => {
    g.push({
      type: 'readout',
      id: `title-${i}`,
      anchor: { world: [PANEL_X[i] ?? 0, PANEL_TITLE_Y] },
      text: text(k),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: TITLE_PX,
      align: 'center',
      opacity: op,
      style: muted,
    });
  });

  // ---- 땅 기호와 접지선 ----
  const [ex, ey] = f.earth;
  g.push({
    type: 'lineSet',
    id: 'earth',
    lines: EARTH_BAR_HALF.map((h, i): Vec2[] => [
      [ex - h, ey - i * EARTH_BAR_GAP],
      [ex + h, ey - i * EARTH_BAR_GAP],
    ]),
    width: EARTH_WIDTH_PX,
    opacity: op,
    style: ink,
  });
  g.push({
    type: 'trajectory',
    id: 'ground-wire',
    points: f.wire.points,
    width: WIRE_WIDTH_PX,
    opacity: op * f.wire.opacity,
    style: ink,
  });

  // ---- 물체 ----
  for (const o of f.objects) {
    const [x, y] = o.center;
    const hw = o.width / 2;
    const hh = OBJECT_H / 2;
    if (o.id === 'fur') {
      // 털가죽 — 결 있는 면. 막대 · 도체와 재질이 다르다는 것만 말한다.
      g.push({
        type: 'region',
        id: 'fur',
        points: [
          [x - hw, y - hh],
          [x + hw, y - hh],
          [x + hw, y + hh],
          [x - hw, y + hh],
        ],
        fill: 'hatch',
        outline: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 0],
        ],
        opacity: op,
        style: matter,
      });
    } else {
      g.push({
        type: 'body',
        id: `object-${o.id}`,
        pos: o.center,
        shape: 'rect',
        size: [o.width, OBJECT_H],
        outline: 'line',
        glow: false,
        opacity: op,
        style: matter,
      });
    }

    const side = TAG_SIDE[o.id];
    g.push({
      type: 'readout',
      id: `tag-${o.id}`,
      anchor: { world: side === 'right' ? [x + hw + TAG_SIDE_GAP, y] : [x, y - hh - TAG_DROP] },
      text: text(TAG_KEY[o.sign]),
      chip: false,
      font: 'text',
      fontSize: TAG_PX,
      align: side === 'right' ? 'left' : 'center',
      opacity: op,
      style: muted,
    });
  }

  // ---- 원자핵 + (물체에 붙어 움직이지 않는다) ----
  for (const p of f.nuclei) {
    g.push({
      type: 'readout',
      id: `nucleus-${p.id}`,
      anchor: { world: p.pos },
      text: text('mark.plus'),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: PLUS_PX,
      align: 'center',
      opacity: op,
      style: ink,
    });
  }

  // ---- 전자 e⁻ (옮겨 다니는 것은 이것뿐이다) ----
  for (const p of f.electrons) {
    g.push({
      type: 'readout',
      id: `electron-${p.id}`,
      anchor: { world: p.pos },
      text: text('mark.electron'),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: ELECTRON_PX,
      align: 'center',
      opacity: op,
      style: ink,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
