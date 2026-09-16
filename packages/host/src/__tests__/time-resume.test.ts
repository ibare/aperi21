/**
 * 시간 엔진의 계약만 잠근다. **러너를 부르지 않는다.**
 *
 * 러너가 실제로 되살리는지는 `embed-runtime.test.ts` 의 「종료된 조각을 되살리면
 * 시계가 다시 흐른다」가 잰다. 이 파일은 그 수정이 딛고 선 발판을 고정한다 —
 * `start()` 가 종료를 풀고 `currentTime` 을 **보존**한다는 것, 그리고 `reset()` 으로는
 * 대신할 수 없다는 것(시각이 0 으로 가면서도 여전히 안 흐른다).
 *
 * 뒤의 것이 이 파일이 있는 이유다. 러너 테스트는 「step 이 다시 불린다」까지만 보므로
 * 누가 `start()` 를 `reset()` 으로 갈아 끼워도 통과한다. 그 갈아끼움을 막는 것이
 * 여기다 — 시각을 되돌릴지는 조각이 정할 일이고, `reset()` 은 시간표 단계와
 * `startAt` 앞당김까지 함께 지운다.
 */
import { describe, expect, it } from 'vitest';
import { createTimeEngine, LinearTimeEngine } from '../index';

describe('종료된 시계는 start() 로 다시 흐른다', () => {
  it('종료하면 tick 이 0 을 돌려준다 — step 이 안 불리는 원인', () => {
    const e = new LinearTimeEngine();
    e.start();
    expect(e.tick(0.1)).toBeGreaterThan(0);
    e.markTerminated();
    expect(e.state).toBe('terminated');
    expect(e.tick(0.1)).toBe(0);
  });

  it('start() 가 종료를 풀고 시각은 그대로 둔다', () => {
    const e = new LinearTimeEngine();
    e.start();
    e.tick(0.25);
    const atEnd = e.currentTime;
    expect(atEnd).toBeGreaterThan(0);

    e.markTerminated();
    e.start();

    expect(e.state).toBe('running');
    // 되돌아가지 않는다 — 시각을 되돌릴지는 조각이 정한다.
    expect(e.currentTime).toBeCloseTo(atEnd);
    expect(e.tick(0.1)).toBeGreaterThan(0);
  });

  it('reset() 으로는 대신할 수 없다 — 시각이 0 으로 가고 여전히 안 흐른다', () => {
    const e = new LinearTimeEngine();
    e.start();
    e.tick(0.25);
    e.markTerminated();

    e.reset();

    expect(e.currentTime).toBe(0);
    expect(e.tick(0.1)).toBe(0);
  });

  it('quasistatic 처럼 linear 로 폴백하는 모드도 같다', () => {
    const e = createTimeEngine('quasistatic');
    e.start();
    e.tick(0.2);
    e.markTerminated();
    e.start();
    expect(e.tick(0.1)).toBeGreaterThan(0);
  });
});
