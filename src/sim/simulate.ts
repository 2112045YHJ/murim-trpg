// 개발 도구: 카드 검사 + 무작위 주인공 N명 자동 플레이 (12-4). 화면 없이 Node에서 돈다.
import { setSeed, clearSeed, pick, random } from '../engine/rng';
import {
  newGame, acceptBirth, startJianghu, availableActions, chooseAction, cardView, chooseOption,
  continueResult, duelMove, missingVars,
} from '../engine/game';
import { suggestName } from '../engine/generate';
import { CARDS, CARD_LIST } from '../data/cards';
import { ENDINGS, DEFAULT_ENDING } from '../data/endings';
import { REALMS, REGIONS } from '../data/tables';
import type { ActionId, Cond, LifeState, Move, Outcome } from '../types';

/** 게임 시작 시 생성표에서 주어지는 플래그 (카드 결과가 아니어도 존재할 수 있다) */
const BIRTH_FLAGS = ['누명', '출생의비밀', '황족핏줄', '사마입교', '비급독학', '비무우승', '비무입상'];

// ───────── 정적 검사: 타입으로 못 잡는 연결 오류
export function validateCards(): string[] {
  const errors: string[] = [];
  const flagsSet = new Set<string>(BIRTH_FLAGS);
  const flagsUsed = new Map<string, string>();
  const reachable = new Set<string>();

  const useFlags = (w: Cond | undefined, where: string): void => {
    if (!w) return;
    for (const f of [...(w.flags ?? []), ...(w.anyFlags ?? []), ...(w.notFlags ?? [])]) flagsUsed.set(f, where);
  };
  const checkOutcome = (o: Outcome | undefined, where: string): void => {
    if (!o) return;
    if (o.next) {
      reachable.add(o.next);
      if (!CARDS[o.next]) errors.push(`${where}: 없는 다음 카드 '${o.next}'`);
    }
    if (o.schedule) {
      reachable.add(o.schedule.card);
      if (!CARDS[o.schedule.card]) errors.push(`${where}: 없는 예약 카드 '${o.schedule.card}'`);
    }
    o.flags?.forEach((f) => flagsSet.add(f));
    if (o.duel) {
      checkOutcome(o.duel.win, `${where}.duel.win`);
      checkOutcome(o.duel.lose, `${where}.duel.lose`);
    }
  };

  for (const c of CARD_LIST) {
    if (!c.choices.length) errors.push(`${c.id}: 선택지 없음`);
    useFlags(c.when, `${c.id}.when`);
    c.choices.forEach((ch, i) => {
      const where = `${c.id}[${i}]`;
      useFlags(ch.requires, `${where}.requires`);
      if (ch.check && !ch.success) errors.push(`${where}: 판정이 있는데 success 없음`);
      if (!ch.check && !ch.outcome) errors.push(`${where}: outcome 없음`);
      if (ch.check && ch.outcome) errors.push(`${where}: 판정과 outcome을 함께 씀 (outcome은 무시된다)`);
      for (const o of [ch.outcome, ch.success, ch.partial, ch.fail]) checkOutcome(o, where);
    });
    if (c.choices.every((ch) => ch.requires)) errors.push(`${c.id}: 모든 선택지에 조건이 있어 막힐 수 있음`);
  }
  for (const c of CARD_LIST) if (c.only && !reachable.has(c.id)) errors.push(`${c.id}: only 카드인데 이어지는 곳이 없음`);
  for (const e of ENDINGS) useFlags(e.when, `${e.id}.when`);
  for (const [f, where] of flagsUsed) {
    if (!flagsSet.has(f) && !/^벽_\d$/.test(f)) errors.push(`${where}: 어디서도 얻을 수 없는 플래그 '${f}'`);
  }
  return errors;
}

// ───────── 자동 플레이
const ACTION_WEIGHTS: Record<ActionId, number> = { 수련: 4, 협행: 2, 의뢰: 1.5, 탐색: 2, 교류: 1.5, 요양: 0.3, 강호행: 1, 은거: 0 };
const MOVES: Move[] = ['공', '수', '변'];

function chooseActionPolicy(state: LifeState): ActionId {
  const h = state.hero;
  // 실제 플레이어처럼 가끔은 부상을 무시하고 무리한다
  if ((h.wound >= 2 && random() < 0.7) || (h.wound === 1 && random() < 0.3)) return '요양';
  if (h.age >= 55 && random() < 0.15) return '은거';
  const acts = availableActions(state).filter((a) => !a.locked);
  const total = acts.reduce((s, a) => s + ACTION_WEIGHTS[a.id], 0);
  let r = random() * total;
  for (const a of acts) {
    r -= ACTION_WEIGHTS[a.id];
    if (r < 0) return a.id;
  }
  return '수련';
}

export interface SimStats {
  lives: number;
  errors: string[];
  stuck: number;
  endings: Record<string, number>;
  ages: number[];
  realms: Record<string, number>;
  factions: Record<string, number>;
  causes: Record<string, number>;
  cardHits: Record<string, number>;
  seasons: number;
  quiet: number;
  aliases: number;
  missingVars: string[];
  /** 나이대별 판정 결과 (밸런스 지표) */
  checks: Record<string, { n: number; success: number; partial: number }>;
  /** 특정 나이에 기록한 협명·악명·경지 */
  snapshots: Record<number, { fame: number[]; infamy: number[]; realm: number[] }>;
  finalFame: number[];
  finalInfamy: number[];
  aliasAges: number[];
}

export const AGE_BRACKETS: [string, number, number][] = [
  ['13–15세', 13, 15], ['16–19세', 16, 19], ['20–29세', 20, 29], ['30–44세', 30, 44], ['45세 이상', 45, 200],
];
export const SNAPSHOT_AGES = [20, 30, 45];
const bracketOf = (age: number): string => AGE_BRACKETS.find(([, lo, hi]) => age >= lo && age <= hi)![0];

const bump = (obj: Record<string, number>, key: string): void => {
  obj[key] = (obj[key] ?? 0) + 1;
};

/** 함수 호출이 상태를 바꾸므로 switch 안의 좁혀진 타입을 다시 넓혀 읽는다 */
const phaseOf = (s: LifeState): LifeState['phase'] => s.phase;

/** 한 생을 끝까지 자동으로 진행한다 */
export function playLife(stats?: SimStats): LifeState {
  const birth = newGame();
  const state = acceptBirth(birth, suggestName(birth.birth));
  startJianghu(state);
  let steps = 0;
  const snapped = new Set<number>();
  let hadAlias = false;
  while (state.phase !== 'ending') {
    if (stats) {
      const h = state.hero;
      for (const age of SNAPSHOT_AGES) {
        if (h.age >= age && !snapped.has(age)) {
          snapped.add(age);
          const snap = (stats.snapshots[age] ??= { fame: [], infamy: [], realm: [] });
          snap.fame.push(h.fame);
          snap.infamy.push(h.infamy);
          snap.realm.push(h.realm);
        }
      }
      if (!hadAlias && h.alias) {
        hadAlias = true;
        stats.aliasAges.push(h.age);
      }
    }
    if (++steps > 20000) throw new Error('2만 걸음이 지나도 생이 끝나지 않음');
    switch (state.phase) {
      case 'action': {
        const act = chooseActionPolicy(state);
        if (stats) stats.seasons++;
        chooseAction(state, act, act === '강호행' ? pick(REGIONS.filter((r) => r !== state.region)) : undefined);
        if (stats && phaseOf(state) === 'card') bump(stats.cardHits, state.current!.cardId!);
        else if (stats && phaseOf(state) === 'result') stats.quiet++;
        break;
      }
      case 'card': {
        const v = cardView(state);
        const open = v.choices.filter((c) => !c.locked);
        if (!open.length) throw new Error(`선택지가 모두 잠긴 카드: ${v.id}`);
        chooseOption(state, pick(open).index);
        const roll = state.current?.result?.roll;
        if (stats && roll) {
          const c = (stats.checks[bracketOf(state.hero.age)] ??= { n: 0, success: 0, partial: 0 });
          c.n++;
          if (roll.grade === 'success') c.success++;
          if (roll.grade === 'partial') c.partial++;
        }
        break;
      }
      case 'result':
        continueResult(state);
        if (stats && phaseOf(state) === 'card') bump(stats.cardHits, state.current!.cardId!);
        break;
      case 'duel':
        duelMove(state, pick(MOVES));
        break;
      default:
        throw new Error(`알 수 없는 단계: ${state.phase}`);
    }
  }
  return state;
}

export function simulate(n: number, seed = 12345): SimStats {
  setSeed(seed);
  missingVars.length = 0;
  const stats: SimStats = {
    lives: 0, errors: [], stuck: 0, endings: {}, ages: [], realms: {}, factions: {}, causes: {},
    cardHits: Object.fromEntries(CARD_LIST.map((c) => [c.id, 0])), seasons: 0, quiet: 0, aliases: 0, missingVars: [],
    checks: {}, snapshots: {}, finalFame: [], finalInfamy: [], aliasAges: [],
  };
  try {
    for (let i = 0; i < n; i++) {
      try {
        const state = playLife(stats);
        stats.lives++;
        bump(stats.endings, state.ending!.id);
        stats.ages.push(state.hero.age);
        bump(stats.realms, REALMS[state.hero.realm]);
        bump(stats.factions, state.hero.faction);
        bump(stats.causes, state.end!.retired ? '은거' : state.end!.cause ?? '?');
        if (state.hero.alias) stats.aliases++;
        stats.finalFame.push(state.hero.fame);
        stats.finalInfamy.push(state.hero.infamy);
      } catch (err) {
        const e = err as Error;
        if (e.message.startsWith('2만 걸음')) stats.stuck++;
        stats.errors.push(`#${i}: ${e.message}\n${e.stack?.split('\n').slice(1, 3).join('\n') ?? ''}`);
      }
    }
  } finally {
    clearSeed();
  }
  stats.missingVars = [...new Set(missingVars)];
  return stats;
}

export const endingTitle = (id: string): string => [...ENDINGS, DEFAULT_ENDING].find((e) => e.id === id)?.title ?? id;
export const ALL_ENDING_IDS = [...ENDINGS, DEFAULT_ENDING].map((e) => e.id);
