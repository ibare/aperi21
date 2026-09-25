// ========================================================================
// charge-on-conductor-surface — 선언
// ========================================================================
// 질문: 도체에 준 전하는 어디에 자리 잡는가?
//
// 답: 도체 한가운데에 넣은 + 전하 알갱이들은 서로 밀어 바깥으로 퍼지고, 도체 속을
// 비운 채 **겉면에만** 멈춘다. 그 겉면에서도 고르지 않다 — 물방울 모양 도체의
// **뾰족한 끝(곡률 반지름이 작은 곳)에 더 빽빽이** 모이고, 그래서 그 바로 바깥의
// 전기장이 가장 세다.
//
// 그림은 긴 기둥 도체의 단면이다(2D). 알갱이끼리의 힘도 단면의 쿨롱 힘(거리에 반비례)
// 으로 셈한다 — 이 힘이라야 도체 속에 머물 수 있는 평형 자리가 없다. 알갱이의 자리는
// 스테이지 상수에서 한 번 이완 계산으로 풀고(시드 결정적), 화면은 그 경로를 되감는다.
//
// 이 조각은 자리에만 머문다. 대전시키는 방법(charging-methods), 도체 속 장이 0 이라
// 바깥 장을 막는 것(electrostatic-shielding), 구 둘레의 장(field-of-charged-sphere)은
// 하지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:charge-on-conductor-surface` 와 문자 그대로 일치한다 (C4). */
export const CHARGE_ON_CONDUCTOR_SURFACE_ID = 'charge-on-conductor-surface';

// ------------------------------------------------------------------------
// 물리 · 모양 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 1 단위는 임의 길이다.
// ------------------------------------------------------------------------

/** 도체에 넣는 + 전하 알갱이 수. */
export const CHARGE_COUNT = 40;
/** 처음 자리를 흩뿌리는 난수의 시드. 같은 시드는 언제나 같은 이완 경로다. */
export const SEED = 7;
/** 뭉툭한 쪽 둥근 끝의 반지름. */
export const BLUNT_RADIUS = 1.0;
/** 뾰족한 쪽 둥근 끝의 반지름. 뭉툭한 쪽보다 훨씬 작다 — 이 차이가 주장이다. */
export const TIP_RADIUS = 0.12;
/** 두 둥근 끝의 중심 사이 거리. 도체는 두 원을 감싸는 볼록한 물방울 모양이다. */
export const CENTER_GAP = 3.0;
/** 처음에 알갱이를 흩뿌리는 원의 반지름(도체 한가운데 한 줌). */
export const CLUSTER_RADIUS = 0.35;
/** 그 원의 중심을 뭉툭한 쪽 중심에서 뾰족한 쪽으로 옮기는 거리. */
export const CLUSTER_SHIFT = 0.3;

/** 이완 계산 — 되풀이 횟수. */
export const RELAX_STEPS = 300;
/** 이완 계산 — 힘 → 한 번 옮김의 비. */
export const RELAX_GAIN = 0.01;
/** 이완 계산 — 한 번에 옮기는 거리의 상한. 처음 한 줌이 튕겨 나가지 않게 한다. */
export const RELAX_STEP_CAP = 0.015;

/** 견주는 두 호의 길이(겉면을 따라 잰다). 뭉툭한 끝과 뾰족한 끝에 같은 길이로 둔다. */
export const ARC_LENGTH = 0.5;

/** 장 화살표 수. 겉면을 따라 같은 간격으로, 뾰족한 끝에서부터 둔다. */
export const FIELD_ARROWS = 16;
/**
 * 장을 재는 자리 — 겉면에서 바깥으로 이만큼 떨어진 곳. 뾰족한 끝의 몰림은 끝 가까이에서만 크므로 멀면
 * 대비가 사라지고, 뭉툭한 끝의 알갱이 간격보다 많이 가까우면 알갱이 하나에 휘둘린다. 그 사이 값이다.
 */
export const FIELD_PROBE = 0.12;
/** 표시 배율 — 장 세기 → 화살표 길이(월드). */
export const FIELD_SCALE = 0.016;
/** 화살표 길이 상한(월드). 기본값에서는 어느 화살표도 닿지 않는다 (NOTES (b)). */
export const FIELD_CAP = 0.9;

/**
 * 프레이밍 — 기본 모양과 장 화살표까지. 캡션 줄은 아래 여백이 받는다.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -3.05, maxX: 2.5, minY: -1.75, maxY: 1.4 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const chargeOnConductorSurfaceMessages = Object.freeze({
  'label.title': {
    ko: '도체 표면의 전하',
    en: 'Charge on a conductor surface',
    ja: '導体表面の電荷',
    zh: '导体表面的电荷',
    ar: 'الشحنة على سطح موصل',
    es: 'Carga en la superficie de un conductor',
    fr: 'Charge à la surface d’un conducteur',
    hi: 'चालक की सतह पर आवेश',
    id: 'Muatan di permukaan konduktor',
    pt: 'Carga na superfície de um condutor',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '뾰족한 곳에 몰리는 전하',
    en: 'Charge crowds at the sharp end',
    ja: '尖った所に集まる電荷',
    zh: '电荷聚集在尖端',
    ar: 'تتكدس الشحنة عند الطرف المدبب',
    es: 'La carga se amontona en el extremo puntiagudo',
    fr: 'La charge s’accumule au bout pointu',
    hi: 'नुकीले सिरे पर जमा होता आवेश',
    id: 'Muatan berkumpul di ujung runcing',
    pt: 'A carga se acumula na ponta fina',
  },
  'label.stage': {
    ko: '물방울 모양 도체',
    en: 'Teardrop conductor',
    ja: 'しずく形の導体',
    zh: '水滴形导体',
    ar: 'موصل على شكل قطرة',
    es: 'Conductor en forma de gota',
    fr: 'Conducteur en forme de goutte',
    hi: 'बूँद के आकार का चालक',
    id: 'Konduktor berbentuk tetesan',
    pt: 'Condutor em forma de gota',
  },
  'label.view': {
    ko: '단면',
    en: 'Cross-section',
    ja: '断面',
    zh: '截面',
    ar: 'المقطع العرضي',
    es: 'Sección transversal',
    fr: 'Coupe',
    hi: 'अनुप्रस्थ काट',
    id: 'Penampang',
    pt: 'Corte transversal',
  },

  /** 뾰족한 끝 · 뭉툭한 끝의 이름표. 호를 견줄 때만 뜬다. */
  'tag.tip': {
    ko: '뾰족한 끝',
    en: 'sharp end',
    ja: '尖った端',
    zh: '尖端',
    ar: 'الطرف المدبب',
    es: 'extremo puntiagudo',
    fr: 'bout pointu',
    hi: 'नुकीला सिरा',
    id: 'ujung runcing',
    pt: 'ponta fina',
  },
  'tag.blunt': {
    ko: '뭉툭한 끝',
    en: 'blunt end',
    ja: '鈍い端',
    zh: '钝端',
    ar: 'الطرف المستدير',
    es: 'extremo romo',
    fr: 'bout émoussé',
    hi: 'भोथरा सिरा',
    id: 'ujung tumpul',
    pt: 'ponta rombuda',
  },

  'caption.appear': {
    ko: '도체 한가운데에 + 전하를 한 줌 넣는다.',
    en: 'A handful of + charges is placed in the middle of the conductor.',
    ja: '導体の真ん中に + 電荷をひとつかみ置く。',
    zh: '在导体正中放入一把 + 电荷。',
    ar: 'تُوضع حفنة من شحنات + في وسط الموصل.',
    es: 'Se coloca un puñado de cargas + en el centro del conductor.',
    fr: 'Une poignée de charges + est placée au milieu du conducteur.',
    hi: 'चालक के बीच में मुट्ठी भर + आवेश रखे जाते हैं।',
    id: 'Segenggam muatan + diletakkan di tengah konduktor.',
    pt: 'Um punhado de cargas + é colocado no meio do condutor.',
  },
  'caption.spread': {
    ko: '+ 전하끼리 서로 밀어 바깥으로 퍼져 나간다.',
    en: 'The + charges push one another apart and spread outward.',
    ja: '+ 電荷どうしが押し合い、外へ広がっていく。',
    zh: '+ 电荷相互排斥，向外散开。',
    ar: 'تتنافر شحنات + بعضها عن بعض وتنتشر إلى الخارج.',
    es: 'Las cargas + se repelen entre sí y se dispersan hacia fuera.',
    fr: 'Les charges + se repoussent et s’étalent vers l’extérieur.',
    hi: '+ आवेश एक-दूसरे को धकेलते हैं और बाहर की ओर फैल जाते हैं।',
    id: 'Muatan + saling mendorong dan menyebar ke luar.',
    pt: 'As cargas + se empurram umas às outras e se espalham para fora.',
  },
  'caption.settle': {
    ko: '모두 겉면에 멈췄다. 도체 속에는 전하가 하나도 남지 않았다.',
    en: 'All of them have stopped on the surface. None is left inside the conductor.',
    ja: 'すべて表面で止まった。導体の中には電荷が一つも残っていない。',
    zh: '全部停在了表面。导体内部一个电荷也没有留下。',
    ar: 'توقفت كلها على السطح. لم يبقَ أيٌّ منها داخل الموصل.',
    es: 'Todas se han detenido en la superficie. No queda ninguna dentro del conductor.',
    fr: 'Toutes se sont arrêtées à la surface. Il n’en reste aucune à l’intérieur du conducteur.',
    hi: 'सभी सतह पर रुक गए। चालक के भीतर एक भी नहीं बचा।',
    id: 'Semuanya berhenti di permukaan. Tidak ada yang tersisa di dalam konduktor.',
    pt: 'Todas pararam na superfície. Nenhuma ficou dentro do condutor.',
  },
  'caption.compare': {
    ko: '같은 길이의 두 호 — 뾰족한 끝의 호에 + 가 더 빽빽하다.',
    en: 'Two arcs of equal length: the + charges are packed more tightly on the sharp end.',
    ja: '同じ長さの二つの弧：尖った端の弧のほうに + がより密に並ぶ。',
    zh: '两段等长的弧：尖端那段弧上的 + 更密集。',
    ar: 'قوسان متساويان في الطول: شحنات + أكثر تراصًّا على الطرف المدبب.',
    es: 'Dos arcos de igual longitud: las cargas + están más apretadas en el extremo puntiagudo.',
    fr: 'Deux arcs de même longueur : les charges + sont plus serrées sur le bout pointu.',
    hi: 'बराबर लंबाई के दो चाप: नुकीले सिरे पर + आवेश अधिक घने हैं।',
    id: 'Dua busur sama panjang: muatan + lebih rapat di ujung runcing.',
    pt: 'Dois arcos de mesmo comprimento: as cargas + ficam mais apertadas na ponta fina.',
  },
  'caption.field': {
    ko: '겉면 바로 바깥의 전기장 — 뾰족한 끝의 화살표가 가장 길다.',
    en: 'The electric field just outside the surface: the arrow at the sharp end is the longest.',
    ja: '表面のすぐ外の電場：尖った端の矢印がいちばん長い。',
    zh: '紧贴表面外侧的电场：尖端处的箭头最长。',
    ar: 'المجال الكهربائي خارج السطح مباشرة: السهم عند الطرف المدبب هو الأطول.',
    es: 'El campo eléctrico justo fuera de la superficie: la flecha del extremo puntiagudo es la más larga.',
    fr: 'Le champ électrique juste à l’extérieur de la surface : la flèche du bout pointu est la plus longue.',
    hi: 'सतह के ठीक बाहर विद्युत क्षेत्र: नुकीले सिरे का तीर सबसे लंबा है।',
    id: 'Medan listrik tepat di luar permukaan: panah di ujung runcing paling panjang.',
    pt: 'O campo elétrico logo fora da superfície: a seta na ponta fina é a mais longa.',
  },
} satisfies Record<string, LocalizedText>);

export type ChargeOnConductorSurfaceMessageKey = keyof typeof chargeOnConductorSurfaceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ChargeOnConductorSurfaceMessageKey): LocalizedText => chargeOnConductorSurfaceMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ChargeOnConductorSurfaceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const chargeOnConductorSurfaceSchema: BundleSchema = {
  id: CHARGE_ON_CONDUCTOR_SURFACE_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'teardrop',
      label: text('label.stage'),
      constants: {
        chargeCount: CHARGE_COUNT,
        seed: SEED,
        bluntRadius: BLUNT_RADIUS,
        tipRadius: TIP_RADIUS,
        centerGap: CENTER_GAP,
        clusterRadius: CLUSTER_RADIUS,
        clusterShift: CLUSTER_SHIFT,
        relaxSteps: RELAX_STEPS,
        relaxGain: RELAX_GAIN,
        relaxStepCap: RELAX_STEP_CAP,
        arcLength: ARC_LENGTH,
        fieldArrows: FIELD_ARROWS,
        fieldProbe: FIELD_PROBE,
        fieldScale: FIELD_SCALE,
        fieldCap: FIELD_CAP,
      },
    },
  ],
  environments: [],
  views: [{ id: 'section', label: text('label.view'), default: true }],

  /** 가로로 길쭉한 물방울 하나. 세로는 도체 높이와 캡션만큼이면 된다. */
  canvas: { height: 360, minHeight: 300 },

  /**
   * 겹침 순서를 scene 에 쓴 차례로 — 도체 면(매질 층)이 + 십자를 덮으면 겉면의 알갱이가
   * 흐려진다. 면 → 둘레 → 호 → 화살표 → 십자 순이다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 전하가 퍼져 나가고 있다 (S-piece). */
  startAt: 0.9,

  /**
   * 한 주기.
   *
   * - `appear` — 도체와 한가운데의 + 한 줌이 나타난다.
   * - `spread` — 이완 경로를 따라 알갱이가 서로 밀며 겉면으로 간다.
   * - `settle` — 모두 겉면에 멈춘 모습을 그대로 둔다.
   * - `mark` · `compare` — 같은 길이의 두 호(뭉툭한 끝 · 뾰족한 끝)가 나타나고 머문다.
   * - `fieldIn` · `field` — 호가 물러나며 겉면 바로 바깥의 장 화살표가 자라고, 머문다.
   * - `fade` — 옅어지며 물러난다. 끝난 화면이 남지 않도록 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.8, caption: key('caption.appear') },
      { id: 'spread', duration: 3.2, caption: key('caption.spread') },
      { id: 'settle', duration: 2.4, caption: key('caption.settle') },
      { id: 'mark', duration: 0.6, ease: 'smooth', caption: key('caption.compare') },
      { id: 'compare', duration: 3.4, caption: key('caption.compare') },
      { id: 'fieldIn', duration: 0.9, ease: 'smooth', caption: key('caption.field') },
      { id: 'field', duration: 3.2, caption: key('caption.field') },
      { id: 'fade', duration: 0.6, caption: key('caption.field') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 · 조작기 없음(기본). 이 그림이 묻는 것은 거리가
  // 아니라 알갱이가 어디에 얼마나 빽빽한가다 — 거리 눈금은 오독의 경로가 된다 (S-piece).

  messages: chargeOnConductorSurfaceMessages,
};
