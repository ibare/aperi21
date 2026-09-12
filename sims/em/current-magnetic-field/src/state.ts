import { NORTH, PREROLL, START_AT } from './schema';
import { captionFlags, currentAt, deriveSamples } from './physics';

export interface CurrentMagneticFieldState {
  /**
   * 조각 시계(초). 시간표의 주기 안 시각과 같은 눈금이다 — `step` 은 시각을
   * 받지 않으므로 전류를 읽으려면 조각이 자기 시계를 들고 있어야 한다.
   */
  readonly t: number;
  /** 지금 전류 (−1 … 1). 전선 기호와 그 진하기가 이것으로 정해진다. */
  readonly current: number;
  /**
   * 바늘마다 각도 하나(라디안). 자리 순서는 `deriveSamples()` 와 같다.
   *
   * 프레임 사이에 누적되는 유일한 값이다. 이것이 있어서 "돌아서는 과정이 안에서
   * 밖으로 번진다" 가 화면에서 일어난다.
   */
  readonly angles: readonly number[];
  /** 캡션 슬롯이 보는 자리 (`CaptionSlotDef.cases`). 전류가 흐르는 동안. */
  readonly forward: boolean;
  /** 캡션 슬롯이 보는 자리. 전류가 거꾸로 흐르는 동안. */
  readonly reversed: boolean;
}

/**
 * 모든 바늘이 북을 가리키는 데서 시작한다.
 *
 * 시계는 `START_AT − PREROLL` 에서 연다 — 프리롤이 `PREROLL` 초를 굴리고 나면
 * 시계가 정확히 `START_AT` 에 서고, 독자가 보는 첫 프레임이 **전류를 켠 지
 * 0.55 초**가 된다. 두 선언이 한 눈금 위에 있으므로 시간표의 주기 안 시각과도
 * 어긋나지 않는다.
 */
export function initialState(): CurrentMagneticFieldState {
  const t = START_AT - PREROLL;
  const current = currentAt(t);
  return {
    t,
    current,
    angles: deriveSamples().map(() => NORTH),
    ...captionFlags(current),
  };
}
