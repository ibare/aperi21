import type { BundleSchema } from '@aperi21/schema';
import type {
  TimeEngine,
  TimeEngineEvent,
  TimeEngineEventHandler,
  TimeEngineEventPayload,
  TimeEngineState,
} from './engine';

/**
 * steady_state 엔진 — 파라미터·토폴로지 변경 시에만 "한 프레임 분" dt 를
 * 전진시킨다. docs/06 §6, docs/08 §Phase4 에서 요구.
 *
 * 사용 패턴:
 *   - Embed 가 파라미터를 바꾸면 invalidate() 호출.
 *   - 다음 tick(realDt) 에서 realDt (양수) 를 반환 → Bundle.step 이 1회 실행.
 *   - 이후 tick 은 다시 0 을 반환 (재계산 완료).
 */
export class SteadyStateTimeEngine implements TimeEngine {
  readonly mode: BundleSchema['timeModel'] = 'steady_state';

  private _state: TimeEngineState = 'idle';
  private _currentTime = 0;
  private _speed = 1;
  private _dirty = true;
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
    this._dirty = true;
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
    this._currentTime = 0;
    this._dirty = true;
    this.transition('idle');
  }

  seek(t: number): void {
    this._currentTime = Math.max(0, t);
    this._dirty = true;
  }

  markTerminated(): void {
    if (this._state === 'terminated') return;
    this.transition('terminated');
    this.emit('terminated', { state: 'terminated', currentTime: this._currentTime, dt: 0 });
  }

  setSpeed(factor: number): void {
    this._speed = Math.max(0, factor);
  }

  invalidate(): void {
    this._dirty = true;
    this.emit('invalidate', {
      state: this._state,
      currentTime: this._currentTime,
      dt: 0,
    });
  }

  tick(realDt: number): number {
    if (this._state !== 'running' || !this._dirty) return 0;
    const dt = Math.max(realDt, 0) * this._speed;
    this._currentTime += dt;
    this._dirty = false;
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

  private transition(next: TimeEngineState): void {
    if (this._state === next) return;
    this._state = next;
    this.emit('state-change', { state: next, currentTime: this._currentTime, dt: 0 });
  }

  private emit(event: TimeEngineEvent, payload: TimeEngineEventPayload): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const h of set) h(payload);
  }
}
