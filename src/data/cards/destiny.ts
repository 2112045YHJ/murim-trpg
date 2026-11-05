import type { Card } from '../../types';

// 숙명 줄기(8-5) + 인연 카드
const cards: Card[] = [
  // ─────────── 멸문지화
  {
    id: 'd_ruin_trace', type: 'destiny', once: true, weight: 10,
    when: { destiny: '멸문지화', age: [16, null], notFlags: ['ruin1'] },
    actions: ['탐색', '강호행', '협행'],
    title: '불탄 문패',
    text: '옛 집터에 다시 섰다. 잡초 사이로 반쯤 탄 문패가 보인다. 문패에는 칼자국이 남아 있다. 그날 밤의 칼자국이다.',
    choices: [
      {
        label: '검흔을 살핀다',
        check: { stat: '오' },
        success: { flags: ['ruin1'], text: '아래에서 위로 비스듬히 그은 자국. 끝에서 살짝 비튼다. 이런 검로를 쓰는 문파는 천하에 몇 없다. 범위가 좁혀졌다.' },
        fail: { text: '아직은 읽어 낼 눈이 없다. 당신은 문패를 품에 넣고 돌아선다.' },
      },
      {
        label: '부모의 무덤부터 돌본다',
        outcome: { fame: 1, flags: ['ruin1'], text: '무덤의 풀을 뽑다가 무덤 뒤에 꽂힌 부러진 칼끝을 발견했다. 그날 밤 아버지가 마지막으로 벤 것이다.' },
      },
    ],
  },
  {
    id: 'd_ruin_name', type: 'destiny', once: true, weight: 10,
    when: { flags: ['ruin1'], notFlags: ['ruin2'] },
    actions: ['탐색', '교류', '강호행', '의뢰'],
    title: '원수의 이름',
    text: '그 검로를 쓰는 자들을 하나씩 지워 나간다. 마지막에 남은 이름은 셋. 그중 그 해 겨울 당신의 고향 근처를 지난 자는 한 명뿐일 것이다.',
    choices: [
      {
        label: '하오문 정보상에게 묻는다',
        requires: { bond: '정보상' },
        outcome: { flags: ['ruin2'], revealBond: '멸문원수', text: '정보상은 값을 받지 않았다. "그 이름은 공짜로 드리지요. 대신 저를 잊어 주십시오." 종이에 적힌 이름은 {멸문원수}.' },
      },
      {
        label: '직접 발로 뛴다',
        check: { stat: '오', mod: -1 },
        success: { flags: ['ruin2'], revealBond: '멸문원수', text: '석 달을 걸었다. 그 해 겨울 객잔 장부에 남은 이름 하나. {멸문원수}.' },
        fail: { text: '세 이름 모두 그 해의 행적이 비어 있었다. 아직 더 찾아야 한다.' },
      },
    ],
  },
  {
    id: 'd_ruin_family', type: 'destiny', once: true, weight: 10,
    when: { flags: ['ruin2'], notFlags: ['ruin3'] },
    actions: ['탐색', '강호행', '협행', '교류'],
    title: '원수의 딸',
    text: '{멸문원수}는 작은 마을에서 의원 노릇을 하며 살고 있었다. 마을 사람들은 그를 존경한다. 그에게는 열 살 남짓한 딸이 있다. 그날 밤의 당신과 같은 나이다.',
    choices: [
      {
        label: '한동안 지켜본다',
        outcome: { flags: ['ruin3'], insight: 1, text: '그자는 매일 아침 딸의 머리를 땋아 주고, 돈 없는 환자에게 약을 그냥 내준다. 당신의 칼은 칼집 안에서 무거워진다.' },
      },
      {
        label: '당장 칼을 뽑는다',
        outcome: { flags: ['ruin3'], next: 'd_ruin_duel' },
      },
    ],
  },
  {
    id: 'd_ruin_duel', type: 'destiny', cooldown: 8, weight: 12,
    when: { flags: ['ruin3'], notFlags: ['ruin_done'], enemyGap: { role: '멸문원수', max: 1 } },
    actions: ['탐색', '협행', '강호행', '수련', '교류'],
    title: '결전',
    text: '달이 밝은 밤, 당신은 {멸문원수}의 집 앞에 선다. 그자는 이미 알고 있었다는 듯 검을 들고 나온다. "언젠가 올 줄 알았다. 그날 밤 문 뒤에 숨어 있던 아이."',
    choices: [
      {
        label: '결투를 청한다',
        outcome: {
          duel: {
            foe: '멸문원수',
            intro: '{멸문원수}가 검을 비스듬히 든다. 그날 밤의 그 검로다.',
            win: { next: 'd_ruin_choice' },
            lose: { wound: 3, woundCause: '결투', flags: ['원수에게패배'], text: '{멸문원수}의 검이 당신의 가슴을 그었다. 그자는 칼을 거두었다. "살아서 다시 와라. 그때는 끝을 내자."' },
          },
        },
      },
      { label: '아직 때가 아니다', outcome: { text: '당신은 돌아선다. 그자도 당신을 쫓지 않는다.' } },
    ],
  },
  {
    id: 'd_ruin_choice', type: 'destiny', only: true,
    title: '칼끝',
    text: '{멸문원수}가 무릎을 꿇었다. 칼끝이 그자의 목에 닿아 있다. 문 뒤에서 그자의 딸이 당신을 보고 있다. 그날 밤의 당신처럼.',
    choices: [
      {
        label: '벤다',
        outcome: { killBond: '멸문원수', flags: ['원수처단', 'ruin_done'], text: '칼이 내려갔다. 스무 해를 기다린 순간은 생각보다 짧았다. 문 뒤의 아이가 비명을 지르지 않았다는 것이, 오래도록 당신을 괴롭혔다.' },
      },
      {
        label: '살려 보낸다',
        outcome: { resolveBond: '멸문원수', fame: 3, insight: 1, flags: ['원수용서', 'ruin_done'], text: '당신은 칼을 거둔다. "그 아이가 나처럼 되지 않게 하라." {멸문원수}는 땅에 이마를 대고 오래 일어나지 않았다.' },
      },
      {
        label: '베고, 그 딸을 거둔다',
        outcome: { killBond: '멸문원수', flags: ['원수처단', '원수자식', 'ruin_done'], addBond: { role: '제자', note: '당신이 벤 원수의 딸' }, text: '당신은 원수를 베고, 그 딸에게 손을 내민다. 아이는 그 손을 잡지 않았다. 그래도 당신을 따라왔다. 언젠가 이 아이가 당신에게 칼을 겨눌지도 모른다.' },
      },
    ],
  },

  // ─────────── 사부의 원수
  {
    id: 'd_master_rumor', type: 'destiny', once: true, weight: 10,
    when: { destiny: '사부의 원수', age: [16, null], notFlags: ['m1'] },
    title: '명숙의 이름',
    text: '사부의 기일. 무덤가에서 마주친 늙은 표사가 말한다. "그날 밤, 그 분과 함께 떠난 사람을 봤소. 지금은 무림맹의 장로가 되었지."',
    choices: [
      {
        label: '그 이름을 묻는다',
        outcome: { flags: ['m1'], revealBond: '사부원수', text: '표사는 주위를 살피고 낮게 말했다. {사부원수}. 정파에서 그 이름을 모르는 사람은 없다.' },
      },
      {
        label: '믿을 수 없다. 증거를 찾는다',
        check: { stat: '오' },
        success: { flags: ['m1'], revealBond: '사부원수', xp: 1, text: '사부의 유품 속 서신 한 통. 마지막 약속 상대의 이름은 {사부원수}였다.' },
        fail: { text: '증거는 나오지 않았다. 표사의 말만 귀에 남았다.' },
      },
    ],
  },
  {
    id: 'd_master_truth', type: 'destiny', once: true, weight: 10,
    when: { flags: ['m1'], notFlags: ['m2'], realm: [2, null] },
    title: '명숙의 진실',
    text: '당신은 {사부원수}를 찾아갔다. 그는 도망치지 않았다. "네 사부는 내 아내와 아들을 죽였다. 나는 이십 년을 기다렸다가 갚았을 뿐이다." 그의 눈에는 거짓이 없다.',
    choices: [
      {
        label: '그래도 사부의 원수다',
        outcome: { flags: ['m2'], next: 'd_master_duel' },
      },
      {
        label: '원한을 내려놓는다',
        outcome: { flags: ['m2', '원수용서', 'm_done'], resolveBond: '사부원수', fame: 2, insight: 1, text: '원한은 원한을 낳는다. 당신은 그 고리를 여기서 끊기로 한다. 사부의 무덤 앞에서 당신은 오래 용서를 빌었다. 누구에게 비는 것인지는 당신도 몰랐다.' },
      },
      {
        label: '증거를 요구한다',
        check: { stat: '오' },
        success: { flags: ['m2', '사부의진실'], insight: 1, text: '그가 내민 것은 사부의 필체로 쓴 참회문이었다. 사부는 알고 있었다. 언젠가 이 사람이 올 것을.' },
        fail: { flags: ['m2'], next: 'd_master_duel', text: '"증거? 내 가족의 무덤이 증거다." 그가 검을 뽑았다.' },
      },
    ],
  },
  {
    id: 'd_master_duel', type: 'destiny', cooldown: 8, weight: 12,
    when: { flags: ['m2'], notFlags: ['m_done'], bond: '사부원수', enemyGap: { role: '사부원수', max: 1 } },
    title: '사부의 검으로',
    text: '{사부원수}와 마주 선다. 당신이 펼치는 것은 사부에게 배운 검이다. 그는 그 검을 누구보다 잘 안다.',
    choices: [
      {
        label: '검을 뽑는다',
        outcome: {
          duel: {
            foe: '사부원수',
            win: { next: 'd_master_end' },
            lose: { wound: 3, woundCause: '결투', text: '{사부원수}는 당신의 검을 모두 읽고 있었다. "네 사부의 버릇까지 그대로구나." 그는 칼을 거두고 떠났다.' },
          },
        },
      },
      { label: '아직은 이길 수 없다', outcome: { xp: 1, text: '당신은 물러선다. 더 강해져야 한다.' } },
    ],
  },
  {
    id: 'd_master_end', type: 'destiny', only: true,
    title: '두 개의 무덤',
    text: '{사부원수}가 쓰러졌다. 그는 피를 토하며 웃는다. "이걸로 됐다. 나도 이제 처자식 곁으로 간다." 그의 품에서 낡은 위패 두 개가 떨어진다.',
    choices: [
      {
        label: '끝을 맺는다',
        outcome: { killBond: '사부원수', flags: ['원수처단', 'm_done'], text: '사부의 원수를 갚았다. 당신은 그의 위패를 사부의 무덤 옆에 함께 묻었다. 둘이 저승에서 무슨 말을 나눌지는 모르겠다.' },
      },
      {
        label: '의원에게 업고 간다',
        outcome: { resolveBond: '사부원수', fame: 3, flags: ['원수용서', 'm_done'], text: '그는 살아났다. 그리고 다시는 검을 잡지 않았다. 이따금 그가 사부의 무덤에 술을 붓고 간다는 소식이 들린다.' },
      },
    ],
  },

  // ─────────── 빚진 목숨
  {
    id: 'd_debt_seek', type: 'destiny', once: true, weight: 9,
    when: { destiny: '빚진 목숨', bond: '은인', notFlags: ['은인찾음'], age: [17, null] },
    actions: ['탐색', '교류', '강호행'],
    title: '은인의 행방',
    text: '당신을 물에서 건진 사람. 얼굴만 기억할 뿐 이름도 모른다. 그날의 강가 마을을 다시 찾아간다. 늙은 뱃사공이 그 날을 기억하고 있을지도 모른다.',
    choices: [
      {
        label: '마을 사람들을 하나하나 찾아 묻는다',
        check: { stat: '오', mod: -1 },
        success: { flags: ['은인찾음'], revealBond: '은인', markDead: '은인', schedule: { card: 'd_debt_family', seasons: 2 }, text: '뱃사공이 이름을 기억했다. {은인}. 그는 당신을 건진 이듬해 역병으로 세상을 떠났다고 한다. 남은 가족이 있다.' },
        fail: { text: '그 날을 기억하는 사람은 아무도 없었다.' },
      },
      { label: '강가에 술 한 잔을 붓는다', outcome: { text: '이름 모를 은인에게. 언젠가 찾겠다고.' } },
    ],
  },
  {
    id: 'd_debt_family', type: 'destiny', only: true,
    title: '은인의 가족',
    text: '{은인}의 아들이 빚에 쫓기고 있다. 빚쟁이들이 집 앞에 진을 쳤다. 아들은 당신이 누구인지 모른다. 그의 얼굴에서 그날 강가의 얼굴이 보인다.',
    choices: [
      {
        label: '빚을 대신 갚는다',
        requires: { wealth: 3 },
        outcome: { wealth: -3, fame: 2, flags: ['은혜갚음'], resolveBond: '은인', text: '당신은 빚 문서를 받아 아들 앞에서 태웠다. "당신 아버지께 진 빚이오." 아들은 끝내 영문을 몰랐다. 그것으로 됐다.' },
      },
      {
        label: '빚쟁이들을 쫓아낸다',
        check: { stat: '체', foe: 1 },
        success: { fame: 2, flags: ['은혜갚음'], resolveBond: '은인', text: '빚쟁이들의 우두머리는 당신의 손에 팔이 꺾인 채 빚 문서를 내놓았다.' },
        fail: { wound: 2, text: '빚쟁이들 뒤에는 고수가 있었다. 오늘은 물러날 수밖에 없다.' },
      },
      {
        label: '평생 이 가족을 돌보겠다고 맹세한다',
        outcome: { fame: 1, flags: ['은혜갚음', '맹세'], resolveBond: '은인', addBond: { role: '은혜입은자', note: '은인의 아들' }, text: '당신은 은인의 무덤 앞에서 맹세했다. 맹세는 빚보다 무겁다.' },
      },
    ],
  },

  // ─────────── 누명
  {
    id: 'd_framed_hunter', type: 'destiny', cooldown: 8, weight: 9,
    when: { destiny: '누명', notFlags: ['누명해소'], age: [15, null] },
    title: '현상금 사냥꾼',
    text: '객잔 문이 열리고 칼을 찬 사내 셋이 들어온다. 맨 앞의 사내가 현상금 방의 종이를 펼친다. 종이 속 얼굴과 당신을 번갈아 본다.',
    choices: [
      {
        label: '맞서 싸운다',
        check: { stat: '체', foe: 2 },
        success: { infamy: 1, xp: 2, text: '셋은 피를 흘리며 물러났다. 소문은 이렇게 날 것이다. 살인자가 또 칼을 휘둘렀다고.' },
        fail: { wound: 2, text: '겨우 창문으로 빠져나왔다.' },
      },
      {
        label: '창문으로 몸을 날린다',
        check: { stat: '신' },
        success: { text: '지붕을 세 채 건넜다. 그들은 따라오지 못했다.' },
        fail: { wound: 1, text: '등에 비도 하나가 꽂혔다.' },
      },
      {
        label: '결백을 호소한다',
        check: { stat: '심', mod: -1 },
        success: { flags: ['진범단서'], text: '사냥꾼의 우두머리가 한참 당신을 보다가 칼을 내린다. "의뢰인이 수상하긴 했지." 그가 의뢰인의 인상착의를 흘린다.' },
        fail: { wound: 1, text: '사냥꾼들은 듣지 않았다.' },
      },
    ],
  },
  {
    id: 'd_framed_truth', type: 'destiny', cooldown: 6, weight: 12,
    when: { flags: ['진범단서'], notFlags: ['누명해소'], bond: '진범' },
    title: '진범',
    text: '단서를 따라간 끝에, 당신은 한 상단의 호위무사장을 찾아냈다. 그날 밤의 피해자는 상단의 장부를 쥐고 있었다고 한다. 호위무사장이 당신을 보고 칼자루에 손을 얹는다.',
    choices: [
      {
        label: '진범과 맞선다',
        outcome: {
          revealBond: '진범',
          duel: {
            foe: '진범',
            win: { flags: ['누명해소'], resolveBond: '진범', infamy: -2, fame: 2, text: '{진범}은 관아 앞에 무릎 꿇고 모든 것을 자백했다. 현상금 방의 당신 얼굴이 떼어졌다.' },
            lose: { wound: 3, woundCause: '결투', text: '{진범}의 칼이 더 빨랐다. 그자는 당신을 죽은 줄 알고 떠났다.' },
          },
        },
      },
      {
        label: '증거를 모아 관아에 넘긴다',
        check: { stat: '오' },
        success: { revealBond: '진범', flags: ['누명해소'], resolveBond: '진범', infamy: -2, text: '장부의 사본, 그날 밤의 목격자, {진범}의 피 묻은 소매. 관아는 더 이상 외면하지 못했다.' },
        fail: { text: '관아는 증거를 묵살했다. 진범이 이미 손을 써 둔 것이다.' },
      },
    ],
  },

  // ─────────── 인연 카드
  {
    id: 'bond_rival_returns', type: 'bond', cooldown: 12, weight: 10,
    when: { bond: '숙적', age: [18, null] },
    title: '숙적',
    text: '{숙적}이(가) 당신 앞에 나타났다. 그날 폐문된 문파의 사당에서 당신을 지켜보던 그 눈이다. "그 영약은 우리 사부님의 마지막 유품이었다."',
    choices: [
      {
        label: '검으로 답한다',
        outcome: {
          duel: {
            foe: '숙적',
            win: { resolveBond: '숙적', fame: 1, xp: 2, text: '{숙적}은 칼을 떨어뜨리고 웃었다. "다음에는 내가 이긴다." 그는 돌아서며 처음으로 당신의 이름을 불렀다.' },
            lose: { wound: 2, text: '{숙적}의 칼끝이 당신의 목 앞에서 멈췄다. "아직 아니다." 그는 떠났다.' },
          },
        },
      },
      {
        label: '빚을 갚겠다고 말한다',
        check: { stat: '심' },
        success: { resolveBond: '숙적', fame: 2, addBond: { role: '지기', note: '숙적이었다가 지기가 된 폐문 문파의 후손' }, text: '당신은 그의 문파 무덤을 다시 세우는 일을 돕겠다고 했다. 그는 한참 말이 없다가, 술병을 내밀었다.' },
        fail: { wound: 1, text: '"말로 갚을 빚이 아니다." 칼이 날아왔다.' },
      },
    ],
  },
  {
    id: 'bond_kindness_returns', type: 'bond', cooldown: 12, weight: 9,
    when: { bond: '은혜입은자', age: [19, null] },
    title: '은혜의 답례',
    text: '낯선 사람이 당신을 찾아왔다. 아니, 낯설지 않다. {은혜입은자}. 그때 당신이 도왔던 그 사람이다. 손에 보따리 하나를 들고 있다.',
    choices: [
      {
        label: '반갑게 맞는다',
        outcome: { resolveBond: '은혜입은자', wealth: 2, heal: 1, text: '보따리에는 귀한 약재와 은자가 들어 있었다. "그때 받은 것에 비하면 아무것도 아닙니다." 당신은 강호의 셈법이 늘 돈으로만 맞춰지지는 않는다는 것을 안다.' },
      },
      {
        label: '답례는 받지 않는다',
        outcome: { resolveBond: '은혜입은자', fame: 2, text: '당신은 보따리를 돌려보냈다. 대신 그는 당신의 이야기를 고향 마을에 퍼뜨렸다.' },
      },
    ],
  },
  {
    id: 'bond_friend_ambush', type: 'bond', once: true, weight: 9,
    when: { bond: '지기', age: [18, null] },
    title: '지기의 위기',
    text: '급한 전갈이 왔다. {지기}가 매복에 걸려 산채에 갇혔다고 한다. 전갈을 가져온 아이의 말이 어딘가 어색하다. 함정일 수도 있다.',
    choices: [
      {
        label: '앞뒤 재지 않고 달려간다',
        check: { stat: '신', foe: 2 },
        success: { fame: 2, xp: 2, text: '당신이 산채의 문을 부수고 들어갔을 때, {지기}는 묶인 채로도 웃고 있었다. "늦었다, 이놈아."' },
        partial: { fame: 2, wound: 2, text: '함정이었다. 그래도 당신은 지기를 끌고 나왔다. 둘 다 피투성이였다.' },
        fail: { killBond: '지기', wound: 2, flags: ['지기를잃다'], text: '늦었다. 당신이 도착했을 때 {지기}는 이미 식어 있었다.' },
      },
      {
        label: '함정임을 간파하고 뒤로 돌아간다',
        check: { stat: '오' },
        success: { fame: 2, text: '당신은 전갈과 반대 방향에서 산채를 쳤다. 매복은 텅 빈 길목을 지키고 있었다.' },
        fail: { killBond: '지기', flags: ['지기를잃다'], text: '돌아가는 사이 시간이 너무 흘렀다.' },
      },
    ],
  },
];

export default cards;
