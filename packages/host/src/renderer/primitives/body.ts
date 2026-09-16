import type { Body, PrimitiveRenderer } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor, setAlpha } from '../common';

/** `point` 의 반지름(화면 px). 크기 선언을 따르지 않는 자리라 여기 둔다. */
const POINT_RADIUS = 3;
/** 이름표를 물체 아래로 내리는 간격(화면 px). */
const LABEL_GAP = 14;
/** 후광이 퍼지는 반지름 배수와 그 알파. */
const GLOW = { inner: 0.3, outer: 3, alpha: 0.35 } as const;

/**
 * Body 렌더러. circle / point / rect / rod / custom.
 *
 * 채움과 둘레는 모양마다 따로 정하지 않는다 — `fill`·`outline` 을 위에서 한 번
 * 풀어 다섯 분기가 같은 값을 본다. 모양에 따라 규칙이 달라지면 저작자는 어느
 * 모양에서 무엇이 되는지를 외워야 한다.
 *
 * circle 의 둘레 번짐은 `glow` 가 정한다. 생략하면 `emphasis: 'strong'` 일 때 켜진다.
 */
export const renderBody: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Body;
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const [sx, sy] = rc.toScreen(p.pos);
  const color = primitiveColor(rc, p, { role: 'primary', emphasis: 'strong' });
  const size = typeof p.size === 'number' ? p.size : 0.2;
  const radius = Math.max(2, size * rc.scale);

  const filled = (p.fill ?? 'solid') === 'solid';
  // `'background'` 는 바탕색으로 긋는 것이지 "안 긋는다" 가 아니다 — 겹쳐 놓인
  // 물체가 제 경계를 바탕으로 도려내 읽히게 한다.
  //
  // **기본값은 모양마다 다르다.** `point` 와 `custom` 은 원래 채움만 했다 — 작은 점에
  // 테두리가 붙으면 채운 점이 고리로 읽히고, 자유 경로는 저작자가 그린 모양 그대로
  // 나가야 한다. 둘을 `'line'` 으로 맞추면 이미 나와 있는 조각의 그림이 조용히
  // 바뀐다(타입도 통과하고 예외도 안 난다). 테두리가 필요하면 선언이 고른다.
  const outlineDefault = p.shape === 'point' || p.shape === 'custom' ? 'none' : 'line';
  const outline = p.outline ?? outlineDefault;
  const strokeColor =
    outline === 'line'
      ? rc.theme.line
      : outline === 'background'
        ? rc.theme.background
        : outline === 'role'
          ? color
          : null;

  if (p.shape === 'point') {
    if (filled) {
      c.fillStyle = color;
      c.beginPath();
      c.arc(sx, sy, POINT_RADIUS, 0, Math.PI * 2);
      c.fill();
    }
    if (strokeColor) {
      c.strokeStyle = strokeColor;
      c.lineWidth = rc.theme.strokeWidth.thin;
      c.beginPath();
      c.arc(sx, sy, POINT_RADIUS, 0, Math.PI * 2);
      c.stroke();
    }
  } else if (p.shape === 'custom') {
    // 외형은 pos 기준 월드 단위, y 위. 화면으로는 배율을 곱하고 y 를 뒤집는다.
    // Path2D 는 매 프레임 새로 만든다 — 모듈에 캐시하면 인스턴스끼리 섞인다 (C5).
    if (p.customPath) {
      c.save();
      c.translate(sx, sy);
      if (p.orientation) c.rotate(-p.orientation);
      c.scale(rc.scale, -rc.scale);
      const path = new Path2D(p.customPath);
      if (filled) {
        c.fillStyle = color;
        c.fill(path);
      }
      if (strokeColor) {
        c.strokeStyle = strokeColor;
        // 변환이 걸린 채 긋기 때문에 굵기에도 배율이 곱해진다. 나눠 두지 않으면
        // 카메라를 당길수록 테두리만 두꺼워져 테마의 굵기가 뜻을 잃는다.
        c.lineWidth = rc.theme.strokeWidth.thin / rc.scale;
        c.stroke(path);
      }
      c.restore();
    }
  } else if (p.shape === 'rect' || p.shape === 'rod') {
    const w =
      Array.isArray(p.size) ? p.size[0]! * rc.scale : radius * 2;
    const h =
      Array.isArray(p.size) ? p.size[1]! * rc.scale : radius;
    c.save();
    c.translate(sx, sy);
    if (p.orientation) c.rotate(-p.orientation);
    if (filled) {
      c.fillStyle = color;
      c.fillRect(-w / 2, -h / 2, w, h);
    }
    if (strokeColor) {
      c.strokeStyle = strokeColor;
      c.lineWidth = rc.theme.strokeWidth.thin;
      c.strokeRect(-w / 2, -h / 2, w, h);
    }
    c.restore();
  } else {
    // circle / disc / default
    // 후광은 채움이 번져 나간 것이다. 속이 빈 물체에 얹으면 없는 채움의 그림자가
    // 생겨 "비었다" 는 주장이 지워진다.
    if (filled && (p.glow ?? (p.style?.emphasis ?? 'strong') === 'strong')) {
      const glow = c.createRadialGradient(
        sx,
        sy,
        radius * GLOW.inner,
        sx,
        sy,
        radius * GLOW.outer,
      );
      glow.addColorStop(0, color);
      glow.addColorStop(1, 'transparent');
      c.save();
      setAlpha(c, GLOW.alpha);
      c.fillStyle = glow;
      c.beginPath();
      c.arc(sx, sy, radius * GLOW.outer, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    c.beginPath();
    c.arc(sx, sy, radius, 0, Math.PI * 2);
    if (filled) {
      c.fillStyle = color;
      c.fill();
    }
    if (strokeColor) {
      c.strokeStyle = strokeColor;
      c.lineWidth = rc.theme.strokeWidth.thin;
      c.stroke();
    }
  }

  if (p.label) {
    c.font = `${rc.theme.fontSize.regular}px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = rc.theme.muted;
    c.textAlign = 'center';
    c.fillText(rc.i18n.resolve(p.label), sx, sy + radius + LABEL_GAP);
  }

  finalizeBaseMeta(rc, p);
};
