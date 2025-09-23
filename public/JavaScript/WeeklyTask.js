// 每週任務清單（可以自由擴充）
const tasksPool = [
  "本週至少存 500 元",
  "限制外食不超過 3 次",
  "每天記錄收支一次",
  "週日檢查帳戶餘額",
  "避免衝動消費，至少 3 天不買非必需品",
  "嘗試使用現金支付控制花費",
  "將零錢存入存錢筒",
  "檢查一個月來的固定支出並嘗試削減"
];

function generateTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  // 隨機挑 3 個任務
  const selected = tasksPool.sort(() => 0.5 - Math.random()).slice(0, 3);

  selected.forEach(task => {
    const li = document.createElement("li");
    li.innerHTML = `
      <label>
        <input type="checkbox"> ${task}
      </label>
    `;
    taskList.appendChild(li);
  });
}

// 初始載入
generateTasks();

// 點擊「生成新任務」
document.getElementById("refreshTasks").addEventListener("click", generateTasks);
