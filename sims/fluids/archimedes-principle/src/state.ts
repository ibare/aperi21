// ========================================================================
// archimedes-principle — 런타임 상태
// ========================================================================

/**
 * 이 조각의 상태는 "물체가 얼마나 내려갔는가" 하나로 요약된다.
 * 저울 두 개의 눈금·넘친 물의 양은 전부 `submersion` 의 함수이므로 상태에
 * 담지 않는다 (`physics.deriveReadings` 가 매번 계산한다).
 */
export interface ArchimedesPrincipleState {
  /** 시뮬레이션 시간 (s). 수면 일렁임·물방울 위상에 쓰인다. */
  t: number;

  /**
   * 수면에 닿기까지의 진행도 0..1. 이 구간에서는 두 저울이 꼼짝하지 않는다 —
   * 기준값(19.6 N / 0 N)을 먼저 보여주기 위한 구간이다.
   */
  approach: number;

  /** 물에 잠긴 정도 0..1. 1 이면 완전히 잠겼다. */
  submersion: number;

  /**
   * 직전 프레임에 물리가 써 넣은 `submersion`. 슬라이더가 `submersion` 을
   * 직접 고쳐 쓰기 때문에, 이 값과 어긋나면 읽는 사람이 손댔다는 뜻이다.
   */
  autoSubmersion: number;

  /** 읽는 사람이 슬라이더를 잡은 뒤로는 자동 진행을 멈춘다. */
  manual: boolean;

  /** 넘치는 기세 -1..1. 양수일 때만 물줄기가 그려진다. */
  flow: number;
}

export function initialState(): ArchimedesPrincipleState {
  return {
    t: 0,
    approach: 0,
    submersion: 0,
    autoSubmersion: 0,
    manual: false,
    flow: 0,
  };
}
