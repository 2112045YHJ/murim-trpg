# 무림각혈록 — 엔진 시제품

기획서: [GAME_DESIGN.md](GAME_DESIGN.md) (v0.3)

Vite + TypeScript로 만든 정적 웹 게임이다. 서버도, AI도 쓰지 않는다.

## 명령어

| 명령 | 하는 일 |
|---|---|
| `npm install` | 처음 한 번, 의존성 설치 |
| `npm run dev` | 개발 서버 (http://localhost:5173, 저장하면 바로 갱신) |
| `npm run typecheck` | 타입 검사. 카드 데이터의 오타를 잡는다 |
| `npm test` | 규칙 테스트 + 카드 연결 검사 + 300명 시뮬레이션 |
| `npm run sim` | 터미널 시뮬레이터. `-- --n 5000 --seed 7` 처럼 인원·시드 지정 |
| `npm run check` | 위 세 가지를 한 번에 (카드를 고친 뒤 실행) |
| `npm run build` | 타입 검사 후 `dist/`에 배포용 파일 생성 |

`dist/` 폴더는 GitHub Pages나 Netlify에 그대로 올리면 된다.

## 구조

```
index.html                    진입점
src/
  types.ts                    모든 타입 (카드·결과·조건·게임 상태)
  ui/app.ts, ui/style.css     화면·입력·저장(localStorage)·도감
  engine/                     게임 규칙 (화면과 분리)
    rng.ts                    주사위, 시드 고정 난수
    generate.ts               4장 랜덤 캐릭터 생성
    game.ts                   계절 턴, 카드 뽑기, 판정, 결투, 죽음, 엔딩
    conditions.ts             카드·선택지·엔딩 조건 검사
    bonds.ts                  은원록
    josa.ts                   이(가)·을(를) 같은 조사 자동 선택
  data/                       콘텐츠 (코드 수정 없이 늘릴 수 있다)
    tables.ts                 생성표, 경지
    arts.ts                   무공
    fragments.ts              문장 조각
    endings.ts                엔딩 17종 + 기본 엔딩
    cards/*.ts                이벤트 카드 50장
  sim/simulate.ts             카드 검사 + 자동 플레이 (테스트와 CLI가 함께 씀)
scripts/sim.ts                터미널 시뮬레이터
tests/                        Vitest 테스트
```

## 카드 추가하기

`src/data/cards/` 아래 파일의 배열에 객체 하나를 추가한다. 필드 정의는 [src/types.ts](src/types.ts)의 `Card`, `Choice`, `Outcome`, `Cond`에 있고, 편집기에서 자동완성된다.

타입 검사가 잡는 것: 없는 필드 이름(`fction`), 없는 능력치(`'힘'`), 없는 인연 역할, 없는 무공 id, 범위를 벗어난 부상 단계.
테스트(`npm test`)가 잡는 것: 없는 카드로 이어지는 `next`, 어디서도 얻을 수 없는 플래그, 채워지지 않는 `{변수}`, 실행 중 오류.

## 참고

- UI는 React 없이 TypeScript로 직접 그린다. 화면이 복잡해지거나 연출이 많아지면 그때 React(또는 Preact)를 도입한다.
- 세이브 형식이 v2로 바뀌어, 이전 시제품(순수 JS 판)의 세이브는 읽지 않는다.
