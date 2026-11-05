// 게임 전체에서 쓰는 타입. 카드 데이터의 오타는 여기서 잡힌다.
import type { ArtId } from './data/arts';

export type Stat = '체' | '기' | '신' | '오' | '심';
export type Stats = Record<Stat, number>;
export type ActionId = '수련' | '협행' | '의뢰' | '탐색' | '교류' | '요양' | '강호행' | '은거';
export type Region = '화산' | '사천' | '아미산';
export type Faction = '화산파' | '아미파' | '사천당가' | '무소속';
export type DestinyName = '멸문지화' | '사부의 원수' | '빚진 목숨' | '누명';
export type BoneName = '절맥' | '구음절맥' | '약골' | '범골' | '강골' | '기재의 몸' | '천골';
export type SpecialBody = '화령지체' | '금강체' | '백독불침' | '영매체' | '청음체';
export type LooksName = '흉측함' | '볼품없음' | '평범' | '준수함' | '수려함' | '경국지색';
export type DeathCause = '구음절맥' | '천수' | '분화' | '구출' | '결투' | '전쟁' | '부상';
export type Style = '공격' | '수비' | '변칙';
export type Move = '공' | '수' | '변';
export type Grade = 'success' | 'partial' | 'fail';
export type WoundLevel = 0 | 1 | 2 | 3;

export type BondRole =
  | '멸문원수' | '사부원수' | '진범' | '숙적'
  | '사부' | '사형' | '지기' | '정보상' | '제자'
  | '은인' | '은혜입은자';
export type BondKind = '恩' | '怨' | '緣';
/** 'enemy' = 살아 있고 청산되지 않은 첫 번째 원수 */
export type BondTarget = BondRole | 'enemy';

type OneOrMany<T> = T | T[];
/** 숫자 하나는 "이상", [최소, 최대]는 범위 (null = 제한 없음) */
export type Range = number | [number | null, number | null];

// ─────────── 조건 (카드 when, 선택지 requires, 엔딩 when)
export interface Cond {
  region?: OneOrMany<Region>;
  faction?: OneOrMany<Faction>;
  age?: Range;
  realm?: Range;
  fame?: Range;
  infamy?: Range;
  wealth?: Range;
  flags?: string[];
  anyFlags?: string[];
  notFlags?: string[];
  destiny?: OneOrMany<DestinyName>;
  bone?: OneOrMany<BoneName | SpecialBody>;
  boneTier?: number;
  looks?: OneOrMany<LooksName>;
  stat?: Partial<Stats>;
  bond?: OneOrMany<BondRole>;
  notBond?: OneOrMany<BondRole>;
  enemy?: boolean;
  enemyGap?: { role: BondRole; max: number };
  wounded?: boolean;
  origin?: OneOrMany<string>;
  // 엔딩 판정 전용
  dead?: boolean;
  retired?: boolean;
  deathCause?: OneOrMany<DeathCause>;
  unresolvedEnemy?: boolean;
}

// ─────────── 결과
export interface BondSpec {
  role: BondRole;
  kind?: BondKind;
  name?: string;
  known?: boolean;
  unknownLabel?: string;
  note?: string;
  realm?: number;
  realmRel?: number;
  stat?: number;
  style?: Style;
  alive?: boolean;
}

export type FoeSpec =
  | BondTarget
  | { title?: string; realm?: number; realmRel?: number; stat?: number; style?: Style | 'random' };

export interface DuelSpec {
  foe: FoeSpec;
  intro?: string;
  win?: Outcome;
  lose?: Outcome;
}

export interface Outcome {
  text?: string;
  fame?: number;
  infamy?: number;
  wealth?: number;
  xp?: number;
  insight?: number;
  stat?: Partial<Stats>;
  heal?: number;
  wound?: 1 | 2 | 3;
  woundCause?: DeathCause;
  internal?: boolean;
  flags?: string[];
  unflags?: string[];
  art?: ArtId;
  addBond?: BondSpec;
  revealBond?: BondTarget;
  resolveBond?: BondTarget;
  killBond?: BondTarget;
  markDead?: BondRole;
  tournament?: boolean;
  schedule?: { card: string; seasons: number };
  region?: Region;
  death?: DeathCause;
  next?: string;
  duel?: DuelSpec;
}

// ─────────── 카드
export interface Check {
  stat: Stat;
  mod?: number;
  /** 상대의 경지. 주인공 경지와의 차이가 보정으로 붙는다 */
  foe?: number;
  /** 외모(첫인상) 보정을 더한다 */
  looks?: boolean;
}

export interface Choice {
  label: string;
  requires?: Cond;
  hideLocked?: boolean;
  check?: Check;
  success?: Outcome;
  partial?: Outcome;
  fail?: Outcome;
  outcome?: Outcome;
}

export type CardType = 'action' | 'region' | 'faction' | 'destiny' | 'bond' | 'world' | 'generic';

export interface Card {
  id: string;
  type: CardType;
  actions?: ActionId[];
  when?: Cond;
  weight?: number;
  once?: boolean;
  cooldown?: number;
  /** next·schedule로만 이어지는 카드 */
  only?: boolean;
  title: string;
  text: string;
  choices: Choice[];
}

export interface Ending {
  id: string;
  category: string;
  title: string;
  when: Cond;
  /** 구체성 점수 보정 (음수면 다른 엔딩에 양보) */
  bonus?: number;
  text: string;
}

// ─────────── 게임 상태
export interface Bond {
  id: number;
  role: BondRole;
  kind: BondKind;
  name: string;
  known: boolean;
  unknownLabel: string;
  note: string;
  realm: number;
  stat: number;
  style: Style;
  alive: boolean;
  resolved: boolean;
  since: number;
}

export interface HeroArt {
  id: ArtId;
  stage: number;
  prog: number;
}

export interface Hero {
  name: string;
  age: number;
  origin: string;
  entry: string;
  faction: Faction;
  bone: { name: BoneName; tier: number; special: SpecialBody | null };
  talent: { name: string; field: string };
  looks: { name: LooksName; social: number; trait: string };
  virtue: string;
  flaw: string;
  destinies: DestinyName[];
  stats: Stats;
  qiCap: number | null;
  xp: number;
  xpBonus: number;
  realm: number;
  insight: number;
  arts: HeroArt[];
  wound: WoundLevel;
  woundCause: DeathCause | null;
  woundTurn?: number;
  internal: boolean;
  fame: number;
  infamy: number;
  wealth: number;
  alias: string | null;
}

export interface Roll {
  dice: [number, number];
  mod: number;
  total: number;
  grade: Grade;
  stat: Stat;
}

export interface DuelRound {
  move: Move;
  em: Move;
  edge: number;
  hp: number;
  ep: number;
  result: 'win' | 'lose' | 'draw';
}

export interface Foe {
  name: string;
  realm: number;
  stat: number;
  style: Style;
}

export interface DuelState {
  foe: Foe;
  rounds: DuelRound[];
  wins: number;
  losses: number;
  win: Outcome;
  lose: Outcome;
  styleKnown: boolean;
  intro: string;
}

export interface ResultView {
  title: string;
  choice?: string;
  text: string;
  roll: Roll | null;
  effects: string[];
  duel?: { rounds: DuelRound[]; won: boolean; foe: Foe };
}

export interface Current {
  cardId: string | null;
  result?: ResultView;
  next?: string | null;
  duel?: DuelSpec | null;
}

export interface LogEntry {
  age: number;
  season: string;
  text: string;
}

export interface LifeEnd {
  dead?: boolean;
  retired?: boolean;
  cause?: DeathCause;
  age: number;
}

export type LifePhase = 'childhood' | 'action' | 'card' | 'result' | 'duel' | 'ending';

export interface LifeState {
  version: 2;
  phase: LifePhase;
  birth: Birth;
  hero: Hero;
  flags: string[];
  region: Region;
  bonds: Bond[];
  nextBondId: number;
  turn: number;
  seen: Record<string, number>;
  scheduled: { card: string; due: number }[];
  log: LogEntry[];
  season: { action: ActionId; worldDone: boolean; baseEffects: string[] } | null;
  current: Current | null;
  duel: DuelState | null;
  notice: string[];
  pendingDeath: DeathCause | null;
  end: LifeEnd | null;
  ending: Ending | null;
  childhood: string[];
}

// ─────────── 탄생
export interface Birth {
  factionPick: Exclude<Faction, '무소속'>;
  rerollUsed: BirthKey | null;
  origin: { roll: number; row: OriginRow };
  entry: { roll: number; row: EntryRow };
  bone: { roll: number; row: BoneRow; special: SpecialBody | null };
  talent: { roll: number; row: TalentRow; field: FieldRow };
  looks: { roll: number; row: LooksRow; trait: string };
  temper: { virtue: string; flaw: string };
  destiny: { roll: number; row: DestinyRow; list: DestinyName[] };
}
export type BirthKey = 'origin' | 'entry' | 'bone' | 'talent' | 'looks' | 'temper' | 'destiny';

export interface BirthState {
  version: 2;
  phase: 'birth';
  birth: Birth;
  pendingName?: string | null;
}

export type GameState = BirthState | LifeState;

// ─────────── 생성표 행
export interface RangeRow {
  lo: number;
  hi: number;
}
export interface OriginRow extends RangeRow {
  name: string;
  desc: string;
  stats?: Partial<Stats>;
  wealth?: number;
  xp?: number;
  infamy?: number;
  art?: ArtId;
  flags?: string[];
  house?: boolean;
  forceDestiny?: DestinyName;
  bond?: BondSpec;
}
export interface EntryRow {
  n: number;
  name: string;
  joins: boolean;
  art?: ArtId;
  hermit?: boolean;
  infamy?: number;
  flags?: string[];
}
export interface BoneRow extends RangeRow {
  name: BoneName;
  tier: number;
  desc: string;
  stats?: Partial<Stats>;
  qiCap?: number;
  xpBonus?: number;
}
export interface TalentRow extends RangeRow {
  name: string;
  stat: number;
  desc: string;
  xpBonus?: number;
}
export interface FieldRow {
  n: number;
  name: string;
  stat: Stat;
  art: ArtId;
}
export interface LooksRow extends RangeRow {
  name: LooksName;
  social: number;
}
export interface DestinyRow {
  n: number;
  name: string;
  desc: string;
}
