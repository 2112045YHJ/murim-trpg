import type { Card } from '../../types';

// 소년기 카드 (13~17세): 아직 강호의 칼끝에 서기 전, 문파와 마을 안에서 벌어지는 일들
const cards: Card[] = [
  {
    id: 'youth_errand', type: 'action', actions: ['의뢰'], cooldown: 4, weight: 14,
    when: { age: [13, 17] },
    title: '산 아래 심부름',
    text: '{문파}의 막내에게 떨어지는 일은 늘 심부름이다. 오늘은 산 아래 약방에 약재 값을 치르고 오라고 한다. 은자 주머니가 생각보다 무겁다. 길목의 주막에서 건달 둘이 그 주머니를 힐끔거린다.',
    choices: [
      {
        label: '눈을 마주치지 않고 걸음을 재촉한다',
        check: { stat: '신', mod: 1 },
        success: { wealth: 1, text: '약방 주인이 심부름 값이라며 동전 몇 닢을 쥐여 준다. 첫 품삯이다.' },
        partial: { text: '건달들이 따라왔지만 약방 문턱을 넘자 돌아섰다. 무사히 끝냈다.' },
        fail: { wealth: -1, wound: 1, text: '골목에서 붙잡혔다. 주머니는 지켰지만 동전 몇 닢과 코피를 잃었다.' },
      },
      {
        label: '먼저 다가가 문파의 이름을 댄다',
        check: { stat: '심', mod: 1 },
        success: { fame: 1, text: '건달들은 문파 이름에 움찔하더니, 오히려 길을 비켜 준다. 이름에는 무게가 있다. 언젠가는 당신의 이름에도.' },
        fail: { wound: 1, text: '"그래서 어쩌라고?" 문파의 이름은 아직 당신을 지켜 주지 못했다.' },
      },
    ],
  },
  {
    id: 'youth_alley', type: 'action', actions: ['협행'], cooldown: 4, weight: 14,
    when: { age: [13, 17] },
    title: '골목의 텃세',
    text: '저잣거리 뒷골목, 덩치 큰 아이들 셋이 작은 아이 하나를 담벼락에 몰아넣고 있다. 작은 아이는 품에 떡 하나를 꼭 끌어안은 채 울지도 않는다.',
    choices: [
      {
        label: '셋 사이로 뛰어든다',
        check: { stat: '체', mod: 1 },
        success: { fame: 1, addBond: { role: '은혜입은자', note: '골목에서 감싸 준 작은 아이' }, text: '셋은 코를 감싸 쥐고 달아났다. 작은 아이가 떡을 반으로 쪼개 내민다. 당신은 그 떡을 오래 기억했다.' },
        partial: { fame: 1, wound: 1, text: '셋을 쫓아냈지만 당신의 눈두덩도 부어올랐다. 작은 아이가 처음으로 웃었다.' },
        fail: { wound: 1, text: '셋은 셋이었다. 그래도 작은 아이는 그 틈에 도망쳤다.' },
      },
      {
        label: '어른을 불러온다',
        check: { stat: '오', mod: 1 },
        success: { fame: 1, text: '당신이 데려온 순라군을 보고 아이들이 흩어졌다. 싸우지 않고 이기는 법도 있다.' },
        fail: { text: '어른들이 왔을 때 골목은 비어 있었다. 떡 부스러기만 남아 있었다.' },
      },
      { label: '못 본 척 지나간다', outcome: { text: '그날 밤 당신은 사부에게 그 이야기를 하지 못했다.' } },
    ],
  },
  {
    id: 'youth_herbs', type: 'action', actions: ['탐색'], cooldown: 4, weight: 14,
    when: { age: [13, 17] },
    title: '뒷산의 약초',
    text: '뒷산 계곡에 백 년 묵은 하수오가 있다는 소문이 동문들 사이에 돈다. 다들 겁을 먹고 가지 않는 계곡이다. 해가 지기 전에 돌아와야 한다.',
    choices: [
      {
        label: '계곡을 끝까지 뒤진다',
        check: { stat: '오', mod: 1 },
        success: { xp: 3, stat: { 기: 1 }, text: '바위틈에서 사람 모양을 한 뿌리를 찾았다. 백 년은 아니어도 수십 년은 묵었다. 씹어 삼키자 단전이 따뜻해진다.' },
        partial: { xp: 1, text: '하수오는 없었다. 대신 계곡의 지형을 익혔다. 다음에는 더 깊이 들어갈 수 있다.' },
        fail: { wound: 1, text: '해가 졌다. 어둠 속에서 넘어져 무릎이 깨졌다. 사형이 횃불을 들고 찾으러 왔다.' },
      },
      {
        label: '동문들과 함께 간다',
        outcome: { xp: 1, text: '여럿이 가니 무섭지 않았다. 하수오는 찾지 못했지만, 그날 계곡에서 나눈 이야기는 오래 남았다.' },
      },
    ],
  },
  {
    id: 'youth_spar', type: 'action', actions: ['수련', '교류'], cooldown: 4, weight: 12,
    when: { age: [13, 18] },
    title: '동문 비무',
    text: '한 달에 한 번, 같은 배분의 제자들끼리 비무를 한다. 오늘 당신의 상대는 입문이 석 달 빠른 동문이다. 지켜보는 사람들 사이에 사부의 얼굴도 보인다.',
    choices: [
      {
        label: '정면으로 맞선다',
        check: { stat: '신', foe: 0 },
        success: { xp: 3, fame: 1, text: '마지막 일 합에서 동문의 목검을 쳐 냈다. 사부가 고개를 아주 조금 끄덕였다.' },
        partial: { xp: 2, text: '비겼다. 서로의 어깨에 멍이 하나씩 생겼다.' },
        fail: { xp: 2, text: '졌다. 그러나 무엇 때문에 졌는지는 알았다. 그것이면 됐다.' },
      },
      {
        label: '상대의 버릇을 먼저 살핀다',
        check: { stat: '오', mod: 1 },
        success: { xp: 3, text: '동문은 공격하기 직전 왼발에 힘을 싣는다. 당신은 그 순간을 기다렸다.' },
        fail: { xp: 1, text: '살피는 사이 이미 한 대 맞았다. 보는 것도 빨라야 한다.' },
      },
    ],
  },
  {
    id: 'youth_master_lesson', type: 'action', actions: ['수련'], cooldown: 6, weight: 10,
    when: { age: [13, 17], bond: '사부' },
    title: '사부의 첫 가르침',
    text: '사부가 당신을 새벽 절벽 끝으로 데려간다. 절벽 아래로 구름이 흐른다. "무공을 왜 배우느냐." 사부가 묻는다. 대답에 따라 사부가 가르쳐 줄 것이 달라질 것 같다.',
    choices: [
      { label: '"강해지고 싶습니다."', outcome: { xp: 3, text: '"솔직하구나." 사부는 그날 당신에게 쉬지 않고 마보를 시켰다. 강해지는 길에는 지름길이 없다.' } },
      { label: '"지키고 싶은 사람이 있습니다."', outcome: { xp: 2, fame: 1, text: '사부는 한참 말이 없다가, 처음으로 당신의 어깨에 손을 얹었다. "그 마음을 잊지 마라."' } },
      {
        label: '"갚아야 할 것이 있습니다."',
        requires: { enemy: true },
        outcome: { xp: 3, flags: ['복수의다짐'], text: '사부의 눈이 흐려진다. "원한은 칼을 날카롭게 하지만, 칼을 쥔 손도 벤다." 그래도 사부는 그날부터 당신에게 살수(殺手)를 가르쳤다.' },
      },
    ],
  },
];

export default cards;
