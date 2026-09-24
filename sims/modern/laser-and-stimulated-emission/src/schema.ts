// ========================================================================
// laser-and-stimulated-emission — 선언
// ========================================================================
// 질문: 레이저 빛은 어떻게 한 결로 불어나는가.
//
// 들뜬 원자 곁을 알맞은 에너지의 광자가 지나가면, 원자가 바닥으로 내려오며 **같은 방향 ·
// 같은 위상 · 같은 파장**의 광자를 하나 더 낸다(유도 방출). 들뜬 원자가 더 많은 매질을 두
// 거울 사이에 두면 광자가 오갈 때마다 이 일이 연쇄로 일어나 물결이 불어나고, 불어난 물결은
// 봉우리가 한 줄로 맞은 채 일부 통과 거울로 나간다 — 결 맞은 빔.
//
// 이웃과 겹치지 않는 자리 — `bohr-model` 은 원자 **하나**의 궤도 도약과 제멋대로 나오는 빛
// 하나(자발 방출)다. 이 조각은 준위 사다리 · 궤도를 두지 않고, **빛이 빛을 부르는** 연쇄만 한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:laser-and-stimulated-emission` 와 문자 그대로 일치한다 (C4). */
export const LASER_AND_STIMULATED_EMISSION_ID = 'laser-and-stimulated-emission';

// ------------------------------------------------------------------------
// 물리 · 배치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 빛의 파장(nm). 헬륨-네온 레이저의 빨강. 화면 이름표에 이 값 그대로 뜬다. */
export const WAVELENGTH_NM = 633;
/**
 * 파장을 물결 간격으로 그리는 배율(월드 단위 / nm). 633 nm 가 약 1.5 단위.
 * 실제 파장은 원자 간격보다 천 배쯤 길다 — 이 배율은 봉우리가 맞는지 보이려는 것이다 (NOTES (b)).
 */
export const WAVE_SCALE = 0.0024;
/** 광자 물결 묶음의 길이 · 진폭(월드 단위). */
export const PACKET_LENGTH = 6.5;
export const PACKET_AMPLITUDE = 0.42;

/** 거울 자리(월드 x). 왼쪽 거울은 −, 일부 통과 거울은 +. */
export const MIRROR_X = 18;
/** 광자가 지나는 길(가닥) 수 · 길 사이 간격(월드). 가운데 길에서 첫 광자가 출발한다. */
export const LANES = 7;
export const LANE_GAP = 1.35;
/** 한 길에 놓인 원자 수. 원자는 길마다 거울 사이를 고르게 나눈 칸 안에 흩어진다. */
export const ATOMS_PER_LANE = 6;
/** 원자가 거울에서 떨어져 놓이는 여백(월드). */
export const ATOM_MARGIN = 2;
/** 처음에 들떠 있는 원자의 몫 — 반이 넘어야 빛이 불어난다(밀도 반전). */
export const EXCITED_FRACTION = 0.82;
/**
 * 광자 하나가 들뜬 원자 곁(같은 길 · 이웃 길)을 지날 때 그 원자가 유도 방출하는 몫. 곁을 지나는
 * 광자가 n 개면 1 − (1 − 이 값)ⁿ 이다 — 광자가 늘수록 방출이 잦아져 연쇄가 빨라진다.
 */
export const STIMULATE_CHANCE = 0.12;
/** 원자 배치 · 들뜸 · 유도 방출의 뽑기를 정하는 시드. 같은 시드는 언제나 같은 매질이다 (S-sim). */
export const SEED = 11;
/**
 * 일부 통과 거울을 빠져나간 빔이 날아가는 거리(월드). 마지막 단계 동안 앞머리가 이만큼 간다 —
 * 단계 길이와 함께 거울 사이를 오가던 속력과 맞춰 두었다(장부 G129 · G143).
 */
export const OUT_RUN = 30;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 두 거울 사이 가운데가 원점.
// ------------------------------------------------------------------------

/** 프레이밍 — 왼쪽 거울 이름표부터 나간 빔까지, 매질 위아래 이름표와 캡션 띠(장부 G24). */
export const SCENE_BOUNDS = { minX: -21, maxX: 33, minY: -9.6, maxY: 7.2 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초, 조각 시계)
// ------------------------------------------------------------------------

/** 거울 사이를 한 번 건너는 동안. 세 번 모두 같다 — 빛의 속력이 같다. */
export const PASS = 2.4;
/** 첫 건넘의 재생 속도 — 첫 유도 방출이 눈에 들어오도록 느리게 본다. */
export const FIRST_PASS_TIME_SCALE = 0.4;
/** 빔이 일부 통과 거울을 빠져나가 멀어지는 동안. `OUT_RUN` 을 같은 속력으로 가는 시간. */
export const OUT = 2;
/** 바닥으로 내려온 원자가 다시 들뜨는 동안(펌핑). */
export const PUMP = 1.4;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const laserAndStimulatedEmissionMessages = Object.freeze({
  'label.title': {
    ko: '레이저와 유도 방출',
    en: 'Lasers and stimulated emission',
    ja: 'レーザーと誘導放出',
    zh: '激光与受激辐射',
    ar: 'الليزر والانبعاث المحفَّز',
    es: 'Láseres y emisión estimulada',
    fr: 'Lasers et émission stimulée',
    hi: 'लेज़र और उद्दीपित उत्सर्जन',
    id: 'Laser dan emisi terstimulasi',
    pt: 'Lasers e emissão estimulada',
  },
  'label.operation': {
    ko: '결이 맞는 빛의 증폭',
    en: 'Amplifying light in step',
    ja: '足並みのそろった光の増幅',
    zh: '步调一致的光的放大',
    ar: 'تضخيم الضوء المتوافق في الطور',
    es: 'Amplificar la luz en fase',
    fr: 'Amplifier la lumière en phase',
    hi: 'कला में मेल खाते प्रकाश का प्रवर्धन',
    id: 'Menguatkan cahaya yang selaras',
    pt: 'Amplificar a luz em fase',
  },
  'label.stage': {
    ko: '헬륨-네온 레이저',
    en: 'Helium–neon laser',
    ja: 'ヘリウムネオンレーザー',
    zh: '氦氖激光器',
    ar: 'ليزر الهيليوم–نيون',
    es: 'Láser de helio–neón',
    fr: 'Laser hélium–néon',
    hi: 'हीलियम–नियॉन लेज़र',
    id: 'Laser helium–neon',
    pt: 'Laser de hélio–neônio',
  },
  'label.view': {
    ko: '공진기',
    en: 'Cavity',
    ja: '共振器',
    zh: '谐振腔',
    ar: 'التجويف الرنيني',
    es: 'Cavidad',
    fr: 'Cavité',
    hi: 'अनुनादी गुहिका',
    id: 'Rongga',
    pt: 'Cavidade',
  },
  'label.mirror': {
    ko: '거울',
    en: 'Mirror',
    ja: '鏡',
    zh: '反射镜',
    ar: 'مرآة',
    es: 'Espejo',
    fr: 'Miroir',
    hi: 'दर्पण',
    id: 'Cermin',
    pt: 'Espelho',
  },
  'label.outputMirror': {
    ko: '일부 통과 거울',
    en: 'Partial mirror',
    ja: '部分透過鏡',
    zh: '部分透射镜',
    ar: 'مرآة جزئية النفاذ',
    es: 'Espejo parcial',
    fr: 'Miroir partiel',
    hi: 'आंशिक दर्पण',
    id: 'Cermin parsial',
    pt: 'Espelho parcial',
  },
  'label.medium': {
    ko: '들뜬 원자가 더 많은 매질',
    en: 'Medium with more excited atoms than not',
    ja: '励起した原子のほうが多い媒質',
    zh: '激发态原子占多数的介质',
    ar: 'وسط ذراته المثارة أكثر من غير المثارة',
    es: 'Medio con más átomos excitados que sin excitar',
    fr: 'Milieu avec plus d’atomes excités que non excités',
    hi: 'ऐसा माध्यम जिसमें उत्तेजित परमाणु अनुत्तेजित से अधिक हैं',
    id: 'Medium dengan atom tereksitasi lebih banyak daripada yang tidak',
    pt: 'Meio com mais átomos excitados do que não excitados',
  },
  'label.excitedAtom': {
    ko: '들뜬 원자',
    en: 'Excited atom',
    ja: '励起原子',
    zh: '激发态原子',
    ar: 'ذرة مثارة',
    es: 'Átomo excitado',
    fr: 'Atome excité',
    hi: 'उत्तेजित परमाणु',
    id: 'Atom tereksitasi',
    pt: 'Átomo excitado',
  },
  'label.photon': {
    ko: '광자 하나',
    en: 'One photon',
    ja: '光子1個',
    zh: '一个光子',
    ar: 'فوتون واحد',
    es: 'Un fotón',
    fr: 'Un photon',
    hi: 'एक फोटॉन',
    id: 'Satu foton',
    pt: 'Um fóton',
  },
  'label.clone': {
    ko: '똑같은 광자',
    en: 'An identical photon',
    ja: '同じ光子',
    zh: '一模一样的光子',
    ar: 'فوتون مطابق',
    es: 'Un fotón idéntico',
    fr: 'Un photon identique',
    hi: 'एक समरूप फोटॉन',
    id: 'Foton yang identik',
    pt: 'Um fóton idêntico',
  },
  /** 나간 빔 — 파장은 스테이지 정박값을 그대로 끼운다. */
  'label.beam': {
    ko: '결 맞은 빔 · {nm} nm',
    en: 'Coherent beam · {nm} nm',
    ja: 'コヒーレントなビーム · {nm} nm',
    zh: '相干光束 · {nm} nm',
    ar: 'حزمة مترابطة · {nm} nm',
    es: 'Haz coherente · {nm} nm',
    fr: 'Faisceau cohérent · {nm} nm',
    hi: 'कलासंबद्ध किरणपुंज · {nm} nm',
    id: 'Berkas koheren · {nm} nm',
    pt: 'Feixe coerente · {nm} nm',
  },
  'caption.first': {
    ko: '들뜬 원자 곁을 광자가 지나가면, 원자가 같은 방향 · 같은 위상 · 같은 파장의 광자를 하나 더 낸다',
    en: 'When a photon passes an excited atom, the atom gives off one more photon — same direction, same phase, same wavelength',
    ja: '光子が励起原子のそばを通ると、原子はもう1個の光子を出す — 同じ向き、同じ位相、同じ波長',
    zh: '光子经过激发态原子时，原子会再发出一个光子 — 方向相同、相位相同、波长相同',
    ar: 'عندما يمر فوتون بذرة مثارة، تُطلق الذرة فوتونًا آخر — بالاتجاه نفسه والطور نفسه والطول الموجي نفسه',
    es: 'Cuando un fotón pasa junto a un átomo excitado, el átomo emite un fotón más — misma dirección, misma fase, misma longitud de onda',
    fr: 'Quand un photon passe près d’un atome excité, l’atome émet un photon de plus — même direction, même phase, même longueur d’onde',
    hi: 'जब कोई फोटॉन उत्तेजित परमाणु के पास से गुज़रता है, तो परमाणु एक और फोटॉन छोड़ता है — वही दिशा, वही कला, वही तरंगदैर्घ्य',
    id: 'Saat sebuah foton melewati atom tereksitasi, atom itu memancarkan satu foton lagi — arah sama, fase sama, panjang gelombang sama',
    pt: 'Quando um fóton passa por um átomo excitado, o átomo emite mais um fóton — mesma direção, mesma fase, mesmo comprimento de onda',
  },
  'caption.bounce': {
    ko: '거울에 되돌아온 광자들이 다시 들뜬 원자를 지나며 똑같은 광자를 불러 불어난다',
    en: 'Sent back by the mirrors, the photons pass excited atoms again and call up more identical photons',
    ja: '鏡で送り返された光子が再び励起原子のそばを通り、同じ光子をさらに呼び出して増えていく',
    zh: '被反射镜送回的光子再次经过激发态原子，引出更多一模一样的光子',
    ar: 'تعيد المرايا الفوتونات فتمر بالذرات المثارة من جديد وتستدعي مزيدًا من الفوتونات المطابقة',
    es: 'Devueltos por los espejos, los fotones pasan de nuevo junto a átomos excitados y hacen surgir más fotones idénticos',
    fr: 'Renvoyés par les miroirs, les photons repassent près des atomes excités et en font naître d’autres, identiques',
    hi: 'दर्पणों से लौटाए गए फोटॉन फिर से उत्तेजित परमाणुओं के पास से गुज़रते हैं और और भी समरूप फोटॉन उत्पन्न कराते हैं',
    id: 'Dipantulkan kembali oleh cermin, foton-foton melewati atom tereksitasi lagi dan memunculkan lebih banyak foton yang identik',
    pt: 'Devolvidos pelos espelhos, os fótons passam de novo por átomos excitados e fazem surgir mais fótons idênticos',
  },
  'caption.out': {
    ko: '봉우리가 한 줄로 맞은 빛이 일부 통과 거울로 한 방향으로 나간다 — 레이저 빔',
    en: 'Light with every crest in line leaves through the partial mirror in one direction — a laser beam',
    ja: 'すべての山がそろった光が、部分透過鏡から一方向へ出ていく — レーザービーム',
    zh: '每个波峰都对齐的光从部分透射镜朝一个方向射出 — 激光束',
    ar: 'يخرج الضوء الذي اصطفت كل قممه عبر المرآة الجزئية النفاذ في اتجاه واحد — حزمة ليزر',
    es: 'La luz con todas sus crestas alineadas sale por el espejo parcial en una sola dirección — un haz láser',
    fr: 'La lumière dont toutes les crêtes sont alignées sort par le miroir partiel dans une seule direction — un faisceau laser',
    hi: 'जिस प्रकाश के सारे शिखर एक पंक्ति में हैं, वह आंशिक दर्पण से एक ही दिशा में निकलता है — लेज़र किरणपुंज',
    id: 'Cahaya yang semua puncaknya sejajar keluar melalui cermin parsial ke satu arah — berkas laser',
    pt: 'A luz com todas as cristas alinhadas sai pelo espelho parcial em uma só direção — um feixe de laser',
  },
  'caption.pump': {
    ko: '바닥으로 내려온 원자를 다시 들뜨게 하면 처음으로 돌아간다',
    en: 'Excite the atoms that dropped back down, and it starts over',
    ja: '下に戻った原子を再び励起すると、最初に戻る',
    zh: '让落回基态的原子重新被激发，一切从头开始',
    ar: 'أعِد إثارة الذرات التي هبطت، فيبدأ كل شيء من جديد',
    es: 'Excita de nuevo los átomos que bajaron, y todo vuelve a empezar',
    fr: 'Réexcitez les atomes redescendus, et tout recommence',
    hi: 'नीचे लौट आए परमाणुओं को फिर उत्तेजित करें, और सब फिर से शुरू होता है',
    id: 'Eksitasi lagi atom yang turun kembali, dan semuanya mulai dari awal',
    pt: 'Excite de novo os átomos que desceram, e tudo recomeça',
  },
} satisfies Record<string, LocalizedText>);

export type LaserAndStimulatedEmissionMessageKey = keyof typeof laserAndStimulatedEmissionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: LaserAndStimulatedEmissionMessageKey): LocalizedText =>
  laserAndStimulatedEmissionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LaserAndStimulatedEmissionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const laserAndStimulatedEmissionSchema: BundleSchema = {
  id: LASER_AND_STIMULATED_EMISSION_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에 광자 하나가 빔이 되며 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'heNe',
      label: text('label.stage'),
      constants: {
        wavelengthNm: WAVELENGTH_NM,
        waveScale: WAVE_SCALE,
        packetLength: PACKET_LENGTH,
        packetAmplitude: PACKET_AMPLITUDE,
        mirrorX: MIRROR_X,
        lanes: LANES,
        laneGap: LANE_GAP,
        atomsPerLane: ATOMS_PER_LANE,
        atomMargin: ATOM_MARGIN,
        excitedFraction: EXCITED_FRACTION,
        seed: SEED,
        stimulateChance: STIMULATE_CHANCE,
        outRun: OUT_RUN,
      },
    },
  ],

  environments: [],

  views: [{ id: 'cavity', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 거울 사이 매질과 빠져나가는 빔이 옆으로 놓인다. */
  canvas: { height: 300, minHeight: 280 },

  /** 겹침은 scene 에 쓴 순서 — 매질 띠 위에 원자, 그 위에 물결, 맨 위에 이름표. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 첫 건넘(느리게) → 되돌아옴 → 다시 건넘 → 일부 통과 거울로 나감 → 펌핑.
   * 광자 앞머리의 자리는 세 건넘의 진행도로 정해진다 — 단계 경계를 코드가 갖지 않는다.
   */
  timeline: {
    phases: [
      { id: 'pass1', duration: PASS, timeScale: FIRST_PASS_TIME_SCALE, caption: key('caption.first') },
      { id: 'pass2', duration: PASS, caption: key('caption.bounce') },
      { id: 'pass3', duration: PASS, caption: key('caption.bounce') },
      { id: 'out', duration: OUT, caption: key('caption.out') },
      { id: 'pump', duration: PUMP, ease: 'smooth', caption: key('caption.pump') },
    ],
  },

  /** 도착한 순간 광자가 이미 왼쪽 거울을 떠나 첫 원자들에 다가가고 있다. */
  startAt: 0.35,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: laserAndStimulatedEmissionMessages,
};
