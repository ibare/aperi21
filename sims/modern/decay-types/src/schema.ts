// ========================================================================
// decay-types — 선언
// ========================================================================
// 질문: 붕괴에서 나오는 세 방사선은 무엇이 다른가?
//
// 답: **뚫고 나가는 힘이 다르다.** 같은 원천에서 나온 α · β · γ 가 종이 한 장,
// 알루미늄 몇 mm, 두꺼운 납을 차례로 만나면 — 종이가 α 를 멈추고, 알루미늄이 β 를
// 멈추고, 납은 γ 를 크게 줄일 뿐 다 막지는 못한다.
//
// 화면에서는 세 줄의 방사선이 왼쪽 원천에서 오른쪽으로 쉬지 않고 흐른다. 처음에는
// 막는 것이 없어 셋 다 끝까지 가고, 벽이 하나씩 들어설 때마다 한 줄씩 그 벽에서
// 끊긴다. 반감기(얼마나 빨리 붕괴하나)는 이웃 `radioactive-decay` 의 몫이라 두지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:decay-types` 와 문자 그대로 일치한다 (C4). */
export const DECAY_TYPES_ID = 'decay-types';

// ------------------------------------------------------------------------
// 물리량 · 연출량 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 결정적 난수의 시드. 알갱이마다 나오는 시각 · 높이 · 멈추는 깊이를 (시드, 줄, 번호)로 뽑는다. */
export const SEED = 7;
/**
 * 화면 속력(월드/초). 실제로는 α 가 빛의 몇 %, β 가 빛에 가깝고, γ 는 빛이다 — 화면이 따라갈 수
 * 없어 늦췄다. 순서(α < β < γ)만 참이다. 화면에 알리지 않는다 (NOTES b).
 */
export const ALPHA_SPEED = 2.0;
export const BETA_SPEED = 3.6;
export const GAMMA_SPEED = 4.8;
/** 줄마다 알갱이가 나오는 평균 간격(초). γ 는 납을 뚫는 몫이 보이도록 촘촘하다. */
export const ALPHA_INTERVAL = 0.26;
export const BETA_INTERVAL = 0.2;
export const GAMMA_INTERVAL = 0.075;
/** 알루미늄 두께(mm) — 벽 이름표에 그대로 뜬다. */
export const AL_MM = 5;
/** 납 두께(cm) — 벽 이름표에 그대로 뜬다. */
export const LEAD_CM = 2;
/**
 * 납에서 γ 의 감쇠 계수(1/cm). 코발트-60 의 γ(약 1.25 MeV) 값이다. 흡수 깊이를 지수 분포로 뽑으므로
 * 납 2 cm 를 뚫는 몫은 e^(−1.34) ≈ 1/4 — 이 수는 화면에 띄우지 않고 뚫고 나간 물결의 수로 보인다.
 */
export const GAMMA_MU_PER_CM = 0.67;
/** β 가 알루미늄 안에서 멈추는 깊이의 범위 — 두께에 대한 비. 비정(range)의 흩어짐이다. */
export const BETA_STOP_MIN = 0.25;
export const BETA_STOP_MAX = 0.85;
/** 멈춘 α · β 가 제자리에 남아 옅어지기까지(초). */
export const STUCK_LIFE = 1.4;
/** 멈춘 자리에 퍼지는 고리가 사라지기까지(초). */
export const RING_LIFE = 0.55;

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 임의. 원점은 원천의 오른쪽 가장자리 · 가운데 줄.
// 벽 두께는 축척이 아니다(종이 0.1 mm · 납 20 mm 를 한 화면에 둘 수 없다). 두께는 이름표가 말한다.
// ------------------------------------------------------------------------

/** 세 줄의 높이 — α · β · γ 순. */
export const LANE_Y = [1.2, 0, -1.2] as const;
/** 한 줄 안에서 알갱이가 흩어지는 반폭(월드). */
export const LANE_SPREAD = 0.2;
/** 알갱이가 나오는 x · 사라지는 x. */
export const EMIT_X = 0;
export const LANE_END_X = 10.6;
/** 원천 블록의 왼쪽 가장자리 x. */
export const SOURCE_LEFT = -0.75;
/** 벽 · 원천의 위아래 끝. */
export const WALL_TOP = 1.75;
export const WALL_BOTTOM = -1.75;
/** 세 벽의 왼쪽 면 x 와 그린 두께(월드) — 종이 · 알루미늄 · 납 순. */
export const WALL_X = [1.9, 3.6, 5.2] as const;
export const WALL_W = [0.06, 0.4, 1.0] as const;
/** 벽 · 원천 이름표의 높이. */
export const WALL_LABEL_Y = -2.08;

/**
 * 고정 경계. 아래로 캡션 한 줄 자리를 더 잡는다 — 캡션 슬롯은 프레이밍 여백으로
 * 잡히지 않는다 (장부 G24).
 */
export const SCENE_BOUNDS = { minX: -1.1, maxX: 10.9, minY: -2.9, maxY: 1.95 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const decayTypesMessages = Object.freeze({
  'label.title': {
    ko: '붕괴의 종류',
    en: 'Types of decay radiation',
    ja: '崩壊で出る放射線の種類',
    zh: '衰变辐射的种类',
    ar: 'أنواع إشعاعات الاضمحلال',
    es: 'Tipos de radiación de desintegración',
    fr: 'Types de rayonnement de désintégration',
    hi: 'क्षय विकिरण के प्रकार',
    id: 'Jenis radiasi peluruhan',
    pt: 'Tipos de radiação de decaimento',
  },
  'label.operation': {
    ko: '알파·베타·감마',
    en: 'Alpha, beta, gamma',
    ja: 'アルファ・ベータ・ガンマ',
    zh: '阿尔法、贝塔、伽马',
    ar: 'ألفا وبيتا وغاما',
    es: 'Alfa, beta, gamma',
    fr: 'Alpha, bêta, gamma',
    hi: 'अल्फ़ा, बीटा, गामा',
    id: 'Alfa, beta, gama',
    pt: 'Alfa, beta, gama',
  },
  'label.stage': {
    ko: '종이 · 알루미늄 · 납',
    en: 'Paper, aluminium, lead',
    ja: '紙・アルミニウム・鉛',
    zh: '纸、铝、铅',
    ar: 'ورق وألومنيوم ورصاص',
    es: 'Papel, aluminio, plomo',
    fr: 'Papier, aluminium, plomb',
    hi: 'कागज़, ऐल्युमिनियम, सीसा',
    id: 'Kertas, aluminium, timbal',
    pt: 'Papel, alumínio, chumbo',
  },
  'label.view': {
    ko: '세 벽',
    en: 'Three absorbers',
    ja: '三つの吸収体',
    zh: '三种吸收体',
    ar: 'ثلاثة ممتصات',
    es: 'Tres absorbentes',
    fr: 'Trois absorbeurs',
    hi: 'तीन अवशोषक',
    id: 'Tiga penyerap',
    pt: 'Três absorvedores',
  },

  /** 기호 하나를 그대로 띄우는 자리. α · β · γ 는 표식이다 (C1 판정 3). */
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

  'label.source': {
    ko: '방사선원',
    en: 'source',
    ja: '線源',
    zh: '放射源',
    ar: 'المصدر',
    es: 'fuente',
    fr: 'source',
    hi: 'स्रोत',
    id: 'sumber',
    pt: 'fonte',
  },
  'label.paper': {
    ko: '종이',
    en: 'paper',
    ja: '紙',
    zh: '纸',
    ar: 'ورق',
    es: 'papel',
    fr: 'papier',
    hi: 'कागज़',
    id: 'kertas',
    pt: 'papel',
  },
  'label.aluminium': {
    ko: '알루미늄 {mm} mm',
    en: 'aluminium {mm} mm',
    ja: 'アルミニウム {mm} mm',
    zh: '铝 {mm} mm',
    ar: 'ألومنيوم {mm} mm',
    es: 'aluminio {mm} mm',
    fr: 'aluminium {mm} mm',
    hi: 'ऐल्युमिनियम {mm} mm',
    id: 'aluminium {mm} mm',
    pt: 'alumínio {mm} mm',
  },
  'label.lead': {
    ko: '납 {cm} cm',
    en: 'lead {cm} cm',
    ja: '鉛 {cm} cm',
    zh: '铅 {cm} cm',
    ar: 'رصاص {cm} cm',
    es: 'plomo {cm} cm',
    fr: 'plomb {cm} cm',
    hi: 'सीसा {cm} cm',
    id: 'timbal {cm} cm',
    pt: 'chumbo {cm} cm',
  },

  'caption.open': {
    ko: '같은 원천에서 α · β · γ 가 함께 나온다 — 막는 것이 없으니 셋 다 끝까지 간다.',
    en: 'α, β and γ leave the same source — with nothing in the way, all three reach the far side.',
    ja: '同じ線源から α・β・γ が出る — さえぎるものがないので、三つとも向こう端まで届く。',
    zh: 'α、β 和 γ 从同一个放射源射出 — 没有任何阻挡，三者都到达远端。',
    ar: 'تنطلق α وβ وγ من المصدر نفسه — ولا شيء يعترضها، فتبلغ الثلاثة الطرف البعيد.',
    es: 'α, β y γ salen de la misma fuente — sin nada en medio, las tres llegan al otro extremo.',
    fr: 'α, β et γ quittent la même source — rien ne les arrête, et les trois atteignent l’autre bout.',
    hi: 'α, β और γ एक ही स्रोत से निकलते हैं — रास्ते में कुछ न होने से तीनों दूसरे छोर तक पहुँचते हैं।',
    id: 'α, β, dan γ keluar dari sumber yang sama — tanpa penghalang, ketiganya sampai ke ujung seberang.',
    pt: 'α, β e γ saem da mesma fonte — sem nada no caminho, as três chegam ao outro lado.',
  },
  'caption.paper': {
    ko: '종이 한 장이 α 를 멈춘다 — β 와 γ 는 그대로 지나간다.',
    en: 'A single sheet of paper stops α — β and γ pass straight through.',
    ja: '紙一枚が α を止める — β と γ はそのまま通り抜ける。',
    zh: '一张纸就挡住了 α — β 和 γ 径直穿过。',
    ar: 'ورقة واحدة توقف α — وتعبرها β وγ مباشرةً.',
    es: 'Una sola hoja de papel detiene α — β y γ la atraviesan sin más.',
    fr: 'Une simple feuille de papier arrête α — β et γ la traversent tout droit.',
    hi: 'कागज़ की एक शीट α को रोक देती है — β और γ सीधे पार निकल जाते हैं।',
    id: 'Selembar kertas menghentikan α — β dan γ lewat begitu saja.',
    pt: 'Uma única folha de papel para α — β e γ passam direto.',
  },
  'caption.alu': {
    ko: '알루미늄 {al} mm 가 β 를 멈춘다 — γ 는 여전히 지나간다.',
    en: '{al} mm of aluminium stops β — γ still gets through.',
    ja: 'アルミニウム {al} mm が β を止める — γ はまだ通り抜ける。',
    zh: '{al} mm 厚的铝挡住了 β — γ 仍能穿过。',
    ar: '{al} mm من الألومنيوم توقف β — وما تزال γ تعبر.',
    es: '{al} mm de aluminio detienen β — γ sigue pasando.',
    fr: '{al} mm d’aluminium arrêtent β — γ passe encore.',
    hi: '{al} mm ऐल्युमिनियम β को रोक देता है — γ फिर भी पार निकल जाता है।',
    id: 'Aluminium {al} mm menghentikan β — γ masih bisa lewat.',
    pt: '{al} mm de alumínio param β — γ ainda passa.',
  },
  'caption.lead': {
    ko: '납 {pb} cm 가 γ 를 대부분 삼킨다 — 그래도 일부는 뚫고 나간다.',
    en: '{pb} cm of lead absorbs most of the γ — but some still gets through.',
    ja: '鉛 {pb} cm が γ の大部分を吸収する — それでも一部は突き抜ける。',
    zh: '{pb} cm 厚的铅吸收了大部分 γ — 但仍有一部分穿过。',
    ar: '{pb} cm من الرصاص تمتص معظم γ — لكن بعضها ما يزال يعبر.',
    es: '{pb} cm de plomo absorben la mayor parte de γ — pero una parte aún pasa.',
    fr: '{pb} cm de plomb absorbent l’essentiel de γ — mais une partie passe encore.',
    hi: '{pb} cm सीसा γ का अधिकांश भाग अवशोषित कर लेता है — फिर भी कुछ पार निकल जाता है।',
    id: 'Timbal {pb} cm menyerap sebagian besar γ — tetapi sebagian masih bisa lewat.',
    pt: '{pb} cm de chumbo absorvem a maior parte de γ — mas uma parte ainda passa.',
  },
} satisfies Record<string, LocalizedText>);

export type DecayTypesMessageKey = keyof typeof decayTypesMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DecayTypesMessageKey): LocalizedText => decayTypesMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DecayTypesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const decayTypesSchema: BundleSchema = {
  id: DECAY_TYPES_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 벽이 하나씩 들어서는 자동 진행만으로 주장이 끝난다.
  parameters: [],
  stages: [
    {
      id: 'paper-aluminium-lead',
      label: text('label.stage'),
      constants: {
        seed: SEED,
        alphaSpeed: ALPHA_SPEED,
        betaSpeed: BETA_SPEED,
        gammaSpeed: GAMMA_SPEED,
        alphaInterval: ALPHA_INTERVAL,
        betaInterval: BETA_INTERVAL,
        gammaInterval: GAMMA_INTERVAL,
        alMm: AL_MM,
        leadCm: LEAD_CM,
        gammaMuPerCm: GAMMA_MU_PER_CM,
        betaStopMin: BETA_STOP_MIN,
        betaStopMax: BETA_STOP_MAX,
        stuckLife: STUCK_LIFE,
        ringLife: RING_LIFE,
      },
    },
  ],
  environments: [],
  views: [{ id: 'three-absorbers', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 세 줄을 한 화면에 눕힌다. 세로는 세 줄 · 이름표 · 캡션 한 줄. */
  canvas: { height: 360, minHeight: 320 },

  /** 쓴 순서대로 겹친다 — 벽 위에 알갱이, 그 위에 멈춘 자리 고리. */
  drawOrder: 'scene',

  /** 도착한 순간 세 줄이 이미 끝까지 차 있다 (S-piece). 알갱이는 시각의 함수라 음의 시각에 나온 것도 있다. */
  startAt: 1.0,

  /**
   * 한 주기 14.05 초. 벽은 쌓인다 — 알루미늄이 들어설 때 종이는 그대로 있다.
   *
   * - `open` — 벽이 없다. 세 줄이 모두 오른쪽 끝까지 간다.
   * - `paperIn` · `paper` — 종이가 들어선다. α 가 그 앞에서 멈춘다.
   * - `aluIn` · `alu` — 알루미늄이 들어선다. β 가 그 안에서 멈춘다.
   * - `leadIn` · `lead` — 납이 들어선다. γ 가 대부분 그 안에서 흡수되고 일부만 뚫고 나간다.
   * - `clear` — 세 벽이 물러난다. 다음 주기의 `open` 으로 잇는다.
   *
   * 벽이 알갱이를 막는 것은 `…In` 단계가 **끝난 뒤**부터, `clear` 가 **시작하기 전**까지다.
   */
  timeline: {
    phases: [
      { id: 'open', duration: 2.2, caption: key('caption.open') },
      { id: 'paperIn', duration: 0.35, ease: 'smooth', caption: key('caption.paper') },
      { id: 'paper', duration: 4.0, caption: key('caption.paper') },
      { id: 'aluIn', duration: 0.35, ease: 'smooth', caption: key('caption.alu') },
      { id: 'alu', duration: 2.6, caption: key('caption.alu') },
      { id: 'leadIn', duration: 0.35, ease: 'smooth', caption: key('caption.lead') },
      { id: 'lead', duration: 3.6, caption: key('caption.lead') },
      { id: 'clear', duration: 0.6, ease: 'smooth', caption: key('caption.lead') },
    ],
  },

  /** 슬롯 하나. 두께 수는 state 가 스테이지 상수에서 만들어 둔다 (장부 G133). */
  caption: {
    anchor: { screen: 'bottom-left', offset: [4, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: { al: 'caption.al', pb: 'caption.pb' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 재는 것이 거리가 아니다 (S-piece).

  messages: decayTypesMessages,
};
