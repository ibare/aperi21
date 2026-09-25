// ========================================================================
// magnetic-dipole — 선언
// ========================================================================
// 질문: 전류가 도는 고리와 막대자석은 전혀 다른 물건인데, 둘이 만드는 자기장은 어떻게 다른가.
//
// 같은 축척의 두 판을 나란히 둔다 — 왼쪽은 고리 전류의 단면(⊙ · ⊗), 오른쪽은 막대자석.
// 가까이에서는 선 모양이 다르다. 자석의 선을 고리 판에 점선으로 겹친 채 두 판을 같은 배율로
// 줄이면(멀리서 보면) 점선과 실선이 겹친다. 오른손 규칙으로 고리의 N 쪽이 위다.
//
// 식은 쓰지 않는다 — 선이 겹치는 모양으로만 말한다.
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:magnetic-dipole` 와 문자 그대로 일치한다 (C4). */
export const MAGNETIC_DIPOLE_ID = 'magnetic-dipole';

// ------------------------------------------------------------------------
// 스테이지 상수의 기본값 — 저작자가 스테이지에서 바꾼다 (원칙 2).
// 코드는 `physics.readConstants` 로 이 기본값과 함께 읽는다.
// ------------------------------------------------------------------------

/** 고리 반지름(월드, 가까이 본 배율). */
export const LOOP_RADIUS = 0.7;
/** 고리 전류(μ₀/2π = 1 인 단위). */
export const LOOP_CURRENT = 1;
/** 막대자석 길이 · 굵기(월드, 가까이 본 배율). 원기둥으로 본다. */
export const MAGNET_LENGTH = 1.4;
export const MAGNET_WIDTH = 0.6;
/**
 * 막대자석의 쌍극자 세기(고리 모멘트 I·πa² 와 같은 단위). 기본값은 고리와 같게 둔다 —
 * 다르게 두면 멀리서도 두 선이 어긋난다(선 모양은 같고 자리가 다르다).
 */
export const MAGNET_MOMENT = LOOP_CURRENT * Math.PI * LOOP_RADIUS * LOOP_RADIUS;
/**
 * 장선 준위 — k 번째 선은 점 쌍극자라면 적도면에서 `reachMin · reachRatio^k` 를 지난다.
 * 비가 일정해 배율을 줄여도 선 간격의 모양이 비슷하게 남는다.
 */
export const REACH_MIN = 0.9;
export const REACH_RATIO = 1.3;
export const LINE_COUNT = 9;
/** 멀리서 본 배율 — 두 판이 함께 이만큼 줄어든다. */
export const FAR_SCALE = 0.35;
/**
 * 배율을 줄였을 때 화면에서 도달 거리가 이보다 작아진 선은 옅게 — `from` 에서 사라지고 `to`
 * 에서 다 짙다(월드). 멀리서는 원천 곁의 작은 선이 한 점으로 뭉치기 때문이다(NOTES (b)).
 */
export const FADE_REACH_FROM = 0.2;
export const FADE_REACH_TO = 0.45;
/** 고리 윤곽(가로 타원)의 세로 반폭 — 고리를 조금 위에서 본 투영의 몫(월드, 가까이 본 배율). */
export const LOOP_TILT = 0.13;
/** 단면 기호(⊙ · ⊗) 원의 반지름(월드, 가까이 본 배율). */
export const WIRE_MARK = 0.12;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 가까이 — 두 판을 나란히. */
export const NEAR = 3.4;
/** 고리의 N · S 가 떠오르는 동안. */
export const POLE_IN = 0.7;
/** 오른손 규칙 — 고리의 위가 N. */
export const POLES = 3.2;
/** 자석의 선이 고리 판에 점선으로 떠오르는 동안. */
export const GHOST_IN = 0.8;
/** 가까이에서 겹쳐 본다 — 어긋난다. */
export const OVERLAY = 3.2;
/** 멀리 물러나는 동안 — 두 판이 같은 배율로 줄어든다. */
export const ZOOM_OUT = 3.2;
/** 멀리서 — 점선과 실선이 겹친다. */
export const FAR = 5;
/** 처음으로 돌아가는 동안. */
export const RESET = 1.6;

// ------------------------------------------------------------------------
// 프레이밍 — 고정값 (원칙 6 · S-piece)
// ------------------------------------------------------------------------

/** 두 판의 중심(월드 x). 세로 중심은 0. */
export const PANEL_CENTER_X = 2.3;
/** 판 하나의 반폭 · 반높이(월드). 선은 판 안에서 자른다. */
export const PANEL_HALF_W = 2.2;
export const PANEL_HALF_H = 1.95;
/** 두 판과 그 아래 캡션 줄. 매 프레임 같은 값이다. */
export const SCENE_BOUNDS = { minX: -4.55, maxX: 4.55, minY: -2.45, maxY: 2.0 } as const;

/** 캡션 글자 크기 · 줄바꿈 폭 · 바닥에서 띄움(화면 px), 페이드(초). */
export const CAPTION_PX = 13;
export const CAPTION_WRAP_PX = 760;
export const CAPTION_LIFT_PX = -4;
export const CAPTION_FADE_S = 0.25;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const magneticDipoleMessages = Object.freeze({
  'label.title': {
    ko: '자기 쌍극자',
    en: 'Magnetic dipole',
    ja: '磁気双極子',
    zh: '磁偶极子',
    ar: 'ثنائي القطب المغناطيسي',
    es: 'Dipolo magnético',
    fr: 'Dipôle magnétique',
    hi: 'चुंबकीय द्विध्रुव',
    id: 'Dipol magnetik',
    pt: 'Dipolo magnético',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '고리 전류와 자석의 동일성',
    en: 'A current loop and a magnet are the same',
    ja: '円電流と磁石は同じもの',
    zh: '环形电流与磁铁是一回事',
    ar: 'حلقة التيار والمغناطيس شيء واحد',
    es: 'Una espira de corriente y un imán son lo mismo',
    fr: 'Une boucle de courant et un aimant, c’est la même chose',
    hi: 'धारा लूप और चुंबक एक ही हैं',
    id: 'Kawat melingkar berarus dan magnet itu sama',
    pt: 'Uma espira de corrente e um ímã são a mesma coisa',
  },
  'label.stage': {
    ko: '고리와 자석',
    en: 'Loop and magnet',
    ja: '円電流と磁石',
    zh: '环形电流与磁铁',
    ar: 'الحلقة والمغناطيس',
    es: 'Espira e imán',
    fr: 'Boucle et aimant',
    hi: 'लूप और चुंबक',
    id: 'Kawat melingkar dan magnet',
    pt: 'Espira e ímã',
  },
  'label.view': {
    ko: '축을 품은 단면',
    en: 'Cross-section through the axis',
    ja: '軸を含む断面',
    zh: '过轴线的截面',
    ar: 'مقطع يمر بالمحور',
    es: 'Sección que contiene el eje',
    fr: 'Coupe passant par l’axe',
    hi: 'अक्ष से होकर जाता अनुप्रस्थ काट',
    id: 'Penampang melalui sumbu',
    pt: 'Corte que passa pelo eixo',
  },
  // 극 표식 — 도형에 새기는 글자라 두 언어가 같다.
  'label.north': {
    ko: 'N',
    en: 'N',
    ja: 'N',
    zh: 'N',
    ar: 'N',
    es: 'N',
    fr: 'N',
    hi: 'N',
    id: 'N',
    pt: 'N',
  },
  'label.south': {
    ko: 'S',
    en: 'S',
    ja: 'S',
    zh: 'S',
    ar: 'S',
    es: 'S',
    fr: 'S',
    hi: 'S',
    id: 'S',
    pt: 'S',
  },
  'caption.near': {
    ko: '같은 축척으로 나란히 — 왼쪽은 고리 전류, 오른쪽은 막대자석. 가까이에서는 선 모양이 다르다',
    en: 'Side by side at the same scale — a current loop on the left, a bar magnet on the right. Up close the lines differ',
    ja: '同じ縮尺で並べる — 左は円電流、右は棒磁石。近くでは線の形が違う',
    zh: '以相同比例并排 — 左边是环形电流，右边是条形磁铁。在近处，线的形状不同',
    ar: 'جنبًا إلى جنب بالمقياس نفسه — حلقة تيار على اليسار، ومغناطيس قضيبي على اليمين. عن قرب تختلف الخطوط',
    es: 'Lado a lado a la misma escala — una espira de corriente a la izquierda, un imán de barra a la derecha. De cerca, las líneas difieren',
    fr: 'Côte à côte à la même échelle — une boucle de courant à gauche, un aimant droit à droite. De près, les lignes diffèrent',
    hi: 'एक ही पैमाने पर अगल-बगल — बाईं ओर धारा लूप, दाईं ओर छड़ चुंबक। पास से रेखाएँ अलग हैं',
    id: 'Berdampingan dengan skala yang sama — kawat melingkar berarus di kiri, magnet batang di kanan. Dari dekat garisnya berbeda',
    pt: 'Lado a lado na mesma escala — uma espira de corrente à esquerda, um ímã em barra à direita. De perto, as linhas diferem',
  },
  'caption.poles': {
    ko: '고리 위에 N, 아래에 S — 오른쪽 자석과 같은 쪽이다',
    en: 'N above the loop, S below — the same way round as the magnet on the right',
    ja: '円電流の上が N、下が S — 右の磁石と同じ向きだ',
    zh: '环的上方是 N，下方是 S — 与右边的磁铁方向相同',
    ar: 'N فوق الحلقة وS تحتها — بالاتجاه نفسه الذي للمغناطيس على اليمين',
    es: 'N por encima de la espira, S por debajo — con la misma orientación que el imán de la derecha',
    fr: 'N au-dessus de la boucle, S en dessous — dans le même sens que l’aimant de droite',
    hi: 'लूप के ऊपर N, नीचे S — दाईं ओर के चुंबक जैसी ही दिशा में',
    id: 'N di atas kawat melingkar, S di bawah — arahnya sama dengan magnet di kanan',
    pt: 'N acima da espira, S abaixo — no mesmo sentido do ímã da direita',
  },
  'caption.overlay': {
    ko: '자석의 선을 점선으로 고리 위에 겹쳤다 — 가까이에서는 어긋난다',
    en: "The magnet's lines, dashed, laid over the loop — up close they don't match",
    ja: '磁石の線を点線で円電流に重ねた — 近くではずれる',
    zh: '把磁铁的线用虚线叠在环上 — 在近处它们对不上',
    ar: 'خطوط المغناطيس، متقطعةً، فوق الحلقة — عن قرب لا تتطابق',
    es: 'Las líneas del imán, en trazos, sobre la espira — de cerca no coinciden',
    fr: 'Les lignes de l’aimant, en pointillés, posées sur la boucle — de près, elles ne concordent pas',
    hi: 'चुंबक की रेखाएँ, बिंदुदार, लूप पर रखी गईं — पास से वे मेल नहीं खातीं',
    id: 'Garis-garis magnet, putus-putus, ditumpangkan pada kawat melingkar — dari dekat tidak cocok',
    pt: 'As linhas do ímã, tracejadas, sobre a espira — de perto não coincidem',
  },
  'caption.zoomOut': {
    ko: '두 판이 같은 배율로 줄어든다 — 멀리 물러나 본다',
    en: 'Both panels shrink by the same factor — stepping back',
    ja: '二つの画面が同じ倍率で縮む — 遠くへ下がって見る',
    zh: '两个画面按相同倍率缩小 — 退远来看',
    ar: 'تتقلص اللوحتان بالعامل نفسه — نبتعد إلى الخلف',
    es: 'Ambos paneles se reducen en el mismo factor — alejándonos',
    fr: 'Les deux panneaux rétrécissent du même facteur — on prend du recul',
    hi: 'दोनों पैनल एक ही गुणक से छोटे होते हैं — पीछे हटकर देखते हुए',
    id: 'Kedua panel mengecil dengan faktor yang sama — mundur menjauh',
    pt: 'Os dois painéis encolhem pelo mesmo fator — afastando-se',
  },
  'caption.far': {
    ko: '멀리서는 점선과 실선이 겹친다 — 고리 전류의 장은 막대자석의 장과 같은 모양이다',
    en: "From afar the dashed and solid lines coincide — the loop's field has the same shape as the magnet's",
    ja: '遠くからは点線と実線が重なる — 円電流の場は磁石の場と同じ形だ',
    zh: '从远处看，虚线与实线重合 — 环形电流的场与磁铁的场形状相同',
    ar: 'من بعيد تتطابق الخطوط المتقطعة والمتصلة — مجال الحلقة له شكل مجال المغناطيس نفسه',
    es: 'De lejos, las líneas de trazos y las continuas coinciden — el campo de la espira tiene la misma forma que el del imán',
    fr: 'De loin, les lignes en pointillés et en trait plein se confondent — le champ de la boucle a la même forme que celui de l’aimant',
    hi: 'दूर से बिंदुदार और ठोस रेखाएँ मिल जाती हैं — लूप के क्षेत्र का आकार चुंबक के क्षेत्र जैसा ही है',
    id: 'Dari jauh garis putus-putus dan garis penuh berimpit — medan kawat melingkar berbentuk sama dengan medan magnet',
    pt: 'De longe, as linhas tracejadas e contínuas coincidem — o campo da espira tem a mesma forma que o do ímã',
  },
  'caption.reset': {
    ko: '다시 가까이로',
    en: 'Back up close',
    ja: 'ふたたび近くへ',
    zh: '再回到近处',
    ar: 'العودة إلى القرب',
    es: 'De nuevo de cerca',
    fr: 'Retour de près',
    hi: 'फिर से पास',
    id: 'Kembali dari dekat',
    pt: 'De volta de perto',
  },
} satisfies Record<string, LocalizedText>);

export type MagneticDipoleMessageKey = keyof typeof magneticDipoleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MagneticDipoleMessageKey): LocalizedText => magneticDipoleMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MagneticDipoleMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const magneticDipoleSchema: BundleSchema = {
  id: MAGNETIC_DIPOLE_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 가까이 → 극 → 겹치기 → 멀리 로 저절로 간다.
  parameters: [],

  stages: [
    {
      id: 'loop-and-magnet',
      label: text('label.stage'),
      constants: {
        loopRadius: LOOP_RADIUS,
        loopCurrent: LOOP_CURRENT,
        magnetLength: MAGNET_LENGTH,
        magnetWidth: MAGNET_WIDTH,
        magnetMoment: MAGNET_MOMENT,
        reachMin: REACH_MIN,
        reachRatio: REACH_RATIO,
        lineCount: LINE_COUNT,
        farScale: FAR_SCALE,
        fadeReachFrom: FADE_REACH_FROM,
        fadeReachTo: FADE_REACH_TO,
        loopTilt: LOOP_TILT,
        wireMark: WIRE_MARK,
      },
    },
  ],

  environments: [],

  views: [{ id: 'section', label: text('label.view'), default: true }],

  /**
   * 한 주기 = 가까이 → (고리 극이 떠오름) 오른손 규칙 → (자석 선이 점선으로 떠오름) 겹쳐 봄 →
   * 멀리 물러남 → 멀리서 겹침 → 돌아감.
   */
  timeline: {
    phases: [
      { id: 'near', duration: NEAR, caption: key('caption.near') },
      { id: 'poleIn', duration: POLE_IN, ease: 'smooth', caption: key('caption.poles') },
      { id: 'poles', duration: POLES, caption: key('caption.poles') },
      { id: 'ghostIn', duration: GHOST_IN, ease: 'smooth', caption: key('caption.overlay') },
      { id: 'overlay', duration: OVERLAY, caption: key('caption.overlay') },
      { id: 'zoomOut', duration: ZOOM_OUT, ease: 'smooth', caption: key('caption.zoomOut') },
      { id: 'far', duration: FAR, caption: key('caption.far') },
      { id: 'reset', duration: RESET, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  /** 도착한 순간 이미 두 판의 장이 서 있다. */
  startAt: 0.6,

  // 겹침 순서가 판정 장치다 — 자석 면 아래, 장선, 그 위에 점선(겹쳐 본 자석의 선).
  drawOrder: 'scene',

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, CAPTION_LIFT_PX] },
    fontSize: CAPTION_PX,
    wrapWidth: CAPTION_WRAP_PX,
    fade: CAPTION_FADE_S,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 선의 모양이다.

  messages: magneticDipoleMessages,
};
