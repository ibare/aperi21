import type { BundleSchema } from '@aperi21/schema';
import type {
  TimeEngine,
  TimeEngineEvent,
  TimeEngineEventHandler,
  TimeEngineEventPayload,
  TimeEngineState,
} from './engine';

/**
 * 시간 축이 없는 Bundle 을 위한 엔진. currentTime 은 0 에 고정되며 tick 은
 * 항상 0 을 반환한다. Bundle.step 은 파라미터 변경 시에만 호출되도록 Embed
 * 쪽에서 처리한다 (static 모드 시 render loop 는 Scene Graph 만 재그린다).
 */
export class StaticTimeEngine implements TimeEngine {
  readonly mode: BundleSchema['timeModel'] = 'static';

  private _state: TimeEngineState = 'idle';
  private _speed = 1;
  private readonly listeners = new Map<TimeEngineEvent, Set<TimeEngineEventHandler>>();

  get state(): TimeEngineState {
    return this._state;
  }

  get currentTime(): number {
    return 0;
  }

  get speed(): number {
    return this._speed;
  }

  start(): void {
    this.transition('running');
  }

  pause(): void {
    if (this._state === 'running') this.transition('paused');
  }

  resume(): void {
    if (this._state === 'paused') this.transition('running');
    else if (this._state === 'idle') this.start();
  }

  reset(): void {
    this.transition('idle');
  }

  seek(): void {
    /* static 은 seek 무시. */
  }

  markTerminated(): void {
    if (this._state === 'terminated') return;
    this.transition('terminated');
    this.emit('terminated', { state: 'terminated', currentTime: 0, dt: 0 });
  }

  setSpeed(factor: number): void {
    this._speed = Math.max(0, factor);
  }

  tick(): number {
    return 0;
  }

  on(event: TimeEngineEvent, handler: TimeEngineEventHandler): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler);
    return () => {
      set!.delete(handler);
    };
  }

  private transition(next: TimeEngineState): void {
    if (this._state === next) return;
    this._state = next;
    this.emit('state-change', { state: next, currentTime: 0, dt: 0 });
  }

  private emit(event: TimeEngineEvent, payload: TimeEngineEventPayload): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const h of set) h(payload);
  }
}
