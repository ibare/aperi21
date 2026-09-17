import type { LiquidKey } from './schema';
import { dip } from './physics';

/**
 * 상태.
 *
 * 세 기둥 높이 `h` 는 루카스-워시번 식을 적분해 쌓는다 — 시각의 함수로 닫히지 않는다.
 * 캡션 조건 세 개는 `h` 에서 판정한 결과이고 선언(`caption.cases`)이 이름으로 가리킨다.
 */
export interface CapillaryActionState {
  /** 고른 액체. 조작기(`param-chips`)가 적는다. */
  liquid: LiquidKey;
  /** 지금 기둥이 담긴 액체. `liquid` 와 다르면 다시 담근다. */
  applied: LiquidKey;
  /** 기둥 높이(m, 메니스커스 중심 기준, 바깥 수면 위가 +). 반지름 0.25 · 0.5 · 1 mm 순. */
  h: readonly number[];
  /** 액체 칩을 누르고 있는지. 러너가 적는다(`heldPath`). */
  chipHeld: boolean;
  /** 지난 걸음의 `chipHeld` — 누른 순간(같은 칸을 다시 누름)을 알아챈다. */
  chipWasHeld: boolean;
  waterSettled: boolean;
  mercuryFalling: boolean;
  mercurySettled: boolean;
}

export function initialState(): CapillaryActionState {
  return dip('water');
}
