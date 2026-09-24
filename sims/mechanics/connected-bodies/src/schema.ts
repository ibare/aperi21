// ========================================================================
// connected-bodies — 선언
// ========================================================================
// 질문: 앞 물체만 당기고 뒤 물체는 끈으로 끌려올 뿐인데, 가속도는 앞 물체가 정하는가
// 전체가 정하는가. 어느 쪽을 앞에 두느냐가 가속도를 바꾸는가.
//
// 아니다. 같은 6 N 으로 같은 3 kg 을 끌면 통째(3) · 가벼운 앞(1+2) · 무거운 앞(2+1)
// 세 줄이 같은 눈금을 같은 때 지나며 나란히 빨라진다.
//
// 값은 모두 원본(tasks/piece-lab/connected-bodies/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:connected-bodies` 와 문자 그대로 일치한다 (C4). */
export const CONNECTED_BODIES_ID = 'connected-bodies';

// ------------------------------------------------------------------------
// 운동 — 원본 상수
// ------------------------------------------------------------------------

/** 세 줄 모두에 가하는 바깥 힘(N). */
export const FORCE = 6;
/** 줄마다 앞(당기는 쪽)부터 뒤로 적은 질량(kg). 합은 모두 3. */
export const LANES: readonly (readonly number[])[] = [[3], [1, 2], [2, 1]];
/** 한 번 달리는 시간(s). 시간표 `run` 단계 길이와 같다. */
export const RUN = 3;
/** 도착한 순간 이미 달리는 중이도록 앞당긴 시각(s). */
export const PHASE = 1;
/** 같은 시각 눈금을 남기는 간격(s). */
export const STROBE = 0.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const connectedBodiesMessages = Object.freeze({
  'label.title': { ko: '연결된 물체', en: 'Connected bodies' },
  'label.operation': { ko: '함께 움직이는 계의 가속도', en: 'Acceleration of bodies moving together' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 물체에 새긴 질량 — 단위 표기(C1 표식)지만 값이 끼어들어 키로 둔다. */
  'label.mass': { ko: '{m} kg', en: '{m} kg' },
  /** 당기는 힘의 크기. */
  'label.force': { ko: '{f} N', en: '{f} N' },
  /** 캡션은 어느 시각에도 화면과 맞는 한 문장으로 고정한다(되감기 순간 포함). */
  'caption.run': {
    ko: '같은 6 N 으로 전체 3 kg 을 당긴다 — 끈으로 어떻게 나눠 이어도 한 덩어리와 같은 눈금을 같은 때 지나며 나란히 빨라진다',
    en: 'The same 6 N pulls the same 3 kg in total — however it is split and tied, it passes the same marks at the same moments as one block, speeding up side by side',
  },
} satisfies Record<string, LocalizedText>);

export type ConnectedBodiesMessageKey = keyof typeof connectedBodiesMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ConnectedBodiesMessageKey): LocalizedText => connectedBodiesMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ConnectedBodiesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const connectedBodiesSchema: BundleSchema = {
  id: CONNECTED_BODIES_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 세 줄이 가능한 나눔(통째 / 가벼운 앞 / 무거운 앞)을 이미 다 보여 준다.
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본은 그림 840 × 236 + 캔버스 밖 캡션 한 줄이었다. 캡션이 캔버스 안으로 들어오고
   * 러너가 사방에 여백을 두므로 그만큼 더 잡는다.
   */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 원본은 `(t + 1) mod 3` 으로 시계를 1초 앞당겨 열었다 — 도착하면 이미 눈금 셋이 있다.
   * 모든 것이 시각의 함수라 시계를 옮기는 것으로 충분하다.
   */
  startAt: PHASE,

  /** 한 주기 3 s — 달리기 하나. 끝나면 세 줄이 동시에 출발점으로 돌아가 다시 출발한다. */
  timeline: {
    phases: [{ id: 'run', duration: RUN, caption: key('caption.run') }],
  },

  // 원본이 그린 순서대로 겹친다 — 바닥 · 눈금 · 끈 · 물체 · 힘.
  drawOrder: 'scene',

  // 슬롯 하나. 원본의 캔버스 아래 캡션 자리 — 왼쪽, 15px, 짙은 글자.
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 비교는 세 줄의 눈금이 같은 x 에 서는 것으로 된다.

  messages: connectedBodiesMessages,
};
