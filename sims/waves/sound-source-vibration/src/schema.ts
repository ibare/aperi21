// ========================================================================
// sound-source-vibration — 선언
// ========================================================================
// 질문: 소리는 어디서 나오고, 언제 멎는가?
//
// 답: 소리 나는 물체는 떨리고 있다. 떨리는 동안에만 둘레로 새 소리가 퍼져
// 나가고, 손으로 잡아 떨림을 멈추면 새 소리는 더 나오지 않는다 — 이미 떠난
// 소리만 멀어져 간다.
//
// 화면에서는 소리굽쇠의 두 가지가 떨리는 동안 한 번 떨 때마다 소리 고리가 하나씩
// 퍼져 나가고, 손이 내려와 가지를 잡으면 고리가 끊긴다. 소리굽쇠 둘레가 빈다.
//
// 공기 입자의 압축 · 팽창은 이웃 `longitudinal-wave` 의 몫이라 되풀이하지 않는다.
// 소리는 퍼져 나가는 고리(파면) 하나로만 보인다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:sound-source-vibration` 와 문자 그대로 일치한다 (C4). */
export const SOUND_SOURCE_VIBRATION_ID = 'sound-source-vibration';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 떨림의 진동수(Hz). 실제 소리굽쇠(수백 Hz)는 눈으로 따라갈 수 없으므로 한 번 떨 때마다
 * 고리 하나가 나오는 것이 보이도록 늦춘 값이다.
 */
export const FREQUENCY = 2;
/** 소리 빠르기(월드/초). 고리 사이 간격 = 소리 빠르기 ÷ 진동수. */
export const SOUND_SPEED = 3.2;
/** 가지 끝의 떨림 폭(월드). 눈에 보이도록 과장했다. */
export const AMPLITUDE = 0.14;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 원점은 소리굽쇠 두 가지 사이, U 자 바닥의 중심.
// ------------------------------------------------------------------------

/** 두 가지의 중심선이 원점에서 떨어진 거리(월드). */
export const PRONG_GAP = 0.26;
/** 가지 뿌리(U 자가 곧게 서기 시작하는 높이)와 가지 끝의 높이(월드). */
export const PRONG_BASE_Y = 0;
export const PRONG_TOP_Y = 1.7;
/** 자루 아래 끝 높이(월드). */
export const STEM_BOTTOM_Y = -1.2;
/** 받침 가운데 높이 · 반너비 · 반높이(월드). */
export const STAND_Y = -1.36;
export const STAND_HALF_W = 0.55;
export const STAND_HALF_H = 0.16;
/**
 * 책상 면 높이(월드) — 받침이 놓인 자리. 고리는 이 위로만 그린다. 아래로 내려가면 화면 아래
 * 캡션 글자 위를 지나가 읽기를 방해한다.
 */
export const TABLE_Y = STAND_Y - STAND_HALF_H;

/** 소리 고리가 퍼지는 중심 — 두 가지의 가운데 높이. */
export const RING_CENTER: readonly [number, number] = [0, (PRONG_BASE_Y + PRONG_TOP_Y) / 2];
/**
 * 이 반지름을 넘은 고리는 선언하지 않는다(월드). 넓은 임베드에서도 화면 밖으로 나간
 * 뒤라야 하므로 경계보다 넉넉히 잡는다.
 */
export const RING_MAX_R = 13;

/** 손 — 가지 끝을 위에서 감싸 쥐는 ∩ 모양. 바깥 반너비 · 손가락 길이 · 손바닥 두께(월드). */
export const HAND_HALF_W = 0.78;
export const HAND_FINGER_LEN = 0.85;
export const HAND_PALM_H = 0.5;
/** 손가락 안쪽이 가지 바깥 면에 닿는 반너비(월드). 가지 선 굵기의 반만큼 띄운다. */
export const HAND_INNER_HALF_W = PRONG_GAP + 0.07;
/** 쥐었을 때 손가락 끝 높이(월드). */
export const HAND_HOLD_Y = PRONG_TOP_Y - HAND_FINGER_LEN + 0.05;
/** 손이 기다리는 자리 — 화면 위 밖(월드). */
export const HAND_AWAY_Y = 4.6;

/** 망치 머리 반지름(월드) · 치기 전에 기다리는 자리 · 가지에 닿는 높이. */
export const MALLET_R = 0.17;
export const MALLET_START: readonly [number, number] = [2.3, 2.1];
export const MALLET_HIT_Y = 1.25;
/** 망치 자루가 머리에서 뻗는 방향과 길이(월드). */
export const MALLET_HANDLE: readonly [number, number] = [0.75, 0.75];

/**
 * 프레이밍 — 가로로 넓게. 고리가 양옆으로 몇 겹 보여야 「퍼져 나간다」 가 읽힌다.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -7.4, maxX: 7.4, minY: -1.7, maxY: 2.75 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const soundSourceVibrationMessages = Object.freeze({
  'label.title': {
    ko: '소리와 떨림',
    en: 'Sound and vibration',
    ja: '音と振動',
    zh: '声音与振动',
    ar: 'الصوت والاهتزاز',
    es: 'Sonido y vibración',
    fr: 'Son et vibration',
    hi: 'ध्वनि और कंपन',
    id: 'Bunyi dan getaran',
    pt: 'Som e vibração',
  },
  'label.operation': {
    ko: '소리 나는 물체는 떨리고, 떨림이 멎으면 소리도 멎는다',
    en: 'A sounding object vibrates, and when the vibration stops, so does the sound',
    ja: '音を出す物体は振動していて、振動が止まると音も止まる',
    zh: '发声的物体在振动，振动停止，声音也随之停止',
    ar: 'الجسم المُصدِر للصوت يهتز، وحين يتوقف الاهتزاز يتوقف الصوت أيضًا',
    es: 'Un objeto que suena vibra, y cuando la vibración se detiene, también el sonido',
    fr: 'Un objet qui émet un son vibre, et quand la vibration cesse, le son cesse aussi',
    hi: 'ध्वनि करती वस्तु कंपन करती है, और कंपन रुकने पर ध्वनि भी रुक जाती है',
    id: 'Benda yang berbunyi bergetar, dan saat getarannya berhenti, bunyinya pun berhenti',
    pt: 'Um objeto que soa vibra, e quando a vibração para, o som também para',
  },
  'label.stage': {
    ko: '소리굽쇠',
    en: 'Tuning fork',
    ja: '音叉',
    zh: '音叉',
    ar: 'الشوكة الرنانة',
    es: 'Diapasón',
    fr: 'Diapason',
    hi: 'स्वरित्र द्विभुज',
    id: 'Garpu tala',
    pt: 'Diapasão',
  },
  'label.view': {
    ko: '떨림과 소리',
    en: 'Vibration and sound',
    ja: '振動と音',
    zh: '振动与声音',
    ar: 'الاهتزاز والصوت',
    es: 'Vibración y sonido',
    fr: 'Vibration et son',
    hi: 'कंपन और ध्वनि',
    id: 'Getaran dan bunyi',
    pt: 'Vibração e som',
  },
  /** 손 이름표. 조사가 붙지 않는 낱말 하나지만 언어마다 다르므로 문안이다 (C1). */
  'label.hand': {
    ko: '손',
    en: 'Hand',
    ja: '手',
    zh: '手',
    ar: 'يد',
    es: 'Mano',
    fr: 'Main',
    hi: 'हाथ',
    id: 'Tangan',
    pt: 'Mão',
  },

  'caption.strike': {
    ko: '망치로 소리굽쇠를 친다.',
    en: 'A mallet strikes the tuning fork.',
    ja: 'ハンマーで音叉をたたく。',
    zh: '小锤敲击音叉。',
    ar: 'مطرقة تضرب الشوكة الرنانة.',
    es: 'Un mazo golpea el diapasón.',
    fr: 'Un maillet frappe le diapason.',
    hi: 'एक हथौड़ी स्वरित्र द्विभुज पर चोट करती है।',
    id: 'Sebuah pemukul memukul garpu tala.',
    pt: 'Um martelo bate no diapasão.',
  },
  'caption.ring': {
    ko: '소리굽쇠가 떨리는 동안, 한 번 떨 때마다 소리가 둘레로 퍼져 나간다.',
    en: 'While the fork vibrates, each shake sends sound spreading out all around it.',
    ja: '音叉が振動しているあいだ、1回ふるえるたびに音がまわりへ広がっていく。',
    zh: '音叉振动时，每振动一次，声音就向四周传播出去。',
    ar: 'ما دامت الشوكة تهتز، تُرسل كل رجفة صوتًا ينتشر في كل ما حولها.',
    es: 'Mientras el diapasón vibra, cada sacudida envía sonido que se propaga a su alrededor.',
    fr: 'Tant que le diapason vibre, chaque oscillation envoie du son qui se propage tout autour.',
    hi: 'जब तक स्वरित्र कंपन करता है, हर कंपन ध्वनि को चारों ओर फैलाता है।',
    id: 'Selama garpu bergetar, tiap getaran mengirim bunyi yang menyebar ke sekelilingnya.',
    pt: 'Enquanto o diapasão vibra, cada oscilação espalha som ao seu redor.',
  },
  'caption.grip': {
    ko: '손으로 가지를 꽉 잡자 떨림이 멎는다.',
    en: 'A hand grips the prongs, and the vibration stops.',
    ja: '手が脚をぎゅっとつかむと、振動が止まる。',
    zh: '一只手握住叉股，振动停止了。',
    ar: 'يدٌ تقبض على الشُّعبتين، فيتوقف الاهتزاز.',
    es: 'Una mano sujeta los brazos, y la vibración se detiene.',
    fr: 'Une main saisit les branches, et la vibration s’arrête.',
    hi: 'एक हाथ भुजाओं को पकड़ लेता है, और कंपन रुक जाता है।',
    id: 'Sebuah tangan menggenggam kedua lengannya, dan getarannya berhenti.',
    pt: 'Uma mão segura as hastes, e a vibração para.',
  },
  'caption.silent': {
    ko: '떨림이 멎자 새 소리가 나오지 않는다 — 이미 떠난 소리만 멀어져 간다.',
    en: 'With the vibration gone, no new sound comes out — only sound that already left keeps moving away.',
    ja: '振動がなくなると新しい音は出ない — すでに出た音だけが遠ざかっていく。',
    zh: '振动消失后，不再发出新的声音 — 只有已经传出的声音继续远去。',
    ar: 'بزوال الاهتزاز لا يخرج صوت جديد — وحده الصوت الذي انطلق من قبل يواصل الابتعاد.',
    es: 'Sin vibración, no sale sonido nuevo — solo el sonido que ya salió sigue alejándose.',
    fr: 'Sans vibration, aucun nouveau son ne sort — seul le son déjà parti continue de s’éloigner.',
    hi: 'कंपन रुकने पर कोई नई ध्वनि नहीं निकलती — केवल पहले निकल चुकी ध्वनि दूर जाती रहती है।',
    id: 'Tanpa getaran, tak ada bunyi baru yang keluar — hanya bunyi yang sudah pergi terus menjauh.',
    pt: 'Sem a vibração, nenhum som novo sai — só o som que já partiu continua se afastando.',
  },
} satisfies Record<string, LocalizedText>);

export type SoundSourceVibrationMessageKey = keyof typeof soundSourceVibrationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SoundSourceVibrationMessageKey): LocalizedText => soundSourceVibrationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SoundSourceVibrationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const soundSourceVibrationSchema: BundleSchema = {
  id: SOUND_SOURCE_VIBRATION_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 손잡이를 두지 않는다 — 「떨림과 소리는 함께 멎는다」 는 보기만 해도 일어난다.
  parameters: [],

  /**
   * `frequency` — 떨림의 진동수(Hz). `soundSpeed` — 소리 빠르기(월드/초).
   * `amplitude` — 가지 끝의 떨림 폭(월드).
   */
  stages: [
    {
      id: 'tuning-fork',
      label: text('label.stage'),
      constants: { frequency: FREQUENCY, soundSpeed: SOUND_SPEED, amplitude: AMPLITUDE },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 낮다 — 소리굽쇠 하나와 양옆으로 퍼지는 고리. */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 쓴 순서대로 겹친다 — 고리를 먼저, 소리굽쇠 · 망치 · 손을 나중에. 고리가 가지를
   * 덮으면 떨림이 고리 무늬에 묻힌다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 소리굽쇠가 울리고 있고 고리가 둘레에 차 있다 (S-piece). */
  startAt: 3.2,

  /**
   * 한 주기 9.5 초.
   *
   * - `swing` — 망치가 다가온다. 소리굽쇠는 가만히 있고 둘레는 비었다.
   * - `hit` — 망치가 가지를 치고 튕겨 나간다. 이 단계의 시작이 떨림의 시작이다.
   * - `ring` — 떨린다. 한 번 떨 때마다 고리 하나.
   * - `reach` — 손이 내려온다. 아직 떨고 있다.
   * - `grip` — 손이 가지를 쥐고 있는 동안 떨림이 0 으로 줄어든다. 이 동안 나온 고리는 옅다.
   * - `silent` — 쥐고 있다. 새 고리는 없고 떠난 고리만 멀어진다.
   * - `release` — 손이 떠난다. 여전히 조용하다.
   */
  timeline: {
    phases: [
      { id: 'swing', duration: 0.7, caption: key('caption.strike') },
      { id: 'hit', duration: 0.3, caption: key('caption.strike') },
      { id: 'ring', duration: 3.8, caption: key('caption.ring') },
      { id: 'reach', duration: 0.6, ease: 'smooth', caption: key('caption.grip') },
      { id: 'grip', duration: 0.4, caption: key('caption.grip') },
      { id: 'silent', duration: 3.0, caption: key('caption.silent') },
      { id: 'release', duration: 0.7, ease: 'smooth', caption: key('caption.silent') },
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

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 잴 것이 거리가 아니다.

  messages: soundSourceVibrationMessages,
};
