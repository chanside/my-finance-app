document.getElementById("askAI").addEventListener("click", async () => {
  const userInput = document.getElementById("userInput").value;
  if (!userInput) return alert("請輸入財務資料！");

  const responseBox = document.getElementById("aiResponse");
  document.getElementById("result").style.display = "block";
  responseBox.textContent = "⌛ AI 正在分析中...";

  try {
    const res = await fetch("/api/finance-advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userInput })
    });
    const data = await res.json();
    responseBox.textContent = data.reply;
  } catch (err) {
    responseBox.textContent = "⚠️ 發生錯誤，請稍後再試。";
    console.error(err);
  }
});
