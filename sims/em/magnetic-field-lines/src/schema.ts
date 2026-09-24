// ========================================================================
// magnetic-field-lines — 선언
// ========================================================================
// 질문: 전기력선은 + 전하에서 나와 − 전하에서 끝난다. 자기력선도 N극에서 나와 S극에서
// 끝나는가.
//
// 끝나지 않는다. 선 하나를 따라가는 점이 바깥에서는 N극에서 나와 S극으로 휘어 들고,
// S극에서 멈추지 않고 **자석 속을 지나** N극으로 나와 제자리로 돌아온다. 시작도 끝도 없는
// 닫힌 고리다. 자석을 잘라 떼어 놓아도 잘린 면이 새 N극 · S극이 될 뿐, 반쪽 둘레의 선도
// 똑같이 자석 속을 지나 닫힌다 — 선이 끝날 자리(홀로 있는 극)는 생기지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:magnetic-field-lines` 와 문자 그대로 일치한다 (C4). */
export const MAGNETIC_FIELD_LINES_ID = 'magnetic-field-lines';

// ------------------------------------------------------------------------
// 물리 · 배치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 막대자석의 길이 · 폭(월드 단위). 세워 둔다 — N극이 위다. */
export const MAGNET_LENGTH = 2.2;
export const MAGNET_WIDTH = 0.46;
/** 잘라 떼어 놓았을 때 두 반쪽 사이의 틈(월드). */
export const CUT_GAP = 1;
/** 자석 위 · 아래 각각에 두는 선 수. 선 사이마다 지나는 자속이 같다. */
export const LINES_PER_SIDE = 6;
/**
 * 가장 바깥 선이 자석 가운데 높이에서 자석으로부터 떨어진 거리(월드). 이보다 바깥 선은 그림
 * 밖으로 돌아 나가 닫히는 것을 보일 수 없어 두지 않는다.
 */
export const OUTER_REACH = 3.0;
/** 온 자석에서 점이 따라가는 선 — 자석에 붙은 선부터 바깥으로 센 번호(0 부터). */
export const TRACED_LINE = 4;
/** 잘린 뒤 왼쪽 반쪽에서 점이 따라가는 선의 번호. 그 반쪽만 도는 선을 고른다. */
export const TRACED_LINE_CUT = 3;

/**
 * 프레이밍은 주장의 일부다 — 자석 둘레의 닫힌 선들과 그 아래 캡션 줄. 매 프레임 같은
 * 값이다 (원칙 6 · S-piece).
 */
export const SCENE_BOUNDS = { minX: -4.35, maxX: 4.35, minY: -2.4, maxY: 2.0 } as const;
/**
 * 선이 들어가야 하는 자리 — 자석 가운데에서 자석을 따라(`along`, 화면 세로) · 가로질러
 * (`across`, 화면 가로) 잰 반폭. 이 밖으로 나가는 선은 닫히는 것을 화면에서 보일 수 없어
 * 그리지 않는다. `SCENE_BOUNDS` 안에 든다.
 */
export const LINE_BOUNDS = { along: 1.95, across: 4.3 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 점이 N극에서 나와 바깥을 돌아 S극으로 드는 동안. */
export const OUTSIDE = 3.2;
/** 점이 자석 속을 S극에서 N극으로 지나 제자리로 돌아오는 동안. */
export const INSIDE = 1.6;
/** 닫힌 고리를 읽는 동안. */
export const CLOSED = 1.8;
/** 자름선이 그어지는 동안. */
export const CUT = 1;
/** 두 반쪽이 떨어지는 동안 — 잘린 면에 새 극 표식이 떠오른다. */
export const SPLIT = 1.6;
/** 왼쪽 반쪽 둘레에서 점이 바깥을 도는 동안. */
export const OUTSIDE_CUT = 2.4;
/** 점이 반쪽 자석 속을 지나 돌아오는 동안. */
export const INSIDE_CUT = 1.2;
/** 반쪽의 닫힌 고리를 읽는 동안. */
export const CLOSED_CUT = 1.8;
/** 두 반쪽이 다시 맞붙는 동안. */
export const REJOIN = 1.4;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const magneticFieldLinesMessages = Object.freeze({
  'label.title': {
    ko: '자기력선',
    en: 'Magnetic field lines',
    ja: '磁力線',
    zh: '磁感线',
    ar: 'خطوط المجال المغناطيسي',
    es: 'Líneas de campo magnético',
    fr: 'Lignes de champ magnétique',
    hi: 'चुंबकीय क्षेत्र रेखाएँ',
    id: 'Garis medan magnet',
    pt: 'Linhas de campo magnético',
  },
  'label.operation': {
    ko: '끊기지 않고 닫히는 선',
    en: 'Lines that never break and always close',
    ja: '途切れず、必ず閉じる線',
    zh: '永不中断、总是闭合的线',
    ar: 'خطوط لا تنقطع وتنغلق دائمًا',
    es: 'Líneas que nunca se cortan y siempre se cierran',
    fr: 'Des lignes qui ne se rompent jamais et se referment toujours',
    hi: 'रेखाएँ जो कभी टूटती नहीं और सदा बंद होती हैं',
    id: 'Garis yang tak pernah putus dan selalu tertutup',
    pt: 'Linhas que nunca se rompem e sempre se fecham',
  },
  'label.stage': {
    ko: '막대자석',
    en: 'Bar magnet',
    ja: '棒磁石',
    zh: '条形磁铁',
    ar: 'مغناطيس قضيبي',
    es: 'Imán de barra',
    fr: 'Aimant droit',
    hi: 'छड़ चुंबक',
    id: 'Magnet batang',
    pt: 'Ímã em barra',
  },
  'label.view': {
    ko: '자석 둘레',
    en: 'Around the magnet',
    ja: '磁石のまわり',
    zh: '磁铁周围',
    ar: 'حول المغناطيس',
    es: 'Alrededor del imán',
    fr: 'Autour de l’aimant',
    hi: 'चुंबक के चारों ओर',
    id: 'Di sekitar magnet',
    pt: 'Ao redor do ímã',
  },
  /** 자극 표식. 자석에 새겨진 글자라 번역하지 않는다 (C1 판정 1). */
  'label.north': { ko: 'N', en: 'N', ja: 'N', zh: 'N', ar: 'N', es: 'N', fr: 'N', hi: 'N', id: 'N', pt: 'N' },
  'label.south': { ko: 'S', en: 'S', ja: 'S', zh: 'S', ar: 'S', es: 'S', fr: 'S', hi: 'S', id: 'S', pt: 'S' },
  'caption.outside': {
    ko: '선을 따라가면 — 바깥에서는 N극에서 나와 S극으로 들어간다',
    en: 'Follow one line — outside, it leaves the N pole and curves into the S pole',
    ja: '一本の線をたどる — 外側では N 極から出て S 極へ曲がって入る',
    zh: '沿一条线看 — 在外部，它从 N 极出发，弯进 S 极',
    ar: 'تتبّع خطًا واحدًا — في الخارج يخرج من القطب N وينحني داخلًا إلى القطب S',
    es: 'Siguiendo una línea — por fuera, sale del polo N y se curva hasta entrar en el polo S',
    fr: 'On suit une ligne — à l’extérieur, elle quitte le pôle N et s’incurve jusqu’au pôle S',
    hi: 'एक रेखा के साथ चलते हुए — बाहर वह N ध्रुव से निकलकर मुड़ती हुई S ध्रुव में जाती है',
    id: 'Ikuti satu garis — di luar, garis keluar dari kutub N dan melengkung masuk ke kutub S',
    pt: 'Seguindo uma linha — por fora, ela sai do polo N e se curva até entrar no polo S',
  },
  'caption.inside': {
    ko: 'S극에서 끝나지 않고 자석 속을 지나 N극으로 간다',
    en: 'It does not end at S — it runs on through the magnet to N',
    ja: 'S で終わらない — 磁石の中を通って N へ進む',
    zh: '它并不止于 S — 而是穿过磁铁内部继续通向 N',
    ar: 'لا ينتهي عند S — بل يمتد عبر المغناطيس إلى N',
    es: 'No termina en S — sigue por dentro del imán hasta N',
    fr: 'Elle ne s’arrête pas en S — elle traverse l’aimant jusqu’à N',
    hi: 'यह S पर समाप्त नहीं होती — चुंबक के भीतर से होकर N तक जाती है',
    id: 'Garis tidak berakhir di S — ia terus menembus magnet menuju N',
    pt: 'Ela não termina em S — segue por dentro do ímã até N',
  },
  'caption.closed': {
    ko: '제자리로 돌아와 닫혔다 — 시작도 끝도 없는 고리',
    en: 'Back where it started — a closed loop with no beginning and no end',
    ja: '出発点に戻った — 始まりも終わりもない閉じた輪',
    zh: '回到了起点 — 一个无始无终的闭合环',
    ar: 'عاد إلى حيث بدأ — حلقة مغلقة بلا بداية ولا نهاية',
    es: 'De vuelta al punto de partida — un lazo cerrado sin principio ni fin',
    fr: 'Retour au point de départ — une boucle fermée, sans début ni fin',
    hi: 'जहाँ से चली थी वहीं लौट आई — बिना आरंभ और अंत वाला एक बंद लूप',
    id: 'Kembali ke titik awal — sebuah lingkar tertutup tanpa awal dan tanpa akhir',
    pt: 'De volta ao ponto de partida — um laço fechado, sem começo nem fim',
  },
  'caption.cut': {
    ko: '자석을 가운데에서 자른다',
    en: 'Cut the magnet through the middle',
    ja: '磁石を真ん中で切る',
    zh: '把磁铁从中间切开',
    ar: 'يُقطع المغناطيس من المنتصف',
    es: 'Se corta el imán por la mitad',
    fr: 'On coupe l’aimant en son milieu',
    hi: 'चुंबक को बीच से काटते हैं',
    id: 'Magnet dipotong di tengahnya',
    pt: 'O ímã é cortado ao meio',
  },
  'caption.split': {
    ko: '떼어 놓으면 잘린 면이 새 N극 · S극이 된다',
    en: 'Pulled apart, each cut face becomes a new N or S pole',
    ja: '引き離すと、切り口がそれぞれ新しい N 極または S 極になる',
    zh: '分开后，每个切面都成为新的 N 极或 S 极',
    ar: 'عند الفصل، يصبح كل وجه مقطوع قطبًا جديدًا N أو S',
    es: 'Al separarlas, cada cara cortada se vuelve un nuevo polo N o S',
    fr: 'Une fois les morceaux séparés, chaque face coupée devient un nouveau pôle N ou S',
    hi: 'अलग करने पर हर कटा हुआ सिरा नया N या S ध्रुव बन जाता है',
    id: 'Setelah dipisah, tiap permukaan potongan menjadi kutub N atau S yang baru',
    pt: 'Separadas, cada face cortada vira um novo polo N ou S',
  },
  'caption.outsideCut': {
    ko: '반쪽에서도 선은 새 N극에서 나와 S극으로 들어가고',
    en: 'On one piece, a line leaves its new N pole and curves into its S pole',
    ja: '片方でも、線は新しい N 極から出て S 極へ曲がって入る',
    zh: '在一半上，线也从新的 N 极出发，弯进它的 S 极',
    ar: 'على قطعة واحدة، يخرج الخط من قطبها N الجديد وينحني داخلًا إلى قطبها S',
    es: 'En una de las piezas, una línea sale de su nuevo polo N y se curva hasta su polo S',
    fr: 'Sur un morceau, une ligne quitte son nouveau pôle N et s’incurve jusqu’à son pôle S',
    hi: 'एक टुकड़े पर भी रेखा उसके नए N ध्रुव से निकलकर मुड़ती हुई उसके S ध्रुव में जाती है',
    id: 'Pada satu potongan, garis keluar dari kutub N barunya dan melengkung masuk ke kutub S-nya',
    pt: 'Em uma das peças, uma linha sai do novo polo N e se curva até o polo S',
  },
  'caption.insideCut': {
    ko: '자석 속을 지나 다시 N극으로 간다',
    en: 'then runs on through the piece back to N',
    ja: 'そのかけらの中を通って再び N へ戻る',
    zh: '然后穿过这一半回到 N',
    ar: 'ثم يمتد عبر القطعة عائدًا إلى N',
    es: 'y luego sigue por dentro de la pieza de vuelta a N',
    fr: 'puis traverse le morceau pour revenir à N',
    hi: 'फिर टुकड़े के भीतर से होकर वापस N तक जाती है',
    id: 'lalu terus menembus potongan itu kembali ke N',
    pt: 'e depois segue por dentro da peça de volta a N',
  },
  'caption.closedCut': {
    ko: '잘라도 선은 끊기지 않는다 — 반쪽 둘레에서도 닫힌다',
    en: 'Cutting does not break the lines — they close around each piece too',
    ja: '切っても線は途切れない — それぞれのかけらのまわりでも閉じる',
    zh: '切开并不会使线断开 — 它们在每一半周围也闭合',
    ar: 'القطع لا يقطع الخطوط — فهي تنغلق حول كل قطعة أيضًا',
    es: 'Cortar no rompe las líneas — también se cierran alrededor de cada pieza',
    fr: 'Couper ne rompt pas les lignes — elles se referment aussi autour de chaque morceau',
    hi: 'काटने से रेखाएँ नहीं टूटतीं — वे हर टुकड़े के चारों ओर भी बंद होती हैं',
    id: 'Memotong tidak memutus garis — garis juga tertutup di sekitar tiap potongan',
    pt: 'Cortar não rompe as linhas — elas também se fecham em volta de cada peça',
  },
  'caption.rejoin': {
    ko: '다시 맞붙이면 한 자석의 선으로 돌아간다',
    en: 'Put back together, the lines are those of one magnet again',
    ja: '再びくっつけると、一つの磁石の線に戻る',
    zh: '重新合在一起，又成为一块磁铁的磁感线',
    ar: 'عند إعادة الضم، تعود الخطوط خطوطَ مغناطيس واحد',
    es: 'Al volver a unirlas, las líneas son de nuevo las de un solo imán',
    fr: 'Une fois les morceaux recollés, les lignes redeviennent celles d’un seul aimant',
    hi: 'फिर से जोड़ने पर रेखाएँ दोबारा एक ही चुंबक की हो जाती हैं',
    id: 'Setelah disatukan kembali, garis-garis itu kembali menjadi milik satu magnet',
    pt: 'Juntadas de novo, as linhas voltam a ser as de um só ímã',
  },
} satisfies Record<string, LocalizedText>);

export type MagneticFieldLinesMessageKey = keyof typeof magneticFieldLinesMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MagneticFieldLinesMessageKey): LocalizedText => magneticFieldLinesMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MagneticFieldLinesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const magneticFieldLinesSchema: BundleSchema = {
  id: MAGNETIC_FIELD_LINES_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 점이 선을 따라 돌고, 자석이 잘리고, 다시 붙는다.
  parameters: [],

  stages: [
    {
      id: 'bar-magnet',
      label: text('label.stage'),
      constants: {
        magnetLength: MAGNET_LENGTH,
        magnetWidth: MAGNET_WIDTH,
        cutGap: CUT_GAP,
        linesPerSide: LINES_PER_SIDE,
        outerReach: OUTER_REACH,
        tracedLine: TRACED_LINE,
        tracedLineCut: TRACED_LINE_CUT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'around', label: text('label.view'), default: true }],

  /**
   * 가로로 누운 막대 둘레의 고리는 양옆으로 퍼진다. 세로를 더 주면 가로가 먼저 차서 그림만
   * 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 384, minHeight: 340 },

  /**
   * 한 주기 = 온 자석에서 한 바퀴 → 자르고 떼기 → 반쪽에서 한 바퀴 → 다시 붙기.
   *
   * 점의 자리는 `outside` · `inside` 진행도가 정한다 — 바깥 몫과 자석 속 몫을 코드로 나누지
   * 않는다. 틈은 `split` 진행도로 벌어지고 `rejoin` 진행도로 닫힌다.
   */
  timeline: {
    phases: [
      { id: 'outside', duration: OUTSIDE, caption: key('caption.outside') },
      { id: 'inside', duration: INSIDE, caption: key('caption.inside') },
      { id: 'closed', duration: CLOSED, caption: key('caption.closed') },
      { id: 'cut', duration: CUT, ease: 'smooth', caption: key('caption.cut') },
      { id: 'split', duration: SPLIT, ease: 'smooth', caption: key('caption.split') },
      { id: 'outsideCut', duration: OUTSIDE_CUT, caption: key('caption.outsideCut') },
      { id: 'insideCut', duration: INSIDE_CUT, caption: key('caption.insideCut') },
      { id: 'closedCut', duration: CLOSED_CUT, caption: key('caption.closedCut') },
      { id: 'rejoin', duration: REJOIN, ease: 'smooth', caption: key('caption.rejoin') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 점이 N극을 막 떠나 바깥을 돌고 있는 자리에서 연다.
   */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리는 순서가 판정 장치다 — 자석 면 → 선 → 자석 윤곽 · 표식 → 따라가는 선 · 점.
   * 자석 속을 지나는 선이 자석 면에 가려지면 「자석 속을 지난다」 가 안 보인다.
   */
  drawOrder: 'scene',

  // 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 선의 이어짐이다.

  messages: magneticFieldLinesMessages,
};
