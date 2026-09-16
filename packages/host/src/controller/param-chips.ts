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
import { readPath, writePath } from './path';
import type {
  ControllerEventContext,
  ControllerImpl,
  ControllerRenderContext,
  PointerInput,
} from './types';

type ParamChipsSpec = Extract<ControllerSpec, { type: 'param-chips' }>;

/** 자리를 선언하지 않으면 왼쪽 아래에 놓인다 (`angle-dial` · `param-panel` 과 같은 쪽). */
const DEFAULT_AT: ScreenAnchor = { screen: 'bottom-left' };

/**
 * 칩 하나의 이름은 **선언 순서**다.
 *
 * 고를 값이 `number | string` 이라 값을 그대로 id 로 쓰면 `2` 와 `'2'` 가 한 칩이 되고,
 * 같은 값을 두 번 선언한 조각에서는 둘 중 어느 것을 눌렀는지 가릴 수 없다. 순서는
 * 선언에 이미 있는 것이라 칩과 후보를 어긋남 없이 잇는다.
 */
function chipsOf(rc: ControllerRenderContext, spec: ParamChipsSpec, state: BundleState): Chip[] {
  const current = readPath<number | string>(state, spec.binds.value);
  return spec.options.map((o, i) => ({
    id: String(i),
    text: rc.i18n.resolve(o.label),
    active: o.value === current,
  }));
}

/**
 * 값을 후보 중에서 고르는 칩 줄.
 *
 * `env-toggles` · `stage-tabs` · `view-tabs` 와 **같은 칩 구현**(`chips.ts`)을 쓴다.
 * 넷이 각자 그리면 같은 것이 네 모양으로 나온다 (원칙 4). 다른 것은 바꾸는 대상뿐이다 —
 * 저 셋은 세션(어느 스테이지 · 어느 뷰 · 무엇이 켜졌나)을 바꾸고, 이것은 **조각 상태의
 * 값**을 바꾼다. 질량 2 / 10 / 50 kg 은 환경도 단계도 아니라 그 물체의 값이다.
 *
 * 탭 모양(`mode: 'tab'`)으로 그린다 — 후보 가운데 **하나만** 켜지므로, 여럿이 함께
 * 켜지는 토글과 같은 색을 쓰면 둘이 구분되지 않는다.
 */
export class ParamChipsController implements ControllerImpl<ParamChipsSpec> {
  readonly type = 'param-chips' as const;

  /** 마지막에 그린 자리. hitTest 가 이것을 본다 (chips.ts 머리말 — C5). */
  private row: ChipRow | null = null;

  isDragging(): boolean {
    return false;
  }

  screenBounds(): Box | null {
    return this.row ? { x: this.row.x, y: this.row.y, w: this.row.w, h: this.row.h } : null;
  }

  render(rc: ControllerRenderContext, spec: ParamChipsSpec, state: BundleState): void {
    if (spec.options.length === 0) {
      this.row = null;
      return;
    }
    // 이름표는 선언이 준 것만 쓴다 — 없으면 칩만 놓는다. 프레임워크가 대신 지어 주면
    // 저작자가 "이름표 없이" 를 고를 수 없다 (원칙 2 · C1).
    const label = spec.label ? rc.i18n.resolve(spec.label) : undefined;
    this.row = layoutChipRow(rc, chipsOf(rc, spec, state), {
      at: {
        declared: spec.at,
        fallback: DEFAULT_AT,
        slot: rc.slot,
        viewport: rc.viewport,
        toScreen: rc.toScreen,
      },
      label,
    });
    drawChipRow(rc, this.row, { label, mode: 'tab' });
  }

  hitTest(input: PointerInput, _ctx: ControllerEventContext, _spec: ParamChipsSpec): boolean {
    return rowHit(input, this.row);
  }

  onPointerDown(
    input: PointerInput,
    _ctx: ControllerEventContext,
    spec: ParamChipsSpec,
    state: BundleState,
  ): BundleState | null {
    const hit = chipHit(input, this.row);
    if (!hit) return null;
    const option = spec.options[Number(hit.id)];
    if (!option) return null;
    return writePath(state, spec.binds.value, option.value);
  }

  onPointerMove(): BundleState | null {
    return null;
  }

  onPointerUp(): BundleState | null {
    return null;
  }
}
