import type { Card } from '../../types';

// 행동 카드 + 범용 카드
const cards: Card[] = [
  // ─────────── 수련
  {
    id: 'train_dawn', type: 'action', actions: ['수련'], cooldown: 2, weight: 12,
    title: '새벽 수련',
    text: '닭이 울기 전, 당신은 수련터에 선다. {주무공}의 첫 초식부터 마지막 초식까지, 어제와 같은 동작을 다시 펼친다. 같은 동작 속에서 어제와 다른 것을 찾아야 한다.',
    choices: [
      {
        label: '한 초식씩 뜻을 새기며 반복한다',
        check: { stat: '오' },
        success: { xp: 3, text: '초식과 초식 사이의 이음새가 처음으로 보인다. 몸이 먼저 알고 있던 것을 머리가 따라잡는다.' },
        partial: { xp: 2, text: '조금은 나아졌다. 아직 손에 잡히지는 않는다.' },
        fail: { xp: 1, text: '몸은 움직였지만 마음은 다른 곳에 가 있었다.' },
      },
      {
        label: '몸이 부서질 때까지 몰아붙인다',
        check: { stat: '체', mod: -1 },
        success: { xp: 5, text: '해가 중천에 뜰 무렵, 당신은 쓰러지듯 주저앉는다. 그러나 어제의 한계는 이미 등 뒤에 있다.' },
        partial: { xp: 3, wound: 1, text: '근육이 찢어지는 소리를 들었다. 그래도 얻은 것이 있다.' },
        fail: { xp: 1, internal: true, text: '기혈이 거꾸로 치솟는다. 억지로 밀어붙인 대가로 내상을 입었다.' },
      },
      {
        label: '사형에게 대련을 청한다',
        requires: { bond: '사형' },
        check: { stat: '신' },
        success: { xp: 4, text: '{사형}의 목검이 당신의 어깨에 닿기 직전 멈춘다. "제법이구나." 사형의 웃음에 처음으로 인정이 섞여 있다.' },
        partial: { xp: 3, wound: 1, text: '몇 번 얻어맞았다. 그래도 사형의 버릇 하나를 알아냈다.' },
        fail: { xp: 2, wound: 1, text: '사형의 목검이 사정없이 정강이를 후려친다. "다시."' },
      },
    ],
  },
  {
    id: 'train_wall', type: 'action', actions: ['수련'], cooldown: 10, weight: 12,
    when: { realm: [2, null] },
    title: '벽',
    text: '몇 달째 같은 자리를 맴돌고 있다. 수련의 양을 늘려도 경지는 꿈쩍하지 않는다. 무인들은 이것을 벽이라 부른다. 벽 앞에서 주저앉은 자가 넘은 자보다 훨씬 많다.',
    choices: [
      {
        label: '홀로 폐관 수련에 든다',
        check: { stat: '심', mod: -1 },
        success: { insight: 1, xp: 3, text: '보름째 되던 밤, 단전에서 무언가가 소리 없이 무너진다. 벽에 금이 갔다.' },
        partial: { xp: 3, text: '벽은 그대로다. 그러나 벽이 어디에 있는지는 조금 더 분명해졌다.' },
        fail: { internal: true, text: '조급함이 기를 흩뜨렸다. 폐관은 내상만 남기고 끝났다.' },
      },
      {
        label: '목숨을 건 싸움에서 답을 찾는다',
        outcome: {
          duel: {
            foe: { title: '떠돌이 고수', realmRel: 1, stat: 1, style: 'random' },
            intro: '당신은 이름난 떠돌이 고수를 찾아가 생사결을 청한다.',
            win: { insight: 1, xp: 4, fame: 1, text: '마지막 합에서 상대의 검이 당신의 목을 스치고 지나갔다. 그 찰나, 당신은 무언가를 보았다.' },
            lose: { wound: 2, xp: 2, text: '상대는 당신을 죽이지 않았다. "벽은 남의 칼로 넘는 것이 아니다."' },
          },
        },
      },
      {
        label: '벽을 인정하고 기본으로 돌아간다',
        outcome: { xp: 2, text: '당신은 처음 무공을 배우던 날의 마보 자세로 돌아간다. 서두르지 않기로 한다.' },
      },
    ],
  },
  {
    id: 'train_deviation', type: 'action', actions: ['수련'], cooldown: 12, weight: 5,
    when: { realm: [1, null] },
    title: '주화입마의 조짐',
    text: '운기를 하던 중, 단전에서 치솟은 기운이 엉뚱한 경맥으로 흘러든다. 눈앞이 붉게 물들고 귀에서 이명이 울린다. 여기서 잘못 움직이면 평생을 망친다.',
    choices: [
      {
        label: '기를 억지로 눌러 다스린다',
        check: { stat: '기', mod: -1 },
        success: { xp: 4, text: '폭주하던 기운이 제 길을 찾아 흐른다. 위기를 넘기자 내력이 한 겹 두꺼워졌다.' },
        partial: { xp: 2, internal: true, text: '겨우 다스렸지만 경맥 한 곳이 상했다.' },
        fail: { internal: true, wound: 2, text: '경맥이 끊어질 듯 비명을 지른다. 피를 토하고 쓰러졌다.' },
      },
      {
        label: '운기를 멈추고 기운이 흩어지게 둔다',
        outcome: { text: '쌓아 두었던 내력의 일부가 흩어졌다. 그러나 몸은 무사하다. 살아 있으면 다시 쌓을 수 있다.' },
      },
      {
        label: '사부에게 도움을 청한다',
        requires: { bond: '사부' },
        outcome: { xp: 3, text: '사부의 손바닥이 등에 닿는다. 따뜻한 기운이 엉킨 경맥을 하나씩 풀어 간다. "급하구나, 너는." 사부는 그 이상 말하지 않았다.' },
      },
    ],
  },

  // ─────────── 협행
  {
    id: 'chiv_bandits', type: 'action', actions: ['협행'], weight: 10,
    when: { age: [16, null] },
    title: '고갯마을의 밤',
    text: '고갯마을에 산적 떼가 내려온다는 소문이 돈다. 관아는 움직이지 않는다. 마을 사람들은 문을 걸어 잠근 채 문틈으로 당신을 바라본다. {외모_반응}',
    choices: [
      {
        label: '마을 어귀에서 산적을 막아선다',
        check: { stat: '체', foe: 1 },
        success: { fame: 2, flags: ['산적격퇴'], text: '두목의 칼이 부러지자 산적들이 흩어진다. 다음 날 아침, 마을 문들이 하나씩 열린다.' },
        partial: { fame: 2, wound: 1, text: '산적들은 물러갔다. 당신의 옆구리에도 칼자국 하나가 남았다.' },
        fail: { fame: 1, wound: 2, text: '혼자로는 역부족이었다. 그래도 당신이 버틴 덕에 마을 사람들은 산으로 피할 수 있었다.' },
      },
      {
        label: '산채로 찾아가 두목과 담판을 짓는다',
        check: { stat: '심' },
        success: { fame: 2, addBond: { role: '지기', note: '담판 끝에 마음을 돌린 녹림의 두목' }, text: '두목은 한참 당신을 노려보다 술잔을 내민다. "배짱 하나는 인정하지." 그해 겨울, 그 고개에서 약탈은 없었다.' },
        fail: { wound: 1, text: '말이 통하지 않았다. 당신은 쫓겨나듯 산채를 빠져나왔다.' },
      },
      {
        label: '산적 두목과 손잡고 마을의 몫을 나눈다',
        outcome: { wealth: 3, infamy: 3, flags: ['녹림결탁'], text: '두목은 당신에게 술잔과 은자 주머니를 함께 내밀었다. 그 겨울 고갯마을의 곳간은 비었고, 당신의 주머니는 무거워졌다.' },
      },
      {
        label: '남의 일이다. 길을 재촉한다',
        outcome: { flags: ['외면'], text: '등 뒤로 닫힌 문들이 오래 기억에 남는다.' },
      },
    ],
  },
  {
    id: 'chiv_field', type: 'action', actions: ['협행'], weight: 9,
    title: '빼앗긴 밭',
    text: '현령의 처남이 과부의 밭을 빼앗았다. 위조된 땅문서 한 장이면 충분했다. 과부는 관아 앞에 사흘째 엎드려 있다. 지나가던 사람들은 고개를 돌린다.',
    choices: [
      {
        label: '처남을 찾아가 흠씬 두들겨 준다',
        check: { stat: '신', foe: 0 },
        success: { fame: 2, flags: ['관과척'], text: '처남은 땅문서를 찢으며 빌었다. 관과는 척을 졌지만, 과부는 밭으로 돌아갔다.' },
        fail: { fame: 1, wound: 1, flags: ['관과척'], text: '처남의 호위들에게 둘러싸였다. 겨우 빠져나왔지만 일은 해결되지 않았다.' },
      },
      {
        label: '땅문서의 위조를 밝혀낸다',
        check: { stat: '오' },
        success: { fame: 3, text: '인장의 획 하나가 달랐다. 증거 앞에서는 현령도 어쩔 수 없었다.' },
        partial: { fame: 1, text: '위조는 밝혀냈지만 처남은 벌을 받지 않았다. 그래도 밭은 돌아왔다.' },
        fail: { text: '증거가 부족했다. 과부는 아무 말 없이 고개를 숙였다.' },
      },
      {
        label: '처남에게 붙어 뒷돈을 챙긴다',
        outcome: { wealth: 3, infamy: 2, text: '처남은 당신 같은 무인이 곁에 있으니 든든하다며 웃었다. 과부는 그날 이후 관아 앞에 나오지 않았다.' },
      },
      {
        label: '내 돈으로 밭을 되사 준다',
        requires: { wealth: 2 },
        outcome: { wealth: -2, fame: 2, text: '처남은 돈을 받고 문서를 내주었다. 옳은 방법이었는지는 모르겠다. 과부의 눈물만은 진짜였다.' },
      },
    ],
  },
  {
    id: 'chiv_children', type: 'action', actions: ['협행'], weight: 8, cooldown: 10,
    when: { age: [16, null] },
    title: '팔려 가는 아이들',
    text: '밤길에 휘장을 친 마차 한 대가 지나간다. 휘장 틈으로 작은 손이 보였다. 마부의 허리에는 칼이 둘. 마차는 국경 쪽으로 향하고 있다.',
    choices: [
      {
        label: '마차를 습격한다',
        check: { stat: '신', foe: 1 },
        success: { fame: 3, flags: ['아이구함'], addBond: { role: '은혜입은자', note: '인신매매 마차에서 구한 아이' }, text: '마부들이 쓰러지고 휘장이 걷힌다. 다섯 아이가 당신을 올려다본다. 가장 어린 아이가 당신의 옷자락을 놓지 않는다.' },
        partial: { fame: 3, wound: 1, flags: ['아이구함'], addBond: { role: '은혜입은자', note: '인신매매 마차에서 구한 아이' }, text: '칼끝이 팔을 스쳤다. 그래도 아이들은 모두 무사하다.' },
        fail: { wound: 2, text: '마부들은 생각보다 강했다. 쓰러진 당신을 두고 마차는 어둠 속으로 사라졌다.' },
      },
      {
        label: '몰래 뒤를 밟아 배후를 캔다',
        check: { stat: '오', mod: -1 },
        success: { fame: 2, flags: ['인신매매배후'], text: '마차가 멈춘 곳은 하오문의 한 객잔이었다. 하오문 전체의 짓은 아니다. 썩은 가지가 하나 있을 뿐이다. 당신은 그 가지를 잘라 냈다.' },
        fail: { text: '마차를 놓쳤다. 바퀴 자국은 강가에서 끊겼다.' },
      },
      {
        label: '못 본 척한다',
        outcome: { flags: ['외면'], infamy: 2, text: '휘장 틈의 작은 손이, 그날 밤 꿈에 나왔다.' },
      },
    ],
  },

  // ─────────── 의뢰
  {
    id: 'job_escort', type: 'action', actions: ['의뢰'], weight: 10, cooldown: 3,
    when: { age: [16, null] },
    title: '표행',
    text: '표국이 곡식 수레 호위를 맡긴다. 사흘째 되던 날, 숲길에서 수십 명이 길을 막는다. 손에 든 것은 칼이 아니라 몽둥이와 낫이다. 다들 뼈만 앙상하다.',
    choices: [
      {
        label: '표물을 지킨다',
        check: { stat: '체', foe: 0 },
        success: { wealth: 2, fame: 1, text: '아무도 죽이지 않고 길을 텄다. 표두는 당신의 어깨를 두드렸다.' },
        partial: { wealth: 2, wound: 1, text: '표물은 지켰다. 낫에 베인 상처가 욱신거린다.' },
        fail: { wound: 2, text: '수레 하나를 잃었다. 표국은 품삯을 깎았다.' },
      },
      {
        label: '본보기로 몇을 베어 길을 연다',
        outcome: { wealth: 3, infamy: 3, text: '세 사람이 쓰러지자 나머지는 낫을 버리고 흩어졌다. 표두는 일이 빨리 끝났다며 품삯을 얹어 주었다. 숲길에 남은 것들을 당신은 돌아보지 않았다.' },
      },
      {
        label: '그들의 사정을 듣는다',
        check: { stat: '심' },
        success: { fame: 2, wealth: 1, text: '가뭄에 쫓겨난 유민들이었다. 당신은 곡식 한 수레를 나눠 주고 길을 텄다. 표두는 못마땅해했지만 아무도 다치지 않았다.' },
        fail: { wound: 1, text: '말을 거는 사이 누군가 돌을 던졌다. 싸움이 붙었고, 아무도 이기지 못했다.' },
      },
    ],
  },
  {
    id: 'job_bounty', type: 'action', actions: ['의뢰'], weight: 9, cooldown: 8,
    when: { age: [17, null] },
    title: '현상범',
    text: '현상금 방에 붙은 얼굴을 쫓아 사흘을 걸었다. 마침내 찾은 사내는 산골 오두막에서 병든 노모의 죽을 끓이고 있었다. "나는 사람을 죽이지 않았소." 사내가 말한다.',
    choices: [
      {
        label: '그래도 관아에 넘긴다',
        outcome: { wealth: 3, infamy: 2, text: '사내는 저항하지 않았다. 현상금은 두둑했다. 오두막의 노모가 어떻게 되었는지는 모른다.' },
      },
      {
        label: '놓아준다',
        outcome: { fame: 2, addBond: { role: '은혜입은자', note: '산골 오두막에서 놓아준 현상범' }, text: '당신은 현상금 방의 종이를 찢어 아궁이에 넣는다. 사내는 무릎을 꿇고 오래 일어나지 않았다.' },
      },
      {
        label: '진범을 찾아 준다',
        check: { stat: '오', mod: -1 },
        success: { fame: 3, wealth: 2, text: '진범은 사건을 처음 고발한 자였다. 관아는 늦게나마 현상금을 진범에게 옮겨 붙였다.' },
        fail: { text: '단서는 모두 끊겨 있었다. 당신은 빈손으로 돌아섰다. 사내도 어디론가 사라졌다.' },
      },
    ],
  },

  // ─────────── 탐색
  {
    id: 'expl_cliff', type: 'action', actions: ['탐색'], once: true, weight: 8,
    title: '절벽 아래',
    text: '약초꾼이 말하길, 저 절벽 아래에는 해마다 이상한 바람이 분다고 한다. 내려다보니 덩굴에 가려진 동굴 입구가 보인다. 절벽은 까마득하다.',
    choices: [
      {
        label: '덩굴을 타고 내려간다',
        check: { stat: '신' },
        success: { xp: 4, art: 'cliff_sword', flags: ['기연_절벽'], text: '동굴 벽에는 백 년 전 누군가 손가락으로 새긴 검흔이 빽빽하다. 그 옆에 뼈만 남은 무인이 앉아 있다. 당신은 그에게 절하고, 사흘 밤낮으로 벽을 읽었다.' },
        partial: { xp: 2, wound: 1, text: '동굴은 비어 있었다. 바닥에 남은 발자국으로 보아 누군가 먼저 다녀간 모양이다.' },
        fail: { wound: 2, text: '덩굴이 끊어졌다. 떨어지는 동안 당신은 이것이 기연인지 죽음인지 생각할 겨를도 없었다.' },
      },
      {
        label: '위험하다. 표시만 해 두고 돌아간다',
        outcome: { text: '돌아서는 등 뒤로 다시 바람이 분다. 언젠가 다시 오게 될 것 같다.' },
      },
    ],
  },
  {
    id: 'expl_ruin', type: 'action', actions: ['탐색'], once: true, weight: 7,
    title: '폐문된 문파',
    text: '잡초에 묻힌 산문에는 이름이 지워져 있다. 무너진 사당 안, 제단 위 옥함에서 은은한 약향이 흘러나온다. 제단 뒤에는 이 문파 사람들의 무덤이 줄지어 있다.',
    choices: [
      {
        label: '영약을 취한다',
        outcome: { stat: { 기: 1 }, infamy: 1, addBond: { role: '숙적', note: '폐문된 문파의 마지막 후손', realmRel: 1 }, text: '영약이 목을 넘어가자 단전이 뜨거워진다. 사당을 나서는데, 무너진 담 너머에서 누군가 당신을 지켜보고 있었다.' },
      },
      {
        label: '무덤에 절하고 그대로 둔다',
        outcome: { fame: 1, xp: 1, text: '당신은 무덤마다 술을 한 잔씩 붓는다. 남의 문파가 쌓은 것을 함부로 가져갈 수는 없다.' },
      },
    ],
  },
  {
    id: 'expl_enemy_rumor', type: 'action', actions: ['탐색'], weight: 7, cooldown: 8,
    when: { enemy: true },
    title: '원수의 그림자',
    text: '{원수}의 흔적이 있다는 소문을 들었다. 소문은 늘 반쯤은 거짓이다. 그래도 나머지 반을 위해 당신은 길을 나선다.',
    choices: [
      {
        label: '소문을 끝까지 쫓는다',
        check: { stat: '오' },
        success: { xp: 2, flags: ['원수단서'], text: '객잔 주인의 기억, 마부의 증언, 강가의 발자국. 조각들이 하나의 방향을 가리킨다.' },
        fail: { text: '헛걸음이었다. 소문의 주인공은 엉뚱한 사람이었다.' },
      },
      {
        label: '지금은 힘을 기를 때다',
        outcome: { xp: 2, text: '서두르면 놓친다. 당신은 원수의 이름을 가슴에 묻고 수련으로 돌아간다.' },
      },
    ],
  },

  // ─────────── 교류
  {
    id: 'soc_master', type: 'action', actions: ['교류'], weight: 10, cooldown: 6,
    when: { bond: '사부' },
    title: '사부의 술잔',
    text: '사부 {사부}가 드물게 술상을 차렸다. 두 사람 사이에 놓인 잔은 둘인데, 사부는 세 번째 잔에도 술을 따른다. 그 잔의 주인은 오래전에 떠났다고 한다.',
    choices: [
      {
        label: '세 번째 잔의 주인을 묻는다',
        outcome: { xp: 1, flags: ['사부의과거'], text: '사부는 젊은 날 지키지 못한 사제의 이야기를 한다. "무공이 높다고 다 지킬 수 있는 게 아니다. 그걸 잊지 마라."' },
      },
      {
        label: '가르침을 청한다',
        check: { stat: '오' },
        success: { xp: 4, text: '사부는 젓가락 하나로 당신의 초식을 세 번 막고, 네 번째에 당신의 손목을 짚는다. "여기다." 그 한마디가 일 년의 수련보다 무겁다.' },
        fail: { xp: 2, text: '사부의 말은 알 듯 말 듯하다. 언젠가는 알게 될 것이다.' },
      },
    ],
  },
  {
    id: 'soc_inn_ronin', type: 'action', actions: ['교류', '강호행'], weight: 8, cooldown: 10,
    title: '객잔의 낭인',
    text: '객잔 구석, 칼집이 다 해진 낭인이 술값이 모자라 주인과 실랑이를 벌인다. 낭인의 손은 굳은살투성이다. 오래 칼을 잡아 온 손이다.',
    choices: [
      {
        label: '술값을 대신 내고 합석한다',
        outcome: { addBond: { role: '지기', note: '객잔에서 술잔을 나눈 낭인' }, text: '낭인은 사양하지 않았다. 새벽까지 이어진 이야기 끝에, 둘은 서로의 칼을 한 번씩 뽑아 보였다.' },
      },
      {
        label: '모른 척 지나친다',
        outcome: { text: '강호에서 스쳐 가는 인연은 많다.' },
      },
    ],
  },
  {
    id: 'soc_sibling_leaves', type: 'action', actions: ['교류'], once: true, weight: 6,
    when: { bond: '사형', age: [17, null] },
    title: '떠나려는 사형',
    text: '사형 {사형}이 짐을 꾸리고 있다. "여기서는 더 오를 데가 없다. 나는 강호로 간다." 사형의 눈빛이 예전과 다르다. 무언가에 쫓기는 사람의 눈이다.',
    choices: [
      {
        label: '붙잡는다',
        check: { stat: '심' },
        success: { fame: 1, xp: 1, text: '밤새 이야기를 나눈 끝에 사형은 짐을 풀었다. 쫓기던 것이 무엇인지는 끝내 말하지 않았다.' },
        fail: { resolveBond: '사형', flags: ['사형떠남'], text: '사형은 당신의 손을 뿌리쳤다. "너는 모른다." 문이 닫혔다.' },
      },
      {
        label: '보내 준다',
        outcome: { resolveBond: '사형', flags: ['사형떠남'], text: '당신은 말없이 사형의 짐 하나를 들어 산문 밖까지 배웅한다. 언젠가 다른 모습으로 다시 만나게 될 것이다.' },
      },
    ],
  },

  // ─────────── 요양
  {
    id: 'rest_blood_doctor', type: 'action', actions: ['요양'], weight: 8, cooldown: 6,
    title: '혈교의 의원',
    text: '상처가 곪아 열이 오른다. 근처에서 침을 놓는 이는 혈교의 의원뿐이다. 정파 사람들은 혈교를 사교라 부르지만, 마을 사람들은 그 의원 덕에 지난 역병을 넘겼다고 한다.',
    choices: [
      {
        label: '치료를 받는다',
        outcome: { heal: 2, text: '의원은 제 팔에서 뽑은 피를 약에 섞었다. "피는 나누라고 있는 것이오." 열이 내렸다.' },
      },
      {
        label: '사교의 손은 빌리지 않는다',
        outcome: { text: '당신은 홀로 상처를 싸맸다. 낫는 데 오래 걸릴 것이다.' },
      },
    ],
  },
  {
    id: 'rest_quiet', type: 'action', actions: ['요양'], weight: 6, cooldown: 3,
    title: '느린 계절',
    text: '상처가 아무는 동안 할 수 있는 일은 많지 않다. 창밖으로 계절이 지나간다. 지나온 길이 하나둘 떠오른다.',
    choices: [
      {
        label: '지난 싸움들을 되짚는다',
        check: { stat: '오' },
        success: { xp: 2, text: '그때 왜 졌는지, 이제야 보인다.' },
        fail: { text: '생각은 자꾸 엉뚱한 곳으로 흘렀다.' },
      },
      {
        label: '아무 생각 없이 쉰다',
        outcome: { heal: 1, text: '오랜만에 깊이 잠들었다.' },
      },
    ],
  },

  // ─────────── 범용 (볼 카드가 없을 때)
  {
    id: 'gen_inn_brawl', type: 'generic', weight: 10, cooldown: 4,
    title: '객잔의 소란',
    text: '술에 취한 무인이 점소이의 멱살을 잡고 있다. 국이 식었다는 이유다. 객잔 안의 누구도 일어서지 않는다. {외모_반응}',
    choices: [
      {
        label: '말린다',
        check: { stat: '체', foe: 0 },
        success: { fame: 1, text: '무인의 손목을 잡아 비틀자 그는 술이 깬 얼굴이 된다. 점소이가 몇 번이고 고개를 숙인다.' },
        fail: { wound: 1, text: '무인의 주먹은 술 취한 사람 것치고 너무 매웠다.' },
      },
      {
        label: '무인을 반쯤 죽여 놓는다',
        check: { stat: '체', foe: 0 },
        success: { infamy: 2, xp: 1, text: '무인은 이를 몇 개 잃고 기어서 나갔다. 객잔 안의 누구도 당신과 눈을 맞추지 않는다. 점소이조차.' },
        fail: { infamy: 1, wound: 1, text: '서로 피투성이가 되었다. 객잔 주인이 둘 다 내쫓았다.' },
      },
      {
        label: '술값을 대신 치르고 달랜다',
        requires: { wealth: 1 },
        outcome: { wealth: -1, fame: 1, text: '돈 앞에서 무인의 화는 금세 식었다. 점소이는 당신에게만 따뜻한 국을 내왔다.' },
      },
      {
        label: '모른 척한다',
        outcome: { text: '강호의 일이 다 당신의 일은 아니다.' },
      },
    ],
  },
  {
    id: 'gen_road', type: 'generic', weight: 10, cooldown: 3,
    title: '길 위의 계절',
    text: '{지역}의 길 위에서 한 계절이 지나간다. 특별한 일은 없었다. 강호의 날들은 대개 이렇게 흘러간다.',
    choices: [
      { label: '걸으며 내공을 다스린다', outcome: { xp: 1, text: '걸음마다 호흡을 맞춘다. 길이 곧 수련터다.' } },
      { label: '길가의 사람들을 살핀다', outcome: { fame: 1, text: '짐을 진 노인을 돕고, 길 잃은 아이를 마을까지 데려다주었다. 아무도 당신의 이름을 묻지 않았다.' } },
    ],
  },
  {
    id: 'gen_rain_elder', type: 'generic', weight: 6, cooldown: 12,
    title: '비 오는 밤의 노인',
    text: '비를 피해 들어간 폐사당에 노인 하나가 앉아 차를 끓이고 있다. 노인의 옆에 놓인 지팡이에서 희미한 검기가 느껴진다.',
    choices: [
      {
        label: '차를 얻어 마시며 가르침을 청한다',
        check: { stat: '심' },
        success: { xp: 3, text: '노인은 찻잔에 비친 당신의 얼굴을 가리킨다. "검보다 그 얼굴이 먼저 흔들리는구나." 날이 밝자 노인은 보이지 않았다.' },
        fail: { xp: 1, text: '노인은 빗소리 이야기만 하다 잠들었다.' },
      },
      {
        label: '경계하며 밤을 지새운다',
        outcome: { text: '아무 일도 없었다. 노인은 새벽에 조용히 떠났다.' },
      },
    ],
  },
];

export default cards;
