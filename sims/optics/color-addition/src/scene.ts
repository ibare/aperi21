// ========================================================================
// color-addition — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 원본은 캔버스 가산 합성(`lighter`)으로 세 원판을 겹쳐 칠했다. 엔진에는 합성
// 방식도 빛의 원색도 없다. 그래서 겹친 일곱 칸을 **모양으로 잘라** 조합마다 따로
// 칠한다(`region`, 아래에서 위로). 칸의 색은 테마의 색 역할 중 가장 가까운 것이다 —
// 무엇이 모자랐는지는 NOTES.md 「어휘 부족」.
// ========================================================================

import type {
  BaseMeta,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  TimelineFrame,
  Trajectory,
  Vec2,
} from '@aperi21/schema';
import { circlePolygon, insideFrom, lightCenters, overlapCells, reach, STAGE_RECT } from './physics';
import { CENTER, H, PROBE_R, STAGE_W, TILE, W, phaseIds, text, type ColorAdditionMessageKey } from './schema';
import type { ColorAdditionState } from './state';

/** 원본 고리: 검은 테 3 px 위에 흰 선 1.5 px. */
const PROBE_OUTER_PX = 3;
const PROBE_INNER_PX = 1.5;
/** 네모 테 굵기(화면 px). */
const TILE_BORDER_PX = 1;

/**
 * 조합 → 칠. 원본은 순수한 빨강·초록·파랑을 더한 값이다. 엔진 색 역할에서 가장
 * 가까운 것을 고른다.
 *
 * - 빛 없음(검정) — `ink`. 라이트 테마의 먹색(짙은 남색).
 * - 흰색 — `luminance: 0` 은 배경색 그대로다. 라이트 테마의 배경(미색)이 가장 밝은 색이다.
 * - 청록 · 자홍 — 해당 역할이 없다. 파랑 · 빨강을 배경 쪽으로 밝힌 색으로 근사한다.
 */
function paint(combo: string): Pick<BaseMeta, 'style' | 'luminance'> {
  switch (combo) {
    case '100':
      return { style: { colorRole: 'primary', emphasis: 'strong' } };
    case '010':
      return { style: { colorRole: 'positive', emphasis: 'strong' } };
    case '001':
      return { style: { colorRole: 'secondary', emphasis: 'strong' } };
    case '110':
      return { style: { colorRole: 'accent', emphasis: 'strong' } };
    case '011':
      return { style: { colorRole: 'secondary', emphasis: 'strong' }, luminance: 0.5 };
    case '101':
      return { style: { colorRole: 'primary', emphasis: 'strong' }, luminance: 0.5 };
    case '111':
      return { style: { colorRole: 'ink', emphasis: 'strong' }, luminance: 0 };
    default:
      return { style: { colorRole: 'ink', emphasis: 'strong' } };
  }
}

function fill(id: string, points: readonly Vec2[], combo: string): Region {
  return { type: 'region', id, points, fillOpacity: 1, ...paint(combo) };
}

function loop(id: string, points: readonly Vec2[], width: number, look: Pick<BaseMeta, 'style' | 'luminance'>): Trajectory {
  return { type: 'trajectory', id, points, closed: true, width, ...look };
}

function label(id: string, at: Vec2, key: ColorAdditionMessageKey, fontSize: number): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: text(key),
    chip: false,
    font: 'text',
    align: 'center',
    fontSize,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 원본 화면 좌표(y 아래) → 월드(y 위). 오른쪽 네모 배치를 원본 식 그대로 옮기려고 둔다. */
const fromTop = (x: number, y: number): Vec2 => [x, H - y];

export function scene(params: { state: ColorAdditionState; timeline?: TimelineFrame }): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('color-addition: schema.timeline 이 선언되어야 한다');

  // 자동 진행이면 엔진 시간표에서, 손으로 옮겼으면 상태에서.
  const lights: Vec2[] = state.manual
    ? [state.pos.r, state.pos.g, state.pos.b]
    : lightCenters(
        insideFrom((k) => {
          const ids = phaseIds(k);
          return timeline.span(timeline.start(ids.before), timeline.end(ids.after), 'smooth');
        }),
      );
  const probe = state.manual ? state.pos.probe : CENTER;
  const on = reach(lights, probe);
  const out: Primitive[] = [];

  // ---- 검은 막 ----
  out.push(fill('screen', STAGE_RECT, '000'));

  // ---- 빛 — 겹친 칸마다 더한 색 ----
  for (const cell of overlapCells(lights)) out.push(fill(`light-${cell.combo}`, cell.points, cell.combo));

  // ---- 고리 ----
  const ring = circlePolygon(probe, PROBE_R, 48);
  out.push(loop('probe-outer', ring, PROBE_OUTER_PX, { style: { colorRole: 'ink', emphasis: 'strong' } }));
  out.push(loop('probe-inner', ring, PROBE_INNER_PX, { style: { colorRole: 'ink', emphasis: 'strong' }, luminance: 0 }));

  // ---- 오른쪽: 세 몫 + 합 (원본 배치 식 그대로) ----
  const { s, big, gap } = TILE;
  const total = s * 3 + big + gap * 3;
  const x0 = STAGE_W + (W - STAGE_W - total) / 2;
  const yTile = H / 2 - s / 2 - 10;
  const yBig = H / 2 - big / 2 - 10;
  const tile = (id: string, x: number, y: number, size: number, combo: string, key: ColorAdditionMessageKey) => {
    const box: Vec2[] = [fromTop(x, y + size), fromTop(x + size, y + size), fromTop(x + size, y), fromTop(x, y)];
    out.push(fill(`tile-${id}`, box, combo));
    const inset = 0.5;
    out.push(
      loop(
        `tile-${id}-border`,
        [
          fromTop(x + inset, y + size - inset),
          fromTop(x + size - inset, y + size - inset),
          fromTop(x + size - inset, y + inset),
          fromTop(x + inset, y + inset),
        ],
        TILE_BORDER_PX,
        { style: { colorRole: 'muted', emphasis: 'strong' } },
      ),
    );
    out.push(label(`tile-${id}-label`, fromTop(x + size / 2, y + size + TILE.labelGap + TILE.labelFont / 2), key, TILE.labelFont));
  };

  const shares = [
    { id: 'r', combo: '100', key: 'label.red' },
    { id: 'g', combo: '010', key: 'label.green' },
    { id: 'b', combo: '001', key: 'label.blue' },
  ] as const;
  shares.forEach((sh, i) => tile(sh.id, x0 + i * (s + gap), yTile, s, on[i] ? sh.combo : '000', sh.key));
  for (let i = 0; i < 3; i++) {
    out.push(
      label(`sign-${i}`, fromTop(x0 + i * (s + gap) + s + gap / 2, H / 2 - 10), i < 2 ? 'label.plus' : 'label.equals', TILE.signFont),
    );
  }
  tile('sum', x0 + 3 * (s + gap), yBig, big, on.join(''), 'label.probe');

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 원본 캔버스 전체 + 아래 캡션 한 줄 자리. */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { minX: 0, maxX: W, minY: -46, maxY: H };
}
