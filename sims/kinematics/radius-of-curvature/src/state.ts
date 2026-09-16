import type { Vec2 } from '@aperi21/schema';

import { CURVE, deriveAt, startArc } from './physics';

/**
 * 누적 상태는 **호길이 하나**다. 나머지는 그 값에서 매 프레임 다시 나온다 —
 * 상태를 늘리지 않고 파생을 적어 두는 것은 선언이 가리킬 자리가 필요해서다
 * (`caption.cases.when` · `point-drag.binds`).
 */
export interface RadiusOfCurvatureState {
  /** 달리는 점의 호길이. 이 조각의 유일한 누적 값이다. */
  arc: number;
  /**
   * 달리는 점의 자리(월드). 조작기가 잡고 있는 동안은 **조작기가** 여기에 쓰고,
   * 놓으면 `step` 이 호길이에서 다시 쓴다. 인계가 대입 한 줄로 끝나는 자리다.
   */
  pos: Vec2;
  /** 조작기를 잡고 있는 동안 true. 잡힌 동안 자동 진행이 양보한다. */
  held: boolean;
  /** `dR/dφ > 0` — 얹힌 원이 커지는 중. 캡션 슬롯이 이 이름을 가리킨다. */
  swelling: boolean;
}

export function initialState(): RadiusOfCurvatureState {
  const arc = startArc(CURVE);
  const d = deriveAt(arc);
  return { arc, pos: d.point, held: false, swelling: d.swelling };
}
