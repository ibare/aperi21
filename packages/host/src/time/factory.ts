import type { BundleSchema } from '@aperi21/schema';
import { LinearTimeEngine } from './linear';
import { StaticTimeEngine } from './static';
import { SteadyStateTimeEngine } from './steady-state';
import type { TimeEngine, TimeEngineMode } from './engine';

/**
 * BundleSchema.timeModel 을 실행 엔진으로 매핑. MVP 는 linear·static·
 * steady_state 3 종만 실제 구현; 아직 매핑되지 않은 모드는 linear 로 폴백한다.
 */
export function createTimeEngine(mode: BundleSchema['timeModel'] | TimeEngineMode): TimeEngine {
  switch (mode) {
    case 'linear':
      return new LinearTimeEngine();
    case 'static':
      return new StaticTimeEngine();
    case 'steady_state':
      return new SteadyStateTimeEngine();
    default:
      return new LinearTimeEngine();
  }
}
