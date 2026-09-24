// ========================================================================
// prism — 선언
// ========================================================================
// 질문: 유리 면 하나로는 조금밖에 안 벌어지던 색이, 프리즘을 지나면 왜 스크린에 넓은 띠가 되는가?
//
// 답: 삼각 프리즘은 흰빛을 들어갈 때 한 번, 나올 때 한 번 꺾는다. 두 면이 서로 기울어 있어서
// 둘째 면의 꺾임이 첫 면의 벌어짐을 되돌리지 않고 더 벌린다. 꼭지가 위를 향하면 덜 꺾인 빨강이
// 위, 더 꺾인 보라가 아래로 스크린에 띠를 만든다. 첫 면 뒤와 둘째 면 뒤의 벌어진 각을 같은
// 반지름의 두 괄호로 대비한다.
//
// 이웃과 겹치지 않게 — 한 경계에서 색이 갈라지는 것 자체와 굴절률-파장 곡선은 `dispersion` 의 몫이다.
// 여기서는 곡선을 두지 않고 **두 번 꺾여 더 벌어지는 것**과 스크린의 띠만 보인다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:prism` 와 문자 그대로 일치한다 (C4). */
export const PRISM_ID = 'prism';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 바깥 매질(공기)의 굴절률. */
export const N_AIR = 1.0;
/** 프리즘 꼭지각(도). 화면 글자는 이 값을 그대로 쓴다. */
export const APEX_DEG = 60;
/** 흰 줄기가 첫 면에 들어오는 각(첫 면의 법선에서 잰 도). */
export const INCIDENT_DEG = 60;
/**
 * 굴절률의 세 정박점 — BK7 유리의 빨강(C 선) · 파랑(F 선) · 보라(h 선).
 * 사이는 1/λ² 에 대한 이차식으로 잇는다(조각의 물리 계산).
 */
export const NM_RED = 656;
export const N_RED = 1.514;
export const NM_BLUE = 486;
export const N_BLUE = 1.522;
export const NM_VIOLET = 404;
export const N_VIOLET = 1.53;
/** 색 줄기 수. 보라 정박점에서 빨강 정박점까지 파장을 고르게 나눈다. */
export const RAY_COUNT = 7;
/**
 * 색 사이 굴절률 차의 과장 배율. 실제 BK7 이면 60° 입사에서 첫 면 뒤 0.42° · 둘째 면 뒤 1.27° 라
 * 화면에서 한 줄로 겹친다. 10배면 3.74° · 13.89° — 두 괄호의 비(3.7)가 실제 비(3.0)와 크게 어긋나지 않는다.
 * 빨강의 굴절률은 그대로 두고 다른 색이 빨강에서 벗어난 몫만 이만큼 키운다.
 * 각이 아니라 굴절률을 키우므로 두 면의 꺾임은 모두 스넬을 그대로 따른다. 화면 위에 적는다.
 */
export const INDEX_GAIN = 10;

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 임의. 꼭지가 위, 프리즘은 x = 0 에 대해 대칭.
// ------------------------------------------------------------------------

/** 빛 없음 판. 흰 줄기가 라이트 바탕에 묻히지 않게 깐다 (G92). */
export const PANEL = { minX: -4.3, maxX: 4.4, minY: -1.7, maxY: 2.1 } as const;
/** 꼭지의 자리와 옆면 길이. */
export const APEX = [0, 1.9] as const;
export const SIDE_LEN = 3.3;
/** 흰 줄기가 첫 면에 닿는 자리 — 꼭지에서 옆면을 따라 잰 몫 0~1. */
export const HIT_FRACTION = 0.75;
/** 들어오는 흰 줄기의 길이(입사점에서 거슬러). */
export const BEAM_IN_LEN = 2.6;
/** 스크린의 x 와 세로 범위. */
export const SCREEN_X = 4.0;
export const SCREEN_Y = [-1.6, 0.8] as const;
/** 두 괄호의 반지름 — 같은 반지름이라야 호의 길이로 벌어진 각을 견줄 수 있다. */
export const BRACKET_R = 2.05;

/** 프레이밍 — 고정값. 판, 오른쪽 색 이름, 위 과장 배율 · 꼭지각 · 스크린 이름, 아래 캡션 줄 (원칙 6). */
export const SCENE_BOUNDS = { minX: -4.6, maxX: 5.45, minY: -2.45, maxY: 2.5 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const prismMessages = Object.freeze({
  'label.title': {
    ko: '프리즘',
    en: 'Prism',
    ja: 'プリズム',
    zh: '棱镜',
    ar: 'المنشور',
    es: 'Prisma',
    fr: 'Prisme',
    hi: 'प्रिज़्म',
    id: 'Prisma',
    pt: 'Prisma',
  },
  'label.operation': {
    ko: '분산으로 나뉘는 스펙트럼',
    en: 'A spectrum spread out by dispersion',
    ja: '分散によって広がるスペクトル',
    zh: '由色散展开的光谱',
    ar: 'طيف ينتشر بفعل تفريق الضوء',
    es: 'Un espectro que se abre por dispersión',
    fr: 'Un spectre étalé par la dispersion',
    hi: 'वर्ण-विक्षेपण से फैला स्पेक्ट्रम',
    id: 'Spektrum yang terurai oleh dispersi',
    pt: 'Um espectro espalhado pela dispersão',
  },
  'label.stage': {
    ko: '유리 프리즘',
    en: 'Glass prism',
    ja: 'ガラスのプリズム',
    zh: '玻璃棱镜',
    ar: 'منشور زجاجي',
    es: 'Prisma de vidrio',
    fr: 'Prisme en verre',
    hi: 'काँच का प्रिज़्म',
    id: 'Prisma kaca',
    pt: 'Prisma de vidro',
  },
  'label.view': {
    ko: '프리즘과 스크린',
    en: 'Prism and screen',
    ja: 'プリズムとスクリーン',
    zh: '棱镜与光屏',
    ar: 'المنشور والشاشة',
    es: 'Prisma y pantalla',
    fr: 'Prisme et écran',
    hi: 'प्रिज़्म और पर्दा',
    id: 'Prisma dan layar',
    pt: 'Prisma e tela',
  },

  /** 판 밖 · 판 위 이름표. */
  'label.white': {
    ko: '흰빛',
    en: 'White light',
    ja: '白色光',
    zh: '白光',
    ar: 'الضوء الأبيض',
    es: 'Luz blanca',
    fr: 'Lumière blanche',
    hi: 'श्वेत प्रकाश',
    id: 'Cahaya putih',
    pt: 'Luz branca',
  },
  'label.screen': {
    ko: '스크린',
    en: 'Screen',
    ja: 'スクリーン',
    zh: '光屏',
    ar: 'الشاشة',
    es: 'Pantalla',
    fr: 'Écran',
    hi: 'पर्दा',
    id: 'Layar',
    pt: 'Tela',
  },
  'label.red': {
    ko: '빨강',
    en: 'Red',
    ja: '赤',
    zh: '红',
    ar: 'أحمر',
    es: 'Rojo',
    fr: 'Rouge',
    hi: 'लाल',
    id: 'Merah',
    pt: 'Vermelho',
  },
  'label.violet': {
    ko: '보라',
    en: 'Violet',
    ja: '紫',
    zh: '紫',
    ar: 'بنفسجي',
    es: 'Violeta',
    fr: 'Violet',
    hi: 'बैंगनी',
    id: 'Ungu',
    pt: 'Violeta',
  },
  'label.apex': {
    ko: '꼭지각 {a}°',
    en: 'Apex angle {a}°',
    ja: '頂角 {a}°',
    zh: '顶角 {a}°',
    ar: 'زاوية الرأس {a}°',
    es: 'Ángulo del vértice {a}°',
    fr: 'Angle au sommet {a}°',
    hi: 'शीर्ष कोण {a}°',
    id: 'Sudut puncak {a}°',
    pt: 'Ângulo do vértice {a}°',
  },
  'label.bracketIn': {
    ko: '첫 면 뒤',
    en: 'After the first face',
    ja: '第1面の後',
    zh: '第一面之后',
    ar: 'بعد الوجه الأول',
    es: 'Tras la primera cara',
    fr: 'Après la première face',
    hi: 'पहले फलक के बाद',
    id: 'Setelah bidang pertama',
    pt: 'Após a primeira face',
  },
  'label.bracketOut': {
    ko: '둘째 면 뒤',
    en: 'After the second face',
    ja: '第2面の後',
    zh: '第二面之后',
    ar: 'بعد الوجه الثاني',
    es: 'Tras la segunda cara',
    fr: 'Après la deuxième face',
    hi: 'दूसरे फलक के बाद',
    id: 'Setelah bidang kedua',
    pt: 'Após a segunda face',
  },
  /** 과장 배율. 스테이지 상수를 끼운다. */
  'label.gain': {
    ko: '색 사이 굴절률 차 {k}배 과장',
    en: 'Index difference between colours exaggerated ×{k}',
    ja: '色の間の屈折率差を ×{k} に誇張',
    zh: '色光之间的折射率差夸大 ×{k}',
    ar: 'فرق معامل الانكسار بين الألوان مضخَّم ×{k}',
    es: 'Diferencia de índice entre colores exagerada ×{k}',
    fr: 'Écart d’indice entre les couleurs exagéré ×{k}',
    hi: 'रंगों के बीच अपवर्तनांक का अंतर ×{k} बढ़ा-चढ़ाकर',
    id: 'Selisih indeks bias antarwarna dilebih-lebihkan ×{k}',
    pt: 'Diferença de índice entre as cores exagerada ×{k}',
  },

  'caption.enter': {

    ko: '흰빛 한 줄기가 프리즘의 첫 면으로 들어간다.',

    en: 'A single beam of white light enters the first face of the prism.',

    ja: '白色光の光束が1本、プリズムの第1面に入る。',

    zh: '一束白光射入棱镜的第一面。',

    ar: 'تدخل حزمة واحدة من الضوء الأبيض من الوجه الأول للمنشور.',

    es: 'Un solo haz de luz blanca entra por la primera cara del prisma.',

    fr: 'Un seul faisceau de lumière blanche entre par la première face du prisme.',

    hi: 'श्वेत प्रकाश का एक किरण-पुंज प्रिज़्म के पहले फलक से प्रवेश करता है।',

    id: 'Seberkas cahaya putih masuk melalui bidang pertama prisma.',

    pt: 'Um único feixe de luz branca entra pela primeira face do prisma.',

  },
  'caption.inside': {
    ko: '첫 면에서 꺾이며 흰빛이 색 줄기로 조금 벌어진다.',
    en: 'Bending at the first face, the white light opens slightly into coloured beams.',
    ja: '第1面で曲がり、白色光が色ごとの光束にわずかに広がる。',
    zh: '在第一面发生偏折，白光稍稍分开成各色光束。',
    ar: 'ينكسر الضوء الأبيض عند الوجه الأول فينفتح قليلًا إلى حزم ملوّنة.',
    es: 'Al desviarse en la primera cara, la luz blanca se abre un poco en haces de colores.',
    fr: 'En se déviant à la première face, la lumière blanche s’ouvre légèrement en faisceaux colorés.',
    hi: 'पहले फलक पर मुड़ते हुए श्वेत प्रकाश थोड़ा-सा रंगीन किरण-पुंजों में फैल जाता है।',
    id: 'Membelok di bidang pertama, cahaya putih sedikit terurai menjadi berkas-berkas berwarna.',
    pt: 'Ao se desviar na primeira face, a luz branca se abre um pouco em feixes coloridos.',
  },
  'caption.bracketIn': {
    ko: '첫 면을 지난 색 줄기 사이에 괄호를 댄다.',
    en: 'A bracket marks the angle between the coloured beams after the first face.',
    ja: '第1面を通った色の光束の間の角を弧で示す。',
    zh: '用一段弧线标出经过第一面后各色光束之间的夹角。',
    ar: 'قوس يحدّد الزاوية بين الحزم الملوّنة بعد الوجه الأول.',
    es: 'Un arco marca el ángulo entre los haces de colores tras la primera cara.',
    fr: 'Un arc marque l’angle entre les faisceaux colorés après la première face.',
    hi: 'एक चाप पहले फलक के बाद रंगीन किरण-पुंजों के बीच का कोण दिखाता है।',
    id: 'Sebuah busur menandai sudut antara berkas-berkas berwarna setelah bidang pertama.',
    pt: 'Um arco marca o ângulo entre os feixes coloridos após a primeira face.',
  },
  'caption.holdIn': {
    ko: '첫 면 뒤의 괄호는 좁다 — 색 줄기가 아직 가깝게 모여 간다.',
    en: 'The bracket after the first face is narrow — the coloured beams still travel close together.',
    ja: '第1面の後の弧は狭い — 色の光束はまだ寄り添って進む。',
    zh: '第一面之后的弧线很窄——各色光束仍然靠得很近。',
    ar: 'القوس بعد الوجه الأول ضيّق — ما زالت الحزم الملوّنة تسير متقاربة.',
    es: 'El arco tras la primera cara es estrecho — los haces de colores aún viajan muy juntos.',
    fr: 'L’arc après la première face est étroit — les faisceaux colorés avancent encore serrés.',
    hi: 'पहले फलक के बाद का चाप संकरा है — रंगीन किरण-पुंज अभी भी पास-पास चलते हैं।',
    id: 'Busur setelah bidang pertama sempit — berkas-berkas berwarna masih berjalan berdekatan.',
    pt: 'O arco após a primeira face é estreito — os feixes coloridos ainda seguem bem próximos.',
  },
  'caption.exit': {
    ko: '둘째 면에서 한 번 더 꺾이며 색 줄기가 더 벌어진다.',
    en: 'Bending once more at the second face, the coloured beams fan out further.',
    ja: '第2面でもう一度曲がり、色の光束はさらに広がる。',
    zh: '在第二面再偏折一次，各色光束散得更开。',
    ar: 'تنكسر الحزم الملوّنة مرة أخرى عند الوجه الثاني فتتباعد أكثر.',
    es: 'Al desviarse otra vez en la segunda cara, los haces de colores se abren aún más.',
    fr: 'En se déviant encore à la deuxième face, les faisceaux colorés s’écartent davantage.',
    hi: 'दूसरे फलक पर एक बार और मुड़कर रंगीन किरण-पुंज और फैल जाते हैं।',
    id: 'Membelok sekali lagi di bidang kedua, berkas-berkas berwarna makin menyebar.',
    pt: 'Ao se desviar mais uma vez na segunda face, os feixes coloridos se abrem ainda mais.',
  },
  'caption.band': {
    ko: '스크린에 색 띠가 생긴다 — 덜 꺾인 빨강이 위, 더 꺾인 보라가 아래.',
    en: 'A band of colour forms on the screen — red, bent least, on top; violet, bent most, below.',
    ja: 'スクリーンに色の帯ができる — 曲がりの最も小さい赤が上、最も大きい紫が下。',
    zh: '光屏上出现彩色光带——偏折最小的红光在上，偏折最大的紫光在下。',
    ar: 'يتكوّن على الشاشة شريط من الألوان — الأحمر الأقل انكسارًا في الأعلى، والبنفسجي الأكثر انكسارًا في الأسفل.',
    es: 'Se forma una banda de colores en la pantalla — el rojo, el que menos se desvía, arriba; el violeta, el que más, abajo.',
    fr: 'Une bande colorée se forme sur l’écran — le rouge, le moins dévié, en haut ; le violet, le plus dévié, en bas.',
    hi: 'पर्दे पर रंगों की एक पट्टी बनती है — सबसे कम मुड़ा लाल ऊपर, सबसे अधिक मुड़ा बैंगनी नीचे।',
    id: 'Pita warna terbentuk di layar — merah, yang paling sedikit dibelokkan, di atas; ungu, yang paling banyak, di bawah.',
    pt: 'Uma faixa de cores se forma na tela — o vermelho, o que menos se desvia, em cima; o violeta, o que mais se desvia, embaixo.',
  },
  'caption.bracketOut': {
    ko: '둘째 면을 지난 색 줄기 사이에도 같은 크기의 괄호를 댄다.',
    en: 'A bracket of the same radius marks the angle after the second face.',
    ja: '同じ半径の弧で、第2面の後の角も示す。',
    zh: '用同样半径的弧线标出第二面之后的夹角。',
    ar: 'قوس بنصف القطر نفسه يحدّد الزاوية بعد الوجه الثاني.',
    es: 'Un arco del mismo radio marca el ángulo tras la segunda cara.',
    fr: 'Un arc de même rayon marque l’angle après la deuxième face.',
    hi: 'उसी त्रिज्या का एक चाप दूसरे फलक के बाद का कोण दिखाता है।',
    id: 'Busur dengan jari-jari yang sama menandai sudut setelah bidang kedua.',
    pt: 'Um arco de mesmo raio marca o ângulo após a segunda face.',
  },
  'caption.compare': {
    ko: '둘째 면 뒤의 괄호가 첫 면 뒤의 괄호보다 몇 배나 넓다.',
    en: 'The bracket after the second face is several times wider than the one after the first.',
    ja: '第2面の後の弧は、第1面の後の弧より何倍も広い。',
    zh: '第二面之后的弧线比第一面之后的宽好几倍。',
    ar: 'القوس بعد الوجه الثاني أعرض بعدة أضعاف من القوس بعد الوجه الأول.',
    es: 'El arco tras la segunda cara es varias veces más ancho que el de la primera.',
    fr: 'L’arc après la deuxième face est plusieurs fois plus large que celui après la première.',
    hi: 'दूसरे फलक के बाद का चाप पहले फलक के बाद वाले से कई गुना चौड़ा है।',
    id: 'Busur setelah bidang kedua beberapa kali lebih lebar daripada busur setelah bidang pertama.',
    pt: 'O arco após a segunda face é várias vezes mais largo que o da primeira.',
  },
} satisfies Record<string, LocalizedText>);

export type PrismMessageKey = keyof typeof prismMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PrismMessageKey): LocalizedText => prismMessages[key];

/** 시간표가 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PrismMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const prismSchema: BundleSchema = {
  id: PRISM_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'glass-prism',
      label: text('label.stage'),
      constants: {
        nAir: N_AIR,
        apexDeg: APEX_DEG,
        incidentDeg: INCIDENT_DEG,
        nmRed: NM_RED,
        nRed: N_RED,
        nmBlue: NM_BLUE,
        nBlue: N_BLUE,
        nmViolet: NM_VIOLET,
        nViolet: N_VIOLET,
        rayCount: RAY_COUNT,
        indexGain: INDEX_GAIN,
      },
    },
  ],
  environments: [],
  views: [{ id: 'prism-screen', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 가운데 빛 없음 판, 아래 캡션 줄. */
  canvas: { height: 420, minHeight: 340 },

  /**
   * scene 에 쓴 순서대로 그린다. 빛 없음 판(`region`, 기본 층 45)이 줄기(`trajectory`, 20) 위로
   * 올라와 덮으면 안 된다 — 판이 맨 아래, 프리즘 · 줄기 · 괄호가 그 위, 글자가 가장 나중이다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 띠와 두 괄호가 다 나와 있다 (S-piece, `compare` 앞머리). */
  startAt: 9.4,

  /**
   * 한 주기 13.4 초.
   *
   * - `enter` — 흰 줄기가 첫 면까지 자란다.
   * - `inside` — 첫 면에서 색 줄기가 유리 속으로 자라 둘째 면에 닿는다.
   * - `bracketIn` · `holdIn` — 첫 면 뒤 괄호가 나타나 머문다.
   * - `exit` — 둘째 면에서 색 줄기가 스크린까지 자란다.
   * - `band` — 스크린에 색 띠가 짙어진다.
   * - `bracketOut` · `compare` — 둘째 면 뒤 괄호가 나타나 두 괄호가 나란히 머문다.
   * - `fade` — 모두 옅어진다. 다음 주기에 흰 줄기가 다시 들어온다.
   */
  timeline: {
    phases: [
      { id: 'enter', duration: 1.2, caption: key('caption.enter') },
      { id: 'inside', duration: 1.4, ease: 'smooth', caption: key('caption.inside') },
      { id: 'bracketIn', duration: 0.8, ease: 'smooth', caption: key('caption.bracketIn') },
      { id: 'holdIn', duration: 1.4, caption: key('caption.holdIn') },
      { id: 'exit', duration: 1.6, ease: 'smooth', caption: key('caption.exit') },
      { id: 'band', duration: 1.8, ease: 'smooth', caption: key('caption.band') },
      { id: 'bracketOut', duration: 0.8, ease: 'smooth', caption: key('caption.bracketOut') },
      { id: 'compare', duration: 3.2, caption: key('caption.compare') },
      { id: 'fade', duration: 1.2, ease: 'smooth', caption: key('caption.compare') },
    ],
  },

  /** 슬롯 하나. 캡션에 끼우는 수는 없다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 640,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 · 조작기 없음(기본).

  messages: prismMessages,
};
