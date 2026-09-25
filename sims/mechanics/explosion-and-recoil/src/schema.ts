// ========================================================================
// explosion-and-recoil — 선언
// ========================================================================
// 질문: 멈춰 있던 것이 터져 둘로 갈라지면, 두 조각은 얼마나 빠르게 어디로 가는가?
//
// 답: 반대쪽으로 간다. 그리고 **무거운 쪽이 무거운 만큼 느리다.** 질량이 세 배인
// 조각은 세 배 느리게 밀려나고, 같은 시간 동안 3분의 1 만 간다.
//
// 화면에서는 붙어 서 있던 두 덩이(3m · m)가 터지며 갈라지고, 1 초마다 남는 자국의
// 간격이 가벼운 쪽에서 세 배 넓다. 마지막에 같은 시간 동안 간 거리를 d · 3d 로 잰다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:explosion-and-recoil` 와 문자 그대로 일치한다 (C4). */
export const EXPLOSION_AND_RECOIL_ID = 'explosion-and-recoil';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 무거운 조각 · 가벼운 조각의 질량(단위 질량 m 의 배수). */
export const HEAVY_MASS = 3;
export const LIGHT_MASS = 1;
/**
 * 터지며 각 조각이 받는 운동량의 크기(단위 m · 월드/초). 두 조각이 같은 크기를
 * 반대로 받는다 — 합이 처음처럼 0 이다. 가벼운 조각의 속력이 0.75 월드/초가 된다.
 */
export const KICK_MOMENTUM = 0.75;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위. 원점은 두 덩이가 맞닿은 이음매(바닥 위).
// ------------------------------------------------------------------------

/** 질량 1 당 덩이 너비(월드). 같은 재질이라 너비가 곧 질량이다. */
export const WIDTH_PER_MASS = 0.16;
/** 덩이 높이(월드). 두 조각이 같다 — 다른 것은 너비(질량) 하나뿐이어야 한다. */
export const BLOCK_H = 0.3;
/** 자국을 남기는 시간 간격(초). 「같은 시간」 의 단위다. */
export const GHOST_EVERY = 1;
/** 속도 화살표를 띄우는 높이(덩이 윗면 위, 월드). */
export const ARROW_LIFT = 0.14;
/**
 * 속도 → 화살표 길이(월드/(월드/초)). 0.6 초 동안 가는 거리가 화살표 길이다.
 * 1 초로 두면 가벼운 쪽 화살표가 미끄러지기 끝 무렵 화면 오른쪽 밖으로 나간다.
 */
export const ARROW_SCALE = 0.6;
/** 바닥선의 좌우 끝(월드). */
export const GROUND_X: readonly [number, number] = [-1.62, 2.86];

/**
 * 프레이밍 — 왼쪽은 무거운 조각이 갈 자리, 오른쪽은 가벼운 조각이 세 배 멀리 갈 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.7, maxX: 2.94, minY: -0.5, maxY: 0.78 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const explosionAndRecoilMessages = Object.freeze({
  'label.title': {
    ko: '폭발과 반동',
    en: 'Explosion and recoil',
    ja: '爆発と反動',
    zh: '爆炸与反冲',
    ar: 'الانفجار والارتداد',
    es: 'Explosión y retroceso',
    fr: 'Explosion et recul',
    hi: 'विस्फोट और प्रतिक्षेप',
    id: 'Ledakan dan tolakan',
    pt: 'Explosão e recuo',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '정지한 계가 갈라질 때',
    en: 'When a system at rest splits apart',
    ja: '静止した系が分裂するとき',
    zh: '静止的系统分裂时',
    ar: 'عندما ينقسم نظام ساكن',
    es: 'Cuando un sistema en reposo se separa',
    fr: 'Quand un système au repos se sépare',
    hi: 'जब विराम में स्थित निकाय टूटकर अलग होता है',
    id: 'Saat sistem yang diam terpecah',
    pt: 'Quando um sistema em repouso se separa',
  },
  'label.stage': {
    ko: '3 대 1 로 갈라지는 덩이',
    en: 'A block splitting 3 : 1',
    ja: '3 : 1 に分かれるブロック',
    zh: '按 3 : 1 分开的物块',
    ar: 'قطعة تنقسم بنسبة 3 : 1',
    es: 'Un bloque que se divide 3 : 1',
    fr: 'Un bloc qui se sépare en 3 : 1',
    hi: '3 : 1 में टूटता गुटका',
    id: 'Balok yang terbelah 3 : 1',
    pt: 'Um bloco que se divide 3 : 1',
  },
  'label.view': {
    ko: '바닥 위',
    en: 'On the floor',
    ja: '床の上',
    zh: '地面上',
    ar: 'على الأرضية',
    es: 'Sobre el suelo',
    fr: 'Sur le sol',
    hi: 'फ़र्श पर',
    id: 'Di atas lantai',
    pt: 'No chão',
  },

  /** 질량 · 속도 · 거리 표식. 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.heavyMass': {
    ko: '3m',
    en: '3m',
    ja: '3m',
    zh: '3m',
    ar: '3m',
    es: '3m',
    fr: '3m',
    hi: '3m',
    id: '3m',
    pt: '3m',
  },
  'label.lightMass': {
    ko: 'm',
    en: 'm',
    ja: 'm',
    zh: 'm',
    ar: 'm',
    es: 'm',
    fr: 'm',
    hi: 'm',
    id: 'm',
    pt: 'm',
  },
  'label.heavySpeed': {
    ko: 'v',
    en: 'v',
    ja: 'v',
    zh: 'v',
    ar: 'v',
    es: 'v',
    fr: 'v',
    hi: 'v',
    id: 'v',
    pt: 'v',
  },
  'label.lightSpeed': {
    ko: '3v',
    en: '3v',
    ja: '3v',
    zh: '3v',
    ar: '3v',
    es: '3v',
    fr: '3v',
    hi: '3v',
    id: '3v',
    pt: '3v',
  },
  'label.heavyDistance': {
    ko: 'd',
    en: 'd',
    ja: 'd',
    zh: 'd',
    ar: 'd',
    es: 'd',
    fr: 'd',
    hi: 'd',
    id: 'd',
    pt: 'd',
  },
  'label.lightDistance': {
    ko: '3d',
    en: '3d',
    ja: '3d',
    zh: '3d',
    ar: '3d',
    es: '3d',
    fr: '3d',
    hi: '3d',
    id: '3d',
    pt: '3d',
  },

  'caption.hold': {
    ko: '맞붙은 두 덩이가 멈춰 있다. 이 계의 운동량은 0 이다.',
    en: 'Two blocks sit pressed together, at rest. The momentum of the pair is zero.',
    ja: '二つのブロックがくっついて静止している。この二つの運動量はゼロだ。',
    zh: '两个物块紧贴在一起，静止不动。这一对的动量为零。',
    ar: 'قطعتان متلاصقتان في سكون. زخم الزوج صفر.',
    es: 'Dos bloques están juntos, en reposo. El momento lineal del par es cero.',
    fr: 'Deux blocs sont collés l’un à l’autre, au repos. La quantité de mouvement de la paire est nulle.',
    hi: 'दो गुटके आपस में सटे हुए विराम में हैं। इस जोड़े का संवेग शून्य है।',
    id: 'Dua balok diam saling menempel. Momentum pasangan ini nol.',
    pt: 'Dois blocos estão encostados, em repouso. A quantidade de movimento do par é zero.',
  },
  'caption.burst': {
    ko: '터진다 — 두 덩이가 같은 힘으로 서로를 반대쪽으로 민다.',
    en: 'It goes off — each block shoves the other the opposite way, equally hard.',
    ja: '破裂する — 二つのブロックが同じ強さで互いを反対向きに押す。',
    zh: '炸开了 — 两个物块以同样大的力把对方推向相反方向。',
    ar: 'ينفجر — تدفع كل قطعة الأخرى في الاتجاه المعاكس بالقوة نفسها.',
    es: 'Estalla — cada bloque empuja al otro en sentido opuesto, con la misma fuerza.',
    fr: 'Ça part — chaque bloc pousse l’autre dans le sens opposé, avec la même force.',
    hi: 'विस्फोट होता है — हर गुटका दूसरे को उतने ही ज़ोर से उलटी दिशा में धकेलता है।',
    id: 'Meledak — tiap balok mendorong balok lainnya ke arah berlawanan, sama kuatnya.',
    pt: 'Explode — cada bloco empurra o outro no sentido oposto, com a mesma força.',
  },
  'caption.glide': {
    ko: '질량이 세 배인 쪽은 세 배 느리게 밀려난다. 1초마다 남긴 자국의 간격을 보라.',
    en: 'The block with three times the mass recoils three times slower. Compare the spacing of the marks left every second.',
    ja: '質量が三倍のブロックは反動で三倍ゆっくり動く。1 秒ごとに残る跡の間隔を比べよう。',
    zh: '质量为三倍的物块反冲的速度只有三分之一。比较每 1 秒留下的印记之间的间距。',
    ar: 'القطعة التي كتلتها ثلاثة أضعاف ترتد بسرعة أقل بثلاث مرات. قارن تباعد العلامات المتروكة كل ثانية.',
    es: 'El bloque con el triple de masa retrocede tres veces más despacio. Compara la separación de las marcas que quedan cada segundo.',
    fr: 'Le bloc trois fois plus massif recule trois fois plus lentement. Comparez l’espacement des traces laissées chaque seconde.',
    hi: 'तीन गुना द्रव्यमान वाला गुटका तीन गुना धीमे पीछे हटता है। हर सेकंड छूटे निशानों के बीच की दूरी की तुलना करें।',
    id: 'Balok bermassa tiga kali lipat terdorong mundur tiga kali lebih lambat. Bandingkan jarak antartanda yang tertinggal setiap detik.',
    pt: 'O bloco com o triplo da massa recua três vezes mais devagar. Compare o espaçamento das marcas deixadas a cada segundo.',
  },
  'caption.compare': {
    ko: '같은 시간 동안 무거운 쪽은 d, 가벼운 쪽은 3d — 질량이 큰 만큼 덜 간다.',
    en: 'In the same time the heavy block covers d and the light one 3d — the more mass, the less it moves.',
    ja: '同じ時間に、重いブロックは d、軽いブロックは 3d 進む — 質量が大きいほど動かない。',
    zh: '在相同时间内，重的物块走了 d，轻的走了 3d — 质量越大，移动得越少。',
    ar: 'في الزمن نفسه تقطع القطعة الثقيلة d والخفيفة 3d — كلما زادت الكتلة قلّت الحركة.',
    es: 'En el mismo tiempo el bloque pesado recorre d y el ligero 3d — cuanta más masa, menos se mueve.',
    fr: 'Dans le même temps, le bloc lourd parcourt d et le léger 3d — plus la masse est grande, moins il se déplace.',
    hi: 'उतने ही समय में भारी गुटका d और हल्का 3d चलता है — द्रव्यमान जितना अधिक, वह उतना ही कम खिसकता है।',
    id: 'Dalam waktu yang sama balok berat menempuh d dan yang ringan 3d — makin besar massanya, makin sedikit geraknya.',
    pt: 'No mesmo tempo o bloco pesado percorre d e o leve 3d — quanto mais massa, menos ele se move.',
  },
} satisfies Record<string, LocalizedText>);

export type ExplosionAndRecoilMessageKey = keyof typeof explosionAndRecoilMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ExplosionAndRecoilMessageKey): LocalizedText => explosionAndRecoilMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ExplosionAndRecoilMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const explosionAndRecoilSchema: BundleSchema = {
  id: EXPLOSION_AND_RECOIL_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'three-to-one',
      label: text('label.stage'),
      constants: {
        heavyMass: HEAVY_MASS,
        lightMass: LIGHT_MASS,
        kickMomentum: KICK_MOMENTUM,
      },
    },
  ],
  environments: [],
  views: [{ id: 'floor', label: text('label.view'), default: true }],

  /**
   * 가로로 길고 세로로 좁다 — 일어나는 일이 모두 바닥 위 한 줄이다. 넘치는 세로는
   * 그림을 작게만 만든다.
   */
  canvas: { height: 300, minHeight: 280 },

  /** 도착한 순간 이미 두 조각이 갈라져 미끄러지는 중이다 (S-piece). */
  startAt: 2.1,

  /**
   * 한 주기 8 초.
   *
   * - `hold` — 붙은 채 멈춰 있다. 계 전체의 운동량이 0 이라는 출발점.
   * - `burst` — 터지는 동안. 실제로는 순식간이지만 「반대로 민다」 를 눈으로 보게
   *   0.4 초 동안 속력을 붙인다. 진행도의 제곱이 이 동안 간 거리다(고른 힘).
   * - `glide` — 3 초 동안 일정한 속력으로 미끄러진다. 1 초마다 자국이 남는다.
   * - `leave` — 두 조각은 같은 속력으로 계속 가며 옅어진다(화면 밖으로 나가기 전에).
   *   3 초째 자국 자리에 d · 3d 치수선이 나온다.
   * - `compare` — 자국과 d · 3d 만 남아 두 거리를 견준다.
   * - `fade` — 모두 옅어지며 물러난다. 끝난 화면이 남지 않도록 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'hold', duration: 1.3, caption: key('caption.hold') },
      { id: 'burst', duration: 0.4, caption: key('caption.burst') },
      { id: 'glide', duration: 3, caption: key('caption.glide') },
      { id: 'leave', duration: 0.5, caption: key('caption.compare') },
      { id: 'compare', duration: 2.2, caption: key('caption.compare') },
      { id: 'fade', duration: 0.6, caption: key('caption.compare') },
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

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 잴 것은 두 거리의 **비**이고,
  // 그것은 d · 3d 치수선이 직접 말한다. 거리 눈금은 값 읽기로 끌고 간다 (S-piece).

  messages: explosionAndRecoilMessages,
};
