import type { ControllerSpec, Vec2 } from '@aperi21/schema';

import { PROBE_Y_RANGE } from './schema';
import { probePos } from './state';

/** 관찰 높이 붙임 점 — 막 가운데 세로 열, 끌기 범위 안을 막 높이 1/200 간격으로. */
const SNAP_COUNT = 200;
const PROBE_COLUMN: readonly Vec2[] = Array.from({ length: SNAP_COUNT + 1 }, (_, k) =>
  probePos(PROBE_Y_RANGE[0] + ((PROBE_Y_RANGE[1] - PROBE_Y_RANGE[0]) * k) / SNAP_COUNT),
);

/**
 * 관찰점을 세로로 끈다.
 *
 * 다른 색 띠의 스펙트럼도 독자가 직접 확인하게 한다. 자동 진행만으로도 주장은 일어난다.
 * 원본은 막 **또는 두께 단면** 어디든 세로로 끌면 옮겨 갔다 — 엔진은 손잡이 둘레만 잡혀
 * 고리를 잡아야 한다 (NOTES 「어휘 부족」).
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'probe-drag',
    type: 'point-drag',
    binds: { pos: 'pos', held: 'held' },
    grabRadius: 16,
    snapTo: PROBE_COLUMN,
    handle: 'ring',
  },
];
