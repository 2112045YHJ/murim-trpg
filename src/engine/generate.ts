// 4장 랜덤 캐릭터 생성
import { d, pick, roll2d6, rollD66 } from './rng';
import {
  ORIGINS, ENTRIES, BONES, SPECIAL_BODIES, TALENTS, FIELDS, LOOKS, LOOK_TRAITS,
  VIRTUES, FLAWS, DESTINIES, MVP_FACTIONS, FACTION_HOME, REGIONS, STATS,
  SURNAMES, GIVEN, lookupRange,
} from '../data/tables';
import { FACTION_ARTS, type ArtId } from '../data/arts';
import type { Birth, BirthKey, BondSpec, DestinyName, Faction, Hero, Region, Stats } from '../types';

const rollers = {
  origin: (): Birth['origin'] => {
    const r = rollD66();
    return { roll: r.total, row: lookupRange(ORIGINS, r.total) };
  },
  entry: (): Birth['entry'] => {
    const n = d(6);
    return { roll: n, row: ENTRIES[n - 1] };
  },
  bone: (): Birth['bone'] => {
    const r = roll2d6();
    const special = [2, 3, 12].includes(r.total) ? SPECIAL_BODIES[d(6) - 1] : null;
    return { roll: r.total, row: lookupRange(BONES, r.total), special };
  },
  talent: (): Birth['talent'] => {
    const r = roll2d6();
    return { roll: r.total, row: lookupRange(TALENTS, r.total), field: FIELDS[d(6) - 1] };
  },
  looks: (): Birth['looks'] => {
    const r = roll2d6();
    return { roll: r.total, row: lookupRange(LOOKS, r.total), trait: pick(LOOK_TRAITS) };
  },
  temper: (): Birth['temper'] => ({ virtue: pick(VIRTUES), flaw: pick(FLAWS) }),
  destiny: (): Birth['destiny'] => {
    const n = d(6);
    const row = DESTINIES[n - 1];
    let list: DestinyName[];
    if (n <= 4) list = [row.name as DestinyName];
    else if (n === 5) list = [];
    else {
      const a = d(4);
      let b = d(4);
      while (b === a) b = d(4);
      list = [DESTINIES[a - 1].name as DestinyName, DESTINIES[b - 1].name as DestinyName];
    }
    return { roll: n, row, list };
  },
} satisfies { [K in BirthKey]: () => Birth[K] };

export const BIRTH_KEYS: BirthKey[] = ['origin', 'entry', 'bone', 'talent', 'looks', 'temper', 'destiny'];

export function rollBirth(): Birth {
  return {
    factionPick: pick(MVP_FACTIONS),
    rerollUsed: null,
    origin: rollers.origin(),
    entry: rollers.entry(),
    bone: rollers.bone(),
    talent: rollers.talent(),
    looks: rollers.looks(),
    temper: rollers.temper(),
    destiny: rollers.destiny(),
  };
}

export function rerollBirth(birth: Birth, key: BirthKey): boolean {
  if (birth.rerollUsed) return false;
  // 키마다 반환 타입이 달라 한 줄로 대입하려면 단언이 필요하다
  (birth as unknown as Record<BirthKey, unknown>)[key] = rollers[key]();
  if (key === 'entry') birth.factionPick = pick(MVP_FACTIONS);
  birth.rerollUsed = key;
  return true;
}

export function deriveFaction(birth: Birth): { faction: Faction; path: string } {
  if (birth.origin.row.house) return { faction: '사천당가', path: '세가의 피를 이어 입문' };
  if (birth.entry.row.joins) return { faction: birth.factionPick, path: birth.entry.row.name };
  return { faction: '무소속', path: birth.entry.row.name };
}

export function birthDestinies(birth: Birth): DestinyName[] {
  const list = [...birth.destiny.list];
  const forced = birth.origin.row.forceDestiny;
  if (forced && !list.includes(forced)) list.unshift(forced);
  return list;
}

export interface BirthLine {
  key: BirthKey;
  label: string;
  roll: string;
  value: string;
  detail: string;
}

/** 탄생 화면에 보여 줄 줄 */
export function birthLines(birth: Birth): BirthLine[] {
  const f = deriveFaction(birth);
  const bone = birth.bone;
  const destinies = birthDestinies(birth);
  return [
    { key: 'origin', label: '출신', roll: `d66 · ${birth.origin.roll}`, value: birth.origin.row.name, detail: birth.origin.row.desc },
    { key: 'entry', label: '입문', roll: `d6 · ${birth.entry.roll}`, value: f.faction, detail: f.path },
    { key: 'bone', label: '근골', roll: `2d6 · ${bone.roll}`, value: bone.row.name + (bone.special ? ` · ${bone.special}` : ''), detail: bone.row.desc },
    { key: 'talent', label: '오성', roll: `2d6 · ${birth.talent.roll}`, value: `${birth.talent.row.name} / ${birth.talent.field.name}`, detail: `재능 분야: ${birth.talent.field.name}` },
    { key: 'looks', label: '외모', roll: `2d6 · ${birth.looks.roll}`, value: birth.looks.row.name, detail: birth.looks.trait },
    { key: 'temper', label: '심성', roll: 'd6 · d6', value: `${birth.temper.virtue} / ${birth.temper.flaw}`, detail: '장점 / 약점' },
    {
      key: 'destiny', label: '숙명', roll: `d6 · ${birth.destiny.roll}`,
      value: destinies.length ? destinies.join(' + ') : '평온한 시작',
      detail: destinies.length ? '' : '아무 일도 없었다. 아직은.',
    },
  ];
}

export function suggestName(birth: Birth): string {
  const f = deriveFaction(birth).faction;
  const sur = f === '사천당가' ? '당' : pick(SURNAMES);
  return sur + pick(GIVEN);
}

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));

export interface BuiltHero {
  hero: Hero;
  flags: string[];
  bondSpecs: BondSpec[];
  region: Region;
}

export function buildHero(birth: Birth, name: string): BuiltHero {
  const { faction, path } = deriveFaction(birth);
  const o = birth.origin.row;
  const e = birth.entry.row;
  const b = birth.bone.row;
  const t = birth.talent.row;
  const field = birth.talent.field;

  const stats = Object.fromEntries(STATS.map((s) => [s, 0])) as Stats;
  const add = (obj?: Partial<Stats>): void => {
    if (!obj) return;
    for (const [k, v] of Object.entries(obj) as [keyof Stats, number][]) stats[k] += v;
  };
  add(o.stats);
  add(b.stats);
  stats.오 += t.stat;
  stats[field.stat] += 1;
  for (const s of STATS) stats[s] = clamp(stats[s], -2, 3);
  if (b.qiCap != null) stats.기 = Math.min(stats.기, b.qiCap);

  const artIds: ArtId[] = [...FACTION_ARTS[faction]];
  for (const id of [o.art, e.art, field.art]) if (id && !artIds.includes(id)) artIds.push(id);
  if (!artIds.some((id) => id.endsWith('heart') || id === 'basic_breath')) artIds.push('basic_breath');

  const destinies = birthDestinies(birth);
  const hero: Hero = {
    name,
    age: 13,
    origin: o.name,
    entry: path,
    faction,
    bone: { name: b.name, tier: b.tier, special: birth.bone.special },
    talent: { name: t.name, field: field.name },
    looks: { name: birth.looks.row.name, social: birth.looks.row.social, trait: birth.looks.trait },
    virtue: birth.temper.virtue,
    flaw: birth.temper.flaw,
    destinies,
    stats,
    qiCap: b.qiCap ?? null,
    xp: Math.max(0, o.xp ?? 0),
    xpBonus: (b.xpBonus ?? 0) + (t.xpBonus ?? 0),
    realm: 0,
    insight: 0,
    arts: artIds.map((id) => ({ id, stage: 0, prog: 0 })),
    wound: 0,
    woundCause: null,
    internal: false,
    fame: 0,
    infamy: (o.infamy ?? 0) + (e.infamy ?? 0),
    wealth: o.wealth ?? 0,
    alias: null,
  };

  const flags = [...(o.flags ?? []), ...(e.flags ?? [])];
  const bondSpecs: BondSpec[] = [];
  const hasMaster = faction !== '무소속' || !!e.hermit;
  const masterKilled = destinies.includes('사부의 원수');

  if (hasMaster || masterKilled) {
    bondSpecs.push({
      role: '사부',
      note: masterKilled ? '비 오는 밤 살해당한 사부' : faction !== '무소속' ? `${faction}의 사부` : '산중의 은거 고수',
      alive: !masterKilled,
      realm: e.hermit ? 4 : 3,
    });
  }
  if (faction !== '무소속') bondSpecs.push({ role: '사형', note: '같은 사부 밑에서 자란 사형' });
  if (o.bond) bondSpecs.push(o.bond);

  for (const dn of destinies) {
    if (dn === '멸문지화') bondSpecs.push({ role: '멸문원수', known: false, unknownLabel: '얼굴만 기억하는 원수', note: '가문을 멸한 자' });
    if (dn === '사부의 원수') bondSpecs.push({ role: '사부원수', known: false, unknownLabel: '정파의 명숙이라는 그자', note: '사부를 죽인 자' });
    if (dn === '빚진 목숨') bondSpecs.push({ role: '은인', known: false, unknownLabel: '얼굴만 기억하는 은인', note: '어린 날 목숨을 구해 준 사람' });
    if (dn === '누명') {
      bondSpecs.push({ role: '진범', known: false, unknownLabel: '얼굴 없는 진범', note: '당신에게 누명을 씌운 자' });
      flags.push('누명');
      hero.infamy += 2;
    }
  }

  const region = FACTION_HOME[faction] ?? pick(REGIONS);
  return { hero, flags, bondSpecs, region };
}
