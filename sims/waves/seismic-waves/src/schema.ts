// ========================================================================
// seismic-waves — 선언
// ========================================================================
// 질문: 지구 반대편에 지진파가 닿지 않는 넓은 띠가 왜 생기나?
//
// 동사: **닿지 못한다.** 진원(맨 위)에서 P파와 S파가 함께 지구 속으로 퍼진다. 오른쪽 반은
// P파, 왼쪽 반은 S파의 파선이다. S파는 액체 외핵을 지나지 못해 거기서 멈추고, 그래서
// 진원에서 103° 너머의 지표에는 하나도 닿지 않는다. P파는 핵을 지나며 꺾여 142° 너머에
// 닿고, 103° ~ 142° 사이만 비워 둔다. 지표에 찍히는 도착 점이 그 빈 띠를 만든다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:seismic-waves` 와 문자 그대로 일치한다 (C4). */
export const SEISMIC_WAVES_ID = 'seismic-waves';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 핵 반지름 / 지구 반지름. 3480 km / 6371 km. */
export const CORE_RATIO = 0.546;
/** S파 그림자대가 시작하는 각(진원에서 잰 중심각, 도). P파 그림자대도 여기서 시작한다. */
export const SHADOW_FROM_DEG = 103;
/** P파 그림자대가 끝나는 각(도). 이 너머에는 핵을 지나 꺾인 P파가 닿는다. */
export const P_SHADOW_TO_DEG = 142;
/** 맨틀 속 대표 속력(km/s). P파가 S파보다 빠르다. */
export const V_P = 11;
export const V_S = 6;
/** 지구 반지름(km). 월드에서는 1 이다 — 속력을 월드 단위로 바꾸는 데만 쓴다. */
export const EARTH_RADIUS_KM = 6371;
/** 퍼지는 두 단계(`mantle` + `core`)가 보여 주는 실제 시간(분). 가장 늦은 S파가 닿을 만큼. */
export const TRAVEL_MINUTES = 30;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(화면 초). 경계는 물리에서 끌어온다
// ------------------------------------------------------------------------

/** 퍼지는 동안의 화면 시간(초) — `mantle` 과 `core` 의 합. */
export const TRAVEL_SECONDS = 9;
/**
 * `mantle` 의 길이 — 곧장 아래로 간 S파가 외핵에 닿는 순간 끝난다. 그때부터 캡션이
 * 「S파가 멈춘다」 로 바뀐다. 기본 상수에서 끌어온 값이다 (장부 G13 — 저작자가 속력을
 * 바꾸면 단계 경계가 따라가지 않는다).
 */
export const MANTLE_SECONDS =
  (TRAVEL_SECONDS * ((1 - CORE_RATIO) * EARTH_RADIUS_KM)) / V_S / (TRAVEL_MINUTES * 60);
export const CORE_SECONDS = TRAVEL_SECONDS - MANTLE_SECONDS;
/** 그림자대 호가 떠오르는 동안 · 멈춘 그림을 읽는 동안 · 흐려지는 동안. */
export const REVEAL_SECONDS = 1.2;
export const HOLD_SECONDS = 4.5;
export const FADE_SECONDS = 0.8;

// ------------------------------------------------------------------------
// 배치 — 월드. 지구 반지름이 1 이고 원점이 지구 중심, 진원은 (0, 1).
// ------------------------------------------------------------------------

/**
 * 프레이밍은 주장의 일부다. 가로는 양쪽 반의 이름표와 그림자대 이름표까지, 세로는 진원
 * 이름표 위와 캡션 줄 아래까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -1.7, maxX: 1.7, minY: -1.3, maxY: 1.16 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const seismicWavesMessages = Object.freeze({
  'label.title': {
    ko: '지진파',
    en: 'Seismic waves',
    ja: '地震波',
    zh: '地震波',
    ar: 'الموجات الزلزالية',
    es: 'Ondas sísmicas',
    fr: 'Ondes sismiques',
    hi: 'भूकंपीय तरंगें',
    id: 'Gelombang seismik',
    pt: 'Ondas sísmicas',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '액체 외핵이 S파를 막고 P파를 꺾어 만드는 그림자대',
    en: 'The shadow zones made as the liquid outer core blocks S waves and bends P waves',
    ja: '液体の外核がS波をさえぎりP波を曲げてできるシャドーゾーン',
    zh: '液态外核挡住S波、折弯P波而形成的影区',
    ar: 'مناطق الظل التي تنشأ حين يحجب اللب الخارجي السائل موجات S ويحني موجات P',
    es: 'Las zonas de sombra que crea el núcleo externo líquido al bloquear las ondas S y desviar las ondas P',
    fr: 'Les zones d’ombre créées quand le noyau externe liquide arrête les ondes S et courbe les ondes P',
    hi: 'छाया क्षेत्र, जो तब बनते हैं जब द्रव बाह्य क्रोड S तरंगों को रोकता है और P तरंगों को मोड़ता है',
    id: 'Zona bayangan yang terbentuk saat inti luar cair menahan gelombang S dan membelokkan gelombang P',
    pt: 'As zonas de sombra criadas quando o núcleo externo líquido barra as ondas S e desvia as ondas P',
  },
  'label.stage': {
    ko: '지구 단면',
    en: 'Earth cross-section',
    ja: '地球の断面',
    zh: '地球截面',
    ar: 'مقطع عرضي للأرض',
    es: 'Sección transversal de la Tierra',
    fr: 'Coupe de la Terre',
    hi: 'पृथ्वी का अनुप्रस्थ काट',
    id: 'Penampang Bumi',
    pt: 'Corte transversal da Terra',
  },
  'label.view': {
    ko: '진원을 지나는 단면',
    en: 'Section through the focus',
    ja: '震源を通る断面',
    zh: '经过震源的剖面',
    ar: 'مقطع يمر عبر بؤرة الزلزال',
    es: 'Corte que pasa por el foco',
    fr: 'Coupe passant par le foyer',
    hi: 'भूकंप मूल से होकर जाता काट',
    id: 'Penampang melalui hiposentrum',
    pt: 'Corte que passa pelo foco',
  },
  'label.focus': {
    ko: '진원',
    en: 'focus',
    ja: '震源',
    zh: '震源',
    ar: 'بؤرة الزلزال',
    es: 'foco',
    fr: 'foyer',
    hi: 'भूकंप मूल',
    id: 'hiposentrum',
    pt: 'foco',
  },
  'label.pHalf': {
    ko: 'P파 — 앞뒤로 흔든다',
    en: 'P wave — push and pull',
    ja: 'P波 — 前後に揺らす',
    zh: 'P波 — 前后推拉',
    ar: 'موجة P — دفع وسحب',
    es: 'Onda P — empuje y tirón',
    fr: 'Onde P — pousser et tirer',
    hi: 'P तरंग — आगे-पीछे धक्का और खिंचाव',
    id: 'Gelombang P — dorong dan tarik',
    pt: 'Onda P — empurra e puxa',
  },
  'label.sHalf': {
    ko: 'S파 — 옆으로 흔든다',
    en: 'S wave — side to side',
    ja: 'S波 — 横に揺らす',
    zh: 'S波 — 左右晃动',
    ar: 'موجة S — من جانب إلى جانب',
    es: 'Onda S — de lado a lado',
    fr: 'Onde S — d’un côté à l’autre',
    hi: 'S तरंग — अगल-बगल',
    id: 'Gelombang S — ke samping',
    pt: 'Onda S — de um lado para o outro',
  },
  'label.core': {
    ko: '액체 외핵',
    en: 'liquid outer core',
    ja: '液体の外核',
    zh: '液态外核',
    ar: 'اللب الخارجي السائل',
    es: 'núcleo externo líquido',
    fr: 'noyau externe liquide',
    hi: 'द्रव बाह्य क्रोड',
    id: 'inti luar cair',
    pt: 'núcleo externo líquido',
  },
  /** 지표의 각 눈금. 값은 스테이지 상수를 그대로 끼운다 (S-piece 유효숫자). */
  'label.deg': {
    ko: '{deg}°',
    en: '{deg}°',
    ja: '{deg}°',
    zh: '{deg}°',
    ar: '{deg}°',
    es: '{deg}°',
    fr: '{deg}°',
    hi: '{deg}°',
    id: '{deg}°',
    pt: '{deg}°',
  },
  'label.shadowS': {
    ko: 'S파 그림자대',
    en: 'S-wave shadow zone',
    ja: 'S波のシャドーゾーン',
    zh: 'S波影区',
    ar: 'منطقة ظل موجات S',
    es: 'Zona de sombra de las ondas S',
    fr: 'Zone d’ombre des ondes S',
    hi: 'S तरंग छाया क्षेत्र',
    id: 'Zona bayangan gelombang S',
    pt: 'Zona de sombra das ondas S',
  },
  'label.shadowP': {
    ko: 'P파 그림자대',
    en: 'P-wave shadow zone',
    ja: 'P波のシャドーゾーン',
    zh: 'P波影区',
    ar: 'منطقة ظل موجات P',
    es: 'Zona de sombra de las ondas P',
    fr: 'Zone d’ombre des ondes P',
    hi: 'P तरंग छाया क्षेत्र',
    id: 'Zona bayangan gelombang P',
    pt: 'Zona de sombra das ondas P',
  },
  'caption.mantle': {
    ko: '진원에서 P파와 S파가 함께 퍼진다 — P파가 앞서 나아간다',
    en: 'P and S waves spread out from the focus together — the P wave pulls ahead',
    ja: '震源からP波とS波が一緒に広がる — P波が先に進む',
    zh: 'P波和S波从震源一同向外传播 — P波跑在前面',
    ar: 'تنتشر موجتا P وS معًا من بؤرة الزلزال — وتتقدّم موجة P',
    es: 'Las ondas P y S se propagan juntas desde el foco — la onda P se adelanta',
    fr: 'Les ondes P et S partent ensemble du foyer — l’onde P prend de l’avance',
    hi: 'भूकंप मूल से P और S तरंगें साथ-साथ फैलती हैं — P तरंग आगे निकल जाती है',
    id: 'Gelombang P dan S menyebar bersama dari hiposentrum — gelombang P melaju lebih dulu',
    pt: 'As ondas P e S se espalham juntas a partir do foco — a onda P sai na frente',
  },
  'caption.core': {
    ko: 'S파는 액체 외핵을 지나지 못해 멈추고, P파는 핵을 지나며 꺾인다',
    en: 'The S wave cannot cross the liquid outer core and stops; the P wave passes through and bends',
    ja: 'S波は液体の外核を通れずに止まり、P波は核を通り抜けながら曲がる',
    zh: 'S波无法穿过液态外核而停下；P波穿过外核并发生弯折',
    ar: 'لا تستطيع موجة S عبور اللب الخارجي السائل فتتوقف؛ أما موجة P فتعبره وتنحني',
    es: 'La onda S no puede atravesar el núcleo externo líquido y se detiene; la onda P lo atraviesa y se desvía',
    fr: 'L’onde S ne peut pas traverser le noyau externe liquide et s’arrête ; l’onde P le traverse et se courbe',
    hi: 'S तरंग द्रव बाह्य क्रोड को पार नहीं कर पाती और रुक जाती है; P तरंग उसके पार जाती है और मुड़ जाती है',
    id: 'Gelombang S tidak dapat melewati inti luar cair dan berhenti; gelombang P menembusnya dan membelok',
    pt: 'A onda S não consegue atravessar o núcleo externo líquido e para; a onda P passa por ele e se desvia',
  },
  'caption.shadow': {
    ko: 'S파가 하나도 닿지 못한 넓은 띠, P파가 비워 둔 좁은 띠 — 그림자대다',
    en: 'A wide band no S wave reaches, a narrower band the P wave skips — the shadow zones',
    ja: 'S波がひとつも届かない広い帯と、P波が飛ばす狭い帯 — シャドーゾーンだ',
    zh: 'S波一个也到达不了的宽带，P波跳过的较窄的带 — 这就是影区',
    ar: 'نطاق واسع لا تصله أي موجة S، ونطاق أضيق تتخطاه موجة P — إنهما منطقتا الظل',
    es: 'Una franja ancha a la que no llega ninguna onda S, otra más estrecha que la onda P se salta — las zonas de sombra',
    fr: 'Une large bande qu’aucune onde S n’atteint, une bande plus étroite que l’onde P saute — les zones d’ombre',
    hi: 'एक चौड़ी पट्टी जहाँ कोई S तरंग नहीं पहुँचती, एक संकरी पट्टी जिसे P तरंग छोड़ देती है — ये छाया क्षेत्र हैं',
    id: 'Pita lebar yang tak dicapai satu pun gelombang S, pita lebih sempit yang dilewati gelombang P — itulah zona bayangan',
    pt: 'Uma faixa larga que nenhuma onda S alcança, uma faixa mais estreita que a onda P pula — as zonas de sombra',
  },
} satisfies Record<string, LocalizedText>);

export type SeismicWavesMessageKey = keyof typeof seismicWavesMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SeismicWavesMessageKey): LocalizedText => seismicWavesMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SeismicWavesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const seismicWavesSchema: BundleSchema = {
  id: SEISMIC_WAVES_ID,
  label: text('label.title'),
  category: 'waves',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 퍼지고 있고, 멈추고, 그림자대가 드러난다.
  parameters: [],

  stages: [
    {
      id: 'earth',
      label: text('label.stage'),
      constants: {
        coreRatio: CORE_RATIO,
        shadowFromDeg: SHADOW_FROM_DEG,
        pShadowToDeg: P_SHADOW_TO_DEG,
        vP: V_P,
        vS: V_S,
        earthRadiusKm: EARTH_RADIUS_KM,
        travelMinutes: TRAVEL_MINUTES,
      },
    },
  ],

  environments: [],

  views: [{ id: 'section', label: text('label.view'), default: true }],

  /** 원판은 정사각형이라 세로가 곧 크기다. 이름표 · 캡션 줄만큼만 더 준다. */
  canvas: { height: 500, minHeight: 420 },

  /** 겹침 순서가 판정 장치다 — 맨틀 · 핵 면 아래, 파선 · 도착 점 위, 그림자대 호가 맨 위. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 맨틀을 퍼짐 → S파가 핵에 막히고 P파가 핵을 지남 → 그림자대가 떠오름 → 읽음 → 흐려짐.
   * `mantle` 과 `core` 는 한 흐름이다 — scene 은 둘을 이은 구간의 진행도를 실제 시간으로 바꾼다.
   */
  timeline: {
    phases: [
      { id: 'mantle', duration: MANTLE_SECONDS, caption: key('caption.mantle') },
      { id: 'core', duration: CORE_SECONDS, caption: key('caption.core') },
      { id: 'reveal', duration: REVEAL_SECONDS, ease: 'smooth', caption: key('caption.shadow') },
      { id: 'hold', duration: HOLD_SECONDS, caption: key('caption.shadow') },
      { id: 'fade', duration: FADE_SECONDS, ease: 'smooth', caption: key('caption.shadow') },
    ],
  },

  /** 도착한 순간 이미 두 파가 맨틀 속을 퍼지고 있다. 0 이면 진원 한 점뿐인 화면이 먼저 보인다. */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 14,
    wrapWidth: 760,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 지표의 각이다 — 각은 눈금으로 직접 단다.

  messages: seismicWavesMessages,
};
