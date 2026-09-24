// ========================================================================
// keplers-third-law — 선언
// ========================================================================
// 질문: 태양에서 멀리 도는 행성은 한 바퀴에 얼마나 더 걸리는가.
//
// 반지름이 다른 두 행성이 출발선에서 함께 떠난다. 바깥 행성은 둘레가 길 뿐 아니라
// 더 느리게 간다 — 그래서 주기가 반지름보다 훨씬 빨리 길어진다. 반지름을 4배로 하면
// 주기는 8배, 안쪽 행성이 여덟 바퀴 도는 동안 바깥 행성이 한 바퀴를 돈다 (T² ∝ a³).
//
// 궤도 모양(타원 · 초점)은 `keplers-first-law`, 한 궤도 안의 빠르기 변화는
// `keplers-second-law`, 중력이 방향을 꺾는 까닭은 `circular-orbit` 의 몫이다.
// 이 조각은 **여러 궤도를 한 번에 견주는 법칙** 에 머문다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:keplers-third-law` 와 문자 그대로 일치한다 (C4). */
export const KEPLERS_THIRD_LAW_ID = 'keplers-third-law';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 바깥 궤도 반지름 ÷ 안쪽 궤도 반지름. 화면 이름표 `{r}a` 에 그대로 뜬다. */
export const RADIUS_RATIO = 4;
/**
 * 바깥 주기 ÷ 안쪽 주기. 화면 이름표 `{p}T` 에 그대로 뜨고, 안쪽 행성이 바깥 한 바퀴 동안
 * 도는 바퀴 수이기도 하다. `RADIUS_RATIO ^ 1.5` 여야 법칙이 서지만 두 상수 사이의 관계를
 * 선언할 자리가 없다 — 저작자가 한쪽만 고치면 화면이 법칙과 어긋난다 (NOTES (c)).
 */
export const PERIOD_RATIO = 8;
/** 바깥 궤도 반지름(월드 단위). 프레이밍이 이 값에 맞춰 고정돼 있다. */
export const OUTER_RADIUS = 2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 태양이 원점이다.
// ------------------------------------------------------------------------

/** 시간 띠의 왼쪽 끝(월드 x). 궤도 오른쪽이다. */
export const STRIP_X = 3.1;
/** 시간 띠의 길이(월드). 바깥 행성의 주기 하나가 이 길이다. */
export const STRIP_LENGTH = 5;
/** 캡션이 서는 자리(월드). 시간 띠 아래, 띠와 같은 왼쪽 끝. */
export const CAPTION_AT = [STRIP_X, -0.55] as const;

/**
 * 프레이밍은 주장의 일부다. 가로는 바깥 궤도 왼쪽 끝부터 시간 띠 오른쪽 끝까지, 세로는
 * 바깥 궤도 위아래. 매 프레임 같은 값이다 — 반지름 비를 바꿔도 바깥 궤도는 그대로다.
 */
export const SCENE_BOUNDS = { minX: -2.35, maxX: 8.35, minY: -2.3, maxY: 2.3 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const keplersThirdLawMessages = Object.freeze({
  'label.title': {
    ko: '케플러 제3법칙',
    en: "Kepler's third law",
    ja: 'ケプラーの第3法則',
    zh: '开普勒第三定律',
    ar: 'قانون كبلر الثالث',
    es: 'Tercera ley de Kepler',
    fr: 'Troisième loi de Kepler',
    hi: 'केप्लर का तीसरा नियम',
    id: 'Hukum Ketiga Kepler',
    pt: 'Terceira lei de Kepler',
  },
  'label.operation': {
    ko: '주기와 긴반지름의 관계',
    en: 'How the period depends on the semi-major axis',
    ja: '周期は長半径によってどう決まるか',
    zh: '周期如何取决于半长轴',
    ar: 'كيف يعتمد الدور المداري على نصف المحور الأكبر',
    es: 'Cómo depende el período del semieje mayor',
    fr: 'Comment la période dépend du demi-grand axe',
    hi: 'आवर्तकाल अर्ध-दीर्घ अक्ष पर कैसे निर्भर करता है',
    id: 'Bagaimana periode bergantung pada sumbu semi-mayor',
    pt: 'Como o período depende do semieixo maior',
  },
  'label.stage': {
    ko: '반지름이 다른 두 궤도',
    en: 'Two orbits of different radius',
    ja: '半径の異なる2つの軌道',
    zh: '半径不同的两条轨道',
    ar: 'مداران مختلفان في نصف القطر',
    es: 'Dos órbitas de distinto radio',
    fr: 'Deux orbites de rayons différents',
    hi: 'अलग-अलग त्रिज्या वाली दो कक्षाएँ',
    id: 'Dua orbit dengan jari-jari berbeda',
    pt: 'Duas órbitas de raios diferentes',
  },
  'label.view': {
    ko: '두 행성',
    en: 'Two planets',
    ja: '2つの惑星',
    zh: '两颗行星',
    ar: 'كوكبان',
    es: 'Dos planetas',
    fr: 'Deux planètes',
    hi: 'दो ग्रह',
    id: 'Dua planet',
    pt: 'Dois planetas',
  },
  /** 시간 띠 이름. */
  'label.strip': {
    ko: '한 바퀴에 걸린 시간',
    en: 'Time for one lap',
    ja: '1周にかかる時間',
    zh: '绕一圈所用的时间',
    ar: 'زمن الدورة الواحدة',
    es: 'Tiempo de una vuelta',
    fr: 'Temps d’un tour',
    hi: 'एक चक्कर का समय',
    id: 'Waktu untuk satu putaran',
    pt: 'Tempo de uma volta',
  },
  'label.inner': {
    ko: '안쪽',
    en: 'inner',
    ja: '内側',
    zh: '内侧',
    ar: 'الداخلي',
    es: 'interior',
    fr: 'intérieure',
    hi: 'भीतरी',
    id: 'dalam',
    pt: 'interno',
  },
  'label.outer': {
    ko: '바깥',
    en: 'outer',
    ja: '外側',
    zh: '外侧',
    ar: 'الخارجي',
    es: 'exterior',
    fr: 'extérieure',
    hi: 'बाहरी',
    id: 'luar',
    pt: 'externo',
  },
  'label.ghost': {
    ko: '안쪽과 같은 빠르기라면',
    en: "at the inner planet's speed",
    ja: '内側の惑星と同じ速さなら',
    zh: '若以内侧行星的速度',
    ar: 'بسرعة الكوكب الداخلي',
    es: 'a la velocidad del planeta interior',
    fr: 'à la vitesse de la planète intérieure',
    hi: 'भीतरी ग्रह की चाल से',
    id: 'dengan kelajuan planet dalam',
    pt: 'na velocidade do planeta interno',
  },
  /** 반지름 · 주기 기호. 표식이지만 값을 끼우므로 문안 틀로 둔다 (C1). */
  'sym.a': {
    ko: 'a',
    en: 'a',
    ja: 'a',
    zh: 'a',
    ar: 'a',
    es: 'a',
    fr: 'a',
    hi: 'a',
    id: 'a',
    pt: 'a',
  },
  'sym.ra': {
    ko: '{r}a',
    en: '{r}a',
    ja: '{r}a',
    zh: '{r}a',
    ar: '{r}a',
    es: '{r}a',
    fr: '{r}a',
    hi: '{r}a',
    id: '{r}a',
    pt: '{r}a',
  },
  'sym.T': {
    ko: 'T',
    en: 'T',
    ja: 'T',
    zh: 'T',
    ar: 'T',
    es: 'T',
    fr: 'T',
    hi: 'T',
    id: 'T',
    pt: 'T',
  },
  'sym.pT': {
    ko: '{p}T',
    en: '{p}T',
    ja: '{p}T',
    zh: '{p}T',
    ar: '{p}T',
    es: '{p}T',
    fr: '{p}T',
    hi: '{p}T',
    id: '{p}T',
    pt: '{p}T',
  },
  /** 안쪽 행성이 마친 바퀴의 번호. */
  'sym.lap': {
    ko: '{n}',
    en: '{n}',
    ja: '{n}',
    zh: '{n}',
    ar: '{n}',
    es: '{n}',
    fr: '{n}',
    hi: '{n}',
    id: '{n}',
    pt: '{n}',
  },
  'caption.depart': {
    ko: '두 행성이 출발선에서 함께 떠난다 — 안쪽 행성은 금세 한 바퀴를 돌아 온다',
    en: 'The two planets leave the start line together — the inner one is soon back around',
    ja: '2つの惑星がスタートラインから一緒に出発する — 内側の惑星はすぐに1周して戻ってくる',
    zh: '两颗行星一起从起跑线出发 — 内侧行星很快就绕回来了',
    ar: 'ينطلق الكوكبان معًا من خط البداية — وسرعان ما يعود الداخلي بعد دورة كاملة',
    es: 'Los dos planetas salen juntos de la línea de salida — el interior pronto está de vuelta',
    fr: 'Les deux planètes quittent ensemble la ligne de départ — l’intérieure est vite revenue',
    hi: 'दोनों ग्रह प्रारंभ रेखा से एक साथ निकलते हैं — भीतरी ग्रह जल्दी ही चक्कर लगाकर लौट आता है',
    id: 'Kedua planet berangkat bersama dari garis start — planet dalam segera kembali setelah satu putaran',
    pt: 'Os dois planetas deixam a linha de partida juntos — o interno logo está de volta',
  },
  'caption.race': {
    ko: '안쪽 행성이 바퀴를 거듭하는 동안 바깥 행성은 조금씩 나아갈 뿐이다',
    en: 'While the inner planet laps again and again, the outer one only inches ahead',
    ja: '内側の惑星が何周も重ねる間、外側の惑星は少しずつ進むだけだ',
    zh: '内侧行星一圈又一圈地转，外侧行星却只前进了一点点',
    ar: 'بينما يكمل الكوكب الداخلي دورة تلو دورة، لا يتقدم الخارجي إلا قليلًا',
    es: 'Mientras el planeta interior da vuelta tras vuelta, el exterior apenas avanza',
    fr: 'Pendant que la planète intérieure enchaîne les tours, l’extérieure n’avance que de peu',
    hi: 'भीतरी ग्रह बार-बार चक्कर लगाता है, जबकि बाहरी ग्रह बस थोड़ा-थोड़ा आगे बढ़ता है',
    id: 'Selagi planet dalam berputar lagi dan lagi, planet luar hanya maju sedikit demi sedikit',
    pt: 'Enquanto o planeta interno dá volta após volta, o externo só avança um pouquinho',
  },
  'caption.ghost': {
    ko: '안쪽 행성의 빠르기였다면 바깥 행성은 벌써 한 바퀴를 마쳤다(점선) — 실제로는 더 느리게 가서 아직 한참 남았다',
    en: "At the inner planet's speed the outer one would already be round (dashed) — but it moves more slowly and still has far to go",
    ja: '内側の惑星の速さなら、外側の惑星はもう1周を終えていた(破線) — 実際にはもっと遅く進むので、まだ先は長い',
    zh: '若以内侧行星的速度，外侧行星早已绕完一圈（虚线）— 但它走得更慢，还差得远',
    ar: 'لو سار الكوكب الخارجي بسرعة الداخلي لأكمل دورته الآن (الخط المتقطع) — لكنه أبطأ، وما زال أمامه طريق طويل',
    es: 'A la velocidad del planeta interior, el exterior ya habría dado la vuelta (línea discontinua) — pero va más despacio y aún le falta mucho',
    fr: 'À la vitesse de la planète intérieure, l’extérieure aurait déjà fait le tour (pointillés) — mais elle va plus lentement et a encore un long chemin',
    hi: 'भीतरी ग्रह की चाल से बाहरी ग्रह अब तक चक्कर पूरा कर चुका होता (टूटी रेखा) — पर वह धीमा चलता है और अभी बहुत दूर है',
    id: 'Dengan kelajuan planet dalam, planet luar sudah menyelesaikan satu putaran (garis putus-putus) — tetapi ia bergerak lebih lambat dan masih jauh',
    pt: 'Na velocidade do planeta interno, o externo já teria dado a volta (tracejado) — mas ele anda mais devagar e ainda tem muito pela frente',
  },
  'caption.hold': {
    ko: '바깥 행성이 겨우 한 바퀴를 마쳤다 — 그동안 안쪽 행성은 칸 수만큼 돌아 함께 출발선에 섰다',
    en: 'The outer planet has finally finished one lap — meanwhile the inner one went round once per box, and both are back at the start line',
    ja: '外側の惑星がようやく1周を終えた — その間に内側の惑星は1マスにつき1周し、2つそろってスタートラインに戻った',
    zh: '外侧行星终于绕完一圈 — 这期间内侧行星每格绕一圈，两者一同回到起跑线',
    ar: 'أنهى الكوكب الخارجي أخيرًا دورة واحدة — وفي أثناء ذلك دار الداخلي دورة لكل خانة، وعاد كلاهما إلى خط البداية',
    es: 'El planeta exterior por fin ha completado una vuelta — mientras tanto el interior dio una vuelta por casilla, y ambos están de nuevo en la línea de salida',
    fr: 'La planète extérieure a enfin bouclé un tour — pendant ce temps, l’intérieure a fait un tour par case, et les deux sont revenues sur la ligne de départ',
    hi: 'बाहरी ग्रह ने आखिरकार एक चक्कर पूरा किया — इस बीच भीतरी ग्रह ने हर खाने के लिए एक चक्कर लगाया, और दोनों फिर प्रारंभ रेखा पर हैं',
    id: 'Planet luar akhirnya menyelesaikan satu putaran — sementara itu planet dalam berputar sekali untuk setiap kotak, dan keduanya kembali di garis start',
    pt: 'O planeta externo finalmente completou uma volta — enquanto isso o interno deu uma volta por casa, e os dois estão de volta à linha de partida',
  },
} satisfies Record<string, LocalizedText>);

export type KeplersThirdLawMessageKey = keyof typeof keplersThirdLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: KeplersThirdLawMessageKey): LocalizedText => keplersThirdLawMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: KeplersThirdLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const keplersThirdLawSchema: BundleSchema = {
  id: KEPLERS_THIRD_LAW_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 반지름을 끌게 하면 주기가 변하는 것은 보이지만 「얼마나 빨리」 는
  // 두 궤도를 나란히 견줄 때만 보인다 — 한 궤도를 끄는 순간 비교 대상이 사라진다.
  parameters: [],

  stages: [
    {
      id: 'two-orbits',
      label: text('label.stage'),
      constants: {
        radiusRatio: RADIUS_RATIO,
        periodRatio: PERIOD_RATIO,
        outerRadius: OUTER_RADIUS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'orbits', label: text('label.view'), default: true }],

  /** 궤도를 왼쪽에, 시간 띠와 캡션을 오른쪽에 둬 세로를 아낀다 (S-piece — 세로가 비싸다). */
  canvas: { height: 380, minHeight: 340 },

  /** 겹침 순서가 뜻을 갖는다 — 궤도선 위로 자취가, 그 위로 행성이 지나야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 바깥 행성의 한 바퀴 + 멈춤 + 거둠.
   *
   * - 바깥 행성의 주기는 **`half` 가 끝나는 시각**이다 (depart 2 + race 4 + half 6 = 12 초).
   *   안쪽 주기는 그것을 스테이지 상수 `periodRatio` 로 나눈 값(1.5 초)이다.
   * - 안쪽 빠르기로 바깥 궤도를 도는 점선 유령은 바깥 주기 × `radiusRatio` ÷ `periodRatio`
   *   (= 6 초, `race` 끝)에 한 바퀴를 마친다. `half` 캡션이 「벌써 마쳤다」 고 말하는 근거다 —
   *   이 관계도 선언할 자리가 없다 (G129).
   * - `meet` 동안 궤도 위 유령이 거둬진다 — 출발선에 먼저 와 있던 유령이 바깥 행성과 한자리에 겹친다.
   *   시간 띠의 유령 선은 `fade` 까지 남는다.
   * - `meet` · `hold` · `fade` 동안 두 행성은 출발선에 멈춰 있다. 다음 주기가 출발선에서 시작하므로 튀지 않는다.
   */
  timeline: {
    phases: [
      { id: 'depart', duration: 2, caption: key('caption.depart') },
      { id: 'race', duration: 4, caption: key('caption.race') },
      { id: 'half', duration: 6, caption: key('caption.ghost') },
      { id: 'meet', duration: 0.6, caption: key('caption.hold') },
      { id: 'hold', duration: 3.4, caption: key('caption.hold') },
      { id: 'fade', duration: 1, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 이미 떠났다 — 안쪽 행성이 첫 바퀴의 절반쯤에 있다. */
  startAt: 0.7,

  // 슬롯 하나. 시간 띠 아래에 왼쪽 정렬로 세운다 — 그림에 딸린 자리라 월드 앵커다.
  caption: {
    anchor: { world: CAPTION_AT },
    align: 'left',
    fontSize: 15,
    wrapWidth: 420,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **시간 띠의 칸 수** 다 —
   * 격자를 깔면 궤도의 좌표를 읽으라는 다른 지시가 된다.
   */

  messages: keplersThirdLawMessages,
};
