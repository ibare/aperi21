// ========================================================================
// conservation-of-mechanical-energy — 선언
// ========================================================================
// 질문: 높이와 속력이 쉴 새 없이 바뀌는 동안 변하지 않는 것이 있는가.
//
// 매끄러운 골짜기 궤도를 공 하나가 왕복한다. 내려오면 높이가 줄고 빨라지고,
// 올라가면 빠르기가 줄고 높이가 돌아온다. 공을 따라다니는 기둥이 기준면에서
// **놓은 높이 수평선까지** 늘 닿아 있고, 공이 그 기둥을 두 몫으로 가른다 —
// 공 아래는 높이에 담긴 몫, 공 위는 운동에 담긴 몫이다. 가르는 자리는 쉬지 않고
// 오르내리는데 기둥의 위끝은 한 번도 그 선에서 떨어지지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다. 옛 이름(`ramp-energy`)의
// 화면은 「다른 길로 내려와도 끝 속력이 같다」 만 주장했고, 그것은 이 주장의 결과
// 하나다. 되돌아오는 구간이 없어 「합이 유지된다」 를 화면이 보이지 못했다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:conservation-of-mechanical-energy` 와 문자 그대로 일치한다 (C4). */
export const CONSERVATION_OF_MECHANICAL_ENERGY_ID = 'conservation-of-mechanical-energy';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 중력 가속도(m/s²). */
export const GRAVITY = 9.8;

/**
 * 골짜기를 그리는 사이클로이드의 생성원 반지름(m).
 *
 * 곧은 비탈도 원호도 아니라 **사이클로이드**를 고른 것은 그 길에서 운동이 닫힌
 * 해이기 때문이다. 바닥에서 잰 호 길이 s 에 대해 높이가 y = s²/(8R) 이라 퍼텐셜이
 * 정확히 조화형이고, s(t) = −s₀·cos(ωt) · ω = √(g/4R) 가 **근사 없이** 성립한다.
 * 덤으로 주기가 진폭과 무관해(등시성) 놓는 높이를 바꿔도 시간표가 어긋나지 않는다.
 */
export const RADIUS = 0.8;

/**
 * 공을 놓는 높이(m) — 골짜기 바닥에서 잰다. 이 높이가 곧 **합**이고, 화면에서는
 * 기둥의 위끝이 닿는 수평선이다. 궤도 끝(2R)보다 낮아야 공이 길 끝에 닿기 전에
 * 되돌아선다 — 되돌아서게 하는 것이 길의 끝이 아니라 높이여야 주장이 선다.
 */
export const RELEASE_HEIGHT = 1.1;

/** 속력(m/s) → 화살표 길이(m) 배율. 바닥에서 가장 긴 화살표가 궤도 폭 안에 든다. */
export const SPEED_SCALE = 0.17;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 골짜기 바닥이 원점이고 y 는 위가 +.
// ------------------------------------------------------------------------

/** 공 반지름(m). 길 위에 꿴 구슬이라 중심이 길 위에 놓인다. */
export const BALL_RADIUS = 0.085;

/** 기둥의 반폭(m). 공 지름보다 조금 넓어 공이 기둥을 가르는 것으로 읽힌다. */
export const COLUMN_HALF = 0.13;

/**
 * 되돌아서는 자리에서 길을 이만큼 더 그린다(매개변수 θ). 길이 더 남아 있는데도
 * 공이 멈추는 것이 보여야, 멈춘 이유가 길의 끝이 아니라 높이라는 것이 읽힌다.
 */
export const TRACK_MARGIN = 0.33;

/** 길을 그리는 θ 의 상한. 사이클로이드는 θ = π 에서 첨점이 되어 그보다 앞에서 끊는다. */
export const THETA_CAP = 2.45;

/** 길을 몇 등분해 그리는가. */
export const TRACK_SAMPLES = 96;

/**
 * 고정 경계 — 프레이밍은 주장의 일부다. 매 프레임 같은 값이라야 카메라가 흔들리지
 * 않는다 (S-piece · 원칙 6). 가로는 길 양끝과 이름표까지, 세로는 캡션 줄부터
 * 길 꼭대기까지.
 */
export const SCENE_BOUNDS = { minX: -2.8, maxX: 2.8, minY: -0.6, maxY: 1.44 } as const;

// ------------------------------------------------------------------------
// 시간표 — 한 주기는 왕복 한 번. 네 단계가 흔들림의 네 분기다.
// ------------------------------------------------------------------------

/** 각진동수(rad/s). 사이클로이드 골짜기에서는 진폭과 무관하다. */
export const OMEGA = Math.sqrt(GRAVITY / (4 * RADIUS));

/** 분기 하나의 길이(초) — 되돌아서는 자리에서 바닥까지 걸리는 실제 시간이다. */
export const QUARTER = Math.PI / 2 / OMEGA;

/**
 * 네 단계 모두 같은 재생 속도로 늦춘다. 실시간 한 분기는 0.9 초라 두 몫이 뒤바뀌는
 * 것을 눈으로 좇기에 짧다. 늦춘 것은 시간이지 물리가 아니다.
 */
export const SWING_SLOW = 0.4;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const conservationOfMechanicalEnergyMessages = Object.freeze({
  'label.title': {
    ko: '역학적 에너지 보존',
    en: 'Conservation of mechanical energy',
    ja: '力学的エネルギー保存',
    zh: '机械能守恒',
    ar: 'حفظ الطاقة الميكانيكية',
    es: 'Conservación de la energía mecánica',
    fr: 'Conservation de l’énergie mécanique',
    hi: 'यांत्रिक ऊर्जा संरक्षण',
    id: 'Kekekalan energi mekanik',
    pt: 'Conservação da energia mecânica',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '위치에 담긴 몫과 운동에 담긴 몫이 자리를 바꾸는 동안 둘의 합이 그대로임',
    en: 'The share held in position and the share held in motion trade places while their sum stays the same',
    ja: '位置に蓄えられた分と運動に蓄えられた分が入れ替わるあいだ、その和は変わらない',
    zh: '位置中的部分与运动中的部分相互转换时，两者之和保持不变',
    ar: 'الحصة المختزنة في الموضع والحصة المختزنة في الحركة تتبادلان المكان بينما يبقى مجموعهما ثابتًا',
    es: 'La parte guardada en la posición y la parte guardada en el movimiento intercambian lugares mientras su suma se mantiene',
    fr: 'La part stockée dans la position et celle stockée dans le mouvement échangent leurs places tandis que leur somme reste la même',
    hi: 'स्थिति में रखा अंश और गति में रखा अंश आपस में स्थान बदलते हैं, पर उनका योग वही रहता है',
    id: 'Bagian yang tersimpan dalam posisi dan bagian yang tersimpan dalam gerak bertukar tempat sementara jumlahnya tetap',
    pt: 'A parte guardada na posição e a parte guardada no movimento trocam de lugar enquanto a soma se mantém',
  },
  'label.stage': {
    ko: '골짜기 궤도',
    en: 'Valley track',
    ja: '谷形のコース',
    zh: '山谷轨道',
    ar: 'مسار الوادي',
    es: 'Pista en valle',
    fr: 'Piste en creux',
    hi: 'घाटी पथ',
    id: 'Lintasan lembah',
    pt: 'Pista em vale',
  },
  'label.view': {
    ko: '한 번의 왕복',
    en: 'One round trip',
    ja: '一往復',
    zh: '一次往返',
    ar: 'رحلة ذهاب وإياب واحدة',
    es: 'Una ida y vuelta',
    fr: 'Un aller-retour',
    hi: 'एक बार आना-जाना',
    id: 'Satu kali bolak-balik',
    pt: 'Uma ida e volta',
  },
  /** 기둥의 두 몫에 붙는 이름. 조사가 붙는 낱말이라 표식이 아니라 문안이다 (C1 판정 4). */
  'label.height': {
    ko: '높이',
    en: 'height',
    ja: '高さ',
    zh: '高度',
    ar: 'الارتفاع',
    es: 'altura',
    fr: 'hauteur',
    hi: 'ऊँचाई',
    id: 'ketinggian',
    pt: 'altura',
  },
  'label.motion': {
    ko: '운동',
    en: 'motion',
    ja: '運動',
    zh: '运动',
    ar: 'الحركة',
    es: 'movimiento',
    fr: 'mouvement',
    hi: 'गति',
    id: 'gerak',
    pt: 'movimento',
  },
  'caption.fall': {
    ko: '내려오는 동안 높이에 있던 몫이 운동으로 옮겨 간다',
    en: 'On the way down, the share held in height moves into motion',
    ja: '下る間に、高さにあった分が運動へ移っていく',
    zh: '下降途中，高度所占的份额转入运动',
    ar: 'في أثناء النزول، تنتقل الحصة المخزونة في الارتفاع إلى الحركة',
    es: 'Al bajar, la parte guardada en la altura pasa al movimiento',
    fr: 'En descendant, la part logée dans la hauteur passe dans le mouvement',
    hi: 'नीचे आते समय ऊँचाई में रखा हिस्सा गति में चला जाता है',
    id: 'Saat turun, bagian yang tersimpan dalam ketinggian berpindah ke gerak',
    pt: 'Na descida, a parcela guardada na altura passa para o movimento',
  },
  'caption.rise': {
    ko: '올라가는 동안 운동에 있던 몫이 다시 높이로 돌아간다',
    en: 'On the way up, the share held in motion goes back into height',
    ja: '上る間に、運動にあった分が再び高さへ戻る',
    zh: '上升途中，运动所占的份额又回到高度',
    ar: 'في أثناء الصعود، تعود الحصة المخزونة في الحركة إلى الارتفاع',
    es: 'Al subir, la parte guardada en el movimiento vuelve a la altura',
    fr: 'En remontant, la part logée dans le mouvement retourne dans la hauteur',
    hi: 'ऊपर जाते समय गति में रखा हिस्सा फिर से ऊँचाई में लौट जाता है',
    id: 'Saat naik, bagian yang tersimpan dalam gerak kembali ke ketinggian',
    pt: 'Na subida, a parcela guardada no movimento volta para a altura',
  },
  'caption.sum': {
    ko: '두 몫이 뒤바뀌는 내내 기둥의 위끝은 같은 선에 닿아 있다',
    en: 'Through every swap, the top of the column stays on the same line',
    ja: '入れかわる間ずっと、柱の上端は同じ線に接したままだ',
    zh: '在每一次互换中，柱子的顶端始终停在同一条线上',
    ar: 'طوال كل تبادل، يبقى أعلى العمود على الخط نفسه',
    es: 'En cada intercambio, el extremo superior de la columna se queda en la misma línea',
    fr: 'À chaque échange, le haut de la colonne reste sur la même ligne',
    hi: 'हर अदला-बदली के दौरान स्तंभ का ऊपरी सिरा उसी रेखा पर टिका रहता है',
    id: 'Sepanjang setiap pertukaran, puncak kolom tetap berada di garis yang sama',
    pt: 'Em cada troca, o topo da coluna permanece na mesma linha',
  },
} satisfies Record<string, LocalizedText>);

export type ConservationOfMechanicalEnergyMessageKey =
  keyof typeof conservationOfMechanicalEnergyMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ConservationOfMechanicalEnergyMessageKey): LocalizedText =>
  conservationOfMechanicalEnergyMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ConservationOfMechanicalEnergyMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const conservationOfMechanicalEnergySchema: BundleSchema = {
  id: CONSERVATION_OF_MECHANICAL_ENERGY_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 (controllers.ts 에 이유를 적었다).
  parameters: [],

  stages: [
    {
      id: 'valley',
      label: text('label.stage'),
      constants: {
        gravity: GRAVITY,
        radius: RADIUS,
        releaseHeight: RELEASE_HEIGHT,
        speedScale: SPEED_SCALE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'round-trip', label: text('label.view'), default: true }],

  /**
   * 가로로 길다 — 왕복하는 길이 가로를 다 쓰고 세로는 놓은 높이 하나뿐이다.
   * 세로를 더 주면 그림만 커질 뿐 읽을 것이 늘지 않는다 (S-piece 「세로가 비싸다」).
   */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 기둥은 길 **아래**에 깔려야 길과 공이 기둥 위로 또렷하고,
   * 놓은 높이 수평선은 길 **위**로 지나야 길과 만나는 자리(되돌아서는 자리)가 보인다.
   * 층 기본값으로는 순서를 고를 수 없다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 왕복 한 번. 네 단계가 흔들림의 네 분기이고, `physics.ts` 가
   * `at()` 넷을 더해 위상을 얻는다 — 단계 경계를 상수로 두고 가르지 않는다 (S-piece).
   *
   * 뒤의 두 분기는 앞의 두 분기와 같은 일을 되풀이한다. 그래서 캡션을 하나로 묶어
   * **그 되풀이 자체가 말하는 것**(위끝이 움직이지 않았다)을 건다.
   */
  timeline: {
    phases: [
      { id: 'fall-left', duration: QUARTER, timeScale: SWING_SLOW, caption: key('caption.fall') },
      { id: 'rise-right', duration: QUARTER, timeScale: SWING_SLOW, caption: key('caption.rise') },
      { id: 'fall-right', duration: QUARTER, timeScale: SWING_SLOW, caption: key('caption.sum') },
      { id: 'rise-left', duration: QUARTER, timeScale: SWING_SLOW, caption: key('caption.sum') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 첫 분기의 한가운데, 두 몫이 꼭 반씩 나뉜 자리에서
   * 연다. 0 이면 멈춰 선 공이 먼저 떠오른다.
   */
  startAt: QUARTER * 0.5,

  /** 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — ½mv² + mgh 는 문단의 몫이다. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 몇 미터가 아니라 **기둥의 위끝이
   * 움직였는가** 하나라서, 거리 격자를 깔면 다른 질문이 끼어든다.
   */

  messages: conservationOfMechanicalEnergyMessages,
};
