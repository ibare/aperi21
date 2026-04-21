import type { Vec2 } from '@aperi21/schema';

/** Projectile Bundle 의 런타임 상태. */
export interface ProjectileState {
  /** 시뮬레이션 경과 시간 (초). */
  t: number;
  /** 현재 위치 (m). */
  pos: Vec2;
  /** 현재 속도 (m/s). */
  vel: Vec2;
  /** 지나온 궤적. 매 step 마다 기록. */
  history: Vec2[];
  /** 발사 단계. */
  phase: 'idle' | 'flying' | 'landed';
  /** 초기 조건 (런처/다이얼이 여기에 씀). */
  launch: { v0: number; theta: number };
  /** 착지 이벤트 flash 를 렌더러가 쓸 수 있도록 기록. */
  landedAt?: number;
}

export type Mutable<T> = { -readonly [K in keyof T]: T[K] };
