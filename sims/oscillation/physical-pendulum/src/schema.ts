// ========================================================================
// physical-pendulum — 선언
// ========================================================================
// 질문: 크기가 있는 물체를 매달면, 매단 자리가 주기를 어떻게 바꾸는가?
//
// 답: 같은 막대라도 매단 자리를 끝에서 중심 쪽으로 옮기면 처음엔 빨라진다. 그러나
// 너무 가까이 옮기면 다시 느려진다 — 가장 빠른 자리가 그 사이(질량 중심에서 L/√12)
// 에 있다. 끝에서 L/2 떨어진 자리와 L/6 떨어진 자리는 주기가 똑같다.
//
// 화면에서는 같은 막대 넷을 같은 높이의 핀에, 매단 자리만 달리해 걸고 같은 각에서
// 함께 놓는다. 둘째가 앞서 나가고, 넷째는 한참 뒤처지고, 셋째는 첫째와 발을 맞춘다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:physical-pendulum` 와 문자 그대로 일치한다 (C4). */
export const PHYSICAL_PENDULUM_ID = 'physical-pendulum';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 막대 길이 L(m). 네 막대가 같다. 월드 1 단위 = 1 m. */
export const ROD_LENGTH = 1;
/** 중력 가속도(m/s²). */
export const GRAVITY = 9.8;
/** 놓는 각(도). 네 막대가 같다. 작은 각이라 조화 진동으로 본다. */
export const RELEASE_DEG = 20;
/**
 * 매단 자리 — 핀에서 질량 중심까지의 거리 d 를 L 에 대한 비로, 왼쪽부터.
 *
 * - 0.5    끝에 매단다.
 * - 0.2887 L/√12 — 주기가 가장 짧은 자리.
 * - 1/6    끝과 주기가 같은 짝 자리(d · d′ = L²/12).
 * - 0.05   중심 가까이. 한참 느리다.
 *
 * 스테이지 상수는 수 하나씩이라 목록을 둘 수 없어 `pivot1`~`pivot4` 로 흩는다 (장부 G105).
 */
export const PIVOT_RATIOS = [0.5, 1 / Math.sqrt(12), 1 / 6, 0.05] as const;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m.
// ------------------------------------------------------------------------

/** 네 핀의 x. 같은 간격 — 거리는 재는 대상이 아니다. */
export const COLUMN_X = [-1.875, -0.625, 0.625, 1.875] as const;
/** 네 핀의 높이. 모두 같다 — 다른 것은 막대의 어느 자리를 걸었느냐뿐이다. */
export const PIVOT_Y = 0;
/** 막대 두께(m). */
export const ROD_WIDTH = 0.085;
/** 흔든 횟수 점 줄의 높이(월드 y). 가장 긴 매달림(끝)의 아래 끝보다 아래. */
export const COUNT_Y = -1.24;
/** 점 사이 간격(m). */
export const COUNT_GAP = 0.075;
/** 매단 자리 이름표의 높이(월드 y). */
export const LABEL_Y = -1.44;

/**
 * 프레이밍 — 가장 위로 솟는 막대 윗끝(약 0.45 m) · 끝에 매단 막대 아래 끝(−1 m) ·
 * 점 줄 · 이름표, 아래쪽은 캡션 두 줄 자리까지. 매 프레임 같은 값이다 (S-piece).
 */
export const SCENE_BOUNDS = { minX: -2.4, maxX: 2.4, minY: -1.86, maxY: 0.58 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const physicalPendulumMessages = Object.freeze({
  'label.title': {
    ko: '물리 진자',
    en: 'Physical pendulum',
    ja: '実体振り子',
    zh: '复摆',
    ar: 'البندول الفيزيائي',
    es: 'Péndulo físico',
    fr: 'Pendule pesant',
    hi: 'भौतिक लोलक',
    id: 'Bandul fisis',
    pt: 'Pêndulo físico',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '크기가 있는 물체의 진동',
    en: 'Oscillation of an extended body',
    ja: '大きさのある物体の振動',
    zh: '有一定大小的物体的振动',
    ar: 'تذبذب جسم ممتد',
    es: 'Oscilación de un cuerpo extenso',
    fr: 'Oscillation d’un corps étendu',
    hi: 'विस्तारित पिंड का दोलन',
    id: 'Osilasi benda berukuran',
    pt: 'Oscilação de um corpo extenso',
  },
  'label.stage': {
    ko: '같은 막대 넷',
    en: 'Four identical rods',
    ja: '同じ棒四本',
    zh: '四根相同的杆',
    ar: 'أربعة قضبان متماثلة',
    es: 'Cuatro varillas idénticas',
    fr: 'Quatre tiges identiques',
    hi: 'चार एक जैसी छड़ें',
    id: 'Empat batang identik',
    pt: 'Quatro hastes idênticas',
  },
  'label.view': {
    ko: '나란히',
    en: 'Side by side',
    ja: '並べて',
    zh: '并排',
    ar: 'جنبًا إلى جنب',
    es: 'Lado a lado',
    fr: 'Côte à côte',
    hi: 'साथ-साथ',
    id: 'Berdampingan',
    pt: 'Lado a lado',
  },

  /**
   * 매단 자리 이름표 — 막대마다 하나. 값을 코드가 반올림하지 않도록 선언값의 분수 꼴을
   * 문안으로 둔다 (S-piece 「유효숫자를 자동으로 줄이지 않는다」). 매단 자리를 바꾸면 함께 고친다.
   */
  'label.d1': {
    ko: 'd = L/2',
    en: 'd = L/2',
    ja: 'd = L/2',
    zh: 'd = L/2',
    ar: 'd = L/2',
    es: 'd = L/2',
    fr: 'd = L/2',
    hi: 'd = L/2',
    id: 'd = L/2',
    pt: 'd = L/2',
  },
  'label.d2': {
    ko: 'd = L/√12',
    en: 'd = L/√12',
    ja: 'd = L/√12',
    zh: 'd = L/√12',
    ar: 'd = L/√12',
    es: 'd = L/√12',
    fr: 'd = L/√12',
    hi: 'd = L/√12',
    id: 'd = L/√12',
    pt: 'd = L/√12',
  },
  'label.d3': {
    ko: 'd = L/6',
    en: 'd = L/6',
    ja: 'd = L/6',
    zh: 'd = L/6',
    ar: 'd = L/6',
    es: 'd = L/6',
    fr: 'd = L/6',
    hi: 'd = L/6',
    id: 'd = L/6',
    pt: 'd = L/6',
  },
  'label.d4': {
    ko: 'd = L/20',
    en: 'd = L/20',
    ja: 'd = L/20',
    zh: 'd = L/20',
    ar: 'd = L/20',
    es: 'd = L/20',
    fr: 'd = L/20',
    hi: 'd = L/20',
    id: 'd = L/20',
    pt: 'd = L/20',
  },

  'caption.together': {
    ko: '같은 막대 넷을 같은 각에서 함께 놓았다. 다른 것은 매단 자리뿐이다 — 오른쪽으로 갈수록 질량 중심 가까이 매달았다.',
    en: 'Four identical rods, released together from the same angle. Only the pivot differs — further right, it sits closer to the centre of mass.',
    ja: '同じ棒四本を、同じ角度からいっしょに放した。違うのは支点の位置だけ — 右へ行くほど重心の近くにある。',
    zh: '四根相同的杆从同一角度同时释放。唯一不同的是支点 — 越往右，支点越靠近质心。',
    ar: 'أربعة قضبان متماثلة أُفلتت معًا من الزاوية نفسها. لا يختلف سوى محور التعليق — كلما اتجهنا يمينًا اقترب من مركز الكتلة.',
    es: 'Cuatro varillas idénticas, soltadas a la vez desde el mismo ángulo. Solo cambia el pivote — cuanto más a la derecha, más cerca queda del centro de masa.',
    fr: 'Quatre tiges identiques, lâchées ensemble depuis le même angle. Seul le pivot diffère — plus on va à droite, plus il est proche du centre de masse.',
    hi: 'चार एक जैसी छड़ें, एक ही कोण से एक साथ छोड़ी गईं। अंतर केवल धुरी का है — दाईं ओर बढ़ने पर वह द्रव्यमान केंद्र के और पास होती है।',
    id: 'Empat batang identik, dilepas bersamaan dari sudut yang sama. Hanya porosnya yang berbeda — makin ke kanan, makin dekat ke pusat massa.',
    pt: 'Quatro hastes idênticas, soltas juntas do mesmo ângulo. Só o pivô muda — quanto mais à direita, mais perto ele fica do centro de massa.',
  },
  'caption.drift': {
    ko: '끝에서 중심 쪽으로 옮긴 둘째가 앞서 나간다 — 더 빨리 흔들린다. 중심 가까이 매단 넷째는 한참 뒤처진다.',
    en: 'The second rod, pivoted a little in from the end, pulls ahead — it swings faster. The fourth, pivoted near the centre, falls far behind.',
    ja: '端から少し内側に支点を移した二本目が先に出る — より速く揺れる。重心の近くに支点を置いた四本目は大きく遅れる。',
    zh: '支点从端点稍向内移的第二根杆领先了 — 它摆得更快。支点靠近中心的第四根则远远落后。',
    ar: 'القضيب الثاني، المعلّق من نقطة أبعد قليلًا عن الطرف، يتقدّم — إنه يتأرجح أسرع. أما الرابع، المعلّق قرب المركز، فيتأخر كثيرًا.',
    es: 'La segunda varilla, con el pivote un poco hacia dentro desde el extremo, se adelanta — oscila más rápido. La cuarta, con el pivote cerca del centro, se queda muy atrás.',
    fr: 'La deuxième tige, suspendue un peu en retrait de l’extrémité, prend de l’avance — elle oscille plus vite. La quatrième, suspendue près du centre, prend beaucoup de retard.',
    hi: 'दूसरी छड़, जिसकी धुरी सिरे से थोड़ा भीतर है, आगे निकल जाती है — वह तेज़ झूलती है। केंद्र के पास धुरी वाली चौथी छड़ बहुत पीछे छूट जाती है।',
    id: 'Batang kedua, yang porosnya sedikit ke dalam dari ujung, melaju di depan — ia berayun lebih cepat. Batang keempat, yang porosnya dekat pusat, jauh tertinggal.',
    pt: 'A segunda haste, com o pivô um pouco para dentro da ponta, sai na frente — oscila mais rápido. A quarta, com o pivô perto do centro, fica bem para trás.',
  },
  'caption.pair': {
    ko: '셋째는 둘째보다 더 옮겼는데 다시 느려져, 끝에 매단 첫째와 발을 맞춘다. 가장 빠른 자리는 그 사이에 있다.',
    en: 'The third, moved in further still, has slowed again and keeps step with the first, hung from its end. The fastest pivot lies in between.',
    ja: '三本目は二本目よりさらに内側に移したのに、また遅くなり、端に支点を置いた一本目と足並みをそろえる。最も速い支点の位置はその間にある。',
    zh: '第三根的支点移得更靠内，却又慢了下来，与支点在端点的第一根步调一致。最快的支点位置在两者之间。',
    ar: 'الثالث، الذي نُقل إلى الداخل أكثر، تباطأ من جديد وصار يساير الأول المعلّق من طرفه. أسرع نقطة تعليق تقع بينهما.',
    es: 'La tercera, movida aún más hacia dentro, ha vuelto a frenarse y va al paso de la primera, colgada de su extremo. El pivote más rápido está en medio.',
    fr: 'La troisième, déplacée encore plus vers l’intérieur, a de nouveau ralenti et marche au pas de la première, suspendue par son extrémité. Le pivot le plus rapide se trouve entre les deux.',
    hi: 'तीसरी, जिसे और भीतर खिसकाया गया, फिर से धीमी हो गई है और सिरे से लटकी पहली छड़ के साथ कदम मिलाती है। सबसे तेज़ धुरी इन दोनों के बीच कहीं है।',
    id: 'Batang ketiga, yang digeser lebih ke dalam lagi, kembali melambat dan seirama dengan batang pertama yang digantung dari ujungnya. Poros tercepat ada di antara keduanya.',
    pt: 'A terceira, deslocada ainda mais para dentro, voltou a ficar lenta e acompanha o passo da primeira, pendurada pela ponta. O pivô mais rápido fica entre as duas.',
  },
} satisfies Record<string, LocalizedText>);

export type PhysicalPendulumMessageKey = keyof typeof physicalPendulumMessages;

/** 막대 순서대로의 매단 자리 이름표 키. 막대 수가 바뀌면 여기서 타입이 막는다. */
export const D_LABELS: readonly PhysicalPendulumMessageKey[] = ['label.d1', 'label.d2', 'label.d3', 'label.d4'];

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PhysicalPendulumMessageKey): LocalizedText => physicalPendulumMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PhysicalPendulumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const physicalPendulumSchema: BundleSchema = {
  id: PHYSICAL_PENDULUM_ID,
  label: text('label.title'),
  category: 'oscillation',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'four-rods',
      label: text('label.stage'),
      constants: {
        rodLength: ROD_LENGTH,
        g: GRAVITY,
        releaseDeg: RELEASE_DEG,
        pivot1: PIVOT_RATIOS[0],
        pivot2: PIVOT_RATIOS[1],
        pivot3: PIVOT_RATIOS[2],
        pivot4: PIVOT_RATIOS[3],
      },
    },
  ],
  environments: [],
  views: [{ id: 'side-by-side', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 막대 넷이 한 줄에 선다. 세로는 끝에 매단 막대 길이가 정한다. */
  canvas: { height: 380, minHeight: 340 },

  /** 쓴 순서대로 겹친다 — 막대 위에 d 선분 · 질량 중심 · 핀을 얹는다. */
  drawOrder: 'scene',

  /** 도착한 순간 이미 넷이 흔들리고 있다 — 놓은 지 0.3 초, 아직 나란하다 (S-piece). */
  startAt: 0.9,

  /**
   * 한 주기 14.4 초. 놓은 뒤로 흔들림은 끊기지 않는다 — 단계는 캡션이 무엇을 가리키는지만 바꾼다.
   *
   * - `hold` — 넷을 같은 각에 붙잡고 있다. 놓는 순간이 같다는 것을 먼저 보인다.
   * - `together` — 함께 놓은 직후. 아직 거의 나란하다.
   * - `drift` — 둘째가 앞서고 넷째가 뒤처진다.
   * - `pair` — 둘째와 첫째가 반 박자 어긋났고, 셋째는 여전히 첫째와 같은 박자다.
   * - `fade` — 옅어지며 물러난다. 다음 주기에 다시 같은 각에서 놓는다.
   */
  timeline: {
    phases: [
      { id: 'hold', duration: 0.6, caption: key('caption.together') },
      { id: 'together', duration: 4, caption: key('caption.together') },
      { id: 'drift', duration: 5, caption: key('caption.drift') },
      { id: 'pair', duration: 4, caption: key('caption.pair') },
      { id: 'fade', duration: 0.8, caption: key('caption.pair') },
    ],
  },

  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 재는 것은 박자이지 거리가 아니다 (S-piece).

  messages: physicalPendulumMessages,
};
