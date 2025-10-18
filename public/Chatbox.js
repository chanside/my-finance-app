  const input = document.getElementById("chatbox-input");
  const sendBtn = document.getElementById("chatbox-send");
  const messages = document.getElementById("chatbox-messages");

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage("user", text);
    input.value = "";

    // 呼叫 Chatbase API
    try {
      const res = await fetch("https://www.chatbase.co/api/v1/chat", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 15a8ad9c-b7b8-4a92-827c-b4a661d62895", // ← 這裡換成你的 API Key
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatbotId: "zU41hSWsbfHyI-xOQMIKE",
          message: text,
          stream: false,
        }),
      });

      const data = await res.json();
      addMessage("bot", data.text || "(無回應)");
    } catch (err) {
      addMessage("bot", "⚠️ 連線失敗，請稍後再試");
      console.error(err);
    }
  }

  function addMessage(sender, text) {
    const div = document.createElement("div");
    div.className = `message ${sender}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
