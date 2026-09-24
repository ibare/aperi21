// ========================================================================
// impedance-mismatch — 선언
// ========================================================================
// 질문: 가벼운 줄에 다른 줄을 이어 붙이면, 이음매에 닿은 펄스는 얼마나 되돌아오는가.
//
// 답: 두 줄이 얼마나 다르냐가 정한다. 반사 진폭 비는 r = (Z1 − Z2)/(Z1 + Z2),
// 투과 진폭 비는 t = 2Z1/(Z1 + Z2) 다. 같은 줄이면(Z2 = Z1) 하나도 돌아오지 않고,
// 무거운 줄일수록 더 많이 — **뒤집혀서** — 돌아온다. 이웃 `reflection-of-waves` 의
// 고정단(r = −1)은 이 식에서 Z2 → ∞ 인 끝이다.
//
// 화면에서는 같은 펄스를 실은 세 줄을 위아래로 둔다. 왼쪽 절반은 모두 같은 가벼운 줄이고,
// 이음매 너머 오른쪽 줄만 다르다(Z2/Z1 = 1 · 3 · 9). 되돌아온 몫은 「전부 뒤집혀
// 돌아왔다면」 의 점선 윤곽을 얼마나 채우느냐로 보인다. 색으로 가르지 않는다 (S-piece).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:impedance-mismatch` 와 문자 그대로 일치한다 (C4). */
export const IMPEDANCE_MISMATCH_ID = 'impedance-mismatch';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 1 단위 = 줄 위 거리 한 단위. 줄의 왼쪽 끝이 x = 0, 이음매가 x = J.
// ------------------------------------------------------------------------

/** 가벼운 줄 위 파동의 빠르기(월드/초). 무거운 줄에서는 Z1/Z2 배로 느려진다. */
export const WAVE_SPEED = 2.6;
/** 펄스 높이(월드). 세 줄에 같은 펄스를 싣는다. */
export const PULSE_AMPLITUDE = 0.4;
/** 펄스 폭(월드) — 가우스 꼴 `A·exp(−(d/w)²)` 의 w. */
export const PULSE_WIDTH = 0.45;
/** 펄스가 처음 서는 자리가 줄 왼쪽 끝에서 바깥으로 떨어진 거리(월드). 줄 밖에서 들어온다. */
export const PULSE_ENTRY = 1.3;
/** 이음매 자리(월드 x) — 가벼운 줄의 길이. */
export const JUNCTION_X = 5;
/** 이어 붙인 줄의 길이(월드). */
export const TAIL_LENGTH = 5;
/** 세 줄의 임피던스 비 Z2/Z1 — 위에서부터. 1 이면 같은 줄을 이은 것이다. */
export const RATIO_TOP = 1;
export const RATIO_MIDDLE = 3;
export const RATIO_BOTTOM = 9;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 세 줄의 평형 높이(월드 y) — 위 · 가운데 · 아래. */
export const LANE_Y = [1.3, 0, -1.3] as const;
/** 줄 이름표가 줄 오른쪽 끝에서 떨어진 거리(월드). */
export const LANE_LABEL_GAP = 0.35;
/** 머리 이름표(들어오는 줄 · 이음매 · 이어 붙인 줄)의 높이(월드 y). */
export const HEADER_Y = 2.15;
/** 이음매 안내선이 위 줄 위 · 아래 줄 밑으로 뻗는 길이(월드). */
export const JUNCTION_GUIDE_OVERHANG = 0.55;

/**
 * 프레이밍 — 왼쪽은 줄 왼쪽 끝, 오른쪽은 줄 이름표, 위는 머리 이름표, 아래는 캡션 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -0.3, maxX: 12.4, minY: -2.55, maxY: 2.4 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const impedanceMismatchMessages = Object.freeze({
  'label.title': {
    ko: '임피던스 부정합',
    en: 'Impedance mismatch',
    ja: 'インピーダンス不整合',
    zh: '阻抗失配',
    ar: 'عدم تطابق الممانعة',
    es: 'Desacoplamiento de impedancias',
    fr: 'Désadaptation d’impédance',
    hi: 'प्रतिबाधा बेमेल',
    id: 'Ketidakcocokan impedansi',
    pt: 'Descasamento de impedância',
  },
  'label.operation': {
    ko: '경계에서 반사되는 비율',
    en: 'How much reflects at a boundary',
    ja: '境界でどれだけ反射するか',
    zh: '在边界处反射多少',
    ar: 'كم ينعكس عند الحد الفاصل',
    es: 'Cuánto se refleja en una frontera',
    fr: 'Quelle part se réfléchit à une frontière',
    hi: 'सीमा पर कितना परावर्तित होता है',
    id: 'Seberapa banyak yang dipantulkan di batas',
    pt: 'Quanto se reflete numa fronteira',
  },
  'label.stage': {
    ko: '다른 줄을 이은 세 줄',
    en: 'Three strings, three joins',
    ja: '3本のひも、3つの継ぎ目',
    zh: '三根绳，三个接点',
    ar: 'ثلاثة أوتار وثلاث وصلات',
    es: 'Tres cuerdas, tres uniones',
    fr: 'Trois cordes, trois jonctions',
    hi: 'तीन डोरियाँ, तीन जोड़',
    id: 'Tiga tali, tiga sambungan',
    pt: 'Três cordas, três junções',
  },
  'label.view': {
    ko: '나란한 세 줄',
    en: 'Three strings side by side',
    ja: '三本のひもを並べて',
    zh: '并排的三根绳',
    ar: 'ثلاثة أوتار جنبًا إلى جنب',
    es: 'Tres cuerdas lado a lado',
    fr: 'Trois cordes côte à côte',
    hi: 'साथ-साथ तीन डोरियाँ',
    id: 'Tiga tali berdampingan',
    pt: 'Três cordas lado a lado',
  },

  /** 머리 이름표 — 왼쪽 절반과 오른쪽 절반이 무엇인지. */
  'label.incoming': {
    ko: '들어오는 줄 · Z₁',
    en: 'Incoming string · Z₁',
    ja: '入射側のひも · Z₁',
    zh: '入射绳 · Z₁',
    ar: 'الوتر الوارد · Z₁',
    es: 'Cuerda de llegada · Z₁',
    fr: 'Corde d’arrivée · Z₁',
    hi: 'आने वाली डोरी · Z₁',
    id: 'Tali datang · Z₁',
    pt: 'Corda de chegada · Z₁',
  },
  'label.junction': {
    ko: '이음매',
    en: 'Join',
    ja: '継ぎ目',
    zh: '接点',
    ar: 'الوصلة',
    es: 'Unión',
    fr: 'Jonction',
    hi: 'जोड़',
    id: 'Sambungan',
    pt: 'Junção',
  },
  'label.tail': {
    ko: '이어 붙인 줄 · Z₂',
    en: 'Attached string · Z₂',
    ja: 'つないだひも · Z₂',
    zh: '接上的绳 · Z₂',
    ar: 'الوتر الموصول · Z₂',
    es: 'Cuerda unida · Z₂',
    fr: 'Corde raccordée · Z₂',
    hi: 'जोड़ी गई डोरी · Z₂',
    id: 'Tali sambungan · Z₂',
    pt: 'Corda emendada · Z₂',
  },

  /** 줄 이름표. 세 줄을 가르는 것은 색이 아니라 이 이름과 줄의 굵기다. */
  'label.ratioSame': {
    ko: 'Z₂ = Z₁',
    en: 'Z₂ = Z₁',
    ja: 'Z₂ = Z₁',
    zh: 'Z₂ = Z₁',
    ar: 'Z₂ = Z₁',
    es: 'Z₂ = Z₁',
    fr: 'Z₂ = Z₁',
    hi: 'Z₂ = Z₁',
    id: 'Z₂ = Z₁',
    pt: 'Z₂ = Z₁',
  },
  'label.ratio': {
    ko: 'Z₂ = {ratio} Z₁',
    en: 'Z₂ = {ratio} Z₁',
    ja: 'Z₂ = {ratio} Z₁',
    zh: 'Z₂ = {ratio} Z₁',
    ar: 'Z₂ = {ratio} Z₁',
    es: 'Z₂ = {ratio} Z₁',
    fr: 'Z₂ = {ratio} Z₁',
    hi: 'Z₂ = {ratio} Z₁',
    id: 'Z₂ = {ratio} Z₁',
    pt: 'Z₂ = {ratio} Z₁',
  },
  'label.sameNote': {
    ko: '같은 줄',
    en: 'same string',
    ja: '同じひも',
    zh: '相同的绳',
    ar: 'الوتر نفسه',
    es: 'misma cuerda',
    fr: 'même corde',
    hi: 'वही डोरी',
    id: 'tali yang sama',
    pt: 'mesma corda',
  },
  'label.heavierNote': {
    ko: '더 무거운 줄',
    en: 'heavier string',
    ja: 'より重いひも',
    zh: '更重的绳',
    ar: 'وتر أثقل',
    es: 'cuerda más pesada',
    fr: 'corde plus lourde',
    hi: 'अधिक भारी डोरी',
    id: 'tali lebih berat',
    pt: 'corda mais pesada',
  },
  'label.lighterNote': {
    ko: '더 가벼운 줄',
    en: 'lighter string',
    ja: 'より軽いひも',
    zh: '更轻的绳',
    ar: 'وتر أخف',
    es: 'cuerda más ligera',
    fr: 'corde plus légère',
    hi: 'अधिक हल्की डोरी',
    id: 'tali lebih ringan',
    pt: 'corda mais leve',
  },

  'caption.approach': {

    ko: '같은 펄스가 세 줄을 따라 이음매로 달려간다 — 셋 다 위로 솟아 있다.',

    en: 'The same pulse runs along all three strings toward the join — all bulge upward.',

    ja: '同じパルスが3本のひもを継ぎ目へ向かって進む — どれも上に盛り上がっている。',

    zh: '同一个脉冲沿三根绳向接点跑去 — 三个都向上凸起。',

    ar: 'تجري النبضة نفسها على الأوتار الثلاثة نحو الوصلة — كلها منتفخة إلى الأعلى.',

    es: 'El mismo pulso recorre las tres cuerdas hacia la unión — todos sobresalen hacia arriba.',

    fr: 'La même impulsion parcourt les trois cordes vers la jonction — toutes bombées vers le haut.',

    hi: 'वही स्पंद तीनों डोरियों पर जोड़ की ओर दौड़ता है — तीनों ऊपर की ओर उभरे हैं।',

    id: 'Pulsa yang sama merambat di ketiga tali menuju sambungan — semuanya menonjol ke atas.',

    pt: 'O mesmo pulso percorre as três cordas rumo à junção — todos se erguem para cima.',

  },
  'caption.split': {
    ko: '이음매에서 펄스가 둘로 나뉜다 — 일부는 건너가고 일부는 되돌아온다.',
    en: 'At the join the pulse splits in two — part crosses over, part turns back.',
    ja: '継ぎ目でパルスが2つに分かれる — 一部は渡り、一部は戻ってくる。',
    zh: '在接点处脉冲一分为二 — 一部分越过去，一部分折返。',
    ar: 'عند الوصلة تنقسم النبضة إلى اثنتين — جزء يعبر وجزء يرتد.',
    es: 'En la unión el pulso se divide en dos — una parte cruza y otra se devuelve.',
    fr: 'À la jonction, l’impulsion se scinde en deux — une partie passe, une partie revient.',
    hi: 'जोड़ पर स्पंद दो भागों में बँट जाता है — कुछ पार हो जाता है, कुछ लौट आता है।',
    id: 'Di sambungan, pulsa terbelah dua — sebagian menyeberang, sebagian berbalik.',
    pt: 'Na junção o pulso se divide em dois — uma parte atravessa, outra volta.',
  },
  'caption.depart': {
    ko: '같은 줄에서는 아무것도 돌아오지 않는다. 무거운 줄일수록 뒤집힌 펄스가 점선(전부 돌아왔을 때)을 더 많이 채운다.',
    en: 'Nothing comes back on the uniform string. The heavier the join, the more the flipped pulse fills the dashed outline of a full return.',
    ja: '一様なひもでは何も戻ってこない。つないだひもが重いほど、反転したパルスが「すべて戻った場合」の点線の輪郭を多く満たす。',
    zh: '均匀的绳上什么也没有返回。接上的绳越重，翻转的脉冲就越多地填满“全部返回”时的虚线轮廓。',
    ar: 'لا يعود شيء على الوتر المتجانس. كلما كانت الوصلة أثقل، ملأت النبضة المقلوبة قدرًا أكبر من المحيط المتقطع للعودة الكاملة.',
    es: 'En la cuerda uniforme no vuelve nada. Cuanto más pesada la unión, más llena el pulso invertido el contorno punteado de un retorno completo.',
    fr: 'Rien ne revient sur la corde uniforme. Plus la jonction est lourde, plus l’impulsion retournée remplit le contour en pointillés d’un retour complet.',
    hi: 'एकसमान डोरी पर कुछ भी वापस नहीं आता। जोड़ जितना भारी, उलटा स्पंद पूरी वापसी की बिंदुदार रूपरेखा को उतना अधिक भरता है।',
    id: 'Pada tali seragam tidak ada yang kembali. Makin berat sambungannya, makin banyak pulsa terbalik mengisi garis putus-putus pantulan penuh.',
    pt: 'Na corda uniforme nada volta. Quanto mais pesada a junção, mais o pulso invertido preenche o contorno tracejado de um retorno completo.',
  },
} satisfies Record<string, LocalizedText>);

export type ImpedanceMismatchMessageKey = keyof typeof impedanceMismatchMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: ImpedanceMismatchMessageKey): LocalizedText => impedanceMismatchMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ImpedanceMismatchMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const impedanceMismatchSchema: BundleSchema = {
  id: IMPEDANCE_MISMATCH_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 세 비를 나란히 두어 자동 진행만으로 비교가 끝난다.
  parameters: [],

  stages: [
    {
      id: 'three-joins',
      label: text('label.stage'),
      constants: {
        waveSpeed: WAVE_SPEED,
        amplitude: PULSE_AMPLITUDE,
        pulseWidth: PULSE_WIDTH,
        entry: PULSE_ENTRY,
        junctionX: JUNCTION_X,
        tailLength: TAIL_LENGTH,
        ratioTop: RATIO_TOP,
        ratioMiddle: RATIO_MIDDLE,
        ratioBottom: RATIO_BOTTOM,
      },
    },
  ],

  environments: [],

  views: [{ id: 'strings', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 세 줄이 위아래로 선다. 세로는 머리 이름표 · 세 줄 · 캡션 두 줄이면 된다. */
  canvas: { height: 420, minHeight: 380 },

  /** 안내선 · 점선 윤곽을 먼저, 줄을 그 위에 — 점선의 평평한 부분이 줄에 가려진다. */
  drawOrder: 'scene',

  /**
   * 한 주기 5.446 초(조각 시계). 펄스 자리는 시각에 비례한다 — `s = −entry + waveSpeed · u`.
   * 단계는 캡션과 느린 재생 구간을 고를 뿐 펄스를 움직이지 않는다. 그래서 단계 길이를 고쳐도
   * 펄스가 튀지 않고, 캡션이 펄스와 어긋날 뿐이다.
   *
   * - `approach` — 펄스 중심이 `−entry` 에서 `J − 1.1` 까지(5.2 / 2.6 = 2 초).
   * - `splitIn` · `splitOut` — `J − 1.1` 에서 `J + 1.1` 까지(2.2 / 2.6 = 0.846, 반씩). 펄스가
   *   이음매와 겹친 동안이라 **느리게 보여 준다**(`timeScale` 0.35 → 화면에서 약 2.4 초).
   *   캡션은 한 문장이다. 둘로 나눈 것은 점선 윤곽이 `splitOut` 에서 나타나게 하려는 것 —
   *   되돌아온 몫이 이음매를 떠나는 때다. 윤곽이 나타나는 이징이 `splitOut` 의 `ease` 다.
   * - `depart` — 되돌아온 몫이 줄 왼쪽 밖으로 나갈 때까지(5.2 / 2.6).
   * - `rest` — 줄 왼쪽이 잠잠한 사이.
   *
   * 단계 길이가 거리 ÷ 빠르기와 맞아야 캡션이 펄스와 맞는다. 그 관계를 선언할 자리가 없어
   * 여기 적는다(장부 G129 · G13).
   */
  timeline: {
    phases: [
      { id: 'approach', duration: 2, caption: key('caption.approach') },
      { id: 'splitIn', duration: 0.423, timeScale: 0.35, caption: key('caption.split') },
      { id: 'splitOut', duration: 0.423, timeScale: 0.35, ease: 'smooth', caption: key('caption.split') },
      { id: 'depart', duration: 2, caption: key('caption.depart') },
      { id: 'rest', duration: 0.6, caption: key('caption.depart') },
    ],
  },

  /** 도착한 순간 펄스가 이미 세 줄 위를 달리고 있다 (S-piece). */
  startAt: 0.8,

  /** 슬롯 하나. 아래 줄 밑 왼쪽. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 640,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 보는 것은 되돌아온 펄스가 점선을
  // 얼마나 채우고 어느 쪽으로 솟았는지이고, 거리 눈금은 다른 질문을 부른다.

  messages: impedanceMismatchMessages,
};
