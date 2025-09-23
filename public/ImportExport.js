// ===== 匯出資料 =====
document.getElementById('exportBtn').addEventListener('click', () => {
  const data = {
    transactions,
    budgets,
    goals
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'finance_data.json';
  a.click();

  URL.revokeObjectURL(url);
});

// ===== 匯入資料 =====
document.getElementById('importBtn').addEventListener('click', () => {
  const fileInput = document.getElementById('fileInput');
  fileInput.click(); // 觸發檔案選擇
});

document.getElementById('fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);

      if (!data.transactions || !data.budgets || !data.goals) {
        throw new Error("資料格式錯誤");
      }

      transactions = data.transactions;
      budgets = data.budgets;
      goals = data.goals;

      // 更新畫面
      renderTable();
      updateSummary();
      renderBudget();
      renderGoal();

      alert("資料匯入成功！");
    } catch (err) {
      alert("匯入資料失敗：" + err.message);
      console.error(err);
    }
  };
  reader.readAsText(file);
});
