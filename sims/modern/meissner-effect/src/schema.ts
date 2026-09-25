// ========================================================================
// meissner-effect — 선언
// ========================================================================
// 질문: 초전도체는 저항이 0 인 도체일 뿐인가?
//
// 아니다 — 자기장을 **밀어낸다.** 임계 온도 위에서는 자석의 자기력선이 시료를
// 그대로 지나가지만, 식혀 초전도가 되면 자기력선이 시료 밖으로 밀려나 휘돌아 가고,
// 그 위에 얹혀 있던 자석이 밀려 올라가 뜬다. 다시 데우면 자기력선이 돌아오고 자석이
// 내려앉는다.
//
// 저항이 0 이 되는 것(저항 곡선)은 이웃 조각 `superconductivity` 의 몫이다 — 여기에는
// 저항 곡선이 없다. 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:meissner-effect` 와 문자 그대로 일치한다 (C4). */
export const MEISSNER_EFFECT_ID = 'meissner-effect';

// ------------------------------------------------------------------------
// 물리 · 배치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 길이는 모두 월드 단위. 옆에서 본 단면이다.
// ------------------------------------------------------------------------

/** 시료 단면(납작한 타원)의 반너비 · 반두께. 중심은 원점이다. */
export const SAMPLE_HALF_WIDTH = 2.8;
export const SAMPLE_HALF_THICKNESS = 0.32;
/** 막대자석의 너비 · 높이. N 극이 아래(시료 쪽)다. */
export const MAGNET_WIDTH = 0.56;
export const MAGNET_HEIGHT = 1.8;
/**
 * 자극이 자석 끝면에서 안으로 들어간 깊이. 자극을 끝면에 두면 자기력선이 한 점에서
 * 뿜어져 나와 시료 면과 맞닿은 곳에서 계산이 날카로워진다.
 */
export const POLE_INSET = 0.14;
/** 완전히 밀어냈을 때 자석 밑면과 시료 윗면 사이의 틈(떠오른 높이). */
export const HOVER_GAP = 0.7;
/** 자석의 N 극 끝면에서 시료 쪽(아래 반원)으로 뻗어 나가는 자기력선 수. */
export const LINE_COUNT = 18;

/**
 * 프레이밍은 주장의 일부다. 가로는 시료 양 끝 너머로 휘돌아 가는 자기력선과 왼쪽
 * 이름표까지, 세로는 시료 아래로 빠져나가는 자기력선(아래)부터 떠오른 자석(위)까지.
 * 캡션 슬롯은 프레이밍 여백으로 잡히지 않아 아래 한 줄 자리를 미리 잡는다 (장부 G24).
 * 매 프레임 같은 값이다 — 자석이 떠올라도 경계는 그대로다.
 */
export const SCENE_BOUNDS = { minX: -4.6, maxX: 4.6, minY: -1.65, maxY: 2.95 } as const;
/** 자기력선을 그리는 창. 캡션 줄 위에서 끊는다 — 글자 뒤로 선이 지나가지 않게. */
export const FIELD_CLIP = { min: [-4.6, -1.12], max: [4.6, 2.95] } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초). 경계는 선언이 정하고 physics 는 `at()` 으로 묻는다.
// ------------------------------------------------------------------------

/** 임계 온도 위 — 자기력선이 시료를 그대로 지나가는 것을 읽는 동안. */
export const WARM = 2.8;
/** 온도 이름표가 `T > Tc` 에서 `T < Tc` 로 바뀌는 두 반(나감 · 들어옴). */
export const SWAP_OUT = 0.5;
export const SWAP_IN = 0.5;
/** 자기력선이 밀려나며 자석이 떠오르는 동안. */
export const EXPEL = 2.2;
/** 뜬 채 머무는 동안. */
export const HOVER = 3.2;
/** 다시 데워 자기력선이 돌아오고 자석이 내려앉는 동안. */
export const SETTLE = 1.8;
/** 도착한 순간 이미 자기력선이 시료를 꿰뚫고 있다 — 첫 단계의 중간에서 연다. */
export const START_AT = 1.0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const meissnerEffectMessages = Object.freeze({
  'label.title': { ko: '마이스너 효과', en: 'Meissner effect', ja: 'マイスナー効果', zh: '迈斯纳效应', ar: 'تأثير مايسنر', es: 'Efecto Meissner', fr: 'Effet Meissner', hi: 'माइस्नर प्रभाव', id: 'Efek Meissner', pt: 'Efeito Meissner' },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '자기장을 밀어내는 초전도체',
    en: 'A superconductor pushes out the magnetic field',
    ja: '超伝導体が磁場を押し出す',
    zh: '超导体把磁场排斥出去',
    ar: 'الموصل الفائق يطرد المجال المغناطيسي',
    es: 'Un superconductor expulsa el campo magnético',
    fr: 'Un supraconducteur expulse le champ magnétique',
    hi: 'अतिचालक चुंबकीय क्षेत्र को बाहर धकेल देता है',
    id: 'Superkonduktor mendorong keluar medan magnet',
    pt: 'Um supercondutor expulsa o campo magnético',
  },
  'label.stage': { ko: '시료 위의 자석', en: 'A magnet on the sample', ja: '試料の上の磁石', zh: '样品上的磁铁', ar: 'مغناطيس فوق العيّنة', es: 'Un imán sobre la muestra', fr: 'Un aimant sur l’échantillon', hi: 'नमूने पर रखा चुंबक', id: 'Magnet di atas sampel', pt: 'Um ímã sobre a amostra' },
  'label.view': { ko: '옆모습', en: 'Side view', ja: '側面図', zh: '侧视图', ar: 'منظر جانبي', es: 'Vista lateral', fr: 'Vue de côté', hi: 'पार्श्व दृश्य', id: 'Tampak samping', pt: 'Vista lateral' },
  /** 시료 이름. 온도와 무관하게 같은 물질이다. */
  'label.sample': { ko: '초전도체', en: 'superconductor', ja: '超伝導体', zh: '超导体', ar: 'موصل فائق', es: 'superconductor', fr: 'supraconducteur', hi: 'अतिचालक', id: 'superkonduktor', pt: 'supercondutor' },
  /** 온도 이름표. 기호 조립이라 표식에 가깝지만 화면 문자는 모두 선언에 둔다 (C1). */
  'label.warm': { ko: 'T > Tc', en: 'T > Tc', ja: 'T > Tc', zh: 'T > Tc', ar: 'T > Tc', es: 'T > Tc', fr: 'T > Tc', hi: 'T > Tc', id: 'T > Tc', pt: 'T > Tc' },
  'label.cold': { ko: 'T < Tc', en: 'T < Tc', ja: 'T < Tc', zh: 'T < Tc', ar: 'T < Tc', es: 'T < Tc', fr: 'T < Tc', hi: 'T < Tc', id: 'T < Tc', pt: 'T < Tc' },
  /** 자석의 극. 표식이다 (C1 판정 1). */
  'label.north': { ko: 'N', en: 'N', ja: 'N', zh: 'N', ar: 'N', es: 'N', fr: 'N', hi: 'N', id: 'N', pt: 'N' },
  'label.south': { ko: 'S', en: 'S', ja: 'S', zh: 'S', ar: 'S', es: 'S', fr: 'S', hi: 'S', id: 'S', pt: 'S' },
  'caption.warm': {
    ko: '임계 온도 위 — 자석의 자기력선이 시료를 그대로 지나간다',
    en: 'Above the critical temperature, the magnet’s field lines pass straight through the sample',
    ja: '臨界温度より上では、磁石の磁力線が試料をそのまま通り抜ける',
    zh: '高于临界温度时，磁铁的磁感线径直穿过样品',
    ar: 'فوق درجة الحرارة الحرجة، تمر خطوط مجال المغناطيس عبر العيّنة مباشرةً',
    es: 'Por encima de la temperatura crítica, las líneas de campo del imán atraviesan la muestra sin desviarse',
    fr: 'Au-dessus de la température critique, les lignes de champ de l’aimant traversent l’échantillon sans dévier',
    hi: 'क्रांतिक ताप से ऊपर चुंबक की क्षेत्र रेखाएँ नमूने के आर-पार सीधी गुज़रती हैं',
    id: 'Di atas suhu kritis, garis medan magnet menembus sampel begitu saja',
    pt: 'Acima da temperatura crítica, as linhas de campo do ímã atravessam a amostra sem desviar',
  },
  'caption.cool': {
    ko: '시료를 임계 온도 아래로 식힌다',
    en: 'The sample is cooled below the critical temperature',
    ja: '試料を臨界温度より下まで冷やす',
    zh: '把样品冷却到临界温度以下',
    ar: 'تُبرَّد العيّنة إلى ما دون درجة الحرارة الحرجة',
    es: 'La muestra se enfría por debajo de la temperatura crítica',
    fr: 'L’échantillon est refroidi sous la température critique',
    hi: 'नमूने को क्रांतिक ताप से नीचे ठंडा किया जाता है',
    id: 'Sampel didinginkan hingga di bawah suhu kritis',
    pt: 'A amostra é resfriada abaixo da temperatura crítica',
  },
  'caption.expel': {
    ko: '자기력선이 시료 밖으로 밀려나고, 자석이 밀려 올라간다',
    en: 'The field lines are pushed out of the sample, and the magnet is pushed up',
    ja: '磁力線が試料の外へ押し出され、磁石が押し上げられる',
    zh: '磁感线被排出样品，磁铁被向上推起',
    ar: 'تُدفَع خطوط المجال إلى خارج العيّنة، ويُدفَع المغناطيس إلى أعلى',
    es: 'Las líneas de campo son expulsadas de la muestra y el imán es empujado hacia arriba',
    fr: 'Les lignes de champ sont chassées de l’échantillon, et l’aimant est repoussé vers le haut',
    hi: 'क्षेत्र रेखाएँ नमूने से बाहर धकेल दी जाती हैं, और चुंबक ऊपर धकेला जाता है',
    id: 'Garis medan terdorong keluar dari sampel, dan magnet terdorong ke atas',
    pt: 'As linhas de campo são expulsas da amostra, e o ímã é empurrado para cima',
  },
  'caption.hover': {
    ko: '자기력선은 시료를 비켜 휘돌아 가고, 자석은 뜬 채 머문다',
    en: 'The field lines bend around the sample, and the magnet stays afloat',
    ja: '磁力線は試料を避けて回り込み、磁石は浮いたままとどまる',
    zh: '磁感线绕过样品弯曲而行，磁铁一直悬浮着',
    ar: 'تنحني خطوط المجال حول العيّنة، ويبقى المغناطيس معلّقًا',
    es: 'Las líneas de campo rodean la muestra y el imán sigue flotando',
    fr: 'Les lignes de champ contournent l’échantillon, et l’aimant reste en lévitation',
    hi: 'क्षेत्र रेखाएँ नमूने के चारों ओर मुड़कर निकलती हैं, और चुंबक हवा में टिका रहता है',
    id: 'Garis medan membelok mengitari sampel, dan magnet tetap melayang',
    pt: 'As linhas de campo contornam a amostra, e o ímã continua flutuando',
  },
  'caption.warmAgain': {
    ko: '다시 임계 온도 위로 데운다',
    en: 'The sample is warmed back above the critical temperature',
    ja: '試料を再び臨界温度より上まで温める',
    zh: '把样品重新加热到临界温度以上',
    ar: 'تُسخَّن العيّنة من جديد إلى ما فوق درجة الحرارة الحرجة',
    es: 'La muestra se calienta de nuevo por encima de la temperatura crítica',
    fr: 'L’échantillon est réchauffé au-dessus de la température critique',
    hi: 'नमूने को फिर से क्रांतिक ताप से ऊपर गर्म किया जाता है',
    id: 'Sampel dihangatkan kembali hingga di atas suhu kritis',
    pt: 'A amostra é aquecida de novo acima da temperatura crítica',
  },
  'caption.settle': {
    ko: '자기력선이 다시 시료를 지나가고, 자석이 내려앉는다',
    en: 'The field lines pass through the sample again, and the magnet settles down',
    ja: '磁力線が再び試料を通り抜け、磁石が下りて落ち着く',
    zh: '磁感线再次穿过样品，磁铁落回原处',
    ar: 'تعود خطوط المجال لتمر عبر العيّنة، ويهبط المغناطيس ويستقر',
    es: 'Las líneas de campo vuelven a atravesar la muestra y el imán se asienta',
    fr: 'Les lignes de champ traversent de nouveau l’échantillon, et l’aimant redescend se poser',
    hi: 'क्षेत्र रेखाएँ फिर से नमूने से गुज़रती हैं, और चुंबक नीचे आकर टिक जाता है',
    id: 'Garis medan kembali menembus sampel, lalu magnet turun dan diam',
    pt: 'As linhas de campo voltam a atravessar a amostra, e o ímã desce e se assenta',
  },
} satisfies Record<string, LocalizedText>);

export type MeissnerEffectMessageKey = keyof typeof meissnerEffectMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MeissnerEffectMessageKey): LocalizedText => meissnerEffectMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MeissnerEffectMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const meissnerEffectSchema: BundleSchema = {
  id: MEISSNER_EFFECT_ID,
  label: text('label.title'),
  category: 'modern',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 자기력선이 시료를 지나가고 있고, 식으면 밀려나며 자석이 뜨고,
  // 데우면 돌아온다. 온도 슬라이더를 두면 임계 온도를 건너뛰는 한 번의 끌기로 끝나
  // 「밀려나는 동안」 을 볼 수 없다.
  parameters: [],

  stages: [
    {
      id: 'magnet-on-sample',
      label: text('label.stage'),
      constants: {
        sampleHalfWidth: SAMPLE_HALF_WIDTH,
        sampleHalfThickness: SAMPLE_HALF_THICKNESS,
        magnetWidth: MAGNET_WIDTH,
        magnetHeight: MAGNET_HEIGHT,
        poleInset: POLE_INSET,
        hoverGap: HOVER_GAP,
        lineCount: LINE_COUNT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 넓은 옆모습 하나와 캡션 한 줄. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 자기력선은 시료 **위에** 그어야 「시료를 지나간다」 로 읽히고,
   * 자석은 자기력선 **위에** 덮여야 선이 자석 끝면에서 나오는 것으로 읽힌다.
   * 시료 → 자기력선 → 자석 → 글자 순서로 쓴다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 보통 상태(지나감) → 식힘(이름표 교체) → 밀려남 · 떠오름 → 뜬 채 머묾 →
   * 데움(이름표 교체) → 돌아옴 · 내려앉음. 끝이 처음과 같은 화면이라 이음매가 없다.
   */
  timeline: {
    phases: [
      { id: 'warm', duration: WARM, caption: key('caption.warm') },
      { id: 'cool-out', duration: SWAP_OUT, caption: key('caption.cool') },
      { id: 'cool-in', duration: SWAP_IN, caption: key('caption.cool') },
      { id: 'expel', duration: EXPEL, ease: 'inOutCubic', caption: key('caption.expel') },
      { id: 'hover', duration: HOVER, caption: key('caption.hover') },
      { id: 'heat-out', duration: SWAP_OUT, caption: key('caption.warmAgain') },
      { id: 'heat-in', duration: SWAP_IN, caption: key('caption.warmAgain') },
      { id: 'settle', duration: SETTLE, ease: 'inOutCubic', caption: key('caption.settle') },
    ],
  },

  /** 도착한 순간 자기력선이 이미 시료를 꿰뚫고 있다. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 거리가 없다 — 읽을 것은 선이 어디로 가는가다. */

  messages: meissnerEffectMessages,
};
