import type { ControllerSpec } from '@aperi21/schema';

/**
 * 회로도 자체는 스테이지가 정하고, 독자가 만지는 것은 값 셋(V · R1 · R2)이다.
 * 전용 조작기를 둘 대상이 없으므로 파라미터 상자가 유일한 조작 수단이다.
 *
 * 스테이지·뷰 탭은 고를 것이 셋·둘이라 둔다. 하나뿐이면 엔진이 그리지 않는다.
 */
export const controllers: readonly ControllerSpec[] = [
  { id: 'params', type: 'param-panel' },
  { id: 'stages', type: 'stage-tabs' },
  { id: 'views', type: 'view-tabs' },
];
