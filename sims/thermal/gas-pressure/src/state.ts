// ========================================================================
// gas-pressure — 런타임 상태
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { autoTemperature, createMolecules } from './physics';
import { MOLECULE_SEED, PREROLL_SECONDS } from './schema';

/**
 * 분자 하나.
 *
 * 속도를 **방향 단위벡터와 속력계수로 쪼개 둔다.** 온도가 바뀌면 속력만 다시
 * 정해지고 방향과 자리는 그대로라, 분자가 그 자리에서 빨라지거나 느려진다.
 * 궤도가 새로 뽑히면 "빨라졌다" 가 "달라졌다" 에 묻힌다.
 *
 * 이건 이 조각에 맞는 표현이지 일반 규약이 아니다 — 대부분의 조각은 속도를
 * 통째로 다룬다 (원본 NOTES 「누가 강제하면 안 되는 것」).
 */
export interface Molecule {
  /** 월드 좌표. */
  readonly x: number;
  readonly y: number;
  /** 진행 방향 단위벡터. 벽에 닿을 때마다 한 성분이 뒤집힌다. */
  readonly dx: number;
  readonly dy: number;
  /** 속력계수. 2차원 맥스웰 분포에서 뽑아 ⟨c²⟩ = 1 로 정규화한 뒤 고정. */
  readonly c: number;
}

/** 분자 하나가 재는 벽에 준 충격량. */
export interface WallHit {
  /** 맞은 시각(조각 시계, 초). */
  readonly t: number;
  /** 맞은 자리(월드 y). */
  readonly y: number;
  /** 충격량 2m|vx|. 질량은 1 로 둔다 — 비율만 주장에 관여한다. */
  readonly mag: number;
}

export interface GasPressureState {
  /** 조각 시계(초). 프리롤을 위해 `-PREROLL_SECONDS` 에서 출발한다. */
  readonly t: number;

  readonly molecules: readonly Molecule[];

  /**
   * 시간창 누적기 — 최근 `PRESSURE_WINDOW` 초 안의 두드림만 들고 있는다.
   *
   * 이 목록 하나가 두 곳으로 간다. **벽 바깥의 자국**(`trace`)과 **압력
   * 막대**(합)다. 같은 사건이 낱개와 합으로 동시에 보여야 "쌓인다" 가 화면에서
   * 일어난다.
   */
  readonly hits: readonly WallHit[];

  /** 지금 온도(K). 자동 진행이 정하거나, 잡힌 슬라이더가 정한다. */
  readonly temperature: number;

  /**
   * 압력 = 시간창 안 충격량의 합 / 창 (월드 길이로 환산).
   *
   * **평활하지 않는다.** 두드림이 도착하면 그만큼 툭 올라가고 창 밖으로 밀려나면
   * 그만큼 내려간다. 이 들썩임은 없애야 할 잡음이 아니라 주장 그 자체다.
   */
  readonly pressure: number;

  /** 온도 슬라이더가 쓰는 자리. `held` 는 러너가 잡는 동안 true 로 적는다. */
  readonly slider: {
    readonly temperature: number;
    readonly held: boolean;
  };

  /**
   * 한 번 잡으면 계속 수동이다. 자동으로 되돌리는 버튼은 두지 않았다 — 자동
   * 진행은 그 전에 이미 할 말을 마친다.
   */
  readonly manual: boolean;

  /** 캡션 슬롯의 `cases` 가 가리키는 자리. 조건을 세는 것은 physics 다 (원칙 2). */
  readonly caption: {
    readonly manualCold: boolean;
    readonly manualHot: boolean;
    readonly manualMid: boolean;
  };
}

export function initialState(_params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): GasPressureState {
  // 시계를 프리롤만큼 뒤로 물려 연다. 러너가 `schema.preroll` 초를 굴리고 나면
  // 조각 시계가 정확히 0 이 되어 엔진 시계와 맞는다. 시간표가 주기 함수라
  // 음수 시각도 그대로 정의된다 — 그 2 초는 직전 주기의 꼬리(식어 가는 구간)다.
  const t = -PREROLL_SECONDS;
  const temperature = autoTemperature(t);
  return {
    t,
    molecules: createMolecules(MOLECULE_SEED),
    hits: [],
    temperature,
    pressure: 0,
    slider: { temperature: Math.round(temperature), held: false },
    manual: false,
    caption: { manualCold: false, manualHot: false, manualMid: false },
  };
}
