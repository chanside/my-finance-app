/**
 * WeeklyTask.js — 整理與註解版
 *
 * 功能：
 * - 從 tasksPool 隨機抽出 QUESTIONS_PER_ROUND 道任務並顯示
 * - 使用 Fisher–Yates shuffle（較穩定的洗牌演算法）
 * - 為每個 checkbox 產生可存取的 label (for/id)
 * - 支援選擇性啟用 localStorage，以便在重新整理後保留勾選狀態
 */

/* ---------- 可自訂參數 ---------- */
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

const QUESTIONS_PER_ROUND = 3;        // 每次顯示幾個任務
const USE_LOCALSTORAGE = false;       // 想要啟用勾選狀態儲存就改成 true
const STORAGE_KEY = "weeklyTasksState";

/* ---------- DOM 參考 ---------- */
const taskListEl = document.getElementById("taskList");
const refreshBtn = document.getElementById("refreshTasks");

/* ---------- 工具函式 ---------- */

/**
 * Fisher–Yates 洗牌（不會改變原陣列）
 * @param {Array} arr
 * @returns {Array} 洗牌後的新陣列
 */
function shuffle(arr) {
  const a = arr.slice(); // copy
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 產生安全的 element id（移除特殊字元）
 * @param {string} text
 * @param {number} idx
 * @returns {string}
 */
function generateId(text, idx) {
  const slug = text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
  return `task-${idx}-${slug}-${Date.now().toString().slice(-4)}`;
}

/* ---------- localStorage（選用） ---------- */
function loadSavedState() {
  if (!USE_LOCALSTORAGE) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("讀取 localStorage 失敗：", e);
    return {};
  }
}
function saveState(state) {
  if (!USE_LOCALSTORAGE) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("寫入 localStorage 失敗：", e);
  }
}

/* ---------- 渲染任務列表 ---------- */
function generateTasks() {
  // 清空列表
  taskListEl.innerHTML = "";

  // 取得已儲存的勾選狀態（若未啟用則為空物件）
  const saved = loadSavedState();

  // 從 pool 洗牌並取前 N 個
  const selected = shuffle(tasksPool).slice(0, QUESTIONS_PER_ROUND);

  selected.forEach((task, i) => {
    const id = generateId(task, i);
    const li = document.createElement("li");

    // 建議的 HTML 結構：<label for="id"><input id="id" /><span class="task-text">...</span></label>
    li.innerHTML = `
      <label for="${id}">
        <input type="checkbox" id="${id}" data-task="${task}">
        <span class="task-text">${task}</span>
      </label>
    `;

    // 若 localStorage 有紀錄該任務被勾選，則恢復勾選狀態
    if (USE_LOCALSTORAGE && saved[task]) {
      const cb = li.querySelector("input[type='checkbox']");
      if (cb) cb.checked = true;
    }

    taskListEl.appendChild(li);
  });
}

/* ---------- 事件處理 ---------- */

// 監聽清單內 checkbox 的變動（事件委派）
taskListEl.addEventListener("change", (evt) => {
  const target = evt.target;
  if (!target || target.tagName !== "INPUT" || target.type !== "checkbox") return;

  const task = target.getAttribute("data-task");
  if (!task) return;

  if (USE_LOCALSTORAGE) {
    // 讀出現存狀態、更新、並儲存回 localStorage
    const state = loadSavedState();
    state[task] = !!target.checked;
    saveState(state);
  }
});

// 重新生成任務按鈕
refreshBtn.addEventListener("click", () => {
  generateTasks();
});

/* ---------- 初始化 ---------- */
generateTasks();
