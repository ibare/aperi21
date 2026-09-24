// ========================================================================
// pv-diagram — 선언
// ========================================================================
// 질문: 같은 처음(A)과 끝(B) 사이를 가는데, 기체가 한 일은 길마다 같은가.
//
// P-V 그림에서 A → B 를 두 길로 간다. 먼저 부피를 늘리고 압력을 낮추는 길(a)과
// 먼저 압력을 낮추고 부피를 늘리는 길(b). 지나온 길 아래가 칠해지고, 옆 실린더에서는
// 받침 위 추가 올라간다. 압력은 받침에 얹힌 추의 개수라서, 칠해진 넓이의 띠 수와
// 올라간 추의 수가 같다 — a 는 3, b 는 1. 동사: (넓이가) 다르게 칠해진다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:pv-diagram` 와 문자 그대로 일치한다 (C4). */
export const PV_DIAGRAM_ID = 'pv-diagram';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const pvDiagramMessages = Object.freeze({
  'label.title': {
    ko: 'PV 그림',
    en: 'PV diagram',
    ja: 'PV 図',
    zh: 'PV 图',
    ar: 'مخطط PV',
    es: 'Diagrama PV',
    fr: 'Diagramme PV',
    hi: 'PV आरेख',
    id: 'Diagram PV',
    pt: 'Diagrama PV',
  },
  'label.operation': {
    ko: '넓이가 일인 표현',
    en: 'Where area is work',
    ja: '面積が仕事になる図',
    zh: '面积即是功',
    ar: 'حيث تكون المساحة شغلًا',
    es: 'Donde el área es trabajo',
    fr: 'Là où l’aire est un travail',
    hi: 'जहाँ क्षेत्रफल ही कार्य है',
    id: 'Tempat luas adalah usaha',
    pt: 'Onde a área é trabalho',
  },
  'label.stage': {
    ko: '추를 얹은 기체',
    en: 'Gas under weights',
    ja: 'おもりを載せた気体',
    zh: '压着重物的气体',
    ar: 'غاز تحت أثقال',
    es: 'Gas bajo pesas',
    fr: 'Gaz sous des poids',
    hi: 'भारों के नीचे गैस',
    id: 'Gas di bawah beban',
    pt: 'Gás sob pesos',
  },
  'label.view': {
    ko: 'P–V 그림과 실린더',
    en: 'P–V diagram and cylinder',
    ja: 'P–V 図とシリンダー',
    zh: 'P–V 图与气缸',
    ar: 'مخطط P–V والأسطوانة',
    es: 'Diagrama P–V y cilindro',
    fr: 'Diagramme P–V et cylindre',
    hi: 'P–V आरेख और सिलिंडर',
    id: 'Diagram P–V dan silinder',
    pt: 'Diagrama P–V e cilindro',
  },

  'label.heat': {
    ko: '가열',
    en: 'Heating',
    ja: '加熱',
    zh: '加热',
    ar: 'تسخين',
    es: 'Calentamiento',
    fr: 'Chauffage',
    hi: 'तापन',
    id: 'Pemanasan',
    pt: 'Aquecimento',
  },
  'label.cool': {
    ko: '식힘',
    en: 'Cooling',
    ja: '冷却',
    zh: '冷却',
    ar: 'تبريد',
    es: 'Enfriamiento',
    fr: 'Refroidissement',
    hi: 'शीतलन',
    id: 'Pendinginan',
    pt: 'Resfriamento',
  },

  'caption.a.intro': {
    ko: '상태 A — 피스톤 받침에 추 {na}개',
    en: 'State A — {na} weights on the piston',
    ja: '状態 A — ピストンにおもり{na}個',
    zh: '状态 A — 活塞上有{na}个重物',
    ar: 'الحالة A — {na} أثقال على المكبس',
    es: 'Estado A — {na} pesas sobre el pistón',
    fr: 'État A — {na} poids sur le piston',
    hi: 'अवस्था A — पिस्टन पर {na} भार',
    id: 'Keadaan A — {na} beban di atas piston',
    pt: 'Estado A — {na} pesos sobre o pistão',
  },
  'caption.a.expand': {
    ko: '추 {na}개를 얹은 채 데워 부피를 늘린다 — 지나온 길 아래가 칠해진다',
    en: 'Heating with all {na} weights on — the volume grows and the area under the path fills',
    ja: 'おもり{na}個をすべて載せたまま加熱する — 体積が増え、たどった道の下の面積が塗られていく',
    zh: '放着全部{na}个重物加热 — 体积增大，路径下方的面积被涂满',
    ar: 'تسخين مع بقاء الأثقال الـ{na} كلها — يزداد الحجم وتمتلئ المساحة تحت المسار',
    es: 'Calentando con las {na} pesas encima — el volumen crece y el área bajo la trayectoria se rellena',
    fr: 'Chauffage avec les {na} poids en place — le volume augmente et l’aire sous le chemin se remplit',
    hi: 'सभी {na} भार रखे हुए गर्म करना — आयतन बढ़ता है और पथ के नीचे का क्षेत्रफल भरता है',
    id: 'Memanaskan dengan semua {na} beban terpasang — volume bertambah dan luas di bawah lintasan terisi',
    pt: 'Aquecendo com todos os {na} pesos em cima — o volume cresce e a área sob o caminho se preenche',
  },
  'caption.drop': {
    ko: '부피를 그대로 두고 식히며 추를 하나씩 선반에 내린다 — 칠해지는 넓이가 없다',
    en: 'Volume held, cooling and sliding weights off one at a time — no area fills',
    ja: '体積を保ったまま冷やし、おもりを一つずつ滑らせて外す — 塗られる面積はない',
    zh: '保持体积不变，一边冷却一边把重物逐个移到架子上 — 没有面积被涂上',
    ar: 'الحجم ثابت، والتبريد مع إزاحة الأثقال واحدًا تلو الآخر — لا تمتلئ أي مساحة',
    es: 'Volumen fijo, enfriando y retirando las pesas una a una — no se rellena ningún área',
    fr: 'Volume maintenu, on refroidit en retirant les poids un à un — aucune aire ne se remplit',
    hi: 'आयतन स्थिर, ठंडा करते हुए भार एक-एक करके हटाए जाते हैं — कोई क्षेत्रफल नहीं भरता',
    id: 'Volume tetap, didinginkan sambil beban digeser keluar satu per satu — tidak ada luas yang terisi',
    pt: 'Volume mantido, resfriando e tirando os pesos um a um — nenhuma área se preenche',
  },
  'caption.a.result': {
    ko: 'B 에 닿았다 — 추 {na}개가 모두 올라갔고, 칠해진 넓이는 {na}띠',
    en: 'At B — all {na} weights were raised, and {na} bands are shaded',
    ja: 'B に着いた — おもり{na}個がすべて持ち上げられ、塗られた帯は{na}本',
    zh: '到达 B — 全部{na}个重物都被抬升，涂色的带有{na}条',
    ar: 'عند B — رُفعت الأثقال الـ{na} كلها، وظُلِّلت {na} أشرطة',
    es: 'En B — se elevaron las {na} pesas y hay {na} franjas sombreadas',
    fr: 'En B — les {na} poids ont été soulevés et {na} bandes sont colorées',
    hi: 'B पर — सभी {na} भार ऊपर उठे, और {na} पट्टियाँ छायांकित हैं',
    id: 'Di B — semua {na} beban terangkat, dan {na} pita diarsir',
    pt: 'Em B — os {na} pesos foram erguidos e {na} faixas estão sombreadas',
  },
  'caption.b.intro': {
    ko: '다시 상태 A, 추 {na}개 — 점선은 앞의 길과 넓이',
    en: 'Back at state A with {na} weights — dashed: the previous path and area',
    ja: 'ふたたび状態 A、おもり{na}個 — 点線は前の道と面積',
    zh: '回到状态 A，{na}个重物 — 虚线是前一条路径和面积',
    ar: 'العودة إلى الحالة A مع {na} أثقال — المتقطع: المسار السابق ومساحته',
    es: 'De vuelta en el estado A con {na} pesas — en trazos: la trayectoria y el área anteriores',
    fr: 'Retour à l’état A avec {na} poids — en pointillés : le chemin et l’aire précédents',
    hi: '{na} भारों के साथ फिर अवस्था A — बिंदुदार: पिछला पथ और क्षेत्रफल',
    id: 'Kembali ke keadaan A dengan {na} beban — garis putus-putus: lintasan dan luas sebelumnya',
    pt: 'De volta ao estado A com {na} pesos — tracejado: o caminho e a área anteriores',
  },
  'caption.b.expand': {
    ko: '추 {nb}개만 얹은 채 데워 부피를 늘린다 — 지나온 길 아래가 칠해진다',
    en: 'Heating with only {nb} left on — the volume grows and the area under the path fills',
    ja: 'おもりを{nb}個だけ載せたまま加熱する — 体積が増え、たどった道の下の面積が塗られていく',
    zh: '只留{nb}个重物加热 — 体积增大，路径下方的面积被涂满',
    ar: 'تسخين مع بقاء {nb} أثقال فقط — يزداد الحجم وتمتلئ المساحة تحت المسار',
    es: 'Calentando con solo {nb} pesas encima — el volumen crece y el área bajo la trayectoria se rellena',
    fr: 'Chauffage avec seulement {nb} poids — le volume augmente et l’aire sous le chemin se remplit',
    hi: 'केवल {nb} भार रखे हुए गर्म करना — आयतन बढ़ता है और पथ के नीचे का क्षेत्रफल भरता है',
    id: 'Memanaskan dengan hanya {nb} beban tersisa — volume bertambah dan luas di bawah lintasan terisi',
    pt: 'Aquecendo com só {nb} pesos em cima — o volume cresce e a área sob o caminho se preenche',
  },
  'caption.b.result': {
    ko: '같은 B 에 닿았다 — 이번에는 추 {nb}개가 올라갔고 넓이는 {nb}띠, 앞의 길은 {na}띠',
    en: 'The same B — weights raised this time: {nb}, bands shaded: {nb} (the other path: {na})',
    ja: '同じ B — 今回持ち上げたおもり：{nb}個、塗られた帯：{nb}本（もう一つの道：{na}本）',
    zh: '同一个 B — 这次抬升的重物：{nb}个，涂色的带：{nb}条（另一条路径：{na}条）',
    ar: 'B نفسها — الأثقال المرفوعة هذه المرة: {nb}، والأشرطة المظللة: {nb} (المسار الآخر: {na})',
    es: 'El mismo B — pesas elevadas esta vez: {nb}, franjas sombreadas: {nb} (la otra trayectoria: {na})',
    fr: 'Le même B — poids soulevés cette fois : {nb}, bandes colorées : {nb} (l’autre chemin : {na})',
    hi: 'वही B — इस बार उठाए गए भार: {nb}, छायांकित पट्टियाँ: {nb} (दूसरा पथ: {na})',
    id: 'B yang sama — beban terangkat kali ini: {nb}, pita diarsir: {nb} (lintasan lain: {na})',
    pt: 'O mesmo B — pesos erguidos desta vez: {nb}, faixas sombreadas: {nb} (o outro caminho: {na})',
  },
} satisfies Record<string, LocalizedText>);

export type PvDiagramMessageKey = keyof typeof pvDiagramMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PvDiagramMessageKey): LocalizedText => pvDiagramMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PvDiagramMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const pvDiagramSchema: BundleSchema = {
  id: PV_DIAGRAM_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],

  /**
   * 두 상태 — 모두 선언이다.
   *
   * - `blocksA` 상태 A 의 추 개수 · `blocksB` 상태 B 의 추 개수. 피스톤 위가 진공이고
   *   피스톤 · 받침의 무게를 치지 않으므로 **압력 = 추 개수 × 추 하나의 압력** 이다.
   *   P 축의 단위가 추 하나다.
   * - `v1` 상태 A 의 부피 · `v2` 상태 B 의 부피 (L).
   *
   * 추를 하나 내릴 때마다 단계가 하나다 — 시간표의 `a-drop*` · `b-drop*` 수가
   * `blocksA − blocksB` 와 같아야 한다 (장부 G13).
   */
  stages: [
    {
      id: 'weights',
      label: text('label.stage'),
      constants: {
        blocksA: 3,
        blocksB: 1,
        v1: 1,
        v2: 3,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  canvas: { height: 380, minHeight: 340 },

  /** 쓴 순서대로 — 넓이가 축 · 길 아래에, 실린더 벽이 피스톤 위에, 옮겨 가는 추가 맨 위에 온다. */
  drawOrder: 'scene',

  /**
   * 두 길을 차례로. 길의 모양은 **단계의 순서** 가 정한다 — a 는 늘림 다음 내림,
   * b 는 내림 다음 늘림. scene 은 단계가 시작하는 시각 순서대로 다리를 잇는다.
   */
  timeline: {
    phases: [
      { id: 'a-in', duration: 0.4, caption: key('caption.a.intro') },
      { id: 'a-show', duration: 1.2, caption: key('caption.a.intro') },
      { id: 'a-expand', duration: 2.6, ease: 'smooth', caption: key('caption.a.expand') },
      { id: 'a-drop1', duration: 1.0, ease: 'smooth', caption: key('caption.drop') },
      { id: 'a-drop2', duration: 1.0, ease: 'smooth', caption: key('caption.drop') },
      { id: 'a-hold', duration: 2.8, caption: key('caption.a.result') },
      { id: 'a-out', duration: 0.5, caption: key('caption.a.result') },
      { id: 'b-in', duration: 0.4, caption: key('caption.b.intro') },
      { id: 'b-show', duration: 1.4, caption: key('caption.b.intro') },
      { id: 'b-drop1', duration: 1.0, ease: 'smooth', caption: key('caption.drop') },
      { id: 'b-drop2', duration: 1.0, ease: 'smooth', caption: key('caption.drop') },
      { id: 'b-expand', duration: 2.6, ease: 'smooth', caption: key('caption.b.expand') },
      { id: 'b-hold', duration: 3.4, caption: key('caption.b.result') },
      { id: 'b-out', duration: 0.5, caption: key('caption.b.result') },
    ],
  },

  /** 도착한 순간 이미 추 세 개가 올라가는 중이다. */
  startAt: 2.2,

  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -12] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 640,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: {
      na: 'nAText',
      nb: 'nBText',
    },
  },

  messages: pvDiagramMessages,
};
