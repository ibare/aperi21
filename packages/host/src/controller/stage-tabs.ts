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
import { controllerText } from './text';
import type {
  ControllerEventContext,
  ControllerImpl,
  ControllerRenderContext,
  PointerInput,
} from './types';

type StageTabsSpec = Extract<ControllerSpec, { type: 'stage-tabs' }>;

/**
  * 자리를 선언하지 않으면 위 가운데에서 아래로 쌓인다.
  *
  * 종류마다 기본 모서리를 달리 둔다 — 같은 모서리를 기본으로 삼으면 서로 다른
  * 조작기가 같은 자리에 겹친다(`slot` 은 같은 종류끼리만 센다). 한 모서리에 둘
  * 이상 놓고 싶으면 조각이 `at` 으로 정한다 (원칙 7 ③).
  */
const DEFAULT_AT: ScreenAnchor = { screen: 'top-center' };

function chipsOf(rc: ControllerRenderContext): Chip[] {
  return rc.session.stages.map((s) => ({
    id: s.id,
    text: rc.i18n.resolve(s.label),
    active: s.id === rc.session.stageId,
  }));
}

/**
 * 스테이지 탭 — 같은 장치를 다른 공간(중력·대기)에 놓아 본다.
 *
 * `view-tabs` 와 같이, **고를 것이 하나뿐이면 그리지 않는다** (S-piece).
 */
export class StageTabsController implements ControllerImpl<StageTabsSpec> {
  readonly type = 'stage-tabs' as const;

  private row: ChipRow | null = null;

  isDragging(): boolean {
    return false;
  }

  screenBounds(): Box | null {
    return this.row ? { x: this.row.x, y: this.row.y, w: this.row.w, h: this.row.h } : null;
  }

  render(rc: ControllerRenderContext, spec: StageTabsSpec, _state: BundleState): void {
    if (rc.session.stages.length <= 1) {
      this.row = null;
      return;
    }
    const label = controllerText(rc.i18n, spec.label, 'ui.stageTabs.label', 'stage');
    this.row = layoutChipRow(rc, chipsOf(rc), {
      at: {
        declared: spec.at,
        fallback: DEFAULT_AT,
        slot: rc.slot,
        viewport: rc.viewport,
        toScreen: rc.toScreen,
      },
      label,
      size: spec.size,
    });
    drawChipRow(rc, this.row, { label });
  }

  hitTest(input: PointerInput, _ctx: ControllerEventContext, _spec: StageTabsSpec): boolean {
    return rowHit(input, this.row);
  }

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    _spec: StageTabsSpec,
    _state: BundleState,
  ): BundleState | null {
    const hit = chipHit(input, this.row);
    if (hit) ctx.session.setStage(hit.id);
    return null;
  }

  onPointerMove(): BundleState | null {
    return null;
  }

  onPointerUp(): BundleState | null {
    return null;
  }
}
