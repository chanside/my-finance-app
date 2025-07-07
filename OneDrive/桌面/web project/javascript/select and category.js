/**
 * 刪除指定索引的交易
 * @param {number} index - 交易在 transactions 陣列中的索引
 */
function deleteTransaction(index) {
  const tx = transactions[index];
  if (!tx) return;

  balance -= tx.expense;
  expenseData[tx.category] -= tx.expense;
  transactions.splice(index, 1);

  updateBalance();
  updateChart();
  updateMonthlyTrendChart();
  filterTransactions();
  initDeleteCategorySelect();
}

/**
 * 新增一筆支出交易紀錄
 */
function addTransaction() {
  const expenseInput = document.getElementById("expense");
  const categorySelect = document.getElementById("category");
  const noteInput = document.getElementById("note");
  const transactionTimeInput = document.getElementById("transaction-time");

  const expense = parseFloat(expenseInput.value) || 0;
  const category = categorySelect.value;
  const note = noteInput.value.trim();
  const transactionTime = transactionTimeInput.value ? new Date(transactionTimeInput.value) : new Date();
  
// 呼叫 API 儲存到後端
fetch('http://localhost:3000/api/transaction', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ expense, category, note, timestamp: transactionTime }),
})
.then(res => res.json())
.then(data => {
  console.log('已儲存到後端：', data);
})
.catch(err => {
  console.error('儲存到後端失敗：', err);
});

  if (expense <= 0) {
    alert("請輸入正確的支出金額！");
    return;
  }

  transactions.push({ expense, category, note, timestamp: transactionTime });
  balance += expense;

  if (!(category in expenseData)) expenseData[category] = 0;
  expenseData[category] += expense;

  updateBalance();
  updateChart();
  updateMonthlyTrendChart();
  filterTransactions();

  expenseInput.value = "";
  noteInput.value = "";
  transactionTimeInput.value = "";
  categorySelect.value = category;

  checkManualInput();
  initDeleteCategorySelect();
}

/**
 * 取消上一筆交易
 */
function cancelLastTransaction() {
  if (transactions.length === 0) {
    alert("沒有交易可取消");
    return;
  }

  const lastTx = transactions.pop();
  balance -= lastTx.expense;
  if (expenseData[lastTx.category] !== undefined) {
    expenseData[lastTx.category] -= lastTx.expense;
  }

  updateBalance();
  updateChart();
  updateMonthlyTrendChart();
  filterTransactions();
  initDeleteCategorySelect();
}

/**
 * 根據篩選條件顯示交易列表
 */
function filterTransactions() {
  const selected = document.getElementById("filterCategory").value;
  const tbody = document.querySelector("#transactionTable tbody");
  tbody.innerHTML = "";

  transactions.forEach((tx, index) => {
    if (selected === "all" || tx.category === selected) {
      const tr = document.createElement("tr");
      const timeStr = tx.timestamp instanceof Date
        ? tx.timestamp.toLocaleString()
        : new Date(tx.timestamp).toLocaleString();

      tr.innerHTML = `
        <td>${timeStr}</td>
        <td>${tx.category}</td>
        <td>${tx.expense.toFixed(2)}</td>
        <td>${tx.note}</td>
        <td><button onclick="deleteTransaction(${index})">刪除</button></td>
      `;
      tbody.appendChild(tr);
    }
  });
}
function getTotalMonthlyExpense() {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  return transactions.reduce((total, tx) => {
    const d = new Date(tx.timestamp);
    return d.getFullYear() === thisYear && d.getMonth() === thisMonth
      ? total + tx.expense
      : total;
  }, 0);
}

/**
 * 更新本月總支出顯示
 */
function updateMonthlyTotal() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let total = 0;
  transactions.forEach(tx => {
    const d = new Date(tx.timestamp);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      total += tx.expense;
    }
  });

  document.getElementById("monthlyTotal").textContent = total.toFixed(2);
}

/**
 * 判斷是否顯示手動分類輸入框
 */
function checkManualInput() {
  const categorySelect = document.getElementById("category");
  const manualDiv = document.getElementById("manualCategoryDiv");
  manualDiv.style.display = categorySelect.value === "manual" ? "block" : "none";
}

/**
 * 新增自訂分類
 */
function addManualCategory() {
  const manualInput = document.getElementById("manualCategoryInput");
  const newCategory = manualInput.value.trim();

  if (!newCategory) {
    alert("請輸入分類名稱");
    return;
  }

  const fixedCategories = ["食", "衣", "住", "行", "育", "樂", "manual"];
  if (fixedCategories.includes(newCategory)) {
    alert("此分類名稱與內建分類重複，請換一個名稱");
    return;
  }

  const categorySelect = document.getElementById("category");
  if ([...categorySelect.options].some(opt => opt.value === newCategory)) {
    alert("分類名稱已存在");
    return;
  }

  const option1 = new Option(newCategory, newCategory);
  const option2 = new Option(newCategory, newCategory);
  categorySelect.add(option1, categorySelect.options.length - 1);
  document.getElementById("filterCategory").add(option2);
  categorySelect.value = newCategory;

  manualInput.value = "";
  document.getElementById("manualCategoryDiv").style.display = "none";

  expenseData[newCategory] = 0;
  saveCustomCategory(newCategory);
  initDeleteCategorySelect();
  alert("新增分類成功");
}

/**
 * 儲存自訂分類到 localStorage
 */
function saveCustomCategory(cat) {
  const savedCategories = JSON.parse(localStorage.getItem("customCategories")) || [];
  if (!savedCategories.includes(cat)) {
    savedCategories.push(cat);
    localStorage.setItem("customCategories", JSON.stringify(savedCategories));
  }
}

/**
 * 載入 localStorage 中的自訂分類
 */
function loadCustomCategories() {
  const savedCategories = JSON.parse(localStorage.getItem("customCategories")) || [];
  const categorySelect = document.getElementById("category");
  const filterSelect = document.getElementById("filterCategory");

  savedCategories.forEach(cat => {
    if (![...categorySelect.options].some(o => o.value === cat)) {
      categorySelect.add(new Option(cat, cat), categorySelect.options.length - 1);
      filterSelect.add(new Option(cat, cat));
      expenseData[cat] = 0;
    }
  });
}

/**
 * 初始化刪除分類下拉選單
 */
function initDeleteCategorySelect() {
  const deleteSelect = document.getElementById("deleteCategorySelect");
  deleteSelect.innerHTML = "";

  const fixedCategories = ["食", "衣", "住", "行", "育", "樂"];
  const categorySelect = document.getElementById("category");

  [...categorySelect.options].forEach(option => {
    if (!fixedCategories.includes(option.value) && option.value !== "manual") {
      deleteSelect.add(new Option(option.value, option.value));
    }
  });
}

/**
 * 刪除分類及相關交易
 */
function deleteCategory() {
  const deleteSelect = document.getElementById("deleteCategorySelect");
  const categoryToDelete = deleteSelect.value;

  if (!categoryToDelete) {
    alert("請先選擇要刪除的分類！");
    return;
  }

  if (!confirm(`確定要刪除分類「${categoryToDelete}」及相關交易嗎？`)) return;

  // 從選單中移除
  const categorySelect = document.getElementById("category");
  const filterSelect = document.getElementById("filterCategory");
  [...categorySelect.options].forEach((opt, i) => {
    if (opt.value === categoryToDelete) categorySelect.remove(i);
  });
  [...filterSelect.options].forEach((opt, i) => {
    if (opt.value === categoryToDelete) filterSelect.remove(i);
  });

  // 清除資料與交易
  delete expenseData[categoryToDelete];
  transactions = transactions.filter(tx => tx.category !== categoryToDelete);

  updateBalance();
  updateChart();
  updateMonthlyTotal();
  updateMonthlyTrendChart();
  filterTransactions();

  let savedCategories = JSON.parse(localStorage.getItem("customCategories")) || [];
  savedCategories = savedCategories.filter(cat => cat !== categoryToDelete);
  localStorage.setItem("customCategories", JSON.stringify(savedCategories));

  initDeleteCategorySelect();
  alert(`分類「${categoryToDelete}」已刪除！`);
}

/**
 * 超過一萬元時顯示警告
 */

/**
 * 初始化程式
 */
function init() {
  loadCustomCategories();
  initDeleteCategorySelect();
  updateBalance();
  updateChart();
  updateMonthlyTotal();
  updateMonthlyTrendChart();
  filterTransactions();
  // 載入交易記錄
fetch('http://localhost:3000/api/transactions')
  .then(res => res.json())
  .then(data => {
    transactions = data.map(tx => ({
      ...tx,
      timestamp: new Date(tx.timestamp)
    }));

    updateBalance();
    updateChart();
    updateMonthlyTotal();
    updateMonthlyTrendChart();
    filterTransactions();
  });

// 載入分類
fetch('http://localhost:3000/api/categories')
  .then(res => res.json())
  .then(categories => {
    const categorySelect = document.getElementById("category");
    const filterSelect = document.getElementById("filterCategory");

    categories.forEach(({ name }) => {
      if (![...categorySelect.options].some(o => o.value === name)) {
        categorySelect.add(new Option(name, name), categorySelect.options.length - 1);
        filterSelect.add(new Option(name, name));
        expenseData[name] = 0;
      }
    });

    initDeleteCategorySelect();
  });

  document.getElementById("category").addEventListener("change", checkManualInput);
  document.getElementById("addManualCategoryBtn").addEventListener("click", addManualCategory);
  document.getElementById("addTransactionBtn").addEventListener("click", addTransaction);
  document.getElementById("filterCategory").addEventListener("change", filterTransactions);
  document.getElementById("cancelTransactionBtn").addEventListener("click", cancelLastTransaction);
  document.getElementById("deleteCategoryBtn").addEventListener("click", deleteCategory);
}

// 執行初始化
window.onload = init;
