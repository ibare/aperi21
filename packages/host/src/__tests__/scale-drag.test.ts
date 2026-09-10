/**
 * 눈금 끌기 — 화면 점을 트랙에 내려 값을 잡고, 잡힘은 번들 상태에 둔다.
 */
import { describe, expect, it } from 'vitest';
import type { ControllerSpec, Vec2 } from '@aperi21/schema';
import { ScaleDragController, type ControllerEventContext, type PointerInput } from '../index';

type Spec = Extract<ControllerSpec, { type: 'scale-drag' }>;

const SPEC: Spec = {
  id: 'scale',
  type: 'scale-drag',
  binds: { value: 'v', held: 'held' },
  track: { pos: [0, 0], size: 1 },
  range: [0, 10],
};

// 월드 1 = 화면 100px, 월드 y=0 이 화면 y=100.
const toScreen = (w: Vec2): Vec2 => [w[0] * 100, 100 - w[1] * 100];
const CTX: ControllerEventContext = {
  viewport: { width: 200, height: 200 },
  toScreen,
  toWorld: (s: Vec2): Vec2 => [s[0] / 100, (100 - s[1]) / 100],
  snapWorld: (w: Vec2) => w,
  scale: 100,
  slot: 0,
};
const at = (px: number, py: number): PointerInput => ({ px, py, button: 0, buttons: 1 });

describe('ScaleDragController', () => {
  const drag = new ScaleDragController();

  it('트랙 가까이만 잡힌다', () => {
    expect(drag.hitTest(at(50, 110), CTX, SPEC)).toBe(true);
    expect(drag.hitTest(at(50, 130), CTX, SPEC)).toBe(false);
  });

  it('누르면 그 자리 값과 잡힘을 쓰고, 놓으면 잡힘만 푼다', () => {
    const down = drag.onPointerDown(at(30, 100), CTX, SPEC, { v: 0, held: false });
    expect(down).toEqual({ v: 3, held: true });
    const moved = drag.onPointerMove(at(80, 100), CTX, SPEC, down!);
    expect(moved).toEqual({ v: 8, held: true });
    expect(drag.onPointerUp(at(80, 100), CTX, SPEC, moved!)).toEqual({ v: 8, held: false });
  });

  it('트랙 밖으로 끌면 끝값에 멈춘다', () => {
    expect(drag.onPointerMove(at(-40, 100), CTX, SPEC, { v: 5, held: true })).toEqual({ v: 0, held: true });
    expect(drag.onPointerMove(at(160, 100), CTX, SPEC, { v: 5, held: true })).toEqual({ v: 10, held: true });
  });

  it('트랙 밖을 누르면 아무것도 바꾸지 않는다', () => {
    expect(drag.onPointerDown(at(50, 160), CTX, SPEC, { v: 5, held: false })).toBeNull();
  });
});
