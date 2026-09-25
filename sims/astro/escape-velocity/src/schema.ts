// ========================================================================
// escape-velocity — 선언
// ========================================================================
// 질문: 더 세게 쏘면 더 높이 갈 뿐인가, 아니면 어느 속도부터 아예 돌아오지 않는가.
//
// 행성 표면에서 곧장 위로(행성 바깥쪽으로) 쏘아 올린다. 처음 속도를 7 · 8 · 9 · 10 km/s 로
// 같은 만큼씩 올리면 물체는 더 높이 올라갔다 돌아오는데, 오르는 높이는 점점 크게 벌어진다.
// 11.2 km/s 를 넘는 순간부터는 속도가 줄기는 해도 0 에 닿지 않아 다시는 돌아오지 않는다.
//
// 아래 레인은 「중력이 줄지 않는다면」 — 같은 속도로 쏘아도 높이가 v² 에 비례할 뿐이라
// 문턱이 없다. 문턱은 멀어질수록 중력이 약해지기 때문에 생긴다.
//
// 궤도 모양 비교(`orbital-velocity`) · 에너지 우물 그림(`gravitational-potential-energy-general`)은
// 이 조각의 몫이 아니다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:escape-velocity` 와 문자 그대로 일치한다 (C4). */
export const ESCAPE_VELOCITY_ID = 'escape-velocity';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 행성의 GM(km³/s²). 지구 값. */
export const GM_KM3_S2 = 398600;
/** 행성 반지름(km). 지구 값. 이 둘에서 탈출 속도 √(2GM/R) ≈ 11.19 km/s 가 나온다. */
export const PLANET_RADIUS_KM = 6371;
/**
 * 다섯 번 쏘는 처음 속도(km/s). 앞의 넷은 1 km/s 씩 같은 만큼 올리고, 마지막은 탈출 속도를
 * 막 넘는다. 화면의 속도 글자는 이 값을 그대로 쓴다 (S-piece 유효숫자).
 * 목록을 선언할 자리가 없어 이름 다섯으로 흩는다 (장부 G105).
 */
export const SPEED_1 = 7;
export const SPEED_2 = 8;
export const SPEED_3 = 9;
export const SPEED_4 = 10;
export const SPEED_5 = 11.2;

// ------------------------------------------------------------------------
// 표현 — 스테이지 상수의 기본값이다.
// ------------------------------------------------------------------------

/** 월드 길이 per 행성 반지름. 행성 원판의 반지름이 곧 이 값이다. */
export const WORLD_PER_RADIUS = 1.4;
/** 속도 화살표 길이 배율(월드 per km/s). 11.2 km/s 가 약 1 월드. */
export const ARROW_PER_KMS = 0.085;
/**
 * 돌아오는 샷에서 비행이 차지하는 몫(0~1). 나머지는 표면에 내려앉아 쉬는 동안이다.
 * 샷마다 비행 시간이 열 배 가까이 달라 화면 시간은 샷마다 따로 줄인다 — NOTES (b).
 */
export const FLIGHT_SHARE = 0.9;
/** 돌아오지 않는 샷에서 물체가 화면 오른쪽 끝을 벗어나는 순간(단계 진행도 0~1). */
export const EXIT_AT = 0.55;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 두 레인이 떠나는 행성 표면의 가장 오른쪽이 x = 0 이다.
// ------------------------------------------------------------------------

/** 실제 중력 레인의 높이(월드 y). */
export const LANE_REAL_Y = 0.3;
/** 「중력이 줄지 않는다면」 레인의 높이(월드 y). */
export const LANE_UNIFORM_Y = -0.75;

/** 캡션이 서는 자리(월드). 두 레인 위쪽 빈자리다. */
export const CAPTION_AT: readonly [number, number] = [1.5, 1.12];

/**
 * 프레이밍은 주장의 일부다. 가로는 행성 원판(왼쪽)부터 네 번째 샷의 꼭대기(약 5.6) 너머까지,
 * 세로는 행성 원판과 캡션을 담는다. 매 프레임 같은 값이다 — 돌아오지 않는 물체는 오른쪽
 * 끝을 벗어나 사라진다.
 */
export const SCENE_BOUNDS = { minX: -1.55, maxX: 7.2, minY: -1.45, maxY: 1.5 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const escapeVelocityMessages = Object.freeze({
  'label.title': {
    ko: '탈출 속도',
    en: 'Escape velocity',
    ja: '脱出速度',
    zh: '逃逸速度',
    ar: 'سرعة الإفلات',
    es: 'Velocidad de escape',
    fr: 'Vitesse de libération',
    hi: 'पलायन वेग',
    id: 'Kecepatan lepas',
    pt: 'Velocidade de escape',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '중력을 벗어나는 최소 속도',
    en: 'The least speed that breaks free of gravity',
    ja: '重力を振り切る最小の速さ',
    zh: '挣脱引力的最小速率',
    ar: 'أقل سرعة تتحرر من الجاذبية',
    es: 'La rapidez mínima para escapar de la gravedad',
    fr: 'La vitesse minimale pour échapper à la gravité',
    hi: 'गुरुत्व से मुक्त होने की न्यूनतम चाल',
    id: 'Kelajuan terkecil untuk lepas dari gravitasi',
    pt: 'A menor velocidade que escapa da gravidade',
  },
  'label.stage': {
    ko: '지구',
    en: 'Earth',
    ja: '地球',
    zh: '地球',
    ar: 'الأرض',
    es: 'Tierra',
    fr: 'Terre',
    hi: 'पृथ्वी',
    id: 'Bumi',
    pt: 'Terra',
  },
  'label.view': {
    ko: '곧장 위로',
    en: 'Straight up',
    ja: '真上へ',
    zh: '竖直向上',
    ar: 'إلى الأعلى مباشرة',
    es: 'Hacia arriba en línea recta',
    fr: 'Droit vers le haut',
    hi: 'सीधे ऊपर',
    id: 'Lurus ke atas',
    pt: 'Direto para cima',
  },
  /** 화살표 이름. 조사 없는 도식 낱말이지만 기호가 아니라 말이라 번역한다. */
  'label.velocity': {
    ko: '속도',
    en: 'velocity',
    ja: '速度',
    zh: '速度',
    ar: 'السرعة',
    es: 'velocidad',
    fr: 'vitesse',
    hi: 'वेग',
    id: 'kecepatan',
    pt: 'velocidade',
  },
  'label.uniform': {
    ko: '중력이 줄지 않는다면',
    en: 'if gravity did not weaken',
    ja: '重力が弱まらなければ',
    zh: '如果引力不减弱',
    ar: 'لو لم تضعف الجاذبية',
    es: 'si la gravedad no se debilitara',
    fr: 'si la gravité ne faiblissait pas',
    hi: 'यदि गुरुत्व कमज़ोर न होता',
    id: 'jika gravitasi tidak melemah',
    pt: 'se a gravidade não enfraquecesse',
  },
  /** 쏜 속도. 단위는 표식이라 두 언어가 같다 — 값은 스테이지 상수 그대로 끼운다. */
  'label.speed': {
    ko: '{v} km/s',
    en: '{v} km/s',
    ja: '{v} km/s',
    zh: '{v} km/s',
    ar: '{v} km/s',
    es: '{v} km/s',
    fr: '{v} km/s',
    hi: '{v} km/s',
    id: '{v} km/s',
    pt: '{v} km/s',
  },
  'caption.first': {
    ko: '곧장 위로 쏘아 올린 물체는 올라가며 느려지다 멈추고, 다시 떨어진다',
    en: 'Fired straight up, it slows as it climbs, stops, and falls back',
    ja: '真上に打ち上げると、上りながら遅くなり、止まって、また落ちてくる',
    zh: '竖直向上发射后，它边上升边减速，停下，再落回来',
    ar: 'يُطلَق إلى الأعلى مباشرة، فيتباطأ وهو يصعد، ثم يتوقف، ثم يسقط عائدًا',
    es: 'Lanzado hacia arriba, se frena al subir, se detiene y vuelve a caer',
    fr: 'Lancé droit vers le haut, il ralentit en montant, s’arrête et retombe',
    hi: 'सीधे ऊपर दागे जाने पर यह चढ़ते हुए धीमा होता है, रुकता है और वापस गिरता है',
    id: 'Ditembakkan lurus ke atas, ia melambat saat naik, berhenti, lalu jatuh kembali',
    pt: 'Lançado direto para cima, ele desacelera ao subir, para e cai de volta',
  },
  'caption.more': {
    ko: '처음 속도를 조금씩 올리면 더 높이 올라갔다가 돌아온다',
    en: 'Raise the launch speed a little, and it climbs higher before coming back',
    ja: '打ち出す速さを少し上げると、より高く上ってから戻ってくる',
    zh: '把发射速度稍微提高，它就升得更高再回来',
    ar: 'ارفع سرعة الإطلاق قليلًا فيصعد أعلى قبل أن يعود',
    es: 'Sube un poco la rapidez de lanzamiento y llega más alto antes de volver',
    fr: 'Augmentez un peu la vitesse de lancement : il monte plus haut avant de revenir',
    hi: 'प्रक्षेपण चाल थोड़ी बढ़ाएँ तो यह लौटने से पहले और ऊँचा चढ़ता है',
    id: 'Naikkan sedikit kelajuan peluncuran, dan ia naik lebih tinggi sebelum kembali',
    pt: 'Aumente um pouco a velocidade de lançamento e ele sobe mais antes de voltar',
  },
  'caption.spread': {
    ko: '같은 만큼 올린 속도인데, 오르는 높이는 점점 크게 벌어진다',
    en: 'The speed went up by the same step, yet each climb reaches much farther than the last',
    ja: '速さは同じだけ上げたのに、上る高さは前よりずっと大きく伸びていく',
    zh: '速率每次提高的量相同，上升的高度却一次比一次拉开得多',
    ar: 'ارتفعت السرعة بالخطوة نفسها، لكن كل صعود يبلغ أبعد بكثير من سابقه',
    es: 'La rapidez subió en el mismo paso, pero cada ascenso llega mucho más lejos que el anterior',
    fr: 'La vitesse a augmenté du même pas, mais chaque montée va bien plus loin que la précédente',
    hi: 'चाल हर बार उतनी ही बढ़ी, फिर भी हर चढ़ाई पिछली से कहीं अधिक दूर पहुँचती है',
    id: 'Kelajuan naik dengan langkah yang sama, tetapi setiap pendakian mencapai jauh lebih tinggi dari sebelumnya',
    pt: 'A velocidade subiu no mesmo passo, mas cada subida vai muito mais longe que a anterior',
  },
  'caption.escape': {
    ko: '이 속도를 넘자 속도는 줄어들기만 할 뿐 0 에 닿지 않는다 — 다시는 돌아오지 않는다',
    en: 'Past this speed it keeps slowing but never reaches zero — it never comes back',
    ja: 'この速さを超えると、遅くなり続けてもゼロには届かない — もう二度と戻らない',
    zh: '超过这个速率后，它一直在减速却永远减不到零 — 再也不会回来',
    ar: 'بعد تجاوز هذه السرعة يواصل التباطؤ لكنه لا يبلغ الصفر أبدًا — ولا يعود أبدًا',
    es: 'Pasada esta rapidez sigue frenándose pero nunca llega a cero — ya no vuelve',
    fr: 'Au-delà de cette vitesse, il ralentit sans cesse mais n’atteint jamais zéro — il ne revient plus',
    hi: 'इस चाल के पार यह धीमा होता रहता है पर कभी शून्य तक नहीं पहुँचता — यह कभी लौटकर नहीं आता',
    id: 'Melewati kelajuan ini ia terus melambat tetapi tak pernah mencapai nol — ia tak pernah kembali',
    pt: 'Acima dessa velocidade ele continua desacelerando, mas nunca chega a zero — nunca mais volta',
  },
  'caption.contrast': {
    ko: '중력이 줄지 않는다면 같은 속도로도 조금 더 오를 뿐 돌아온다 — 문턱이 없다',
    en: 'If gravity did not weaken, the same speed would only climb a bit higher and fall back — no threshold',
    ja: '重力が弱まらなければ、同じ速さでも少し高く上るだけで戻ってくる — しきい値はない',
    zh: '如果引力不减弱，同样的速率只会升得稍高一点再落回来 — 没有门槛',
    ar: 'لو لم تضعف الجاذبية، لصعد الجسم بالسرعة نفسها أعلى قليلًا فقط ثم عاد — لا عتبة',
    es: 'Si la gravedad no se debilitara, la misma rapidez solo subiría un poco más y volvería a caer — no hay umbral',
    fr: 'Si la gravité ne faiblissait pas, la même vitesse ne ferait que monter un peu plus haut avant de retomber — aucun seuil',
    hi: 'यदि गुरुत्व कमज़ोर न होता, तो उसी चाल से यह बस थोड़ा और ऊँचा चढ़कर वापस गिरता — कोई देहली नहीं',
    id: 'Jika gravitasi tidak melemah, kelajuan yang sama hanya naik sedikit lebih tinggi lalu jatuh kembali — tanpa ambang',
    pt: 'Se a gravidade não enfraquecesse, a mesma velocidade só subiria um pouco mais e cairia de volta — sem limiar',
  },
} satisfies Record<string, LocalizedText>);

export type EscapeVelocityMessageKey = keyof typeof escapeVelocityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EscapeVelocityMessageKey): LocalizedText => escapeVelocityMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EscapeVelocityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const escapeVelocitySchema: BundleSchema = {
  id: ESCAPE_VELOCITY_ID,
  label: text('label.title'),
  category: 'astro',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 속도를 조금씩 올려 보는 일은 다섯 샷의 자동 진행이 한다 — 슬라이더를 두면
  // 독자가 탈출 속도 근처를 정확히 짚기 어렵고, 넘는 순간의 대비가 흐려진다.
  parameters: [],

  stages: [
    {
      id: 'earth',
      label: text('label.stage'),
      constants: {
        gm: GM_KM3_S2,
        planetRadius: PLANET_RADIUS_KM,
        speed1: SPEED_1,
        speed2: SPEED_2,
        speed3: SPEED_3,
        speed4: SPEED_4,
        speed5: SPEED_5,
        worldPerRadius: WORLD_PER_RADIUS,
        arrowPerKms: ARROW_PER_KMS,
        flightShare: FLIGHT_SHARE,
        exitAt: EXIT_AT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'straight-up', label: text('label.view'), default: true }],

  /** 가로로 쏜다 — 세로가 비싸다 (S-piece). 행성은 왼쪽, 캡션은 레인 위. */
  canvas: { height: 320, minHeight: 300 },

  /** 레인 선 · 자취 · 표지 · 물체 · 화살표의 겹침 순서가 뜻을 갖는다. */
  drawOrder: 'scene',

  /**
   * 샷 다섯. 샷 i 는 스테이지 상수 `speed{i}` 로 쏜다. 단계 길이는 **화면 시간**이다 —
   * 샷마다 비행 시간(물리)이 다르므로 그 샷의 비행을 단계 길이에 맞춰 줄인다(`physics.ts`).
   * 한 샷 안에서는 두 레인이 같은 물리 시계를 쓴다.
   *
   * - `shot1`~`shot4` — 돌아오는 샷. 비행이 단계의 `flightShare` 를 차지하고 나머지는 쉰다.
   * - `shot5` — 돌아오지 않는 샷. 단계 진행도 `exitAt` 에서 화면 오른쪽 끝을 벗어난다.
   * - `hold` — 떠난 물체는 없고, 아래 레인은 돌아와 있다.
   * - `fade` — 표지가 흐려지고 다음 주기로 넘어간다.
   */
  timeline: {
    phases: [
      { id: 'shot1', duration: 2.6, caption: key('caption.first') },
      { id: 'shot2', duration: 2.6, caption: key('caption.more') },
      { id: 'shot3', duration: 2.8, caption: key('caption.more') },
      { id: 'shot4', duration: 3.6, caption: key('caption.spread') },
      { id: 'shot5', duration: 4.6, caption: key('caption.escape') },
      { id: 'hold', duration: 3.2, caption: key('caption.contrast') },
      { id: 'fade', duration: 0.6, caption: key('caption.contrast') },
    ],
  },

  /** 도착한 순간 첫 샷이 이미 오르고 있다. */
  startAt: 0.5,

  // 슬롯 하나. 레인 위 빈자리에 세운다 — 그림에 딸린 자리라 월드 앵커다.
  caption: {
    anchor: { world: CAPTION_AT },
    align: 'left',
    fontSize: 14,
    wrapWidth: 440,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 높이지만 절대 거리가 아니라 **샷 사이 간격이
   * 벌어지는 모양**이다 — 격자를 깔면 「몇 칸」 을 세는 다른 읽기가 끼어든다.
   */

  messages: escapeVelocityMessages,
};
