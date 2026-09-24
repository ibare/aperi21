// ========================================================================
// work-function-and-threshold — 선언
// ========================================================================
// 질문: 전자가 튀어나오기 시작하는 진동수는 무엇이 정하고, 넘은 뒤에는 어떻게 자라는가.
//
// 답: 튀어나온 전자의 최대 운동 에너지(= 저지 전압)를 빛의 진동수에 대해 그리면
// 문턱 진동수 f₀ = φ/h 에서 시작하는 **직선**이 된다(Kmax = hf − φ). 금속을 바꾸면
// 일함수 φ 만큼 문턱이 옮겨 갈 뿐, 기울기 h 는 어느 금속이나 같다.
//
// 이웃 `photoelectric-effect` 는 금속판 · 램프 · 광자로 「세기가 아니라 진동수」 를 보인다.
// 이 조각은 그 화면을 되풀이하지 않고 **문턱과 기울기** 를 그래프 한 판으로 보인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:work-function-and-threshold` 와 문자 그대로 일치한다 (C4). */
export const WORK_FUNCTION_AND_THRESHOLD_ID = 'work-function-and-threshold';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 진동수는 10¹⁴ Hz 단위, 에너지는 eV.
// ------------------------------------------------------------------------

/** 일함수(eV) — 나트륨 · 구리. */
export const WORK_FUNCTION_NA = 2.3;
export const WORK_FUNCTION_CU = 4.7;
/** 플랑크 상수(eV / 10¹⁴ Hz) — 두 직선의 기울기다. 4.136×10⁻¹⁵ eV·s. */
export const PLANCK = 0.4136;
/**
 * 문턱 진동수(10¹⁴ Hz) — 화면에 띄우는 정박값이다. φ / h 를 유효숫자 셋으로 둔 값이라
 * 일함수나 h 를 바꾸면 이것도 함께 바꾼다. 어긋나면 `readConstants` 가 던진다 (장부 G143).
 */
export const THRESHOLD_NA = 5.6;
export const THRESHOLD_CU = 11.4;
/** 진동수를 훑는 범위(10¹⁴ Hz) — 적외선 끝에서 자외선 깊숙이. */
export const SWEEP_FROM = 3;
export const SWEEP_TO = 16;
/**
 * 구리를 훑을 때 단계를 가르는 진동수(10¹⁴ Hz) — 가시광 끝(380 nm ≈ 7.89). 이 앞은 「나트륨의 문턱을
 * 지나도」, 이 뒤는 「자외선에 들어서도」 를 캡션이 말한다.
 */
export const UV_FROM = 7.9;
/** 문턱을 넘는 순간 퍼지는 고리가 사라지기까지(초). */
export const PULSE_SECONDS = 0.9;

// ------------------------------------------------------------------------
// 배치 — 월드 좌표. 가로 1 = 10¹⁴ Hz, 세로 `perEv` = 1 eV.
// ------------------------------------------------------------------------

export const PLOT = {
  /** 세로 배율(월드 / eV). */
  perEv: 1.45,
  /** 가로축 끝(10¹⁴ Hz) · 세로축 끝(eV). */
  axisEndF: 17,
  axisTopEv: 5,
  /** 축 아래 가시광 띠의 두께(월드). */
  stripH: 0.28,
} as const;

/** 캡션 자리(월드). 캡션 슬롯은 프레이밍 여백으로 잡히지 않아(장부 G24) 경계에 직접 더한다. */
export const CAPTION_BAND = 0.9;

/** 프레이밍은 고정 — 세로축 이름 위부터, 문턱 이름표 · 캡션 띠 아래까지, 오른쪽은 금속 이름표 자리. */
export const SCENE_BOUNDS = {
  minX: -1.2,
  maxX: 21.6,
  minY: -1.3 - CAPTION_BAND,
  maxY: PLOT.axisTopEv * PLOT.perEv + 0.9,
} as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

export const PHASE_NA_BELOW = 2.6;
export const PHASE_NA_ABOVE = 3.0;
export const PHASE_NA_HOLD = 0.8;
/**
 * 구리 문턱 전 — 가시광 구간(3 → 7.9) · 자외선 구간(7.9 → 11.36). 두 길이는 커서가 같은 빠르기로 가도록
 * 진동수 폭에 비례해 나눴다(합 3.4). 훑는 범위나 `uvFrom` 을 바꾸면 이 비도 함께 맞춘다 (장부 G13).
 */
export const PHASE_CU_BELOW = 2.0;
export const PHASE_CU_UV = 1.4;
export const PHASE_CU_ABOVE = 2.4;
export const PHASE_CU_HOLD = 0.6;
export const PHASE_SLIDE = 2.4;
export const PHASE_MATCH = 2.8;
export const PHASE_FADE = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const workFunctionAndThresholdMessages = Object.freeze({
  'label.title': {
    ko: '일함수와 문턱 진동수',
    en: 'Work function and threshold frequency',
    ja: '仕事関数と限界振動数',
    zh: '逸出功与截止频率',
    ar: 'دالة الشغل وتردد العتبة',
    es: 'Función de trabajo y frecuencia umbral',
    fr: 'Travail de sortie et fréquence seuil',
    hi: 'कार्य फलन और देहली आवृत्ति',
    id: 'Fungsi kerja dan frekuensi ambang',
    pt: 'Função trabalho e frequência limiar',
  },
  'label.operation': {
    ko: '세기가 아니라 진동수가 정하는 것',
    en: 'Set by frequency, not by intensity',
    ja: '強さではなく振動数が決める',
    zh: '由频率而非强度决定',
    ar: 'يحدده التردد لا الشدة',
    es: 'Lo fija la frecuencia, no la intensidad',
    fr: 'Fixé par la fréquence, pas par l’intensité',
    hi: 'तीव्रता नहीं, आवृत्ति तय करती है',
    id: 'Ditentukan oleh frekuensi, bukan intensitas',
    pt: 'Definido pela frequência, não pela intensidade',
  },
  'label.stage': {
    ko: '나트륨과 구리',
    en: 'Sodium and copper',
    ja: 'ナトリウムと銅',
    zh: '钠与铜',
    ar: 'الصوديوم والنحاس',
    es: 'Sodio y cobre',
    fr: 'Sodium et cuivre',
    hi: 'सोडियम और ताँबा',
    id: 'Natrium dan tembaga',
    pt: 'Sódio e cobre',
  },
  'label.view': {
    ko: '기본',
    en: 'Default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضي',
    es: 'Predeterminada',
    fr: 'Par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'Bawaan',
    pt: 'Padrão',
  },

  /** 축 이름. 조사가 붙거나 어순이 갈리는 말이라 문안이다 (C1 판정 4). */
  'label.axisF': {
    ko: '진동수 (×10¹⁴ Hz)',
    en: 'frequency (×10¹⁴ Hz)',
    ja: '振動数 (×10¹⁴ Hz)',
    zh: '频率 (×10¹⁴ Hz)',
    ar: 'التردد (×10¹⁴ Hz)',
    es: 'frecuencia (×10¹⁴ Hz)',
    fr: 'fréquence (×10¹⁴ Hz)',
    hi: 'आवृत्ति (×10¹⁴ Hz)',
    id: 'frekuensi (×10¹⁴ Hz)',
    pt: 'frequência (×10¹⁴ Hz)',
  },
  'label.axisK': {
    ko: '튀어나온 전자의 최대 에너지 (eV)',
    en: 'max energy of ejected electrons (eV)',
    ja: '飛び出した電子の最大エネルギー (eV)',
    zh: '逸出电子的最大能量 (eV)',
    ar: 'الطاقة القصوى للإلكترونات المنبعثة (eV)',
    es: 'energía máx. de los electrones emitidos (eV)',
    fr: 'énergie max. des électrons éjectés (eV)',
    hi: 'उत्सर्जित इलेक्ट्रॉनों की अधिकतम ऊर्जा (eV)',
    id: 'energi maks. elektron yang terlepas (eV)',
    pt: 'energia máx. dos elétrons ejetados (eV)',
  },
  'label.ultraviolet': {
    ko: '자외선',
    en: 'ultraviolet',
    ja: '紫外線',
    zh: '紫外线',
    ar: 'الأشعة فوق البنفسجية',
    es: 'ultravioleta',
    fr: 'ultraviolet',
    hi: 'पराबैंगनी',
    id: 'ultraungu',
    pt: 'ultravioleta',
  },
  /** 금속 이름표 — 일함수는 선언한 정박값을 끼운다 (C1 · S-piece 유효숫자). */
  'label.sodium': {
    ko: '나트륨 · 일함수 {w} eV',
    en: 'sodium · work function {w} eV',
    ja: 'ナトリウム · 仕事関数 {w} eV',
    zh: '钠 · 逸出功 {w} eV',
    ar: 'الصوديوم · دالة الشغل {w} eV',
    es: 'sodio · función de trabajo {w} eV',
    fr: 'sodium · travail de sortie {w} eV',
    hi: 'सोडियम · कार्य फलन {w} eV',
    id: 'natrium · fungsi kerja {w} eV',
    pt: 'sódio · função trabalho {w} eV',
  },
  'label.copper': {
    ko: '구리 · 일함수 {w} eV',
    en: 'copper · work function {w} eV',
    ja: '銅 · 仕事関数 {w} eV',
    zh: '铜 · 逸出功 {w} eV',
    ar: 'النحاس · دالة الشغل {w} eV',
    es: 'cobre · función de trabajo {w} eV',
    fr: 'cuivre · travail de sortie {w} eV',
    hi: 'ताँबा · कार्य फलन {w} eV',
    id: 'tembaga · fungsi kerja {w} eV',
    pt: 'cobre · função trabalho {w} eV',
  },
  /** 문턱 진동수 — 정박값을 끼운다. 단위는 가로축 이름이 준다. */
  'label.threshold': {
    ko: '문턱 {f}',
    en: 'threshold {f}',
    ja: '限界振動数 {f}',
    zh: '截止频率 {f}',
    ar: 'العتبة {f}',
    es: 'umbral {f}',
    fr: 'seuil {f}',
    hi: 'देहली {f}',
    id: 'ambang {f}',
    pt: 'limiar {f}',
  },
  /** 기울기 — `h` 는 표식이고 「기울기」 는 문안이다. */
  'label.slope': {
    ko: '기울기 h',
    en: 'slope h',
    ja: '傾き h',
    zh: '斜率 h',
    ar: 'الميل h',
    es: 'pendiente h',
    fr: 'pente h',
    hi: 'ढाल h',
    id: 'kemiringan h',
    pt: 'inclinação h',
  },

  'caption.naBelow': {
    ko: '나트륨에 비추는 빛의 진동수를 올려 가도, 문턱에 닿기 전에는 전자가 하나도 나오지 않는다',
    en: 'Raising the frequency of light on sodium frees no electrons at all until it reaches the threshold',
    ja: 'ナトリウムに当てる光の振動数を上げても、限界振動数に達するまでは電子が1つも出てこない',
    zh: '提高照在钠上的光的频率，在达到截止频率之前，一个电子也不会逸出',
    ar: 'رفع تردد الضوء الساقط على الصوديوم لا يحرّر أي إلكترون حتى يبلغ العتبة',
    es: 'Subir la frecuencia de la luz sobre el sodio no libera ningún electrón hasta que llega al umbral',
    fr: 'Augmenter la fréquence de la lumière sur le sodium ne libère aucun électron tant qu’elle n’atteint pas le seuil',
    hi: 'सोडियम पर पड़ते प्रकाश की आवृत्ति बढ़ाने पर भी देहली तक पहुँचने से पहले एक भी इलेक्ट्रॉन नहीं निकलता',
    id: 'Menaikkan frekuensi cahaya pada natrium sama sekali tidak membebaskan elektron sampai mencapai ambang',
    pt: 'Aumentar a frequência da luz sobre o sódio não libera elétron algum até atingir o limiar',
  },
  'caption.naAbove': {
    ko: '문턱을 넘는 순간부터 전자가 튀어나오고, 그 에너지는 진동수를 따라 곧게 자란다',
    en: 'Past the threshold electrons fly out, and their energy grows in a straight line with frequency',
    ja: '限界振動数を超えると電子が飛び出し、そのエネルギーは振動数とともに直線的に増える',
    zh: '越过截止频率后电子飞出，其能量随频率沿直线增长',
    ar: 'بعد تجاوز العتبة تنطلق الإلكترونات، وتزداد طاقتها خطيًا مع التردد',
    es: 'Pasado el umbral salen electrones, y su energía crece en línea recta con la frecuencia',
    fr: 'Passé le seuil, des électrons jaillissent, et leur énergie croît en ligne droite avec la fréquence',
    hi: 'देहली पार होते ही इलेक्ट्रॉन निकल पड़ते हैं, और उनकी ऊर्जा आवृत्ति के साथ सीधी रेखा में बढ़ती है',
    id: 'Melewati ambang, elektron melesat keluar, dan energinya tumbuh lurus seiring frekuensi',
    pt: 'Passado o limiar, elétrons saltam para fora, e sua energia cresce em linha reta com a frequência',
  },
  'caption.cuBelow': {
    ko: '구리에 비추는 빛의 진동수를 올려 나트륨의 문턱을 지나도 전자가 나오지 않는다',
    en: "Raising the frequency on copper past sodium's threshold still frees no electrons",
    ja: '銅に当てる光の振動数をナトリウムの限界振動数より上げても、まだ電子は出てこない',
    zh: '照在铜上的光的频率升过钠的截止频率，仍然没有电子逸出',
    ar: 'رفع التردد على النحاس متجاوزًا عتبة الصوديوم لا يحرّر أي إلكترون بعد',
    es: 'Subir la frecuencia sobre el cobre más allá del umbral del sodio sigue sin liberar electrones',
    fr: 'Augmenter la fréquence sur le cuivre au-delà du seuil du sodium ne libère toujours aucun électron',
    hi: 'ताँबे पर आवृत्ति को सोडियम की देहली से आगे बढ़ाने पर भी कोई इलेक्ट्रॉन नहीं निकलता',
    id: 'Menaikkan frekuensi pada tembaga melewati ambang natrium tetap tidak membebaskan elektron',
    pt: 'Aumentar a frequência sobre o cobre além do limiar do sódio ainda não libera elétrons',
  },
  'caption.cuUv': {
    ko: '일함수가 큰 구리는 자외선에 들어서도 한참 동안 전자가 나오지 않는다',
    en: 'Copper, with a larger work function, frees nothing even well into the ultraviolet',
    ja: '仕事関数の大きい銅は、紫外線に深く入っても電子を出さない',
    zh: '逸出功较大的铜，即使深入紫外区也没有电子逸出',
    ar: 'النحاس، بدالة شغل أكبر، لا يحرّر شيئًا حتى في عمق الأشعة فوق البنفسجية',
    es: 'El cobre, con una función de trabajo mayor, no libera nada ni siquiera bien dentro del ultravioleta',
    fr: 'Le cuivre, au travail de sortie plus grand, ne libère rien même loin dans l’ultraviolet',
    hi: 'बड़े कार्य फलन वाला ताँबा पराबैंगनी में काफ़ी आगे तक भी कुछ नहीं छोड़ता',
    id: 'Tembaga, dengan fungsi kerja lebih besar, tidak membebaskan apa pun bahkan jauh di dalam ultraungu',
    pt: 'O cobre, com função trabalho maior, não libera nada mesmo bem dentro do ultravioleta',
  },
  'caption.cuAbove': {
    ko: '구리의 문턱은 더 높은 진동수에 있고, 넘은 뒤에는 나트륨과 나란히 자란다',
    en: "Copper's threshold sits at a higher frequency; beyond it the line runs parallel to sodium's",
    ja: '銅の限界振動数はより高い振動数にあり、その先で直線はナトリウムの直線と平行に進む',
    zh: '铜的截止频率在更高的频率处；越过它之后，直线与钠的直线平行',
    ar: 'عتبة النحاس عند تردد أعلى؛ وبعدها يسير الخط موازيًا لخط الصوديوم',
    es: 'El umbral del cobre está a una frecuencia más alta; más allá, la recta corre paralela a la del sodio',
    fr: 'Le seuil du cuivre se situe à une fréquence plus élevée ; au-delà, la droite est parallèle à celle du sodium',
    hi: 'ताँबे की देहली ऊँची आवृत्ति पर है; उसके आगे रेखा सोडियम की रेखा के समांतर चलती है',
    id: 'Ambang tembaga berada pada frekuensi yang lebih tinggi; setelahnya garisnya sejajar dengan garis natrium',
    pt: 'O limiar do cobre fica numa frequência mais alta; além dele, a reta corre paralela à do sódio',
  },
  'caption.slide': {
    ko: '나트륨의 직선을 오른쪽으로 옮기면 구리의 직선에 꼭 겹친다',
    en: "Slide the sodium line to the right and it lands exactly on copper's",
    ja: 'ナトリウムの直線を右へずらすと、銅の直線にぴったり重なる',
    zh: '把钠的直线向右平移，它恰好与铜的直线重合',
    ar: 'أزِح خط الصوديوم إلى اليمين فينطبق تمامًا على خط النحاس',
    es: 'Desliza la recta del sodio a la derecha y cae justo sobre la del cobre',
    fr: 'Faites glisser la droite du sodium vers la droite : elle se pose exactement sur celle du cuivre',
    hi: 'सोडियम की रेखा को दाईं ओर खिसकाएँ तो वह ठीक ताँबे की रेखा पर बैठ जाती है',
    id: 'Geser garis natrium ke kanan dan ia tepat menimpa garis tembaga',
    pt: 'Deslize a reta do sódio para a direita e ela cai exatamente sobre a do cobre',
  },
  'caption.match': {
    ko: '기울기 h 는 어느 금속이나 같다 — 금속이 바꾸는 것은 문턱뿐이다',
    en: 'The slope h is the same for every metal — the metal only moves the threshold',
    ja: '傾き h はどの金属でも同じ — 金属が変えるのは限界振動数だけだ',
    zh: '斜率 h 对每种金属都相同 — 金属改变的只有截止频率',
    ar: 'الميل h هو نفسه لكل فلز — والفلز لا يغيّر إلا العتبة',
    es: 'La pendiente h es la misma para todo metal — el metal solo mueve el umbral',
    fr: 'La pente h est la même pour tous les métaux — le métal ne déplace que le seuil',
    hi: 'ढाल h हर धातु के लिए समान है — धातु केवल देहली को खिसकाती है',
    id: 'Kemiringan h sama untuk setiap logam — logam hanya menggeser ambang',
    pt: 'A inclinação h é a mesma para todo metal — o metal só desloca o limiar',
  },
} satisfies Record<string, LocalizedText>);

export type WorkFunctionAndThresholdMessageKey = keyof typeof workFunctionAndThresholdMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: WorkFunctionAndThresholdMessageKey): LocalizedText => workFunctionAndThresholdMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: WorkFunctionAndThresholdMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const workFunctionAndThresholdSchema: BundleSchema = {
  id: WORK_FUNCTION_AND_THRESHOLD_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에 두 금속을 훑고 두 직선을 겹쳐 본다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'sodium-copper',
      label: text('label.stage'),
      constants: {
        workFunctionNa: WORK_FUNCTION_NA,
        workFunctionCu: WORK_FUNCTION_CU,
        planck: PLANCK,
        thresholdNa: THRESHOLD_NA,
        thresholdCu: THRESHOLD_CU,
        sweepFrom: SWEEP_FROM,
        sweepTo: SWEEP_TO,
        uvFrom: UV_FROM,
        pulseSeconds: PULSE_SECONDS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓은 그래프 한 판 · 캡션 한 줄. 세로가 비싸다 (S-piece). 마운트 뒤 바뀌지 않는다. */
  canvas: { height: 400, minHeight: 340 },

  /** 미끄러지는 사본이 구리 직선 **위**에 얹혀야 겹침이 보인다 — scene 에 쓴 순서로 그린다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나트륨 훑기(문턱 전 · 뒤 · 멈춤) → 구리 훑기(문턱 전 가시광 · 문턱 전 자외선 · 뒤 · 멈춤) → 사본 옮기기 → 겹침 → 흐려짐.
   *
   * 「문턱 전」 단계는 훑는 시작에서 문턱까지, 「문턱 뒤」 단계는 문턱에서 끝까지를 맡는다 — 단계
   * 경계가 곧 문턱을 넘는 순간이라 단계 길이를 바꿔도 문턱과 어긋나지 않는다.
   */
  timeline: {
    phases: [
      { id: 'na-below', duration: PHASE_NA_BELOW, caption: key('caption.naBelow') },
      { id: 'na-above', duration: PHASE_NA_ABOVE, caption: key('caption.naAbove') },
      { id: 'na-hold', duration: PHASE_NA_HOLD, caption: key('caption.naAbove') },
      { id: 'cu-below', duration: PHASE_CU_BELOW, caption: key('caption.cuBelow') },
      { id: 'cu-uv', duration: PHASE_CU_UV, caption: key('caption.cuUv') },
      { id: 'cu-above', duration: PHASE_CU_ABOVE, caption: key('caption.cuAbove') },
      { id: 'cu-hold', duration: PHASE_CU_HOLD, caption: key('caption.cuAbove') },
      { id: 'slide', duration: PHASE_SLIDE, ease: 'smooth', caption: key('caption.slide') },
      { id: 'match', duration: PHASE_MATCH, caption: key('caption.match') },
      { id: 'fade', duration: PHASE_FADE, caption: key('caption.match') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 나트륨을 훑는 커서가 가시광 한가운데를 지나는 자리에서 연다. */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — Kmax = hf − φ 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: workFunctionAndThresholdMessages,
};
