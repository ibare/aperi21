import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 자동으로 내려갔다 올라오는 한 주기(16 초)가 물 밖 · 일부 잠김 · 다 잠김 세 상태를 모두
 * 지나며 주장을 마친다. 원본에도 조작기가 없었다.
 */
export const controllers: readonly ControllerSpec[] = [];
