import type { Card } from '../../types';

// 세상 카드: 매년 겨울 1장
const cards: Card[] = [
  {
    id: 'world_tournament', type: 'world', cooldown: 12, weight: 10,
    when: { age: [16, 40] },
    title: '천하비무대회',
    text: '무림맹이 천하비무대회를 연다는 방이 붙었다. 천하의 젊은 고수들이 모인다. 우승자의 이름은 한 시대를 대표하게 된다.',
    choices: [
      {
        label: '출전한다',
        outcome: {
          duel: {
            foe: { title: '명문의 후기지수', realmRel: 1, stat: 1, style: 'random' },
            intro: '마지막 대진표에 당신의 이름이 올랐다. 비무대 건너편의 상대가 포권한다.',
            win: { fame: 3, xp: 2, tournament: true, text: '비무대 아래에서 함성이 터진다. 당신의 이름이 처음으로 천하에 불렸다.' },
            lose: { wound: 1, xp: 2, text: '졌다. 그러나 비무대 위에서 주고받은 초식은 몸에 남았다.' },
          },
        },
      },
      { label: '구경꾼 자리에서 지켜본다', outcome: { xp: 2, text: '남의 초식을 보는 것도 수련이다. 당신은 세 사람의 버릇을 외워 두었다.' } },
    ],
  },
  {
    id: 'world_plague', type: 'world', cooldown: 16, weight: 8,
    title: '역병',
    text: '겨울 역병이 돈다. 관아는 성문을 닫았다. 정파 문파들은 산문을 걸어 잠갔다. 마을로 들어가는 것은 붉은 띠를 맨 혈교의 의원들뿐이다.',
    choices: [
      {
        label: '혈교 의원들과 함께 마을을 돌본다',
        check: { stat: '기' },
        success: { fame: 3, flags: ['역병구호'], text: '겨우내 당신은 죽을 끓이고 시신을 묻었다. 봄이 오자 혈교의 의원 하나가 당신에게 붉은 띠를 내밀었다. 당신은 받지 않았지만, 고개는 숙였다.' },
        fail: { fame: 2, internal: true, flags: ['역병구호'], text: '역병이 당신에게도 옮았다. 혈교 의원의 피를 받고서야 살아났다.' },
      },
      { label: '역병이 도는 땅을 떠난다', outcome: { text: '살아남는 것도 무인의 일이다. 그렇게 스스로를 달랬다.' } },
    ],
  },
  {
    id: 'world_war', type: 'world', cooldown: 16, weight: 8,
    when: { age: [18, null] },
    title: '정사의 기운',
    text: '천만신교의 신도들이 무림맹의 분타를 불태웠다. 무림맹은 정파 무인들에게 소집령을 내렸다. 그러나 천만신교의 신도 대부분은 정파가 외면한 빈민이라는 소문도 돈다.',
    choices: [
      {
        label: '무림맹의 소집에 응한다',
        check: { stat: '체', foe: 2 },
        success: { fame: 2, xp: 3, flags: ['정사대전참전'], text: '당신이 지킨 언덕은 끝까지 무너지지 않았다.' },
        partial: { fame: 2, wound: 2, woundCause: '전쟁', flags: ['정사대전참전'], text: '언덕은 지켰다. 당신의 몸도 성하지 않다.' },
        fail: { wound: 3, woundCause: '전쟁', flags: ['정사대전참전'], text: '전열이 무너졌다. 당신은 시체 더미 사이에서 깨어났다.' },
      },
      {
        label: '전란에 휩쓸린 백성을 피신시킨다',
        outcome: { fame: 2, text: '정도 사도 아닌 길이다. 피난민의 행렬 맨 뒤에서 당신은 추격대를 막았다.' },
      },
      {
        label: '천만신교의 이야기를 들어 본다',
        outcome: { infamy: 2, flags: ['신교접촉'], text: '신교의 전도사는 당신에게 굶어 죽은 아이들의 이름을 읊었다. 정파의 산문 앞에서 쫓겨난 아이들이었다.' },
      },
    ],
  },
  {
    id: 'world_famine', type: 'world', cooldown: 12, weight: 8,
    title: '흉년',
    text: '흉년이다. 남궁세가가 곡창을 열었다는 소문이 들리지만, 이 고을까지는 닿지 않는다. 길가에 쓰러진 사람들이 늘어 간다.',
    choices: [
      {
        label: '가진 재물을 털어 죽을 쑨다',
        requires: { wealth: 2 },
        outcome: { wealth: -2, fame: 3, text: '솥 하나로 시작한 죽은 겨울이 끝날 때까지 끊이지 않았다.' },
      },
      {
        label: '관아의 곡창을 연다',
        check: { stat: '신', foe: 1 },
        success: { fame: 3, flags: ['관과척'], text: '밤사이 관아 곡창의 자물쇠가 부서졌다. 아무도 누가 했는지 묻지 않았다.' },
        fail: { wound: 2, flags: ['관과척'], text: '관병에게 들켰다. 쌀 한 섬도 꺼내지 못했다.' },
      },
      {
        label: '곡식을 사들여 비싸게 되판다',
        requires: { wealth: 2 },
        outcome: { wealth: 4, infamy: 3, text: '봄이 오기 전 당신의 재산은 두 배가 되었다. 성문 밖에 쌓인 것이 무엇인지 당신은 알고 있었다.' },
      },
      { label: '내 한 몸 건사하기도 버겁다', outcome: { text: '겨울은 길었다.' } },
    ],
  },
  {
    id: 'world_quiet', type: 'world', cooldown: 2, weight: 8,
    title: '눈 내리는 밤',
    text: '한 해가 저문다. 눈이 쌓인 처마 끝에서 고드름이 자란다. 강호도 겨울에는 숨을 고른다.',
    choices: [
      { label: '한 해를 돌아본다', outcome: { xp: 1, text: '지난 일 년의 싸움을 하나씩 떠올린다. 이긴 싸움보다 진 싸움이 더 많은 것을 가르쳐 주었다.' } },
      { label: '그리운 이에게 편지를 쓴다', outcome: { text: '부치지 못할 편지였다. 그래도 썼다.' } },
    ],
  },
];

export default cards;
