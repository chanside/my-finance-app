/********************************************
 * Finance Helper 修正版
 ********************************************/

const STORE_KEY = 'finance-helper-v1';
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const state = {
  tx: [],
  budgets: {},
  goals: []
};

// 格式化金額
const fmt = n => isNaN(n) ? '$0' :
  new Intl.NumberFormat('zh-Hant-TW', { style:'currency', currency:'TWD', maximumFractionDigits:0 }).format(n);

const monthKey = d => d.slice(0,7);
const todayStr = () => new Date().toISOString().slice(0,10);
const uid = () => Math.random().toString(36).slice(2,9);

// 儲存與載入
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function load() {
  const data = localStorage.getItem(STORE_KEY);
  if (data) Object.assign(state, JSON.parse(data));
}

// Reset 功能
$('#resetBtn').addEventListener('click', () => {
  if (confirm("確定要清空所有資料嗎？此操作無法復原！")) {
    state.tx = [];
    state.budgets = {};
    state.goals = [];
    save();
    render();
    alert("所有資料已清空！");
  }
});

// -----------------
// 渲染函式
// -----------------
function render() {
  renderSummary();
  renderTable();
  renderBudgets();
  renderChart();
  renderGoals();
  $('#txDate').value ||= todayStr();
}

function getMonthData(ym) {
  const list = state.tx.filter(t => monthKey(t.date) === ym);
  return {
    income: list.filter(t=>t.type==='income').reduce((a,b)=>a+b.amount,0),
    expense: list.filter(t=>t.type==='expense').reduce((a,b)=>a+b.amount,0),
    countI: list.filter(t=>t.type==='income').length,
    countE: list.filter(t=>t.type==='expense').length
  };
}

function renderSummary() {
  const ym = todayStr().slice(0,7);
  const m = getMonthData(ym);
  $('#income').textContent = fmt(m.income);
  $('#incomeCount').textContent = m.countI + ' 筆';
  $('#expense').textContent = fmt(m.expense);
  $('#expenseCount').textContent = m.countE + ' 筆';
  const bal = m.income - m.expense;
  $('#balance').textContent = fmt(bal);
  $('#balanceNote').textContent = `${ym} 的結餘`;
  const rate = m.income ? Math.round((bal/m.income)*100) : 0;
  $('#savingRate').textContent = (rate<0?0:rate) + '%';
}

function renderTable() {
  const q = $('#q').value?.trim().toLowerCase() || '';
  const fTypeVal = $('#fType').value;
  const ym = $('#fMonth').value;

  const list = state.tx
    .filter(t => !ym || monthKey(t.date) === ym)
    .filter(t => fTypeVal==='all' || t.type===fTypeVal)
    .filter(t => !q || (t.category+t.note).toLowerCase().includes(q))
    .sort((a,b)=>a.date<b.date?1:-1);

  const tbody = $('#txTbody'); tbody.innerHTML = '';
  list.forEach(t=>{
    const tr = document.createElement('tr');
    tr.className='row';
    tr.innerHTML = `
      <td>${t.date}</td>
      <td><span class="pill ${t.type==='income'?'good':'bad'}">${t.type==='income'?'收入':'支出'}</span></td>
      <td>${t.category||'-'}</td>
      <td>${t.note||''}</td>
      <td style="font-weight:700;text-align:right">${fmt(t.amount)}</td>
      <td style="text-align:right"><button data-del="${t.id}">刪除</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderBudgets() {
  const wrap = $('#budgetList'); wrap.innerHTML='';
  const nowYM = todayStr().slice(0,7);
  const spentByCat = {};
  state.tx.filter(t=>t.type==='expense' && monthKey(t.date)===nowYM)
    .forEach(t=>spentByCat[t.category]=(spentByCat[t.category]||0)+t.amount);

  Object.keys(state.budgets).sort().forEach(cat=>{
    const limit = state.budgets[cat];
    const used = spentByCat[cat]||0;
    const ratio = Math.min(1, used/limit||0);
    const left = Math.max(0, limit-used);
    const card = document.createElement('div');
    card.style.marginBottom='10px';
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div><strong>${cat}</strong> · <span class="muted">${fmt(used)} / ${fmt(limit)}</span></div>
        <div class="muted">剩餘 ${fmt(left)}</div>
      </div>
      <div class="progress"><div class="bar" style="width:${ratio*100}%"></div></div>
    `;
    wrap.appendChild(card);
  });
}

function renderGoals() {
  const wrap = $('#goalList'); wrap.innerHTML='';
  state.goals.forEach(g=>{
    const ratio = Math.min(1, (g.saved||0)/(g.target||1));
    const card = document.createElement('div');
    card.style.marginBottom='10px'; card.className='card';
    card.innerHTML=`
      <h3 style="margin-bottom:8px">${g.name}</h3>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div class="muted">${fmt(g.saved||0)} / ${fmt(g.target||0)}</div>
        <div>${Math.round(ratio*100)}%</div>
      </div>
      <div class="progress"><div class="bar" style="width:${ratio*100}%"></div></div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <input type="number" step="0.01" placeholder="存入金額" data-addsave="${g.id}" />
        <button data-save="${g.id}">存入</button>
        <button data-delgoal="${g.id}">刪除目標</button>
      </div>
    `;
    wrap.appendChild(card);
  });
}

function renderChart() {
  const cvs = $('#chart');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  const now = new Date();
  const labels=[],dataI=[],dataE=[];
  for(let i=11;i>=0;i--){
    const d = new Date(now.getFullYear(), now.getMonth()-i,1);
    const ym=d.toISOString().slice(0,7); labels.push(ym);
    const m=getMonthData(ym);
    dataI.push(m.income); dataE.push(m.expense);
  }
  ctx.clearRect(0,0,cvs.width,cvs.height);
  const padL=40,padB=24,padT=10,padR=10,W=cvs.width-padL-padR,H=cvs.height-padT-padB;
  ctx.save(); ctx.translate(padL,padT);
  const max = Math.max(...dataI,...dataE,1); const yStep=Math.ceil(max/5);
  ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.fillStyle='rgba(255,255,255,.6)'; ctx.font='12px system-ui';
  for(let i=0;i<=5;i++){ const y=H-(H*(i/5)); ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();ctx.fillText((yStep*i/1000).toFixed(0)+'k',-34,y+4);}
  const n=labels.length,bw=W/(n*2);
  for(let i=0;i<n;i++){
    const x=i*(W/n)+6,hI=H*(dataI[i]/max),hE=H*(dataE[i]/max);
    ctx.fillStyle='#8fd3ff';ctx.fillRect(x,H-hI,bw,hI);
    ctx.fillStyle='#6aa2ff';ctx.fillRect(x+bw+2,H-hE,bw,hE);
  }
  ctx.fillStyle='rgba(255,255,255,.6)';
  for(let i=0;i<n;i+=n>8?2:1){ const x=i*(W/n)+6; ctx.fillText(labels[i].slice(2),x,H+18);}
  ctx.restore();
}

// -----------------
// 事件綁定
// -----------------
document.addEventListener('click', e=>{
  const del = e.target.getAttribute('data-del');
  if(del){ state.tx=state.tx.filter(t=>t.id!==del); save(); renderTable(); renderSummary(); }

  const saveG=e.target.getAttribute('data-save');
  if(saveG){
    const input=$(`[data-addsave="${saveG}"]`); const v=Number(input.value||0);
    const g=state.goals.find(x=>x.id===saveG);
    if(g && v>0){ g.saved=(g.saved||0)+v; input.value=''; save(); renderGoals();}
  }

  const delG=e.target.getAttribute('data-delgoal');
  if(delG){ state.goals=state.goals.filter(g=>g.id!==delG); save(); renderGoals();}
});

// 新增交易
$('#addBtn').addEventListener('click',()=>{
  const date=$('#txDate').value||todayStr();
  const type=$('#txType').value;
  const amount=Number($('#txAmount').value);
  const category=$('#txCategory').value||(type==='income'?'其他收入':'其他支出');
  const note=$('#txNote').value||'';
  if(!amount||amount<=0) return alert('請輸入有效金額');
  state.tx.push({id:uid(),date,type,amount,category,note});
  $('#txAmount').value=''; $('#txNote').value='';
  save(); render();
});

async function loadTransactions() {
    const res = await fetch("https://my-backend.onrender.com/api/transactions");
    const data = await res.json();
    console.log(data);
  }

  loadTransactions();
// 篩選
$('#q').addEventListener('input',renderTable);
$('#fType').addEventListener('change',renderTable);
$('#fMonth').addEventListener('change',()=>{renderTable(); renderBudgets();});

// 設定預算
$('#setBudget').addEventListener('click',()=>{
  const cat=$('#budgetCat').value.trim(); const amt=Number($('#budgetAmt').value);
  if(!cat||!amt) return alert('請填入分類與金額');
  state.budgets[cat]=amt; save(); renderBudgets();
  $('#budgetCat').value=''; $('#budgetAmt').value='';
});

// 新增目標
$('#addGoal').addEventListener('click',()=>{
  const name=$('#goalName').value.trim(); const target=Number($('#goalTarget').value);
  if(!name||!target) return alert('請填入目標名稱與金額');
  state.goals.push({id:uid(),name,target,saved:0}); save(); renderGoals();
  $('#goalName').value=''; $('#goalTarget').value='';
});

// 匯出 JSON
$('#exportBtn').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='finance-data.json'; a.click();
});

// 匯入 JSON
$('#importBtn').addEventListener('click',()=>$('#fileInput').click());
$('#fileInput').addEventListener('change',(e)=>{
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{ try{ Object.assign(state,JSON.parse(reader.result)); save(); render(); } catch { alert('匯入失敗：檔案不是有效的 JSON'); } };
  reader.readAsText(file);
});

// -----------------
// 初始化
// -----------------
load(); render();
