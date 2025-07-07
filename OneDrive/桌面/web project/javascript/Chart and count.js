// 初始金額與資料結構
let balance = 0; // 總餘額
let expenseData = { "食": 0, "衣": 0, "住": 0, "行": 0, "育": 0, "樂": 0 }; // 各分類支出
let transactions = []; // 所有交易紀錄
let chart; // 圓餅圖
let monthlyChart; // 月支出趨勢圖
const EXPENSE_LIMIT = 5000; // 支出警示門檻

/**
 * 更新餘額 UI 與樣式
 */
function updateBalance() {
  const balanceElement = document.getElementById("balance");
  balanceElement.textContent = balance.toFixed(2);
  balanceElement.className = balance >= 0 ? "balance positive" : "balance negative";
}

/**
 * 顯示餘額過低警示
 */
function toggleWarning(latestExpenseAmount = 0) {
  const warningText = document.getElementById("warningText");
  const warningImage = document.getElementById("warningImage");

  if (balance < 0) {
    warningText.textContent = "⚠️ 餘額不足！";
    warningText.style.display = "block";
    warningImage.style.display = "block";
  } else if (latestExpenseAmount >= 5000) {
    warningText.textContent = "⚠️ 單筆支出超過 5000 元！";
    warningText.style.display = "block";
    warningImage.style.display = "block";
  } else if (getTotalMonthlyExpense() > 10000) {
    warningText.textContent = "⚠️ 本月支出已超過 10000 元！";
    warningText.style.display = "block";
    warningImage.style.display = "block";
  } else {
    warningText.style.display = "none";
    warningImage.style.display = "none";
  }
}


/**
 * 更新支出圓餅圖
 */
function updateChart() {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  if (chart) chart.destroy();

  const labels = [];
  const data = [];

  for (const [cat, val] of Object.entries(expenseData)) {
    if (val > 0) {
      labels.push(cat);
      data.push(val);
    }
  }

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#A0A0A0', '#FFA07A', '#20B2AA'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        }
      }
    }
  });
}

/**
 * 更新月支出趨勢圖（過去 12 個月）
 */
function updateMonthlyTrendChart() {
  const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
  if (monthlyChart) monthlyChart.destroy();

  const monthlyTotals = {};
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    monthlyTotals[key] = 0;
  }

  transactions.forEach(tx => {
    const d = new Date(tx.timestamp);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    if (monthlyTotals.hasOwnProperty(key)) {
      monthlyTotals[key] += tx.expense;
    }
  });

  const labels = Object.keys(monthlyTotals).reverse();
  const data = Object.values(monthlyTotals).reverse();

  monthlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '每月支出',
        data: data,
        backgroundColor: '#36A2EB'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}


function saveTransactionToServer(transaction) {
  fetch('http://localhost:3000/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(transaction)
  })
  .then(response => response.json())
  .then(data => {
    console.log('伺服器回傳：', data);
  })
  .catch(error => {
    console.error('錯誤：', error);
  });
}

/**
 * 初始化：載入分類、更新 UI、綁定事件
 */
window.onload = function () {
  loadCustomCategories();
  updateBalance();
  updateChart();
  updateMonthlyTrendChart();
  filterTransactions();
  initDeleteCategorySelect();

  document.getElementById("filterCategory").addEventListener("change", filterTransactions);
  document.getElementById("category").addEventListener("change", checkManualInput);
};
function addTransaction(amount, category) {
  const expense = Math.abs(amount);
  const timestamp = new Date().toISOString();
  saveTransactionToServer({ expense, category, timestamp });

  balance -= expense;
  transactions.push({ expense, category, timestamp });

  expenseData[category] = (expenseData[category] || 0) + expense;

  updateBalance();
  updateChart();
  updateMonthlyTrendChart();
  toggleWarning(expense); // ✅ 檢查是否超額
}
