/**
 * 조작기의 자리 — 선언의 `at` 에 상자를 놓는다.
 *
 * 자리는 저작 결정이다 (원칙 2 · 7). 코어는 자리를 고정하지 않고 기본값만 준다 —
 * 선언에 `at` 이 없으면 기본 모서리에서 **같은 종류 선언 순서(slot)만큼** 쌓아,
 * 같은 조작기를 여럿 두어도 겹치지 않는다.
 *
 * render 와 hitTest 가 **같은 함수**로 자리를 낸다 — 한쪽만 바꾸면 보이는 자리와
 * 잡히는 자리가 어긋나는데 예외는 나지 않는다.
 */

import type { Anchor, Vec2 } from '@aperi21/schema';
import type { Viewport } from '../camera';

/** 조작기 상자(화면 px, 좌상단 기준). */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type ScreenAnchor = Extract<Anchor, { screen: string }>;

/**
 * 자리에 크기 `w × h` 의 상자를 놓는다.
 *
 * - 화면 모서리: 상자의 그 모서리를 화면 모서리(여백 `margin` 안쪽)에 맞춘다.
 * - 월드 좌표: 상자의 가운데를 그 점에 둔다.
 *
 * `offset` 은 화면 px 로 더한다.
 */
export function placeBox(
  anchor: Anchor,
  w: number,
  h: number,
  viewport: Viewport,
  toScreen: (world: Vec2) => Vec2,
  margin: number,
): Box {
  const [ox, oy] = anchor.offset ?? [0, 0];
  if ('world' in anchor) {
    const [sx, sy] = toScreen(anchor.world);
    return { x: sx - w / 2 + ox, y: sy - h / 2 + oy, w, h };
  }
  const s = anchor.screen;
  const x = s.endsWith('left')
    ? margin
    : s.endsWith('right')
      ? viewport.width - margin - w
      : (viewport.width - w) / 2;
  const y = s.startsWith('top') ? margin : viewport.height - margin - h;
  return { x: x + ox, y: y + oy, w, h };
}

/** 선언에 자리가 없을 때의 기본 자리 — 기본 모서리에서 `slot` 번째만큼 `step` 방향으로. */
export function stackedAnchor(base: ScreenAnchor, slot: number, step: Vec2): Anchor {
  const [ox, oy] = base.offset ?? [0, 0];
  return { screen: base.screen, offset: [ox + step[0] * slot, oy + step[1] * slot] };
}
