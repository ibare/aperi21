// ========================================================================
// youngs-double-slit — 선언
// ========================================================================
// 질문: 슬릿을 하나 더 열어 빛을 보탰는데, 왜 스크린 어떤 줄은 더 어두워지나?
//
// 동사: 꺼진다 — 두 번째 물결이 스크린에 닿은 곳부터 줄이 슬릿 하나일 때보다 어두워진다.
// 원본: tasks/piece-lab/youngs-double-slit.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:youngs-double-slit` 와 문자 그대로 일치한다 (C4). */
export const YOUNGS_DOUBLE_SLIT_ID = 'youngs-double-slit';

// ------------------------------------------------------------------------
// 배치 · 파동 상수 — 원본 index.html 의 값 그대로 (단위 = 원본 논리 px, 월드 y 는 위)
// ------------------------------------------------------------------------

/** 원본 캔버스 논리 크기. 월드 좌표는 원본 px 에서 y 만 뒤집는다(월드 y = H − 원본 y). */
export const W = 820;
export const H = 340;
/** 가림벽 중심 · 두께. */
export const BARRIER_X = 90;
export const BARRIER_T = 6;
/** 스크린 왼쪽 가장자리 · 폭. */
export const SCREEN_X = 540;
export const SCREEN_W = 16;
/** 밝기 곡선의 0 자리와, 최대 세기일 때 곡선이 가는 폭. */
export const PROFILE_X0 = 574;
export const PROFILE_SPAN = 220;
/** 두 슬릿 중심 사이 · 슬릿 폭. */
export const SLIT_GAP = 110;
export const SLIT_W = 12;

/** 파장(px) · 전파 속력(px/s) · 물결 앞머리가 부드럽게 켜지는 폭(px). */
export const LAMBDA = 16;
export const C = 100;
export const FRONT_W = 28;

/** 물결장 격자 한 칸(px). */
export const CELL = 2;

/** 꺼진 줄 판정 — 두 슬릿일 때 극소이면서 슬릿 하나일 때의 이 비율 미만. */
export const DARK_RATIO = 0.3;
/** 도착 판정 — 두 번째 물결이 스크린에 닿은 정도의 최댓값이 이 값 이상이면 「닿기 시작」, 최솟값이 ARRIVED 이상이면 「전체에 닿음」. */
export const ARRIVE_ANY = 0.02;
export const ARRIVED = 0.98;

/** 캡션 · 단추 줄(화면 px). 원본에서 캔버스 아래 한 줄이던 것. */
export const BOTTOM_BAND_PX = 44;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const youngsDoubleSlitMessages = Object.freeze({
  'label.title': {
    ko: '이중 슬릿 간섭',
    en: "Young's double slit",
    ja: 'ヤングの二重スリット',
    zh: '杨氏双缝',
    ar: 'الشق المزدوج ليونغ',
    es: 'Doble rendija de Young',
    fr: 'Fentes de Young',
    hi: 'यंग की द्वि-झिरी',
    id: 'Celah ganda Young',
    pt: 'Fenda dupla de Young',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '빛의 파동성 증거',
    en: 'Evidence that light is a wave',
    ja: '光が波である証拠',
    zh: '光是波的证据',
    ar: 'دليل على أن الضوء موجة',
    es: 'Prueba de que la luz es una onda',
    fr: 'La preuve que la lumière est une onde',
    hi: 'इस बात का प्रमाण कि प्रकाश एक तरंग है',
    id: 'Bukti bahwa cahaya adalah gelombang',
    pt: 'Prova de que a luz é uma onda',
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
  'label.ghost': {
    ko: '슬릿 하나일 때',
    en: 'one slit',
    ja: 'スリット一つ',
    zh: '单缝时',
    ar: 'شق واحد',
    es: 'una rendija',
    fr: 'une fente',
    hi: 'एक झिरी',
    id: 'satu celah',
    pt: 'uma fenda',
  },
  'control.open': {
    ko: '아래 슬릿 열기',
    en: 'Open lower slit',
    ja: '下のスリットを開く',
    zh: '打开下方狭缝',
    ar: 'افتح الشق السفلي',
    es: 'Abrir la rendija inferior',
    fr: 'Ouvrir la fente du bas',
    hi: 'नीचे की झिरी खोलें',
    id: 'Buka celah bawah',
    pt: 'Abrir a fenda de baixo',
  },
  'control.close': {
    ko: '아래 슬릿 닫기',
    en: 'Close lower slit',
    ja: '下のスリットを閉じる',
    zh: '关闭下方狭缝',
    ar: 'أغلق الشق السفلي',
    es: 'Cerrar la rendija inferior',
    fr: 'Fermer la fente du bas',
    hi: 'नीचे की झिरी बंद करें',
    id: 'Tutup celah bawah',
    pt: 'Fechar a fenda de baixo',
  },
  'caption.single': {
    ko: '위 슬릿 하나로 들어온 빛 — 스크린이 줄 없이 고르게 밝다.',
    en: 'Light through the upper slit alone — the screen is evenly lit, with no stripes.',
    ja: '上のスリットだけを通った光 — スクリーンは縞がなく一様に明るい。',
    zh: '只通过上方狭缝的光 — 光屏均匀明亮，没有条纹。',
    ar: 'ضوء يمر عبر الشق العلوي وحده — الشاشة مضاءة بالتساوي بلا أي أهداب.',
    es: 'Luz que pasa solo por la rendija superior — la pantalla está iluminada de manera uniforme, sin franjas.',
    fr: 'De la lumière par la seule fente du haut — l’écran est éclairé uniformément, sans franges.',
    hi: 'केवल ऊपर की झिरी से आया प्रकाश — पर्दा बिना धारियों के एकसमान रूप से प्रकाशित है।',
    id: 'Cahaya hanya melalui celah atas — layar terang merata, tanpa pita.',
    pt: 'Luz passando só pela fenda de cima — a tela fica iluminada por igual, sem franjas.',
  },
  'caption.traveling': {
    ko: '아래 슬릿도 열었다 — 두 번째 물결이 스크린 쪽으로 퍼져 간다.',
    en: 'The lower slit is open too — a second wave spreads toward the screen.',
    ja: '下のスリットも開いた — 二つ目の波がスクリーンへ広がっていく。',
    zh: '下方狭缝也打开了 — 第二列波向光屏扩散开去。',
    ar: 'فُتح الشق السفلي أيضًا — تنتشر موجة ثانية نحو الشاشة.',
    es: 'La rendija inferior también está abierta — una segunda onda se propaga hacia la pantalla.',
    fr: 'La fente du bas est ouverte elle aussi — une seconde onde se propage vers l’écran.',
    hi: 'नीचे की झिरी भी खुल गई — एक दूसरी तरंग पर्दे की ओर फैलती है।',
    id: 'Celah bawah juga terbuka — gelombang kedua menyebar ke arah layar.',
    pt: 'A fenda de baixo também está aberta — uma segunda onda se espalha em direção à tela.',
  },
  'caption.arriving': {
    ko: '두 번째 물결이 닿은 곳부터 스크린에 어두운 줄이 생긴다.',
    en: 'Wherever the second wave reaches, dark stripes appear on the screen.',
    ja: '二つ目の波が届いたところから、スクリーンに暗い縞が現れる。',
    zh: '第二列波到达之处，光屏上就出现暗条纹。',
    ar: 'حيثما تصل الموجة الثانية تظهر أهداب مظلمة على الشاشة.',
    es: 'Allí donde llega la segunda onda, aparecen franjas oscuras en la pantalla.',
    fr: 'Partout où la seconde onde arrive, des franges sombres apparaissent sur l’écran.',
    hi: 'जहाँ-जहाँ दूसरी तरंग पहुँचती है, वहाँ पर्दे पर काली धारियाँ बन जाती हैं।',
    id: 'Di mana pun gelombang kedua tiba, muncul pita gelap pada layar.',
    pt: 'Onde quer que a segunda onda chegue, aparecem franjas escuras na tela.',
  },
  'caption.dark': {
    ko: '빛을 하나 더 보탰는데, 표시한 줄은 슬릿 하나일 때보다 오히려 꺼졌다.',
    en: 'We added more light, yet the marked stripes went darker than with one slit.',
    ja: '光を足したのに、印をつけた縞はスリット一つのときより暗くなった。',
    zh: '我们加进了更多的光，标出的条纹却比单缝时更暗了。',
    ar: 'أضفنا مزيدًا من الضوء، ومع ذلك صارت الأهداب المعلَّمة أظلم مما كانت مع شق واحد.',
    es: 'Añadimos más luz y, aun así, las franjas marcadas quedaron más oscuras que con una sola rendija.',
    fr: 'Nous avons ajouté de la lumière, et pourtant les franges marquées sont devenues plus sombres qu’avec une seule fente.',
    hi: 'हमने और प्रकाश जोड़ा, फिर भी चिह्नित धारियाँ एक झिरी की तुलना में और गहरी हो गईं।',
    id: 'Kita menambah cahaya, tetapi pita yang ditandai justru lebih gelap daripada dengan satu celah.',
    pt: 'Acrescentamos mais luz, mas as franjas marcadas ficaram mais escuras do que com uma fenda só.',
  },
  'caption.leaving': {
    ko: '아래 슬릿을 닫았다 — 남은 물결이 스크린을 지나가면 줄이 사라진다.',
    en: 'The lower slit is closed — once the remaining wave passes the screen, the stripes vanish.',
    ja: '下のスリットを閉じた — 残った波がスクリーンを通り過ぎると縞は消える。',
    zh: '下方狭缝关闭了 — 剩下的波经过光屏后，条纹就消失了。',
    ar: 'أُغلق الشق السفلي — ما إن تعبر الموجة المتبقية الشاشة حتى تختفي الأهداب.',
    es: 'La rendija inferior está cerrada — en cuanto la onda restante pasa la pantalla, las franjas desaparecen.',
    fr: 'La fente du bas est fermée — dès que l’onde restante a passé l’écran, les franges disparaissent.',
    hi: 'नीचे की झिरी बंद हो गई — बची हुई तरंग के पर्दे से गुज़रते ही धारियाँ गायब हो जाती हैं।',
    id: 'Celah bawah ditutup — begitu gelombang yang tersisa melewati layar, pita-pita itu lenyap.',
    pt: 'A fenda de baixo está fechada — assim que a onda restante passa pela tela, as franjas somem.',
  },
} satisfies Record<string, LocalizedText>);

export type YoungsDoubleSlitMessageKey = keyof typeof youngsDoubleSlitMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: YoungsDoubleSlitMessageKey): LocalizedText => youngsDoubleSlitMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: YoungsDoubleSlitMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const youngsDoubleSlitSchema: BundleSchema = {
  id: YOUNGS_DOUBLE_SLIT_ID,
  label: text('label.title'),
  category: 'optics',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본은 폭 약 868 px 에 캔버스 340 × 1.06 배 + 캡션 줄로 선다. 임베드 폭 약 850 px 에서 원본 배율 가까이
   * 그림이 폭을 채우는 높이다. 마운트 뒤 바뀌지 않는다.
   */
  canvas: { height: 440, minHeight: 320 },

  /** 겹침은 원본 그리기 순서 — 물결장 · 가림벽 · 가림판 · 스크린 · 비교 곡선 · 지금 곡선 · 꺼진 줄 눈금. */
  drawOrder: 'scene',

  /**
   * 18 초 주기 — 1 초에 아래 슬릿을 열고(`open` 시작) 11 초에 닫는다(`shut` 시작). 원본 `AUTO_OPEN` ·
   * `AUTO_CLOSE` · `PERIOD` 그대로다. 도착 순간은 원본처럼 주기 첫머리 — 위 슬릿 물결은 시각의 함수라 이미 흐른다.
   *
   * `open` · `shut` 동안의 캡션은 시각이 아니라 **두 번째 물결이 스크린에 닿은 정도**로 갈린다(원본 `stateOf`).
   * 그래서 단계 캡션을 두지 않고 캡션 슬롯의 `cases` 가 고른다 (NOTES 「어휘 부족」).
   */
  timeline: {
    phases: [
      { id: 'lead', duration: 1, caption: key('caption.single') },
      { id: 'open', duration: 10 },
      { id: 'shut', duration: 7 },
    ],
  },

  caption: {
    anchor: { screen: 'bottom-left', offset: [0, -8] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 640,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.single'),
    cases: [
      { when: 'capTraveling', text: key('caption.traveling') },
      { when: 'capArriving', text: key('caption.arriving') },
      { when: 'capDark', text: key('caption.dark') },
      { when: 'capLeaving', text: key('caption.leaving') },
      { when: 'capSingle', text: key('caption.single') },
    ],
  },

  // 그리드 · 카메라 버튼 없음 (기본). 원본에 없다.

  messages: youngsDoubleSlitMessages,
};
