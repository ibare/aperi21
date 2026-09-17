import type { StageDef } from '@aperi21/schema';

/**
 * 자동 진행은 시각의 함수라 상태가 없다 — 두 가열 · 상 띠 · 입자가 모두 시간표
 * (`schema.timeline`)에서 엔진이 넘기는 값으로 정해진다.
 *
 * 상태가 쌓이는 것은 **독자가 압력을 고른 뒤**뿐이다. 고른 압력마다 경계선 수와 가열
 * 길이가 달라져 시간표 선언으로 나눌 수 없고, `step` 은 시간표를 받지 못한다(NOTES G01 ·
 * G13). 그래서 고른 가열은 `step` 이 제 시계로 돌린다.
 */
export interface PhaseDiagramState {
  /** 조작기가 쓰는 로그 압력 0~1. */
  pressure: number;
  /** 조작기를 잡고 있는 동안 참 (`heldPath`). */
  held: boolean;
  /** 한 번이라도 압력을 골랐는가. 고른 뒤로는 자동 진행으로 돌아가지 않는다(원본과 같다). */
  manual: boolean;
  /** 고른 가열이 시작된 뒤 흐른 시간(초). 한 바퀴를 돌면 되감는다. */
  manualT: number;
  /** 고른 가열이 한 바퀴 이상 돌았는가 — 지난 경로가 고른 압력의 경로로 바뀐다. */
  looped: boolean;
  /** 캡션 슬롯의 `cases` 가 읽는 자리. 고른 가열 중 지금 문안 하나만 참이다. */
  cap: CaptionFlags;
}

export type CaptionName =
  | 'heatSolidHigh'
  | 'heatSolidLow'
  | 'melt'
  | 'heatLiquid'
  | 'boil'
  | 'sublimate'
  | 'twoCrossings'
  | 'skipped';

export type CaptionFlags = Record<CaptionName, boolean>;

export function noCaption(): CaptionFlags {
  return {
    heatSolidHigh: false,
    heatSolidLow: false,
    melt: false,
    heatLiquid: false,
    boil: false,
    sublimate: false,
    twoCrossings: false,
    skipped: false,
  };
}

/** 조작기는 원본처럼 높은 압력에서 시작한다. */
export function initialState(params: { stage: StageDef }): PhaseDiagramState {
  return {
    pressure: params.stage.constants['vHigh'] ?? 0,
    held: false,
    manual: false,
    manualT: 0,
    looped: false,
    cap: noCaption(),
  };
}
