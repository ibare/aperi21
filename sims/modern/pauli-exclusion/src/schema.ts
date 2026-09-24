// ========================================================================
// pauli-exclusion — 선언
// ========================================================================
// 질문: 전자를 하나씩 넣으면 모두 가장 낮은 준위로 몰리지 않고 왜 위 층까지 쌓이는가.
//
// 전자의 상태는 (준위, 스핀) 한 쌍이고, 스핀은 ↑ · ↓ 둘뿐이다. 그래서 준위마다 자리가 둘이다.
// 전자는 가장 낮은 빈자리로 내려가는데, 같은 상태(같은 준위 · 같은 스핀)에는 둘이 들어갈 수
// 없어 — 바닥의 두 자리가 차면 셋째 전자는 한 층 위로 간다. 아래 층부터 둘씩 차오른다.
//
// 이웃과 겹치지 않는 자리 — `bohr-model` 은 전자 하나가 궤도 사이를 건너뛰며 빛을 내는 것,
// `stern-gerlach` 는 스핀이 두 값뿐이라는 측정이다. 이 조각은 **여러 전자가 자리를 나눠 갖는 규칙**
// 하나다. 주기율표로 펼치는 것은 `electron-configuration`, 보손이 한 상태에 몰리는 것은
// `bose-einstein-condensate` 의 몫이라 두지 않는다 (NOTES (b)).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:pauli-exclusion` 와 문자 그대로 일치한다 (C4). */
export const PAULI_EXCLUSION_ID = 'pauli-exclusion';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 준위 수. 아래에서부터 1, 2, … 로 센다. */
export const LEVEL_COUNT = 4;
/**
 * 넣는 전자 수. 시간표의 `drop1` … `drop{N}` 단계와 수가 같아야 한다 — 전자 하나가 단계 하나에
 * 내려간다 (NOTES (c) G13). 자리 수(준위 수 × 2)보다 많으면 던진다.
 * 7 이면 아래 세 층이 차고 맨 위 층은 ↑ 하나만 차서, 빈자리 하나가 남는다.
 */
export const ELECTRON_COUNT = 7;
/** 준위 사이 간격(월드). 준위를 고르게 둔 것은 도식이다 — 간격의 값은 주장이 아니다. */
export const LEVEL_GAP = 2.2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 바닥 준위의 가운데가 원점.
// ------------------------------------------------------------------------

/** 한 준위의 두 자리 — ↑ 자리는 왼쪽, ↓ 자리는 오른쪽. 자리 상자의 가로 · 세로. */
export const SEAT = { x: 0.8, w: 1.2, h: 1.5 } as const;
/** 준위선이 상자 밖으로 뻗는 끝(월드, 가운데에서). */
export const LEVEL_LINE_HALF = 3;
/** 에너지 축의 가로 자리와 아래 끝 · 길이(월드). */
export const ENERGY_AXIS = { x: -4.4, y0: -1, length: 8.9 } as const;
/**
 * 넣을 전자 대기열 — 첫 전자의 자리, 전자 사이 간격(월드). 사다리 오른쪽, 맨 위 준위 높이.
 * `lift` 는 대기열에서 자리로 옮겨 갈 때 그리는 곡선이 사다리 위로 떠오르는 높이다.
 */
export const QUEUE = { x0: 4.8, gap: 1.2, lift: 2.2 } as const;

/** 프레이밍 — 에너지 축 이름표부터 대기열 끝까지, 캡션 띠를 더한 아래(장부 G24). */
export const SCENE_BOUNDS = { minX: -6.4, maxX: 13.6, minY: -2.5, maxY: 8.8 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 첫 두 전자 — 바닥 준위의 두 자리를 채운다. */
export const DROP_FIRST = 1.5;
export const DROP_SECOND = 1.8;
/** 셋째 전자 — 바닥이 찼으니 한 층 위로. 캡션을 읽을 틈(`look3`)을 뒤에 둔다. */
export const DROP_THIRD = 1.8;
export const LOOK_THIRD = 1.6;
/** 나머지 전자 하나하나. */
export const DROP_REST = 1.2;
/** 다 넣은 뒤 머무는 동안 · 비우고 대기열을 다시 채우는 동안. */
export const HOLD = 3.2;
export const FADE = 0.9;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const pauliExclusionMessages = Object.freeze({
  'label.title': {
    ko: '파울리 배타 원리',
    en: 'Pauli exclusion principle',
    ja: 'パウリの排他原理',
    zh: '泡利不相容原理',
    ar: 'مبدأ باولي للاستبعاد',
    es: 'Principio de exclusión de Pauli',
    fr: 'Principe d’exclusion de Pauli',
    hi: 'पाउली अपवर्जन सिद्धांत',
    id: 'Prinsip larangan Pauli',
    pt: 'Princípio de exclusão de Pauli',
  },
  'label.operation': {
    ko: '같은 상태를 못 가짐',
    en: 'No two in the same state',
    ja: '同じ状態に二つは入れない',
    zh: '同一状态不能容纳两个',
    ar: 'لا يشترك اثنان في الحالة نفسها',
    es: 'Nunca dos en el mismo estado',
    fr: 'Jamais deux dans le même état',
    hi: 'एक ही अवस्था में दो नहीं',
    id: 'Tak ada dua dalam keadaan yang sama',
    pt: 'Nunca dois no mesmo estado',
  },
  'label.stage': {
    ko: '전자 일곱, 준위 넷',
    en: 'Seven electrons, four levels',
    ja: '電子七つ、準位四つ',
    zh: '七个电子，四个能级',
    ar: 'سبعة إلكترونات وأربعة مستويات',
    es: 'Siete electrones, cuatro niveles',
    fr: 'Sept électrons, quatre niveaux',
    hi: 'सात इलेक्ट्रॉन, चार ऊर्जा स्तर',
    id: 'Tujuh elektron, empat tingkat energi',
    pt: 'Sete elétrons, quatro níveis',
  },
  'label.view': {
    ko: '준위와 자리',
    en: 'Levels and places',
    ja: '準位と席',
    zh: '能级与位置',
    ar: 'المستويات والأماكن',
    es: 'Niveles y lugares',
    fr: 'Niveaux et places',
    hi: 'ऊर्जा स्तर और स्थान',
    id: 'Tingkat energi dan tempat',
    pt: 'Níveis e lugares',
  },
  /** 세로축 이름 — 위로 갈수록 에너지가 높다. */
  'label.energy': {
    ko: '에너지',
    en: 'Energy',
    ja: 'エネルギー',
    zh: '能量',
    ar: 'الطاقة',
    es: 'Energía',
    fr: 'Énergie',
    hi: 'ऊर्जा',
    id: 'Energi',
    pt: 'Energia',
  },
  /** 오른쪽 대기열 이름. */
  'label.queue': {
    ko: '넣을 전자',
    en: 'Electrons to add',
    ja: '入れる電子',
    zh: '待加入的电子',
    ar: 'إلكترونات للإضافة',
    es: 'Electrones por añadir',
    fr: 'Électrons à ajouter',
    hi: 'जोड़े जाने वाले इलेक्ट्रॉन',
    id: 'Elektron yang akan dimasukkan',
    pt: 'Elétrons a adicionar',
  },
  'caption.first': {
    ko: '전자를 하나씩 넣는다 — 가장 낮은 준위의 빈자리로 내려간다',
    en: 'Electrons go in one at a time — each drops to the lowest empty place',
    ja: '電子を一つずつ入れる — それぞれ最も低い空席へ降りていく',
    zh: '电子一个一个地放入 — 每个都落到最低的空位',
    ar: 'تدخل الإلكترونات واحدًا تلو الآخر — وينزل كلٌّ منها إلى أدنى مكان شاغر',
    es: 'Los electrones entran de uno en uno — cada uno baja al lugar libre más bajo',
    fr: 'Les électrons entrent un par un — chacun descend à la place libre la plus basse',
    hi: 'इलेक्ट्रॉन एक-एक करके डाले जाते हैं — हर एक सबसे नीचे के खाली स्थान पर उतरता है',
    id: 'Elektron dimasukkan satu per satu — masing-masing turun ke tempat kosong terendah',
    pt: 'Os elétrons entram um de cada vez — cada um desce ao lugar vazio mais baixo',
  },
  'caption.second': {
    ko: '둘째는 스핀이 반대(↓)라 같은 준위의 다른 자리에 들어간다',
    en: 'The second has the opposite spin (↓), so it takes the other place on the same level',
    ja: '二つ目はスピンが逆向き（↓）なので、同じ準位のもう一つの席に入る',
    zh: '第二个的自旋相反（↓），所以占据同一能级的另一个位置',
    ar: 'الثاني لفّه المغزلي معاكس (↓)، فيأخذ المكان الآخر في المستوى نفسه',
    es: 'El segundo tiene el espín opuesto (↓), así que ocupa el otro lugar del mismo nivel',
    fr: 'Le deuxième a le spin opposé (↓), il prend donc l’autre place du même niveau',
    hi: 'दूसरे का स्पिन उलटा (↓) है, इसलिए वह उसी स्तर के दूसरे स्थान पर बैठता है',
    id: 'Yang kedua memiliki spin berlawanan (↓), jadi ia menempati tempat lain di tingkat yang sama',
    pt: 'O segundo tem spin oposto (↓), então ocupa o outro lugar do mesmo nível',
  },
  'caption.blocked': {
    ko: '바닥 준위의 두 자리(↑ · ↓)가 이미 찼다 — 같은 상태에 둘은 못 들어가 셋째는 한 층 위로 간다',
    en: 'Both places on the lowest level (↑ and ↓) are taken — no two can share a state, so the third goes one level up',
    ja: '最も低い準位の二つの席（↑ と ↓）はもう埋まっている — 同じ状態に二つは入れないので、三つ目は一つ上の準位へ行く',
    zh: '最低能级的两个位置（↑ 和 ↓）都已占满 — 两个电子不能处于同一状态，所以第三个去往上一个能级',
    ar: 'المكانان في المستوى الأدنى (↑ و↓) مشغولان — لا يمكن لاثنين أن يشتركا في حالة واحدة، فيصعد الثالث مستوى واحدًا',
    es: 'Los dos lugares del nivel más bajo (↑ y ↓) están ocupados — dos no pueden compartir un estado, así que el tercero sube un nivel',
    fr: 'Les deux places du niveau le plus bas (↑ et ↓) sont prises — deux ne peuvent partager un état, le troisième monte donc d’un niveau',
    hi: 'सबसे निचले स्तर के दोनों स्थान (↑ और ↓) भर चुके हैं — दो एक ही अवस्था साझा नहीं कर सकते, इसलिए तीसरा एक स्तर ऊपर जाता है',
    id: 'Kedua tempat di tingkat terendah (↑ dan ↓) sudah terisi — dua tak bisa berbagi satu keadaan, jadi yang ketiga naik satu tingkat',
    pt: 'Os dois lugares do nível mais baixo (↑ e ↓) estão ocupados — dois não podem compartilhar um estado, então o terceiro sobe um nível',
  },
  'caption.stack': {
    ko: '준위마다 ↑ · ↓ 두 자리뿐 — 아래 층이 차면 다음 전자는 위 층으로 올라간다',
    en: 'Each level has only two places, ↑ and ↓ — once a level fills, the next electron goes higher',
    ja: '各準位の席は ↑ と ↓ の二つだけ — 準位が埋まると、次の電子はより上へ行く',
    zh: '每个能级只有 ↑ 和 ↓ 两个位置 — 一个能级填满后，下一个电子去往更高处',
    ar: 'لكل مستوى مكانان فقط، ↑ و↓ — وحين يمتلئ مستوى يذهب الإلكترون التالي إلى أعلى',
    es: 'Cada nivel tiene solo dos lugares, ↑ y ↓ — cuando un nivel se llena, el siguiente electrón va más arriba',
    fr: 'Chaque niveau n’a que deux places, ↑ et ↓ — une fois un niveau rempli, l’électron suivant va plus haut',
    hi: 'हर स्तर में केवल दो स्थान हैं, ↑ और ↓ — एक स्तर भरते ही अगला इलेक्ट्रॉन ऊपर जाता है',
    id: 'Setiap tingkat hanya punya dua tempat, ↑ dan ↓ — begitu satu tingkat penuh, elektron berikutnya naik lebih tinggi',
    pt: 'Cada nível tem só dois lugares, ↑ e ↓ — quando um nível se enche, o próximo elétron vai mais acima',
  },
  'caption.full': {
    ko: '아래 층부터 둘씩 찼다 — 같은 준위에 같은 스핀인 전자는 하나도 없다',
    en: 'The levels filled two by two from the bottom — no two electrons share a level and a spin',
    ja: '準位は下から二つずつ埋まった — 準位もスピンも同じ電子は一組もない',
    zh: '能级从下往上两个两个地填满了 — 没有两个电子同时共享能级和自旋',
    ar: 'امتلأت المستويات اثنين اثنين من الأسفل — لا يشترك إلكترونان في المستوى واللف المغزلي معًا',
    es: 'Los niveles se llenaron de dos en dos desde abajo — no hay dos electrones con el mismo nivel y el mismo espín',
    fr: 'Les niveaux se sont remplis deux par deux depuis le bas — aucun électron ne partage à la fois niveau et spin avec un autre',
    hi: 'स्तर नीचे से दो-दो करके भरे — कोई भी दो इलेक्ट्रॉन स्तर और स्पिन दोनों साझा नहीं करते',
    id: 'Tingkat-tingkat terisi dua-dua dari bawah — tak ada dua elektron yang berbagi tingkat dan spin sekaligus',
    pt: 'Os níveis se encheram de dois em dois a partir de baixo — não há dois elétrons com o mesmo nível e o mesmo spin',
  },
} satisfies Record<string, LocalizedText>);

export type PauliExclusionMessageKey = keyof typeof pauliExclusionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PauliExclusionMessageKey): LocalizedText => pauliExclusionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PauliExclusionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const pauliExclusionSchema: BundleSchema = {
  id: PAULI_EXCLUSION_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 전자를 차례로 넣는 한 주기 안에 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        levelCount: LEVEL_COUNT,
        electronCount: ELECTRON_COUNT,
        levelGap: LEVEL_GAP,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 에너지 축 · 사다리 · 대기열이 옆으로 놓인다. 세로는 준위 넷과 캡션 줄. */
  canvas: { height: 380, minHeight: 340 },

  /** 겹침은 scene 에 쓴 순서 — 준위선 · 자리 상자 위에 전자. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 전자를 하나씩 넣음(drop1 … drop7) → 다 찬 채 머묾 → 비우고 대기열을 다시 채움.
   * 전자 하나가 단계 하나다. 셋째 뒤에는 캡션을 읽을 틈(`look3`)이 있다.
   */
  timeline: {
    phases: [
      { id: 'drop1', duration: DROP_FIRST, ease: 'inOutCubic', caption: key('caption.first') },
      { id: 'drop2', duration: DROP_SECOND, ease: 'inOutCubic', caption: key('caption.second') },
      { id: 'drop3', duration: DROP_THIRD, ease: 'inOutCubic', caption: key('caption.blocked') },
      { id: 'look3', duration: LOOK_THIRD, caption: key('caption.blocked') },
      { id: 'drop4', duration: DROP_REST, ease: 'inOutCubic', caption: key('caption.stack') },
      { id: 'drop5', duration: DROP_REST, ease: 'inOutCubic', caption: key('caption.stack') },
      { id: 'drop6', duration: DROP_REST, ease: 'inOutCubic', caption: key('caption.stack') },
      { id: 'drop7', duration: DROP_REST, ease: 'inOutCubic', caption: key('caption.stack') },
      { id: 'hold', duration: HOLD, caption: key('caption.full') },
      { id: 'fade', duration: FADE, caption: key('caption.full') },
    ],
  },

  /** 도착한 순간 첫 전자는 바닥에 있고, 둘째가 내려가는 중이다. */
  startAt: 2.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 원리의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: pauliExclusionMessages,
};
