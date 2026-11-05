import { describe, expect, it } from 'vitest';
import { validateCards, simulate } from '../src/sim/simulate';
import { CARD_LIST } from '../src/data/cards';

describe('콘텐츠', () => {
  it('카드 연결 오류가 없다 (없는 다음 카드, 얻을 수 없는 플래그 등)', () => {
    expect(validateCards()).toEqual([]);
  });

  it('카드 id가 중복되지 않는다', () => {
    const ids = CARD_LIST.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('무작위 주인공 300명이 오류 없이 생을 마친다', () => {
    const s = simulate(300, 2024);
    expect(s.errors).toEqual([]);
    expect(s.missingVars).toEqual([]);
    expect(s.lives).toBe(300);
  });

  it('밸런스 지표가 목표 범위 안에 있다', () => {
    const s = simulate(500, 99);
    const median = (v: number[]): number => [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)];

    // 엔딩이 한쪽으로 쏠리지 않는다
    const top = Math.max(...Object.values(s.endings));
    expect(top / s.lives).toBeLessThan(0.25);
    expect(Object.keys(s.endings).length).toBeGreaterThanOrEqual(14);

    // 소년기에도 할 만하고, 나이가 들수록 판정이 쉬워진다
    const rate = (label: string): number => s.checks[label].success / s.checks[label].n;
    expect(rate('13–15세')).toBeGreaterThan(0.25);
    expect(rate('30–44세')).toBeGreaterThan(rate('13–15세') + 0.08);

    // 협명은 무한히 불어나지 않는다 (중앙값 기준)
    expect(median(s.snapshots[45].fame)).toBeLessThan(35);
    expect(median(s.finalFame)).toBeGreaterThan(8);

    // 별호는 대개 청년기에 얻는다
    expect(median(s.aliasAges)).toBeGreaterThanOrEqual(17);
    expect(median(s.aliasAges)).toBeLessThanOrEqual(28);
  });
});
