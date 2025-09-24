const quizData = [
  {
    question: "建立緊急備用金的主要目的為何？",
    options: ["應付突發事件", "用來投資股票", "購買奢侈品", "支付娛樂費用"],
    answer: 0
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

const quizContainer = document.getElementById("quiz");
const resultContainer = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");

// 每次抽幾題
const QUESTIONS_PER_ROUND = 3;
let currentQuestions = [];

// 隨機打亂陣列
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// 抽題目
function getRandomQuestions() {
  return shuffle([...quizData]).slice(0, QUESTIONS_PER_ROUND);
}

// 載入題目
function loadQuiz() {
  currentQuestions = getRandomQuestions();
  quizContainer.innerHTML = currentQuestions.map((q, index) => {
    return `
      <div class="question">
        <h3>${q.question}</h3>
        ${shuffle(q.options.map((opt, i) => `
          <label>
            <input type="radio" name="q${index}" value="${i}"> ${opt}
          </label>
        `)).join("")}
      </div>
    `;
  }).join("");
  resultContainer.innerHTML = ""; // 清空上次結果
}

// 檢查答案
function checkAnswers() {
  let score = 0;
  currentQuestions.forEach((q, index) => {
    const selected = document.querySelector(`input[name="q${index}"]:checked`);
    if (selected && q.options[parseInt(selected.value)] === q.options[q.answer]) {
      score++;
    }
  });

  resultContainer.innerHTML = `✅ 你答對了 ${score} / ${currentQuestions.length} 題`;

  // 2 秒後自動換題
  setTimeout(loadQuiz, 2000);
}

submitBtn.addEventListener("click", checkAnswers);

// 初始化
loadQuiz();
