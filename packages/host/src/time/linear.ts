import type { BundleSchema } from '@aperi21/schema';
import type {
  TimeEngine,
  TimeEngineEvent,
  TimeEngineEventHandler,
  TimeEngineEventPayload,
  TimeEngineState,
} from './engine';

/**
 * 선형 시간 엔진. real-world dt 를 받아 simulation time 을 전진시킨다.
 * Bundle state 는 건드리지 않으며 "이번 프레임 전진 여부" 만 책임진다.
 * tick() 은 전진에 쓸 dt (running 이면 realDt * speed, 그 외는 0) 를 반환한다.
 */
export class LinearTimeEngine implements TimeEngine {
  readonly mode: BundleSchema['timeModel'] = 'linear';

  private _state: TimeEngineState = 'idle';
  private _currentTime = 0;
  private _speed = 1;
  private readonly listeners = new Map<TimeEngineEvent, Set<TimeEngineEventHandler>>();

  get state(): TimeEngineState {
    return this._state;
  }

  get currentTime(): number {
    return this._currentTime;
  }

  get speed(): number {
    return this._speed;
  }

  start(): void {
    if (this._state === 'running') return;
    this._currentTime = 0;
    this.transition('running', 0);
  }

  pause(): void {
    if (this._state === 'running') this.transition('paused', 0);
  }

  resume(): void {
    if (this._state === 'paused') this.transition('running', 0);
    else if (this._state === 'idle') this.start();
  }

  reset(): void {
    this._currentTime = 0;
    this.transition('idle', 0);
  }

  seek(t: number): void {
    this._currentTime = Math.max(0, t);
    this.emit('tick', { state: this._state, currentTime: this._currentTime, dt: 0 });
  }

  markTerminated(): void {
    if (this._state === 'terminated') return;
    this.transition('terminated', 0);
    this.emit('terminated', { state: 'terminated', currentTime: this._currentTime, dt: 0 });
  }

  setSpeed(factor: number): void {
    this._speed = Math.max(0, factor);
  }

  tick(realDt: number): number {
    if (this._state !== 'running') return 0;
    const dt = realDt * this._speed;
    this._currentTime += dt;
    this.emit('tick', { state: this._state, currentTime: this._currentTime, dt });
    return dt;
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

  private transition(next: TimeEngineState, dt: number): void {
    this._state = next;
    this.emit('state-change', { state: next, currentTime: this._currentTime, dt });
  }

  private emit(event: TimeEngineEvent, payload: TimeEngineEventPayload): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const h of set) h(payload);
  }
}
