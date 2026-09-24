// ========================================================================
// angular-momentum-vector — 선언
// ========================================================================
// 질문: 도는 것에 「방향」 이 있다는 게 무슨 뜻인가. 바퀴는 제자리에서 돌 뿐
// 어디로도 가지 않는데, 각운동량은 왜 화살표인가.
//
// 답: 회전은 **축 하나와 그 축을 감는 방향**으로 정해지고, 둘을 합친 것이 축 위의
// 화살표 하나다 — 오른손 네 손가락을 도는 쪽으로 감으면 엄지가 그 화살표다.
//
// 동사: 축을 기울이면 L 이 축을 따라 기울고, 도는 방향이 뒤집히면 L 은 줄어들어
// 0 을 지나 축의 반대쪽 끝으로 선다. 화살표는 언제나 축 위에 있다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:angular-momentum-vector` 와 문자 그대로 일치한다 (C4). */
export const ANGULAR_MOMENTUM_VECTOR_ID = 'angular-momentum-vector';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 바퀴가 도는 빠르기(rad/s). 뒤집힌 뒤에는 같은 크기로 반대로 돈다. */
export const SPIN_RATE = 2.4;
/** 축을 기울이는 최대 각(rad, 연직에서). */
export const TILT_ANGLE = (50 * Math.PI) / 180;

// ------------------------------------------------------------------------
// 배치 — 월드 길이는 임의 단위. 원점은 바퀴 중심.
// ------------------------------------------------------------------------

/** 바퀴 반지름. */
export const WHEEL_R = 0.85;
/** 도는 방향 화살표(원호)의 반지름 — 바퀴 둘레 바로 바깥. */
export const CURL_R = 1.05;
/** 도는 방향 화살표가 쓸고 가는 최대 각(rad). 도는 빠르기에 비례해 줄고 는다. */
export const CURL_SPAN = 1.45 * Math.PI;
/** 축 한쪽 반의 길이(점선). */
export const AXIS_HALF = 1.5;
/** 바퀴 굴대 한쪽 반의 길이(실선). */
export const HUB_HALF = 0.25;
/** 빠르기 가득일 때 L 화살표 길이. L 은 빠르기에 비례한다(같은 바퀴라 관성 모멘트가 같다). */
export const L_LEN = 1.3;
/** 고정 시점 — 옆으로 돌린 각과 내려다보는 각(rad). */
export const YAW = 0.35;
export const ELEV = 0.38;

/**
 * 축이 기우는 방위(rad, 세계 x 축에서). `−YAW` 가 화면 정왼쪽, `π/2 − YAW` 가 시선 쪽이다.
 * 정왼쪽으로 눕히면 바퀴 면이 거의 옆으로 서서 감는 방향이 읽히지 않고, 시선 쪽으로 눕히면
 * 축이 짧아져 L 이 줄어 보인다. 그 사이(시선 쪽 성분 sin 0.36 ≈ 0.35)로 눕힌다 — 바퀴 면은
 * 반쯤 열리고 축은 거의 제 길이로 보인다. 캡션이 오른쪽에 서므로 왼쪽으로 눕는다.
 */
export const TILT_AZIMUTH = -YAW + 0.36;

/**
 * 프레이밍. 왼쪽 반은 바퀴(기울어도 이 안), 오른쪽은 캡션 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.95, maxX: 4.55, minY: -1.62, maxY: 1.62 } as const;
/** 캡션을 세우는 월드 자리(왼쪽 끝, 세로 가운데). */
export const CAPTION_AT = [1.55, 0.15] as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const angularMomentumVectorMessages = Object.freeze({
  'label.title': {
    ko: '각운동량의 방향',
    en: 'Direction of angular momentum',
    ja: '角運動量の向き',
    zh: '角动量的方向',
    ar: 'اتجاه الزخم الزاوي',
    es: 'Dirección del momento angular',
    fr: 'Direction du moment cinétique',
    hi: 'कोणीय संवेग की दिशा',
    id: 'Arah momentum sudut',
    pt: 'Direção do momento angular',
  },
  'label.operation': {
    ko: '오른손 규칙과 회전축',
    en: 'The right-hand rule and the axis of rotation',
    ja: '右手の法則と回転軸',
    zh: '右手定则与转轴',
    ar: 'قاعدة اليد اليمنى ومحور الدوران',
    es: 'La regla de la mano derecha y el eje de rotación',
    fr: 'La règle de la main droite et l’axe de rotation',
    hi: 'दाएँ हाथ का नियम और घूर्णन अक्ष',
    id: 'Kaidah tangan kanan dan sumbu rotasi',
    pt: 'A regra da mão direita e o eixo de rotação',
  },
  'label.stage': {
    ko: '도는 바퀴',
    en: 'Spinning wheel',
    ja: '回る車輪',
    zh: '转动的轮子',
    ar: 'عجلة دوّارة',
    es: 'Rueda que gira',
    fr: 'Roue qui tourne',
    hi: 'घूमता पहिया',
    id: 'Roda yang berputar',
    pt: 'Roda girando',
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

  /** 각운동량 화살표 이름. 기호라 두 언어가 같다 (C1 판정 3). */
  'label.momentum': {
    ko: 'L',
    en: 'L',
    ja: 'L',
    zh: 'L',
    ar: 'L',
    es: 'L',
    fr: 'L',
    hi: 'L',
    id: 'L',
    pt: 'L',
  },
  /** 점선 축의 이름. 소문자 도식 라벨 한 단어 수준이지만 언어마다 낱말이 달라 문안으로 둔다. */
  'label.axis': {
    ko: '회전축',
    en: 'axis',
    ja: '回転軸',
    zh: '转轴',
    ar: 'المحور',
    es: 'eje',
    fr: 'axe',
    hi: 'अक्ष',
    id: 'sumbu',
    pt: 'eixo',
  },

  'caption.spin': {
    ko: '바퀴가 화살표 쪽으로 감기며 돈다. 오른손 네 손가락을 그렇게 감으면 엄지가 위 — L 은 축을 따라 위를 향한다.',
    en: 'The wheel turns the way the curled arrow goes. Curl your right fingers that way and your thumb points up — L points up along the axis.',
    ja: '車輪は曲がった矢印の向きに回る。右手の指をその向きに曲げると親指は上 — L は軸に沿って上を向く。',
    zh: '轮子沿弯曲箭头的方向转动。让右手四指顺着这个方向弯曲，拇指指向上方 — L 沿轴向上。',
    ar: 'تدور العجلة في اتجاه السهم المنحني. اثنِ أصابع يدك اليمنى في ذلك الاتجاه فيشير إبهامك إلى أعلى — L يشير إلى أعلى على امتداد المحور.',
    es: 'La rueda gira en el sentido de la flecha curva. Curva los dedos de la mano derecha en ese sentido y el pulgar apunta hacia arriba — L apunta hacia arriba a lo largo del eje.',
    fr: 'La roue tourne dans le sens de la flèche courbe. Enroulez les doigts de la main droite dans ce sens et le pouce pointe vers le haut — L pointe vers le haut le long de l’axe.',
    hi: 'पहिया मुड़े हुए तीर की दिशा में घूमता है। दाएँ हाथ की उँगलियों को उसी तरह मोड़ें तो अंगूठा ऊपर की ओर होता है — L अक्ष के साथ ऊपर की ओर होता है।',
    id: 'Roda berputar searah panah melengkung. Tekuk jari-jari tangan kanan ke arah itu dan ibu jari menunjuk ke atas — L menunjuk ke atas sepanjang sumbu.',
    pt: 'A roda gira no sentido da seta curva. Curve os dedos da mão direita nesse sentido e o polegar aponta para cima — L aponta para cima ao longo do eixo.',
  },
  'caption.tilt': {
    ko: '축을 기울이면 L 도 함께 기운다. 화살표는 늘 축 위에 있다.',
    en: 'Tilt the axis and L tilts with it. The arrow always lies on the axis.',
    ja: '軸を傾けると L も一緒に傾く。矢印はいつも軸の上にある。',
    zh: '倾斜转轴，L 也随之倾斜。箭头始终在轴上。',
    ar: 'أمِل المحور فيميل L معه. السهم يقع دائمًا على المحور.',
    es: 'Inclina el eje y L se inclina con él. La flecha siempre está sobre el eje.',
    fr: 'Inclinez l’axe et L s’incline avec lui. La flèche reste toujours sur l’axe.',
    hi: 'अक्ष को झुकाएँ तो L भी साथ झुकता है। तीर हमेशा अक्ष पर रहता है।',
    id: 'Miringkan sumbu dan L ikut miring. Panah selalu berada pada sumbu.',
    pt: 'Incline o eixo e L se inclina junto. A seta sempre fica sobre o eixo.',
  },
  'caption.reverse': {
    ko: '도는 방향이 뒤집힌다. L 은 줄어들어 0 을 지나고, 축의 반대쪽 끝으로 자란다.',
    en: 'The spin reverses. L shrinks through zero and grows out of the other end of the axis.',
    ja: '回転が逆になる。L は縮んで 0 を通り、軸の反対側の端へ伸びていく。',
    zh: '转动方向反转。L 缩短并经过 0，再从轴的另一端长出来。',
    ar: 'ينعكس الدوران. يتقلص L مارًّا بالصفر ثم ينمو من الطرف الآخر للمحور.',
    es: 'El giro se invierte. L se encoge hasta pasar por cero y crece desde el otro extremo del eje.',
    fr: 'La rotation s’inverse. L rétrécit en passant par zéro et ressort par l’autre bout de l’axe.',
    hi: 'घूर्णन उलट जाता है। L सिकुड़कर शून्य से गुज़रता है और अक्ष के दूसरे सिरे से बढ़ता है।',
    id: 'Putarannya berbalik. L menyusut melewati nol lalu tumbuh dari ujung sumbu yang lain.',
    pt: 'O giro se inverte. L encolhe passando por zero e cresce a partir da outra ponta do eixo.',
  },
  'caption.reversed': {
    ko: '같은 축, 반대로 감는다 — 엄지도 반대쪽을 가리킨다.',
    en: 'Same axis, opposite curl — the thumb points the other way.',
    ja: '同じ軸で逆向きに曲げる — 親指も反対側を指す。',
    zh: '同一根轴，反向弯曲 — 拇指也指向另一侧。',
    ar: 'المحور نفسه، والانثناء معاكس — فيشير الإبهام إلى الجهة الأخرى.',
    es: 'El mismo eje, la curva opuesta — el pulgar apunta hacia el otro lado.',
    fr: 'Même axe, enroulement opposé — le pouce pointe de l’autre côté.',
    hi: 'वही अक्ष, उलटा मोड़ — अंगूठा भी दूसरी ओर इशारा करता है।',
    id: 'Sumbu yang sama, lengkungan berlawanan — ibu jari menunjuk ke arah sebaliknya.',
    pt: 'O mesmo eixo, curva oposta — o polegar aponta para o outro lado.',
  },
} satisfies Record<string, LocalizedText>);

export type AngularMomentumVectorMessageKey = keyof typeof angularMomentumVectorMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AngularMomentumVectorMessageKey): LocalizedText => angularMomentumVectorMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AngularMomentumVectorMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const angularMomentumVectorSchema: BundleSchema = {
  id: ANGULAR_MOMENTUM_VECTOR_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'wheel',
      label: text('label.stage'),
      constants: {
        spinRate: SPIN_RATE,
        tiltAngle: TILT_ANGLE,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 바퀴, 오른쪽 캡션. 세로는 축 길이만큼이면 된다. */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 쓴 순서대로 겹친다 — 깊이에 따라 뒤(시선에서 먼 쪽) 원호 · 축 · L, 바퀴, 앞 원호 · 축 · L.
   * 층 순서로는 같은 어휘끼리의 앞뒤를 고를 수 없다 (scene.ts).
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 바퀴가 돌고 있다 (S-piece). */
  startAt: 1.2,

  /**
   * 한 주기 12.4 초.
   *
   * - `appear` — 옅게 떠오른다. 앞 주기의 기울어진 · 뒤집힌 바퀴에서 이어지지 않도록.
   * - `spin` — 연직 축, 위에서 보아 반시계로 돈다. L 은 위.
   * - `tilt` — 축이 기운다. 진행도가 기운 각이다.
   * - `tilted` — 기운 채로 돈다.
   * - `reverse` — 빠르기가 줄어 멈췄다가 반대로 는다. 진행도가 곧 빠르기의 변화다(선형).
   * - `reversed` — 반대로 돈다. L 은 축의 다른 끝.
   * - `fade` — 옅어지며 물러난다. 끝난 화면이 남지 않도록 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.5, caption: key('caption.spin') },
      { id: 'spin', duration: 2.6, caption: key('caption.spin') },
      { id: 'tilt', duration: 2.2, ease: 'smooth', caption: key('caption.tilt') },
      { id: 'tilted', duration: 1.6, caption: key('caption.tilt') },
      { id: 'reverse', duration: 2.2, ease: 'linear', caption: key('caption.reverse') },
      { id: 'reversed', duration: 2.6, caption: key('caption.reversed') },
      { id: 'fade', duration: 0.7, caption: key('caption.reversed') },
    ],
  },

  /** 슬롯 하나. 오른쪽 빈 자리에 세운다 — 세로가 비싸 아래 줄을 쓰지 않는다. */
  caption: {
    anchor: { world: [CAPTION_AT[0], CAPTION_AT[1]] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 330,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본). 카메라가 움직이면 축의 기울기와 시점의 회전이 섞인다.

  messages: angularMomentumVectorMessages,
};
