/* ================== 題庫設定 ================== */
const quizData = [
  {
    question: "建立緊急備用金的主要目的為何？",
    options: ["應付突發事件", "用來投資股票", "購買奢侈品", "支付娛樂費用"],
    answer: 0 // 正確答案的索引值
  },
  {
    question: "一般建議緊急備用金應該準備幾個月的生活費？",
    options: ["1-2 個月", "3-6 個月", "12 個月以上", "不需要準備"],
    answer: 1
  },
  {
    question: "下列哪一項被歸類為「負債」？",
    options: ["房貸", "股票", "儲蓄存款", "基金"],
    answer: 0
  },
  {
    question: "收入 - 支出 = ？",
    options: ["資產", "現金流", "存款", "負債"],
    answer: 1
  },
  {
    question: "投資組合中，風險最高的是哪一項？",
    options: ["國債", "定存", "股票", "活期存款"],
    answer: 2
  },
  {
    question: "資產配置的主要目的為何？",
    options: ["降低風險", "增加娛樂", "提升花費", "避免儲蓄"],
    answer: 0
  },
  {
    question: "哪一種支出屬於固定支出？",
    options: ["房租", "餐飲", "娛樂", "購物"],
    answer: 0
  }
];

/* ================== DOM 取得 ================== */
const quizContainer = document.getElementById("quiz");
const resultContainer = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");

/* ================== 遊戲參數 ================== */
const QUESTIONS_PER_ROUND = 3; // 每次隨機抽出的題目數
let currentQuestions = [];     // 暫存當回合的題目

/* ================== 工具函式 ================== */
// 隨機打亂陣列 (洗牌演算法簡化版)
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// 隨機抽出指定數量的題目
function getRandomQuestions() {
  return shuffle([...quizData]).slice(0, QUESTIONS_PER_ROUND);
}

/* ================== 載入題目 ================== */
function loadQuiz() {
  // 重新抽題
  currentQuestions = getRandomQuestions();

  // 將題目與選項動態插入頁面
  quizContainer.innerHTML = currentQuestions.map((q, index) => {
    return `
      <div class="question">
        <h3>${q.question}</h3>
        ${shuffle(q.options.map((opt, i) => `
          <label>
            <input type="radio" name="q${index}" value="${i}">
            ${opt}
          </label>
        `)).join("")}
      </div>
    `;
  }).join("");

  // 清空上次的答題結果
  resultContainer.innerHTML = "";
}

/* ================== 檢查答案 ================== */
function checkAnswers() {
  let score = 0;

  currentQuestions.forEach((q, index) => {
    // 找出該題被選中的答案
    const selected = document.querySelector(`input[name="q${index}"]:checked`);

    // 若有作答，檢查是否正確
    if (selected && parseInt(selected.value) === q.answer) {
      score++;
    }
  });

  // 顯示分數
  resultContainer.innerHTML = `✅ 你答對了 ${score} / ${currentQuestions.length} 題`;

  // 2 秒後自動重新抽題 (增加遊戲感)
  setTimeout(loadQuiz, 2000);
}

/* ================== 事件監聽 ================== */
submitBtn.addEventListener("click", checkAnswers);

/* ================== 初始化 ================== */
loadQuiz();
