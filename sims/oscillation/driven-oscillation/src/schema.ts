// ========================================================================
// driven-oscillation — 선언
// ========================================================================
// 질문: 용수철에 매단 추를 손으로 위아래로 흔들면, 추는 어떤 박자로 흔들리는가?
//
// 답: **손의 박자로** 흔들린다 — 제 고유 박자가 아니다. 그리고 손을 느리게 흔들면
// 추는 손을 따라 **같은 쪽**으로, 빠르게 흔들면 손과 **반대쪽**으로 움직인다.
//
// 화면에서는 같은 용수철 · 같은 추 두 벌이 나란히 흔들린다. 둘 다 오른쪽으로
// 흘러가는 기록지 위에 손과 추의 자국을 남긴다. 느린 쪽은 두 자국의 봉우리가
// 한 세로줄에 서고, 빠른 쪽은 손의 봉우리 아래에 추의 골이 온다.
//
// 공명 봉우리(고유 진동수 근처에서 진폭이 치솟는 것)는 이웃 조각 `resonance`
// 의 몫이라 여기서는 두 구동 진동수 모두 고유 진동수에서 멀리 둔다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:driven-oscillation` 와 문자 그대로 일치한다 (C4). */
export const DRIVEN_OSCILLATION_ID = 'driven-oscillation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 용수철-추의 고유 진동수(Hz). 두 레인이 같은 용수철 · 같은 추다. */
export const NATURAL_FREQ = 0.8;
/** 느린 손의 구동 진동수(Hz). 고유 진동수의 0.4 배. */
export const SLOW_FREQ = 0.32;
/** 빠른 손의 구동 진동수(Hz). 고유 진동수의 1.6 배. */
export const FAST_FREQ = 1.28;
/**
 * 손이 오르내리는 진폭(월드 단위). 두 손이 같다 — 다른 것은 박자뿐이다.
 *
 * 빠른 쪽을 2.5 배 이상으로 두면 추의 진폭이 손의 1/5 아래로 줄어 「반대로 움직인다」
 * 가 「거의 멈췄다」 로 읽혔다. 1.6 배에서 추 진폭이 손의 약 0.6 배다.
 */
export const HAND_AMPLITUDE = 0.22;
/** 감쇠비. 작게 둔다 — 위상차가 0 과 π 에 가까워야 「같이」 · 「반대로」 가 또렷하다. */
export const DAMPING_RATIO = 0.08;
/**
 * 기록지가 흘러가는 속도(월드 단위/초). 두 레인이 같다 — 같은 종이 속도라야
 * 자국의 물결 간격이 곧 박자다.
 */
export const PAPER_SPEED = 0.75;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 원점은 느린 레인 추가 쉬는 자리(중심).
// ------------------------------------------------------------------------

/** 두 레인의 매단 자리 x. */
export const LANE_X = { slow: 0, fast: 4.3 } as const;
/** 손(흔드는 막대)이 쉬는 높이 · 추가 쉬는 높이. */
export const HAND_REST_Y = 1.25;
export const MASS_REST_Y = 0;
/** 손 막대 반너비 · 반높이. */
export const HAND_HALF_W = 0.22;
export const HAND_HALF_H = 0.04;
/** 추 반너비 · 반높이. */
export const MASS_HALF_W = 0.13;
export const MASS_HALF_H = 0.12;
/** 기록지가 시작하는 자리(매단 자리에서 오른쪽으로)와 그 길이. */
export const PAPER_GAP = 0.32;
export const PAPER_LENGTH = 3.0;
/** 레인 이름을 두는 높이. */
export const LANE_TITLE_Y = 1.72;
/** 흐리게 물러난 레인의 불투명도. 지우지 않는다 — 두 레인은 견주는 짝이다. */
export const DIM_OPACITY = 0.3;

/**
 * 프레이밍 — 왼쪽은 느린 레인의 손, 오른쪽은 빠른 레인 기록지 끝의 이름표,
 * 아래는 캡션 줄. 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -0.4, maxX: 8.3, minY: -0.78, maxY: 1.86 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const drivenOscillationMessages = Object.freeze({
  'label.title': {
    ko: '강제 진동',
    en: 'Driven oscillation',
    ja: '強制振動',
    zh: '受迫振动',
    ar: 'التذبذب القسري',
    es: 'Oscilación forzada',
    fr: 'Oscillations forcées',
    hi: 'प्रणोदित दोलन',
    id: 'Osilasi paksa',
    pt: 'Oscilação forçada',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '외부 구동에 대한 응답',
    en: 'The response to an external drive',
    ja: '外部からの駆動への応答',
    zh: '对外部驱动的响应',
    ar: 'الاستجابة لقوة دافعة خارجية',
    es: 'La respuesta a un forzamiento externo',
    fr: 'La réponse à une excitation extérieure',
    hi: 'बाहरी प्रणोदन के प्रति अनुक्रिया',
    id: 'Tanggapan terhadap penggerak luar',
    pt: 'A resposta a uma excitação externa',
  },
  'label.stage': {
    ko: '손으로 흔드는 용수철',
    en: 'Spring shaken by hand',
    ja: '手で揺らすばね',
    zh: '用手摇动的弹簧',
    ar: 'نابض يُهزّ باليد',
    es: 'Resorte sacudido a mano',
    fr: 'Ressort secoué à la main',
    hi: 'हाथ से हिलाई गई स्प्रिंग',
    id: 'Pegas yang diguncang dengan tangan',
    pt: 'Mola sacudida com a mão',
  },
  'label.view': {
    ko: '두 박자',
    en: 'Two tempos',
    ja: '二つのテンポ',
    zh: '两种节拍',
    ar: 'إيقاعان',
    es: 'Dos ritmos',
    fr: 'Deux tempos',
    hi: 'दो लय',
    id: 'Dua tempo',
    pt: 'Dois ritmos',
  },

  /** 레인 이름. 두 레인을 가르는 것은 색이 아니라 이 이름이다. */
  'label.slowLane': {
    ko: '느리게 흔든다',
    en: 'Shaken slowly',
    ja: 'ゆっくり揺らす',
    zh: '慢慢摇',
    ar: 'هزّ بطيء',
    es: 'Sacudido despacio',
    fr: 'Secoué lentement',
    hi: 'धीरे हिलाया गया',
    id: 'Diguncang pelan',
    pt: 'Sacudida devagar',
  },
  'label.fastLane': {
    ko: '빠르게 흔든다',
    en: 'Shaken quickly',
    ja: '速く揺らす',
    zh: '快速摇',
    ar: 'هزّ سريع',
    es: 'Sacudido rápido',
    fr: 'Secoué rapidement',
    hi: 'तेज़ी से हिलाया गया',
    id: 'Diguncang cepat',
    pt: 'Sacudida rápido',
  },
  /** 기록지 끝의 자국 이름. */
  'label.hand': {
    ko: '손',
    en: 'Hand',
    ja: '手',
    zh: '手',
    ar: 'اليد',
    es: 'Mano',
    fr: 'Main',
    hi: 'हाथ',
    id: 'Tangan',
    pt: 'Mão',
  },
  'label.mass': {
    ko: '추',
    en: 'Mass',
    ja: 'おもり',
    zh: '物块',
    ar: 'الكتلة',
    es: 'Masa',
    fr: 'Masse',
    hi: 'पिंड',
    id: 'Beban',
    pt: 'Massa',
  },

  'caption.slow': {
    ko: '느리게 흔들면 추가 손을 따라 같은 쪽으로 오르내린다 — 손이 꼭대기일 때 추도 꼭대기다.',
    en: 'Shaken slowly, the mass follows the hand up and down — when the hand is at the top, so is the mass.',
    ja: 'ゆっくり揺らすと、おもりは手について上下する — 手がてっぺんのとき、おもりもてっぺんにある。',
    zh: '慢慢摇时，物块跟着手上下移动 — 手在最高处时，物块也在最高处。',
    ar: 'عند الهزّ ببطء تتبع الكتلة اليد صعودًا وهبوطًا — حين تكون اليد في الأعلى تكون الكتلة في الأعلى أيضًا.',
    es: 'Sacudido despacio, la masa sigue a la mano arriba y abajo — cuando la mano está arriba del todo, la masa también.',
    fr: 'Secouée lentement, la masse suit la main de haut en bas — quand la main est en haut, la masse l’est aussi.',
    hi: 'धीरे हिलाने पर पिंड हाथ के साथ ऊपर-नीचे चलता है — जब हाथ सबसे ऊपर होता है, तब पिंड भी सबसे ऊपर होता है।',
    id: 'Jika diguncang pelan, beban mengikuti tangan naik turun — saat tangan di puncak, beban juga di puncak.',
    pt: 'Sacudida devagar, a massa acompanha a mão para cima e para baixo — quando a mão está no alto, a massa também está.',
  },
  'caption.fast': {
    ko: '빠르게 흔들면 추가 손과 반대로 움직인다 — 손이 꼭대기일 때 추는 바닥에 있다.',
    en: 'Shaken quickly, the mass moves against the hand — when the hand is at the top, the mass is at the bottom.',
    ja: '速く揺らすと、おもりは手と逆に動く — 手がてっぺんのとき、おもりは底にある。',
    zh: '快速摇时，物块与手反向运动 — 手在最高处时，物块在最低处。',
    ar: 'عند الهزّ بسرعة تتحرك الكتلة عكس اليد — حين تكون اليد في الأعلى تكون الكتلة في الأسفل.',
    es: 'Sacudido rápido, la masa se mueve en contra de la mano — cuando la mano está arriba del todo, la masa está abajo del todo.',
    fr: 'Secouée rapidement, la masse va à l’encontre de la main — quand la main est en haut, la masse est en bas.',
    hi: 'तेज़ी से हिलाने पर पिंड हाथ के विपरीत चलता है — जब हाथ सबसे ऊपर होता है, तब पिंड सबसे नीचे होता है।',
    id: 'Jika diguncang cepat, beban bergerak berlawanan dengan tangan — saat tangan di puncak, beban di dasar.',
    pt: 'Sacudida rápido, a massa se move contra a mão — quando a mão está no alto, a massa está embaixo.',
  },
  'caption.both': {
    ko: '같은 용수철, 같은 추인데 흔들리는 박자가 다르다 — 추는 제 박자가 아니라 손의 박자로 흔들린다.',
    en: 'Same spring, same mass, different tempos — each mass swings to the beat of its hand, not its own.',
    ja: '同じばね、同じおもりなのに、揺れるテンポが違う — おもりは自分のテンポではなく、手のテンポで揺れる。',
    zh: '同样的弹簧、同样的物块，节拍却不同 — 每个物块都按手的节拍振动，而不是按自己的节拍。',
    ar: 'النابض نفسه والكتلة نفسها، لكن الإيقاع مختلف — كل كتلة تتأرجح على إيقاع يدها، لا على إيقاعها الخاص.',
    es: 'Mismo resorte, misma masa, ritmos distintos — cada masa oscila al compás de su mano, no al suyo propio.',
    fr: 'Même ressort, même masse, tempos différents — chaque masse oscille au rythme de sa main, pas au sien.',
    hi: 'वही स्प्रिंग, वही पिंड, फिर भी लय अलग — हर पिंड अपनी नहीं, अपने हाथ की लय पर झूलता है।',
    id: 'Pegas sama, beban sama, tempo berbeda — tiap beban berayun mengikuti irama tangannya, bukan iramanya sendiri.',
    pt: 'Mesma mola, mesma massa, ritmos diferentes — cada massa oscila no compasso da sua mão, não no próprio.',
  },
} satisfies Record<string, LocalizedText>);

export type DrivenOscillationMessageKey = keyof typeof drivenOscillationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DrivenOscillationMessageKey): LocalizedText => drivenOscillationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DrivenOscillationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const drivenOscillationSchema: BundleSchema = {
  id: DRIVEN_OSCILLATION_ID,
  label: text('label.title'),
  category: 'oscillation',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 두 박자를 나란히 두는 것으로 주장이 끝난다.
  parameters: [],

  stages: [
    {
      id: 'hand-shaken-spring',
      label: text('label.stage'),
      constants: {
        naturalFreq: NATURAL_FREQ,
        slowFreq: SLOW_FREQ,
        fastFreq: FAST_FREQ,
        handAmplitude: HAND_AMPLITUDE,
        dampingRatio: DAMPING_RATIO,
        paperSpeed: PAPER_SPEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'two-tempos', label: text('label.view'), default: true }],

  /**
   * 가로로 넓다 — 레인 둘이 옆으로 선다. 세로는 손에서 추까지 한 벌과 캡션 줄뿐이다.
   * 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 쓴 순서대로 겹친다 — 기록지 기준선 → 강조 세로줄 → 자국 → 용수철 → 손 · 추.
   * 층 순서로는 `trajectory`(강조 세로줄)가 자국 위로 올라와 자국을 끊는다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 흔들리는 중이다. 정상 상태 해라 첫 프레임부터 기록지가 차 있다. */
  startAt: 0.3,

  /**
   * 한 주기 19.2 초 — 느린 레인 → 빠른 레인 → 둘 다.
   *
   * - `slow` — 느린 레인이 또렷하고 빠른 레인은 물러나 있다.
   * - `to-fast` — 강조가 빠른 레인으로 옮겨 간다.
   * - `fast` — 빠른 레인이 또렷하다.
   * - `to-both` — 느린 레인이 다시 또렷해진다.
   * - `both` — 두 레인을 나란히 견준다. 박자가 다르다는 것이 여기서 드러난다.
   * - `to-slow` — 빠른 레인이 물러나며 처음으로 돌아간다.
   *
   * 흔들림 자체는 단계와 무관하게 조각 시계의 함수다 — 단계는 **어디를 보라** 만 정한다.
   */
  timeline: {
    phases: [
      { id: 'slow', duration: 6, caption: key('caption.slow') },
      { id: 'to-fast', duration: 0.6, ease: 'smooth', caption: key('caption.fast') },
      { id: 'fast', duration: 6, caption: key('caption.fast') },
      { id: 'to-both', duration: 0.6, ease: 'smooth', caption: key('caption.both') },
      { id: 'both', duration: 5.4, caption: key('caption.both') },
      { id: 'to-slow', duration: 0.6, ease: 'smooth', caption: key('caption.slow') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 14,
    wrapWidth: 780,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림에서 보는 것은 두 자국의
  // 봉우리가 한 세로줄에 서는지이고, 거리 눈금은 다른 질문을 끌어들인다 (S-piece).

  messages: drivenOscillationMessages,
};
