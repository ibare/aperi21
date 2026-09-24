// ========================================================================
// stress-strain-curve — 선언
// ========================================================================
// 질문: 곡선이 꺾인 곳을 넘도록 당겼다가 힘을 빼면, 막대는 왔던 곡선을 따라
// 원래대로 돌아가는가.
//
// 아니다 — 처음 기울기와 같은 곧은 선으로 내려와 **늘어난 채로 남는다.**
//
// 값은 모두 원본(tasks/piece-lab/stress-strain-curve/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:stress-strain-curve` 와 문자 그대로 일치한다 (C4). */
export const STRESS_STRAIN_CURVE_ID = 'stress-strain-curve';

// ------------------------------------------------------------------------
// 재료 모형 — 원본 상수 (단위는 임의, 탄성 구간을 눈에 보이게 과장)
// ------------------------------------------------------------------------

/** 탄성 기울기. */
export const E = 2.0;
/** 곡선이 꺾이는 변형률. */
export const YIELD_STRAIN = 0.5;
/** 꺾인 뒤 응력이 더 오를 수 있는 폭과 그 길이. */
export const HARDEN_RISE = 0.85;
export const HARDEN_LENGTH = 1.6;

/** 첫 당김(대조군)과 두 번째 당김(꺾인 곳을 넘는다)의 변형률. */
export const SMALL_PULL = 0.4;
export const BIG_PULL = 5.0;

// ------------------------------------------------------------------------
// 시간표 — 원본의 한 바퀴 17 s
// ------------------------------------------------------------------------

/** 두 번째 당김의 길이(s). 원본 5.0 → 10.0. */
export const BIG_PULL_DURATION = 5.0;
/** 두 번째 놓기의 길이(s). 원본 10.6 → 12.2. */
export const BIG_RELEASE_DURATION = 1.6;
/** 놓기 끝 무렵 '남은 늘어남' 이 나타나기 시작하는 때 — 놓기가 끝나기 이만큼 전(s). 원본 12.0. */
export const REVEAL_LEAD = 0.2;
/** '남은 늘어남' 이 다 나타나기까지(s). 원본 0.5. */
export const REVEAL_FADE = 0.5;

/**
 * 두 번째 당김에서 변형률이 꺾이는 곳(0.5)에 닿는 때(당김 시작부터, s).
 *
 * 원본 캡션은 **변형률로** 문장을 골랐다(`e <= 항복변형률`). 당김은 smoothstep 으로
 * 정해져 있어 그 순간은 시각 하나로 정해진다 — 그 시각에서 단계를 갈라 캡션을
 * 시간표가 고르게 한다. 당김 모양을 바꾸면 이 값도 따라 바뀐다.
 */
export const ELASTIC_PULL_DURATION = (() => {
  const target = YIELD_STRAIN / BIG_PULL;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (mid * mid * (3 - 2 * mid) < target) lo = mid;
    else hi = mid;
  }
  return BIG_PULL_DURATION * ((lo + hi) / 2);
})();

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const stressStrainCurveMessages = Object.freeze({
  'label.title': {
    ko: '응력-변형률 곡선',
    en: 'Stress–strain curve',
    ja: '応力–ひずみ曲線',
    zh: '应力–应变曲线',
    ar: 'منحنى الإجهاد–الانفعال',
    es: 'Curva esfuerzo–deformación',
    fr: 'Courbe contrainte–déformation',
    hi: 'प्रतिबल–विकृति वक्र',
    id: 'Kurva tegangan–regangan',
    pt: 'Curva tensão–deformação',
  },
  'label.operation': {
    ko: '당길수록 달라지는 재료의 반응',
    en: 'How a material responds as it is pulled',
    ja: '引っ張るにつれて変わる材料の応答',
    zh: '材料在被拉伸时如何响应',
    ar: 'كيف تستجيب المادة عند شدّها',
    es: 'Cómo responde un material al estirarlo',
    fr: 'Comment un matériau réagit quand on le tire',
    hi: 'खींचने पर पदार्थ कैसे प्रतिक्रिया करता है',
    id: 'Bagaimana bahan merespons saat ditarik',
    pt: 'Como um material responde ao ser puxado',
  },
  'label.stage': {
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
  /** 막대 끝이 처음 있던 자리. */
  'label.initialLength': {
    ko: '처음 길이',
    en: 'original length',
    ja: 'もとの長さ',
    zh: '原长',
    ar: 'الطول الأصلي',
    es: 'longitud original',
    fr: 'longueur initiale',
    hi: 'मूल लंबाई',
    id: 'panjang awal',
    pt: 'comprimento original',
  },
  /** 힘을 빼도 남은 늘어남 — 막대 괄호 위. */
  'label.residual': {
    ko: '남은 늘어남',
    en: 'permanent stretch',
    ja: '残った伸び',
    zh: '残余伸长',
    ar: 'استطالة دائمة',
    es: 'alargamiento permanente',
    fr: 'allongement permanent',
    hi: 'स्थायी खिंचाव',
    id: 'pertambahan panjang permanen',
    pt: 'alongamento permanente',
  },
  /** 곡선 축 이름. */
  'label.stress': {
    ko: '응력',
    en: 'stress',
    ja: '応力',
    zh: '应力',
    ar: 'الإجهاد',
    es: 'esfuerzo',
    fr: 'contrainte',
    hi: 'प्रतिबल',
    id: 'tegangan',
    pt: 'tensão',
  },
  'label.strain': {
    ko: '변형률',
    en: 'strain',
    ja: 'ひずみ',
    zh: '应变',
    ar: 'الانفعال',
    es: 'deformación',
    fr: 'déformation',
    hi: 'विकृति',
    id: 'regangan',
    pt: 'deformação',
  },
  /** 원점 표시. 수라 번역 대상이 아니다 (C1 판정 3). */
  'label.origin': {
    ko: '0',
    en: '0',
    ja: '0',
    zh: '0',
    ar: '0',
    es: '0',
    fr: '0',
    hi: '0',
    id: '0',
    pt: '0',
  },
  'caption.pullSmall': {
    ko: '조금만 당긴다',
    en: 'Pull it just a little',
    ja: '少しだけ引っ張る',
    zh: '只轻轻拉一点',
    ar: 'اسحبه قليلًا فقط',
    es: 'Estíralo solo un poco',
    fr: 'On le tire juste un peu',
    hi: 'इसे बस थोड़ा सा खींचें',
    id: 'Tarik sedikit saja',
    pt: 'Puxe só um pouco',
  },
  'caption.returns': {
    ko: '놓으면 올라간 선을 따라 내려와 처음 길이로 돌아온다',
    en: 'Let go, and it comes back down the same line to its original length',
    ja: '離すと、上ってきた線をたどって下り、もとの長さに戻る',
    zh: '松手后，它沿着同一条线降回，回到原长',
    ar: 'اتركه، فيعود نازلًا على الخط نفسه إلى طوله الأصلي',
    es: 'Al soltarlo, baja por la misma línea y vuelve a su longitud original',
    fr: 'Quand on lâche, il redescend la même ligne jusqu’à sa longueur initiale',
    hi: 'छोड़ते ही यह उसी रेखा पर नीचे लौटकर अपनी मूल लंबाई पर आ जाता है',
    id: 'Lepaskan, dan ia turun kembali di garis yang sama ke panjang awalnya',
    pt: 'Ao soltar, ele desce pela mesma linha e volta ao comprimento original',
  },
  'caption.pullFar': {
    ko: '이번엔 더 멀리 당긴다',
    en: 'This time, pull it much farther',
    ja: '今度はずっと遠くまで引っ張る',
    zh: '这次拉得远得多',
    ar: 'هذه المرة، اسحبه أبعد بكثير',
    es: 'Esta vez, estíralo mucho más',
    fr: 'Cette fois, on le tire beaucoup plus loin',
    hi: 'इस बार इसे कहीं ज़्यादा दूर तक खींचें',
    id: 'Kali ini, tarik jauh lebih panjang',
    pt: 'Desta vez, puxe bem mais longe',
  },
  'caption.yield': {
    ko: '곡선이 꺾인 뒤로는 힘을 조금만 더해도 훨씬 많이 늘어난다',
    en: 'Past the bend, a little more force stretches it much more',
    ja: '曲がり目を過ぎると、少し力を足すだけでずっと大きく伸びる',
    zh: '过了弯折处，再加一点力就会伸长得多得多',
    ar: 'بعد الانعطاف، تكفي قوة إضافية صغيرة ليستطيل أكثر بكثير',
    es: 'Pasado el codo, un poco más de fuerza lo alarga mucho más',
    fr: 'Passé le coude, un peu plus de force l’allonge beaucoup plus',
    hi: 'मोड़ के बाद, थोड़ा और बल लगाने पर यह कहीं ज़्यादा खिंच जाता है',
    id: 'Setelah tikungan, sedikit tambahan gaya membuatnya jauh lebih memanjang',
    pt: 'Depois da dobra, um pouco mais de força o estica muito mais',
  },
  'caption.stays': {
    ko: '놓아도 곡선을 되짚지 않고 곧게 내려와, 늘어난 채로 남는다',
    en: 'Let go, and it does not retrace the curve — it drops straight and stays stretched',
    ja: '離しても曲線をたどり直さず、まっすぐ下りて、伸びたまま残る',
    zh: '松手后，它不沿曲线返回——而是笔直降下，保持伸长',
    ar: 'اتركه، فلا يعود على المنحنى — بل ينزل مستقيمًا ويبقى مستطيلًا',
    es: 'Al soltarlo, no vuelve por la curva — baja en línea recta y queda alargado',
    fr: 'Quand on lâche, il ne repasse pas par la courbe — il descend tout droit et reste allongé',
    hi: 'छोड़ने पर यह वक्र पर वापस नहीं लौटता — सीधा नीचे आता है और खिंचा हुआ ही रह जाता है',
    id: 'Lepaskan, dan ia tidak menelusuri kembali kurvanya — ia turun lurus dan tetap memanjang',
    pt: 'Ao soltar, ele não refaz a curva — desce em linha reta e fica esticado',
  },
  'caption.again': {
    ko: '새 막대로 다시',
    en: 'Again, with a new bar',
    ja: '新しい棒でもう一度',
    zh: '换一根新棒再来',
    ar: 'مرة أخرى، بقضيب جديد',
    es: 'Otra vez, con una barra nueva',
    fr: 'Encore une fois, avec une barre neuve',
    hi: 'एक नई छड़ के साथ फिर से',
    id: 'Sekali lagi, dengan batang baru',
    pt: 'De novo, com uma barra nova',
  },
} satisfies Record<string, LocalizedText>);

export type StressStrainCurveMessageKey = keyof typeof stressStrainCurveMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StressStrainCurveMessageKey): LocalizedText => stressStrainCurveMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StressStrainCurveMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const stressStrainCurveSchema: BundleSchema = {
  id: STRESS_STRAIN_CURVE_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 작은 당김 / 큰 당김의 대조만으로 주장이 끝난다.
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본은 860 × 300 한 장(캡션 포함). 러너가 사방에 여백을 두므로 그만큼 더 잡는다. */
  canvas: { height: 340, minHeight: 300 },

  /** 원본은 시계를 0.8 s 앞당겨 열었다 — 첫 화면에서 이미 당기는 중이다. */
  startAt: 0.8,

  /**
   * 한 바퀴 17 s — 원본 일정 그대로.
   *
   *  0.0 조금 당김 → 2.0 멈춤 → 2.6 놓기 → 4.2 쉼
   *  5.0 멀리 당김(꺾이기 전 / 꺾인 뒤) → 10.0 멈춤 → 10.6 놓기(끝 0.2 s 에 남은 늘어남이 나타남)
   *  12.2 쉼 → 15.5 흐려짐 → 16.4 새 막대
   *
   * 멀리 당김과 놓기는 **두 단계에 걸친 한 동작**이다. 이징은 scene 이 두 단계를
   * 합친 구간에 `span(…, 'smooth')` 으로 건다 — 단계 이징으로 걸면 가른 자리에서
   * 속도가 0 이 되어 멈칫한다.
   */
  timeline: {
    phases: [
      { id: 'pull-small', duration: 2.0, ease: 'smooth', caption: key('caption.pullSmall') },
      { id: 'hold-small', duration: 0.6, caption: key('caption.pullSmall') },
      { id: 'release-small', duration: 1.6, ease: 'smooth', caption: key('caption.returns') },
      { id: 'rest-small', duration: 0.8, caption: key('caption.returns') },
      { id: 'pull-elastic', duration: ELASTIC_PULL_DURATION, caption: key('caption.pullFar') },
      { id: 'pull-plastic', duration: BIG_PULL_DURATION - ELASTIC_PULL_DURATION, caption: key('caption.yield') },
      { id: 'hold-far', duration: 0.6, caption: key('caption.yield') },
      { id: 'release-far', duration: BIG_RELEASE_DURATION - REVEAL_LEAD, caption: key('caption.stays') },
      { id: 'release-reveal', duration: REVEAL_LEAD, caption: key('caption.stays') },
      { id: 'rest-far', duration: 3.3, caption: key('caption.stays') },
      { id: 'fade', duration: 0.9, ease: 'smooth', caption: key('caption.again') },
      { id: 'enter', duration: 0.6, ease: 'smooth', caption: key('caption.again') },
    ],
  },

  // 원본이 그린 순서대로 겹친다 — 벽 · 처음 길이 · 막대 · 힘 · 괄호 · 축 · 자취 · 남은 선분 · 점.
  drawOrder: 'scene',

  // 슬롯 하나. 원본 자리 — 벽 왼쪽 20 px, 위에서 280 px, 왼쪽 정렬 16 px 먹색.
  caption: {
    anchor: { world: [20, 20] },
    align: 'left',
    fontSize: 16,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 곡선 축은 원점이 "돌아왔는가" 의 판정
   * 기준이라 두지만, 눈금·격자·숫자는 두지 않는다 — 값의 크기는 주장이 아니다.
   */

  messages: stressStrainCurveMessages,
};
