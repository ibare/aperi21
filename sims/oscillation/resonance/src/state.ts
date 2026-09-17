import { DRIVE, HISTORY, OSC, naturalHz } from './schema';

/**
 * 진동자 묶음은 감쇠 강제 진동을 적분해 쌓이는 상태다. 시각의 함수가 아니다.
 *
 * - `driveHz` — 슬라이더가 가리키는 구동 진동수(Hz). `step` 이 가장 가까운 진동자 번호로 붙인다.
 * - `z` · `v` — 진동자별 상대 변위 · 속도 (원본 `z` · `v`).
 * - `phase` — 구동 위상 누적 (원본 `phase`).
 * - `frames` — 걸음 수. 10 걸음마다 이력 한 줄 (원본 `frameCount`).
 * - `history` — 진폭 이력, 행 우선 · **첫 행이 지금**. 값은 공명 정상 진폭으로 나눠 1 로 자른 것
 *   (원본 폭포 버퍼의 k). `scalarField.values` 로 그대로 넘긴다.
 * - `acc` — 고정 걸음(1/60 초)을 맞추는 누적기. 실시간 dt 는 가변이다.
 */
export interface ResonanceState {
  driveHz: number;
  z: readonly number[];
  v: readonly number[];
  phase: number;
  frames: number;
  history: readonly number[];
  acc: number;
}

/** 정지 상태 · 빈 이력(그 전엔 흔들림이 없었다). 1 초 미리 진행은 선언(`preroll`)이 한다. */
export function initialState(): ResonanceState {
  return {
    driveHz: naturalHz(DRIVE.defaultIdx),
    z: new Array<number>(OSC.count).fill(0),
    v: new Array<number>(OSC.count).fill(0),
    phase: 0,
    frames: 0,
    history: new Array<number>(OSC.count * HISTORY.rows).fill(0),
    acc: 0,
  };
}
