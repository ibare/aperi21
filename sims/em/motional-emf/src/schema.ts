// ========================================================================
// motional-emf — 선언
// ========================================================================
// 질문: 자기장 속에서 도선을 움직이기만 해도 왜 도선 양 끝에 전압이 생기는가.
//
// 종이 안으로 들어가는 균일한 자기장(⊗) 속, 레일 위에 도체 막대가 놓여 있다.
// 막대가 오른쪽으로 미끄러지면 막대 속 전자가 막대와 함께 자기장을 가로지르므로
// 막대를 따라 아래로 밀린다. 전자가 아래 끝에 몰리고 위 끝에는 전자를 잃은 이온(+)이
// 드러난다 — 양 끝이 + 와 − 로 갈라진 것이 전압이다. 멈추면 밀림도 사라져 전자가
// 제자리로 돌아간다. 두 배 빠르게 밀면 밀림이 두 배라 갈라진 전하도 두 배다.
//
// 회로를 닫아 전류가 흐르는 것 · 제동은 이웃 `lenzs-law` · `eddy-current` 의 몫이다.
// 레일 왼쪽 끝은 열어 둔다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:motional-emf` 와 문자 그대로 일치한다 (C4). */
export const MOTIONAL_EMF_ID = 'motional-emf';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 느린 판의 막대 속력(월드 단위/초). */
export const V_SLOW = 1.25;
/** 빠른 판 속력 ÷ 느린 판 속력. 화면의 `2v` · `2ε` 이름표와 캡션이 이 값을 그대로 쓴다. */
export const SPEED_RATIO = 2;
/** 막대가 레일 위를 미끄러지는 거리(월드). 두 판이 같다. */
export const TRAVEL = 4;
/**
 * 느린 판에서 아래 끝으로 몰리는 전자 수. 몰리는 전하는 막대 속 전기장 = vB 에
 * 비례하므로 빠른 판에서는 속력 비만큼 늘어난다 (physics `pileOf`).
 */
export const PILE_SLOW = 2;
/** 막대를 따라 늘어선 이온 · 전자 짝의 수(줄 수). */
export const ION_ROWS = 8;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2).
// ------------------------------------------------------------------------

/** 속력(월드/초) → 움직임 화살표 길이(월드). */
export const ARROW_SCALE = 0.5;
/** 속력(월드/초) → 전자를 미는 힘 화살표 길이(월드). 힘 qvB 는 속력에 비례한다. */
export const FORCE_SCALE = 0.2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 레일 높이(위 · 아래 = ±). 막대 길이 L 은 레일 사이다. */
export const RAIL_Y = 1;
/** 레일 가로 범위. */
export const RAIL_X0 = -3.8;
export const RAIL_X1 = 3.8;
/** 막대 폭 · 반길이(레일 밖으로 조금 나온다). */
export const ROD_W = 0.4;
export const ROD_HALF = 1.22;
/** 이온 줄의 아래 · 위 끝 높이. */
export const ION_Y0 = -0.84;
export const ION_Y1 = 0.84;
/** 몰린 전자가 앉는 첫 줄 높이(가장 아래 이온 밑). */
export const PILE_Y = -1.0;

/** 자기장 ⊗ 무늬 — 가로 · 세로 범위와 간격. */
export const FIELD_X0 = -3.75;
export const FIELD_X1 = 3.75;
export const FIELD_Y0 = -1.25;
export const FIELD_Y1 = 1.25;
export const FIELD_STEP = 0.5;

/**
 * 프레이밍 — 자기장 무늬 양 끝과 `B` 이름표, 세로는 막대 끝의 + · − 표식과 그 아래
 * 캡션 자리까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -4.3, maxX: 4.1, minY: -2.05, maxY: 1.75 } as const;

// ------------------------------------------------------------------------
// 시간표 — 미끄러지는 단계의 길이는 물리가 정한다 (거리 ÷ 속력)
// ------------------------------------------------------------------------

/** 막대가 레일 왼쪽에 나타나는 동안(초). */
export const APPEAR = 0.6;
/** 움직이기 시작해 전자가 아래로 몰리는 동안. 막대는 이미 달리고 있다. */
export const BUILD = 0.6;
/** 느린 판 · 빠른 판에서 전자가 다 몰린 뒤 막대가 끝까지 미끄러지는 동안. */
export const SLIDE_SLOW = TRAVEL / V_SLOW - BUILD;
export const SLIDE_FAST = TRAVEL / (V_SLOW * SPEED_RATIO) - BUILD;
/** 멈춘 뒤 전자가 제자리로 돌아가는 동안. */
export const RELAX = 0.6;
/** 다시 고르게 된 막대를 보여 주는 동안. */
export const REST = 0.7;
/** 막대가 사라지는 동안. */
export const VANISH = 0.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const motionalEmfMessages = Object.freeze({
  'label.title': {
    ko: '운동 기전력',
    en: 'Motional EMF',
    ja: '運動起電力',
    zh: '动生电动势',
    ar: 'القوة الدافعة الكهربائية الحركية',
    es: 'Fem de movimiento',
    fr: 'F.é.m. de mouvement',
    hi: 'गतिक विद्युत वाहक बल',
    id: 'GGL gerak',
    pt: 'Fem de movimento',
  },
  'label.operation': {
    ko: '도선이 움직여 생기는 전압',
    en: 'The voltage made by a moving wire',
    ja: '動く導線が生む電圧',
    zh: '运动导线产生的电压',
    ar: 'الجهد الناتج عن سلك متحرك',
    es: 'El voltaje que produce un hilo en movimiento',
    fr: 'La tension créée par un fil en mouvement',
    hi: 'गतिमान तार से उत्पन्न वोल्टता',
    id: 'Tegangan yang ditimbulkan kawat yang bergerak',
    pt: 'A tensão gerada por um fio em movimento',
  },
  'label.stage': {
    ko: '레일 위 막대',
    en: 'Rod on rails',
    ja: 'レール上の棒',
    zh: '导轨上的棒',
    ar: 'قضيب على سكتين',
    es: 'Barra sobre rieles',
    fr: 'Tige sur des rails',
    hi: 'पटरियों पर छड़',
    id: 'Batang di atas rel',
    pt: 'Barra sobre trilhos',
  },
  'label.view': {
    ko: '위에서',
    en: 'From above',
    ja: '上から',
    zh: '俯视',
    ar: 'من الأعلى',
    es: 'Desde arriba',
    fr: 'Vu de dessus',
    hi: 'ऊपर से',
    id: 'Dari atas',
    pt: 'Vista de cima',
  },
  /** 기호 · 표식이라 번역 대상이 아니다 (C1 판정 1 · 3). */
  'label.field': {
    ko: 'B',
    en: 'B',
    ja: 'B',
    zh: 'B',
    ar: 'B',
    es: 'B',
    fr: 'B',
    hi: 'B',
    id: 'B',
    pt: 'B',
  },
  'label.electron': {
    ko: 'e⁻',
    en: 'e⁻',
    ja: 'e⁻',
    zh: 'e⁻',
    ar: 'e⁻',
    es: 'e⁻',
    fr: 'e⁻',
    hi: 'e⁻',
    id: 'e⁻',
    pt: 'e⁻',
  },
  'label.plus': {
    ko: '+',
    en: '+',
    ja: '+',
    zh: '+',
    ar: '+',
    es: '+',
    fr: '+',
    hi: '+',
    id: '+',
    pt: '+',
  },
  'label.minus': {
    ko: '−',
    en: '−',
    ja: '−',
    zh: '−',
    ar: '−',
    es: '−',
    fr: '−',
    hi: '−',
    id: '−',
    pt: '−',
  },
  'label.speed': {
    ko: 'v',
    en: 'v',
    ja: 'v',
    zh: 'v',
    ar: 'v',
    es: 'v',
    fr: 'v',
    hi: 'v',
    id: 'v',
    pt: 'v',
  },
  'label.speedTimes': {
    ko: '{k}v',
    en: '{k}v',
    ja: '{k}v',
    zh: '{k}v',
    ar: '{k}v',
    es: '{k}v',
    fr: '{k}v',
    hi: '{k}v',
    id: '{k}v',
    pt: '{k}v',
  },
  'label.force': {
    ko: 'F',
    en: 'F',
    ja: 'F',
    zh: 'F',
    ar: 'F',
    es: 'F',
    fr: 'F',
    hi: 'F',
    id: 'F',
    pt: 'F',
  },
  'label.forceTimes': {
    ko: '{k}F',
    en: '{k}F',
    ja: '{k}F',
    zh: '{k}F',
    ar: '{k}F',
    es: '{k}F',
    fr: '{k}F',
    hi: '{k}F',
    id: '{k}F',
    pt: '{k}F',
  },
  'label.emf': {
    ko: 'ε',
    en: 'ε',
    ja: 'ε',
    zh: 'ε',
    ar: 'ε',
    es: 'ε',
    fr: 'ε',
    hi: 'ε',
    id: 'ε',
    pt: 'ε',
  },
  'label.emfTimes': {
    ko: '{k}ε',
    en: '{k}ε',
    ja: '{k}ε',
    zh: '{k}ε',
    ar: '{k}ε',
    es: '{k}ε',
    fr: '{k}ε',
    hi: '{k}ε',
    id: '{k}ε',
    pt: '{k}ε',
  },
  'caption.setup': {
    ko: '자기장 속 레일 위에 도체 막대가 놓여 있다 — 전자와 이온이 고르게 섞여 있다',
    en: 'A metal rod rests on rails in a magnetic field — electrons and ions are evenly mixed',
    ja: '磁場の中のレールに金属棒が置かれている — 電子とイオンが一様に混ざっている',
    zh: '磁场中的导轨上放着一根金属棒 — 电子和离子均匀混合',
    ar: 'قضيب معدني موضوع على سكتين داخل مجال مغناطيسي — الإلكترونات والأيونات ممتزجة بالتساوي',
    es: 'Una barra metálica descansa sobre rieles en un campo magnético — electrones e iones están mezclados por igual',
    fr: 'Une tige métallique repose sur des rails dans un champ magnétique — électrons et ions sont mélangés uniformément',
    hi: 'चुंबकीय क्षेत्र में पटरियों पर एक धातु की छड़ रखी है — इलेक्ट्रॉन और आयन समान रूप से मिले हुए हैं',
    id: 'Sebuah batang logam terletak di atas rel dalam medan magnet — elektron dan ion bercampur merata',
    pt: 'Uma barra metálica repousa sobre trilhos em um campo magnético — elétrons e íons estão misturados por igual',
  },
  'caption.build': {
    ko: '막대가 움직이자 그 속의 전자가 아래로 밀린다',
    en: 'As the rod moves, the electrons inside it are pushed down',
    ja: '棒が動くと、その中の電子が下へ押される',
    zh: '棒一运动，其中的电子就被推向下方',
    ar: 'مع تحرّك القضيب تُدفع الإلكترونات التي بداخله إلى الأسفل',
    es: 'Al moverse la barra, los electrones de su interior son empujados hacia abajo',
    fr: 'Quand la tige se déplace, les électrons qu’elle contient sont poussés vers le bas',
    hi: 'छड़ के चलते ही उसके भीतर के इलेक्ट्रॉन नीचे की ओर धकेले जाते हैं',
    id: 'Saat batang bergerak, elektron di dalamnya terdorong ke bawah',
    pt: 'Quando a barra se move, os elétrons dentro dela são empurrados para baixo',
  },
  'caption.slide': {
    ko: '위 끝은 +, 아래 끝은 − — 움직이는 동안 막대 양 끝에 전압이 걸려 있다',
    en: 'Top end +, bottom end − — while it moves, there is a voltage across the rod',
    ja: '上端は +、下端は − — 動いている間、棒の両端に電圧がかかっている',
    zh: '上端为 +，下端为 − — 运动期间，棒两端存在电压',
    ar: 'الطرف العلوي +، والطرف السفلي − — وطوال حركته يوجد جهد بين طرفي القضيب',
    es: 'Extremo superior +, extremo inferior − — mientras se mueve, hay un voltaje entre los extremos de la barra',
    fr: 'Extrémité haute +, extrémité basse − — tant qu’elle bouge, une tension apparaît aux bornes de la tige',
    hi: 'ऊपरी सिरा +, निचला सिरा − — जब तक छड़ चलती है, उसके सिरों के बीच वोल्टता रहती है',
    id: 'Ujung atas +, ujung bawah − — selama bergerak, ada tegangan di antara ujung-ujung batang',
    pt: 'Ponta de cima +, ponta de baixo − — enquanto se move, há uma tensão entre as pontas da barra',
  },
  'caption.relax': {
    ko: '막대가 멈추자 밀림이 사라져 전자가 제자리로 돌아간다 — 전압도 없다',
    en: 'The rod stops, the push is gone and the electrons spread back — no voltage',
    ja: '棒が止まると押しが消え、電子は元のように広がる — 電圧もない',
    zh: '棒停下，推力消失，电子又散开回原处 — 没有电压',
    ar: 'يتوقف القضيب فيزول الدفع وتنتشر الإلكترونات من جديد — لا جهد',
    es: 'La barra se detiene, el empuje desaparece y los electrones se reparten de nuevo — sin voltaje',
    fr: 'La tige s’arrête, la poussée disparaît et les électrons se répartissent à nouveau — plus de tension',
    hi: 'छड़ रुकती है, धक्का खत्म होता है और इलेक्ट्रॉन फिर फैल जाते हैं — कोई वोल्टता नहीं',
    id: 'Batang berhenti, dorongan hilang dan elektron menyebar kembali — tak ada tegangan',
    pt: 'A barra para, o empurrão some e os elétrons se espalham de volta — sem tensão',
  },
  'caption.again': {
    ko: '같은 막대를 처음 자리로 되돌렸다 — 전자와 이온이 다시 고르게 섞여 있다',
    en: 'The same rod is back at the start — electrons and ions evenly mixed again',
    ja: '同じ棒が最初の位置に戻った — 電子とイオンは再び一様に混ざっている',
    zh: '同一根棒回到起点 — 电子和离子再次均匀混合',
    ar: 'عاد القضيب نفسه إلى البداية — الإلكترونات والأيونات ممتزجة بالتساوي من جديد',
    es: 'La misma barra vuelve al inicio — electrones e iones mezclados por igual otra vez',
    fr: 'La même tige est revenue au départ — électrons et ions de nouveau mélangés uniformément',
    hi: 'वही छड़ फिर शुरुआत पर है — इलेक्ट्रॉन और आयन फिर समान रूप से मिले हुए हैं',
    id: 'Batang yang sama kembali ke awal — elektron dan ion kembali bercampur merata',
    pt: 'A mesma barra está de volta ao início — elétrons e íons misturados por igual de novo',
  },
  'caption.buildFast': {
    ko: '{k}배 빠르니 전자를 미는 힘도 {k}배다',
    en: '{k} times the speed, {k} times the push on each electron',
    ja: '速さが {k} 倍なら、電子一つ一つを押す力も {k} 倍',
    zh: '速率是 {k} 倍，推每个电子的力也是 {k} 倍',
    ar: 'السرعة {k} أضعاف، والدفع على كل إلكترون {k} أضعاف',
    es: '{k} veces la rapidez, {k} veces el empuje sobre cada electrón',
    fr: '{k} fois la vitesse, {k} fois la poussée sur chaque électron',
    hi: '{k} गुनी चाल, हर इलेक्ट्रॉन पर {k} गुना धक्का',
    id: '{k} kali kelajuannya, {k} kali dorongan pada tiap elektron',
    pt: '{k} vezes a velocidade, {k} vezes o empurrão em cada elétron',
  },
  'caption.slideFast': {
    ko: '양 끝에 갈라진 전하가 {k}배 — 전압도 {k}배다',
    en: '{k} times as much charge at the ends — {k} times the voltage',
    ja: '両端の電荷が {k} 倍 — 電圧も {k} 倍',
    zh: '两端的电荷是 {k} 倍 — 电压也是 {k} 倍',
    ar: 'الشحنة عند الطرفين {k} أضعاف — والجهد {k} أضعاف',
    es: '{k} veces más carga en los extremos — {k} veces el voltaje',
    fr: '{k} fois plus de charge aux extrémités — {k} fois la tension',
    hi: 'सिरों पर {k} गुना आवेश — {k} गुनी वोल्टता',
    id: '{k} kali lebih banyak muatan di ujung-ujung — {k} kali tegangannya',
    pt: '{k} vezes mais carga nas pontas — {k} vezes a tensão',
  },
} satisfies Record<string, LocalizedText>);

export type MotionalEmfMessageKey = keyof typeof motionalEmfMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MotionalEmfMessageKey): LocalizedText => motionalEmfMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MotionalEmfMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const motionalEmfSchema: BundleSchema = {
  id: MOTIONAL_EMF_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 막대가 달리고, 멈추고, 두 배 빠르게 다시 달린다.
  parameters: [],

  stages: [
    {
      id: 'rails',
      label: text('label.stage'),
      constants: {
        vSlow: V_SLOW,
        speedRatio: SPEED_RATIO,
        travel: TRAVEL,
        pileSlow: PILE_SLOW,
        ionRows: ION_ROWS,
        arrowScale: ARROW_SCALE,
        forceScale: FORCE_SCALE,
      },
    },
  ],

  environments: [],
  views: [{ id: 'top', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 레일 한 쌍과 막대 하나가 전부다. */
  canvas: { height: 300, minHeight: 280 },

  /**
   * 겹침이 판정 장치다 — 막대가 자기장 무늬와 레일 **위**를 지나고, 이온 · 전자가 막대
   * **안**에 보여야 한다. 층 순서로는 막대(body)가 이온 획(lineSet) · 전자
   * (particleSystem)와 어느 쪽이 위인지 고를 수 없다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 느린 판 · 빠른 판. 판마다
   * 나타남 → 몰림(달리기 시작) → 미끄러짐 → 풀림(멈춤) → 고름 → 사라짐.
   *
   * 몰림 + 미끄러짐의 길이는 거리 ÷ 속력이다 — 막대가 레일 끝에 닿는 순간 풀림이
   * 시작돼 「멈췄다」 캡션이 화면과 어긋나지 않는다 (장부 G13 — 스테이지 상수를 따라가지 않는다).
   */
  timeline: {
    phases: [
      { id: 'slow-in', duration: APPEAR, caption: key('caption.setup') },
      { id: 'slow-build', duration: BUILD, ease: 'smooth', caption: key('caption.build') },
      { id: 'slow-slide', duration: SLIDE_SLOW, caption: key('caption.slide') },
      { id: 'slow-relax', duration: RELAX, ease: 'smooth', caption: key('caption.relax') },
      { id: 'slow-rest', duration: REST, caption: key('caption.relax') },
      { id: 'slow-out', duration: VANISH, caption: key('caption.relax') },
      { id: 'fast-in', duration: APPEAR, caption: key('caption.again') },
      { id: 'fast-build', duration: BUILD, ease: 'smooth', caption: key('caption.buildFast') },
      { id: 'fast-slide', duration: SLIDE_FAST, caption: key('caption.slideFast') },
      { id: 'fast-relax', duration: RELAX, ease: 'smooth', caption: key('caption.relax') },
      { id: 'fast-rest', duration: REST, caption: key('caption.relax') },
      { id: 'fast-out', duration: VANISH, caption: key('caption.relax') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 느린 판의 막대가 전하를 가른 채 달리고 있다. */
  startAt: 2.0,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙과 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
    /** 배수는 스테이지 상수에서 온다 — state 가 한 번 글자로 옮겨 둔다 (장부 G133). */
    vars: { k: 'speedRatio' },
  },

  messages: motionalEmfMessages,
};
