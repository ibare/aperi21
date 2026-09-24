// ========================================================================
// expanding-universe — 선언
// ========================================================================
// 질문: 은하들이 모두 우리에게서 멀어진다면, 우리가 우주의 가운데인가.
//
// 공간 자체가 고르게 늘어난다. 늘어나는 것은 은하가 아니라 은하 사이의 공간이라,
// 어느 은하에 서서 보아도 나머지 모두가 나에게서 멀어지고 두 배 먼 은하는 두 배
// 빨리 멀어진다(허블 법칙). 한 번은 왼쪽 끝 은하에, 한 번은 오른쪽 끝 은하에 서서
// 같은 늘임을 본다 — 두 그림이 같다. 가운데가 따로 없다.
//
// 이 조각은 **공간이 고르게 늘어나는 것** 에 머문다. 빛의 적색 이동 · 우주의 나이는
// 다루지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:expanding-universe` 와 문자 그대로 일치한다 (C4). */
export const EXPANDING_UNIVERSE_ID = 'expanding-universe';

// ------------------------------------------------------------------------
// 물리 · 배치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 허블 상수 H(1/초, 조각 시계). 공간의 한 조각이 1 초에 제 길이의 몇 배만큼 늘어나는가.
 * 늘어나는 동안 H 가 그대로라 척도 인자는 a = e^(H·τ) 이고, 어느 순간이든 v = H·d 다.
 * 늘이는 단계 3.4 초 동안 a 가 약 1.6 배가 된다.
 */
export const HUBBLE = 0.14;
/** 줄 선 세 은하의 간격 d(월드, 늘기 전). 가운데 은하가 양 끝의 한가운데라 끝과 끝은 2d 다. */
export const SPACING = 1.5;
/** 줄의 가운데 은하 자리(월드, 늘기 전). */
export const ROW_X = 0;
export const ROW_Y = -0.25;
/** 흩뿌린 은하 수. */
export const GALAXY_COUNT = 34;
/** 흩뿌림 난수의 씨앗. 같은 씨앗은 언제나 같은 하늘이다. */
export const GALAXY_SEED = 11;
/** 속도 화살표의 길이 = 속도 × 이 시간(초). 화살표 길이가 속도에 비례한다. */
export const ARROW_SECONDS = 1.3;
/** 공간 격자의 간격(월드, 늘기 전). d 의 절반 — 줄 선 은하가 격자 교점에 앉는다. */
export const GRID_STEP = 0.75;

/**
 * 프레이밍은 주장의 일부다. 가장 많이 늘었을 때 먼 은하(2d)와 그 속도 화살표까지 들어가고,
 * 아래에 캡션이 앉을 자리를 남긴다. 늘어난 뒤 화면 밖으로 나가는 은하는 나가도 된다 —
 * 경계를 상태로 계산하지 않는다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -4.5, maxX: 4.5, minY: -2.7, maxY: 2.3 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const expandingUniverseMessages = Object.freeze({
  'label.title': {
    ko: '우주의 팽창',
    en: 'The expanding universe',
    ja: '宇宙の膨張',
    zh: '宇宙膨胀',
    ar: 'تمدد الكون',
    es: 'La expansión del universo',
    fr: 'L’univers en expansion',
    hi: 'फैलता हुआ ब्रह्मांड',
    id: 'Alam semesta yang mengembang',
    pt: 'O universo em expansão',
  },
  'label.operation': {
    ko: '모든 방향으로 멀어지는 은하들',
    en: 'Galaxies receding in every direction',
    ja: 'あらゆる方向へ遠ざかる銀河',
    zh: '向四面八方远离的星系',
    ar: 'مجرات تبتعد في كل الاتجاهات',
    es: 'Galaxias que se alejan en todas direcciones',
    fr: 'Des galaxies qui s’éloignent dans toutes les directions',
    hi: 'हर दिशा में दूर जाती आकाशगंगाएँ',
    id: 'Galaksi-galaksi yang menjauh ke segala arah',
    pt: 'Galáxias se afastando em todas as direções',
  },
  'label.stage': {
    ko: '고르게 늘어나는 공간',
    en: 'Evenly stretching space',
    ja: '一様に伸びる空間',
    zh: '均匀伸展的空间',
    ar: 'فضاء يتمدد بانتظام',
    es: 'Espacio que se estira por igual',
    fr: 'Un espace qui s’étire uniformément',
    hi: 'समान रूप से खिंचता अंतरिक्ष',
    id: 'Ruang yang meregang merata',
    pt: 'Espaço que se estica por igual',
  },
  'label.view': {
    ko: '은하에 서서 보기',
    en: 'Standing on a galaxy',
    ja: '銀河に立って見る',
    zh: '站在星系上看',
    ar: 'الوقوف على مجرة',
    es: 'De pie sobre una galaxia',
    fr: 'Debout sur une galaxie',
    hi: 'एक आकाशगंगा पर खड़े होकर',
    id: 'Berdiri di sebuah galaksi',
    pt: 'De pé numa galáxia',
  },
  /** 관찰 은하에 붙는 이름표. */
  'label.observer': {
    ko: '여기서 본다',
    en: 'Viewing from here',
    ja: 'ここから見る',
    zh: '从这里看',
    ar: 'الرصد من هنا',
    es: 'Vista desde aquí',
    fr: 'Vu d’ici',
    hi: 'यहाँ से देखते हुए',
    id: 'Melihat dari sini',
    pt: 'Vendo daqui',
  },
  /** 거리 · 속도 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.near': {
    ko: 'd',
    en: 'd',
    ja: 'd',
    zh: 'd',
    ar: 'd',
    es: 'd',
    fr: 'd',
    hi: 'd',
    id: 'd',
    pt: 'd',
  },
  'label.far': {
    ko: '2d',
    en: '2d',
    ja: '2d',
    zh: '2d',
    ar: '2d',
    es: '2d',
    fr: '2d',
    hi: '2d',
    id: '2d',
    pt: '2d',
  },
  'label.nearSpeed': {
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
  'label.farSpeed': {
    ko: '2v',
    en: '2v',
    ja: '2v',
    zh: '2v',
    ar: '2v',
    es: '2v',
    fr: '2v',
    hi: '2v',
    id: '2v',
    pt: '2v',
  },
  'caption.stretchLeft': {
    ko: '공간이 고르게 늘어난다 — 왼쪽 끝 은하에서 보면 나머지가 모두 나에게서 멀어진다',
    en: 'Space stretches evenly — seen from the galaxy on the left, every other galaxy moves away',
    ja: '空間が一様に伸びる — 左端の銀河から見ると、ほかの銀河はすべて遠ざかる',
    zh: '空间均匀伸展 — 从左边的星系看，其他星系都在远离',
    ar: 'يتمدد الفضاء بانتظام — من المجرة التي على اليسار، تبدو كل المجرات الأخرى مبتعدة',
    es: 'El espacio se estira por igual — vistas desde la galaxia de la izquierda, todas las demás se alejan',
    fr: 'L’espace s’étire uniformément — vues de la galaxie de gauche, toutes les autres s’éloignent',
    hi: 'अंतरिक्ष समान रूप से खिंचता है — बाईं ओर की आकाशगंगा से देखने पर बाकी सभी आकाशगंगाएँ दूर जाती हैं',
    id: 'Ruang meregang merata — dilihat dari galaksi di kiri, semua galaksi lain menjauh',
    pt: 'O espaço se estica por igual — vistas da galáxia à esquerda, todas as outras se afastam',
  },
  'caption.holdLeft': {
    ko: '두 배 먼 은하는 같은 시간에 두 배 멀리 갔다 — 두 배 빨리 멀어진다',
    en: 'The galaxy twice as far went twice as far in the same time — it recedes twice as fast',
    ja: '2倍遠い銀河は同じ時間に2倍遠くまで行った — 2倍速く遠ざかる',
    zh: '两倍远的星系在同样的时间里走了两倍的距离 — 它远离的速度是两倍',
    ar: 'المجرة التي تبعد ضعف المسافة قطعت ضعف المسافة في الزمن نفسه — فهي تبتعد بضعف السرعة',
    es: 'La galaxia el doble de lejos recorrió el doble en el mismo tiempo — se aleja el doble de rápido',
    fr: 'La galaxie deux fois plus loin a parcouru deux fois plus en même temps — elle s’éloigne deux fois plus vite',
    hi: 'दुगुनी दूर की आकाशगंगा उतने ही समय में दुगुनी दूरी तय कर गई — वह दुगुनी तेज़ी से दूर जाती है',
    id: 'Galaksi yang dua kali lebih jauh bergerak dua kali lebih jauh dalam waktu yang sama — ia menjauh dua kali lebih cepat',
    pt: 'A galáxia duas vezes mais distante percorreu o dobro no mesmo tempo — ela se afasta duas vezes mais rápido',
  },
  'caption.move': {
    ko: '이번에는 오른쪽 끝 은하로 옮겨 서서, 같은 공간을 다시 늘인다',
    en: 'Now stand on the galaxy at the right end and stretch the same space again',
    ja: '今度は右端の銀河に移って立ち、同じ空間をもう一度伸ばす',
    zh: '这次站到最右边的星系上，把同一片空间再伸展一次',
    ar: 'والآن قف على المجرة في الطرف الأيمن ومدِّد الفضاء نفسه مرة أخرى',
    es: 'Ahora ponte en la galaxia del extremo derecho y estira de nuevo el mismo espacio',
    fr: 'Placez-vous maintenant sur la galaxie tout à droite et étirez à nouveau le même espace',
    hi: 'अब दाएँ सिरे की आकाशगंगा पर खड़े होकर उसी अंतरिक्ष को फिर से खींचें',
    id: 'Sekarang berdirilah di galaksi di ujung kanan dan regangkan ruang yang sama sekali lagi',
    pt: 'Agora fique na galáxia da ponta direita e estique de novo o mesmo espaço',
  },
  'caption.stretchRight': {
    ko: '여기서 보아도 나머지가 모두 나에게서 멀어진다 — 왼쪽 끝 은하도',
    en: 'From here too, every other galaxy moves away — including the one on the left',
    ja: 'ここから見ても、ほかの銀河はすべて遠ざかる — 左端の銀河も',
    zh: '从这里看，其他星系也都在远离 — 包括左边那个',
    ar: 'ومن هنا أيضًا تبتعد كل المجرات الأخرى — بما فيها التي على اليسار',
    es: 'Desde aquí también, todas las demás galaxias se alejan — incluida la de la izquierda',
    fr: 'D’ici aussi, toutes les autres galaxies s’éloignent — y compris celle de gauche',
    hi: 'यहाँ से भी बाकी सभी आकाशगंगाएँ दूर जाती हैं — बाईं वाली भी',
    id: 'Dari sini pun, semua galaksi lain menjauh — termasuk yang di kiri',
    pt: 'Daqui também, todas as outras galáxias se afastam — inclusive a da esquerda',
  },
  'caption.holdRight': {
    ko: '같은 그림이다 — 어느 은하에 서도 제가 가운데처럼 보인다. 가운데는 따로 없다',
    en: 'The same picture — every galaxy looks like the center from where it stands. There is no center',
    ja: '同じ光景だ — どの銀河も、そこに立てば自分が中心に見える。中心はない',
    zh: '同样的图景 — 站在任何一个星系上，它看起来都像中心。并没有中心',
    ar: 'الصورة نفسها — كل مجرة تبدو المركز من حيث تقف. لا يوجد مركز',
    es: 'La misma imagen — cada galaxia parece el centro desde donde está. No hay centro',
    fr: 'La même image — chaque galaxie semble être le centre, vue d’elle-même. Il n’y a pas de centre',
    hi: 'वही दृश्य — हर आकाशगंगा अपनी जगह से केंद्र जैसी दिखती है। कोई केंद्र नहीं है',
    id: 'Gambaran yang sama — setiap galaksi tampak seperti pusat dari tempatnya berdiri. Tidak ada pusat',
    pt: 'A mesma imagem — cada galáxia parece o centro de onde está. Não há centro',
  },
} satisfies Record<string, LocalizedText>);

export type ExpandingUniverseMessageKey = keyof typeof expandingUniverseMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ExpandingUniverseMessageKey): LocalizedText => expandingUniverseMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ExpandingUniverseMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const expandingUniverseSchema: BundleSchema = {
  id: EXPANDING_UNIVERSE_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 늘어나는 중이고, 관찰 은하를 옮겨 한 번 더 늘인다.
  parameters: [],

  stages: [
    {
      id: 'even-stretch',
      label: text('label.stage'),
      constants: {
        hubble: HUBBLE,
        spacing: SPACING,
        rowX: ROW_X,
        rowY: ROW_Y,
        galaxyCount: GALAXY_COUNT,
        galaxySeed: GALAXY_SEED,
        arrowSeconds: ARROW_SECONDS,
        gridStep: GRID_STEP,
      },
    },
  ],

  environments: [],

  views: [{ id: 'on-galaxy', label: text('label.view'), default: true }],

  /** 가로로 긴 줄(2d 가 1.6 배로 늘어남)이 주인이라 세로는 낮게 둔다. */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 겹침 순서를 조각이 정한다 — 격자(공간)가 맨 아래, 그 위에 처음 자리 · 지나온 자취,
   * 은하, 속도 화살표, 관찰 고리 · 이름표. 층 순서로는 `lineSet` 격자와 자취가 같은 층이라
   * 둘 사이를 가를 수 없다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 왼쪽 끝 은하에 서서 늘임 → 멈춤 → 흐려짐 → 늘기 전 공간이 다시 나타남 →
   * 관찰 고리가 오른쪽 끝 은하로 옮겨 감 → 늘임 → 멈춤 → 흐려짐.
   *
   * 늘이는 단계는 `linear` 다 — 시계가 고르게 흘러야 a = e^(H·τ) 가 참이다. 늘어난 공간을
   * 되감지 않고 흐려졌다가 다시 나타나게 하는 것은, 되감으면 수축으로 읽히기 때문이다.
   */
  timeline: {
    phases: [
      { id: 'appearLeft', duration: 0.5, caption: key('caption.stretchLeft') },
      { id: 'stretchLeft', duration: 3.4, caption: key('caption.stretchLeft') },
      { id: 'holdLeft', duration: 2.8, caption: key('caption.holdLeft') },
      { id: 'fadeLeft', duration: 0.5, caption: key('caption.holdLeft') },
      { id: 'appearRight', duration: 0.5, caption: key('caption.move') },
      { id: 'move', duration: 1.4, ease: 'smooth', caption: key('caption.move') },
      { id: 'stretchRight', duration: 3.4, caption: key('caption.stretchRight') },
      { id: 'holdRight', duration: 3.0, caption: key('caption.holdRight') },
      { id: 'fadeRight', duration: 0.5, caption: key('caption.holdRight') },
    ],
  },

  /**
   * 도착한 순간 이미 늘어나는 중이다 — 왼쪽 끝 은하에 서서 공간이 늘기 시작한 자리에서 연다.
   * 0 이면 흐려진 빈 화면이 먼저 보인다.
   */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — v = H·d 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 크롬 그리드 · 카메라 단추 없음(기본값). 미터 격자는 두지 않는다 — 대신 **공간 자체**를
   * 격자로 그려 함께 늘인다. 잴 것은 미터가 아니라 「같은 시간에 몇 배 멀리 갔는가」 다.
   */

  messages: expandingUniverseMessages,
};
