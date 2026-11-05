// 난수: 기본은 Math.random, 시뮬레이터·테스트는 시드 고정
let seeded = false;
let s = 0;

export function setSeed(seed: number): void {
  seeded = true;
  s = seed >>> 0;
}

export function clearSeed(): void {
  seeded = false;
}

export function random(): number {
  if (!seeded) return Math.random();
  s = (s + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const d = (n: number): number => 1 + Math.floor(random() * n);

export function roll2d6(): { dice: [number, number]; total: number } {
  const a = d(6);
  const b = d(6);
  return { dice: [a, b], total: a + b };
}

export function rollD66(): { dice: [number, number]; total: number } {
  const a = d(6);
  const b = d(6);
  return { dice: [a, b], total: a * 10 + b };
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(random() * arr.length)];
}

export function weightedPick<T>(items: T[], weightOf: (item: T) => number): T | null {
  const total = items.reduce((sum, it) => sum + weightOf(it), 0);
  if (total <= 0) return null;
  let r = random() * total;
  for (const it of items) {
    r -= weightOf(it);
    if (r < 0) return it;
  }
  return items[items.length - 1];
}

/** 2d6 + k 가 각 결과 등급에 들 확률 */
export function checkOdds(k: number): { success: number; partial: number; fail: number } {
  let success = 0;
  let partial = 0;
  for (let a = 1; a <= 6; a++) {
    for (let b = 1; b <= 6; b++) {
      const t = a + b + k;
      if (t >= 10) success++;
      else if (t >= 7) partial++;
    }
  }
  return { success: success / 36, partial: partial / 36, fail: (36 - success - partial) / 36 };
}
