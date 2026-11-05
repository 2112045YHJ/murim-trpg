// 은원록(10장) 관리
import { pick } from './rng';
import { SURNAMES, GIVEN } from '../data/tables';
import type { Bond, BondKind, BondRole, BondSpec, BondTarget, LifeState, Style } from '../types';

export const ENEMY_ROLES: BondRole[] = ['멸문원수', '사부원수', '진범', '숙적'];

interface RoleDefault {
  kind: BondKind;
  realm?: number;
  realmRel?: number;
  stat?: number;
  style?: Style;
}

const ROLE_DEFAULTS: Record<BondRole, RoleDefault> = {
  멸문원수: { kind: '怨', realm: 3, stat: 1, style: '공격' },
  사부원수: { kind: '怨', realm: 4, stat: 1, style: '수비' },
  진범: { kind: '怨', realm: 2, stat: 1, style: '변칙' },
  숙적: { kind: '怨', realmRel: 0, stat: 1, style: '공격' },
  사부: { kind: '緣', realm: 3 },
  사형: { kind: '緣', realm: 1 },
  지기: { kind: '緣', realm: 1 },
  정보상: { kind: '緣', realm: 0 },
  제자: { kind: '緣', realm: 0 },
  은인: { kind: '恩', realm: 2 },
  은혜입은자: { kind: '恩', realm: 0 },
};

export const ROLE_LABEL: Record<BondRole, string> = {
  멸문원수: '멸문의 원수',
  사부원수: '사부의 원수',
  진범: '진범',
  숙적: '숙적',
  사부: '사부',
  사형: '사형',
  지기: '지기',
  정보상: '정보상',
  제자: '제자',
  은인: '은인',
  은혜입은자: '은혜를 입은 자',
};

export function randomName(): string {
  return pick(SURNAMES) + pick(GIVEN);
}

/** 은원록에 인물을 추가한다. heroRealm은 상대 경지(realmRel) 계산에 쓴다 */
export function addBond(state: Pick<LifeState, 'bonds' | 'nextBondId'>, spec: BondSpec, heroRealm = 0, heroAge = 0): Bond {
  const def = ROLE_DEFAULTS[spec.role];
  let realm = spec.realm ?? def.realm;
  const rel = spec.realmRel ?? def.realmRel;
  if (realm == null && rel != null) realm = Math.max(0, heroRealm + rel);
  const bond: Bond = {
    id: state.nextBondId++,
    role: spec.role,
    kind: spec.kind ?? def.kind,
    name: spec.name ?? randomName(),
    known: spec.known ?? true,
    unknownLabel: spec.unknownLabel ?? '이름 모를 자',
    note: spec.note ?? '',
    realm: realm ?? 1,
    stat: spec.stat ?? def.stat ?? 0,
    style: spec.style ?? def.style ?? '변칙',
    alive: spec.alive ?? true,
    resolved: false,
    since: heroAge,
  };
  state.bonds.push(bond);
  return bond;
}

export function findBond(
  state: Pick<LifeState, 'bonds'>,
  role: BondTarget,
  { alive = true, unresolved = true }: { alive?: boolean; unresolved?: boolean } = {},
): Bond | undefined {
  const roles = role === 'enemy' ? ENEMY_ROLES : [role];
  return state.bonds.find((b) => roles.includes(b.role) && (!alive || b.alive) && (!unresolved || !b.resolved));
}

/** 살아 있고 청산되지 않은 인연을 먼저, 없으면 청산된 인연, 그래도 없으면 죽은 인연 */
export function anyBond(state: Pick<LifeState, 'bonds'>, role: BondTarget): Bond | undefined {
  return findBond(state, role) ?? findBond(state, role, { unresolved: false }) ?? findBond(state, role, { alive: false, unresolved: false });
}

export function bondName(b: Bond | undefined): string {
  if (!b) return '누군가';
  return b.known ? b.name : b.unknownLabel;
}
