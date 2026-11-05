// 게임 진행: 계절 턴, 카드 엔진, 판정, 결투, 죽음과 엔딩
import { roll2d6, pick, random, weightedPick, checkOdds } from './rng';
import { rollBirth, buildHero } from './generate';
import { addBond, findBond, anyBond, bondName, randomName, ROLE_LABEL } from './bonds';
import { checkCond } from './conditions';
import { fixJosa } from './josa';
import { REALMS, REALM_XP, REALM_INSIGHT, REGIONS } from '../data/tables';
import { ARTS, ART_STAGES } from '../data/arts';
import { LOOK_REACTION, LOOK_CHILDHOOD, ORIGIN_TEXT, BONE_TEXT, DESTINY_TEXT, entryText } from '../data/fragments';
import { CARDS } from '../data/cards';
import { ENDINGS, DEFAULT_ENDING } from '../data/endings';
import type {
  ActionId, BirthState, BondRole, BondTarget, Card, CardType, Check, DeathCause, DuelSpec, Ending,
  Faction, Foe, Grade, LifeEnd, LifeState, Move, Outcome, Region, Roll, Style, WoundLevel,
} from '../types';

export const SEASONS = ['봄', '여름', '가을', '겨울'] as const;
export const WOUNDS = ['없음', '경상', '중상', '치명상'] as const;
export const GRADE_LABEL: Record<Grade, string> = { success: '성공', partial: '부분 성공', fail: '실패' };

export const ACTIONS: { id: ActionId; desc: string }[] = [
  { id: '수련', desc: '무공을 닦고 경지의 벽을 두드린다' },
  { id: '협행', desc: '근처에서 벌어진 일에 끼어든다' },
  { id: '의뢰', desc: '표행 호위, 현상금 사냥으로 재물을 번다' },
  { id: '탐색', desc: '원수의 행방, 비급, 기연을 찾아 나선다' },
  { id: '교류', desc: '사부·사형제·지기와 시간을 보낸다' },
  { id: '요양', desc: '부상과 내상을 다스린다' },
  { id: '강호행', desc: '다른 지역으로 떠난다' },
  { id: '은거', desc: '강호를 떠나 남은 생을 조용히 보낸다' },
];

const DEFAULT_ACTIONS: Record<CardType, ActionId[]> = {
  region: ['협행', '탐색', '의뢰', '강호행'],
  faction: ['수련', '교류', '협행', '의뢰'],
  destiny: ['탐색', '협행', '강호행', '교류', '의뢰'],
  bond: ['협행', '탐색', '의뢰', '교류', '강호행'],
  generic: ['수련', '협행', '의뢰', '탐색', '교류', '요양', '강호행'],
  action: [],
  world: [],
};
const TYPE_WEIGHT: Record<CardType, number> = { destiny: 4, bond: 2.5, region: 2, faction: 2, action: 1.5, generic: 0.4, world: 1 };
export const RETIRE_AGE = 45;

type DrawAction = ActionId | '__world__';

// ───────────────────────── 생성 단계

export function newGame(): BirthState {
  return { version: 2, phase: 'birth', birth: rollBirth() };
}

export function acceptBirth(birthState: BirthState, name: string): LifeState {
  const { hero, flags, bondSpecs, region } = buildHero(birthState.birth, name);
  const state: LifeState = {
    version: 2,
    phase: 'childhood',
    birth: birthState.birth,
    hero, flags, region,
    bonds: [], nextBondId: 1,
    turn: 0, seen: {}, scheduled: [], log: [],
    season: null, current: null, duel: null, notice: [],
    pendingDeath: null, end: null, ending: null,
    childhood: [],
  };
  for (const spec of bondSpecs) addBond(state, spec, 0, hero.age);
  state.childhood = childhoodSummary(state);
  return state;
}

function childhoodSummary(state: LifeState): string[] {
  const h = state.hero;
  const parts = [
    ORIGIN_TEXT[h.origin],
    BONE_TEXT[h.bone.name],
    LOOK_CHILDHOOD[h.looks.name],
    `${h.looks.trait}이(가) 당신을 알아보는 표식이 되었다.`,
    ...h.destinies.map((dn) => DESTINY_TEXT[dn]),
  ];
  if (!h.destinies.length) parts.push(DESTINY_TEXT['평온한 시작']);
  parts.push(entryText(h));
  return parts.filter(Boolean).map(fixJosa);
}

export function startJianghu(state: LifeState): void {
  log(state, `열세 살, ${state.region}에서 강호에 첫발을 딛다.`);
  state.phase = 'action';
}

// ───────────────────────── 시간과 기록

export const seasonName = (state: LifeState): string => SEASONS[state.turn % 4];

function log(state: LifeState, text: string): void {
  state.log.push({ age: state.hero.age, season: seasonName(state), text: fixJosa(text) });
}

// ───────────────────────── 계절 행동

export function availableActions(state: LifeState): { id: ActionId; desc: string; locked: string | null }[] {
  const h = state.hero;
  return ACTIONS.map((a) => ({ ...a, locked: a.id === '은거' && h.age < RETIRE_AGE ? `${RETIRE_AGE}세 이상` : null }));
}

export function chooseAction(state: LifeState, actionId: ActionId, targetRegion?: Region): void {
  const h = state.hero;
  if (actionId === '은거') {
    if (h.age < RETIRE_AGE) return;
    log(state, '검을 내려놓고 강호를 떠나다.');
    return finishLife(state, { retired: true, age: h.age });
  }
  const effects: string[] = [];
  state.season = { action: actionId, worldDone: false, baseEffects: effects };
  state.notice = [];

  if (actionId === '수련') {
    gainXp(state, 1 + (findBond(state, '사부') ? 1 : 0), effects);
  } else if (actionId === '요양') {
    const amount = h.wealth >= 1 ? 2 : 1;
    if (h.wealth >= 1) {
      h.wealth -= 1;
      effects.push('약값 재물 -1');
    }
    const healed = Math.max(0, h.wound - amount) as WoundLevel;
    if (h.wound > 0) effects.push(`부상 회복 (${WOUNDS[h.wound]} → ${WOUNDS[healed]})`);
    h.wound = healed;
    if (h.internal) effects.push('내상이 가라앉았다');
    h.internal = false;
  } else if (actionId === '의뢰') {
    h.wealth += 1;
    effects.push('재물 +1');
  } else if (actionId === '강호행') {
    const dest = targetRegion && targetRegion !== state.region ? targetRegion : pick(REGIONS.filter((r) => r !== state.region));
    state.region = dest;
    effects.push(`${dest}(으)로 떠났다`);
    log(state, `${dest}(으)로 떠나다.`);
  }

  const card = drawCard(state, actionId);
  if (card) startCard(state, card.id);
  else {
    state.current = {
      cardId: null,
      result: { title: seasonName(state), text: '별일 없이 한 계절이 흘러갔다.', roll: null, effects },
    };
    state.phase = 'result';
  }
}

// ───────────────────────── 카드 뽑기 (8-3)

function cardEligible(state: LifeState, card: Card, action: DrawAction): boolean {
  if (card.only) return false;
  // 세상 카드는 겨울의 세상 뽑기에서만, 나머지는 계절 행동에서만 나온다 (조건·재등장 간격은 똑같이 검사)
  if ((card.type === 'world') !== (action === '__world__')) return false;
  if (action !== '__world__') {
    const acts = card.actions ?? DEFAULT_ACTIONS[card.type];
    if (!acts.includes(action)) return false;
  }
  const last = state.seen[card.id];
  if (last != null) {
    if (card.once) return false;
    if (state.turn - last < (card.cooldown ?? 6)) return false;
  }
  return checkCond(state, card.when).ok;
}

export function eligibleCards(state: LifeState, action: DrawAction): Card[] {
  return Object.values(CARDS).filter((c) => cardEligible(state, c, action));
}

function drawCard(state: LifeState, action: DrawAction): Card | null {
  if (action !== '__world__') {
    const dueIdx = state.scheduled.findIndex((s) => s.due <= state.turn);
    if (dueIdx >= 0) {
      const [due] = state.scheduled.splice(dueIdx, 1);
      if (CARDS[due.card]) return CARDS[due.card];
    }
  }
  const pool = eligibleCards(state, action);
  return weightedPick(pool, (c) => (c.weight ?? 10) * TYPE_WEIGHT[c.type]);
}

function startCard(state: LifeState, id: string): void {
  if (!CARDS[id]) throw new Error(`없는 카드: ${id}`);
  state.seen[id] = state.turn;
  state.current = { cardId: id };
  state.phase = 'card';
}

// ───────────────────────── 문장 변수 (8-4)

/** 채우지 못한 변수 이름 (시뮬레이터가 확인) */
export const missingVars: string[] = [];

function textVars(state: LifeState): Record<string, string> {
  const h = state.hero;
  const v: Record<string, string> = {
    이름: h.name,
    문파: h.faction === '무소속' ? '문파 없는 몸' : h.faction,
    지역: state.region,
    주무공: ARTS[h.arts[0].id].name,
    외모_반응: LOOK_REACTION[h.looks.name],
    외모_특징: h.looks.trait,
    별호: h.alias ?? h.name,
    원수: bondName(findBond(state, 'enemy')),
  };
  for (const role of Object.keys(ROLE_LABEL) as BondRole[]) {
    const b = anyBond(state, role);
    if (b) v[role] = bondName(b);
  }
  return v;
}

export function render(state: LifeState, text: string | undefined): string {
  if (!text) return '';
  const v = textVars(state);
  const filled = text
    .replace(/\{([^}]+)\}/g, (_, key: string) => {
      if (v[key] != null) return v[key];
      missingVars.push(key);
      return '누군가';
    })
    .replace(/\s{2,}/g, ' ')
    .trim();
  return fixJosa(filled);
}

// ───────────────────────── 판정

/** 일류 +1, 초절정 +2, 현경 +3 */
export const maturityBonus = (realm: number): number => Math.floor(realm / 2);

function checkMod(state: LifeState, check: Check): number {
  const h = state.hero;
  let k = h.stats[check.stat] + (check.mod ?? 0);
  if (h.wound >= 2) k -= 1;
  if (h.internal && check.stat === '기') k -= 1;
  // 싸움은 상대와의 경지 차이로, 싸움이 아닌 일은 쌓인 경지(연륜)로 보정한다
  if (check.foe != null) k += Math.max(-3, Math.min(3, h.realm - check.foe));
  else k += maturityBonus(h.realm);
  if (check.looks) k += h.looks.social;
  return k;
}

export interface ChoiceView {
  index: number;
  label: string;
  locked: boolean;
  reason?: string;
  odds: { stat: string; mod: number; success: number; atLeastPartial: number } | null;
}

export interface CardView {
  id: string;
  type: CardType;
  title: string;
  text: string;
  choices: ChoiceView[];
}

function currentCard(state: LifeState): Card {
  const id = state.current?.cardId;
  if (!id || !CARDS[id]) throw new Error('진행 중인 카드가 없다');
  return CARDS[id];
}

export function cardView(state: LifeState): CardView {
  const card = currentCard(state);
  const choices = card.choices
    .map((ch, index) => {
      const req = checkCond(state, ch.requires);
      let odds: ChoiceView['odds'] = null;
      if (ch.check) {
        const k = checkMod(state, ch.check);
        const o = checkOdds(k);
        odds = { stat: ch.check.stat, mod: k, success: o.success, atLeastPartial: o.success + o.partial };
      }
      return { index, label: render(state, ch.label), locked: !req.ok, reason: req.reason, odds, hidden: !req.ok && !!ch.hideLocked };
    })
    .filter((c) => !c.hidden)
    .map(({ hidden: _hidden, ...c }) => c);
  return { id: card.id, type: card.type, title: card.title, text: render(state, card.text), choices };
}

function partialOf(success: Outcome): Outcome {
  return {
    ...success,
    wound: Math.max(success.wound ?? 0, 1) as 1 | 2 | 3,
    text: `${success.text ?? ''} 다만 대가가 없지는 않았다.`,
  };
}

export function chooseOption(state: LifeState, index: number): void {
  const card = currentCard(state);
  const ch = card.choices[index];
  if (!ch || !checkCond(state, ch.requires).ok) return;

  let outcome: Outcome;
  let roll: Roll | null = null;
  if (ch.check) {
    const k = checkMod(state, ch.check);
    const r = roll2d6();
    const total = r.total + k;
    const grade: Grade = total >= 10 ? 'success' : total >= 7 ? 'partial' : 'fail';
    const success = ch.success ?? {};
    outcome =
      grade === 'success' ? success
        : grade === 'partial' ? ch.partial ?? partialOf(success)
          : ch.fail ?? { text: '뜻대로 되지 않았다.' };
    roll = { dice: r.dice, mod: k, total, grade, stat: ch.check.stat };
  } else {
    outcome = ch.outcome ?? {};
  }

  const label = render(state, ch.label);
  log(state, `「${card.title}」 ${label}${roll ? ` (${GRADE_LABEL[roll.grade]})` : ''}`);
  const effects = [...(state.season?.baseEffects ?? [])];
  if (state.season) state.season.baseEffects = [];
  const res = applyOutcome(state, outcome, effects);
  state.current = {
    cardId: card.id,
    result: { title: card.title, choice: label, text: render(state, outcome.text), roll, effects },
    next: res.next,
    duel: res.duel,
  };
  state.phase = 'result';
}

// ───────────────────────── 결과 적용

function gainXp(state: LifeState, n: number, effects: string[]): void {
  const h = state.hero;
  if (n <= 0) return;
  n += h.xpBonus;
  h.xp += n;
  effects.push(`수련 +${n}`);
  const main = h.arts[0];
  main.prog += n;
  while (main.prog >= 6 && main.stage < 3) {
    main.prog -= 6;
    main.stage += 1;
    effects.push(`${ARTS[main.id].name} ${ART_STAGES[main.stage]}`);
    log(state, `${ARTS[main.id].name}이(가) ${ART_STAGES[main.stage]}에 이르다.`);
  }
  checkRealm(state, effects);
}

function checkRealm(state: LifeState, effects: string[]): void {
  const h = state.hero;
  while (h.realm < 6 && h.xp >= REALM_XP[h.realm + 1]) {
    const target = h.realm + 1;
    if (h.insight < REALM_INSIGHT[target]) {
      const wallFlag = `벽_${target}`;
      if (!state.flags.includes(wallFlag)) {
        state.flags.push(wallFlag);
        effects.push(`${REALMS[target]}의 벽에 막혔다 (깨달음이 필요하다)`);
      }
      return;
    }
    h.realm = target;
    effects.push(`경지 상승: ${REALMS[target]}`);
    log(state, `경지가 ${REALMS[target]}에 이르다.`);
  }
}

function bondByRole(state: LifeState, role: BondTarget) {
  return findBond(state, role);
}

export function applyOutcome(state: LifeState, o: Outcome, effects: string[] = []): { next: string | null; duel: DuelSpec | null } {
  const h = state.hero;
  const signed = (n: number): string => (n > 0 ? `+${n}` : `${n}`);

  if (o.fame) {
    h.fame = Math.max(0, h.fame + o.fame);
    effects.push(`협명 ${signed(o.fame)}`);
  }
  if (o.infamy) {
    h.infamy = Math.max(0, h.infamy + o.infamy);
    effects.push(`악명 ${signed(o.infamy)}`);
  }
  if (o.wealth) {
    h.wealth = Math.max(0, h.wealth + o.wealth);
    effects.push(`재물 ${signed(o.wealth)}`);
  }
  if (o.xp) gainXp(state, o.xp, effects);
  if (o.insight) {
    h.insight += o.insight;
    effects.push('깨달음을 얻었다');
    log(state, '깨달음을 얻다.');
    checkRealm(state, effects);
  }
  if (o.stat) {
    for (const [s, v] of Object.entries(o.stat) as [keyof typeof h.stats, number][]) {
      const cap = s === '기' && h.qiCap != null ? h.qiCap : 3;
      h.stats[s] = Math.max(-2, Math.min(cap, h.stats[s] + v));
      effects.push(`${s} ${signed(v)}`);
    }
  }
  if (o.heal) {
    h.wound = Math.max(0, h.wound - o.heal) as WoundLevel;
    h.internal = false;
    effects.push('상처가 아물었다');
  }
  if (o.wound) {
    const before = h.wound;
    let next = Math.max(before, o.wound) as WoundLevel;
    if (before >= o.wound && before > 0) next = Math.min(3, before + 1) as WoundLevel;
    h.wound = next;
    h.woundCause = o.woundCause ?? '부상';
    if (next === 3 && before < 3) h.woundTurn = state.turn;
    effects.push(`${WOUNDS[next]}을 입었다`);
  }
  if (o.internal) {
    h.internal = true;
    effects.push('내상을 입었다');
  }
  if (o.flags) for (const f of o.flags) if (!state.flags.includes(f)) state.flags.push(f);
  if (o.unflags) state.flags = state.flags.filter((f) => !o.unflags!.includes(f));
  if (o.art && !h.arts.some((a) => a.id === o.art)) {
    h.arts.push({ id: o.art, stage: 0, prog: 0 });
    effects.push(`새 무공: ${ARTS[o.art].name}`);
    log(state, `${ARTS[o.art].name}을(를) 얻다.`);
  }
  if (o.revealBond) {
    const b = bondByRole(state, o.revealBond);
    if (b && !b.known) {
      b.known = true;
      effects.push(`${ROLE_LABEL[b.role]}의 이름: ${b.name}`);
      log(state, `${ROLE_LABEL[b.role]}의 이름이 ${b.name}임을 알다.`);
    }
  }
  if (o.addBond) {
    const b = addBond(state, o.addBond, h.realm, h.age);
    effects.push(`은원록: ${ROLE_LABEL[b.role]} ${b.name} (${b.kind})`);
    log(state, `${b.name}과(와) 인연을 맺다. (${b.note})`);
  }
  if (o.resolveBond) {
    const b = bondByRole(state, o.resolveBond);
    if (b) {
      b.resolved = true;
      effects.push(`은원 청산: ${bondName(b)}`);
    }
  }
  if (o.killBond) {
    const b = bondByRole(state, o.killBond);
    if (b) {
      b.alive = false;
      b.resolved = true;
      effects.push(`${bondName(b)}이(가) 죽었다`);
      log(state, `${bondName(b)}이(가) 죽다.`);
    }
  }
  if (o.markDead) {
    const b = anyBond(state, o.markDead);
    if (b) b.alive = false;
  }
  if (o.tournament) {
    state.flags.push('비무입상');
    if (h.realm >= 5) state.flags.push('비무우승');
  }
  if (o.schedule) state.scheduled.push({ card: o.schedule.card, due: state.turn + o.schedule.seasons });
  if (o.region) state.region = o.region;
  if (o.death) state.pendingDeath = o.death;

  checkAlias(state, effects);
  return { next: o.next ?? null, duel: o.duel ?? null };
}

// ───────────────────────── 별호 (4-10)

const ALIAS_PREFIX: Record<string, [string, string]> = {
  '얼굴의 큰 흉터': ['흉면', '凶面'],
  백발: ['백발', '白髮'],
  '서로 다른 눈동자 색': ['쌍동', '雙瞳'],
  거구: ['철탑', '鐵塔'],
  '왜소한 체구': ['소영', '小影'],
  '몸의 기이한 반점': ['반룡', '斑龍'],
};
const ALIAS_SUFFIX: Record<Faction, [[string, string], [string, string]]> = {
  화산파: [['화검', '火劍'], ['화마', '火魔']],
  아미파: [['신기수', '神機手'], ['탄마', '彈魔']],
  사천당가: [['독수', '毒手'], ['독마', '毒魔']],
  무소속: [['협객', '俠客'], ['혈마', '血魔']],
};

function checkAlias(state: LifeState, effects: string[]): void {
  const h = state.hero;
  if (h.alias || (h.fame < ALIAS_FAME && h.infamy < ALIAS_INFAMY)) return;
  let [pk, ph] = ALIAS_PREFIX[h.looks.trait] ?? ['무명', '無名'];
  if (h.looks.name === '수려함' || h.looks.name === '경국지색') [pk, ph] = ['옥면', '玉面'];
  const evil = h.infamy / ALIAS_INFAMY > h.fame / ALIAS_FAME;
  const [sk, sh] = ALIAS_SUFFIX[h.faction][evil ? 1 : 0];
  h.alias = `${pk}${sk}(${ph}${sh})`;
  effects.push(`강호가 당신을 '${h.alias}'라 부르기 시작했다`);
  log(state, `별호 '${h.alias}'를 얻다.`);
}

// ───────────────────────── 진행

export function continueResult(state: LifeState): void {
  const cur = state.current;
  if (state.pendingDeath) return die(state, state.pendingDeath);
  if (cur?.duel) return startDuel(state, cur.duel);
  if (cur?.next) return startCard(state, cur.next);
  if (state.season && seasonName(state) === '겨울' && !state.season.worldDone) {
    state.season.worldDone = true;
    const card = drawCard(state, '__world__');
    if (card) return startCard(state, card.id);
  }
  return endSeason(state);
}

function endSeason(state: LifeState): void {
  const h = state.hero;
  const notice: string[] = [];
  const action = state.season?.action;
  if (action !== '요양') {
    if (h.wound === 1) {
      h.wound = 0;
      notice.push('경상이 나았다.');
    } else if (h.wound === 3 && (h.woundTurn ?? -1) < state.turn) {
      // 치명상을 입은 뒤 한 계절을 요양 없이 버티면 생사 판정
      const r = roll2d6().total + h.stats.체;
      if (r < 7) return die(state, h.woundCause ?? '부상');
      h.wound = 2;
      notice.push('치명상을 넘겼다. 아직 중상이다.');
    }
  }
  state.turn += 1;
  h.age = 13 + Math.floor(state.turn / 4);

  if (state.turn % 4 === 0) {
    fadeRenown(h);
    if (h.bone.name === '구음절맥' && !state.flags.includes('절맥극복') && h.age >= 20 && roll2d6().total <= 4) {
      return die(state, '구음절맥');
    }
    if (h.age >= 55) {
      const r = roll2d6().total + h.stats.체;
      if (r < 4 + Math.floor((h.age - 55) / 3)) return die(state, '천수');
    }
    if (h.age >= 85) return die(state, '천수');
    if (h.age === RETIRE_AGE) notice.push('은거를 고를 수 있는 나이가 되었다.');
  }
  state.notice = notice;
  state.season = null;
  state.current = null;
  state.phase = 'action';
}

// ───────────────────────── 명성의 풍화 (10-1)

/** 해마다 잊히는 비율. 강호는 빨리 잊고, 악명은 더 오래 남는다 */
export const FAME_FADE = 0.12;
export const INFAMY_FADE = 0.06;

function fade(value: number, rate: number): number {
  if (value < 3) return value;
  return value - Math.max(1, Math.round(value * rate));
}

function fadeRenown(h: LifeState['hero']): void {
  h.fame = fade(h.fame, FAME_FADE);
  h.infamy = fade(h.infamy, INFAMY_FADE);
}

/** 협명·악명 단계 (화면 표시·별호 기준) */
export const FAME_TIERS: [number, string][] = [[0, '무명'], [5, '고을에 알려짐'], [12, '일대의 명사'], [20, '강호의 명성'], [30, '천하의 이름']];
export const INFAMY_TIERS: [number, string][] = [[0, '깨끗함'], [3, '구설수'], [8, '악명'], [15, '무림공적']];
export const tierOf = (value: number, tiers: [number, string][]): string => [...tiers].reverse().find(([min]) => value >= min)![1];
export const ALIAS_FAME = 12;
export const ALIAS_INFAMY = 8;

// ───────────────────────── 결투: 삼합 비무 (5-3)

export const MOVES: Record<Move, string> = { 공: '攻', 수: '守', 변: '變' };
const BEATS: Record<Move, Move> = { 공: '변', 변: '수', 수: '공' };
const STYLE_ODDS: Record<Style, Record<Move, number>> = {
  공격: { 공: 0.5, 수: 0.2, 변: 0.3 },
  수비: { 공: 0.2, 수: 0.5, 변: 0.3 },
  변칙: { 공: 0.3, 수: 0.2, 변: 0.5 },
};
const STYLES = Object.keys(STYLE_ODDS) as Style[];

function startDuel(state: LifeState, spec: DuelSpec): void {
  const h = state.hero;
  let foe: Foe;
  if (typeof spec.foe === 'string') {
    const b = bondByRole(state, spec.foe);
    foe = b
      ? { name: bondName(b), realm: b.realm, stat: b.stat, style: b.style }
      : { name: '이름 모를 무인', realm: h.realm, stat: 1, style: '변칙' };
  } else {
    const f = spec.foe;
    foe = {
      name: `${f.title ?? '무인'} ${randomName()}`,
      realm: f.realm ?? Math.max(0, h.realm + (f.realmRel ?? 0)),
      stat: f.stat ?? 1,
      style: !f.style || f.style === 'random' ? pick(STYLES) : f.style,
    };
  }
  state.duel = {
    foe, rounds: [], wins: 0, losses: 0,
    win: spec.win ?? {}, lose: spec.lose ?? {},
    styleKnown: h.stats.오 >= 1,
    intro: render(state, spec.intro),
  };
  state.phase = 'duel';
}

function enemyMove(style: Style): Move {
  const odds = STYLE_ODDS[style];
  const r = random();
  if (r < odds.공) return '공';
  if (r < odds.공 + odds.수) return '수';
  return '변';
}

export function duelMove(state: LifeState, move: Move): void {
  const h = state.hero;
  const duel = state.duel;
  if (!duel) return;
  const em = enemyMove(duel.foe.style);
  const edge = BEATS[move] === em ? 2 : BEATS[em] === move ? -2 : 0;
  const hp = roll2d6().total + Math.max(h.stats.체, h.stats.신) + h.realm + edge - (h.wound >= 2 ? 1 : 0);
  const ep = roll2d6().total + duel.foe.stat + duel.foe.realm;
  const result = hp > ep ? 'win' : hp < ep ? 'lose' : 'draw';
  if (result === 'win') duel.wins += 1;
  if (result === 'lose') duel.losses += 1;
  duel.rounds.push({ move, em, edge, hp, ep, result });

  const over = duel.rounds.length >= 3 || duel.wins >= 2 || duel.losses >= 2;
  if (!over) return;

  const won = duel.wins > duel.losses;
  const outcome = won ? duel.win : duel.lose;
  log(state, `${duel.foe.name}과(와) 겨루어 ${won ? '이기다' : '지다'}.`);
  const effects: string[] = [];
  const res = applyOutcome(state, outcome, effects);
  state.current = {
    cardId: state.current?.cardId ?? null,
    result: {
      title: `삼합 비무 — ${duel.foe.name}`,
      choice: won ? '승리' : '패배',
      text: render(state, outcome.text ?? (won ? '당신의 초식이 먼저 닿았다.' : '상대의 초식이 한 수 빨랐다.')),
      roll: null,
      duel: { rounds: duel.rounds, won, foe: duel.foe },
      effects,
    },
    next: res.next,
    duel: res.duel,
  };
  state.duel = null;
  state.phase = 'result';
}

// ───────────────────────── 죽음과 엔딩 (9장)

const DEATH_TEXT: Record<DeathCause, string> = {
  구음절맥: '구음절맥의 한기가 끝내 심맥을 덮었다.',
  천수: '천수를 다했다.',
  분화: '불길 속에서 숨을 거두었다.',
  구출: '동료를 구하러 들어간 곳에서 돌아오지 못했다.',
  결투: '결투에서 입은 상처를 끝내 이기지 못했다.',
  전쟁: '전장에서 쓰러졌다.',
  부상: '상처를 이기지 못했다.',
};

function die(state: LifeState, cause: DeathCause): void {
  const h = state.hero;
  log(state, `${h.age}세, ${DEATH_TEXT[cause]}`);
  finishLife(state, { dead: true, cause, age: h.age });
}

function finishLife(state: LifeState, end: LifeEnd): void {
  state.end = end;
  state.ending = evaluateEnding(state);
  state.pendingDeath = null;
  state.phase = 'ending';
}

export function evaluateEnding(state: LifeState): Ending {
  let best: Ending | null = null;
  let bestScore = -Infinity;
  for (const e of ENDINGS) {
    if (!checkCond(state, e.when).ok) continue;
    const score = Object.keys(e.when).length + (e.bonus ?? 0);
    if (score > bestScore) {
      best = e;
      bestScore = score;
    }
  }
  return best ?? DEFAULT_ENDING;
}

export function endingView(state: LifeState): { id: string; title: string; text: string; category: string } {
  const e = state.ending ?? DEFAULT_ENDING;
  return { id: e.id, title: e.title, text: render(state, e.text), category: e.category };
}
