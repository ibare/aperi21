import type { BundleSchema } from '@aperi21/schema';

export type TimeEngineState = 'idle' | 'running' | 'paused' | 'terminated';

export type TimeEngineEvent = 'tick' | 'state-change' | 'terminated';

export type TimeEngineEventHandler = (payload: TimeEngineEventPayload) => void;

export interface TimeEngineEventPayload {
  state: TimeEngineState;
  currentTime: number;
  dt: number;
}

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

  tick(realDt: number): number;

  on(event: TimeEngineEvent, handler: TimeEngineEventHandler): () => void;
}
