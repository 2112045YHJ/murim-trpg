import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setSeed, clearSeed, checkOdds } from '../src/engine/rng';
import { fixJosa } from '../src/engine/josa';
import { rollBirth, rerollBirth, buildHero } from '../src/engine/generate';
import {
  newGame, acceptBirth, startJianghu, applyOutcome, evaluateEnding, continueResult, maturityBonus, ALIAS_FAME,
  eligibleCards,
} from '../src/engine/game';
import { checkCond } from '../src/engine/conditions';
import type { LifeState } from '../src/types';

beforeEach(() => setSeed(42));
afterEach(() => clearSeed());

function freshLife(): LifeState {
  const b = newGame();
  const s = acceptBirth(b, '테스트');
  startJianghu(s);
  return s;
}

describe('판정 확률', () => {
  it('보정 0이면 성공(10+) 1/6, 부분 성공 이상(7+) 7/12', () => {
    const o = checkOdds(0);
    expect(o.success).toBeCloseTo(6 / 36);
    expect(o.success + o.partial).toBeCloseTo(21 / 36);
  });
  it('세 등급의 합은 1', () => {
    for (let k = -5; k <= 8; k++) {
      const o = checkOdds(k);
      expect(o.success + o.partial + o.fail).toBeCloseTo(1);
    }
  });
});

describe('조사', () => {
  it('받침에 맞춰 조사를 고른다', () => {
    expect(fixJosa('거구이(가) 보인다')).toBe('거구가 보인다');
    expect(fixJosa('백발이(가) 보인다')).toBe('백발이 보인다');
    expect(fixJosa('사형과(와) 함께')).toBe('사형과 함께');
    expect(fixJosa('사부과(와) 함께')).toBe('사부와 함께');
    expect(fixJosa('화산(으)로 간다')).toBe('화산으로 간다');
    expect(fixJosa('사천(으)로 간다')).toBe('사천으로 간다');
    expect(fixJosa('아미산(으)로')).toBe('아미산으로');
    expect(fixJosa('서울(으)로')).toBe('서울로');
  });
});

describe('캐릭터 생성', () => {
  it('운명 거스르기는 한 번만 된다', () => {
    const b = rollBirth();
    expect(rerollBirth(b, 'looks')).toBe(true);
    expect(rerollBirth(b, 'bone')).toBe(false);
  });

  it('능력치는 -2 ~ +3 안에 있다', () => {
    for (let i = 0; i < 500; i++) {
      const { hero } = buildHero(rollBirth(), 'x');
      for (const v of Object.values(hero.stats)) {
        expect(v).toBeGreaterThanOrEqual(-2);
        expect(v).toBeLessThanOrEqual(3);
      }
      if (hero.bone.name === '절맥') expect(hero.stats.기).toBeLessThanOrEqual(1);
    }
  });

  it('숙명에 따라 원수가 은원록에 들어간다', () => {
    for (let i = 0; i < 200; i++) {
      const s = acceptBirth(newGame(), 'x');
      if (s.hero.destinies.includes('멸문지화')) {
        const enemy = s.bonds.find((b) => b.role === '멸문원수');
        expect(enemy).toBeDefined();
        expect(enemy!.known).toBe(false);
      }
    }
  });
});

describe('결과 적용', () => {
  it('부상은 겹치면 한 단계 악화된다', () => {
    const s = freshLife();
    applyOutcome(s, { wound: 1 });
    expect(s.hero.wound).toBe(1);
    applyOutcome(s, { wound: 1 });
    expect(s.hero.wound).toBe(2);
    applyOutcome(s, { wound: 2 });
    expect(s.hero.wound).toBe(3);
  });

  it('절정 이상은 깨달음 없이 오를 수 없다', () => {
    const s = freshLife();
    s.hero.insight = 0;
    applyOutcome(s, { xp: 200 });
    expect(s.hero.realm).toBe(2);
    expect(s.flags).toContain('벽_3');
    applyOutcome(s, { insight: 1 });
    expect(s.hero.realm).toBe(3);
  });

  it('협명이 쌓이면 별호가 붙는다', () => {
    const s = freshLife();
    expect(s.hero.alias).toBeNull();
    applyOutcome(s, { fame: ALIAS_FAME - 1 });
    expect(s.hero.alias).toBeNull();
    applyOutcome(s, { fame: 1 });
    expect(s.hero.alias).toMatch(/\(.+\)$/);
  });

  it('협명은 해마다 조금씩 잊히고, 악명은 더 오래 남는다', () => {
    const s = freshLife();
    s.hero.fame = 30;
    s.hero.infamy = 30;
    s.hero.alias = '테스트';
    for (let season = 0; season < 4; season++) {
      s.phase = 'result';
      s.season = { action: '요양', worldDone: true, baseEffects: [] };
      s.current = { cardId: null };
      continueResult(s);
    }
    expect(s.hero.fame).toBeLessThan(30);
    expect(s.hero.infamy).toBeLessThan(30);
    expect(s.hero.infamy).toBeGreaterThan(s.hero.fame);
  });

  it('경지가 오르면 싸움이 아닌 판정에도 연륜 보정이 붙는다', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(maturityBonus)).toEqual([0, 0, 1, 1, 2, 2, 3]);
  });
});

describe('카드 뽑기', () => {
  it('세상 카드도 나이 조건과 재등장 간격을 지킨다', () => {
    const s = freshLife();
    expect(eligibleCards(s, '__world__').map((c) => c.id)).not.toContain('world_tournament'); // 13세
    s.hero.age = 20;
    expect(eligibleCards(s, '__world__').map((c) => c.id)).toContain('world_tournament');
    s.seen.world_tournament = s.turn;
    expect(eligibleCards(s, '__world__').map((c) => c.id)).not.toContain('world_tournament');
  });

  it('세상 카드는 계절 행동으로는 뽑히지 않는다', () => {
    const s = freshLife();
    s.hero.age = 20;
    expect(eligibleCards(s, '협행').some((c) => c.type === 'world')).toBe(false);
  });
});

describe('조건과 엔딩', () => {
  it('범위 조건', () => {
    const s = freshLife();
    expect(checkCond(s, { age: [13, 13] }).ok).toBe(true);
    expect(checkCond(s, { age: [14, null] }).ok).toBe(false);
    expect(checkCond(s, { wealth: 999 }).ok).toBe(false);
  });

  it('가장 구체적인 엔딩을 고른다', () => {
    const s = freshLife();
    s.hero.faction = '화산파';
    s.end = { dead: true, cause: '분화', age: 30 };
    for (const b of s.bonds) b.resolved = true;
    expect(evaluateEnding(s).id).toBe('ending_hwasan_stone');
  });

  it('아무 조건도 맞지 않으면 기본 엔딩', () => {
    const s = freshLife();
    s.end = { dead: true, cause: '부상', age: 30 };
    for (const b of s.bonds) b.resolved = true;
    s.hero.bone = { name: '범골', tier: 2, special: null };
    expect(evaluateEnding(s).id).toBe('ending_default');
  });
});
