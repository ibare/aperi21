// ========================================================================
// equilibrium-points — 선언
// ========================================================================
// 질문: 셋 다 힘을 받지 않고 멈춰 있는데, 왜 어떤 평형은 「안정」 이고 어떤 것은
// 「불안정」 인가.
//
// 골 바닥 · 마루 꼭대기 · 평지 위에 같은 공이 하나씩 멈춰 있다. 셋 다 공 밑이
// 평평해 미는 힘이 없다. 셋을 **똑같이** 오른쪽으로 조금 옮기면 비탈이 생긴다 —
// 골은 공을 되밀고, 마루는 더 밀어내고, 평지는 밀지 않는다. 손을 놓으면 골의 공은
// 돌아오고, 마루의 공은 굴러떨어지고, 평지의 공은 옮긴 자리에 머문다.
//
// 가르는 것은 평형 자리 그 자체가 아니라 **조금 옮겼을 때 생기는 힘의 방향**이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:equilibrium-points` 와 문자 그대로 일치한다 (C4). */
export const EQUILIBRIUM_POINTS_ID = 'equilibrium-points';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 중력 가속도(m/s²). */
export const GRAVITY = 9.8;
/** 구름 저항 — 속도에 비례해 붙잡는 감속 계수(1/s). 세 판이 같다 — 같은 바닥이다. */
export const DAMPING = 1.4;
/** 셋을 옮기는 거리(m). 셋이 **같다** — 다른 것은 바닥 모양뿐이다. */
export const NUDGE = 0.3;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 세 판을 가로로 나란히 둔다.
// ------------------------------------------------------------------------

/** 판 하나의 반폭(m). 트랙이 가운데에서 좌우로 이만큼 뻗는다. */
export const HALF_WIDTH = 1.3;
/**
 * 굽이(골 · 마루)의 반폭(m). 그 바깥은 판 끝까지 평평하다 — 굴러떨어진 공이 **평평한 발**
 * 에서 멈춤막이에 닿아야 멈춘 뒤 비탈 힘이 남지 않는다. 기운 자리에서 막에 기대 서면
 * 화살표가 남아 「아직 밀린다」 로 읽힌다.
 */
export const HUMP_HALF_WIDTH = 1.0;
/** 골의 깊이 = 마루의 높이(m). 골과 마루는 서로 거울상이다 — 굽은 정도가 같다. */
export const RELIEF = 0.8;
/** 판 가운데 사이 간격(m). */
export const PANEL_PITCH = 3.2;
/** 공 반지름(m). 셋이 같다. */
export const BALL_RADIUS = 0.13;
/** 트랙 아래 땅을 채우는 깊이(월드 y). */
export const GROUND_BOTTOM = -0.2;
/** 평형 자리 점선이 트랙 아래 · 위로 뻗는 길이(m). */
export const MARK_BELOW = 0.12;
export const MARK_ABOVE = 0.52;
/** 비탈 힘 화살표의 배율 — 비탈 방향 가속도(m/s²) → 화살표 길이(m). */
export const FORCE_ARROW_SCALE = 0.07;
/** 이름표(안정 · 불안정 · 중립)가 놓이는 높이. */
export const NAME_Y = -0.42;

/**
 * 프레이밍은 주장의 일부다. 가로는 세 판 끝까지, 세로는 마루 위 공과 점선 끝에서
 * 이름표 · 캡션 줄 아래까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -4.75, maxX: 4.75, minY: -1.05, maxY: 1.45 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 셋이 멈춰 있는 동안(초). */
export const REST = 1.6;
/** 셋을 옮기는 동안. */
export const NUDGE_TIME = 1.0;
/**
 * 손을 놓은 뒤(물리 시간 초). 마루의 공은 반 초 남짓에 굴러떨어지므로 느리게 흘린다 —
 * `RELEASE_SLOW` 배속으로 화면에서는 두 배 길다.
 */
export const RELEASE = 2.8;
export const RELEASE_SLOW = 0.5;
/** 결과를 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const HOLD = 2.6;
export const FADE = 0.6;
/** 결과 단계에서 이름표가 떠오르는 시간(초). */
export const NAME_FADE_IN = 0.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const equilibriumPointsMessages = Object.freeze({
  'label.title': { ko: '평형점', en: 'Equilibrium points', ja: '平衡点', zh: '平衡点', ar: 'نقاط الاتزان', es: 'Puntos de equilibrio', fr: 'Points d’équilibre', hi: 'संतुलन बिंदु', id: 'Titik kesetimbangan', pt: 'Pontos de equilíbrio' },
  'label.operation': { ko: '안정·불안정·중립 평형', en: 'Stable, unstable and neutral equilibrium', ja: '安定・不安定・中立の平衡', zh: '稳定、不稳定与随遇平衡', ar: 'الاتزان المستقر وغير المستقر والمحايد', es: 'Equilibrio estable, inestable e indiferente', fr: 'Équilibre stable, instable et indifférent', hi: 'स्थायी, अस्थायी और उदासीन संतुलन', id: 'Kesetimbangan stabil, labil, dan netral', pt: 'Equilíbrio estável, instável e indiferente' },
  'label.stage': { ko: '세 바닥', en: 'Three grounds', ja: '3つの地面', zh: '三种地面', ar: 'ثلاث أرضيات', es: 'Tres suelos', fr: 'Trois sols', hi: 'तीन धरातल', id: 'Tiga permukaan', pt: 'Três terrenos' },
  'label.view': { ko: '나란히', en: 'Side by side', ja: '並べて', zh: '并排', ar: 'جنبًا إلى جنب', es: 'Lado a lado', fr: 'Côte à côte', hi: 'साथ-साथ', id: 'Berdampingan', pt: 'Lado a lado' },
  'label.stable': { ko: '안정', en: 'stable', ja: '安定', zh: '稳定', ar: 'مستقر', es: 'estable', fr: 'stable', hi: 'स्थायी', id: 'stabil', pt: 'estável' },
  'label.unstable': { ko: '불안정', en: 'unstable', ja: '不安定', zh: '不稳定', ar: 'غير مستقر', es: 'inestable', fr: 'instable', hi: 'अस्थायी', id: 'labil', pt: 'instável' },
  'label.neutral': { ko: '중립', en: 'neutral', ja: '中立', zh: '随遇', ar: 'محايد', es: 'indiferente', fr: 'indifférent', hi: 'उदासीन', id: 'netral', pt: 'indiferente' },
  'caption.rest': {
    ko: '골 바닥 · 마루 꼭대기 · 평지 — 세 공 모두 멈춰 있다. 공 밑이 평평해 미는 힘이 없다',
    en: 'Valley floor, crest top, flat — all three balls sit still. The ground under each is level, so nothing pushes',
    ja: '谷底・山の頂上・平地 — 3つの球はどれも止まっている。球の下は水平なので押す力がない',
    zh: '谷底、峰顶、平地 — 三个球都静止不动。每个球下面的地面都是水平的，所以没有推力',
    ar: 'قاع الوادي، قمة الحافة، أرض مستوية — الكرات الثلاث ساكنة. الأرض تحت كل منها أفقية، فلا شيء يدفعها',
    es: 'Fondo del valle, cima de la cresta, llano — las tres bolas están quietas. El suelo bajo cada una es horizontal, así que nada las empuja',
    fr: 'Fond du creux, sommet de la crête, plat — les trois billes restent immobiles. Le sol sous chacune est horizontal, donc rien ne les pousse',
    hi: 'घाटी का तल, शिखर की चोटी, समतल — तीनों गेंदें स्थिर हैं। हर गेंद के नीचे धरातल क्षैतिज है, इसलिए कुछ भी नहीं धकेलता',
    id: 'Dasar lembah, puncak bukit, datar — ketiga bola diam. Permukaan di bawah masing-masing datar, jadi tidak ada yang mendorong',
    pt: 'Fundo do vale, topo da crista, plano — as três bolas estão paradas. O chão sob cada uma é horizontal, então nada as empurra',
  },
  'caption.nudge': {
    ko: '셋을 똑같이 오른쪽으로 조금 옮긴다 — 골은 되밀고, 마루는 더 밀어내고, 평지는 밀지 않는다',
    en: 'Move all three the same small step right — the valley pushes back, the crest pushes on, the flat does not push',
    ja: '3つとも同じだけ右へ少し動かす — 谷は押し戻し、山はさらに押し出し、平地は押さない',
    zh: '把三个球都向右移动同样的一小步 — 山谷把球推回，峰顶把球继续推开，平地不推',
    ar: 'حرّك الثلاث الخطوة الصغيرة نفسها إلى اليمين — الوادي يدفع إلى الخلف، والقمة تدفع إلى الأمام، والأرض المستوية لا تدفع',
    es: 'Mueve las tres el mismo pequeño paso a la derecha — el valle empuja de vuelta, la cresta empuja más lejos, el llano no empuja',
    fr: 'Déplacez les trois d’un même petit pas vers la droite — le creux repousse, la crête pousse plus loin, le plat ne pousse pas',
    hi: 'तीनों को समान छोटा कदम दाईं ओर खिसकाएँ — घाटी वापस धकेलती है, शिखर और आगे धकेलता है, समतल नहीं धकेलता',
    id: 'Geser ketiganya selangkah kecil yang sama ke kanan — lembah mendorong balik, puncak mendorong menjauh, yang datar tidak mendorong',
    pt: 'Mova as três o mesmo pequeno passo para a direita — o vale empurra de volta, a crista empurra para longe, o plano não empurra',
  },
  'caption.release': {
    ko: '손을 놓는다 — 골의 공은 돌아오고, 마루의 공은 굴러떨어지고, 평지의 공은 그대로 있다',
    en: 'Let go — the valley ball comes back, the crest ball rolls off, the flat ball stays put',
    ja: '手を放す — 谷の球は戻り、山の球は転がり落ち、平地の球はそのままだ',
    zh: '松手 — 谷中的球回来了，峰顶的球滚落下去，平地上的球留在原处',
    ar: 'اتركها — كرة الوادي تعود، وكرة القمة تتدحرج بعيدًا، وكرة الأرض المستوية تبقى مكانها',
    es: 'Suelta — la bola del valle regresa, la de la cresta rueda cuesta abajo, la del llano se queda quieta',
    fr: 'On lâche — la bille du creux revient, celle de la crête dévale, celle du plat reste en place',
    hi: 'छोड़ दें — घाटी की गेंद लौट आती है, शिखर की गेंद लुढ़क जाती है, समतल की गेंद वहीं रहती है',
    id: 'Lepaskan — bola di lembah kembali, bola di puncak menggelinding jatuh, bola di tempat datar tetap diam',
    pt: 'Solte — a bola do vale volta, a da crista rola para longe, a do plano fica parada',
  },
  'caption.result': {
    ko: '제자리로 돌아온 공 · 멀리 떠난 공 · 옮긴 자리에 머문 공',
    en: 'One ball back where it was, one gone far away, one resting where it was moved',
    ja: '元の場所に戻った球・遠くへ去った球・動かした場所にとどまる球',
    zh: '一个球回到原处，一个球远远离去，一个球停在被移到的地方',
    ar: 'كرة عادت إلى موضعها، وكرة ابتعدت كثيرًا، وكرة استقرت حيث نُقلت',
    es: 'Una bola de vuelta en su sitio, otra muy lejos, otra quieta donde se la movió',
    fr: 'Une bille revenue à sa place, une partie loin, une au repos là où on l’a déplacée',
    hi: 'एक गेंद अपनी जगह लौटी, एक दूर चली गई, एक वहीं टिकी जहाँ उसे खिसकाया गया था',
    id: 'Satu bola kembali ke tempatnya, satu pergi jauh, satu diam di tempat ia dipindahkan',
    pt: 'Uma bola de volta ao lugar, outra muito longe, outra parada onde foi deixada',
  },
} satisfies Record<string, LocalizedText>);

export type EquilibriumPointsMessageKey = keyof typeof equilibriumPointsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EquilibriumPointsMessageKey): LocalizedText => equilibriumPointsMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EquilibriumPointsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const equilibriumPointsSchema: BundleSchema = {
  id: EQUILIBRIUM_POINTS_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 셋이 옮겨지고, 놓이고, 갈린다.
  parameters: [],

  stages: [
    {
      id: 'three-grounds',
      label: text('label.stage'),
      constants: { gravity: GRAVITY, damping: DAMPING, nudge: NUDGE },
    },
  ],

  environments: [],

  views: [{ id: 'side-by-side', label: text('label.view'), default: true }],

  /**
   * 가로 9.5 m 에 세로 2.5 m — 판 셋을 나란히 두는 그림이라 가로가 먼저 찬다.
   * 세로를 더 주면 빈 띠만 늘어난다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 300, minHeight: 260 },

  /**
   * 겹침이 판정 장치다. 평형 자리 점선은 **공 뒤로** 지나가야 「공이 점선 위에 있다 /
   * 벗어났다」 로 읽히고, 땅 채움은 트랙선 아래에 깔려야 한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 멈춤 → 옮김 → 놓음 → 결과 → 흐려짐.
   *
   * 옮기는 동안은 `smooth` — 손으로 천천히 옮겨 잡는 것이라 출발 · 도착에 튀는 속도가
   * 없어야 놓는 순간 세 공이 모두 멈춘 채로 시작한다. 놓은 뒤는 절반 속도로 흘린다.
   */
  timeline: {
    phases: [
      { id: 'rest', duration: REST, caption: key('caption.rest') },
      { id: 'nudge', duration: NUDGE_TIME, ease: 'smooth', caption: key('caption.nudge') },
      {
        id: 'release',
        duration: RELEASE,
        timeScale: RELEASE_SLOW,
        caption: key('caption.release'),
      },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 멈춘 세 공을 잠깐 보인 뒤 곧 옮기기 시작하는
   * 자리에서 연다. 멈춤 단계를 통째로 건너뛰면 「셋 다 평형이다」 라는 전제를 못 본다.
   */
  startAt: 0.9,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 **공이 점선으로 돌아오는가**
   * 라서, 거리 격자는 다른 질문을 부른다.
   */

  messages: equilibriumPointsMessages,
};
