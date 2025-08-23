/********************************************
 * Finance Helper (理財小幫手)
 * 前端邏輯：交易、預算、目標、掃描發票、後端連接
 ********************************************/

// --- 全域設定與工具 ---
const STORE_KEY = 'finance-helper-v1';
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const state = {
  tx: [],       // 交易紀錄：{id,date,type,amount,category,note}
  budgets: {},  // 預算：{category: amount}
  goals: []     // 儲蓄目標：{id,name,target,saved}
};

// 格式化金額
const fmt = (n) => {
  if (isNaN(n)) return '$0';
  return new Intl.NumberFormat('zh-Hant-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0
  }).format(n);
};

// 工具函式
const monthKey = (d) => d.slice(0, 7); // yyyy-mm
const todayStr = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 9);


// --- 本機儲存 ---
function load() {
  const raw = localStorage.getItem(STORE_KEY);
  if (raw) {
    try { Object.assign(state, JSON.parse(raw)); }
    catch (e) { console.warn(e); }
  } else {
    seed();  // 沒資料就產生範例
    save();
  }
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}


// --- 建立範例資料 ---
function seed() {
  const base = new Date();
  base.setDate(1);

  for (let i = 0; i < 8; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    const ym = d.toISOString().slice(0, 7);

    // 模擬收入
    state.tx.push({
      id: uid(),
      date: ym + '-05',
      type: 'income',
      amount: 65000 + Math.round(Math.random() * 4000),
      category: '薪資',
      note: ''
    });

    // 模擬支出
    const cats = [
      ['餐飲', 9000],
      ['交通', 1500],
      ['娛樂', 3000],
      ['房租', 15000],
      ['購物', 4000]
    ];
    cats.forEach(([c, avg]) => {
      const amt = avg * (0.8 + Math.random() * 0.4);
      state.tx.push({
        id: uid(),
        date: ym + '-' + String(10 + Math.floor(Math.random() * 18)).padStart(2, '0'),
        type: 'expense',
        amount: Math.round(amt),
        category: c,
        note: ''
      });
    });
  }

  // 預設預算
  state.budgets = {
    '餐飲': 10000,
    '交通': 2000,
    '娛樂': 3500,
    '房租': 15000,
    '購物': 5000
  };

  // 預設儲蓄目標
  state.goals = [{
    id: uid(),
    name: '緊急預備金',
    target: 120000,
    saved: 45000
  }];
}


// --- 主畫面渲染 ---
function render() {
  renderSummary();
  renderTable();
  renderBudgets();
  renderChart();
  renderGoals();
  $('#txDate').value ||= todayStr();
}

// 取得某月資料
function getMonthData(ym) {
  const list = state.tx.filter(t => monthKey(t.date) === ym);
  const income = list.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const expense = list.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  return {
    income, expense,
    countI: list.filter(t => t.type === 'income').length,
    countE: list.filter(t => t.type === 'expense').length
  };
}


// --- 各區塊渲染 (摘要 / 表格 / 預算 / 圖表 / 目標) ---
function renderSummary() {
  const now = new Date();
  const ym = now.toISOString().slice(0, 7);
  const m = getMonthData(ym);

  $('#income').textContent = fmt(m.income);
  $('#incomeCount').textContent = m.countI + ' 筆';
  $('#expense').textContent = fmt(m.expense);
  $('#expenseCount').textContent = m.countE + ' 筆';

  const bal = m.income - m.expense;
  $('#balance').textContent = fmt(bal);
  $('#balanceNote').textContent = `${ym} 的結餘`;

  const rate = m.income ? Math.round((bal / m.income) * 100) : 0;
  $('#savingRate').textContent = (rate < 0 ? 0 : rate) + '%';
}

function renderTable() {
  const q = $('#q').value?.trim().toLowerCase() || '';
  const fType = $('#fType').value;
  const ym = $('#fMonth').value;

  const list = state.tx
    .filter(t => !ym || monthKey(t.date) === ym)
    .filter(t => fType === 'all' || t.type === fType)
    .filter(t => !q || (t.category + t.note).toLowerCase().includes(q))
    .sort((a, b) => a.date < b.date ? 1 : -1);

  const tbody = $('#txTbody');
  tbody.innerHTML = '';

  list.forEach(t => {
    const tr = document.createElement('tr');
    tr.className = 'row';
    tr.innerHTML = `
      <td>${t.date}</td>
      <td><span class="pill ${t.type === 'income' ? 'good' : 'bad'}">
        ${t.type === 'income' ? '收入' : '支出'}
      </span></td>
      <td>${t.category || '-'}</td>
      <td>${t.note || ''}</td>
      <td style="font-weight:700;text-align:right">${fmt(t.amount)}</td>
      <td style="text-align:right"><button data-del="${t.id}">刪除</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderBudgets() {
  const wrap = $('#budgetList');
  wrap.innerHTML = '';

  const nowYM = new Date().toISOString().slice(0, 7);
  const spentByCat = {};
  state.tx.filter(t => t.type === 'expense' && monthKey(t.date) === nowYM)
    .forEach(t => spentByCat[t.category] = (spentByCat[t.category] || 0) + t.amount);

  Object.keys(state.budgets).sort().forEach(cat => {
    const limit = state.budgets[cat];
    const used = spentByCat[cat] || 0;
    const ratio = Math.min(1, used / limit || 0);
    const left = Math.max(0, limit - used);

    const card = document.createElement('div');
    card.style.marginBottom = '10px';
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div><strong>${cat}</strong> · <span class="muted">${fmt(used)} / ${fmt(limit)}</span></div>
        <div class="muted">剩餘 ${fmt(left)}</div>
      </div>
      <div class="progress"><div class="bar" style="width:${ratio * 100}%"></div></div>
    `;
    wrap.appendChild(card);
  });
}

function renderChart() {
  const cvs = $('#chart');
  const ctx = cvs.getContext('2d');
  const now = new Date();

  const labels = [];
  const dataI = [], dataE = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = d.toISOString().slice(0, 7);
    labels.push(ym);

    const m = getMonthData(ym);
    dataI.push(m.income);
    dataE.push(m.expense);
  }

  // 清空畫布
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  // 繪製軸線
  const padL = 40, padB = 24, padT = 10, padR = 10;
  const W = cvs.width - padL - padR, H = cvs.height - padT - padB;
  ctx.save();
  ctx.translate(padL, padT);

  const max = Math.max(...dataI, ...dataE, 1);
  const yStep = Math.ceil(max / 5);

  ctx.strokeStyle = 'rgba(255,255,255,.15)';
  ctx.fillStyle = 'rgba(255,255,255,.6)';
  ctx.font = '12px system-ui';

  // Y軸格線 + 標籤
  for (let i = 0; i <= 5; i++) {
    const y = H - (H * (i / 5));
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
    ctx.fillText((yStep * i / 1000).toFixed(0) + 'k', -34, y + 4);
  }

  // 繪製長條圖
  const n = labels.length;
  const bw = W / (n * 2);

  for (let i = 0; i < n; i++) {
    const x = i * (W / n) + 6;
    const hI = H * (dataI[i] / max);
    const hE = H * (dataE[i] / max);

    // 收入 (淺藍)
    ctx.fillStyle = '#8fd3ff';
    ctx.fillRect(x, H - hI, bw, hI);

    // 支出 (深藍)
    ctx.fillStyle = '#6aa2ff';
    ctx.fillRect(x + bw + 2, H - hE, bw, hE);
  }

  // X軸標籤
  ctx.fillStyle = 'rgba(255,255,255,.6)';
  for (let i = 0; i < n; i += (n > 8 ? 2 : 1)) {
    const x = i * (W / n) + 6;
    ctx.fillText(labels[i].slice(2), x, H + 18);
  }

  ctx.restore();
}

function renderGoals() {
  const wrap = $('#goalList');
  wrap.innerHTML = '';

  state.goals.forEach(g => {
    const ratio = Math.min(1, (g.saved || 0) / (g.target || 1));
    const card = document.createElement('div');
    card.style.marginBottom = '10px';
    card.className = 'card';
    card.innerHTML = `
      <h3 style="margin-bottom:8px">${g.name}</h3>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div class="muted">${fmt(g.saved || 0)} / ${fmt(g.target || 0)}</div>
        <div>${Math.round(ratio * 100)}%</div>
      </div>
      <div class="progress"><div class="bar" style="width:${ratio * 100}%"></div></div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <input type="number" step="0.01" placeholder="存入金額" data-addsave="${g.id}" />
        <button data-save="${g.id}">存入</button>
        <button data-delgoal="${g.id}">刪除目標</button>
      </div>
    `;
    wrap.appendChild(card);
  });
}


// --- 後端 API 連接 (Node.js / Express) ---
function saveTransactionToServer(tx) {
  fetch("http://localhost:3000/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tx),
  })
    .then(res => res.json())
    .then(data => {
      console.log("已儲存到資料庫：", data);
      loadTransactionsFromServer(); // 儲存後重新載入
    })
    .catch(err => console.error("儲存失敗", err));
}

// 掃描 QRCode → 建立交易
function onScanSuccess(decodedText) {
  let tx = {
    date: new Date(),
    type: "expense",
    amount: 0,
    category: "其他",
    note: "",
  };

  try {
    // 如果掃到 JSON 格式
    const data = JSON.parse(decodedText);
    tx.amount = data.expense;
    tx.category = data.category;
    tx.note = data.note || "";
  } catch (e) {
    // 如果是一般文字 (例如發票號碼)
    const match = decodedText.match(/(\d{2,6})/);
    if (match) {
      tx.amount = parseInt(match[1]);
      tx.category = "餐飲";
      tx.note = "掃描發票";
    }
  }

  if (tx.amount > 0) {
    saveTransactionToServer(tx);
  }

  // 停止掃描
  qrScanner.stop().then(() => {
    $("#qr-reader").style.display = "none";
    $("#switch-camera-btn").style.display = "none";
  });
}

// 從後端載入交易
function loadTransactionsFromServer() {
  fetch("http://localhost:3000/api/transactions")
    .then(res => res.json())
    .then(data => {
      console.log("資料庫交易紀錄：", data);
      // TODO: 把資料同步到前端 state 並渲染
    });
}


// --- 使用者操作事件 ---
document.addEventListener('click', (e) => {
  // 刪除交易
  const del = e.target.getAttribute('data-del');
  if (del) {
    state.tx = state.tx.filter(t => t.id !== del);
    save();
    render();
  }

  // 儲蓄目標存入
  const saveG = e.target.getAttribute('data-save');
  if (saveG) {
    const input = document.querySelector(`[data-addsave="${saveG}"]`);
    const v = Number(input.value || 0);
    const g = state.goals.find(x => x.id === saveG);
    if (g && v > 0) {
      g.saved = (g.saved || 0) + v;
      input.value = '';
      save();
      renderGoals();
    }
  }

  // 刪除目標
  const delG = e.target.getAttribute('data-delgoal');
  if (delG) {
    state.goals = state.goals.filter(g => g.id !== delG);
    save();
    renderGoals();
  }
});

// 新增交易
$('#addBtn').addEventListener('click', () => {
  const date = $('#txDate').value || todayStr();
  const type = $('#txType').value;
  const amount = Number($('#txAmount').value);
  const category = $('#txCategory').value || (type === 'income' ? '其他收入' : '其他支出');
  const note = $('#txNote').value || '';

  if (!amount || amount <= 0) return alert('請輸入有效金額');

  state.tx.push({ id: uid(), date, type, amount, category, note });
  $('#txAmount').value = '';
  $('#txNote').value = '';
  save();
  render();
});

// 篩選
$('#q').addEventListener('input', renderTable);
$('#fType').addEventListener('change', renderTable);
$('#fMonth').addEventListener('change', () => { renderTable(); renderBudgets(); });

// 設定預算
$('#setBudget').addEventListener('click', () => {
  const cat = $('#budgetCat').value.trim();
  const amt = Number($('#budgetAmt').value);
  if (!cat || !amt) return alert('請填入分類與金額');
  state.budgets[cat] = amt;
  save();
  renderBudgets();
  $('#budgetCat').value = '';
  $('#budgetAmt').value = '';
});

// 新增目標
$('#addGoal').addEventListener('click', () => {
  const name = $('#goalName').value.trim();
  const target = Number($('#goalTarget').value);
  if (!name || !target) return alert('請填入目標名稱與金額');
  state.goals.push({ id: uid(), name, target, saved: 0 });
  save();
  renderGoals();
  $('#goalName').value = '';
  $('#goalTarget').value = '';
});

// 匯出 JSON
$('#exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'finance-data.json';
  a.click();
});

// 匯入 JSON
$('#importBtn').addEventListener('click', () => $('#fileInput').click());
$('#fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      Object.assign(state, obj);
      save();
      render();
    } catch {
      alert('匯入失敗：檔案不是有效的 JSON');
    }
  };
  reader.readAsText(file);
});


// 重置所有資料
$('#resetBtn').addEventListener('click', () => {
  if (confirm('確定要清空所有資料嗎？')) {
    // 清空狀態
    state.tx = [];
    state.budgets = {};
    state.goals = [];
    // 存入 localStorage
    save();
    // 重新渲染畫面
    render();
    alert('所有資料已清空！');
  }
});


// --- 初始化 ---
// 載入資料並渲染畫面
load();
render();

