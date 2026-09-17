import type { BundleState, ControllerSpec } from '@aperi21/schema';
import { writePath } from './path';
import type { ControllerEventContext, ControllerImpl, PointerInput } from './types';

type PressAreaSpec = Extract<ControllerSpec, { type: 'press-area' }>;

/**
 * 그림 속 자리를 누르는 조작기 — 누르면 선언한 state 경로에 true 를 적는다.
 *
 * **그리지 않는다.** 그 자리에 그려진 물체가 손잡이다. 그래서 화면 상자(`screenBounds`)도
 * 돌려주지 않는다 — 그림 안 조작기라 프레이밍이 비우면 제 그림을 밀어낸다 (`types.ts`).
 *
 * 인스턴스 상태가 없다. 지우는 것은 조각의 `step` 이다 (`button` 과 같은 규약).
 */
export class PressAreaController implements ControllerImpl<PressAreaSpec> {
  readonly type = 'press-area' as const;

  isDragging(): boolean {
    return false;
  }

  render(): void {
    // 그림이 곧 손잡이다.
  }

  hitTest(input: PointerInput, ctx: ControllerEventContext, spec: PressAreaSpec): boolean {
    const [ax, ay] = ctx.toScreen(spec.area.min);
    const [bx, by] = ctx.toScreen(spec.area.max);
    // 월드는 y 가 위, 화면은 아래라 두 모서리의 위아래가 뒤집힌다.
    return (
      input.px >= Math.min(ax, bx) &&
      input.px <= Math.max(ax, bx) &&
      input.py >= Math.min(ay, by) &&
      input.py <= Math.max(ay, by)
    );
  }

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    spec: PressAreaSpec,
    state: BundleState,
  ): BundleState | null {
    if (!this.hitTest(input, ctx, spec)) return null;
    return writePath(state, spec.binds.pressed, true);
  }

  onPointerMove(): BundleState | null {
    return null;
  }

  onPointerUp(): BundleState | null {
    return null;
  }
}
