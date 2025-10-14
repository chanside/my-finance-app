(function () {
  // ✅ 1️⃣ Chatbase 設定（一定要在最前）
  window.chatbaseConfig = {
    chatbotId: "zU41hSWsbfHyI-xOQMIKE",
    version: "v1",
    theme: "light", // 🔥 防止 undefined
  };

  // ✅ 2️⃣ 確保 DOM 載入後才插入 SDK
  function loadChatbase() {
    if (document.getElementById("chatbase-script")) {
      console.log("⚙️ Chatbase SDK 已存在，跳過重新載入");
      return;
    }

    // ⏰ 等待 body 存在
    if (!document.body) {
      console.warn("⏳ Chatbase 等待 document.body 準備完成...");
      return setTimeout(loadChatbase, 300);
    }

    const script = document.createElement("script");
    script.id = "chatbase-script";
    script.src = "https://www.chatbase.co/embed.min.js";
    script.defer = true;
    script.onload = () => console.log("✅ Chatbase 已載入完成");
    script.onerror = (e) => console.error("❌ Chatbase 載入失敗：", e);
    document.body.appendChild(script);
  }

  // ✅ DOM ready 後載入
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadChatbase);
  } else {
    loadChatbase();
  }

  // ✅ 監聽初始化事件
  window.addEventListener("chatbase:ready", function () {
    console.log("✅ Chatbase Widget 已準備就緒，可接收訊息");
  });

  // ✅ 若 3 秒內未啟動，自動重試一次
  setTimeout(() => {
    if (!window.ChatbaseWidget) {
      console.warn("⚠️ Chatbase Widget 尚未初始化，嘗試重新載入...");
      loadChatbase();
    }
  }, 3000);
})();
