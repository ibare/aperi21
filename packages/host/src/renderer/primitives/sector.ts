import type { PrimitiveRenderer, Sector } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor, setAlpha } from '../common';

/** 채움 기본 불투명도 — 아래에 깔린 바퀴살·눈금이 비쳐 보이는 정도. */
const DEFAULT_FILL_OPACITY = 0.22;
/**
 * 이보다 좁으면 아무것도 그리지 않는다(라디안).
 *
 * 부채꼴은 주기마다 폭 0 에서 다시 벌어지는 쓰임이 기본이다. 폭이 0 일 때도
 * 호를 그으면 둥근 마구리 때문에 테두리에 점이 하나 남아, 벌어지지 않은 순간에도
 * 무언가 있는 것처럼 보인다.
 */
const MIN_SWEEP = 0.004;

/**
 * 두 각 사이를 쓸고 지나간 부채꼴.
 *
 * 채움과 테두리 위의 호를 **한 덩어리로** 그린다. 나뉘어 있으면 조각이 매번 둘의
 * 색·알파·각을 따로 맞춰야 하고, 어긋나는 순간 "이만큼 쓸었다" 가 아니라 "여기 호가
 * 하나 있다" 로 읽힌다.
 *
 * 눈금을 붙이지 않는 것이 `scale`(dial)과의 차이다 — 눈금이 붙으면 각도자로 읽혀
 * "같은 시간에 도는 각이 커진다" 가 "눈금이 원래 그렇게 생겼다" 로 뒤집힌다.
 */
export const renderSector: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Sector;
  const sweep = p.to - p.from;
  if (!(Math.abs(sweep) >= MIN_SWEEP)) return;
  const radiusPx = p.radius * rc.scale;
  if (!(radiusPx > 0)) return;

  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const color = primitiveColor(rc, p, { role: 'accent', emphasis: 'strong' });
  const [cx, cy] = rc.toScreen(p.center);

  // 선언한 각은 월드 기준(x 축에서 반시계)이고 화면은 y 가 뒤집혀 있다. 부호만
  // 뒤집고 끝내면 반시계가 시계가 되어 반대쪽을 쓸게 되므로, 각을 음수로 옮기는
  // 동시에 캔버스가 도는 방향도 함께 뒤집는다. `to` 가 `from` 보다 작으면 그
  // 방향으로 쓸고 가는 것이 선언의 뜻이라 플래그도 따라 뒤집힌다.
  const a0 = -p.from;
  const a1 = -p.to;
  const counterclockwise = sweep > 0;

  // 채움 — 중심에서 반지름까지. 반투명이라 아래에 깔린 것이 비쳐 보인다.
  c.beginPath();
  c.moveTo(cx, cy);
  c.arc(cx, cy, radiusPx, a0, a1, counterclockwise);
  c.closePath();
  setAlpha(c, p.fillOpacity ?? DEFAULT_FILL_OPACITY);
  c.fillStyle = color;
  c.fill();
  setAlpha(c, 1);

  // 테두리 위의 호 — 채움만 있으면 넓어질수록 가장자리가 흐려 어디까지 쓸었는지
  // 집기 어렵다. 굵기는 위계라 배율을 따라가지 않는 화면 px 다.
  const rimWidth = p.rimWidth ?? rc.theme.strokeWidth.thick;
  if (rimWidth > 0) {
    c.beginPath();
    c.arc(cx, cy, radiusPx, a0, a1, counterclockwise);
    c.strokeStyle = color;
    c.lineWidth = rimWidth;
    c.lineCap = 'round';
    c.stroke();
  }

  finalizeBaseMeta(rc, p);
};
