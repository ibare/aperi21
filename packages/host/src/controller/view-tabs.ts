import type { BundleState, ControllerSpec } from '@aperi21/schema';
import {
  chipHit,
  drawChipRow,
  layoutChipRow,
  rowHit,
  type Chip,
  type ChipRow,
} from './chips';
import type { Box, ScreenAnchor } from './layout';
import type {
  ControllerEventContext,
  ControllerImpl,
  ControllerRenderContext,
  PointerInput,
} from './types';

type ViewTabsSpec = Extract<ControllerSpec, { type: 'view-tabs' }>;

/** 자리를 선언하지 않으면 왼쪽 위에서 아래로 쌓인다. */
const DEFAULT_AT: ScreenAnchor = { screen: 'top-left' };

function chipsOf(rc: ControllerRenderContext): Chip[] {
  return rc.session.views.map((v) => ({
    id: v.id,
    text: rc.i18n.resolve(v.label),
    active: v.id === rc.session.viewId,
  }));
}

/**
 * 뷰 탭 — 같은 현상을 다른 관점으로 바꿔 본다.
 *
 * **고를 것이 하나뿐이면 선언해도 그리지 않는다.** 탭 하나는 고르는 장치가 아니라
 * 제목이고, 조각에 제목을 두지 않는다 (S-piece).
 */
export class ViewTabsController implements ControllerImpl<ViewTabsSpec> {
  readonly type = 'view-tabs' as const;

  /** 마지막에 그린 자리. hitTest 가 이것을 본다 (chips.ts 머리말). */
  private row: ChipRow | null = null;

  isDragging(): boolean {
    return false;
  }

  screenBounds(): Box | null {
    return this.row ? { x: this.row.x, y: this.row.y, w: this.row.w, h: this.row.h } : null;
  }

  render(rc: ControllerRenderContext, spec: ViewTabsSpec, _state: BundleState): void {
    if (rc.session.views.length <= 1) {
      this.row = null;
      return;
    }
    this.row = layoutChipRow(rc, chipsOf(rc), {
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

  hitTest(input: PointerInput, _ctx: ControllerEventContext, _spec: ViewTabsSpec): boolean {
    return rowHit(input, this.row);
  }

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    _spec: ViewTabsSpec,
    _state: BundleState,
  ): BundleState | null {
    const hit = chipHit(input, this.row);
    if (hit) ctx.session.setView(hit.id);
    // 뷰를 바꾸는 것은 세션의 일이고 조각 상태는 그대로다.
    return null;
  }

  onPointerMove(): BundleState | null {
    return null;
  }

  onPointerUp(): BundleState | null {
    return null;
  }
}
