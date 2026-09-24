// ========================================================================
// optical-fiber — 선언
// ========================================================================
// 질문: 휘어진 섬유 속에서도 빛이 새지 않고 끝까지 가는가? 얼마나 휘면 새는가?
//
// 답: 휜 섬유 속 한 줄기가 벽에 닿을 때마다 되튀며 끝까지 간다. 아래 부채에 튄 자리마다의
// 입사각을 옮겨 그으면 모든 선이 임계각 너머 띠 안에 있다. 섬유를 급히 휘면 휜 자리의 한 번이
// 띠 밖으로 나오고, 빛은 그 자리에서 클래딩으로 새어 나간다.
//
// 이웃과 겹치지 않게 — `total-internal-reflection` 은 한 경계면에서 입사각을 돌려 임계각을
// 보인다. 여기서는 임계각을 되풀이하지 않고 **정해진 임계각** 을 휜 길 위의 여러 되튐에 대 본다.
// `snells-law` 는 공기에서 들어가는 빛의 꺾임이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:optical-fiber` 와 문자 그대로 일치한다 (C4). */
export const OPTICAL_FIBER_ID = 'optical-fiber';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 코어 · 클래딩 굴절률. */
export const N_CORE = 1.48;
export const N_CLAD = 1.46;
/**
 * 임계각 정박값(도). 화면 글자와 부채의 강조선이 이 값을 쓴다. 새는지 갇히는지의 판정은
 * 굴절률에서 한다(asin(1.46/1.48) = 80.57°) — 둘의 관계는 NOTES (c) G143.
 */
export const CRITICAL_DEG = 80.6;
/** 코어 반폭 · 클래딩 바깥 반폭(월드). 실제 섬유보다 훨씬 굵다 — NOTES (b). */
export const CORE_HALF = 0.12;
export const CLAD_HALF = 0.3;
/** 곧은 들머리 길이 · 섬유 전체 길이(가운데 선). 휨 반지름이 바뀌어도 전체 길이는 같다. */
export const ENTRY_LEN = 5.5;
export const FIBER_LEN = 13.5;
/** 휘는 각(도) — 반시계. */
export const BEND_DEG = 30;
/** 휨 반지름(가운데 선) — 완만한 휨 · 급한 휨. */
export const GENTLE_RADIUS = 5;
export const TIGHT_RADIUS = 0.6;
/**
 * 빛을 넣는 자리(들머리 가운데에서 왼쪽 벽 쪽으로 벗어난 거리) · 방향(축에서 잰 도, 위가 +).
 * 이 셋(들머리 길이 포함)이 빛이 휨에 들어서는 자리를 정한다 — 바깥 벽에서 막 되튄 뒤 휨에
 * 들어서도록 맞췄다. 완만한 휨의 입사각이 임계각에 가장 가까운 자리가 82.8°, 급한 휨에서 새는
 * 자리가 75.2° 다(NOTES (b)).
 */
export const LAUNCH_OFFSET = -0.1;
export const LAUNCH_DEG = 5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 임의. 섬유 들머리 가운데가 원점, 섬유는 +x 로 출발해 위로 휜다.
// ------------------------------------------------------------------------

/**
 * 섬유 아래 「입사각 부채」 — 튄 자리마다의 입사각을 벽 위 한 점에 모아 참 각도 그대로 옮겨 긋는다.
 * 가운데 위가 코어, 아래가 클래딩이고, 빛은 오른쪽 위에서 와 벽에 닿는다. 임계각 너머 띠가 9.4° 로
 * 얇아서 길게(반지름 `FAN_R`) 편다 — 섬유 크기에서는 82.8° 와 80.6° 가 구별되지 않는다(NOTES (b)).
 */
export const FAN_CENTER = [7.4, -1.6] as const;
export const FAN_R = 5.0;
/** 부채 벽선이 가운데에서 왼쪽 · 오른쪽으로 뻗는 길이. */
export const FAN_WALL_LEFT = 3.4;
export const FAN_WALL_RIGHT = 6.0;
/** 부채의 법선 길이 · 코어 띠 높이 · 클래딩 띠 높이. */
export const FAN_NORMAL = 1.1;
export const FAN_CORE_H = 1.1;
export const FAN_CLAD_H = 0.55;
/** 부채에서 새어 나간 빛의 길이. */
export const FAN_LEAK_LEN = 1.1;
/** 섬유에서 새어 나간 빛을 긋는 길이 — 클래딩을 지나 섬유 밖까지 닿게. */
export const LEAK_LEN = 2.2;

/** 프레이밍 — 고정값. 가장 크게 휜 모양 · 부채 · 캡션 줄이 들어간다 (원칙 6). */
export const SCENE_BOUNDS = { minX: -0.8, maxX: 14.3, minY: -3.3, maxY: 4.5 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const opticalFiberMessages = Object.freeze({
  'label.title': {
    ko: '광섬유',
    en: 'Optical fiber',
    ja: '光ファイバー',
    zh: '光纤',
    ar: 'الألياف البصرية',
    es: 'Fibra óptica',
    fr: 'Fibre optique',
    hi: 'प्रकाशीय तंतु',
    id: 'Serat optik',
    pt: 'Fibra óptica',
  },
  'label.operation': {
    ko: '전반사로 가두는 빛',
    en: 'Light trapped by total internal reflection',
    ja: '全反射で閉じ込められる光',
    zh: '被全反射困住的光',
    ar: 'ضوء محبوس بالانعكاس الكلي الداخلي',
    es: 'Luz atrapada por reflexión total interna',
    fr: 'Lumière piégée par réflexion totale interne',
    hi: 'पूर्ण आंतरिक परावर्तन से बँधा प्रकाश',
    id: 'Cahaya yang terperangkap oleh pemantulan sempurna',
    pt: 'Luz aprisionada por reflexão interna total',
  },
  'label.stage': {
    ko: '완만한 휨과 급한 휨',
    en: 'Gentle bend and sharp bend',
    ja: '緩やかな曲げと急な曲げ',
    zh: '缓弯与急弯',
    ar: 'انحناء خفيف وانحناء حاد',
    es: 'Curva suave y curva cerrada',
    fr: 'Courbure douce et courbure serrée',
    hi: 'हल्का मोड़ और तीखा मोड़',
    id: 'Lengkungan landai dan lengkungan tajam',
    pt: 'Curva suave e curva acentuada',
  },
  'label.view': {
    ko: '섬유와 입사각 부채',
    en: 'Fiber and incidence fan',
    ja: 'ファイバーと入射角の扇',
    zh: '光纤与入射角扇形',
    ar: 'الليف ومروحة زوايا السقوط',
    es: 'Fibra y abanico de incidencia',
    fr: 'Fibre et éventail d’incidence',
    hi: 'तंतु और आपतन कोणों का पंखा',
    id: 'Serat dan kipas sudut datang',
    pt: 'Fibra e leque de incidência',
  },

  /** 부채의 이름표. 굴절률 · 임계각은 스테이지 상수를 끼운다 (C1). `n` 은 기호라 번역하지 않는다. */
  'label.core': {
    ko: '코어 · n {n}',
    en: 'Core · n {n}',
    ja: 'コア · n {n}',
    zh: '纤芯 · n {n}',
    ar: 'اللب · n {n}',
    es: 'Núcleo · n {n}',
    fr: 'Cœur · n {n}',
    hi: 'क्रोड · n {n}',
    id: 'Inti · n {n}',
    pt: 'Núcleo · n {n}',
  },
  'label.clad': {
    ko: '클래딩 · n {n}',
    en: 'Cladding · n {n}',
    ja: 'クラッド · n {n}',
    zh: '包层 · n {n}',
    ar: 'الغلاف · n {n}',
    es: 'Revestimiento · n {n}',
    fr: 'Gaine · n {n}',
    hi: 'आवरण · n {n}',
    id: 'Selubung · n {n}',
    pt: 'Casca · n {n}',
  },
  'label.normal': {
    ko: '법선',
    en: 'Normal',
    ja: '法線',
    zh: '法线',
    ar: 'العمود',
    es: 'Normal',
    fr: 'Normale',
    hi: 'अभिलंब',
    id: 'Garis normal',
    pt: 'Normal',
  },
  'label.critical': {
    ko: '임계각 {deg}°',
    en: 'Critical angle {deg}°',
    ja: '臨界角 {deg}°',
    zh: '临界角 {deg}°',
    ar: 'الزاوية الحرجة {deg}°',
    es: 'Ángulo crítico {deg}°',
    fr: 'Angle critique {deg}°',
    hi: 'क्रांतिक कोण {deg}°',
    id: 'Sudut kritis {deg}°',
    pt: 'Ângulo crítico {deg}°',
  },
  'label.fan': {
    ko: '튄 자리마다의 입사각',
    en: 'Angle of incidence at each bounce',
    ja: '反射するたびの入射角',
    zh: '每次反射处的入射角',
    ar: 'زاوية السقوط عند كل ارتداد',
    es: 'Ángulo de incidencia en cada rebote',
    fr: 'Angle d’incidence à chaque rebond',
    hi: 'हर परावर्तन पर आपतन कोण',
    id: 'Sudut datang di setiap pantulan',
    pt: 'Ângulo de incidência em cada reflexão',
  },

  'caption.gentle': {
    ko: '빛이 코어 벽에 닿을 때마다 되튀며 휜 섬유를 따라간다. 아래 부채에 그 자리의 입사각이 하나씩 쌓인다.',
    en: 'Each time the light meets the core wall it bounces back and follows the bent fiber. The fan below collects the angle of incidence at each bounce.',
    ja: '光はコアの壁に当たるたびに跳ね返り、曲がったファイバーに沿って進む。下の扇に、そのたびの入射角が一本ずつたまる。',
    zh: '光每次碰到纤芯壁都会反射回来，沿着弯曲的光纤前进。下方的扇形逐一收集每次反射处的入射角。',
    ar: 'في كل مرة يصل الضوء إلى جدار اللب يرتدّ ويتبع الليف المنحني. وتجمع المروحة في الأسفل زاوية السقوط عند كل ارتداد.',
    es: 'Cada vez que la luz llega a la pared del núcleo, rebota y sigue la fibra curvada. El abanico de abajo recoge el ángulo de incidencia de cada rebote.',
    fr: 'Chaque fois que la lumière atteint la paroi du cœur, elle rebondit et suit la fibre courbée. L’éventail du bas recueille l’angle d’incidence de chaque rebond.',
    hi: 'हर बार जब प्रकाश क्रोड की दीवार से मिलता है, वह लौटकर मुड़े हुए तंतु के साथ आगे बढ़ता है। नीचे का पंखा हर परावर्तन का आपतन कोण जमा करता है।',
    id: 'Setiap kali cahaya mengenai dinding inti, ia memantul dan mengikuti serat yang melengkung. Kipas di bawah mengumpulkan sudut datang di setiap pantulan.',
    pt: 'Cada vez que a luz atinge a parede do núcleo, ela reflete e segue a fibra curvada. O leque abaixo reúne o ângulo de incidência de cada reflexão.',
  },
  'caption.gentleHold': {
    ko: '부채의 선이 모두 임계각 {c}° 너머 띠 안에 있다 — 빛은 한 번도 새지 않고 섬유 끝까지 왔다.',
    en: 'Every line in the fan lies inside the band beyond the {c}° critical angle — the light reached the end of the fiber without leaking once.',
    ja: '扇の線はすべて臨界角 {c}° の先の帯の中にある — 光は一度も漏れずにファイバーの端まで届いた。',
    zh: '扇形中的每条线都在临界角 {c}° 以外的带内——光一次也没有漏出，到达了光纤末端。',
    ar: 'كل خطوط المروحة تقع داخل الشريط الذي يتجاوز الزاوية الحرجة {c}° — وصل الضوء إلى نهاية الليف دون أن يتسرّب ولو مرة.',
    es: 'Todas las líneas del abanico quedan dentro de la franja más allá del ángulo crítico de {c}° — la luz llegó al final de la fibra sin escaparse ni una vez.',
    fr: 'Toutes les lignes de l’éventail sont dans la bande au-delà de l’angle critique de {c}° — la lumière a atteint le bout de la fibre sans fuir une seule fois.',
    hi: 'पंखे की हर रेखा {c}° क्रांतिक कोण से आगे वाली पट्टी के भीतर है — प्रकाश एक बार भी बाहर निकले बिना तंतु के सिरे तक पहुँच गया।',
    id: 'Semua garis pada kipas berada di dalam pita di luar sudut kritis {c}° — cahaya sampai di ujung serat tanpa bocor sekali pun.',
    pt: 'Todas as linhas do leque ficam dentro da faixa além do ângulo crítico de {c}° — a luz chegou ao fim da fibra sem vazar nenhuma vez.',
  },
  'caption.tighten': {
    ko: '섬유를 더 급히 휜다.',
    en: 'The fiber is bent more sharply.',
    ja: 'ファイバーをもっと急に曲げる。',
    zh: '把光纤弯得更急。',
    ar: 'يُثنى الليف بحدة أكبر.',
    es: 'La fibra se curva más bruscamente.',
    fr: 'On courbe la fibre plus fortement.',
    hi: 'तंतु को और तीखा मोड़ा जाता है।',
    id: 'Serat dibengkokkan lebih tajam.',
    pt: 'A fibra é curvada de forma mais acentuada.',
  },
  'caption.tight': {
    ko: '같은 자리에서 같은 빛을 다시 넣는다.',
    en: 'The same light goes in again at the same spot.',
    ja: '同じ場所から同じ光をもう一度入れる。',
    zh: '在同一处再次射入同样的光。',
    ar: 'يدخل الضوء نفسه مرة أخرى من الموضع نفسه.',
    es: 'La misma luz vuelve a entrar por el mismo punto.',
    fr: 'La même lumière entre de nouveau au même endroit.',
    hi: 'वही प्रकाश उसी जगह से फिर डाला जाता है।',
    id: 'Cahaya yang sama masuk lagi di titik yang sama.',
    pt: 'A mesma luz entra de novo no mesmo ponto.',
  },
  'caption.leak': {
    ko: '급히 휜 자리의 한 번은 입사각이 임계각 {c}° 에 못 미친다 — 부채에서 그 선만 띠 밖이다. 빛은 거기서 클래딩으로 새어 나갔다.',
    en: 'At the sharp bend one bounce falls short of the {c}° critical angle — that is the only line outside the band. The light leaked into the cladding there.',
    ja: '急に曲がった所の一回は入射角が臨界角 {c}° に届かない — 扇でその線だけが帯の外にある。光はそこでクラッドへ漏れ出した。',
    zh: '急弯处有一次反射的入射角不到临界角 {c}°——扇形中只有这条线在带外。光在那里漏进了包层。',
    ar: 'عند الانحناء الحاد يقصر ارتداد واحد عن الزاوية الحرجة {c}° — وهو الخط الوحيد خارج الشريط. هناك تسرّب الضوء إلى الغلاف.',
    es: 'En la curva cerrada, un rebote no llega al ángulo crítico de {c}° — es la única línea fuera de la franja. Allí la luz se escapó al revestimiento.',
    fr: 'Dans la courbure serrée, un rebond n’atteint pas l’angle critique de {c}° — c’est la seule ligne hors de la bande. La lumière s’est échappée dans la gaine à cet endroit.',
    hi: 'तीखे मोड़ पर एक परावर्तन {c}° क्रांतिक कोण से कम रह जाता है — बस वही रेखा पट्टी के बाहर है। प्रकाश वहीं से आवरण में रिस गया।',
    id: 'Di lengkungan tajam, satu pantulan tidak mencapai sudut kritis {c}° — hanya garis itu yang berada di luar pita. Di sana cahaya bocor ke selubung.',
    pt: 'Na curva acentuada, uma reflexão fica abaixo do ângulo crítico de {c}° — é a única linha fora da faixa. Ali a luz vazou para a casca.',
  },
  'caption.relax': {
    ko: '섬유를 다시 완만하게 편다.',
    en: 'The fiber is eased back to a gentle bend.',
    ja: 'ファイバーを再び緩やかな曲げに戻す。',
    zh: '光纤恢复为平缓的弯曲。',
    ar: 'يعود الليف إلى انحناء خفيف.',
    es: 'La fibra vuelve a una curva suave.',
    fr: 'La fibre revient à une courbure douce.',
    hi: 'तंतु फिर हल्के मोड़ पर लौटता है।',
    id: 'Serat dikembalikan ke lengkungan landai.',
    pt: 'A fibra volta a uma curva suave.',
  },
} satisfies Record<string, LocalizedText>);

export type OpticalFiberMessageKey = keyof typeof opticalFiberMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: OpticalFiberMessageKey): LocalizedText => opticalFiberMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: OpticalFiberMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const opticalFiberSchema: BundleSchema = {
  id: OPTICAL_FIBER_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'gentle-and-sharp',
      label: text('label.stage'),
      constants: {
        nCore: N_CORE,
        nClad: N_CLAD,
        criticalDeg: CRITICAL_DEG,
        coreHalf: CORE_HALF,
        cladHalf: CLAD_HALF,
        entryLen: ENTRY_LEN,
        fiberLen: FIBER_LEN,
        bendDeg: BEND_DEG,
        gentleRadius: GENTLE_RADIUS,
        tightRadius: TIGHT_RADIUS,
        launchOffset: LAUNCH_OFFSET,
        launchDeg: LAUNCH_DEG,
      },
    },
  ],
  environments: [],
  views: [{ id: 'fiber', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 위에 섬유, 그 아래 부채, 맨 아래 캡션 줄. */
  canvas: { height: 440, minHeight: 360 },

  /** 도착한 순간 빛이 이미 섬유 중간까지 와 있다 (S-piece). */
  startAt: 2.4,

  /**
   * 한 주기 19 초.
   *
   * - `gentle` — 완만히 휜 섬유 속을 빛이 나아간다. 튄 자리마다 부채에 입사각 선이 생긴다.
   * - `gentleHold` — 끝까지 온 경로와 부채가 머문다. `gentleFade` 에서 빛 · 부채 선이 옅어진다.
   * - `tighten` — 섬유가 급히 휜다(빛 없음).
   * - `tight` — 같은 빛이 다시 나아가다 휜 자리에서 새어 나간다.
   * - `leakHold` — 머문다. `tightFade` 에서 옅어진다.
   * - `relax` — 섬유가 완만한 휨으로 돌아간다(빛 없음).
   */
  timeline: {
    phases: [
      { id: 'gentle', duration: 5.0, caption: key('caption.gentle') },
      { id: 'gentleHold', duration: 3.4, caption: key('caption.gentleHold') },
      { id: 'gentleFade', duration: 0.6, ease: 'smooth', caption: key('caption.gentleHold') },
      { id: 'tighten', duration: 1.4, ease: 'smooth', caption: key('caption.tighten') },
      { id: 'tight', duration: 3.2, caption: key('caption.tight') },
      { id: 'leakHold', duration: 3.4, caption: key('caption.leak') },
      { id: 'tightFade', duration: 0.6, ease: 'smooth', caption: key('caption.leak') },
      { id: 'relax', duration: 1.4, ease: 'smooth', caption: key('caption.relax') },
    ],
  },

  /** 슬롯 하나. 캡션 속 임계각은 스테이지 상수에서 `initialState` 가 만든 문자열이다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 560,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: { c: 'criticalText' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 · 조작기 없음(기본).

  messages: opticalFiberMessages,
};
