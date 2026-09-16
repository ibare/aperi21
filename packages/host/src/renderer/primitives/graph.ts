import type { Graph, RenderContext, PrimitiveRenderer } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, setAlpha } from '../common';
import { resolveText } from '../kit/text';

/**
 * 계열을 한 축에 놓아 견주는 그림 — `bar`(값을 나란히) 와 `line`(값이 자라는 자취).
 *
 * 둘 다 **화면 우상단 HUD 카드**에 놓는다. 자리를 style 마다 달리 두면 저작자가
 * `style` 만 바꿨는데 그림이 이사한다 — 같은 어휘는 같은 자리에 같은 모양으로
 * 나타나야 저작자가 style 을 *표현 방식의 선택*으로 쓸 수 있다 (원칙 4).
 * 달라지는 것은 카드 크기뿐이다. `bar` 는 계열마다 한 줄이면 되지만 `line` 은
 * 두 축과 눈금 수, 그리고 곡선의 모양 자체가 주장이라 더 넓은 자리를 요구한다.
 *
 * 에너지 막대처럼 값 하나를 견주는 그림은 `gauge` 를 쓴다. 이 어휘는 여러 계열을
 * 한 축에 놓아야 할 때를 위한 것이다.
 */

/** HUD 카드 고유의 치수 — 이 어휘만 쓰는 값이라 named 상수로 둔다 (C2 「그 어휘 고유의 치수」). */
const CARD = {
  margin: 24,
  pad: 12,
  /** 값 하나짜리 막대가 계열 수만큼 쌓이는 자리. */
  bar: { w: 220, h: 160 },
  /**
   * 선 그래프는 축 둘과 눈금 수를 함께 담아야 해서 더 넓다. 다만 임베드는
   * 마운트 뒤 높이가 바뀌지 않고(원칙 6) 기본 캔버스가 작을 수 있으므로,
   * 고정값을 그대로 쓰지 않고 뷰포트 비율로 눌러 무대를 잡아먹지 않게 한다.
   */
  line: { w: 300, h: 200, wRatio: 0.46, hRatio: 0.58, minW: 170, minH: 120 },
} as const;

/** 막대 줄의 치수 — 이 어휘 고유. */
const BAR = {
  topGap: 8,
  bottomGap: 14,
  labelColumn: 70,
  rowGap: 6,
  rowMax: 18,
  refOver: 4,
  refUnder: 2,
} as const;

/** 선 그래프 판의 치수 — 이 어휘 고유. */
const LINE = {
  /** 격자·눈금을 나누는 칸 수. */
  divisions: 4,
  /** 눈금 수와 판 사이 틈. */
  tickGap: 4,
  /** 축 이름과 눈금 수 사이 틈. */
  labelGap: 2,
  /** 지금 자리를 알리는 머리 점의 반지름. */
  head: 2.5,
  /** 범례 견본선의 길이와 항목 사이 틈. */
  swatch: 12,
  legendGap: 8,
  /** 데이터에서 범위를 낼 때 위아래로 두는 여유(비율) — 곡선이 테두리에 붙지 않게. */
  headroom: 0.08,
} as const;

/** 눈금 수의 자릿수. 범위가 넓을수록 소수점은 읽는 데 방해가 된다. */
function tickDigits(span: number): number {
  const s = Math.abs(span);
  if (s >= 100) return 0;
  if (s >= 10) return 1;
  if (s >= 1) return 2;
  return 3;
}

/**
 * 축의 범위 — 선언이 있으면 그것이 이긴다. 없으면 데이터에서 낸다.
 *
 * 선언한 범위를 데이터에 맞춰 넓히지 않는다. 범위를 쓴 저작자는 *그 창으로 보라*
 * 고 말한 것이고, 프레임마다 축이 늘어나면 값의 변화가 축의 변화에 가려진다.
 */
function axisDomain(
  values: readonly number[],
  declared: readonly [number, number] | undefined,
): [number, number] {
  if (declared) {
    const [lo, hi] = declared;
    if (Number.isFinite(lo) && Number.isFinite(hi) && hi !== lo) {
      return lo < hi ? [lo, hi] : [hi, lo];
    }
  }
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return [0, 1];
  let lo = Math.min(...finite);
  let hi = Math.max(...finite);
  if (lo === hi) {
    // 상수 계열 — 폭이 0 이면 선이 판 밖으로 나가거나 0 으로 나눈다.
    const half = Math.abs(lo) * 0.5 || 1;
    lo -= half;
    hi += half;
  } else {
    const room = (hi - lo) * LINE.headroom;
    lo -= room;
    hi += room;
  }
  return [lo, hi];
}

/** 칸 경계의 값들. 양 끝을 포함하므로 divisions + 1 개다. */
function tickValues(lo: number, hi: number): number[] {
  return Array.from({ length: LINE.divisions + 1 }, (_, i) => lo + ((hi - lo) * i) / LINE.divisions);
}

/** 선 그래프 — 계열의 `{x, y}` 를 이어 그린다. */
function renderLine(rc: RenderContext, p: Graph): void {
  const c = rc.ctx;
  const font = rc.theme.fontSize.small;

  const w = Math.max(CARD.line.minW, Math.min(CARD.line.w, rc.viewport.width * CARD.line.wRatio));
  const h = Math.max(CARD.line.minH, Math.min(CARD.line.h, rc.viewport.height * CARD.line.hRatio));
  const x = rc.viewport.width - w - CARD.margin;
  const y = CARD.margin;

  // 배경 카드 — bar 와 같은 모양이라야 한 어휘로 읽힌다.
  c.fillStyle = rc.theme.background;
  setAlpha(c, 0.8);
  c.fillRect(x, y, w, h);
  setAlpha(c, 1);
  c.strokeStyle = rc.theme.line;
  c.lineWidth = rc.theme.strokeWidth.thin;
  c.strokeRect(x, y, w, h);

  // 범위 — 기준선의 값도 세로 범위 안에 들어와야 "도달했는가" 를 볼 수 있다.
  const xs = p.series.flatMap((s) => s.data.map((d) => d.x));
  const ys = p.series.flatMap((s) => s.data.map((d) => d.y));
  if (p.reference) ys.push(p.reference.value);
  const [x0, x1] = axisDomain(xs, p.xAxis?.range);
  const [y0, y1] = axisDomain(ys, p.yAxis?.range);
  const xTicks = tickValues(x0, x1);
  const yTicks = tickValues(y0, y1);
  const xDigits = tickDigits(x1 - x0);
  const yDigits = tickDigits(y1 - y0);
  const yTickText = yTicks.map((v) => v.toFixed(yDigits));

  // 판의 자리 — 눈금 수가 차지할 만큼만 비켜 준다. 글자 폭은 재서 쓴다.
  const yTickW = Math.max(...yTickText.map((t) => rc.measure.textWidth(t, font)));
  const yAxisLabel = resolveText(rc, p.yAxis?.label);
  const xAxisLabel = resolveText(rc, p.xAxis?.label);
  const legendH = p.series.some((s) => s.label) ? font + LINE.legendGap : 0;
  const left = x + CARD.pad + (yAxisLabel ? font + LINE.labelGap : 0) + yTickW + LINE.tickGap;
  const right = x + w - CARD.pad;
  const top = y + CARD.pad + legendH;
  const bottom = y + h - CARD.pad - font - LINE.tickGap - (xAxisLabel ? font + LINE.labelGap : 0);
  const plotW = Math.max(1, right - left);
  const plotH = Math.max(1, bottom - top);
  const px = (v: number): number => left + ((v - x0) / (x1 - x0)) * plotW;
  const py = (v: number): number => bottom - ((v - y0) / (y1 - y0)) * plotH;

  // 격자 — 기본은 꺼짐. 크롬은 기본이 전부 꺼짐이다 (원칙 2).
  if (p.showGrid) {
    c.strokeStyle = rc.theme.grid;
    c.lineWidth = rc.theme.strokeWidth.hair;
    c.beginPath();
    for (const v of xTicks) {
      c.moveTo(px(v), top);
      c.lineTo(px(v), bottom);
    }
    for (const v of yTicks) {
      c.moveTo(left, py(v));
      c.lineTo(right, py(v));
    }
    c.stroke();
  }

  // 두 축
  c.strokeStyle = rc.theme.line;
  c.lineWidth = rc.theme.strokeWidth.thin;
  c.beginPath();
  c.moveTo(left, top);
  c.lineTo(left, bottom);
  c.lineTo(right, bottom);
  c.stroke();

  // 계열 — 선언한 범위가 데이터보다 좁을 수 있으므로 판 밖으로 새지 않게 자른다.
  c.save();
  c.beginPath();
  c.rect(left, top, plotW, plotH);
  c.clip();
  c.lineJoin = 'round';
  c.lineCap = 'round';
  c.lineWidth = rc.theme.strokeWidth.regular;
  for (const s of p.series) {
    if (s.data.length === 0) continue;
    const color = rc.theme.resolveColor(s.colorRole ?? 'primary', 'strong');
    c.strokeStyle = color;
    c.beginPath();
    // 데이터 순서를 정렬하지 않는다 — 되돌아오는 자취(x 가 줄었다 늘어나는 궤적)도
    // 이 어휘가 그려야 하는 그림이고, 정렬하면 그 왕복이 사라진다.
    s.data.forEach((d, i) => {
      if (i === 0) c.moveTo(px(d.x), py(d.y));
      else c.lineTo(px(d.x), py(d.y));
    });
    c.stroke();
    // 마지막 점 — 자라는 값에서 "지금" 이 어디인지.
    const last = s.data[s.data.length - 1]!;
    c.fillStyle = color;
    c.beginPath();
    c.arc(px(last.x), py(last.y), LINE.head, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();

  // 기준선 — bar 에서는 값 축을 가로지르는 세로선, line 에서는 같은 뜻의 가로선이다.
  if (p.reference) {
    const ry = py(p.reference.value);
    if (ry >= top && ry <= bottom) {
      c.strokeStyle = rc.theme.resolveColor('accent', 'strong');
      c.lineWidth = rc.theme.strokeWidth.thin;
      c.setLineDash([4, 3]);
      c.beginPath();
      c.moveTo(left, ry);
      c.lineTo(right, ry);
      c.stroke();
      c.setLineDash([]);
      const refLabel = resolveText(rc, p.reference.label);
      if (refLabel) {
        c.font = `${font}px ${rc.theme.fontFamily}`;
        c.fillStyle = rc.theme.resolveColor('accent', 'strong');
        c.textAlign = 'right';
        c.textBaseline = 'bottom';
        c.fillText(refLabel, right - LINE.labelGap, ry - LINE.labelGap);
      }
    }
  }

  // 눈금 수 — 값이라 번역 대상이 아니다 (C1 판정, `scale.ts` 선례).
  c.font = `${font}px ${rc.theme.fontFamilyMono}`;
  c.fillStyle = rc.theme.muted;
  c.textAlign = 'right';
  c.textBaseline = 'middle';
  yTicks.forEach((v, i) => {
    // 가운데 칸은 건너뛴다 — 좁은 카드에서 다섯 줄을 다 쓰면 수끼리 붙어 못 읽는다.
    if (i % 2 !== 0) return;
    c.fillText(yTickText[i]!, left - LINE.tickGap, py(v));
  });
  c.textAlign = 'center';
  c.textBaseline = 'top';
  xTicks.forEach((v, i) => {
    if (i % 2 !== 0) return;
    c.fillText(v.toFixed(xDigits), px(v), bottom + LINE.tickGap);
  });

  // 축 이름
  if (xAxisLabel) {
    c.font = `${font}px ${rc.theme.fontFamily}`;
    c.fillStyle = rc.theme.muted;
    c.textAlign = 'center';
    c.textBaseline = 'bottom';
    c.fillText(xAxisLabel, (left + right) / 2, y + h - CARD.pad + LINE.labelGap);
  }
  if (yAxisLabel) {
    // 세로 축 이름은 축을 따라 눕힌다 — 가로로 두면 눈금 수 자리를 먹는다.
    c.save();
    c.translate(x + CARD.pad, (top + bottom) / 2);
    c.rotate(-Math.PI / 2);
    c.font = `${font}px ${rc.theme.fontFamily}`;
    c.fillStyle = rc.theme.muted;
    c.textAlign = 'center';
    c.textBaseline = 'top';
    c.fillText(yAxisLabel, 0, 0);
    c.restore();
  }

  // 범례 — 곡선에 붙일 자리가 없으므로 색으로 잇는다. 한 줄만 쓰고, 넘치면 거기서
  // 멈춘다. 줄을 늘리면 카드가 자라고 마운트 뒤 높이가 흔들린다 (원칙 6).
  if (legendH > 0) {
    c.font = `${font}px ${rc.theme.fontFamily}`;
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    const ly = y + CARD.pad + font / 2;
    let lx = left;
    for (const s of p.series) {
      const text = resolveText(rc, s.label);
      if (!text) continue;
      const entryW = LINE.swatch + LINE.labelGap + rc.measure.textWidth(text, font) + LINE.legendGap;
      if (lx + entryW > right) break;
      const color = rc.theme.resolveColor(s.colorRole ?? 'primary', 'strong');
      c.strokeStyle = color;
      c.lineWidth = rc.theme.strokeWidth.regular;
      c.beginPath();
      c.moveTo(lx, ly);
      c.lineTo(lx + LINE.swatch, ly);
      c.stroke();
      c.fillStyle = rc.theme.muted;
      c.fillText(text, lx + LINE.swatch + LINE.labelGap, ly);
      lx += entryW;
    }
  }
}

/** 막대 — 계열마다 한 줄. 값은 `data[0].x` 이고 세로는 계열 구분이다. */
function renderBar(rc: RenderContext, p: Graph): void {
  const c = rc.ctx;

  // HUD 우상단 고정 영역. 폭 220 × 높이 160.
  const w = CARD.bar.w;
  const h = CARD.bar.h;
  const x = rc.viewport.width - w - CARD.margin;
  const y = CARD.margin;

  // 배경 카드
  c.fillStyle = rc.theme.background;
  setAlpha(c, 0.8);
  c.fillRect(x, y, w, h);
  setAlpha(c, 1);
  c.strokeStyle = rc.theme.line;
  c.lineWidth = rc.theme.strokeWidth.thin;
  c.strokeRect(x, y, w, h);

  const pad = CARD.pad;
  const barsTop = y + pad + BAR.topGap;
  const barsBottom = y + h - pad - BAR.bottomGap;
  const count = p.series.length || 1;
  const barH = Math.min(BAR.rowMax, (barsBottom - barsTop) / count - BAR.rowGap);

  // 값 축의 상한. `xAxis.range` 를 쓴 저작자는 *그 눈금으로 견주라* 고 말한 것이라
  // 데이터가 넘쳐도 늘리지 않는다. 안 썼으면 지금까지처럼 데이터에서 낸다.
  // (세로는 계열 구분이라 `yAxis.range` 는 이 style 에서 뜻이 없다 — line 이 읽는다.)
  const declaredMax = p.xAxis?.range?.[1];
  const maxVal =
    declaredMax !== undefined && Number.isFinite(declaredMax) && declaredMax > 0
      ? declaredMax
      : Math.max(
          ...p.series.map((s) => Math.max(...s.data.map((d) => d.x))),
          p.reference?.value ?? 0,
          1,
        );
  const trackX = x + pad + BAR.labelColumn;
  const trackW = x + w - pad - trackX;

  // 격자 — 기본 꺼짐. 켜면 값 축을 칸으로 나눠 막대 길이를 눈으로 잴 수 있다.
  if (p.showGrid) {
    c.strokeStyle = rc.theme.grid;
    c.lineWidth = rc.theme.strokeWidth.hair;
    c.beginPath();
    for (let i = 0; i <= LINE.divisions; i += 1) {
      const gx = trackX + (trackW * i) / LINE.divisions;
      c.moveTo(gx, barsTop - BAR.refOver);
      c.lineTo(gx, barsBottom + BAR.refUnder);
    }
    c.stroke();
  }

  // series 렌더
  p.series.forEach((s, i) => {
    const by = barsTop + i * (barH + BAR.rowGap);
    // 라벨
    c.font = `${rc.theme.fontSize.small}px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = rc.theme.muted;
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    if (s.label) c.fillText(resolveText(rc, s.label), x + pad, by + barH / 2);
    // track
    c.fillStyle = rc.theme.resolveColor('muted', 'subtle');
    c.fillRect(trackX, by, trackW, barH);
    // fill
    const val = s.data[0]?.x ?? 0;
    const pct = Math.max(0, Math.min(1, val / maxVal));
    const role = s.colorRole ?? 'primary';
    c.fillStyle = rc.theme.resolveColor(role, 'strong');
    c.fillRect(trackX, by, trackW * pct, barH);
    // value
    c.fillStyle = rc.theme.foreground;
    c.textAlign = 'right';
    c.fillText(val.toFixed(1), x + w - pad, by + barH / 2);
  });

  // reference line
  if (p.reference) {
    const refPct = Math.max(0, Math.min(1, p.reference.value / maxVal));
    const rx = trackX + trackW * refPct;
    c.strokeStyle = rc.theme.resolveColor('accent', 'strong');
    c.setLineDash([4, 3]);
    c.beginPath();
    c.moveTo(rx, barsTop - BAR.refOver);
    c.lineTo(rx, barsBottom + BAR.refUnder);
    c.stroke();
    c.setLineDash([]);
  }

  // xAxis 라벨
  if (p.xAxis?.label) {
    c.font = `${rc.theme.fontSize.small}px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = rc.theme.muted;
    c.textAlign = 'center';
    c.fillText(resolveText(rc, p.xAxis.label), x + w / 2, y + h - pad + 4);
  }
}

export const renderGraph: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Graph;
  applyBaseMeta(rc, p);
  if (p.style === 'line') renderLine(rc, p);
  else renderBar(rc, p);
  finalizeBaseMeta(rc, p);
};
