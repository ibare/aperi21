import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기를 두지 않는다.
 *
 * 자동 진행만으로 주장이 끝난다 — 한쪽만 흔들어 놓은 상태에서 흔들림이 옆으로 넘어갔다
 * 돌아오는 한 번이 전부다. 결합 세기 칩을 두면 「세게 이으면 빨리 넘어간다」 를 해 볼 수
 * 있지만, 시간표 단계 길이(반 맥놀이)가 상수를 따라가지 못해 캡션이 운동과 어긋난다
 * (NOTES 「어휘 부족」).
 */
export const controllers: readonly ControllerSpec[] = [];
