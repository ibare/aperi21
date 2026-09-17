// ========================================================================
// free-body-diagram — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음.
//
// 바닥(trajectory + trace tick) · 빈 자리(trajectory closed dashed) · 물체(region 채움 +
// trajectory 윤곽) · 힘(vector + body point 작용점) · 이름표(readout world).
// 그리는 순서는 원본 그대로다 (`drawOrder: 'scene'`).
// ========================================================================

import type { Bounds, Primitive, SceneGraph, Vec2 } from '@aperi21/schema';
import { pose } from './physics';
import {
  BOOK_BODY,
  BOOK_PAGES,
  CUP_BODY,
  CUP_HANDLE,
  FLOOR_HATCH,
  FLOOR_LINE,
  FORCE_SCALE,
  FORCES,
  HATCH_DIRECTION,
  HATCH_LENGTH,
  LIFT,
  OTHER_OPACITY,
  SCENE_BOUNDS,
  SHIFT,
  TABLE_PARTS,
  text,
  type ObjectId,
} from './schema';
import type { FreeBodyDiagramState } from './state';

/** 물체 윤곽 굵기(화면 px). 원본 2. */
const OUTLINE_PX = 2;
/** 빈 자리 윤곽 굵기. 원본 1.5. */
const GHOST_PX = 1.5;
/** 책 쪽 선 · 바닥 빗금. 원본 1. */
const HAIR_PX = 1;
/** 물체 채움 짙기 — 원본 옅은 베이지 채움에 가장 가까운 옅은 회색. */
const BODY_FILL = 0.14;
/** 화살표 굵기 — 떼어 내는 물체 3, 나머지 2.2 (원본). */
const ARROW_MINE_PX = 3;
const ARROW_OTHER_PX = 2.2;
/** 화살촉 크기(월드). 원본 9 px. 짧은 화살표는 렌더러가 비율로 줄인다. */
const ARROW_HEAD = 0.09;
/** 이름표 글자 크기. 원본 13 px. */
const LABEL_FONT_PX = 13;

const move = (pts: readonly Vec2[], o: readonly [number, number]): Vec2[] =>
  pts.map(([x, y]) => [x + o[0], y + o[1]]);

/** 물체 하나의 모양 — 채움과 윤곽. 원본 draw*Shape 의 채움 스타일. */
function solid(id: ObjectId, o: readonly [number, number]): Primitive[] {
  const out: Primitive[] = [];
  const part = (pid: string, pts: readonly Vec2[]): void => {
    out.push({
      type: 'region',
      id: `${pid}-fill`,
      points: move(pts, o),
      opaque: true,
      fillOpacity: BODY_FILL,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'trajectory',
      id: `${pid}-outline`,
      points: move(pts, o),
      closed: true,
      width: OUTLINE_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  };
  if (id === 'table') {
    TABLE_PARTS.forEach((pts, i) => part(`table-${i}`, pts));
  } else if (id === 'book') {
    part('book', BOOK_BODY);
    BOOK_PAGES.forEach((pts, i) =>
      out.push({
        type: 'trajectory',
        id: `book-page-${i}`,
        points: move(pts, o),
        width: HAIR_PX,
        style: { colorRole: 'muted', emphasis: 'subtle' },
      }),
    );
  } else {
    part('cup', CUP_BODY);
    out.push({
      type: 'trajectory',
      id: 'cup-handle',
      points: move(CUP_HANDLE, o),
      width: OUTLINE_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  return out;
}

/** 빈 자리 — 같은 모양을 점선 윤곽으로. 책의 쪽 선은 원본도 긋지 않았다. */
function ghost(id: ObjectId, opacity: number): Primitive[] {
  const line = (gid: string, pts: readonly Vec2[], closed: boolean): Primitive => ({
    type: 'trajectory',
    id: gid,
    points: pts,
    closed,
    width: GHOST_PX,
    opacity,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
  });
  if (id === 'table') return TABLE_PARTS.map((pts, i) => line(`ghost-table-${i}`, pts, true));
  if (id === 'book') return [line('ghost-book', BOOK_BODY, true)];
  return [line('ghost-cup', CUP_BODY, true), line('ghost-cup-handle', CUP_HANDLE, false)];
}

export function scene(params: { state: FreeBodyDiagramState }): SceneGraph {
  const { selected, sep, labels, offset } = pose(params.state, SHIFT, LIFT);
  const out: Primitive[] = [];
  const still: readonly [number, number] = [0, 0];

  // ---- 바닥 ----
  out.push({
    type: 'trajectory',
    id: 'floor',
    points: FLOOR_LINE,
    width: OUTLINE_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trace',
    id: 'floor-hatch',
    marks: FLOOR_HATCH.map((pos) => ({ pos })),
    shape: 'tick',
    size: HATCH_LENGTH,
    direction: HATCH_DIRECTION,
    width: HAIR_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });

  // ---- 빈 자리 ----
  if (sep > 0) out.push(...ghost(selected, Math.min(1, sep * 3)));

  // ---- 물체 셋: 책상 → 책 → 컵 순서로 쌓는다 ----
  for (const id of ['table', 'book', 'cup'] as const) {
    out.push(...solid(id, id === selected && sep > 0 ? offset : still));
  }

  // ---- 힘 화살표 아홉 ----
  // 떼어 내는 물체의 힘은 강조색으로 물체와 함께 옮긴다. 나머지는 제자리에서 옅게 남는다.
  for (const f of FORCES) {
    const mine = f.on === selected;
    const o = mine ? offset : still;
    const from: Vec2 = [f.at[0] + o[0], f.at[1] + o[1]];
    const opacity = mine ? 1 : OTHER_OPACITY.rest + (OTHER_OPACITY.away - OTHER_OPACITY.rest) * sep;
    const role = mine ? 'accent' : 'ink';
    out.push({
      type: 'vector',
      id: `force-${f.id}`,
      from,
      // 월드는 y 위 — 원본 dir +1(아래)은 음의 y.
      delta: [0, -f.dir * f.newtons * FORCE_SCALE],
      headSize: ARROW_HEAD,
      // 컵의 짧은 화살표가 컵 윤곽 위에서도 읽히게 바탕으로 도려낸다.
      outline: 'background',
      width: mine ? ARROW_MINE_PX : ARROW_OTHER_PX,
      opacity,
      style: { colorRole: role, emphasis: 'strong' },
    });
    out.push({
      type: 'body',
      id: `force-${f.id}-point`,
      pos: from,
      shape: 'point',
      opacity,
      style: { colorRole: role, emphasis: 'strong' },
    });
  }

  // ---- 이름표 — 떼어 낸 뒤에만 ----
  if (labels > 0) {
    for (const f of FORCES) {
      if (f.on !== selected) continue;
      out.push({
        type: 'readout',
        id: `label-${f.id}`,
        anchor: { world: [f.labelAt[0] + offset[0], f.labelAt[1] + offset[1]] },
        text: text(f.label),
        chip: false,
        font: 'text',
        fontSize: LABEL_FONT_PX,
        align: f.labelAlign,
        opacity: labels,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계 — 프레이밍이 흔들리지 않게 매 프레임 같은 값. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
