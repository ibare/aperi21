// ========================================================================
// microscope — 선언
// ========================================================================
// 질문: 현미경은 작은 시료를 어떻게 그렇게 크게 보이게 하는가.
//
// 답: 두 번 키운다. 초점 거리가 짧은 대물렌즈가 초점 바로 바깥의 시료로부터 경통 안에
// 거꾸로 선 확대 실상을 만들고(첫 확대), 그 실상이 접안렌즈 초점 안에 놓여 돋보기처럼
// 한 번 더 커진 허상이 된다(둘째 확대). 오른쪽 막대 셋이 그 곱을 길이로 보인다 — 대물
// 막대가 늘고, 접안 막대가 늘고, 전체 막대에 대물 막대가 접안 칸 수만큼 이어 붙는다.
//
// 렌즈 하나의 배율은 `magnification`, 접안렌즈 하나로 보는 돋보기는 `magnifying-glass`,
// 맞붙인 두 렌즈는 `lens-combination` 의 몫이다. 이 조각은 떨어진 두 렌즈가 **차례로**
// 키우는 것만 말한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:microscope` 와 문자 그대로 일치한다 (C4). */
export const MICROSCOPE_ID = 'microscope';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 대물렌즈의 초점 거리(월드). 짧다. */
export const OBJECTIVE_FOCAL = 0.6;
/** 시료가 대물렌즈에서 떨어진 거리(월드). 초점 거리 바로 바깥이다. */
export const SPECIMEN_DISTANCE = 0.75;
/** 시료(화살표)의 높이(월드). 막대 한 칸의 길이이기도 하다. */
export const SPECIMEN_HEIGHT = 0.2;
/** 경통 길이 — 대물렌즈와 접안렌즈 사이 거리(월드). */
export const TUBE_LENGTH = 3.6;
/** 접안렌즈의 초점 거리(월드). 실상이 이 거리 안쪽에 놓이도록 잡는다. */
export const EYEPIECE_FOCAL = 0.9;

/**
 * 배율 정박값 — 화면 글자 `×{m}` · 캡션 · 막대 칸 수가 이 값을 그대로 쓴다. 위 거리에서
 * 계산하지 않는다(S-piece 유효숫자). 그림의 상 자리 · 크기는 `findImage` 가 거리에서 계산하고,
 * 둘이 같아야 한다는 관계는 NOTES (c) G143.
 */
export const OBJECTIVE_MAG = 4;
export const EYEPIECE_MAG = 3;
export const TOTAL_MAG = 12;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 대물렌즈가 x = 0, 광축이 y = 0 이다.
// ------------------------------------------------------------------------

/** 대물렌즈 높이(월드). 작은 렌즈다. */
export const OBJECTIVE_SIZE = 0.7;
/** 접안렌즈 높이(월드). 실상 끝에서 나란히 오는 줄기를 받을 만큼. */
export const EYEPIECE_SIZE = 2.0;
/** 경통 벽의 높이(월드, 광축에서). 접안렌즈 반높이보다 조금 크다. */
export const TUBE_HALF = 1.05;
/** 광축 보조선의 왼쪽 · 오른쪽 끝(월드). */
export const AXIS_FROM_X = -1.1;
export const AXIS_TO_X = 4.9;
/** 접안렌즈를 지난 줄기가 더 뻗는 길이(월드). */
export const EXIT_LENGTH = 0.9;
/** 초점 점의 반지름(월드). */
export const FOCUS_DOT_RADIUS = 0.04;

/** 막대 묶음 — 칸이 시작하는 x(월드). 칸 한 개의 길이는 시료 높이와 같다. */
export const BAR_X = 5.3;
/** 막대 세 줄(대물 · 접안 · 전체)의 가운데 y(월드). */
export const BAR_ROW_Y_OBJECTIVE = -0.7;
export const BAR_ROW_Y_EYEPIECE = -1.2;
export const BAR_ROW_Y_TOTAL = -1.7;
/** 막대 두께(월드). */
export const BAR_THICKNESS = 0.18;

/**
 * 프레이밍 — 가로는 시료 왼쪽 이름표부터 전체 막대 값 글자까지, 세로는 경통 이름표부터
 * 허상 끝 아래 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -1.25, maxX: 8.35, minY: -2.95, maxY: 1.45 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const microscopeMessages = Object.freeze({
  'label.title': {
    ko: '현미경',
    en: 'Microscope',
    ja: '顕微鏡',
    zh: '显微镜',
    ar: 'المجهر',
    es: 'Microscopio',
    fr: 'Microscope',
    hi: 'सूक्ष्मदर्शी',
    id: 'Mikroskop',
    pt: 'Microscópio',
  },
  'label.operation': {
    ko: '대물과 접안의 배율 곱',
    en: 'Objective and eyepiece magnifications multiply',
    ja: '対物レンズと接眼レンズの倍率をかけ合わせる',
    zh: '物镜与目镜的放大率相乘',
    ar: 'يُضرب تكبير العدسة الشيئية في تكبير العدسة العينية',
    es: 'Los aumentos del objetivo y del ocular se multiplican',
    fr: 'Les grossissements de l’objectif et de l’oculaire se multiplient',
    hi: 'अभिदृश्यक और नेत्रिका के आवर्धन गुणा होते हैं',
    id: 'Perbesaran lensa objektif dan okuler dikalikan',
    pt: 'As ampliações da objetiva e da ocular se multiplicam',
  },
  'label.stage': {
    ko: '대물렌즈와 접안렌즈',
    en: 'Objective and eyepiece',
    ja: '対物レンズと接眼レンズ',
    zh: '物镜与目镜',
    ar: 'العدسة الشيئية والعدسة العينية',
    es: 'Objetivo y ocular',
    fr: 'Objectif et oculaire',
    hi: 'अभिदृश्यक और नेत्रिका',
    id: 'Lensa objektif dan okuler',
    pt: 'Objetiva e ocular',
  },
  'label.view': {
    ko: '경통과 배율 막대',
    en: 'Tube and magnification bars',
    ja: '鏡筒と倍率の棒',
    zh: '镜筒与放大率条',
    ar: 'الأنبوب وأعمدة التكبير',
    es: 'Tubo y barras de aumento',
    fr: 'Tube et barres de grossissement',
    hi: 'नलिका और आवर्धन पट्टियाँ',
    id: 'Tabung dan batang perbesaran',
    pt: 'Tubo e barras de ampliação',
  },

  /** 도식 이름표. */
  'label.specimen': {
    ko: '시료',
    en: 'specimen',
    ja: '試料',
    zh: '标本',
    ar: 'العيّنة',
    es: 'muestra',
    fr: 'échantillon',
    hi: 'नमूना',
    id: 'spesimen',
    pt: 'amostra',
  },
  'label.objective': {
    ko: '대물렌즈',
    en: 'objective',
    ja: '対物レンズ',
    zh: '物镜',
    ar: 'العدسة الشيئية',
    es: 'objetivo',
    fr: 'objectif',
    hi: 'अभिदृश्यक',
    id: 'lensa objektif',
    pt: 'objetiva',
  },
  'label.eyepiece': {
    ko: '접안렌즈',
    en: 'eyepiece',
    ja: '接眼レンズ',
    zh: '目镜',
    ar: 'العدسة العينية',
    es: 'ocular',
    fr: 'oculaire',
    hi: 'नेत्रिका',
    id: 'lensa okuler',
    pt: 'ocular',
  },
  'label.tube': {
    ko: '경통',
    en: 'tube',
    ja: '鏡筒',
    zh: '镜筒',
    ar: 'الأنبوب',
    es: 'tubo',
    fr: 'tube',
    hi: 'नलिका',
    id: 'tabung',
    pt: 'tubo',
  },
  'label.realImage': {
    ko: '실상',
    en: 'real image',
    ja: '実像',
    zh: '实像',
    ar: 'صورة حقيقية',
    es: 'imagen real',
    fr: 'image réelle',
    hi: 'वास्तविक प्रतिबिंब',
    id: 'bayangan nyata',
    pt: 'imagem real',
  },
  'label.virtualImage': {
    ko: '허상',
    en: 'virtual image',
    ja: '虚像',
    zh: '虚像',
    ar: 'صورة وهمية',
    es: 'imagen virtual',
    fr: 'image virtuelle',
    hi: 'आभासी प्रतिबिंब',
    id: 'bayangan maya',
    pt: 'imagem virtual',
  },
  /** 초점 표식 — 기호라 두 언어가 같다. */
  'label.focus': {
    ko: 'F',
    en: 'F',
    ja: 'F',
    zh: 'F',
    ar: 'F',
    es: 'F',
    fr: 'F',
    hi: 'F',
    id: 'F',
    pt: 'F',
  },
  /** 막대 줄 이름. */
  'label.barObjective': {
    ko: '대물',
    en: 'objective',
    ja: '対物',
    zh: '物镜',
    ar: 'الشيئية',
    es: 'objetivo',
    fr: 'objectif',
    hi: 'अभिदृश्यक',
    id: 'objektif',
    pt: 'objetiva',
  },
  'label.barEyepiece': {
    ko: '접안',
    en: 'eyepiece',
    ja: '接眼',
    zh: '目镜',
    ar: 'العينية',
    es: 'ocular',
    fr: 'oculaire',
    hi: 'नेत्रिका',
    id: 'okuler',
    pt: 'ocular',
  },
  'label.barTotal': {
    ko: '전체',
    en: 'total',
    ja: '全体',
    zh: '总',
    ar: 'الكلي',
    es: 'total',
    fr: 'total',
    hi: 'कुल',
    id: 'total',
    pt: 'total',
  },
  /** 막대 값 글자. 값은 선언한 정박값이다. */
  'label.mag': {
    ko: '×{m}',
    en: '×{m}',
    ja: '×{m}',
    zh: '×{m}',
    ar: '×{m}',
    es: '×{m}',
    fr: '×{m}',
    hi: '×{m}',
    id: '×{m}',
    pt: '×{m}',
  },

  'caption.objRays': {
    ko: '시료 끝에서 나온 빛이 대물렌즈를 지나 경통 안의 한 점으로 모인다.',
    en: 'Light from the tip of the specimen passes the objective and meets at one point inside the tube.',
    ja: '試料の先端から出た光が対物レンズを通り、鏡筒の中の一点に集まる。',
    zh: '来自标本顶端的光穿过物镜，会聚到镜筒内的一点。',
    ar: 'الضوء الخارج من طرف العيّنة يعبر العدسة الشيئية ويلتقي في نقطة واحدة داخل الأنبوب.',
    es: 'La luz que sale de la punta de la muestra atraviesa el objetivo y se junta en un punto dentro del tubo.',
    fr: 'La lumière issue de la pointe de l’échantillon traverse l’objectif et se rejoint en un point à l’intérieur du tube.',
    hi: 'नमूने के सिरे से निकला प्रकाश अभिदृश्यक से होकर नलिका के भीतर एक बिंदु पर मिलता है।',
    id: 'Cahaya dari ujung spesimen melewati lensa objektif dan bertemu di satu titik di dalam tabung.',
    pt: 'A luz que sai da ponta da amostra atravessa a objetiva e se encontra em um ponto dentro do tubo.',
  },
  'caption.objGrow': {
    ko: '경통 안에 거꾸로 선 실상이 생기고, 대물 막대가 늘어난다.',
    en: 'An upside-down real image forms inside the tube, and the objective bar grows.',
    ja: '鏡筒の中に倒立した実像ができ、対物の棒が伸びる。',
    zh: '镜筒内形成倒立的实像，物镜条变长。',
    ar: 'تتكوّن داخل الأنبوب صورة حقيقية مقلوبة، ويطول عمود الشيئية.',
    es: 'Dentro del tubo se forma una imagen real invertida, y la barra del objetivo crece.',
    fr: 'Une image réelle renversée se forme dans le tube, et la barre de l’objectif s’allonge.',
    hi: 'नलिका के भीतर उलटा वास्तविक प्रतिबिंब बनता है, और अभिदृश्यक की पट्टी बढ़ती है।',
    id: 'Bayangan nyata terbalik terbentuk di dalam tabung, dan batang objektif memanjang.',
    pt: 'Dentro do tubo forma-se uma imagem real invertida, e a barra da objetiva cresce.',
  },
  'caption.objImage': {
    ko: '경통 안의 실상은 시료의 {m1}배다. 대물 막대가 {m1}칸이 됐다.',
    en: 'The real image in the tube is {m1}× the specimen. The objective bar is now {m1} cells long.',
    ja: '鏡筒の中の実像は試料の {m1}×。対物の棒が {m1} マスになった。',
    zh: '镜筒内的实像是标本的 {m1}×。物镜条现在有 {m1} 格长。',
    ar: 'الصورة الحقيقية في الأنبوب {m1}× العيّنة. صار عمود الشيئية الآن بطول {m1} خانات.',
    es: 'La imagen real en el tubo es {m1}× la muestra. La barra del objetivo mide ahora {m1} casillas.',
    fr: 'L’image réelle dans le tube fait {m1}× l’échantillon. La barre de l’objectif compte maintenant {m1} cases.',
    hi: 'नलिका में वास्तविक प्रतिबिंब नमूने का {m1}× है। अभिदृश्यक की पट्टी अब {m1} खाने लंबी है।',
    id: 'Bayangan nyata di dalam tabung {m1}× spesimen. Batang objektif kini sepanjang {m1} kotak.',
    pt: 'A imagem real no tubo é {m1}× a amostra. A barra da objetiva agora tem {m1} casas.',
  },
  'caption.eyeRays': {
    ko: '실상 끝에서 나온 빛이 접안렌즈를 지나 퍼져 나간다.',
    en: 'Light from the tip of the real image passes the eyepiece and spreads out.',
    ja: '実像の先端から出た光が接眼レンズを通り、広がっていく。',
    zh: '来自实像顶端的光穿过目镜后向外发散。',
    ar: 'الضوء الخارج من طرف الصورة الحقيقية يعبر العدسة العينية وينتشر.',
    es: 'La luz que sale de la punta de la imagen real atraviesa el ocular y se abre.',
    fr: 'La lumière issue de la pointe de l’image réelle traverse l’oculaire et s’étale.',
    hi: 'वास्तविक प्रतिबिंब के सिरे से निकला प्रकाश नेत्रिका से होकर फैलता है।',
    id: 'Cahaya dari ujung bayangan nyata melewati lensa okuler dan menyebar.',
    pt: 'A luz que sai da ponta da imagem real atravessa a ocular e se espalha.',
  },
  'caption.eyeGrow': {
    ko: '퍼지는 빛을 거꾸로 이은 곳에 더 큰 허상이 서고, 접안 막대가 늘어난다.',
    en: 'Traced back, the spreading light meets in a larger virtual image, and the eyepiece bar grows.',
    ja: '広がる光を逆向きにたどると、より大きな虚像で交わり、接眼の棒が伸びる。',
    zh: '把发散的光反向延长，会交于一个更大的虚像，目镜条变长。',
    ar: 'عند تتبّع الضوء المنتشر إلى الوراء يلتقي في صورة وهمية أكبر، ويطول عمود العينية.',
    es: 'Prolongada hacia atrás, la luz que se abre se junta en una imagen virtual mayor, y la barra del ocular crece.',
    fr: 'Prolongée vers l’arrière, la lumière qui s’étale se rejoint en une image virtuelle plus grande, et la barre de l’oculaire s’allonge.',
    hi: 'फैलते प्रकाश को पीछे की ओर बढ़ाने पर वह एक बड़े आभासी प्रतिबिंब पर मिलता है, और नेत्रिका की पट्टी बढ़ती है।',
    id: 'Jika ditelusuri ke belakang, cahaya yang menyebar bertemu pada bayangan maya yang lebih besar, dan batang okuler memanjang.',
    pt: 'Prolongada para trás, a luz que se espalha se encontra em uma imagem virtual maior, e a barra da ocular cresce.',
  },
  'caption.eyeImage': {
    ko: '허상은 실상의 {m2}배다. 접안 막대가 {m2}칸이 됐다.',
    en: 'The virtual image is {m2}× the real image. The eyepiece bar is now {m2} cells long.',
    ja: '虚像は実像の {m2}×。接眼の棒が {m2} マスになった。',
    zh: '虚像是实像的 {m2}×。目镜条现在有 {m2} 格长。',
    ar: 'الصورة الوهمية {m2}× الصورة الحقيقية. صار عمود العينية الآن بطول {m2} خانات.',
    es: 'La imagen virtual es {m2}× la imagen real. La barra del ocular mide ahora {m2} casillas.',
    fr: 'L’image virtuelle fait {m2}× l’image réelle. La barre de l’oculaire compte maintenant {m2} cases.',
    hi: 'आभासी प्रतिबिंब वास्तविक प्रतिबिंब का {m2}× है। नेत्रिका की पट्टी अब {m2} खाने लंबी है।',
    id: 'Bayangan maya {m2}× bayangan nyata. Batang okuler kini sepanjang {m2} kotak.',
    pt: 'A imagem virtual é {m2}× a imagem real. A barra da ocular agora tem {m2} casas.',
  },
  'caption.copy': {
    ko: '전체 막대에 대물 막대 하나가 놓인다.',
    en: 'One objective bar is laid on the total bar.',
    ja: '全体の棒に対物の棒が一本置かれる。',
    zh: '总条上放上一段物镜条。',
    ar: 'يوضع عمود شيئية واحد على العمود الكلي.',
    es: 'Se coloca una barra del objetivo sobre la barra total.',
    fr: 'Une barre de l’objectif est posée sur la barre totale.',
    hi: 'कुल पट्टी पर अभिदृश्यक की एक पट्टी रखी जाती है।',
    id: 'Satu batang objektif diletakkan pada batang total.',
    pt: 'Uma barra da objetiva é colocada na barra total.',
  },
  'caption.stack': {
    ko: '전체 막대에 대물 막대가 접안 칸 하나마다 하나씩 이어 붙는다.',
    en: 'On the total bar, one objective bar is laid down for each eyepiece cell.',
    ja: '全体の棒に、接眼の一マスごとに対物の棒が一本ずつつながる。',
    zh: '在总条上，目镜条每一格对应接上一段物镜条。',
    ar: 'على العمود الكلي، يوضع عمود شيئية واحد لكل خانة من العينية.',
    es: 'Sobre la barra total se coloca una barra del objetivo por cada casilla del ocular.',
    fr: 'Sur la barre totale, une barre de l’objectif est posée pour chaque case de l’oculaire.',
    hi: 'कुल पट्टी पर नेत्रिका के हर खाने के लिए अभिदृश्यक की एक पट्टी जोड़ी जाती है।',
    id: 'Pada batang total, satu batang objektif diletakkan untuk setiap kotak okuler.',
    pt: 'Na barra total, uma barra da objetiva é colocada para cada casa da ocular.',
  },
  'caption.total': {
    ko: '대물 막대 {m2}개가 이어져 {m}칸 — 허상은 시료의 {m}배다.',
    en: '{m2} objective bars end to end make {m} cells — the virtual image is {m}× the specimen.',
    ja: '対物の棒 {m2} 本がつながって {m} マス — 虚像は試料の {m}×。',
    zh: '{m2} 段物镜条首尾相接成 {m} 格——虚像是标本的 {m}×。',
    ar: '{m2} أعمدة شيئية متتالية تصنع {m} خانات — الصورة الوهمية {m}× العيّنة.',
    es: '{m2} barras del objetivo seguidas forman {m} casillas — la imagen virtual es {m}× la muestra.',
    fr: '{m2} barres de l’objectif bout à bout font {m} cases — l’image virtuelle fait {m}× l’échantillon.',
    hi: 'अभिदृश्यक की {m2} पट्टियाँ सिरे से सिरा जुड़कर {m} खाने बनाती हैं — आभासी प्रतिबिंब नमूने का {m}× है।',
    id: '{m2} batang objektif yang disambung membentuk {m} kotak — bayangan maya {m}× spesimen.',
    pt: '{m2} barras da objetiva enfileiradas formam {m} casas — a imagem virtual é {m}× a amostra.',
  },
  'caption.reset': {
    ko: '상과 줄기가 사라지고 두 막대가 1칸으로 돌아간다.',
    en: 'The images and beams fade, and both bars go back to one cell.',
    ja: '像と光線が消え、二本の棒が 1 マスに戻る。',
    zh: '像和光线消失，两条都回到 1 格。',
    ar: 'تتلاشى الصورتان والحزم، ويعود العمودان إلى خانة واحدة.',
    es: 'Las imágenes y los haces se desvanecen, y ambas barras vuelven a una casilla.',
    fr: 'Les images et les faisceaux s’effacent, et les deux barres reviennent à une case.',
    hi: 'प्रतिबिंब और किरणें फीकी पड़ती हैं, और दोनों पट्टियाँ एक खाने पर लौट आती हैं।',
    id: 'Bayangan dan berkas memudar, dan kedua batang kembali ke satu kotak.',
    pt: 'As imagens e os feixes se apagam, e as duas barras voltam a uma casa.',
  },
} satisfies Record<string, LocalizedText>);

export type MicroscopeMessageKey = keyof typeof microscopeMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MicroscopeMessageKey): LocalizedText => microscopeMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MicroscopeMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const microscopeSchema: BundleSchema = {
  id: MICROSCOPE_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 두 번의 확대를 자동 진행으로 차례로 보인다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'two-lenses',
      label: text('label.stage'),
      constants: {
        objectiveFocal: OBJECTIVE_FOCAL,
        specimenDistance: SPECIMEN_DISTANCE,
        specimenHeight: SPECIMEN_HEIGHT,
        tubeLength: TUBE_LENGTH,
        eyepieceFocal: EYEPIECE_FOCAL,
        objectiveMag: OBJECTIVE_MAG,
        eyepieceMag: EYEPIECE_MAG,
        totalMag: TOTAL_MAG,
      },
    },
  ],

  environments: [],

  views: [{ id: 'tube-and-bars', label: text('label.view'), default: true }],

  /** 광축 한 줄과 옆의 막대 묶음. 가로로 넓고, 세로는 허상 끝과 캡션이 정한다. */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 축 → 경통 → 초점 → 렌즈 → 연장 점선 → 줄기 → 화살표 → 글자 → 막대 순. plugin 어휘가 층에서
   * 어디 끼는지에 기대지 않게 scene 순서로 고정한다 — 줄기가 렌즈 위로, 화살표가 줄기 위로 온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 첫 확대(대물) → 둘째 확대(접안) → 막대 곱 → 되돌림.
   *
   * 줄기가 뻗는 길이는 `obj-rays` · `eye-rays` 진행도, 상 화살표 · 연장 점선 · 막대 칸 길이는
   * `obj-image` · `eye-image` · `copy` · `stack` 진행도, 값 글자는 `*-mark` 진행도, 되돌림은 `reset`
   * 진행도로 읽는다 (`physics.ts`). 단계 경계를 코드 상수로 가르지 않는다.
   */
  timeline: {
    phases: [
      { id: 'obj-rays', duration: 1.6, caption: key('caption.objRays') },
      { id: 'obj-image', duration: 1.0, ease: 'smooth', caption: key('caption.objGrow') },
      { id: 'obj-mark', duration: 0.35, ease: 'smooth', caption: key('caption.objImage') },
      { id: 'hold-obj', duration: 2.6, caption: key('caption.objImage') },
      { id: 'eye-rays', duration: 1.6, caption: key('caption.eyeRays') },
      { id: 'eye-image', duration: 1.2, ease: 'smooth', caption: key('caption.eyeGrow') },
      { id: 'eye-mark', duration: 0.35, ease: 'smooth', caption: key('caption.eyeImage') },
      { id: 'hold-eye', duration: 2.8, caption: key('caption.eyeImage') },
      { id: 'copy', duration: 0.5, ease: 'smooth', caption: key('caption.copy') },
      { id: 'stack', duration: 2.4, caption: key('caption.stack') },
      { id: 'total-mark', duration: 0.35, ease: 'smooth', caption: key('caption.total') },
      { id: 'hold-total', duration: 3.2, caption: key('caption.total') },
      { id: 'reset', duration: 1.2, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  /** 도착한 순간 첫 확대가 끝나 실상과 대물 막대 `×4` 가 서 있다 — `hold-obj` 안에서 연다 (S-piece). */
  startAt: 3.3,

  /**
   * 슬롯 하나. 그림 아래 가운데. `{m1}` · `{m2}` · `{m}` 은 state 의 정박값 글자를 가리킨다
   * (G133 우회, `state.ts`).
   */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
    vars: { m1: 'objectiveMag', m2: 'eyepieceMag', m: 'totalMag' },
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 견줄 것은 막대 칸 수와 화살표 길이다.

  messages: microscopeMessages,
};
