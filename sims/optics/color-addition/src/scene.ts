// ========================================================================
// color-addition — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 원본은 검은 막 위에 빨강 · 초록 · 파랑 원판을 캔버스 가산 합성(`lighter`)으로 겹쳐
// 칠했다. 여기서는 막을 빛 없음(세 성분 0)으로, 원판을 빛의 색(`light: { rgb }`)으로
// 선언하고 겹침은 렌더러가 더한다(`blend: 'add'`). 겹친 자리를 따로 자르지 않는다.
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
import { addedLight, circlePolygon, insideFrom, lightCenters, lightDisc, reach, STAGE_RECT } from './physics';
import { CENTER, H, LIGHTS, PROBE_R, STAGE_W, TILE, W, phaseIds, text, type ColorAdditionMessageKey } from './schema';
import type { ColorAdditionState } from './state';

/** 원본 고리: 검은 테 3 px 위에 흰 선 1.5 px. */
const PROBE_OUTER_PX = 3;
const PROBE_INNER_PX = 1.5;
/** 네모 테 굵기(화면 px). */
const TILE_BORDER_PX = 1;
/** 빛 없음 — 검은 막 · 꺼진 몫 네모. */
const NO_LIGHT = [0, 0, 0] as const;

/** 빛의 색으로 채운 칸. 막 · 몫 네모 · 합 네모가 쓴다 — 덮어 칠한다. */
function fill(id: string, points: readonly Vec2[], rgb: readonly [number, number, number]): Region {
  return { type: 'region', id, points, fillOpacity: 1, light: { rgb } };
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

  // ---- 검은 막 — 빛 없음 ----
  out.push(fill('screen', STAGE_RECT, NO_LIGHT));

  // ---- 빛 원판 — 겹친 자리에서 성분이 더해진다 ----
  LIGHTS.forEach((L, i) => {
    const points = lightDisc(lights[i]!);
    if (points.length >= 3) {
      out.push({ type: 'region', id: `light-${L.key}`, points, fillOpacity: 1, light: { rgb: L.rgb }, blend: 'add' });
    }
  });

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
  const tile = (id: string, x: number, y: number, size: number, rgb: readonly [number, number, number], key: ColorAdditionMessageKey) => {
    const box: Vec2[] = [fromTop(x, y + size), fromTop(x + size, y + size), fromTop(x + size, y), fromTop(x, y)];
    out.push(fill(`tile-${id}`, box, rgb));
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

  const shareKeys = ['label.red', 'label.green', 'label.blue'] as const;
  LIGHTS.forEach((L, i) => tile(L.key, x0 + i * (s + gap), yTile, s, on[i] ? L.rgb : NO_LIGHT, shareKeys[i]!));
  for (let i = 0; i < 3; i++) {
    out.push(
      label(`sign-${i}`, fromTop(x0 + i * (s + gap) + s + gap / 2, H / 2 - 10), i < 2 ? 'label.plus' : 'label.equals', TILE.signFont),
    );
  }
  tile('sum', x0 + 3 * (s + gap), yBig, big, addedLight(on), 'label.probe');

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 원본 캔버스 전체 + 아래 캡션 한 줄 자리. */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { minX: 0, maxX: W, minY: -46, maxY: H };
}
