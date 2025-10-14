(function() {
  // ✅ 確保 config 先定義
  window.chatbaseConfig = {
    chatbotId: "zU41hSWsbfHyI-xOQMIKE",
    version: "v1",
  };

  // ✅ 強制等待 DOM 完成再插入 SDK
  window.addEventListener("DOMContentLoaded", function() {
    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.defer = true;
    script.onload = () => console.log("✅ Chatbase 已載入完成");
    script.onerror = () => console.error("❌ Chatbase 載入失敗");
    document.body.appendChild(script);
  });
})();

window.addEventListener("chatbase:ready", function () {
  console.log("✅ Chatbase Widget 已準備就緒，可接收訊息");
});


setTimeout(() => {
  if (!window.ChatbaseWidget) {
    console.warn("⚠️ Chatbase Widget 尚未初始化，嘗試重新載入...");
    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.defer = true;
    document.body.appendChild(script);
  }
}, 2000);
