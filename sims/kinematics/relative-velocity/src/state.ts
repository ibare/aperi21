// ========================================================================
// relative-velocity — 런타임 상태
// ========================================================================
// 이 조각은 상태를 **누적한다.** 두 가지가 시각의 함수가 아니기 때문이다.
//
// 1. 관측자 위치 `Xobs` 는 적분이다. `x − u·t` 로 쓰면 기준틀이 변하는 동안
//    `t·du/dt` 만큼의 가짜 이동이 생겨 화면이 폭주한다 (원본이 겪고 고쳤다).
// 2. 지나온 길은 프레임마다 찍은 **사건의 목록**이다. 기준틀이 바뀌면 과거
//    사건마다 전단이 달라지므로 세계 좌표와 그때의 시각을 함께 들고 있어야 한다.
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import {
  observerAtRest,
  type ObserverFrame,
  type SpacetimeEvent,
} from '@aperi21/plugin-mechanics';

import { PHASE_AT_OPEN, PIER_L, TRIP_START_FRAC, VIEW_W } from './schema';

/** 지금 건너는 배 한 척. */
export interface Trip {
  /** 떠난 선착장의 세계 좌표 x. */
  readonly x0: number;
  /** 떠난 시각. */
  readonly tStart: number;
}

/** 막 끝난 항해의 자취. 0.45 초 동안 옅어지며 사라진다. */
export interface Ghost {
  readonly trail: readonly SpacetimeEvent[];
  /** 항해가 끝난 시각. */
  readonly deadAt: number;
}

export interface RelativeVelocityState {
  /**
   * 보는 사람의 기준틀 — 흘러온 자리 · 지금 속도 · 지금 시각.
   *
   * `frame.t` 가 이 조각의 시계다. 엔진 시계를 따로 들지 않는 것은 사건의
   * 전단항 `u·(t − tᵢ)` 이 이 `t` 와 같은 눈금이어야 하기 때문이다.
   */
  readonly frame: ObserverFrame;

  readonly trip: Trip;
  /** 지금 배가 지나온 사건들. 한 번 건널 때마다 비운다. */
  readonly trail: readonly SpacetimeEvent[];
  /** 0.4 초마다 하나씩 찍힌 자국. 항해마다 비운다. */
  readonly dots: readonly SpacetimeEvent[];
  readonly ghost: Ghost | null;

  // ---- 자동 순회와 손 조작의 이음매 ----
  /** 지금 자동 순회 중인가. */
  readonly auto: boolean;
  /** 마지막으로 손이 닿아 있던 시각. */
  readonly lastInput: number;
  /** 자동으로 돌아올 때 값을 섞는 진행도 1 → 0. */
  readonly blend: number;
  /** 섞기 시작할 때 독자가 놓아 둔 값. */
  readonly blendFrom: number;
  /** 순회의 위상. 손을 뗀 자리에서 순회를 이어 가려고 옮긴다. */
  readonly phaseOff: number;

  /** 조작기가 보는 자리. 자동일 때는 `step` 이 여기에 지금 값을 적어 슬라이더가 따라온다. */
  readonly ui: {
    /** 보는 사람의 속도(m/s). */
    readonly u: number;
    /** 독자가 슬라이더를 잡고 있는가. 러너가 적는다 (`ControllerInstance.heldPath`). */
    readonly held: boolean;
  };

  // ---- 캡션이 보는 자리 ----
  // 조건을 세는 것은 physics 이고, 선언(`schema.caption.cases`)은 그 결과가
  // 놓인 이 자리만 가리킨다 (원칙 2).

  /** 강둑에 서서 본다. */
  readonly atBank: boolean;
  /** 강물에 떠서 같이 흐르며 본다. */
  readonly atRiver: boolean;
  /** 강물을 거슬러 올라가며 본다. */
  readonly upstream: boolean;
  /** 강물보다 느리게 떠내려가며 본다. */
  readonly slower: boolean;
  /** 강물보다 빠르게 떠내려가며 본다. */
  readonly faster: boolean;
}

/**
 * 새 배가 떠날 선착장.
 *
 * 화면 왼쪽 1/3 즈음에 가장 가까운 말뚝을 고른다. **선착장 격자 위에서 고르므로
 * 어느 기준틀에서든 배가 화면 밖으로 밀려나지 않는다** — 배는 한 척이라 주기로
 * 만들 수 없어서, 주기인 것 위에 얹는다 (NOTES (c)).
 */
export function tripStartX(obsAt: number): number {
  return PIER_L * Math.round((obsAt + TRIP_START_FRAC * VIEW_W) / PIER_L);
}

export function initialState(_params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): RelativeVelocityState {
  return {
    frame: observerAtRest(0),
    trip: { x0: tripStartX(0), tStart: 0 },
    trail: [],
    dots: [],
    ghost: null,
    auto: true,
    lastInput: -Infinity,
    blend: 0,
    blendFrom: 0,
    phaseOff: PHASE_AT_OPEN,
    ui: { u: 0, held: false },
    atBank: true,
    atRiver: false,
    upstream: false,
    slower: false,
    faster: false,
  };
}
