// 9장 엔딩: 조건을 만족하는 것 중 조건이 가장 많은(구체적인) 엔딩을 고른다
import type { Ending } from '../types';

export const ENDINGS: Ending[] = [
  {
    id: 'ending_peerless', category: '무(武)의 끝', title: '천하제일인',
    when: { realm: [6, null], flags: ['비무우승'] },
    text: '{별호}. 그 이름 앞에서 천하의 검이 고개를 숙였다. 그러나 정상에서 내려다본 강호는, 오르기 전 올려다보던 강호보다 훨씬 쓸쓸했다.',
  },
  {
    id: 'ending_sword_broken', category: '무(武)의 끝', title: '검을 꺾다', bonus: -2,
    when: { retired: true, realm: [5, null], notBond: '제자' },
    text: '화경의 경지에 오른 {이름}은 어느 날 검을 꺾어 산문 앞에 묻었다. 아무에게도 무공을 전하지 않았다. 그 검법은 그와 함께 강호에서 사라졌다.',
  },
  {
    id: 'ending_hollow_revenge', category: '복수', title: '복수 끝의 허무',
    when: { flags: ['원수처단'], fame: [null, 12] },
    text: '원수는 죽었다. 그 뒤로 {이름}은 무엇을 위해 검을 잡아야 하는지 알지 못했다. 복수는 그의 생 전부였고, 그것이 끝났을 때 남은 것은 아무것도 없었다.',
  },
  {
    id: 'ending_enemy_child', category: '복수', title: '원수의 자식을 기르다',
    when: { flags: ['원수자식'], age: [45, null] },
    text: '{이름}이 거둔 원수의 딸은 자라서 그의 가장 뛰어난 제자가 되었다. 그녀는 끝내 스승에게 칼을 겨누지 않았다. 스승의 장례 날, 그녀는 아버지와 스승의 위패를 나란히 놓았다.',
  },
  {
    id: 'ending_forgiveness', category: '복수', title: '원수를 용서하다',
    when: { flags: ['원수용서'], fame: [15, null] },
    text: '{이름}은 원수의 목에서 칼을 거두었다. 강호는 그를 겁쟁이라 부르기도, 성인이라 부르기도 했다. 그가 끊어 낸 원한의 고리 덕에, 다음 세대의 누군가는 칼을 잡지 않아도 되었다.',
  },
  {
    id: 'ending_nameless_hero', category: '협(俠)', title: '이름 없는 협객',
    when: { realm: [null, 2], fame: [25, null] },
    text: '{이름}의 무공은 끝내 일류를 넘지 못했다. 그러나 그가 지나간 마을마다 그의 이야기가 남았다. 무림의 기록에는 없는 이름, 백성의 기억에만 남은 이름.',
  },
  {
    id: 'ending_hwasan_stone', category: '협(俠)', title: '화산의 비석',
    when: { faction: '화산파', dead: true, deathCause: '분화' },
    text: '분화구 아래 검은 비석에 새 이름이 새겨졌다. {이름}. 그는 마지막 순간까지 산 아래 마을을 향해 있었다. 화산파의 제자들은 지금도 분화 경종이 울리면 그 이름을 먼저 부른다.',
  },
  {
    id: 'ending_emei_comrade', category: '협(俠)', title: '전우를 버리지 않았다',
    when: { dead: true, deathCause: '구출' },
    text: '{이름}은 동료를 구하러 들어간 곳에서 돌아오지 못했다. 아미파 분대는 그의 시신을 끝까지 메고 나왔다. "전우를 버리지 않는다." 그날 이후 아미산의 신병들은 그의 이름으로 그 말을 배운다.',
  },
  {
    id: 'ending_debt_repaid', category: '협(俠)', title: '은혜를 갚다',
    when: { flags: ['은혜갚음'], fame: [10, null] },
    text: '물에서 건져진 목숨은 평생 은혜를 갚는 데 쓰였다. {이름}의 무덤 옆에는 {은인}의 무덤이 있다. 둘은 생전에 한 번도 이름을 나누지 못했지만, 지금은 나란히 누워 있다.',
  },
  {
    id: 'ending_cleared', category: '협(俠)', title: '누명을 벗다',
    when: { flags: ['누명해소'] },
    text: '현상금 방에서 {이름}의 얼굴이 떼어진 날, 그는 처음으로 객잔의 문을 정면으로 열고 들어갔다. 누명은 벗었다. 그러나 쫓기던 세월이 남긴 버릇은 평생 그를 떠나지 않았다.',
  },
  {
    id: 'ending_both_sides', category: '사마(邪魔)', title: '정파의 적, 백성의 은인',
    when: { infamy: [10, null], fame: [18, null] },
    text: '정파의 현상금 방에는 {별호}의 얼굴이 붙었고, 백성의 사당에는 그의 위패가 놓였다. 무엇이 옳았는지는 아무도 판단하지 못했다. 그 자신조차도.',
  },
  {
    id: 'ending_dark_path', category: '사마(邪魔)', title: '피의 이름',
    when: { infamy: [15, null] },
    text: '{별호}. 강호에서 그 이름은 피 냄새와 함께 불렸다. 그는 자신이 처음 칼을 잡던 날 무엇을 지키려 했는지 끝내 기억해 내지 못했다.',
  },
  {
    id: 'ending_early_genius', category: '비극', title: '요절한 천재',
    when: { dead: true, bone: ['구음절맥', '천골'], age: [null, 24] },
    text: '{이름}은 스물다섯을 넘기지 못했다. 그가 남긴 몇 개의 초식을 본 고수들은 입을 모아 말했다. 십 년만 더 살았다면, 천하가 그의 이름을 알았을 것이라고.',
  },
  {
    id: 'ending_unfinished', category: '비극', title: '끝나지 않은 원한',
    when: { dead: true, unresolvedEnemy: true },
    text: '{이름}은 {원수}에게 닿지 못한 채 쓰러졌다. 그가 품에 지니고 다니던 원수의 이름이 적힌 종이는 피에 젖어 읽을 수 없게 되었다. 원한은 아직 강호 어딘가에 살아 있다.',
  },
  {
    id: 'ending_fallen_friend', category: '비극', title: '지기를 잃은 자',
    when: { flags: ['지기를잃다'], retired: true },
    text: '{이름}은 남은 생 동안 해마다 한 번, 술 두 잔을 따랐다. 한 잔은 자신의 것, 한 잔은 늦게 도착한 그날 밤의 몫이었다.',
  },
  {
    id: 'ending_ordinary', category: '평범', title: '평범한 생',
    when: { retired: true },
    text: '{이름}은 강호를 떠나 작은 마을에 터를 잡았다. 아이들에게 마보 자세를 가르치고, 봄이면 밭을 갈았다. 그의 이름을 기억하는 무인은 많지 않았다. 그는 그것이 좋았다.',
  },
  {
    id: 'ending_long_life', category: '평범', title: '천수를 누리다',
    when: { dead: true, deathCause: '천수' },
    text: '{이름}은 많은 것을 보고 많은 것을 잃은 끝에, 자신의 자리에서 조용히 눈을 감았다. 무인이 침상 위에서 죽는 것, 강호에서는 그것도 하나의 기연이다.',
  },
];

export const DEFAULT_ENDING: Ending = {
  id: 'ending_default', category: '평범', title: '강호의 한 사람',
  when: {},
  text: '{이름}은 강호의 수많은 무인 중 한 사람으로 살다 갔다. 그의 이야기를 아는 이는 많지 않다. 그러나 그 이야기는, 분명히 있었다.',
};
