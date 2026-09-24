// ========================================================================
// spin — 선언
// ========================================================================
// 질문: 스핀은 팽이처럼 도는 물체의 각운동량과 같은가.
//
// 고전 각운동량은 한 벡터라 z 성분과 x 성분을 **함께** 갖는다. z 로 걸러 위(↑)만 남긴 원자는
// 나중에 무엇을 거쳐도 z 성분이 위여야 한다. 실제 스핀은 그렇지 않다 —
//
//   1. z 로 거른 ↑ 를 다시 z 로 재면 모두 ↑ 다.
//   2. 가운데 장치를 x 로 돌려 재면 → 와 ← 가 반반이다.
//   3. 그 → 만 다시 z 로 재면 ↑ 와 ↓ 가 **다시 반반**이다 — 앞서 걸러 둔 z 정보가 지워졌다.
//
// 이웃과 겹치지 않는 자리 — `stern-gerlach` 는 한 번의 갈라짐(예상한 띠 ↔ 실제 두 점)을 다룬다.
// 이 조각은 갈라짐을 장치 셋으로 **이어** 연속 측정을 보인다. 장치 안의 휘는 길 · 스크린 자국은
// 되풀이하지 않고, 장치는 상자 도식으로, 결과는 통에 쌓이는 점 줄로 보인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:spin` 와 문자 그대로 일치한다 (C4). */
export const SPIN_ID = 'spin';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 원자의 갈래 · 보낸 시각을 뽑는 시드. 주기마다 (시드, 주기 번호, 부)로 새로 섞는다. */
export const SEED = 23;

/** 한 부(앞 · 뒤)마다 가마에서 보내는 원자 수. */
export const ATOM_COUNT = 64;

/** 원자가 도식 위를 가는 속력(월드 단위 / s, 화면 시간). */
export const ATOM_SPEED = 9;

/** 첫 장치(z)에서 ↑ 로 나오는 몫. 가마의 원자는 스핀 방향이 고르다. */
export const FIRST_UP_RATIO = 0.5;

/** z 로 거른 ↑ 를 다시 **같은 축(z)** 으로 잴 때 ↑ 로 나오는 몫. */
export const SAME_AXIS_UP_RATIO = 1;

/** 한 축으로 거른 것을 **수직인 축**으로 잴 때 + 로 나오는 몫(z↑ → x, x→ → z 둘 다). */
export const CROSS_AXIS_UP_RATIO = 0.5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 원자는 왼쪽에서 +x 로 가고, 위가 +y 다. 장치는 상자 도식이다 —
// 들어온 빔이 상자 가운데에서 + 출구(위)와 − 출구(아래) 둘로 갈라진다. x 로 잴 때도 도식에서는
// 위를 +(→), 아래를 −(←) 출구로 그린다.
// ------------------------------------------------------------------------

/** 가마 가운데. 첫 장치와 같은 높이다. */
export const OVEN_X = -16.6;
/** 장치 세 개의 왼쪽 · 오른쪽 끝. */
export const SG1_X0 = -14;
export const SG1_X1 = -10;
export const SG2_X0 = -7;
export const SG2_X1 = -3;
export const SG3_X0 = 0;
export const SG3_X1 = 4;
/** 출구가 가운데에서 위아래로 벌어진 거리. 다음 장치는 앞 장치의 + 출구 높이에 가운데를 둔다. */
export const PORT_SPLIT = 0.7;
/** 장치 상자의 세로 반높이. */
export const SG_HALF = 1;
/** 첫 장치의 가운데 높이 — 셋을 이은 빔이 위로 두 번 올라가 전체가 가운데에 오도록. */
export const SG1_Y = -0.7;
/** 첫 장치 − 출구를 막는 막대의 자리. */
export const STOP_X = -9.2;
/** 통(쌓인 점 줄) — 셋째 장치 뒤 두 통의 왼쪽 끝, 가운데 장치 − 출구 통의 왼쪽 끝과 높이. */
export const BIN_X = 5;
export const MID_BIN_X = -0.9;
export const MID_BIN_Y = -1.9;
/** 가운데 장치 − 출구에서 곧게 나간 뒤 통으로 꺾이기까지의 거리(월드) — 출구 옆 표식과 길이 겹치지 않게. */
export const MID_KNEE = 0.9;
/** 통 안 점 간격(월드) · 줄 수. 한 통이 담는 점 수 = 열 × 줄. */
export const DOT_PITCH = 0.3;
export const BIN_ROWS = 2;
export const BIN_COLS = 16;

/** 프레이밍 — 가마부터 오른쪽 통 끝까지, 아래로 캡션 띠(장부 G24). */
export const SCENE_BOUNDS = { minX: -18, maxX: 10.8, minY: -3.9, maxY: 2.5 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 앞부 — 가운데 장치가 z. 원자를 보내는 동안 · 마지막 원자가 통에 닿기까지 · 머묾. */
export const SAME = 5.0;
export const SAME_LAND = 3.2;
export const SAME_HOLD = 1.8;
/** 앞부 통이 비워지고 가운데 장치가 z 에서 x 로 돌아가는 동안. */
export const TURN = 0.9;
/** 뒷부 — 가운데 장치가 x. 보내는 동안 · 마지막 원자가 닿기까지 · 머묾 · 흐려짐(가운데 장치가 z 로 돌아온다). */
export const CROSS = 5.0;
export const CROSS_LAND = 3.2;
export const HOLD = 3.6;
export const FADE = 0.9;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const spinMessages = Object.freeze({
  'label.title': { ko: '스핀', en: 'Spin' },
  'label.operation': {
    ko: '고전 대응물이 없는 각운동량',
    en: 'Angular momentum with no classical counterpart',
  },
  'label.stage': { ko: '은 원자 빔 · 장치 셋', en: 'Silver atom beam through three magnets' },
  'label.view': { ko: '이어 놓은 장치 도식', en: 'Chained magnets, schematic' },
  'label.oven': { ko: '은 원자', en: 'silver atoms' },
  /** 장치가 재는 축 · 스핀 표식 — 도형에 새긴 기호라 번역하지 않는다 (C1 판정 1 · 3). */
  'mark.z': { ko: 'z', en: 'z' },
  'mark.x': { ko: 'x', en: 'x' },
  'mark.up': { ko: '↑', en: '↑' },
  'mark.down': { ko: '↓', en: '↓' },
  'mark.right': { ko: '→', en: '→' },
  'mark.left': { ko: '←', en: '←' },
  'caption.same': {
    ko: '↑ 만 걸러 낸 원자를 다시 z 로 재면, 모두 ↑ 로 나온다',
    en: 'Atoms filtered to ↑ and measured along z again all come out ↑',
  },
  'caption.turn': {
    ko: '가운데 장치를 x 로 돌린다',
    en: 'The middle magnet is turned to measure along x',
  },
  'caption.cross': {
    ko: 'x 로 재면 → 와 ← 로 반반, 그 → 를 다시 z 로 재면 ↑ 와 ↓ 로 반반 갈린다',
    en: 'Along x they split half → and half ←; measuring that → along z splits it half ↑ and half ↓',
  },
  'caption.erased': {
    ko: '걸러 낸 ↑ 가 x 를 거치자 지워졌다 — 마지막 z 에서 ↓ 가 다시 나왔다',
    en: 'Passing through x wiped out the filtered ↑ — ↓ shows up again at the last z',
  },
} satisfies Record<string, LocalizedText>);

export type SpinMessageKey = keyof typeof spinMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SpinMessageKey): LocalizedText => spinMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SpinMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const spinSchema: BundleSchema = {
  id: SPIN_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에 「같은 축 → 모두 ↑」 와 「x 를 거치면 ↓ 가 되살아남」 을 차례로 보인다.
  parameters: [],

  stages: [
    {
      id: 'three-magnets',
      label: text('label.stage'),
      constants: {
        seed: SEED,
        atomCount: ATOM_COUNT,
        atomSpeed: ATOM_SPEED,
        firstUpRatio: FIRST_UP_RATIO,
        sameAxisUpRatio: SAME_AXIS_UP_RATIO,
        crossAxisUpRatio: CROSS_AXIS_UP_RATIO,
      },
    },
  ],

  environments: [],

  views: [{ id: 'chain', label: text('label.view'), default: true }],

  /** 가로로 긴 장치 한 줄과 캡션 한 줄. 세로가 비싸다 (S-piece PREFER). */
  canvas: { height: 260, minHeight: 240 },

  /** 겹침은 scene 에 쓴 순서 — 상자 · 통 위에 빔 길, 그 위에 원자, 맨 위에 표식. */
  drawOrder: 'scene',

  /**
   * 한 주기 = [앞부: 가운데 z] 보냄 → 닿음 → 머묾 → [돌림: 통 비움 · z→x] → [뒷부: 가운데 x] 보냄 → 닿음 →
   * 머묾 → 흐려짐(가운데가 z 로 돌아온다). `sameLand` · `crossLand` 는 가마에서 가장 먼 통까지 가는 시간
   * (약 2.9 초)보다 길게 둔다 (NOTES (c) G129).
   */
  timeline: {
    phases: [
      { id: 'same', duration: SAME, caption: key('caption.same') },
      { id: 'sameLand', duration: SAME_LAND, caption: key('caption.same') },
      { id: 'sameHold', duration: SAME_HOLD, caption: key('caption.same') },
      { id: 'turn', duration: TURN, ease: 'smooth', caption: key('caption.turn') },
      { id: 'cross', duration: CROSS, caption: key('caption.cross') },
      { id: 'crossLand', duration: CROSS_LAND, caption: key('caption.cross') },
      { id: 'hold', duration: HOLD, caption: key('caption.erased') },
      { id: 'fade', duration: FADE, ease: 'smooth', caption: key('caption.erased') },
    ],
  },

  /** 도착한 순간 원자들이 장치 셋을 지나고 있고, 오른쪽 ↑ 통에 점이 쌓이는 중이다. */
  startAt: 3.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 스핀의 정의 · 불확정성은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: spinMessages,
};
