// ========================================================================
// constructive-destructive — 선언
// ========================================================================
// 질문: 똑같은 두 파동을 겹쳤는데, 왜 어떤 때는 두 배로 커지고 어떤 때는 사라지는가?
//
// 같은 진동수 · 같은 진폭의 두 파동을 한 줄에 겹친다. 둘 사이의 **위상차 하나** 만
// 바뀐다. 위상이 맞으면(Δφ = 0) 마루가 마루를 만나 합이 두 배 진폭으로 출렁이고,
// 반 파장 어긋나면(Δφ = π) 마루가 골을 만나 합이 평평해진다. 그 사이에서는 합의
// 진폭이 2A|cos(Δφ/2)| 로 연속해서 줄어든다.
//
// 펄스가 만나 지나가는 것(superposition) · 두 파원의 무늬(interference)는 이 조각의
// 몫이 아니다. 여기서 움직이는 손잡이는 위상차 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:constructive-destructive` 와 문자 그대로 일치한다 (C4). */
export const CONSTRUCTIVE_DESTRUCTIVE_ID = 'constructive-destructive';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 줄 위의 거리(칸)다. 진폭도 같은 단위라 모양이 찌그러지지 않는다.
// ------------------------------------------------------------------------

/** 두 파동 각각의 진폭(칸). 둘이 같다 — 다르면 π 에서도 합이 0 이 되지 않는다. */
export const AMPLITUDE = 0.75;
/** 두 파동의 파장(칸). 둘이 같다(같은 진동수 · 같은 매질). */
export const WAVELENGTH = 4;
/** 두 파동이 오른쪽으로 흐르는 속력(칸/초). 합도 같은 속력으로 흐른다. */
export const WAVE_SPEED = 0.8;
/** 위상차가 도는 끝값(라디안). π — 마루가 골을 만나는 자리다. */
export const PHASE_MAX = Math.PI;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 위상이 맞은 채 머무는 동안. 두 배로 출렁이는 합을 읽을 시간이다. */
export const IN_PHASE_HOLD = 2.6;
/** 위상차가 0 → π 로 벌어지는 동안. */
export const SLIDE_OUT = 4.4;
/** 반 파장 어긋난 채 머무는 동안. 평평해진 합을 읽을 시간이다. */
export const ANTI_PHASE_HOLD = 2.8;
/** 위상차가 π → 0 으로 돌아오는 동안. */
export const SLIDE_BACK = 3.4;

// ------------------------------------------------------------------------
// 배치 — 월드 칸. 위 줄은 두 파동, 아래 줄은 그 합이다.
// ------------------------------------------------------------------------

/** 줄의 양끝(가로). 네 파장 남짓이 들어간다 — 임베드는 가로로 넓고 세로로 좁다. */
export const STRING_HALF = 8.2;
/** 위 줄(두 파동) · 아래 줄(합)의 평형 높이. */
export const ROW_WAVES_Y = 1.75;
export const ROW_SUM_Y = -1.65;

/**
 * 프레이밍은 주장의 일부다. 가로는 줄 양끝과 오른쪽 표식 자리, 세로는 위 줄 이름표
 * 위부터 아래 줄 가장 깊은 골(−2A) 아래 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -8.6, maxX: 9.1, minY: -4.0, maxY: 3.2 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const constructiveDestructiveMessages = Object.freeze({
  'label.title': {
    ko: '보강과 상쇄',
    en: 'Constructive and destructive interference',
    ja: '強め合う干渉と弱め合う干渉',
    zh: '相长干涉与相消干涉',
    ar: 'التداخل البنّاء والتداخل الهدّام',
    es: 'Interferencia constructiva y destructiva',
    fr: 'Interférences constructives et destructives',
    hi: 'संपोषी और विनाशी व्यतिकरण',
    id: 'Interferensi konstruktif dan destruktif',
    pt: 'Interferência construtiva e destrutiva',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '위상차가 정하는 합의 크기',
    en: 'How phase difference sets the size of the sum',
    ja: '位相差が合成波の大きさを決めるしくみ',
    zh: '相位差如何决定合成波的大小',
    ar: 'كيف يحدّد فرق الطور حجم المجموع',
    es: 'Cómo la diferencia de fase fija el tamaño de la suma',
    fr: 'Comment le déphasage fixe l’ampleur de la somme',
    hi: 'कलांतर योग का आकार कैसे तय करता है',
    id: 'Bagaimana beda fase menentukan besar jumlahnya',
    pt: 'Como a diferença de fase define o tamanho da soma',
  },
  'label.stage': {
    ko: '같은 두 파동',
    en: 'Two identical waves',
    ja: '同じ二つの波',
    zh: '两列相同的波',
    ar: 'موجتان متطابقتان',
    es: 'Dos ondas idénticas',
    fr: 'Deux ondes identiques',
    hi: 'दो समान तरंगें',
    id: 'Dua gelombang identik',
    pt: 'Duas ondas idênticas',
  },
  'label.view': {
    ko: '두 파동과 합',
    en: 'Two waves and their sum',
    ja: '二つの波と合成波',
    zh: '两列波及其合成波',
    ar: 'الموجتان ومجموعهما',
    es: 'Dos ondas y su suma',
    fr: 'Deux ondes et leur somme',
    hi: 'दो तरंगें और उनका योग',
    id: 'Dua gelombang dan jumlahnya',
    pt: 'Duas ondas e sua soma',
  },
  'label.waves': {
    ko: '두 파동',
    en: 'Two waves',
    ja: '二つの波',
    zh: '两列波',
    ar: 'موجتان',
    es: 'Dos ondas',
    fr: 'Deux ondes',
    hi: 'दो तरंगें',
    id: 'Dua gelombang',
    pt: 'Duas ondas',
  },
  'label.sum': {
    ko: '합',
    en: 'Sum',
    ja: '合成波',
    zh: '合成波',
    ar: 'المجموع',
    es: 'Suma',
    fr: 'Somme',
    hi: 'योग',
    id: 'Jumlah',
    pt: 'Soma',
  },
  /** 진폭 기준선 표식. 수식 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.amp': {
    ko: 'A',
    en: 'A',
    ja: 'A',
    zh: 'A',
    ar: 'A',
    es: 'A',
    fr: 'A',
    hi: 'A',
    id: 'A',
    pt: 'A',
  },
  'label.ampDouble': {
    ko: '2A',
    en: '2A',
    ja: '2A',
    zh: '2A',
    ar: '2A',
    es: '2A',
    fr: '2A',
    hi: '2A',
    id: '2A',
    pt: '2A',
  },
  'caption.inPhase': {
    ko: '위상이 같으면 마루가 마루와 겹쳐 합이 두 배 높이로 출렁인다',
    en: 'In phase, crest lands on crest and the sum swings twice as high',
    ja: '位相がそろうと山と山が重なり、合成波は2倍の高さで揺れる',
    zh: '同相时波峰叠上波峰，合成波以两倍的高度起伏',
    ar: 'في الطور نفسه تقع القمة على القمة ويتذبذب المجموع بضعف الارتفاع',
    es: 'En fase, cresta coincide con cresta y la suma oscila con el doble de altura',
    fr: 'En phase, les crêtes tombent sur les crêtes et la somme oscille deux fois plus haut',
    hi: 'समान कला में शिखर पर शिखर पड़ता है और योग दुगुनी ऊँचाई तक दोलन करता है',
    id: 'Sefase, puncak bertemu puncak dan jumlahnya berayun dua kali lebih tinggi',
    pt: 'Em fase, crista cai sobre crista e a soma oscila duas vezes mais alto',
  },
  'caption.slideOut': {
    ko: '점선 파동이 밀려 위상이 어긋날수록 합이 낮아진다',
    en: 'As the dashed wave slips out of phase, the sum gets smaller',
    ja: '点線の波がずれて位相が外れるほど、合成波は小さくなる',
    zh: '虚线波逐渐错开相位，合成波随之变小',
    ar: 'كلما انزلقت الموجة المتقطعة خارج الطور صغر المجموع',
    es: 'A medida que la onda discontinua se desfasa, la suma se hace más pequeña',
    fr: 'À mesure que l’onde en pointillés se déphase, la somme diminue',
    hi: 'जैसे-जैसे बिंदुकित तरंग कला से खिसकती है, योग छोटा होता जाता है',
    id: 'Saat gelombang putus-putus bergeser keluar fase, jumlahnya mengecil',
    pt: 'À medida que a onda tracejada sai de fase, a soma fica menor',
  },
  'caption.antiPhase': {
    ko: '반 파장 어긋나면 마루가 골을 만나 합이 사라진다',
    en: 'Half a wavelength apart, crest meets trough and the sum vanishes',
    ja: '半波長ずれると山が谷と出会い、合成波は消える',
    zh: '错开半个波长时，波峰遇上波谷，合成波消失',
    ar: 'عند فارق نصف طول موجي تلتقي القمة بالقاع ويتلاشى المجموع',
    es: 'Separadas media longitud de onda, la cresta se encuentra con el valle y la suma desaparece',
    fr: 'Décalées d’une demi-longueur d’onde, crête et creux se rencontrent et la somme disparaît',
    hi: 'आधे तरंगदैर्घ्य के अंतर पर शिखर गर्त से मिलता है और योग लुप्त हो जाता है',
    id: 'Bergeser setengah panjang gelombang, puncak bertemu lembah dan jumlahnya lenyap',
    pt: 'Defasadas de meio comprimento de onda, a crista encontra o vale e a soma desaparece',
  },
  'caption.slideBack': {
    ko: '위상이 다시 맞아 가면 합이 되살아난다',
    en: 'As the waves slide back into phase, the sum grows back',
    ja: '波が再び位相をそろえていくと、合成波がよみがえる',
    zh: '两列波重新回到同相，合成波又变大了',
    ar: 'مع عودة الموجتين إلى الطور نفسه يكبر المجموع من جديد',
    es: 'Cuando las ondas vuelven a entrar en fase, la suma crece de nuevo',
    fr: 'Quand les ondes reviennent en phase, la somme grandit de nouveau',
    hi: 'तरंगें फिर से समान कला में आने पर योग दोबारा बढ़ जाता है',
    id: 'Saat gelombang kembali sefase, jumlahnya tumbuh lagi',
    pt: 'Conforme as ondas voltam a entrar em fase, a soma cresce de novo',
  },
} satisfies Record<string, LocalizedText>);

export type ConstructiveDestructiveMessageKey = keyof typeof constructiveDestructiveMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ConstructiveDestructiveMessageKey): LocalizedText =>
  constructiveDestructiveMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ConstructiveDestructiveMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const constructiveDestructiveSchema: BundleSchema = {
  id: CONSTRUCTIVE_DESTRUCTIVE_ID,
  label: text('label.title'),
  category: 'waves',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 위상차가 벌어지는 중이고, 0 과 π 에서 한 번씩 머문다.
  parameters: [],

  stages: [
    {
      id: 'identical',
      label: text('label.stage'),
      constants: {
        amplitude: AMPLITUDE,
        wavelength: WAVELENGTH,
        speed: WAVE_SPEED,
        phaseMax: PHASE_MAX,
      },
    },
  ],

  environments: [],

  views: [{ id: 'rows', label: text('label.view'), default: true }],

  /** 가로 17.7 칸 · 세로 7.2 칸. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 기준선이 파동 아래, 점선 파동이 실선 파동 위에 와야 위상이
   * 맞았을 때 두 선이 한 줄로 포개져 보인다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 위상 맞음(머묾) → 벌어짐 → 반 파장 어긋남(머묾) → 되돌아옴.
   * 위상차는 `slideOut` 의 진행도만큼 벌어지고 `slideBack` 의 진행도만큼 돌아온다.
   */
  timeline: {
    phases: [
      { id: 'inPhase', duration: IN_PHASE_HOLD, caption: key('caption.inPhase') },
      { id: 'slideOut', duration: SLIDE_OUT, ease: 'smooth', caption: key('caption.slideOut') },
      { id: 'antiPhase', duration: ANTI_PHASE_HOLD, caption: key('caption.antiPhase') },
      { id: 'slideBack', duration: SLIDE_BACK, ease: 'smooth', caption: key('caption.slideBack') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 두 배로 출렁이던 합이 막 줄어들기 시작하는 자리에서
   * 연다. 두 파동은 첫 프레임부터 줄 전체에 차 있다.
   */
  startAt: 2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 2A|cos(Δφ/2)| 는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **합의 높이** 이고,
   * 그 기준은 ±A · ±2A 기준선 둘이 준다.
   */

  messages: constructiveDestructiveMessages,
};
