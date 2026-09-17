import { autoSweep, derive, readPhases } from './physics';
import { spacetimeDiagramSchema } from './schema';

/**
 * 자동 진행은 시간표의 함수라 상태가 필요 없다. 상태를 쌓는 것은 **조작 모드**뿐이다 —
 * 독자가 속도 조작기를 만지면 자동 순환을 멈추고, 현재 속도가 목표 속도로 부드럽게
 * 다가가며, 그 속도로 계속 훑는다(원본 `manual`). 그 다가감이 누적 적분이다.
 */
export interface SpacetimeDiagramState {
  /** 조각 시계(초). 엔진 시계와 같은 값 — `startAt` 위에서 출발해 `dt` 를 쌓는다. */
  clock: number;
  /** 조작기를 잡고 있는 동안 true (러너가 적는다, `heldPath`). */
  held: boolean;
  /** 한 번이라도 조작했으면 true. 자동 순환으로 돌아가지 않는다(원본과 같다). */
  manual: boolean;
  /** 지금 관찰자 속도 v/c. */
  beta: number;
  /** 조작 모드의 목표 속도 v/c. */
  target: number;
  /** 조작 모드에 들어온 시각. 훑기 주기의 기준. */
  since: number;
  /** 조작기가 읽고 쓰는 값. 자동 진행 중에는 자동 속도를 따라간다. */
  slider: number;
  /** 캡션 `{v}` 자리 — 속도의 크기, 소수 둘째 자리 고정. */
  speedText: string;
  /** 조작 모드에서 캡션을 고르는 조건. 자동 진행 중에는 모두 false(시간표가 고른다). */
  manualCaption: { changing: boolean; rest: boolean; right: boolean; left: boolean };
}

/** 도착한 순간(`startAt`)의 자동 진행 상태. */
export function initialState(): SpacetimeDiagramState {
  const clock = spacetimeDiagramSchema.startAt ?? 0;
  const beta = autoSweep(readPhases(clock)).beta;
  return derive({ clock, held: false, manual: false, beta, target: beta, since: clock, slider: beta });
}
