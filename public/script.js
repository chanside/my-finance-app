// ---------------- DOM 參考 ----------------
const txTbody = document.getElementById('txTbody');
const txType = document.getElementById('txType');
const txAmount = document.getElementById('txAmount');
const txCategory = document.getElementById('txCategory');
const txDate = document.getElementById('txDate');
const txNote = document.getElementById('txNote');
const addBtn = document.getElementById('addBtn');
const resetBtn = document.getElementById('resetBtn');
const searchKey = document.getElementById('searchKey');

const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const savingRateEl = document.getElementById('savingRate');

const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');

const budgetCat = document.getElementById('budgetCat');
const budgetAmt = document.getElementById('budgetAmt');
const setBudget = document.getElementById('setBudget');
const budgetList = document.getElementById('budgetList');

const goalName = document.getElementById('goalName');
const goalTarget = document.getElementById('goalTarget');
const addGoal = document.getElementById('addGoal');
const goalList = document.getElementById('goalList');

// ---------------- 資料初始化 ----------------
let transactions = JSON.parse(localStorage.getItem('finance-data')) || [];
let budgets = JSON.parse(localStorage.getItem('finance-budget')) || {};
let goals = JSON.parse(localStorage.getItem('finance-goal')) || [];

// ---------------- Chart.js 初始化 ----------------
const ctx = document.getElementById('chartCanvas').getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: { 
    labels: [], 
    datasets:[
      {label:'收入', data:[], borderColor:'#28a745', backgroundColor:'rgba(40,167,69,0.2)', tension:0.3, fill:true},
      {label:'支出', data:[], borderColor:'#dc3545', backgroundColor:'rgba(220,53,69,0.2)', tension:0.3, fill:true}
    ]
  },
  options:{
    responsive:true,
    plugins:{legend:{position:'top'}},
    scales:{y:{beginAtZero:true}}
  }
});

// ---------------- LocalStorage 儲存函式 ----------------
function saveData(){ localStorage.setItem('finance-data', JSON.stringify(transactions)); }
function saveBudget(){ localStorage.setItem('finance-budget', JSON.stringify(budgets)); }
function saveGoal(){ localStorage.setItem('finance-goal', JSON.stringify(goals)); }

// ---------------- 交易表格渲染 ----------------
function renderTable(){
  const key = searchKey.value.trim();
  txTbody.innerHTML = '';

  transactions.forEach((tx,index)=>{
    // 關鍵字搜尋（分類或備註）
    if(key && !tx.category.includes(key) && !tx.note?.includes(key)) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${tx.date}</td>
      <td>${tx.type}</td>
      <td>${tx.category}</td>
      <td>${tx.note||''}</td>
      <td>${tx.amount}</td>
      <td><button onclick="deleteTx(${index})">刪除</button></td>
    `;
    txTbody.appendChild(tr);
  });
}

// ---------------- 更新摘要 ----------------
function updateSummary() {
  const incomeTx = transactions.filter(tx => tx.type === '收入');
  const expenseTx = transactions.filter(tx => tx.type === '支出');

  const income = incomeTx.reduce((a, b) => a + b.amount, 0);
  const expense = expenseTx.reduce((a, b) => a + b.amount, 0);
  const balance = income - expense;

  balanceEl.textContent = `$${balance}`;
  incomeEl.textContent = `$${income}`;
  expenseEl.textContent = `$${expense}`;

  // 更新筆數
  document.getElementById('incomeCount').textContent = `${incomeTx.length} 筆`;
  document.getElementById('expenseCount').textContent = `${expenseTx.length} 筆`;

  // 儲蓄率負數直接顯示0
  let savingRate = income > 0 ? Math.round((balance / income) * 100) : 0;
  if (savingRate < 0) savingRate = 0;
  savingRateEl.textContent = `${savingRate}%`;

  updateChart();
}

// ---------------- 新增交易 ----------------
function addTransaction(){
  const type = txType.value;
  const amount = parseFloat(txAmount.value);
  const category = txCategory.value || '未分類';
  const date = txDate.value || new Date().toISOString().slice(0,10);
  const note = txNote.value || '';

  if(!amount || amount <= 0) return;

  transactions.push({type, amount, category, date, note});
  saveData(); renderTable(); updateSummary();

  // 清空輸入欄位
  txAmount.value = '';
  txCategory.value = '';
  txDate.value = '';
  txNote.value = '';
}

// ---------------- 刪除交易 ----------------
function deleteTx(index){
  transactions.splice(index,1); 
  saveData(); renderTable(); updateSummary();
}

// ---------------- 重置交易 ----------------
function resetData(){
  if(confirm("確定要清空所有交易資料嗎？")){
    transactions=[]; 
    saveData(); renderTable(); updateSummary();
  }
}

// 關鍵字搜尋即時觸發
searchKey.addEventListener('input', renderTable);

// ---------------- 更新 Chart ----------------
function updateChart(){
  const now = new Date();
  const labels = [];
  const incomeData = [];
  const expenseData = [];

  for(let i=11;i>=0;i--){
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    labels.push(monthStr);

    const incSum = transactions.filter(tx=>tx.type==='收入' && tx.date.startsWith(monthStr)).reduce((a,b)=>a+b.amount,0);
    const expSum = transactions.filter(tx=>tx.type==='支出' && tx.date.startsWith(monthStr)).reduce((a,b)=>a+b.amount,0);

    incomeData.push(incSum);
    expenseData.push(expSum);
  }

  chart.data.labels = labels;
  chart.data.datasets[0].data = incomeData;
  chart.data.datasets[1].data = expenseData;
  chart.update();
}

// ---------------- 匯出 / 匯入資料 ----------------
exportBtn.addEventListener('click',()=>{
  const dataStr="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(transactions));
  const a=document.createElement('a'); a.href=dataStr; a.download='finance-data.json'; a.click();
});

importBtn.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',(e)=>{
  const file=e.target.files[0];
  if(!file) return;

  const reader=new FileReader();
  reader.onload=(ev)=>{
    try{
      const imported = JSON.parse(ev.target.result);
      if(Array.isArray(imported)) transactions=imported; 
      saveData(); renderTable(); updateSummary();
    }catch(err){ alert("匯入資料格式錯誤"); }
  };
  reader.readAsText(file);
});

// ---------------- 預算功能 ----------------
setBudget.addEventListener('click',()=>{
  const cat = budgetCat.value.trim();
  const amt = parseFloat(budgetAmt.value);
  if(!cat || !amt) return alert("請輸入分類與金額");
  budgets[cat] = amt; 
  saveBudget(); renderBudget();
});

function renderBudget(){
  budgetList.innerHTML='';
  for(const cat in budgets){
    const div = document.createElement('div');
    div.textContent = `${cat}：$${budgets[cat]}`;
    budgetList.appendChild(div);
  }
}

// ---------------- 儲蓄目標功能 ----------------
addGoal.addEventListener('click',()=>{
  const name = goalName.value.trim();
  const target = parseFloat(goalTarget.value);
  if(!name || !target) return alert("請輸入名稱與目標金額");

  goals.push({name, target});
  saveGoal(); renderGoal();

  goalName.value = '';
  goalTarget.value = '';
});

function renderGoal(){
  goalList.innerHTML='';
  const balance = parseFloat(balanceEl.textContent.replace('$','')) || 0;
  goals.forEach((g,i)=>{
    const div = document.createElement('div');
    const progress = Math.min(100, Math.round(balance/g.target*100));
    div.innerHTML = `${g.name}：$${g.target} 進度 ${progress}% <button onclick="deleteGoal(${i})">刪除</button>`;
    goalList.appendChild(div);
  });
}

function deleteGoal(index){ 
  goals.splice(index,1); 
  saveGoal(); renderGoal(); 
}

// ---------------- 綁定新增交易 / 重置 ----------------
addBtn.addEventListener('click', addTransaction);
resetBtn.addEventListener('click', resetData);

// ---------------- 初始渲染 ----------------
renderTable(); 
updateSummary(); 
renderBudget(); 
renderGoal();
