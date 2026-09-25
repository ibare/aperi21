// ========================================================================
// nuclear-fusion — 선언
// ========================================================================
// 질문: 가벼운 핵이 합쳐질 때 나오는 에너지는 어디서 오는가.
//
// 답: 중수소(²H)와 삼중수소(³H)가 합쳐져 헬륨-4 와 중성자가 되면, 반응 뒤 질량의 합이
// 반응 전보다 0.018883 u 작다. 사라진 질량이 날아가는 두 입자의 운동 에너지 17.6 MeV 로
// 나온다 — 질량이 에너지로 바뀐다.
//
// 이웃 `stellar-nucleosynthesis` 는 별 안에서 원소가 겹겹이 쌓이며 곡선을 오르는 것을,
// `binding-energy-curve` 는 융합 · 분열이 모두 철 쪽으로 곡선을 오르는 것을 보인다.
// 이 조각은 곡선을 그리지 않는다 — **한 번의 반응에서 저울에 단 질량이 줄어드는 것**을 보인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:nuclear-fusion` 와 문자 그대로 일치한다 (C4). */
export const NUCLEAR_FUSION_ID = 'nuclear-fusion';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const nuclearFusionMessages = Object.freeze({
  'label.title': { ko: '핵융합', en: 'Nuclear fusion', ja: '核融合', zh: '核聚变', ar: 'الاندماج النووي', es: 'Fusión nuclear', fr: 'Fusion nucléaire', hi: 'नाभिकीय संलयन', id: 'Fusi nuklir', pt: 'Fusão nuclear' },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '가벼운 핵이 합쳐지며 내는 에너지',
    en: 'Energy released when light nuclei join',
    ja: '軽い原子核が合わさるときに出るエネルギー',
    zh: '轻核结合时释放的能量',
    ar: 'الطاقة المنطلقة عند اتحاد النوى الخفيفة',
    es: 'Energía liberada cuando se unen núcleos ligeros',
    fr: 'L’énergie libérée quand des noyaux légers s’unissent',
    hi: 'हल्के नाभिकों के जुड़ने पर मुक्त होने वाली ऊर्जा',
    id: 'Energi yang dilepaskan saat inti ringan bergabung',
    pt: 'Energia liberada quando núcleos leves se unem',
  },
  'label.stage': { ko: '중수소-삼중수소 반응', en: 'Deuterium–tritium reaction', ja: '重水素–三重水素反応', zh: '氘–氚反应', ar: 'تفاعل الديوتيريوم–التريتيوم', es: 'Reacción deuterio–tritio', fr: 'Réaction deutérium–tritium', hi: 'ड्यूटेरियम–ट्राइटियम अभिक्रिया', id: 'Reaksi deuterium–tritium', pt: 'Reação deutério–trítio' },
  'label.view': { ko: '질량 결손', en: 'Mass defect', ja: '質量欠損', zh: '质量亏损', ar: 'نقص الكتلة', es: 'Defecto de masa', fr: 'Défaut de masse', hi: 'द्रव्यमान क्षति', id: 'Defek massa', pt: 'Defeito de massa' },

  /** 막대 이름. 조사가 붙는 말이라 문안이다 (C1 판정 4). */
  'label.before': { ko: '반응 전', en: 'before', ja: '反応前', zh: '反应前', ar: 'قبل', es: 'antes', fr: 'avant', hi: 'पहले', id: 'sebelum', pt: 'antes' },
  'label.after': { ko: '반응 뒤', en: 'after', ja: '反応後', zh: '反应后', ar: 'بعد', es: 'después', fr: 'après', hi: 'बाद', id: 'sesudah', pt: 'depois' },
  /** 확대창 이름 — 배율은 선언된 정박값을 그대로 끼운다 (S-piece 유효숫자). */
  'label.zoom': { ko: '막대 위 끝 ×{z} 확대', en: 'top of the bars, ×{z}', ja: '棒の上端、×{z}', zh: '柱的顶端，×{z}', ar: 'أعلى الأعمدة، ×{z}', es: 'parte superior de las barras, ×{z}', fr: 'haut des barres, ×{z}', hi: 'स्तंभों का ऊपरी सिरा, ×{z}', id: 'puncak batang, ×{z}', pt: 'topo das barras, ×{z}' },
  /** 질량 · 에너지 값. 수는 스테이지 상수의 문자열 그대로다. */
  'label.mass': { ko: '{m} u', en: '{m} u', ja: '{m} u', zh: '{m} u', ar: '{m} u', es: '{m} u', fr: '{m} u', hi: '{m} u', id: '{m} u', pt: '{m} u' },
  'label.defect': { ko: 'Δm = {m} u', en: 'Δm = {m} u', ja: 'Δm = {m} u', zh: 'Δm = {m} u', ar: 'Δm = {m} u', es: 'Δm = {m} u', fr: 'Δm = {m} u', hi: 'Δm = {m} u', id: 'Δm = {m} u', pt: 'Δm = {m} u' },
  'label.energy': { ko: '{e} MeV', en: '{e} MeV', ja: '{e} MeV', zh: '{e} MeV', ar: '{e} MeV', es: '{e} MeV', fr: '{e} MeV', hi: '{e} MeV', id: '{e} MeV', pt: '{e} MeV' },
  'label.released': { ko: '→ 에너지 {e} MeV', en: '→ {e} MeV of energy', ja: '→ エネルギー {e} MeV', zh: '→ 能量 {e} MeV', ar: '→ طاقة {e} MeV', es: '→ {e} MeV de energía', fr: '→ {e} MeV d’énergie', hi: '→ {e} MeV ऊर्जा', id: '→ energi {e} MeV', pt: '→ {e} MeV de energia' },

  /** 핵종 기호. 원어로 통용되는 표식이지만 저작자가 바꿀 수 있게 키로 둔다 (C1 판정 3). */
  'symbol.D': { ko: '²H', en: '²H', ja: '²H', zh: '²H', ar: '²H', es: '²H', fr: '²H', hi: '²H', id: '²H', pt: '²H' },
  'symbol.T': { ko: '³H', en: '³H', ja: '³H', zh: '³H', ar: '³H', es: '³H', fr: '³H', hi: '³H', id: '³H', pt: '³H' },
  'symbol.He': { ko: '⁴He', en: '⁴He', ja: '⁴He', zh: '⁴He', ar: '⁴He', es: '⁴He', fr: '⁴He', hi: '⁴He', id: '⁴He', pt: '⁴He' },
  'symbol.n': { ko: 'n', en: 'n', ja: 'n', zh: 'n', ar: 'n', es: 'n', fr: 'n', hi: 'n', id: 'n', pt: 'n' },

  'caption.meet': {
    ko: '중수소(²H)와 삼중수소(³H)가 부딪쳐 합쳐진다 — 가운데 막대는 두 핵의 질량을 쌓은 것이다.',
    en: 'Deuterium (²H) and tritium (³H) collide and fuse — the middle bar stacks up the mass of the two nuclei.',
    ja: '重水素（²H）と三重水素（³H）がぶつかって融合する — 真ん中の棒は二つの原子核の質量を積み上げたものだ。',
    zh: '氘（²H）和氚（³H）相撞并聚变 — 中间的柱把两个核的质量叠在一起。',
    ar: 'يتصادم الديوتيريوم (²H) والتريتيوم (³H) ويندمجان — العمود الأوسط يكدّس كتلتي النواتين.',
    es: 'El deuterio (²H) y el tritio (³H) chocan y se fusionan — la barra del centro apila la masa de los dos núcleos.',
    fr: 'Le deutérium (²H) et le tritium (³H) se heurtent et fusionnent — la barre du milieu empile la masse des deux noyaux.',
    hi: 'ड्यूटेरियम (²H) और ट्राइटियम (³H) टकराकर संलयित होते हैं — बीच का स्तंभ दोनों नाभिकों का द्रव्यमान एक के ऊपर एक रखता है।',
    id: 'Deuterium (²H) dan tritium (³H) bertumbukan lalu berfusi — batang tengah menumpuk massa kedua inti.',
    pt: 'O deutério (²H) e o trítio (³H) colidem e se fundem — a barra do meio empilha a massa dos dois núcleos.',
  },
  'caption.convert': {
    ko: '헬륨-4 와 중성자가 튀어 나가는 동안 「반응 뒤」 막대의 위 끝이 사라진다 — 사라진 질량이 두 입자의 운동 에너지가 된다.',
    en: 'As helium-4 and a neutron fly apart, the top of the “after” bar disappears — the lost mass becomes their kinetic energy.',
    ja: 'ヘリウム-4 と中性子が飛び散るあいだに、「反応後」の棒の上端が消えていく — 失われた質量が二つの運動エネルギーになる。',
    zh: '氦-4 和一个中子向两边飞散时，“反应后”柱的顶端消失了 — 失去的质量变成了它们的动能。',
    ar: 'بينما يتطاير الهيليوم-4 ونيوترون متباعدَين، يختفي أعلى عمود «بعد» — تصير الكتلة المفقودة طاقتَهما الحركية.',
    es: 'Mientras el helio-4 y un neutrón salen despedidos, desaparece la parte superior de la barra “después” — la masa perdida se convierte en su energía cinética.',
    fr: 'Tandis que l’hélium 4 et un neutron s’éloignent, le haut de la barre « après » disparaît — la masse perdue devient leur énergie cinétique.',
    hi: 'जब हीलियम-4 और एक न्यूट्रॉन अलग-अलग उड़ते हैं, “बाद” स्तंभ का ऊपरी सिरा गायब हो जाता है — खोया द्रव्यमान उनकी गतिज ऊर्जा बन जाता है।',
    id: 'Saat helium-4 dan sebuah neutron terpental menjauh, puncak batang “sesudah” lenyap — massa yang hilang menjadi energi kinetik keduanya.',
    pt: 'Enquanto o hélio-4 e um nêutron se afastam, o topo da barra “depois” desaparece — a massa perdida vira a energia cinética deles.',
  },
  'caption.renew': {
    ko: '다음 중수소와 삼중수소가 제자리에 선다.',
    en: 'The next deuterium and tritium take their places.',
    ja: '次の重水素と三重水素が所定の位置につく。',
    zh: '下一对氘和氚各就各位。',
    ar: 'يأخذ الديوتيريوم والتريتيوم التاليان مكانيهما.',
    es: 'El siguiente deuterio y el siguiente tritio ocupan su lugar.',
    fr: 'Le deutérium et le tritium suivants prennent place.',
    hi: 'अगले ड्यूटेरियम और ट्राइटियम अपनी जगह ले लेते हैं।',
    id: 'Deuterium dan tritium berikutnya mengambil tempatnya.',
    pt: 'O próximo deutério e o próximo trítio tomam seus lugares.',
  },
  'caption.defect': {
    ko: '반응 뒤의 질량 합이 조금 작다 — 온 막대로는 보이지 않는 이 작은 차이가 날아가는 두 입자의 에너지로 나왔다.',
    en: 'The mass after the reaction is slightly smaller — a difference too small to see on the full bars, and it came out as the energy of the two flying particles.',
    ja: '反応後の質量の和はわずかに小さい — 棒全体では見えないこの小さな差が、飛んでいく二つの粒子のエネルギーとして出てきた。',
    zh: '反应后的质量略小 — 这点差别小到在完整的柱上看不出来，它变成了两个飞出粒子的能量。',
    ar: 'الكتلة بعد التفاعل أصغر قليلًا — فرق أصغر من أن يُرى على الأعمدة الكاملة، وقد خرج طاقةً للجسيمين المتطايرين.',
    es: 'La masa después de la reacción es un poco menor — una diferencia demasiado pequeña para verse en las barras enteras, y salió como la energía de las dos partículas que vuelan.',
    fr: 'La masse après la réaction est légèrement plus petite — une différence trop faible pour se voir sur les barres entières, et elle est sortie sous forme d’énergie des deux particules qui s’envolent.',
    hi: 'अभिक्रिया के बाद द्रव्यमान थोड़ा कम है — यह अंतर पूरे स्तंभों पर दिखने के लिए बहुत छोटा है, और यही उड़ते दोनों कणों की ऊर्जा बनकर निकला।',
    id: 'Massa sesudah reaksi sedikit lebih kecil — selisih yang terlalu kecil untuk terlihat pada batang utuh, dan itulah yang keluar sebagai energi kedua partikel yang melesat.',
    pt: 'A massa depois da reação é um pouco menor — uma diferença pequena demais para ver nas barras inteiras, e ela saiu como a energia das duas partículas que voam.',
  },
} satisfies Record<string, LocalizedText>);

export type NuclearFusionMessageKey = keyof typeof nuclearFusionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: NuclearFusionMessageKey): LocalizedText => nuclearFusionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: NuclearFusionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값 (원칙 2). 질량은 원자 질량(u), 소수 여섯째 자리.
// ------------------------------------------------------------------------

/**
 * 반응 D + T → ⁴He + n 의 선언값. 화면에 띄우는 수는 모두 여기의 문자열 그대로다 —
 * 계산해 반올림하지 않는다 (S-piece 유효숫자). 합 · 결손 · 에너지는 사이 관계가 있어
 * `physics.readConstants` 가 검사한다 (장부 G143).
 */
export const DEFAULTS = {
  /** 중수소 ²H 원자 질량(u). */
  massD: 2.014102,
  /** 삼중수소 ³H 원자 질량(u). */
  massT: 3.016049,
  /** 헬륨-4 원자 질량(u). */
  massHe: 4.002603,
  /** 중성자 질량(u). */
  massN: 1.008665,
  /** 반응 전 합 = massD + massT. 띄우는 정박값. */
  sumBefore: 5.030151,
  /** 반응 뒤 합 = massHe + massN. 띄우는 정박값. */
  sumAfter: 5.011268,
  /** 질량 결손 = sumBefore − sumAfter. 띄우는 정박값. */
  massDefect: 0.018883,
  /** 1 u 의 정지 에너지(MeV) — c² 을 u → MeV 로 옮긴 값. */
  uToMeV: 931.494,
  /** 나오는 에너지 ≈ massDefect × uToMeV. 띄우는 정박값(MeV). */
  energyMeV: 17.6,
  /** 헬륨-4 · 중성자가 나눠 가진 운동 에너지(MeV). 운동량이 같아 질량에 반비례한다. */
  energyHeMeV: 3.5,
  energyNMeV: 14.1,
  /**
   * 확대창 배율. 결손은 합의 0.4 % 라 온 막대에서는 1 px 도 안 된다 — 위 끝을 이만큼 키워
   * 보인다. 화면에 「×100」 으로 알린다 (장부 지시: 작은 효과를 키운 배율은 이름 붙여 선언).
   */
  zoomFactor: 100,
} as const;

export type NuclearFusionConstantKey = keyof typeof DEFAULTS;

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 임의. 반응은 왼쪽, 온 막대는 가운데, 확대창은 오른쪽.
// ------------------------------------------------------------------------

export const LAYOUT = {
  /** 반응 — 두 핵이 만나는 자리와 처음 자리. */
  meet: [-3.6, 1.0] as const,
  dStartX: -5.6,
  tStartX: -2.0,
  /** 만나는 순간 두 핵 중심 사이 거리(월드). */
  contactGap: 0.52,
  /** 튀어 나가는 방향(도, 월드 +x 에서 반시계). 중성자와 헬륨은 정반대로 간다. */
  neutronDirDeg: 150,
  /** 중성자가 `fly` 시작부터 `hold` 끝까지 가는 거리(월드). 헬륨은 속력 비만큼 짧게 간다. */
  neutronTravel: 1.8,
  /** 에너지 화살표 — 1 MeV 의 길이(월드). 화살표 길이가 곧 그 입자가 받은 에너지다. */
  arrowPerMeV: 0.085,

  /** 온 막대 — 바닥 높이 · 1 u 의 높이 · 두 막대의 가로 구간. */
  barBaseY: -1.0,
  barPerU: 0.62,
  barBefore: [-0.75, -0.15] as const,
  barAfter: [0.15, 0.75] as const,

  /** 확대창 — 월드 사각형 · 창 안 두 막대의 가로 구간 · 반응 전 막대 위의 여유(월드). */
  zoomMin: [2.0, -0.6] as const,
  zoomMax: [5.6, 2.0] as const,
  zoomBefore: [2.2, 3.5] as const,
  zoomAfter: [3.8, 5.1] as const,
  zoomHeadroom: 0.42,
  /** 결손 치수선의 가로 자리(월드) — 반응 뒤 막대 오른쪽. */
  defectX: 5.35,
} as const;

/**
 * 고정 경계. 반응 · 막대 · 확대창 · 이름표가 들어가게 처음부터 잡는다 (원칙 6). 아래로 캡션
 * 두 줄 자리를 더 잡는다 — 캡션 슬롯은 프레이밍 여백으로 잡히지 않는다 (장부 G24).
 */
export const SCENE_BOUNDS = { minX: -6.7, maxX: 7.5, minY: -2.1, maxY: 2.8 } as const;

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const nuclearFusionSchema: BundleSchema = {
  id: NUCLEAR_FUSION_ID,
  label: text('label.title'),
  category: 'modern',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 질량은 자연이 정한 값이라 끌어 바꾸면 거짓 반응이 된다.
  parameters: [],
  stages: [
    {
      id: 'd-t',
      label: text('label.stage'),
      constants: { ...DEFAULTS },
    },
  ],
  environments: [],
  views: [{ id: 'mass-defect', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 반응 · 온 막대 · 확대창이 나란하다. 세로는 온 막대 높이와 캡션 두 줄. */
  canvas: { height: 340, minHeight: 320 },

  /** 쓴 순서대로 겹친다 — 막대 면 위에 경계 · 글자, 핵자 위에 이름표. */
  drawOrder: 'scene',

  /** 도착한 순간 두 핵이 이미 다가가는 중이다 (S-piece). */
  startAt: 0.3,

  /**
   * 한 주기 — 9.3 초.
   *
   * - `approach` — ²H 와 ³H 가 양쪽에서 다가간다. 가운데 「반응 전」 막대가 두 질량을 쌓아 서 있다.
   * - `close` — 두 핵이 맞닿고 이름표 · 질량 글자가 물러난다. 다가가는 움직임은 `approach` 와 이어진 한 번의 이징이다.
   * - `fuse` — 두 핵이 한 덩이로 합쳐진다. 「반응 뒤」 막대가 **같은 높이**로 나타나고, 확대창에서 그 위 끝
   *   (반응 전과의 차이)이 강조색이다.
   * - `fly` — ⁴He 와 n 이 반대로 튀어 나가고 강조색 에너지 화살표가 자란다. 같은 동안 확대창의 강조색 위 끝이
   *   **줄어들어 사라진다** — 질량이 에너지로 바뀐다.
   * - `reveal` — 비어 버린 자리에 결손 치수선 · 「Δm」 · 「→ 에너지 17.6 MeV」 가 뜬다.
   * - `hold` — 두 입자는 계속 날아가고 그림이 머문다.
   * - `clear` — 반응 뒤의 것이 물러난다.
   * - `renew` — 다음 주기의 ²H · ³H 가 제자리에 선다.
   */
  timeline: {
    phases: [
      { id: 'approach', duration: 1.7, caption: key('caption.meet') },
      { id: 'close', duration: 0.3, caption: key('caption.meet') },
      { id: 'fuse', duration: 0.5, ease: 'smooth', caption: key('caption.meet') },
      { id: 'fly', duration: 2.0, ease: 'smooth', caption: key('caption.convert') },
      { id: 'reveal', duration: 0.6, ease: 'smooth', caption: key('caption.defect') },
      { id: 'hold', duration: 3.0, caption: key('caption.defect') },
      { id: 'clear', duration: 0.6, caption: key('caption.defect') },
      { id: 'renew', duration: 0.6, caption: key('caption.renew') },
    ],
  },

  /** 슬롯 하나. 값이 끼지 않는 문장뿐이다 — 수는 그림 속 이름표가 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [4, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 읽을 것은 막대 위 끝의 차이다 (S-piece).

  messages: nuclearFusionMessages,
};
