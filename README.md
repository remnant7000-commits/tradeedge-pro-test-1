# TradeEdge Pro — 전략 연구 & 백테스트 대시보드

## 접속 링크

- GitHub 저장소: <https://github.com/remnant7000-commits/tradeedge-pro-test-1>
- GitHub Pages(배포 링크): <https://remnant7000-commits.github.io/tradeedge-pro-test-1/>
  - 아직 404가 나오면 GitHub 저장소의 `Settings > Pages`에서
    - Source: `Deploy from a branch`
    - Branch: `main` / `/(root)`
    로 저장 후 1~3분 기다리면 접속됩니다.

## 상세 문서

- 개발/수정 협업 가이드: `docs/DEVELOPMENT_GUIDE.md`

## 프로젝트 개요
업로드된 트레이딩 전략 PDF 문서들을 바탕으로, 전략 연구·시그널 분석·백테스트 시뮬레이션을 위한 다크 트레이딩 대시보드 앱입니다.

> ⚠️ **연구/시뮬레이션 전용 앱입니다. 실제 계좌 주문 및 브로커 연동 기능은 포함되어 있지 않습니다.**

---

## 주요 기능

### 1. 전략 선택 & 규칙 관리 (`/index.html#strategies`)
- 8개 전략 카드 (PDF 문서 기반)
- 전략별 ON/OFF 토글 스위치
- 카드 클릭 시 규칙 상세 패널 (진입/청산/필터/리스크 탭)
- 문서 공개 승률, R/R, 세션 정보 표시

### 2. 백테스트 조건 입력 (`/index.html#backtest`)
- 종목: TSLA, NVDA, AMD, AAPL, QQQ, SPY
- 기간: 1/3/6/12개월
- 타임프레임: 1분/5분/15분
- 거래 시간창 (EST 기준)
- 리스크 %, 수수료, 슬리피지, 초기 자본
- 전략 다중 선택, 최소 R/R 필터, 일일 최대 거래 수

### 3. 결과 대시보드 (`/index.html#dashboard`)
- KPI 카드: 최종 자산, 총 P&L, 승률, 평균 R, PF, MDD, 거래 수
- 누적 손익 곡선 (전략별 선택 가능)
- 시간대별 거래 성과 차트 (거래 수 + 승률)
- 전략별 승률 비교 (시뮬 vs 문서)
- R-Multiple 분포 히스토그램
- 거래 로그 테이블 (정렬, 검색, 페이지네이션)

### 4. 전략 비교 테이블 (`/index.html#compare`)
- 8개 전략 × 11개 속성 비교
- 문서 공개 수치 vs 시뮬레이션 수치 나란히 비교
- 승률순/PF순/R/R순 정렬
- Profit Factor 막대 차트
- 승률 vs 평균 R 산점도

### 5. 자동매매 룰셋 표 (`/index.html#ruleset`)
- 34개 자동화 규칙 (진입/청산/필터/리스크)
- 전략별/조건 타입별 필터링
- 정량적 기준 코드 표시
- 자동화 가능 여부 (✅가능/⚠️부분/❌불가)
- A+ 스코어링 시스템 (4단계 × 25점 = 100점 만점)

---

## 수록 전략 (PDF 문서 기반)

| 전략 | 승률(문서) | R/R | 세션 | 자동화 난이도 |
|------|-----------|-----|------|-------------|
| ORB (9:30 Opening Range) | 미공개 | 1:2+ | 9:30~11:00 EST | 쉬움 |
| PDH/PDL Break & Retest | 55% | 1:2.76 | 9:30~16:00 EST | 쉬움 |
| Best Break & Retest (HTF) | 60~70% | 1:2+ | 전 세션 | 보통 |
| Order Block Retest | 미공개 | 1:2+ | 추세장 | 보통 |
| One Box Strategy | 미공개 | 1:2 | 9:30~16:00 EST | 쉬움 |
| FVG / Gap Rule | 미공개 | 1:2+ | 전 세션 (보조) | 보통 |
| A+ Checklist Filter | 미공개 | 1:3.6+ | 10:00 EST ±20분 | 보통 |
| $92,300 Boring Scalping | 38~40% | 1:2.76 | 9:30~11:30 EST | 어려움 |

---

## 파일 구조

```
index.html          메인 앱 (탭 기반 SPA)
css/
  style.css         다크 트레이딩 대시보드 스타일
js/
  data.js           전략 데이터, 규칙, 룰셋 데이터 (PDF 추출)
  main.js           앱 로직 (탭 전환, 시뮬레이션, 차트, 테이블)
README.md
```

---

## 기술 스택
- HTML5 / CSS3 / Vanilla JavaScript (ES6+)
- Chart.js (누적 손익 곡선, 시간대 성과, 비교 차트)
- Font Awesome (아이콘)
- Google Fonts (Inter, JetBrains Mono)
- CDN 기반 (서버 불필요)

---

## 데이터 출처 & 주의사항

### 문서 공개 수치
- **PDH/PDL 55% 승률, PF 6.86**: Interactive Brokers 인증 실거래 성과
- **$92,300 스캘핑 38~40% 승률**: Interactive Brokers 인증 실거래 성과
- **A+ 체크리스트 통계**: 거래의 75%가 10:00 EST ±20분 발생 (문서 기재)
- **나머지 전략**: 전략 규칙 설명 기반 (백테스트 수치 미공개)

### 시뮬레이션 결과
- 몬테카를로 방식의 통계적 시뮬레이션
- **실제 과거 시장 데이터 기반이 아닙니다**
- 실전 성과와 다를 수 있음
- 투자 조언이 아닙니다

---

## 다음 개발 권장 사항
1. 실제 OHLCV 데이터 API 연동 (Polygon.io, Yahoo Finance)
2. 실제 백테스트 엔진 (vectorbt, zipline 등) 연결
3. 브로커 API 연동 (종이 트레이딩 모드)
4. 신호 알림 기능 (이메일, Slack, Telegram)
5. 전략 파라미터 최적화 (Grid Search)
