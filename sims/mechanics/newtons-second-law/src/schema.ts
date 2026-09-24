// ========================================================================
// newtons-second-law — 선언
// ========================================================================
// 질문: 힘을 두 배로 하면 속도가 두 배가 되는가.
//
// 아니다. 두 배가 되는 것은 **1초마다 붙는 속도**다. 같은 수레 셋을 1·2·3배 힘으로
// 동시에 밀면, 속도 막대에 1초마다 쌓이는 칸의 수는 같고 칸의 크기가 1:2:3 이다.
//
// 값은 모두 원본(tasks/piece-lab/newtons-second-law/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:newtons-second-law` 와 문자 그대로 일치한다 (C4). */
export const NEWTONS_SECOND_LAW_ID = 'newtons-second-law';

// ------------------------------------------------------------------------
// 운동 — 원본 상수
// ------------------------------------------------------------------------

/** 줄마다 가하는 힘(질량 1 이라 곧 가속도). */
export const FORCES: readonly number[] = [1, 2, 3];
/** 미는 시간(s). 시간표 `push` 단계 길이와 같다. */
export const RUN = 4;
/** 끝난 모습을 보여 주는 시간(s). 시간표 `hold` 단계 길이와 같다. */
export const HOLD = 1.4;
/** 도착한 순간 이미 1초째 진행 중. */
export const OFFSET = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const newtonsSecondLawMessages = Object.freeze({
  'label.title': { ko: '가속도 법칙', en: "Newton's second law" },
  'label.operation': { ko: '알짜힘·질량·가속도의 관계', en: 'Net force, mass and acceleration' },
  'label.stage': { ko: '수레 셋', en: 'Three carts' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 줄 이름 — 무엇을 바꿨는지. */
  'label.force': { ko: '힘 {f}배', en: 'force ×{f}' },
  /** 줄 이름 — 아래 막대가 무엇인지. */
  'label.velocity': { ko: '속도', en: 'velocity' },
  'caption.push': {
    ko: '같은 수레를 2배, 3배 힘으로 밀면 1초마다 붙는 속도(막대 한 칸)도 2배, 3배다.',
    en: 'Push the same cart 2 or 3 times harder and the speed gained each second (one block) is 2 or 3 times larger.',
  },
  'caption.hold': {
    ko: '4초 동안 쌓인 칸은 셋 모두 넷 — 다른 것은 칸 하나의 크기뿐이다.',
    en: 'After 4 s every bar has four blocks — only the size of a block differs.',
  },
} satisfies Record<string, LocalizedText>);

export type NewtonsSecondLawMessageKey = keyof typeof newtonsSecondLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: NewtonsSecondLawMessageKey): LocalizedText => newtonsSecondLawMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: NewtonsSecondLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const newtonsSecondLawSchema: BundleSchema = {
  id: NEWTONS_SECOND_LAW_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 자동 진행만으로 1:2:3 이 드러난다.
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본은 그림 880 × 270 + 캔버스 밖 캡션 한 줄이었다. 캡션이 캔버스 안(화면 고정
   * 줄)으로 들어오고 러너가 사방에 여백을 두므로 그만큼 더 잡는다.
   */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 원본은 `(t + 1) mod 5.4` 로 시계를 1초 앞당겨 열었다 — 첫 칸이 막 찬 모습부터
   * 보인다. 모든 것이 시각의 함수라 시계를 옮기는 것으로 충분하다.
   */
  startAt: OFFSET,

  /** 한 주기 5.4 s — 밀기 4 → 멈춘 모습 1.4. 끝나면 처음(밀기 0초)으로 돌아간다. */
  timeline: {
    phases: [
      { id: 'push', duration: RUN, caption: key('caption.push') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
    ],
  },

  // 원본이 그린 순서대로 겹친다 — 선로 · 매초 자리 · 수레 · 힘 · 막대.
  drawOrder: 'scene',

  // 슬롯 하나. 원본의 캔버스 아래 캡션 자리 — 왼쪽 한 줄, 15px, 짙은 회색.
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 비교는 세 줄이 같은 출발선·같은 축척을
   * 공유하는 것으로 충분하다 — 눈금을 깔면 동사가 칸이 쌓이는 일에서 숫자 읽기로
   * 옮겨 간다.
   */

  messages: newtonsSecondLawMessages,
};
