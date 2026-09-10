// ========================================================================
// pressure-and-container-shape — 자유 렌더 계층 (S-sim 「자유 렌더 계층」)
// ========================================================================
// 표준 8종에는 "모양이 다른 그릇 안에서 차오르는 물" 을 그리는 어휘가 없다.
// body 는 원·사각뿐이고 surface 는 선 하나, container 는 렌더러가 없다.
// 억지로 조합하는 대신 이 조각이 자기 시각화를 직접 그린다 (원칙 4).
//
// 이 파일이 유일하게 캔버스를 만지는 곳이다. 그 대가로 여기서도 색은
// theme 경유로만 얻고(C2), 화면 문자는 키로만 조회한다(C1).
// ========================================================================

import type { I18n, PrimitiveRenderer, RenderContext, Vec2 } from '@aperi21/schema';
import { widthAtHeight } from './physics';
import {
  FOOTER_ANCHOR_Y,
  READOUT_PRIMITIVE_TYPE,
  VESSEL_PRIMITIVE_TYPE,
  type ReadoutPrimitive,
  type VesselId,
  type VesselPrimitive,
} from './schema';

// ------------------------------------------------------------------------
// 치수 토큰 — 코드에 남는 값은 named 상수로 한 곳에 모은다 (C2).
// 모두 스크린 픽셀. 월드 치수는 전부 schema.ts 의 선언에서 온다.
// ------------------------------------------------------------------------

const WATER_ALPHA = 0.42;
const SURFACE_LINE_WIDTH = 2;
const SURFACE_LINE_WIDTH_LEVELED = 3;
const CHIP_FONT_SIZE = 11;
const CHIP_PADDING_X = 6;
const CHIP_HEIGHT = 17;
const CHIP_GAP_BELOW_SURFACE = 6;
const CHIP_MIN_ABOVE_GROUND = 2;
const PRESSURE_FONT_SIZE = 13;
const NAME_FONT_SIZE = 10;
const NAME_GAP_BELOW_PRESSURE = 15;
const LEVEL_FONT_SIZE = 12;
const LEVEL_TEXT_LIFT = 7;
const GIVENS_FONT_SIZE = 10;
const GIVENS_MIN_FONT_SIZE = 8;
// 화면 좌상단. y 는 우상단 슬라이더(높이 44 + 여백 24) 아래로 내려 잡는다.
const GIVENS_ORIGIN_X = 24;
const GIVENS_ORIGIN_Y = 84;
const GIVENS_LINE_GAP = 14;
const GIVENS_RIGHT_MARGIN = 24;

// ------------------------------------------------------------------------
// 문안 조회 — 러너가 만들어 준 조회기의 3층 규약을 쓴다 (C1).
// RenderContext.i18n 의 최소 계약에는 t 가 없으므로, 없으면 호출부의 en
// 원본으로 떨어진다. en 원본은 언제나 호출부에 리터럴로 둔다.
// ------------------------------------------------------------------------

interface KeyedI18n extends I18n {
  t(key: string, en: string, vars?: Record<string, string | number>): string;
}

function hasKeyedLookup(i18n: I18n): i18n is KeyedI18n {
  return typeof (i18n as Partial<KeyedI18n>).t === 'function';
}

function message(
  rc: RenderContext,
  key: string,
  en: string,
  vars?: Record<string, string | number>,
): string {
  if (hasKeyedLookup(rc.i18n)) return rc.i18n.t(key, en, vars);
  if (!vars) return en;
  return en.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}

function vesselName(rc: RenderContext, shapeId: VesselId): string {
  switch (shapeId) {
    case 'flared':
      return message(rc, 'label.vessel.flared', 'widening');
    case 'straight':
      return message(rc, 'label.vessel.straight', 'straight');
    case 'tapered':
      return message(rc, 'label.vessel.tapered', 'narrowing');
  }
}

// ------------------------------------------------------------------------
// 그릇 하나 — 벽 · 차오르는 물 · 담긴 부피 · 바닥 압력
// ------------------------------------------------------------------------

export const renderPressureVessel: PrimitiveRenderer = (rc, primitive) => {
  const p = primitive as unknown as VesselPrimitive;
  const c = rc.ctx;
  c.save();

  const halfBottom = p.bottomWidth / 2;
  const halfTop = p.topWidth / 2;
  const level = Math.min(Math.max(p.level, 0), p.wallHeight);
  const halfSurface = widthAtHeight(p, level) / 2;

  const bl = rc.toScreen([p.centerX - halfBottom, 0]);
  const br = rc.toScreen([p.centerX + halfBottom, 0]);
  const tl = rc.toScreen([p.centerX - halfTop, p.wallHeight]);
  const tr = rc.toScreen([p.centerX + halfTop, p.wallHeight]);
  const sl = rc.toScreen([p.centerX - halfSurface, level]);
  const sr = rc.toScreen([p.centerX + halfSurface, level]);

  // 1) 차오른 물 — 수면은 언제나 수평이다.
  if (level > 0) {
    c.beginPath();
    c.moveTo(bl[0], bl[1]);
    c.lineTo(br[0], br[1]);
    c.lineTo(sr[0], sr[1]);
    c.lineTo(sl[0], sl[1]);
    c.closePath();
    c.globalAlpha = WATER_ALPHA;
    c.fillStyle = rc.theme.resolveColor('secondary', 'medium');
    c.fill();
    c.globalAlpha = 1;

    c.beginPath();
    c.moveTo(sl[0], sl[1]);
    c.lineTo(sr[0], sr[1]);
    c.strokeStyle = rc.theme.resolveColor('secondary', 'strong');
    c.lineWidth = p.leveled ? SURFACE_LINE_WIDTH_LEVELED : SURFACE_LINE_WIDTH;
    c.lineCap = 'round';
    c.stroke();
  }

  // 2) 그릇 벽 — 위가 열린 ㄷ 자. 바닥 폭은 셋 다 같고 위쪽만 다르다.
  c.beginPath();
  c.moveTo(tl[0], tl[1]);
  c.lineTo(bl[0], bl[1]);
  c.lineTo(br[0], br[1]);
  c.lineTo(tr[0], tr[1]);
  c.strokeStyle = rc.theme.foreground;
  c.lineWidth = rc.theme.strokeWidth.thick;
  c.lineJoin = 'round';
  c.lineCap = 'round';
  c.stroke();

  // 3) 담긴 부피 — 수면 바로 아래에 붙어 물과 함께 올라간다.
  //    수면 위가 아니라 아래에 두는 이유: 다 차면 수면이 목표선과 겹치는데,
  //    그 위에 두면 세 그릇을 가로지르는 목표선이 숫자를 지나간다.
  const centerScreenX = rc.toScreen([p.centerX, 0])[0];
  const chipBottomY = Math.min(
    sl[1] + CHIP_GAP_BELOW_SURFACE + CHIP_HEIGHT,
    bl[1] - CHIP_MIN_ABOVE_GROUND,
  );
  drawChip(
    rc,
    centerScreenX,
    chipBottomY,
    message(rc, 'label.volume', '{v} L', { v: (p.volume * 1000).toFixed(1) }),
    p.atTarget,
  );

  // 4) 바닥 압력 — 압력 화살표(vector) 아래에 숫자로 못박는다.
  const footer = rc.toScreen([p.centerX, FOOTER_ANCHOR_Y]);
  c.textAlign = 'center';
  c.textBaseline = 'alphabetic';
  c.font = `600 ${PRESSURE_FONT_SIZE}px ${rc.theme.fontFamilyMono}`;
  c.fillStyle = p.leveled ? rc.theme.resolveColor('accent', 'strong') : rc.theme.muted;
  c.fillText(
    message(rc, 'label.pressure', '{p} Pa', { p: Math.round(p.pressure) }),
    footer[0],
    footer[1],
  );

  c.font = `${NAME_FONT_SIZE}px ${rc.theme.fontFamily}`;
  c.fillStyle = rc.theme.muted;
  c.fillText(vesselName(rc, p.shapeId), footer[0], footer[1] + NAME_GAP_BELOW_PRESSURE);

  c.restore();
};

/** 값 하나를 담은 작은 칩. 배경을 깔아 물 위에서도 읽힌다. */
function drawChip(
  rc: RenderContext,
  centerX: number,
  bottomY: number,
  text: string,
  settled: boolean,
): void {
  const c = rc.ctx;
  const width = rc.measure.textWidth(text, CHIP_FONT_SIZE) + CHIP_PADDING_X * 2;
  const x = centerX - width / 2;
  const y = bottomY - CHIP_HEIGHT;

  c.globalAlpha = 0.85;
  c.fillStyle = rc.theme.background;
  c.fillRect(x, y, width, CHIP_HEIGHT);
  c.globalAlpha = 1;
  c.strokeStyle = rc.theme.line;
  c.lineWidth = rc.theme.strokeWidth.regular;
  c.strokeRect(x, y, width, CHIP_HEIGHT);

  c.font = `${CHIP_FONT_SIZE}px ${rc.theme.fontFamilyMono}`;
  c.fillStyle = settled ? rc.theme.foreground : rc.theme.muted;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(text, centerX, y + CHIP_HEIGHT / 2);
}

// ------------------------------------------------------------------------
// 값이 끼어드는 문안 한 줄
// ------------------------------------------------------------------------

export const renderPressureReadout: PrimitiveRenderer = (rc, primitive) => {
  const p = primitive as unknown as ReadoutPrimitive;
  const c = rc.ctx;
  c.save();

  if (p.variant === 'level') {
    const anchor: Vec2 = rc.toScreen(p.pos);
    c.font = `600 ${LEVEL_FONT_SIZE}px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = p.leveled ? rc.theme.resolveColor('accent', 'strong') : rc.theme.muted;
    c.textAlign = 'right';
    // 선 위에 쓴다 — 선 아래는 가장 오른쪽 그릇의 부피 칩이 지나가는 자리다.
    c.textBaseline = 'bottom';
    c.fillText(
      message(rc, 'label.level', 'h = {h} m', { h: p.height.toFixed(2) }),
      anchor[0],
      anchor[1] - LEVEL_TEXT_LIFT,
    );
  } else {
    c.fillStyle = rc.theme.muted;
    c.textAlign = 'left';
    c.textBaseline = 'alphabetic';
    drawGivensLine(
      rc,
      GIVENS_ORIGIN_Y,
      message(rc, 'label.constants', 'ρ = {rho} kg/m³ · g = {g} m/s²', {
        rho: p.rho.toFixed(0),
        g: p.gravity.toFixed(1),
      }),
    );
    drawGivensLine(
      rc,
      GIVENS_ORIGIN_Y + GIVENS_LINE_GAP,
      message(rc, 'label.bottomArea', 'bottom area A = {a} m² — all equal', {
        a: p.bottomArea.toFixed(2),
      }),
    );
  }

  c.restore();
};

/**
 * 주어진 값 한 줄. 넘치면 자리를 늘리는 대신 글자를 줄여 담는다 (원칙 6) —
 * 임베드 높이는 마운트 뒤 바뀌지 않으므로 줄바꿈으로 밀어낼 수 없다.
 */
function drawGivensLine(rc: RenderContext, baselineY: number, text: string): void {
  const available = Math.max(1, rc.viewport.width - GIVENS_ORIGIN_X - GIVENS_RIGHT_MARGIN);
  const natural = rc.measure.textWidth(text, GIVENS_FONT_SIZE);
  const fontSize =
    natural > available
      ? Math.max(GIVENS_MIN_FONT_SIZE, (GIVENS_FONT_SIZE * available) / natural)
      : GIVENS_FONT_SIZE;
  rc.ctx.font = `${fontSize}px ${rc.theme.fontFamily}`;
  rc.ctx.fillText(text, GIVENS_ORIGIN_X, baselineY);
}

// ------------------------------------------------------------------------
// 렌더러 꾸러미 — `Bundle.renderers` 로 나간다.
//
// 예전에는 `Plugin` 객체를 만들어 호스트가 부팅 때 등록했는데, 그러면 이 조각이
// 화면에 없어도 부팅만으로 통째로 로드된다 (R10). 지금은 조각과 함께 온다.
// ------------------------------------------------------------------------

export const pressureAndContainerShapeRenderers: Record<string, PrimitiveRenderer> = {
  [VESSEL_PRIMITIVE_TYPE]: renderPressureVessel,
  [READOUT_PRIMITIVE_TYPE]: renderPressureReadout,
};

/** 그릇은 구조물(surface=10) 바로 위, 궤적(trajectory=20) 아래. 문안은 주석(marker=60) 위. */
export const pressureAndContainerShapeZHints: Record<string, number> = {
  [VESSEL_PRIMITIVE_TYPE]: 15,
  [READOUT_PRIMITIVE_TYPE]: 62,
};
