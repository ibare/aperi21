// ========================================================================
// drag-in-fluid — 선언
// ========================================================================
// 질문: 빠른 흐름 속에서 받는 저항은 무엇이 정하나 — 앞에서 본 넓이와 속도가 같으면
// 저항도 같은가.
//
// 같지 않다. 빠른 흐름의 저항은 대부분 **뒤에서** 생긴다. 뭉툭한 뒤꼍에서 흐름이
// 떨어져 나가 소용돌이가 번갈아 떨어지는 넓은 자국(후류)을 남기면, 그 자국의 낮은
// 압력이 물체를 뒤로 끈다. 뒤가 매끈하게 좁아지는 유선형은 흐름이 끝까지 붙어 있다가
// 좁게 닫혀 자국이 가늘고, 저항(항력 계수)이 10분의 1쯤으로 준다.
//
// 동사는 **"(뒤에 남는 자국이) 넓게 번진다 / 좁게 닫힌다"** 와 **"(저항이) 열 배 차이
// 난다"** 다. 위 레인의 원기둥과 아래 레인의 유선형은 두께 · 앞면 자리 · 흐름 빠르기가
// 같다. 다른 것은 뒤 모양뿐이다. 앞에서 오는 연기 알갱이와 몸 뒤에서 흘리는 염료가
// 자국의 너비를 그리고, 강조색 저항 화살표가 같은 배율로 자란다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 월드 한 단위 ≈ 화면 1 px (가로 770 을 넓은 임베드에 담는다).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:drag-in-fluid` 와 문자 그대로 일치한다 (C4). */
export const DRAG_IN_FLUID_ID = 'drag-in-fluid';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

export const PHYSICS = {
  /** 흐름 빠르기(월드/초). 두 레인이 같다. */
  speed: 110,
  /** 두께(월드) — 원기둥 지름 = 유선형 최대 두께. 앞에서 본 넓이가 같다. */
  thickness: 44,
  /** 스트로할 수 St = f·D/U. 원기둥 뒤에서 소용돌이가 떨어지는 빠르기. */
  strouhal: 0.2,
  /** 소용돌이 줄이 떠내려가는 빠르기 ÷ 흐름 빠르기. */
  streetSpeed: 0.85,
  /** 원기둥이 떨구는 소용돌이 하나의 순환 ÷ (U·D). */
  circulation: 1.4,
  /** 유선형 꼬리가 떨구는 소용돌이의 순환 ÷ (U·D). 원기둥보다 훨씬 약하다. */
  circulationStreamlined: 0.06,
  /** 소용돌이 두 줄 사이 반폭 ÷ D — 원기둥 · 유선형. 자국의 너비다. */
  wakeHalf: 0.5,
  wakeHalfStreamlined: 0.04,
  /** 항력 계수 — 같은 두께 · 같은 빠르기라 저항은 이 값에 비례한다. */
  cdCylinder: 1.2,
  cdStreamlined: 0.12,
  /** 저항 화살표 길이(월드) ÷ 항력 계수. 두 화살표가 같은 배율을 쓴다. */
  arrowPerCd: 150,
  /** 유선형(주코프스키 단면)의 두께 매개변수 ε. 두께비 ≈ 1.3ε. */
  joukowskiEps: 0.2,
} as const;

// ------------------------------------------------------------------------
// 배치 — 월드. 레인 둘을 위아래로, 몸은 왼쪽에, 자국이 흐를 오른쪽을 넓게.
// ------------------------------------------------------------------------

export const LAYOUT = {
  /** 레인 가로 범위(몸 중심 = 0). 흐름은 왼쪽에서 들어온다. */
  x0: -170,
  x1: 600,
  /** 레인 세로 반폭. */
  half: 78,
  /** 위 · 아래 레인 중심 y. */
  laneTop: 82,
  laneBottom: -82,
  /** 캡션 한 줄이 들어갈 아래 여백. */
  captionRoom: 40,
  /** 이름표 글자 크기 · 캡션 글자 크기(화면 px). */
  labelPx: 13,
  captionPx: 15,
} as const;

/** 방출 — 연기 줄 수 · 줄 간격(월드), 방출 간격(초). 알갱이 배치라 물리량이 아니다. */
export const EMIT = {
  rows: 14,
  rowGap: 10.5,
  smokeEvery: 0.085,
  dyeEvery: 0.025,
} as const;

/** 적분 걸음(초). 실시간 dt 가 가변이라 고정 걸음으로 나눠 걷는다. */
export const FIXED_DT = 1 / 60;

// ------------------------------------------------------------------------
// 시간표 — 흐름을 보고 → 자국을 보고 → 저항이 자란다 → 붙잡는다 → 거둔다
// ------------------------------------------------------------------------

export const PHASE = {
  flow: 2.5,
  wake: 4.5,
  drag: 1.2,
  hold: 4.5,
  fade: 0.8,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const dragInFluidMessages = Object.freeze({
  'label.title': {
    ko: '유체 속 항력',
    en: 'Drag in a fluid',
    ja: '流体中の抗力',
    zh: '流体中的阻力',
    ar: 'قوة السحب في المائع',
    es: 'Arrastre en un fluido',
    fr: 'Traînée dans un fluide',
    hi: 'तरल में कर्षण',
    id: 'Gaya hambat dalam fluida',
    pt: 'Arrasto em um fluido',
  },
  'label.operation': {
    ko: '형상과 속도가 정하는 저항',
    en: 'Drag set by shape and speed',
    ja: '形と速さで決まる抗力',
    zh: '由形状和速度决定的阻力',
    ar: 'قوة سحب يحددها الشكل والسرعة',
    es: 'Arrastre determinado por la forma y la rapidez',
    fr: 'Traînée fixée par la forme et la vitesse',
    hi: 'आकार और चाल से तय होने वाला कर्षण',
    id: 'Gaya hambat yang ditentukan bentuk dan kelajuan',
    pt: 'Arrasto definido pela forma e pela velocidade',
  },
  'label.stage': {
    ko: '같은 흐름',
    en: 'Same flow',
    ja: '同じ流れ',
    zh: '相同的流动',
    ar: 'التدفق نفسه',
    es: 'Mismo flujo',
    fr: 'Même écoulement',
    hi: 'एक-सा प्रवाह',
    id: 'Aliran yang sama',
    pt: 'Mesmo escoamento',
  },
  'label.view': {
    ko: '두 레인',
    en: 'Two lanes',
    ja: '二つのレーン',
    zh: '两条通道',
    ar: 'مساران',
    es: 'Dos carriles',
    fr: 'Deux couloirs',
    hi: 'दो लेन',
    id: 'Dua lajur',
    pt: 'Duas faixas',
  },
  'label.cylinder': {
    ko: '원기둥',
    en: 'cylinder',
    ja: '円柱',
    zh: '圆柱',
    ar: 'أسطوانة',
    es: 'cilindro',
    fr: 'cylindre',
    hi: 'बेलन',
    id: 'silinder',
    pt: 'cilindro',
  },
  'label.streamlined': {
    ko: '유선형',
    en: 'streamlined',
    ja: '流線形',
    zh: '流线型',
    ar: 'انسيابي',
    es: 'aerodinámico',
    fr: 'profilé',
    hi: 'धारारेखित',
    id: 'aerodinamis',
    pt: 'aerodinâmico',
  },
  'label.drag': {
    ko: '저항',
    en: 'drag',
    ja: '抗力',
    zh: '阻力',
    ar: 'السحب',
    es: 'arrastre',
    fr: 'traînée',
    hi: 'कर्षण',
    id: 'gaya hambat',
    pt: 'arrasto',
  },
  'caption.flow': {
    ko: '같은 빠르기의 흐름에 두께가 같은 원기둥과 유선형을 세웠다',
    en: 'Same flow speed, same thickness: a cylinder and a streamlined body',
    ja: '流れの速さも太さも同じ — 円柱と流線形の物体',
    zh: '流速相同、粗细相同：一个圆柱和一个流线型物体',
    ar: 'سرعة التدفق نفسها والسُّمك نفسه: أسطوانة وجسم انسيابي',
    es: 'Misma rapidez del flujo, mismo grosor: un cilindro y un cuerpo aerodinámico',
    fr: "Même vitesse d'écoulement, même épaisseur : un cylindre et un corps profilé",
    hi: 'प्रवाह की चाल एक-सी, मोटाई एक-सी: एक बेलन और एक धारारेखित पिंड',
    id: 'Kelajuan aliran sama, ketebalan sama: sebuah silinder dan sebuah benda aerodinamis',
    pt: 'Mesma velocidade do escoamento, mesma espessura: um cilindro e um corpo aerodinâmico',
  },
  'caption.wake': {
    ko: '원기둥 뒤로는 소용돌이가 번갈아 떨어져 넓게 번지고, 뒤가 매끈한 유선형 뒤는 좁게 닫힌다',
    en: 'Behind the cylinder, vortices peel off in turn and spread wide; behind the smooth tail the wake closes thin',
    ja: '円柱の後ろでは渦が交互にはがれて広く広がり、なめらかな尾の後ろでは後流が細く閉じる',
    zh: '圆柱后方的涡旋交替脱落并向两侧扩散；光滑尾部后方的尾流收窄闭合',
    ar: 'خلف الأسطوانة تنفصل الدوّامات بالتناوب وتنتشر على نطاق واسع؛ وخلف الذيل الأملس ينغلق الأثر رفيعًا',
    es: 'Detrás del cilindro, los vórtices se desprenden por turnos y se abren; detrás de la cola lisa, la estela se cierra estrecha',
    fr: "Derrière le cylindre, les tourbillons se détachent tour à tour et s'étalent ; derrière la queue lisse, le sillage se referme, étroit",
    hi: 'बेलन के पीछे भँवर बारी-बारी से अलग होकर चौड़े फैलते हैं; चिकनी पूँछ के पीछे की धारा पतली होकर बंद हो जाती है',
    id: 'Di belakang silinder, pusaran lepas bergantian dan menyebar lebar; di belakang ekor yang mulus, jejak aliran menutup tipis',
    pt: 'Atrás do cilindro, vórtices se desprendem alternadamente e se espalham; atrás da cauda lisa, a esteira se fecha estreita',
  },
  'caption.drag': {
    ko: '같은 빠르기에서 받는 저항 — 유선형은 원기둥의 10분의 1쯤이다',
    en: 'Drag at the same speed — the streamlined body gets about a tenth of the cylinder’s',
    ja: '同じ速さで受ける抗力 — 流線形は円柱のおよそ10分の1',
    zh: '相同速度下所受的阻力 — 流线型物体约为圆柱的十分之一',
    ar: 'قوة السحب عند السرعة نفسها — يتلقى الجسم الانسيابي نحو عُشر ما تتلقاه الأسطوانة',
    es: 'Arrastre a la misma rapidez — el cuerpo aerodinámico recibe cerca de una décima parte del arrastre del cilindro',
    fr: 'Traînée à la même vitesse — le corps profilé en subit environ un dixième de celle du cylindre',
    hi: 'समान चाल पर कर्षण — धारारेखित पिंड पर बेलन का लगभग दसवाँ भाग',
    id: 'Gaya hambat pada kelajuan yang sama — benda aerodinamis mendapat sekitar sepersepuluh gaya hambat silinder',
    pt: 'Arrasto à mesma velocidade — o corpo aerodinâmico recebe cerca de um décimo do arrasto do cilindro',
  },
} satisfies Record<string, LocalizedText>);

export type DragInFluidMessageKey = keyof typeof dragInFluidMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DragInFluidMessageKey): LocalizedText => dragInFluidMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DragInFluidMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const dragInFluidSchema: BundleSchema = {
  id: DRAG_IN_FLUID_ID,
  label: text('label.title'),
  category: 'fluids',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 자동 진행으로 주장이 끝난다 (controllers.ts).
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: { ...PHYSICS } }],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 레인 둘(세로 312) + 캡션 한 줄. */
  canvas: { height: 400, minHeight: 340 },

  // 알갱이 위에 몸, 몸 위에 화살표 · 이름표 — 쓴 순서대로 겹친다.
  drawOrder: 'scene',

  /**
   * 한 주기. 흐름 · 자국은 늘 흐르고(step 이 적분), 시간표는 캡션과 저항 화살표만
   * 가른다. 화살표는 `drag` 동안 0 에서 제 길이로 자라고 `fade` 에 거둔다.
   */
  timeline: {
    phases: [
      { id: 'flow', duration: PHASE.flow, caption: key('caption.flow') },
      { id: 'wake', duration: PHASE.wake, caption: key('caption.wake') },
      { id: 'drag', duration: PHASE.drag, ease: 'smooth', caption: key('caption.drag') },
      { id: 'hold', duration: PHASE.hold, caption: key('caption.drag') },
      { id: 'fade', duration: PHASE.fade, caption: key('caption.drag') },
    ],
  },

  /** 도착한 순간 — 자국은 이미 흐르고 있고, 곧 저항 화살표가 자란다. */
  startAt: PHASE.flow + PHASE.wake,

  /** 레인을 흐름으로 채운다 — 연기가 레인 끝까지 닿고 소용돌이가 여러 개 떨어진 뒤에 연다. */
  preroll: 7,

  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: LAYOUT.captionPx,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.3,
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 견줄 것은 거리가 아니라 두 자국의 너비와 두 화살표의
   * 길이다.
   */

  messages: dragInFluidMessages,
};
