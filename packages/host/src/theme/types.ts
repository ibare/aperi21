import type { ColorRole } from '@aperi21/schema';

export type ThemeMode = 'light' | 'dark';
export type Emphasis = 'strong' | 'medium' | 'subtle';

/**
 * 테마는 **두 축**이다.
 *
 * `scene` 은 조각의 시각화가 쓰고, `ui` 는 코어가 제공하는 조작기가 쓴다. 한 벌을
 * 나눠 쓰면 "조작기만 눈에 덜 띄게" 같은 조정이 구조적으로 불가능하다 — `muted` 를
 * 옅게 하면 슬라이더 이름표와 조각의 배경 정보가 함께 옅어진다.
 *
 * 경계는 타입이 잡는다. 렌더러가 보는 `RenderContext.theme` 은 `SceneTheme` 이고,
 * 조작기가 보는 `ControllerRenderContext` 에는 `theme` 이 없고 `ui` 가 있다.
 */
export interface HostTheme {
  mode: ThemeMode;
  scene: SceneTheme;
  ui: UiTheme;
}

/**
 * 조각의 시각화가 쓰는 축. `@aperi21/schema` 의 `Theme` 계약이 이것이다 —
 * plugin 렌더러도 여기까지만 본다.
 *
 * 색은 **역할**로만 얻는다. 조각이 선언하는 것은 `ColorRole` 이고, 그것을 어떤
 * 색으로 칠할지는 테마의 결정이다 (원칙 5).
 */
export interface SceneTheme {
  resolveColor(role: ColorRole, emphasis?: Emphasis): string;

  /** 스테이지 바탕. */
  background: string;
  /** 일반 전경(글자·선). */
  foreground: string;
  /** 약한 전경(주석·보조 글자). */
  muted: string;
  /** 프리미티브 외곽선 기본색. */
  line: string;
  /** 격자. */
  grid: string;
  /**
   * 빛의 세기 채널의 양 끝. 색 역할과 달리 **어느 테마에서나 `none` 이 `full` 보다 어둡다** —
   * 빛은 대상이 아니라 물리량이라 테마가 극성을 뒤집으면 「밝은 곳」 이 거짓말이 된다 (장부 G34).
   */
  light: { none: string; full: string };

  fontFamily: string;
  fontFamilyMono: string;

  /**
   * 그림 안 글자 크기(px).
   *
   * 예전에는 렌더러마다 `ctx.font = '11px …'` 처럼 숫자가 박혀 있어, 테마를
   * 갈아 끼워도 글자 크기는 그대로였다.
   */
  fontSize: { small: number; regular: number; large: number };

  /**
   * 선 굵기.
   *
   * 다섯 단이다 — 그림은 같은 화면에서 눈금과 물체 외곽과 벡터를 함께 그리고,
   * 그 셋이 굵기로 갈라져야 무엇이 주인공인지 보인다. 세 단이던 때는 모자라서
   * 렌더러마다 `lineWidth = 1.6` 같은 숫자를 직접 박았다.
   */
  strokeWidth: {
    hair: number;
    thin: number;
    regular: number;
    thick: number;
    heavy: number;
  };
}

/**
 * 코어가 제공하는 조작기가 쓰는 축.
 *
 * 색은 **역할이 아니라 자리**로 이름 붙인다. 조작기는 물리량을 그리지 않으므로
 * `primary`/`negative` 같은 역할이 뜻을 갖지 못한다 — 바탕인지 테두리인지
 * 켜진 것인지가 여기서는 더 정확하다.
 */
export interface UiTheme {
  /** 조작기 상자의 바탕. */
  surface: string;
  /** 상자 테두리. */
  border: string;
  /** 이름표·꺼진 항목의 글자. */
  label: string;
  /** 값·켜진 항목의 글자. */
  text: string;
  /** 지금 고른 것(탭·손잡이·채워진 구간). */
  selected: string;
  /** 함께 켜진 것(토글) — 고른 것과 뜻이 달라 색도 다르다. */
  toggled: string;
  /** `selected` · `toggled` 위에 얹는 글자. */
  onSelected: string;
  /** 트랙·눈금처럼 옅게 까는 선. */
  track: string;

  fontFamily: string;
  fontFamilyMono: string;

  fontSize: { small: number; regular: number; large: number };
  /** 여백 눈금(px). */
  spacing: { xs: number; sm: number; md: number; lg: number };
  /** `container` 는 임베드 바깥 상자용 — 소비처에서 다른 값을 곱해 만들지 않는다. */
  radius: { small: number; medium: number; container: number };
  /**
   * 선 굵기. 그림 축보다 한 단 많다 — 조작기는 손잡이·트랙·테두리가 서로
   * 굵기로 구분되어야 어느 것이 잡는 자리인지 보인다.
   */
  strokeWidth: { thin: number; regular: number; thick: number; heavy: number };

  /** 조작기 배치의 기본 치수(px). 선언이 없을 때만 쓰인다 (원칙 7 ③). */
  layout: {
    /** 화면 모서리에서 띄우는 거리. */
    margin: number;
    /** 조작기와 그림 사이의 틈. */
    gap: number;
    /** 칩·한 줄짜리 항목의 높이. */
    controlHeight: number;
    /** 자리를 선언하지 않은 조작기끼리의 세로 간격. */
    stackGap: number;
  };
}
