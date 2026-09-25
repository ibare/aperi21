// ========================================================================
// newtons-third-law — 선언
// ========================================================================
// 질문: 크기가 같고 방향이 반대인 두 힘이면 서로 지워져 아무 일도 없어야 하지 않나.
// 답의 동사: **둘 다 밀려난다.**
//
// 원본: tasks/piece-lab/newtons-third-law (820 × 250 캔버스, 7 s 주기).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:newtons-third-law` 와 문자 그대로 일치한다 (C4). */
export const NEWTONS_THIRD_LAW_ID = 'newtons-third-law';

/**
 * 가속도 크기(월드 단위/s² — 월드 1 = 원본 1px). 힘의 최대치 ÷ 질량.
 * 두 사람의 질량은 같다 — 다르면 "가벼운 쪽이 더 빨리 간다" 는 두 번째 주장이 생긴다.
 */
export const ACCEL = 53.3;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const newtonsThirdLawMessages = Object.freeze({
  'label.title': {
    ko: '작용 반작용',
    en: 'Action and reaction',
    ja: '作用・反作用',
    zh: '作用与反作用',
    ar: 'الفعل ورد الفعل',
    es: 'Acción y reacción',
    fr: 'Action et réaction',
    hi: 'क्रिया और प्रतिक्रिया',
    id: 'Aksi dan reaksi',
    pt: 'Ação e reação',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '힘의 쌍과 서로 다른 작용점',
    en: 'A force pair acting on different bodies',
    ja: '異なる物体にはたらく力の対',
    zh: '作用在不同物体上的一对力',
    ar: 'زوج قوى يؤثر في جسمين مختلفين',
    es: 'Un par de fuerzas que actúan sobre cuerpos distintos',
    fr: 'Une paire de forces s’exerçant sur des corps différents',
    hi: 'भिन्न पिंडों पर लगने वाला बल-युग्म',
    id: 'Pasangan gaya yang bekerja pada benda berbeda',
    pt: 'Um par de forças agindo sobre corpos diferentes',
  },
  'label.stage': {
    ko: '얼음판',
    en: 'Ice',
    ja: '氷',
    zh: '冰面',
    ar: 'الجليد',
    es: 'Hielo',
    fr: 'Glace',
    hi: 'बर्फ़',
    id: 'Es',
    pt: 'Gelo',
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
  /** 이름표는 **받는 쪽**을 말한다 — 한 힘은 이 사람에게, 다른 힘은 저 사람에게. */
  'label.forceOnLeft': {
    ko: '왼쪽 사람이 받는 힘',
    en: 'Force on the left skater',
    ja: '左のスケーターが受ける力',
    zh: '左边滑冰者受到的力',
    ar: 'القوة المؤثرة في المتزلج الأيسر',
    es: 'Fuerza sobre el patinador de la izquierda',
    fr: 'Force sur le patineur de gauche',
    hi: 'बाएँ स्केटर पर लगने वाला बल',
    id: 'Gaya pada peseluncur kiri',
    pt: 'Força sobre o patinador da esquerda',
  },
  'label.forceOnRight': {
    ko: '오른쪽 사람이 받는 힘',
    en: 'Force on the right skater',
    ja: '右のスケーターが受ける力',
    zh: '右边滑冰者受到的力',
    ar: 'القوة المؤثرة في المتزلج الأيمن',
    es: 'Fuerza sobre el patinador de la derecha',
    fr: 'Force sur le patineur de droite',
    hi: 'दाएँ स्केटर पर लगने वाला बल',
    id: 'Gaya pada peseluncur kanan',
    pt: 'Força sobre o patinador da direita',
  },
  'caption.ready': {
    ko: '두 사람이 얼음 위에서 손바닥을 맞댄다',
    en: 'Two skaters on the ice put their palms together',
    ja: '氷の上で2人のスケーターが手のひらを合わせる',
    zh: '两名滑冰者在冰面上掌心相对',
    ar: 'متزلجان على الجليد يضعان كفَّيهما معًا',
    es: 'Dos patinadores sobre el hielo juntan las palmas',
    fr: 'Deux patineurs sur la glace joignent leurs paumes',
    hi: 'बर्फ़ पर दो स्केटर अपनी हथेलियाँ मिलाते हैं',
    id: 'Dua peseluncur di atas es saling menempelkan telapak tangan',
    pt: 'Dois patinadores no gelo encostam as palmas das mãos',
  },
  'caption.push': {
    ko: '서로 민다 — 크기는 같고 방향은 반대인 두 힘이 각자 다른 사람에게 걸린다',
    en: 'They push — two equal and opposite forces, each on a different person',
    ja: '押し合う — 大きさが等しく向きが逆の2つの力が、それぞれ別の人にはたらく',
    zh: '互相推 — 大小相等、方向相反的两个力，分别作用在不同的人身上',
    ar: 'يتدافعان — قوتان متساويتان ومتعاكستان، كلٌّ منهما على شخص مختلف',
    es: 'Se empujan — dos fuerzas iguales y opuestas, cada una sobre una persona distinta',
    fr: 'Ils poussent — deux forces égales et opposées, chacune sur une personne différente',
    hi: 'वे धक्का देते हैं — दो बराबर और विपरीत बल, हर एक अलग व्यक्ति पर',
    id: 'Mereka saling dorong — dua gaya sama besar dan berlawanan arah, masing-masing pada orang yang berbeda',
    pt: 'Eles empurram — duas forças iguais e opostas, cada uma sobre uma pessoa diferente',
  },
  'caption.apart': {
    ko: '두 힘이 서로 지워지지 않았다 — 두 사람 모두 밀려나 멀어진다',
    en: 'The forces did not cancel — both skaters are pushed apart',
    ja: '2つの力は打ち消し合わなかった — 2人とも押されて離れていく',
    zh: '两个力没有相互抵消 — 两人都被推开，越离越远',
    ar: 'لم تُلغِ القوتان إحداهما الأخرى — دُفع المتزلجان كلاهما مبتعدَين',
    es: 'Las fuerzas no se anularon — los dos patinadores se separan empujados',
    fr: 'Les forces ne se sont pas annulées — les deux patineurs sont repoussés l’un de l’autre',
    hi: 'बल एक-दूसरे को निरस्त नहीं कर पाए — दोनों स्केटर धकेले जाकर दूर होते हैं',
    id: 'Gaya-gaya itu tidak saling meniadakan — kedua peseluncur terdorong saling menjauh',
    pt: 'As forças não se anularam — os dois patinadores são empurrados para longe um do outro',
  },
} satisfies Record<string, LocalizedText>);

export type NewtonsThirdLawMessageKey = keyof typeof newtonsThirdLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: NewtonsThirdLawMessageKey): LocalizedText => newtonsThirdLawMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: NewtonsThirdLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const newtonsThirdLawSchema: BundleSchema = {
  id: NEWTONS_THIRD_LAW_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 주장에 더하는 것이 없다 (원본 NOTES (c)).
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: { a: ACCEL } }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 820 × 250. 가로가 좁아지면 배율 하나로 함께 줄어든다. */
  canvas: { height: 250, minHeight: 230 },

  /**
   * 원본 7 s 주기. 원본 상수 `PUSH_START 0.2` · `PUSH_DUR 1.5` · `FADE_START 6.4` 가
   * 단계 경계다.
   *
   * - ready — 가운데에서 손을 맞댄 채 나타난다(흐림 0.35 → 1).
   * - push — 힘이 sin² 모양으로 올랐다 내려간다.
   * - release — 손이 떨어져 팔을 거둔다(원본 0.35 s).
   * - glide — 화살표 없이 같은 빠르기로 멀어진다.
   * - fade — 양 끝 가까이에서 흐려진다.
   *
   * release · glide · fade 는 같은 문장을 이어 말한다 — 이웃 단계가 같은 키면 다시
   * 페이드하지 않는다.
   */
  timeline: {
    phases: [
      { id: 'ready', duration: 0.2, caption: key('caption.ready') },
      { id: 'push', duration: 1.5, caption: key('caption.push') },
      { id: 'release', duration: 0.35, caption: key('caption.apart') },
      { id: 'glide', duration: 4.35, caption: key('caption.apart') },
      { id: 'fade', duration: 0.6, caption: key('caption.apart') },
    ],
  },

  /** 원본 `OFFSET = 0.5` — 도착한 순간 이미 밀기가 진행 중이다 (S-piece). */
  startAt: 0.5,

  /**
   * 원본의 그리는 순서가 겹침을 정한다 — 얼음판 → 처음 선 자리 → 사람(몸 위에 팔) →
   * 힘. 층 기본값은 몸(`body`)을 팔(`trajectory`) 위에 올린다.
   */
  drawOrder: 'scene',

  /** 원본: 캔버스 아래 가운데 한 줄, 기준선 H − 14, 15px 먹색. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, 10] },
    align: 'center',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /** 그리드도 카메라 버튼도 없다 (기본값). 수치·축이 없는 그림이다. */

  messages: newtonsThirdLawMessages,
};
