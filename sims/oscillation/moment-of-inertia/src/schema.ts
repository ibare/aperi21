// ========================================================================
// moment-of-inertia — 선언
// ========================================================================
// 질문: 질량이 같은데, 왜 어떤 바퀴는 같은 돌림힘으로 돌려도 잘 안 돌아가는가.
//
// 동사는 「뒤처진다」. 같은 질량 알갱이 12개를 가진 바퀴 둘을 멈춘 상태에서 같은
// 돌림힘으로 출발시킨다. 질량을 축에서 멀리 둔 오른쪽 바퀴가 회전이 뒤처진다.
// 시행마다 오른쪽 질량을 1.00R → 0.60R → 0.30R 로 **멈춘 뒤에** 옮긴다.
//
// 원본: tasks/piece-lab/moment-of-inertia (index.html · NOTES.md).
// ========================================================================

import type { BundleSchema, LocalizedText, TimelinePhase } from '@aperi21/schema';

/** 등록 키 `aperi21:moment-of-inertia` 와 문자 그대로 일치한다 (C4). */
export const MOMENT_OF_INERTIA_ID = 'moment-of-inertia';

// ------------------------------------------------------------------------
// 물리 모델 (원본 상수 그대로)
// ------------------------------------------------------------------------

/** 두 바퀴 모두 같은 질량 알갱이 수. */
export const N_MASSES = 12;
/** 알갱이 하나의 질량. */
export const M_EACH = 1;
/**
 * 바퀴 틀(축 · 살 · 테)의 관성 모멘트 — 두 바퀴 같다. 0 이면 비율이 정확히 거리 제곱이 되어
 * 보기 좋지만 실제 바퀴와 어긋난다 (원본 NOTES (d)).
 */
export const I_FRAME = 0.12;
/** 왼쪽(기준) 질량의 반지름 — 고정. */
export const R_LEFT = 0.3;
/** 한 시행에서 돌림힘을 거는 시간(초). 시간표 `run-*` 단계의 길이이자 돌림힘을 정하는 값. */
export const RUN = 6.0;
/** 끝난 모습을 보여 주는 시간(초). */
export const HOLD = 0.8;
/** 오른쪽 질량을 옮기는 시간(초). */
export const MOVE = 0.7;
/** 도착한 순간 이미 2초째 돌고 있다. */
export const START_AT = 2.0;
/** 알갱이 잔상이 담는 지난 시간(초). */
export const TRAIL_SECONDS = 0.3;

/** 자동 진행의 세 시행. 오른쪽 질량의 반지름(R 단위). */
export const TRIALS = [
  { id: 'far', r: 1.0 },
  { id: 'mid', r: 0.6 },
  { id: 'near', r: 0.3 },
] as const;
export type TrialId = (typeof TRIALS)[number]['id'];

/** 슬라이더 범위 · 간격 (R 단위). */
export const SLIDER_RANGE: [number, number] = [0.3, 1.0];
export const SLIDER_STEP = 0.05;

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스 860×290 px 를 월드로 옮긴다. 1R = 104 px = 월드 1.
// ------------------------------------------------------------------------

/** 바퀴 테 반지름(원본 px). 월드 1 단위. */
export const RPX = 104;
/** 원본 캔버스 크기(px). 그 가운데가 월드 원점이다. */
export const CANVAS_PX = { w: 860, h: 290 } as const;
export const LEFT_C = { x: 128, y: 130 } as const;
export const RIGHT_C = { x: 732, y: 130 } as const;
/** 돈 각 그래프 영역(원본 px). */
export const GRAPH = { x0: 300, x1: 580, y0: 245, y1: 30 } as const;

/**
 * 고정 프레이밍. 원본 캔버스에 위(캡션 줄)와 아래(슬라이더 줄) 여백을 더한다 —
 * 캡션 · 조작기 자리가 프레이밍 여백으로 잡히지 않아 경계에 직접 넣는다 (장부 G24).
 */
export const CAPTION_ROOM_PX = 40;
export const SLIDER_ROOM_PX = 44;
export const SCENE_BOUNDS = {
  minX: -CANVAS_PX.w / 2 / RPX,
  maxX: CANVAS_PX.w / 2 / RPX,
  minY: -(CANVAS_PX.h / 2 + SLIDER_ROOM_PX) / RPX,
  maxY: (CANVAS_PX.h / 2 + CAPTION_ROOM_PX) / RPX,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const momentOfInertiaMessages = Object.freeze({
  'label.title': {
    ko: '관성 모멘트',
    en: 'Moment of inertia',
    ja: '慣性モーメント',
    zh: '转动惯量',
    ar: 'عزم القصور الذاتي',
    es: 'Momento de inercia',
    fr: 'Moment d’inertie',
    hi: 'जड़त्व आघूर्ण',
    id: 'Momen inersia',
    pt: 'Momento de inércia',
  },
  'label.operation': {
    ko: '질량 분포가 정하는 회전 저항',
    en: 'How mass distribution sets rotational resistance',
    ja: '質量の分布が決める回転のしにくさ',
    zh: '质量分布如何决定转动的难易',
    ar: 'كيف يحدد توزيع الكتلة مقاومة الدوران',
    es: 'Cómo la distribución de la masa determina la resistencia a girar',
    fr: 'Comment la répartition de la masse fixe la résistance à la rotation',
    hi: 'द्रव्यमान का वितरण घूर्णन के प्रतिरोध को कैसे तय करता है',
    id: 'Bagaimana sebaran massa menentukan hambatan terhadap rotasi',
    pt: 'Como a distribuição de massa define a resistência à rotação',
  },
  'label.stage': {
    ko: '두 바퀴',
    en: 'Two wheels',
    ja: '二つの車輪',
    zh: '两个轮子',
    ar: 'عجلتان',
    es: 'Dos ruedas',
    fr: 'Deux roues',
    hi: 'दो पहिये',
    id: 'Dua roda',
    pt: 'Duas rodas',
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
  /** 바퀴 아래 질량 자리 표시. */
  'label.masses': {
    ko: '질량 {n}개 · 축에서 {r}R',
    en: '{n} masses · {r}R from the axle',
    ja: '質量 {n} 個 · 軸から {r}R',
    zh: '{n} 个质量块 · 距轴 {r}R',
    ar: '{n} كتلة · على بعد {r}R من المحور',
    es: '{n} masas · a {r}R del eje',
    fr: '{n} masses · à {r}R de l’axe',
    hi: '{n} द्रव्यमान · धुरी से {r}R',
    id: '{n} massa · {r}R dari poros',
    pt: '{n} massas · a {r}R do eixo',
  },
  /** 그래프 세로 눈금. */
  'label.turns': {
    ko: '{n}바퀴',
    en: '{n} rev',
    ja: '{n}回転',
    zh: '{n}圈',
    ar: '{n} دورة',
    es: '{n} rev',
    fr: '{n} tr',
    hi: '{n} चक्कर',
    id: '{n} putaran',
    pt: '{n} voltas',
  },
  'label.angle': {
    ko: '돈 각',
    en: 'Angle turned',
    ja: '回転した角',
    zh: '转过的角度',
    ar: 'الزاوية التي دارتها',
    es: 'Ángulo girado',
    fr: 'Angle parcouru',
    hi: 'घूमा हुआ कोण',
    id: 'Sudut yang ditempuh',
    pt: 'Ângulo girado',
  },
  'label.time': {
    ko: '시간 →',
    en: 'time →',
    ja: '時間 →',
    zh: '时间 →',
    ar: 'الزمن →',
    es: 'tiempo →',
    fr: 'temps →',
    hi: 'समय →',
    id: 'waktu →',
    pt: 'tempo →',
  },
  'label.slider': {
    ko: '오른쪽 질량을 둘 자리',
    en: 'Where to put the right-hand masses',
    ja: '右側の質量を置く位置',
    zh: '右侧质量块放置的位置',
    ar: 'موضع الكتل اليمنى',
    es: 'Dónde poner las masas de la derecha',
    fr: 'Où placer les masses de droite',
    hi: 'दाईं ओर के द्रव्यमान कहाँ रखें',
    id: 'Tempat meletakkan massa sebelah kanan',
    pt: 'Onde colocar as massas da direita',
  },
  'caption.lagFar': {
    ko: '같은 질량, 같은 돌림힘 — 질량을 축에서 {farDist}배 멀리 둔 오른쪽 바퀴가 뒤처진다. 같은 시간에 돈 각이 왼쪽의 1/{farRatio}.',
    en: 'Same mass, same torque — the right wheel, with its mass {farDist}× farther from the axle, falls behind. In the same time it turns 1/{farRatio} of the left.',
    ja: '同じ質量、同じトルク — 質量を軸から {farDist}× 遠くに置いた右の車輪が遅れる。同じ時間に回る角は左の 1/{farRatio}。',
    zh: '同样的质量，同样的力矩 — 质量离轴远 {farDist}× 的右轮落在后面。相同时间内转过的角度是左轮的 1/{farRatio}。',
    ar: 'الكتلة نفسها وعزم الدوران نفسه — العجلة اليمنى، وكتلتها أبعد عن المحور بمقدار {farDist}×، تتأخر. وفي الزمن نفسه تدور 1/{farRatio} مما تدوره اليسرى.',
    es: 'Misma masa, mismo torque — la rueda derecha, con su masa {farDist}× más lejos del eje, se queda atrás. En el mismo tiempo gira 1/{farRatio} de lo que gira la izquierda.',
    fr: 'Même masse, même couple — la roue de droite, dont la masse est {farDist}× plus loin de l’axe, prend du retard. Dans le même temps, elle tourne de 1/{farRatio} de l’angle de la gauche.',
    hi: 'समान द्रव्यमान, समान बल-आघूर्ण — दायाँ पहिया, जिसका द्रव्यमान धुरी से {farDist}× दूर है, पिछड़ जाता है। उतने ही समय में वह बाएँ पहिये का 1/{farRatio} कोण घूमता है।',
    id: 'Massa sama, torsi sama — roda kanan, yang massanya {farDist}× lebih jauh dari poros, tertinggal. Dalam waktu yang sama ia berputar 1/{farRatio} dari putaran roda kiri.',
    pt: 'Mesma massa, mesmo torque — a roda da direita, com a massa {farDist}× mais longe do eixo, fica para trás. No mesmo tempo, ela gira 1/{farRatio} do que gira a da esquerda.',
  },
  'caption.lagMid': {
    ko: '같은 질량, 같은 돌림힘 — 질량을 축에서 {midDist}배 멀리 둔 오른쪽 바퀴가 뒤처진다. 같은 시간에 돈 각이 왼쪽의 1/{midRatio}.',
    en: 'Same mass, same torque — the right wheel, with its mass {midDist}× farther from the axle, falls behind. In the same time it turns 1/{midRatio} of the left.',
    ja: '同じ質量、同じトルク — 質量を軸から {midDist}× 遠くに置いた右の車輪が遅れる。同じ時間に回る角は左の 1/{midRatio}。',
    zh: '同样的质量，同样的力矩 — 质量离轴远 {midDist}× 的右轮落在后面。相同时间内转过的角度是左轮的 1/{midRatio}。',
    ar: 'الكتلة نفسها وعزم الدوران نفسه — العجلة اليمنى، وكتلتها أبعد عن المحور بمقدار {midDist}×، تتأخر. وفي الزمن نفسه تدور 1/{midRatio} مما تدوره اليسرى.',
    es: 'Misma masa, mismo torque — la rueda derecha, con su masa {midDist}× más lejos del eje, se queda atrás. En el mismo tiempo gira 1/{midRatio} de lo que gira la izquierda.',
    fr: 'Même masse, même couple — la roue de droite, dont la masse est {midDist}× plus loin de l’axe, prend du retard. Dans le même temps, elle tourne de 1/{midRatio} de l’angle de la gauche.',
    hi: 'समान द्रव्यमान, समान बल-आघूर्ण — दायाँ पहिया, जिसका द्रव्यमान धुरी से {midDist}× दूर है, पिछड़ जाता है। उतने ही समय में वह बाएँ पहिये का 1/{midRatio} कोण घूमता है।',
    id: 'Massa sama, torsi sama — roda kanan, yang massanya {midDist}× lebih jauh dari poros, tertinggal. Dalam waktu yang sama ia berputar 1/{midRatio} dari putaran roda kiri.',
    pt: 'Mesma massa, mesmo torque — a roda da direita, com a massa {midDist}× mais longe do eixo, fica para trás. No mesmo tempo, ela gira 1/{midRatio} do que gira a da esquerda.',
  },
  'caption.lagManual': {
    ko: '같은 질량, 같은 돌림힘 — 질량을 축에서 {manDist}배 멀리 둔 오른쪽 바퀴가 뒤처진다. 같은 시간에 돈 각이 왼쪽의 1/{manRatio}.',
    en: 'Same mass, same torque — the right wheel, with its mass {manDist}× farther from the axle, falls behind. In the same time it turns 1/{manRatio} of the left.',
    ja: '同じ質量、同じトルク — 質量を軸から {manDist}× 遠くに置いた右の車輪が遅れる。同じ時間に回る角は左の 1/{manRatio}。',
    zh: '同样的质量，同样的力矩 — 质量离轴远 {manDist}× 的右轮落在后面。相同时间内转过的角度是左轮的 1/{manRatio}。',
    ar: 'الكتلة نفسها وعزم الدوران نفسه — العجلة اليمنى، وكتلتها أبعد عن المحور بمقدار {manDist}×، تتأخر. وفي الزمن نفسه تدور 1/{manRatio} مما تدوره اليسرى.',
    es: 'Misma masa, mismo torque — la rueda derecha, con su masa {manDist}× más lejos del eje, se queda atrás. En el mismo tiempo gira 1/{manRatio} de lo que gira la izquierda.',
    fr: 'Même masse, même couple — la roue de droite, dont la masse est {manDist}× plus loin de l’axe, prend du retard. Dans le même temps, elle tourne de 1/{manRatio} de l’angle de la gauche.',
    hi: 'समान द्रव्यमान, समान बल-आघूर्ण — दायाँ पहिया, जिसका द्रव्यमान धुरी से {manDist}× दूर है, पिछड़ जाता है। उतने ही समय में वह बाएँ पहिये का 1/{manRatio} कोण घूमता है।',
    id: 'Massa sama, torsi sama — roda kanan, yang massanya {manDist}× lebih jauh dari poros, tertinggal. Dalam waktu yang sama ia berputar 1/{manRatio} dari putaran roda kiri.',
    pt: 'Mesma massa, mesmo torque — a roda da direita, com a massa {manDist}× mais longe do eixo, fica para trás. No mesmo tempo, ela gira 1/{manRatio} do que gira a da esquerda.',
  },
  'caption.same': {
    ko: '같은 질량을 축에서 같은 거리에 두면, 같은 돌림힘에 두 바퀴가 나란히 돈다.',
    en: 'Put the same mass at the same distance from the axle, and the same torque turns both wheels side by side.',
    ja: '同じ質量を軸から同じ距離に置けば、同じトルクで二つの車輪は並んで回る。',
    zh: '把同样的质量放在离轴同样远的地方，同样的力矩会让两个轮子并排转动。',
    ar: 'إذا وُضعت الكتلة نفسها على البعد نفسه من المحور، أدار عزم الدوران نفسه العجلتين جنبًا إلى جنب.',
    es: 'Con la misma masa a la misma distancia del eje, el mismo torque hace girar ambas ruedas a la par.',
    fr: 'Avec la même masse à la même distance de l’axe, le même couple fait tourner les deux roues côte à côte.',
    hi: 'समान द्रव्यमान को धुरी से समान दूरी पर रखें, तो समान बल-आघूर्ण दोनों पहियों को साथ-साथ घुमाता है।',
    id: 'Letakkan massa yang sama pada jarak yang sama dari poros, dan torsi yang sama memutar kedua roda berdampingan.',
    pt: 'Com a mesma massa à mesma distância do eixo, o mesmo torque gira as duas rodas lado a lado.',
  },
  'caption.moveToMid': {
    ko: '오른쪽 질량을 축에서 {toMid}R 자리로 옮긴다 — 다시 멈춘 상태에서 같은 돌림힘으로 출발한다.',
    en: 'Move the right-hand masses to {toMid}R from the axle — it starts again from rest with the same torque.',
    ja: '右側の質量を軸から {toMid}R の位置へ移す — ふたたび静止から同じトルクで動き出す。',
    zh: '把右侧质量块移到距轴 {toMid}R 处 — 再次从静止出发，力矩不变。',
    ar: 'تُنقل الكتل اليمنى إلى {toMid}R من المحور — وتنطلق العجلة من جديد من السكون بعزم الدوران نفسه.',
    es: 'Las masas de la derecha pasan a {toMid}R del eje — arranca de nuevo desde el reposo con el mismo torque.',
    fr: 'Les masses de droite passent à {toMid}R de l’axe — la roue repart du repos avec le même couple.',
    hi: 'दाईं ओर के द्रव्यमान धुरी से {toMid}R पर खिसकाए जाते हैं — पहिया फिर विराम से उसी बल-आघूर्ण के साथ चल पड़ता है।',
    id: 'Massa kanan dipindahkan ke {toMid}R dari poros — roda mulai lagi dari diam dengan torsi yang sama.',
    pt: 'As massas da direita vão para {toMid}R do eixo — ela parte de novo do repouso com o mesmo torque.',
  },
  'caption.moveToNear': {
    ko: '오른쪽 질량을 축에서 {toNear}R 자리로 옮긴다 — 다시 멈춘 상태에서 같은 돌림힘으로 출발한다.',
    en: 'Move the right-hand masses to {toNear}R from the axle — it starts again from rest with the same torque.',
    ja: '右側の質量を軸から {toNear}R の位置へ移す — ふたたび静止から同じトルクで動き出す。',
    zh: '把右侧质量块移到距轴 {toNear}R 处 — 再次从静止出发，力矩不变。',
    ar: 'تُنقل الكتل اليمنى إلى {toNear}R من المحور — وتنطلق العجلة من جديد من السكون بعزم الدوران نفسه.',
    es: 'Las masas de la derecha pasan a {toNear}R del eje — arranca de nuevo desde el reposo con el mismo torque.',
    fr: 'Les masses de droite passent à {toNear}R de l’axe — la roue repart du repos avec le même couple.',
    hi: 'दाईं ओर के द्रव्यमान धुरी से {toNear}R पर खिसकाए जाते हैं — पहिया फिर विराम से उसी बल-आघूर्ण के साथ चल पड़ता है।',
    id: 'Massa kanan dipindahkan ke {toNear}R dari poros — roda mulai lagi dari diam dengan torsi yang sama.',
    pt: 'As massas da direita vão para {toNear}R do eixo — ela parte de novo do repouso com o mesmo torque.',
  },
  'caption.moveToFar': {
    ko: '오른쪽 질량을 축에서 {toFar}R 자리로 옮긴다 — 다시 멈춘 상태에서 같은 돌림힘으로 출발한다.',
    en: 'Move the right-hand masses to {toFar}R from the axle — it starts again from rest with the same torque.',
    ja: '右側の質量を軸から {toFar}R の位置へ移す — ふたたび静止から同じトルクで動き出す。',
    zh: '把右侧质量块移到距轴 {toFar}R 处 — 再次从静止出发，力矩不变。',
    ar: 'تُنقل الكتل اليمنى إلى {toFar}R من المحور — وتنطلق العجلة من جديد من السكون بعزم الدوران نفسه.',
    es: 'Las masas de la derecha pasan a {toFar}R del eje — arranca de nuevo desde el reposo con el mismo torque.',
    fr: 'Les masses de droite passent à {toFar}R de l’axe — la roue repart du repos avec le même couple.',
    hi: 'दाईं ओर के द्रव्यमान धुरी से {toFar}R पर खिसकाए जाते हैं — पहिया फिर विराम से उसी बल-आघूर्ण के साथ चल पड़ता है।',
    id: 'Massa kanan dipindahkan ke {toFar}R dari poros — roda mulai lagi dari diam dengan torsi yang sama.',
    pt: 'As massas da direita vão para {toFar}R do eixo — ela parte de novo do repouso com o mesmo torque.',
  },
} satisfies Record<string, LocalizedText>);

export type MomentOfInertiaMessageKey = keyof typeof momentOfInertiaMessages;

export const text = (key: MomentOfInertiaMessageKey): LocalizedText => momentOfInertiaMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MomentOfInertiaMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/**
 * 시행마다 돌림(run) → 멈춤(hold) → 옮김(move). 세 시행이 한 주기(22.5 초).
 *
 * 캡션은 단계가 고른다. 돌림 · 멈춤은 그 시행의 거리 비와 돈 각 비를, 옮김은 어디로 옮기는지를
 * 말한다. 0.30R 시행은 왼쪽과 같은 거리라 「나란히 돈다」 — 시행 목록에서 정해지는 것을 단계
 * 캡션 키로 적었다 (단계에 값을 실을 수 없다, 장부 G13).
 */
const PHASES: TimelinePhase[] = [
  { id: 'run-far', duration: RUN, caption: key('caption.lagFar') },
  { id: 'hold-far', duration: HOLD, caption: key('caption.lagFar') },
  { id: 'move-far', duration: MOVE, ease: 'smooth', caption: key('caption.moveToMid') },
  { id: 'run-mid', duration: RUN, caption: key('caption.lagMid') },
  { id: 'hold-mid', duration: HOLD, caption: key('caption.lagMid') },
  { id: 'move-mid', duration: MOVE, ease: 'smooth', caption: key('caption.moveToNear') },
  { id: 'run-near', duration: RUN, caption: key('caption.same') },
  { id: 'hold-near', duration: HOLD, caption: key('caption.same') },
  { id: 'move-near', duration: MOVE, ease: 'smooth', caption: key('caption.moveToFar') },
];

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const momentOfInertiaSchema: BundleSchema = {
  id: MOMENT_OF_INERTIA_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 290 px + 위 캡션 줄 + 아래 슬라이더 줄. */
  canvas: { height: 380, minHeight: 330 },

  /** 원본 겹침 순서 — 틀 · 잔상 · 알갱이 · 돌림힘 · 글자 · 그래프 · 왼쪽 곡선 · 오른쪽 곡선. */
  drawOrder: 'scene',

  startAt: START_AT,

  timeline: { phases: PHASES },

  caption: {
    anchor: { screen: 'top-left', offset: [16, 14] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    /**
     * 독자가 슬라이더를 만지면 단계 캡션 대신 상태 캡션 — 수동 시행은 시간표가 아니라 상태가
     * 거리를 정한다 (장부 G44).
     */
    cases: [
      { when: 'manualSame', text: key('caption.same') },
      { when: 'manualLag', text: key('caption.lagManual') },
    ],
    vars: {
      farDist: 'farDist',
      farRatio: 'farRatio',
      midDist: 'midDist',
      midRatio: 'midRatio',
      manDist: 'manDist',
      manRatio: 'manRatio',
      toMid: 'toMid',
      toNear: 'toNear',
      toFar: 'toFar',
    },
  },

  messages: momentOfInertiaMessages,
};
