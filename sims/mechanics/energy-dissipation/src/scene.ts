// ========================================================================
// energy-dissipation — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 화면은 둘이 아니라 하나의 주장을 이룬다 — 바닥 띠는 열이 **어디에** 쌓이는지를,
// 곁의 막대는 그것이 **얼마나** 되는지를 같은 색으로 말한다. 물체와 역학적 에너지
// 몫이 같은 색인 것도 같은 이유다: 같은 대상은 같은 색이다 (S-piece).
//
// 겹침 순서는 선언 순서 그대로다(`drawOrder: 'scene'`) — 열의 띠가 바닥 선 아래에
// 배고, 그 위를 물체가 지난다.
// ========================================================================

import type {
  Bounds,
  Primitive,
  Readout,
  SceneGraph,
  TimelineFrame,
  Vec2,
} from '@aperi21/schema';
import { displacementAt, heatCells, heatFractionAt } from './physics';
import {
  AMPLITUDE,
  BAND_COLS,
  BAND_H,
  BAND_X0,
  BAND_X1,
  BAR_H,
  BAR_X0,
  BAR_X1,
  BAR_Y0,
  BLOCK_H,
  BLOCK_W,
  FLOOR_RIGHT,
  HALF_CYCLES,
  LABEL_FONT_PX,
  LABEL_GAP_PX,
  LABEL_MIN_H,
  REST_X,
  SCENE_BOUNDS,
  SPRING_COILS,
  WALL_TOP,
  WALL_X,
  text,
} from './schema';
import type { EnergyDissipationState } from './state';

/** 바닥 선 · 막대 테두리의 굵기(화면 px). */
const FLOOR_WIDTH_PX = 2;
/** 막대 두 몫의 채움 짙기. 불투명하게 깔아 겹쳐도 색이 변하지 않는다. */
const BAR_FILL = 0.92;
/** 이름표가 보이기 시작하는 불투명도 — 사라지는 중인 몫에 글자를 남기지 않는다. */
const LABEL_MIN_OPACITY = 0.4;

/** 막대 옆 이름표 하나. 값이 아니라 무엇의 몫인지를 말한다. */
function barLabel(
  id: string,
  y: number,
  label: Readout['text'],
  colorRole: 'primary' | 'accent',
  opacity: number,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: [BAR_X1, y], offset: [LABEL_GAP_PX, 0] },
    text: label,
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    align: 'left',
    opacity,
    style: { colorRole, emphasis: 'strong' },
  };
}

export function scene(params: {
  state: EnergyDissipationState;
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('energy-dissipation: schema.timeline 이 선언되어야 한다');

  // 미끄러진 시간. `rest`·`reset` 단계에서는 `at('slide')` 이 1 이라 끝난 상태가 유지된다.
  const tau = tl.at('slide') * tl.duration('slide');
  // 되돌리는 동안의 진행도. 쌓인 열을 치우고 물체를 당기는 것이 함께 일어난다.
  const back = tl.at('reset');
  const heatOpacity = 1 - back;

  const blockX = REST_X + (back > 0 ? AMPLITUDE * back : displacementAt(tau));
  const heated = heatFractionAt(tau);
  const g: Primitive[] = [];

  // ── 문지른 자리에 쌓인 열 — 바닥에 밴 두께 ──
  // 칸 값은 「그 자리를 문지르고 간 횟수」이고, 그것이 그대로 바닥 아래로 자라는
  // 두께가 된다. 가운데는 여섯 번 다 지나가고 바깥은 처음 한두 번뿐이라, 멈출
  // 때는 가운데가 가장 두껍다. 짙기로만 말하면 「쌓인다」 가 색의 변화로 읽힌다.
  if (heatOpacity > 0.01) {
    const cells = heatCells(tau, BAND_X0 - REST_X, BAND_X1 - REST_X, BAND_COLS);
    const profile: Vec2[] = [[BAND_X0, 0]];
    cells.forEach((v, i) => {
      const x = BAND_X0 + ((BAND_X1 - BAND_X0) * (i + 0.5)) / BAND_COLS;
      profile.push([x, -(BAND_H * v) / HALF_CYCLES]);
    });
    profile.push([BAND_X1, 0]);
    g.push({
      type: 'region',
      id: 'floor-heat',
      points: profile,
      opaque: true,
      fillOpacity: 0.9,
      opacity: heatOpacity,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ── 바닥과 벽 ──
  g.push({
    type: 'trajectory',
    id: 'floor',
    points: [
      [WALL_X, 0],
      [FLOOR_RIGHT, 0],
    ],
    width: FLOOR_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  g.push({
    type: 'surface',
    id: 'wall',
    geometry: { kind: 'wall', from: [WALL_X, 0], to: [WALL_X, WALL_TOP] },
  });

  // ── 용수철과 물체 ──
  g.push({
    type: 'constraint',
    id: 'spring',
    subtype: 'spring',
    from: [WALL_X, BLOCK_H / 2],
    to: [blockX - BLOCK_W / 2, BLOCK_H / 2],
    coils: SPRING_COILS,
  });
  g.push({
    type: 'body',
    id: 'block',
    pos: [blockX, BLOCK_H / 2],
    shape: 'rect',
    size: [BLOCK_W, BLOCK_H] as Vec2,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ── 띠의 이름 — 색만으로는 무엇이 쌓였는지 말하지 못한다 ──
  if (heatOpacity > LABEL_MIN_OPACITY) {
    g.push({
      type: 'readout',
      id: 'floor-heat-label',
      anchor: { world: [REST_X, -BAND_H], offset: [0, 22] },
      text: text('label.floorHeat'),
      chip: false,
      font: 'text',
      fontSize: LABEL_FONT_PX,
      align: 'center',
      opacity: heatOpacity,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ── 에너지 막대 — 전체 길이가 처음 에너지다. 그 길이는 변하지 않는다 ──
  const frame: Vec2[] = [
    [BAR_X0, BAR_Y0],
    [BAR_X1, BAR_Y0],
    [BAR_X1, BAR_Y0 + BAR_H],
    [BAR_X0, BAR_Y0 + BAR_H],
  ];
  g.push({
    type: 'region',
    id: 'bar-frame',
    points: frame,
    fillOpacity: 0,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  const heatTop = BAR_Y0 + BAR_H * (back > 0 ? 1 : heated);
  if (heatOpacity > 0.01 && heatTop > BAR_Y0) {
    g.push({
      type: 'region',
      id: 'bar-heat',
      points: [
        [BAR_X0, BAR_Y0],
        [BAR_X1, BAR_Y0],
        [BAR_X1, heatTop],
        [BAR_X0, heatTop],
      ],
      opaque: true,
      fillOpacity: BAR_FILL,
      opacity: heatOpacity,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 되돌리는 동안에는 막대가 위에서부터 다시 차오른다 — 열이 되돌아오는 것이
  // 아니라 손이 새 에너지를 넣는 것이라, 쌓인 열 위로 덮어 칠한다.
  const mechBottom = back > 0 ? BAR_Y0 : heatTop;
  const mechOpacity = back > 0 ? back : 1;
  if (BAR_Y0 + BAR_H > mechBottom) {
    g.push({
      type: 'region',
      id: 'bar-mechanical',
      points: [
        [BAR_X0, mechBottom],
        [BAR_X1, mechBottom],
        [BAR_X1, BAR_Y0 + BAR_H],
        [BAR_X0, BAR_Y0 + BAR_H],
      ],
      opaque: true,
      fillOpacity: BAR_FILL,
      opacity: mechOpacity,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  if (BAR_Y0 + BAR_H - mechBottom > LABEL_MIN_H && mechOpacity > LABEL_MIN_OPACITY) {
    g.push(
      barLabel(
        'bar-mechanical-label',
        (mechBottom + BAR_Y0 + BAR_H) / 2,
        text('label.mechanical'),
        'primary',
        mechOpacity,
      ),
    );
  }
  // 되돌리는 동안에는 열의 이름표를 내린다 — 두 몫이 같은 자리에서 엇갈려 글자가 겹친다.
  if (back === 0 && heatTop - BAR_Y0 > LABEL_MIN_H && heatOpacity > LABEL_MIN_OPACITY) {
    g.push(
      barLabel('bar-heat-label', (BAR_Y0 + heatTop) / 2, text('label.heat'), 'accent', heatOpacity),
    );
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 벽 · 막대 · 바닥 띠와 그 아래 캡션 줄. 매 프레임 같은 값이다. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
