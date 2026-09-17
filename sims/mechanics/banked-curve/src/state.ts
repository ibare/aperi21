import { ATTEMPTS, R0, V } from './schema';

/**
 * 원뿔면 위 차 한 대. 원본 `freshCar` 그대로.
 *
 * `r` · `rd` · `phi` 는 적분 변수, `x` · `y` · `vx` · `vy` 는 위에서 본 평면 좌표(m)와 속도.
 * 위에서 본 좌표는 **원본 캔버스의 방향**(y 가 아래)이다 — 출발점은 중심의 아래쪽이고
 * 오른쪽으로 달린다. scene 이 월드로 옮긴다.
 */
export interface Car {
  r: number;
  rd: number;
  phi: number;
  /** 각운동량 (질량당) r²φ̇ — 보존된다. */
  L: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export type Phase = 'tilt' | 'run' | 'fly' | 'hold';
export type Outcome = 'out' | 'in' | 'round';

/** 지난 시도의 자취. 위에서 본 평면 좌표(m). */
export interface PastTrail {
  deg: number;
  pts: readonly (readonly [number, number])[];
}

/**
 * 캡션 슬롯이 읽는 자리. 선언은 경로 이름만 가리키고, 어느 문장인지 세는 것은 `step` 이다.
 * 위에서부터 참인 첫 항목이 이기며, 모두 거짓이면 「안쪽으로 미끄러진다」.
 */
export interface CaptionFlags {
  tilt: boolean;
  round: boolean;
  flat: boolean;
  out: boolean;
  /** 지금 기울기, 소수 한 자리 문자열. */
  deg: string;
  /** 기우는 목표 기울기, 소수 한 자리 문자열. */
  to: string;
}

/**
 * 누적 상태. 원본의 `st` 를 그대로 옮기고, 조작기가 쓰는 자리와 고정 걸음 적립을 더했다.
 */
export interface BankedCurveState {
  /** 손으로 경사각을 정했는가. 「자동으로 보기」 단추가 이 경로로 보인다. */
  manual: boolean;
  /** 자동 시도 번호 (`ATTEMPTS` 의 인덱스). */
  idx: number;
  phase: Phase;
  /** 지금 단계가 시작된 뒤 흐른 시간(초). */
  phaseT: number;
  /** 지금 기울기(도). */
  deg: number;
  fromDeg: number;
  toDeg: number;
  car: Car;
  /** 이번 시도의 결과 — 시도를 시작할 때 미리 계산해 둔다. */
  outcome: Outcome;
  /** 길을 벗어난 쪽. 한 바퀴를 돌았거나 아직 달리는 중이면 null. */
  exitSide: 'out' | 'in' | null;
  /** 이번 시도의 자취. */
  trail: readonly (readonly [number, number])[];
  /** 지난 시도들의 자취. 한 순환이 끝나면 비운다. */
  past: readonly PastTrail[];
  /** 위에서 본 차의 불투명도. 벗어난 뒤 흐려진다. */
  alpha: number;

  /** 러너의 걸음을 고정 걸음으로 쪼개고 남은 시간(초). */
  acc: number;

  /** 경사각 슬라이더 값. 자동일 때는 `step` 이 지금 기울기로 맞춘다. */
  slider: number;
  /** 마지막으로 본 슬라이더 값 — 바뀌었을 때만 손으로 정한 것으로 친다. */
  sliderSeen: number;
  /** 슬라이더를 잡고 있는가. 러너가 적는다. */
  held: boolean;
  /** 「자동으로 보기」 누름. 러너가 true 를 적고, 소비한 걸음에서 `step` 이 지운다. */
  pressed: boolean;

  caption: CaptionFlags;
}

/** 위에서 본 좌표를 적분 변수에서 맞춘다. 원본 `syncXY`. */
export function syncXY(c: Car): Car {
  const psi = Math.PI / 2 - c.phi;
  const vphi = c.L / c.r;
  return {
    ...c,
    x: c.r * Math.cos(psi),
    y: c.r * Math.sin(psi),
    // 속도 = ṙ r̂ + vφ φ̂, ψ 가 줄어드는 방향이 앞
    vx: c.rd * Math.cos(psi) + vphi * Math.sin(psi),
    vy: c.rd * Math.sin(psi) - vphi * Math.cos(psi),
  };
}

/** 길 가운데에서 막 출발하는 차. 원본 `freshCar` + `syncXY`. */
export function freshCar(): Car {
  return syncXY({ r: R0, rd: 0, phi: 0, L: R0 * V, x: 0, y: 0, vx: 0, vy: 0 });
}

export function initialState(): BankedCurveState {
  // 원본은 t = 0 에 0° 길을 이미 달리고 있다 (tilt 없이 run 으로 연다).
  // 결과와 캡션은 첫 걸음에서 `step` 이 채운다 — 여기서는 0° 의 결과가 'out' 이라는 것만 안다.
  const car = freshCar();
  const deg = ATTEMPTS[0]!;
  const degText = deg.toFixed(1);
  return {
    manual: false,
    idx: 0,
    phase: 'run',
    phaseT: 0,
    deg,
    fromDeg: deg,
    toDeg: deg,
    car,
    outcome: 'out',
    exitSide: null,
    trail: [[car.x, car.y]],
    past: [],
    alpha: 1,
    acc: 0,
    slider: Number(degText),
    sliderSeen: Number(degText),
    held: false,
    pressed: false,
    caption: { tilt: false, round: false, flat: true, out: false, deg: degText, to: degText },
  };
}
