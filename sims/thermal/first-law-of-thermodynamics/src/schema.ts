// ========================================================================
// first-law-of-thermodynamics — 선언
// ========================================================================
// 질문: 기체에 열을 넣으면 그 열은 다 어디로 가는가.
//
// 추를 얹은 자유 피스톤 실린더에 열 알갱이를 하나씩 넣는다. 알갱이는 기체에 남는
// 더미(ΔU)와 피스톤을 민 더미(W)로 갈린다 — 단원자 기체의 등압 가열에서 3 : 2.
// 두 번째 판에서 피스톤을 핀으로 고정하면 같은 알갱이가 모두 기체에 남고, 온도 막대가
// 앞 판 눈금보다 더 올라간다. 동사: 갈린다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:first-law-of-thermodynamics` 와 문자 그대로 일치한다 (C4). */
export const FIRST_LAW_OF_THERMODYNAMICS_ID = 'first-law-of-thermodynamics';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const firstLawOfThermodynamicsMessages = Object.freeze({
  'label.title': {
    ko: '열역학 제1법칙',
    en: 'First law of thermodynamics',
    ja: '熱力学第一法則',
    zh: '热力学第一定律',
    ar: 'القانون الأول للديناميكا الحرارية',
    es: 'Primera ley de la termodinámica',
    fr: 'Premier principe de la thermodynamique',
    hi: 'ऊष्मागतिकी का प्रथम नियम',
    id: 'Hukum pertama termodinamika',
    pt: 'Primeira lei da termodinâmica',
  },
  'label.operation': {
    ko: '내부 에너지·일·열의 관계',
    en: 'How internal energy, work and heat relate',
    ja: '内部エネルギー・仕事・熱の関係',
    zh: '内能、功与热量的关系',
    ar: 'العلاقة بين الطاقة الداخلية والشغل والحرارة',
    es: 'Cómo se relacionan la energía interna, el trabajo y el calor',
    fr: 'Comment l’énergie interne, le travail et la chaleur sont liés',
    hi: 'आंतरिक ऊर्जा, कार्य और ऊष्मा का संबंध',
    id: 'Hubungan energi dalam, usaha, dan kalor',
    pt: 'Como se relacionam energia interna, trabalho e calor',
  },
  'label.stage': {
    ko: '단원자 기체',
    en: 'Monatomic gas',
    ja: '単原子気体',
    zh: '单原子气体',
    ar: 'غاز أحادي الذرة',
    es: 'Gas monoatómico',
    fr: 'Gaz monoatomique',
    hi: 'एकपरमाणुक गैस',
    id: 'Gas monoatomik',
    pt: 'Gás monoatômico',
  },
  'label.view': {
    ko: '실린더와 열 알갱이',
    en: 'Cylinder and heat grains',
    ja: 'シリンダーと熱の粒',
    zh: '气缸与热量颗粒',
    ar: 'الأسطوانة وحبيبات الحرارة',
    es: 'Cilindro y granos de calor',
    fr: 'Cylindre et grains de chaleur',
    hi: 'सिलिंडर और ऊष्मा के कण',
    id: 'Silinder dan butir kalor',
    pt: 'Cilindro e grãos de calor',
  },

  'label.q': {
    ko: '넣은 열 {q} J',
    en: 'Heat in {q} J',
    ja: '加えた熱 {q} J',
    zh: '吸收热量 {q} J',
    ar: 'الحرارة المُدخَلة {q} J',
    es: 'Calor aportado {q} J',
    fr: 'Chaleur fournie {q} J',
    hi: 'दी गई ऊष्मा {q} J',
    id: 'Kalor masuk {q} J',
    pt: 'Calor fornecido {q} J',
  },
  'label.du': {
    ko: '기체에 남은 몫',
    en: 'Stays in gas',
    ja: '気体に残る分',
    zh: '留在气体中',
    ar: 'يبقى في الغاز',
    es: 'Se queda en el gas',
    fr: 'Reste dans le gaz',
    hi: 'गैस में रहता है',
    id: 'Tinggal di gas',
    pt: 'Fica no gás',
  },
  'label.w': {
    ko: '피스톤을 민 몫',
    en: 'Pushes piston',
    ja: 'ピストンを押す分',
    zh: '推动活塞',
    ar: 'يدفع المكبس',
    es: 'Empuja el pistón',
    fr: 'Pousse le piston',
    hi: 'पिस्टन को धकेलता है',
    id: 'Mendorong piston',
    pt: 'Empurra o pistão',
  },
  'label.gas': {
    ko: '헬륨 {n} mol',
    en: 'Helium {n} mol',
    ja: 'ヘリウム {n} mol',
    zh: '氦 {n} mol',
    ar: 'هيليوم {n} mol',
    es: 'Helio {n} mol',
    fr: 'Hélium {n} mol',
    hi: 'हीलियम {n} mol',
    id: 'Helium {n} mol',
    pt: 'Hélio {n} mol',
  },
  'label.heater': {
    ko: '가열',
    en: 'Heater',
    ja: 'ヒーター',
    zh: '加热器',
    ar: 'السخّان',
    es: 'Calentador',
    fr: 'Chauffage',
    hi: 'हीटर',
    id: 'Pemanas',
    pt: 'Aquecedor',
  },
  'label.temperature': {
    ko: '온도',
    en: 'Temp.',
    ja: '温度',
    zh: '温度',
    ar: 'درجة الحرارة',
    es: 'Temp.',
    fr: 'Temp.',
    hi: 'ताप',
    id: 'Suhu',
    pt: 'Temp.',
  },
  'label.t0': { ko: '{t} K', en: '{t} K', ja: '{t} K', zh: '{t} K', ar: '{t} K', es: '{t} K', fr: '{t} K', hi: '{t} K', id: '{t} K', pt: '{t} K' },
  'label.rise': {
    ko: '+{dt} K',
    en: '+{dt} K',
    ja: '+{dt} K',
    zh: '+{dt} K',
    ar: '+{dt} K',
    es: '+{dt} K',
    fr: '+{dt} K',
    hi: '+{dt} K',
    id: '+{dt} K',
    pt: '+{dt} K',
  },

  'caption.free.intro': {
    ko: '추를 얹은 피스톤이 자유롭게 오르내린다 — 기체는 {t0} K',
    en: 'A weighted piston is free to move — the gas is at {t0} K',
    ja: 'おもりを載せたピストンが自由に上下する — 気体は {t0} K',
    zh: '压着砝码的活塞可以自由上下 — 气体温度为 {t0} K',
    ar: 'مكبس عليه ثقل يتحرك بحرية — الغاز عند {t0} K',
    es: 'Un pistón con pesa se mueve libremente — el gas está a {t0} K',
    fr: 'Un piston lesté se déplace librement — le gaz est à {t0} K',
    hi: 'भार रखा पिस्टन स्वतंत्र रूप से ऊपर-नीचे हो सकता है — गैस {t0} K पर है',
    id: 'Piston berpemberat bebas bergerak — gas bersuhu {t0} K',
    pt: 'Um pistão com peso se move livremente — o gás está a {t0} K',
  },
  'caption.free.heat': {
    ko: '아래에서 열 알갱이 {grains}개를 넣는다 — 기체에 남는 것과 피스톤으로 가는 것이 갈린다',
    en: 'Feeding in {grains} grains of heat — some stay in the gas, some go to the piston',
    ja: '熱の粒を {grains} 個入れる — 気体に残るものとピストンへ行くものに分かれる',
    zh: '送入 {grains} 颗热量颗粒 — 一部分留在气体中，一部分去推活塞',
    ar: 'تُدخَل {grains} حبيبات من الحرارة — بعضها يبقى في الغاز وبعضها يذهب إلى المكبس',
    es: 'Entran {grains} granos de calor — unos se quedan en el gas y otros van al pistón',
    fr: 'On fournit {grains} grains de chaleur — certains restent dans le gaz, d’autres vont au piston',
    hi: 'ऊष्मा के {grains} कण डाले जा रहे हैं — कुछ गैस में रहते हैं, कुछ पिस्टन की ओर जाते हैं',
    id: 'Memasukkan {grains} butir kalor — sebagian tinggal di gas, sebagian pergi ke piston',
    pt: 'Entram {grains} grãos de calor — alguns ficam no gás, outros vão para o pistão',
  },
  'caption.free.result': {
    ko: '{u}개는 기체에 남아 {dtf} K 데웠고, {w}개는 추를 밀어 올렸다',
    en: '{u} stayed in the gas and warmed it {dtf} K; {w} pushed the weight up',
    ja: '{u} 個は気体に残って {dtf} K 温め、{w} 個はおもりを押し上げた',
    zh: '{u} 颗留在气体中，使它升温 {dtf} K；{w} 颗把砝码推了上去',
    ar: 'بقيت {u} في الغاز ورفعت حرارته {dtf} K، ودفعت {w} الثقل إلى الأعلى',
    es: '{u} se quedaron en el gas y lo calentaron {dtf} K; {w} empujaron la pesa hacia arriba',
    fr: '{u} sont restés dans le gaz et l’ont réchauffé de {dtf} K ; {w} ont poussé la masse vers le haut',
    hi: '{u} गैस में रहे और उसे {dtf} K गर्म किया; {w} ने भार को ऊपर धकेला',
    id: '{u} tinggal di gas dan menghangatkannya {dtf} K; {w} mendorong pemberat ke atas',
    pt: '{u} ficaram no gás e o aqueceram {dtf} K; {w} empurraram o peso para cima',
  },
  'caption.lock.intro': {
    ko: '같은 기체, {t0} K — 이번에는 피스톤을 핀으로 고정했다',
    en: 'Same gas at {t0} K — this time the piston is pinned',
    ja: '同じ気体、{t0} K — 今度はピストンをピンで固定した',
    zh: '同样的气体，{t0} K — 这次用销钉把活塞固定住',
    ar: 'الغاز نفسه عند {t0} K — هذه المرة ثُبِّت المكبس بمسمار',
    es: 'El mismo gas a {t0} K — esta vez el pistón está fijado con un pasador',
    fr: 'Même gaz à {t0} K — cette fois le piston est bloqué par une goupille',
    hi: 'वही गैस, {t0} K पर — इस बार पिस्टन को पिन से जकड़ दिया गया है',
    id: 'Gas yang sama pada {t0} K — kali ini piston dikunci dengan pasak',
    pt: 'O mesmo gás a {t0} K — desta vez o pistão está travado com um pino',
  },
  'caption.lock.heat': {
    ko: '같은 열 알갱이 {grains}개를 넣는다 — 피스톤은 움직이지 않는다',
    en: 'Feeding in the same {grains} grains — the piston does not move',
    ja: '同じ熱の粒を {grains} 個入れる — ピストンは動かない',
    zh: '送入同样的 {grains} 颗热量颗粒 — 活塞不动',
    ar: 'تُدخَل الحبيبات نفسها وعددها {grains} — المكبس لا يتحرك',
    es: 'Entran los mismos {grains} granos — el pistón no se mueve',
    fr: 'On fournit les mêmes {grains} grains — le piston ne bouge pas',
    hi: 'वही {grains} कण डाले जा रहे हैं — पिस्टन नहीं हिलता',
    id: 'Memasukkan {grains} butir yang sama — piston tidak bergerak',
    pt: 'Entram os mesmos {grains} grãos — o pistão não se move',
  },
  'caption.lock.result': {
    ko: '{grains}개가 모두 기체에 남아 {dtl} K 데웠다 — 앞에서는 {dtf} K',
    en: 'All {grains} stayed in the gas and warmed it {dtl} K — {dtf} K before',
    ja: '{grains} 個すべてが気体に残って {dtl} K 温めた — 前は {dtf} K',
    zh: '{grains} 颗全部留在气体中，使它升温 {dtl} K — 之前是 {dtf} K',
    ar: 'بقيت الحبيبات الـ{grains} كلها في الغاز ورفعت حرارته {dtl} K — وكانت {dtf} K من قبل',
    es: 'Los {grains} se quedaron en el gas y lo calentaron {dtl} K — antes, {dtf} K',
    fr: 'Les {grains} sont tous restés dans le gaz et l’ont réchauffé de {dtl} K — contre {dtf} K avant',
    hi: 'सभी {grains} गैस में रहे और उसे {dtl} K गर्म किया — पहले {dtf} K',
    id: 'Semua {grains} tinggal di gas dan menghangatkannya {dtl} K — sebelumnya {dtf} K',
    pt: 'Todos os {grains} ficaram no gás e o aqueceram {dtl} K — antes, {dtf} K',
  },
} satisfies Record<string, LocalizedText>);

export type FirstLawOfThermodynamicsMessageKey = keyof typeof firstLawOfThermodynamicsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: FirstLawOfThermodynamicsMessageKey): LocalizedText => firstLawOfThermodynamicsMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: FirstLawOfThermodynamicsMessageKey): string {
  return k;
}

/** 알갱이 하나가 날아가는 단계 길이(초). 알갱이마다 단계를 따로 선언한다 — 아래 `timeline`. */
const GRAIN_S = 0.8;

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const firstLawOfThermodynamicsSchema: BundleSchema = {
  id: FIRST_LAW_OF_THERMODYNAMICS_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],

  /**
   * 주장이 기대는 물리량 — 모두 선언이다. 식으로 만들지 않는다.
   *
   * - `q` 넣은 열(J) · `n` 몰수 · `t0` 처음 온도(K)
   * - `dTFree` 자유 피스톤(등압)의 온도 상승(K) · `dTLocked` 고정 피스톤(등적)의 온도 상승(K).
   *   단원자 이상 기체라 q = 5/2·n·R·dTFree = 3/2·n·R·dTLocked 이 되도록 골랐다(0.4 mol · 750 J → 90 K · 150 K).
   * - `grains` 열 알갱이 수 · `uPart` 기체에 남는 알갱이 · `wPart` 피스톤을 미는 알갱이 (3 : 2).
   *   `grains` 는 시간표의 알갱이 단계 수(`free-g*` · `lock-g*`)와 같아야 한다.
   * - `molecules` 분자 수 · `seed` 분자 자리의 시드 · `molSpeed` 처음 온도에서 분자 걸음(상자 폭/초)
   */
  stages: [
    {
      id: 'monatomic',
      label: text('label.stage'),
      constants: {
        q: 750,
        n: 0.4,
        t0: 300,
        dTFree: 90,
        dTLocked: 150,
        grains: 5,
        uPart: 3,
        wPart: 2,
        molecules: 22,
        seed: 11,
        molSpeed: 0.55,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  canvas: { height: 380, minHeight: 340 },

  /** 쓴 순서대로 — 실린더 벽이 핀 · 피스톤 가장자리 위에, 날아가는 알갱이가 맨 위에 온다. */
  drawOrder: 'scene',

  /**
   * 두 판. 자유 피스톤(free) 다음에 고정 피스톤(lock).
   * 알갱이 하나가 날아가는 동안이 한 단계다 — 단계 안을 코드로 다시 가르지 않는다(S-piece).
   */
  timeline: {
    phases: [
      { id: 'free-in', duration: 0.4, caption: key('caption.free.intro') },
      { id: 'free-show', duration: 1.2, caption: key('caption.free.intro') },
      { id: 'free-g1', duration: GRAIN_S, ease: 'smooth', caption: key('caption.free.heat') },
      { id: 'free-g2', duration: GRAIN_S, ease: 'smooth', caption: key('caption.free.heat') },
      { id: 'free-g3', duration: GRAIN_S, ease: 'smooth', caption: key('caption.free.heat') },
      { id: 'free-g4', duration: GRAIN_S, ease: 'smooth', caption: key('caption.free.heat') },
      { id: 'free-g5', duration: GRAIN_S, ease: 'smooth', caption: key('caption.free.heat') },
      { id: 'free-hold', duration: 2.6, caption: key('caption.free.result') },
      { id: 'free-out', duration: 0.5, caption: key('caption.free.result') },
      { id: 'lock-in', duration: 0.4, caption: key('caption.lock.intro') },
      { id: 'lock-show', duration: 1.4, caption: key('caption.lock.intro') },
      { id: 'lock-g1', duration: GRAIN_S, ease: 'smooth', caption: key('caption.lock.heat') },
      { id: 'lock-g2', duration: GRAIN_S, ease: 'smooth', caption: key('caption.lock.heat') },
      { id: 'lock-g3', duration: GRAIN_S, ease: 'smooth', caption: key('caption.lock.heat') },
      { id: 'lock-g4', duration: GRAIN_S, ease: 'smooth', caption: key('caption.lock.heat') },
      { id: 'lock-g5', duration: GRAIN_S, ease: 'smooth', caption: key('caption.lock.heat') },
      { id: 'lock-hold', duration: 3.2, caption: key('caption.lock.result') },
      { id: 'lock-out', duration: 0.5, caption: key('caption.lock.result') },
    ],
  },

  /** 도착한 순간 이미 두 번째 알갱이가 날아가는 중이다. */
  startAt: 2.4,

  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -12] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 640,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: {
      t0: 't0Text',
      grains: 'grainsText',
      u: 'uText',
      w: 'wText',
      dtf: 'dTFreeText',
      dtl: 'dTLockedText',
    },
  },

  messages: firstLawOfThermodynamicsMessages,
};
