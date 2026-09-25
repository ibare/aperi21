// ========================================================================
// lens-combination — 선언
// ========================================================================
// 질문: 렌즈를 하나 더 붙이면 나란한 빛이 모이는 자리는 어떻게 되는가.
//
// 답: 볼록 렌즈 L₁ 하나로는 줄기가 렌즈 뒤 멀리서 모인다. 같은 렌즈 L₂ 를 붙이면 줄기가
// 더 가파르게 꺾여 초점이 렌즈 쪽으로 다가오고, 오목 렌즈 L₂ 를 붙이면 덜 꺾여 초점이
// 멀어진다. 옆의 굴절력 막대는 붙인 렌즈의 칸이 쌓이거나(볼록) 깎는(오목) 것으로
// 같은 일을 막대 길이로 보인다.
//
// 떨어뜨린 두 렌즈(현미경 · 망원경)는 `microscope` · `telescope` 의 몫이다. 이 조각은
// 붙인 두 렌즈만 말한다. 볼록 · 오목 렌즈 하나의 초점은 `converging-diverging-lens` 의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:lens-combination` 와 문자 그대로 일치한다 (C4). */
export const LENS_COMBINATION_ID = 'lens-combination';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** L₁ 의 초점 거리(cm). */
export const FOCAL_ONE_CM = 20;
/** 두 번째로 붙이는 볼록 렌즈 L₂ 의 초점 거리(cm). L₁ 과 같은 렌즈다. */
export const FOCAL_SAME_CM = 20;
/** 세 번째로 붙이는 오목 렌즈 L₂ 의 초점 거리(cm). 오목이라 음수다. */
export const FOCAL_CONCAVE_CM = -40;

/**
 * 화면에 띄우는 초점 거리 · 굴절력 글자 — **정박값**이다. 위 초점 거리에서 계산하지
 * 않는다(S-piece 유효숫자). 초점 거리를 바꾸면 이것도 함께 바꾼다 (NOTES (c) G143).
 */
export const SHOWN_FOCUS_ONE_CM = 20;
export const SHOWN_FOCUS_TWO_CM = 10;
export const SHOWN_FOCUS_MIX_CM = 40;
export const SHOWN_POWER_ONE_D = 5;
export const SHOWN_POWER_TWO_D = 10;
export const SHOWN_POWER_MIX_D = 2.5;

/** 월드 1 단위가 나타내는 cm. 표시 배율이다. */
export const CM_PER_UNIT = 10;
/** 굴절력 1 D 가 막대에서 차지하는 높이(월드). 표시 배율이다. */
export const UNIT_PER_DIOPTRE = 0.22;

/** 평행 줄기 수. 가운데 줄기가 축 위를 지나도록 홀수로 둔다. */
export const RAY_COUNT = 5;
/** 이웃 줄기 사이 간격(월드). */
export const RAY_SPACING = 0.4;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 광축은 y = 0, 두 렌즈가 맞닿는 자리가 x = 0 이다.
// ------------------------------------------------------------------------

/** 렌즈 반높이(월드). 가장 바깥 줄기(간격 × 2)보다 조금 크다. */
export const LENS_HALF = 1.05;
/** 볼록 렌즈 가운데 반두께(월드). */
export const CONVEX_CENTER_HALF = 0.16;
/** 볼록 렌즈 가장자리 반두께(월드). 날이 서지 않게 조금 남긴다. */
export const CONVEX_EDGE_HALF = 0.03;
/** 오목 렌즈 가운데 반두께(월드). */
export const CONCAVE_CENTER_HALF = 0.04;
/** 오목 렌즈 가장자리 반두께(월드). */
export const CONCAVE_EDGE_HALF = 0.18;
/** 붙이러 오는 렌즈가 내려오기 시작하는 높이(월드, 제자리 위). */
export const LENS_DROP = 0.9;

/** 줄기가 출발하는 x(월드). */
export const RAY_START_X = -2.6;
/**
 * 줄기가 초점을 지나 더 가는 거리(월드). 초점 뒤에서 엇갈려 나가는 것이 보인다. 두 렌즈를 붙였을 때
 * 줄 끝이 빈 고리(L₁ 하나일 때의 초점, 월드 2)에 닿지 않게 1 보다 짧다.
 */
export const RAY_OVERSHOOT = 0.7;
/** 광축 보조선의 왼쪽 · 오른쪽 끝(월드). */
export const AXIS_FROM_X = -2.8;
export const AXIS_TO_X = 5.3;

/** 초점 거리 치수선의 높이(월드). 렌즈 아래 끝보다 낮다. */
export const DIMENSION_Y = -1.42;

/** 굴절력 막대의 왼쪽 x 와 폭(월드). */
export const BAR_X = 6.3;
export const BAR_WIDTH = 0.5;
/** 굴절력 막대 바닥(0 D)의 y(월드). */
export const BAR_BASE_Y = -1.2;

/** 렌즈 이름표 `L₁` · `L₂` 가 렌즈 위 끝에서 더 올라간 거리(월드). */
export const LENS_LABEL_GAP = 0.26;
/** 두 렌즈 이름표가 맞닿는 자리(x = 0)에서 좌우로 벌어진 거리(월드). */
export const LENS_LABEL_SPREAD = 0.3;
/** 막대 칸 이름표가 막대 왼쪽 가장자리에서 떨어진 거리(월드). */
export const BAR_TAG_GAP = 0.3;
/** 막대 값 글자가 막대 오른쪽 가장자리에서 떨어진 거리(월드). */
export const BAR_VALUE_GAP = 0.6;
/** 막대 이름 `굴절력` 이 막대 바닥에서 내려간 거리(월드). */
export const BAR_NAME_DROP = 0.32;
/** 초점 점의 반지름(월드). */
export const FOCUS_DOT_RADIUS = 0.07;

/**
 * 프레이밍 — 가로는 줄기 출발점부터 막대 값 글자까지, 세로는 내려오는 렌즈 이름표부터
 * 치수선 · 막대 이름 아래 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -2.9, maxX: 7.6, minY: -2.35, maxY: 2.45 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const lensCombinationMessages = Object.freeze({
  'label.title': {
    ko: '렌즈의 조합',
    en: 'Combining lenses',
    ja: 'レンズの組み合わせ',
    zh: '透镜组合',
    ar: 'تركيب العدسات',
    es: 'Combinación de lentes',
    fr: 'Association de lentilles',
    hi: 'लेंसों का संयोजन',
    id: 'Kombinasi lensa',
    pt: 'Combinação de lentes',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '두 렌즈가 만드는 합성 초점',
    en: 'The combined focus of two lenses',
    ja: '二枚のレンズの合成焦点',
    zh: '两片透镜的合成焦点',
    ar: 'البؤرة المركّبة لعدستين',
    es: 'El foco combinado de dos lentes',
    fr: 'Le foyer combiné de deux lentilles',
    hi: 'दो लेंसों का संयुक्त फोकस',
    id: 'Titik fokus gabungan dua lensa',
    pt: 'O foco combinado de duas lentes',
  },
  'label.stage': {
    ko: '붙인 두 렌즈',
    en: 'Two lenses in contact',
    ja: '密着した二枚のレンズ',
    zh: '紧贴的两片透镜',
    ar: 'عدستان متلامستان',
    es: 'Dos lentes en contacto',
    fr: 'Deux lentilles accolées',
    hi: 'संपर्क में दो लेंस',
    id: 'Dua lensa yang berimpit',
    pt: 'Duas lentes em contato',
  },
  'label.view': {
    ko: '광축과 굴절력 막대',
    en: 'Optical axis and power bar',
    ja: '光軸と屈折力の棒',
    zh: '主光轴与光焦度条',
    ar: 'المحور البصري وشريط القوة البصرية',
    es: 'Eje óptico y barra de potencia',
    fr: 'Axe optique et barre de vergence',
    hi: 'प्रकाशिक अक्ष और क्षमता पट्टी',
    id: 'Sumbu optik dan batang kuat lensa',
    pt: 'Eixo óptico e barra de vergência',
  },

  /** 렌즈 이름표 — 기호라 두 언어가 같다. */
  'label.lensOne': {
    ko: 'L₁',
    en: 'L₁',
    ja: 'L₁',
    zh: 'L₁',
    ar: 'L₁',
    es: 'L₁',
    fr: 'L₁',
    hi: 'L₁',
    id: 'L₁',
    pt: 'L₁',
  },
  'label.lensTwo': {
    ko: 'L₂',
    en: 'L₂',
    ja: 'L₂',
    zh: 'L₂',
    ar: 'L₂',
    es: 'L₂',
    fr: 'L₂',
    hi: 'L₂',
    id: 'L₂',
    pt: 'L₂',
  },
  /** 막대 이름. */
  'label.power': {
    ko: '굴절력',
    en: 'power',
    ja: '屈折力',
    zh: '光焦度',
    ar: 'القوة البصرية',
    es: 'potencia',
    fr: 'vergence',
    hi: 'क्षमता',
    id: 'kuat lensa',
    pt: 'vergência',
  },
  /** 초점 거리 치수선 글자. */
  'label.focusCm': {
    ko: '{f} cm',
    en: '{f} cm',
    ja: '{f} cm',
    zh: '{f} cm',
    ar: '{f} cm',
    es: '{f} cm',
    fr: '{f} cm',
    hi: '{f} cm',
    id: '{f} cm',
    pt: '{f} cm',
  },
  /** 막대 꼭대기 값 글자. */
  'label.powerD': {
    ko: '{p} D',
    en: '{p} D',
    ja: '{p} D',
    zh: '{p} D',
    ar: '{p} D',
    es: '{p} D',
    fr: '{p} D',
    hi: '{p} D',
    id: '{p} D',
    pt: '{p} D',
  },

  'caption.one': {

    ko: '렌즈 L₁ 하나 — 나란한 줄기가 렌즈 뒤 {fOne} cm 에서 모인다.',

    en: 'One lens, L₁ — the parallel beams meet {fOne} cm behind it.',

    ja: 'レンズL₁一枚 — 平行な光束がレンズの後ろ{fOne} cmで集まる。',

    zh: '只有一片透镜 L₁——平行光束在它后方 {fOne} cm 处会聚。',

    ar: 'عدسة واحدة، L₁ — تلتقي الحزم المتوازية على بعد {fOne} cm خلفها.',

    es: 'Una sola lente, L₁ — los haces paralelos se juntan {fOne} cm detrás de ella.',

    fr: 'Une seule lentille, L₁ — les faisceaux parallèles se rejoignent {fOne} cm derrière elle.',

    hi: 'एक लेंस, L₁ — समांतर किरण-पुंज उसके पीछे {fOne} cm पर मिलते हैं।',

    id: 'Satu lensa, L₁ — berkas-berkas sejajar bertemu {fOne} cm di belakangnya.',

    pt: 'Uma lente, L₁ — os feixes paralelos se encontram {fOne} cm atrás dela.',

  },
  'caption.bringTwo': {
    ko: '볼록 렌즈 L₂ 를 L₁ 에 붙인다. 막대에 L₂ 칸이 쌓인다.',
    en: 'A converging lens, L₂, is pressed against L₁. An L₂ block stacks onto the bar.',
    ja: '収束レンズL₂をL₁に密着させる。棒にL₂の区画が積み重なる。',
    zh: '把会聚透镜 L₂ 紧贴在 L₁ 上。条上叠加一格 L₂。',
    ar: 'تُلصَق عدسة مجمِّعة، L₂، بالعدسة L₁. وتُضاف كتلة L₂ فوق الشريط.',
    es: 'Una lente convergente, L₂, se pega a L₁. Un bloque L₂ se apila sobre la barra.',
    fr: 'Une lentille convergente, L₂, est accolée à L₁. Un bloc L₂ s’empile sur la barre.',
    hi: 'एक अभिसारी लेंस, L₂, L₁ से सटाया जाता है। पट्टी पर L₂ का एक खंड जुड़ जाता है।',
    id: 'Lensa konvergen L₂ ditempelkan ke L₁. Satu blok L₂ bertumpuk di atas batang.',
    pt: 'Uma lente convergente, L₂, é encostada em L₁. Um bloco L₂ se empilha na barra.',
  },
  'caption.bendTwo': {
    ko: '두 렌즈를 함께 지난 줄기가 L₁ 하나일 때보다 가파르게 꺾인다.',
    en: 'Through both lenses, the beams bend more steeply than through L₁ alone.',
    ja: '二枚のレンズを通った光束は、L₁一枚のときより急に曲がる。',
    zh: '穿过两片透镜的光束比只经过 L₁ 时偏折得更陡。',
    ar: 'عبر العدستين معًا تنكسر الحزم انكسارًا أشدّ مما عبر L₁ وحدها.',
    es: 'A través de ambas lentes, los haces se desvían con más fuerza que a través de L₁ sola.',
    fr: 'À travers les deux lentilles, les faisceaux se courbent plus fortement qu’à travers L₁ seule.',
    hi: 'दोनों लेंसों से गुज़रकर किरण-पुंज अकेले L₁ की तुलना में अधिक तीखे मुड़ते हैं।',
    id: 'Melewati kedua lensa, berkas-berkas membelok lebih tajam daripada melewati L₁ saja.',
    pt: 'Atravessando as duas lentes, os feixes se desviam mais bruscamente do que só com L₁.',
  },
  'caption.two': {
    ko: '줄기가 {fTwo} cm 에서 모인다 — 빈 고리가 L₁ 하나일 때의 자리다. 막대는 {pTwo} D.',
    en: 'The beams meet at {fTwo} cm — the empty ring marks where L₁ alone focused. The bar reads {pTwo} D.',
    ja: '光束は{fTwo} cmで集まる — 空の輪はL₁一枚のときの焦点の位置だ。棒は{pTwo} D。',
    zh: '光束在 {fTwo} cm 处会聚——空心圆环标出只有 L₁ 时的焦点位置。条显示 {pTwo} D。',
    ar: 'تلتقي الحزم عند {fTwo} cm — والحلقة الفارغة تُعلِّم موضع بؤرة L₁ وحدها. ويُظهر الشريط {pTwo} D.',
    es: 'Los haces se juntan a {fTwo} cm — el anillo vacío marca dónde enfocaba L₁ sola. La barra marca {pTwo} D.',
    fr: 'Les faisceaux se rejoignent à {fTwo} cm — l’anneau vide marque le foyer de L₁ seule. La barre indique {pTwo} D.',
    hi: 'किरण-पुंज {fTwo} cm पर मिलते हैं — खाली वलय वह जगह दिखाता है जहाँ अकेले L₁ का फोकस था। पट्टी {pTwo} D दिखाती है।',
    id: 'Berkas-berkas bertemu di {fTwo} cm — cincin kosong menandai titik fokus L₁ saja. Batang menunjukkan {pTwo} D.',
    pt: 'Os feixes se encontram a {fTwo} cm — o anel vazio marca onde L₁ sozinha focalizava. A barra marca {pTwo} D.',
  },
  'caption.liftTwo': {
    ko: 'L₂ 를 뗀다.',
    en: 'L₂ is taken away.',
    ja: 'L₂を外す。',
    zh: '取下 L₂。',
    ar: 'تُزال L₂.',
    es: 'Se retira L₂.',
    fr: 'On retire L₂.',
    hi: 'L₂ हटा दिया जाता है।',
    id: 'L₂ dilepas.',
    pt: 'L₂ é retirada.',
  },
  'caption.bringConcave': {
    ko: '이번에는 오목 렌즈 L₂ 를 붙인다. 오목 칸이 막대를 위에서 깎는다.',
    en: 'This time a diverging lens, L₂, is pressed on. Its block cuts the bar down from the top.',
    ja: '今度は発散レンズL₂を密着させる。その区画が棒を上から削る。',
    zh: '这次贴上发散透镜 L₂。它那一格从顶端把条削短。',
    ar: 'هذه المرة تُلصَق عدسة مفرِّقة، L₂. وكتلتها تقتطع من الشريط من أعلاه.',
    es: 'Esta vez se pega una lente divergente, L₂. Su bloque recorta la barra desde arriba.',
    fr: 'Cette fois, une lentille divergente, L₂, est accolée. Son bloc rogne la barre par le haut.',
    hi: 'इस बार एक अपसारी लेंस, L₂, सटाया जाता है। उसका खंड पट्टी को ऊपर से घटा देता है।',
    id: 'Kali ini lensa divergen L₂ ditempelkan. Bloknya memotong batang dari atas.',
    pt: 'Desta vez, uma lente divergente, L₂, é encostada. Seu bloco corta a barra por cima.',
  },
  'caption.bendConcave': {
    ko: '두 렌즈를 함께 지난 줄기가 L₁ 하나일 때보다 완만하게 꺾인다.',
    en: 'Through both lenses, the beams bend more gently than through L₁ alone.',
    ja: '二枚のレンズを通った光束は、L₁一枚のときよりゆるやかに曲がる。',
    zh: '穿过两片透镜的光束比只经过 L₁ 时偏折得更平缓。',
    ar: 'عبر العدستين معًا تنكسر الحزم انكسارًا أخفّ مما عبر L₁ وحدها.',
    es: 'A través de ambas lentes, los haces se desvían más suavemente que a través de L₁ sola.',
    fr: 'À travers les deux lentilles, les faisceaux se courbent plus doucement qu’à travers L₁ seule.',
    hi: 'दोनों लेंसों से गुज़रकर किरण-पुंज अकेले L₁ की तुलना में कम तीखे मुड़ते हैं।',
    id: 'Melewati kedua lensa, berkas-berkas membelok lebih landai daripada melewati L₁ saja.',
    pt: 'Atravessando as duas lentes, os feixes se desviam mais suavemente do que só com L₁.',
  },
  'caption.mix': {
    ko: '줄기가 {fMix} cm 에서 모인다 — 빈 고리보다 멀다. 막대는 {pMix} D.',
    en: 'The beams meet at {fMix} cm — farther than the empty ring. The bar reads {pMix} D.',
    ja: '光束は{fMix} cmで集まる — 空の輪より遠い。棒は{pMix} D。',
    zh: '光束在 {fMix} cm 处会聚——比空心圆环更远。条显示 {pMix} D。',
    ar: 'تلتقي الحزم عند {fMix} cm — أبعد من الحلقة الفارغة. ويُظهر الشريط {pMix} D.',
    es: 'Los haces se juntan a {fMix} cm — más lejos que el anillo vacío. La barra marca {pMix} D.',
    fr: 'Les faisceaux se rejoignent à {fMix} cm — plus loin que l’anneau vide. La barre indique {pMix} D.',
    hi: 'किरण-पुंज {fMix} cm पर मिलते हैं — खाली वलय से अधिक दूर। पट्टी {pMix} D दिखाती है।',
    id: 'Berkas-berkas bertemu di {fMix} cm — lebih jauh daripada cincin kosong. Batang menunjukkan {pMix} D.',
    pt: 'Os feixes se encontram a {fMix} cm — mais longe que o anel vazio. A barra marca {pMix} D.',
  },
  'caption.liftConcave': {
    ko: '오목 렌즈 L₂ 를 뗀다.',
    en: 'The diverging lens L₂ is taken away.',
    ja: '発散レンズL₂を外す。',
    zh: '取下发散透镜 L₂。',
    ar: 'تُزال العدسة المفرِّقة L₂.',
    es: 'Se retira la lente divergente L₂.',
    fr: 'On retire la lentille divergente L₂.',
    hi: 'अपसारी लेंस L₂ हटा दिया जाता है।',
    id: 'Lensa divergen L₂ dilepas.',
    pt: 'A lente divergente L₂ é retirada.',
  },
  'caption.back': {
    ko: 'L₁ 하나만 남았다.',
    en: 'Only L₁ is left.',
    ja: 'L₁一枚だけが残る。',
    zh: '只剩下 L₁。',
    ar: 'تبقى L₁ وحدها.',
    es: 'Solo queda L₁.',
    fr: 'Il ne reste que L₁.',
    hi: 'केवल L₁ बचा रहता है।',
    id: 'Tinggal L₁ saja.',
    pt: 'Só resta L₁.',
  },
} satisfies Record<string, LocalizedText>);

export type LensCombinationMessageKey = keyof typeof lensCombinationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: LensCombinationMessageKey): LocalizedText => lensCombinationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LensCombinationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const lensCombinationSchema: BundleSchema = {
  id: LENS_COMBINATION_ID,
  label: text('label.title'),
  category: 'optics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 붙이는 렌즈를 자동 진행으로 바꿔 끼워 초점이 다가오고 멀어지는 것을
  // 보인다 — 독자가 직접 해 봐야 하는 것이 없다.
  parameters: [],

  stages: [
    {
      id: 'contact',
      label: text('label.stage'),
      constants: {
        focalOneCm: FOCAL_ONE_CM,
        focalSameCm: FOCAL_SAME_CM,
        focalConcaveCm: FOCAL_CONCAVE_CM,
        shownFocusOneCm: SHOWN_FOCUS_ONE_CM,
        shownFocusTwoCm: SHOWN_FOCUS_TWO_CM,
        shownFocusMixCm: SHOWN_FOCUS_MIX_CM,
        shownPowerOneD: SHOWN_POWER_ONE_D,
        shownPowerTwoD: SHOWN_POWER_TWO_D,
        shownPowerMixD: SHOWN_POWER_MIX_D,
        cmPerUnit: CM_PER_UNIT,
        unitPerDioptre: UNIT_PER_DIOPTRE,
        rayCount: RAY_COUNT,
        raySpacing: RAY_SPACING,
      },
    },
  ],

  environments: [],

  views: [{ id: 'axis', label: text('label.view'), default: true }],

  /** 광축 한 줄과 옆의 막대. 가로로 넓고 세로로 좁다. */
  canvas: { height: 360, minHeight: 320 },

  /** 축 → 막대 → 렌즈 → 줄기 → 초점 → 글자 순. 줄기가 렌즈 유리 위로 지나가야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = L₁ 하나 → 볼록 L₂ 붙임 → 다시 뻗음 → 멈춤 → 뗌 → 오목 L₂ 붙임 → 다시 뻗음 →
   * 멈춤 → 뗌 → L₁ 하나로 다시 뻗음.
   *
   * 붙는 렌즈의 높이 · 짙기와 막대 칸 길이는 `bring-*` · `lift-*` 진행도로, 렌즈 뒤 줄기가
   * 거둬졌다 다시 뻗는 길이는 `bring-*` · `lift-*` · `bend-*` 진행도의 합으로 읽는다
   * (`physics.ts`). 어느 렌즈 조합으로 줄기를 추적하는지는 `bend-*` 단계가 시작됐는지로 고른다.
   */
  timeline: {
    phases: [
      { id: 'hold-one', duration: 3.4, caption: key('caption.one') },
      { id: 'bring-two', duration: 1.3, ease: 'smooth', caption: key('caption.bringTwo') },
      { id: 'bend-two', duration: 1.3, caption: key('caption.bendTwo') },
      { id: 'hold-two', duration: 3.6, caption: key('caption.two') },
      { id: 'lift-two', duration: 1.0, ease: 'smooth', caption: key('caption.liftTwo') },
      { id: 'bring-concave', duration: 1.3, ease: 'smooth', caption: key('caption.bringConcave') },
      { id: 'bend-concave', duration: 1.3, caption: key('caption.bendConcave') },
      { id: 'hold-concave', duration: 3.6, caption: key('caption.mix') },
      { id: 'lift-concave', duration: 1.0, ease: 'smooth', caption: key('caption.liftConcave') },
      { id: 'bend-one', duration: 1.3, caption: key('caption.back') },
    ],
  },

  /** 도착한 순간 L₁ 하나의 줄기가 다 지나가 초점에 모여 있다 — `hold-one` 안에서 연다 (S-piece). */
  startAt: 0.6,

  /** 슬롯 하나. 그림 아래 가운데. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
    vars: {
      fOne: 'focusOneCm',
      fTwo: 'focusTwoCm',
      fMix: 'focusMixCm',
      pTwo: 'powerTwoD',
      pMix: 'powerMixD',
    },
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 거리는 치수선 하나가 잰다.

  messages: lensCombinationMessages,
};
