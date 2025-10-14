// ✅ Chatbase 初始化設定
window.chatbaseConfig = {
  chatbotId: "zU41hSWsbfHyI-xOQMIKE", // 你的 Chatbase ID
  version: "v1",
};

// ✅ 再載入 Chatbase SDK
(function() {
  const script = document.createElement("script");
  script.src = "https://www.chatbase.co/embed.min.js";
  script.defer = true;
  script.onload = () => console.log("✅ Chatbase 已載入完成");
  script.onerror = () => console.error("❌ Chatbase 載入失敗");
  document.body.appendChild(script);
})();

// 🔔 偵測 widget 是否準備好
window.addEventListener("chatbase:ready", function () {
  console.log("✅ Chatbase Widget 已準備就緒，可接收訊息");
});
