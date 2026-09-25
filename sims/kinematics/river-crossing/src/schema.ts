// ========================================================================
// river-crossing — 선언
// ========================================================================
// 질문: 뱃머리를 맞은편 정면에 두고 똑바로 갔는데, 왜 맞은편에 닿지 않는가.
//
// 답의 동사는 **떠밀린다.** 배는 뱃머리가 향한 대로 가면서, 동시에 물살에
// 하류로 떠밀린다.
//
// 값은 전부 원본(tasks/piece-lab/river-crossing/index.html)에서 그대로 가져왔다.
// 강폭 60 m · 배 3 m/s · 물살 1.5 m/s → 20 초에 30.0 m 하류.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:river-crossing` 와 문자 그대로 일치한다 (C4). */
export const RIVER_CROSSING_ID = 'river-crossing';

// ------------------------------------------------------------------------
// 물리 값 (실제 단위)
// ------------------------------------------------------------------------

/** 강폭(m). */
export const RIVER_WIDTH = 60;
/** 물에 대한 배의 빠르기(m/s). */
export const BOAT_SPEED = 3;
/** 물살(m/s). 하류 = +x. */
export const FLOW_SPEED = 1.5;
/** 화면 1초 = 물리 4초. 화면에 시간 값을 보이지 않으므로 드러내지 않는다. */
export const PLAYBACK = 4;
/** 뱃머리 방향 범위(°). − 상류 쪽, + 하류 쪽. */
export const HEADING_RANGE: readonly [number, number] = [-45, 45];
/** 뱃머리 방향 간격(°). */
export const HEADING_STEP = 5;
/** 「맞은편에 닿았다」로 볼 벗어난 거리(m). 원본 그대로. */
export const ON_TARGET_EPS = 0.05;

// ------------------------------------------------------------------------
// 화면 배치
// ------------------------------------------------------------------------
//
// 원본은 CSS 픽셀로 짰다(세로 280 px, 강둑 띠 30 px, 강 220 px = 60 m). 엔진은
// 월드 단위(m)로 선언하고 배율은 카메라가 정하므로 원본 픽셀을 PX 로 나눠 옮긴다.
// 월드 원점은 출발 지점(출발 쪽 물가, 원본 x = 0.24 W, y = 250 px), y 는 위.

/** 원본의 1 m = 220/60 px. **배율이 아니라 환산표다.** */
export const PX = 220 / 60;
/** 원본 강둑 띠 높이(px). */
const BANK_PX = 30;
/** 원본 가로 기준(px) — 원본 `.piece` 의 max-width. */
export const VIEW_W_PX = 900;
/** 원본 출발점 가로 비율. 하류 쪽 45° 에서도 도착점이 화면 안에 든다. */
const START_FRAC = 0.24;

/** 원본 화면 x(px, W = 900 기준)를 월드 x(m)로. */
export function worldXFromPx(px: number): number {
  return (px - START_FRAC * VIEW_W_PX) / PX;
}
/** 원본 화면 y(px)를 월드 y(m)로. 출발 쪽 물가(250 px)가 0. */
export function worldYFromPx(px: number): number {
  return (280 - BANK_PX - px) / PX;
}

/** 캔버스 왼끝 · 오른끝(월드 m). */
export const VIEW_LEFT = worldXFromPx(0);
export const VIEW_RIGHT = worldXFromPx(VIEW_W_PX);
/** 원본 캔버스 위끝(건너편 강둑 띠의 위) · 아래끝(출발 쪽 강둑 띠의 아래). */
export const VIEW_TOP = worldYFromPx(0);
export const VIEW_BOTTOM = worldYFromPx(280);
/**
 * 원본 캔버스 아래의 캡션 줄과 조작기 줄(px). 원본은 DOM 이라 캔버스 밖에 있었고,
 * 엔진은 캔버스 안에 둔다 — 그만큼 그림 아래를 비운다.
 */
const BELOW_PX = 80;

/** 프레이밍. 고정값이라야 카메라가 흔들리지 않는다 (S-piece). */
export const SCENE_BOUNDS = {
  minX: VIEW_LEFT,
  maxX: VIEW_RIGHT,
  minY: VIEW_BOTTOM - BELOW_PX / PX,
  maxY: VIEW_TOP,
} as const;

/** 띠를 화면 밖으로 더 내보낼 거리(m). 카메라 여백까지 강둑·물이 차 있어야 한다. */
export const BLEED = 60;

/** 원본 px 를 월드 길이로. 배치 숫자를 원본 그대로 적기 위한 것이다. */
export function m(px: number): number {
  return px / PX;
}

/**
 * 배 외형. 원본 `drawBoat` 의 경로를 PX 로 나누고 y 부호를 뒤집었다.
 * 기준점은 **뱃머리 끝** — 도착하면 뱃머리가 둑에 닿는다.
 */
export const BOAT_PATH = [
  'M 0 0',
  `Q ${m(7)} ${-m(10)} ${m(6)} ${-m(26)}`,
  `L ${-m(6)} ${-m(26)}`,
  `Q ${-m(7)} ${-m(10)} 0 0`,
  'Z',
].join(' ');

/** 떠밀린 거리 선분이 뱃머리 끝에서 내려오는 거리(px) — 선체 중간 높이. */
export const PUSH_LINE_DROP_PX = 13;

/** 물살 줄무늬 개수와 시드. 원본 하네스(mulberry32, 시드 1)와 같은 순서로 뽑는다. */
export const STREAK_COUNT = 46;
export const STREAK_SEED = 1;
/** 줄무늬가 되감기는 가로 폭 여분(px) — 원본 `span = W + 60`, 왼쪽으로 30 px 넘어 나온다. */
export const STREAK_WRAP_PX = 60;
export const STREAK_OVERHANG_PX = 30;

// ------------------------------------------------------------------------
// 진행
// ------------------------------------------------------------------------
//
// 이 조각은 연출 시간표가 아니라 **누적 상태**로 움직인다. 건너는 시간이 뱃머리
// 각도에서 물리로 나오고(기울이면 늘어난다), 뱃머리를 바꾸면 처음부터 다시 건넌다 —
// 둘 다 선언된 단계 길이로는 말할 수 없다.

/** 도착 뒤 머무는 화면 시간(초). 원본 `HOLD`. */
export const HOLD = 2;

/**
 * 도착한 순간 이미 건너는 중이다 — 원본 `START_TAU = 1.5`. 상태를 누적하는
 * 조각이라 시계를 앞당기는 `startAt` 이 아니라 `step` 을 실제로 굴리는 `preroll` 로 준다.
 */
export const START_TAU = 1.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const riverCrossingMessages = Object.freeze({
  'label.title': {
    ko: '강 건너기',
    en: 'Crossing a river',
    ja: '川を渡る',
    zh: '过河',
    ar: 'عبور النهر',
    es: 'Cruzar un río',
    fr: 'Traverser une rivière',
    hi: 'नदी पार करना',
    id: 'Menyeberangi sungai',
    pt: 'Atravessar um rio',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '두 속도의 합성이 만드는 경로',
    en: 'The path made by combining two velocities',
    ja: '二つの速度の合成が生む経路',
    zh: '两个速度合成所形成的路径',
    ar: 'المسار الناتج عن تركيب سرعتين متجهتين',
    es: 'La trayectoria que resulta de combinar dos velocidades',
    fr: 'Le trajet qui naît de la composition de deux vitesses',
    hi: 'दो वेगों के संयोजन से बनने वाला पथ',
    id: 'Lintasan yang terbentuk dari perpaduan dua kecepatan',
    pt: 'O trajeto formado pela composição de duas velocidades',
  },
  'label.stage': {
    ko: '강',
    en: 'River',
    ja: '川',
    zh: '河',
    ar: 'النهر',
    es: 'Río',
    fr: 'Rivière',
    hi: 'नदी',
    id: 'Sungai',
    pt: 'Rio',
  },
  'label.view': {
    ko: '강 건너기',
    en: 'Crossing',
    ja: '渡河',
    zh: '过河',
    ar: 'العبور',
    es: 'Cruce',
    fr: 'Traversée',
    hi: 'पार करना',
    id: 'Penyeberangan',
    pt: 'Travessia',
  },
  /** 건너편 강둑의 기준점. 주장이 "맞은편에 닿지 않는다" 라 이름이 있어야 한다. */
  'label.opposite': {
    ko: '맞은편',
    en: 'Opposite',
    ja: '真向かい',
    zh: '正对面',
    ar: 'النقطة المقابلة',
    es: 'Enfrente',
    fr: 'En face',
    hi: 'ठीक सामने',
    id: 'Titik seberang',
    pt: 'Em frente',
  },
  /**
   * 슬라이더 이름표. 원본은 값 쪽에 "상류 쪽 30°" 처럼 부호로 낱말을 골랐다 —
   * 선언에 로직을 넣게 되므로 이름표 문안으로 방향을 알린다.
   */
  'label.heading': {
    ko: '뱃머리 방향 (− 상류 · + 하류)',
    en: 'Heading (− upstream · + downstream)',
    ja: '船首の向き (− 上流 · + 下流)',
    zh: '船头方向 (− 上游 · + 下游)',
    ar: 'اتجاه المقدمة (− أعلى النهر · + أسفل النهر)',
    es: 'Rumbo (− aguas arriba · + aguas abajo)',
    fr: 'Cap (− amont · + aval)',
    hi: 'नाव की दिशा (− धारा के विपरीत · + धारा की दिशा में)',
    id: 'Arah haluan (− hulu · + hilir)',
    pt: 'Rumo (− rio acima · + rio abaixo)',
  },

  'caption.crossing': {
    ko: '뱃머리는 맞은편을 향하지만, 배는 물살에 떠밀려 비스듬히 건넌다.',
    en: 'The bow points straight across, but the current pushes the boat along a slant.',
    ja: '船首は真向かいを向いているが、ボートは流れに押されて斜めに渡る。',
    zh: '船头正对着对岸，但水流推着船斜着渡过去。',
    ar: 'تتجه المقدمة مباشرةً نحو الضفة المقابلة، لكن التيار يدفع القارب في مسار مائل.',
    es: 'La proa apunta recto a la otra orilla, pero la corriente empuja el bote en diagonal.',
    fr: 'La proue pointe droit vers l’autre rive, mais le courant pousse le bateau en biais.',
    hi: 'नाव का अगला सिरा सीधे उस पार है, पर धारा नाव को तिरछे रास्ते पर धकेलती है।',
    id: 'Haluan mengarah lurus ke seberang, tetapi arus mendorong perahu menyerong.',
    pt: 'A proa aponta direto para a outra margem, mas a correnteza empurra o barco na diagonal.',
  },
  'caption.crossingTilted': {
    ko: '뱃머리가 향한 곳과 배가 가는 곳이 다르다 — 물살이 배를 떠민다.',
    en: 'Where the bow points is not where the boat goes — the current pushes it.',
    ja: '船首の向きとボートの進む先は違う — 流れがボートを押している。',
    zh: '船头指向的地方不是船去的地方 — 水流在推着它。',
    ar: 'المكان الذي تشير إليه المقدمة ليس المكان الذي يذهب إليه القارب — التيار يدفعه.',
    es: 'Hacia donde apunta la proa no es hacia donde va el bote — la corriente lo empuja.',
    fr: 'Là où pointe la proue n’est pas là où va le bateau — le courant le pousse.',
    hi: 'अगला सिरा जिधर है, नाव उधर नहीं जाती — धारा उसे धकेलती है।',
    id: 'Arah haluan bukan arah perahu melaju — arus mendorongnya.',
    pt: 'Para onde a proa aponta não é para onde o barco vai — a correnteza o empurra.',
  },
  'caption.arrivedDownstream': {
    ko: '맞은편보다 {drift} m 하류에 닿았다.',
    en: 'Landed {drift} m downstream of the opposite point.',
    ja: '真向かいより {drift} m 下流に着いた。',
    zh: '在正对面下游 {drift} m 处靠岸。',
    ar: 'رسا على بعد {drift} m أسفل النهر من النقطة المقابلة.',
    es: 'Llegó {drift} m aguas abajo del punto de enfrente.',
    fr: 'Accosté {drift} m en aval du point en face.',
    hi: 'ठीक सामने वाले बिंदु से {drift} m धारा की दिशा में किनारे लगी।',
    id: 'Mendarat {drift} m ke arah hilir dari titik seberang.',
    pt: 'Chegou {drift} m rio abaixo do ponto em frente.',
  },
  'caption.arrivedUpstream': {
    ko: '맞은편보다 {drift} m 상류에 닿았다.',
    en: 'Landed {drift} m upstream of the opposite point.',
    ja: '真向かいより {drift} m 上流に着いた。',
    zh: '在正对面上游 {drift} m 处靠岸。',
    ar: 'رسا على بعد {drift} m أعلى النهر من النقطة المقابلة.',
    es: 'Llegó {drift} m aguas arriba del punto de enfrente.',
    fr: 'Accosté {drift} m en amont du point en face.',
    hi: 'ठीक सामने वाले बिंदु से {drift} m धारा के विपरीत किनारे लगी।',
    id: 'Mendarat {drift} m ke arah hulu dari titik seberang.',
    pt: 'Chegou {drift} m rio acima do ponto em frente.',
  },
  'caption.arrivedOpposite': {
    ko: '맞은편에 닿았다.',
    en: 'Landed at the opposite point.',
    ja: '真向かいに着いた。',
    zh: '在正对面靠岸。',
    ar: 'رسا عند النقطة المقابلة.',
    es: 'Llegó al punto de enfrente.',
    fr: 'Accosté au point en face.',
    hi: 'ठीक सामने किनारे लगी।',
    id: 'Mendarat tepat di titik seberang.',
    pt: 'Chegou ao ponto em frente.',
  },
} satisfies Record<string, LocalizedText>);

export type RiverCrossingMessageKey = keyof typeof riverCrossingMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RiverCrossingMessageKey): LocalizedText => riverCrossingMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RiverCrossingMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const riverCrossingSchema: BundleSchema = {
  id: RIVER_CROSSING_ID,
  label: text('label.title'),
  category: 'kinematics',
  description: text('label.description'),
  timeModel: 'periodic',

  parameters: [],

  stages: [
    {
      id: 'river',
      label: text('label.stage'),
      constants: { riverWidth: RIVER_WIDTH, boatSpeed: BOAT_SPEED, flowSpeed: FLOW_SPEED },
    },
  ],

  environments: [],

  views: [{ id: 'crossing', label: text('label.view'), default: true }],

  /** 원본 캔버스 280 px + 캡션 줄 + 조작기 줄. */
  canvas: { height: 400, minHeight: 380 },

  /**
   * 겹침이 원본 순서여야 한다 — 강둑 · 물 · 줄무늬 · 눈금 · 점선 · 흐린 배 ·
   * 떠밀린 거리 · 자취 · 배. 어휘별 층이면 물(region)이 배 위에 덮인다.
   */
  drawOrder: 'scene',

  preroll: START_TAU,

  /**
   * 슬롯 하나. 건너는 중(정면)의 문장이 기본이고, 도착했는지 · 기울였는지는
   * 상태로 고른다(`cases` — 위에서부터 참인 첫 항목). 조건을 세는 것은 physics 다.
   * 벗어난 거리는 자릿수를 정한 문자열로 state 에 두고, 단위·낱말은 문안 틀에 둔다.
   */
  caption: {
    anchor: { world: [VIEW_LEFT, VIEW_BOTTOM], offset: [-8, 21] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [
      { when: 'arrivedOpposite', text: key('caption.arrivedOpposite') },
      { when: 'arrivedUpstream', text: key('caption.arrivedUpstream') },
      { when: 'arrivedDownstream', text: key('caption.arrivedDownstream') },
      { when: 'crossingTilted', text: key('caption.crossingTilted') },
    ],
    text: key('caption.crossing'),
    vars: { drift: 'driftText' },
  },

  /**
   * 그리드·카메라 버튼 없음. 거리를 읽을 필요가 없고, 반복 진행이라 재생 조작이
   * 필요 없다 (원본 NOTES (c)).
   */

  messages: riverCrossingMessages,
};
