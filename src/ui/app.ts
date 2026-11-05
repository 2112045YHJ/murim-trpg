// 화면: 제목 · 탄생 · 유년기 · 강호(행동/카드/결과/결투) · 엔딩 · 도감
import './style.css';
import {
  newGame, acceptBirth, startJianghu, availableActions, chooseAction, cardView, chooseOption,
  continueResult, duelMove, endingView, seasonName, MOVES, WOUNDS, GRADE_LABEL,
  FAME_TIERS, INFAMY_TIERS, tierOf,
} from '../engine/game';
import { birthLines, rerollBirth, suggestName } from '../engine/generate';
import { ROLE_LABEL, bondName } from '../engine/bonds';
import { fixJosa } from '../engine/josa';
import { REALMS, REGIONS, STATS, STAT_DESC } from '../data/tables';
import { ARTS, ART_STAGES } from '../data/arts';
import { ENDINGS, DEFAULT_ENDING } from '../data/endings';
import { CARD_LIST } from '../data/cards';
import type { ActionId, BirthKey, BirthState, DuelRound, GameState, LifeState, Move, Region } from '../types';

const SAVE_KEY = 'murim.save.v2';
const COLL_KEY = 'murim.collection.v1';
const app = document.getElementById('app')!;
const importInput = document.getElementById('import-file') as HTMLInputElement;

interface Collection {
  endings: Record<string, number>;
  cards: Record<string, boolean>;
  aliases: string[];
}

type Screen = 'title' | 'game' | 'collection';
type SideTab = 'sheet' | 'bonds' | 'log';

let state: GameState | null = null;
let screen: Screen = 'title';
let sideTab: SideTab = 'sheet';
let pickingRegion = false;
let birthAnimated = false;

const TOTAL_ENDINGS = ENDINGS.length + 1;

// ───────────────────────── 저장

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function store(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 저장할 수 없는 환경 (사생활 보호 모드 등) */
  }
}
function loadSave(): GameState | null {
  const s = load<GameState | null>(SAVE_KEY, null);
  return s && s.version === 2 ? s : null;
}
const save = (): void => {
  if (state) store(SAVE_KEY, state);
};
const collection = (): Collection => load<Collection>(COLL_KEY, { endings: {}, cards: {}, aliases: [] });

function recordCollection(s: LifeState): void {
  const c = collection();
  for (const id of Object.keys(s.seen)) c.cards[id] = true;
  if (s.ending) c.endings[s.ending.id] = (c.endings[s.ending.id] ?? 0) + 1;
  if (s.hero.alias && !c.aliases.includes(s.hero.alias)) c.aliases.push(s.hero.alias);
  store(COLL_KEY, c);
}

// ───────────────────────── 유틸

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s: unknown): string => fixJosa(String(s ?? '')).replace(/[&<>"']/g, (ch) => ESC[ch]);
const pct = (p: number): string => `${Math.round(p * 100)}%`;
const signed = (n: number): string => (n > 0 ? `+${n}` : `${n}`);
function bar(n: number, max = 10, cls = ''): string {
  const on = Math.min(max, Math.round(n));
  return `<span class="bar ${cls}">${Array.from({ length: max }, (_, i) => `<i class="${i < on ? 'on' : ''}"></i>`).join('')}</span>`;
}
const isLife = (s: GameState | null): s is LifeState => !!s && s.phase !== 'birth';

// ───────────────────────── 제목·도감

function renderTitle(): void {
  const hasSave = !!loadSave();
  const c = collection();
  app.innerHTML = `
    <div class="title-screen narrow">
      <div class="han">武林咯血錄</div>
      <h1>무림각혈록</h1>
      <p class="tag">화산은 불을 뿜고, 아미의 제자는 총을 멘다.<br>그래도 은혜는 갚고, 원수는 반드시 찾아간다.</p>
      <div class="menu">
        <button class="btn primary" data-act="new">새 인생을 굴린다</button>
        <button class="btn center" data-act="continue" ${hasSave ? '' : 'disabled'}>이어서 하기</button>
        <button class="btn center" data-act="collection">도감 (엔딩 ${Object.keys(c.endings).length} / ${TOTAL_ENDINGS})</button>
      </div>
      <div class="small-links">
        <button class="link" data-act="export" ${hasSave ? '' : 'disabled'}>세이브 내보내기</button>
        <button class="link" data-act="import">세이브 가져오기</button>
      </div>
    </div>`;
}

function renderCollection(): void {
  const c = collection();
  const all = [...ENDINGS, DEFAULT_ENDING];
  app.innerHTML = `
    <div class="narrow">
      <div class="panel">
        <div class="kicker">엔딩 도감 · ${Object.keys(c.endings).length} / ${all.length}</div>
        <ul class="collection-list">
          ${all.map((e) => (c.endings[e.id]
            ? `<li><span>${esc(e.title)} <span class="cat">${esc(e.category)}</span></span><span class="note">${c.endings[e.id]}회</span></li>`
            : `<li class="unk"><span>？？？ <span class="cat">${esc(e.category)}</span></span></li>`)).join('')}
        </ul>
      </div>
      <div class="panel">
        <div class="kicker">카드 도감 · ${Object.keys(c.cards).length} / ${CARD_LIST.length}</div>
        <div class="kicker" style="margin-top:12px">별호 도감</div>
        <p>${c.aliases.length ? c.aliases.map(esc).join(' · ') : '<span class="note">아직 얻은 별호가 없다.</span>'}</p>
      </div>
      <div class="small-links"><button class="link" data-act="title">처음으로</button></div>
    </div>`;
}

// ───────────────────────── 탄생·유년기

function renderBirth(s: BirthState): void {
  const b = s.birth;
  const used = b.rerollUsed;
  const rows = birthLines(b).map((l, i) => `
    <div class="birth-row" style="animation-delay:${birthAnimated ? 0 : i * 0.35}s">
      <span class="lbl">${esc(l.label)}</span>
      <span class="val">${esc(l.value)}</span>
      <span class="roll">🎲 ${esc(l.roll)}</span>
      <span class="det">${esc(l.detail)}</span>
      ${used
        ? used === l.key ? '<span class="reroll note">다시 굴림</span>' : ''
        : `<button class="link reroll" data-act="reroll" data-key="${l.key}">운명 거스르기</button>`}
    </div>`).join('');
  birthAnimated = true;
  s.pendingName ??= suggestName(b);
  app.innerHTML = `
    <div class="narrow">
      <div class="birth-title">
        <h2>천명(天命)을 굴린다</h2>
        <p>${used ? '운명을 한 번 거슬렀다. 이제 받아들일 차례다.' : '마음에 들지 않는 항목 하나를 딱 한 번 다시 굴릴 수 있다.'}</p>
      </div>
      <div class="panel">
        ${rows}
        <div class="name-row">
          <input id="hero-name" maxlength="8" value="${esc(s.pendingName)}" aria-label="이름">
          <button class="btn center" data-act="rename">다른 이름</button>
        </div>
        <p class="note">별호는 짓지 않는다. 강호에서 큰일을 처음 해냈을 때 세상이 붙여 준다.</p>
        <button class="btn primary" style="width:100%" data-act="accept">이 운명을 받아들인다</button>
      </div>
      <div class="small-links"><button class="link" data-act="title">처음으로</button></div>
    </div>`;
}

function renderChildhood(s: LifeState): void {
  app.innerHTML = `
    <div class="narrow">
      <div class="panel">
        <div class="kicker">유년기 · 생성 ~ 12세</div>
        <div class="card-title">${esc(s.hero.name)}</div>
        ${s.childhood.map((p) => `<p class="card-text">${esc(p)}</p>`).join('')}
        <button class="btn primary" style="width:100%" data-act="start">강호로 나선다</button>
      </div>
    </div>`;
}

// ───────────────────────── 강호

function topbar(s: LifeState): string {
  const h = s.hero;
  return `
    <div class="topbar">
      <span class="who">${esc(h.name)}</span>
      ${h.alias ? `<span class="alias">${esc(h.alias)}</span>` : ''}
      <span class="meta">${h.age}세 ${seasonName(s)} · ${esc(s.region)} · ${esc(h.faction)} · ${REALMS[h.realm]}</span>
      <span class="spacer"></span>
      <button class="link" data-act="title">처음으로</button>
    </div>`;
}

function actionPanel(s: LifeState): string {
  const warn: string[] = [];
  if (s.hero.wound === 3) warn.push('⚠ 치명상이다. 이번 계절에 요양하지 않으면 목숨을 장담할 수 없다.');
  else if (s.hero.wound === 2) warn.push('중상이다. 다시 다치면 치명상이 된다.');
  const lines = [...warn, ...s.notice];
  const notice = lines.length ? `<div class="notice">${lines.map(esc).join('<br>')}</div>` : '';
  const regionPicker = pickingRegion
    ? `<div class="panel"><div class="kicker">강호행 · 어디로 떠날까</div>
        <div class="region-pick">${REGIONS.filter((r) => r !== s.region).map((r) => `<button class="btn center" data-act="go" data-region="${r}">${r}</button>`).join('')}
        <button class="link" data-act="cancel-go">그만둔다</button></div></div>`
    : '';
  return `
    ${notice}
    <div class="panel">
      <div class="kicker">${s.hero.age}세 ${seasonName(s)} · 이번 계절에 무엇을 할까</div>
      <div class="card-title">계절의 행동</div>
      <div class="actions">
        ${availableActions(s).map((a) => `
          <button class="btn action" data-act="action" data-id="${a.id}" ${a.locked ? 'disabled' : ''}>
            <b>${a.id}</b><span>${esc(a.locked ?? a.desc)}</span>
          </button>`).join('')}
      </div>
    </div>
    ${regionPicker}`;
}

const TYPE_LABEL: Record<string, string> = { action: '행동', region: '지역', faction: '문파', destiny: '숙명', bond: '인연', world: '세상', generic: '강호' };

function cardPanel(s: LifeState): string {
  const v = cardView(s);
  return `
    <div class="panel">
      <div class="kicker">${s.hero.age}세 ${seasonName(s)} · ${TYPE_LABEL[v.type]}</div>
      <div class="card-title">${esc(v.title)}</div>
      <p class="card-text">${esc(v.text)}</p>
      <div class="choices">
        ${v.choices.map((c) => {
          let sub = '';
          if (c.locked) sub = `🔒 ${esc(c.reason || '조건 미달')}`;
          else if (c.odds) sub = `판정 · ${c.odds.stat}(${signed(c.odds.mod)}) · 성공 ${pct(c.odds.success)} · 부분 성공 이상 ${pct(c.odds.atLeastPartial)}`;
          return `<button class="btn choice ${c.locked ? 'locked' : ''}" data-act="choose" data-i="${c.index}" ${c.locked ? 'disabled' : ''}>
            <span>${esc(c.label)}</span>${sub ? `<span class="odds">${sub}</span>` : ''}</button>`;
        }).join('')}
      </div>
    </div>`;
}

function roundLine(x: DuelRound, i: number): string {
  const verdict = x.result === 'win' ? '<span class="win">우세</span>' : x.result === 'lose' ? '<span class="lose">열세</span>' : '호각';
  const edge = x.edge > 0 ? ' (상성 우위)' : x.edge < 0 ? ' (상성 열세)' : '';
  return `<li>제${i + 1}합 · 당신 ${x.move}(${MOVES[x.move]}) ${x.hp} : ${x.ep} 상대 ${x.em}(${MOVES[x.em]})${edge} — ${verdict}</li>`;
}

function resultPanel(s: LifeState): string {
  const r = s.current?.result;
  if (!r) return '';
  const roll = r.roll
    ? `<div class="roll-box">
        <span class="die">${r.roll.dice[0]}</span><span class="die">${r.roll.dice[1]}</span>
        <span>${r.roll.dice[0] + r.roll.dice[1]} + ${r.roll.stat} 보정 ${signed(r.roll.mod)} = <b>${r.roll.total}</b></span>
        <span class="grade ${r.roll.grade}">${GRADE_LABEL[r.roll.grade]}</span>
      </div>`
    : '';
  const duel = r.duel ? `<ul class="rounds">${r.duel.rounds.map(roundLine).join('')}</ul><div style="height:12px"></div>` : '';
  return `
    <div class="panel">
      <div class="kicker">${s.hero.age}세 ${seasonName(s)}</div>
      <div class="card-title">${esc(r.title)}</div>
      ${r.choice ? `<div class="chosen">▸ ${esc(r.choice)}</div>` : ''}
      ${roll}${duel}
      ${r.text ? `<p class="card-text">${esc(r.text)}</p>` : ''}
      ${r.effects.length ? `<ul class="effects">${r.effects.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>` : ''}
      <button class="btn primary" style="width:100%" data-act="next">계속</button>
    </div>`;
}

function duelPanel(s: LifeState): string {
  const d = s.duel;
  if (!d) return '';
  return `
    <div class="panel">
      <div class="kicker">삼합 비무 · 공은 변을, 변은 수를, 수는 공을 이긴다</div>
      <div class="card-title">${esc(d.foe.name)}</div>
      ${d.intro ? `<p class="card-text">${esc(d.intro)}</p>` : ''}
      <div class="duel-foe">
        <span>상대 경지 <b>${REALMS[d.foe.realm]}</b> · 당신 <b>${REALMS[s.hero.realm]}</b></span>
        <span class="duel-score">${d.wins} : ${d.losses}</span>
      </div>
      <p class="note">${d.styleKnown ? `오성으로 간파했다: 상대는 <b>${esc(d.foe.style)}형</b>이다.` : '상대의 성향이 읽히지 않는다. (오 +1 이상이면 간파)'}</p>
      ${d.rounds.length ? `<ul class="rounds">${d.rounds.map(roundLine).join('')}</ul>` : ''}
      <div class="kicker" style="margin-top:12px">제${d.rounds.length + 1}합 · 초식을 고른다</div>
      <div class="moves">
        <button class="btn" data-act="move" data-m="공"><b>攻</b><span>공 · 몰아친다</span></button>
        <button class="btn" data-act="move" data-m="수"><b>守</b><span>수 · 받아낸다</span></button>
        <button class="btn" data-act="move" data-m="변"><b>變</b><span>변 · 비튼다</span></button>
      </div>
    </div>`;
}

function sheet(s: LifeState): string {
  const h = s.hero;
  return `
    <div class="stats">${STATS.map((k) => `<div class="stat" title="${STAT_DESC[k]}"><span class="k">${k}</span><span class="v">${signed(h.stats[k])}</span></div>`).join('')}</div>
    <dl class="kv">
      <dt>경지</dt><dd>${REALMS[h.realm]} <span class="note">(수련 ${h.xp} · 깨달음 ${h.insight})</span></dd>
      <dt>출신</dt><dd>${esc(h.origin)}</dd>
      <dt>소속</dt><dd>${esc(h.faction)}</dd>
      <dt>근골</dt><dd>${esc(h.bone.name)}${h.bone.special ? ` · ${esc(h.bone.special)}` : ''}</dd>
      <dt>오성</dt><dd>${esc(h.talent.name)} / ${esc(h.talent.field)}</dd>
      <dt>외모</dt><dd>${esc(h.looks.name)} · ${esc(h.looks.trait)}</dd>
      <dt>심성</dt><dd>${esc(h.virtue)} / ${esc(h.flaw)}</dd>
      <dt>숙명</dt><dd>${h.destinies.length ? h.destinies.map(esc).join(', ') : '평온한 시작'}</dd>
      <dt>부상</dt><dd>${WOUNDS[h.wound]}${h.internal ? ' · 내상' : ''}</dd>
      <dt>재물</dt><dd>${h.wealth}</dd>
      <dt>협명</dt><dd>${bar(h.fame / 3, 10, 'good')} ${tierOf(h.fame, FAME_TIERS)} <span class="note">${h.fame}</span></dd>
      <dt>악명</dt><dd>${bar(h.infamy / 2, 10)} ${tierOf(h.infamy, INFAMY_TIERS)} <span class="note">${h.infamy}</span></dd>
    </dl>
    <p class="note">명성은 해마다 조금씩 잊히고, 악명은 더 오래 남는다.</p>
    <div class="section-h">무공</div>
    <ul class="arts">${h.arts.map((a, i) => `<li>${i === 0 ? '★ ' : ''}${esc(ARTS[a.id].name)}<span>${ART_STAGES[a.stage]}</span></li>`).join('')}</ul>`;
}

function bondsList(s: LifeState): string {
  if (!s.bonds.length) return '<p class="note">아직 맺은 인연이 없다.</p>';
  return `<ul class="bonds">${s.bonds.map((b) => `
    <li class="${b.alive ? '' : 'dead'}">
      <span class="kind">${b.kind}</span>${esc(ROLE_LABEL[b.role])} · <b>${esc(bondName(b))}</b>${b.resolved ? ' <span class="note">(청산)</span>' : ''}${b.alive ? '' : ' <span class="note">(사망)</span>'}
      <span class="sub">${esc(b.note)}</span>
    </li>`).join('')}</ul>`;
}

const timeline = (s: LifeState): string =>
  `<ul class="timeline">${[...s.log].reverse().map((l) => `<li><span class="when">${l.age}세 ${l.season}</span>${esc(l.text)}</li>`).join('')}</ul>`;

function sidePanel(s: LifeState): string {
  const tabs: [SideTab, string][] = [['sheet', '시트'], ['bonds', '은원록'], ['log', '연표']];
  const body = sideTab === 'sheet' ? sheet(s) : sideTab === 'bonds' ? bondsList(s) : timeline(s);
  return `
    <aside class="panel">
      <div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${sideTab === k ? 'on' : ''}" data-act="tab" data-tab="${k}">${l}</button>`).join('')}</div>
      ${body}
    </aside>`;
}

function mainPanel(s: LifeState): string {
  switch (s.phase) {
    case 'action': return actionPanel(s);
    case 'card': return cardPanel(s);
    case 'result': return resultPanel(s);
    case 'duel': return duelPanel(s);
    default: return '';
  }
}

function renderEnding(s: LifeState): void {
  const e = endingView(s);
  const h = s.hero;
  const c = collection();
  const unresolved = s.bonds.filter((b) => !b.resolved && b.kind === '怨' && b.alive).map((b) => esc(bondName(b))).join(', ');
  app.innerHTML = `
    <div class="narrow">
      <div class="panel ending">
        <div class="cat">${esc(e.category)}</div>
        <h2>${esc(e.title)}</h2>
        <p>${esc(e.text)}</p>
      </div>
      <div class="panel scroll-box">
        <div class="kicker">일대기</div>
        <div class="card-title">${esc(h.name)}${h.alias ? ` · ${esc(h.alias)}` : ''}</div>
        <dl class="kv">
          <dt>향년</dt><dd>${h.age}세</dd>
          <dt>소속</dt><dd>${esc(h.faction)}</dd>
          <dt>경지</dt><dd>${REALMS[h.realm]}</dd>
          <dt>협명</dt><dd>${tierOf(h.fame, FAME_TIERS)} (${h.fame})</dd>
          <dt>악명</dt><dd>${tierOf(h.infamy, INFAMY_TIERS)} (${h.infamy})</dd>
          <dt>미청산</dt><dd>${unresolved || '없음'}</dd>
        </dl>
        <div class="section-h">연표</div>
        ${timeline(s)}
      </div>
      <div class="panel">
        <p class="note">발견한 엔딩 ${Object.keys(c.endings).length} / ${TOTAL_ENDINGS} · 본 카드 ${Object.keys(c.cards).length} / ${CARD_LIST.length}</p>
        <div class="menu" style="width:100%">
          <button class="btn primary" data-act="new">새 인생을 굴린다</button>
          <button class="btn center" data-act="collection">도감 보기</button>
        </div>
      </div>
    </div>`;
}

function renderGame(): void {
  if (!state) return renderTitle();
  if (state.phase === 'birth') return renderBirth(state);
  const s = state;
  if (s.phase === 'childhood') return renderChildhood(s);
  if (s.phase === 'ending') return renderEnding(s);
  app.innerHTML = `<div class="wrap">${topbar(s)}<div class="layout"><main>${mainPanel(s)}</main>${sidePanel(s)}</div></div>`;
}

function render(): void {
  if (screen === 'title') renderTitle();
  else if (screen === 'collection') renderCollection();
  else renderGame();
  window.scrollTo({ top: 0 });
}

// ───────────────────────── 입력

function exportSave(): void {
  const data = loadSave();
  if (!data) return;
  const blob = new Blob([JSON.stringify({ save: data, collection: collection() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `murim-save-${isLife(data) ? data.hero.name : 'birth'}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

importInput.addEventListener('change', () => {
  const file = importInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result)) as { save?: GameState; collection?: Collection };
      if (!data.save || data.save.version !== 2) throw new Error('형식 오류');
      store(SAVE_KEY, data.save);
      if (data.collection) store(COLL_KEY, data.collection);
      state = data.save;
      screen = 'game';
      render();
    } catch {
      alert('세이브 파일을 읽을 수 없습니다.');
    }
  };
  reader.readAsText(file);
  importInput.value = '';
});

app.addEventListener('click', (ev) => {
  const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-act]');
  if (!el || (el as HTMLButtonElement).disabled) return;
  const act = el.dataset.act;
  const nameInput = document.getElementById('hero-name') as HTMLInputElement | null;
  if (nameInput && state?.phase === 'birth') state.pendingName = nameInput.value;

  // 생과 무관한 메뉴
  switch (act) {
    case 'new':
      state = newGame();
      birthAnimated = false;
      screen = 'game';
      save();
      return render();
    case 'continue':
      state = loadSave();
      screen = state ? 'game' : 'title';
      return render();
    case 'title':
      screen = 'title';
      return render();
    case 'collection':
      screen = 'collection';
      return render();
    case 'export':
      return exportSave();
    case 'import':
      return importInput.click();
    case 'tab':
      sideTab = el.dataset.tab as SideTab;
      return renderGame();
  }

  // 탄생 단계
  if (state?.phase === 'birth') {
    const b = state;
    if (act === 'reroll') {
      const key = el.dataset.key as BirthKey;
      rerollBirth(b.birth, key);
      if (key === 'origin' || key === 'entry') b.pendingName = null;
    } else if (act === 'rename') {
      b.pendingName = suggestName(b.birth);
    } else if (act === 'accept') {
      const name = (b.pendingName ?? '').trim() || suggestName(b.birth);
      state = acceptBirth(b, name);
    }
    save();
    return render();
  }

  // 강호
  if (!isLife(state)) return;
  const s = state;
  switch (act) {
    case 'start':
      startJianghu(s);
      break;
    case 'action': {
      const id = el.dataset.id as ActionId;
      pickingRegion = id === '강호행';
      if (!pickingRegion) chooseAction(s, id);
      break;
    }
    case 'go':
      pickingRegion = false;
      chooseAction(s, '강호행', el.dataset.region as Region);
      break;
    case 'cancel-go':
      pickingRegion = false;
      break;
    case 'choose':
      chooseOption(s, Number(el.dataset.i));
      break;
    case 'next':
      continueResult(s);
      if (s.phase === 'ending') recordCollection(s);
      break;
    case 'move':
      duelMove(s, el.dataset.m as Move);
      break;
    default:
      return;
  }
  save();
  render();
});

// 테스트·디버그용
(window as unknown as { __murim: { readonly state: GameState | null } }).__murim = {
  get state() {
    return state;
  },
};

render();
