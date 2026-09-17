import type { BundleState, ControllerSpec } from '@aperi21/schema';
import { chipHit, drawChipRow, layoutChipRow, rowHit, type ChipRow } from './chips';
import type { Box, ScreenAnchor } from './layout';
import { writePath } from './path';
import type {
  ControllerEventContext,
  ControllerImpl,
  ControllerRenderContext,
  PointerInput,
} from './types';

type ButtonSpec = Extract<ControllerSpec, { type: 'button' }>;

/** 자리를 선언하지 않으면 오른쪽 아래에서 쌓인다. */
const DEFAULT_AT: ScreenAnchor = { screen: 'bottom-right' };

/** 칩 줄 안에서 이 단추를 가리키는 이름. 칩이 하나뿐이라 고정이다. */
const CHIP_ID = 'press';

/**
 * 누르는 단추 — 누르면 선언한 state 경로에 true 를 적는다.
 *
 * 되돌리지 않는다. 누름을 소비하고 지우는 것은 조각의 `step` 이다 (선언 주석 참조).
 * 모양은 다른 칩 줄(`reset-buttons` · `param-chips`)과 같은 헬퍼로 그린다 — 같은
 * 누르는 것이 조작기마다 다른 모양이면 읽는 쪽이 둘을 다른 것으로 본다.
 */
export class ButtonController implements ControllerImpl<ButtonSpec> {
  readonly type = 'button' as const;

  private row: ChipRow | null = null;

  isDragging(): boolean {
    return false;
  }

  screenBounds(): Box | null {
    return this.row ? { x: this.row.x, y: this.row.y, w: this.row.w, h: this.row.h } : null;
  }

  render(rc: ControllerRenderContext, spec: ButtonSpec, _state: BundleState): void {
    this.row = layoutChipRow(rc, [{ id: CHIP_ID, text: rc.i18n.resolve(spec.label), active: false }], {
      at: {
        declared: spec.at,
        fallback: DEFAULT_AT,
        slot: rc.slot,
        viewport: rc.viewport,
        toScreen: rc.toScreen,
      },
      size: spec.size,
    });
    drawChipRow(rc, this.row);
  }

  hitTest(input: PointerInput, _ctx: ControllerEventContext, _spec: ButtonSpec): boolean {
    return rowHit(input, this.row);
  }

  onPointerDown(
    input: PointerInput,
    _ctx: ControllerEventContext,
    spec: ButtonSpec,
    state: BundleState,
  ): BundleState | null {
    if (chipHit(input, this.row)?.id !== CHIP_ID) return null;
    return writePath(state, spec.binds.pressed, true);
  }

  onPointerMove(): BundleState | null {
    return null;
  }

  onPointerUp(): BundleState | null {
    return null;
  }
}
