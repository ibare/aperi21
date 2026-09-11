import type { ControllerSpec } from '@aperi21/schema';
import { RE_TRACK, SPEED_RANGE } from './schema';

/**
 * 레이놀즈 수 눈금을 직접 끈다. 문턱(2300) 근처를 오래 들여다보거나, 값을 오가며
 * 흔들림이 잦아드는지 커지는지를 직접 겪게 한다.
 *
 * 트랙은 그림 속 눈금과 같은 자리이고, 범위는 눈금의 Re 범위를 유속 단위로 옮긴 것이다
 * (Re 는 유속에 비례한다). 손을 뗀 뒤의 복귀는 physics.ts `step` 이 한다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 're-scale',
    type: 'scale-drag',
    binds: { value: 'v', held: 'held' },
    track: { pos: [RE_TRACK.x0, RE_TRACK.y], direction: [1, 0], size: RE_TRACK.length },
    range: [SPEED_RANGE[0], SPEED_RANGE[1]],
  },
];
