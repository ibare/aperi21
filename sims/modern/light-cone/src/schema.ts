// ========================================================================
// light-cone — 선언
// ========================================================================
// 질문: 한 사건이 영향을 줄 수 있는 곳은 어디까지인가.
//
// 사건 E 에서 빛이 사방으로 퍼지면 그 앞면은 시공간에서 원뿔을 쓸고 간다(2+1 차원).
// 원뿔 안쪽에서 일어난 사건에만 E 의 신호가 닿는다 — 빛보다 느린 신호는 언제나 빛의
// 고리 안쪽에 머물기 때문이다. 원뿔 바깥 사건에는 빛조차 제때 닿지 못한다.
// 다른 속도로 움직이는 관찰자의 틀로 바꾸면 사건들은 미끄러지지만 원뿔은 그대로이고,
// 안쪽 사건은 안쪽에, 바깥 사건은 바깥에 남는다.
//
// 이웃 `spacetime-diagram` 은 1+1 도표에서 동시선이 기우는 것을 보인다. 이 조각은
// 그것을 되풀이하지 않고 **원뿔 하나 · 안과 밖 · 틀을 바꿔도 그대로** 만 말한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:light-cone` 와 문자 그대로 일치한다 (C4). */
export const LIGHT_CONE_ID = 'light-cone';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 단위: 빛의 속도 = 1. 공간 x · y 와 시간 ct 가 같은 단위다.
// ------------------------------------------------------------------------

/** 틀을 바꿀 때 새 관찰자의 속도 v/c (x 방향). */
export const BETA = 0.5;

/**
 * 사건이 일어난 순간의 번쩍임이 사는 동안(ct). 사건 시각은 단계 경계가 아니라 사건의 ct 가
 * 정해 시간표 단계로 풀 수 없으므로 스테이지 상수로 둔다 (S-piece, NOTES (c)).
 */
export const PULSE_LIFE = 0.35;

/**
 * 사건 넷의 자리 (x, y, ct). E 는 원점이다.
 *
 * A · B 는 원뿔 안(√(x²+y²) < ct), C · D 는 원뿔 밖이다. C 는 틀을 바꾸면 E 보다
 * 먼저(ct′ < 0)가 되고, D 는 더 나중이 된다 — 둘 다 원뿔 밖에 남는다.
 * 목록 길이(넷)는 코드에 남는다 (NOTES (c) G105).
 */
export const EVENT_A = { x: 0.9, y: 0.3, ct: 1.5 } as const;
export const EVENT_B = { x: 0.1, y: -0.4, ct: 1.9 } as const;
export const EVENT_C = { x: 2.6, y: 0, ct: 0.5 } as const;
export const EVENT_D = { x: -2.4, y: 0, ct: 0.3 } as const;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(ct). 투영과 원뿔의 크기는 그림의 결정이다.
// ------------------------------------------------------------------------

/**
 * 비스듬한 투영. 화면 X = x + y·SKEW_X, 화면 Y = ct + y·SKEW_Y.
 * y 가 커질수록(뒤쪽) 오른쪽 위로 물러난다. (x 오른쪽, y 뒤, ct 위) 는 오른손 좌표다.
 */
export const SKEW_X = 0.35;
export const SKEW_Y = 0.3;

/** 미래 원뿔 · 과거 원뿔을 그리는 높이(ct). 빛의 속도가 1 이라 테 반지름도 같다. */
export const FUTURE_HEIGHT = 2.6;
export const PAST_HEIGHT = 1.0;

/** 「지금」 단면 판의 반폭(x · y, 월드). 미래 원뿔의 테를 조금 넘는다. */
export const SLICE_HALF_X = 3.1;
export const SLICE_HALF_Y = 1.1;

/** 원뿔 테(타원)를 표본할 점 수. */
export const RIM_SAMPLES = 96;
/** 틀을 바꾸는 동안 사건이 미끄러진 길(쌍곡선)을 표본할 점 수. */
export const SLIDE_SAMPLES = 24;

/** 고정 경계. 부스트 뒤 D(왼쪽 위) · C(오른쪽 아래)와 과거 원뿔 · 캡션 줄이 들어간다. */
export const SCENE_BOUNDS = { minX: -4.3, maxX: 4.3, minY: -1.85, maxY: 3.55 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const lightConeMessages = Object.freeze({
  'label.title': {
    ko: '광원뿔',
    en: 'Light cone',
    ja: '光円錐',
    zh: '光锥',
    ar: 'المخروط الضوئي',
    es: 'Cono de luz',
    fr: 'Cône de lumière',
    hi: 'प्रकाश शंकु',
    id: 'Kerucut cahaya',
    pt: 'Cone de luz',
  },
  'label.operation': {
    ko: '인과가 닿는 영역',
    en: 'Where a cause can reach',
    ja: '原因が届く範囲',
    zh: '原因所能到达的范围',
    ar: 'حيث يمكن أن يصل السبب',
    es: 'Hasta dónde llega una causa',
    fr: 'Là où une cause peut porter',
    hi: 'जहाँ तक कोई कारण पहुँच सकता है',
    id: 'Sejauh mana sebab dapat menjangkau',
    pt: 'Até onde uma causa pode chegar',
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
  /** 사건 이름. 도식의 기호라 표식이다 (C1 판정 3). */
  'label.event': {
    ko: 'E',
    en: 'E',
    ja: 'E',
    zh: 'E',
    ar: 'E',
    es: 'E',
    fr: 'E',
    hi: 'E',
    id: 'E',
    pt: 'E',
  },
  'label.future': {
    ko: '미래',
    en: 'future',
    ja: '未来',
    zh: '未来',
    ar: 'المستقبل',
    es: 'futuro',
    fr: 'futur',
    hi: 'भविष्य',
    id: 'masa depan',
    pt: 'futuro',
  },
  'label.past': {
    ko: '과거',
    en: 'past',
    ja: '過去',
    zh: '过去',
    ar: 'الماضي',
    es: 'pasado',
    fr: 'passé',
    hi: 'भूतकाल',
    id: 'masa lalu',
    pt: 'passado',
  },
  'label.elsewhere': {
    ko: '다른 곳',
    en: 'elsewhere',
    ja: '別の場所',
    zh: '别处',
    ar: 'مكان آخر',
    es: 'otra parte',
    fr: 'ailleurs',
    hi: 'अन्यत्र',
    id: 'tempat lain',
    pt: 'outro lugar',
  },
  'label.timeAxis': {
    ko: '시간 ↑',
    en: 'time ↑',
    ja: '時間 ↑',
    zh: '时间 ↑',
    ar: 'الزمن ↑',
    es: 'tiempo ↑',
    fr: 'temps ↑',
    hi: 'समय ↑',
    id: 'waktu ↑',
    pt: 'tempo ↑',
  },
  'label.now': {
    ko: '지금',
    en: 'now',
    ja: '今',
    zh: '现在',
    ar: 'الآن',
    es: 'ahora',
    fr: 'maintenant',
    hi: 'अभी',
    id: 'sekarang',
    pt: 'agora',
  },
  /** 바뀐 틀에서 E 와 같은 때인 판(ct′ = 0). 이 판 아래는 그 틀에서 E 보다 먼저다. */
  'label.withE': {
    ko: 'E 와 같은 때',
    en: 'same time as E',
    ja: 'E と同時',
    zh: '与 E 同时',
    ar: 'في زمن E نفسه',
    es: 'a la vez que E',
    fr: 'en même temps que E',
    hi: 'E के साथ एक ही समय',
    id: 'serentak dengan E',
    pt: 'ao mesmo tempo que E',
  },
  'label.reached': {
    ko: '닿는다',
    en: 'reachable',
    ja: '届く',
    zh: '可到达',
    ar: 'في المتناول',
    es: 'alcanzable',
    fr: 'atteignable',
    hi: 'पहुँच में',
    id: 'terjangkau',
    pt: 'alcançável',
  },
  'label.unreached': {
    ko: '닿지 못한다',
    en: 'out of reach',
    ja: '届かない',
    zh: '无法到达',
    ar: 'خارج المتناول',
    es: 'fuera de alcance',
    fr: 'hors d’atteinte',
    hi: 'पहुँच से बाहर',
    id: 'tak terjangkau',
    pt: 'fora de alcance',
  },
  'caption.emit': {
    ko: '사건 E 에서 빛이 사방으로 퍼져 나간다',
    en: 'Light spreads out in every direction from event E',
    ja: '事象 E から光が四方に広がっていく',
    zh: '光从事件 E 向四面八方传播开去',
    ar: 'ينتشر الضوء في كل اتجاه من الحدث E',
    es: 'La luz se expande en todas direcciones desde el suceso E',
    fr: 'La lumière se répand dans toutes les directions depuis l’événement E',
    hi: 'घटना E से प्रकाश हर दिशा में फैलता है',
    id: 'Cahaya menyebar ke segala arah dari peristiwa E',
    pt: 'A luz se espalha em todas as direções a partir do evento E',
  },
  'caption.spread': {
    ko: '빛의 고리 안에서 일어난 사건에는 E 의 신호가 닿고, 고리 밖 사건에는 빛조차 아직 가지 못했다',
    en: "Events inside the ring of light get E's signal — outside it, not even light has arrived yet",
    ja: '光の輪の内側の事象には E の信号が届く — 輪の外にはまだ光さえ届いていない',
    zh: '光环内的事件收到 E 的信号——环外连光都还没到达',
    ar: 'الأحداث داخل حلقة الضوء تصلها إشارة E — أما خارجها فلم يصل حتى الضوء بعد',
    es: 'Los sucesos dentro del anillo de luz reciben la señal de E — fuera de él, ni la luz ha llegado aún',
    fr: 'Les événements dans l’anneau de lumière reçoivent le signal de E — au-dehors, même la lumière n’est pas encore arrivée',
    hi: 'प्रकाश के वलय के भीतर की घटनाओं तक E का संकेत पहुँचता है — उसके बाहर अभी प्रकाश भी नहीं पहुँचा',
    id: 'Peristiwa di dalam cincin cahaya menerima sinyal E — di luarnya, cahaya pun belum tiba',
    pt: 'Os eventos dentro do anel de luz recebem o sinal de E — fora dele, nem a luz chegou ainda',
  },
  'caption.hold': {
    ko: '빛이 쓸고 간 자리가 원뿔이다 — 그 안쪽 사건만 E 의 영향을 받을 수 있다',
    en: 'The spreading light sweeps out a cone — only events inside it can feel E',
    ja: '広がる光が掃いた跡が円錐になる — その内側の事象だけが E の影響を受けうる',
    zh: '扩散的光扫出一个锥——只有锥内的事件能受到 E 的影响',
    ar: 'يرسم الضوء المنتشر مخروطًا — ولا تتأثر بـ E إلا الأحداث داخله',
    es: 'La luz que se expande barre un cono — solo los sucesos dentro de él pueden sentir E',
    fr: 'La lumière qui se répand balaie un cône — seuls les événements à l’intérieur peuvent ressentir E',
    hi: 'फैलता प्रकाश एक शंकु बनाता है — केवल उसके भीतर की घटनाएँ E का प्रभाव पा सकती हैं',
    id: 'Cahaya yang menyebar menyapu sebuah kerucut — hanya peristiwa di dalamnya yang dapat merasakan E',
    pt: 'A luz que se espalha varre um cone — só os eventos dentro dele podem sentir E',
  },
  'caption.boost': {
    ko: '움직이는 관찰자의 틀로 바꾸면 사건들은 미끄러지지만 원뿔은 그대로다',
    en: "Switch to a moving observer's frame — the events slide, the cone stays put",
    ja: '動く観測者の座標系に切り替える — 事象は滑るように動き、円錐はそのままだ',
    zh: '切换到运动观察者的参考系——事件滑动了，光锥却原地不动',
    ar: 'انتقل إلى إطار مراقب متحرك — تنزلق الأحداث، ويبقى المخروط في مكانه',
    es: 'Cambia al sistema de referencia de un observador en movimiento — los sucesos se deslizan, el cono no se mueve',
    fr: 'Passons au référentiel d’un observateur en mouvement — les événements glissent, le cône reste en place',
    hi: 'किसी चलते प्रेक्षक के निर्देश तंत्र में बदलें — घटनाएँ खिसकती हैं, शंकु अपनी जगह रहता है',
    id: 'Beralih ke kerangka acuan pengamat yang bergerak — peristiwa-peristiwa bergeser, kerucut tetap di tempat',
    pt: 'Passe para o referencial de um observador em movimento — os eventos deslizam, o cone fica no lugar',
  },
  'caption.boosted': {
    ko: '안쪽 사건은 안쪽에 남고, 바깥 사건 하나는 E 보다 먼저가 되었다 — 그래도 원뿔 밖이라 닿지 않는다',
    en: 'Inside events stay inside; one outside event now comes before E — still outside the cone, still out of reach',
    ja: '内側の事象は内側にとどまり、外側の事象の1つは E より先になった — それでも円錐の外なので届かない',
    zh: '内部的事件仍在内部；外面的一个事件现在先于 E——仍在锥外，仍然无法到达',
    ar: 'تبقى الأحداث الداخلية في الداخل؛ وصار حدث خارجي واحد يسبق E — لكنه ما زال خارج المخروط، وما زال خارج المتناول',
    es: 'Los sucesos de dentro siguen dentro; uno de fuera ahora ocurre antes que E — sigue fuera del cono, sigue fuera de alcance',
    fr: 'Les événements intérieurs restent à l’intérieur ; un événement extérieur précède maintenant E — toujours hors du cône, toujours hors d’atteinte',
    hi: 'भीतर की घटनाएँ भीतर ही रहती हैं; बाहर की एक घटना अब E से पहले हो गई — फिर भी शंकु के बाहर, फिर भी पहुँच से बाहर',
    id: 'Peristiwa di dalam tetap di dalam; satu peristiwa di luar kini terjadi sebelum E — tetap di luar kerucut, tetap tak terjangkau',
    pt: 'Os eventos de dentro continuam dentro; um evento de fora agora vem antes de E — ainda fora do cone, ainda fora de alcance',
  },
  'caption.unboost': {
    ko: '처음 틀로 되돌리면 사건들이 제자리로 미끄러져 온다 — 원뿔은 그동안에도 그대로다',
    en: 'Switching back to the first frame, the events slide home — the cone never moved',
    ja: '最初の座標系に戻すと、事象は元の位置へ滑って戻る — 円錐はその間も動かなかった',
    zh: '切换回最初的参考系，事件滑回原位——光锥始终没有动',
    ar: 'بالعودة إلى الإطار الأول، تنزلق الأحداث إلى أماكنها — ولم يتحرك المخروط قط',
    es: 'Al volver al primer sistema de referencia, los sucesos regresan deslizándose — el cono nunca se movió',
    fr: 'En revenant au premier référentiel, les événements reglissent à leur place — le cône n’a jamais bougé',
    hi: 'पहले निर्देश तंत्र में लौटने पर घटनाएँ खिसककर अपनी जगह आ जाती हैं — शंकु कभी हिला ही नहीं',
    id: 'Saat kembali ke kerangka acuan semula, peristiwa-peristiwa bergeser pulang — kerucut tak pernah bergerak',
    pt: 'Ao voltar ao primeiro referencial, os eventos deslizam de volta ao lugar — o cone nunca se moveu',
  },
} satisfies Record<string, LocalizedText>);

export type LightConeMessageKey = keyof typeof lightConeMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: LightConeMessageKey): LocalizedText => lightConeMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LightConeMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const lightConeSchema: BundleSchema = {
  id: LIGHT_CONE_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 퍼짐 · 판정 · 틀 바꾸기가 한 주기 안에 끝난다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        beta: BETA,
        pulseLife: PULSE_LIFE,
        aX: EVENT_A.x,
        aY: EVENT_A.y,
        aCt: EVENT_A.ct,
        bX: EVENT_B.x,
        bY: EVENT_B.y,
        bCt: EVENT_B.ct,
        cX: EVENT_C.x,
        cY: EVENT_C.y,
        cCt: EVENT_C.ct,
        dX: EVENT_D.x,
        dY: EVENT_D.y,
        dCt: EVENT_D.ct,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /**
   * 원뿔은 위아래로 길고 옆으로도 넓다. 세로가 비싸서(S-piece) 과거 원뿔을 짧게 두고
   * 400 px 에 담는다. 가로는 부스트 뒤 사건이 미끄러져 갈 자리까지 잡는다.
   */
  canvas: { height: 400, minHeight: 360 },

  /**
   * 겹침이 판정 장치다 — 과거 원뿔의 뒤쪽 테는 원뿔 면 뒤로, 사건 점은 원뿔 면 위로,
   * 빛의 고리는 단면 판 위로 와야 한다. 층 순서로는 `region` 이 점 · 선 위에 덮인다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 번쩍 → 빛이 퍼짐(사건이 차례로 일어남) → 원뿔 → 틀 바꾸기 → 바뀐 틀 →
   * 되돌리기 → 흐려짐. 사건이 일어나는 시각은 단계 경계가 아니라 사건의 ct 가 정한다
   * (단면이 그 높이를 지날 때).
   */
  timeline: {
    phases: [
      { id: 'emit', duration: 0.8, caption: key('caption.emit') },
      { id: 'spread', duration: 5.0, caption: key('caption.spread') },
      { id: 'hold', duration: 1.8, caption: key('caption.hold') },
      { id: 'boost', duration: 2.5, ease: 'smooth', caption: key('caption.boost') },
      { id: 'boosted', duration: 3.0, caption: key('caption.boosted') },
      { id: 'unboost', duration: 1.5, ease: 'smooth', caption: key('caption.unboost') },
      { id: 'fade', duration: 0.6, caption: key('caption.unboost') },
    ],
  },

  /** 도착한 순간 이미 빛이 퍼지는 중이다 — 단면이 조금 올라간 자리에서 연다. */
  startAt: 1.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 거리가 없고, 시점은 그림의 결정이다.

  messages: lightConeMessages,
};
