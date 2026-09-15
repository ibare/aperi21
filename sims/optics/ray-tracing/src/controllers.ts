import type { ControllerSpec } from '@aperi21/schema';

/**
 * 물체 거리 · 높이 · 초점 거리를 바꿔 상이 어떻게 움직이는지 보는 그림이라
 * 값 셋이 곧 조작이다. 렌즈·거울은 스테이지가 고른다.
 */
export const controllers: readonly ControllerSpec[] = [
  { id: 'params', type: 'param-panel' },
  { id: 'stages', type: 'stage-tabs' },
  { id: 'views', type: 'view-tabs' },
];
