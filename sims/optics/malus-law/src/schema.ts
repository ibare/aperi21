// ========================================================================
// malus-law — 선언
// ========================================================================
// 질문: 편광된 빛이 검광판을 지날 때, 판을 기울인 각만큼 세기는 얼마나 줄어드는가.
//
// 세로로 떨리는 빛이 검광판에 닿는다. 판이 지나보내는 것은 진동 화살표의 **축 방향 성분**
// (투영)이고, 그 길이는 각이 커질수록 짧아진다. 그런데 세기 막대는 그 성분보다 더 빨리
// 내려간다 — 30° 에서 성분 0.87 · 세기 0.75, 60° 에서 성분 0.5 · 세기 0.25. 점선(성분)과
// 막대(세기) 사이가 벌어지는 것이 이 조각의 한가운데다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 이웃 `polarization` 은 세 장의 판으로 빛이 되살아나는 것을 보인다. 여기서는 판 하나의
// 각과 세기의 관계만 본다 — 3차원 비스듬 시점 대신 판을 정면에서 본다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:malus-law` 와 문자 그대로 일치한다 (C4). */
export const MALUS_LAW_ID = 'malus-law';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 검광판이 멈춰 서는 각(°) 다섯. 들어오는 진동(세로)과 판 축 사이의 각이다.
 * 목록을 스테이지 상수로 둘 수 없어 이름 다섯으로 흩는다 (장부 G105).
 */
export const DEG = [0, 30, 45, 60, 90] as const;
/** 각마다 지난 세기의 몫(들어온 세기 = 1). 화면 글자는 이 선언값 그대로 쓴다 (S-piece 유효숫자). */
export const INTENSITY = [1, 0.75, 0.5, 0.25, 0] as const;
/** 각마다 축 방향 성분의 몫(진동 화살표 = 1). 글자로 띄우는 정박값이다. */
export const COMPONENT = [1, 0.87, 0.71, 0.5, 0] as const;
/** 정박 자리 수. 단계 이름 · 상수 이름이 이 수만큼 있다. */
export const STOP_COUNT = DEG.length;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽 검광판 · 가운데 스크린 · 오른쪽 세기-각 판.
// ------------------------------------------------------------------------

/** 검광판(정면) 중심과 반지름. */
export const PLATE_CENTER: readonly [number, number] = [0, 0];
export const PLATE_R = 1.25;
/** 들어오는 진동 화살표의 반길이(= 성분 몫 1). 판 안에 들어가게 조금 짧다. */
export const VIB_HALF = 1.05;
/** 판의 결(투과축과 나란한 줄) 간격. */
export const HATCH_GAP = 0.22;
/** 각을 알리는 부채꼴 반지름 · 각 글자 자리 반지름. */
export const ANGLE_ARC_R = 0.5;
export const ANGLE_LABEL_R = 0.72;

/** 지난 빛이 닿는 스크린 — 가운데 x · 반폭 · 반높이. */
export const SCREEN_X = 2.15;
export const SCREEN_HALF_W = 0.34;
export const SCREEN_HALF_H = 0.62;

/** 세기-각 판 가로축이 담는 각(°) — 직각까지. */
export const PLOT_DEG_SPAN = 90;
/** 세기-각 판 — 원점(0°, 세기 0) · 가로 90° 길이 · 세로 세기 1 높이 · 양 끝 여유. */
export const PLOT_X0 = 3.35;
export const PLOT_Y0 = -1.1;
export const PLOT_W = 5.0;
export const PLOT_H = 2.3;
export const PLOT_PAD = 0.3;
/** 세로축이 세기 1 위로 더 올라가는 몫. */
export const PLOT_TOP_OVER = 0.18;
/** 막대 반폭. */
export const BAR_HALF_W = 0.17;
/** 눈금선 길이(축 아래로). */
export const TICK_LEN = 0.1;
/** 곡선 표본 수. 상태로 계산하지 않는다. */
export const CURVE_SAMPLES = 64;

/**
 * 프레이밍 — 검광판 이름표(왼쪽 위)부터 판 오른쪽 θ 글자까지, 위는 진동 이름표, 아래는 눈금 ·
 * 막대 값 두 줄과 캡션 줄. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -2.05, maxX: 9.2, minY: -2.45, maxY: 1.75 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const malusLawMessages = Object.freeze({
  'label.title': {
    ko: '말뤼스 법칙',
    en: "Malus's law",
    ja: 'マリュスの法則',
    zh: '马吕斯定律',
    ar: 'قانون مالوس',
    es: 'Ley de Malus',
    fr: 'Loi de Malus',
    hi: 'मैलस का नियम',
    id: 'Hukum Malus',
    pt: 'Lei de Malus',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '편광판을 지난 세기',
    en: 'Intensity through a polarizer',
    ja: '偏光板を通った光の強さ',
    zh: '透过偏振片的强度',
    ar: 'الشدة عبر المستقطِب',
    es: 'Intensidad a través de un polarizador',
    fr: 'Intensité à travers un polariseur',
    hi: 'ध्रुवक से होकर गई तीव्रता',
    id: 'Intensitas yang melewati polarisator',
    pt: 'Intensidade através de um polarizador',
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
  'label.analyzer': {
    ko: '검광판',
    en: 'Analyzer',
    ja: '検光子',
    zh: '检偏器',
    ar: 'المحلِّل',
    es: 'Analizador',
    fr: 'Analyseur',
    hi: 'विश्लेषक',
    id: 'Analisator',
    pt: 'Analisador',
  },
  'label.vibration': {
    ko: '들어온 진동',
    en: 'incoming',
    ja: '入射振動',
    zh: '入射振动',
    ar: 'الاهتزاز الوارد',
    es: 'vibración incidente',
    fr: 'vibration incidente',
    hi: 'आपतित कंपन',
    id: 'getaran datang',
    pt: 'vibração incidente',
  },
  'label.component': {
    ko: '축 방향 성분',
    en: 'along axis',
    ja: '軸方向',
    zh: '沿轴方向',
    ar: 'على امتداد المحور',
    es: 'a lo largo del eje',
    fr: 'selon l’axe',
    hi: 'अक्ष के अनुदिश',
    id: 'searah sumbu',
    pt: 'ao longo do eixo',
  },
  'label.screen': {
    ko: '스크린',
    en: 'screen',
    ja: 'スクリーン',
    zh: '光屏',
    ar: 'الشاشة',
    es: 'pantalla',
    fr: 'écran',
    hi: 'पर्दा',
    id: 'layar',
    pt: 'tela',
  },
  'label.componentCurve': {
    ko: '성분',
    en: 'component',
    ja: '成分',
    zh: '分量',
    ar: 'المركّبة',
    es: 'componente',
    fr: 'composante',
    hi: 'घटक',
    id: 'komponen',
    pt: 'componente',
  },
  'label.intensityCurve': {
    ko: '세기',
    en: 'intensity',
    ja: '強さ',
    zh: '强度',
    ar: 'الشدة',
    es: 'intensidad',
    fr: 'intensité',
    hi: 'तीव्रता',
    id: 'intensitas',
    pt: 'intensidade',
  },
  /** 각 · 값 표식. 기호 · 수라 두 언어가 같다 (C1 판정 3). */
  'label.deg': {
    ko: '{deg}°',
    en: '{deg}°',
    ja: '{deg}°',
    zh: '{deg}°',
    ar: '{deg}°',
    es: '{deg}°',
    fr: '{deg}°',
    hi: '{deg}°',
    id: '{deg}°',
    pt: '{deg}°',
  },
  'label.value': {
    ko: '{v}',
    en: '{v}',
    ja: '{v}',
    zh: '{v}',
    ar: '{v}',
    es: '{v}',
    fr: '{v}',
    hi: '{v}',
    id: '{v}',
    pt: '{v}',
  },
  'label.theta': {
    ko: 'θ',
    en: 'θ',
    ja: 'θ',
    zh: 'θ',
    ar: 'θ',
    es: 'θ',
    fr: 'θ',
    hi: 'θ',
    id: 'θ',
    pt: 'θ',
  },
  'caption.hold0': {
    ko: '두 축이 나란하다. 진동이 통째로 축 방향이라 세기 막대가 {i0} 에 선다.',
    en: 'The axes are parallel. The whole vibration lies along the axis, and the intensity bar stands at {i0}.',
    ja: '二つの軸は平行。振動はすべて軸方向なので、強さの棒は {i0} に立つ。',
    zh: '两个轴平行。振动全部沿轴方向，强度柱停在 {i0}。',
    ar: 'المحوران متوازيان. الاهتزاز كله على امتداد المحور، فيقف عمود الشدة عند {i0}.',
    es: 'Los ejes son paralelos. Toda la vibración está a lo largo del eje, y la barra de intensidad se sitúa en {i0}.',
    fr: 'Les axes sont parallèles. Toute la vibration est selon l’axe, et la barre d’intensité s’arrête à {i0}.',
    hi: 'दोनों अक्ष समांतर हैं। पूरा कंपन अक्ष के अनुदिश है, और तीव्रता की पट्टी {i0} पर खड़ी होती है।',
    id: 'Kedua sumbu sejajar. Seluruh getaran searah sumbu, dan batang intensitas berdiri di {i0}.',
    pt: 'Os eixos estão paralelos. Toda a vibração está ao longo do eixo, e a barra de intensidade fica em {i0}.',
  },
  'caption.turn': {
    ko: '검광판을 돌린다.',
    en: 'The analyzer turns.',
    ja: '検光子が回る。',
    zh: '检偏器转动。',
    ar: 'يدور المحلِّل.',
    es: 'El analizador gira.',
    fr: 'L’analyseur tourne.',
    hi: 'विश्लेषक घूमता है।',
    id: 'Analisator berputar.',
    pt: 'O analisador gira.',
  },
  'caption.hold1': {
    ko: '{d1}° — 축 방향 성분은 {a1} 인데 세기 막대는 {i1} 에 선다.',
    en: '{d1}° — the component along the axis is {a1}, but the intensity bar stands at {i1}.',
    ja: '{d1}° — 軸方向の成分は {a1} なのに、強さの棒は {i1} に立つ。',
    zh: '{d1}°——沿轴方向的分量是 {a1}，强度柱却停在 {i1}。',
    ar: '{d1}° — المركّبة على امتداد المحور {a1}، لكن عمود الشدة يقف عند {i1}.',
    es: '{d1}° — la componente a lo largo del eje es {a1}, pero la barra de intensidad se sitúa en {i1}.',
    fr: '{d1}° — la composante selon l’axe vaut {a1}, mais la barre d’intensité s’arrête à {i1}.',
    hi: '{d1}° — अक्ष के अनुदिश घटक {a1} है, पर तीव्रता की पट्टी {i1} पर खड़ी होती है।',
    id: '{d1}° — komponen searah sumbu {a1}, tetapi batang intensitas berdiri di {i1}.',
    pt: '{d1}° — a componente ao longo do eixo é {a1}, mas a barra de intensidade fica em {i1}.',
  },
  'caption.hold2': {
    ko: '{d2}° — 성분은 {a2}, 세기는 {i2}. 막대가 점선 아래로 더 내려섰다.',
    en: '{d2}° — component {a2}, intensity {i2}. The bar now sits further below the dashed curve.',
    ja: '{d2}° — 成分は {a2}、強さは {i2}。棒は点線の曲線よりさらに下にある。',
    zh: '{d2}°——分量 {a2}，强度 {i2}。强度柱落在虚线曲线下方更远处。',
    ar: '{d2}° — المركّبة {a2}، والشدة {i2}. صار العمود الآن أدنى من المنحنى المتقطع بمسافة أكبر.',
    es: '{d2}° — componente {a2}, intensidad {i2}. La barra queda ahora más por debajo de la curva discontinua.',
    fr: '{d2}° — composante {a2}, intensité {i2}. La barre est maintenant plus loin sous la courbe en pointillés.',
    hi: '{d2}° — घटक {a2}, तीव्रता {i2}। पट्टी अब बिंदुकित वक्र से और नीचे है।',
    id: '{d2}° — komponen {a2}, intensitas {i2}. Batang kini lebih jauh di bawah kurva putus-putus.',
    pt: '{d2}° — componente {a2}, intensidade {i2}. A barra agora fica mais abaixo da curva tracejada.',
  },
  'caption.hold3': {
    ko: '{d3}° — 성분은 화살표의 {a3} 인데 세기는 {i3} 다. 점선과 막대 사이가 가장 넓다.',
    en: '{d3}° — the component is {a3} of the arrow, yet the intensity is {i3}. The gap between curve and bar is widest here.',
    ja: '{d3}° — 成分は矢印の {a3} なのに、強さは {i3}。曲線と棒の間がここで最も広い。',
    zh: '{d3}°——分量是箭头的 {a3}，强度却是 {i3}。曲线与强度柱之间的差距在这里最大。',
    ar: '{d3}° — المركّبة {a3} من السهم، ومع ذلك فالشدة {i3}. الفجوة بين المنحنى والعمود هنا في أوسعها.',
    es: '{d3}° — la componente es {a3} de la flecha, pero la intensidad es {i3}. La separación entre curva y barra es aquí la mayor.',
    fr: '{d3}° — la composante vaut {a3} de la flèche, mais l’intensité est {i3}. L’écart entre la courbe et la barre est ici le plus grand.',
    hi: '{d3}° — घटक तीर का {a3} है, फिर भी तीव्रता {i3} है। वक्र और पट्टी के बीच का अंतर यहाँ सबसे चौड़ा है।',
    id: '{d3}° — komponennya {a3} dari panah, namun intensitasnya {i3}. Celah antara kurva dan batang paling lebar di sini.',
    pt: '{d3}° — a componente é {a3} da seta, mas a intensidade é {i3}. A distância entre a curva e a barra é a maior aqui.',
  },
  'caption.hold4': {
    ko: '{d4}° — 축이 진동과 직각이다. 축 방향 성분이 없고 세기 막대도 {i4} 이다. 스크린이 어둡다.',
    en: '{d4}° — the axis is perpendicular to the vibration. No component lies along it, the intensity bar is {i4}, and the screen is dark.',
    ja: '{d4}° — 軸が振動と垂直になる。軸方向の成分はなく、強さの棒は {i4}、スクリーンは暗い。',
    zh: '{d4}°——轴与振动垂直。沿轴没有分量，强度柱为 {i4}，光屏是暗的。',
    ar: '{d4}° — المحور عمودي على الاهتزاز. لا توجد مركّبة على امتداده، وعمود الشدة {i4}، والشاشة مظلمة.',
    es: '{d4}° — el eje es perpendicular a la vibración. No hay componente a lo largo de él, la barra de intensidad está en {i4} y la pantalla está oscura.',
    fr: '{d4}° — l’axe est perpendiculaire à la vibration. Aucune composante selon l’axe, la barre d’intensité est à {i4} et l’écran est sombre.',
    hi: '{d4}° — अक्ष कंपन के लंबवत है। इसके अनुदिश कोई घटक नहीं है, तीव्रता की पट्टी {i4} है, और पर्दा अँधेरा है।',
    id: '{d4}° — sumbu tegak lurus terhadap getaran. Tidak ada komponen searah sumbu, batang intensitas {i4}, dan layar gelap.',
    pt: '{d4}° — o eixo é perpendicular à vibração. Não há componente ao longo dele, a barra de intensidade está em {i4} e a tela fica escura.',
  },
  'caption.reset': {
    ko: '검광판을 처음 자리로 되돌린다.',
    en: 'The analyzer turns back to where it started.',
    ja: '検光子が最初の位置へ戻る。',
    zh: '检偏器转回起始位置。',
    ar: 'يعود المحلِّل إلى وضعه الأول.',
    es: 'El analizador vuelve a su posición inicial.',
    fr: 'L’analyseur revient à sa position de départ.',
    hi: 'विश्लेषक घूमकर अपनी शुरुआती स्थिति में लौटता है।',
    id: 'Analisator berputar kembali ke posisi semula.',
    pt: 'O analisador volta à posição inicial.',
  },
} satisfies Record<string, LocalizedText>);

export type MalusLawMessageKey = keyof typeof malusLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MalusLawMessageKey): LocalizedText => malusLawMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MalusLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const malusLawSchema: BundleSchema = {
  id: MALUS_LAW_ID,
  label: text('label.title'),
  category: 'optics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 판이 스스로 다섯 각을 차례로 돌며 막대를 세운다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        deg0: DEG[0],
        deg1: DEG[1],
        deg2: DEG[2],
        deg3: DEG[3],
        deg4: DEG[4],
        int0: INTENSITY[0],
        int1: INTENSITY[1],
        int2: INTENSITY[2],
        int3: INTENSITY[3],
        int4: INTENSITY[4],
        amp0: COMPONENT[0],
        amp1: COMPONENT[1],
        amp2: COMPONENT[2],
        amp3: COMPONENT[3],
        amp4: COMPONENT[4],
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁은 세 칸. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다. */
  canvas: { height: 360, minHeight: 330 },

  /** 겹침이 판정 장치다 — 결 · 축 위에 진동, 판 축 위에 막대, 막대 위에 곡선과 지금 점. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 0° 에 머묾 → 돌림 → 30° → 돌림 → 45° → 돌림 → 60° → 돌림 → 90° → 되돌림.
   * 판의 각은 `turn*` 단계의 진행도로만 움직이고, 막대는 `hold*` 단계가 시작될 때 선다.
   */
  timeline: {
    phases: [
      { id: 'hold0', duration: 2.2, caption: key('caption.hold0') },
      { id: 'turn1', duration: 1.0, ease: 'smooth', caption: key('caption.turn') },
      { id: 'hold1', duration: 2.8, caption: key('caption.hold1') },
      { id: 'turn2', duration: 0.8, ease: 'smooth', caption: key('caption.turn') },
      { id: 'hold2', duration: 2.6, caption: key('caption.hold2') },
      { id: 'turn3', duration: 0.8, ease: 'smooth', caption: key('caption.turn') },
      { id: 'hold3', duration: 3.4, caption: key('caption.hold3') },
      { id: 'turn4', duration: 1.0, ease: 'smooth', caption: key('caption.turn') },
      { id: 'hold4', duration: 2.8, caption: key('caption.hold4') },
      { id: 'reset', duration: 1.4, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  /** 도착한 순간 이미 0° 막대가 서 있고 곧 판이 돌기 시작한다. */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 보이는 사실만 말한다 — 식과 법칙 문장은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [0, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    fade: 0.25,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: {
      i0: 'int0',
      d1: 'deg1',
      a1: 'amp1',
      i1: 'int1',
      d2: 'deg2',
      a2: 'amp2',
      i2: 'int2',
      d3: 'deg3',
      a3: 'amp3',
      i3: 'int3',
      d4: 'deg4',
      i4: 'int4',
    },
  },

  // 그리드 · 카메라 단추 없음(기본). 잴 것은 거리가 아니라 막대와 점선의 높이 차다.

  messages: malusLawMessages,
};
