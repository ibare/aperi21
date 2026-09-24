import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/**
 * 등록 키 `aperi21:pressure-isotropy` 와 문자 그대로 일치한다 (C4).
 */
export const PRESSURE_ISOTROPY_ID = 'pressure-isotropy';

/**
 * 화면에 그려지는 모든 문자. 코드가 아니라 **선언**에 있다 (C1 · 원칙 2).
 *
 * C1 「표식이냐 문안이냐」 판정:
 * - `conditions` · `depth` · `pressure` · `areaAndForce` · `forceSymbol`
 *   은 수식·기호·단위 표기라 **표식**이다. 번역하면 오히려 화면과 어긋난다.
 * - `water` · `claim` · `trailDone` 은 어순이 언어마다 달라지는 **문안**이라
 *   `{ ko, en }` 을 둔다.
 */
export const pressureIsotropyText = {
  /** 유체 조건. 호스트가 확정한 값. */
  conditions: 'ρ = 1000 kg/m³   g = 9.8 m/s²',
  /** 판이 놓인 깊이. */
  depth: 'h = 0.20 m',
  /** 그 깊이의 계기압. */
  pressure: 'P = ρgh = 1960 Pa',
  /** 판의 면적과 판이 받는 힘의 크기. */
  areaAndForce: 'A = 1 cm²   |F| = P·A = 0.196 N',
  /** 힘 화살표에 새겨진 글자. */
  forceSymbol: 'F',
  water: {
    ko: '물',
    en: 'water',
    ja: '水',
    zh: '水',
    ar: 'ماء',
    es: 'agua',
    fr: 'eau',
    hi: 'पानी',
    id: 'air',
    pt: 'água',
  },
  claim: {
    ko: '판을 어느 쪽으로 돌려도 화살표 길이는 그대로다',
    en: 'turn the plate any way — the arrow length does not change',
    ja: '板をどの向きに回しても、矢印の長さは変わらない',
    zh: '无论把板转向哪个方向，箭头长度都不变',
    ar: 'أدِر الصفيحة في أي اتجاه — طول السهم لا يتغيّر',
    es: 'gira la placa hacia cualquier lado — la longitud de la flecha no cambia',
    fr: "tourne la plaque dans n'importe quel sens — la longueur de la flèche ne change pas",
    hi: 'प्लेट को किसी भी ओर घुमाओ — तीर की लंबाई नहीं बदलती',
    id: 'putar pelat ke arah mana pun — panjang panah tidak berubah',
    pt: 'gire a placa para qualquer lado — o comprimento da seta não muda',
  },
  trailDone: {
    ko: '화살표 꼬리가 그린 자취는 원이다',
    en: 'the arrow tails have traced a circle',
    ja: '矢印の根元がえがいた軌跡は円になった',
    zh: '箭头尾部画出了一个圆',
    ar: 'رسمت ذيول الأسهم دائرة',
    es: 'las colas de las flechas han trazado un círculo',
    fr: 'les queues des flèches ont tracé un cercle',
    hi: 'तीरों की पूँछों ने एक वृत्त बना दिया है',
    id: 'ekor panah telah membentuk lingkaran',
    pt: 'as caudas das setas traçaram um círculo',
  },
} satisfies Record<string, LocalizedText>;

/**
 * 압력의 등방성 — 조각 하나.
 *
 * 질문: 압력은 힘에서 나오는데 왜 방향이 없는가.
 * 동사: 돌린다. 유체 속 한 점에 놓인 판의 각도가 바뀌어도 판이 받는 힘의
 *       크기가 변하지 않는다.
 *
 * 파라미터가 없다. 이 조각은 주장 하나만 하고, 그 주장에 필요한 값(ρ · g · h ·
 * A)은 전부 stage 상수로 고정돼 있다. 깊이를 바꿔 보는 것은 다른 주장이다.
 */
export const pressureIsotropySchema: BundleSchema = {
  id: PRESSURE_ISOTROPY_ID,
  label: {
    ko: '압력의 등방성',
    en: 'Pressure isotropy',
    ja: '圧力の等方性',
    zh: '压强的各向同性',
    ar: 'تساوي الضغط في جميع الاتجاهات',
    es: 'Isotropía de la presión',
    fr: 'Isotropie de la pression',
    hi: 'दाब की समदैशिकता',
    id: 'Isotropi tekanan',
    pt: 'Isotropia da pressão',
  },
  category: 'fluids',
  operation: {
    ko: '판이 저절로 반 바퀴 돌아 자취를 원으로 닫고, 그다음 독자가 다이얼로 직접 돌린다',
    en: 'the plate turns half a revolution to close the trail into a circle, then the reader turns it by hand',
    ja: '板がひとりでに半回転して軌跡を円に閉じ、そのあと読者が手で回す',
    zh: '板自行转半圈，把轨迹闭合成圆，然后由读者亲手转动',
    ar: 'تدور الصفيحة نصف دورة لتغلق الأثر في دائرة، ثم يديرها القارئ بيده',
    es: 'la placa da media vuelta para cerrar el trazo en un círculo; luego el lector la gira a mano',
    fr: 'la plaque fait un demi-tour pour refermer la trace en cercle, puis le lecteur la tourne à la main',
    hi: 'प्लेट आधा चक्कर घूमकर पथ को वृत्त में बंद करती है, फिर पाठक उसे हाथ से घुमाता है',
    id: 'pelat berputar setengah putaran hingga jejaknya menutup menjadi lingkaran, lalu pembaca memutarnya sendiri',
    pt: 'a placa dá meia-volta para fechar o rastro num círculo; depois o leitor a gira com a mão',
  },
  // 판을 천천히 돌려 각 방향을 차례로 들르는 준정적 과정이다. 관성도 흐름도 없다.
  timeModel: 'quasistatic',
  parameters: [],
  stages: [
    {
      id: 'water',
      label: {
        ko: '물속',
        en: 'In water',
        ja: '水中',
        zh: '水中',
        ar: 'في الماء',
        es: 'En el agua',
        fr: "Dans l'eau",
        hi: 'पानी में',
        id: 'Dalam air',
        pt: 'Na água',
      },
      description: {
        ko: '수면에서 0.20 m 아래, 물이 정지해 있는 한 점',
        en: 'a point 0.20 m below the surface of still water',
        ja: '静止した水の水面から 0.20 m 下の一点',
        zh: '静止水面下 0.20 m 处的一点',
        ar: 'نقطة على عمق 0.20 m تحت سطح ماء ساكن',
        es: 'un punto 0.20 m bajo la superficie de agua en reposo',
        fr: "un point à 0.20 m sous la surface d'une eau au repos",
        hi: 'स्थिर पानी की सतह से 0.20 m नीचे एक बिंदु',
        id: 'sebuah titik 0.20 m di bawah permukaan air diam',
        pt: 'um ponto 0.20 m abaixo da superfície de água parada',
      },
      // 화면에 쓰는 값은 전부 여기에서 온다. physics 는 이 상수만 읽는다.
      constants: { rho: 1000, g: 9.8, depth: 0.2, area: 0.0001 },
    },
  ],
  environments: [],
  views: [
    {
      id: 'plate',
      label: {
        ko: '판',
        en: 'Plate',
        ja: '板',
        zh: '板',
        ar: 'الصفيحة',
        es: 'Placa',
        fr: 'Plaque',
        hi: 'प्लेट',
        id: 'Pelat',
        pt: 'Placa',
      },
      default: true,
    },
  ],
  // 에너지 오버레이는 이 조각과 무관하다.
  // 글 한복판에 박히는 그림이라 마운트 후 높이가 바뀌지 않는다 (원칙 6).
  // 호스트 카메라는 세로 가용 픽셀이 (height/2 - 84) 로 제한되므로, 자취 원과
  // 깊이 눈금이 함께 읽히려면 기본값 360 보다 자리가 조금 더 필요하다.
  canvas: { height: 440, minHeight: 400 },
};
