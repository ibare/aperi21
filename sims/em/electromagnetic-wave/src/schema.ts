// ========================================================================
// electromagnetic-wave — 선언
// ========================================================================
// 질문: 장을 만든 전하가 흔들기를 멈추면, 이미 만들어진 장은 어떻게 되는가.
// 답의 동사: **떨어져 나가 스스로 나아간다.**
//
// 왼쪽 가장자리의 작은 안테나(진동 전기 쌍극자)가 흔들렸다 쉬기를 되풀이한다. 전기력선은
// 흐름 함수 Ψ = sin²θ·[p'(τ)/c + p(τ)/r] 의 등고선, 자기장은 평면에 수직인 B_φ 의 ⊙/⊗ 기호다.
// τ = t − r/c 는 지연 시각이다.
//
// 원본: tasks/piece-lab/electromagnetic-wave. 상수는 원본 그대로다. 화면 좌표는 원본 캔버스
// px(860 × 360, y 아래)로 두고, 월드(y 위)로 뒤집는 것은 physics 의 `toWorld` 다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:electromagnetic-wave` 와 문자 그대로 일치한다 (C4). */
export const ELECTROMAGNETIC_WAVE_ID = 'electromagnetic-wave';

/** 무대 — 원본 캔버스(px). */
export const STAGE = { width: 860, height: 360 } as const;

/** 쌍극자 자리(px) — 왼쪽 가장자리 가까이, 세로 가운데. */
export const DIPOLE = { x: 34, y: STAGE.height / 2 } as const;

/**
 * 흔들림 — 한 번의 주기(초) · 전파 속력(px/초, 파장 180 px).
 * 흔드는 시간 · 경사 · 쉬는 시간은 여기 없다 — 시간표 단계다 (`timeline`).
 */
export const WAVE = { period: 1.2, speed: 150 } as const;

/** 전기력선 — 흐름 함수 격자 간격(px) · 특이점을 잘라 내는 반지름(px) · 등고선 값(K 의 배수, 양 · 음). */
export const FIELD_LINES = { grid: 4, rMin: 14, levels: [0.2, 0.5, 0.85] } as const;

/**
 * 자기장 기호 — 격자 간격(px) · 가로 첫 자리 밀림(px) · 잘라 내는 반지름(px) ·
 * 기준 세기의 거리 척도(px) · 크기 상한(배) · 기호 반지름(px, 세기 1 일 때) · 그리지 않는 최소 반지름(px) ·
 * 가운데 점 비율 · 점 최소 반지름(px) · ⊗ 반길이 비율.
 */
export const B_SYMBOLS = {
  step: 30,
  xShift: 4,
  rMin: 40,
  refDistance: 300,
  maxScale: 1.2,
  radius: 5.5,
  minRadius: 1.4,
  dotRatio: 0.25,
  dotMin: 0.8,
  crossRatio: 0.75,
} as const;

/** 흔들리는 전하 — 변위 배율(px) · 점 반지름(px). 안테나 반길이(px). */
export const CHARGE = { swing: 17, radius: 4.5 } as const;
export const ANTENNA = { halfLength: 22 } as const;

/** 굵기(px). 원본 그대로 — 전기력선 · 자기장 기호 · 안테나. */
export const WIDTHS = { fieldLine: 1.3, bSymbol: 1.1, antenna: 2 } as const;

/** 수치 미분 간격(초). 원본 그대로. */
export const DIFF_STEP = 1e-3;

/** 캡션 띠(px). 원본 캡션은 캔버스 밖 문단이었다 — 슬롯이 캔버스 안이라 그림 아래를 비운다. */
export const CAPTION_BAND = 40;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const electromagneticWaveMessages = Object.freeze({
  'label.title': {
    ko: '전자기파',
    en: 'Electromagnetic waves',
    ja: '電磁波',
    zh: '电磁波',
    ar: 'الموجات الكهرومغناطيسية',
    es: 'Ondas electromagnéticas',
    fr: 'Ondes électromagnétiques',
    hi: 'विद्युत चुंबकीय तरंगें',
    id: 'Gelombang elektromagnetik',
    pt: 'Ondas eletromagnéticas',
  },
  'label.operation': {
    ko: '전기장과 자기장의 자기 전파',
    en: 'Self-propagating electric and magnetic fields',
    ja: '自ら伝わっていく電場と磁場',
    zh: '自行传播的电场和磁场',
    ar: 'مجالان كهربائي ومغناطيسي ينتشران ذاتيًا',
    es: 'Campos eléctricos y magnéticos que se propagan solos',
    fr: 'Des champs électrique et magnétique qui se propagent d’eux-mêmes',
    hi: 'स्वयं संचरित होने वाले विद्युत और चुंबकीय क्षेत्र',
    id: 'Medan listrik dan magnet yang merambat sendiri',
    pt: 'Campos elétricos e magnéticos que se propagam sozinhos',
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
  'caption.shaking': {
    ko: '전하가 흔들리는 동안, 그 흔들림이 전기장과 자기장이 되어 바깥으로 퍼진다',
    en: 'While the charge shakes, the shaking spreads outward as electric and magnetic fields',
    ja: '電荷が揺れている間、その揺れが電場と磁場になって外へ広がる',
    zh: '电荷振动时，这种振动化作电场和磁场向外传播',
    ar: 'ما دامت الشحنة تهتز، ينتشر اهتزازها إلى الخارج على هيئة مجالين كهربائي ومغناطيسي',
    es: 'Mientras la carga oscila, esa oscilación se propaga hacia fuera como campos eléctricos y magnéticos',
    fr: 'Tant que la charge oscille, cette oscillation se propage vers l’extérieur sous forme de champs électrique et magnétique',
    hi: 'जब तक आवेश हिलता है, वह कंपन विद्युत और चुंबकीय क्षेत्र बनकर बाहर की ओर फैलता है',
    id: 'Selama muatan berguncang, guncangan itu menyebar keluar sebagai medan listrik dan medan magnet',
    pt: 'Enquanto a carga oscila, a oscilação se espalha para fora como campos elétricos e magnéticos',
  },
  'caption.stopped': {
    ko: '전하는 멈췄다 — 이미 떨어져 나간 장은 전하 없이 스스로 계속 나아간다',
    en: 'The charge has stopped — the fields already cut loose keep travelling on their own, without it',
    ja: '電荷は止まった — すでに離れていった場は、電荷なしで自ら進み続ける',
    zh: '电荷已经停止 — 已经脱离出去的场不需要电荷，仍自行向前传播',
    ar: 'توقفت الشحنة — والمجالات التي انفصلت عنها تواصل الانتقال وحدها، من دونها',
    es: 'La carga se ha detenido — los campos ya desprendidos siguen viajando por sí solos, sin ella',
    fr: 'La charge s’est arrêtée — les champs déjà détachés continuent d’avancer seuls, sans elle',
    hi: 'आवेश रुक गया है — पहले ही अलग हो चुके क्षेत्र उसके बिना अपने-आप आगे बढ़ते रहते हैं',
    id: 'Muatan sudah berhenti — medan yang telah lepas terus merambat sendiri, tanpa muatan itu',
    pt: 'A carga parou — os campos que já se desprenderam continuam viajando sozinhos, sem ela',
  },
} satisfies Record<string, LocalizedText>);

export type ElectromagneticWaveMessageKey = keyof typeof electromagneticWaveMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ElectromagneticWaveMessageKey): LocalizedText => electromagneticWaveMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ElectromagneticWaveMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const electromagneticWaveSchema: BundleSchema = {
  id: ELECTROMAGNETIC_WAVE_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기 없음. 흔드는 시간을 바꾸는 조작은 질문을 흐린다 (원본 NOTES (c)).
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 860 × 360 에 캡션 띠를 더한 비율. 마운트 후 바뀌지 않는다 (원칙 6). */
  canvas: { height: 400, minHeight: 360 },

  /**
   * 한 주기 6 초 — 흔들기 시작(0.3, 코사인 경사) · 흔들기(3.0) · 멈추기(0.3) · 쉬기(2.4).
   * 흔드는 3.6 초는 흔들림 세 주기다.
   *
   * 캡션은 원본의 「포락선 > 0」 과 같은 경계로 갈린다 — 경사 두 단계까지가 흔드는 중이다.
   *
   * 장은 **지연 시각**의 포락선을 본다. 멀리 있는 자리는 지난 주기의 단계를 보아야 해서
   * scene 이 단계 경계(`start` · `end`)를 읽어 과거 시각의 포락선을 계산한다 (NOTES.md G59).
   * 이징은 선언하지 않는다 — 원본 경사는 코사인인데 엔진에 코사인 이징이 없다 (G11).
   */
  timeline: {
    phases: [
      { id: 'rampUp', duration: 0.3, caption: key('caption.shaking') },
      { id: 'shake', duration: 3.0, caption: key('caption.shaking') },
      { id: 'rampDown', duration: 0.3, caption: key('caption.shaking') },
      { id: 'rest', duration: 2.4, caption: key('caption.stopped') },
    ],
  },

  /** 도착했을 때 이미 흔들리는 중이도록 시계를 앞당긴다 (원본 OFFSET). */
  startAt: 1.2,

  /**
   * 그리는 순서가 곧 겹침이다 — 자기장 기호 → 전기력선 → 안테나 → 전하 (원본 그대로).
   */
  drawOrder: 'scene',

  // 슬롯 하나. 흔드는 중 / 멈춘 뒤 두 문장.
  caption: {
    anchor: { screen: 'bottom-left', offset: [12, -8] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 주장은 고리가 떨어져 나가는 모양에 있고 잴 것이 없다.

  messages: electromagneticWaveMessages,
};
