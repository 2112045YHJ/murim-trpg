import type { Card } from '../../types';

// 지역 카드 + 문파 카드
const cards: Card[] = [
  // ─────────── 화산
  {
    id: 'hwasan_volcano_night', type: 'region', once: true, weight: 12,
    when: { region: '화산', enemy: true, age: [17, null] },
    title: '분화의 밤',
    text: '분화 경종이 울린다. 산 아래 마을의 등불이 하나둘 흔들린다. 그리고 객잔 2층 창가, {원수}의 얼굴이 보인다. 그자는 분화를 틈타 떠날 것이다. 마을에는 삼백 명이 산다.',
    choices: [
      {
        label: '마을 사람들의 대피를 돕는다',
        outcome: { fame: 2, flags: ['분화대피', '원수놓침'], addBond: { role: '은혜입은자', note: '분화의 밤에 업어 나른 마을 아이' }, text: '당신은 밤새 아이와 노인을 업어 날랐다. 새벽, 객잔 2층의 창은 비어 있었다. 한 아이가 당신의 소매를 붙잡고 이름을 물었다.' },
      },
      {
        label: '원수를 쫓는다',
        check: { stat: '신' },
        success: {
          duel: {
            foe: 'enemy',
            intro: '불비가 쏟아지는 고갯길에서 당신은 {원수}의 앞을 가로막는다.',
            win: { flags: ['원수와검을섞다'], fame: 1, xp: 3, text: '{원수}는 피를 흘리며 연기 속으로 사라졌다. 끝은 아니다. 그러나 그자는 이제 당신을 안다.' },
            lose: { wound: 2, woundCause: '분화', text: '{원수}의 칼이 당신을 화산재 속에 처박았다. 그자는 돌아보지도 않았다.' },
          },
        },
        fail: { wound: 2, woundCause: '분화', flags: ['외면한밤', '원수놓침'], text: '연기 속에서 그자를 놓쳤다. 돌아왔을 때 마을의 절반이 잿더미였다.' },
      },
      {
        label: '아이를 업은 채로 원수를 쫓는다',
        requires: { boneTier: 3 },
        check: { stat: '체', mod: -1 },
        success: { fame: 3, flags: ['분화대피'], xp: 3, text: '아이를 업고도 당신의 걸음은 느려지지 않았다. {원수}는 당신의 기세에 눌려 칼을 버리고 달아났다. 마을 사람들은 그날 밤을 오래 이야기했다.' },
        fail: { fame: 1, wound: 2, woundCause: '분화', flags: ['원수놓침'], text: '아이는 살렸다. 원수는 놓쳤다. 둘 다 가질 수는 없었다.' },
      },
    ],
  },
  {
    id: 'hwasan_eruption', type: 'region', cooldown: 12, weight: 10,
    when: { region: '화산', faction: '화산파' },
    actions: ['협행', '수련', '의뢰', '탐색'],
    title: '분화 경종',
    text: '세 번의 경종. 분화다. 화산파 제자들은 검 대신 들것을 든다. 장로가 외친다. "산 아래부터! 문파는 나중이다!" 분화구의 붉은빛이 하늘을 물들인다.',
    choices: [
      {
        label: '가장 깊은 마을로 들어간다',
        check: { stat: '체', mod: -1 },
        success: { fame: 3, flags: ['분화대피'], text: '당신이 마지막 노인을 업고 나오는 순간, 등 뒤에서 마을이 불길에 잠겼다.' },
        partial: { fame: 3, wound: 2, woundCause: '분화', flags: ['분화대피'], text: '용암의 열기에 등이 익었다. 그래도 아무도 두고 오지 않았다.' },
        fail: { fame: 2, wound: 3, woundCause: '분화', flags: ['분화대피'], text: '무너지는 처마가 당신을 덮쳤다. 동료들이 당신을 끌어냈을 때, 당신은 숨이 붙어 있는 것만으로도 다행이었다.' },
      },
      {
        label: '산문을 지키라는 명을 따른다',
        outcome: { xp: 1, text: '당신은 산문에서 피난민을 받았다. 그해 분화구 비석에는 새 이름이 일곱 개 새겨졌다.' },
      },
    ],
  },
  {
    id: 'hwasan_crater', type: 'region', once: true, weight: 14,
    when: { region: '화산', bone: '구음절맥', notFlags: ['절맥극복'] },
    actions: ['수련', '탐색', '강호행', '협행'],
    title: '분화구의 열기',
    text: '화산파에는 오래된 전설이 있다. 분화구 가장자리의 열기는 어떤 한기도 녹인다고. 당신의 손끝은 오늘도 얼음처럼 차다. 스무 살이 가까워지고 있다.',
    choices: [
      {
        label: '분화구 가장자리에서 운기한다',
        check: { stat: '기', mod: -1 },
        success: { flags: ['절맥극복'], xp: 3, text: '열기가 경맥을 태우듯 파고든다. 칠 주야가 지나자, 평생 얼어 있던 심맥 하나가 녹았다. 손끝에 처음으로 온기가 돈다.' },
        partial: { wound: 1, text: '열기를 견디지 못하고 물러섰다. 아직은 몸이 버티지 못한다.' },
        fail: { wound: 3, woundCause: '분화', text: '한기와 열기가 몸 안에서 부딪쳤다. 동료들이 당신을 업고 내려왔다.' },
      },
      { label: '아직은 때가 아니다', outcome: { text: '분화구의 붉은빛이 당신의 등을 비춘다.' } },
    ],
  },
  {
    id: 'hwasan_stone', type: 'region', once: true, weight: 14,
    when: { region: '화산', destiny: '빚진 목숨', bond: '은인' },
    actions: ['탐색', '협행', '강호행', '교류'],
    title: '비석의 이름',
    text: '분화구 아래 검은 비석에는 분화 때 백성을 구하다 죽은 화산파 제자들의 이름이 빼곡하다. 당신은 문득 생각한다. 어린 날 당신을 건져 올린 그 사람도, 화산파의 옷을 입고 있었다.',
    choices: [
      {
        label: '비석의 이름을 하나하나 읽는다',
        check: { stat: '오' },
        success: { flags: ['은인찾음'], revealBond: '은인', markDead: '은인', schedule: { card: 'd_debt_family', seasons: 2 }, text: '스무 해 전 날짜 옆, {은인}. 당신이 물에 빠졌던 그 해, 그 강가 마을의 분화. 은인은 당신을 건진 뒤 다시 불 속으로 들어갔다. 비석 아래에 그의 가족이 사는 곳이 적혀 있다.' },
        fail: { text: '이름이 너무 많다. 당신은 해가 질 때까지 읽다가 돌아섰다.' },
      },
      { label: '향을 하나 피우고 돌아선다', outcome: { fame: 1, text: '누구의 이름이든, 이 비석 앞에서는 고개를 숙여야 한다.' } },
    ],
  },
  {
    id: 'hwasan_elder_test', type: 'faction', once: true, weight: 10,
    when: { faction: '화산파', realm: [1, null] },
    title: '장로의 시험',
    text: '매화검법의 정식 전수를 받으려면 장로의 시험을 통과해야 한다. 시험장은 분화구 가장자리. 장로가 검 끝에 불꽃을 피운다. "내 불꽃 셋을 꺼 보아라."',
    choices: [
      {
        label: '검기로 불꽃을 벤다',
        check: { stat: '신', foe: 2 },
        success: { xp: 4, fame: 1, flags: ['화산정식제자'], text: '세 번째 불꽃이 꺼지자 장로가 처음으로 웃는다. "이제 너도 화산의 검이다."' },
        fail: { xp: 2, wound: 1, text: '불꽃 하나도 끄지 못했다. 장로는 "내년에 다시 오너라" 하고 등을 돌렸다.' },
      },
      {
        label: '불꽃이 아니라 장로의 검을 본다',
        check: { stat: '오', mod: -1 },
        success: { xp: 3, insight: 1, flags: ['화산정식제자'], text: '불꽃은 검이 흔들릴 때만 일렁였다. 당신은 장로의 검이 멈추는 순간을 기다려 단 한 번 찔렀다. 장로가 오래 말이 없었다.' },
        fail: { xp: 1, text: '보이는 것이 없었다. 불꽃이 당신의 앞머리를 그슬렸다.' },
      },
    ],
  },

  // ─────────── 아미산
  {
    id: 'emei_lost_squad', type: 'region', once: true, weight: 12,
    when: { region: '아미산', age: [16, null] },
    title: '낙오자',
    text: '아미파 분대가 마교 추격 중 계곡에 갇혔다. 살아 나온 막내 제자가 당신에게 매달린다. "분대장님이 아직 저 안에 계십니다." 계곡 안쪽에서 총성이 띄엄띄엄 들려온다. 아미의 군율상 외부인은 작전에 낄 수 없다.',
    choices: [
      {
        label: '분대장을 구하러 계곡에 들어간다',
        check: { stat: '신', foe: 2 },
        success: { fame: 3, flags: ['아미구출'], addBond: { role: '지기', note: '계곡에서 구해 낸 아미파 분대장' }, text: '피투성이 분대장은 당신을 보고 먼저 경례부터 했다. "외부인의 개입은 군율 위반이오." 그러고는 웃었다. "고맙소, 전우."' },
        partial: { fame: 3, wound: 2, woundCause: '구출', flags: ['아미구출'], addBond: { role: '지기', note: '계곡에서 구해 낸 아미파 분대장' }, text: '분대장을 업고 나오는 동안 등에 탄 두 발을 맞았다. 그래도 둘 다 살아 나왔다.' },
        fail: { fame: 2, wound: 3, woundCause: '구출', text: '계곡은 함정이었다. 당신은 분대장 곁에 쓰러졌고, 두 사람은 아미의 지원 분대가 올 때까지 서로를 지켰다.' },
      },
      {
        label: '막내와 함께 아미파 본진에 알린다',
        check: { stat: '신' },
        success: { fame: 2, text: '곤륜의 전령도 부럽지 않을 걸음이었다. 지원 분대가 제때 도착했다.' },
        fail: { fame: 1, text: '지원 분대가 도착했을 때는 늦었다. 분대장의 총만 돌아왔다.' },
      },
      {
        label: '아미의 일은 아미가 한다',
        outcome: { flags: ['외면'], text: '총성은 해가 질 무렵 멎었다.' },
      },
    ],
  },
  {
    id: 'emei_range_exam', type: 'faction', cooldown: 8, weight: 10,
    when: { faction: '아미파' },
    title: '진급 사격 시험',
    text: '백 보 밖 과녁, 탄은 세 발. 내공을 실은 탄은 과녁을 꿰뚫어야 한다. 옆 사로의 분대원 손이 떨린다. 그는 이번에 떨어지면 하산해야 한다.',
    choices: [
      {
        label: '시험에만 집중한다',
        check: { stat: '신' },
        success: { xp: 3, fame: 1, text: '세 발 모두 과녁 중심을 꿰뚫었다. 교관이 고개를 끄덕인다.' },
        fail: { xp: 1, text: '마지막 탄이 빗나갔다. 다음 기회를 기다려야 한다.' },
      },
      {
        label: '분대원의 호흡을 잡아 준다',
        check: { stat: '심' },
        success: { fame: 2, xp: 1, addBond: { role: '지기', note: '사격 시험에서 함께 통과한 분대원' }, text: '당신의 낮은 구령에 맞춰 그의 손떨림이 멎는다. 둘 다 통과했다. "전우를 버리지 않는다." 그는 그 말을 처음으로 이해한 얼굴이었다.' },
        fail: { xp: 1, text: '당신은 통과했고 그는 떨어졌다. 그날 밤 그의 침상이 비었다.' },
      },
    ],
  },

  // ─────────── 사천
  {
    id: 'sichuan_poisoned', type: 'region', cooldown: 10, weight: 10,
    when: { region: '사천', age: [16, null] },
    title: '독에 쓰러진 무인',
    text: '길가에 무인 하나가 쓰러져 있다. 입술이 검푸르고 손끝이 얼얼하게 떨린다. 당가의 독이다. 사천 사람들은 다 안다. 당가의 독은 당가만 풀 수 있고, 당가는 독에 당한 자라면 원수라도 해독해 준다는 것을.',
    choices: [
      {
        label: '당가로 업고 간다',
        outcome: { fame: 2, addBond: { role: '은혜입은자', note: '당가의 독에서 구해 준 무인' }, text: '당가의 의원은 무인의 얼굴을 보고 잠시 멈칫했다. 원수 가문의 사람이었다. 그래도 의원은 해독약을 꺼냈다. "규율은 규율이오."' },
      },
      {
        label: '직접 해독한다',
        requires: { faction: '사천당가' },
        check: { stat: '오' },
        success: { fame: 2, xp: 2, addBond: { role: '은혜입은자', note: '직접 해독해 준 무인' }, text: '세 가지 독이 겹쳐 있었다. 당신은 순서대로 풀어냈다. 무인이 눈을 뜨고 처음 한 말은 당가에 대한 욕이었다. 그래도 그는 살았다.' },
        fail: { internal: true, text: '독이 당신의 손으로 번졌다. 당신도 무인도 가까스로 살아남았다.' },
      },
      {
        label: '독을 쓴 자를 쫓는다',
        check: { stat: '신', foe: 2 },
        success: { fame: 1, flags: ['독수추적'], text: '독을 쓴 자는 당가에서 파문당한 자였다. 당신은 그를 당가에 넘겼다.' },
        fail: { wound: 2, text: '추격하던 중 독침 하나가 당신의 어깨에 박혔다.' },
      },
    ],
  },
  {
    id: 'sichuan_informant', type: 'region', once: true, weight: 12,
    when: { region: '사천', notBond: '정보상' },
    actions: ['협행', '탐색', '의뢰', '강호행', '교류'],
    title: '하오문의 점소이',
    text: '사천 성도의 큰 객잔. 점소이가 국을 내려놓으며 낮게 말한다. "손님이 찾는 사람, 저희가 알 수도 있습니다." 하오문은 모든 객잔의 귀다. 그 귀에는 값이 매겨져 있다.',
    choices: [
      {
        label: '술값을 넉넉히 치른다',
        requires: { wealth: 1 },
        outcome: { wealth: -1, addBond: { role: '정보상', note: '사천 객잔의 하오문 점소이' }, text: '점소이는 은자를 소매에 넣고 웃었다. "앞으로 필요하시면, 국이 식었다고만 하십시오."' },
      },
      {
        label: '정중히 부탁한다',
        check: { stat: '심', mod: -1, looks: true },
        success: { addBond: { role: '정보상', note: '사천 객잔의 하오문 점소이' }, text: '점소이는 한참 당신을 보더니 고개를 끄덕였다. "손님 같은 분은 처음입니다. 이번은 그냥 해 드리지요."' },
        fail: { text: '점소이는 웃으며 빈 그릇을 치웠다. 거래는 없었다.' },
      },
      {
        label: '멱살을 잡고 입을 연다',
        check: { stat: '체' },
        success: { infamy: 2, addBond: { role: '정보상', kind: '怨', note: '겁박해 입을 연 하오문 점소이' }, text: '점소이는 떨며 아는 것을 다 털어놓았다. 그의 눈에 원한이 남았다.' },
        fail: { flags: ['하오문미움'], text: '다음 날부터 사천의 어느 객잔도 당신에게 방을 내주지 않았다.' },
      },
    ],
  },
  {
    id: 'dang_family_council', type: 'faction', once: true, weight: 10,
    when: { faction: '사천당가', age: [17, null] },
    title: '가문 회의',
    text: '당가는 가문 밖으로 혼인하지 않는다. 독공의 비밀이 새지 않게 하기 위해서다. 그런데 사촌 누이가 외부인과 정을 통했다. 가문 회의는 둘에게 산공독(散功毒)을 내리기로 했다. 당신에게도 한 표가 있다.',
    choices: [
      {
        label: '회의장에서 사촌의 편에 선다',
        check: { stat: '심', mod: -1 },
        success: { fame: 2, flags: ['가문과척'], text: '당신의 말에 원로 두 명이 표를 바꿨다. 사촌은 파문으로 끝났다. 목숨은 건졌다.' },
        fail: { wound: 1, flags: ['가문과척'], text: '당신의 표는 묻혔다. 회의가 끝나고 가주는 당신을 오래 바라보았다.' },
      },
      {
        label: '가문의 법을 따른다',
        outcome: { xp: 2, text: '법은 법이다. 당신은 그날 밤 잠을 이루지 못했다.' },
      },
      {
        label: '둘을 몰래 도망시킨다',
        check: { stat: '신' },
        success: { fame: 2, addBond: { role: '은혜입은자', note: '가문의 법을 피해 도망시킨 사촌 누이' }, text: '새벽 안개 속으로 두 사람이 사라졌다. 사촌이 마지막으로 돌아보며 입 모양으로 말했다. 잊지 않겠다고.' },
        fail: { wound: 1, flags: ['가문과척'], text: '문을 나서기도 전에 들켰다. 둘은 붙잡혔고, 당신은 사당에 갇혔다.' },
      },
    ],
  },
];

export default cards;
