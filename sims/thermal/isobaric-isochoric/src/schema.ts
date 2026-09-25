// ========================================================================
// isobaric-isochoric — 선언
// ========================================================================
// 질문: 같은 열을 넣어도 무엇을 붙드느냐에 따라 기체는 어디로 가는가.
//
// 같은 처음 상태의 기체 두 통에 같은 열을 넣는다. 추를 얹은 자유 피스톤(압력 고정)은
// 부피가 늘어 P-V 그림에서 가로로 가고, 그 아래 넓이(일)가 칠해진다. 핀으로 고정한
// 피스톤(부피 고정)은 압력만 올라 세로로 가고, 그 아래 넓이는 0 이다. 일을 하지 않은
// 쪽의 온도 막대가 더 높이 오른다(3 : 5). 동사: (경로가) 갈린다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:isobaric-isochoric` 와 문자 그대로 일치한다 (C4). */
export const ISOBARIC_ISOCHORIC_ID = 'isobaric-isochoric';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const isobaricIsochoricMessages = Object.freeze({
  'label.title': {
    ko: '등압·등적 과정',
    en: 'Isobaric and isochoric processes',
    ja: '定圧過程と定積過程',
    zh: '等压过程与等容过程',
    ar: 'العمليتان متساوية الضغط ومتساوية الحجم',
    es: 'Procesos isobárico e isocórico',
    fr: 'Transformations isobare et isochore',
    hi: 'समदाबी और समआयतनी प्रक्रम',
    id: 'Proses isobarik dan isokhorik',
    pt: 'Processos isobárico e isocórico',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '압력 또는 부피를 고정한 변화',
    en: 'Changes at fixed pressure or fixed volume',
    ja: '圧力または体積を一定にした変化',
    zh: '压强或体积保持不变的变化',
    ar: 'تغيّرات عند ضغط ثابت أو حجم ثابت',
    es: 'Cambios a presión fija o a volumen fijo',
    fr: 'Transformations à pression fixe ou à volume fixe',
    hi: 'स्थिर दाब या स्थिर आयतन पर परिवर्तन',
    id: 'Perubahan pada tekanan tetap atau volume tetap',
    pt: 'Mudanças a pressão fixa ou a volume fixo',
  },
  'label.stage': {
    ko: '단원자 기체 두 통',
    en: 'Two cylinders of monatomic gas',
    ja: '単原子気体の入った二つのシリンダー',
    zh: '两个装有单原子气体的气缸',
    ar: 'أسطوانتان من غاز أحادي الذرة',
    es: 'Dos cilindros de gas monoatómico',
    fr: 'Deux cylindres de gaz monoatomique',
    hi: 'एकपरमाणुक गैस के दो सिलिंडर',
    id: 'Dua silinder berisi gas monoatomik',
    pt: 'Dois cilindros de gás monoatômico',
  },
  'label.view': {
    ko: 'P–V 그림과 두 실린더',
    en: 'P–V diagram and two cylinders',
    ja: 'P–V 図と二つのシリンダー',
    zh: 'P–V 图与两个气缸',
    ar: 'مخطط P–V والأسطوانتان',
    es: 'Diagrama P–V y dos cilindros',
    fr: 'Diagramme P–V et deux cylindres',
    hi: 'P–V आरेख और दो सिलिंडर',
    id: 'Diagram P–V dan dua silinder',
    pt: 'Diagrama P–V e dois cilindros',
  },

  'label.isobaric': {
    ko: '압력 고정',
    en: 'Fixed pressure',
    ja: '圧力一定',
    zh: '压强不变',
    ar: 'ضغط ثابت',
    es: 'Presión fija',
    fr: 'Pression fixe',
    hi: 'स्थिर दाब',
    id: 'Tekanan tetap',
    pt: 'Pressão fixa',
  },
  'label.isochoric': {
    ko: '부피 고정',
    en: 'Fixed volume',
    ja: '体積一定',
    zh: '体积不变',
    ar: 'حجم ثابت',
    es: 'Volumen fijo',
    fr: 'Volume fixe',
    hi: 'स्थिर आयतन',
    id: 'Volume tetap',
    pt: 'Volume fixo',
  },
  'label.rise': {
    ko: '+{dt} K',
    en: '+{dt} K',
    ja: '+{dt} K',
    zh: '+{dt} K',
    ar: '+{dt} K',
    es: '+{dt} K',
    fr: '+{dt} K',
    hi: '+{dt} K',
    id: '+{dt} K',
    pt: '+{dt} K',
  },

  'caption.intro': {
    ko: '같은 기체, 같은 {t0} K — 왼쪽 피스톤은 추를 얹고 자유롭게, 오른쪽 피스톤은 핀으로 고정했다',
    en: 'Same gas, same {t0} K — the left piston is free under a weight, the right one is pinned',
    ja: '同じ気体、同じ {t0} K — 左のピストンはおもりを載せて自由に動き、右のピストンはピンで固定してある',
    zh: '同样的气体，同样的 {t0} K — 左边的活塞压着重物、可以自由移动，右边的活塞用销钉固定',
    ar: 'الغاز نفسه، ودرجة الحرارة نفسها {t0} K — المكبس الأيسر حر تحت ثقل، والأيمن مثبّت بمسمار',
    es: 'El mismo gas, los mismos {t0} K — el pistón izquierdo se mueve libre bajo una pesa, el derecho está fijado con un pasador',
    fr: 'Même gaz, même {t0} K — le piston de gauche est libre sous une masse, celui de droite est bloqué par une goupille',
    hi: 'वही गैस, वही {t0} K — बायाँ पिस्टन एक भार के नीचे मुक्त है, दायाँ पिन से जकड़ा है',
    id: 'Gas yang sama, suhu {t0} K yang sama — piston kiri bebas di bawah beban, piston kanan dipasak',
    pt: 'O mesmo gás, os mesmos {t0} K — o pistão da esquerda fica livre sob um peso, o da direita está preso por um pino',
  },
  'caption.heat': {
    ko: '두 실린더에 같은 열을 넣는다 — 한 점은 가로로, 한 점은 세로로 간다',
    en: 'Both cylinders get the same heat — one state moves sideways, the other straight up',
    ja: '二つのシリンダーに同じ熱を入れる — 一方の状態は横に、もう一方はまっすぐ上に動く',
    zh: '给两个气缸加入同样多的热量 — 一个状态点横着走，另一个竖直向上走',
    ar: 'تتلقى الأسطوانتان الحرارة نفسها — تتحرك حالة إحداهما أفقيًا، والأخرى إلى أعلى مباشرة',
    es: 'Los dos cilindros reciben el mismo calor — un estado se mueve de lado, el otro hacia arriba',
    fr: 'Les deux cylindres reçoivent la même chaleur — un état se déplace à l’horizontale, l’autre tout droit vers le haut',
    hi: 'दोनों सिलिंडरों को समान ऊष्मा मिलती है — एक अवस्था बगल में खिसकती है, दूसरी सीधे ऊपर जाती है',
    id: 'Kedua silinder mendapat kalor yang sama — satu keadaan bergerak mendatar, yang lain lurus ke atas',
    pt: 'Os dois cilindros recebem o mesmo calor — um estado anda para o lado, o outro sobe em linha reta',
  },
  'caption.result': {
    ko: '같은 열에 압력 고정 쪽은 {dtp} K, 부피 고정 쪽은 {dtv} K 올랐다 — 칠해진 넓이는 가로선 아래뿐이다',
    en: 'Same heat: the fixed-pressure gas rose {dtp} K, the fixed-volume gas {dtv} K — only the sideways path has area under it',
    ja: '同じ熱で、圧力一定の気体は {dtp} K、体積一定の気体は {dtv} K 上がった — 下に面積があるのは横に進んだ経路だけだ',
    zh: '同样的热量：压强不变的气体升高了 {dtp} K，体积不变的气体升高了 {dtv} K — 只有横向路径下方有面积',
    ar: 'الحرارة نفسها: ارتفعت درجة حرارة الغاز ذي الضغط الثابت {dtp} K، والغاز ذي الحجم الثابت {dtv} K — المسار الأفقي وحده تحته مساحة',
    es: 'El mismo calor: el gas a presión fija subió {dtp} K, el gas a volumen fijo {dtv} K — solo la trayectoria lateral tiene área debajo',
    fr: 'Même chaleur : le gaz à pression fixe a gagné {dtp} K, le gaz à volume fixe {dtv} K — seul le chemin horizontal a une aire en dessous',
    hi: 'समान ऊष्मा: स्थिर दाब वाली गैस {dtp} K बढ़ी, स्थिर आयतन वाली गैस {dtv} K — क्षेत्रफल केवल बगल की ओर चले पथ के नीचे है',
    id: 'Kalor yang sama: gas bertekanan tetap naik {dtp} K, gas bervolume tetap {dtv} K — hanya lintasan mendatar yang punya luas di bawahnya',
    pt: 'O mesmo calor: o gás a pressão fixa subiu {dtp} K, o gás a volume fixo {dtv} K — só o caminho lateral tem área embaixo',
  },
} satisfies Record<string, LocalizedText>);

export type IsobaricIsochoricMessageKey = keyof typeof isobaricIsochoricMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: IsobaricIsochoricMessageKey): LocalizedText => isobaricIsochoricMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: IsobaricIsochoricMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const isobaricIsochoricSchema: BundleSchema = {
  id: ISOBARIC_ISOCHORIC_ID,
  label: text('label.title'),
  category: 'thermal',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],

  /**
   * 주장이 기대는 물리량 — 모두 선언이다.
   *
   * - `t0` 두 통의 처음 온도(K) · `v0` 처음 부피(L) · `p0` 처음 압력(P 축 한 칸)
   * - `dTp` 압력 고정(자유 피스톤) 쪽 온도 상승(K) · `dTv` 부피 고정(핀) 쪽 온도 상승(K).
   *   같은 열 Q 를 단원자 이상 기체에 넣으면 Q = 5/2·nR·dTp = 3/2·nR·dTv 이라 3 : 5 가
   *   되도록 골랐다(180 : 300). 두 값 사이의 관계는 선언할 자리가 없다(장부 G143).
   *
   * 끝 부피 · 끝 압력은 이상 기체의 배치 계산이다 — V = v0·T/t0, P = p0·T/t0.
   */
  stages: [
    {
      id: 'monatomic',
      label: text('label.stage'),
      constants: {
        t0: 300,
        v0: 1,
        p0: 1,
        dTp: 180,
        dTv: 300,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  canvas: { height: 380, minHeight: 340 },

  /** 쓴 순서대로 — 넓이가 축 · 길 아래에, 실린더 벽이 피스톤 · 핀 위에 온다. */
  drawOrder: 'scene',

  /** 한 판 — 두 통을 나란히 같은 시각에 데운다. */
  timeline: {
    phases: [
      { id: 'in', duration: 0.4, caption: key('caption.intro') },
      { id: 'show', duration: 1.6, caption: key('caption.intro') },
      { id: 'heat', duration: 4.2, ease: 'smooth', caption: key('caption.heat') },
      { id: 'hold', duration: 4.4, caption: key('caption.result') },
      { id: 'out', duration: 0.5, caption: key('caption.result') },
    ],
  },

  /** 도착한 순간 이미 두 점이 갈라져 가는 중이다. */
  startAt: 3.0,

  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -12] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 640,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: {
      t0: 't0Text',
      dtp: 'dTpText',
      dtv: 'dTvText',
    },
  },

  messages: isobaricIsochoricMessages,
};
