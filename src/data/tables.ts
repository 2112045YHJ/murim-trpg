// 4장 랜덤 캐릭터 생성표 (MVP 범위)
import type {
  BoneRow, DestinyRow, EntryRow, Faction, FieldRow, LooksRow, OriginRow, RangeRow, Region,
  SpecialBody, Stat, TalentRow,
} from '../types';

export const STATS: Stat[] = ['체', '기', '신', '오', '심'];
export const STAT_DESC: Record<Stat, string> = {
  체: '근골·힘·맷집',
  기: '내공의 깊이',
  신: '신법·민첩',
  오: '깨달음·눈썰미',
  심: '심지·의지',
};

export const REALMS = ['삼류', '이류', '일류', '절정', '초절정', '화경', '현경'] as const;
/** 각 경지에 오르기 위한 누적 수련치 */
export const REALM_XP = [0, 5, 14, 30, 55, 90, 140];
/** 각 경지에 오르는 데 필요한 깨달음 수 (절정부터 벽이 생긴다) */
export const REALM_INSIGHT = [0, 0, 0, 1, 2, 4, 6];

export const MVP_FACTIONS: Exclude<Faction, '무소속'>[] = ['화산파', '아미파', '사천당가'];
export const FACTION_HOME: Record<Faction, Region | null> = { 화산파: '화산', 아미파: '아미산', 사천당가: '사천', 무소속: null };
export const REGIONS: Region[] = ['화산', '사천', '아미산'];

// ① 출신 (d66)
export const ORIGINS: OriginRow[] = [
  { lo: 11, hi: 16, name: '고아', stats: { 심: 1 }, wealth: 0, desc: '심 +1 · 재산 없음' },
  { lo: 21, hi: 23, name: '농민의 자식', stats: { 체: 1 }, wealth: 1, xp: -1, desc: '체 +1 · 늦은 입문' },
  { lo: 24, hi: 26, name: '표국 집안', wealth: 2, bond: { role: '지기', kind: '緣', note: '어릴 적 함께 자란 표국의 표사' }, desc: '강호 견문 · 인맥 1명' },
  { lo: 31, hi: 33, name: '몰락한 무가', wealth: 1, art: 'family_fragment', forceDestiny: '멸문지화', desc: '가문 무공 잔편 · 가문의 원수' },
  { lo: 34, hi: 36, name: '상인 가문', wealth: 5, desc: '재산 넉넉함' },
  { lo: 41, hi: 43, name: '선비 집안', stats: { 오: 1 }, wealth: 2, desc: '오 +1 · 글을 앎' },
  { lo: 44, hi: 46, name: '사천당가 방계', wealth: 3, house: true, desc: '세가 입문 · 직계의 견제' },
  { lo: 51, hi: 53, name: '사천당가 직계', wealth: 5, house: true, xp: 2, desc: '세가 무공 · 후계 다툼' },
  { lo: 54, hi: 56, name: '장로의 자식', wealth: 2, xp: 2, desc: '높은 배분 · 부모 이름의 무게' },
  { lo: 61, hi: 63, name: '사마 출신', wealth: 1, infamy: 1, art: 'blood_palm', desc: '사파 무공 · 숨겨야 할 과거' },
  { lo: 64, hi: 65, name: '숨겨진 핏줄', wealth: 3, flags: ['황족핏줄'], desc: '비밀 보물 · 자객의 표적' },
  { lo: 66, hi: 66, name: '출생의 비밀', wealth: 1, flags: ['출생의비밀'], desc: '진실은 아직 아무도 모른다' },
];

// ② 입문 경로 (d6)
export const ENTRIES: EntryRow[] = [
  { n: 1, name: '정식 입문 시험 통과', joins: true },
  { n: 2, name: '사부가 직접 거둠', joins: true },
  { n: 3, name: '집안의 연줄로 입문', joins: true },
  { n: 4, name: '은거 고수의 유일 제자', joins: false, art: 'hidden_sword', hermit: true },
  { n: 5, name: '사마 세력에 끌려감', joins: false, art: 'blood_palm', infamy: 1, flags: ['사마입교'] },
  { n: 6, name: '주운 비급으로 독학', joins: false, art: 'unknown_manual', flags: ['비급독학'] },
];

// ③ 근골 (2d6) — tier: 체질 등급(카드 조건 boneTier에 사용)
export const BONES: BoneRow[] = [
  { lo: 2, hi: 2, name: '절맥', tier: 0, stats: { 체: 1 }, qiCap: 1, desc: '내공을 쌓을 수 없다. 기 최대 1, 외공에 강함' },
  { lo: 3, hi: 3, name: '구음절맥', tier: 0, desc: '스무 살을 넘기기 어려운 체질. 음한 무공에 천재' },
  { lo: 4, hi: 5, name: '약골', tier: 1, stats: { 체: -1 }, desc: '체 -1. 늦게 피어난다' },
  { lo: 6, hi: 8, name: '범골', tier: 2, desc: '평범한 몸' },
  { lo: 9, hi: 10, name: '강골', tier: 3, stats: { 체: 1 }, desc: '체 +1' },
  { lo: 11, hi: 11, name: '기재의 몸', tier: 4, stats: { 신: 1 }, xpBonus: 1, desc: '신 +1 · 수련 보너스' },
  { lo: 12, hi: 12, name: '천골', tier: 5, stats: { 체: 1, 신: 1 }, xpBonus: 1, desc: '천 년에 하나 나오는 몸. 강호가 탐낸다' },
];
export const SPECIAL_BODIES: (SpecialBody | null)[] = ['화령지체', '금강체', '백독불침', '영매체', '청음체', null];

// ④ 오성 (2d6)
export const TALENTS: TalentRow[] = [
  { lo: 2, hi: 3, name: '우둔', stat: -1, desc: '오 -1. 한번 익힌 것은 잊지 않는다' },
  { lo: 4, hi: 6, name: '평범', stat: 0, desc: '' },
  { lo: 7, hi: 9, name: '총명', stat: 1, desc: '오 +1' },
  { lo: 10, hi: 11, name: '천재', stat: 2, desc: '오 +2' },
  { lo: 12, hi: 12, name: '무학 기재', stat: 2, xpBonus: 1, desc: '오 +2 · 수련 보너스' },
];
export const FIELDS: FieldRow[] = [
  { n: 1, name: '검', stat: '신', art: 'basic_sword' },
  { n: 2, name: '도·창', stat: '체', art: 'basic_spear' },
  { n: 3, name: '권각', stat: '체', art: 'basic_fist' },
  { n: 4, name: '암기·화기', stat: '신', art: 'basic_dart' },
  { n: 5, name: '내공·심법', stat: '기', art: 'basic_breath' },
  { n: 6, name: '의술·독술', stat: '오', art: 'basic_needle' },
];

// ⑤ 외모 (2d6) — social: 첫인상 보정
export const LOOKS: LooksRow[] = [
  { lo: 2, hi: 2, name: '흉측함', social: -2 },
  { lo: 3, hi: 5, name: '볼품없음', social: 0 },
  { lo: 6, hi: 8, name: '평범', social: 0 },
  { lo: 9, hi: 10, name: '준수함', social: 1 },
  { lo: 11, hi: 11, name: '수려함', social: 2 },
  { lo: 12, hi: 12, name: '경국지색', social: 3 },
];
export const LOOK_TRAITS = ['얼굴의 큰 흉터', '백발', '서로 다른 눈동자 색', '거구', '왜소한 체구', '몸의 기이한 반점'];

// ⑥ 심성 (d6 두 번)
export const VIRTUES = ['의리', '인내', '자비', '용기', '냉철', '정직'];
export const FLAWS = ['다혈질', '고집', '의심', '오만', '탐욕', '원한을 잊지 못함'];

// ⑦ 숙명 (MVP: d6)
export const DESTINIES: DestinyRow[] = [
  { n: 1, name: '멸문지화', desc: '가문이 하룻밤에 멸했다. 원수의 얼굴을 기억한다.' },
  { n: 2, name: '사부의 원수', desc: '사부가 누군가에게 살해당했다. 범인은 정파 명숙이라는 소문이 있다.' },
  { n: 3, name: '빚진 목숨', desc: '어릴 때 누군가 목숨을 구해 주었다. 은인의 얼굴만 기억한다.' },
  { n: 4, name: '누명', desc: '저지르지 않은 살인의 누명을 썼다. 현상금이 걸려 있다.' },
  { n: 5, name: '평온한 시작', desc: '아무 일도 없었다. 아직은.' },
  { n: 6, name: '겹친 숙명', desc: '숙명이 둘 겹쳤다.' },
];

export const SURNAMES = ['백', '진', '이', '왕', '장', '유', '조', '한', '위', '소', '연', '설', '하', '곽', '양', '송', '임', '구', '황보', '독고'];
export const GIVEN = ['무진', '청운', '설화', '소연', '태호', '유하', '진명', '백린', '월향', '운학', '도현', '희연', '철산', '서린', '휘', '명', '혁', '령', '호', '강', '건', '은설', '자운', '하영'];

export function lookupRange<T extends RangeRow>(table: T[], value: number): T {
  const row = table.find((r) => value >= r.lo && value <= r.hi);
  if (!row) throw new Error(`생성표에 없는 값: ${value}`);
  return row;
}
