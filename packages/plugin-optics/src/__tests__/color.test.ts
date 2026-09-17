/**
 * 빛의 색 — 파장 · 스펙트럼 → 선형광 RGB (「빛 색」 트랙, 장부 G33 · G60 · G61).
 */
import { describe, expect, it } from 'vitest';
import { spectrumToLinearRgb, wavelengthToLinearRgb } from '../index';

describe('spectrumToLinearRgb', () => {
  it('모든 파장이 1 인 스펙트럼은 흰빛 [1, 1, 1]', () => {
    const [r, g, b] = spectrumToLinearRgb(() => 1);
    expect(r).toBeCloseTo(1, 6);
    expect(g).toBeCloseTo(1, 6);
    expect(b).toBeCloseTo(1, 6);
  });

  it('빛이 없으면 검정, 절반이면 성분이 절반', () => {
    expect(spectrumToLinearRgb(() => 0)).toEqual([0, 0, 0]);
    const [r] = spectrumToLinearRgb(() => 0.5);
    expect(r).toBeCloseTo(0.5, 6);
  });

  it('긴 파장만 돌아오면 붉고, 짧은 파장만 돌아오면 푸르다', () => {
    const red = spectrumToLinearRgb((nm) => (nm > 600 ? 1 : 0));
    expect(red[0]).toBeGreaterThan(red[2]);
    const blue = spectrumToLinearRgb((nm) => (nm < 480 ? 1 : 0));
    expect(blue[2]).toBeGreaterThan(blue[0]);
  });
});

describe('wavelengthToLinearRgb', () => {
  it('파장 순서대로 파랑 → 초록 → 빨강이 가장 크다', () => {
    const top = (nm: number): number => {
      const v = wavelengthToLinearRgb(nm);
      return v.indexOf(Math.max(...v));
    };
    expect(top(450)).toBe(2);
    expect(top(530)).toBe(1);
    expect(top(650)).toBe(0);
  });

  it('가시광 밖은 검정', () => {
    expect(wavelengthToLinearRgb(300)).toEqual([0, 0, 0]);
    expect(wavelengthToLinearRgb(900)).toEqual([0, 0, 0]);
  });
});
