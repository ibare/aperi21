// ========================================================================
// de-broglie-wavelength — 선언
// ========================================================================
// 질문: 입자의 물결 간격(물질파의 파장)은 무엇이 정하는가.
//
// 같은 전자 둘이 나란히 난다. 처음에는 속력도 물결 간격도 같다. 아래 전자만
// 고르게 밀어 두 배 빠르게 하면, 빨라지는 동안 그 전자의 물결이 촘촘해져서
// 다 빨라졌을 때는 위 물결 하나에 아래 물결 둘이 들어간다. λ = h/p 라서
// 같은 입자(같은 질량)는 속력에 반비례한다.
//
// 카메라가 전자를 따라간다 — 전자는 화면 가운데 머물고, 레인의 눈금이 전자의
// 속력으로 뒤로 흘러간다. 물결을 재려면 물결이 멈춰 있어야 하기 때문이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:de-broglie-wavelength` 와 문자 그대로 일치한다 (C4). */
export const DE_BROGLIE_WAVELENGTH_ID = 'de-broglie-wavelength';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 두 전자의 처음 속력(그림 단위). 위 전자는 끝까지 이 속력이다. */
export const V_SLOW = 1;
/**
 * 아래 전자가 다 빨라졌을 때 처음 속력의 몇 배인가. 이 조각이 바꾸는 유일한 수다.
 * 화면의 `2v` · `λ/2` 기호와 아래 레인에서 재는 칸 수가 이 값을 그대로 쓴다 — 정수로 둔다.
 */
export const SPEED_RATIO = 2;
/**
 * h/m 을 그림 단위로 키운 값 — 속력 1 일 때의 물결 간격(월드 단위)이다.
 * 실제 전자의 파장은 나노미터 아래라 그대로는 보이지 않는다. 배율은 화면에 알리지
 * 않는다(NOTES (b)). λ = hOverM / v 의 **꼴**만 보존한다.
 */
export const H_OVER_M = 1.2;
/**
 * 레인 눈금이 뒤로 흐르는 빠르기 — 속력 1 당 월드 단위/초. 카메라가 전자를 따라가므로
 * 속력은 이 흐름으로만 보인다. 두 레인이 같은 배율이라 흐름의 빠르기 비가 곧 속력 비다.
 */
export const TRACK_FLOW = 1.1;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 두 레인을 위아래로 둔다.
// ------------------------------------------------------------------------

/** 위 레인(기준 전자) · 아래 레인(빨라지는 전자)의 축 높이. */
export const LANE_REF_Y = 1.9;
export const LANE_FAST_Y = 0;

/** 물결 묶음의 높이(월드) · 폭(가우스 표준편차) · 그리는 반폭. 두 레인이 같다. */
export const PACKET_AMP = 0.36;
export const PACKET_SIGMA = 1.5;
export const PACKET_HALF = 3.3;

/** 전자 점의 반지름(월드). */
export const ELECTRON_R = 0.085;

/** 파장 치수선의 높이 — 레인 축 위로. 물결 마루보다 조금 위다. */
export const MEASURE_DY = 0.5;

/** 레인 눈금(흘러가는 바닥)의 높이 — 레인 축 아래로 — 와 눈금 간격 · 눈금 길이. */
export const TRACK_DY = -0.62;
export const TRACK_GAP = 0.5;
export const TRACK_TICK = 0.14;

/** 속도 화살표가 시작하는 자리(물결 묶음 앞) · 속력 → 길이 배율(월드 per 속력 1). */
export const SPEED_ARROW_X = 3.55;
export const SPEED_ARROW_SCALE = 0.5;

/** 레인 이름표(`e⁻`)의 가로 자리. 물결 묶음 뒤, 화면 왼쪽. */
export const ELECTRON_LABEL_X = -4.35;

/** 위 레인 마루 자리 안내선이 몇 λ 까지 가는가(양쪽). 묶음 반폭 안의 마루만 꿴다. */
export const GUIDE_REACH = 2;

/**
 * 프레이밍은 주장의 일부다. 가로는 흐르는 눈금 끝까지, 세로는 위 치수선 글자부터
 * 아래 레인 눈금과 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -5.1, maxX: 5.1, minY: -1.2, maxY: 2.75 } as const;

// ------------------------------------------------------------------------
// 시간표 길이 — 기본값. 물리는 이 상수를 보지 않고 시간표에게 묻는다.
// ------------------------------------------------------------------------

/** 둘이 같은 속력으로 나는 동안. */
export const TOGETHER = 2.4;
/** 아래 전자가 고르게 빨라지는 동안 — `linear` 이징이라 등가속이다. */
export const ACCELERATE = 2.4;
/** 다 빨라진 뒤 재어 보는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const COMPARE = 4;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const deBroglieWavelengthMessages = Object.freeze({
  'label.title': {
    ko: '드브로이 파장',
    en: 'de Broglie wavelength',
    ja: 'ド・ブロイ波長',
    zh: '德布罗意波长',
    ar: 'طول موجة دي بروي',
    es: 'Longitud de onda de De Broglie',
    fr: 'Longueur d’onde de de Broglie',
    hi: 'दे ब्रॉग्ली तरंगदैर्घ्य',
    id: 'Panjang gelombang de Broglie',
    pt: 'Comprimento de onda de de Broglie',
  },
  'label.operation': {
    ko: '물질의 파동성',
    en: 'The wave nature of matter',
    ja: '物質の波動性',
    zh: '物质的波动性',
    ar: 'الطبيعة الموجية للمادة',
    es: 'La naturaleza ondulatoria de la materia',
    fr: 'La nature ondulatoire de la matière',
    hi: 'द्रव्य की तरंग प्रकृति',
    id: 'Sifat gelombang materi',
    pt: 'A natureza ondulatória da matéria',
  },
  'label.stage': {
    ko: '전자 두 개',
    en: 'Two electrons',
    ja: '二つの電子',
    zh: '两个电子',
    ar: 'إلكترونان',
    es: 'Dos electrones',
    fr: 'Deux électrons',
    hi: 'दो इलेक्ट्रॉन',
    id: 'Dua elektron',
    pt: 'Dois elétrons',
  },
  'label.view': {
    ko: '따라가는 시점',
    en: 'Following view',
    ja: '追従視点',
    zh: '跟随视角',
    ar: 'منظر المتابعة',
    es: 'Vista de seguimiento',
    fr: 'Vue de suivi',
    hi: 'अनुसरण दृश्य',
    id: 'Tampilan mengikuti',
    pt: 'Vista de acompanhamento',
  },
  /** 전자 기호. 표식이다 (C1 판정 3). */
  'label.electron': {
    ko: 'e⁻',
    en: 'e⁻',
    ja: 'e⁻',
    zh: 'e⁻',
    ar: 'e⁻',
    es: 'e⁻',
    fr: 'e⁻',
    hi: 'e⁻',
    id: 'e⁻',
    pt: 'e⁻',
  },
  /** 속도 · 파장 기호. `{k}` 는 속력 배수 — 선언값을 그대로 끼운다. */
  'label.speedRef': {
    ko: 'v',
    en: 'v',
    ja: 'v',
    zh: 'v',
    ar: 'v',
    es: 'v',
    fr: 'v',
    hi: 'v',
    id: 'v',
    pt: 'v',
  },
  'label.speedFast': {
    ko: '{k}v',
    en: '{k}v',
    ja: '{k}v',
    zh: '{k}v',
    ar: '{k}v',
    es: '{k}v',
    fr: '{k}v',
    hi: '{k}v',
    id: '{k}v',
    pt: '{k}v',
  },
  'label.lambdaRef': {
    ko: 'λ',
    en: 'λ',
    ja: 'λ',
    zh: 'λ',
    ar: 'λ',
    es: 'λ',
    fr: 'λ',
    hi: 'λ',
    id: 'λ',
    pt: 'λ',
  },
  'label.lambdaFast': {
    ko: 'λ/{k}',
    en: 'λ/{k}',
    ja: 'λ/{k}',
    zh: 'λ/{k}',
    ar: 'λ/{k}',
    es: 'λ/{k}',
    fr: 'λ/{k}',
    hi: 'λ/{k}',
    id: 'λ/{k}',
    pt: 'λ/{k}',
  },
  'caption.together': {
    ko: '같은 전자 둘이 같은 속력으로 난다 — 물결 간격도 같다',
    en: 'Two identical electrons fly at the same speed — their wave spacing is the same too',
    ja: '同じ電子二つが同じ速さで飛ぶ — 波の間隔も同じだ',
    zh: '两个相同的电子以相同的速率飞行 — 波的间距也相同',
    ar: 'إلكترونان متماثلان يطيران بالسرعة نفسها — والمسافة بين موجاتهما متساوية أيضًا',
    es: 'Dos electrones idénticos vuelan con la misma rapidez — el espaciado de sus ondas también es el mismo',
    fr: 'Deux électrons identiques volent à la même vitesse — l’espacement de leurs ondes est le même aussi',
    hi: 'दो एक जैसे इलेक्ट्रॉन एक ही चाल से उड़ते हैं — उनकी तरंगों का अंतराल भी समान है',
    id: 'Dua elektron identik terbang dengan kelajuan yang sama — jarak antargelombangnya juga sama',
    pt: 'Dois elétrons idênticos voam com a mesma velocidade — o espaçamento de suas ondas também é o mesmo',
  },
  'caption.accelerate': {
    ko: '아래 전자만 빨라진다 — 빨라지는 만큼 물결 간격이 좁아진다',
    en: 'Only the lower electron speeds up — its waves crowd closer as it does',
    ja: '下の電子だけが速くなる — 速くなるにつれて波が詰まっていく',
    zh: '只有下方的电子加速 — 随着加速，它的波越挤越密',
    ar: 'الإلكترون السفلي وحده يتسارع — وتتقارب موجاته كلما تسارع',
    es: 'Solo el electrón de abajo acelera — sus ondas se apiñan a medida que lo hace',
    fr: 'Seul l’électron du bas accélère — ses ondes se resserrent à mesure',
    hi: 'केवल नीचे वाला इलेक्ट्रॉन तेज़ होता है — जैसे-जैसे वह तेज़ होता है, उसकी तरंगें पास-पास सिमटती जाती हैं',
    id: 'Hanya elektron bawah yang makin cepat — gelombangnya makin rapat seiring itu',
    pt: 'Só o elétron de baixo acelera — suas ondas se apertam à medida que ele acelera',
  },
  'caption.compare': {
    ko: '{k}배 빠른 전자의 파장은 1/{k} — 위 물결 하나에 아래 물결 {k}개가 들어간다',
    en: '{k}× as fast, 1/{k} the wavelength — {k} lower waves fit in one upper wave',
    ja: '速さ {k}× なら波長は1/{k} — 上の波一つに下の波が{k}個入る',
    zh: '速度为 {k}×，波长为1/{k} — 上方一个波里容纳下方{k}个波',
    ar: 'أسرع {k}×، وطول موجي 1/{k} — تتسع {k} موجات سفلية في موجة علوية واحدة',
    es: '{k}× más rápido, 1/{k} de la longitud de onda — {k} ondas de abajo caben en una de arriba',
    fr: '{k}× plus rapide, 1/{k} de la longueur d’onde — {k} ondes du bas tiennent dans une onde du haut',
    hi: '{k}× तेज़, तरंगदैर्घ्य 1/{k} — ऊपर की एक तरंग में नीचे की {k} तरंगें समा जाती हैं',
    id: '{k}× lebih cepat, panjang gelombang 1/{k} — {k} gelombang bawah muat dalam satu gelombang atas',
    pt: '{k}× mais rápido, 1/{k} do comprimento de onda — {k} ondas de baixo cabem em uma de cima',
  },
} satisfies Record<string, LocalizedText>);

export type DeBroglieWavelengthMessageKey = keyof typeof deBroglieWavelengthMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DeBroglieWavelengthMessageKey): LocalizedText => deBroglieWavelengthMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DeBroglieWavelengthMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const deBroglieWavelengthSchema: BundleSchema = {
  id: DE_BROGLIE_WAVELENGTH_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 바로 날고, 빨라지고, 재어 본다.
  parameters: [],

  stages: [
    {
      id: 'two-electrons',
      label: text('label.stage'),
      constants: {
        vSlow: V_SLOW,
        speedRatio: SPEED_RATIO,
        hOverM: H_OVER_M,
        trackFlow: TRACK_FLOW,
      },
    },
  ],

  environments: [],

  views: [{ id: 'following', label: text('label.view'), default: true }],

  /** 가로로 긴 두 레인뿐이다. 세로를 더 주면 가로가 먼저 차서 물결만 작아진다. */
  canvas: { height: 372, minHeight: 332 },

  /**
   * 겹침 순서를 scene 에 쓴 대로 둔다 — 안내선이 물결 **아래**로 지나가야 물결의
   * 마루가 안내선에 가려지지 않는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 같이 난다 → 아래만 빨라진다 → 재어 본다 → 흐려진다.
   * `accelerate` 는 `linear` — 진행도가 곧 속력의 비율이라 고르게 미는 힘(등가속)이다.
   */
  timeline: {
    phases: [
      { id: 'together', duration: TOGETHER, caption: key('caption.together') },
      { id: 'accelerate', duration: ACCELERATE, ease: 'linear', caption: key('caption.accelerate') },
      { id: 'compare', duration: COMPARE, caption: key('caption.compare') },
      { id: 'fade', duration: FADE, caption: key('caption.compare') },
    ],
  },

  /** 도착한 순간 이미 날고 있다 — 눈금이 흐르는 자리에서 연다. */
  startAt: 0.8,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — λ = h/p 는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 배수는 선언값 그대로 끼운다 — state 가 `speedRatio` 를 글자로 들고 있다 (G133 우회).
    vars: { k: 'k' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 재는 것은 거리가 아니라 **물결 수**라,
  // 거리 격자 대신 위 마루 자리를 꿰는 안내선이 자 노릇을 한다.

  messages: deBroglieWavelengthMessages,
};
