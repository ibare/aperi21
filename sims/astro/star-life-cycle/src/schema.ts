// ========================================================================
// star-life-cycle — 선언
// ========================================================================
// 질문: 별은 어떻게 끝나고, 무엇이 그 끝을 가르는가.
//
// 질량만 다른 두 별(태양 정도 · 태양의 20 배)이 같은 때 주계열에서 시작한다.
// 무거운 별은 1000만 년 만에 붉은 초거성으로 부풀어 초신성으로 끝나고(중성자별 ·
// 블랙홀), 그동안 가벼운 별은 제자리다. 가벼운 별은 100억 년을 주계열에서 보낸 뒤
// 붉은 거성 → 행성상 성운 → 백색 왜성으로 식어 간다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:star-life-cycle` 와 문자 그대로 일치한다 (C4). */
export const STAR_LIFE_CYCLE_ID = 'star-life-cycle';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값 (원칙 2). 코드는 `readConstants` 로 읽는다.
// ------------------------------------------------------------------------

/** 두 별의 질량(태양 질량). 화면의 `{m} M☉` 이름표에 그대로 들어간다. */
export const MASS_LIGHT = 1;
export const MASS_HEAVY = 20;
/** 무거운 별의 주계열 수명 · 초신성까지의 일생(년). */
export const MS_HEAVY = 9e6;
export const END_HEAVY = 1e7;
/** 가벼운 별의 주계열 수명 · 붉은 거성 끝(껍질을 벗는 때)까지의 일생(년). */
export const MS_LIGHT = 1e10;
export const TIP_LIGHT = 1.2e10;
/** 시간 자의 오른쪽 끝(년) — 백색 왜성이 식는 동안 시계가 여기까지 간다. */
export const AGE_END = 1.4e10;
/** 태양의 유효 온도(K). 별 반지름을 태양 기준으로 잴 때(L = 4πR²σT⁴) 기준점이다. */
export const SUN_TEMPERATURE_K = 5772;
/** 행성상 성운 고리의 빛 — 이온화된 산소의 초록빛 선(nm). */
export const NEBULA_NM = 501;

// ------------------------------------------------------------------------
// 배치 — 월드 = 화면 px 설계값(860 × 480), y 만 뒤집는다(`at`).
// ------------------------------------------------------------------------

export const CANVAS_W = 860;
export const CANVAS_H = 480;

/** HR 도 그림 영역(설계 px). */
export const PLOT = { left: 96, right: 840, top: 12, bottom: 296 } as const;
/** 가로축 = log10 표면 온도(K), 왼쪽이 뜨겁다. */
export const T_AXIS = { left: 5.25, right: 3.4 } as const;
/** 세로축 = log10 광도(태양 = 0). */
export const L_AXIS = { top: 6.3, bottom: -3.8 } as const;

/** 시간 자(설계 px). 두 줄 — 무거운 별 · 가벼운 별 — 과 눈금 줄. */
export const RULER = {
  left: 96,
  right: 840,
  rowHeavy: 358,
  rowLight: 382,
  base: 400,
} as const;

/** 프레이밍 — 설계 캔버스 전체(아래 캡션 줄 포함). 매 프레임 같은 값 (S-piece). */
export const SCENE_BOUNDS = { minX: 0, maxX: CANVAS_W, minY: -CANVAS_H, maxY: 0 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const starLifeCycleMessages = Object.freeze({
  'label.title': {
    ko: '별의 일생',
    en: 'Life cycle of a star',
    ja: '恒星の一生',
    zh: '恒星的一生',
    ar: 'دورة حياة النجم',
    es: 'Ciclo de vida de una estrella',
    fr: 'Cycle de vie d’une étoile',
    hi: 'तारे का जीवन चक्र',
    id: 'Siklus hidup bintang',
    pt: 'Ciclo de vida de uma estrela',
  },
  'label.operation': {
    ko: '질량이 가르는 별의 경로',
    en: 'How mass decides a star’s path',
    ja: '質量が決める恒星の道筋',
    zh: '质量如何决定恒星的演化路径',
    ar: 'كيف تحدد الكتلة مسار النجم',
    es: 'Cómo la masa decide el camino de una estrella',
    fr: 'Comment la masse décide du parcours d’une étoile',
    hi: 'द्रव्यमान तारे का मार्ग कैसे तय करता है',
    id: 'Bagaimana massa menentukan jalan hidup bintang',
    pt: 'Como a massa decide o caminho de uma estrela',
  },
  'label.stage': {
    ko: '두 별',
    en: 'Two stars',
    ja: '二つの恒星',
    zh: '两颗恒星',
    ar: 'نجمان',
    es: 'Dos estrellas',
    fr: 'Deux étoiles',
    hi: 'दो तारे',
    id: 'Dua bintang',
    pt: 'Duas estrelas',
  },
  'label.view': {
    ko: 'HR 도',
    en: 'HR diagram',
    ja: 'HR図',
    zh: '赫罗图',
    ar: 'مخطط HR',
    es: 'Diagrama HR',
    fr: 'Diagramme HR',
    hi: 'HR आरेख',
    id: 'Diagram HR',
    pt: 'Diagrama HR',
  },

  /** 온도 눈금. 수와 단위는 표식이라 두 언어가 같다 (C1 판정 3). */
  'tick.t100000': {
    ko: '100000K',
    en: '100000K',
    ja: '100000K',
    zh: '100000K',
    ar: '100000K',
    es: '100000K',
    fr: '100000K',
    hi: '100000K',
    id: '100000K',
    pt: '100000K',
  },
  'tick.t30000': {
    ko: '30000K',
    en: '30000K',
    ja: '30000K',
    zh: '30000K',
    ar: '30000K',
    es: '30000K',
    fr: '30000K',
    hi: '30000K',
    id: '30000K',
    pt: '30000K',
  },
  'tick.t10000': {
    ko: '10000K',
    en: '10000K',
    ja: '10000K',
    zh: '10000K',
    ar: '10000K',
    es: '10000K',
    fr: '10000K',
    hi: '10000K',
    id: '10000K',
    pt: '10000K',
  },
  'tick.t3000': {
    ko: '3000K',
    en: '3000K',
    ja: '3000K',
    zh: '3000K',
    ar: '3000K',
    es: '3000K',
    fr: '3000K',
    hi: '3000K',
    id: '3000K',
    pt: '3000K',
  },
  /**
   * 광도 눈금(태양 = 1). 로그 축이라 10 의 거듭제곱을 문안으로 둔다 — 코드에서 조립하지 않는다.
   * 음의 지수는 위 첨자 빼기(⁻)가 글꼴에서 떨어져 나와 분수로 쓴다.
   */
  'tick.l6': {
    ko: '10⁶',
    en: '10⁶',
    ja: '10⁶',
    zh: '10⁶',
    ar: '10⁶',
    es: '10⁶',
    fr: '10⁶',
    hi: '10⁶',
    id: '10⁶',
    pt: '10⁶',
  },
  'tick.l4': {
    ko: '10⁴',
    en: '10⁴',
    ja: '10⁴',
    zh: '10⁴',
    ar: '10⁴',
    es: '10⁴',
    fr: '10⁴',
    hi: '10⁴',
    id: '10⁴',
    pt: '10⁴',
  },
  'tick.l2': {
    ko: '10²',
    en: '10²',
    ja: '10²',
    zh: '10²',
    ar: '10²',
    es: '10²',
    fr: '10²',
    hi: '10²',
    id: '10²',
    pt: '10²',
  },
  'tick.l0': {
    ko: '1',
    en: '1',
    ja: '1',
    zh: '1',
    ar: '1',
    es: '1',
    fr: '1',
    hi: '1',
    id: '1',
    pt: '1',
  },
  'tick.l-2': {
    ko: '1/100',
    en: '1/100',
    ja: '1/100',
    zh: '1/100',
    ar: '1/100',
    es: '1/100',
    fr: '1/100',
    hi: '1/100',
    id: '1/100',
    pt: '1/100',
  },
  'axis.temperature': {
    ko: '표면 온도 — 왼쪽이 뜨겁다',
    en: 'Surface temperature — hotter to the left',
    ja: '表面温度 — 左ほど高温',
    zh: '表面温度 — 越往左越热',
    ar: 'درجة حرارة السطح — أسخن نحو اليسار',
    es: 'Temperatura superficial — más caliente a la izquierda',
    fr: 'Température de surface — plus chaude à gauche',
    hi: 'सतह का तापमान — बाईं ओर अधिक गर्म',
    id: 'Suhu permukaan — makin ke kiri makin panas',
    pt: 'Temperatura da superfície — mais quente à esquerda',
  },
  'axis.luminosity': {
    ko: '광도',
    en: 'Luminosity',
    ja: '光度',
    zh: '光度',
    ar: 'الضياء',
    es: 'Luminosidad',
    fr: 'Luminosité',
    hi: 'दीप्ति',
    id: 'Luminositas',
    pt: 'Luminosidade',
  },
  'axis.luminosityUnit': {
    ko: '(태양 = 1)',
    en: '(Sun = 1)',
    ja: '(太陽 = 1)',
    zh: '(太阳 = 1)',
    ar: '(الشمس = 1)',
    es: '(Sol = 1)',
    fr: '(Soleil = 1)',
    hi: '(सूर्य = 1)',
    id: '(Matahari = 1)',
    pt: '(Sol = 1)',
  },

  /** 질량 이름표. `M☉` 는 기호라 두 언어가 같다 — 값은 스테이지 상수 그대로 (S-piece 유효숫자). */
  'label.mass': {
    ko: '{m} M☉',
    en: '{m} M☉',
    ja: '{m} M☉',
    zh: '{m} M☉',
    ar: '{m} M☉',
    es: '{m} M☉',
    fr: '{m} M☉',
    hi: '{m} M☉',
    id: '{m} M☉',
    pt: '{m} M☉',
  },

  /** 지나는 자리의 이름. 별이 거기 닿을 때 나타난다. */
  'label.mainSequence': {
    ko: '주계열',
    en: 'Main sequence',
    ja: '主系列',
    zh: '主序',
    ar: 'النسق الأساسي',
    es: 'Secuencia principal',
    fr: 'Séquence principale',
    hi: 'मुख्य अनुक्रम',
    id: 'Deret utama',
    pt: 'Sequência principal',
  },
  'label.supergiant': {
    ko: '붉은 초거성',
    en: 'Red supergiant',
    ja: '赤色超巨星',
    zh: '红超巨星',
    ar: 'عملاق أحمر فائق',
    es: 'Supergigante roja',
    fr: 'Supergéante rouge',
    hi: 'लाल महादानव',
    id: 'Maharaksasa merah',
    pt: 'Supergigante vermelha',
  },
  'label.heavyEnd': {
    ko: '초신성 → 중성자별 · 블랙홀',
    en: 'Supernova → neutron star · black hole',
    ja: '超新星 → 中性子星・ブラックホール',
    zh: '超新星 → 中子星 · 黑洞',
    ar: 'مستعر أعظم ← نجم نيوتروني · ثقب أسود',
    es: 'Supernova → estrella de neutrones · agujero negro',
    fr: 'Supernova → étoile à neutrons · trou noir',
    hi: 'सुपरनोवा → न्यूट्रॉन तारा · कृष्ण विवर',
    id: 'Supernova → bintang neutron · lubang hitam',
    pt: 'Supernova → estrela de nêutrons · buraco negro',
  },
  'label.giant': {
    ko: '붉은 거성',
    en: 'Red giant',
    ja: '赤色巨星',
    zh: '红巨星',
    ar: 'عملاق أحمر',
    es: 'Gigante roja',
    fr: 'Géante rouge',
    hi: 'लाल दानव',
    id: 'Raksasa merah',
    pt: 'Gigante vermelha',
  },
  'label.nebula': {
    ko: '행성상 성운',
    en: 'Planetary nebula',
    ja: '惑星状星雲',
    zh: '行星状星云',
    ar: 'سديم كوكبي',
    es: 'Nebulosa planetaria',
    fr: 'Nébuleuse planétaire',
    hi: 'ग्रहीय नीहारिका',
    id: 'Nebula planeter',
    pt: 'Nebulosa planetária',
  },
  'label.whiteDwarf': {
    ko: '백색 왜성',
    en: 'White dwarf',
    ja: '白色矮星',
    zh: '白矮星',
    ar: 'قزم أبيض',
    es: 'Enana blanca',
    fr: 'Naine blanche',
    hi: 'श्वेत वामन',
    id: 'Katai putih',
    pt: 'Anã branca',
  },

  /** 시간 자. 큰 수는 단위가 언어마다 달라(만 · 억 / million · billion) 보일 문자열 그대로 둔다. */
  'axis.age': {
    ko: '나이',
    en: 'Age',
    ja: '年齢',
    zh: '年龄',
    ar: 'العمر',
    es: 'Edad',
    fr: 'Âge',
    hi: 'आयु',
    id: 'Usia',
    pt: 'Idade',
  },
  'tick.age0': {
    ko: '0',
    en: '0',
    ja: '0',
    zh: '0',
    ar: '0',
    es: '0',
    fr: '0',
    hi: '0',
    id: '0',
    pt: '0',
  },
  'tick.age5e9': {
    ko: '50억 년',
    en: '5 billion yr',
    ja: '50億年',
    zh: '50亿年',
    ar: '5 مليارات سنة',
    es: '5 mil millones de años',
    fr: '5 milliards d’années',
    hi: '5 अरब वर्ष',
    id: '5 miliar tahun',
    pt: '5 bilhões de anos',
  },
  'tick.age1e10': {
    ko: '100억 년',
    en: '10 billion yr',
    ja: '100億年',
    zh: '100亿年',
    ar: '10 مليارات سنة',
    es: '10 mil millones de años',
    fr: '10 milliards d’années',
    hi: '10 अरब वर्ष',
    id: '10 miliar tahun',
    pt: '10 bilhões de anos',
  },
  /** 두 별의 일생 끝 — 스테이지 상수 `endHeavy` · `tipLight` 의 기본값과 같은 값이다 (NOTES). */
  'label.lifeHeavy': {
    ko: '1000만 년',
    en: '10 million yr',
    ja: '1000万年',
    zh: '1000万年',
    ar: '10 ملايين سنة',
    es: '10 millones de años',
    fr: '10 millions d’années',
    hi: '1 करोड़ वर्ष',
    id: '10 juta tahun',
    pt: '10 milhões de anos',
  },
  'label.lifeLight': {
    ko: '120억 년',
    en: '12 billion yr',
    ja: '120億年',
    zh: '120亿年',
    ar: '12 مليار سنة',
    es: '12 mil millones de años',
    fr: '12 milliards d’années',
    hi: '12 अरब वर्ष',
    id: '12 miliar tahun',
    pt: '12 bilhões de anos',
  },

  'caption.bothMs': {
    ko: '두 별이 주계열에서 중심의 수소를 태운다 — 무거운 별이 훨씬 밝고 뜨겁다',
    en: 'Both stars burn hydrogen in their cores on the main sequence — the heavy one is far brighter and hotter',
    ja: '二つの恒星が主系列で中心核の水素を燃やす — 重い星のほうがはるかに明るく高温だ',
    zh: '两颗恒星都在主序阶段燃烧核心的氢 — 重的那颗亮得多、热得多',
    ar: 'يحرق النجمان الهيدروجين في لبّيهما على النسق الأساسي — النجم الثقيل أشد سطوعًا وحرارة بكثير',
    es: 'Ambas estrellas queman hidrógeno en su núcleo en la secuencia principal — la pesada es mucho más brillante y caliente',
    fr: 'Les deux étoiles brûlent l’hydrogène de leur cœur sur la séquence principale — la lourde est bien plus lumineuse et plus chaude',
    hi: 'दोनों तारे मुख्य अनुक्रम पर अपने क्रोड में हाइड्रोजन जलाते हैं — भारी तारा कहीं अधिक चमकीला और गर्म है',
    id: 'Kedua bintang membakar hidrogen di intinya pada deret utama — yang berat jauh lebih terang dan panas',
    pt: 'As duas estrelas queimam hidrogênio no núcleo na sequência principal — a pesada é muito mais brilhante e quente',
  },
  'caption.heavyOff': {
    ko: '무거운 별은 벌써 수소를 다 쓰고 부풀어 붉은 초거성이 된다',
    en: 'The heavy star has already used up its hydrogen and swells into a red supergiant',
    ja: '重い星はもう水素を使い果たし、膨らんで赤色超巨星になる',
    zh: '重的恒星已经耗尽了氢，膨胀成红超巨星',
    ar: 'النجم الثقيل استنفد الهيدروجين بالفعل وينتفخ ليصبح عملاقًا أحمر فائقًا',
    es: 'La estrella pesada ya agotó su hidrógeno y se hincha hasta ser una supergigante roja',
    fr: 'L’étoile lourde a déjà épuisé son hydrogène et gonfle en supergéante rouge',
    hi: 'भारी तारा अपनी हाइड्रोजन पहले ही खत्म कर चुका है और फूलकर लाल महादानव बन जाता है',
    id: 'Bintang berat sudah menghabiskan hidrogennya dan mengembang menjadi maharaksasa merah',
    pt: 'A estrela pesada já esgotou seu hidrogênio e incha até virar uma supergigante vermelha',
  },
  'caption.heavyEnd': {
    ko: '무거운 별은 초신성으로 끝나 중성자별이나 블랙홀을 남긴다 — 가벼운 별은 아직 처음 자리에 있다',
    en: 'The heavy star ends as a supernova, leaving a neutron star or black hole — the light star has not moved yet',
    ja: '重い星は超新星となって終わり、中性子星かブラックホールを残す — 軽い星はまだ動いていない',
    zh: '重的恒星以超新星告终，留下中子星或黑洞 — 轻的恒星还没有移动',
    ar: 'ينتهي النجم الثقيل مستعرًا أعظم، مخلّفًا نجمًا نيوترونيًا أو ثقبًا أسود — والنجم الخفيف لم يتحرك بعد',
    es: 'La estrella pesada termina como supernova y deja una estrella de neutrones o un agujero negro — la ligera aún no se ha movido',
    fr: 'L’étoile lourde finit en supernova et laisse une étoile à neutrons ou un trou noir — la légère n’a pas encore bougé',
    hi: 'भारी तारा सुपरनोवा बनकर समाप्त होता है और न्यूट्रॉन तारा या कृष्ण विवर छोड़ जाता है — हल्का तारा अभी हिला भी नहीं है',
    id: 'Bintang berat berakhir sebagai supernova, meninggalkan bintang neutron atau lubang hitam — bintang ringan belum bergerak',
    pt: 'A estrela pesada termina como supernova, deixando uma estrela de nêutrons ou um buraco negro — a leve ainda não se moveu',
  },
  'caption.lightMs': {
    ko: '가벼운 별은 그 뒤로도 훨씬 오래 주계열에 머물며 천천히 수소를 태운다',
    en: 'The light star stays on the main sequence far longer, slowly burning its hydrogen',
    ja: '軽い星はその後もはるかに長く主系列にとどまり、ゆっくりと水素を燃やす',
    zh: '轻的恒星在主序上停留得久得多，缓慢地燃烧氢',
    ar: 'يبقى النجم الخفيف على النسق الأساسي مدة أطول بكثير، يحرق الهيدروجين ببطء',
    es: 'La estrella ligera permanece mucho más tiempo en la secuencia principal, quemando su hidrógeno despacio',
    fr: 'L’étoile légère reste bien plus longtemps sur la séquence principale, brûlant lentement son hydrogène',
    hi: 'हल्का तारा कहीं अधिक समय तक मुख्य अनुक्रम पर रहता है और धीरे-धीरे अपनी हाइड्रोजन जलाता है',
    id: 'Bintang ringan bertahan jauh lebih lama di deret utama, membakar hidrogennya perlahan',
    pt: 'A estrela leve fica muito mais tempo na sequência principal, queimando seu hidrogênio devagar',
  },
  'caption.lightGiant': {
    ko: '가벼운 별도 마침내 수소가 떨어져 부풀어 붉은 거성이 된다',
    en: 'At last the light star runs out of hydrogen too and swells into a red giant',
    ja: 'ついに軽い星も水素が尽き、膨らんで赤色巨星になる',
    zh: '最终轻的恒星也耗尽了氢，膨胀成红巨星',
    ar: 'وأخيرًا ينفد الهيدروجين من النجم الخفيف أيضًا فينتفخ ليصبح عملاقًا أحمر',
    es: 'Por fin la estrella ligera también agota su hidrógeno y se hincha hasta ser una gigante roja',
    fr: 'Enfin, l’étoile légère épuise à son tour son hydrogène et gonfle en géante rouge',
    hi: 'आखिरकार हल्के तारे की हाइड्रोजन भी खत्म हो जाती है और वह फूलकर लाल दानव बन जाता है',
    id: 'Akhirnya bintang ringan pun kehabisan hidrogen dan mengembang menjadi raksasa merah',
    pt: 'Por fim a estrela leve também esgota seu hidrogênio e incha até virar uma gigante vermelha',
  },
  'caption.lightShed': {
    ko: '바깥 껍질을 벗어 행성상 성운으로 흩뜨리고, 뜨거운 중심이 드러난다',
    en: 'It sheds its outer layers as a planetary nebula, exposing the hot core',
    ja: '外層を脱ぎ捨てて惑星状星雲として広げ、高温の中心核があらわになる',
    zh: '它抛出外层，形成行星状星云，露出炽热的核心',
    ar: 'يطرح طبقاته الخارجية سديمًا كوكبيًا، فينكشف اللب الحار',
    es: 'Expulsa sus capas externas como una nebulosa planetaria y deja al descubierto el núcleo caliente',
    fr: 'Elle expulse ses couches externes en nébuleuse planétaire, mettant à nu le cœur chaud',
    hi: 'वह अपनी बाहरी परतें ग्रहीय नीहारिका के रूप में छोड़ देता है और गर्म क्रोड उजागर हो जाता है',
    id: 'Bintang itu melepas lapisan luarnya sebagai nebula planeter, menyingkap inti yang panas',
    pt: 'Ela expele suas camadas externas como uma nebulosa planetária, expondo o núcleo quente',
  },
  'caption.lightCool': {
    ko: '남은 중심은 백색 왜성 — 더 타지 않고 식어 가며 어두워진다',
    en: 'The leftover core is a white dwarf — it no longer burns, and it cools and fades',
    ja: '残った中心核は白色矮星 — もう燃えず、冷えながら暗くなっていく',
    zh: '剩下的核心是白矮星 — 不再燃烧，逐渐冷却变暗',
    ar: 'اللب المتبقي قزم أبيض — لم يعد يحترق، ويبرد ويخفت',
    es: 'El núcleo que queda es una enana blanca — ya no quema nada; se enfría y se apaga',
    fr: 'Le cœur restant est une naine blanche — il ne brûle plus, il refroidit et s’éteint',
    hi: 'बचा हुआ क्रोड श्वेत वामन है — वह अब नहीं जलता, ठंडा होता जाता है और मंद पड़ता है',
    id: 'Inti yang tersisa adalah katai putih — tak lagi membakar, perlahan mendingin dan meredup',
    pt: 'O núcleo que resta é uma anã branca — não queima mais; esfria e se apaga',
  },
} satisfies Record<string, LocalizedText>);

export type StarLifeCycleMessageKey = keyof typeof starLifeCycleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StarLifeCycleMessageKey): LocalizedText => starLifeCycleMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StarLifeCycleMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const starLifeCycleSchema: BundleSchema = {
  id: STAR_LIFE_CYCLE_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 시계가 저절로 흐르고 두 별이 차례로 끝난다.
  parameters: [],

  stages: [
    {
      id: 'two-stars',
      label: text('label.stage'),
      constants: {
        massLight: MASS_LIGHT,
        massHeavy: MASS_HEAVY,
        msHeavy: MS_HEAVY,
        endHeavy: END_HEAVY,
        msLight: MS_LIGHT,
        tipLight: TIP_LIGHT,
        ageEnd: AGE_END,
        sunTemperatureK: SUN_TEMPERATURE_K,
        nebulaNm: NEBULA_NM,
      },
    },
  ],
  environments: [],
  views: [{ id: 'hr', label: text('label.view'), default: true }],

  /** 위 HR 도 + 아래 시간 자 두 줄 + 캡션 한 줄. */
  canvas: { height: 480, minHeight: 420 },

  /** 겹침 순서가 판정 장치다 — 밤하늘 위에 띠 · 지나온 길 · 별 · 이름표 순으로 쌓는다. */
  drawOrder: 'scene',

  /**
   * 한 주기 26 초. 무거운 별이 먼저 일생을 마치고(both-ms → heavy-end), 그 뒤 가벼운 별이
   * 같은 길을 훨씬 오래 걸어 다른 끝에 닿는다(light-ms → light-cool). 단계마다 시간 자의 시계가
   * 스테이지 상수의 나이 구간을 지난다 — 무거운 별의 단계들은 시계가 거의 움직이지 않는다.
   */
  timeline: {
    phases: [
      { id: 'both-ms', duration: 3, caption: key('caption.bothMs') },
      { id: 'heavy-cross', duration: 2.2, ease: 'smooth', caption: key('caption.heavyOff') },
      { id: 'heavy-rsg', duration: 1.8, caption: key('caption.heavyOff') },
      { id: 'heavy-collapse', duration: 0.6, caption: key('caption.heavyEnd') },
      { id: 'heavy-end', duration: 2.6, caption: key('caption.heavyEnd') },
      { id: 'light-ms', duration: 3.5, caption: key('caption.lightMs') },
      { id: 'light-giant', duration: 3.8, ease: 'smooth', caption: key('caption.lightGiant') },
      { id: 'light-shed', duration: 2.6, ease: 'smooth', caption: key('caption.lightShed') },
      { id: 'light-cool', duration: 3.4, ease: 'smooth', caption: key('caption.lightCool') },
      { id: 'hold', duration: 2.5, caption: key('caption.lightCool') },
    ],
  },

  /** 도착하면 두 별이 이미 주계열에서 타는 중이고, 무거운 별이 띠를 따라 조금 올라와 있다. */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    fade: 0.25,
    style: { colorRole: 'ink', emphasis: 'medium' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 축과 눈금은 scene 이 선언한다.

  messages: starLifeCycleMessages,
};
