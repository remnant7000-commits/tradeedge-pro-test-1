# TradeEdge Pro 개발 협업 가이드

## 1) 프로젝트 목적

이 프로젝트는 전략 연구 및 시뮬레이션 대시보드입니다.
실거래 주문 전송 기능은 없고, 전략 비교/검토에 집중합니다.

---

## 2) 바로 접속 링크

- GitHub 저장소: <https://github.com/remnant7000-commits/tradeedge-pro-test-1>
- GitHub Pages: <https://remnant7000-commits.github.io/tradeedge-pro-test-1/>

Pages 링크가 아직 열리지 않으면 GitHub에서 한 번만 설정하세요.

1. 저장소 `Settings > Pages` 이동
2. Source를 `Deploy from a branch`로 선택
3. Branch를 `main`, 폴더를 `/(root)`로 저장
4. 1~3분 뒤 링크 재접속

---

## 3) 파일별 역할

- `index.html`: 탭 기반 메인 UI 구조
- `css/style.css`: 다크 테마 스타일 및 컴포넌트 스타일
- `js/data.js`: 전략/룰셋/초기 데이터
- `js/main.js`: 탭 전환, 백테스트 시뮬레이션, 차트/테이블 렌더링
- `README.md`: 프로젝트 소개 및 빠른 링크

---

## 4) 나와 협업하는 방식(추천)

수정 요청은 아래 템플릿으로 주면 가장 빠릅니다.

```
[목표]
예: 백테스트 탭에서 종목 기본값을 QQQ로 변경

[변경 위치]
예: js/main.js, index.html

[원하는 결과]
예: 초기 진입 시 QQQ가 선택되고, 실행 버튼 텍스트는 "시뮬레이션 실행" 유지

[검증 기준]
예: 새로고침 후 QQQ 기본 선택 확인
```

---

## 5) 변경 이력 확인 방법

### GitHub에서 확인

1. 저장소 메인에서 `Commits` 클릭
2. 커밋 클릭 후 변경 파일/라인 확인
3. 필요하면 이전 상태와 비교(`Compare`) 가능

### 로컬에서 확인

```bash
git status
git log --oneline --decorate -n 10
git show --stat
```

---

## 6) 안전한 수정 원칙

- 한 번에 한 기능 단위로 커밋
- UI 변경 시 최소 1회 브라우저 확인
- 시뮬레이션 로직 변경 시 결과 카드/테이블 동시 검증
- 깨지는 리팩터링보다 점진적 수정 우선

---

## 7) 다음 개선 후보

- 실제 OHLCV 데이터 연동
- 전략 파라미터 저장/불러오기
- 결과 내보내기(CSV)
- 백테스트 재현성(랜덤 시드 고정 옵션)

