// ========================================================================
// stopping-distance — 순수 물리
// ========================================================================
// 상수를 담지 않는다. 감속도와 반응 시간은 선언(stage.constants)에서 오고, 차의
// 목록도 scene 이 넘긴다 — 그래야 schema 가 이 파일의 식을 빌려 쓸 수 있다
// (`TOTAL_MAX` 는 도로 띠의 길이이자 90 km/h 의 정지 거리다).
//
// **적분 정확성이 주장의 일부다.** 원본은 오일러 대신 사다리꼴로 적분하고 마지막
// 조각 스텝에서 남은 거리를 v²/2a 로 정확히 채워, 화면의 띠 길이와 띠 안의 숫자가
// 어긋나지 않게 했다. 등가속에서 사다리꼴 적분은 정확하므로 그 누적의 결과는
// x = v₀τ − ½aτ² (상한 v₀²/2a) 와 소수점까지 같다. 여기서는 그 결과를 시각의
// 함수로 쓴다 — `step` 은 시계를 받지 못해서 누적판을 쓰면 시간표(선언)와 별개의
// 시계가 조각 안에 생긴다 (S-piece).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';

import type { StoppingDistanceState } from './state';

/** km/h → m/s. */
const KMH_TO_MS = 1 / 3.6;

export interface StoppingConstants {
  /** 제동 감속도(m/s²). */
  decel: number;
  /** 반응 시간(초). */
  reactTime: number;
}

export function speedOf(kmh: number): number {
  return kmh * KMH_TO_MS;
}

/** 반응 거리 = 속력 × 반응 시간. 속력에 **비례**한다. */
export function reactDistanceOf(kmh: number, c: StoppingConstants): number {
  return speedOf(kmh) * c.reactTime;
}

/** 제동 거리 = v²/2a. 속력의 **제곱**에 비례한다. */
export function brakeDistanceOf(kmh: number, c: StoppingConstants): number {
  const v = speedOf(kmh);
  return (v * v) / (2 * c.decel);
}

/** 브레이크가 걸린 뒤 서기까지 걸리는 시간 = v/a. */
export function brakeTimeOf(kmh: number, c: StoppingConstants): number {
  return speedOf(kmh) / c.decel;
}

/** 정지 거리 = 반응 거리 + 제동 거리. */
export function totalDistanceOf(kmh: number, c: StoppingConstants): number {
  return reactDistanceOf(kmh, c) + brakeDistanceOf(kmh, c);
}

export function readConstants(stage: StageDef): StoppingConstants {
  const k = (stage.constants ?? {}) as Record<string, number>;
  return { decel: k.a ?? 6, reactTime: k.tReact ?? 1 };
}

/** 한 대의 지금 모습. 모두 주기 안 시각 `u` 의 함수다. */
export interface CarReading {
  id: string;
  kmh: number;
  /** 레인 — 원본 캔버스의 차 중심 y(px). */
  lanePx: number;
  /** 앞범퍼 위치(m). 위험 발견 지점이 0 이고 접근 구간에서는 음수다. */
  x: number;
  reactDist: number;
  brakeDist: number;
  /**
   * 반응 구간 자취의 끝(m). 반응이 끝나기 전에는 차가 곧 끝이고, 끝난 뒤에는
   * 그 순간의 위치에 고정된다 — 그래서 붉은 띠가 여기서부터 이어 자란다.
   */
  reactTrailEnd: number;
  /** 브레이크가 걸렸는가. 걸린 뒤 설 때까지만 참이다(브레이크등). */
  braking: boolean;
  /** 선 뒤 흐른 시간(초). 아직 서지 않았으면 `null`. */
  stoppedFor: number | null;
}

/** `lanePx` 를 갖는 차의 선언. 목록은 schema 가 갖는다. */
export interface CarDef {
  id: string;
  kmh: number;
  lanePx: number;
}

/**
 * 세 대의 지금 모습. 단계 경계는 **선언에서 읽는다** — 상수로 두고 `if (u < B1)` 로
 * 가르지 않는다 (S-piece).
 *
 * - 접근·반응: 등속. 브레이크는 아직 걸리지 않았다.
 * - 제동: x = 반응거리 + v₀τ − ½aτ², τ ≥ v₀/a 이면 반응거리 + v₀²/2a 에서 멈춘다.
 */
export function readings(
  cars: readonly CarDef[],
  c: StoppingConstants,
  tl: TimelineFrame,
): CarReading[] {
  const tDiscover = tl.end('approach');
  const tBrake = tl.end('react');
  const u = tl.u;

  return cars.map((car) => {
    const v0 = speedOf(car.kmh);
    const reactDist = reactDistanceOf(car.kmh, c);
    const brakeDist = brakeDistanceOf(car.kmh, c);
    const brakeTime = brakeTimeOf(car.kmh, c);

    if (u < tBrake) {
      // 발견 지점 뒤에서 달려온다. 발견 시각에 정확히 0 을 지난다.
      const x = v0 * (u - tDiscover);
      return {
        id: car.id,
        kmh: car.kmh,
        lanePx: car.lanePx,
        x,
        reactDist,
        brakeDist,
        reactTrailEnd: x,
        braking: false,
        stoppedFor: null,
      };
    }

    const tau = u - tBrake;
    const stopped = tau >= brakeTime;
    const x = stopped ? reactDist + brakeDist : reactDist + v0 * tau - 0.5 * c.decel * tau * tau;
    return {
      id: car.id,
      kmh: car.kmh,
      lanePx: car.lanePx,
      x,
      reactDist,
      brakeDist,
      reactTrailEnd: reactDist,
      braking: !stopped && tau > 0,
      stoppedFor: stopped ? tau - brakeTime : null,
    };
  });
}

/** 쌓는 상태가 없다 — 세 대의 위치가 모두 시각의 함수다. */
export function step(params: { state: StoppingDistanceState }): StoppingDistanceState {
  return params.state;
}
