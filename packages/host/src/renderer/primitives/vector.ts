import type { PrimitiveRenderer, Vec2, Vector } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor } from '../common';

/** 화살촉 기본 크기(화면 px). */
const DEFAULT_HEAD = 8;
/**
 * 화살촉이 차지할 수 있는 최대 비율(화면 길이 대비).
 * 짧은 화살표에 고정 크기 머리를 붙이면 머리만 남아 방향이 읽히지 않는다.
 */
const HEAD_MAX_RATIO = 0.35;
/** 이 길이(화면 px) 아래는 그리지 않는다. */
const MIN_LENGTH = 2;
const LABEL_FONT_SIZE = 11;
const MAGNITUDE_FONT_SIZE = 10;

/**
 * Vector 렌더러. 본체 라인 + 화살촉 삼각형.
 * label 있으면 시작점에서 40% 지점에 배치. showMagnitude 는 중점에 |delta| 표시.
 */
export const renderVector: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Vector;
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const to: Vec2 = [p.from[0] + p.delta[0], p.from[1] + p.delta[1]];
  const [sx0, sy0] = rc.toScreen(p.from);
  const [sx1, sy1] = rc.toScreen(to);
  const dx = sx1 - sx0;
  const dy = sy1 - sy0;
  const len = Math.hypot(dx, dy);
  if (len < MIN_LENGTH) {
    finalizeBaseMeta(rc, p);
    return;
  }
  const color = primitiveColor(rc, p, { role: 'accent', emphasis: 'medium' });
  const ux = dx / len;
  const uy = dy / len;

  const wanted = typeof p.headSize === 'number' ? p.headSize * rc.scale : DEFAULT_HEAD;
  const head = Math.min(wanted, len * HEAD_MAX_RATIO);

  c.strokeStyle = color;
  c.fillStyle = color;
  // 기존 굵기(2px)를 유지한다. strokeWidth.regular 는 1 이라 모든 벡터가 가늘어진다.
  c.lineWidth = rc.theme.strokeWidth.thick;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(sx0, sy0);
  // 화살촉 공간 남기기
  c.lineTo(sx1 - ux * head * 0.4, sy1 - uy * head * 0.4);
  c.stroke();

  // 화살촉
  c.beginPath();
  c.moveTo(sx1, sy1);
  c.lineTo(sx1 - ux * head - uy * head * 0.5, sy1 - uy * head + ux * head * 0.5);
  c.lineTo(sx1 - ux * head + uy * head * 0.5, sy1 - uy * head - ux * head * 0.5);
  c.closePath();
  c.fill();

  if (p.label) {
    c.font = `600 ${LABEL_FONT_SIZE}px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = color;
    c.textAlign = 'left';
    const lx = sx0 + ux * len * 0.4 + 6;
    const ly = sy0 + uy * len * 0.4 - 4;
    c.fillText(rc.i18n.resolve(p.label), lx, ly);
  }

  if (p.showMagnitude) {
    const mag = Math.hypot(p.delta[0], p.delta[1]);
    c.font = `${MAGNITUDE_FONT_SIZE}px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = rc.theme.muted;
    c.fillText(mag.toFixed(1), (sx0 + sx1) / 2 + 6, (sy0 + sy1) / 2 + 4);
  }

  finalizeBaseMeta(rc, p);
};
