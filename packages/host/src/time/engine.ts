import type { BundleSchema } from '@aperi21/schema';

export type TimeEngineState = 'idle' | 'running' | 'paused' | 'terminated';

export type TimeEngineEvent =
  | 'tick'
  | 'state-change'
  | 'terminated'
  /** steady_state 등에서 "재해석 필요" 신호. payload.dt 는 0. */
  | 'invalidate';

export type TimeEngineEventHandler = (payload: TimeEngineEventPayload) => void;

export interface TimeEngineEventPayload {
  state: TimeEngineState;
  currentTime: number;
  dt: number;
}

/**
 * MVP 에서 구체적으로 구현되는 세 모드. BundleSchema.timeModel 의 9개 값 중
 * 현재 호스트가 매핑하는 실행 모드.
 */
export type TimeEngineMode = 'linear' | 'static' | 'steady_state';

export interface TimeEngine {
  readonly mode: BundleSchema['timeModel'];
  readonly state: TimeEngineState;
  readonly currentTime: number;
  readonly speed: number;

  start(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  seek(t: number): void;
  markTerminated(): void;
  setSpeed(factor: number): void;

  /**
   * 한 프레임 분 real-world dt 를 받아 시뮬레이션이 전진해야 할 dt 를 반환.
   * linear 는 running 일 때 실제 dt, static 은 항상 0, steady_state 는
   * 명시적 invalidate() 가 호출된 직후 한 번만 비-0 을 반환한다.
   */
  tick(realDt: number): number;

  /**
   * steady_state 에서 파라미터/토폴로지가 바뀌었음을 알리는 트리거.
   * 다른 엔진은 no-op.
   */
  invalidate?(): void;

  on(event: TimeEngineEvent, handler: TimeEngineEventHandler): () => void;
}
