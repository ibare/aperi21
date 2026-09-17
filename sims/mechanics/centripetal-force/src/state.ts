import { FIRST_RELEASE_ANGLE, HOLD, OMEGA, RADIUS } from './schema';

/**
 * 누적 상태. 원본이 단계 기계를 손으로 돌리던 그대로다 — 묶임/놓임 단계와 단계 시작 뒤
 * 흐른 시간. 다시 묶일 때의 출발각은 몇 번째 놓임인지에서 역산한다(`schema.ts`
 * `FIRST_RELEASE_ANGLE`) — 주기마다 다른 각에서 놓인다.
 *
 * 좌표는 회전 중심 기준 월드(y 위).
 */
export interface CentripetalForceState {
  /** 줄에 묶인 공의 각(라디안). */
  theta: number;
  /** 지금까지 놓은 횟수(자동 · 단추 모두). 다음 놓는 각을 고른다. */
  releases: number;
  /** 줄을 놓았는가. 캡션 슬롯의 `cases` 가 이 경로를 본다. */
  released: boolean;
  /** 지금 단계가 시작된 뒤 흐른 시간(초). 페이드와 단계 끝을 이것으로 잰다. */
  elapsed: number;
  /** 공의 자리. 묶였을 때는 각에서, 놓였을 때는 놓인 순간 속도로 적분. */
  pos: [number, number];
  /** 놓인 순간 공의 자리. */
  releasePos: [number, number];
  /** 놓인 순간 공의 속도(월드/초). */
  releaseVel: [number, number];
  /** 「지금 놓기」 누름. 러너가 true 를 적고, 소비한 걸음에서 `step` 이 지운다. */
  pressed: boolean;
}

export function initialState(): CentripetalForceState {
  // 첫 놓임(t = HOLD)이 원본과 같은 135° 가 되도록 거꾸로 잡은 출발각.
  const theta = FIRST_RELEASE_ANGLE - OMEGA * HOLD;
  const pos: [number, number] = [RADIUS * Math.cos(theta), RADIUS * Math.sin(theta)];
  return {
    theta,
    releases: 0,
    released: false,
    elapsed: 0,
    pos,
    releasePos: pos,
    releaseVel: [0, 0],
    pressed: false,
  };
}
