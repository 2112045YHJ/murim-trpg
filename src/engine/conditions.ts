// 카드·선택지·엔딩 조건 검사
import { REALMS } from '../data/tables';
import { findBond, ROLE_LABEL } from './bonds';
import type { Cond, LifeState, Range, Stat } from '../types';

const arr = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);

function inRange(val: number, range: Range): boolean {
  const [lo, hi] = Array.isArray(range) ? range : [range, null];
  return (lo == null || val >= lo) && (hi == null || val <= hi);
}
const rangeMin = (range: Range): number | null => (Array.isArray(range) ? range[0] : range);

export const COND_KEYS = new Set<keyof Cond>([
  'region', 'faction', 'age', 'realm', 'fame', 'infamy', 'wealth', 'flags', 'anyFlags', 'notFlags',
  'destiny', 'bone', 'boneTier', 'looks', 'stat', 'bond', 'notBond', 'enemy', 'enemyGap', 'wounded',
  'origin', 'dead', 'retired', 'deathCause', 'unresolvedEnemy',
]);

export interface CondResult {
  ok: boolean;
  /** 잠긴 선택지에 보여 줄 문구 */
  reason?: string;
}

const OK: CondResult = { ok: true };
const no = (reason = ''): CondResult => ({ ok: false, reason });

export function checkCond(state: LifeState, when: Cond | undefined): CondResult {
  if (!when) return OK;
  const h = state.hero;
  const flags = state.flags;
  const w = when;

  if (w.region && !arr(w.region).includes(state.region)) return no(`${arr(w.region).join('·')}에서만`);
  if (w.faction && !arr(w.faction).includes(h.faction)) return no(`${arr(w.faction).join('·')} 소속 필요`);
  if (w.age != null && !inRange(h.age, w.age)) return no('나이가 맞지 않음');
  if (w.realm != null && !inRange(h.realm, w.realm)) return no(`${REALMS[rangeMin(w.realm) ?? 0]} 이상 필요`);
  if (w.fame != null && !inRange(h.fame, w.fame)) return no('협명이 부족함');
  if (w.infamy != null && !inRange(h.infamy, w.infamy)) return no('악명이 맞지 않음');
  if (w.wealth != null && !inRange(h.wealth, w.wealth)) return no(`재물 ${rangeMin(w.wealth)} 필요`);
  if (w.flags && !w.flags.every((f) => flags.includes(f))) return no('아직 조건을 채우지 못함');
  if (w.anyFlags && !w.anyFlags.some((f) => flags.includes(f))) return no('아직 조건을 채우지 못함');
  if (w.notFlags && w.notFlags.some((f) => flags.includes(f))) return no('이미 지나간 일');
  if (w.destiny && !arr(w.destiny).some((dn) => h.destinies.includes(dn))) return no(`숙명 '${arr(w.destiny).join('·')}' 필요`);
  if (w.bone) {
    const bones: string[] = arr(w.bone);
    if (!bones.includes(h.bone.name) && !(h.bone.special && bones.includes(h.bone.special))) return no(`${bones.join('·')} 체질 필요`);
  }
  if (w.boneTier != null && h.bone.tier < w.boneTier) return no('강골 이상 필요');
  if (w.looks && !arr(w.looks).includes(h.looks.name)) return no(`외모 '${arr(w.looks).join('·')}' 필요`);
  if (w.stat) {
    for (const [s, min] of Object.entries(w.stat) as [Stat, number][]) {
      if (h.stats[s] < min) return no(`${s} +${min} 이상 필요`);
    }
  }
  if (w.bond) for (const role of arr(w.bond)) if (!findBond(state, role)) return no(`${ROLE_LABEL[role]} 인연 필요`);
  if (w.notBond) for (const role of arr(w.notBond)) if (findBond(state, role)) return no();
  if (w.enemy != null && !!findBond(state, 'enemy') !== w.enemy) return no('원수가 있어야 함');
  if (w.enemyGap) {
    const b = findBond(state, w.enemyGap.role);
    if (!b || b.realm - h.realm > w.enemyGap.max) return no('아직 원수에게 미치지 못함');
  }
  if (w.wounded != null && (h.wound > 0 || h.internal) !== w.wounded) return no();
  if (w.origin && !arr(w.origin).includes(h.origin)) return no(`출신 '${arr(w.origin).join('·')}' 필요`);
  // 엔딩 판정용
  if (w.dead != null && !!state.end?.dead !== w.dead) return no();
  if (w.retired != null && !!state.end?.retired !== w.retired) return no();
  if (w.deathCause && !(state.end?.cause && arr(w.deathCause).includes(state.end.cause))) return no();
  if (w.unresolvedEnemy != null && !!findBond(state, 'enemy') !== w.unresolvedEnemy) return no();
  return OK;
}
