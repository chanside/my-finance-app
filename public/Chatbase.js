(function () {
  console.log("🚀 Chatbase 啟動中...");

  // ✅ 1️⃣ Chatbase 設定（一定要在最前）
  window.chatbaseConfig = {
    chatbotId: "zU41hSWsbfHyI-xOQMIKE",
    version: "v1",
    theme: "light",
  };

  // ✅ 2️⃣ 插入 SDK（延遲以確保設定已存在）
  function loadChatbase() {
    const existing = document.getElementById("chatbase-script");
    if (existing) {
      console.log("⚙️ Chatbase SDK 已存在，跳過重新載入");
      return;
    }

    if (!document.body) {
      console.warn("⏳ 等待 document.body 準備完成...");
      return setTimeout(loadChatbase, 300);
    }

    const script = document.createElement("script");
    script.id = "chatbase-script";
    script.src = "https://www.chatbase.co/embed.min.js";
    script.defer = true;

    script.onload = () => {
      console.log("✅ Chatbase SDK 已載入完成");
      // 延遲檢查初始化
      setTimeout(() => {
        if (window.ChatbaseWidget) {
          console.log("✅ Chatbase Widget 已準備就緒，可接收訊息");
        } else {
          console.warn("⚠️ Chatbase Widget 尚未初始化，再次嘗試...");
          loadChatbase(); // 重試
        }
      }, 1500);
    };

    script.onerror = (e) => {
      console.error("❌ Chatbase 載入失敗：", e);
    };

    document.body.appendChild(script);
  }

  // ✅ DOM ready 後載入
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(loadChatbase, 300);
    });
  } else {
    setTimeout(loadChatbase, 300);
  }

  // ✅ 額外監聽 chatbase:ready 事件（若 SDK 支援）
  window.addEventListener("chatbase:ready", function () {
    console.log("🎉 Chatbase Widget 已完全啟動");
  });
})();
