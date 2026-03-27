// ============================================================
//  TradeEdge Pro — Main Application Logic
// ============================================================

// ── State ────────────────────────────────────────────────────
const APP = {
  currentTab: 'strategies',
  selectedStrategy: null,
  backtestResults: null,
  charts: {},
  strategyToggles: {},   // id → enabled
  tradeLogPage: 1,
  tradeLogPageSize: 15,
  tradeLogData: [],
  tradeLogFiltered: [],
  sortCol: null,
  sortDir: 1,
};

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initDate();
  initSidebar();
  initTabs();
  renderStrategyGrid();
  renderBtStrategyList();
  renderParamPreview();
  renderCompareTable();
  renderRulesetTable();
  renderScoringCard();
  bindFormEvents();
  bindCompareSort();
  bindRulesetFilter();
  initEquityCurveSelector();
});

// ── Date ─────────────────────────────────────────────────────
function initDate() {
  const el = document.getElementById('currentDate');
  const now = new Date();
  el.textContent = now.toLocaleDateString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit' });
}

// ── Sidebar Toggle ───────────────────────────────────────────
function initSidebar() {
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });
}

// ── Tab Navigation ───────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  APP.currentTab = tab;
  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-content').forEach(s => {
    s.classList.toggle('active', s.id === `tab-${tab}`);
  });

  const titles = {
    strategies: '전략 선택 & 규칙 관리',
    backtest:   '백테스트 조건 설정',
    dashboard:  '결과 대시보드',
    compare:    '전략 비교 테이블',
    ruleset:    '자동매매 룰셋 표',
  };
  document.getElementById('topbarTitle').textContent = titles[tab] || '';

  if (tab === 'compare') {
    renderCompareTable();
    renderCompareCharts();
  }
}

// ── Strategy Grid ─────────────────────────────────────────────
function renderStrategyGrid() {
  const grid = document.getElementById('strategyGrid');
  // init toggles
  STRATEGIES.forEach(s => { APP.strategyToggles[s.id] = s.enabled; });

  grid.innerHTML = STRATEGIES.map(s => `
    <div class="strategy-card ${s.enabled ? 'selected' : ''}" data-id="${s.id}">
      <div class="strategy-card-top">
        <div style="display:flex;align-items:center;gap:10px;flex:1;">
          <div class="strategy-icon" style="background:${s.color}22;">
            <i class="${s.icon}" style="color:${s.color};"></i>
          </div>
          <div>
            <h3>${s.shortName}</h3>
            <div class="subtitle">${s.subtitle}</div>
          </div>
        </div>
        <label class="toggle-switch" onclick="event.stopPropagation()">
          <input type="checkbox" ${s.enabled ? 'checked' : ''} data-id="${s.id}" class="strategy-toggle" />
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="strategy-meta">
        ${s.docWinRate ? `<span class="meta-badge win">승률 ${s.docWinRate}%</span>` : '<span class="meta-badge">승률 미공개</span>'}
        <span class="meta-badge rr">R/R 1:${s.docRR}</span>
        <span class="meta-badge time">${s.session}</span>
      </div>
      <div class="rule-count">${s.rules.length}개 규칙 · 타임프레임: ${s.timeframe.join(', ')} · 출처: ${s.docSource.substring(0,20)}...</div>
    </div>
  `).join('');

  // Card click → detail
  grid.querySelectorAll('.strategy-card').forEach(card => {
    card.addEventListener('click', () => showStrategyDetail(card.dataset.id));
  });

  // Toggle click
  grid.querySelectorAll('.strategy-toggle').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      APP.strategyToggles[id] = e.target.checked;
      const card = grid.querySelector(`.strategy-card[data-id="${id}"]`);
      card.classList.toggle('selected', e.target.checked);
    });
  });

  document.getElementById('closeDetail').addEventListener('click', () => {
    document.getElementById('strategyDetailPanel').classList.remove('visible');
  });
}

function showStrategyDetail(id) {
  const s = STRATEGIES.find(x => x.id === id);
  if (!s) return;
  APP.selectedStrategy = id;

  const panel = document.getElementById('strategyDetailPanel');
  const nameEl = document.getElementById('detailStrategyName');
  const bodyEl = document.getElementById('detailBody');

  nameEl.innerHTML = `<i class="${s.icon}" style="color:${s.color};margin-right:8px;"></i>${s.name}`;

  const tabs = ['규칙 목록', '진입 조건', '청산 조건', '필터 조건', '리스크'];
  const typeMap = { '진입 조건': 'entry', '청산 조건': 'exit', '필터 조건': 'filter', '리스크': 'risk' };

  bodyEl.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
      <div style="background:var(--bg-input);padding:12px;border-radius:8px;">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">문서 공개 승률</div>
        <div style="font-size:18px;font-weight:700;color:var(--green);font-family:var(--mono);">${s.docWinRate ? s.docWinRate + '%' : '미공개'}</div>
      </div>
      <div style="background:var(--bg-input);padding:12px;border-radius:8px;">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">문서 공개 R/R</div>
        <div style="font-size:18px;font-weight:700;color:var(--purple);font-family:var(--mono);">1:${s.docRR}</div>
      </div>
      <div style="background:var(--bg-input);padding:12px;border-radius:8px;">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">자동화 난이도</div>
        <div style="font-size:18px;font-weight:700;color:${s.automationDifficulty==='easy'?'var(--green)':s.automationDifficulty==='medium'?'var(--yellow)':'var(--red)'};">
          ${ {easy:'쉬움',medium:'보통',hard:'어려움'}[s.automationDifficulty] }
        </div>
      </div>
    </div>
    <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;">📄 출처: ${s.docSource} | 데이터 유형: ${s.dataType}</div>
    <div class="detail-tabs">
      ${tabs.map(t => `<button class="detail-tab-btn ${t==='규칙 목록'?'active':''}" data-dtab="${t}">${t}</button>`).join('')}
    </div>
    <div id="rulesList" class="rules-list"></div>
  `;

  renderDetailRules(s, '규칙 목록');

  bodyEl.querySelectorAll('.detail-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      bodyEl.querySelectorAll('.detail-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderDetailRules(s, btn.dataset.dtab);
    });
  });

  panel.classList.add('visible');
}

function renderDetailRules(s, tab) {
  const container = document.getElementById('rulesList');
  const typeMap = { '진입 조건': 'entry', '청산 조건': 'exit', '필터 조건': 'filter', '리스크': 'risk' };
  const rules = tab === '규칙 목록' ? s.rules : s.rules.filter(r => r.type === typeMap[tab]);
  const typeLabel = { entry: '진입', exit: '청산', filter: '필터', risk: '리스크' };

  container.innerHTML = rules.length === 0
    ? '<div style="color:var(--text-muted);padding:16px;text-align:center;">해당 조건이 없습니다.</div>'
    : rules.map(r => `
      <div class="rule-item ${r.type}">
        <span class="rule-type-badge">${typeLabel[r.type]}</span>
        <div>
          <div class="rule-text">${r.text}</div>
          <div class="rule-quant">${r.quant}</div>
        </div>
      </div>
    `).join('');
}

// ── Backtest Form ─────────────────────────────────────────────
function renderBtStrategyList() {
  const container = document.getElementById('btStrategyList');
  container.innerHTML = STRATEGIES.map(s => `
    <label class="strategy-checkbox-item">
      <input type="checkbox" name="btStrategy" value="${s.id}" ${s.enabled ? 'checked' : ''} />
      <span style="color:${s.color};font-weight:600;">${s.shortName}</span>
      <label>${s.name.substring(0,30)}...</label>
    </label>
  `).join('');
}

function renderParamPreview() {
  const container = document.getElementById('paramPreview');
  const params = [
    { label: '기본 전략 (ORB) 승률', value: '미공개 (규칙 기반)', cls: 'yellow' },
    { label: 'PDH/PDL 문서 승률', value: '55% (실거래 인증)', cls: 'green' },
    { label: '$92,300 스캘핑 승률', value: '38~40% (실거래 인증)', cls: 'yellow' },
    { label: 'A+ 체크리스트 기준시간', value: '10:00 EST ±20분 (75%)', cls: '' },
    { label: '권장 최소 R/R', value: '1:2 (전 전략 공통)', cls: 'green' },
    { label: 'PDH/PDL Profit Factor', value: '6.86 (실거래 인증)', cls: 'green' },
    { label: '거래당 최대 리스크', value: '1~2% of capital', cls: '' },
    { label: '일일 최대 드로다운', value: '5~10% → 거래 중단', cls: 'yellow' },
    { label: '권장 거래 횟수/일', value: '1~3회 (과매매 금지)', cls: '' },
    { label: '주요 거래 시간창', value: '9:30~11:00 EST', cls: 'green' },
  ];

  container.innerHTML = params.map(p => `
    <div class="param-row">
      <span class="param-label">${p.label}</span>
      <span class="param-value ${p.cls}">${p.value}</span>
    </div>
  `).join('');
}

function bindFormEvents() {
  // Sliders
  const sliders = [
    { input: 'bt-risk', display: 'bt-risk-val', fmt: v => v + '%' },
    { input: 'bt-fee', display: 'bt-fee-val', fmt: v => v + '%' },
    { input: 'bt-slippage', display: 'bt-slippage-val', fmt: v => v + ' 틱' },
  ];
  sliders.forEach(({ input, display, fmt }) => {
    const el = document.getElementById(input);
    const dEl = document.getElementById(display);
    el.addEventListener('input', () => { dEl.textContent = fmt(el.value); });
  });

  // Segment buttons (timeframe)
  document.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Run backtest
  document.getElementById('runBacktest').addEventListener('click', runBacktest);

  // Ruleset filter: also update strategy filter select options
  renderRulesetTable();

  // Trade log search
  document.getElementById('tradeLogSearch').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    APP.tradeLogFiltered = APP.tradeLogData.filter(r =>
      r.strategy.toLowerCase().includes(q) ||
      r.date.toLowerCase().includes(q) ||
      r.result.toLowerCase().includes(q)
    );
    APP.tradeLogPage = 1;
    renderTradeLogTable();
  });

  // Sortable headers
  document.querySelectorAll('.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (APP.sortCol === col) APP.sortDir *= -1;
      else { APP.sortCol = col; APP.sortDir = 1; }
      sortTradeLog();
    });
  });

  // Equity curve selector
  document.getElementById('equityCurveSelector').addEventListener('change', (e) => {
    if (APP.backtestResults) renderEquityChart(e.target.value);
  });
}

// ── Backtest Engine (Simulation) ──────────────────────────────
function runBacktest() {
  const selectedIds = [...document.querySelectorAll('input[name="btStrategy"]:checked')].map(el => el.value);
  if (selectedIds.length === 0) {
    alert('최소 한 개 이상의 전략을 선택해 주세요.');
    return;
  }

  const btn = document.getElementById('runBacktest');
  btn.classList.add('running');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 시뮬레이션 중...';

  showLoading('백테스트 시뮬레이션 실행 중...');

  setTimeout(() => {
    const params = {
      symbol: document.getElementById('bt-symbol').value,
      period: parseInt(document.getElementById('bt-period').value),
      startTime: document.getElementById('bt-starttime').value,
      endTime: document.getElementById('bt-endtime').value,
      risk: parseFloat(document.getElementById('bt-risk').value) / 100,
      fee: parseFloat(document.getElementById('bt-fee').value) / 100,
      slippage: parseInt(document.getElementById('bt-slippage').value),
      capital: parseFloat(document.getElementById('bt-capital').value),
      rrFilter: parseFloat(document.getElementById('bt-rrfilter').value),
      maxDaily: parseInt(document.getElementById('bt-maxdaily').value),
      strategies: selectedIds,
    };

    APP.backtestResults = simulate(params);
    hideLoading();
    const btn2 = document.getElementById('runBacktest');
    btn2.classList.remove('running');
    btn2.innerHTML = '<i class="fas fa-check"></i> 백테스트 완료!';
    setTimeout(() => { btn2.innerHTML = '<i class="fas fa-play"></i> 백테스트 실행'; }, 2500);
    renderDashboard();
    switchTab('dashboard');
  }, 1200);
}

function simulate(params) {
  const strategies = STRATEGIES.filter(s => params.strategies.includes(s.id));
  const tradingDays = params.period * 22; // ~22 trading days / month
  const results = {};
  const allTrades = [];

  strategies.forEach(s => {
    const baseWR = (s.simWinRate / 100);
    const baseRR = s.simRR;
    const feePenalty = params.fee * 2;

    let equity = params.capital;
    const equityCurve = [equity];
    let wins = 0, losses = 0, totalR = 0, maxEquity = equity, maxDD = 0;
    const trades = [];
    let dailyLoss = 0, dailyCount = 0, prevDay = null;

    for (let d = 0; d < tradingDays; d++) {
      const date = generateDate(d);
      if (date !== prevDay) { dailyLoss = 0; dailyCount = 0; prevDay = date; }
      if (dailyLoss >= params.capital * 0.1) continue; // circuit breaker

      const tradeCountToday = Math.floor(Math.random() * (params.maxDaily) + 1);
      for (let t = 0; t < tradeCountToday; t++) {
        if (dailyCount >= params.maxDaily) break;

        // signal quality filter
        const noise = (Math.random() - 0.5) * 0.1;
        const wr = Math.min(0.85, Math.max(0.25, baseWR + noise));
        const rr = Math.max(1.0, baseRR + (Math.random() - 0.5) * 0.8);
        if (rr < params.rrFilter) continue;

        const riskAmt = equity * params.risk;
        const side = Math.random() > 0.5 ? 'Long' : 'Short';
        const entryPrice = 100 + Math.random() * 300;
        const slPct = 0.005 + Math.random() * 0.01;
        const slPrice = side === 'Long' ? entryPrice * (1 - slPct) : entryPrice * (1 + slPct);
        const tpPrice = side === 'Long'
          ? entryPrice + (entryPrice - slPrice) * rr
          : entryPrice - (slPrice - entryPrice) * rr;

        const won = Math.random() < wr;
        const pnlR = won ? rr - feePenalty : -(1 + feePenalty);
        const pnl = riskAmt * pnlR;

        equity += pnl;
        if (equity > maxEquity) maxEquity = equity;
        const dd = (maxEquity - equity) / maxEquity * 100;
        if (dd > maxDD) maxDD = dd;
        if (!won) dailyLoss += Math.abs(pnl);
        dailyCount++;

        won ? wins++ : losses++;
        totalR += pnlR;

        const tradeObj = {
          no: allTrades.length + trades.length + 1,
          date,
          strategy: s.shortName,
          side,
          entry: entryPrice.toFixed(2),
          exit: (won ? tpPrice : slPrice).toFixed(2),
          rr: rr.toFixed(1),
          result: won ? '승리' : '손실',
          pnl: pnl.toFixed(0),
          equityAfter: equity.toFixed(0),
        };
        trades.push(tradeObj);
        equityCurve.push(equity);
      }
    }

    const totalTrades = wins + losses;
    const winRate = totalTrades > 0 ? (wins / totalTrades * 100) : 0;
    const avgR = totalTrades > 0 ? (totalR / totalTrades) : 0;
    const grossWin = trades.filter(t => t.result === '승리').reduce((a, t) => a + parseFloat(t.pnl), 0);
    const grossLoss = Math.abs(trades.filter(t => t.result === '손실').reduce((a, t) => a + parseFloat(t.pnl), 0));
    const pf = grossLoss > 0 ? (grossWin / grossLoss) : 0;
    const totalPnL = equity - params.capital;

    results[s.id] = {
      strategy: s,
      params,
      wins,
      losses,
      totalTrades,
      winRate: winRate.toFixed(1),
      avgR: avgR.toFixed(2),
      pf: pf.toFixed(2),
      maxDD: maxDD.toFixed(1),
      finalEquity: equity.toFixed(0),
      totalPnL: totalPnL.toFixed(0),
      roi: (totalPnL / params.capital * 100).toFixed(1),
      equityCurve,
      trades,
    };

    allTrades.push(...trades);
  });

  // Renumber all trades
  allTrades.sort((a, b) => a.date.localeCompare(b.date));
  allTrades.forEach((t, i) => { t.no = i + 1; });

  return { strategies: results, allTrades, params };
}

function generateDate(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() - dayOffset * 1.4);
  // Skip weekends
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  return d.toISOString().substring(0, 10);
}

// ── Dashboard Render ──────────────────────────────────────────
function renderDashboard() {
  const { strategies, allTrades, params } = APP.backtestResults;
  document.getElementById('dashNoData').classList.add('hidden');
  document.getElementById('dashResults').classList.remove('hidden');

  // Aggregate KPIs
  let totalTrades = 0, totalWins = 0, totalPnL = 0, maxMDD = 0;
  let sumRR = 0, sumPF = 0, stratCount = 0;
  Object.values(strategies).forEach(r => {
    totalTrades += r.totalTrades;
    totalWins += r.wins;
    totalPnL += parseFloat(r.totalPnL);
    if (parseFloat(r.maxDD) > maxMDD) maxMDD = parseFloat(r.maxDD);
    sumRR += parseFloat(r.avgR);
    sumPF += parseFloat(r.pf);
    stratCount++;
  });
  const aggWR = totalTrades > 0 ? (totalWins / totalTrades * 100).toFixed(1) : 0;
  const aggRR = stratCount > 0 ? (sumRR / stratCount).toFixed(2) : 0;
  const aggPF = stratCount > 0 ? (sumPF / stratCount).toFixed(2) : 0;
  const finalEquity = params.capital + totalPnL;
  const roi = (totalPnL / params.capital * 100).toFixed(1);

  const kpis = [
    { label: '최종 자산', value: '$' + finalEquity.toLocaleString(undefined,{maximumFractionDigits:0}), sub: `ROI: ${roi}%`, cls: 'kpi-blue', icon: 'fas fa-wallet' },
    { label: '총 수익/손실', value: (totalPnL >= 0 ? '+$' : '-$') + Math.abs(totalPnL).toLocaleString(undefined,{maximumFractionDigits:0}), sub: `초기자본 $${params.capital.toLocaleString()}`, cls: totalPnL >= 0 ? 'kpi-green' : 'kpi-red', icon: 'fas fa-dollar-sign' },
    { label: '통합 승률', value: aggWR + '%', sub: `승 ${totalWins} / 패 ${totalTrades - totalWins}`, cls: 'kpi-green', icon: 'fas fa-chart-pie' },
    { label: '평균 R (기대값)', value: aggRR + 'R', sub: `목표: 2.0R 이상`, cls: 'kpi-purple', icon: 'fas fa-balance-scale' },
    { label: 'Profit Factor', value: aggPF, sub: '목표: 2.0 이상', cls: 'kpi-cyan', icon: 'fas fa-layer-group' },
    { label: '최대 드로다운', value: maxMDD.toFixed(1) + '%', sub: '목표: 10% 이하', cls: maxMDD <= 10 ? 'kpi-green' : 'kpi-red', icon: 'fas fa-arrow-down' },
    { label: '총 거래 수', value: totalTrades.toLocaleString(), sub: `${params.period}개월 · ${params.strategies.length}전략`, cls: 'kpi-yellow', icon: 'fas fa-exchange-alt' },
    { label: '전략 수', value: stratCount + '개', sub: params.strategies.map(id => STRATEGIES.find(s=>s.id===id)?.shortName).join(', '), cls: 'kpi-blue', icon: 'fas fa-star' },
  ];

  document.getElementById('kpiGrid').innerHTML = kpis.map(k => `
    <div class="kpi-card ${k.cls}">
      <div class="kpi-icon"><i class="${k.icon}"></i></div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>
  `).join('');

  // Equity curve selector
  const sel = document.getElementById('equityCurveSelector');
  sel.innerHTML = '<option value="all">전체 통합</option>' +
    Object.keys(strategies).map(id => `<option value="${id}">${strategies[id].strategy.shortName}</option>`).join('');
  renderEquityChart('all');

  // Hour chart
  renderHourChart();

  // Win rate chart
  renderWinRateChart(strategies);

  // R-multiple distribution
  renderRMultipleChart(allTrades);

  // Trade log
  APP.tradeLogData = allTrades;
  APP.tradeLogFiltered = [...allTrades];
  APP.tradeLogPage = 1;
  renderTradeLogTable();

  // Update compare table with sim results
  renderCompareTable();
}

function renderEquityChart(stratId) {
  const { strategies, params } = APP.backtestResults;
  let labels, data;

  if (stratId === 'all') {
    // Aggregate: sum all equity curves
    const maxLen = Math.max(...Object.values(strategies).map(r => r.equityCurve.length));
    data = Array(maxLen).fill(0).map((_, i) => {
      let sum = 0;
      Object.values(strategies).forEach(r => {
        const idx = Math.min(i, r.equityCurve.length - 1);
        sum += r.equityCurve[idx] - params.capital;
      });
      return params.capital + sum / Object.keys(strategies).length;
    });
    labels = data.map((_, i) => i);
  } else {
    const r = strategies[stratId];
    data = r.equityCurve;
    labels = data.map((_, i) => i);
  }

  const ctx = document.getElementById('equityChart');
  if (APP.charts.equity) APP.charts.equity.destroy();

  const color = data[data.length - 1] >= data[0] ? '#22c55e' : '#ef4444';
  APP.charts.equity = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '자산 ($)',
        data,
        borderColor: color,
        backgroundColor: color + '22',
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.3,
      }]
    },
    options: chartDefaults('$'),
  });
}

function renderHourChart() {
  const ctx = document.getElementById('hourChart');
  if (APP.charts.hour) APP.charts.hour.destroy();
  const h = HOUR_PERFORMANCE_BASE;

  APP.charts.hour = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: h.hours,
      datasets: [
        {
          label: '거래 수',
          data: h.trades,
          backgroundColor: '#3b82f644',
          borderColor: '#3b82f6',
          borderWidth: 1,
          yAxisID: 'y1',
        },
        {
          type: 'line',
          label: '승률 (%)',
          data: h.winrate,
          borderColor: '#22c55e',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 3,
          yAxisID: 'y2',
        }
      ]
    },
    options: {
      ...chartDefaults(),
      scales: {
        x: { grid: { color: '#252d3d' }, ticks: { color: '#8899aa', font: { size: 11 } } },
        y1: { grid: { color: '#252d3d' }, ticks: { color: '#3b82f6', font: { size: 11 } }, position: 'left', title: { display: true, text: '거래수', color: '#3b82f6' } },
        y2: { grid: { display: false }, ticks: { color: '#22c55e', font: { size: 11 } }, position: 'right', title: { display: true, text: '승률%', color: '#22c55e' }, min: 0, max: 100 },
      }
    }
  });
}

function renderWinRateChart(strategies) {
  const ctx = document.getElementById('winRateChart');
  if (APP.charts.winRate) APP.charts.winRate.destroy();

  const labels = Object.values(strategies).map(r => r.strategy.shortName);
  const simWR   = Object.values(strategies).map(r => parseFloat(r.winRate));
  const docWR   = Object.values(strategies).map(r => r.strategy.docWinRate ?? 0);

  APP.charts.winRate = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: '시뮬 승률', data: simWR, backgroundColor: '#3b82f6aa', borderColor: '#3b82f6', borderWidth: 1 },
        { label: '문서 승률', data: docWR, backgroundColor: '#22c55e88', borderColor: '#22c55e', borderWidth: 1 },
      ]
    },
    options: {
      ...chartDefaults('%'),
      scales: {
        x: { grid: { color: '#252d3d' }, ticks: { color: '#8899aa', font: { size: 11 } } },
        y: { grid: { color: '#252d3d' }, ticks: { color: '#8899aa', font: { size: 11 } }, min: 0, max: 100 },
      }
    }
  });
}

function renderRMultipleChart(allTrades) {
  const ctx = document.getElementById('rMultipleChart');
  if (APP.charts.rMultiple) APP.charts.rMultiple.destroy();

  const buckets = {};
  for (let i = -3; i <= 5; i++) {
    const key = i === -3 ? '<-3' : i === 5 ? '>4' : `${i} ~ ${i+1}R`;
    buckets[key] = 0;
  }

  allTrades.forEach(t => {
    const r = parseFloat(t.rr) * (t.result === '승리' ? 1 : -1);
    if (r < -3) buckets['<-3']++;
    else if (r > 4) buckets['>4']++;
    else {
      const k = Math.floor(r);
      const key = `${k} ~ ${k+1}R`;
      if (buckets[key] !== undefined) buckets[key]++;
    }
  });

  const colors = Object.keys(buckets).map(k =>
    k.startsWith('-') || k === '<-3' ? '#ef444488' : '#22c55e88'
  );

  APP.charts.rMultiple = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(buckets),
      datasets: [{
        label: '거래 수',
        data: Object.values(buckets),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('88', 'ff')),
        borderWidth: 1,
      }]
    },
    options: chartDefaults('건'),
  });
}

// ── Trade Log Table ───────────────────────────────────────────
function renderTradeLogTable() {
  const tbody = document.getElementById('tradeLogBody');
  const data = APP.tradeLogFiltered;
  const page = APP.tradeLogPage;
  const ps = APP.tradeLogPageSize;
  const start = (page - 1) * ps;
  const pageData = data.slice(start, start + ps);

  tbody.innerHTML = pageData.map(t => `
    <tr>
      <td class="mono">${t.no}</td>
      <td class="mono">${t.date}</td>
      <td><strong>${t.strategy}</strong></td>
      <td class="${t.side === 'Long' ? 'badge-long' : 'badge-short'}">${t.side}</td>
      <td class="mono">$${t.entry}</td>
      <td class="mono">$${t.exit}</td>
      <td class="mono" style="color:var(--purple);">${t.rr}R</td>
      <td class="${t.result === '승리' ? 'badge-win' : 'badge-loss'}">${t.result}</td>
      <td class="mono ${parseFloat(t.pnl) >= 0 ? 'text-green' : 'text-red'}">${parseFloat(t.pnl) >= 0 ? '+' : ''}$${parseFloat(t.pnl).toLocaleString()}</td>
    </tr>
  `).join('');

  renderPagination(data.length);
}

function renderPagination(total) {
  const ps = APP.tradeLogPageSize;
  const pages = Math.ceil(total / ps);
  const current = APP.tradeLogPage;
  const container = document.getElementById('tablePagination');

  let html = '';
  if (pages <= 8) {
    for (let i = 1; i <= pages; i++) {
      html += `<button class="page-btn ${i === current ? 'active' : ''}" data-p="${i}">${i}</button>`;
    }
  } else {
    const around = [1, 2, current - 1, current, current + 1, pages - 1, pages].filter(p => p > 0 && p <= pages);
    const unique = [...new Set(around)].sort((a, b) => a - b);
    let prev = null;
    unique.forEach(p => {
      if (prev && p - prev > 1) html += '<span style="color:var(--text-muted);padding:4px;">…</span>';
      html += `<button class="page-btn ${p === current ? 'active' : ''}" data-p="${p}">${p}</button>`;
      prev = p;
    });
  }

  container.innerHTML = html;
  container.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      APP.tradeLogPage = parseInt(btn.dataset.p);
      renderTradeLogTable();
    });
  });
}

function sortTradeLog() {
  const col = APP.sortCol;
  const dir = APP.sortDir;
  APP.tradeLogFiltered.sort((a, b) => {
    let va = a[col], vb = b[col];
    if (['no', 'rr', 'pnl'].includes(col)) { va = parseFloat(va); vb = parseFloat(vb); }
    if (va < vb) return -dir;
    if (va > vb) return dir;
    return 0;
  });
  APP.tradeLogPage = 1;
  renderTradeLogTable();
}

// ── Compare Table ─────────────────────────────────────────────
function renderCompareTable() {
  const tbody = document.getElementById('compareBody');
  const results = APP.backtestResults?.strategies || {};

  tbody.innerHTML = STRATEGIES.map(s => {
    const r = results[s.id];
    const diffMap = { easy: ['diff-easy', '쉬움'], medium: ['diff-medium', '보통'], hard: ['diff-hard', '어려움'] };
    const [diffCls, diffLabel] = diffMap[s.automationDifficulty];
    const stars = '★'.repeat(s.stars) + '☆'.repeat(5 - s.stars);

    return `
      <tr>
        <td><strong style="color:${s.color};">${s.shortName}</strong><br><span style="font-size:11px;color:var(--text-muted);">${s.subtitle.substring(0,20)}...</span></td>
        <td><span style="font-size:11px;">${s.session}</span></td>
        <td>${s.timeframe.join(', ')}</td>
        <td>${s.docWinRate ? `<span class="text-green mono">${s.docWinRate}%</span>` : '<span class="text-muted">미공개</span>'}</td>
        <td><span class="mono" style="color:var(--purple);">1:${s.docRR}</span></td>
        <td>${r ? `<span class="text-green mono">${r.winRate}%</span>` : '<span class="text-muted">-</span>'}</td>
        <td>${r ? `<span class="mono" style="color:var(--purple);">${r.avgR}R</span>` : '<span class="text-muted">-</span>'}</td>
        <td>${r ? `<span class="mono ${parseFloat(r.pf) >= 2 ? 'text-green' : 'text-yellow'}">${r.pf}</span>` : '<span class="text-muted">-</span>'}</td>
        <td>${r ? `<span class="mono ${parseFloat(r.maxDD) <= 10 ? 'text-green' : 'text-red'}">${r.maxDD}%</span>` : '<span class="text-muted">-</span>'}</td>
        <td><span class="difficulty-badge ${diffCls}">${diffLabel}</span></td>
        <td><span class="stars" style="font-size:13px;">${stars}</span></td>
      </tr>
    `;
  }).join('');
}

function bindCompareSort() {
  const sortFn = (key, numFn) => {
    const rows = [...document.querySelectorAll('#compareBody tr')];
    rows.sort((a, b) => {
      const getVal = (row, k) => {
        const cells = row.querySelectorAll('td');
        if (k === 'winRate') return parseFloat(cells[5].textContent) || 0;
        if (k === 'pf')      return parseFloat(cells[7].textContent) || 0;
        if (k === 'rr')      return parseFloat(cells[4].textContent.replace('1:','')) || 0;
        return 0;
      };
      return getVal(b, key) - getVal(a, key);
    });
    rows.forEach(r => document.getElementById('compareBody').appendChild(r));
  };

  document.getElementById('sortWinRate').addEventListener('click', () => sortFn('winRate'));
  document.getElementById('sortPF').addEventListener('click', () => sortFn('pf'));
  document.getElementById('sortRR').addEventListener('click', () => sortFn('rr'));
  document.getElementById('resetSort').addEventListener('click', () => renderCompareTable());
}

function renderCompareCharts() {
  const pfCtx = document.getElementById('pfCompareChart');
  const scCtx = document.getElementById('scatterChart');

  const labels = STRATEGIES.map(s => s.shortName);
  const results = APP.backtestResults?.strategies || {};

  // PF bar
  if (APP.charts.pfCompare) APP.charts.pfCompare.destroy();
  APP.charts.pfCompare = new Chart(pfCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Profit Factor (시뮬)',
        data: STRATEGIES.map(s => results[s.id] ? parseFloat(results[s.id].pf) : s.simPF),
        backgroundColor: STRATEGIES.map(s => s.color + '88'),
        borderColor: STRATEGIES.map(s => s.color),
        borderWidth: 2,
      }]
    },
    options: {
      ...chartDefaults(),
      scales: {
        x: { grid: { color: '#252d3d' }, ticks: { color: '#8899aa', font: { size: 11 } } },
        y: { grid: { color: '#252d3d' }, ticks: { color: '#8899aa', font: { size: 11 } }, min: 0 },
      }
    }
  });

  // Scatter: WR vs RR
  if (APP.charts.scatter) APP.charts.scatter.destroy();
  APP.charts.scatter = new Chart(scCtx, {
    type: 'scatter',
    data: {
      datasets: STRATEGIES.map(s => ({
        label: s.shortName,
        data: [{
          x: results[s.id] ? parseFloat(results[s.id].winRate) : s.simWinRate,
          y: results[s.id] ? parseFloat(results[s.id].avgR)    : s.simRR,
        }],
        backgroundColor: s.color + 'cc',
        borderColor: s.color,
        borderWidth: 2,
        pointRadius: 10,
        pointHoverRadius: 13,
      }))
    },
    options: {
      ...chartDefaults(),
      plugins: {
        legend: { labels: { color: '#8899aa', font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: WR ${ctx.raw.x}% | AvgR ${ctx.raw.y}R`,
          }
        }
      },
      scales: {
        x: { grid: { color: '#252d3d' }, ticks: { color: '#8899aa', font: { size: 11 } }, title: { display: true, text: '승률 (%)', color: '#8899aa' }, min: 30, max: 75 },
        y: { grid: { color: '#252d3d' }, ticks: { color: '#8899aa', font: { size: 11 } }, title: { display: true, text: '평균 R', color: '#8899aa' }, min: 1, max: 4 },
      }
    }
  });
}

// ── Ruleset Table ─────────────────────────────────────────────
function renderRulesetTable() {
  const stratFilter = document.getElementById('rulesetStrategyFilter');
  const strategies = [...new Set(RULESET_DATA.map(r => r.strategy))];

  // Populate filter dropdown
  stratFilter.innerHTML = '<option value="all">전체</option>' +
    strategies.map(s => `<option value="${s}">${s}</option>`).join('');

  filterAndRenderRuleset();
}

function filterAndRenderRuleset() {
  const stratFilter = document.getElementById('rulesetStrategyFilter').value;
  const typeFilter  = document.getElementById('rulesetTypeFilter').value;

  let data = RULESET_DATA;
  if (stratFilter !== 'all') data = data.filter(r => r.strategy === stratFilter);
  if (typeFilter  !== 'all') data = data.filter(r => r.type === typeFilter);

  const typeLabel = { entry: '진입', exit: '청산', filter: '필터', risk: '리스크' };
  const typeColor = { entry: 'var(--green)', exit: 'var(--red)', filter: 'var(--cyan)', risk: 'var(--yellow)' };
  const autoLabel = { yes: '✅ 가능', partial: '⚠️ 부분', no: '❌ 불가' };
  const autoCls   = { yes: 'auto-yes', partial: 'auto-partial', no: 'auto-no' };

  const tbody = document.getElementById('rulesetBody');
  tbody.innerHTML = data.map(r => `
    <tr>
      <td><strong>${r.strategy}</strong></td>
      <td><span style="color:${typeColor[r.type]};font-weight:600;">${typeLabel[r.type]}</span></td>
      <td>${r.rule}</td>
      <td style="color:var(--text-secondary);font-size:11px;">${r.data}</td>
      <td><code style="background:var(--bg-input);padding:2px 6px;border-radius:4px;font-family:var(--mono);font-size:11px;color:var(--cyan);">${r.quant}</code></td>
      <td><span class="${autoCls[r.auto]}">${autoLabel[r.auto]}</span></td>
    </tr>
  `).join('');
}

function bindRulesetFilter() {
  document.getElementById('rulesetStrategyFilter').addEventListener('change', filterAndRenderRuleset);
  document.getElementById('rulesetTypeFilter').addEventListener('change', filterAndRenderRuleset);
}

// ── A+ Scoring Card ───────────────────────────────────────────
function renderScoringCard() {
  const container = document.getElementById('scoringCard');
  container.innerHTML = `
    <h3 class="card-title"><i class="fas fa-star"></i> A+ 셋업 점수 체계 (PDF 문서 기반)</h3>
    <div class="scoring-grid">
      ${[
        { step: 'Step 1', name: '유동성 목표 (Draw on Liquidity)', pts: 25, desc: '이전 고점/저점, PDH/PDL, ATH 등 명확한 목표 레벨이 존재하는가?<br>없으면 시장이 어디로 향하는지 알 수 없음.', color: 'var(--accent)' },
        { step: 'Step 2', name: '상위 타임프레임 정렬 (HTF Clarity)', pts: 25, desc: '일봉/4시간봉 추세가 매매 방향과 일치하는가?<br>A+ 셋업의 84%가 HTF와 일치할 때 발생 (문서 통계).', color: 'var(--green)' },
        { step: 'Step 3', name: '기술적 패턴 (Technical Setup)', pts: 25, desc: '컵앤핸들, 추세선 돌파, Break & Retest, 쐐기형 등 명확한 패턴이 보이는가?<br>패턴 형성 중: 10점 부여.', color: 'var(--yellow)' },
        { step: 'Step 4', name: '상대 강도 (Order Flow/RS)', pts: 25, desc: 'SPY/QQQ 대비 종목이 상대적 강세(Long) 또는 약세(Short)를 보이는가?<br>시장 하락에도 PDH 유지 = 강한 신호.', color: 'var(--purple)' },
      ].map(s => `
        <div class="scoring-item">
          <div class="scoring-item-header">
            <h4 style="color:${s.color};">${s.step}: ${s.name}</h4>
            <span class="scoring-pts" style="color:${s.color};">${s.pts}점</span>
          </div>
          <p>${s.desc}</p>
        </div>
      `).join('')}
    </div>
    <h4 style="margin-bottom:12px;font-size:13px;">등급별 판정 기준</h4>
    <div class="scoring-grade-row">
      <div class="grade-badge grade-aplus"><h4>A+ (90~100점)</h4><p>자동 진입 허용 · 전체 포지션<br>NVDA 3.6R, AMD 9R 달성 사례</p></div>
      <div class="grade-badge grade-b"><h4>B+ (75~89점)</h4><p>진입 가능 · 절반 포지션<br>주의하며 거래</p></div>
      <div class="grade-badge grade-c"><h4>C (75점 미만)</h4><p>관망 권고 · 알림만<br>엣지 부족</p></div>
      <div class="grade-badge grade-no"><h4>No Trade (각 조건 불충족)</h4><p>HTF 역방향 · 패턴 불명확<br>유동성 목표 없음</p></div>
    </div>
    <div style="margin-top:16px;padding:12px;background:var(--bg-input);border-radius:8px;border-left:3px solid var(--yellow);">
      <p style="font-size:12px;color:var(--text-secondary);line-height:1.7;">
        📊 <strong style="color:var(--yellow);">문서 통계</strong>: 거래의 75%가 EST 10:00 ±20분에 발생 | 2차 진입 성공률 60% | NVDA: 3.6R / AMD: 9R 달성 사례 | 10:00 EST = 황금 시간대<br>
        ⚠️ <strong style="color:var(--yellow);">주의</strong>: 이 앱은 연구/시뮬레이션 전용입니다. 실제 계좌 거래에는 별도의 브로커 연동이 필요합니다.
      </p>
    </div>
  `;
}

// ── Equity Curve Selector Init ────────────────────────────────
function initEquityCurveSelector() {
  const sel = document.getElementById('equityCurveSelector');
  sel.innerHTML = '<option value="all">전체 통합</option>';
  STRATEGIES.filter(s => s.enabled).forEach(s => {
    sel.innerHTML += `<option value="${s.id}">${s.shortName}</option>`;
  });
}

// ── Chart Defaults ────────────────────────────────────────────
function chartDefaults(unit = '') {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#8899aa', font: { size: 11 } } },
      tooltip: {
        backgroundColor: '#1a2030',
        borderColor: '#252d3d',
        borderWidth: 1,
        titleColor: '#e2e8f0',
        bodyColor: '#8899aa',
        callbacks: unit ? { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}${unit}` } : {},
      }
    },
    scales: {
      x: { grid: { color: '#252d3d' }, ticks: { color: '#8899aa', font: { size: 11 }, maxTicksLimit: 10 } },
      y: { grid: { color: '#252d3d' }, ticks: { color: '#8899aa', font: { size: 11 } } },
    },
    animation: { duration: 600 },
  };
}

// ── Loading Overlay ───────────────────────────────────────────
function showLoading(msg = '처리 중...') {
  const div = document.createElement('div');
  div.className = 'loading-overlay';
  div.id = 'loadingOverlay';
  div.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-text">${msg}</div>
  `;
  document.body.appendChild(div);
}

function hideLoading() {
  const el = document.getElementById('loadingOverlay');
  if (el) el.remove();
}
