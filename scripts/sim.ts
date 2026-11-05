// 터미널 시뮬레이터:  npm run sim -- --n 1000 --seed 7
//   --quiet  요약과 오류만 출력 (문제가 있으면 종료 코드 1)
import { simulate, validateCards, endingTitle, ALL_ENDING_IDS, AGE_BRACKETS, SNAPSHOT_AGES } from '../src/sim/simulate';

const args = process.argv.slice(2);
const opt = (name: string, fallback: number): number => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : fallback;
};
const n = opt('n', 1000);
const seed = opt('seed', 12345);
const quiet = args.includes('--quiet');

const pct = (v: number, total: number): string => `${((v / Math.max(1, total)) * 100).toFixed(1)}%`.padStart(6);
function table(title: string, obj: Record<string, number>, total: number, label = (k: string) => k): void {
  console.log(`\n■ ${title}`);
  for (const [k, v] of Object.entries(obj).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(v).padStart(5)} ${pct(v, total)}  ${label(k)}`);
  }
}

const t0 = performance.now();
const cardErrors = validateCards();
const s = simulate(n, seed);
const ms = Math.round(performance.now() - t0);

const ages = [...s.ages].sort((a, b) => a - b);
const avg = ages.length ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : '-';
const median = ages.length ? ages[Math.floor(ages.length / 2)] : '-';
const unseenEndings = ALL_ENDING_IDS.filter((id) => !s.endings[id]).map(endingTitle);
const unseenCards = Object.entries(s.cardHits).filter(([, v]) => v === 0).map(([k]) => k);
const ok = cardErrors.length === 0 && s.errors.length === 0 && s.missingVars.length === 0;

console.log(`${ok ? '✅ 문제 없음' : '⚠️  확인 필요'} · ${n}명 · 시드 ${seed} · ${ms}ms`);
console.log(`평균 수명 ${avg}세 (중앙값 ${median}) · 엔딩 ${Object.keys(s.endings).length}/${ALL_ENDING_IDS.length}종 · 별호 획득률 ${pct(s.aliases, s.lives).trim()}`);
if (cardErrors.length) console.log(`\n■ 카드 검사 오류 (${cardErrors.length})\n  ${cardErrors.join('\n  ')}`);
if (s.errors.length) console.log(`\n■ 실행 오류 (${s.errors.length}, 멈춤 ${s.stuck})\n${s.errors.slice(0, 5).join('\n\n')}`);
if (s.missingVars.length) console.log(`\n■ 채워지지 않은 문장 변수: ${s.missingVars.join(', ')}`);

/** 10·50·90 백분위 */
function pctl(values: number[]): string {
  if (!values.length) return '-';
  const v = [...values].sort((a, b) => a - b);
  const at = (p: number): number => v[Math.min(v.length - 1, Math.floor(p * v.length))];
  return `${at(0.1)} / ${at(0.5)} / ${at(0.9)}`.padEnd(14);
}

if (!quiet) {
  console.log('\n■ 나이대별 판정 (성공 · 부분 성공 이상)');
  for (const [label] of AGE_BRACKETS) {
    const c = s.checks[label];
    if (c) console.log(`  ${label.padEnd(8)} ${pct(c.success, c.n)} · ${pct(c.success + c.partial, c.n)}   (${c.n}회)`);
  }
  console.log('\n■ 나이별 협명 · 악명 · 경지 (하위 10% / 중앙 / 상위 10%)');
  for (const age of SNAPSHOT_AGES) {
    const sn = s.snapshots[age];
    if (sn) console.log(`  ${String(age).padStart(2)}세 (${String(sn.fame.length).padStart(4)}명)  협명 ${pctl(sn.fame)} 악명 ${pctl(sn.infamy)} 경지 ${pctl(sn.realm)}`);
  }
  console.log(`  생의 끝          협명 ${pctl(s.finalFame)} 악명 ${pctl(s.finalInfamy)}`);
  console.log(`  별호를 얻은 나이  ${pctl(s.aliasAges)} (획득 ${s.aliasAges.length}명)`);
  table('엔딩 분포', s.endings, s.lives, endingTitle);
  table('사망·은퇴 원인', s.causes, s.lives);
  table('최종 경지', s.realms, s.lives);
  table('소속', s.factions, s.lives);
  console.log(`\n■ 한 번도 안 나온 엔딩: ${unseenEndings.join(', ') || '없음'}`);
  console.log(`■ 한 번도 안 나온 카드: ${unseenCards.join(', ') || '없음'}`);
}

process.exit(ok ? 0 : 1);
