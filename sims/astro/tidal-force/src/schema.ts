// ========================================================================
// tidal-force — 선언
// ========================================================================
// 질문: 달 쪽 바다가 부푸는 건 알겠다. 그런데 **왜 반대쪽도** 부푸나?
// 동사: 양쪽으로 늘어난다.
//
// 서로 끌지 않는 먼지 170개로 된 둥근 구름이 천체로 떨어진다. 입자마다 천체의
// 1/r² 중력만으로 실제 적분하므로 늘어남은 그려 넣은 것이 아니라 적분 결과다.
// 왼쪽은 정지틀, 오른쪽은 구름 중심과 함께 떨어지는 눈이다 — 같은 상태를 좌표만
// 바꿔 그린다.
//
// 원본: tasks/piece-lab/tidal-force/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:tidal-force` 와 문자 그대로 일치한다 (C4). */
export const TIDAL_FORCE_ID = 'tidal-force';

// ------------------------------------------------------------------------
// 화면 배치 — 월드 1 단위 = 원본 캔버스 1 px, y 는 위 (원본 화면 y 의 부호를 뒤집는다)
// ------------------------------------------------------------------------

/** 원본 캔버스 크기(860 × 300 px). 프레이밍은 이것을 그대로 옮긴 고정 경계다. */
export const CANVAS_W = 860;
export const CANVAS_H = 300;

/** 왼쪽 판(정지틀). 천체는 원본 화면 (490, 150) 에 있고 물리 1 단위가 0.95 px 다. */
export const LEFT = { x0: 0, x1: 540, bodyX: 490, cy: 150, scale: 0.95, bodyR: 30 } as const;

/**
 * 오른쪽 판(함께 떨어지는 눈). 물리 1 단위가 1.4 px 다.
 * 천체 쪽(오른쪽) 끝이 더 많이 늘어나므로 중심을 왼쪽으로 치우친다 — `cx` 는 판 왼쪽 끝에서 132.
 */
export const RIGHT = { x0: 552, x1: 860, y0: 14, y1: 286, zoom: 1.4, cx: 552 + 132, cy: 150 } as const;

/** 흐름 무늬 격자 간격(원본 px). */
export const STREAK_STEP = 24;

export const SCENE_BOUNDS = { minX: 0, maxX: CANVAS_W, minY: -CANVAS_H, maxY: 0 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const tidalForceMessages = Object.freeze({
  'label.title': {
    ko: '조석력',
    en: 'Tidal force',
    ja: '潮汐力',
    zh: '潮汐力',
    ar: 'قوة المد',
    es: 'Fuerza de marea',
    fr: 'Force de marée',
    hi: 'ज्वारीय बल',
    id: 'Gaya pasang surut',
    pt: 'Força de maré',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '중력의 차이가 만드는 늘어남',
    en: 'Stretching made by a difference in gravity',
    ja: '重力の差が生む引き伸ばし',
    zh: '引力之差造成的拉伸',
    ar: 'تمدّد يصنعه فرق في الجاذبية',
    es: 'Estiramiento causado por una diferencia de gravedad',
    fr: 'Un étirement créé par une différence de gravité',
    hi: 'गुरुत्व के अंतर से होने वाला खिंचाव',
    id: 'Peregangan akibat perbedaan gravitasi',
    pt: 'Estiramento causado por uma diferença de gravidade',
  },
  'label.stage': {
    ko: '천체 곁',
    en: 'Near a massive body',
    ja: '重い天体のそば',
    zh: '大质量天体附近',
    ar: 'قرب جرم ضخم',
    es: 'Cerca de un cuerpo masivo',
    fr: 'Près d’un corps massif',
    hi: 'एक भारी पिंड के पास',
    id: 'Dekat benda bermassa besar',
    pt: 'Perto de um corpo massivo',
  },
  'label.view': {
    ko: '두 기준틀',
    en: 'Two frames',
    ja: '二つの座標系',
    zh: '两个参考系',
    ar: 'إطاران مرجعيان',
    es: 'Dos sistemas de referencia',
    fr: 'Deux référentiels',
    hi: 'दो निर्देश तंत्र',
    id: 'Dua kerangka acuan',
    pt: 'Dois referenciais',
  },
  /** 확대 화면의 이름 — 기준틀이 바뀌었다는 사실은 그림만으로 알 수 없어 둔다 (원본 NOTES). */
  'label.comoving': {
    ko: '구름과 함께 떨어지며 본 모습',
    en: 'As seen falling with the cloud',
    ja: '雲といっしょに落ちながら見た姿',
    zh: '随云一起下落时看到的样子',
    ar: 'كما يُرى أثناء السقوط مع السحابة',
    es: 'Visto cayendo junto con la nube',
    fr: 'Vu en tombant avec le nuage',
    hi: 'बादल के साथ गिरते हुए देखा गया दृश्य',
    id: 'Dilihat sambil jatuh bersama awan',
    pt: 'Visto caindo junto com a nuvem',
  },
  'caption.falling': {
    ko: '먼지 구름 전체가 천체로 떨어진다. 천체에 가까운 쪽일수록 조금 더 세게 끌린다.',
    en: 'The whole dust cloud falls toward the body. The nearer side is pulled a little harder.',
    ja: '塵の雲全体が天体へ落ちていく。天体に近い側ほど少し強く引かれる。',
    zh: '整团尘埃云朝天体落去。靠近天体的一侧被拉得稍强一些。',
    ar: 'تسقط سحابة الغبار كلها نحو الجرم. والجانب الأقرب يُجذب بقوة أكبر قليلًا.',
    es: 'Toda la nube de polvo cae hacia el cuerpo. El lado más cercano es atraído un poco más fuerte.',
    fr: 'Tout le nuage de poussière tombe vers le corps. Le côté le plus proche est attiré un peu plus fort.',
    hi: 'धूल का पूरा बादल पिंड की ओर गिरता है। पास वाला हिस्सा थोड़ा ज़्यादा ज़ोर से खिंचता है।',
    id: 'Seluruh awan debu jatuh ke arah benda itu. Sisi yang lebih dekat ditarik sedikit lebih kuat.',
    pt: 'A nuvem de poeira inteira cai em direção ao corpo. O lado mais próximo é puxado um pouco mais forte.',
  },
  'caption.stretched': {
    ko: '구름과 함께 떨어지며 보면, 천체 쪽 끝은 앞으로 달아나고 반대쪽 끝은 뒤로 처진다 — 구름이 양쪽으로 늘어난다.',
    en: 'Falling along with the cloud, the near end runs ahead and the far end lags behind — the cloud stretches both ways.',
    ja: '雲といっしょに落ちながら見ると、天体側の端は先へ逃げ、反対側の端は後ろに遅れる — 雲が両側へ引き伸ばされる。',
    zh: '随云一起下落来看，靠近天体的一端跑到前面，远端落在后面 — 云朝两边被拉长。',
    ar: 'عند السقوط مع السحابة، يسبق الطرف القريب ويتخلف الطرف البعيد — فتتمدد السحابة في الاتجاهين.',
    es: 'Cayendo junto con la nube, el extremo cercano se adelanta y el lejano se queda atrás — la nube se estira hacia ambos lados.',
    fr: 'En tombant avec le nuage, le bout proche file devant et le bout éloigné traîne derrière — le nuage s’étire des deux côtés.',
    hi: 'बादल के साथ गिरते हुए देखें तो पास वाला सिरा आगे निकल जाता है और दूर वाला सिरा पीछे छूट जाता है — बादल दोनों ओर खिंच जाता है।',
    id: 'Jika dilihat sambil ikut jatuh bersama awan, ujung dekat melaju di depan dan ujung jauh tertinggal di belakang — awan meregang ke dua arah.',
    pt: 'Caindo junto com a nuvem, a ponta próxima dispara à frente e a distante fica para trás — a nuvem se estica para os dois lados.',
  },
} satisfies Record<string, LocalizedText>);

export type TidalForceMessageKey = keyof typeof tidalForceMessages;

export const text = (key: TidalForceMessageKey): LocalizedText => tidalForceMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TidalForceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const tidalForceSchema: BundleSchema = {
  id: TIDAL_FORCE_ID,
  label: text('label.title'),
  category: 'astro',
  description: text('label.description'),
  timeModel: 'periodic',

  /**
   * 조작기가 없다. 거리를 바꾸는 조작은 자동 낙하가 이미 모든 거리를 훑으므로
   * 새로 알게 되는 것이 없다 (원본 NOTES).
   */
  parameters: [],

  stages: [
    {
      id: 'fall',
      label: text('label.stage'),
      /**
       * 물리 상수 — 원본 그대로.
       * - `d0` 처음 중심 거리 · `r0` 구름 반지름 · `freeFallTime` 중심이 천체까지 떨어지는 시간
       * - `dustCount` 먼지 수(0: 천체 쪽 끝, 1: 반대쪽 끝, 나머지: 원판 안에 고르게)
       * - `headStart` 매 주기 시작마다 미리 흘려 두는 물리 시간 — 도착한 순간 이미 떨어지는 중
       * - `seed` 먼지 자리와 흐름 무늬 위상의 난수 시드(원본 `?seed=1`)
       * - `stretchRatio` 양 끝이 모두 처음 반지름의 이 배를 넘으면 캡션이 "늘어난다" 로 바뀐다
       */
      constants: {
        d0: 460,
        r0: 30,
        freeFallTime: 7.2,
        dustCount: 170,
        headStart: 1.0,
        seed: 1,
        stretchRatio: 1.08,
      },
    },
  ],
  environments: [],
  views: [{ id: 'two-frames', label: text('label.view'), default: true }],

  /** 원본 캔버스 860 × 300 에 캡션 두 줄 자리를 더한다. */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 한 바퀴 — 보통 빠르기로 떨어지다가, 가장 늘어난 모습을 0.3 배로 붙잡고, 멈춘 채
   * 흐려진 뒤 처음으로 돌아간다. `duration` 은 조각 시계(물리 시간)로 센다 —
   * 느린 단계 0.48 은 화면에서 1.6 초다.
   *
   * `step` 이 이 표를 읽어 흐려지는 단계에서 적분을 멈추고, 주기가 넘어가면 구름을
   * 처음 자리로 되돌린다 (NOTES 「어휘 부족」 G01).
   */
  timeline: {
    phases: [
      { id: 'fall', duration: 4.6 },
      { id: 'slow', duration: 0.48, timeScale: 0.3 },
      { id: 'fade', duration: 0.4 },
    ],
  },

  /**
   * 원본이 그린 순서 그대로 겹친다. 확대 화면의 바탕이 왼쪽 음영과 꺾쇠를 덮어야
   * 두 판이 갈린다.
   */
  drawOrder: 'scene',

  /**
   * 슬롯 하나, 두 문장 중 하나. 화면의 양 끝 입자가 모두 처음 반지름의 1.08 배를
   * 넘었는지를 `step` 이 매 걸음 재서 `stretched` 에 둔다 — 화면과 어긋나지 않는다.
   * 흐려지는 동안에도 늘어난 모습이 그대로라 캡션도 맞다.
   */
  caption: {
    anchor: { screen: 'bottom-left' },
    fontSize: 15,
    wrapWidth: 820,
    text: key('caption.falling'),
    cases: [{ when: 'stretched', text: key('caption.stretched') }],
  },

  messages: tidalForceMessages,
};
