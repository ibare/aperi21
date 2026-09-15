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

type ResetButtonsSpec = Extract<ControllerSpec, { type: 'reset-buttons' }>;

/** 자리를 선언하지 않으면 오른쪽 아래에서 위로 쌓인다. */
const DEFAULT_AT: ScreenAnchor = { screen: 'bottom-right' };

const DEFAULT_TARGETS = ['camera', 'state'] as const;

function chipsOf(rc: ControllerRenderContext, spec: ResetButtonsSpec): Chip[] {
  const targets = spec.targets ?? DEFAULT_TARGETS;
  const out: Chip[] = [];
  // 문안은 키로 조회하고 호출부에 en 원본을 남긴다 — 추출기가 그것을 찾는다 (C1).
  if (targets.includes('camera')) {
    out.push({ id: 'camera', text: rc.i18n.t('ui.resetButtons.camera', 'Camera'), active: false });
  }
  if (targets.includes('state')) {
    out.push({ id: 'state', text: rc.i18n.t('ui.resetButtons.state', 'Reset'), active: false });
  }
  return out;
}

/**
 * 되돌리기 단추 — 프레이밍을 되돌리거나 상태를 처음으로 돌린다.
 *
 * 카메라 버튼은 프레이밍의 권한을 독자에게 넘기는 것이라 그림이 무엇을 주장하는지를
 * 바꾼다. 그래서 선언해야 나온다 (원칙 4).
 */
export class ResetButtonsController implements ControllerImpl<ResetButtonsSpec> {
  readonly type = 'reset-buttons' as const;

  private row: ChipRow | null = null;

  isDragging(): boolean {
    return false;
  }

  screenBounds(): Box | null {
    return this.row ? { x: this.row.x, y: this.row.y, w: this.row.w, h: this.row.h } : null;
  }

  render(rc: ControllerRenderContext, spec: ResetButtonsSpec, _state: BundleState): void {
    const chips = chipsOf(rc, spec);
    if (chips.length === 0) {
      this.row = null;
      return;
    }
    this.row = layoutChipRow(rc, chips, {
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

  hitTest(input: PointerInput, _ctx: ControllerEventContext, _spec: ResetButtonsSpec): boolean {
    return rowHit(input, this.row);
  }

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    _spec: ResetButtonsSpec,
    _state: BundleState,
  ): BundleState | null {
    const hit = chipHit(input, this.row);
    if (hit?.id === 'camera') ctx.session.resetCamera();
    if (hit?.id === 'state') ctx.session.resetState();
    // 상태를 되돌리는 것은 러너가 초기값을 다시 만드는 일이라, 여기서 state 를
    // 돌려주지 않는다. 세션이 갈아 끼운다.
    return null;
  }

  onPointerMove(): BundleState | null {
    return null;
  }

  onPointerUp(): BundleState | null {
    return null;
  }
}
