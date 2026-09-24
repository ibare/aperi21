// ========================================================================
// lorentz-force — 선언
// ========================================================================
// 질문: 자기장 속에서 움직이는 전하는 어느 쪽으로 밀리는가. 속도 쪽도, 자기장 쪽도
// 아니라면 어디인가.
//
// 답: 속도 v 와 자기장 B **양쪽에 직각인** 쪽이다. v 를 어떻게 돌려도 힘 F 는 두
// 화살표가 이루는 면에서 곧게 솟는다. v 가 B 와 나란해지면 그런 면이 없고 힘도 없다.
// 전하의 부호가 바뀌면 F 는 같은 선 위에서 반대쪽을 가리킨다.
//
// 동사: v 를 돌리면 F 가 늘 두 화살표에 직각인 쪽으로 **따라 돈다.**
//
// 이웃 `charged-particle-in-magnetic-field` 는 그 힘이 만드는 원운동을 말한다. 여기서는
// 한 순간의 힘의 방향만 다루고 전하는 움직이지 않는다(되풀이하지 않는다).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:lorentz-force` 와 문자 그대로 일치한다 (C4). */
export const LORENTZ_FORCE_ID = 'lorentz-force';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 길이는 임의 단위, 원점은 전하. 세계 z 가 위(자기장 쪽)다.
// ------------------------------------------------------------------------

/** 전하량(부호 포함, 임의 단위). `flip` 단계부터 부호가 반대가 된다. */
export const CHARGE = 1;
/** 속력(임의 단위). */
export const SPEED = 1;
/** 자기장 세기(임의 단위). 방향은 세계 z(화면 위)로 고정이다. */
export const FIELD = 1;

/** 속력 1 이 차지하는 월드 길이 — v 화살표 길이 배율. */
export const VELOCITY_SCALE = 1.1;
/** 자기장 1 이 차지하는 월드 길이 — B 화살표 길이 배율. */
export const FIELD_SCALE = 1.35;
/** 힘 qvB = 1 이 차지하는 월드 길이 — F 화살표 길이 배율. v 와 같게 두면 두 끝이 같은 원을 돈다. */
export const FORCE_SCALE = 1.1;

/** `turn` · `negTurn` 단계마다 v 가 도는 바퀴 수. **정수라야** 단계 끝에서 v 가 제자리로 온다(NOTES c). */
export const TURNS = 1;
/** v 를 수평면에서 B 쪽으로 세우는 각(rad). π/2 이면 v 가 B 와 나란해진다. */
export const TILT_ANGLE = Math.PI / 2;
/**
 * v 를 세우는 방위(rad, 세계 x 축에서). 도는 단계도 이 방위에서 시작해 여기서 끝난다.
 * 시선에서 45° 비킨 쪽이다 — v 는 오른쪽 앞, F(양전하)는 왼쪽 앞으로 가서 둘 다 화면에서
 * 제 길이의 3/4 쯤으로 보이고 이름표가 갈라선다. 시선과 나란하게 두면 F 가 짧아져
 * 「세우면 줄어든다」 와 원근으로 짧아진 것이 섞인다.
 */
export const TILT_AZIMUTH = (115 * Math.PI) / 180;

/** 고정 시점 — 옆으로 돌린 각(rad). */
export const VIEW_YAW = 0.35;
/** 고정 시점 — 내려다보는 각(rad). 수평면의 원이 타원으로 열리는 정도. */
export const VIEW_ELEV = 0.45;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/**
 * 프레이밍. 왼쪽은 세 화살표(어느 쪽을 향해도 이 안), 오른쪽은 캡션 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.6, maxX: 4.5, minY: -0.8, maxY: 1.5 } as const;
/** 캡션을 세우는 월드 자리(왼쪽 끝, 세로 가운데). */
export const CAPTION_AT = [1.7, 0.35] as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const lorentzForceMessages = Object.freeze({
  'label.title': {
    ko: '로런츠 힘',
    en: 'Lorentz force',
    ja: 'ローレンツ力',
    zh: '洛伦兹力',
    ar: 'قوة لورنتز',
    es: 'Fuerza de Lorentz',
    fr: 'Force de Lorentz',
    hi: 'लोरेंत्ज़ बल',
    id: 'Gaya Lorentz',
    pt: 'Força de Lorentz',
  },
  'label.operation': {
    ko: '자기장 속 전하가 받는 힘',
    en: 'The force on a charge moving in a magnetic field',
    ja: '磁場中を動く電荷が受ける力',
    zh: '在磁场中运动的电荷所受的力',
    ar: 'القوة المؤثرة في شحنة تتحرك في مجال مغناطيسي',
    es: 'La fuerza sobre una carga que se mueve en un campo magnético',
    fr: 'La force sur une charge en mouvement dans un champ magnétique',
    hi: 'चुंबकीय क्षेत्र में गतिमान आवेश पर बल',
    id: 'Gaya pada muatan yang bergerak dalam medan magnet',
    pt: 'A força sobre uma carga que se move em um campo magnético',
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

  /** 화살표 이름. 물리 기호라 두 언어가 같다 (C1 판정 3). */
  'label.velocity': {
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
  'label.field': {
    ko: 'B',
    en: 'B',
    ja: 'B',
    zh: 'B',
    ar: 'B',
    es: 'B',
    fr: 'B',
    hi: 'B',
    id: 'B',
    pt: 'B',
  },
  'label.force': {
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
  /** 힘이 사라진 순간 전하 옆의 표식. 값이 끼지 않는 기호 표기다 (C1 판정 3). */
  'label.forceZero': {
    ko: 'F = 0',
    en: 'F = 0',
    ja: 'F = 0',
    zh: 'F = 0',
    ar: 'F = 0',
    es: 'F = 0',
    fr: 'F = 0',
    hi: 'F = 0',
    id: 'F = 0',
    pt: 'F = 0',
  },

  'caption.turn': {
    ko: 'v 를 돌리면 F 도 따라 돈다. F 는 언제나 v 와 B 양쪽에 직각이다.',
    en: 'Turn v and F turns with it, always at right angles to both v and B.',
    ja: 'v を回すと F も一緒に回る。F はいつも v と B の両方に直角だ。',
    zh: '转动 v，F 也随之转动，并且始终与 v 和 B 都垂直。',
    ar: 'أدِر v فيدور F معه، ويبقى دائمًا عموديًا على كلٍّ من v وB.',
    es: 'Gira v y F gira con ella, siempre perpendicular a v y a B.',
    fr: 'Faites tourner v et F tourne avec, toujours perpendiculaire à la fois à v et à B.',
    hi: 'v को घुमाइए तो F भी साथ घूमता है, हमेशा v और B दोनों के लंबवत।',
    id: 'Putar v dan F ikut berputar, selalu tegak lurus terhadap v maupun B.',
    pt: 'Gire v e F gira junto, sempre perpendicular a v e a B.',
  },
  'caption.tilt': {
    ko: 'v 를 B 쪽으로 세우면 F 가 줄어든다. 방향은 그대로 두 화살표에 직각이다.',
    en: 'Tip v up toward B and F shrinks. It still points at right angles to both arrows.',
    ja: 'v を B のほうへ起こすと F が小さくなる。向きは変わらず二本の矢印に直角だ。',
    zh: '把 v 朝 B 竖起，F 就变小。它仍然垂直于两个箭头。',
    ar: 'أمِل v نحو B فيصغر F. ويبقى متجهًا عموديًا على السهمين كليهما.',
    es: 'Inclina v hacia B y F se reduce. Sigue apuntando perpendicular a ambas flechas.',
    fr: 'Redressez v vers B et F diminue. Il reste perpendiculaire aux deux flèches.',
    hi: 'v को B की ओर उठाइए तो F घटता है। वह अब भी दोनों तीरों के लंबवत रहता है।',
    id: 'Tegakkan v ke arah B dan F mengecil. Arahnya tetap tegak lurus terhadap kedua panah.',
    pt: 'Incline v na direção de B e F diminui. Continua apontando perpendicular às duas setas.',
  },
  'caption.parallel': {
    ko: 'v 가 B 와 나란하면 힘이 없다.',
    en: 'With v parallel to B there is no force at all.',
    ja: 'v が B と平行だと、力はまったくはたらかない。',
    zh: 'v 与 B 平行时，完全没有力。',
    ar: 'حين يكون v موازيًا لـ B لا توجد قوة على الإطلاق.',
    es: 'Con v paralela a B no hay ninguna fuerza.',
    fr: 'Avec v parallèle à B, il n’y a aucune force.',
    hi: 'जब v, B के समांतर हो तो कोई बल नहीं होता।',
    id: 'Saat v sejajar dengan B, tidak ada gaya sama sekali.',
    pt: 'Com v paralela a B não há força alguma.',
  },
  'caption.untilt': {
    ko: 'v 를 다시 눕히면 F 가 되살아난다.',
    en: 'Lay v back down and F returns.',
    ja: 'v を再び寝かせると F がよみがえる。',
    zh: '把 v 重新放平，F 又出现了。',
    ar: 'أعِد v إلى وضعه الأفقي فيعود F.',
    es: 'Vuelve a tumbar v y F reaparece.',
    fr: 'Rabaissez v et F réapparaît.',
    hi: 'v को फिर से लिटाइए तो F लौट आता है।',
    id: 'Rebahkan kembali v dan F muncul lagi.',
    pt: 'Deite v de novo e F volta.',
  },
  'caption.flip': {
    ko: '전하를 음으로 바꾸면 F 가 같은 선 위에서 반대쪽을 가리킨다.',
    en: 'Make the charge negative and F points the opposite way along the same line.',
    ja: '電荷を負にすると、F は同じ直線上で反対側を向く。',
    zh: '把电荷变为负电荷，F 就沿同一直线指向相反方向。',
    ar: 'اجعل الشحنة سالبة فيشير F إلى الاتجاه المعاكس على الخط نفسه.',
    es: 'Haz negativa la carga y F apunta en sentido contrario sobre la misma línea.',
    fr: 'Rendez la charge négative et F pointe dans le sens opposé sur la même droite.',
    hi: 'आवेश को ऋणात्मक कर दीजिए तो F उसी रेखा पर उलटी ओर इशारा करता है।',
    id: 'Jadikan muatannya negatif dan F menunjuk ke arah berlawanan pada garis yang sama.',
    pt: 'Torne a carga negativa e F aponta no sentido oposto, ao longo da mesma linha.',
  },
  'caption.negTurn': {
    ko: '음전하도 v 를 돌리면 F 가 따라 돈다 — 방향만 반대이고, 여전히 v 와 B 에 직각이다.',
    en: 'For a negative charge F still follows v round — reversed, but still at right angles to v and B.',
    ja: '負電荷でも v を回すと F がついて回る — 向きは逆だが、やはり v と B に直角だ。',
    zh: '对负电荷，F 仍随 v 转动 — 方向相反，但仍与 v 和 B 垂直。',
    ar: 'مع الشحنة السالبة يظل F يتبع v في دورانه — معكوسًا، لكنه ما زال عموديًا على v وB.',
    es: 'Con una carga negativa, F sigue girando con v — invertida, pero aún perpendicular a v y a B.',
    fr: 'Pour une charge négative, F suit toujours v dans sa rotation — inversée, mais toujours perpendiculaire à v et à B.',
    hi: 'ऋणात्मक आवेश के लिए भी F, v के साथ घूमता है — उलटा, पर फिर भी v और B के लंबवत।',
    id: 'Untuk muatan negatif, F tetap mengikuti putaran v — terbalik, tetapi tetap tegak lurus terhadap v dan B.',
    pt: 'Para uma carga negativa, F ainda acompanha v na rotação — invertida, mas ainda perpendicular a v e a B.',
  },
} satisfies Record<string, LocalizedText>);

export type LorentzForceMessageKey = keyof typeof lorentzForceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: LorentzForceMessageKey): LocalizedText => lorentzForceMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LorentzForceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const lorentzForceSchema: BundleSchema = {
  id: LORENTZ_FORCE_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        charge: CHARGE,
        speed: SPEED,
        field: FIELD,
        velocityScale: VELOCITY_SCALE,
        fieldScale: FIELD_SCALE,
        forceScale: FORCE_SCALE,
        turns: TURNS,
        tiltAngle: TILT_ANGLE,
        tiltAzimuth: TILT_AZIMUTH,
        viewYaw: VIEW_YAW,
        viewElev: VIEW_ELEV,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 세 화살표, 오른쪽 캡션. 세로는 B 화살표 길이만큼이면 된다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 쓴 순서대로 겹친다 — 수평면 원 · v–B 면, 시선에서 먼 화살표부터 가까운 화살표, 전하,
   * 이름표. 층 순서로는 같은 `vector` 끼리의 앞뒤를 고를 수 없다 (scene.ts).
   */
  drawOrder: 'scene',

  /** 도착한 순간 v 가 이미 돌고 있다 (S-piece). */
  startAt: 1.5,

  /**
   * 한 주기 15.5 초.
   *
   * - `appear` — 옅게 떠오른다. 앞 주기의 음전하 화면에서 이어지지 않도록. v 가 아직 돌지 않으므로
   *   캡션을 걸지 않는다 — `turn` 의 문장을 미리 말하지 않는다 (S-piece).
   * - `turn` — v 가 수평면(B 에 직각인 면)에서 `turns` 바퀴 돈다. F 는 v 보다 90° 뒤에서 같은 면을 돈다.
   * - `tilt` — v 가 B 쪽으로 선다. 진행도가 세운 각이다. F 는 줄어든다.
   * - `parallel` — v ∥ B. F 가 없다.
   * - `untilt` — v 가 다시 눕는다.
   * - `flip` — 전하 부호가 음으로 바뀐다(단계 시작 순간). 방금까지의 F 를 점선으로 남겨 뒤집힘을 보인다.
   * - `negTurn` — 음전하로 v 가 다시 돈다. F 는 v 보다 90° 앞선다.
   * - `fade` — 옅어지며 물러난다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.5 },
      { id: 'turn', duration: 4, ease: 'linear', caption: key('caption.turn') },
      { id: 'tilt', duration: 2.2, ease: 'smooth', caption: key('caption.tilt') },
      { id: 'parallel', duration: 1.4, caption: key('caption.parallel') },
      { id: 'untilt', duration: 1.6, ease: 'smooth', caption: key('caption.untilt') },
      { id: 'flip', duration: 1.2, caption: key('caption.flip') },
      { id: 'negTurn', duration: 4, ease: 'linear', caption: key('caption.negTurn') },
      { id: 'fade', duration: 0.6, caption: key('caption.negTurn') },
    ],
  },

  /** 슬롯 하나. 오른쪽 빈 자리에 세운다 — 세로가 비싸 아래 줄을 쓰지 않는다. */
  caption: {
    anchor: { world: [CAPTION_AT[0], CAPTION_AT[1]] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 300,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본). 카메라가 움직이면 v 의 회전과 시점의 회전이 섞인다.

  messages: lorentzForceMessages,
};
