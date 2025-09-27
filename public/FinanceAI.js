const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let chatHistory = []; // 用來存放對話歷史

// 畫面顯示訊息
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 呼叫後端 API，傳給 OpenAI
async function askAI(question) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question, history: chatHistory })
    });

    const data = await res.json();
    if (data.reply) {
      chatHistory.push({ role: "assistant", content: data.reply });
      return data.reply;
    } else {
      return "⚠️ AI 無法回應，請稍後再試。";
    }
  } catch (err) {
    console.error(err);
    return "❌ 伺服器錯誤，請檢查 API。";
  }
}

// 送出訊息
sendBtn.addEventListener("click", async () => {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage("user", text);
  chatHistory.push({ role: "user", content: text });
  userInput.value = "";

  const aiReply = await askAI(text);
  addMessage("ai", aiReply);
});

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});
