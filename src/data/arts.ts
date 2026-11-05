// 무공 목록 (MVP)
import type { Faction } from '../types';

export const ART_STAGES = ['입문', '소성', '대성', '극성'] as const;

interface Art {
  name: string;
  kind: string;
  faction?: Faction;
}

export const ARTS = {
  // 화산파
  hs_plum: { name: '이십사수매화검법', faction: '화산파', kind: '검·열양' },
  hs_heart: { name: '자하신공', faction: '화산파', kind: '심법' },
  // 아미파
  am_rifle: { name: '신기백보탄', faction: '아미파', kind: '화기' },
  am_heart: { name: '철혈군심법', faction: '아미파', kind: '심법' },
  // 사천당가
  dg_needle: { name: '만천화우', faction: '사천당가', kind: '암기·독' },
  dg_heart: { name: '백독진경', faction: '사천당가', kind: '심법' },
  // 재능 분야 공용 무공
  basic_sword: { name: '삼재검법', kind: '검' },
  basic_spear: { name: '육합창법', kind: '창' },
  basic_fist: { name: '태조장권', kind: '권각' },
  basic_dart: { name: '비도술', kind: '암기' },
  basic_breath: { name: '토납법', kind: '심법' },
  basic_needle: { name: '본초침술', kind: '의술' },
  // 특수
  family_fragment: { name: '가전 무공 잔편', kind: '잔편' },
  hidden_sword: { name: '무명검결', kind: '검' },
  blood_palm: { name: '혈영장', kind: '사파 장법' },
  unknown_manual: { name: '이름 없는 비급', kind: '미상' },
  cliff_sword: { name: '벽혼검(壁痕劍)', kind: '검' },
} satisfies Record<string, Art>;

export type ArtId = keyof typeof ARTS;

export const FACTION_ARTS: Record<Faction, ArtId[]> = {
  화산파: ['hs_plum', 'hs_heart'],
  아미파: ['am_rifle', 'am_heart'],
  사천당가: ['dg_needle', 'dg_heart'],
  무소속: [],
};
