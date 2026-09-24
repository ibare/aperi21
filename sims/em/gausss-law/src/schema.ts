// ========================================================================
// gausss-law — 선언
// ========================================================================
// 질문: 전하를 감싼 닫힌 면을 어떤 모양 · 크기로 잡아도 뚫고 나가는 전기력선의 수는
// 같은가. 전하가 면 밖에 있으면 어떻게 되는가.
//
// 점전하 둘레의 전기력선 N 가닥 위에 닫힌 곡선(면의 2D 단면)을 하나 놓고, 곡선을 따라
// 한 바퀴 돌며 선이 곡선을 뚫는 자리마다 센다 — 나가면 하나 더하고, 들어오면 하나 뺀다.
// 작은 원 · 접힌 고리 · 큰 원을 차례로 세면 오른쪽 점 기둥이 늘 같은 N 에 닿고, 전하를
// 감싸지 않은 고리는 올랐던 기둥이 0 으로 돌아온다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:gausss-law` 와 문자 그대로 일치한다 (C4). */
export const GAUSSS_LAW_ID = 'gausss-law';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 전하량(임의 단위 q, 양수). 선 가닥 수 = 전하량 × 단위 전하당 가닥 수. */
export const CHARGE = 1;
/** 전하 q 하나에서 나가는 전기력선 가닥 수. 선의 수가 전하에 비례한다는 약속이다. */
export const LINES_PER_CHARGE = 8;
/** 첫 가닥의 방위각(도). 가닥이 곡선의 이음매(맨 아래)를 스치지 않게 비켜 둔다. */
export const LINE_OFFSET_DEG = 22.5;
/** 전기력선이 뻗는 길이(월드) — 가장 큰 고리 밖까지 닿는다. */
export const FIELD_REACH = 2.7;
/** 곡선을 세기 시작하는 매개 각(도). −90° 는 곡선의 맨 아래다. */
export const START_ANGLE_DEG = -90;

/**
 * 닫힌 곡선 넷은 한 가족이다 — 매개 s 에서
 *   ρ = 1 + wave · cos(lobes · s + phase),  φ = s + swirl · sin(lobes · s)
 *   자리 = 중심 + (rx · ρ cos φ, ry · ρ sin φ)
 * `swirl · lobes` 가 1 을 넘으면 곡선이 방위각을 거슬러 접혀, 전하에서 뻗은 한 선이 곡선을
 * 세 번(나감 · 들어옴 · 나감) 뚫는다. 위상 90° 는 거슬러 가는 동안 반지름이 함께 바뀌게 해
 * 곡선이 제 몸과 엇갈리는 매듭 대신 갈고리 모양으로 접히게 한다 — 매듭이 있으면 닫힌 면의
 * 단면이 아니다. 모양 사이를 넘어갈 때는 이 수들을 그대로 섞는다.
 */
/** 작은 원 — 전하를 중심으로 한 반지름. */
export const SMALL_RADIUS = 0.95;
/** 접힌 고리 — 중심 · 가로 · 세로 반지름 · 굽이 깊이 · 휘감김 · 굽이 수 · 굽이 위상(도). */
export const FOLD_X = 0;
export const FOLD_Y = 0.3;
export const FOLD_RX = 1.7;
export const FOLD_RY = 1.5;
export const FOLD_WAVE = 0.5;
export const FOLD_SWIRL = 1.05;
export const FOLD_LOBES = 3;
export const FOLD_PHASE_DEG = 90;
/** 큰 원 — 전하를 중심으로 한 반지름. */
export const BIG_RADIUS = 2.3;
/** 전하 밖 고리 — 전하 오른쪽에 선 타원. 전하를 감싸지 않는다. */
export const OUTSIDE_X = 1.55;
export const OUTSIDE_Y = 0;
export const OUTSIDE_RX = 0.55;
export const OUTSIDE_RY = 1.05;

// ------------------------------------------------------------------------
// 배치 — 월드. 전하가 원점이다.
// ------------------------------------------------------------------------

/** 점 기둥 넷의 첫 가운데 · 사이. 고리 순서(작은 원 · 접힌 · 큰 원 · 밖)대로 놓인다. */
export const COLUMN_FIRST_X = 3.75;
export const COLUMN_GAP = 0.72;
/** 기둥 바닥(셈 0)의 높이와 기둥이 쓸 수 있는 가장 큰 높이 · 점 사이 간격의 상한. */
export const COLUMN_BASE_Y = -2.05;
export const COLUMN_HEIGHT = 4.5;
export const DOT_PITCH = 0.42;
/** 기둥 아래 작은 고리 그림의 가운데 높이와 축척. 어느 기둥이 어느 고리인지 글자 없이 잇는다. */
export const MINI_Y = -2.55;
export const MINI_SCALE = 0.12;

/**
 * 프레이밍은 주장의 일부다. 가로는 전기력선 왼끝(−2.7)부터 넷째 기둥과 기준선 끝까지,
 * 세로는 기둥 아래 작은 그림 · 캡션 줄부터 전기력선 위끝까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -2.85, maxX: 6.45, minY: -3.2, maxY: 2.8 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 곡선 하나를 한 바퀴 돌며 세는 동안. 긴 곡선일수록 조금 더 준다 — 도는 빠르기가 비슷하게. */
export const COUNT_SMALL = 4.5;
export const COUNT_FOLD = 7;
export const COUNT_BIG = 6.5;
export const COUNT_OUTSIDE = 4.5;
/** 다 센 기둥을 읽는 동안 · 곡선이 다음 모양으로 바뀌는 동안. */
export const READ = 2.2;
export const MORPH = 1.6;
/** 네 기둥을 나란히 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const HOLD = 3.4;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const gausssLawMessages = Object.freeze({
  'label.title': {
    ko: '가우스 법칙',
    en: 'Gauss’s law',
    ja: 'ガウスの法則',
    zh: '高斯定律',
    ar: 'قانون غاوس',
    es: 'Ley de Gauss',
    fr: 'Théorème de Gauss',
    hi: 'गाउस का नियम',
    id: 'Hukum Gauss',
    pt: 'Lei de Gauss',
  },
  'label.operation': {
    ko: '닫힌 면을 지나는 전기력선속',
    en: 'Electric flux through a closed surface',
    ja: '閉曲面を貫く電束',
    zh: '穿过闭合曲面的电通量',
    ar: 'التدفق الكهربائي عبر سطح مغلق',
    es: 'Flujo eléctrico a través de una superficie cerrada',
    fr: 'Flux électrique à travers une surface fermée',
    hi: 'बंद पृष्ठ से होकर विद्युत फ्लक्स',
    id: 'Fluks listrik melalui permukaan tertutup',
    pt: 'Fluxo elétrico através de uma superfície fechada',
  },
  'label.stage': {
    ko: '점전하 둘레의 네 곡선',
    en: 'Four closed curves around a point charge',
    ja: '点電荷のまわりの四つの閉曲線',
    zh: '点电荷周围的四条闭合曲线',
    ar: 'أربعة منحنيات مغلقة حول شحنة نقطية',
    es: 'Cuatro curvas cerradas alrededor de una carga puntual',
    fr: 'Quatre courbes fermées autour d’une charge ponctuelle',
    hi: 'बिंदु आवेश के चारों ओर चार बंद वक्र',
    id: 'Empat kurva tertutup di sekitar muatan titik',
    pt: 'Quatro curvas fechadas em torno de uma carga pontual',
  },
  'label.view': {
    ko: '면의 단면',
    en: 'Cross-section of the surface',
    ja: '面の断面',
    zh: '曲面的截面',
    ar: 'مقطع عرضي للسطح',
    es: 'Sección transversal de la superficie',
    fr: 'Coupe de la surface',
    hi: 'पृष्ठ का अनुप्रस्थ काट',
    id: 'Penampang permukaan',
    pt: 'Seção transversal da superfície',
  },
  /** 기준선 이름표. 값은 스테이지 상수에서 온 가닥 수다 (C1 — 값은 vars 로). */
  'label.count': {
    ko: '{n}',
    en: '{n}',
    ja: '{n}',
    zh: '{n}',
    ar: '{n}',
    es: '{n}',
    fr: '{n}',
    hi: '{n}',
    id: '{n}',
    pt: '{n}',
  },
  /** 도식 기호. 수 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.zero': {
    ko: '0',
    en: '0',
    ja: '0',
    zh: '0',
    ar: '0',
    es: '0',
    fr: '0',
    hi: '0',
    id: '0',
    pt: '0',
  },
  'caption.countSmall': {
    ko: '작은 원을 한 바퀴 돌며, 원을 뚫고 나가는 선을 하나씩 센다',
    en: 'Going once around the small circle, we count each line that pierces it on the way out',
    ja: '小さな円を一周しながら、円を貫いて出ていく線を一本ずつ数える',
    zh: '沿小圆绕一圈，逐条数出穿出圆的线',
    ar: 'ندور مرة حول الدائرة الصغيرة، ونعدّ كل خط يخترقها خارجًا',
    es: 'Recorriendo una vez el círculo pequeño, contamos cada línea que lo atraviesa al salir',
    fr: 'En faisant une fois le tour du petit cercle, on compte chaque ligne qui le traverse en sortant',
    hi: 'छोटे वृत्त का एक चक्कर लगाते हुए, हम बाहर निकलते समय उसे भेदने वाली हर रेखा गिनते हैं',
    id: 'Mengelilingi lingkaran kecil sekali, kita hitung setiap garis yang menembusnya ke luar',
    pt: 'Dando uma volta no círculo pequeno, contamos cada linha que o atravessa ao sair',
  },
  'caption.readSmall': {
    ko: '원을 뚫고 나가는 선은 {n} 가닥이다',
    en: '{n} lines leave through the circle',
    ja: '円を貫いて出ていく線は{n}本',
    zh: '穿出圆的线有 {n} 条',
    ar: 'عدد الخطوط الخارجة عبر الدائرة: {n}',
    es: '{n} líneas salen por el círculo',
    fr: '{n} lignes sortent par le cercle',
    hi: 'वृत्त से होकर {n} रेखाएँ बाहर निकलती हैं',
    id: '{n} garis keluar melalui lingkaran',
    pt: '{n} linhas saem pelo círculo',
  },
  'caption.morphFold': {
    ko: '곡선을 찌그러뜨려 접는다',
    en: 'Now we squash and fold the curve',
    ja: '次に、曲線をつぶして折り曲げる',
    zh: '现在把曲线压扁并折起来',
    ar: 'الآن نضغط المنحنى ونطويه',
    es: 'Ahora aplastamos y plegamos la curva',
    fr: 'Maintenant, on écrase et on plie la courbe',
    hi: 'अब हम वक्र को पिचकाकर मोड़ते हैं',
    id: 'Sekarang kita penyokkan dan lipat kurvanya',
    pt: 'Agora achatamos e dobramos a curva',
  },
  'caption.countFold': {
    ko: '접힌 곳에서는 선이 나갔다 들어와 다시 나간다 — 들어오면 하나를 뺀다',
    en: 'Where the curve folds, a line leaves, comes back in and leaves again — coming in takes one away',
    ja: '曲線が折れた所では、線は出て、また入り、再び出る — 入れば一本引く',
    zh: '曲线折叠处，线穿出、穿回、再穿出 — 穿入就减去一条',
    ar: 'حيث ينطوي المنحنى، يخرج الخط ثم يعود فيدخل ثم يخرج مجددًا — الدخول يطرح واحدًا',
    es: 'Donde la curva se pliega, una línea sale, vuelve a entrar y sale otra vez — al entrar se resta una',
    fr: 'Là où la courbe se plie, une ligne sort, rentre puis ressort — une entrée en retire une',
    hi: 'जहाँ वक्र मुड़ता है, रेखा बाहर निकलती है, वापस अंदर आती है और फिर बाहर जाती है — अंदर आना एक घटाता है',
    id: 'Di tempat kurva terlipat, garis keluar, masuk lagi, lalu keluar lagi — yang masuk mengurangi satu',
    pt: 'Onde a curva se dobra, uma linha sai, volta a entrar e sai de novo — entrar tira uma',
  },
  'caption.readFold': {
    ko: '들어온 만큼 빼면, 나가는 선은 여전히 {n} 가닥이다',
    en: 'Take away the ones coming in, and still {n} lines leave',
    ja: '入ってくる分を引くと、出ていく線はやはり{n}本',
    zh: '减去穿入的线，穿出的仍是 {n} 条',
    ar: 'اطرح الخطوط الداخلة، ويبقى عدد الخطوط الخارجة {n}',
    es: 'Resta las que entran, y siguen saliendo {n} líneas',
    fr: 'Retirez celles qui entrent : il sort toujours {n} lignes',
    hi: 'अंदर आने वाली रेखाएँ घटाएँ, तब भी {n} रेखाएँ बाहर निकलती हैं',
    id: 'Kurangi yang masuk, dan tetap {n} garis keluar',
    pt: 'Tire as que entram, e ainda saem {n} linhas',
  },
  'caption.morphBig': {
    ko: '곡선을 크게 넓힌다',
    en: 'Now we widen the curve',
    ja: '次に、曲線を大きく広げる',
    zh: '现在把曲线扩大',
    ar: 'الآن نوسّع المنحنى',
    es: 'Ahora ampliamos la curva',
    fr: 'Maintenant, on élargit la courbe',
    hi: 'अब हम वक्र को चौड़ा करते हैं',
    id: 'Sekarang kita perlebar kurvanya',
    pt: 'Agora ampliamos a curva',
  },
  'caption.countBig': {
    ko: '큰 원 — 선은 전하에서 더 먼 곳에서 곡선을 뚫는다',
    en: 'A big circle — the lines pierce it much farther from the charge',
    ja: '大きな円 — 線は電荷からずっと遠い所で円を貫く',
    zh: '大圆 — 线在离电荷远得多的地方穿过它',
    ar: 'دائرة كبيرة — تخترقها الخطوط على بُعد أكبر بكثير من الشحنة',
    es: 'Un círculo grande — las líneas lo atraviesan mucho más lejos de la carga',
    fr: 'Un grand cercle — les lignes le traversent bien plus loin de la charge',
    hi: 'बड़ा वृत्त — रेखाएँ उसे आवेश से कहीं अधिक दूरी पर भेदती हैं',
    id: 'Lingkaran besar — garis menembusnya jauh lebih jauh dari muatan',
    pt: 'Um círculo grande — as linhas o atravessam muito mais longe da carga',
  },
  'caption.readBig': {
    ko: '크기를 키워도 나가는 선은 {n} 가닥이다',
    en: 'Bigger, yet {n} lines still leave',
    ja: '大きくしても、出ていく線はやはり{n}本',
    zh: '变大了，穿出的线仍是 {n} 条',
    ar: 'أكبر، ومع ذلك يبقى عدد الخطوط الخارجة {n}',
    es: 'Más grande, y aún salen {n} líneas',
    fr: 'Plus grand, et pourtant {n} lignes sortent toujours',
    hi: 'बड़ा होने पर भी {n} रेखाएँ ही बाहर निकलती हैं',
    id: 'Lebih besar, namun tetap {n} garis keluar',
    pt: 'Maior, e ainda saem {n} linhas',
  },
  'caption.morphOutside': {
    ko: '곡선을 전하 바깥으로 옮긴다',
    en: 'Now we move the curve off the charge',
    ja: '次に、曲線を電荷の外へ移す',
    zh: '现在把曲线移离电荷',
    ar: 'الآن ننقل المنحنى بعيدًا عن الشحنة',
    es: 'Ahora apartamos la curva de la carga',
    fr: 'Maintenant, on écarte la courbe de la charge',
    hi: 'अब हम वक्र को आवेश से हटाते हैं',
    id: 'Sekarang kita geser kurva menjauhi muatan',
    pt: 'Agora afastamos a curva da carga',
  },
  'caption.countOutside': {
    ko: '전하를 감싸지 않은 곡선 — 나가는 선은 더하고, 들어오는 선은 뺀다',
    en: 'A curve that misses the charge — lines going out add one, lines coming in take one away',
    ja: '電荷を囲まない曲線 — 出ていく線は一本足し、入ってくる線は一本引く',
    zh: '不包围电荷的曲线 — 穿出的线加一条，穿入的线减一条',
    ar: 'منحنى لا يحيط بالشحنة — الخط الخارج يضيف واحدًا، والخط الداخل يطرح واحدًا',
    es: 'Una curva que no encierra la carga — cada línea que sale suma una, cada línea que entra resta una',
    fr: 'Une courbe qui n’entoure pas la charge — une ligne qui sort en ajoute une, une ligne qui entre en retire une',
    hi: 'आवेश को न घेरने वाला वक्र — बाहर जाती रेखा एक जोड़ती है, अंदर आती रेखा एक घटाती है',
    id: 'Kurva yang tidak melingkupi muatan — garis yang keluar menambah satu, garis yang masuk mengurangi satu',
    pt: 'Uma curva que não envolve a carga — linhas que saem somam uma, linhas que entram tiram uma',
  },
  'caption.readOutside': {
    ko: '들어온 선이 모두 다시 나가, 남는 것은 0 이다',
    en: 'Every line that came in goes out again, leaving zero',
    ja: '入った線はすべてまた出ていき、残るのはゼロ',
    zh: '穿入的线全部又穿出，剩下零',
    ar: 'كل خط دخل يخرج مجددًا، فيبقى صفر',
    es: 'Toda línea que entró vuelve a salir, y queda cero',
    fr: 'Chaque ligne entrée ressort, il reste zéro',
    hi: 'अंदर आई हर रेखा फिर बाहर जाती है, शेष शून्य रहता है',
    id: 'Setiap garis yang masuk keluar lagi, tersisa nol',
    pt: 'Toda linha que entrou sai de novo, sobrando zero',
  },
  'caption.hold': {
    ko: '전하를 감싼 세 곡선의 기둥은 모두 {n} 에, 감싸지 않은 곡선의 기둥은 0 에 닿았다',
    en: 'The three curves around the charge all reach {n}; the one that misses it reaches 0',
    ja: '電荷を囲む三つの曲線はどれも{n}に届き、囲まない曲線は0に届く',
    zh: '包围电荷的三条曲线都达到 {n}；不包围电荷的那条达到 0',
    ar: 'المنحنيات الثلاثة المحيطة بالشحنة تبلغ كلها {n}، والذي لا يحيط بها يبلغ 0',
    es: 'Las tres curvas que encierran la carga llegan a {n}; la que no la encierra llega a 0',
    fr: 'Les trois courbes autour de la charge atteignent toutes {n} ; celle qui ne l’entoure pas atteint 0',
    hi: 'आवेश को घेरने वाले तीनों वक्र {n} तक पहुँचते हैं; जो नहीं घेरता वह 0 तक पहुँचता है',
    id: 'Ketiga kurva yang melingkupi muatan semuanya mencapai {n}; yang tidak melingkupinya mencapai 0',
    pt: 'As três curvas em torno da carga chegam todas a {n}; a que não a envolve chega a 0',
  },
} satisfies Record<string, LocalizedText>);

export type GausssLawMessageKey = keyof typeof gausssLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: GausssLawMessageKey): LocalizedText => gausssLawMessages[key];

/** 시간표가 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GausssLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const gausssLawSchema: BundleSchema = {
  id: GAUSSS_LAW_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 네 곡선을 차례로 세고, 나란히 읽고, 다시 시작한다.
  parameters: [],

  stages: [
    {
      id: 'point-charge',
      label: text('label.stage'),
      constants: {
        charge: CHARGE,
        linesPerCharge: LINES_PER_CHARGE,
        lineOffsetDeg: LINE_OFFSET_DEG,
        fieldReach: FIELD_REACH,
        startAngleDeg: START_ANGLE_DEG,
        smallRadius: SMALL_RADIUS,
        foldX: FOLD_X,
        foldY: FOLD_Y,
        foldRx: FOLD_RX,
        foldRy: FOLD_RY,
        foldWave: FOLD_WAVE,
        foldSwirl: FOLD_SWIRL,
        foldLobes: FOLD_LOBES,
        foldPhaseDeg: FOLD_PHASE_DEG,
        bigRadius: BIG_RADIUS,
        outsideX: OUTSIDE_X,
        outsideY: OUTSIDE_Y,
        outsideRx: OUTSIDE_RX,
        outsideRy: OUTSIDE_RY,
      },
    },
  ],

  environments: [],

  views: [{ id: 'section', label: text('label.view'), default: true }],

  /** 둥근 선 다발과 점 기둥 넷을 가로로 놓는다. 360 에서는 세로에 묶여 교차점이 붙는다. */
  canvas: { height: 420, minHeight: 340 },

  /**
   * 겹침이 판정 장치다. 전기력선 위에 곡선, 그 위에 교차점 표식이 와야 뚫는 자리가 가려지지
   * 않는다. 전하는 선의 뿌리를 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 작은 원 세기 → 읽기 → 접기 → 세기 → 읽기 → 넓히기 → 세기 → 읽기 → 밖으로
   * 옮기기 → 세기 → 읽기 → 네 기둥 나란히 → 흐려짐. 세는 단계는 `linear` — 도는 빠르기가
   * 고르다. 모양이 바뀌는 단계는 `smooth`.
   */
  timeline: {
    phases: [
      { id: 'count-small', duration: COUNT_SMALL, caption: key('caption.countSmall') },
      { id: 'read-small', duration: READ, caption: key('caption.readSmall') },
      { id: 'morph-fold', duration: MORPH, ease: 'smooth', caption: key('caption.morphFold') },
      { id: 'count-fold', duration: COUNT_FOLD, caption: key('caption.countFold') },
      { id: 'read-fold', duration: READ, caption: key('caption.readFold') },
      { id: 'morph-big', duration: MORPH, ease: 'smooth', caption: key('caption.morphBig') },
      { id: 'count-big', duration: COUNT_BIG, caption: key('caption.countBig') },
      { id: 'read-big', duration: READ, caption: key('caption.readBig') },
      { id: 'morph-outside', duration: MORPH, ease: 'smooth', caption: key('caption.morphOutside') },
      { id: 'count-outside', duration: COUNT_OUTSIDE, caption: key('caption.countOutside') },
      { id: 'read-outside', duration: READ, caption: key('caption.readOutside') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'fade', duration: FADE, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 작은 원을 반쯤 돌아 기둥이 반쯤 쌓인 자리에서 연다. */
  startAt: 2.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙의 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    /** 가닥 수는 스테이지 상수에서 온다 — state 가 글자로 옮겨 둔다 (G133). */
    vars: { n: 'lineCount' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **기둥이 기준선에 닿는가**다 —
   * N 점선과 0 선 둘이 그 기준이다.
   */

  messages: gausssLawMessages,
};
