// ============================================================
//  TradeEdge Pro — Strategy Data (PDF 문서에서 추출)
// ============================================================

const STRATEGIES = [
  {
    id: 'orb',
    name: '9:30 AM Opening Range Break & Retest',
    shortName: 'ORB',
    subtitle: '뉴욕 오픈 첫 5분 캔들 돌파 전략',
    icon: 'fas fa-clock',
    color: '#3b82f6',
    colorClass: 'kpi-blue',
    enabled: true,

    // 문서 공개 수치
    docWinRate: null,         // 문서 미공개
    docRR: 2.0,               // 최소 1:2
    docPF: null,
    docMonthlyProfit: '$500~$1,000/일',
    docSource: '9:30 AM 1분 스캘핑 전략 문서',
    dataType: '전략 규칙 + 실전 사례',

    // 시뮬레이션 기본값
    simWinRate: 52,
    simRR: 2.1,
    simPF: 2.28,
    simMDD: 8.2,

    timeframe: ['1분', '5분'],
    session: '9:30~11:00 EST',
    automationDifficulty: 'easy',
    stars: 5,

    rules: [
      { type: 'entry', text: '뉴욕 세션 9:30 AM EST 첫 5분 캔들의 고가(High)와 저가(Low)를 기준선으로 설정', quant: '첫 5분봉 완성 후 즉시 설정' },
      { type: 'entry', text: '1분봉이 5분 범위 위 또는 아래에서 캔들 몸통(Body) 기준으로 완전히 마감 확인 (꼬리 터치 불가)', quant: 'Close > 5분봉 High (Long) / Close < 5분봉 Low (Short)' },
      { type: 'entry', text: '돌파 후 가격이 다시 5분봉 경계선(고점 또는 저점)으로 되돌아오는 리테스트(Retest) 대기', quant: '경계선 ±0.1% 이내 접근 시 감지' },
      { type: 'entry', text: '리테스트 지점에서 매수/매도세 유입 확인: Long이면 하락 거부 캔들, Short이면 상단 꼬리(Upper Wick) 발생', quant: '확인 캔들 마감 후 진입' },
      { type: 'exit', text: '손절(SL): Long이면 5분봉 저가 바로 아래, Short이면 5분봉 고가 바로 위', quant: '5분봉 경계선 기준 ±$0.05 버퍼' },
      { type: 'exit', text: '익절(TP): 최소 1:2 손익비 적용, 당일 고/저점(HOD/LOD) 참고', quant: 'TP = Entry + (Entry - SL) × 2.0' },
      { type: 'filter', text: '거래 유효 시간창: 9:30~11:00 EST (90분). 이후 발생 신호 무시', quant: '09:30 ~ 11:00 EST only' },
      { type: 'filter', text: 'Displacement 확인: 강한 바디 + FVG(3캔들 갭) 동반 여부로 돌파 품질 평가', quant: '1번캔들High < 3번캔들Low (상승) / 반대 (하락)' },
      { type: 'risk', text: '거래당 계좌의 최대 1~2% 리스크', quant: '포지션 크기 = (계좌 × 위험%) / (진입가 - 손절가)' },
      { type: 'risk', text: '하루 최대 2~3회 진입 제한', quant: 'Max 3 trades/day' },
    ],

    conditions: {
      noTrade: ['5분 범위 중간에 가격 위치 시 관망', '꼬리만 경계선 터치 (바디 미돌파)', '첫 5분 범위가 비정상적으로 넓을 때', '주요 경제지표 발표 직전/직후'],
      confluence: ['PDH/PDL 레벨과 겹치는 경우 A+ 등급', 'FVG + ORB 경계선 일치 시 최고 우선순위'],
    }
  },

  {
    id: 'pdhl',
    name: 'PDH/PDL Break & Retest',
    shortName: 'PDH/PDL',
    subtitle: '전일 고점/저점 돌파 리테스트 전략',
    icon: 'fas fa-layer-group',
    color: '#22c55e',
    colorClass: 'kpi-green',
    enabled: true,

    docWinRate: 55,
    docRR: 2.76,
    docPF: 6.86,
    docMonthlyProfit: '$55,071/월 (53.25% ROI)',
    docSource: '$55,000 수익 Break & Retest 문서',
    dataType: '실제 거래 성과 (Interactive Brokers 인증)',

    simWinRate: 56,
    simRR: 2.5,
    simPF: 3.15,
    simMDD: 7.8,

    timeframe: ['1분', '5분', '15분'],
    session: '9:30~16:00 EST',
    automationDifficulty: 'easy',
    stars: 5,

    rules: [
      { type: 'entry', text: '전일 뉴욕 세션(9:30~16:00 EST) 고가(PDH)와 저가(PDL)를 핵심 레벨로 설정', quant: '전일 OHLC 데이터 필요' },
      { type: 'entry', text: 'PDH 상향 돌파: 5분봉이 PDH 위에서 완전 마감 확인', quant: 'Close > PDH (Long 바이어스)' },
      { type: 'entry', text: 'PDL 하향 돌파: 5분봉이 PDL 아래에서 완전 마감 확인', quant: 'Close < PDL (Short 바이어스)' },
      { type: 'entry', text: '돌파 후 PDH/PDL 레벨로 리테스트 대기 — 이전 저항이 지지로 전환되는 것 확인', quant: '레벨 ±0.15% 이내 접근' },
      { type: 'entry', text: '리테스트에서 확인 캔들 발생: 이전 캔들 고점(Long) 또는 저점(Short) 위/아래에서 캔들 마감', quant: '보수적 모델 (Confirmation Candle) — 승률 60~70%' },
      { type: 'exit', text: '손절: 돌파 지점 또는 직전 피봇 저점/고점 바로 바깥', quant: 'SL = PDH - 0.1~0.2% (Long) / PDL + 0.1~0.2% (Short)' },
      { type: 'exit', text: '1차 익절: 당일 고점(HOD) 또는 스윙 고점, 최소 1:2 손익비', quant: 'TP1 = Entry + 2× Risk' },
      { type: 'exit', text: '2차 익절: 나머지 물량 HTF 주요 레벨까지 트레일링', quant: 'Trailing Stop or ATH target' },
      { type: 'filter', text: 'Displacement 필터: FVG 동반 여부 확인 (강한 돌파 vs 약한 돌파)', quant: '3캔들 FVG 구조 확인' },
      { type: 'filter', text: 'SPY/QQQ 대비 상대 강도(Relative Strength) 확인', quant: '시장 지수가 하락해도 PDH 위 유지 = 강한 신호' },
      { type: 'risk', text: '거래당 1~2% 리스크, 일일 최대 2~3회', quant: '1% per trade, max 3/day' },
      { type: 'risk', text: '일일 최대 드로다운 5% 도달 시 자동 거래 중단', quant: 'Max daily loss = 5% of capital' },
    ],

    conditions: {
      noTrade: ['PDH~PDL 사이 중간 구간에서 진입 금지 (No Man\'s Land)', 'Displacement 없는 약한 돌파 (FVG 미형성)', '확인 캔들 미발생 시 진입 보류'],
      confluence: ['PDH + ORB 경계선 일치 = A++ 신호', '전일 고점 + Order Block 구역 일치', '1분 FVG + 5분 PDH 겹침'],
    }
  },

  {
    id: 'bestbar',
    name: 'Best Break & Retest (HTF)',
    shortName: 'BnR',
    subtitle: 'HTF 3가지 패턴 Break and Retest',
    icon: 'fas fa-chart-line',
    color: '#a855f7',
    colorClass: 'kpi-purple',
    enabled: true,

    docWinRate: 60,   // 보수적 모델 기준 60~70%
    docRR: 2.0,
    docPF: null,
    docMonthlyProfit: '문서 미공개',
    docSource: 'Best Break & Retest 전략 문서',
    dataType: '전략 규칙 (백테스트 수치 미공개)',

    simWinRate: 58,
    simRR: 2.2,
    simPF: 2.88,
    simMDD: 9.1,

    timeframe: ['30분', '1시간', '4시간'],
    session: '전 세션 (HTF 기반)',
    automationDifficulty: 'medium',
    stars: 4,

    rules: [
      { type: 'entry', text: '[패턴1 Continuation] 상승 추세 중 핵심 피봇 고점 돌파 후 리테스트 진입', quant: 'Higher High 형성 후 이전 고점 지지 확인' },
      { type: 'entry', text: '[패턴2 Consolidation] 박스권 상단/하단 돌파 후 경계선 리테스트 진입', quant: 'Range 상단(하단) 3회 이상 터치 후 돌파' },
      { type: 'entry', text: '[패턴3 Flat Top] 수평 저항선 다중 터치 후 돌파, 리테스트에서 진입', quant: '최소 2회 이상 터치된 수평 레벨 기준' },
      { type: 'entry', text: 'Displacement 확인: FVG 동반 강한 돌파만 유효', quant: '3캔들 FVG 구조 필수' },
      { type: 'entry', text: '진입 모델 선택: 보수적(확인캔들) — 승률 60~70% 권장', quant: 'Aggressive(40%) / Conservative / Most Conservative(60~70%)' },
      { type: 'exit', text: '손절: 돌파 캔들 저점 또는 직전 피봇 스윙 저점 아래', quant: 'SL = 돌파 캔들 Low - 버퍼' },
      { type: 'exit', text: '익절: 1차 스윙 고점, 최소 1:2 손익비', quant: 'TP = Entry + 2× Risk' },
      { type: 'filter', text: '상승 바이어스 우선: 시장은 상승하도록 설계. 하락 패턴은 필터링 강화', quant: '상승 신호에 더 높은 가중치 부여' },
      { type: 'filter', text: 'HTF 레벨 영역(Area)으로 설정: 선(Line)보다 폭 있는 구간', quant: '레벨 ±0.2~0.5% 영역 설정 권장' },
      { type: 'risk', text: '1:2 최소 손익비 필수, 더 높은 손익비 우선 선택', quant: 'Min R/R = 1:2' },
    ],

    conditions: {
      noTrade: ['하락 플랫탑(라이징 웨지) 패턴은 필터링 또는 비중 축소', 'FVG 미형성 약한 돌파', '횡보장 돌파는 재시험 실패 가능성 높음'],
      confluence: ['HTF Flat Top + FVG + 주요 세션 오픈 일치 = 최고 우선순위'],
    }
  },

  {
    id: 'ob',
    name: 'Order Block Retest',
    shortName: 'OB',
    subtitle: '오더블록 지지/저항 전환 진입',
    icon: 'fas fa-cube',
    color: '#f59e0b',
    colorClass: 'kpi-yellow',
    enabled: true,

    docWinRate: null,
    docRR: 2.0,
    docPF: null,
    docMonthlyProfit: '문서 미공개',
    docSource: '$55,000 수익 + $92,300 스캘핑 문서',
    dataType: '전략 규칙 + 실전 사례',

    simWinRate: 49,
    simRR: 2.8,
    simPF: 2.65,
    simMDD: 11.3,

    timeframe: ['1분', '5분', '15분'],
    session: '추세장 한정 (전 세션)',
    automationDifficulty: 'medium',
    stars: 3,

    rules: [
      { type: 'entry', text: '[상승 OB] 강한 상승 이전의 마지막 하락마감 캔들(Down-Close) 영역을 Order Block으로 설정', quant: 'Wick-to-Body 영역 (꼬리부터 몸통까지)' },
      { type: 'entry', text: '[하락 OB] 강한 하락 이전의 마지막 상승마감 캔들(Up-Close) 영역을 Order Block으로 설정', quant: 'Wick-to-Body 영역' },
      { type: 'entry', text: 'OB 유효성 확인: 해당 캔들 이후 가격이 반대 방향으로 확실히 마감되어야 유효', quant: 'OB 이후 캔들이 OB 위(상승OB) 또는 아래(하락OB)에서 마감' },
      { type: 'entry', text: '가격이 OB 존으로 리테스트 시 진입, 지지/저항 반응 확인 후', quant: 'OB 영역 진입 후 확인 캔들 발생 시' },
      { type: 'exit', text: '손절: OB 저점(상승) 또는 OB 고점(하락) 바로 바깥', quant: 'SL = OB Low - 버퍼 (Long)' },
      { type: 'exit', text: '익절: 최소 1:2, 다음 스윙 고점/저점 또는 HOD/LOD', quant: 'TP = 1:2 이상' },
      { type: 'filter', text: '추세 확인 필수: Higher High/Low (상승) 또는 Lower High/Low (하락)', quant: '횡보장에서는 OB 전략 비활성화' },
      { type: 'filter', text: 'Confluence: PDH/PDL과 OB가 겹치는 구간 = A+ 신호', quant: '레벨 중첩 시 가중치 부여' },
      { type: 'risk', text: '추세 시장에서만 작동, 횡보장 비활성화 필수', quant: 'ADX > 25 또는 HH/HL/LL/LH 구조 확인' },
    ],

    conditions: {
      noTrade: ['횡보장에서 OB 전략 전면 금지', 'OB 유효성 미확인 상태 진입', '확인 캔들 없이 OB 영역 터치만으로 진입'],
      confluence: ['PDH/PDL + OB 구역 일치 = 최고 우선순위', 'OB + FVG + ORB 경계 일치'],
    }
  },

  {
    id: 'onebox',
    name: 'One Box Strategy',
    shortName: 'OneBox',
    subtitle: '전일 고/저 박스 반전·지속 전략',
    icon: 'fas fa-square',
    color: '#06b6d4',
    colorClass: 'kpi-cyan',
    enabled: true,

    docWinRate: null,  // 문서 미공개
    docRR: 2.0,
    docPF: null,
    docMonthlyProfit: '문서 미공개 (매일 일관된 기회 강조)',
    docSource: 'One Box Strategy 문서',
    dataType: '전략 규칙 + 실전 사례 (QQQ, AMD, NVDA)',

    simWinRate: 53,
    simRR: 2.0,
    simPF: 2.23,
    simMDD: 9.7,

    timeframe: ['15분', '1시간'],
    session: '9:30~16:00 EST',
    automationDifficulty: 'easy',
    stars: 4,

    rules: [
      { type: 'entry', text: '전일 캔들의 Wick부터 Body까지를 상단 박스(저항) 및 하단 박스(지지)로 설정', quant: '상단 박스: PDH Wick ~ PDH Body / 하단 박스: PDL Body ~ PDL Wick' },
      { type: 'entry', text: 'No Trade Zone 설정: 상단 박스와 하단 박스 사이 중간 구간 — 진입 금지', quant: '박스 외부(상단 or 하단)에서만 거래' },
      { type: 'entry', text: '[반전 시나리오] 가격이 박스 경계에 도달 후 돌파 실패, 반대 방향 강세 캔들 발생 시 반전 진입', quant: '박스 거부(Rejection) + 반전 확인 캔들' },
      { type: 'entry', text: '[지속 시나리오] 가격이 박스를 강하게 돌파 후 리테스트(지지/저항 전환) 확인 시 추세 지속 진입', quant: 'Impulsive Move + Retest 성공' },
      { type: 'entry', text: '개장 후 15~30분 동안 박스 중간 구간 체류 시 관망', quant: '9:30~10:00 EST 방향성 확인 대기' },
      { type: 'exit', text: '손절: 진입 근거 캔들의 고점(매도) 또는 저점(매수) 바로 바깥', quant: 'SL = 진입 캔들 Low - 버퍼 (Long)' },
      { type: 'exit', text: '익절: 고정 1:2 손익비', quant: 'TP = Entry + 2× Risk' },
      { type: 'filter', text: 'Multiple Touch 정제: 과거 차트에서 여러 번 터치된 가격대로 박스 조정', quant: '2회 이상 터치된 수평 영역으로 레벨 정제' },
      { type: 'filter', text: 'AMD/NVDA 등 변동성 큰 종목은 박스 영역 세분화 필요', quant: '박스 폭이 큰 경우 내부 레벨 추가 설정' },
      { type: 'risk', text: '개장 직후 시장 편향 미결정 시 관망. 방향성 확인 후 거래 시작', quant: '15~30분 관망 후 방향 결정' },
    ],

    conditions: {
      noTrade: ['박스 중간 구간 (No Man\'s Land) 절대 거래 금지', '개장 후 첫 15분 방향성 불명확 시 관망', '박스 경계에서 확인 캔들 없는 진입'],
      confluence: ['PDH 박스 + ORB 상단 일치', '박스 경계 + 다중 터치 정제 레벨 일치'],
    }
  },

  {
    id: 'fvg',
    name: 'FVG / Gap Rule (Displacement)',
    shortName: 'FVG',
    subtitle: 'Fair Value Gap & Displacement 필터',
    icon: 'fas fa-compress-arrows-alt',
    color: '#ef4444',
    colorClass: 'kpi-red',
    enabled: false,

    docWinRate: null,
    docRR: 2.0,
    docPF: null,
    docMonthlyProfit: '문서 미공개 (보조 필터)',
    docSource: 'Gap Rule / FVG 문서 (보조 필터)',
    dataType: '전략 규칙 (주로 다른 전략의 품질 필터)',

    simWinRate: 61,
    simRR: 2.4,
    simPF: 3.20,
    simMDD: 7.1,

    timeframe: ['1분', '5분'],
    session: '전 세션',
    automationDifficulty: 'medium',
    stars: 4,

    rules: [
      { type: 'entry', text: '[Bullish FVG] 3캔들 시퀀스에서 1번 캔들 High < 3번 캔들 Low 조건 — 상승 불균형 구간 생성', quant: 'Candle1.High < Candle3.Low = Bullish FVG' },
      { type: 'entry', text: '[Bearish FVG] 1번 캔들 Low > 3번 캔들 High 조건 — 하락 불균형 구간 생성', quant: 'Candle1.Low > Candle3.High = Bearish FVG' },
      { type: 'entry', text: '가격이 FVG 구역으로 리테스트 시 진입 대기, 강한 추세 방향 확인 캔들 발생 후 진입', quant: 'FVG 영역 진입 + 방향 캔들 마감' },
      { type: 'entry', text: '주요 레벨(ORB, PDH/PDL, OB)과 FVG가 겹치는 구간 최우선 신호', quant: 'Confluence: FVG + 주요 레벨 중첩' },
      { type: 'exit', text: '손절: FVG 저점(Bullish) 또는 FVG 고점(Bearish) 바로 바깥', quant: 'SL = FVG 하단 - 버퍼 (Long)' },
      { type: 'exit', text: '익절: 1:2 고정 또는 당일 HOD/LOD', quant: 'TP = 1:2 이상' },
      { type: 'filter', text: '[Inverse FVG] 가격이 FVG를 반대 방향으로 돌파 마감 시 반전 신호로 전환', quant: 'Bullish FVG 아래 5분봉 마감 = 하락 반전' },
      { type: 'filter', text: '[Reclaim 84% Rule] FVG 실패 후 주요 레벨 + FVG 위로 회복 시 강력한 재매수 신호', quant: '레벨 회복(Reclaim) 캔들 마감 후 재진입' },
      { type: 'filter', text: 'Displacement 없는 돌파(FVG 미형성) = 저확률 신호, 진입 금지 또는 등급 하향', quant: 'FVG 미형성 시 A등급 → C등급 하향' },
      { type: 'risk', text: 'FVG는 독립 전략보다 다른 전략(ORB, PDH/PDL)의 품질 필터로 사용 권장', quant: 'FVG 있음: 등급 +1 / FVG 없음: 등급 -1' },
    ],

    conditions: {
      noTrade: ['FVG 없는 약한 돌파는 전략 신호 등급 하향', 'Inverse FVG 발생 시 기존 포지션 방향 재검토'],
      confluence: ['FVG + ORB + PDH/PDL 삼중 겹침 = 최고등급 신호'],
    }
  },

  {
    id: 'aplus',
    name: 'A+ Checklist Filter',
    shortName: 'A+',
    subtitle: '4단계 A+ 진입 등급 시스템',
    icon: 'fas fa-star',
    color: '#f97316',
    colorClass: 'kpi-yellow',
    enabled: true,

    docWinRate: null,   // 단독 전략 아님
    docRR: 3.6,         // NVDA 사례 3.6:1, AMD 9:1
    docPF: null,
    docMonthlyProfit: 'NVDA: 3.6R ($11,000+), AMD: 9R ($14,000+)',
    docSource: 'A+ Trading Strategy Checklist 문서',
    dataType: '실전 사례 + 통계 (거래 75%가 10AM±20분)',

    simWinRate: 64,
    simRR: 3.2,
    simPF: 4.10,
    simMDD: 5.9,

    timeframe: ['5분', '15분', '1시간', '일봉'],
    session: '9:30~11:00 EST (75%가 10:00 전후)',
    automationDifficulty: 'medium',
    stars: 5,

    rules: [
      { type: 'filter', text: '[Step 1 - 25점] 유동성 목표(Draw on Liquidity) 명확성: 이전 고점/저점, PDH/PDL, ATH 등 명확한 목표 존재', quant: '목표 레벨 있음: 25점 / 불명확: 0점' },
      { type: 'filter', text: '[Step 2 - 25점] 상위 타임프레임(HTF) 정렬: 일봉/4시간봉 추세와 매매 방향 일치 (A+ 셋업의 84%가 HTF와 일치)', quant: 'HTF 방향 일치: 25점 / 불일치: 0점' },
      { type: 'filter', text: '[Step 3 - 25점] 명확한 기술적 패턴: 컵앤핸들, 하락 추세선 돌파, BnR, 쐐기형 등 선명한 패턴 확인', quant: '패턴 명확: 25점 / 형성중: 10점 / 불명확: 0점' },
      { type: 'filter', text: '[Step 4 - 25점] 상대 강도(Relative Strength/Weakness): SPY/QQQ 대비 강세(Long) 또는 약세(Short)', quant: 'RS/RW 확인: 25점 / 지수와 동일: 0점' },
      { type: 'entry', text: '90점 이상: A+ 셋업 — 자동 진입 허용, 높은 손익비 기대', quant: '90~100점: A+ Grade → 전체 포지션' },
      { type: 'entry', text: '75~89점: B+ 셋업 — 진입 가능, 포지션 크기 축소(하프)', quant: '75~89점: B+ Grade → 절반 포지션' },
      { type: 'entry', text: '75점 미만: No Trade — 관망', quant: '< 75점: 거래 금지' },
      { type: 'exit', text: '1차 청산: 1시간 보유 후 모멘텀이 강할 때 50% 청산', quant: '1시간 = 1차 TP 최적 시간 (통계)' },
      { type: 'exit', text: '2차 청산: 추세 강한 날 나머지 장 마감까지 홀딩 또는 트레일링 스탑', quant: 'EOD 홀딩 또는 Break-even trailing' },
      { type: 'risk', text: '시간 필터: 75%의 거래가 10:00 EST ±20분에 발생 — 이 시간대 집중', quant: '09:40~10:20 EST 황금시간대' },
      { type: 'risk', text: '2차 진입: 첫 기회를 놓쳐도 60% 확률로 풀백에서 재진입 기회 발생', quant: '5분봉 풀백 후 재진입, 성공률 60%' },
    ],

    conditions: {
      noTrade: ['75점 미만 전략', '상위 타임프레임과 역방향', '유동성 목표 불명확'],
      confluence: ['4개 조건 모두 만족 = 100점 A+ = 최대 포지션', 'NVDA 3.6R, AMD 9R 달성 사례 기반'],
    }
  },

  {
    id: 'scalp92',
    name: '$92,300 Boring Scalping',
    shortName: 'Scalp',
    subtitle: '3가지 셋업 병행 스캘핑 전략',
    icon: 'fas fa-bolt',
    color: '#22c55e',
    colorClass: 'kpi-green',
    enabled: false,

    docWinRate: 38,    // 실제 38~40%
    docRR: 2.76,       // 평균 2.76R (최대 7R)
    docPF: null,
    docMonthlyProfit: '$92,300/월 (Tesla 단일 종목)',
    docSource: '$92,300 스캘핑 전략 문서',
    dataType: '실제 거래 성과 (IB 인증)',

    simWinRate: 41,
    simRR: 2.7,
    simPF: 2.84,
    simMDD: 13.2,

    timeframe: ['1분', '5분'],
    session: '9:30~11:30 EST',
    automationDifficulty: 'hard',
    stars: 3,

    rules: [
      { type: 'entry', text: '[셋업1 PDH/L Retest] 전일 고점/저점 돌파 후 리테스트 — 가장 높은 유동성', quant: 'PDH/PDL ±0.1% 영역' },
      { type: 'entry', text: '[셋업2 Opening Range] 9:30 첫 5분 범위 돌파 후 경계선 리테스트', quant: '첫 5분 캔들 고/저점' },
      { type: 'entry', text: '[셋업3 Order Block] 추세 중 마지막 반대색 캔들 영역 리테스트 (추세장 한정)', quant: 'Wick-to-Body OB 영역' },
      { type: 'entry', text: '진입 전 확인 캔들 필수: 이전 캔들 고점 위에서 캔들 마감 or 하락 꼬리(Lower Wick) 발생', quant: 'Confirmation Candle 마감 확인' },
      { type: 'exit', text: '손절: 레벨 바로 아래/위 또는 OB 저점/고점', quant: 'SL = 레벨 - 버퍼' },
      { type: 'exit', text: '익절: 고정 1:2, 당일 HOD/LOD, 이전 스윙 고점/저점', quant: 'TP = 1:2 이상, 최고 7R 달성' },
      { type: 'filter', text: 'SPY/QQQ 상대 강도: 지수 하락에도 해당 종목이 PDH 지지 = 강한 신호', quant: 'Relative Strength 확인' },
      { type: 'filter', text: 'Confluence: 여러 셋업이 겹치는 지점 = A+ 신호', quant: 'PDH + ORB 또는 PDH + OB 중첩' },
      { type: 'risk', text: '승률 38~40%이지만 평균 2.76R로 높은 수익성 유지 — 높은 손익비가 핵심', quant: '38% 승률 × 2.76R = 양의 기대값' },
      { type: 'risk', text: '단일 종목(TSLA) 집중: 종목 특성 파악으로 일관성 확보', quant: 'Tesla 단일 종목 전략' },
    ],

    conditions: {
      noTrade: ['횡보장에서 OB 셋업 비활성화', '확인 캔들 없는 즉각 진입', 'Confluence 없는 단독 신호'],
      confluence: ['3가지 셋업이 동시에 겹치는 구간 = 최고 확률', 'PDH + ORB + OB 삼중 일치'],
    }
  },
];

// ── 자동매매 룰셋 데이터 ──────────────────────────────────────
const RULESET_DATA = [
  // ORB
  { strategy: 'ORB', type: 'entry', rule: '9:30 EST 첫 5분 캔들 고/저점 설정', data: '1분/5분 OHLCV, 세션 시간', quant: 'Session Open = 09:30 EST', auto: 'yes' },
  { strategy: 'ORB', type: 'entry', rule: '1분봉 Body가 5분 범위 외부에서 마감', data: '1분봉 OHLC', quant: 'Close > 5m.High || Close < 5m.Low', auto: 'yes' },
  { strategy: 'ORB', type: 'entry', rule: '5분 범위 경계선 리테스트 감지', data: '실시간 1분봉', quant: 'Price within ±0.1% of boundary', auto: 'yes' },
  { strategy: 'ORB', type: 'filter', rule: 'FVG(Displacement) 동반 여부 확인', data: '3개 연속 캔들 OHLC', quant: 'C1.High < C3.Low (Bull) | C1.Low > C3.High (Bear)', auto: 'yes' },
  { strategy: 'ORB', type: 'exit', rule: '손절: 5분봉 반대편 경계선 바깥', data: '5분봉 경계선', quant: 'SL = 5m.Low - 0.05% (Long)', auto: 'yes' },
  { strategy: 'ORB', type: 'exit', rule: '익절: 1:2 손익비 고정', data: '진입가, SL', quant: 'TP = Entry + 2 × (Entry - SL)', auto: 'yes' },
  { strategy: 'ORB', type: 'risk', rule: '09:30~11:00 EST 시간창 필터', data: '시스템 시간 (EST)', quant: 'Allow only 09:30~11:00 EST', auto: 'yes' },

  // PDH/PDL
  { strategy: 'PDH/PDL', type: 'entry', rule: '전일 뉴욕 세션(9:30~16:00) 고가/저가 산출', data: '일봉 OHLC (전일 데이터)', quant: 'PDH = prev_day.High, PDL = prev_day.Low', auto: 'yes' },
  { strategy: 'PDH/PDL', type: 'entry', rule: '5분봉 마감 기준 PDH/PDL 돌파 확인', data: '5분봉 Close', quant: 'Close > PDH (Long) || Close < PDL (Short)', auto: 'yes' },
  { strategy: 'PDH/PDL', type: 'entry', rule: 'PDH/PDL 리테스트: 레벨 ±0.15% 접근 감지', data: '실시간 가격', quant: 'abs(Price - PDH) / PDH < 0.0015', auto: 'yes' },
  { strategy: 'PDH/PDL', type: 'filter', rule: 'SPY/QQQ 상대강도 필터: 지수 하락에도 PDH 유지', data: 'SPY/QQQ 가격, 종목 가격', quant: 'Stock holding PDH while Index declining', auto: 'partial' },
  { strategy: 'PDH/PDL', type: 'exit', rule: '손절: PDH - 0.1~0.2% (Long)', data: 'PDH/PDL 레벨', quant: 'SL = PDH × (1 - 0.001)', auto: 'yes' },
  { strategy: 'PDH/PDL', type: 'risk', rule: '일일 최대 손실 5% 도달 시 거래 중단', data: '계좌 잔고, 당일 P&L', quant: 'if daily_loss >= capital × 0.05: halt', auto: 'yes' },

  // BnR
  { strategy: 'BnR', type: 'entry', rule: '스윙 고점/저점 돌파: HTF 30분/1시간봉 기준', data: 'HTF OHLC (30m, 1h)', quant: 'Close > Swing_High (Bull) || Close < Swing_Low (Bear)', auto: 'yes' },
  { strategy: 'BnR', type: 'entry', rule: '3가지 패턴 인식: Continuation/Consolidation/Flat Top', data: 'HTF 가격 구조', quant: 'HH/HL 구조 또는 Range 경계', auto: 'partial' },
  { strategy: 'BnR', type: 'filter', rule: 'FVG 필수 확인: Displacement 없는 돌파 필터링', data: '3캔들 OHLC', quant: 'FVG 미형성 시 신호 등급 하향', auto: 'yes' },
  { strategy: 'BnR', type: 'entry', rule: '보수적 진입 모델: 확인 캔들 마감 후 진입 (60~70% 승률)', data: '진입 레벨 근처 캔들', quant: 'Confirmation Candle Close beyond prev candle', auto: 'yes' },

  // OB
  { strategy: 'OB', type: 'entry', rule: '추세 확인: Higher High/Low 또는 Lower High/Low', data: '스윙 포인트 데이터', quant: 'HH & HL = Uptrend | LH & LL = Downtrend', auto: 'partial' },
  { strategy: 'OB', type: 'entry', rule: '오더블록 캔들 식별: 강한 움직임 전 마지막 반대색 캔들', data: '캔들 색상, 다음 움직임 크기', quant: '하락마감 캔들 직후 강한 상승 발생 확인', auto: 'partial' },
  { strategy: 'OB', type: 'filter', rule: '횡보장 비활성화: 추세 없을 때 OB 전략 OFF', data: 'ADX 또는 HH/HL 구조', quant: 'ADX < 20 || Range market → skip', auto: 'yes' },

  // OneBox
  { strategy: 'OneBox', type: 'entry', rule: '전일 박스 설정: Wick-to-Body 상단/하단 박스', data: '전일 일봉 OHLC', quant: 'Upper: PDH_Wick ~ PDH_Body | Lower: PDL_Body ~ PDL_Wick', auto: 'yes' },
  { strategy: 'OneBox', type: 'filter', rule: 'No Trade Zone: 박스 중간 구간 진입 금지', data: '현재가, 박스 경계', quant: 'if PDL_Body < Price < PDH_Body: no_trade', auto: 'yes' },
  { strategy: 'OneBox', type: 'entry', rule: '반전 시나리오: 박스 도달 후 Rejection 캔들', data: '박스 경계 근처 캔들', quant: '박스 경계 ±0.1% + 반전 캔들 마감', auto: 'yes' },
  { strategy: 'OneBox', type: 'entry', rule: '지속 시나리오: 박스 돌파 후 리테스트 성공', data: '돌파 캔들, 리테스트 캔들', quant: 'Impulsive Close beyond box + Retest support', auto: 'yes' },

  // FVG
  { strategy: 'FVG', type: 'filter', rule: 'Bullish FVG 감지: 캔들1 High < 캔들3 Low', data: '3개 연속 캔들 OHLC', quant: 'candle[0].High < candle[2].Low', auto: 'yes' },
  { strategy: 'FVG', type: 'filter', rule: 'Bearish FVG 감지: 캔들1 Low > 캔들3 High', data: '3개 연속 캔들 OHLC', quant: 'candle[0].Low > candle[2].High', auto: 'yes' },
  { strategy: 'FVG', type: 'filter', rule: 'Inverse FVG: 기존 FVG 반대 돌파 시 방향 전환 신호', data: 'FVG 영역, 현재 Close', quant: 'if Close < FVG_Bottom (Bullish FVG): inverse signal', auto: 'yes' },
  { strategy: 'FVG', type: 'entry', rule: 'FVG + 주요 레벨 Confluence = 최고 신호 등급', data: 'FVG 영역, PDH/PDL, ORB 경계', quant: 'FVG 영역 ∩ PDH/PDL ∩ ORB = A++ grade', auto: 'yes' },

  // A+
  { strategy: 'A+', type: 'filter', rule: 'Step1: 유동성 목표 확인 (25점)', data: '이전 고/저점, PDH/PDL, ATH', quant: '명확한 외부 레벨 존재 시 +25점', auto: 'partial' },
  { strategy: 'A+', type: 'filter', rule: 'Step2: HTF 정렬 확인 (25점)', data: '일봉/4시간봉 추세', quant: '일봉 방향 = 매매 방향 시 +25점', auto: 'yes' },
  { strategy: 'A+', type: 'filter', rule: 'Step3: 기술적 패턴 확인 (25점)', data: '차트 패턴 인식', quant: '명확한 패턴 +25 / 형성중 +10 / 없음 +0', auto: 'partial' },
  { strategy: 'A+', type: 'filter', rule: 'Step4: SPY/QQQ 상대강도 확인 (25점)', data: 'SPY/QQQ 동향, 종목 동향', quant: 'Relative Strength/Weakness 확인 시 +25점', auto: 'partial' },
  { strategy: 'A+', type: 'entry', rule: '90점 이상만 자동 진입, 75~89점 알림, 75점 미만 차단', data: 'A+ 점수 합계', quant: 'if score >= 90: execute | 75~89: alert | < 75: block', auto: 'yes' },
  { strategy: 'A+', type: 'risk', rule: '10:00 EST ±20분 황금시간대 집중 (거래의 75% 집중)', data: '시스템 시간 (EST)', quant: '09:40~10:20 EST = 황금 시간대 가중치 +1', auto: 'yes' },
];

// ── 시뮬레이션 시간대 성과 데이터 ──────────────────────────────
const HOUR_PERFORMANCE_BASE = {
  hours: ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '14:00', '15:00'],
  trades: [12, 28, 21, 15, 9, 4, 3, 5, 7],
  winrate: [58, 65, 62, 55, 48, 40, 38, 42, 45],
  avgR: [2.1, 2.8, 2.5, 2.2, 1.8, 1.5, 1.4, 1.6, 1.9],
};
