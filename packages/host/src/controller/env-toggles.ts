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

type EnvTogglesSpec = Extract<ControllerSpec, { type: 'env-toggles' }>;

/** 자리를 선언하지 않으면 오른쪽 위에서 아래로 쌓인다 (`stage-tabs` 머리말 참고). */
const DEFAULT_AT: ScreenAnchor = { screen: 'top-right' };

function chipsOf(rc: ControllerRenderContext): Chip[] {
  return rc.session.environments.map((e) => ({
    id: e.id,
    text: rc.i18n.resolve(e.label),
    active: rc.session.envIds.includes(e.id),
  }));
}

/**
 * 환경 토글 — 비·바람처럼 켜고 끄는 조건. 탭과 달리 **여럿이 동시에 켜진다.**
 *
 * 지금 스테이지에서 쓸 수 있는 것만 나온다. 그 추리기는 러너가 하고
 * (`session.environments`), 켤 것이 없으면 그리지 않는다.
 */
export class EnvTogglesController implements ControllerImpl<EnvTogglesSpec> {
  readonly type = 'env-toggles' as const;

  private row: ChipRow | null = null;

  isDragging(): boolean {
    return false;
  }

  screenBounds(): Box | null {
    return this.row ? { x: this.row.x, y: this.row.y, w: this.row.w, h: this.row.h } : null;
  }

  render(rc: ControllerRenderContext, spec: EnvTogglesSpec, _state: BundleState): void {
    if (rc.session.environments.length === 0) {
      this.row = null;
      return;
    }
    const label = controllerText(rc.i18n, spec.label, 'ui.envToggles.label', 'env');
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
    drawChipRow(rc, this.row, { label, mode: 'toggle' });
  }

  hitTest(input: PointerInput, _ctx: ControllerEventContext, _spec: EnvTogglesSpec): boolean {
    return rowHit(input, this.row);
  }

  onPointerDown(
    input: PointerInput,
    ctx: ControllerEventContext,
    _spec: EnvTogglesSpec,
    _state: BundleState,
  ): BundleState | null {
    const hit = chipHit(input, this.row);
    if (hit) ctx.session.toggleEnv(hit.id);
    return null;
  }

  onPointerMove(): BundleState | null {
    return null;
  }

  onPointerUp(): BundleState | null {
    return null;
  }
}
