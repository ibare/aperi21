// ========================================================================
// conservation-of-angular-momentum — 선언
// ========================================================================
// 질문: 제자리에서 도는 사람이 팔을 오므리면 왜 빨라지는가? 아무도 더
// 돌려 주지 않았는데.
//
// 답: 돌림을 주는 것이 없으면 I·ω 가 그대로다. 질량을 축 가까이 모으면 I 가
// 줄어들고, 그 몫만큼 ω 가 커진다.
//
// 화면에서는 둘이 그 일을 한다 — 왼쪽 회전체가 **같은 시간 동안 쓸고 가는
// 부채꼴**이 넓어지고, 오른쪽 직사각형(가로 I · 세로 ω)은 가늘고 길어지면서
// 모서리가 「Iω 그대로」 곡선을 벗어나지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:conservation-of-angular-momentum` 와 문자 그대로 일치한다 (C4). */
export const CONSERVATION_OF_ANGULAR_MOMENTUM_ID = 'conservation-of-angular-momentum';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 몸통(축 둘레에 늘 있는 몫)의 관성 모멘트(kg·m²). */
export const CORE_INERTIA = 0.25;
/** 양손에 하나씩 든 질량(kg). */
export const HAND_MASS = 1;
/** 팔을 벌렸을 때 · 오므렸을 때 손이 축에서 떨어진 거리(m). */
export const REACH_OUT = 1;
export const REACH_IN = 0.35;
/** 팔을 벌리고 돌 때의 각속도(rad/s). 여기서 L = I·ω 가 정해진다. */
export const OMEGA_OUT = 0.9;
/** 부채꼴이 보여 주는 「방금 돈 각」 의 시간 폭(s). */
export const SWEEP_WINDOW = 0.4;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m. 원점은 회전축.
// ------------------------------------------------------------------------

/** 몸통 원판 반지름 · 손에 든 질량의 반지름(m). */
export const CORE_RADIUS = 0.13;
export const HAND_RADIUS = 0.09;
/** 방금 돈 각 부채꼴의 반지름. 고정이라 넓이가 곧 각이다. */
export const SWEEP_RADIUS = 1.22;
/** 처음 팔이 향한 각(rad). 가로로 누우면 부채꼴이 이름표 줄과 겹친다. */
export const START_ANGLE = 0.55;

/** I–ω 판의 원점(월드)과 축 배율(월드/kg·m², 월드/(rad/s)). */
export const PANEL_ORIGIN = [2.05, -1.1] as const;
export const PANEL_I_SCALE = 0.78;
export const PANEL_W_SCALE = 0.5;
/** 판의 축 길이(월드). */
export const PANEL_I_AXIS = 2.05;
export const PANEL_W_AXIS = 2.3;

/**
 * 프레이밍 — 왼쪽 회전체, 오른쪽 I–ω 판. 아래는 캡션 줄 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.45, maxX: 4.55, minY: -1.62, maxY: 1.4 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const conservationOfAngularMomentumMessages = Object.freeze({
  'label.title': {
    ko: '각운동량 보존',
    en: 'Conservation of angular momentum',
    ja: '角運動量保存',
    zh: '角动量守恒',
    ar: 'حفظ الزخم الزاوي',
    es: 'Conservación del momento angular',
    fr: 'Conservation du moment cinétique',
    hi: 'कोणीय संवेग संरक्षण',
    id: 'Kekekalan momentum sudut',
    pt: 'Conservação do momento angular',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '팔을 오므리면 빨라지는 이유',
    en: 'Why pulling your arms in makes you spin faster',
    ja: '腕を縮めると回転が速くなるわけ',
    zh: '为什么收拢手臂会转得更快',
    ar: 'لماذا يزداد دورانك سرعةً حين تضم ذراعيك',
    es: 'Por qué recoger los brazos te hace girar más rápido',
    fr: 'Pourquoi ramener les bras fait tourner plus vite',
    hi: 'बाँहें सिकोड़ने से घूमना तेज़ क्यों हो जाता है',
    id: 'Mengapa menarik lengan ke dalam membuatmu berputar lebih cepat',
    pt: 'Por que recolher os braços faz você girar mais rápido',
  },
  'label.stage': {
    ko: '두 손에 든 추',
    en: 'Weights in both hands',
    ja: '両手に持ったおもり',
    zh: '双手握着的重物',
    ar: 'أثقال في اليدين',
    es: 'Pesas en ambas manos',
    fr: 'Des poids dans chaque main',
    hi: 'दोनों हाथों में भार',
    id: 'Beban di kedua tangan',
    pt: 'Pesos nas duas mãos',
  },
  'label.view': {
    ko: '위에서 본 회전',
    en: 'Spin seen from above',
    ja: '上から見た回転',
    zh: '从上方看的旋转',
    ar: 'الدوران من الأعلى',
    es: 'El giro visto desde arriba',
    fr: 'La rotation vue de dessus',
    hi: 'ऊपर से देखा गया घूर्णन',
    id: 'Putaran dilihat dari atas',
    pt: 'O giro visto de cima',
  },

  /** 판의 축 이름. 기호라 번역 대상이 아니다 (C1 판정 3). */
  'axis.inertia': {
    ko: 'I',
    en: 'I',
    ja: 'I',
    zh: 'I',
    ar: 'I',
    es: 'I',
    fr: 'I',
    hi: 'I',
    id: 'I',
    pt: 'I',
  },
  'axis.omega': {
    ko: 'ω',
    en: 'ω',
    ja: 'ω',
    zh: 'ω',
    ar: 'ω',
    es: 'ω',
    fr: 'ω',
    hi: 'ω',
    id: 'ω',
    pt: 'ω',
  },
  /** 쌍곡선 이름표 — 강조색은 이 한 가지 뜻(그대로인 양)에만 쓴다. */
  'label.kept': {
    ko: 'Iω 그대로',
    en: 'Iω unchanged',
    ja: 'Iω は不変',
    zh: 'Iω 不变',
    ar: 'Iω ثابت',
    es: 'Iω sin cambio',
    fr: 'Iω inchangé',
    hi: 'Iω अपरिवर्तित',
    id: 'Iω tetap',
    pt: 'Iω inalterado',
  },
  /** 팔을 벌렸을 때 손이 돌던 자리. */
  'label.reach': {
    ko: '벌린 팔',
    en: 'Arms out',
    ja: '広げた腕',
    zh: '张开的手臂',
    ar: 'ذراعان ممدودتان',
    es: 'Brazos abiertos',
    fr: 'Bras écartés',
    hi: 'फैली बाँहें',
    id: 'Lengan terentang',
    pt: 'Braços abertos',
  },

  'caption.wide': {
    ko: '팔을 벌린 채 천천히 돈다. 부채꼴은 방금 0.4초 동안 돈 각이다.',
    en: 'Arms out, it turns slowly. The wedge is the angle turned in the last 0.4 s.',
    ja: '腕を広げたまま、ゆっくり回る。扇形は直前の 0.4 s に回った角度だ。',
    zh: '张开手臂时，它转得很慢。扇形是刚才 0.4 s 内转过的角度。',
    ar: 'بذراعين ممدودتين يدور ببطء. القطاع هو الزاوية التي دارها في آخر 0.4 s.',
    es: 'Con los brazos abiertos, gira despacio. El sector es el ángulo girado en los últimos 0.4 s.',
    fr: 'Bras écartés, il tourne lentement. Le secteur est l’angle parcouru pendant les dernières 0.4 s.',
    hi: 'बाँहें फैलाए वह धीरे घूमता है। त्रिज्यखंड पिछले 0.4 s में घूमा गया कोण है।',
    id: 'Dengan lengan terentang, ia berputar pelan. Juring itu adalah sudut yang ditempuh dalam 0.4 s terakhir.',
    pt: 'De braços abertos, gira devagar. O setor é o ângulo percorrido nos últimos 0.4 s.',
  },
  'caption.pull': {
    ko: '손을 축 쪽으로 모으는 동안 회전이 빨라진다 — 아무도 더 돌려 주지 않았다.',
    en: 'As the hands come in toward the axis, the spin speeds up — nothing pushed it.',
    ja: '手が軸のほうへ寄るにつれて回転が速くなる — 誰も押していない。',
    zh: '双手向转轴收拢时，旋转加快 — 并没有什么推动它。',
    ar: 'مع اقتراب اليدين من المحور يتسارع الدوران — ولم يدفعه شيء.',
    es: 'Al acercar las manos al eje, el giro se acelera — nada lo empujó.',
    fr: 'À mesure que les mains se rapprochent de l’axe, la rotation accélère — rien ne l’a poussée.',
    hi: 'जैसे-जैसे हाथ अक्ष की ओर आते हैं, घूमना तेज़ होता जाता है — किसी ने इसे धक्का नहीं दिया।',
    id: 'Saat tangan mendekat ke sumbu, putaran makin cepat — tak ada yang mendorongnya.',
    pt: 'Conforme as mãos se aproximam do eixo, o giro acelera — nada o empurrou.',
  },
  'caption.tight': {
    ko: '같은 0.4초에 도는 각이 몇 배 넓어졌다. 오른쪽 직사각형은 가로 I 가 준 만큼 세로 ω 가 늘어 넓이가 그대로다.',
    en: 'In the same 0.4 s it now sweeps several times the angle. On the right, width I shrank as much as height ω grew — the area is unchanged.',
    ja: '同じ 0.4 s で、いまは何倍もの角度を回る。右の長方形は、横 I が縮んだぶん縦 ω が伸び、面積は変わらない。',
    zh: '在同样的 0.4 s 内，它现在转过的角度大了好几倍。右边的矩形，宽 I 缩小多少，高 ω 就增大多少 — 面积不变。',
    ar: 'في الـ 0.4 s نفسها يمسح الآن زاوية أكبر بعدة مرات. على اليمين، تقلّص العرض I بقدر ما ازداد الارتفاع ω — والمساحة لم تتغير.',
    es: 'En los mismos 0.4 s ahora barre un ángulo varias veces mayor. A la derecha, el ancho I se redujo tanto como creció la altura ω — el área no cambia.',
    fr: 'Dans les mêmes 0.4 s, il balaie maintenant un angle plusieurs fois plus grand. À droite, la largeur I a diminué d’autant que la hauteur ω a augmenté — l’aire est inchangée.',
    hi: 'उसी 0.4 s में अब वह कई गुना बड़ा कोण घूमता है। दाईं ओर चौड़ाई I उतनी ही घटी जितनी ऊँचाई ω बढ़ी — क्षेत्रफल अपरिवर्तित है।',
    id: 'Dalam 0.4 s yang sama, kini ia menyapu sudut beberapa kali lebih besar. Di kanan, lebar I menyusut sebanding dengan naiknya tinggi ω — luasnya tetap.',
    pt: 'Nos mesmos 0.4 s, agora varre um ângulo várias vezes maior. À direita, a largura I encolheu na mesma medida em que a altura ω cresceu — a área não muda.',
  },
  'caption.spread': {
    ko: '다시 벌리면 그만큼 느려진다. 직사각형의 모서리는 여전히 같은 곡선 위에 있다.',
    en: 'Spread them again and it slows by the same measure. The corner stays on the same curve.',
    ja: 'もう一度広げると、そのぶん遅くなる。長方形の角は同じ曲線の上にとどまる。',
    zh: '再张开，它就相应地慢下来。矩形的角仍在同一条曲线上。',
    ar: 'افتحهما من جديد فيتباطأ بالقدر نفسه. تبقى زاوية المستطيل على المنحنى نفسه.',
    es: 'Ábrelos de nuevo y se frena en la misma medida. La esquina sigue sobre la misma curva.',
    fr: 'Écartez-les de nouveau et il ralentit d’autant. Le coin reste sur la même courbe.',
    hi: 'उन्हें फिर फैलाइए तो वह उतना ही धीमा हो जाता है। कोना उसी वक्र पर बना रहता है।',
    id: 'Rentangkan lagi dan ia melambat sebanding. Sudutnya tetap di kurva yang sama.',
    pt: 'Abra-os de novo e ele desacelera na mesma medida. O canto continua sobre a mesma curva.',
  },
} satisfies Record<string, LocalizedText>);

export type ConservationOfAngularMomentumMessageKey =
  keyof typeof conservationOfAngularMomentumMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ConservationOfAngularMomentumMessageKey): LocalizedText =>
  conservationOfAngularMomentumMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ConservationOfAngularMomentumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const conservationOfAngularMomentumSchema: BundleSchema = {
  id: CONSERVATION_OF_ANGULAR_MOMENTUM_ID,
  label: text('label.title'),
  category: 'oscillation',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'hand-weights',
      label: text('label.stage'),
      constants: {
        coreInertia: CORE_INERTIA,
        handMass: HAND_MASS,
        reachOut: REACH_OUT,
        reachIn: REACH_IN,
        omegaOut: OMEGA_OUT,
        sweepWindow: SWEEP_WINDOW,
      },
    },
  ],
  environments: [],
  views: [{ id: 'top', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 회전체, 오른쪽 판. 세로는 판의 ω 축 하나면 된다. */
  canvas: { height: 380, minHeight: 340 },

  /** 쓴 순서대로 겹친다 — 부채꼴은 팔 아래, 직사각형은 곡선 아래. */
  drawOrder: 'scene',

  /** 도착한 순간 이미 돌고 있다 (S-piece). */
  startAt: 1.2,

  /**
   * 한 주기 8.6 초.
   *
   * - `wide` — 팔을 벌린 채 천천히 돈다.
   * - `pull` — 손을 축 쪽으로 모은다. 모으는 모양은 여기 선언한 `ease` 다. 각은 지나온 시각
   *   전부에 걸친 적분이라 physics 가 이 선언에서 이징 이름을 읽어 다른 시각에도 같은 식을
   *   건다 (G59).
   * - `tight` — 오므린 채 빠르게 돈다.
   * - `spread` — 다시 벌린다. 끝나면 처음과 같은 자리라 다음 주기로 이어진다.
   */
  timeline: {
    phases: [
      { id: 'wide', duration: 2.4, caption: key('caption.wide') },
      { id: 'pull', duration: 1.6, ease: 'smooth', caption: key('caption.pull') },
      { id: 'tight', duration: 2.8, caption: key('caption.tight') },
      { id: 'spread', duration: 1.8, ease: 'smooth', caption: key('caption.spread') },
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

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 판은 눈금 없는 두 축뿐이다 —
  // 이 그림이 재는 것은 값이 아니라 넓이가 그대로인지다 (S-piece).

  messages: conservationOfAngularMomentumMessages,
};
